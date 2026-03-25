/**
 * Streak Reminder Job
 *
 * Runs every 30 minutes. For each run it checks which users have a reminderTime
 * that matches the current UTC half-hour slot AND have an active streak but
 * haven't completed a task today. Those users are batched into a single owner
 * notification.
 *
 * NOTE: reminderTime is stored as HH:MM in the user's *local* timezone.
 * Because we don't store each user's timezone offset, we treat reminderTime
 * as UTC for now (a common simplification for v1). A future improvement would
 * be to store a tzOffset on the user profile and convert accordingly.
 */

import { notifyOwner } from "./_core/notification";
import { getUsersAtRiskOfLosingStreak } from "./db";

/** Round a Date down to the nearest 30-minute boundary and return "HH:MM". */
function currentHalfHourSlot(now: Date = new Date()): string {
  const h = now.getUTCHours();
  const m = now.getUTCMinutes() < 30 ? 0 : 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Milliseconds until the next 30-minute boundary (:00 or :30). */
function msUntilNextHalfHour(): number {
  const now = new Date();
  const next = new Date(now);
  const mins = now.getUTCMinutes();
  const nextMins = mins < 30 ? 30 : 60;
  next.setUTCMinutes(nextMins, 0, 0);
  return next.getTime() - now.getTime();
}

export async function runStreakReminderJob(): Promise<void> {
  try {
    const slot = currentHalfHourSlot();
    const atRisk = await getUsersAtRiskOfLosingStreak(slot);

    if (atRisk.length === 0) {
      console.log(`[StreakReminder] ${slot} UTC — no users at risk for this slot.`);
      return;
    }

    const userLines = atRisk
      .map(
        (u) =>
          `• ${u.name ?? u.email ?? `User #${u.id}`} — 🔥 ${u.currentStreak}-day streak at risk (reminder set for ${u.reminderTime ?? slot})`
      )
      .join("\n");

    const title = `⚠️ ${atRisk.length} streak${atRisk.length === 1 ? "" : "s"} at risk — ${slot} UTC slot`;
    const content = [
      `${atRisk.length} user${atRisk.length === 1 ? " has" : "s have"} an active streak but haven't completed a task yet today.\n`,
      userLines,
      `\nConsider checking in-app engagement metrics.`,
    ].join("\n");

    const sent = await notifyOwner({ title, content });
    if (sent) {
      console.log(`[StreakReminder] Owner notified about ${atRisk.length} at-risk user(s) for slot ${slot}.`);
    } else {
      console.warn("[StreakReminder] Notification service unavailable; will retry at next slot.");
    }
  } catch (err) {
    console.error("[StreakReminder] Job failed:", err);
  }
}

/**
 * Schedules the streak reminder to fire at every 30-minute boundary.
 * Call this once from server startup.
 */
export function scheduleStreakReminder(): void {
  const scheduleNext = () => {
    const delay = msUntilNextHalfHour();
    const nextRun = new Date(Date.now() + delay);
    console.log(
      `[StreakReminder] Next run scheduled for ${nextRun.toUTCString()} (in ${Math.round(delay / 60000)} min)`
    );
    setTimeout(async () => {
      await runStreakReminderJob();
      scheduleNext();
    }, delay);
  };
  scheduleNext();
}
