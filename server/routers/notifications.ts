/**
 * Notifications router — admin-triggered reminder jobs.
 */
import { protectedProcedure, router } from "../_core/trpc";
import { runStreakReminderJob } from "../streakReminder";
import { runDueDateReminderJob } from "../dueDateReminder";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  /** Manually triggers the streak-reminder email job (admin only). */
  triggerStreakReminder: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
    }
    await runStreakReminderJob();
    return { success: true };
  }),

  /** Manually triggers the due-date reminder email job (admin only). */
  triggerDueDateReminder: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
    }
    await runDueDateReminderJob();
    return { success: true };
  }),
});
