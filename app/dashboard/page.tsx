'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useProgress } from '@/components/progress-provider';
import { Badge, ProgressBar, ProgressRing, SectionHeading, StatCard } from '@/components/ui';
import {
  ACCENT_CLASSES,
  ACCENT_TEXT,
  computeCapstoneProgress,
  computeTrackProgress,
  overallPercent,
} from '@/lib/progress-utils';
import { totalLessons } from '@/lib/content/tracks';

export default function DashboardPage() {
  const { lessons, capstoneSteps, evidence, quizAttempts, email, storage, loading, identify } = useProgress();
  const [draftEmail, setDraftEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const trackProgress = useMemo(() => computeTrackProgress(lessons), [lessons]);
  const capstoneProgress = useMemo(() => computeCapstoneProgress(capstoneSteps, evidence), [capstoneSteps, evidence]);
  const completed = trackProgress.reduce((sum, t) => sum + t.completedLessons, 0);
  const overall = overallPercent(trackProgress);
  const capstonesPassed = capstoneProgress.filter((c) => c.evaluation.passed).length;
  const bestQuiz = quizAttempts.reduce(
    (best, a) => (a.score / a.maxScore > best ? a.score / a.maxScore : best),
    0,
  );

  return (
    <div className="space-y-6">
      <section className="shield-card overflow-hidden p-0">
        <div className="flex flex-col gap-4 bg-gradient-to-br from-brand-600 to-brand-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-100">Welcome back</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {email ? email.split('@')[0] : 'GRC learner'}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-brand-100">
              Four domain tracks, an interactive simulator and four hands-on capstone projects. Progress syncs
              across your laptop and phone.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-3">
            <ProgressRing value={overall} size={72} />
            <div className="text-sm">
              <p className="font-semibold">{completed} of {totalLessons()} lessons</p>
              <p className="text-brand-100">{capstonesPassed} of 4 capstones passed</p>
            </div>
          </div>
        </div>

        {!email && !loading && (
          <form
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center"
            onSubmit={async (e) => {
              e.preventDefault();
              setStatus(null);
              const ok = await identify(draftEmail);
              setStatus(ok ? 'Progress sync enabled for this device.' : 'Enter a valid email address.');
            }}
          >
            <label htmlFor="sync-email" className="text-sm font-medium">
              Sync progress across devices
            </label>
            <input
              id="sync-email"
              type="email"
              required
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
              placeholder="you@example.com"
              className="field sm:max-w-xs"
            />
            <button type="submit" className="btn-primary">
              Enable sync
            </button>
            {status && <span className="text-xs text-slate-500 dark:text-slate-400">{status}</span>}
          </form>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Overall progress" value={`${overall}%`} hint={`${completed}/${totalLessons()} lessons`} />
        <StatCard label="Capstones passed" value={`${capstonesPassed}/4`} hint="80% rubric and checklist" />
        <StatCard label="Best quiz score" value={bestQuiz > 0 ? `${Math.round(bestQuiz * 100)}%` : '—'} hint={`${quizAttempts.length} attempts`} />
        <StatCard
          label="Sync status"
          value={storage === 'postgres' ? 'Cloud' : 'Local'}
          hint={storage === 'postgres' ? 'PostgreSQL' : 'Browser session'}
        />
      </section>

      <section>
        <SectionHeading title="Domain tracks" subtitle="Tap a track to open its modules." action={{ href: '/tracks', label: 'View all' }} />
        <div className="grid gap-3 md:grid-cols-2">
          {trackProgress.map(({ track, percent, completedLessons, totalLessons: total, status }) => (
            <Link key={track.id} href={`/tracks/${track.slug}`} className="shield-card shield-card-hover block">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${ACCENT_CLASSES[track.accent]}`} />
                    <h3 className="truncate font-semibold">{track.title}</h3>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{track.summary}</p>
                </div>
                <Badge tone={status === 'complete' ? 'emerald' : status === 'in_progress' ? 'brand' : 'slate'}>
                  {status === 'complete' ? 'Complete' : status === 'in_progress' ? 'In progress' : 'Not started'}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={percent} className="flex-1" />
                <span className={`text-xs font-semibold ${ACCENT_TEXT[track.accent]}`}>
                  {completedLessons}/{total}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          title="Capstone Lab Hub"
          subtitle="Portfolio-grade projects with tools, setup, deliverables and auto-evaluated rubrics."
          action={{ href: '/capstone', label: 'Open lab' }}
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {capstoneProgress.map(({ project, evaluation }) => (
            <Link key={project.id} href={`/capstone/${project.slug}`} className="shield-card shield-card-hover flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold leading-snug">{project.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{project.objective}</p>
              </div>
              <div className="mt-3">
                <ProgressBar value={evaluation.rubricScore} />
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Rubric {evaluation.rubricScore}%</span>
                  <span>Steps {evaluation.stepCompletion}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Link href="/audit-simulator" className="shield-card shield-card-hover">
          <h3 className="font-semibold">Audit scenario simulator</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Play the GRC Lead in branching decision trees with instant feedback.
          </p>
        </Link>
        <Link href="/capstone" className="shield-card shield-card-hover">
          <h3 className="font-semibold">Guided lab workflows</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Step-by-step checklists with copy-ready Docker and CLI commands.
          </p>
        </Link>
        <Link href="/explainer" className="shield-card shield-card-hover">
          <h3 className="font-semibold">AI regulatory explainer</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Translate legal and framework jargon into plain English.
          </p>
        </Link>
      </section>
    </div>
  );
}
