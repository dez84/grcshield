'use client';

import { useEffect, useState } from 'react';

/**
 * Registers the service worker and surfaces an "Add to Home Screen" prompt.
 * On Samsung Galaxy devices with Chrome, this enables a native-like launch.
 */
export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<(Event & { prompt?: () => Promise<void> }) | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* offline support is best-effort */
      });
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as Event & { prompt?: () => Promise<void> });
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!installEvent || dismissed) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md rounded-2xl border border-brand-200 bg-white p-3 shadow-lg md:bottom-6 dark:border-brand-800 dark:bg-shield-panel">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install GRC Shield</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Add to your home screen for fast, offline access.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={async () => {
            await installEvent.prompt?.();
            setInstallEvent(null);
          }}
        >
          Install
        </button>
        <button
          type="button"
          className="tap-target rounded-xl px-2 text-slate-400"
          aria-label="Dismiss install prompt"
          onClick={() => setDismissed(true)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
