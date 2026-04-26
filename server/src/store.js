// server/src/store.js — simple in-memory store (no DB needed for demo)
const users = {};

export function getUser(userId) {
  if (!users[userId]) {
    users[userId] = {
      userId,
      subject:            null,
      curriculum:         null,
      masteryMap:         {},
      mistakeHistory:     {},
      interactions:       [],
      preferredMode:      'simple',
      learningSpeed:      'moderate',
      curriculumProgress: 0,
    };
  }
  return users[userId];
}

export function updateUser(userId, patch) {
  const u = getUser(userId);
  Object.assign(u, patch);
  return u;
}
