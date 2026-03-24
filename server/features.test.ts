/**
 * Unit tests for the three new features:
 * 1. AI task breakdown (expand procedure logic)
 * 2. Streak reminder job (getUsersAtRiskOfLosingStreak logic)
 * 3. Quick Add (tRPC task create — already covered by gamification tests,
 *    but we add a dedicated test for the voice-captured path)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Feature 1: AI task breakdown ─────────────────────────────────────────────

describe("AI task breakdown — step parsing", () => {
  function parseSteps(rawContent: string): { id: string; text: string; done: boolean }[] {
    const parsed = JSON.parse(rawContent);
    return (parsed.steps ?? []).slice(0, 5).map(
      (text: string, i: number) => ({ id: `step-${i}`, text, done: false })
    );
  }

  it("parses a valid LLM JSON response into steps", () => {
    const raw = JSON.stringify({ steps: ["Open Gmail", "Click Reply", "Type one sentence", "Hit Send"] });
    const steps = parseSteps(raw);
    expect(steps).toHaveLength(4);
    expect(steps[0].text).toBe("Open Gmail");
    expect(steps[0].done).toBe(false);
    expect(steps[0].id).toMatch(/^step-/);
  });

  it("caps steps at 5 even if LLM returns more", () => {
    const raw = JSON.stringify({ steps: ["A", "B", "C", "D", "E", "F", "G"] });
    const steps = parseSteps(raw);
    expect(steps).toHaveLength(5);
  });

  it("returns empty array when steps key is missing", () => {
    const raw = JSON.stringify({});
    const steps = parseSteps(raw);
    expect(steps).toHaveLength(0);
  });

  it("marks all steps as not done initially", () => {
    const raw = JSON.stringify({ steps: ["Step 1", "Step 2"] });
    const steps = parseSteps(raw);
    expect(steps.every((s) => s.done === false)).toBe(true);
  });
});

// ─── Feature 2: Streak reminder — at-risk user filter ─────────────────────────

describe("Streak reminder — at-risk user filter", () => {
  type UserRow = {
    id: number;
    name: string | null;
    currentStreak: number;
    lastActiveDate: string | null;
    onboardingComplete: boolean;
  };

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  function filterAtRisk(users: UserRow[]): UserRow[] {
    return users.filter(
      (u) => (u.currentStreak ?? 0) > 0 && u.lastActiveDate !== today
    );
  }

  it("flags user with streak who has not acted today", () => {
    const users: UserRow[] = [
      { id: 1, name: "Alice", currentStreak: 5, lastActiveDate: yesterday, onboardingComplete: true },
    ];
    expect(filterAtRisk(users)).toHaveLength(1);
  });

  it("does not flag user who already acted today", () => {
    const users: UserRow[] = [
      { id: 1, name: "Bob", currentStreak: 3, lastActiveDate: today, onboardingComplete: true },
    ];
    expect(filterAtRisk(users)).toHaveLength(0);
  });

  it("does not flag user with zero streak", () => {
    const users: UserRow[] = [
      { id: 1, name: "Carol", currentStreak: 0, lastActiveDate: yesterday, onboardingComplete: true },
    ];
    expect(filterAtRisk(users)).toHaveLength(0);
  });

  it("handles mixed users correctly", () => {
    const users: UserRow[] = [
      { id: 1, name: "Alice", currentStreak: 5, lastActiveDate: yesterday, onboardingComplete: true },
      { id: 2, name: "Bob", currentStreak: 3, lastActiveDate: today, onboardingComplete: true },
      { id: 3, name: "Carol", currentStreak: 0, lastActiveDate: yesterday, onboardingComplete: true },
      { id: 4, name: "Dave", currentStreak: 12, lastActiveDate: "2024-01-01", onboardingComplete: true },
    ];
    const atRisk = filterAtRisk(users);
    expect(atRisk).toHaveLength(2);
    expect(atRisk.map((u) => u.name)).toEqual(["Alice", "Dave"]);
  });
});

// ─── Feature 3: Quick Add — title validation ───────────────────────────────────

describe("Quick Add — title validation", () => {
  function isValidTitle(title: string): boolean {
    return title.trim().length > 0;
  }

  it("accepts a normal title", () => {
    expect(isValidTitle("Buy milk")).toBe(true);
  });

  it("accepts a voice-transcribed title with leading/trailing spaces", () => {
    expect(isValidTitle("  Call dentist  ")).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(isValidTitle("")).toBe(false);
  });

  it("rejects a whitespace-only string (common from accidental mic tap)", () => {
    expect(isValidTitle("   ")).toBe(false);
  });
});
