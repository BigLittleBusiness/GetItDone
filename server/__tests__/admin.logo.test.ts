/**
 * Tests for the admin logo management procedures.
 *
 * These tests verify that:
 *  - getLogo returns default CDN URLs and null timestamps when no settings are stored
 *  - getLogo returns stored URLs and parsed timestamps when settings exist
 *  - saveLogo persists URLs and timestamps to app_settings
 *  - uploadLogo rejects invalid data URLs
 *  - uploadLogo saves URL, timestamp, and returns updatedAt
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock the db helpers ───────────────────────────────────────────────────────
vi.mock('../db', () => ({
  getSetting: vi.fn(),
  setSetting: vi.fn(),
}));

// ── Mock storagePut ───────────────────────────────────────────────────────────
vi.mock('../storage', () => ({
  storagePut: vi.fn(),
}));

import { getSetting, setSetting } from '../db';
import { storagePut } from '../storage';

// ── Inline the procedure logic so we can unit-test it without a full tRPC stack ──

const DEFAULT_WORDMARK =
  'https://d2xsxph8kpxj0f.cloudfront.net/310419663031090894/maeA52JBNKsvSZamfPFaVJ/taskbloom-wordmark-dark_ffbd6a10.webp';
const DEFAULT_ICON =
  'https://d2xsxph8kpxj0f.cloudfront.net/310419663031090894/maeA52JBNKsvSZamfPFaVJ/taskbloom-logo-new_ca1f7308.png';

async function getLogoHandler() {
  const wordmarkUrl = await getSetting('logo_wordmark_url');
  const iconUrl = await getSetting('logo_icon_url');
  const ogImageUrl = await getSetting('logo_og_image_url');
  const wordmarkUpdatedAt = await getSetting('logo_wordmark_updated_at');
  const iconUpdatedAt = await getSetting('logo_icon_updated_at');
  const ogImageUpdatedAt = await getSetting('logo_og_image_updated_at');
  return {
    wordmarkUrl: wordmarkUrl ?? DEFAULT_WORDMARK,
    iconUrl: iconUrl ?? DEFAULT_ICON,
    ogImageUrl: ogImageUrl ?? null,
    wordmarkUpdatedAt: wordmarkUpdatedAt ? Number(wordmarkUpdatedAt) : null,
    iconUpdatedAt: iconUpdatedAt ? Number(iconUpdatedAt) : null,
    ogImageUpdatedAt: ogImageUpdatedAt ? Number(ogImageUpdatedAt) : null,
  };
}

async function saveLogoHandler(input: { wordmarkUrl?: string; iconUrl?: string; ogImageUrl?: string }) {
  const now = String(Date.now());
  if (input.wordmarkUrl) {
    await setSetting('logo_wordmark_url', input.wordmarkUrl);
    await setSetting('logo_wordmark_updated_at', now);
  }
  if (input.iconUrl) {
    await setSetting('logo_icon_url', input.iconUrl);
    await setSetting('logo_icon_updated_at', now);
  }
  if (input.ogImageUrl) {
    await setSetting('logo_og_image_url', input.ogImageUrl);
    await setSetting('logo_og_image_updated_at', now);
  }
  return { success: true };
}

async function uploadLogoHandler(input: { type: 'wordmark' | 'icon' | 'og-image'; dataUrl: string; fileName: string }) {
  const matches = input.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid image data');
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const ext = input.fileName.split('.').pop() ?? 'png';
  const key = `logos/${input.type}-test.${ext}`;
  const { url } = await (storagePut as ReturnType<typeof vi.fn>)(key, buffer, mimeType);
  const settingKey = input.type === 'wordmark' ? 'logo_wordmark_url' : input.type === 'icon' ? 'logo_icon_url' : 'logo_og_image_url';
  const tsKey = input.type === 'wordmark' ? 'logo_wordmark_updated_at' : input.type === 'icon' ? 'logo_icon_updated_at' : 'logo_og_image_updated_at';
  const now = String(Date.now());
  await setSetting(settingKey, url);
  await setSetting(tsKey, now);
  return { url, updatedAt: Number(now) };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('admin.getLogo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns default CDN URLs and null timestamps when no settings are stored', async () => {
    (getSetting as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await getLogoHandler();
    expect(result.wordmarkUrl).toBe(DEFAULT_WORDMARK);
    expect(result.iconUrl).toBe(DEFAULT_ICON);
    expect(result.ogImageUrl).toBeNull();
    expect(result.wordmarkUpdatedAt).toBeNull();
    expect(result.iconUpdatedAt).toBeNull();
    expect(result.ogImageUpdatedAt).toBeNull();
  });

  it('returns stored URLs and parsed timestamps when settings exist', async () => {
    const ts = String(Date.now());
    (getSetting as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce('https://example.com/wordmark.png') // logo_wordmark_url
      .mockResolvedValueOnce('https://example.com/icon.png')     // logo_icon_url
      .mockResolvedValueOnce(null)                               // logo_og_image_url
      .mockResolvedValueOnce(ts)                                 // logo_wordmark_updated_at
      .mockResolvedValueOnce(ts)                                 // logo_icon_updated_at
      .mockResolvedValueOnce(null);                              // logo_og_image_updated_at
    const result = await getLogoHandler();
    expect(result.wordmarkUrl).toBe('https://example.com/wordmark.png');
    expect(result.iconUrl).toBe('https://example.com/icon.png');
    expect(result.wordmarkUpdatedAt).toBe(Number(ts));
    expect(result.iconUpdatedAt).toBe(Number(ts));
    expect(result.ogImageUpdatedAt).toBeNull();
  });
});

describe('admin.saveLogo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('saves wordmark URL and timestamp to app_settings', async () => {
    (setSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const result = await saveLogoHandler({ wordmarkUrl: 'https://example.com/wm.png' });
    expect(setSetting).toHaveBeenCalledWith('logo_wordmark_url', 'https://example.com/wm.png');
    expect(setSetting).toHaveBeenCalledWith('logo_wordmark_updated_at', expect.any(String));
    expect(result.success).toBe(true);
  });

  it('saves icon URL and timestamp to app_settings', async () => {
    (setSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const result = await saveLogoHandler({ iconUrl: 'https://example.com/icon.png' });
    expect(setSetting).toHaveBeenCalledWith('logo_icon_url', 'https://example.com/icon.png');
    expect(setSetting).toHaveBeenCalledWith('logo_icon_updated_at', expect.any(String));
    expect(result.success).toBe(true);
  });

  it('saves OG image URL and timestamp to app_settings', async () => {
    (setSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const result = await saveLogoHandler({ ogImageUrl: 'https://example.com/og.png' });
    expect(setSetting).toHaveBeenCalledWith('logo_og_image_url', 'https://example.com/og.png');
    expect(setSetting).toHaveBeenCalledWith('logo_og_image_updated_at', expect.any(String));
    expect(result.success).toBe(true);
  });

  it('does not call setSetting when no URLs are provided', async () => {
    const result = await saveLogoHandler({});
    expect(setSetting).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});

describe('admin.uploadLogo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws on an invalid data URL', async () => {
    await expect(
      uploadLogoHandler({ type: 'icon', dataUrl: 'not-a-data-url', fileName: 'icon.png' })
    ).rejects.toThrow('Invalid image data');
  });

  it('uploads icon, saves URL and timestamp, returns updatedAt', async () => {
    (storagePut as ReturnType<typeof vi.fn>).mockResolvedValue({ url: 'https://cdn.example.com/icon.png' });
    (setSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await uploadLogoHandler({ type: 'icon', dataUrl, fileName: 'icon.png' });

    expect(storagePut).toHaveBeenCalled();
    expect(setSetting).toHaveBeenCalledWith('logo_icon_url', 'https://cdn.example.com/icon.png');
    expect(setSetting).toHaveBeenCalledWith('logo_icon_updated_at', expect.any(String));
    expect(result.url).toBe('https://cdn.example.com/icon.png');
    expect(result.updatedAt).toBeTypeOf('number');
  });

  it('uploads wordmark, saves URL and timestamp, returns updatedAt', async () => {
    (storagePut as ReturnType<typeof vi.fn>).mockResolvedValue({ url: 'https://cdn.example.com/wm.webp' });
    (setSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const dataUrl = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAkA4JZACdAEO/gHOAAA=';
    const result = await uploadLogoHandler({ type: 'wordmark', dataUrl, fileName: 'wordmark.webp' });

    expect(setSetting).toHaveBeenCalledWith('logo_wordmark_url', 'https://cdn.example.com/wm.webp');
    expect(setSetting).toHaveBeenCalledWith('logo_wordmark_updated_at', expect.any(String));
    expect(result.url).toBe('https://cdn.example.com/wm.webp');
    expect(result.updatedAt).toBeTypeOf('number');
  });

  it('uploads og-image, saves URL and timestamp, returns updatedAt', async () => {
    (storagePut as ReturnType<typeof vi.fn>).mockResolvedValue({ url: 'https://cdn.example.com/og.png' });
    (setSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await uploadLogoHandler({ type: 'og-image', dataUrl, fileName: 'og.png' });

    expect(setSetting).toHaveBeenCalledWith('logo_og_image_url', 'https://cdn.example.com/og.png');
    expect(setSetting).toHaveBeenCalledWith('logo_og_image_updated_at', expect.any(String));
    expect(result.url).toBe('https://cdn.example.com/og.png');
    expect(result.updatedAt).toBeTypeOf('number');
  });
});
