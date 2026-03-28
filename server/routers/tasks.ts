/**
 * Tasks router — CRUD, completion with XP/streak/achievement logic,
 * step toggling, and LLM-powered task expansion.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import {
  createTask,
  deleteTask,
  getAllTasksForUser,
  getTasksByRole,
  getUserById,
  unlockAchievement,
  updateTask,
  updateUserProfile,
} from "../db";
import { buildNextTaskInstance } from "../recurrence";
import { ACHIEVEMENT_CATALOGUE, computeLevel } from "../shared/gamification";

export const tasksRouter = router({
  /** Lists tasks for the authenticated user, optionally filtered by role context. */
  list: protectedProcedure
    .input(z.object({ roleContext: z.enum(["student", "parent", "professional"]).optional() }))
    .query(async ({ ctx, input }) => {
      if (input.roleContext) {
        return getTasksByRole(ctx.user.id, input.roleContext);
      }
      return getAllTasksForUser(ctx.user.id);
    }),

  /** Creates a new task for the authenticated user. */
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(500),
      notes: z.string().max(2000).optional(),
      roleContext: z.enum(["student", "parent", "professional", "all"]).default("all"),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      energyRequired: z.enum(["low", "medium", "high"]).default("medium"),
      dueDate: z.string().optional(),
      dueTime: z.string().optional(),
      steps: z.array(z.object({ id: z.string(), text: z.string(), done: z.boolean() })).optional(),
      recurrenceType: z.enum(["daily", "weekly", "monthly", "days_of_week", "after_completion"]).optional(),
      recurrenceDays: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const task = await createTask({
        userId: ctx.user.id,
        title: input.title,
        notes: input.notes,
        roleContext: input.roleContext,
        priority: input.priority,
        energyRequired: input.energyRequired,
        dueDate: input.dueDate,
        dueTime: input.dueTime,
        steps: input.steps ?? [],
        xpReward: input.priority === "high" ? 20 : input.priority === "medium" ? 10 : 5,
        recurrenceType: input.recurrenceType,
        recurrenceDays: input.recurrenceDays,
      });
      return task;
    }),

  /** Partially updates a task owned by the authenticated user. */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(500).optional(),
      notes: z.string().max(2500).optional(),
      roleContext: z.enum(["student", "parent", "professional", "all"]).optional(),
      status: z.enum(["todo", "in_progress", "done", "archived"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      energyRequired: z.enum(["low", "medium", "high"]).optional(),
      dueDate: z.string().optional(),
      dueTime: z.string().optional(),
      steps: z.array(z.object({ id: z.string(), text: z.string(), done: z.boolean() })).optional(),
      recurrenceType: z.enum(["daily", "weekly", "monthly", "days_of_week", "after_completion"]).optional(),
      recurrenceDays: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const completedAt = data.status === "done" ? new Date() : undefined;
      await updateTask(id, ctx.user.id, { ...data, ...(completedAt ? { completedAt } : {}) });
      return { success: true };
    }),

  /**
   * Marks a task as done, awards XP, updates streak, and checks for new
   * achievements.  Also spawns the next recurrence instance when applicable.
   */
  complete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await updateTask(input.id, ctx.user.id, { status: "done", completedAt: new Date() });
      const allTasks = await getAllTasksForUser(ctx.user.id);
      const task = allTasks.find(t => t.id === input.id);
      const xpGain = task?.xpReward ?? 10;
      const user = await getUserById(ctx.user.id);
      if (!user) return { success: true, xpGained: xpGain, newAchievements: [] };

      const newXp = user.xp + xpGain;
      const newLevel = computeLevel(newXp);
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      let newStreak = user.currentStreak;
      if (user.lastActiveDate === today) {
        // already active today — no change
      } else if (user.lastActiveDate === yesterday) {
        newStreak = user.currentStreak + 1;
      } else {
        newStreak = 1;
      }
      const newLongest = Math.max(user.longestStreak, newStreak);
      await updateUserProfile(ctx.user.id, {
        xp: newXp,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
      });

      const newAchievements: string[] = [];
      const doneCount = allTasks.filter(t => t.status === "done" || t.id === input.id).length;
      const checks: [string, boolean][] = [
        ["first_task", doneCount >= 1],
        ["tasks_10",   doneCount >= 10],
        ["tasks_50",   doneCount >= 50],
        ["streak_3",   newStreak >= 3],
        ["streak_7",   newStreak >= 7],
        ["streak_30",  newStreak >= 30],
        ["level_5",    newLevel >= 5],
        ["level_10",   newLevel >= 10],
      ];
      for (const [slug, condition] of checks) {
        if (condition) {
          const unlocked = await unlockAchievement(ctx.user.id, slug);
          if (unlocked) {
            newAchievements.push(slug);
            const bonus = ACHIEVEMENT_CATALOGUE[slug]?.xpBonus ?? 0;
            if (bonus > 0) await updateUserProfile(ctx.user.id, { xp: newXp + bonus });
          }
        }
      }

      // ── Recurring task: spawn the next instance ──────────────────────────
      let spawnedRecurring = false;
      if (task && task.recurrenceType) {
        const pendingInstance = allTasks.find(
          t =>
            t.id !== task.id &&
            t.parentTaskId === task.id &&
            (t.status === "todo" || t.status === "in_progress")
        );
        if (!pendingInstance) {
          const nextData = buildNextTaskInstance(
            {
              id: task.id,
              title: task.title,
              notes: task.notes ?? undefined,
              roleContext: (task.roleContext ?? "all") as "student" | "parent" | "professional" | "all",
              priority: (task.priority ?? "medium") as "low" | "medium" | "high",
              energyRequired: (task.energyRequired ?? "medium") as "low" | "medium" | "high",
              dueTime: task.dueTime ?? undefined,
              xpReward: task.xpReward ?? 10,
              recurrenceType: task.recurrenceType as "daily" | "weekly" | "monthly" | "days_of_week" | "after_completion",
              recurrenceDays: task.recurrenceDays ?? undefined,
              userId: ctx.user.id,
            },
            new Date()
          );
          await createTask(nextData);
          spawnedRecurring = true;
        }
      }

      return { success: true, xpGained: xpGain, newAchievements, spawnedRecurring };
    }),

  /** Permanently deletes a task owned by the authenticated user. */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteTask(input.id, ctx.user.id);
      return { success: true };
    }),

  /** Toggles the done state of a single step within a task. */
  toggleStep: protectedProcedure
    .input(z.object({
      taskId: z.number(),
      stepId: z.string(),
      done: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const allTasks = await getAllTasksForUser(ctx.user.id);
      const task = allTasks.find(t => t.id === input.taskId);
      if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      const currentSteps = (task.steps ?? []) as { id: string; text: string; done: boolean }[];
      const updatedSteps = currentSteps.map(s =>
        s.id === input.stepId ? { ...s, done: input.done } : s
      );
      await updateTask(input.taskId, ctx.user.id, { steps: updatedSteps });
      return { success: true, steps: updatedSteps };
    }),

  /**
   * Uses an LLM to break a task into 3–5 micro-steps and persists them.
   * User-supplied strings are sanitised before prompt interpolation to
   * prevent prompt-injection attacks.
   */
  expand: protectedProcedure
    .input(z.object({
      taskId: z.number(),
      title: z.string().min(1).max(500),
      notes: z.string().max(2000).optional(),
      role: z.enum(["student", "parent", "professional", "all"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const roleContext = input.role && input.role !== "all" ? input.role : "general";
      const sanitise = (s: string) => s.replace(/[\x00-\x1F\x7F]/g, " ").trim();
      const safeTitle = sanitise(input.title).slice(0, 500);
      const safeNotes = input.notes ? sanitise(input.notes).slice(0, 2000) : "";
      const prompt = [
        "You are a compassionate ADHD/neurodivergent productivity coach.",
        "Break down the following task into exactly 3 to 5 concrete, tiny, immediately actionable micro-steps.",
        "Each step should be a single physical action (e.g. \"Open Gmail\", \"Click Reply\", \"Type one sentence\").",
        "No vague steps like \"think about it\" or \"plan\". No motivational fluff.",
        `Context: the user is a ${roleContext}.`,
        `<task>${safeTitle}</task>${safeNotes ? `<notes>${safeNotes}</notes>` : ""}`,
        'Respond ONLY with a JSON object: { "steps": ["step 1", "step 2", ...] }',
      ].join(" ");

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a helpful assistant that outputs only valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "task_steps",
            strict: true,
            schema: {
              type: "object",
              properties: { steps: { type: "array", items: { type: "string" } } },
              required: ["steps"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
      const steps: { id: string; text: string; done: boolean }[] = (parsed.steps ?? [])
        .slice(0, 5)
        .map((text: string, i: number) => ({ id: `step-${Date.now()}-${i}`, text, done: false }));

      await updateTask(input.taskId, ctx.user.id, { steps });
      return { steps };
    }),
});
