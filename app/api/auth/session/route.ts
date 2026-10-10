import { cookies } from 'next/headers';
import { apiOk, currentUserId, SESSION_COOKIE } from '@/lib/api';
import { getAccount, usingDatabase } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

/** Reports the signed-in account, if any, plus how progress is being stored. */
export async function GET() {
  const store = await cookies();
  const hasSession = Boolean(store.get(SESSION_COOKIE)?.value);
  const userId = await currentUserId(false);
  const account = userId ? await getAccount(userId) : null;

  return apiOk({
    authenticated: Boolean(hasSession && account),
    userId,
    email: account?.email ?? null,
    displayName: account?.displayName ?? null,
    role: account?.role ?? null,
    hasPassword: Boolean(account?.passwordHash),
    storage: (await usingDatabase()) ? 'postgres' : 'memory',
  });
}
