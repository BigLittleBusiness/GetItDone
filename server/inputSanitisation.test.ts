/**
 * Tests for Issue #6 — Input Sanitisation
 *
 * Covers:
 *  1. tasks.expand — control-character stripping and XML-delimiter wrapping in LLM prompt
 *  2. voice.transcribe — MIME type allowlist enforcement
 *  3. admin.uploadLogo — image MIME type allowlist enforcement
 *  4. survey.getAll — now requires admin session (was public)
 *  5. tasks.create — notes field capped at 2 000 chars
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Shared mocks ──────────────────────────────────────────────────────────────

const fakeDb = new Map<string, string>();

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getSetting: vi.fn(async (key: string) => fakeDb.get(key) ?? null),
    setSetting: vi.fn(async (key: string, value: string) => { fakeDb.set(key, value); }),
    deleteSetting: vi.fn(async (key: string) => { fakeDb.delete(key); }),
    getAllSurveyResponses: vi.fn(async () => []),
    getAllTasksForUser: vi.fn(async () => []),
    createTask: vi.fn(async () => null),
    updateTask: vi.fn(async () => {}),
  };
});

vi.mock("./_core/adminSession", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./_core/adminSession")>();
  return {
    ...actual,
    verifyAdminSession: vi.fn(async () => true),
  };
});

// Mock invokeLLM so tasks.expand doesn't call the real API
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [{ message: { content: '{"steps":["Step 1","Step 2","Step 3"]}' } }],
  })),
}));

// Mock transcribeAudio so voice.transcribe doesn't call Whisper
vi.mock("./_core/voiceTranscription", () => ({
  transcribeAudio: vi.fn(async () => ({ text: "hello world", language: "en", segments: [] })),
}));

// Mock storagePut so uploadLogo doesn't call S3
vi.mock("./storage", () => ({
  storagePut: vi.fn(async () => ({ url: "https://cdn.example.com/test.png", key: "test.png" })),
}));

function adminCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {}, cookies: {} } as TrpcContext["req"],
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function userCtx(): TrpcContext {
  return {
    user: { id: 1, openId: "u1", role: "user", name: "Test", email: null, loginMethod: null, lastSignedIn: new Date(), createdAt: new Date(), onboardingComplete: true, activeRole: "student", personalityMode: "positive", xp: 0, level: 1, currentStreak: 0, longestStreak: 0, lastActiveDate: null, readingTheme: "default", textSize: "medium" },
    req: { protocol: "https", headers: {}, cookies: {} } as TrpcContext["req"],
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  fakeDb.clear();
  vi.clearAllMocks();
});

// ── 1. tasks.expand — prompt injection sanitisation ───────────────────────────

describe("tasks.expand — prompt injection sanitisation", () => {
  it("strips control characters from title before building the LLM prompt", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const caller = appRouter.createCaller(userCtx());

    await caller.tasks.expand({
      taskId: 1,
      title: "Buy milk\x00\x01\x1F",
      notes: undefined,
    }).catch(() => {}); // may throw on updateTask mock — we only care about the prompt

    const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    const prompt: string = callArgs?.messages?.[1]?.content ?? "";
    expect(prompt).not.toMatch(/\x00|\x01|\x1F/);
    expect(prompt).toContain("<task>Buy milk");
  });

  it("wraps title and notes in XML delimiters", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const caller = appRouter.createCaller(userCtx());

    await caller.tasks.expand({
      taskId: 1,
      title: "Write report",
      notes: "Due Friday",
    }).catch(() => {});

    const callArgs = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    const prompt: string = callArgs?.messages?.[1]?.content ?? "";
    expect(prompt).toContain("<task>Write report</task>");
    expect(prompt).toContain("<notes>Due Friday</notes>");
  });

  it("rejects notes longer than 2 000 characters", async () => {
    const caller = appRouter.createCaller(userCtx());
    await expect(
      caller.tasks.expand({
        taskId: 1,
        title: "Test",
        notes: "x".repeat(2001),
      })
    ).rejects.toThrow();
  });
});

// ── 2. voice.transcribe — MIME type allowlist ─────────────────────────────────

describe("voice.transcribe — MIME type allowlist", () => {
  it("accepts a valid MIME type from the allowlist", async () => {
    const caller = appRouter.createCaller(userCtx());
    // storagePut and transcribeAudio are mocked; we just verify no validation error
    await expect(
      caller.voice.transcribe({ audioBase64: "dGVzdA==", mimeType: "audio/webm" })
    ).resolves.toBeDefined();
  });

  it("rejects an arbitrary MIME type not in the allowlist", async () => {
    const caller = appRouter.createCaller(userCtx());
    await expect(
      // @ts-expect-error — intentionally passing an invalid value to test runtime validation
      caller.voice.transcribe({ audioBase64: "dGVzdA==", mimeType: "text/html" })
    ).rejects.toThrow();
  });
});

// ── 3. admin.uploadLogo — image MIME type allowlist ───────────────────────────

describe("admin.uploadLogo — image MIME type allowlist", () => {
  it("accepts a valid image MIME type", async () => {
    const caller = appRouter.createCaller(adminCtx());
    const result = await caller.admin.uploadLogo({
      type: "icon",
      dataUrl: "data:image/png;base64,iVBORw0KGgo=",
      fileName: "icon.png",
    });
    expect(result.url).toBeTruthy();
  });

  it("rejects a disallowed MIME type such as application/x-php", async () => {
    const caller = appRouter.createCaller(adminCtx());
    await expect(
      caller.admin.uploadLogo({
        type: "icon",
        dataUrl: "data:application/x-httpd-php;base64,PD9waHA=",
        fileName: "shell.php",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects a text/html MIME type", async () => {
    const caller = appRouter.createCaller(adminCtx());
    await expect(
      caller.admin.uploadLogo({
        type: "wordmark",
        dataUrl: "data:text/html;base64,PGh0bWw+",
        fileName: "page.html",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("derives the S3 key extension from the MIME type, not the fileName", async () => {
    const { storagePut } = await import("./storage");
    const caller = appRouter.createCaller(adminCtx());
    await caller.admin.uploadLogo({
      type: "icon",
      dataUrl: "data:image/webp;base64,UklGRg==",
      fileName: "icon.exe",   // malicious extension in fileName — should be ignored
    });
    const callArgs = (storagePut as ReturnType<typeof vi.fn>).mock.calls[0];
    const key: string = callArgs?.[0] ?? "";
    expect(key).toMatch(/\.webp$/);
    expect(key).not.toMatch(/\.exe/);
  });
});

// ── 4. survey.getAll — now requires admin session ─────────────────────────────

describe("survey.getAll — admin-only access", () => {
  it("succeeds when called with a valid admin session", async () => {
    const caller = appRouter.createCaller(adminCtx());
    const result = await caller.survey.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws UNAUTHORIZED when called without an admin session", async () => {
    const { verifyAdminSession } = await import("./_core/adminSession");
    (verifyAdminSession as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false);

    const caller = appRouter.createCaller(adminCtx());
    await expect(caller.survey.getAll()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ── 5. tasks.create — notes capped at 2 000 chars ────────────────────────────

describe("tasks.create — notes length cap", () => {
  it("accepts notes up to 2 000 characters", async () => {
    const caller = appRouter.createCaller(userCtx());
    await expect(
      caller.tasks.create({ title: "Test", notes: "x".repeat(2000) })
    ).resolves.toBeDefined();
  });

  it("rejects notes longer than 2 000 characters", async () => {
    const caller = appRouter.createCaller(userCtx());
    await expect(
      caller.tasks.create({ title: "Test", notes: "x".repeat(2001) })
    ).rejects.toThrow();
  });
});

// ── 6. tasks.update — notes capped at 2 500 chars ────────────────────────────

describe("tasks.update — notes length cap", () => {
  it("accepts notes up to 2 500 characters", async () => {
    const caller = appRouter.createCaller(userCtx());
    await expect(
      caller.tasks.update({ id: 1, notes: "x".repeat(2500) })
    ).resolves.toBeDefined();
  });

  it("rejects notes longer than 2 500 characters", async () => {
    const caller = appRouter.createCaller(userCtx());
    await expect(
      caller.tasks.update({ id: 1, notes: "x".repeat(2501) })
    ).rejects.toThrow();
  });
});
