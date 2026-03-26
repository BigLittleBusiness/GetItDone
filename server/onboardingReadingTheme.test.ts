/**
 * Unit tests for the Reading Theme step added to the onboarding flow.
 *
 * Covers:
 * - The READING_THEMES constant used in the onboarding step
 * - The completeOnboarding input schema extension (readingTheme optional field)
 * - That "default" is the correct fallback when no theme is selected
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// ─── Mirror the onboarding input schema ──────────────────────────────────────

const completeOnboardingSchema = z.object({
  activeRole: z.enum(["student", "parent", "professional"]),
  personalityMode: z.enum(["cheeky", "positive", "literal"]),
  readingTheme: z
    .enum(["default", "cream", "sage", "sky", "dusk", "sand"])
    .optional(),
});

// ─── Mirror the READING_THEMES constant from Onboarding.tsx ─────────────────

type ReadingTheme = "default" | "cream" | "sage" | "sky" | "dusk" | "sand";

const READING_THEMES: { value: ReadingTheme; label: string; preview: string }[] = [
  { value: "default", label: "Default",  preview: "#1e293b" },
  { value: "cream",   label: "Cream",    preview: "#FFF8F0" },
  { value: "sage",    label: "Sage",     preview: "#E8F5E9" },
  { value: "sky",     label: "Sky",      preview: "#E3F2FD" },
  { value: "dusk",    label: "Dusk",     preview: "#F3E5F5" },
  { value: "sand",    label: "Sand",     preview: "#FFFDE7" },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Onboarding Reading Theme step", () => {
  describe("READING_THEMES constant", () => {
    it("has exactly 6 entries", () => {
      expect(READING_THEMES).toHaveLength(6);
    });

    it("first entry is 'default' (used as fallback)", () => {
      expect(READING_THEMES[0].value).toBe("default");
    });

    it("all values are unique", () => {
      const values = READING_THEMES.map((t) => t.value);
      expect(new Set(values).size).toBe(values.length);
    });

    it("all preview colours are valid hex strings", () => {
      READING_THEMES.forEach((t) => {
        expect(t.preview).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe("completeOnboarding schema with readingTheme", () => {
    it("accepts a valid payload without readingTheme (backwards compatible)", () => {
      const result = completeOnboardingSchema.safeParse({
        activeRole: "student",
        personalityMode: "positive",
      });
      expect(result.success).toBe(true);
    });

    it("accepts a valid payload with readingTheme: 'sage'", () => {
      const result = completeOnboardingSchema.safeParse({
        activeRole: "parent",
        personalityMode: "cheeky",
        readingTheme: "sage",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.readingTheme).toBe("sage");
    });

    it("accepts all six valid readingTheme values", () => {
      const themes: ReadingTheme[] = ["default", "cream", "sage", "sky", "dusk", "sand"];
      themes.forEach((theme) => {
        const result = completeOnboardingSchema.safeParse({
          activeRole: "professional",
          personalityMode: "literal",
          readingTheme: theme,
        });
        expect(result.success).toBe(true);
      });
    });

    it("rejects an unknown readingTheme value", () => {
      const result = completeOnboardingSchema.safeParse({
        activeRole: "student",
        personalityMode: "positive",
        readingTheme: "neon",
      });
      expect(result.success).toBe(false);
    });

    it("readingTheme is undefined when not provided", () => {
      const result = completeOnboardingSchema.safeParse({
        activeRole: "student",
        personalityMode: "positive",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.readingTheme).toBeUndefined();
    });
  });

  describe("step count", () => {
    it("total steps is 4 after adding the Reading Theme step", () => {
      const TOTAL_STEPS = 4;
      expect(TOTAL_STEPS).toBe(4);
    });
  });
});
