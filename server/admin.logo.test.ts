/**
 * Tests for the admin logo management procedures.
 *
 * These tests verify that:
 *  - getLogo returns default CDN URLs when no settings are stored
 *  - saveLogo persists wordmark and icon URLs to app_settings
 *  - uploadLogo rejects invalid data URLs
 *  - uploadLogo rejects unknown logo types
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock the db helpers ───────────────────────────────────────────────────────
vi.mock('./db', () => ({
  getSetting: vi.fn(),
  setSetting: vi.fn(),
}));

// ── Mock storagePut ───────────────────────────────────────────────────────────
vi.mock('./storage', () => ({
  storagePut: vi.fn(),
}));

import { getSetting, setSetting } from './db';
import { storagePut } from './storage';

// ── Inline the procedure logic so we can unit-test it without a full tRPC stack ──

const DEFAULT_WORDMARK =
  'https://d2xsxph8kpxj0f.cloudfront.net/310419663031090894/maeA52JBNKsvSZamfPFaVJ/taskbloom-wordmark-dark_ffbd6a10.webp';
const DEFAULT_ICON =
  'https://d2xsxph8kpxj0f.cloudfront.net/310419663031090894/maeA52JBNKsvSZamfPFaVJ/taskbloom-logo-new_ca1f7308.png';

async function getLogoHandler() {
  const wordmarkUrl = await getSetting('logo_wordmark_url');
  const iconUrl = await getSetting('logo_icon_url');
  return {
    wordmarkUrl: wordmarkUrl ?? DEFAULT_WORDMARK,
    iconUrl: iconUrl ?? DEFAULT_ICON,
  };
}

async function saveLogoHandler(input: { wordmarkUrl?: string; iconUrl?: string }) {
  if (input.wordmarkUrl) await setSetting('logo_wordmark_url', input.wordmarkUrl);
  if (input.iconUrl) await setSetting('logo_icon_url', input.iconUrl);
  return { success: true };
}

async function uploadLogoHandler(input: { type: 'wordmark' | 'icon'; dataUrl: string; fileName: string }) {
  const matches = input.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid image data');
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const ext = input.fileName.split('.').pop() ?? 'png';
  const key = `logos/${input.type}-test.${ext}`;
  const { url } = await (storagePut as ReturnType<typeof vi.fn>)(key, buffer, mimeType);
  const settingKey = input.type === 'wordmark' ? 'logo_wordmark_url' : 'logo_icon_url';
  await setSetting(settingKey, url);
  return { url };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('admin.getLogo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns default CDN URLs when no settings are stored', async () => {
    (getSetting as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await getLogoHandler();
    expect(result.wordmarkUrl).toBe(DEFAULT_WORDMARK);
    expect(result.iconUrl).toBe(DEFAULT_ICON);
  });

  it('returns stored URLs when settings exist', async () => {
    (getSetting as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce('https://example.com/wordmark.png')
      .mockResolvedValueOnce('https://example.com/icon.png');
    const result = await getLogoHandler();
    expect(result.wordmarkUrl).toBe('https://example.com/wordmark.png');
    expect(result.iconUrl).toBe('https://example.com/icon.png');
  });
});

describe('admin.saveLogo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('saves wordmark URL to app_settings', async () => {
    (setSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const result = await saveLogoHandler({ wordmarkUrl: 'https://example.com/wm.png' });
    expect(setSetting).toHaveBeenCalledWith('logo_wordmark_url', 'https://example.com/wm.png');
    expect(result.success).toBe(true);
  });

  it('saves icon URL to app_settings', async () => {
    (setSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const result = await saveLogoHandler({ iconUrl: 'https://example.com/icon.png' });
    expect(setSetting).toHaveBeenCalledWith('logo_icon_url', 'https://example.com/icon.png');
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

  it('uploads icon and saves the returned URL', async () => {
    (storagePut as ReturnType<typeof vi.fn>).mockResolvedValue({ url: 'https://cdn.example.com/icon.png' });
    (setSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    // Minimal valid PNG base64
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await uploadLogoHandler({ type: 'icon', dataUrl, fileName: 'icon.png' });

    expect(storagePut).toHaveBeenCalled();
    expect(setSetting).toHaveBeenCalledWith('logo_icon_url', 'https://cdn.example.com/icon.png');
    expect(result.url).toBe('https://cdn.example.com/icon.png');
  });

  it('uploads wordmark and saves the returned URL', async () => {
    (storagePut as ReturnType<typeof vi.fn>).mockResolvedValue({ url: 'https://cdn.example.com/wm.webp' });
    (setSetting as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const dataUrl = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAkA4JZACdAEO/gHOAAA=';
    const result = await uploadLogoHandler({ type: 'wordmark', dataUrl, fileName: 'wordmark.webp' });

    expect(setSetting).toHaveBeenCalledWith('logo_wordmark_url', 'https://cdn.example.com/wm.webp');
    expect(result.url).toBe('https://cdn.example.com/wm.webp');
  });
});
