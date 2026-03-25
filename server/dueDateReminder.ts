/**
 * Due-Date Reminder Job
 *
 * Runs every 30 minutes (aligned with the streak reminder). For each run it:
 * 1. Gets the current UTC half-hour slot (e.g. "09:00").
 * 2. Fetches all users with tasks due today (in their local timezone).
 * 3. For each user, converts their stored reminderTime (local) to UTC and checks
 *    if it matches the current slot.
 * 4. Sends the owner a consolidated notification listing the affected users and tasks.
 *
 * Reuses the same timezone-conversion logic as the streak reminder.
 */

import { notifyOwner } from "./_core/notification";
import { getUsersWithTasksDueToday } from "./db";

/** Round a Date down to the nearest 30-minute boundary and return "HH:MM" UTC. */
function currentHalfHourSlotUTC(now: Date = new Date()): string {
  const h = now.getUTCHours();
  const m = now.getUTCMinutes() < 30 ? 0 : 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Convert a local HH:MM time in a given IANA timezone to a UTC HH:MM string.
 * DST-aware via Intl.DateTimeFormat. Returns null if timezone is invalid.
 */
function localTimeToUTC(localHHMM: string, timezone: string): string | null {
  try {
    const [hStr, mStr] = localHHMM.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    for (let utcH = 0; utcH < 24; utcH++) {
      for (const utcM of [0, 30]) {
        const candidate = new Date(Date.UTC(year, month, day, utcH, utcM, 0));
        const parts = fmt.formatToParts(candidate);
        const localH = parseInt(parts.find((p) => p.type === "hour")?.value ?? "99", 10);
        const localMin = parseInt(parts.find((p) => p.type === "minute")?.value ?? "99", 10);
        if (localH === h && localMin === m) {
          return `${String(utcH).padStart(2, "0")}:${String(utcM).padStart(2, "0")}`;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
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

export async function runDueDateReminderJob(): Promise<void> {
  try {
    const currentSlotUTC = currentHalfHourSlotUTC();

    // Fetch all users who have tasks due today (in their local timezone)
    const usersWithDueTasks = await getUsersWithTasksDueToday();

    // Filter to users whose reminderTime (in their timezone) maps to the current UTC slot
    const matched = usersWithDueTasks.filter(({ user }) => {
      const userTimezone = (user as typeof user & { timezone?: string }).timezone ?? "UTC";
      const userReminderTime = (user as typeof user & { reminderTime?: string }).reminderTime ?? "09:00";
      const utcSlot = localTimeToUTC(userReminderTime, userTimezone);
      return utcSlot === currentSlotUTC;
    });

    if (matched.length === 0) {
      console.log(`[DueDateReminder] ${currentSlotUTC} UTC — no due-task reminders for this slot.`);
      return;
    }

    const userLines = matched
      .map(({ user, dueTasks }) => {
        const tz = (user as typeof user & { timezone?: string }).timezone ?? "UTC";
        const rt = (user as typeof user & { reminderTime?: string }).reminderTime ?? "09:00";
        const taskList = dueTasks.map((t) => `  – ${t.title}`).join("\n");
        return `• ${user.name ?? user.email ?? `User #${user.id}`} (${rt} ${tz}):\n${taskList}`;
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

/**
 * Schedules the due-date reminder to fire at every 30-minute boundary.
 * Call this once from server startup.
 */
export function scheduleDueDateReminder(): void {
  const scheduleNext = () => {
    const delay = msUntilNextHalfHour();
    const nextRun = new Date(Date.now() + delay);
    console.log(
      `[DueDateReminder] Next run scheduled for ${nextRun.toUTCString()} (in ${Math.round(delay / 60000)} min)`
    );
    setTimeout(async () => {
      await runDueDateReminderJob();
      scheduleNext();
    }, delay);
  };
  scheduleNext();
}
