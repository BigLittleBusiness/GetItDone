/**
 * Unit tests for the urgency sort weight and isDueThisWeek helpers
 * introduced in Dashboard.tsx.
 *
 * The pure logic is duplicated here so tests run without importing React.
 */
import { describe, it, expect } from "vitest";

// ─── Inline helpers (mirrors Dashboard.tsx logic) ────────────────────────────

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

interface Task {
  status: string;
  dueDate?: string | null;
}

function urgencyWeight(task: Task, now: Date = new Date()): number {
  if (task.status === "done") return 5;
  const status = getDueDateStatus(task.dueDate, now);
  if (status === "overdue") return 0;
  if (status === "today") return 1;
  if (status === "tomorrow") return 2;
  if (task.dueDate) {
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    const weekEnd = fmt(new Date(now.getTime() + 7 * 86_400_000));
    if (task.dueDate <= weekEnd) return 3;
    return 4;
  }
  return 4;
}

function isDueThisWeek(task: Task, now: Date = new Date()): boolean {
  if (!task.dueDate || task.status === "done") return false;
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  const today = fmt(now);
  const weekEnd = fmt(new Date(now.getTime() + 7 * 86_400_000));
  return task.dueDate >= today && task.dueDate <= weekEnd;
}

// ─── Reference date for deterministic tests ───────────────────────────────────
const REF = new Date("2025-06-15T10:00:00");
const TODAY = "2025-06-15";
const TOMORROW = "2025-06-16";
const IN_3_DAYS = "2025-06-18";
const IN_7_DAYS = "2025-06-22";
const IN_8_DAYS = "2025-06-23";
const YESTERDAY = "2025-06-14";
const LAST_WEEK = "2025-06-08";

// ─── urgencyWeight tests ──────────────────────────────────────────────────────

describe("urgencyWeight", () => {
  it("gives done tasks the highest weight (5)", () => {
    expect(urgencyWeight({ status: "done", dueDate: TODAY }, REF)).toBe(5);
    expect(urgencyWeight({ status: "done", dueDate: YESTERDAY }, REF)).toBe(5);
  });

  it("gives overdue tasks weight 0 (highest urgency)", () => {
    expect(urgencyWeight({ status: "todo", dueDate: YESTERDAY }, REF)).toBe(0);
    expect(urgencyWeight({ status: "todo", dueDate: LAST_WEEK }, REF)).toBe(0);
  });

  it("gives due-today tasks weight 1", () => {
    expect(urgencyWeight({ status: "todo", dueDate: TODAY }, REF)).toBe(1);
  });

  it("gives due-tomorrow tasks weight 2", () => {
    expect(urgencyWeight({ status: "todo", dueDate: TOMORROW }, REF)).toBe(2);
  });

  it("gives tasks due within 7 days (but not today/tomorrow) weight 3", () => {
    expect(urgencyWeight({ status: "todo", dueDate: IN_3_DAYS }, REF)).toBe(3);
    expect(urgencyWeight({ status: "todo", dueDate: IN_7_DAYS }, REF)).toBe(3);
  });

  it("gives tasks due beyond 7 days weight 4", () => {
    expect(urgencyWeight({ status: "todo", dueDate: IN_8_DAYS }, REF)).toBe(4);
  });

  it("gives tasks with no due date weight 4", () => {
    expect(urgencyWeight({ status: "todo", dueDate: null }, REF)).toBe(4);
    expect(urgencyWeight({ status: "todo", dueDate: undefined }, REF)).toBe(4);
  });

  it("sorts a mixed list correctly by urgency weight", () => {
    const tasks: Task[] = [
      { status: "todo", dueDate: IN_3_DAYS },   // weight 3
      { status: "done", dueDate: TODAY },         // weight 5
      { status: "todo", dueDate: null },           // weight 4
      { status: "todo", dueDate: YESTERDAY },     // weight 0
      { status: "todo", dueDate: TOMORROW },      // weight 2
      { status: "todo", dueDate: TODAY },          // weight 1
    ];
    const sorted = [...tasks].sort(
      (a, b) => urgencyWeight(a, REF) - urgencyWeight(b, REF)
    );
    expect(sorted[0].dueDate).toBe(YESTERDAY);   // overdue first
    expect(sorted[1].dueDate).toBe(TODAY);        // today (not done)
    expect(sorted[2].dueDate).toBe(TOMORROW);
    expect(sorted[3].dueDate).toBe(IN_3_DAYS);
    // weight-4 items (no date) and weight-5 (done) at the end
    expect(urgencyWeight(sorted[4], REF)).toBe(4);
    expect(urgencyWeight(sorted[5], REF)).toBe(5);
  });
});

// ─── isDueThisWeek tests ──────────────────────────────────────────────────────

describe("isDueThisWeek", () => {
  it("returns true for a task due today", () => {
    expect(isDueThisWeek({ status: "todo", dueDate: TODAY }, REF)).toBe(true);
  });

  it("returns true for a task due tomorrow", () => {
    expect(isDueThisWeek({ status: "todo", dueDate: TOMORROW }, REF)).toBe(true);
  });

  it("returns true for a task due in 3 days", () => {
    expect(isDueThisWeek({ status: "todo", dueDate: IN_3_DAYS }, REF)).toBe(true);
  });

  it("returns true for a task due exactly 7 days from now", () => {
    expect(isDueThisWeek({ status: "todo", dueDate: IN_7_DAYS }, REF)).toBe(true);
  });

  it("returns false for a task due 8+ days from now", () => {
    expect(isDueThisWeek({ status: "todo", dueDate: IN_8_DAYS }, REF)).toBe(false);
  });

  it("returns false for an overdue task (past due date)", () => {
    expect(isDueThisWeek({ status: "todo", dueDate: YESTERDAY }, REF)).toBe(false);
  });

  it("returns false for a done task even if due this week", () => {
    expect(isDueThisWeek({ status: "done", dueDate: TODAY }, REF)).toBe(false);
    expect(isDueThisWeek({ status: "done", dueDate: TOMORROW }, REF)).toBe(false);
  });

  it("returns false for a task with no due date", () => {
    expect(isDueThisWeek({ status: "todo", dueDate: null }, REF)).toBe(false);
    expect(isDueThisWeek({ status: "todo", dueDate: undefined }, REF)).toBe(false);
  });
});
