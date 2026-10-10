-- GRC Shield — core PostgreSQL schema
-- Governs user accounts, curriculum, interactive learning state, and capstone submissions.
-- Idempotent: safe to run repeatedly (uses IF NOT EXISTS / ON CONFLICT guards).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL DEFAULT 'Learner',
  organisation  TEXT,
  role          TEXT NOT NULL DEFAULT 'learner'
                  CHECK (role IN ('learner', 'reviewer', 'admin')),
  theme_pref    TEXT NOT NULL DEFAULT 'system'
                  CHECK (theme_pref IN ('system', 'light', 'dark')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credentials for signed-in accounts. NULL means the account is anonymous
-- (a device holding progress) or email-sync only, with no password set.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Lightweight, revocable session tokens so progress syncs across devices.
CREATE TABLE IF NOT EXISTS sessions (
  token         TEXT PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT now() + interval '90 days',
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ---------------------------------------------------------------------------
-- Curriculum: domain tracks -> modules -> lessons
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tracks (
  id            TEXT PRIMARY KEY,               -- e.g. 'governance'
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL,
  accent        TEXT NOT NULL DEFAULT 'brand',
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS modules (
  id            TEXT PRIMARY KEY,               -- e.g. 'gov-mod-1'
  track_id      TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_modules_track ON modules(track_id, sort_order);

CREATE TABLE IF NOT EXISTS lessons (
  id            TEXT PRIMARY KEY,
  module_id     TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  -- 'micro' = read + mini-quiz, 'scenario' = decision tree, 'quiz' = graded check
  kind          TEXT NOT NULL DEFAULT 'micro'
                  CHECK (kind IN ('micro', 'scenario', 'quiz')),
  est_minutes   INTEGER NOT NULL DEFAULT 5,
  body          TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, sort_order);

-- ---------------------------------------------------------------------------
-- Audit Scenario Simulator (interactive decision trees)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scenarios (
  id            TEXT PRIMARY KEY,
  lesson_id     TEXT REFERENCES lessons(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  briefing      TEXT NOT NULL,
  role_hint     TEXT NOT NULL DEFAULT 'GRC Lead',
  root_node_id  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenario_nodes (
  id            TEXT PRIMARY KEY,
  scenario_id   TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  prompt        TEXT NOT NULL,
  is_terminal   BOOLEAN NOT NULL DEFAULT false,
  -- Optional debrief text shown when a terminal node is reached.
  debrief       TEXT
);
CREATE INDEX IF NOT EXISTS idx_scenario_nodes_scenario ON scenario_nodes(scenario_id);

CREATE TABLE IF NOT EXISTS scenario_options (
  id            TEXT PRIMARY KEY,
  node_id       TEXT NOT NULL REFERENCES scenario_nodes(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  -- Feedback for the chosen option plus the branch it leads to (null if terminal).
  feedback      TEXT NOT NULL,
  score_delta   INTEGER NOT NULL DEFAULT 0,
  quality       TEXT NOT NULL DEFAULT 'ok'
                  CHECK (quality IN ('best', 'ok', 'poor', 'breach')),
  next_node_id  TEXT REFERENCES scenario_nodes(id) ON DELETE SET NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_scenario_options_node ON scenario_options(node_id, sort_order);

-- ---------------------------------------------------------------------------
-- Mini-quizzes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
  id            TEXT PRIMARY KEY,
  lesson_id     TEXT REFERENCES lessons(id) ON DELETE SET NULL,
  title         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id            TEXT PRIMARY KEY,
  quiz_id       TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  prompt        TEXT NOT NULL,
  explanation   TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id, sort_order);

CREATE TABLE IF NOT EXISTS quiz_options (
  id            TEXT PRIMARY KEY,
  question_id   TEXT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT false,
  sort_order    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON quiz_options(question_id, sort_order);

-- ---------------------------------------------------------------------------
-- Capstone Lab Hub
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capstone_projects (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  objective     TEXT NOT NULL,
  tools         TEXT[] NOT NULL DEFAULT '{}',
  setup         TEXT NOT NULL DEFAULT '',
  difficulty    TEXT NOT NULL DEFAULT 'advanced',
  est_hours     INTEGER NOT NULL DEFAULT 8,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS capstone_steps (
  id            TEXT PRIMARY KEY,
  project_id    TEXT NOT NULL REFERENCES capstone_projects(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  detail        TEXT NOT NULL,
  -- Optional copy-ready command block (docker, CLI, python, etc).
  command       TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_capstone_steps_project ON capstone_steps(project_id, sort_order);

-- Auto-evaluated rubric criteria. weight sums to 100 per project.
CREATE TABLE IF NOT EXISTS capstone_rubric_criteria (
  id            TEXT PRIMARY KEY,
  project_id    TEXT NOT NULL REFERENCES capstone_projects(id) ON DELETE CASCADE,
  criterion     TEXT NOT NULL,
  weight        INTEGER NOT NULL DEFAULT 0,
  evidence_type TEXT NOT NULL DEFAULT 'note'
                  CHECK (evidence_type IN ('note', 'file', 'url', 'checklist'))
);
CREATE INDEX IF NOT EXISTS idx_rubric_project ON capstone_rubric_criteria(project_id);

-- ---------------------------------------------------------------------------
-- Per-user learning state (cross-device sync)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id     TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('not_started', 'in_progress', 'complete')),
  score         INTEGER,
  completed_at  TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS user_quiz_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id       TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score         INTEGER NOT NULL,
  max_score     INTEGER NOT NULL,
  answers       JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON user_quiz_attempts(user_id, quiz_id);

-- Records each decision a learner makes inside a scenario tree.
CREATE TABLE IF NOT EXISTS user_scenario_decisions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id   TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  node_id       TEXT NOT NULL REFERENCES scenario_nodes(id) ON DELETE CASCADE,
  option_id     TEXT NOT NULL REFERENCES scenario_options(id) ON DELETE CASCADE,
  score_delta   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scenario_decisions_user ON user_scenario_decisions(user_id, scenario_id);

CREATE TABLE IF NOT EXISTS user_capstone_progress (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id    TEXT NOT NULL REFERENCES capstone_projects(id) ON DELETE CASCADE,
  step_id       TEXT NOT NULL REFERENCES capstone_steps(id) ON DELETE CASCADE,
  complete      BOOLEAN NOT NULL DEFAULT false,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, step_id)
);

-- Evidence uploaded against a rubric criterion. Files live on disk / object store;
-- this table stores metadata and the attestation trail.
CREATE TABLE IF NOT EXISTS capstone_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id    TEXT NOT NULL REFERENCES capstone_projects(id) ON DELETE CASCADE,
  criterion_id  TEXT REFERENCES capstone_rubric_criteria(id) ON DELETE SET NULL,
  evidence_kind TEXT NOT NULL DEFAULT 'note'
                  CHECK (evidence_kind IN ('note', 'file', 'url', 'checklist')),
  note          TEXT NOT NULL DEFAULT '',
  url           TEXT,
  file_name     TEXT,
  file_size     INTEGER,
  attested_by   TEXT,
  attested_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_submissions_user_project ON capstone_submissions(user_id, project_id);

-- Automatic score recomputed when steps/evidence change.
CREATE TABLE IF NOT EXISTS capstone_evaluations (
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id       TEXT NOT NULL REFERENCES capstone_projects(id) ON DELETE CASCADE,
  rubric_score     INTEGER NOT NULL DEFAULT 0,
  step_completion  INTEGER NOT NULL DEFAULT 0,
  passed           BOOLEAN NOT NULL DEFAULT false,
  evaluated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- ---------------------------------------------------------------------------
-- Reporting helper: per-track completion for the dashboard
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_user_track_progress AS
SELECT
  u.id                              AS user_id,
  t.id                              AS track_id,
  t.title                           AS track_title,
  COUNT(l.id)                       AS total_lessons,
  COUNT(p.lesson_id) FILTER (WHERE p.status = 'complete') AS completed_lessons
FROM users u
CROSS JOIN tracks t
JOIN modules m ON m.track_id = t.id
JOIN lessons l ON l.module_id = m.id
LEFT JOIN user_lesson_progress p
  ON p.lesson_id = l.id AND p.user_id = u.id
GROUP BY u.id, t.id, t.title;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_lesson_progress_updated ON user_lesson_progress;
CREATE TRIGGER trg_lesson_progress_updated BEFORE UPDATE ON user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_capstone_progress_updated ON user_capstone_progress;
CREATE TRIGGER trg_capstone_progress_updated BEFORE UPDATE ON user_capstone_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
