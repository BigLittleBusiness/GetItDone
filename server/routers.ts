import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { runStreakReminderJob } from "./streakReminder";
import {
  createSurveyResponse,
  createTask,
  deleteTask,
  getAchievementsForUser,
  getAllSurveyResponses,
  getAllTasksForUser,
  getTasksByRole,
  getUserById,
  unlockAchievement,
  updateTask,
  updateUserProfile,
} from "./db";

const ACHIEVEMENT_CATALOGUE: Record<string, { title: string; description: string; icon: string; xpBonus: number }> = {
  first_task: { title: "First Step!", description: "Completed your very first task.", icon: "🎉", xpBonus: 50 },
  streak_3: { title: "3-Day Streak", description: "Showed up 3 days in a row.", icon: "🔥", xpBonus: 30 },
  streak_7: { title: "Week Warrior", description: "7 days of showing up.", icon: "⚡", xpBonus: 75 },
  streak_30: { title: "Month Master", description: "30 consecutive days.", icon: "🏆", xpBonus: 200 },
  tasks_10: { title: "Getting Momentum", description: "Completed 10 tasks total.", icon: "💪", xpBonus: 40 },
  tasks_50: { title: "Productivity Machine", description: "50 tasks completed.", icon: "🚀", xpBonus: 100 },
  level_5: { title: "Level 5 Unlocked", description: "Reached level 5.", icon: "⭐", xpBonus: 60 },
  level_10: { title: "Double Digits", description: "Reached level 10.", icon: "🌟", xpBonus: 120 },
  role_switcher: { title: "Context Switcher", description: "Used all 3 role modes.", icon: "🎭", xpBonus: 25 },
  onboarding_complete: { title: "Ready to Roll", description: "Completed onboarding.", icon: "✅", xpBonus: 20 },
};

function xpForLevel(level: number): number {
  return level * 100;
}

function computeLevel(xp: number): number {
  let level = 1;
  let threshold = 0;
  while (xp >= threshold + xpForLevel(level)) {
    threshold += xpForLevel(level);
    level++;
  }
  return level;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      return user ?? ctx.user;
    }),

    completeOnboarding: protectedProcedure
      .input(z.object({
        activeRole: z.enum(["student", "parent", "professional"]),
        personalityMode: z.enum(["cheeky", "positive", "literal"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, {
          onboardingComplete: true,
          activeRole: input.activeRole,
          personalityMode: input.personalityMode,
        });
        const unlocked = await unlockAchievement(ctx.user.id, "onboarding_complete");
        if (unlocked) {
          const bonus = ACHIEVEMENT_CATALOGUE["onboarding_complete"]?.xpBonus ?? 0;
          const user = await getUserById(ctx.user.id);
          const newXp = (user?.xp ?? 0) + bonus;
          await updateUserProfile(ctx.user.id, { xp: newXp, level: computeLevel(newXp) });
        }
        return { success: true };
      }),

    updateSettings: protectedProcedure
      .input(z.object({
        activeRole: z.enum(["student", "parent", "professional"]).optional(),
        personalityMode: z.enum(["cheeky", "positive", "literal"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  tasks: router({
    list: protectedProcedure
      .input(z.object({ roleContext: z.enum(["student", "parent", "professional"]).optional() }))
      .query(async ({ ctx, input }) => {
        if (input.roleContext) {
          return getTasksByRole(ctx.user.id, input.roleContext);
        }
        return getAllTasksForUser(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(500),
        notes: z.string().optional(),
        roleContext: z.enum(["student", "parent", "professional", "all"]).default("all"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        energyRequired: z.enum(["low", "medium", "high"]).default("medium"),
        dueDate: z.string().optional(),
        dueTime: z.string().optional(),
        steps: z.array(z.object({ id: z.string(), text: z.string(), done: z.boolean() })).optional(),
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
        });
        return task;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(500).optional(),
        notes: z.string().optional(),
        roleContext: z.enum(["student", "parent", "professional", "all"]).optional(),
        status: z.enum(["todo", "in_progress", "done", "archived"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        energyRequired: z.enum(["low", "medium", "high"]).optional(),
        dueDate: z.string().optional(),
        dueTime: z.string().optional(),
        steps: z.array(z.object({ id: z.string(), text: z.string(), done: z.boolean() })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const completedAt = data.status === "done" ? new Date() : undefined;
        await updateTask(id, ctx.user.id, { ...data, ...(completedAt ? { completedAt } : {}) });
        return { success: true };
      }),

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
          // no change
        } else if (user.lastActiveDate === yesterday) {
          newStreak = user.currentStreak + 1;
        } else {
          newStreak = 1;
        }
        const newLongest = Math.max(user.longestStreak, newStreak);
        await updateUserProfile(ctx.user.id, { xp: newXp, level: newLevel, currentStreak: newStreak, longestStreak: newLongest, lastActiveDate: today });
        const newAchievements: string[] = [];
        const doneCount = allTasks.filter(t => t.status === "done" || t.id === input.id).length;
        const checks: [string, boolean][] = [
          ["first_task", doneCount >= 1],
          ["tasks_10", doneCount >= 10],
          ["tasks_50", doneCount >= 50],
          ["streak_3", newStreak >= 3],
          ["streak_7", newStreak >= 7],
          ["streak_30", newStreak >= 30],
          ["level_5", newLevel >= 5],
          ["level_10", newLevel >= 10],
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
        return { success: true, xpGained: xpGain, newAchievements };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteTask(input.id, ctx.user.id);
        return { success: true };
      }),

    expand: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        title: z.string(),
        notes: z.string().optional(),
        role: z.enum(["student", "parent", "professional", "all"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const roleContext = input.role && input.role !== "all" ? input.role : "general";
        const prompt = [
          `You are a compassionate ADHD/neurodivergent productivity coach.`,
          `Break down the following task into exactly 3 to 5 concrete, tiny, immediately actionable micro-steps.`,
          `Each step should be a single physical action (e.g. "Open Gmail", "Click Reply", "Type one sentence").`,
          `No vague steps like "think about it" or "plan". No motivational fluff.`,
          `Context: the user is a ${roleContext}.`,
          `Task: "${input.title}"${input.notes ? `. Notes: ${input.notes}` : ""}.`,
          `Respond ONLY with a JSON object: { "steps": ["step 1", "step 2", ...] }`,
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
                properties: {
                  steps: { type: "array", items: { type: "string" } },
                },
                required: ["steps"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
        const steps: { id: string; text: string; done: boolean }[] = (parsed.steps ?? []).slice(0, 5).map(
          (text: string, i: number) => ({ id: `step-${Date.now()}-${i}`, text, done: false })
        );

        // Persist steps to the task
        await updateTask(input.taskId, ctx.user.id, { steps });
        return { steps };
      }),
  }),

  achievements: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const unlocked = await getAchievementsForUser(ctx.user.id);
      return unlocked.map(a => ({ ...a, ...ACHIEVEMENT_CATALOGUE[a.slug] }));
    }),
    catalogue: publicProcedure.query(() => ACHIEVEMENT_CATALOGUE),
  }),

  notifications: router({
    triggerStreakReminder: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin only");
      }
      await runStreakReminderJob();
      return { success: true };
    }),
  }),

  survey: router({
    submit: publicProcedure
      .input(z.object({
        roleValidation: z.enum(["spot-on", "mostly", "no"]).optional(),
        painPoint: z.enum(["starting", "planning", "remembering", "shame"]).optional(),
        featureFit: z.enum(["body-double", "shield", "cheerleader", "secretary"]).optional(),
        email: z.string().email().optional().or(z.literal("")),
      }))
      .mutation(async ({ input }) => {
        await createSurveyResponse({
          roleValidation: input.roleValidation,
          painPoint: input.painPoint,
          featureFit: input.featureFit,
          email: input.email || undefined,
        });
        return { success: true };
      }),
    getAll: publicProcedure.query(async () => getAllSurveyResponses()),
  }),
});

export type AppRouter = typeof appRouter;
