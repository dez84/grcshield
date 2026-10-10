import { NextRequest } from 'next/server';
import { apiError, apiOk, currentUserId } from '@/lib/api';
import {
  getCapstoneSteps,
  getEvidence,
  getLessonProgress,
  getQuizAttempts,
  saveLessonProgress,
} from '@/lib/db/store';

export const dynamic = 'force-dynamic';

/** Returns the full cross-device progress snapshot for the current user. */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return apiOk({ lessons: [], capstoneSteps: [], evidence: [], quizAttempts: [], authenticated: false });

  const [lessons, capstoneSteps, evidence, quizAttempts] = await Promise.all([
    getLessonProgress(userId),
    getCapstoneSteps(userId),
    getEvidence(userId),
    getQuizAttempts(userId),
  ]);

  return apiOk({ authenticated: true, lessons, capstoneSteps, evidence, quizAttempts });
}

/** Updates lesson progress. Body: { lessonId, status, score? }. */
export async function POST(req: NextRequest) {
  const userId = await currentUserId(true);
  if (!userId) return apiError('Could not resolve user identity', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { lessonId, status, score } = (body ?? {}) as {
    lessonId?: string;
    status?: string;
    score?: number;
  };

  if (!lessonId || typeof lessonId !== 'string') return apiError('lessonId is required');
  if (!status || !['not_started', 'in_progress', 'complete'].includes(status)) {
    return apiError('status must be one of not_started, in_progress, complete');
  }
  const safeScore = typeof score === 'number' && Number.isFinite(score) ? Math.round(score) : null;

  await saveLessonProgress(userId, lessonId, status as 'not_started' | 'in_progress' | 'complete', safeScore);
  return apiOk({ lessonId, status, score: safeScore });
}
