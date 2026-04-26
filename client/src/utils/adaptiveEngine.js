export function getDifficultyFromMastery(mastery) {
  if (mastery < 0.25) return 'Beginner';
  if (mastery < 0.55) return 'Intermediate';
  if (mastery < 0.80) return 'Advanced';
  return 'Expert';
}

export function getMasteryColor(mastery) {
  if (mastery < 0.30) return '#ef4444';
  if (mastery < 0.60) return '#f59e0b';
  if (mastery < 0.80) return '#3b82f6';
  return '#22d3a0';
}

export function getMasteryLabel(mastery) {
  if (mastery < 0.30) return 'Needs Work';
  if (mastery < 0.60) return 'Developing';
  if (mastery < 0.80) return 'Proficient';
  return 'Mastered';
}

export const MISTAKE_META = {
  conceptual_misunderstanding: {
    label: 'Conceptual Gap', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '⚠',
    description: 'Core concept needs re-explaining.',
  },
  partial_knowledge: {
    label: 'Partial Understanding', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '◑',
    description: 'Right idea — fill in missing pieces.',
  },
  guessing_low_confidence: {
    label: 'Low Confidence', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '?',
    description: 'Build more confidence with practice.',
  },
  correct: {
    label: 'Correct', color: '#22d3a0', bg: 'rgba(34,211,160,0.12)', icon: '✓',
    description: 'Excellent understanding!',
  },
};

export const EXPLANATION_MODES = [
  { id: 'simple',     label: 'Simple',     icon: '💡', desc: 'Clear & jargon-free' },
  { id: 'technical',  label: 'Technical',  icon: '⚙',  desc: 'Precise & formal' },
  { id: 'analogy',    label: 'Analogy',    icon: '🔗', desc: 'Memorable comparison' },
  { id: 'real_world', label: 'Real World', icon: '🌍', desc: 'Practical applications' },
];

export function recommendNextTopic(curriculum, masteryMap) {
  if (!curriculum?.nodes?.length) return null;
  const prereqMap = {};
  (curriculum.edges || []).forEach(({ from, to }) => {
    prereqMap[to] = prereqMap[to] || [];
    prereqMap[to].push(from);
  });
  const eligible = curriculum.nodes.filter(node => {
    const prereqs = prereqMap[node.id] || [];
    return prereqs.every(p => (masteryMap[p] || 0) >= 0.50);
  });
  if (!eligible.length) return curriculum.nodes[0];
  return eligible.sort((a, b) => (masteryMap[a.id] || 0) - (masteryMap[b.id] || 0))[0];
}

export function getCurriculumProgress(curriculum, masteryMap) {
  if (!curriculum?.nodes?.length) return 0;
  const total = curriculum.nodes.reduce((s, n) => s + (masteryMap[n.id] || 0), 0);
  return Math.round((total / curriculum.nodes.length) * 100);
}
