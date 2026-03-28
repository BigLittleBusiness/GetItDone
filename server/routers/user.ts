/**
 * User router — profile, onboarding, and settings.
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserById, unlockAchievement, updateUserProfile } from "../db";
import { ACHIEVEMENT_CATALOGUE, computeLevel } from "../shared/gamification";

export const userRouter = router({
  /** Returns the full user profile from the database. */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    return user ?? ctx.user;
  }),

  /** Marks onboarding as complete and stores the user's chosen role and personality. */
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

  /** Updates user preferences such as role, personality, reminder time, and display settings. */
  updateSettings: protectedProcedure
    .input(z.object({
      activeRole: z.enum(["student", "parent", "professional"]).optional(),
      personalityMode: z.enum(["cheeky", "positive", "literal"]).optional(),
      reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      timezone: z.string().min(1).max(64).optional(),
      readingTheme: z.enum(["default", "cream", "sage", "sky", "dusk", "sand"]).optional(),
      textSize: z.enum(["small", "medium", "large"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});
