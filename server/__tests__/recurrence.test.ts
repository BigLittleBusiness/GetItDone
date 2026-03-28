import { describe, it, expect } from "vitest";
import { computeNextDueDate, buildNextTaskInstance, toDateString } from "../recurrence";

// Helper: create a Date at midnight UTC for a given YYYY-MM-DD string
function d(dateStr: string): Date {
  const [y, m, day] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, day, 0, 0, 0, 0);
}

describe("toDateString", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(toDateString(d("2025-03-15"))).toBe("2025-03-15");
  });
});

describe("computeNextDueDate", () => {
  describe("daily", () => {
    it("returns the next calendar day", () => {
      expect(computeNextDueDate("daily", null, d("2025-03-15"))).toBe("2025-03-16");
    });

    it("rolls over month boundaries correctly", () => {
      expect(computeNextDueDate("daily", null, d("2025-03-31"))).toBe("2025-04-01");
    });
  });

  describe("after_completion", () => {
    it("returns the next calendar day (same as daily)", () => {
      expect(computeNextDueDate("after_completion", null, d("2025-06-30"))).toBe("2025-07-01");
    });
  });

  describe("weekly", () => {
    it("returns exactly 7 days later", () => {
      expect(computeNextDueDate("weekly", null, d("2025-03-15"))).toBe("2025-03-22");
    });

    it("rolls over year boundaries correctly", () => {
      expect(computeNextDueDate("weekly", null, d("2025-12-29"))).toBe("2026-01-05");
    });
  });

  describe("monthly", () => {
    it("returns the same day next month", () => {
      expect(computeNextDueDate("monthly", null, d("2025-03-15"))).toBe("2025-04-15");
    });

    it("rolls over year boundaries correctly", () => {
      expect(computeNextDueDate("monthly", null, d("2025-12-15"))).toBe("2026-01-15");
    });
  });

  describe("days_of_week", () => {
    it("returns the next matching weekday after today", () => {
      // 2025-03-17 is a Monday (day 1); next Wednesday (3) is 2025-03-19
      const result = computeNextDueDate("days_of_week", "3", d("2025-03-17"));
      expect(result).toBe("2025-03-19");
    });

    it("wraps around to the next week when no day is later this week", () => {
      // 2025-03-21 is a Friday (day 5); next Monday (1) is 2025-03-24
      const result = computeNextDueDate("days_of_week", "1", d("2025-03-21"));
      expect(result).toBe("2025-03-24");
    });

    it("picks the earliest of multiple days", () => {
      // 2025-03-17 is Monday (1); days 3,5 → next is Wednesday (3) = 2025-03-19
      const result = computeNextDueDate("days_of_week", "3,5", d("2025-03-17"));
      expect(result).toBe("2025-03-19");
    });

    it("returns null when recurrenceDays is empty string", () => {
      expect(computeNextDueDate("days_of_week", "", d("2025-03-17"))).toBeNull();
    });

    it("returns null when recurrenceDays is null", () => {
      expect(computeNextDueDate("days_of_week", null, d("2025-03-17"))).toBeNull();
    });
  });

  it("returns null for an unknown recurrence type", () => {
    // @ts-expect-error — testing runtime guard
    expect(computeNextDueDate("unknown_type", null, d("2025-03-17"))).toBeNull();
  });
});

describe("buildNextTaskInstance", () => {
  const baseParent = {
    userId: 42,
    title: "Take medication",
    notes: "Morning dose",
    roleContext: "all" as const,
    priority: "medium" as const,
    energyRequired: "low" as const,
    dueTime: "08:00",
    xpReward: 10,
    recurrenceType: "daily" as const,
    recurrenceDays: null,
    id: 7,
  };

  it("sets status to todo", () => {
    const next = buildNextTaskInstance(baseParent, d("2025-03-15"));
    expect(next.status).toBe("todo");
  });

  it("copies title, notes, priority, and energy from parent", () => {
    const next = buildNextTaskInstance(baseParent, d("2025-03-15"));
    expect(next.title).toBe("Take medication");
    expect(next.notes).toBe("Morning dose");
    expect(next.priority).toBe("medium");
    expect(next.energyRequired).toBe("low");
  });

  it("sets parentTaskId to the parent's id", () => {
    const next = buildNextTaskInstance(baseParent, d("2025-03-15"));
    expect(next.parentTaskId).toBe(7);
  });

  it("computes the correct next due date", () => {
    const next = buildNextTaskInstance(baseParent, d("2025-03-15"));
    expect(next.dueDate).toBe("2025-03-16");
  });

  it("sets dueDate to undefined when days_of_week has no days", () => {
    const parent = { ...baseParent, recurrenceType: "days_of_week" as const, recurrenceDays: "" };
    const next = buildNextTaskInstance(parent, d("2025-03-15"));
    expect(next.dueDate).toBeUndefined();
  });

  it("carries recurrenceType and recurrenceDays to the new instance", () => {
    const next = buildNextTaskInstance(baseParent, d("2025-03-15"));
    expect(next.recurrenceType).toBe("daily");
    expect(next.recurrenceDays).toBeUndefined();
  });

  it("starts with empty steps array", () => {
    const next = buildNextTaskInstance(baseParent, d("2025-03-15"));
    expect(next.steps).toEqual([]);
  });
});
