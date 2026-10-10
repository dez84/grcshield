import { NextRequest } from 'next/server';
import { apiError, apiOk, currentUserId } from '@/lib/api';
import { QUIZZES_BY_ID } from '@/lib/content/quizzes';
import { addQuizAttempt, getQuizAttempts, saveLessonProgress } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return apiOk({ quizAttempts: [] });
  return apiOk({ quizAttempts: await getQuizAttempts(userId) });
}

/**
 * Grades a quiz submission server-side so scores cannot be spoofed by the
 * client. Body: { quizId, answers: { [questionId]: optionId } }.
 */
export async function POST(req: NextRequest) {
  const userId = await currentUserId(true);
  if (!userId) return apiError('Could not resolve user identity', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { quizId, answers, lessonId } = (body ?? {}) as {
    quizId?: string;
    lessonId?: string;
    answers?: Record<string, string>;
  };

  if (!quizId || !QUIZZES_BY_ID[quizId]) return apiError('Unknown quizId');
  const quiz = QUIZZES_BY_ID[quizId];
  const submitted = answers ?? {};

  let score = 0;
  const results = quiz.questions.map((q) => {
    const chosen = submitted[q.id];
    const correctOption = q.options.find((o) => o.isCorrect);
    const isCorrect = Boolean(chosen && correctOption && chosen === correctOption.id);
    if (isCorrect) score += 1;
    return {
      questionId: q.id,
      chosen: chosen ?? null,
      correctOptionId: correctOption?.id ?? null,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const maxScore = quiz.questions.length;
  const attempt = await addQuizAttempt(userId, quizId, score, maxScore, results);

  if (lessonId) {
    const passed = score / maxScore >= 0.7;
    await saveLessonProgress(userId, lessonId, passed ? 'complete' : 'in_progress', score);
  }

  return apiOk({ attempt, results, score, maxScore, passed: score / maxScore >= 0.7 });
}
