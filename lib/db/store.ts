import { randomUUID } from 'node:crypto';
import { databaseReachable, query } from './client';

/**
 * Persistence layer for user progress. Uses PostgreSQL when DATABASE_URL is
 * set and reachable, and otherwise falls back to a process-local in-memory
 * store so the app is usable before a database is provisioned.
 */

export interface LessonProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'complete';
  score: number | null;
}

export interface CapstoneStepProgress {
  stepId: string;
  complete: boolean;
}

export interface EvidenceRecord {
  id: string;
  projectId: string;
  criterionId: string | null;
  evidenceKind: 'note' | 'file' | 'url' | 'checklist';
  note: string;
  url: string | null;
  fileName: string | null;
  fileSize: number | null;
  attestedBy: string | null;
  attestedAt: string | null;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  maxScore: number;
  createdAt: string;
}

interface MemoryUser {
  id: string;
  email: string;
}

interface MemoryState {
  users: Map<string, MemoryUser>;
  userByEmail: Map<string, string>;
  lessons: Map<string, Map<string, LessonProgress>>;
  capstoneSteps: Map<string, Map<string, boolean>>;
  evidence: Map<string, EvidenceRecord[]>;
  quizAttempts: Map<string, QuizAttempt[]>;
}

declare global {
  // eslint-disable-next-line no-var
  var __grcShieldMemory: MemoryState | undefined;
}

function memory(): MemoryState {
  if (!global.__grcShieldMemory) {
    global.__grcShieldMemory = {
      users: new Map(),
      userByEmail: new Map(),
      lessons: new Map(),
      capstoneSteps: new Map(),
      evidence: new Map(),
      quizAttempts: new Map(),
    };
  }
  return global.__grcShieldMemory;
}

/** Placeholder address for a device that has not bound an email yet. */
function deviceEmail(deviceId: string): string {
  return `device-${deviceId}@grc-shield.local`;
}

/**
 * Resolves a user for an API request. Identity is lightweight: a stable device
 * id from a cookie gives a learner progress before sign-up, and binding an
 * email later merges that progress into a cross-device account.
 */

export async function resolveUser(
  userId: string | null,
  email?: string,
  displayName?: string,
  deviceId?: string | null,
  create = true,
): Promise<string | null> {
  const normalisedEmail = (email ?? '').trim().toLowerCase();
  // A device gets an anonymous account so progress persists before sign-up.
  const effectiveEmail = normalisedEmail || (deviceId ? deviceEmail(deviceId) : '');
  if (!userId && !effectiveEmail) return null;

  if (await databaseReachable()) {
    if (userId) {
      const rows = await query<{ id: string }>('SELECT id FROM users WHERE id = $1', [userId]);
      if (rows[0]) return rows[0].id;
    }
    const existing = await query<{ id: string }>('SELECT id FROM users WHERE email = $1', [
      effectiveEmail,
    ]);
    if (existing[0]) return existing[0].id;
    if (!create) return null;
    const inserted = await query<{ id: string }>(
      'INSERT INTO users (email, display_name) VALUES ($1, $2) RETURNING id',
      [effectiveEmail, displayName ?? (normalisedEmail ? 'Learner' : 'Device learner')],
    );
    return inserted[0]?.id ?? null;
  }

  const mem = memory();
  if (userId && mem.users.has(userId)) return userId;
  const existingId = mem.userByEmail.get(effectiveEmail);
  if (existingId) return existingId;
  if (!create) return null;
  const id = randomUUID();
  mem.users.set(id, { id, email: effectiveEmail });
  mem.userByEmail.set(effectiveEmail, id);
  return id;
}

/**
 * Binds an email to an existing (often anonymous) user so progress carries
 * over when the learner enables cross-device sync. If the email already
 * belongs to another account, that account is adopted instead so we do not
 * create duplicate users with split progress.
 */
export async function bindEmail(userId: string, email: string): Promise<{ userId: string; email: string }> {
  const normalised = email.trim().toLowerCase();
  if (await databaseReachable()) {
    const existing = await query<{ id: string }>('SELECT id FROM users WHERE email = $1', [normalised]);
    if (existing[0] && existing[0].id !== userId) {
      return { userId: existing[0].id, email: normalised };
    }
    await query('UPDATE users SET email = $1 WHERE id = $2', [normalised, userId]);
    return { userId, email: normalised };
  }

  const mem = memory();
  const existingId = mem.userByEmail.get(normalised);
  if (existingId && existingId !== userId) return { userId: existingId, email: normalised };
  const user = mem.users.get(userId);
  if (user) {
    mem.userByEmail.delete(user.email);
    user.email = normalised;
    mem.userByEmail.set(normalised, userId);
  }
  return { userId, email: normalised };
}

export async function getUserEmail(userId: string): Promise<string | null> {
  if (await databaseReachable()) {
    const rows = await query<{ email: string }>('SELECT email FROM users WHERE id = $1', [userId]);
    return rows[0]?.email ?? null;
  }
  return memory().users.get(userId)?.email ?? null;
}

// ---------------------------------------------------------------------------
// Lesson progress
// ---------------------------------------------------------------------------
export async function getLessonProgress(userId: string): Promise<LessonProgress[]> {
  if (await databaseReachable()) {
    const rows = await query<{ lesson_id: string; status: LessonProgress['status']; score: number | null }>(
      'SELECT lesson_id, status, score FROM user_lesson_progress WHERE user_id = $1',
      [userId],
    );
    return rows.map((r) => ({ lessonId: r.lesson_id, status: r.status, score: r.score }));
  }
  const stored = memory().lessons.get(userId);
  return stored ? [...stored.values()] : [];
}

export async function saveLessonProgress(
  userId: string,
  lessonId: string,
  status: LessonProgress['status'],
  score: number | null,
): Promise<void> {
  if (await databaseReachable()) {
    await query(
      `INSERT INTO user_lesson_progress (user_id, lesson_id, status, score, completed_at)
       VALUES ($1, $2, $3, $4, CASE WHEN $3 = 'complete' THEN now() ELSE NULL END)
       ON CONFLICT (user_id, lesson_id) DO UPDATE
         SET status = EXCLUDED.status,
             score = EXCLUDED.score,
             completed_at = CASE WHEN EXCLUDED.status = 'complete' THEN now() ELSE user_lesson_progress.completed_at END`,
      [userId, lessonId, status, score],
    );
    return;
  }
  const mem = memory();
  const forUser = mem.lessons.get(userId) ?? new Map<string, LessonProgress>();
  forUser.set(lessonId, { lessonId, status, score });
  mem.lessons.set(userId, forUser);
}

// ---------------------------------------------------------------------------
// Capstone step progress
// ---------------------------------------------------------------------------
export async function getCapstoneSteps(userId: string): Promise<CapstoneStepProgress[]> {
  if (await databaseReachable()) {
    const rows = await query<{ step_id: string; complete: boolean }>(
      'SELECT step_id, complete FROM user_capstone_progress WHERE user_id = $1',
      [userId],
    );
    return rows.map((r) => ({ stepId: r.step_id, complete: r.complete }));
  }
  const stored = memory().capstoneSteps.get(userId);
  return stored
    ? [...stored.entries()].map(([stepId, complete]) => ({ stepId, complete }))
    : [];
}

export async function saveCapstoneStep(
  userId: string,
  projectId: string,
  stepId: string,
  complete: boolean,
): Promise<void> {
  if (await databaseReachable()) {
    await query(
      `INSERT INTO user_capstone_progress (user_id, project_id, step_id, complete)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, step_id) DO UPDATE SET complete = EXCLUDED.complete`,
      [userId, projectId, stepId, complete],
    );
    return;
  }
  const mem = memory();
  const forUser = mem.capstoneSteps.get(userId) ?? new Map<string, boolean>();
  forUser.set(stepId, complete);
  mem.capstoneSteps.set(userId, forUser);
}

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------
export async function getEvidence(userId: string, projectId?: string): Promise<EvidenceRecord[]> {
  if (await databaseReachable()) {
    const rows = await query<{
      id: string;
      project_id: string;
      criterion_id: string | null;
      evidence_kind: EvidenceRecord['evidenceKind'];
      note: string;
      url: string | null;
      file_name: string | null;
      file_size: number | null;
      attested_by: string | null;
      attested_at: Date | null;
      created_at: Date;
    }>(
      projectId
        ? 'SELECT * FROM capstone_submissions WHERE user_id = $1 AND project_id = $2 ORDER BY created_at DESC'
        : 'SELECT * FROM capstone_submissions WHERE user_id = $1 ORDER BY created_at DESC',
      projectId ? [userId, projectId] : [userId],
    );
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      criterionId: r.criterion_id,
      evidenceKind: r.evidence_kind,
      note: r.note,
      url: r.url,
      fileName: r.file_name,
      fileSize: r.file_size,
      attestedBy: r.attested_by,
      attestedAt: r.attested_at ? r.attested_at.toISOString() : null,
      createdAt: r.created_at.toISOString(),
    }));
  }
  const all = memory().evidence.get(userId) ?? [];
  return projectId ? all.filter((e) => e.projectId === projectId) : all;
}

export async function addEvidence(
  userId: string,
  record: Omit<EvidenceRecord, 'id' | 'createdAt'>,
): Promise<EvidenceRecord> {
  const createdAt = new Date().toISOString();
  if (await databaseReachable()) {
    const rows = await query<{ id: string }>(
      `INSERT INTO capstone_submissions
         (user_id, project_id, criterion_id, evidence_kind, note, url, file_name, file_size, attested_by, attested_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $9::text IS NULL THEN NULL ELSE now() END)
       RETURNING id`,
      [
        userId,
        record.projectId,
        record.criterionId,
        record.evidenceKind,
        record.note,
        record.url,
        record.fileName,
        record.fileSize,
        record.attestedBy,
      ],
    );
    return { ...record, id: rows[0]?.id ?? randomUUID(), createdAt };
  }
  const mem = memory();
  const all = mem.evidence.get(userId) ?? [];
  const created: EvidenceRecord = { ...record, id: randomUUID(), createdAt };
  all.unshift(created);
  mem.evidence.set(userId, all);
  return created;
}

// ---------------------------------------------------------------------------
// Quiz attempts
// ---------------------------------------------------------------------------
export async function getQuizAttempts(userId: string): Promise<QuizAttempt[]> {
  if (await databaseReachable()) {
    const rows = await query<{ id: string; quiz_id: string; score: number; max_score: number; created_at: Date }>(
      'SELECT id, quiz_id, score, max_score, created_at FROM user_quiz_attempts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return rows.map((r) => ({
      id: r.id,
      quizId: r.quiz_id,
      score: r.score,
      maxScore: r.max_score,
      createdAt: r.created_at.toISOString(),
    }));
  }
  return memory().quizAttempts.get(userId) ?? [];
}

export async function addQuizAttempt(
  userId: string,
  quizId: string,
  score: number,
  maxScore: number,
  answers: unknown,
): Promise<QuizAttempt> {
  const createdAt = new Date().toISOString();
  if (await databaseReachable()) {
    const rows = await query<{ id: string }>(
      `INSERT INTO user_quiz_attempts (user_id, quiz_id, score, max_score, answers)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, quizId, score, maxScore, JSON.stringify(answers)],
    );
    return { id: rows[0]?.id ?? randomUUID(), quizId, score, maxScore, createdAt };
  }
  const mem = memory();
  const all = mem.quizAttempts.get(userId) ?? [];
  const attempt: QuizAttempt = { id: randomUUID(), quizId, score, maxScore, createdAt };
  all.unshift(attempt);
  mem.quizAttempts.set(userId, all);
  return attempt;
}

export async function getScenarioScore(userId: string): Promise<number> {
  if (await databaseReachable()) {
    const rows = await query<{ total: string | null }>(
      'SELECT COALESCE(SUM(score_delta), 0) AS total FROM user_scenario_decisions WHERE user_id = $1',
      [userId],
    );
    return Number(rows[0]?.total ?? 0);
  }
  return 0;
}

export async function recordScenarioDecision(
  userId: string,
  scenarioId: string,
  nodeId: string,
  optionId: string,
  scoreDelta: number,
): Promise<void> {
  if (await databaseReachable()) {
    await query(
      `INSERT INTO user_scenario_decisions (user_id, scenario_id, node_id, option_id, score_delta)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, scenarioId, nodeId, optionId, scoreDelta],
    );
  }
}

export async function usingDatabase(): Promise<boolean> {
  return databaseReachable();
}
