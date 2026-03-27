/**
 * Admin session management.
 *
 * On successful password verification the server issues a signed, httpOnly
 * cookie ("admin_session") that contains a JWT with role="admin".  Every
 * admin tRPC procedure verifies this cookie before executing.
 *
 * The JWT is signed with JWT_SECRET (same key used by the Manus OAuth layer)
 * so no new secret is required.
 */

import { SignJWT, jwtVerify } from 'jose';
import type { Request, Response } from 'express';
import { ENV } from './env';

const ADMIN_COOKIE = 'admin_session';
const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

function getSecret(): Uint8Array {
  const secret = ENV.cookieSecret;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

function getCookieOptions(req: Request) {
  const isSecure =
    req.protocol === 'https' ||
    (req.headers['x-forwarded-proto'] as string | undefined)
      ?.split(',')[0]
      ?.trim()
      .toLowerCase() === 'https';

  return {
    httpOnly: true,
    path: '/',
    sameSite: 'none' as const,
    secure: isSecure,
    maxAge: ADMIN_SESSION_TTL_SECONDS * 1000,
  };
}

/** Issue a signed admin session cookie on the response. */
export async function issueAdminSession(req: Request, res: Response): Promise<void> {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  res.cookie(ADMIN_COOKIE, token, getCookieOptions(req));
}

/** Clear the admin session cookie. */
export function clearAdminSession(req: Request, res: Response): void {
  res.clearCookie(ADMIN_COOKIE, { ...getCookieOptions(req), maxAge: -1 });
}

/** Verify the admin session cookie.  Returns true if valid, false otherwise. */
export async function verifyAdminSession(req: Request): Promise<boolean> {
  const token = req.cookies?.[ADMIN_COOKIE];
  if (!token || typeof token !== 'string') return false;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
