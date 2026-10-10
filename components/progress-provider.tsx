'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CapstoneEvaluation } from '@/lib/evaluate';

export interface LessonProgressRow {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'complete';
  score: number | null;
}
export interface CapstoneStepRow {
  stepId: string;
  complete: boolean;
}
export interface EvidenceRow {
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
export interface QuizAttemptRow {
  id: string;
  quizId: string;
  score: number;
  maxScore: number;
  createdAt: string;
}

interface ProgressState {
  authenticated: boolean;
  email: string | null;
  displayName: string | null;
  role: string | null;
  storage: string | null;
  lessons: LessonProgressRow[];
  capstoneSteps: CapstoneStepRow[];
  evidence: EvidenceRow[];
  quizAttempts: QuizAttemptRow[];
  loading: boolean;
}

interface ProgressContextValue extends ProgressState {
  refresh: () => Promise<void>;
  setLesson: (lessonId: string, status: LessonProgressRow['status'], score?: number | null) => Promise<void>;
  setStep: (projectId: string, stepId: string, complete: boolean) => Promise<CapstoneEvaluation | null>;
  addEvidence: (payload: Record<string, unknown>) => Promise<{ evaluation: CapstoneEvaluation | null; error?: string }>;
  submitQuiz: (
    quizId: string,
    answers: Record<string, string>,
    lessonId?: string,
  ) => Promise<{ score: number; maxScore: number; passed: boolean; results: QuizResult[] } | null>;
  identify: (email: string, displayName?: string) => Promise<boolean>;
  register: (email: string, password: string, displayName?: string) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export interface QuizResult {
  questionId: string;
  chosen: string | null;
  correctOptionId: string | null;
  isCorrect: boolean;
  explanation: string;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>({
    authenticated: false,
    email: null,
    displayName: null,
    role: null,
    storage: null,
    lessons: [],
    capstoneSteps: [],
    evidence: [],
    quizAttempts: [],
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const [progressRes, sessionRes] = await Promise.all([
        fetch('/api/progress', { cache: 'no-store' }),
        fetch('/api/auth/session', { cache: 'no-store' }),
      ]);
      const progress = await progressRes.json();
      const session = await sessionRes.json();
      setState((prev) => ({
        ...prev,
        authenticated: Boolean(session.authenticated),
        lessons: progress.lessons ?? [],
        capstoneSteps: progress.capstoneSteps ?? [],
        evidence: progress.evidence ?? [],
        quizAttempts: progress.quizAttempts ?? [],
        email: session.email ?? null,
        displayName: session.displayName ?? null,
        role: session.role ?? null,
        storage: session.storage ?? null,
        loading: false,
      }));
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setLesson = useCallback<ProgressContextValue['setLesson']>(
    async (lessonId, status, score = null) => {
      setState((prev) => ({
        ...prev,
        lessons: [
          ...prev.lessons.filter((l) => l.lessonId !== lessonId),
          { lessonId, status, score },
        ],
      }));
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, status, score }),
      }).catch(() => {});
    },
    [],
  );

  const setStep = useCallback<ProgressContextValue['setStep']>(async (projectId, stepId, complete) => {
    setState((prev) => ({
      ...prev,
      capstoneSteps: [
        ...prev.capstoneSteps.filter((s) => s.stepId !== stepId),
        { stepId, complete },
      ],
    }));
    try {
      const res = await fetch('/api/capstone/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, stepId, complete }),
      });
      const data = await res.json();
      return data.evaluation ?? null;
    } catch {
      return null;
    }
  }, []);

  const addEvidence = useCallback<ProgressContextValue['addEvidence']>(async (payload) => {
    try {
      const res = await fetch('/api/capstone/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return { evaluation: null, error: data.error ?? 'Could not save evidence' };
      setState((prev) => ({ ...prev, evidence: data.all ?? prev.evidence }));
      return { evaluation: data.evaluation ?? null };
    } catch {
      return { evaluation: null, error: 'Network error saving evidence' };
    }
  }, []);

  const submitQuiz = useCallback<ProgressContextValue['submitQuiz']>(async (quizId, answers, lessonId) => {
    try {
      const res = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, answers, lessonId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return null;
      setState((prev) => {
        const lessons = lessonId
          ? [
              ...prev.lessons.filter((l) => l.lessonId !== lessonId),
              {
                lessonId,
                status: (data.passed ? 'complete' : 'in_progress') as LessonProgressRow['status'],
                score: data.score as number,
              },
            ]
          : prev.lessons;
        return {
          ...prev,
          lessons,
          quizAttempts: data.attempt ? [data.attempt, ...prev.quizAttempts] : prev.quizAttempts,
        };
      });
      return { score: data.score, maxScore: data.maxScore, passed: data.passed, results: data.results };
    } catch {
      return null;
    }
  }, []);

  const identify = useCallback<ProgressContextValue['identify']>(async (email, displayName) => {
    try {
      const res = await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName }),
      });
      if (!res.ok) return false;
      await refresh();
      return true;
    } catch {
      return false;
    }
  }, [refresh]);

  const authRequest = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      try {
        const res = await fetch(path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) return { ok: false, error: data.error ?? 'Something went wrong' };
        await refresh();
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error' };
      }
    },
    [refresh],
  );

  const register = useCallback<ProgressContextValue['register']>(
    (email, password, displayName) => authRequest('/api/auth/register', { email, password, displayName }),
    [authRequest],
  );

  const login = useCallback<ProgressContextValue['login']>(
    (email, password) => authRequest('/api/auth/login', { email, password }),
    [authRequest],
  );

  const logout = useCallback<ProgressContextValue['logout']>(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setState((prev) => ({
      ...prev,
      authenticated: false,
      email: null,
      displayName: null,
      role: null,
      lessons: [],
      capstoneSteps: [],
      evidence: [],
      quizAttempts: [],
    }));
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ ...state, refresh, setLesson, setStep, addEvidence, submitQuiz, identify, register, login, logout }),
    [state, refresh, setLesson, setStep, addEvidence, submitQuiz, identify, register, login, logout],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
