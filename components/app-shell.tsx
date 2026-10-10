'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './theme-provider';
import { useProgress } from './progress-provider';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/tracks', label: 'Tracks', icon: 'stack' },
  { href: '/audit-simulator', label: 'Simulator', icon: 'branch' },
  { href: '/capstone', label: 'Capstone Lab', icon: 'flask' },
  { href: '/explainer', label: 'Explainer', icon: 'translate' },
] as const;

function Icon({ name, className }: { name: string; className?: string }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...common}>
      {name === 'grid' && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      )}
      {name === 'stack' && (
        <>
          <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
          <path d="M3 12.5 12 17l9-4.5" />
          <path d="M3 17 12 21.5 21 17" />
        </>
      )}
      {name === 'branch' && (
        <>
          <circle cx="6" cy="5" r="2.2" />
          <circle cx="6" cy="19" r="2.2" />
          <circle cx="18" cy="12" r="2.2" />
          <path d="M6 7.2v9.6M8.2 5.6h5.3A2.5 2.5 0 0 1 16 8.1v1.7M8.2 18.4h5.3A2.5 2.5 0 0 0 16 15.9v-1.7" />
        </>
      )}
      {name === 'flask' && (
        <>
          <path d="M9 3h6M10 3v6.2L5.4 17A2.2 2.2 0 0 0 7.3 20.5h9.4A2.2 2.2 0 0 0 18.6 17L14 9.2V3" />
          <path d="M7.2 14.5h9.6" />
        </>
      )}
      {name === 'translate' && (
        <>
          <path d="M4 5h9M8.5 5c0 4.5-2 7.5-4.5 9" />
          <path d="M6 9.5c1.2 2.5 3 4.4 5.5 5.5" />
          <path d="m13 20 3.5-8 3.5 8M14.4 17.2h4.2" />
        </>
      )}
      {name === 'sun' && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}
      {name === 'moon' && <path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />}
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { email, storage } = useProgress();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-shield-ink/85">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="flex min-h-tap items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" />
                <path d="m9.2 12 2 2 3.6-3.8" />
              </svg>
            </span>
            <span className="text-base font-bold tracking-tight">GRC Shield</span>
          </Link>

          <div className="flex items-center gap-2">
            {storage && (
              <span className="hidden rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500 sm:inline dark:border-white/10 dark:text-slate-400">
                {storage === 'postgres' ? 'Synced' : 'Local'}
              </span>
            )}
            <span className="hidden max-w-[14rem] truncate text-xs text-slate-500 md:inline dark:text-slate-400">
              {email ?? 'Anonymous learner'}
            </span>
            <button
              type="button"
              onClick={toggle}
              className="tap-target grid place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom padding clears the fixed mobile nav and the safe area. */}
      <main className="flex-1 px-4 pb-28 pt-4 md:pb-10">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur md:static md:border-t-0 md:bg-transparent md:backdrop-blur-none dark:border-white/10 dark:bg-shield-ink/95"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Primary"
      >
        <ul className="mx-auto flex max-w-7xl items-stretch justify-between px-2 md:justify-center md:gap-2 md:px-4 md:py-2">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="flex-1 md:flex-none">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-tap flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors md:flex-row md:text-sm ${
                    active
                      ? 'text-brand-600 dark:text-brand-300'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
