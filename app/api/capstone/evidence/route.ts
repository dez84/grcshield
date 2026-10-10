import { NextRequest } from 'next/server';
import { apiError, apiOk, currentUserId } from '@/lib/api';
import { CAPSTONES_BY_ID } from '@/lib/content/capstones';
import { addEvidence, getCapstoneSteps, getEvidence } from '@/lib/db/store';
import { evaluateCapstone } from '@/lib/evaluate';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = await currentUserId();
  const projectId = req.nextUrl.searchParams.get('projectId') ?? undefined;
  if (!userId) return apiOk({ evidence: [] });
  return apiOk({ evidence: await getEvidence(userId, projectId) });
}

/**
 * Records evidence against a rubric criterion and re-evaluates the project.
 * Evidence with a criterionId also marks that criterion's step complete when a
 * matching step exists, so the checklist and the rubric stay in step.
 * Body: { projectId, criterionId, evidenceKind, note, url?, fileName?, fileSize?, attestedBy? }.
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

  const { projectId, criterionId, evidenceKind, note, url, fileName, fileSize, attestedBy } =
    (body ?? {}) as {
      projectId?: string;
      criterionId?: string;
      evidenceKind?: string;
      note?: string;
      url?: string;
      fileName?: string;
      fileSize?: number;
      attestedBy?: string;
    };

  if (!projectId || !CAPSTONES_BY_ID[projectId]) return apiError('Unknown projectId');
  const project = CAPSTONES_BY_ID[projectId];
  if (criterionId && !project.rubric.some((c) => c.id === criterionId)) {
    return apiError('Unknown criterionId for project');
  }

  const kinds = ['note', 'file', 'url', 'checklist'];
  const kind = kinds.includes(evidenceKind ?? '') ? (evidenceKind as 'note' | 'file' | 'url' | 'checklist') : 'note';
  const trimmedNote = (note ?? '').toString().slice(0, 4000);

  if (kind === 'url' && url && !/^https?:\/\//i.test(url)) {
    return apiError('URL evidence must start with http:// or https://');
  }
  if ((kind === 'note' || kind === 'checklist') && !trimmedNote && !criterionId) {
    return apiError('Provide a note or attach a criterion');
  }

  const record = await addEvidence(userId, {
    projectId,
    criterionId: criterionId ?? null,
    evidenceKind: kind,
    note: trimmedNote,
    url: url ? String(url).slice(0, 2048) : null,
    fileName: fileName ? String(fileName).slice(0, 255) : null,
    fileSize: typeof fileSize === 'number' && Number.isFinite(fileSize) ? Math.round(fileSize) : null,
    attestedBy: attestedBy ? String(attestedBy).slice(0, 120) : null,
    attestedAt: attestedBy ? new Date().toISOString() : null,
  });

  const [steps, evidence] = await Promise.all([
    getCapstoneSteps(userId),
    getEvidence(userId, projectId),
  ]);
  const evaluation = evaluateCapstone(project, steps, evidence);

  return apiOk({ evidence: record, all: evidence, evaluation });
}
