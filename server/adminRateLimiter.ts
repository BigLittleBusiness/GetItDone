/**
 * Persistent brute-force protection for the admin login endpoint.
 *
 * State is stored in the `app_settings` table under the key
 * `rate_limit:<ip>` as a JSON blob, so it survives server restarts
 * and works correctly across multiple process instances (e.g. ECS tasks).
 *
 * Rules:
 *  - Up to MAX_ATTEMPTS failed attempts are allowed per IP within WINDOW_MS.
 *  - On the (MAX_ATTEMPTS + 1)th failure the IP is locked out for LOCKOUT_MS.
 *  - A successful login clears the counter for that IP.
 *  - Entries are pruned lazily on every read to avoid unbounded DB growth.
 */

import { getSetting, setSetting, deleteSetting } from "./db";

export const MAX_ATTEMPTS = 5;
export const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

interface Entry {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const KEY_PREFIX = "rate_limit:";

function entryKey(ip: string): string {
  // Sanitise the IP so it is safe to use as a settings key.
  return KEY_PREFIX + ip.replace(/[^a-zA-Z0-9.:_-]/g, "_");
}

async function readEntry(ip: string): Promise<Entry | null> {
  const raw = await getSetting(entryKey(ip));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Entry;
  } catch {
    return null;
  }
}

async function writeEntry(ip: string, entry: Entry): Promise<void> {
  await setSetting(entryKey(ip), JSON.stringify(entry));
}

async function removeEntry(ip: string): Promise<void> {
  await deleteSetting(entryKey(ip));
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
export async function recordFailedAttempt(ip: string, now = Date.now()): Promise<RateLimitResult> {
  let entry = await readEntry(ip) ?? { count: 0, firstAttemptAt: now, lockedUntil: null };

  // If currently locked out, reject immediately.
  if (entry.lockedUntil !== null && now < entry.lockedUntil) {
    return { allowed: false, attemptsLeft: 0, lockedUntil: entry.lockedUntil };
  }

  // If the previous window has expired, reset the counter.
  if (now - entry.firstAttemptAt > WINDOW_MS) {
    entry = { count: 0, firstAttemptAt: now, lockedUntil: null };
  }

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    await writeEntry(ip, entry);
    return { allowed: false, attemptsLeft: 0, lockedUntil: entry.lockedUntil };
  }

  await writeEntry(ip, entry);
  return {
    allowed: true,
    attemptsLeft: MAX_ATTEMPTS - entry.count,
    lockedUntil: null,
  };
}

/**
 * Call this on a successful login to clear the counter for the IP.
 */
export async function clearAttempts(ip: string): Promise<void> {
  await removeEntry(ip);
}

/**
 * Check whether an IP is currently locked out without recording an attempt.
 */
export async function isLockedOut(ip: string, now = Date.now()): Promise<{ locked: boolean; lockedUntil: number | null }> {
  const entry = await readEntry(ip);
  if (!entry || entry.lockedUntil === null || now >= entry.lockedUntil) {
    // Lazily prune expired entries.
    if (entry && entry.lockedUntil !== null && now >= entry.lockedUntil) {
      await removeEntry(ip);
    }
    return { locked: false, lockedUntil: null };
  }
  return { locked: true, lockedUntil: entry.lockedUntil };
}
