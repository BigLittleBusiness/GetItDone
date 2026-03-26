import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin.login", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_PASSWORD", "super-secret-password-123");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns success when the correct password is provided", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const result = await caller.admin.login({ password: "super-secret-password-123" });
    expect(result).toEqual({ success: true });
  });

  it("throws UNAUTHORIZED when the password is wrong", async () => {
    const caller = appRouter.createCaller(createTestContext());
    await expect(
      caller.admin.login({ password: "wrong-password" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws when an empty string is submitted", async () => {
    const caller = appRouter.createCaller(createTestContext());
    await expect(
      caller.admin.login({ password: "" })
    ).rejects.toThrow();
  });

  it("throws INTERNAL_SERVER_ERROR when ADMIN_PASSWORD env var is not set", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    const caller = appRouter.createCaller(createTestContext());
    await expect(
      caller.admin.login({ password: "anything" })
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });

  it("is case-sensitive — wrong case is rejected", async () => {
    const caller = appRouter.createCaller(createTestContext());
    await expect(
      caller.admin.login({ password: "SUPER-SECRET-PASSWORD-123" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("admin.getSurveyResponses", () => {
  it("returns an array", async () => {
    const caller = appRouter.createCaller(createTestContext());
    const result = await caller.admin.getSurveyResponses();
    expect(Array.isArray(result)).toBe(true);
  });
});
