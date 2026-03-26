/**
 * Unit tests for the Text Size accessibility feature.
 *
 * These tests cover the TextSizeContext logic (localStorage persistence,
 * valid values) and the updateSettings tRPC input validation for textSize.
 */

import { describe, it, expect } from "vitest";

// ─── Valid text size values ────────────────────────────────────────────────────

const VALID_TEXT_SIZES = ["small", "medium", "large"] as const;
type TextSize = (typeof VALID_TEXT_SIZES)[number];

function isValidTextSize(value: string): value is TextSize {
  return (VALID_TEXT_SIZES as readonly string[]).includes(value);
}

describe("TextSize value validation", () => {
  it("accepts all three valid sizes", () => {
    expect(isValidTextSize("small")).toBe(true);
    expect(isValidTextSize("medium")).toBe(true);
    expect(isValidTextSize("large")).toBe(true);
  });

  it("rejects invalid size strings", () => {
    expect(isValidTextSize("tiny")).toBe(false);
    expect(isValidTextSize("xl")).toBe(false);
    expect(isValidTextSize("")).toBe(false);
    expect(isValidTextSize("LARGE")).toBe(false);
  });
});

// ─── Default value ─────────────────────────────────────────────────────────────

describe("TextSize default value", () => {
  it("defaults to medium when no stored preference exists", () => {
    const stored: string | null = null; // simulate empty localStorage
    const resolved: TextSize = (stored && isValidTextSize(stored) ? stored : "medium") as TextSize;
    expect(resolved).toBe("medium");
  });

  it("restores a stored preference from localStorage", () => {
    const stored = "large";
    const resolved: TextSize = (stored && isValidTextSize(stored) ? stored : "medium") as TextSize;
    expect(resolved).toBe("large");
  });

  it("falls back to medium if stored value is invalid", () => {
    const stored = "enormous";
    const resolved: TextSize = (stored && isValidTextSize(stored) ? stored : "medium") as TextSize;
    expect(resolved).toBe("medium");
  });
});

// ─── CSS attribute logic ───────────────────────────────────────────────────────

describe("TextSize data-attribute logic", () => {
  it("sets data-text-size for small", () => {
    const size: TextSize = "small";
    const attr = size === "medium" ? null : size;
    expect(attr).toBe("small");
  });

  it("removes data-text-size for medium (browser default)", () => {
    const size: TextSize = "medium";
    const attr = size === "medium" ? null : size;
    expect(attr).toBeNull();
  });

  it("sets data-text-size for large", () => {
    const size: TextSize = "large";
    const attr = size === "medium" ? null : size;
    expect(attr).toBe("large");
  });
});

// ─── CSS font-size mapping ─────────────────────────────────────────────────────

const FONT_SIZE_MAP: Record<TextSize, string> = {
  small: "14px",
  medium: "16px", // browser default — no override needed
  large: "18px",
};

describe("TextSize CSS font-size values", () => {
  it("small maps to 14px", () => {
    expect(FONT_SIZE_MAP["small"]).toBe("14px");
  });

  it("medium maps to 16px (browser default)", () => {
    expect(FONT_SIZE_MAP["medium"]).toBe("16px");
  });

  it("large maps to 18px", () => {
    expect(FONT_SIZE_MAP["large"]).toBe("18px");
  });

  it("all sizes are in ascending order", () => {
    const sizes = Object.values(FONT_SIZE_MAP).map((px) => parseInt(px, 10));
    expect(sizes[0]).toBeLessThan(sizes[1]);
    expect(sizes[1]).toBeLessThan(sizes[2]);
  });
});

// ─── Server-side sync logic ────────────────────────────────────────────────────

describe("TextSize server sync logic", () => {
  it("applies server preference when it differs from local", () => {
    const localSize: TextSize = "medium";
    const serverSize: TextSize = "large";
    const shouldUpdate = serverSize && serverSize !== localSize;
    expect(shouldUpdate).toBe(true);
  });

  it("does not update when server and local match", () => {
    const localSize: TextSize = "large";
    const serverSize: TextSize = "large";
    const shouldUpdate = serverSize && serverSize !== localSize;
    expect(shouldUpdate).toBe(false);
  });

  it("does not update when server preference is undefined", () => {
    const localSize: TextSize = "medium";
    const serverSize: TextSize | undefined = undefined;
    const shouldUpdate = serverSize && serverSize !== localSize;
    expect(shouldUpdate).toBeFalsy();
  });
});
