import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionUser, resolveUser } from './db/store';

export const USER_COOKIE = 'grc_uid';
export const EMAIL_COOKIE = 'grc_email';
export const DEVICE_COOKIE = 'grc_device';
export const SESSION_COOKIE = 'grc_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;
const DEVICE_MAX_AGE = 60 * 60 * 24 * 365;

/** Standard JSON error envelope so clients can render feedback consistently. */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function apiOk<T>(data: T) {
  return NextResponse.json({ ok: true, ...data });
}

/**
 * Resolves (and creates if needed) the current user. Resolution order:
 *   1. a live session token from the credential provider
 *   2. a bound email cookie (email sync without a password)
 *   3. the anonymous device cookie, so a learner keeps progress before sign-up
 */
export async function currentUserId(createIfMissing = false): Promise<string | null> {
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE)?.value ?? null;
  if (sessionToken) {
    const sessionUser = await getSessionUser(sessionToken);
    if (sessionUser) return sessionUser;
  }

  const userId = store.get(USER_COOKIE)?.value ?? null;
  const email = store.get(EMAIL_COOKIE)?.value ?? null;
  const deviceId = store.get(DEVICE_COOKIE)?.value ?? null;
  if (!userId && !email && !deviceId) return null;
  // GET requests must not create rows, so pass create=false when we only read.
  return resolveUser(userId, email ?? undefined, undefined, deviceId, createIfMissing);
}

/** Persists the resolved identity back onto the response cookies. */
export function withUserCookies<T>(res: NextResponse<T>, userId: string, email: string): NextResponse<T> {
  res.cookies.set(USER_COOKIE, userId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: COOKIE_MAX_AGE });
  res.cookies.set(EMAIL_COOKIE, email, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: COOKIE_MAX_AGE });
  return res;
}

/** Sets the session cookie for a signed-in account. */
export function withSessionCookie<T>(res: NextResponse<T>, token: string): NextResponse<T> {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

/** Clears the session and identity cookies on sign-out. */
export function withSignedOutCookies<T>(res: NextResponse<T>): NextResponse<T> {
  for (const name of [SESSION_COOKIE, USER_COOKIE, EMAIL_COOKIE]) {
    res.cookies.set(name, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  }
  return res;
}

/** Ensures the device cookie survives even when middleware is skipped in dev. */
export function withDeviceCookie<T>(res: NextResponse<T>, deviceId: string): NextResponse<T> {
  res.cookies.set(DEVICE_COOKIE, deviceId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: DEVICE_MAX_AGE,
  });
  return res;
}
