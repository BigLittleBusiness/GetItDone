import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// ─── Mock DB helpers ─────────────────────────────────────────────────────────

vi.mock("../db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../db")>();
  return {
    ...actual,
    getAllTasksForUser: vi.fn().mockResolvedValue([]),
    updateTask: vi.fn().mockResolvedValue(undefined),
    getUserById: vi.fn().mockResolvedValue(null),
    getAchievementsForUser: vi.fn().mockResolvedValue([]),
    unlockAchievement: vi.fn().mockResolvedValue(false),
  };
});

vi.mock("../_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import * as db from "../db";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function authedCtx(userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: "test-open-id",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "oauth",
      role: "user",
      onboardingComplete: true,
      activeRole: "professional",
      personalityMode: "positive",
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      readingTheme: "default",
      textSize: "medium",
      reminderTime: "14:00",
      timezone: "UTC",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── tasks.update tests ───────────────────────────────────────────────────────

describe("tasks.update", () => {
  it("calls updateTask with the correct id and fields", async () => {
    const caller = appRouter.createCaller(authedCtx());
    await caller.tasks.update({
      id: 42,
      title: "Updated title",
      notes: "Updated notes",
      priority: "high",
      energyRequired: "low",
      dueDate: "2026-12-31",
    });

    expect(db.updateTask).toHaveBeenCalledWith(
      42,
      1,
      expect.objectContaining({
        title: "Updated title",
        notes: "Updated notes",
        priority: "high",
        energyRequired: "low",
        dueDate: "2026-12-31",
      })
    );
  });

  it("returns { success: true } on a successful update", async () => {
    const caller = appRouter.createCaller(authedCtx());
    const result = await caller.tasks.update({ id: 1, title: "New title" });
    expect(result).toEqual({ success: true });
  });

  it("accepts a partial update with only title", async () => {
    const caller = appRouter.createCaller(authedCtx());
    await caller.tasks.update({ id: 5, title: "Only title changed" });
    expect(db.updateTask).toHaveBeenCalledWith(
      5,
      1,
      expect.objectContaining({ title: "Only title changed" })
    );
  });

  it("accepts a partial update with only priority", async () => {
    const caller = appRouter.createCaller(authedCtx());
    await caller.tasks.update({ id: 7, priority: "low" });
    expect(db.updateTask).toHaveBeenCalledWith(
      7,
      1,
      expect.objectContaining({ priority: "low" })
    );
  });

  it("accepts clearing the due date by passing an empty string", async () => {
    const caller = appRouter.createCaller(authedCtx());
    await caller.tasks.update({ id: 3, dueDate: "" });
    expect(db.updateTask).toHaveBeenCalledWith(
      3,
      1,
      expect.objectContaining({ dueDate: "" })
    );
  });

  it("rejects an empty title string", async () => {
    const caller = appRouter.createCaller(authedCtx());
    await expect(caller.tasks.update({ id: 1, title: "" })).rejects.toThrow();
  });

  it("rejects a title that exceeds 500 characters", async () => {
    const caller = appRouter.createCaller(authedCtx());
    await expect(
      caller.tasks.update({ id: 1, title: "x".repeat(501) })
    ).rejects.toThrow();
  });

  it("requires authentication — throws for unauthenticated callers", async () => {
    const unauthCtx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(unauthCtx);
    await expect(caller.tasks.update({ id: 1, title: "Sneaky" })).rejects.toThrow();
  });
});
