/**
 * Tests for the admin Resend configuration procedures:
 *   admin.getResendConfig
 *   admin.saveResendConfig
 *   admin.testResendEmail
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock the db helpers ───────────────────────────────────────────────────────
vi.mock('./db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./db')>();
  return {
    ...actual,
    getSetting: vi.fn(),
    setSetting: vi.fn().mockResolvedValue(undefined),
  };
});

import { getSetting, setSetting } from './db';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

// Admin procedures are public (no auth required — the client verifies the
// password separately via admin.login), so we pass a minimal context.
const caller = appRouter.createCaller(createTestContext());

const mockGetSetting = getSetting as ReturnType<typeof vi.fn>;
const mockSetSetting = setSetting as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

// ── admin.getResendConfig ─────────────────────────────────────────────────────
describe('admin.getResendConfig', () => {
  it('returns apiKeyConfigured: false when no key is stored', async () => {
    mockGetSetting.mockResolvedValue(null);
    const result = await caller.admin.getResendConfig();
    expect(result.apiKeyConfigured).toBe(false);
    expect(result.apiKeyMasked).toBeNull();
    expect(result.fromEmail).toBe('');
    expect(result.fromName).toBe('');
  });

  it('returns a masked key when a key is stored', async () => {
    mockGetSetting.mockImplementation((key: string) => {
      if (key === 'resend_api_key') return Promise.resolve('re_TestKey_ABCDEF123456');
      if (key === 'resend_from_email') return Promise.resolve('hello@example.com');
      if (key === 'resend_from_name') return Promise.resolve('My App');
      return Promise.resolve(null);
    });
    const result = await caller.admin.getResendConfig();
    expect(result.apiKeyConfigured).toBe(true);
    // Masked key must end with the last 6 chars of the stored key
    expect(result.apiKeyMasked).toMatch(/123456$/);
    expect(result.fromEmail).toBe('hello@example.com');
    expect(result.fromName).toBe('My App');
  });
});

// ── admin.saveResendConfig ────────────────────────────────────────────────────
describe('admin.saveResendConfig', () => {
  it('saves all three settings to the database', async () => {
    const result = await caller.admin.saveResendConfig({
      apiKey: 're_live_TestKey123',
      fromEmail: 'noreply@myapp.com',
      fromName: 'My App',
    });
    expect(result.success).toBe(true);
    expect(mockSetSetting).toHaveBeenCalledWith('resend_api_key', 're_live_TestKey123');
    expect(mockSetSetting).toHaveBeenCalledWith('resend_from_email', 'noreply@myapp.com');
    expect(mockSetSetting).toHaveBeenCalledWith('resend_from_name', 'My App');
    expect(mockSetSetting).toHaveBeenCalledTimes(3);
  });

  it('rejects an empty API key', async () => {
    await expect(
      caller.admin.saveResendConfig({ apiKey: '', fromEmail: 'a@b.com', fromName: 'App' })
    ).rejects.toThrow();
  });

  it('rejects an invalid sender email', async () => {
    await expect(
      caller.admin.saveResendConfig({ apiKey: 're_abc', fromEmail: 'not-an-email', fromName: 'App' })
    ).rejects.toThrow();
  });

  it('rejects an empty sender name', async () => {
    await expect(
      caller.admin.saveResendConfig({ apiKey: 're_abc', fromEmail: 'a@b.com', fromName: '' })
    ).rejects.toThrow();
  });
});

// ── admin.testResendEmail ─────────────────────────────────────────────────────
describe('admin.testResendEmail', () => {
  it('throws BAD_REQUEST when credentials are not configured', async () => {
    mockGetSetting.mockResolvedValue(null);
    await expect(
      caller.admin.testResendEmail({ toEmail: 'test@example.com' })
    ).rejects.toMatchObject({ message: expect.stringContaining('not configured') });
  });

  it('calls the Resend API and returns success on 200', async () => {
    mockGetSetting.mockImplementation((key: string) => {
      if (key === 'resend_api_key') return Promise.resolve('re_live_TestKey');
      if (key === 'resend_from_email') return Promise.resolve('hello@example.com');
      if (key === 'resend_from_name') return Promise.resolve('My App');
      return Promise.resolve(null);
    });

    // Stub global fetch to simulate a successful Resend response
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 'email_123' }), { status: 200 })
    );

    const result = await caller.admin.testResendEmail({ toEmail: 'user@example.com' });
    expect(result.success).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer re_live_TestKey' }),
      })
    );

    fetchSpy.mockRestore();
  });

  it('throws BAD_REQUEST when the Resend API returns an error', async () => {
    mockGetSetting.mockImplementation((key: string) => {
      if (key === 'resend_api_key') return Promise.resolve('re_bad_key');
      if (key === 'resend_from_email') return Promise.resolve('hello@example.com');
      if (key === 'resend_from_name') return Promise.resolve('My App');
      return Promise.resolve(null);
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Invalid API key' }), { status: 403 })
    );

    await expect(
      caller.admin.testResendEmail({ toEmail: 'user@example.com' })
    ).rejects.toMatchObject({ message: expect.stringContaining('Invalid API key') });
  });

  it('rejects an invalid recipient email address', async () => {
    await expect(
      caller.admin.testResendEmail({ toEmail: 'not-an-email' })
    ).rejects.toThrow();
  });
});
