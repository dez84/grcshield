'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui';
import { GLOSSARY } from '@/lib/content/glossary';

interface ExplainResult {
  mode: string;
  summary: string;
  whyItMatters: string | null;
  example: string | null;
  related: string[];
}

const MODE_LABEL: Record<string, string> = {
  offline: 'Offline glossary',
  model: 'Live model',
  'offline-fallback': 'Glossary fallback',
};

export default function ExplainerPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function explain() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({
          mode: data.mode,
          summary: data.summary,
          whyItMatters: data.whyItMatters,
          example: data.example,
          related: data.related ?? [],
        });
      } else {
        setError(data.error ?? 'Could not explain that');
      }
    } catch {
      setError('Network error');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">AI regulatory explainer</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Paste a legal clause or a framework term and get a plain-English breakdown. Works offline from a curated
          glossary, and uses a live model when a key is configured.
        </p>
      </header>

      <form
        className="shield-card space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void explain();
        }}
      >
        <label htmlFor="explain-text" className="block text-sm font-medium">
          What should we translate?
        </label>
        <textarea
          id="explain-text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="For example: the controller shall provide a copy of the personal data undergoing processing."
          className="field resize-y"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="btn-primary" disabled={pending || text.trim().length < 3}>
            {pending ? 'Translating…' : 'Translate to plain English'}
          </button>
          {result && <Badge tone={result.mode === 'model' ? 'brand' : 'slate'}>{MODE_LABEL[result.mode] ?? result.mode}</Badge>}
        </div>
        {error && <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}
      </form>

      {result && (
        <section className="shield-card animate-fade-up space-y-3" aria-live="polite">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">In plain English</h2>
            <p className="mt-1 text-base leading-relaxed">{result.summary}</p>
          </div>
          {result.whyItMatters && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Why it matters</h2>
              <p className="mt-1 text-sm leading-relaxed">{result.whyItMatters}</p>
            </div>
          )}
          {result.example && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Example</h2>
              <p className="mt-1 text-sm leading-relaxed">{result.example}</p>
            </div>
          )}
          {result.related.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.related.map((term) => (
                <Badge key={term} tone="brand">{term}</Badge>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="shield-card">
        <h2 className="text-base font-bold">Try one of these</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {GLOSSARY.slice(0, 8).map((entry) => (
            <button
              key={entry.term}
              type="button"
              className="pill min-h-tap border border-slate-200 bg-white text-slate-600 hover:border-brand-400 dark:border-white/10 dark:bg-transparent dark:text-slate-300"
              onClick={() => setText(entry.term)}
            >
              {entry.term}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
