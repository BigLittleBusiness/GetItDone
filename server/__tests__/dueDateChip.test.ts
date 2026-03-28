/**
 * Unit tests for the getDueDateStatus helper used by the due-date chip UI.
 *
 * The function is duplicated here (same logic as in Dashboard.tsx) so tests
 * run in the Node/Vitest environment without importing the full React component.
 */
import { describe, it, expect } from "vitest";

type DueDateStatus = "overdue" | "today" | "tomorrow" | null;

function getDueDateStatus(
  dueDate: string | null | undefined,
  now: Date = new Date()
): DueDateStatus {
  if (!dueDate) return null;
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  const today = fmt(now);
  const tomorrow = fmt(new Date(now.getTime() + 86_400_000));
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  if (dueDate === tomorrow) return "tomorrow";
  return null;
}

describe("getDueDateStatus", () => {
  const REF = new Date("2025-06-15T10:00:00"); // a fixed "now" for deterministic tests

  it("returns null for a task with no due date", () => {
    expect(getDueDateStatus(null, REF)).toBeNull();
    expect(getDueDateStatus(undefined, REF)).toBeNull();
    expect(getDueDateStatus("", REF)).toBeNull();
  });

  it("returns 'today' when dueDate equals today's local date", () => {
    expect(getDueDateStatus("2025-06-15", REF)).toBe("today");
  });

  it("returns 'tomorrow' when dueDate is one day ahead", () => {
    expect(getDueDateStatus("2025-06-16", REF)).toBe("tomorrow");
  });

  it("returns 'overdue' when dueDate is in the past", () => {
    expect(getDueDateStatus("2025-06-14", REF)).toBe("overdue");
    expect(getDueDateStatus("2024-01-01", REF)).toBe("overdue");
  });

  it("returns null for a future date beyond tomorrow", () => {
    expect(getDueDateStatus("2025-06-17", REF)).toBeNull();
    expect(getDueDateStatus("2025-12-31", REF)).toBeNull();
  });

  it("handles year boundaries correctly — overdue on Jan 1 when ref is Jan 2", () => {
    const jan2 = new Date("2025-01-02T08:00:00");
    expect(getDueDateStatus("2025-01-01", jan2)).toBe("overdue");
    expect(getDueDateStatus("2025-01-02", jan2)).toBe("today");
    expect(getDueDateStatus("2025-01-03", jan2)).toBe("tomorrow");
  });

  it("handles month boundaries correctly — overdue on Mar 31 when ref is Apr 1", () => {
    const apr1 = new Date("2025-04-01T08:00:00");
    expect(getDueDateStatus("2025-03-31", apr1)).toBe("overdue");
    expect(getDueDateStatus("2025-04-01", apr1)).toBe("today");
    expect(getDueDateStatus("2025-04-02", apr1)).toBe("tomorrow");
  });
});
