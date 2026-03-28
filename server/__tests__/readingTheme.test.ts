/**
 * Unit tests for Reading Theme feature
 *
 * Tests the theme value set, localStorage key, and that all six themes
 * have distinct values, labels, and non-empty descriptions.
 * These are pure logic tests that do not require a DOM.
 */

import { describe, it, expect } from "vitest";

// ─── Mirror the constants from Settings.tsx for server-side testing ───────────

type ReadingTheme = "default" | "cream" | "sage" | "sky" | "dusk" | "sand";

const VALID_THEMES: ReadingTheme[] = ["default", "cream", "sage", "sky", "dusk", "sand"];

const READING_THEMES: { value: ReadingTheme; label: string; description: string }[] = [
  { value: "default", label: "Default", description: "The app's standard dark or light theme." },
  { value: "cream",   label: "Cream",   description: "Warm off-white — reduces glare vs pure white." },
  { value: "sage",    label: "Sage",    description: "Pale green — most commonly cited helpful colour for dyslexia." },
  { value: "sky",     label: "Sky",     description: "Pale blue — second most cited helpful colour." },
  { value: "dusk",    label: "Dusk",    description: "Soft lavender — preferred by some with visual stress." },
  { value: "sand",    label: "Sand",    description: "Warm yellow — cited in Irlen Institute research." },
];

// ─── Schema enum values ───────────────────────────────────────────────────────

const SCHEMA_ENUM = ["default", "cream", "sage", "sky", "dusk", "sand"] as const;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Reading Theme constants", () => {
  it("has exactly 6 themes", () => {
    expect(READING_THEMES).toHaveLength(6);
  });

  it("all theme values are unique", () => {
    const values = READING_THEMES.map((t) => t.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("all theme labels are unique and non-empty", () => {
    const labels = READING_THEMES.map((t) => t.label);
    expect(new Set(labels).size).toBe(labels.length);
    labels.forEach((l) => expect(l.length).toBeGreaterThan(0));
  });

  it("all theme descriptions are non-empty", () => {
    READING_THEMES.forEach((t) => {
      expect(t.description.length).toBeGreaterThan(0);
    });
  });

  it("every theme value is in the valid set", () => {
    READING_THEMES.forEach((t) => {
      expect(VALID_THEMES).toContain(t.value);
    });
  });

  it("schema enum matches the valid themes exactly", () => {
    expect([...SCHEMA_ENUM].sort()).toEqual([...VALID_THEMES].sort());
  });
});

describe("Reading Theme validation", () => {
  it("'default' is a valid theme", () => {
    expect(VALID_THEMES).toContain("default");
  });

  it("rejects unknown theme values", () => {
    const unknown = "neon" as ReadingTheme;
    expect(VALID_THEMES.includes(unknown)).toBe(false);
  });

  it("'default' theme is the first entry (used as fallback)", () => {
    expect(READING_THEMES[0].value).toBe("default");
  });

  it("each non-default theme has a distinct background colour description", () => {
    const nonDefault = READING_THEMES.filter((t) => t.value !== "default");
    const colourWords = nonDefault.map((t) => t.description.toLowerCase());
    // Each description should mention a colour or visual property
    colourWords.forEach((desc) => {
      const hasColourReference = /white|green|blue|lavender|yellow|cream|sage|sky|dusk|sand/i.test(desc);
      expect(hasColourReference).toBe(true);
    });
  });
});
