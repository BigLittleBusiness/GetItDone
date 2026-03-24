import { describe, it, expect } from "vitest";

// ─── Pure functions extracted for testing ─────────────────────────────────────

function xpForLevel(level: number): number {
  return level * 100;
}

function computeLevel(xp: number): number {
  let level = 1;
  let threshold = 0;
  while (xp >= threshold + xpForLevel(level)) {
    threshold += xpForLevel(level);
    level++;
  }
  return level;
}

function xpProgress(xp: number, level: number): number {
  let threshold = 0;
  for (let l = 1; l < level; l++) threshold += xpForLevel(l);
  const needed = xpForLevel(level);
  const current = xp - threshold;
  return Math.min((current / needed) * 100, 100);
}

function computeStreak(
  lastActiveDate: string | null | undefined,
  currentStreak: number
): number {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (lastActiveDate === today) return currentStreak;
  if (lastActiveDate === yesterday) return currentStreak + 1;
  return 1; // streak broken
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("computeLevel", () => {
  it("starts at level 1 with 0 XP", () => {
    expect(computeLevel(0)).toBe(1);
  });

  it("stays at level 1 until 100 XP", () => {
    expect(computeLevel(99)).toBe(1);
  });

  it("reaches level 2 at exactly 100 XP", () => {
    expect(computeLevel(100)).toBe(2);
  });

  it("reaches level 3 at 300 XP (100+200)", () => {
    expect(computeLevel(300)).toBe(3);
  });

  it("handles large XP values", () => {
    expect(computeLevel(10000)).toBeGreaterThan(10);
  });
});

describe("xpForLevel", () => {
  it("returns 100 for level 1", () => {
    expect(xpForLevel(1)).toBe(100);
  });

  it("returns 200 for level 2", () => {
    expect(xpForLevel(2)).toBe(200);
  });

  it("scales linearly", () => {
    expect(xpForLevel(5)).toBe(500);
  });
});

describe("xpProgress", () => {
  it("returns 0% at the start of level 1", () => {
    expect(xpProgress(0, 1)).toBe(0);
  });

  it("returns 50% at 50 XP in level 1", () => {
    expect(xpProgress(50, 1)).toBe(50);
  });

  it("returns 100% at exactly level threshold", () => {
    expect(xpProgress(100, 1)).toBe(100);
  });

  it("returns 0% at start of level 2 (100 XP)", () => {
    expect(xpProgress(100, 2)).toBe(0);
  });

  it("caps at 100%", () => {
    expect(xpProgress(200, 1)).toBe(100);
  });
});

describe("computeStreak", () => {
  it("returns 1 for a new user with no previous activity", () => {
    expect(computeStreak(null, 0)).toBe(1);
  });

  it("increments streak when last active was yesterday", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    expect(computeStreak(yesterday, 5)).toBe(6);
  });

  it("keeps streak the same when already active today", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(computeStreak(today, 5)).toBe(5);
  });

  it("resets streak to 1 when last active was 2+ days ago", () => {
    expect(computeStreak("2020-01-01", 10)).toBe(1);
  });
});

describe("task XP rewards", () => {
  it("assigns correct XP based on priority", () => {
    const getXp = (priority: string) =>
      priority === "high" ? 20 : priority === "medium" ? 10 : 5;
    expect(getXp("high")).toBe(20);
    expect(getXp("medium")).toBe(10);
    expect(getXp("low")).toBe(5);
  });
});
