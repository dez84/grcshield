import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { apiError, apiOk, currentUserId, DEVICE_COOKIE, withSessionCookie, withUserCookies } from '@/lib/api';
import { checkPasswordStrength, hashPassword, isEmail, newSessionToken } from '@/lib/auth';
import {
  createSession,
  getAccountByEmail,
  getAccount,
  mergeUsers,
  resolveUser,
  setPasswordHash,
  touchLastLogin,
} from '@/lib/db/store';

export const dynamic = 'force-dynamic';

/**
 * Registers a new account, or completes an email-sync-only account by setting a
 * password. Anonymous device progress is merged into the new account.
 * Body: { email, password, displayName? }.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { email, password, displayName } = (body ?? {}) as {
    email?: string;
    password?: string;
    displayName?: string;
  };
  if (!isEmail(email)) return apiError('A valid email address is required');
  const strength = checkPasswordStrength(password ?? '');
  if (!strength.ok) return apiError(strength.error ?? 'Password is not strong enough');

  const normalised = email.trim().toLowerCase();
  const existing = await getAccountByEmail(normalised);
  let targetId: string;

  if (existing) {
    if (existing.passwordHash) {
      return apiError('An account with this email already exists. Sign in instead.', 409);
    }
    // The email was previously used for sync only; claim it with a password.
    targetId = existing.id;
    await setPasswordHash(targetId, await hashPassword(password as string));
  } else {
    const created = await resolveUser(null, normalised, displayName, null, true);
    if (!created) return apiError('Could not create account', 500);
    targetId = created;
    await setPasswordHash(targetId, await hashPassword(password as string));
  }

  const store = await cookies();
  const deviceId = store.get(DEVICE_COOKIE)?.value ?? null;
  const currentId = await currentUserId(false);
  const anonId = currentId ?? (deviceId ? await resolveUser(null, undefined, undefined, deviceId, false) : null);
  if (anonId && anonId !== targetId) {
    await mergeUsers(anonId, targetId);
  }

  const token = newSessionToken();
  await createSession(targetId, token);
  await touchLastLogin(targetId);

  const account = await getAccount(targetId);
  const res = apiOk({ userId: targetId, email: account?.email ?? normalised });
  withSessionCookie(res, token);
  withUserCookies(res, targetId, account?.email ?? normalised);
  return res;
}
