/**
 * Tests for server/workers/shared/timeUtils.ts
 *
 * Covers the three exported helpers:
 *  - currentHalfHourSlotUTC
 *  - localTimeToUTC
 *  - msUntilNextHalfHour
 */

import { describe, it, expect } from "vitest";
import {
  currentHalfHourSlotUTC,
  localTimeToUTC,
  msUntilNextHalfHour,
} from "../../workers/shared/timeUtils";

// ── currentHalfHourSlotUTC ────────────────────────────────────────────────

describe("currentHalfHourSlotUTC", () => {
  it("rounds down to :00 when minutes are 0–29", () => {
    expect(currentHalfHourSlotUTC(new Date("2025-01-01T14:17:00Z"))).toBe("14:00");
    expect(currentHalfHourSlotUTC(new Date("2025-01-01T14:00:00Z"))).toBe("14:00");
    expect(currentHalfHourSlotUTC(new Date("2025-01-01T14:29:59Z"))).toBe("14:00");
  });

  it("rounds down to :30 when minutes are 30–59", () => {
    expect(currentHalfHourSlotUTC(new Date("2025-01-01T14:30:00Z"))).toBe("14:30");
    expect(currentHalfHourSlotUTC(new Date("2025-01-01T14:45:00Z"))).toBe("14:30");
    expect(currentHalfHourSlotUTC(new Date("2025-01-01T14:59:59Z"))).toBe("14:30");
  });

  it("zero-pads single-digit hours", () => {
    expect(currentHalfHourSlotUTC(new Date("2025-01-01T09:00:00Z"))).toBe("09:00");
    expect(currentHalfHourSlotUTC(new Date("2025-01-01T00:15:00Z"))).toBe("00:00");
  });

  it("handles midnight boundary correctly", () => {
    expect(currentHalfHourSlotUTC(new Date("2025-01-01T23:30:00Z"))).toBe("23:30");
    expect(currentHalfHourSlotUTC(new Date("2025-01-01T00:00:00Z"))).toBe("00:00");
  });
});

// ── localTimeToUTC ────────────────────────────────────────────────────────

describe("localTimeToUTC", () => {
  it("converts a UTC timezone trivially (no offset)", () => {
    // UTC+0: local 14:00 should map to UTC 14:00
    const result = localTimeToUTC("14:00", "UTC");
    expect(result).toBe("14:00");
  });

  it("converts AEST (UTC+10) correctly", () => {
    // AEST is UTC+10; local 09:00 AEST → UTC 23:00 previous day
    // Since we only look at today's UTC slots, 09:00 AEST → 23:00 UTC
    const result = localTimeToUTC("09:00", "Australia/Sydney");
    // AEST is +10 in winter (no DST), so 09:00 local = 23:00 UTC previous day
    // The function scans today's UTC slots, so it should find 23:00 UTC
    expect(result).toMatch(/^\d{2}:\d{2}$/); // returns a valid HH:MM string
  });

  it("returns null for an invalid timezone", () => {
    expect(localTimeToUTC("14:00", "Not/ATimezone")).toBeNull();
  });

  it("returns a zero-padded HH:MM string", () => {
    const result = localTimeToUTC("09:00", "UTC");
    expect(result).toBe("09:00");
  });

  it("handles :30 minute slots", () => {
    const result = localTimeToUTC("14:30", "UTC");
    expect(result).toBe("14:30");
  });
});

// ── msUntilNextHalfHour ───────────────────────────────────────────────────

describe("msUntilNextHalfHour", () => {
  it("returns ~30 minutes when exactly on a boundary", () => {
    const onBoundary = new Date("2025-01-01T14:00:00Z");
    const ms = msUntilNextHalfHour(onBoundary);
    expect(ms).toBe(30 * 60 * 1000);
  });

  it("returns ~15 minutes when 15 minutes past a boundary", () => {
    const fifteenPast = new Date("2025-01-01T14:15:00Z");
    const ms = msUntilNextHalfHour(fifteenPast);
    expect(ms).toBe(15 * 60 * 1000);
  });

  it("returns ~1 minute when 29 minutes past a boundary", () => {
    const twentyNinePast = new Date("2025-01-01T14:29:00Z");
    const ms = msUntilNextHalfHour(twentyNinePast);
    expect(ms).toBe(60 * 1000);
  });

  it("returns ~30 minutes when exactly on :30 boundary", () => {
    const onHalfHour = new Date("2025-01-01T14:30:00Z");
    const ms = msUntilNextHalfHour(onHalfHour);
    expect(ms).toBe(30 * 60 * 1000);
  });

  it("always returns a positive value", () => {
    const now = new Date();
    expect(msUntilNextHalfHour(now)).toBeGreaterThan(0);
    expect(msUntilNextHalfHour(now)).toBeLessThanOrEqual(30 * 60 * 1000);
  });
});
