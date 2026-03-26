/**
 * In-memory brute-force protection for the admin login endpoint.
 *
 * Rules:
 *  - Up to MAX_ATTEMPTS failed attempts are allowed per IP within WINDOW_MS.
 *  - On the (MAX_ATTEMPTS + 1)th failure the IP is locked out for LOCKOUT_MS.
 *  - A successful login clears the counter for that IP.
 *  - Stale entries are pruned on every check to avoid unbounded memory growth.
 */

export const MAX_ATTEMPTS = 5;
export const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

interface Entry {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

// Exported so tests can reset state between runs.
export const store = new Map<string, Entry>();

/** Prune entries that are no longer relevant. */
function prune(now: number): void {
  for (const [ip, entry] of Array.from(store.entries())) {
    const windowExpired = now - entry.firstAttemptAt > WINDOW_MS;
    const lockExpired = entry.lockedUntil !== null && now > entry.lockedUntil;
    if (windowExpired && (entry.lockedUntil === null || lockExpired)) {
      store.delete(ip);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Remaining attempts before lockout (only meaningful when allowed === true). */
  attemptsLeft: number;
  /** Unix timestamp (ms) when the lockout expires, or null if not locked. */
  lockedUntil: number | null;
}

/**
 * Call this on every failed login attempt.
 * Returns whether the IP is still allowed to try, and how many attempts remain.
 */
export function recordFailedAttempt(ip: string, now = Date.now()): RateLimitResult {
  prune(now);

  const entry = store.get(ip) ?? { count: 0, firstAttemptAt: now, lockedUntil: null };

  // If currently locked out, refresh the lockout window and reject immediately.
  if (entry.lockedUntil !== null && now < entry.lockedUntil) {
    store.set(ip, entry);
    return { allowed: false, attemptsLeft: 0, lockedUntil: entry.lockedUntil };
  }

  // If the previous window has expired, reset the counter.
  if (now - entry.firstAttemptAt > WINDOW_MS) {
    entry.count = 0;
    entry.firstAttemptAt = now;
    entry.lockedUntil = null;
  }

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    store.set(ip, entry);
    return { allowed: false, attemptsLeft: 0, lockedUntil: entry.lockedUntil };
  }

  store.set(ip, entry);
  return {
    allowed: true,
    attemptsLeft: MAX_ATTEMPTS - entry.count,
    lockedUntil: null,
  };
}

/**
 * Call this on a successful login to clear the counter for the IP.
 */
export function clearAttempts(ip: string): void {
  store.delete(ip);
}

/**
 * Check whether an IP is currently locked out without recording an attempt.
 */
export function isLockedOut(ip: string, now = Date.now()): { locked: boolean; lockedUntil: number | null } {
  const entry = store.get(ip);
  if (!entry || entry.lockedUntil === null || now >= entry.lockedUntil) {
    return { locked: false, lockedUntil: null };
  }
  return { locked: true, lockedUntil: entry.lockedUntil };
}
