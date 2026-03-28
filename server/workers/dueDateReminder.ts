/**
 * Due-Date Reminder Job
 *
 * Runs every 30 minutes (aligned to :00 and :30 UTC boundaries). For each run:
 *  1. Determines the current UTC half-hour slot (e.g. "09:00").
 *  2. Fetches all users who have incomplete tasks due today (in their local timezone).
 *  3. Filters to users whose stored reminderTime (in their local timezone) maps
 *     to the current UTC slot.
 *  4. Sends the owner a consolidated notification listing the affected users and tasks.
 *
 * This module contains only the job logic. Scheduling is handled by the worker
 * entry point (server/workers/index.ts) so the job can be unit-tested in isolation.
 */

import { notifyOwner } from "../_core/notification";
import { getUsersWithTasksDueToday } from "../db";
import { currentHalfHourSlotUTC, localTimeToUTC } from "./shared/timeUtils";

// Extend the DB row type to include optional fields added by the user schema
type UserWithDueTasks = Awaited<ReturnType<typeof getUsersWithTasksDueToday>>[number];
type UserRow = UserWithDueTasks["user"] & {
  timezone?: string;
  reminderTime?: string;
};

export async function runDueDateReminderJob(now: Date = new Date()): Promise<void> {
  try {
    const currentSlotUTC = currentHalfHourSlotUTC(now);

    const usersWithDueTasks = await getUsersWithTasksDueToday();

    const matched = usersWithDueTasks.filter(({ user }) => {
      const u = user as UserRow;
      const userTimezone = u.timezone ?? "UTC";
      const userReminderTime = u.reminderTime ?? "09:00";
      const utcSlot = localTimeToUTC(userReminderTime, userTimezone);
      return utcSlot === currentSlotUTC;
    });

    if (matched.length === 0) {
      console.log(`[DueDateReminder] ${currentSlotUTC} UTC — no due-task reminders for this slot.`);
      return;
    }

    const userLines = matched
      .map(({ user, dueTasks }) => {
        const u = user as UserRow;
        const tz = u.timezone ?? "UTC";
        const rt = u.reminderTime ?? "09:00";
        const taskList = dueTasks.map((t) => `  – ${t.title}`).join("\n");
        return `• ${u.name ?? u.email ?? `User #${u.id}`} (${rt} ${tz}):\n${taskList}`;
      })
      .join("\n\n");

    const totalTasks = matched.reduce((sum, { dueTasks }) => sum + dueTasks.length, 0);
    const title = `📅 ${totalTasks} task${totalTasks === 1 ? "" : "s"} due today — ${currentSlotUTC} UTC`;
    const content = [
      `${matched.length} user${matched.length === 1 ? " has" : "s have"} incomplete tasks due today.\n`,
      userLines,
      `\nConsider checking in-app engagement metrics.`,
    ].join("\n");

    const sent = await notifyOwner({ title, content });
    if (sent) {
      console.log(`[DueDateReminder] Owner notified about ${totalTasks} due task(s) for slot ${currentSlotUTC} UTC.`);
    } else {
      console.warn("[DueDateReminder] Notification service unavailable; will retry at next slot.");
    }
  } catch (err) {
    console.error("[DueDateReminder] Job failed:", err);
  }
}
