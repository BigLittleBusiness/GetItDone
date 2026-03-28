/**
 * Admin router — authentication, survey access, Resend configuration,
 * logo management, and rate-limited login.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { timingSafeEqual } from "crypto";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { issueAdminSession, clearAdminSession } from "../_core/adminSession";
import { storagePut } from "../storage";
import {
  getAllSurveyResponses,
  getSetting,
  setSetting,
} from "../db";
import {
  recordFailedAttempt,
  clearAttempts,
  isLockedOut,
  LOCKOUT_MS,
} from "../adminRateLimiter";

export const adminRouter = router({
  /**
   * Verifies the admin password using a constant-time comparison and issues a
   * signed httpOnly session cookie on success.  Rate-limited per IP address.
   */
  login: publicProcedure
    .input(z.object({ password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const ip: string =
        (ctx.req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
        (ctx.req as unknown as { ip?: string }).ip ??
        "unknown";

      const lockCheck = await isLockedOut(ip);
      if (lockCheck.locked) {
        const retryAfterSec = Math.ceil((lockCheck.lockedUntil! - Date.now()) / 1000);
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many failed attempts. Try again in ${retryAfterSec} seconds.`,
        });
      }

      const adminPassword = process.env.ADMIN_PASSWORD ?? "";
      if (!adminPassword) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Admin password is not configured.",
        });
      }

      const expectedBuf = Buffer.from(adminPassword, "utf8");
      const providedBuf = Buffer.from(input.password, "utf8");
      const isCorrect =
        expectedBuf.length === providedBuf.length &&
        timingSafeEqual(expectedBuf, providedBuf);

      if (!isCorrect) {
        const result = await recordFailedAttempt(ip);
        const message = result.allowed
          ? `Incorrect password. ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? "" : "s"} remaining before lockout.`
          : `Too many failed attempts. Try again in ${Math.ceil(LOCKOUT_MS / 1000 / 60)} minutes.`;
        throw new TRPCError({ code: "UNAUTHORIZED", message });
      }

      await clearAttempts(ip);
      await issueAdminSession(ctx.req, ctx.res);
      return { success: true };
    }),

  /** Clears the admin session cookie. */
  logout: publicProcedure.mutation(({ ctx }) => {
    clearAdminSession(ctx.req, ctx.res);
    return { success: true };
  }),

  /** Returns all survey responses — requires a valid admin session. */
  getSurveyResponses: adminProcedure.query(() => getAllSurveyResponses()),

  // ── Resend Configuration ──────────────────────────────────────────────────

  /** Returns stored Resend credentials (API key is masked for display). */
  getResendConfig: adminProcedure.query(async () => {
    const apiKey    = await getSetting("resend_api_key");
    const fromEmail = await getSetting("resend_from_email");
    const fromName  = await getSetting("resend_from_name");
    return {
      apiKeyMasked: apiKey
        ? `re_${"*".repeat(Math.max(0, apiKey.length - 9))}${apiKey.slice(-6)}`
        : null,
      apiKeyConfigured: !!apiKey,
      fromEmail: fromEmail ?? "",
      fromName:  fromName  ?? "",
    };
  }),

  /** Saves Resend credentials to the app_settings table. */
  saveResendConfig: adminProcedure
    .input(z.object({
      apiKey:    z.string().min(1, "API key is required"),
      fromEmail: z.string().email("Must be a valid email address"),
      fromName:  z.string().min(1, "Sender name is required").max(64),
    }))
    .mutation(async ({ input }) => {
      await setSetting("resend_api_key",    input.apiKey);
      await setSetting("resend_from_email", input.fromEmail);
      await setSetting("resend_from_name",  input.fromName);
      return { success: true };
    }),

  // ── Logo Management ───────────────────────────────────────────────────────

  /**
   * Returns stored logo URLs and last-updated timestamps.
   * Public so the nav/footer/OG tags can read it without an admin session.
   */
  getLogo: publicProcedure.query(async () => {
    const wordmarkUrl       = await getSetting("logo_wordmark_url");
    const iconUrl           = await getSetting("logo_icon_url");
    const ogImageUrl        = await getSetting("logo_og_image_url");
    const wordmarkUpdatedAt = await getSetting("logo_wordmark_updated_at");
    const iconUpdatedAt     = await getSetting("logo_icon_updated_at");
    const ogImageUpdatedAt  = await getSetting("logo_og_image_updated_at");
    return {
      wordmarkUrl:       wordmarkUrl ?? "https://d2xsxph8kpxj0f.cloudfront.net/310419663031090894/m",
      iconUrl:           iconUrl     ?? null,
      ogImageUrl:        ogImageUrl  ?? null,
      wordmarkUpdatedAt: wordmarkUpdatedAt ? Number(wordmarkUpdatedAt) : null,
      iconUpdatedAt:     iconUpdatedAt     ? Number(iconUpdatedAt)     : null,
      ogImageUpdatedAt:  ogImageUpdatedAt  ? Number(ogImageUpdatedAt)  : null,
    };
  }),

  /** Saves logo URLs directly (for URL-based updates). */
  saveLogo: adminProcedure
    .input(z.object({
      wordmarkUrl: z.string().url().optional(),
      iconUrl:     z.string().url().optional(),
      ogImageUrl:  z.string().url().optional(),
    }))
    .mutation(async ({ input }) => {
      const now = String(Date.now());
      if (input.wordmarkUrl) {
        await setSetting("logo_wordmark_url",        input.wordmarkUrl);
        await setSetting("logo_wordmark_updated_at", now);
      }
      if (input.iconUrl) {
        await setSetting("logo_icon_url",        input.iconUrl);
        await setSetting("logo_icon_updated_at", now);
      }
      if (input.ogImageUrl) {
        await setSetting("logo_og_image_url",        input.ogImageUrl);
        await setSetting("logo_og_image_updated_at", now);
      }
      return { success: true };
    }),

  /**
   * Accepts a base64-encoded image, validates its MIME type against an
   * allowlist, uploads it to S3, and saves the resulting URL.
   */
  uploadLogo: adminProcedure
    .input(z.object({
      type:    z.enum(["wordmark", "icon", "og-image"]),
      dataUrl: z.string().min(1),
      fileName: z.string().min(1).max(255),
    }))
    .mutation(async ({ input }) => {
      const matches = input.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid image data" });

      const rawMime = matches[1];
      const ALLOWED_IMAGE_MIMES: Record<string, string> = {
        "image/png":     "png",
        "image/jpeg":    "jpg",
        "image/webp":    "webp",
        "image/gif":     "gif",
        "image/svg+xml": "svg",
      };
      const ext = ALLOWED_IMAGE_MIMES[rawMime];
      if (!ext) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unsupported image type: ${rawMime}. Allowed: PNG, JPEG, WebP, GIF, SVG.`,
        });
      }

      const buffer = Buffer.from(matches[2], "base64");
      const key    = `logos/${input.type}-${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, rawMime);

      const settingKey = input.type === "wordmark" ? "logo_wordmark_url"
        : input.type === "icon" ? "logo_icon_url"
        : "logo_og_image_url";
      const tsKey = input.type === "wordmark" ? "logo_wordmark_updated_at"
        : input.type === "icon" ? "logo_icon_updated_at"
        : "logo_og_image_updated_at";
      const now = String(Date.now());
      await setSetting(settingKey, url);
      await setSetting(tsKey, now);
      return { url, updatedAt: Number(now) };
    }),

  /** Sends a test email using the stored Resend credentials. */
  testResendEmail: adminProcedure
    .input(z.object({ toEmail: z.string().email() }))
    .mutation(async ({ input }) => {
      const apiKey    = await getSetting("resend_api_key");
      const fromEmail = await getSetting("resend_from_email");
      const fromName  = await getSetting("resend_from_name");

      if (!apiKey || !fromEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Resend credentials are not configured. Save your API key and sender email first.",
        });
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
          to: [input.toEmail],
          subject: "Taskbloom — Resend connection verified ✓",
          html: [
            '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">',
            '<h2 style="color:#4f46e5;margin-bottom:8px;">Connection verified!</h2>',
            '<p style="color:#374151;">Your Resend integration is working correctly.</p>',
            '<p style="color:#6b7280;font-size:14px;">',
            "This test email was sent from the Taskbloom admin dashboard.",
            " You can now activate email reminders for your users.",
            "</p>",
            "</div>",
          ].join(""),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Resend API error: ${(body as { message?: string }).message ?? res.statusText}`,
        });
      }

      return { success: true };
    }),
});
