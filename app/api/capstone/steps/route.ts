import { NextRequest } from 'next/server';
import { apiError, apiOk, currentUserId } from '@/lib/api';
import { CAPSTONES_BY_ID } from '@/lib/content/capstones';
import { getCapstoneSteps, getEvidence, saveCapstoneStep } from '@/lib/db/store';
import { evaluateCapstone } from '@/lib/evaluate';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return apiOk({ capstoneSteps: [] });
  return apiOk({ capstoneSteps: await getCapstoneSteps(userId) });
}

/** Toggles a capstone step and returns the recomputed auto-evaluation. */
export async function POST(req: NextRequest) {
  const userId = await currentUserId(true);
  if (!userId) return apiError('Could not resolve user identity', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { projectId, stepId, complete } = (body ?? {}) as {
    projectId?: string;
    stepId?: string;
    complete?: boolean;
  };

  if (!projectId || !CAPSTONES_BY_ID[projectId]) return apiError('Unknown projectId');
  const project = CAPSTONES_BY_ID[projectId];
  if (!stepId || !project.steps.some((s) => s.id === stepId)) return apiError('Unknown stepId for project');

  await saveCapstoneStep(userId, projectId, stepId, Boolean(complete));

  const [steps, evidence] = await Promise.all([
    getCapstoneSteps(userId),
    getEvidence(userId, projectId),
  ]);
  const evaluation = evaluateCapstone(project, steps, evidence);

  return apiOk({ stepId, complete: Boolean(complete), evaluation });
}
