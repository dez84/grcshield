'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui';
import { useProgress } from '@/components/progress-provider';

/** Account hub: shows the current identity and offers sign in, sync, or sign out. */
export default function AccountPage() {
  const { authenticated, email, displayName, role, storage, loading, identify, logout } = useProgress();
  const router = useRouter();
  const [draftEmail, setDraftEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <header className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">Account</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage how your progress is stored and synced across devices.
        </p>
      </header>

      <section className="shield-card space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Signed in as
            </p>
            <p className="mt-1 text-lg font-semibold">
              {loading ? '…' : email ?? 'Anonymous learner'}
            </p>
            {displayName && <p className="text-sm text-slate-500 dark:text-slate-400">{displayName}</p>}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {authenticated ? <Badge tone="emerald">Account</Badge> : <Badge tone="amber">Device only</Badge>}
            {storage && <Badge tone="slate">{storage === 'postgres' ? 'Synced' : 'Local storage'}</Badge>}
          </div>
        </div>

        {role && <p className="text-xs text-slate-500 dark:text-slate-400">Role: {role}</p>}

        {authenticated ? (
          <button
            type="button"
            className="btn-ghost"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              await logout();
              router.push('/dashboard');
            }}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Link href="/login" className="btn-primary">
                Sign in
              </Link>
              <Link href="/register" className="btn-ghost">
                Create account
              </Link>
            </div>

            <form
              className="space-y-2 border-t border-slate-200 pt-4 dark:border-white/10"
              onSubmit={async (e) => {
                e.preventDefault();
                setStatus(null);
                const ok = await identify(draftEmail);
                setStatus(ok ? 'Progress sync enabled for this device.' : 'Enter a valid email address.');
              }}
            >
              <label htmlFor="account-email" className="block text-sm font-medium">
                Or sync by email without a password
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="account-email"
                  type="email"
                  required
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="field sm:max-w-xs"
                />
                <button type="submit" className="btn-ghost">
                  Enable sync
                </button>
              </div>
              {status && <p className="text-xs text-slate-500 dark:text-slate-400">{status}</p>}
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
