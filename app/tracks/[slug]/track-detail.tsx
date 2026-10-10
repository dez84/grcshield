'use client';

import Link from 'next/link';
import { useProgress } from '@/components/progress-provider';
import { ProgressBar } from '@/components/ui';
import { ACCENT_CLASSES } from '@/lib/progress-utils';
import type { Track } from '@/lib/content/tracks';

export function TrackDetail({ track }: { track: Track }) {
  const { lessons } = useProgress();
  const statusFor = (id: string) => lessons.find((l) => l.lessonId === id)?.status;
  const allLessons = track.modules.flatMap((m) => m.lessons);
  const completed = allLessons.filter((l) => statusFor(l.id) === 'complete').length;
  const percent = allLessons.length ? Math.round((completed / allLessons.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <header className="shield-card">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${ACCENT_CLASSES[track.accent]}`} />
          <h1 className="text-xl font-bold tracking-tight">{track.title}</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{track.summary}</p>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={percent} className="flex-1" />
          <span className="text-sm font-semibold">{completed}/{allLessons.length}</span>
        </div>
      </header>

      {track.modules.map((module) => (
        <section key={module.id} className="shield-card">
          <h2 className="text-base font-bold">{module.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{module.summary}</p>
          <ul className="mt-3 space-y-2">
            {module.lessons.map((lesson) => {
              const status = statusFor(lesson.id);
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/tracks/${track.slug}/${lesson.id}`}
                    className="flex min-h-tap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:border-brand-400 dark:border-white/10"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${
                          status === 'complete'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                        }`}
                        aria-hidden="true"
                      >
                        {status === 'complete' ? '✓' : ''}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{lesson.title}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                          {lesson.kind === 'scenario'
                            ? 'Scenario simulator'
                            : lesson.kind === 'quiz'
                              ? 'Mini-quiz'
                              : 'Micro-lesson'}{' '}
                          · {lesson.estMinutes} min
                        </span>
                      </span>
                    </span>
                    <span className="text-slate-400" aria-hidden="true">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
