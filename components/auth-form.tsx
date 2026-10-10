'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProgress } from './progress-provider';

type Mode = 'login' | 'register';

/**
 * Shared sign-in and registration form. Uses the credential auth provider and
 * redirects to the dashboard on success.
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const { login, register } = useProgress();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isRegister = mode === 'register';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = isRegister ? await register(email, password, displayName || undefined) : await login(email, password);
    setPending(false);
    if (result.ok) {
      router.push('/dashboard');
    } else {
      setError(result.error ?? 'Something went wrong');
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <header className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">{isRegister ? 'Create your account' : 'Sign in'}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isRegister
            ? 'Your progress on this device is merged into the new account so you can continue on any device.'
            : 'Sign in to pick up your lessons and capstone work where you left off.'}
        </p>
      </header>

      <form onSubmit={submit} className="shield-card space-y-4">
        {isRegister && (
          <div className="space-y-1.5">
            <label htmlFor="display-name" className="block text-sm font-medium">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex"
              className="field"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="field"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="auth-password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isRegister ? 'At least 8 characters, with a number' : 'Your password'}
            className="field"
          />
          {isRegister && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use at least 8 characters, including a letter and a number.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{' '}
              <Link href="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                Create an account
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
