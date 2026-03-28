/**
 * Shared time utilities for scheduled worker jobs.
 *
 * Both the streak-reminder and due-date-reminder jobs operate on 30-minute
 * UTC boundaries and need DST-aware local-to-UTC conversion. These helpers
 * are extracted here so they are tested and maintained in one place.
 */

/**
 * Round a Date down to the nearest 30-minute boundary and return "HH:MM" UTC.
 * e.g. 14:17 UTC → "14:00", 14:43 UTC → "14:30"
 */
export function currentHalfHourSlotUTC(now: Date = new Date()): string {
  const h = now.getUTCHours();
  const m = now.getUTCMinutes() < 30 ? 0 : 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Convert a local "HH:MM" time in a given IANA timezone to a UTC "HH:MM" string.
 *
 * Uses today's date for the conversion so it is DST-aware. Iterates over all
 * 48 half-hour UTC slots in the day and returns the first one whose local
 * representation matches the requested local time.
 *
 * Returns null if the timezone is invalid or no match is found (can happen
 * during DST transitions that skip a half-hour slot).
 */
export function localTimeToUTC(localHHMM: string, timezone: string): string | null {
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

/**
 * Milliseconds until the next 30-minute boundary (:00 or :30).
 * Used to align job runs to the clock rather than drifting over time.
 */
export function msUntilNextHalfHour(now: Date = new Date()): number {
  const next = new Date(now);
  const mins = now.getUTCMinutes();
  const nextMins = mins < 30 ? 30 : 60;
  next.setUTCMinutes(nextMins, 0, 0);
  return next.getTime() - now.getTime();
}
