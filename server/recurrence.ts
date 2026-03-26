/**
 * Recurrence helpers — ADHD-first design principles:
 *
 * 1. "after_completion" trigger: next instance only appears once the current one is marked done.
 *    This prevents pile-up anxiety from seeing 7 overdue "take medication" entries.
 *
 * 2. Silent roll-forward: missed tasks are never shown as multiple overdue items.
 *    The next due date is always computed from TODAY (or the completion date), not from the
 *    original missed date, so the user always sees exactly one upcoming instance.
 *
 * 3. Standard options: daily, specific days of the week, weekly, monthly.
 */

export type RecurrenceType = "daily" | "weekly" | "monthly" | "days_of_week" | "after_completion";

/**
 * Compute the next due date (YYYY-MM-DD) for a recurring task.
 *
 * @param recurrenceType  The recurrence pattern
 * @param recurrenceDays  Comma-separated day numbers (0=Sun..6=Sat) — only for days_of_week
 * @param fromDate        The reference date to compute from (today or completion date)
 * @returns               Next due date as YYYY-MM-DD string, or null if it cannot be computed
 */
export function computeNextDueDate(
  recurrenceType: RecurrenceType,
  recurrenceDays: string | null | undefined,
  fromDate: Date = new Date()
): string | null {
  const base = new Date(fromDate);
  base.setHours(0, 0, 0, 0);

  switch (recurrenceType) {
    case "daily":
    case "after_completion": {
      const next = new Date(base);
      next.setDate(next.getDate() + 1);
      return toDateString(next);
    }

    case "weekly": {
      const next = new Date(base);
      next.setDate(next.getDate() + 7);
      return toDateString(next);
    }

    case "monthly": {
      const next = new Date(base);
      next.setMonth(next.getMonth() + 1);
      return toDateString(next);
    }

    case "days_of_week": {
      if (!recurrenceDays) return null;
      const days = recurrenceDays
        .split(",")
        .map(d => parseInt(d.trim(), 10))
        .filter(d => d >= 0 && d <= 6)
        .sort((a, b) => a - b);
      if (days.length === 0) return null;

      // Find the next occurrence after today
      const todayDay = base.getDay();
      // Look for the next day number strictly after today's day number
      const nextDay = days.find(d => d > todayDay) ?? days[0];
      const daysUntilNext =
        nextDay > todayDay ? nextDay - todayDay : 7 - todayDay + nextDay;

      const next = new Date(base);
      next.setDate(next.getDate() + daysUntilNext);
      return toDateString(next);
    }

    default:
      return null;
  }
}

/**
 * Format a Date as YYYY-MM-DD.
 */
export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Build the data for a new task instance spawned from a recurring parent.
 * The new instance is a fresh "todo" task with the same content but a new due date.
 * The parentTaskId links it back to the template for reference.
 */
export function buildNextTaskInstance(
  parent: {
    userId: number;
    title: string;
    notes?: string | null;
    roleContext: "student" | "parent" | "professional" | "all";
    priority: "low" | "medium" | "high";
    energyRequired: "low" | "medium" | "high";
    dueTime?: string | null;
    xpReward: number;
    recurrenceType: RecurrenceType;
    recurrenceDays?: string | null;
    id: number;
  },
  fromDate: Date = new Date()
) {
  const nextDueDate = computeNextDueDate(
    parent.recurrenceType,
    parent.recurrenceDays,
    fromDate
  );

  return {
    userId: parent.userId,
    title: parent.title,
    notes: parent.notes ?? undefined,
    roleContext: parent.roleContext,
    priority: parent.priority,
    energyRequired: parent.energyRequired,
    dueDate: nextDueDate ?? undefined,
    dueTime: parent.dueTime ?? undefined,
    xpReward: parent.xpReward,
    recurrenceType: parent.recurrenceType,
    recurrenceDays: parent.recurrenceDays ?? undefined,
    parentTaskId: parent.id,
    steps: [],
    status: "todo" as const,
  };
}
