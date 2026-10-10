'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useProgress } from '@/components/progress-provider';
import { Badge, ProgressBar, ProgressRing, SectionHeading } from '@/components/ui';
import { computeCapstoneProgress } from '@/lib/progress-utils';
import { rubricTotal } from '@/lib/content/capstones';

const DIFFICULTY_TONE = {
  intermediate: 'brand',
  advanced: 'amber',
  expert: 'rose',
} as const;

export default function CapstoneHubPage() {
  const { capstoneSteps, evidence } = useProgress();
  const progress = useMemo(() => computeCapstoneProgress(capstoneSteps, evidence), [capstoneSteps, evidence]);
  const passed = progress.filter((p) => p.evaluation.passed).length;
  const overallRubric = Math.round(
    progress.reduce((sum, p) => sum + p.evaluation.rubricScore, 0) / (progress.length || 1),
  );

  return (
    <div className="space-y-6">
      <header className="shield-card overflow-hidden p-0">
        <div className="bg-gradient-to-br from-shield-slate to-brand-900 p-5 text-white">
          <h1 className="text-2xl font-bold tracking-tight">Capstone Lab Hub</h1>
          <p className="mt-1 max-w-2xl text-sm text-brand-100">
            Four portfolio-grade projects. Each gives you setup requirements, recommended open-source tools,
            step-by-step tasks, evidence upload and an auto-evaluated rubric.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <ProgressRing value={overallRubric} size={64} />
            <div className="text-sm">
              <p className="font-semibold">{passed} of 4 projects passed</p>
              <p className="text-brand-100">Pass needs 80% rubric and checklist</p>
            </div>
          </div>
        </div>
      </header>

      <section>
        <SectionHeading title="Guided projects" subtitle="Open a project to work through the steps and submit evidence." />
        <div className="grid gap-4 lg:grid-cols-2">
          {progress.map(({ project, evaluation }) => (
            <Link key={project.id} href={`/capstone/${project.slug}`} className="shield-card shield-card-hover flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-bold leading-snug">{project.title}</h2>
                <Badge tone={DIFFICULTY_TONE[project.difficulty]}>{project.difficulty}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{project.objective}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tools.slice(0, 3).map((tool) => (
                  <span key={tool} className="pill bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {tool}
                  </span>
                ))}
                {project.tools.length > 3 && (
                  <span className="pill bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    +{project.tools.length - 3}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-24 text-xs text-slate-500 dark:text-slate-400">Rubric</span>
                  <ProgressBar value={evaluation.rubricScore} className="flex-1" />
                  <span className="w-10 text-right text-xs font-semibold">{evaluation.rubricScore}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 text-xs text-slate-500 dark:text-slate-400">Checklist</span>
                  <ProgressBar value={evaluation.stepCompletion} className="flex-1" />
                  <span className="w-10 text-right text-xs font-semibold">{evaluation.stepCompletion}%</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                <span>{project.steps.length} steps · {project.estHours}h estimated</span>
                <span>{rubricTotal(project)} rubric points</span>
              </div>

              {evaluation.passed && <div className="mt-3"><Badge tone="emerald">Passed</Badge></div>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
