import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { apiError, apiOk, currentUserId, DEVICE_COOKIE, withUserCookies } from '@/lib/api';
import { bindEmail, getUserEmail, resolveUser, usingDatabase } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

function isPlaceholderEmail(email: string | null): boolean {
  return Boolean(email && email.endsWith('@grc-shield.local'));
}

/** Reports the identity bound to the current session cookies. */
export async function GET() {
  const userId = await currentUserId();
  const rawEmail = userId ? await getUserEmail(userId) : null;
  return apiOk({
    userId,
    email: isPlaceholderEmail(rawEmail) ? null : rawEmail,
    storage: (await usingDatabase()) ? 'postgres' : 'memory',
  });
}

/**
 * Binds an email to the current device so progress follows the learner across
 * devices. Anonymous progress already recorded on this device merges into the
 * email account rather than being lost. Body: { email, displayName? }.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { email, displayName } = (body ?? {}) as { email?: string; displayName?: string };
  if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return apiError('A valid email address is required');
  }

  const store = await cookies();
  const deviceId = store.get(DEVICE_COOKIE)?.value ?? null;
  const existingUserId = await currentUserId(false);
  const userId = existingUserId ?? (await resolveUser(null, email, displayName, deviceId, true));
  if (!userId) return apiError('Could not create user', 500);

  const bound = await bindEmail(userId, email);
  const res = apiOk({ userId: bound.userId, email: bound.email });
  return withUserCookies(res, bound.userId, bound.email);
}
