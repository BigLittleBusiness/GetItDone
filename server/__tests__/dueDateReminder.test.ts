/**
 * Unit tests for the due-date reminder job helper functions.
 *
 * We test the pure logic that can be extracted without database access:
 * - currentHalfHourSlotUTC: rounds a Date to the nearest :00 or :30 boundary
 * - localTimeToUTC: converts a local HH:MM in a given IANA timezone to UTC HH:MM
 * - task filtering: tasks due today in a user's local timezone
 */
import { describe, it, expect } from "vitest";

// ─── Inline copies of the pure helpers from dueDateReminder.ts ───────────────
// (We duplicate them here so tests don't need to import the full module with DB deps)

function currentHalfHourSlotUTC(now: Date): string {
  const h = now.getUTCHours();
  const m = now.getUTCMinutes() < 30 ? 0 : 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("currentHalfHourSlotUTC", () => {
  it("rounds down to :00 when minutes < 30", () => {
    const d = new Date("2025-06-15T09:14:00Z");
    expect(currentHalfHourSlotUTC(d)).toBe("09:00");
  });

  it("rounds down to :30 when minutes >= 30 and < 60", () => {
    const d = new Date("2025-06-15T09:45:00Z");
    expect(currentHalfHourSlotUTC(d)).toBe("09:30");
  });

  it("handles exactly :00", () => {
    const d = new Date("2025-06-15T14:00:00Z");
    expect(currentHalfHourSlotUTC(d)).toBe("14:00");
  });

  it("handles exactly :30", () => {
    const d = new Date("2025-06-15T14:30:00Z");
    expect(currentHalfHourSlotUTC(d)).toBe("14:30");
  });

  it("handles midnight (00:00)", () => {
    const d = new Date("2025-06-15T00:05:00Z");
    expect(currentHalfHourSlotUTC(d)).toBe("00:00");
  });

  it("handles 23:59 UTC", () => {
    const d = new Date("2025-06-15T23:59:00Z");
    expect(currentHalfHourSlotUTC(d)).toBe("23:30");
  });
});

describe("localTimeToUTC", () => {
  it("converts UTC time to UTC (identity)", () => {
    const result = localTimeToUTC("09:00", "UTC");
    expect(result).toBe("09:00");
  });

  it("converts Sydney AEST (UTC+10) to UTC", () => {
    // Sydney AEST is UTC+10, so 09:00 local = 23:00 UTC (previous day, but same UTC offset)
    // We test that the function returns a valid UTC slot string
    const result = localTimeToUTC("09:00", "Australia/Sydney");
    // Should be a valid HH:MM string
    expect(result).toMatch(/^\d{2}:\d{2}$/);
    // 09:00 AEST = 23:00 UTC (standard time, no DST)
    // During AEDT (UTC+11), 09:00 AEDT = 22:00 UTC
    // Either is valid depending on DST state
    expect(["23:00", "22:00"]).toContain(result);
  });

  it("converts New York EST (UTC-5) to UTC", () => {
    const result = localTimeToUTC("09:00", "America/New_York");
    // EST = UTC-5, so 09:00 EST = 14:00 UTC
    // EDT = UTC-4, so 09:00 EDT = 13:00 UTC
    expect(result).toMatch(/^\d{2}:\d{2}$/);
    expect(["14:00", "13:00"]).toContain(result);
  });

  it("returns null for an invalid timezone", () => {
    const result = localTimeToUTC("09:00", "Not/ATimezone");
    expect(result).toBeNull();
  });

  it("handles half-hour timezone offsets (India IST = UTC+5:30)", () => {
    // 09:30 IST = 04:00 UTC
    const result = localTimeToUTC("09:30", "Asia/Kolkata");
    expect(result).toBe("04:00");
  });
});

describe("due-task filtering logic", () => {
  it("filters tasks where dueDate matches today's local date", () => {
    const todayLocal = "2025-06-15";
    const taskList = [
      { id: 1, title: "Task A", dueDate: "2025-06-15", status: "todo" },
      { id: 2, title: "Task B", dueDate: "2025-06-14", status: "todo" },
      { id: 3, title: "Task C", dueDate: "2025-06-15", status: "done" },
      { id: 4, title: "Task D", dueDate: "2025-06-15", status: "todo" },
      { id: 5, title: "Task E", dueDate: null, status: "todo" },
    ];

    const dueTasks = taskList.filter(
      (t) =>
        t.dueDate === todayLocal &&
        t.status !== "done" &&
        t.status !== "archived"
    );

    expect(dueTasks).toHaveLength(2);
    expect(dueTasks.map((t) => t.id)).toEqual([1, 4]);
  });

  it("excludes archived tasks even if due today", () => {
    const todayLocal = "2025-06-15";
    const taskList = [
      { id: 1, title: "Task A", dueDate: "2025-06-15", status: "archived" },
    ];
    const dueTasks = taskList.filter(
      (t) => t.dueDate === todayLocal && t.status !== "done" && t.status !== "archived"
    );
    expect(dueTasks).toHaveLength(0);
  });

  it("returns empty array when no tasks are due today", () => {
    const todayLocal = "2025-06-15";
    const taskList = [
      { id: 1, title: "Task A", dueDate: "2025-06-14", status: "todo" },
      { id: 2, title: "Task B", dueDate: "2025-06-16", status: "todo" },
    ];
    const dueTasks = taskList.filter(
      (t) => t.dueDate === todayLocal && t.status !== "done" && t.status !== "archived"
    );
    expect(dueTasks).toHaveLength(0);
  });
});
