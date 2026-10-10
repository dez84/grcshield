import { NextRequest } from 'next/server';
import { apiError, apiOk, currentUserId } from '@/lib/api';
import { SCENARIOS_BY_ID } from '@/lib/content/scenarios';
import { recordScenarioDecision, saveLessonProgress } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

/**
 * Records a scenario decision and returns the branch the learner follows plus
 * instant feedback. Grading is server-side so the tree logic stays authoritative.
 * Body: { scenarioId, nodeId, optionId, lessonId? }.
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

  const { scenarioId, nodeId, optionId, lessonId } = (body ?? {}) as {
    scenarioId?: string;
    nodeId?: string;
    optionId?: string;
    lessonId?: string;
  };

  if (!scenarioId || !SCENARIOS_BY_ID[scenarioId]) return apiError('Unknown scenarioId');
  const scenario = SCENARIOS_BY_ID[scenarioId];
  const node = scenario.nodes.find((n) => n.id === nodeId);
  if (!node) return apiError('Unknown nodeId for scenario');
  const option = node.options.find((o) => o.id === optionId);
  if (!option) return apiError('Unknown optionId for node');

  await recordScenarioDecision(userId, scenarioId, node.id, option.id, option.scoreDelta);

  const nextNode = option.nextNodeId ? scenario.nodes.find((n) => n.id === option.nextNodeId) ?? null : null;

  if (!nextNode && lessonId) {
    await saveLessonProgress(userId, lessonId, 'complete', Math.max(option.scoreDelta, 0));
  }

  return apiOk({
    feedback: option.feedback,
    quality: option.quality,
    scoreDelta: option.scoreDelta,
    nextNode,
    terminal: !nextNode,
    debrief: !nextNode ? node.debrief ?? null : null,
  });
}
