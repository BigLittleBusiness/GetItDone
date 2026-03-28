/**
 * Tests for the worker job modules:
 *  - server/workers/streakReminder.ts
 *  - server/workers/dueDateReminder.ts
 *
 * The DB helpers and notification service are mocked so these tests run
 * without a database connection and without sending real notifications.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock the DB helpers ───────────────────────────────────────────────────

vi.mock("../../db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../db")>();
  return {
    ...actual,
    getUsersAtRiskOfLosingStreak: vi.fn(),
    getUsersWithTasksDueToday: vi.fn(),
  };
});

// ── Mock the notification helper ──────────────────────────────────────────

vi.mock("../../_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { getUsersAtRiskOfLosingStreak, getUsersWithTasksDueToday } from "../../db";
import { notifyOwner } from "../../_core/notification";
import { runStreakReminderJob } from "../../workers/streakReminder";
import { runDueDateReminderJob } from "../../workers/dueDateReminder";

const mockGetUsersAtRisk = vi.mocked(getUsersAtRiskOfLosingStreak);
const mockGetUsersWithDueTasks = vi.mocked(getUsersWithTasksDueToday);
const mockNotifyOwner = vi.mocked(notifyOwner);

beforeEach(() => {
  vi.clearAllMocks();
  mockNotifyOwner.mockResolvedValue(true);
});

// ── Streak Reminder ───────────────────────────────────────────────────────

describe("runStreakReminderJob", () => {
  it("does nothing when no users are at risk", async () => {
    mockGetUsersAtRisk.mockResolvedValue([]);

    await runStreakReminderJob(new Date("2025-01-01T14:00:00Z"));

    expect(mockNotifyOwner).not.toHaveBeenCalled();
  });

  it("does nothing when at-risk users are not in the current slot", async () => {
    // User's reminder is 09:00 UTC but current slot is 14:00 UTC
    mockGetUsersAtRisk.mockResolvedValue([
      {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        currentStreak: 5,
        timezone: "UTC",
        reminderTime: "09:00",
      } as any,
    ]);

    await runStreakReminderJob(new Date("2025-01-01T14:00:00Z"));

    expect(mockNotifyOwner).not.toHaveBeenCalled();
  });

  it("notifies owner when a user's reminder matches the current slot", async () => {
    // User's reminder is 14:00 UTC and current slot is 14:00 UTC
    mockGetUsersAtRisk.mockResolvedValue([
      {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        currentStreak: 5,
        timezone: "UTC",
        reminderTime: "14:00",
      } as any,
    ]);

    await runStreakReminderJob(new Date("2025-01-01T14:00:00Z"));

    expect(mockNotifyOwner).toHaveBeenCalledOnce();
    const [{ title, content }] = mockNotifyOwner.mock.calls[0];
    expect(title).toContain("1 streak at risk");
    expect(content).toContain("Alice");
    expect(content).toContain("5-day streak");
  });

  it("notifies owner for multiple matched users", async () => {
    mockGetUsersAtRisk.mockResolvedValue([
      { id: 1, name: "Alice", email: "a@x.com", currentStreak: 3, timezone: "UTC", reminderTime: "14:00" } as any,
      { id: 2, name: "Bob",   email: "b@x.com", currentStreak: 7, timezone: "UTC", reminderTime: "14:00" } as any,
    ]);

    await runStreakReminderJob(new Date("2025-01-01T14:00:00Z"));

    expect(mockNotifyOwner).toHaveBeenCalledOnce();
    const [{ title }] = mockNotifyOwner.mock.calls[0];
    expect(title).toContain("2 streaks at risk");
  });

  it("logs a warning but does not throw when notifyOwner fails", async () => {
    mockGetUsersAtRisk.mockResolvedValue([
      { id: 1, name: "Alice", email: "a@x.com", currentStreak: 3, timezone: "UTC", reminderTime: "14:00" } as any,
    ]);
    mockNotifyOwner.mockResolvedValue(false);

    await expect(runStreakReminderJob(new Date("2025-01-01T14:00:00Z"))).resolves.not.toThrow();
  });

  it("catches and logs DB errors without throwing", async () => {
    mockGetUsersAtRisk.mockRejectedValue(new Error("DB connection lost"));

    await expect(runStreakReminderJob(new Date("2025-01-01T14:00:00Z"))).resolves.not.toThrow();
    expect(mockNotifyOwner).not.toHaveBeenCalled();
  });
});

// ── Due-Date Reminder ─────────────────────────────────────────────────────

describe("runDueDateReminderJob", () => {
  it("does nothing when no users have tasks due today", async () => {
    mockGetUsersWithDueTasks.mockResolvedValue([]);

    await runDueDateReminderJob(new Date("2025-01-01T09:00:00Z"));

    expect(mockNotifyOwner).not.toHaveBeenCalled();
  });

  it("does nothing when matched users are not in the current slot", async () => {
    mockGetUsersWithDueTasks.mockResolvedValue([
      {
        user: { id: 1, name: "Alice", email: "a@x.com", timezone: "UTC", reminderTime: "09:00" } as any,
        dueTasks: [{ id: 10, title: "Write report" } as any],
      },
    ]);

    // Current slot is 14:00 UTC, user's reminder is 09:00 UTC — no match
    await runDueDateReminderJob(new Date("2025-01-01T14:00:00Z"));

    expect(mockNotifyOwner).not.toHaveBeenCalled();
  });

  it("notifies owner when a user's reminder matches the current slot", async () => {
    mockGetUsersWithDueTasks.mockResolvedValue([
      {
        user: { id: 1, name: "Alice", email: "a@x.com", timezone: "UTC", reminderTime: "09:00" } as any,
        dueTasks: [
          { id: 10, title: "Write report" } as any,
          { id: 11, title: "Send invoice" } as any,
        ],
      },
    ]);

    await runDueDateReminderJob(new Date("2025-01-01T09:00:00Z"));

    expect(mockNotifyOwner).toHaveBeenCalledOnce();
    const [{ title, content }] = mockNotifyOwner.mock.calls[0];
    expect(title).toContain("2 tasks due today");
    expect(content).toContain("Alice");
    expect(content).toContain("Write report");
    expect(content).toContain("Send invoice");
  });

  it("catches and logs DB errors without throwing", async () => {
    mockGetUsersWithDueTasks.mockRejectedValue(new Error("DB timeout"));

    await expect(runDueDateReminderJob(new Date("2025-01-01T09:00:00Z"))).resolves.not.toThrow();
    expect(mockNotifyOwner).not.toHaveBeenCalled();
  });
});
