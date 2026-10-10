import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCapstone } from '../lib/evaluate.ts';
import { CAPSTONE_PROJECTS } from '../lib/content/capstones.ts';
import { SCENARIOS } from '../lib/content/scenarios.ts';
import { QUIZZES } from '../lib/content/quizzes.ts';
import { TRACKS } from '../lib/content/tracks.ts';

const project = CAPSTONE_PROJECTS[0];

test('an untouched project scores zero and does not pass', () => {
  const result = evaluateCapstone(project, [], []);
  assert.equal(result.rubricScore, 0);
  assert.equal(result.stepCompletion, 0);
  assert.equal(result.passed, false);
});

test('evidence on one criterion lifts the weighted score only for that criterion', () => {
  const criterion = project.rubric[0];
  const allSteps = project.steps.map((s) => ({ stepId: s.id, complete: true }));
  const result = evaluateCapstone(
    project,
    allSteps,
    [{ id: 'e1', projectId: project.id, criterionId: criterion.id }],
  );
  const total = project.rubric.reduce((sum, c) => sum + c.weight, 0);
  assert.equal(result.rubricScore, Math.round((criterion.weight / total) * 100));
  assert.equal(result.criteria.find((c) => c.id === criterion.id).satisfied, true);
});

test('a project passes only with 80% rubric and 80% checklist', () => {
  const allSteps = project.steps.map((s) => ({ stepId: s.id, complete: true }));
  const heavy = [...project.rubric].sort((a, b) => b.weight - a.weight).slice(0, 2);
  const evidence = heavy.map((c, i) => ({ id: `e${i}`, projectId: project.id, criterionId: c.id }));
  const result = evaluateCapstone(project, allSteps, evidence);
  const total = project.rubric.reduce((sum, c) => sum + c.weight, 0);
  const earned = heavy.reduce((sum, c) => sum + c.weight, 0);
  assert.equal(result.rubricScore, Math.round((earned / total) * 100));
  assert.equal(result.stepCompletion, 100);
  assert.equal(result.passed, result.rubricScore >= 80);
});

test('every capstone rubric weight is a positive integer', () => {
  for (const p of CAPSTONE_PROJECTS) {
    for (const c of p.rubric) {
      assert.ok(Number.isInteger(c.weight) && c.weight > 0, `${p.id}/${c.id} weight`);
    }
  }
});

test('scenario option next nodes always resolve and terminals carry a debrief', () => {
  for (const scenario of SCENARIOS) {
    const ids = new Set(scenario.nodes.map((n) => n.id));
    assert.ok(ids.has(scenario.rootNodeId), `${scenario.id} root node exists`);
    for (const node of scenario.nodes) {
      for (const option of node.options) {
        if (option.nextNodeId) assert.ok(ids.has(option.nextNodeId), `${scenario.id}/${option.id} target`);
      }
      if (node.isTerminal) assert.ok(node.debrief, `${scenario.id}/${node.id} terminal debrief`);
    }
  }
});

test('every quiz has exactly one correct option per question', () => {
  for (const quiz of QUIZZES) {
    for (const q of quiz.questions) {
      const correct = q.options.filter((o) => o.isCorrect);
      assert.equal(correct.length, 1, `${quiz.id}/${q.id} correct count`);
    }
  }
});

test('lesson activity ids point at a real scenario or quiz', () => {
  const scenarioIds = new Set(SCENARIOS.map((s) => s.id));
  const quizIds = new Set(QUIZZES.map((q) => q.id));
  for (const track of TRACKS) {
    for (const mod of track.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.kind === 'scenario') assert.ok(scenarioIds.has(lesson.activityId), lesson.id);
        if (lesson.kind === 'quiz') assert.ok(quizIds.has(lesson.activityId), lesson.id);
      }
    }
  }
});
