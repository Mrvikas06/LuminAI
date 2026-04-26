// server/src/routes/learning.js
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUser, updateUser } from '../store.js';
import { updateMastery, getExplanationSystemPrompt } from '../adaptiveEngine.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// SSE streaming explanation
router.post('/explain', async (req, res) => {
  const { topicId, topicLabel, mode = 'simple', userId } = req.body;
  if (!topicId || !topicLabel || !userId) return res.status(400).json({ error: 'Missing fields' });

  const user = getUser(userId);
  const mastery = user.masteryMap[topicId] || 0;
  const level = mastery < 0.25 ? 'complete beginner' : mastery < 0.55 ? 'intermediate learner' : 'advanced learner';
  const modeHint = getExplanationSystemPrompt(mode);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: `You are an expert adaptive tutor. ${modeHint} Use markdown formatting.`,
  });

  const prompt = `Teach me about "${topicLabel}" for ${user.subject || 'this subject'}. I am a ${level} (mastery: ${Math.round(mastery * 100)}%). Be engaging and thorough but concise.`;

  let fullText = '';
  try {
    const stream = await model.generateContentStream(prompt);
    for await (const chunk of stream.stream) {
      const text = chunk.text();
      if (text) {
        fullText += text;
        res.write(`data: ${JSON.stringify({ chunk: fullText })}\n\n`);
      }
    }
    const interactions = [...(user.interactions || []), { topicId, topicLabel, mode, timestamp: Date.now() }].slice(-100);
    updateUser(userId, { interactions, preferredMode: mode });
  } catch (err) {
    console.error('Explain error:', err);
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

// Evaluate answer
router.post('/evaluate', async (req, res) => {
  const { topicId, topicLabel, question, userAnswer, userId } = req.body;
  if (!topicId || !question || !userAnswer || !userId) return res.status(400).json({ error: 'Missing fields' });

  const user = getUser(userId);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: 'You are an expert adaptive tutor evaluating student answers. Be encouraging but honest. Return ONLY valid JSON with no markdown.',
  });

  try {
    const prompt = `Topic: "${topicLabel}"
Question asked: "${question}"
Student answer: "${userAnswer}"

Evaluate and return JSON:
{
  "correct": boolean,
  "mistakeType": "correct" | "conceptual_misunderstanding" | "partial_knowledge" | "guessing_low_confidence",
  "feedback": "2-3 sentence constructive feedback",
  "betterExplanation": "corrected explanation if wrong, null if correct",
  "followUpQuestion": "next question to deepen understanding, null if mastered"
}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const eval_ = JSON.parse(raw);

    const currentMastery = user.masteryMap[topicId] || 0;
    const newMastery = updateMastery(currentMastery, eval_.correct, eval_.mistakeType);
    updateUser(userId, { masteryMap: { ...user.masteryMap, [topicId]: newMastery } });

    res.json({ ...eval_, newMastery });
  } catch (err) {
    console.error('Evaluate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Recommend next topic
router.get('/recommend/:userId', (req, res) => {
  const user = getUser(req.params.userId);
  if (!user.curriculum?.nodes?.length) return res.json({ topic: null });

  const prereqMap = {};
  (user.curriculum.edges || []).forEach(({ from, to }) => {
    prereqMap[to] = prereqMap[to] || [];
    prereqMap[to].push(from);
  });

  const eligible = user.curriculum.nodes.filter(node => {
    return (prereqMap[node.id] || []).every(p => (user.masteryMap[p] || 0) >= 0.50);
  });

  const topic = eligible.length
    ? eligible.sort((a, b) => (user.masteryMap[a.id] || 0) - (user.masteryMap[b.id] || 0))[0]
    : user.curriculum.nodes[0];

  res.json({ topic });
});

export default router;
