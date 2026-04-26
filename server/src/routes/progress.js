// server/src/routes/progress.js
import { Router } from 'express';
import { getUser, updateUser } from '../store.js';

const router = Router();

router.get('/:userId', (req, res) => {
  const user = getUser(req.params.userId);
  res.json({
    masteryMap:         user.masteryMap,
    mistakeHistory:     user.mistakeHistory,
    interactions:       user.interactions,
    preferredMode:      user.preferredMode,
    learningSpeed:      user.learningSpeed,
    curriculumProgress: user.curriculumProgress,
    subject:            user.subject,
    curriculum:         user.curriculum,
  });
});

router.post('/:userId', (req, res) => {
  const user = updateUser(req.params.userId, req.body);
  res.json({ ok: true, user });
});

export default router;
