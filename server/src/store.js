// server/src/store.js — in-memory store backed by Map to prevent prototype pollution
const users = new Map();

export function getUser(userId) {
  const safeId = typeof userId === 'string' && userId.trim() ? userId.trim() : 'anonymous';
  if (!users.has(safeId)) {
    users.set(safeId, {
      userId: safeId,
      subject:            null,
      curriculum:         null,
      masteryMap:         {},
      mistakeHistory:     {},
      interactions:       [],
      preferredMode:      'simple',
      learningSpeed:      'moderate',
      curriculumProgress: 0,
    });
  }
  return users.get(safeId);
}

export function updateUser(userId, patch) {
  const u = getUser(userId);
  if (patch && typeof patch === 'object') {
    Object.assign(u, patch);
  }
  return u;
}

export function clearUser(userId) {
  if (typeof userId === 'string') {
    return users.delete(userId.trim());
  }
  return false;
}

export function clearAllUsers() {
  users.clear();
}
