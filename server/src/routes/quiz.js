// server/src/routes/quiz.js
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUser, updateUser } from '../store.js';
import { selectWeakTopics, updateMastery } from '../adaptiveEngine.js';
import { parseGenerativeJson } from '../utils/jsonParser.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

router.post('/generate', async (req, res) => {
  const { userId, count = 5 } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const user = getUser(userId);
  if (!user.curriculum?.nodes?.length) return res.status(400).json({ error: 'No curriculum found' });

  const safeCount = Math.max(1, Math.min(10, parseInt(count, 10) || 5));
  const weakTopics = selectWeakTopics(user.curriculum, user.masteryMap, safeCount);
  const topicsStr = weakTopics.map(t => `- ${t.label} (id: ${t.id})`).join('\n');

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: 'You are a quiz generator. Return ONLY valid JSON, no markdown.',
  });

  try {
    const prompt = `Generate ${safeCount} multiple-choice quiz questions for: ${user.subject}

Focus on these weak topics (one question per topic):
${topicsStr}

Return JSON:
{
  "questions": [
    {
      "topicId": "exact_topic_id",
      "topicLabel": "Topic Name",
      "question": "Clear question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this is correct (1-2 sentences)"
    }
  ]
}

Requirements:
- 4 options each, only one correct
- Test conceptual understanding, not memorization
- Clear, unambiguous questions`;

    const result = await model.generateContent(prompt);
    const data = parseGenerativeJson(result.response.text());
    res.json(data);
  } catch (err) {
    console.error('Quiz generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/submit', (req, res) => {
  const { userId, results } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const user = getUser(userId);
  const masteryMap = { ...(user.masteryMap || {}) };
  const safeResults = Array.isArray(results) ? results : [];

  safeResults.forEach(r => {
    if (r && r.topicId) {
      masteryMap[r.topicId] = updateMastery(
        masteryMap[r.topicId] || 0,
        Boolean(r.correct),
        r.correct ? 'correct' : 'partial_knowledge'
      );
    }
  });

  updateUser(userId, { masteryMap });
  const score = safeResults.filter(r => Boolean(r && r.correct)).length;
  res.json({ masteryMap, score, total: safeResults.length });
});

export default router;
