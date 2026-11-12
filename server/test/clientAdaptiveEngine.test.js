// server/test/clientAdaptiveEngine.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDifficultyFromMastery,
  getMasteryColor,
  getMasteryLabel,
  recommendNextTopic,
  getCurriculumProgress,
} from '../../client/src/utils/adaptiveEngine.js';

test('getDifficultyFromMastery classifies all tiers', () => {
  assert.equal(getDifficultyFromMastery(0.1), 'Beginner');
  assert.equal(getDifficultyFromMastery(0.4), 'Intermediate');
  assert.equal(getDifficultyFromMastery(0.7), 'Advanced');
  assert.equal(getDifficultyFromMastery(0.9), 'Expert');
});

test('getMasteryColor returns correct color palette', () => {
  assert.equal(getMasteryColor(0.1), '#ef4444');
  assert.equal(getMasteryColor(0.5), '#f59e0b');
  assert.equal(getMasteryColor(0.7), '#3b82f6');
  assert.equal(getMasteryColor(0.95), '#22d3a0');
});

test('getMasteryLabel returns correct mastery status', () => {
  assert.equal(getMasteryLabel(0.2), 'Needs Work');
  assert.equal(getMasteryLabel(0.5), 'Developing');
  assert.equal(getMasteryLabel(0.75), 'Proficient');
  assert.equal(getMasteryLabel(0.9), 'Mastered');
});

test('recommendNextTopic respects prerequisite unlocking', () => {
  const curriculum = {
    nodes: [
      { id: 'basics', label: 'Basics' },
      { id: 'advanced', label: 'Advanced' },
    ],
    edges: [
      { from: 'basics', to: 'advanced' },
    ],
  };

  // When basics is below 0.5, recommend basics
  assert.equal(recommendNextTopic(curriculum, { basics: 0.2 }).id, 'basics');

  // When basics is >= 0.5, unlock and recommend advanced
  assert.equal(recommendNextTopic(curriculum, { basics: 0.6, advanced: 0.1 }).id, 'advanced');
});

test('getCurriculumProgress calculates percentage correctly', () => {
  const curriculum = {
    nodes: [
      { id: 'n1' },
      { id: 'n2' },
      { id: 'n3' },
      { id: 'n4' },
    ],
  };
  const masteryMap = { n1: 1.0, n2: 0.5, n3: 0.5, n4: 0.0 };
  assert.equal(getCurriculumProgress(curriculum, masteryMap), 50);
  assert.equal(getCurriculumProgress(null), 0);
});
