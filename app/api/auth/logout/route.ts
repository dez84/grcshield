import { cookies } from 'next/headers';
import { apiOk, SESSION_COOKIE, withSignedOutCookies } from '@/lib/api';
import { deleteSession } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

/** Signs the learner out by revoking the session and clearing cookies. */
export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value ?? null;
  if (token) await deleteSession(token);
  const res = apiOk({ signedOut: true });
  return withSignedOutCookies(res);
}
