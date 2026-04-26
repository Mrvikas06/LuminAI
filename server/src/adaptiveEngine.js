// server/src/adaptiveEngine.js

export function updateMastery(current = 0, correct, mistakeType) {
  const delta = correct
    ? 0.15
    : mistakeType === 'conceptual_misunderstanding' ? -0.12
    : mistakeType === 'partial_knowledge'           ? -0.05
    : -0.03;
  return Math.max(0, Math.min(1, current + delta));
}

export function selectWeakTopics(curriculum, masteryMap, count = 5) {
  if (!curriculum?.nodes?.length) return [];
  return [...curriculum.nodes]
    .sort((a, b) => (masteryMap[a.id] || 0) - (masteryMap[b.id] || 0))
    .slice(0, count);
}

export function getExplanationSystemPrompt(mode) {
  const modes = {
    simple:     'Explain clearly without jargon. Use plain language. End with a "## Check Your Understanding" section with ONE concise question.',
    technical:  'Explain precisely and formally with correct terminology. Cover edge cases. End with a "## Check Your Understanding" section with ONE technical question.',
    analogy:    'Explain using a vivid, memorable analogy or metaphor. Make it stick. End with a "## Check Your Understanding" section with ONE question.',
    real_world: 'Explain through real-world use cases and practical applications. Show WHY it matters. End with a "## Check Your Understanding" section with ONE applied question.',
  };
  return modes[mode] || modes.simple;
}

export function classifyMistakeType(evaluation) {
  const text = (evaluation || '').toLowerCase();
  if (text.includes('fundamental') || text.includes('misconception') || text.includes('wrong') || text.includes('incorrect')) return 'conceptual_misunderstanding';
  if (text.includes('partial') || text.includes('incomplete') || text.includes('missing'))  return 'partial_knowledge';
  if (text.includes('confident') || text.includes('guess') || text.includes('unsure'))      return 'guessing_low_confidence';
  return 'partial_knowledge';
}
