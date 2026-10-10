'use client';

import { useState } from 'react';
import { useProgress, type QuizResult } from './progress-provider';
import { Badge, ProgressBar } from './ui';
import type { Quiz } from '@/lib/content/quizzes';

export function QuizRunner({ quiz, lessonId }: { quiz: Quiz; lessonId?: string }) {
  const { submitQuiz } = useProgress();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [summary, setSummary] = useState<{ score: number; maxScore: number; passed: boolean } | null>(null);
  const [pending, setPending] = useState(false);

  const question = quiz.questions[index];
  const answered = answers[question.id];

  async function submit() {
    setPending(true);
    try {
      const outcome = await submitQuiz(quiz.id, answers, lessonId);
      if (outcome) {
        setResults(outcome.results);
        setSummary({ score: outcome.score, maxScore: outcome.maxScore, passed: outcome.passed });
      }
    } finally {
      setPending(false);
    }
  }

  if (results && summary) {
    const pct = Math.round((summary.score / summary.maxScore) * 100);
    return (
      <section className="shield-card animate-fade-up space-y-3">
        <Badge tone={summary.passed ? 'emerald' : 'amber'}>
          {summary.passed ? 'Passed' : 'Keep practising'}
        </Badge>
        <h2 className="text-lg font-bold">
          Score {summary.score}/{summary.maxScore} ({pct}%)
        </h2>
        <ul className="space-y-3">
          {quiz.questions.map((q, i) => {
            const r = results.find((x) => x.questionId === q.id);
            const chosenLabel = q.options.find((o) => o.id === r?.chosen)?.label ?? 'No answer';
            const correctLabel = q.options.find((o) => o.isCorrect)?.label ?? '';
            return (
              <li key={q.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.prompt}
                  </p>
                  <Badge tone={r?.isCorrect ? 'emerald' : 'rose'}>{r?.isCorrect ? 'Correct' : 'Incorrect'}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Your answer: {chosenLabel}
                  {!r?.isCorrect && <> · Correct: {correctLabel}</>}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{q.explanation}</p>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setAnswers({});
            setResults(null);
            setSummary(null);
            setIndex(0);
          }}
        >
          Retake quiz
        </button>
      </section>
    );
  }

  const isLast = index === quiz.questions.length - 1;
  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  return (
    <section className="shield-card animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <Badge tone="brand">{quiz.title}</Badge>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Question {index + 1} of {quiz.questions.length}
        </span>
      </div>
      <ProgressBar value={((index + (answered ? 1 : 0)) / quiz.questions.length) * 100} className="mt-3" />

      <p className="mt-4 text-base font-medium leading-relaxed">{question.prompt}</p>

      <div className="mt-3 space-y-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
            className={`w-full min-h-tap rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              answered === option.id
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                : 'border-slate-200 hover:border-brand-400 dark:border-white/10'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-between gap-3">
        <button
          type="button"
          className="btn-ghost"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </button>
        {isLast ? (
          <button type="button" className="btn-primary" disabled={!allAnswered || pending} onClick={submit}>
            {pending ? 'Scoring…' : 'Submit answers'}
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            disabled={!answered}
            onClick={() => setIndex((i) => Math.min(quiz.questions.length - 1, i + 1))}
          >
            Next
          </button>
        )}
      </div>
    </section>
  );
}
