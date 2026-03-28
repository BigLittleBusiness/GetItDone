/**
 * Tests for the DB-backed admin rate limiter.
 *
 * The DB helpers (getSetting / setSetting / deleteSetting) are mocked so the
 * tests remain fast and self-contained without a real database connection.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  recordFailedAttempt,
  clearAttempts,
  isLockedOut,
  MAX_ATTEMPTS,
  WINDOW_MS,
  LOCKOUT_MS,
} from "../adminRateLimiter";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// ─── Mock the DB helpers ─────────────────────────────────────────────────────

// In-memory store that simulates the app_settings table for tests.
const fakeDb = new Map<string, string>();

vi.mock("../db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../db")>();
  return {
    ...actual,
    getSetting: vi.fn(async (key: string) => fakeDb.get(key) ?? null),
    setSetting: vi.fn(async (key: string, value: string) => { fakeDb.set(key, value); }),
    deleteSetting: vi.fn(async (key: string) => { fakeDb.delete(key); }),
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function freshCtx(ip = "1.2.3.4"): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": ip },
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  fakeDb.clear();
  vi.stubEnv("ADMIN_PASSWORD", "correct-password");
});

// ─── Unit tests: rate limiter module ─────────────────────────────────────────

describe("adminRateLimiter — recordFailedAttempt", () => {
  it("allows attempts below the threshold", async () => {
    for (let i = 1; i < MAX_ATTEMPTS; i++) {
      const result = await recordFailedAttempt("10.0.0.1");
      expect(result.allowed).toBe(true);
      expect(result.attemptsLeft).toBe(MAX_ATTEMPTS - i);
    }
  });

  it("locks out on the MAX_ATTEMPTS-th failure", async () => {
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) await recordFailedAttempt("10.0.0.2");
    const result = await recordFailedAttempt("10.0.0.2");
    expect(result.allowed).toBe(false);
    expect(result.attemptsLeft).toBe(0);
    expect(result.lockedUntil).toBeGreaterThan(Date.now());
  });

  it("keeps rejecting while locked out", async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) await recordFailedAttempt("10.0.0.3");
    const result = await recordFailedAttempt("10.0.0.3");
    expect(result.allowed).toBe(false);
  });

  it("resets the counter after the window expires", async () => {
    const now = Date.now();
    // Record failures just inside the window
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
      await recordFailedAttempt("10.0.0.4", now);
    }
    // Simulate time advancing past the window
    const afterWindow = now + WINDOW_MS + 1;
    const result = await recordFailedAttempt("10.0.0.4", afterWindow);
    expect(result.allowed).toBe(true);
    expect(result.attemptsLeft).toBe(MAX_ATTEMPTS - 1);
  });

  it("tracks different IPs independently", async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) await recordFailedAttempt("192.168.1.1");
    const otherResult = await recordFailedAttempt("192.168.1.2");
    expect(otherResult.allowed).toBe(true);
  });
});

describe("adminRateLimiter — clearAttempts", () => {
  it("clears the counter so the IP can log in again", async () => {
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) await recordFailedAttempt("10.0.0.5");
    await clearAttempts("10.0.0.5");
    const result = await recordFailedAttempt("10.0.0.5");
    expect(result.allowed).toBe(true);
    expect(result.attemptsLeft).toBe(MAX_ATTEMPTS - 1);
  });
});

describe("adminRateLimiter — isLockedOut", () => {
  it("returns locked:false for a fresh IP", async () => {
    expect(await isLockedOut("10.0.0.6")).toEqual({ locked: false, lockedUntil: null });
  });

  it("returns locked:true after MAX_ATTEMPTS failures", async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) await recordFailedAttempt("10.0.0.7");
    const { locked, lockedUntil } = await isLockedOut("10.0.0.7");
    expect(locked).toBe(true);
    expect(lockedUntil).toBeGreaterThan(Date.now());
  });

  it("returns locked:false after the lockout expires", async () => {
    const now = Date.now();
    for (let i = 0; i < MAX_ATTEMPTS; i++) await recordFailedAttempt("10.0.0.8", now);
    const afterLockout = now + LOCKOUT_MS + 1;
    expect(await isLockedOut("10.0.0.8", afterLockout)).toEqual({ locked: false, lockedUntil: null });
  });
});

// ─── Integration tests: admin.login tRPC procedure ───────────────────────────

describe("admin.login — rate limiting integration", () => {
  it("returns success and clears the counter on correct password", async () => {
    const caller = appRouter.createCaller(freshCtx());
    // Burn some attempts first
    for (let i = 0; i < 2; i++) {
      await expect(caller.admin.login({ password: "wrong" })).rejects.toThrow();
    }
    const result = await caller.admin.login({ password: "correct-password" });
    expect(result).toEqual({ success: true });
    // Counter should be cleared
    expect((await isLockedOut("1.2.3.4")).locked).toBe(false);
  });

  it("throws UNAUTHORIZED with remaining-attempts hint on wrong password", async () => {
    const caller = appRouter.createCaller(freshCtx("2.2.2.2"));
    const err = await caller.admin.login({ password: "wrong" }).catch(e => e);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toMatch(/attempt/i);
  });

  it("throws TOO_MANY_REQUESTS after MAX_ATTEMPTS failures", async () => {
    const caller = appRouter.createCaller(freshCtx("3.3.3.3"));
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await caller.admin.login({ password: "wrong" }).catch(() => {});
    }
    const err = await caller.admin.login({ password: "wrong" }).catch(e => e);
    expect(err.code).toBe("TOO_MANY_REQUESTS");
    expect(err.message).toMatch(/too many/i);
  });

  it("blocks even the correct password while locked out", async () => {
    const caller = appRouter.createCaller(freshCtx("4.4.4.4"));
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await caller.admin.login({ password: "wrong" }).catch(() => {});
    }
    const err = await caller.admin.login({ password: "correct-password" }).catch(e => e);
    expect(err.code).toBe("TOO_MANY_REQUESTS");
  });
});
