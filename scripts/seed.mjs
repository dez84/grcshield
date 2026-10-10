#!/usr/bin/env node
// Seeds curriculum content from lib/content/*.ts into PostgreSQL.
// Content modules are pure data, so Node's built-in TypeScript stripping loads them directly.
import pg from 'pg';
import { TRACKS } from '../lib/content/tracks.ts';
import { SCENARIOS } from '../lib/content/scenarios.ts';
import { QUIZZES } from '../lib/content/quizzes.ts';
import { CAPSTONE_PROJECTS } from '../lib/content/capstones.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env or export it first.');
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ...(/sslmode=require/.test(connectionString) ? { ssl: { rejectUnauthorized: false } } : {}),
});

async function seedTracks() {
  let trackOrder = 0;
  for (const track of TRACKS) {
    await client.query(
      `INSERT INTO tracks (id, slug, title, summary, accent, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, accent = EXCLUDED.accent`,
      [track.id, track.slug, track.title, track.summary, track.accent, trackOrder++],
    );

    let moduleOrder = 0;
    for (const mod of track.modules) {
      await client.query(
        `INSERT INTO modules (id, track_id, title, summary, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary`,
        [mod.id, track.id, mod.title, mod.summary, moduleOrder++],
      );

      let lessonOrder = 0;
      for (const lesson of mod.lessons) {
        await client.query(
          `INSERT INTO lessons (id, module_id, title, kind, est_minutes, body, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, kind = EXCLUDED.kind, body = EXCLUDED.body`,
          [lesson.id, mod.id, lesson.title, lesson.kind, lesson.estMinutes, lesson.body, lessonOrder++],
        );
      }
    }
  }
  return TRACKS.reduce((n, t) => n + t.modules.reduce((m, mod) => m + mod.lessons.length, 0), 0);
}

async function seedScenarios() {
  for (const scenario of SCENARIOS) {
    await client.query(
      `INSERT INTO scenarios (id, title, briefing, role_hint, root_node_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, briefing = EXCLUDED.briefing`,
      [scenario.id, scenario.title, scenario.briefing, scenario.roleHint, scenario.rootNodeId],
    );

    for (const node of scenario.nodes) {
      await client.query(
        `INSERT INTO scenario_nodes (id, scenario_id, prompt, is_terminal, debrief)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET prompt = EXCLUDED.prompt`,
        [node.id, scenario.id, node.prompt, node.isTerminal, node.debrief ?? null],
      );
    }

    // Options reference nodes, so apply them after all nodes exist.
    for (const node of scenario.nodes) {
      let order = 0;
      for (const option of node.options) {
        await client.query(
          `INSERT INTO scenario_options (id, node_id, label, feedback, score_delta, quality, next_node_id, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, feedback = EXCLUDED.feedback`,
          [option.id, node.id, option.label, option.feedback, option.scoreDelta, option.quality, option.nextNodeId ?? null, order++],
        );
      }
    }
  }

  // Attach scenario activities to their lessons.
  for (const track of TRACKS) {
    for (const mod of track.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.kind === 'scenario' && lesson.activityId) {
          await client.query('UPDATE scenarios SET lesson_id = $1 WHERE id = $2', [lesson.id, lesson.activityId]);
        }
      }
    }
  }
  return SCENARIOS.length;
}

async function seedQuizzes() {
  for (const quiz of QUIZZES) {
    await client.query(
      `INSERT INTO quizzes (id, title) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title`,
      [quiz.id, quiz.title],
    );
    for (const question of quiz.questions) {
      await client.query(
        `INSERT INTO quiz_questions (id, quiz_id, prompt, explanation, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET prompt = EXCLUDED.prompt, explanation = EXCLUDED.explanation`,
        [question.id, quiz.id, question.prompt, question.explanation, quiz.questions.indexOf(question)],
      );
      for (const option of question.options) {
        await client.query(
          `INSERT INTO quiz_options (id, question_id, label, is_correct, sort_order)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, is_correct = EXCLUDED.is_correct`,
          [option.id, question.id, option.label, option.isCorrect, question.options.indexOf(option)],
        );
      }
    }
  }

  for (const track of TRACKS) {
    for (const mod of track.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.kind === 'quiz' && lesson.activityId) {
          await client.query('UPDATE quizzes SET lesson_id = $1 WHERE id = $2', [lesson.id, lesson.activityId]);
        }
      }
    }
  }
  return QUIZZES.length;
}

async function seedCapstones() {
  let projectOrder = 0;
  for (const project of CAPSTONE_PROJECTS) {
    await client.query(
      `INSERT INTO capstone_projects (id, slug, title, objective, tools, setup, difficulty, est_hours, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, objective = EXCLUDED.objective,
         tools = EXCLUDED.tools, setup = EXCLUDED.setup`,
      [project.id, project.slug, project.title, project.objective, project.tools, project.setup, project.difficulty, project.estHours, projectOrder++],
    );

    let stepOrder = 0;
    for (const step of project.steps) {
      await client.query(
        `INSERT INTO capstone_steps (id, project_id, title, detail, command, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, detail = EXCLUDED.detail, command = EXCLUDED.command`,
        [step.id, project.id, step.title, step.detail, step.command ?? null, stepOrder++],
      );
    }

    for (const criterion of project.rubric) {
      await client.query(
        `INSERT INTO capstone_rubric_criteria (id, project_id, criterion, weight, evidence_type)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET criterion = EXCLUDED.criterion, weight = EXCLUDED.weight`,
        [criterion.id, project.id, criterion.criterion, criterion.weight, criterion.evidenceType],
      );
    }
  }
  return CAPSTONE_PROJECTS.length;
}

try {
  await client.connect();
  const lessons = await seedTracks();
  const scenarios = await seedScenarios();
  const quizzes = await seedQuizzes();
  const projects = await seedCapstones();
  console.log(
    `Seeded ${TRACKS.length} tracks, ${lessons} lessons, ${scenarios} scenarios, ${quizzes} quizzes, ${projects} capstone projects.`,
  );
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
