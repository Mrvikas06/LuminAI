// server/src/routes/quiz.js
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUser, updateUser } from '../store.js';
import { selectWeakTopics, updateMastery } from '../adaptiveEngine.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', async (req, res) => {
  const { userId, count = 5 } = req.body;
  const user = getUser(userId);
  if (!user.curriculum?.nodes?.length) return res.status(400).json({ error: 'No curriculum found' });

  const weakTopics = selectWeakTopics(user.curriculum, user.masteryMap, count);
  const topicsStr = weakTopics.map(t => `- ${t.label} (id: ${t.id})`).join('\n');

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: 'You are a quiz generator. Return ONLY valid JSON, no markdown.',
  });

  try {
    const prompt = `Generate ${count} multiple-choice quiz questions for: ${user.subject}

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
    const raw = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    console.error('Quiz generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/submit', (req, res) => {
  const { userId, results } = req.body;
  const user = getUser(userId);
  const masteryMap = { ...user.masteryMap };
  (results || []).forEach(r => {
    masteryMap[r.topicId] = updateMastery(masteryMap[r.topicId] || 0, r.correct, r.correct ? 'correct' : 'partial_knowledge');
  });
  updateUser(userId, { masteryMap });
  res.json({ masteryMap, score: results.filter(r => r.correct).length, total: results.length });
});

export default router;
