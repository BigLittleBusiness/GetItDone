import { useState, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Upload, CheckCircle2, AlertCircle, RefreshCw, Image as ImageIcon, Info, Clock,
} from 'lucide-react';

// ── Timestamp helper ──────────────────────────────────────────────────────────
function formatTimestamp(ts: number | null | undefined): string | null {
  if (!ts) return null;
  const date = new Date(ts);
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────
type UploadState = 'idle' | 'uploading' | 'success' | 'error';
type LogoType = 'wordmark' | 'icon' | 'og-image';

interface LogoSlot {
  type: LogoType;
  label: string;
  description: string;
  /** Where this asset appears in the UI / on the web */
  usages: string[];
  /** Recommended dimensions */
  recommended: string;
  /** Preview container aspect ratio class */
  previewClass: string;
  /** Max width for the preview box */
  previewMaxW: string;
}

const SLOTS: LogoSlot[] = [
  {
    type: 'wordmark',
    label: 'Wordmark (logo + name)',
    description: 'The full horizontal logo used in the navigation bar and footer.',
    usages: ['Navigation bar', 'Footer'],
    recommended: 'Landscape image, e.g. 400 × 80 px. PNG, WebP, or SVG.',
    previewClass: 'aspect-[5/1]',
    previewMaxW: 'max-w-xs',
  },
  {
    type: 'icon',
    label: 'Icon (symbol only)',
    description: 'The square icon used in the login dialog, onboarding header, and as the app icon.',
    usages: ['Login dialog', 'Onboarding header', 'App icon fallback'],
    recommended: 'Square image, e.g. 256 × 256 px. PNG or WebP.',
    previewClass: 'aspect-square',
    previewMaxW: 'max-w-[8rem]',
  },
  {
    type: 'og-image',
    label: 'Open Graph / Social Image',
    description:
      'The image shown when the site is shared on LinkedIn, Twitter/X, iMessage, Slack, and other platforms that support Open Graph previews.',
    usages: ['LinkedIn', 'Twitter / X', 'iMessage', 'Slack', 'Facebook'],
    recommended: '1200 × 630 px recommended. PNG or JPEG. Max 5 MB.',
    previewClass: 'aspect-[1200/630]',
    previewMaxW: 'max-w-sm',
  },
];

// ── Helper: read file as data URL ─────────────────────────────────────────────
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Single logo upload card ───────────────────────────────────────────────────
function LogoCard({
  slot,
  currentUrl,
  updatedAt,
  onUploaded,
}: {
  slot: LogoSlot;
  currentUrl: string | undefined | null;
  /** UTC ms timestamp of last upload, or null if never uploaded */
  updatedAt: number | null | undefined;
  onUploaded: (url: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [localUpdatedAt, setLocalUpdatedAt] = useState<number | null>(null);
  const displayUpdatedAt = localUpdatedAt ?? updatedAt;

  const uploadMutation = trpc.admin.uploadLogo.useMutation({
    onSuccess: ({ url, updatedAt: ts }) => {
      setUploadState('success');
      setLocalUpdatedAt(ts ?? Date.now());
      onUploaded(url);
      setTimeout(() => setUploadState('idle'), 3000);
    },
    onError: (err) => {
      setUploadState('error');
      setErrorMsg(err.message);
      setTimeout(() => { setUploadState('idle'); setErrorMsg(''); }, 5000);
    },
  });

  const handleFile = useCallback(async (file: File) => {
    const allowed = ['image/png', 'image/webp', 'image/jpeg', 'image/svg+xml', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setUploadState('error');
      setErrorMsg('Unsupported file type. Use PNG, WebP, JPEG, or SVG.');
      setTimeout(() => { setUploadState('idle'); setErrorMsg(''); }, 4000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadState('error');
      setErrorMsg('File is too large. Maximum size is 5 MB.');
      setTimeout(() => { setUploadState('idle'); setErrorMsg(''); }, 4000);
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setPreview(dataUrl);
    setUploadState('uploading');
    uploadMutation.mutate({ type: slot.type, dataUrl, fileName: file.name });
  }, [slot.type, uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const displayUrl = preview ?? currentUrl;

  return (
    <div className="bg-black/20 rounded-3xl border border-white/5 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-serif text-white mb-1">{slot.label}</h3>
          <p className="text-indigo-300 text-sm">{slot.description}</p>
        </div>
        {formatTimestamp(displayUpdatedAt) && (
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-indigo-400 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">
            <Clock size={12} className="shrink-0" />
            <span>{formatTimestamp(displayUpdatedAt)}</span>
          </div>
        )}
      </div>

      {/* Current preview */}
      <div>
        <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-2">Current</p>
        <div className={`${slot.previewClass} ${slot.previewMaxW} w-full bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden`}>
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={slot.label}
              className="w-full h-full object-contain p-3"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-indigo-500 p-4">
              <ImageIcon size={28} />
              <span className="text-xs">No image set</span>
            </div>
          )}
        </div>
      </div>

      {/* Where it appears */}
      <div className="flex flex-wrap gap-2">
        {slot.usages.map(u => (
          <span key={u} className="px-3 py-1 bg-indigo-500/15 text-indigo-300 text-xs rounded-full border border-indigo-500/20">
            {u}
          </span>
        ))}
      </div>

      {/* Upload zone */}
      <div>
        <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-2">Upload new</p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
            dragOver
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-white/15 hover:border-indigo-400/60 hover:bg-white/5'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/webp,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {uploadState === 'uploading' ? (
            <RefreshCw size={24} className="animate-spin text-indigo-400" />
          ) : uploadState === 'success' ? (
            <CheckCircle2 size={24} className="text-green-400" />
          ) : uploadState === 'error' ? (
            <AlertCircle size={24} className="text-red-400" />
          ) : (
            <Upload size={24} className="text-indigo-400" />
          )}
          <p className="text-sm text-indigo-300 text-center">
            {uploadState === 'uploading' && 'Uploading…'}
            {uploadState === 'success' && 'Image updated successfully!'}
            {uploadState === 'error' && (errorMsg || 'Upload failed. Please try again.')}
            {uploadState === 'idle' && (
              <>
                <span className="font-medium text-white">Click to upload</span> or drag and drop
              </>
            )}
          </p>
          {uploadState === 'idle' && (
            <p className="text-xs text-indigo-500">{slot.recommended}</p>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="flex gap-2 text-xs text-indigo-400 bg-white/5 rounded-xl px-4 py-3">
        <Info size={14} className="shrink-0 mt-0.5" />
        {slot.type === 'og-image' ? (
          <span>
            This image is read by social platforms when someone shares your URL. Changes may take
            up to 30 minutes to appear in cached previews — use the{' '}
            <a
              href="https://www.opengraph.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-indigo-200"
            >
              OpenGraph.xyz debugger
            </a>{' '}
            to force-refresh.
          </span>
        ) : (
          <span>Changes take effect immediately across the site — no restart required.</span>
        )}
      </div>
    </div>
  );
}

// ── Main tab component ────────────────────────────────────────────────────────
export function LogoManagementTab() {
  const { data: logoConfig, isLoading, refetch } = trpc.admin.getLogo.useQuery();
  const [wordmarkUrl, setWordmarkUrl] = useState<string | undefined>(undefined);
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
  const [ogImageUrl, setOgImageUrl] = useState<string | undefined | null>(undefined);

  // Prefer locally-updated URLs over stale server data
  const effectiveWordmark = wordmarkUrl ?? logoConfig?.wordmarkUrl;
  const effectiveIcon = iconUrl ?? logoConfig?.iconUrl;
  const effectiveOgImage = ogImageUrl !== undefined ? ogImageUrl : logoConfig?.ogImageUrl;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-indigo-300">
        <RefreshCw size={20} className="animate-spin mr-3" /> Loading logo settings…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-6 py-4 text-sm text-indigo-200">
        Upload your brand assets below. Each image is stored securely and served via CDN.
        The wordmark and icon update the site immediately; the OG image updates social link previews.
      </div>

      {/* Wordmark + Icon side by side */}
      <div className="grid md:grid-cols-2 gap-8">
        <LogoCard
          slot={SLOTS[0]}
          currentUrl={effectiveWordmark}
          updatedAt={logoConfig?.wordmarkUpdatedAt ?? null}
          onUploaded={(url) => { setWordmarkUrl(url); refetch(); }}
        />
        <LogoCard
          slot={SLOTS[1]}
          currentUrl={effectiveIcon}
          updatedAt={logoConfig?.iconUpdatedAt ?? null}
          onUploaded={(url) => { setIconUrl(url); refetch(); }}
        />
      </div>

      {/* OG image full-width below */}
      <LogoCard
        slot={SLOTS[2]}
        currentUrl={effectiveOgImage}
        updatedAt={logoConfig?.ogImageUpdatedAt ?? null}
        onUploaded={(url) => { setOgImageUrl(url); refetch(); }}
      />
    </div>
  );
}
