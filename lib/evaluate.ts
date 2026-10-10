import type { CapstoneProject } from './content/capstones';
import type { CapstoneStepProgress, EvidenceRecord } from './db/store';

export interface CapstoneEvaluation {
  stepCompletion: number;
  rubricScore: number;
  passed: boolean;
  /** Per-criterion status so the UI can show exactly what is missing. */
  criteria: Array<{
    id: string;
    criterion: string;
    weight: number;
    satisfied: boolean;
    evidenceCount: number;
  }>;
}

/**
 * Auto-evaluates a capstone from checklist completion and submitted evidence.
 * A rubric criterion is satisfied when at least one piece of evidence is linked
 * to it. The rubric score is the weighted percentage of satisfied criteria.
 * The project passes at 80% or above.
 */
export function evaluateCapstone(
  project: CapstoneProject,
  steps: CapstoneStepProgress[],
  evidence: EvidenceRecord[],
): CapstoneEvaluation {
  const projectStepIds = new Set(project.steps.map((s) => s.id));
  const completedSteps = steps.filter((s) => s.complete && projectStepIds.has(s.stepId)).length;
  const stepCompletion = project.steps.length
    ? Math.round((completedSteps / project.steps.length) * 100)
    : 0;

  const evidenceForProject = evidence.filter((e) => e.projectId === project.id);

  const criteria = project.rubric.map((c) => {
    const linked = evidenceForProject.filter((e) => e.criterionId === c.id);
    return {
      id: c.id,
      criterion: c.criterion,
      weight: c.weight,
      satisfied: linked.length > 0,
      evidenceCount: linked.length,
    };
  });

  const totalWeight = project.rubric.reduce((sum, c) => sum + c.weight, 0) || 1;
  const earned = criteria.filter((c) => c.satisfied).reduce((sum, c) => sum + c.weight, 0);
  const rubricScore = Math.round((earned / totalWeight) * 100);

  // Require both checklist progress and rubric evidence to pass.
  const passed = rubricScore >= 80 && stepCompletion >= 80;

  return { stepCompletion, rubricScore, passed, criteria };
}
