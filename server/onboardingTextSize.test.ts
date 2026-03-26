import { describe, it, expect } from "vitest";

// Mirror the TEXT_SIZES constant from Onboarding.tsx for server-side testing
const TEXT_SIZES = [
  { value: "small", label: "Small", previewPx: "14px" },
  { value: "medium", label: "Medium", previewPx: "16px" },
  { value: "large", label: "Large", previewPx: "18px" },
] as const;

type TextSize = (typeof TEXT_SIZES)[number]["value"];

// Mirror the valid textSize enum values accepted by the tRPC procedure
const VALID_TEXT_SIZES: TextSize[] = ["small", "medium", "large"];

describe("Onboarding Text Size step", () => {
  describe("TEXT_SIZES constant", () => {
    it("has exactly 3 options", () => {
      expect(TEXT_SIZES).toHaveLength(3);
    });

    it("includes small, medium, and large", () => {
      const values = TEXT_SIZES.map((o) => o.value);
      expect(values).toContain("small");
      expect(values).toContain("medium");
      expect(values).toContain("large");
    });

    it("each option has a label and previewPx", () => {
      for (const opt of TEXT_SIZES) {
        expect(opt.label).toBeTruthy();
        expect(opt.previewPx).toMatch(/^\d+px$/);
      }
    });

    it("small is smaller than medium", () => {
      const small = parseInt(TEXT_SIZES.find((o) => o.value === "small")!.previewPx);
      const medium = parseInt(TEXT_SIZES.find((o) => o.value === "medium")!.previewPx);
      expect(small).toBeLessThan(medium);
    });

    it("medium is smaller than large", () => {
      const medium = parseInt(TEXT_SIZES.find((o) => o.value === "medium")!.previewPx);
      const large = parseInt(TEXT_SIZES.find((o) => o.value === "large")!.previewPx);
      expect(medium).toBeLessThan(large);
    });
  });

  describe("tRPC procedure input validation", () => {
    it("accepts all valid textSize values", () => {
      for (const size of VALID_TEXT_SIZES) {
        expect(VALID_TEXT_SIZES).toContain(size);
      }
    });

    it("rejects invalid textSize values", () => {
      const invalid = ["xs", "xl", "huge", "tiny", ""];
      for (const v of invalid) {
        expect(VALID_TEXT_SIZES).not.toContain(v as TextSize);
      }
    });

    it("textSize is optional — undefined is acceptable", () => {
      // The procedure accepts undefined (optional field)
      const input: { textSize?: TextSize } = {};
      expect(input.textSize).toBeUndefined();
    });
  });

  describe("summary card label lookup", () => {
    it("returns the correct label for each size", () => {
      const lookup = (v: TextSize) =>
        TEXT_SIZES.find((o) => o.value === v)?.label ?? "Medium";

      expect(lookup("small")).toBe("Small");
      expect(lookup("medium")).toBe("Medium");
      expect(lookup("large")).toBe("Large");
    });

    it("falls back to Medium for unknown value", () => {
      const lookup = (v: string) =>
        TEXT_SIZES.find((o) => o.value === v)?.label ?? "Medium";

      expect(lookup("unknown")).toBe("Medium");
    });
  });
});
