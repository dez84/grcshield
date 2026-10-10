'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useProgress } from '@/components/progress-provider';
import { Badge, ProgressBar, SectionHeading } from '@/components/ui';
import { ACCENT_CLASSES, ACCENT_TEXT, computeTrackProgress } from '@/lib/progress-utils';

export default function TracksPage() {
  const { lessons } = useProgress();
  const trackProgress = useMemo(() => computeTrackProgress(lessons), [lessons]);

  return (
    <div className="space-y-6">
      <SectionHeading title="Domain tracks" subtitle="Four tracks covering governance, risk, compliance and audit." />
      <div className="grid gap-4 lg:grid-cols-2">
        {trackProgress.map(({ track, percent, completedLessons, totalLessons, status }) => (
          <div key={track.id} className="shield-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${ACCENT_CLASSES[track.accent]}`} />
                  <h2 className="text-base font-bold">{track.title}</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{track.summary}</p>
              </div>
              <Badge tone={status === 'complete' ? 'emerald' : status === 'in_progress' ? 'brand' : 'slate'}>
                {completedLessons}/{totalLessons}
              </Badge>
            </div>

            <ProgressBar value={percent} className="mt-3" />

            <ul className="mt-3 space-y-2">
              {track.modules.map((module) => (
                <li key={module.id}>
                  <p className="text-sm font-semibold">{module.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{module.summary}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {module.lessons.map((lesson) => {
                      const done = lessons.find((l) => l.lessonId === lesson.id)?.status === 'complete';
                      return (
                        <Link
                          key={lesson.id}
                          href={`/tracks/${track.slug}/${lesson.id}`}
                          className={`pill min-h-tap border text-xs ${
                            done
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                              : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-transparent dark:text-slate-300'
                          }`}
                        >
                          {done && <span aria-hidden="true">✓</span>}
                          <span className="truncate">{lesson.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>

            <Link href={`/tracks/${track.slug}`} className={`mt-4 inline-block text-sm font-semibold ${ACCENT_TEXT[track.accent]}`}>
              Open track
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
