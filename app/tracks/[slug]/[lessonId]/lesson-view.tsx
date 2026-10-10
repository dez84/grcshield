'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useProgress } from '@/components/progress-provider';
import { Badge } from '@/components/ui';
import type { Lesson, Track } from '@/lib/content/tracks';
import type { Scenario } from '@/lib/content/scenarios';
import type { Quiz } from '@/lib/content/quizzes';
import { ScenarioPlayer } from '@/components/scenario-player';
import { QuizRunner } from '@/components/quiz-runner';

export function LessonView({
  track,
  lesson,
  scenario,
  quiz,
}: {
  track: Track;
  lesson: Lesson;
  scenario: Scenario | null;
  quiz: Quiz | null;
}) {
  const { setLesson, lessons } = useProgress();
  const current = lessons.find((l) => l.lessonId === lesson.id);
  const [saved, setSaved] = useState(false);

  const kindLabel =
    lesson.kind === 'scenario' ? 'Scenario simulator' : lesson.kind === 'quiz' ? 'Mini-quiz' : 'Micro-lesson';

  return (
    <article className="space-y-4">
      <header className="shield-card">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{kindLabel}</Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">{lesson.estMinutes} min</span>
          {current?.status === 'complete' && <Badge tone="emerald">Complete</Badge>}
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight">{lesson.title}</h1>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {lesson.body}
        </p>
      </header>

      {lesson.kind === 'micro' && (
        <div className="shield-card">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Read the concept, then mark it complete. Your progress syncs to your other devices.
          </p>
          <button
            type="button"
            className="btn-primary mt-3 w-full sm:w-auto"
            disabled={saved || current?.status === 'complete'}
            onClick={async () => {
              await setLesson(lesson.id, 'complete', null);
              setSaved(true);
            }}
          >
            {current?.status === 'complete' || saved ? 'Marked complete' : 'Mark as complete'}
          </button>
        </div>
      )}

      {lesson.kind === 'scenario' && scenario && (
        <ScenarioPlayer scenario={scenario} lessonId={lesson.id} />
      )}

      {lesson.kind === 'quiz' && quiz && <QuizRunner quiz={quiz} lessonId={lesson.id} />}

      <div className="flex justify-between gap-3 pb-2">
        <Link href={`/tracks/${track.slug}`} className="btn-ghost">
          Back to track
        </Link>
        <Link href="/dashboard" className="btn-ghost">
          Dashboard
        </Link>
      </div>
    </article>
  );
}
