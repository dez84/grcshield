'use client';

import { useMemo, useState } from 'react';
import { useProgress } from './progress-provider';
import { Badge, ProgressBar } from './ui';
import type { OptionQuality, Scenario, ScenarioNode } from '@/lib/content/scenarios';
import { scenarioMaxScore } from '@/lib/content/scenarios';

interface DecisionFeedback {
  optionId: string;
  feedback: string;
  quality: OptionQuality;
  scoreDelta: number;
  terminal: boolean;
  debrief: string | null;
}

const QUALITY_TONE: Record<OptionQuality, 'emerald' | 'brand' | 'amber' | 'rose'> = {
  best: 'emerald',
  ok: 'brand',
  poor: 'amber',
  breach: 'rose',
};

const QUALITY_LABEL: Record<OptionQuality, string> = {
  best: 'Best practice',
  ok: 'Acceptable',
  poor: 'Suboptimal',
  breach: 'Policy breach',
};

export function ScenarioPlayer({ scenario, lessonId }: { scenario: Scenario; lessonId?: string }) {
  const { setLesson } = useProgress();
  const root = useMemo(() => scenario.nodes.find((n) => n.id === scenario.rootNodeId)!, [scenario]);
  const maxScore = useMemo(() => scenarioMaxScore(scenario), [scenario]);

  const [node, setNode] = useState<ScenarioNode>(root);
  const [feedback, setFeedback] = useState<DecisionFeedback | null>(null);
  const [score, setScore] = useState(0);
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const [finished, setFinished] = useState(false);

  const decided = feedback !== null;

  async function choose(optionId: string) {
    setPending(true);
    try {
      const res = await fetch('/api/scenarios/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scenario.id, nodeId: node.id, optionId, lessonId }),
      });
      const data = await res.json();
      if (data.ok) {
        setFeedback({
          optionId,
          feedback: data.feedback,
          quality: data.quality,
          scoreDelta: data.scoreDelta,
          terminal: data.terminal,
          debrief: data.debrief,
        });
        setScore((s) => s + (data.scoreDelta ?? 0));
      }
    } finally {
      setPending(false);
    }
  }

  async function advance() {
    if (!feedback) return;
    if (feedback.terminal) {
      setFinished(true);
      if (lessonId) {
        const pct = maxScore ? Math.round((score / maxScore) * 100) : 100;
        await setLesson(lessonId, pct >= 60 ? 'complete' : 'in_progress', pct);
      }
      return;
    }
    const chosen = node.options.find((o) => o.id === feedback.optionId);
    const next = chosen?.nextNodeId ? scenario.nodes.find((n) => n.id === chosen.nextNodeId) : undefined;
    if (next) {
      setNode(next);
      setFeedback(null);
      setStep((s) => s + 1);
    }
  }

  if (finished) {
    const pct = maxScore ? Math.max(0, Math.round((score / maxScore) * 100)) : 100;
    return (
      <section className="shield-card animate-fade-up">
        <Badge tone={pct >= 80 ? 'emerald' : pct >= 50 ? 'brand' : 'amber'}>Simulator complete</Badge>
        <h2 className="mt-2 text-lg font-bold">
          You scored {score} of {maxScore} ({pct}%)
        </h2>
        {feedback?.debrief && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {feedback.debrief}
          </p>
        )}
        <button
          type="button"
          className="btn-ghost mt-3"
          onClick={() => {
            setNode(root);
            setFeedback(null);
            setScore(0);
            setStep(1);
            setFinished(false);
          }}
        >
          Replay scenario
        </button>
      </section>
    );
  }

  return (
    <section className="shield-card animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <Badge tone="violet">Role: {scenario.roleHint}</Badge>
        <span className="text-xs text-slate-500 dark:text-slate-400">Decision {step} of {scenario.nodes.length}</span>
      </div>
      <h2 className="mt-3 text-lg font-bold">{scenario.title}</h2>
      {step === 1 && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{scenario.briefing}</p>
      )}

      <ProgressBar value={(step / scenario.nodes.length) * 100} className="mt-3" />

      <p className="mt-4 text-base font-medium leading-relaxed">{node.prompt}</p>

      <div className="mt-3 space-y-2">
        {node.options.map((option) => {
          const isChosen = decided && feedback?.optionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={decided || pending}
              onClick={() => choose(option.id)}
              className={`w-full min-h-tap rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${
                isChosen
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                  : 'border-slate-200 hover:border-brand-400 dark:border-white/10'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-white/10" role="status" aria-live="polite">
          <Badge tone={QUALITY_TONE[feedback.quality]}>
            {QUALITY_LABEL[feedback.quality]} ({feedback.scoreDelta >= 0 ? '+' : ''}{feedback.scoreDelta})
          </Badge>
          <p className="mt-2 text-sm leading-relaxed">{feedback.feedback}</p>
          <button type="button" className="btn-primary mt-3 w-full sm:w-auto" onClick={advance}>
            {feedback.terminal ? 'See debrief' : 'Continue'}
          </button>
        </div>
      )}
    </section>
  );
}
