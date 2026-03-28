/**
 * Streak Reminder Job
 *
 * Runs every 30 minutes (aligned to :00 and :30 UTC boundaries). For each run:
 *  1. Determines the current UTC half-hour slot (e.g. "14:00").
 *  2. Fetches all users with an active streak who have not completed a task today.
 *  3. Filters to users whose stored reminderTime (in their local timezone) maps
 *     to the current UTC slot — ensuring each user is notified at their chosen time.
 *  4. Sends the owner a consolidated notification for the matched users.
 *
 * This module contains only the job logic. Scheduling is handled by the worker
 * entry point (server/workers/index.ts) so the job can be unit-tested in isolation.
 */

import { notifyOwner } from "../_core/notification";
import { getUsersAtRiskOfLosingStreak } from "../db";
import { currentHalfHourSlotUTC, localTimeToUTC } from "./shared/timeUtils";

// Extend the DB row type to include optional fields added by the user schema
type AtRiskUser = Awaited<ReturnType<typeof getUsersAtRiskOfLosingStreak>>[number] & {
  timezone?: string;
  reminderTime?: string;
};

export async function runStreakReminderJob(now: Date = new Date()): Promise<void> {
  try {
    const currentSlotUTC = currentHalfHourSlotUTC(now);

    const allAtRisk = (await getUsersAtRiskOfLosingStreak()) as AtRiskUser[];

    const atRisk = allAtRisk.filter((u) => {
      const userTimezone = u.timezone ?? "UTC";
      const userReminderTime = u.reminderTime ?? "14:00";
      const utcSlot = localTimeToUTC(userReminderTime, userTimezone);
      return utcSlot === currentSlotUTC;
    });

    if (atRisk.length === 0) {
      console.log(`[StreakReminder] ${currentSlotUTC} UTC — no users matched for this slot.`);
      return;
    }

    const userLines = atRisk
      .map((u) => {
        const tz = u.timezone ?? "UTC";
        const rt = u.reminderTime ?? "14:00";
        return `• ${u.name ?? u.email ?? `User #${u.id}`} — 🔥 ${u.currentStreak}-day streak at risk (${rt} ${tz})`;
      })
      .join("\n");

    const title = `⚠️ ${atRisk.length} streak${atRisk.length === 1 ? "" : "s"} at risk — ${currentSlotUTC} UTC`;
    const content = [
      `${atRisk.length} user${atRisk.length === 1 ? " has" : "s have"} an active streak but haven't completed a task yet today.\n`,
      userLines,
      `\nConsider checking in-app engagement metrics.`,
    ].join("\n");

    const sent = await notifyOwner({ title, content });
    if (sent) {
      console.log(`[StreakReminder] Owner notified about ${atRisk.length} at-risk user(s) for slot ${currentSlotUTC} UTC.`);
    } else {
      console.warn("[StreakReminder] Notification service unavailable; will retry at next slot.");
    }
  } catch (err) {
    console.error("[StreakReminder] Job failed:", err);
  }
}
