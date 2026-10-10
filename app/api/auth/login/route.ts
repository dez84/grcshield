import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { apiError, apiOk, currentUserId, DEVICE_COOKIE, withSessionCookie, withUserCookies } from '@/lib/api';
import { isEmail, newSessionToken, verifyPassword } from '@/lib/auth';
import {
  createSession,
  getAccountByEmail,
  getUserEmail,
  mergeUsers,
  resolveUser,
  touchLastLogin,
} from '@/lib/db/store';

export const dynamic = 'force-dynamic';

/**
 * Signs a learner in and folds any anonymous device progress into the account.
 * Body: { email, password }.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { email, password } = (body ?? {}) as { email?: string; password?: string };
  if (!isEmail(email)) return apiError('A valid email address is required');
  if (typeof password !== 'string' || password.length < 1) return apiError('Password is required');

  const account = await getAccountByEmail(email);
  if (!account) return apiError('Email or password is incorrect', 401);
  if (!account.passwordHash) {
    return apiError(
      'This account was created with email sync only. Register to set a password for it.',
      409,
    );
  }
  const valid = await verifyPassword(password, account.passwordHash);
  if (!valid) return apiError('Email or password is incorrect', 401);

  const store = await cookies();
  const deviceId = store.get(DEVICE_COOKIE)?.value ?? null;
  const currentId = await currentUserId(false);
  const anonId = currentId ?? (deviceId ? await resolveUser(null, undefined, undefined, deviceId, false) : null);
  if (anonId && anonId !== account.id) {
    await mergeUsers(anonId, account.id);
  }

  const token = newSessionToken();
  await createSession(account.id, token);
  await touchLastLogin(account.id);

  const resolvedEmail = (await getUserEmail(account.id)) ?? account.email ?? '';
  const res = apiOk({ userId: account.id, email: account.email });
  withSessionCookie(res, token);
  withUserCookies(res, account.id, resolvedEmail);
  return res;
}
