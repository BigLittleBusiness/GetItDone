/**
 * Streak Reminder Job
 *
 * Runs every 30 minutes. For each run it:
 * 1. Gets the current UTC half-hour slot (e.g. "14:00").
 * 2. Fetches all users with an active streak who haven't completed a task today.
 * 3. For each at-risk user, converts their stored reminderTime (in their local
 *    timezone) to UTC and checks if it matches the current slot.
 * 4. Sends the owner a consolidated notification for matched users.
 *
 * Timezone conversion uses the Intl API (built into Node.js 18+) — no extra
 * packages required.
 */

import { notifyOwner } from "./_core/notification";
import { getUsersAtRiskOfLosingStreak } from "./db";

/** Round a Date down to the nearest 30-minute boundary and return "HH:MM" UTC. */
function currentHalfHourSlotUTC(now: Date = new Date()): string {
  const h = now.getUTCHours();
  const m = now.getUTCMinutes() < 30 ? 0 : 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Convert a local HH:MM time in a given IANA timezone to a UTC HH:MM string.
 * Uses today's date for the conversion (DST-aware).
 * Returns null if the timezone is invalid.
 */
function localTimeToUTC(localHHMM: string, timezone: string): string | null {
  try {
    const [hStr, mStr] = localHHMM.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);

    // Build a Date representing today at localHHMM in the given timezone.
    // We use a reference date in UTC and then find the offset via Intl.
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    // Create a formatter that gives us the local time in the target timezone
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Iterate over UTC hours to find the one whose local time matches localHHMM
    // (handles DST by checking the actual formatted output)
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

export async function runStreakReminderJob(): Promise<void> {
  try {
    const currentSlotUTC = currentHalfHourSlotUTC();

    // Fetch all at-risk users (no slot filter — we'll filter by timezone below)
    const allAtRisk = await getUsersAtRiskOfLosingStreak();

    // Filter to users whose reminderTime (in their timezone) maps to the current UTC slot
    const atRisk = allAtRisk.filter((u) => {
      const userTimezone = (u as typeof u & { timezone?: string }).timezone ?? "UTC";
      const userReminderTime = (u as typeof u & { reminderTime?: string }).reminderTime ?? "14:00";
      const utcSlot = localTimeToUTC(userReminderTime, userTimezone);
      return utcSlot === currentSlotUTC;
    });

    if (atRisk.length === 0) {
      console.log(`[StreakReminder] ${currentSlotUTC} UTC — no users matched for this slot.`);
      return;
    }

    const userLines = atRisk
      .map((u) => {
        const tz = (u as typeof u & { timezone?: string }).timezone ?? "UTC";
        const rt = (u as typeof u & { reminderTime?: string }).reminderTime ?? "14:00";
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
