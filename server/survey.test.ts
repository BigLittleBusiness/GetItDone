import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// Mock notifyOwner before importing the router so the spy is in place
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock verifyAdminSession so adminProcedure passes in tests that need it
vi.mock("./_core/adminSession", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./_core/adminSession")>();
  return { ...actual, verifyAdminSession: vi.fn(async () => false) };
});

import { appRouter } from "./routers";
import * as notificationModule from "./_core/notification";

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

beforeEach(() => {
  vi.clearAllMocks();
});

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
  it("returns an array of survey responses when called with an admin session", async () => {
    const { verifyAdminSession } = await import("./_core/adminSession");
    (verifyAdminSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);

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

describe("survey.submit — owner notification", () => {
  it("calls notifyOwner after a successful submission", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await caller.survey.submit({
      email: "notify-test@example.com",
      roleValidation: "spot-on",
      painPoint: "starting",
      featureFit: "cheerleader",
    });

    // Allow the fire-and-forget promise to settle
    await new Promise(r => setTimeout(r, 50));

    expect(notificationModule.notifyOwner).toHaveBeenCalledOnce();
    const call = (notificationModule.notifyOwner as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.title).toContain('waitlist signup');
    expect(call.content).toContain('notify-test@example.com');
  });

  it("still returns success even when notifyOwner fails", async () => {
    // Simulate the notification service being unavailable
    (notificationModule.notifyOwner as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Service unavailable')
    );

    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.survey.submit({
      email: "resilience@example.com",
    });

    // The user's submission must succeed regardless of notification failure
    expect(result).toEqual({ success: true });
  });
});
