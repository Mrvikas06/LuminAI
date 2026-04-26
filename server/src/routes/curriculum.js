// server/src/routes/curriculum.js
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUser, updateUser } from '../store.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

router.post('/generate', async (req, res) => {
  const { subject, userId } = req.body;
  if (!subject || !userId) return res.status(400).json({ error: 'subject and userId required' });

  try {
    const prompt = `Generate a comprehensive learning curriculum for: "${subject}"

Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{
  "subject": "${subject}",
  "summary": "2-sentence overview of the subject",
  "estimatedHours": 20,
  "learningPath": ["node_id_1", "node_id_2"],
  "nodes": [
    {
      "id": "unique_snake_case_id",
      "label": "Topic Name",
      "group": "Category/Module Name",
      "description": "One sentence description",
      "estimatedMinutes": 30,
      "prerequisites": []
    }
  ],
  "edges": [
    { "from": "node_id", "to": "node_id" }
  ]
}

Requirements:
- 10-16 nodes covering fundamentals to advanced
- 3-4 logical groups/modules
- Edges represent prerequisite relationships
- Learning path ordered from easiest to hardest
- estimatedMinutes: 15-60 per topic`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const curriculum = JSON.parse(raw);

    updateUser(userId, { subject, curriculum });
    res.json({ curriculum });
  } catch (err) {
    console.error('Curriculum error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId', (req, res) => {
  const user = getUser(req.params.userId);
  res.json({ curriculum: user.curriculum, subject: user.subject });
});

export default router;
