'use client';

import { useState } from 'react';
import { ScenarioPlayer } from '@/components/scenario-player';
import { Badge } from '@/components/ui';
import { SCENARIOS } from '@/lib/content/scenarios';

export default function AuditSimulatorPage() {
  const [activeId, setActiveId] = useState(SCENARIOS[0].id);
  const active = SCENARIOS.find((s) => s.id === activeId)!;

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">Audit scenario simulator</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Play the GRC Lead in branching decision trees. Every choice gives instant feedback and a score.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => setActiveId(scenario.id)}
            className={`min-h-tap rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              activeId === scenario.id
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-200'
                : 'border-slate-200 hover:border-brand-400 dark:border-white/10'
            }`}
          >
            {scenario.title}
          </button>
        ))}
      </div>

      <div className="shield-card">
        <Badge tone="violet">Briefing</Badge>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{active.briefing}</p>
      </div>

      {/* Keyed by scenario id so switching resets the player state. */}
      <ScenarioPlayer key={active.id} scenario={active} />
    </div>
  );
}
