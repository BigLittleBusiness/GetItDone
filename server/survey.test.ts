import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("survey.submit", () => {
  it("accepts valid survey responses", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.survey.submit({
      roleValidation: "spot-on",
      painPoint: "starting",
      featureFit: "body-double",
      email: "test@example.com",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts survey without email", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.survey.submit({
      roleValidation: "mostly",
      painPoint: "planning",
      featureFit: "shield",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects invalid role validation", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.survey.submit({
        roleValidation: "invalid" as any,
        painPoint: "starting",
        featureFit: "body-double",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid pain point", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.survey.submit({
        roleValidation: "spot-on",
        painPoint: "invalid" as any,
        featureFit: "body-double",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid feature fit", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.survey.submit({
        roleValidation: "spot-on",
        painPoint: "starting",
        featureFit: "invalid" as any,
      })
    ).rejects.toThrow();
  });

  it("accepts email-only submission (CTA waitlist form)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // The bottom CTA form submits only an email address with no survey answers
    const result = await caller.survey.submit({
      email: "waitlist@example.com",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects invalid email format", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.survey.submit({
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });
});

describe("survey.getAll", () => {
  it("returns an array of survey responses", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.survey.getAll();

    expect(Array.isArray(result)).toBe(true);
    // Each response should have the expected structure
    if (result.length > 0) {
      const firstResponse = result[0];
      expect(firstResponse).toHaveProperty("id");
      expect(firstResponse).toHaveProperty("roleValidation");
      expect(firstResponse).toHaveProperty("painPoint");
      expect(firstResponse).toHaveProperty("featureFit");
      expect(firstResponse).toHaveProperty("createdAt");
    }
  });
});
