import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { ENV } from "./_core/env";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { runStreakReminderJob } from "./streakReminder";
import { runDueDateReminderJob } from "./dueDateReminder";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { recordFailedAttempt, clearAttempts, isLockedOut, MAX_ATTEMPTS, LOCKOUT_MS } from "./adminRateLimiter";
import { buildNextTaskInstance } from "./recurrence";
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
        readingTheme: z.enum(["default", "cream", "sage", "sky", "dusk", "sand"]).optional(),
        textSize: z.enum(["small", "medium", "large"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, {
          onboardingComplete: true,
          activeRole: input.activeRole,
          personalityMode: input.personalityMode,
          ...(input.readingTheme ? { readingTheme: input.readingTheme } : {}),
          ...(input.textSize ? { textSize: input.textSize } : {}),
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
        reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(), // HH:MM 24h
        timezone: z.string().min(1).max(64).optional(), // IANA timezone string
        readingTheme: z.enum(["default", "cream", "sage", "sky", "dusk", "sand"]).optional(),
        textSize: z.enum(["small", "medium", "large"]).optional(),
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
        recurrenceType: z.enum(["daily", "weekly", "monthly", "days_of_week", "after_completion"]).optional(),
        recurrenceDays: z.string().optional(), // comma-separated day numbers 0-6
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
        recurrenceType: z.enum(["daily", "weekly", "monthly", "days_of_week", "after_completion"]).optional(),
        recurrenceDays: z.string().optional(),
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
        // ── Recurring task: spawn the next instance ──────────────────────────
        let spawnedRecurring = false;
        if (task && task.recurrenceType) {
          // Check there is not already a pending (todo) instance of this recurring task
          const pendingInstance = allTasks.find(
            t =>
              t.id !== task.id &&
              t.parentTaskId === task.id &&
              (t.status === "todo" || t.status === "in_progress")
          );
          if (!pendingInstance) {
            const nextData = buildNextTaskInstance(
              {
                userId: ctx.user.id,
                title: task.title,
                notes: task.notes,
                roleContext: task.roleContext,
                priority: task.priority,
                energyRequired: task.energyRequired,
                dueTime: task.dueTime,
                xpReward: task.xpReward,
                recurrenceType: task.recurrenceType,
                recurrenceDays: task.recurrenceDays,
                id: task.id,
              },
              new Date()
            );
            await createTask(nextData);
            spawnedRecurring = true;
          }
        }
        return { success: true, xpGained: xpGain, newAchievements, spawnedRecurring };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteTask(input.id, ctx.user.id);
        return { success: true };
      }),

    toggleStep: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        stepId: z.string(),
        done: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Fetch current task to get existing steps
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
    triggerDueDateReminder: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin only");
      }
      await runDueDateReminderJob();
      return { success: true };
    }),
  }),

  voice: router({
    transcribe: protectedProcedure
      .input(z.object({
        audioBase64: z.string(),
        mimeType: z.string().default("audio/webm"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64 audio and upload to S3
        const audioBuffer = Buffer.from(input.audioBase64, "base64");
        const ext = input.mimeType.includes("webm") ? "webm"
          : input.mimeType.includes("mp4") || input.mimeType.includes("m4a") ? "m4a"
          : input.mimeType.includes("ogg") ? "ogg"
          : input.mimeType.includes("wav") ? "wav"
          : "webm";
        const fileKey = `voice/${ctx.user.id}/${Date.now()}.${ext}`;
        const { url: audioUrl } = await storagePut(fileKey, audioBuffer, input.mimeType);

        // Transcribe via Whisper
        const result = await transcribeAudio({ audioUrl, language: "en", prompt: "Transcribe the user's task or note" });

        if ("error" in result) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
        }

        return { text: result.text.trim() };
      }),
  }),

  admin: router({
    // Verifies the admin password server-side and returns a short-lived session token.
    // The password is read from ENV.adminPassword (never exposed to the browser).
    login: publicProcedure
      .input(z.object({ password: z.string().min(1) }))
      .mutation(({ input, ctx }) => {
        // Derive the client IP from the request (falls back to 'unknown').
        const ip: string =
          (ctx.req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
          (ctx.req as unknown as { ip?: string }).ip ??
          'unknown';

        // Reject immediately if the IP is already locked out.
        const lockCheck = isLockedOut(ip);
        if (lockCheck.locked) {
          const retryAfterSec = Math.ceil((lockCheck.lockedUntil! - Date.now()) / 1000);
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: `Too many failed attempts. Try again in ${retryAfterSec} seconds.`,
          });
        }

        // Read at call time (not from cached ENV) so tests can stub process.env.
        const adminPassword = process.env.ADMIN_PASSWORD ?? '';
        if (!adminPassword) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Admin password is not configured.',
          });
        }

        // Constant-time comparison to prevent timing attacks.
        const expected = adminPassword;
        const provided = input.password;
        const isCorrect =
          provided.length === expected.length &&
          provided.split('').every((c, i) => c === expected[i]);

        if (!isCorrect) {
          const result = recordFailedAttempt(ip);
          const message = result.allowed
            ? `Incorrect password. ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? '' : 's'} remaining before lockout.`
            : `Too many failed attempts. Try again in ${Math.ceil(LOCKOUT_MS / 1000 / 60)} minutes.`;
          throw new TRPCError({ code: 'UNAUTHORIZED', message });
        }

        // Success — clear any previous failed attempts for this IP.
        clearAttempts(ip);
        return { success: true };
      }),

    // Returns all survey responses — only callable after the client has
    // verified the password via admin.login above.
    getSurveyResponses: publicProcedure.query(() => getAllSurveyResponses()),
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

        // Notify the owner of every new waitlist signup.
        // Fire-and-forget: a notification failure must never block the user's submission.
        const emailLine = input.email ? `📧 ${input.email}` : 'No email provided';
        const detailLines = [
          emailLine,
          input.roleValidation ? `Role fit: ${input.roleValidation}` : null,
          input.painPoint     ? `Pain point: ${input.painPoint}`     : null,
          input.featureFit    ? `Feature fit: ${input.featureFit}`   : null,
        ].filter(Boolean).join('\n');

        notifyOwner({
          title: '🎉 New Get It Done! waitlist signup',
          content: detailLines,
        }).catch(err => console.warn('[survey.submit] notifyOwner failed:', err));

        return { success: true };
      }),
    getAll: publicProcedure.query(async () => getAllSurveyResponses()),
  }),
});

export type AppRouter = typeof appRouter;
