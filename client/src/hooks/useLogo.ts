/**
 * useLogo — returns the current wordmark and icon URLs from the admin-managed
 * logo settings, falling back to the CDN-hosted defaults if nothing is saved yet.
 *
 * Usage:
 *   const { wordmarkUrl, iconUrl } = useLogo();
 */
import { trpc } from '@/lib/trpc';

const DEFAULT_WORDMARK =
  'https://d2xsxph8kpxj0f.cloudfront.net/310419663031090894/maeA52JBNKsvSZamfPFaVJ/taskbloom-wordmark-light-transparent_2697a5ed.png';
const DEFAULT_ICON =
  'https://d2xsxph8kpxj0f.cloudfront.net/310419663031090894/maeA52JBNKsvSZamfPFaVJ/taskbloom-logo-transparent_d83d8acc.png';

export function useLogo() {
  const { data } = trpc.admin.getLogo.useQuery(undefined, {
    // Cache for 5 minutes — logo changes are infrequent
    staleTime: 5 * 60 * 1000,
  });

  return {
    wordmarkUrl: data?.wordmarkUrl ?? DEFAULT_WORDMARK,
    iconUrl: data?.iconUrl ?? DEFAULT_ICON,
  };
}
