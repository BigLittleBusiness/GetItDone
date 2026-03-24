/**
 * Streak Reminder Job
 *
 * Runs once per day (scheduled via setInterval at server startup).
 * Finds all users who have an active streak but have not completed any task
 * today, then sends the owner a consolidated notification so they can monitor
 * retention health. In a production multi-tenant system you would swap
 * notifyOwner for a per-user push / email channel; for now the Manus
 * built-in notification API targets the project owner.
 */

import { notifyOwner } from "./_core/notification";
import { getUsersAtRiskOfLosingStreak } from "./db";

const REMINDER_HOUR_UTC = 14; // 2 PM UTC — adjust to your audience's timezone

function msUntilNextRun(): number {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(REMINDER_HOUR_UTC, 0, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next.getTime() - now.getTime();
}

export async function runStreakReminderJob(): Promise<void> {
  try {
    const atRisk = await getUsersAtRiskOfLosingStreak();
    if (atRisk.length === 0) {
      console.log("[StreakReminder] No users at risk today — all streaks safe.");
      return;
    }

    const userLines = atRisk
      .map(
        (u) =>
          `• ${u.name ?? u.email ?? `User #${u.id}`} — 🔥 ${u.currentStreak}-day streak at risk`
      )
      .join("\n");

    const title = `⚠️ ${atRisk.length} streak${atRisk.length === 1 ? "" : "s"} at risk today`;
    const content = [
      `${atRisk.length} user${atRisk.length === 1 ? " has" : "s have"} an active streak but haven't completed a task yet today.\n`,
      userLines,
      `\nConsider sending them a nudge or checking in-app engagement metrics.`,
    ].join("\n");

    const sent = await notifyOwner({ title, content });
    if (sent) {
      console.log(`[StreakReminder] Owner notified about ${atRisk.length} at-risk user(s).`);
    } else {
      console.warn("[StreakReminder] Notification service unavailable; will retry tomorrow.");
    }
  } catch (err) {
    console.error("[StreakReminder] Job failed:", err);
  }
}

/**
 * Schedules the streak reminder to fire once per day at REMINDER_HOUR_UTC.
 * Call this once from server startup (server/_core/index.ts or similar).
 */
export function scheduleStreakReminder(): void {
  const scheduleNext = () => {
    const delay = msUntilNextRun();
    const nextRun = new Date(Date.now() + delay);
    console.log(
      `[StreakReminder] Next run scheduled for ${nextRun.toUTCString()} (in ${Math.round(delay / 60000)} min)`
    );
    setTimeout(async () => {
      await runStreakReminderJob();
      scheduleNext(); // reschedule for the next day
    }, delay);
  };
  scheduleNext();
}
