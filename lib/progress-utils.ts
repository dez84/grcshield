import { TRACKS, type Track } from './content/tracks';
import { CAPSTONE_PROJECTS, type CapstoneProject } from './content/capstones';
import type { CapstoneStepRow, EvidenceRow, LessonProgressRow } from '@/components/progress-provider';
import { evaluateCapstone, type CapstoneEvaluation } from './evaluate';

export interface TrackProgress {
  track: Track;
  totalLessons: number;
  completedLessons: number;
  percent: number;
  status: 'not_started' | 'in_progress' | 'complete';
}

export function lessonProgressMap(rows: LessonProgressRow[]): Map<string, LessonProgressRow> {
  return new Map(rows.map((r) => [r.lessonId, r]));
}

export function computeTrackProgress(rows: LessonProgressRow[]): TrackProgress[] {
  const map = lessonProgressMap(rows);
  return TRACKS.map((track) => {
    const lessons = track.modules.flatMap((m) => m.lessons);
    const completed = lessons.filter((l) => map.get(l.id)?.status === 'complete').length;
    const started = lessons.filter((l) => map.has(l.id)).length;
    const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
    const status: TrackProgress['status'] =
      completed === lessons.length && lessons.length > 0
        ? 'complete'
        : started > 0
          ? 'in_progress'
          : 'not_started';
    return { track, totalLessons: lessons.length, completedLessons: completed, percent, status };
  });
}

export interface CapstoneProgress {
  project: CapstoneProject;
  evaluation: CapstoneEvaluation;
}

export function computeCapstoneProgress(
  steps: CapstoneStepRow[],
  evidence: EvidenceRow[],
): CapstoneProgress[] {
  return CAPSTONE_PROJECTS.map((project) => ({
    project,
    evaluation: evaluateCapstone(project, steps, evidence),
  }));
}

export function overallPercent(trackProgress: TrackProgress[]): number {
  const total = trackProgress.reduce((sum, t) => sum + t.totalLessons, 0);
  const done = trackProgress.reduce((sum, t) => sum + t.completedLessons, 0);
  return total ? Math.round((done / total) * 100) : 0;
}

export const ACCENT_CLASSES: Record<Track['accent'], string> = {
  brand: 'bg-brand-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
};

export const ACCENT_TEXT: Record<Track['accent'], string> = {
  brand: 'text-brand-600 dark:text-brand-300',
  emerald: 'text-emerald-600 dark:text-emerald-300',
  amber: 'text-amber-600 dark:text-amber-300',
  violet: 'text-violet-600 dark:text-violet-300',
};
