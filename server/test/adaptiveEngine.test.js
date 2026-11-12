// server/test/adaptiveEngine.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  updateMastery,
  selectWeakTopics,
  getExplanationSystemPrompt,
  classifyMistakeType,
} from '../src/adaptiveEngine.js';

test('updateMastery increases mastery on correct answer with 2 decimal precision', () => {
  const result = updateMastery(0.2, true, 'correct');
  assert.equal(result, 0.35);
});

test('updateMastery decreases mastery appropriately for mistake types', () => {
  const misunderstanding = updateMastery(0.5, false, 'conceptual_misunderstanding');
  assert.equal(misunderstanding, 0.38);

  const partial = updateMastery(0.5, false, 'partial_knowledge');
  assert.equal(partial, 0.45);

  const lowConfidence = updateMastery(0.5, false, 'guessing_low_confidence');
  assert.equal(lowConfidence, 0.47);
});

test('updateMastery clamps results strictly between 0 and 1', () => {
  assert.equal(updateMastery(0.95, true, 'correct'), 1.0);
  assert.equal(updateMastery(0.05, false, 'conceptual_misunderstanding'), 0.0);
});

test('selectWeakTopics orders topics by lowest mastery first', () => {
  const curriculum = {
    nodes: [
      { id: 'topic_a', label: 'Topic A' },
      { id: 'topic_b', label: 'Topic B' },
      { id: 'topic_c', label: 'Topic C' },
    ],
  };
  const masteryMap = {
    topic_a: 0.9,
    topic_b: 0.1,
    topic_c: 0.4,
  };

  const weak = selectWeakTopics(curriculum, masteryMap, 2);
  assert.equal(weak.length, 2);
  assert.equal(weak[0].id, 'topic_b');
  assert.equal(weak[1].id, 'topic_c');
});

test('getExplanationSystemPrompt returns prompt for all supported modes', () => {
  const modes = ['simple', 'technical', 'analogy', 'real_world'];
  for (const m of modes) {
    const prompt = getExplanationSystemPrompt(m);
    assert.ok(prompt && prompt.length > 10);
  }
  const fallback = getExplanationSystemPrompt('unknown_mode');
  assert.equal(fallback, getExplanationSystemPrompt('simple'));
});

test('classifyMistakeType classifies evaluation feedback correctly', () => {
  assert.equal(classifyMistakeType('Fundamental misconception identified'), 'conceptual_misunderstanding');
  assert.equal(classifyMistakeType('This is a partial answer'), 'partial_knowledge');
  assert.equal(classifyMistakeType('User appears unsure and guessing'), 'guessing_low_confidence');
});
