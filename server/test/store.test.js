// server/test/store.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getUser, updateUser, clearUser, clearAllUsers } from '../src/store.js';

test('store initializes user with default profile', () => {
  clearAllUsers();
  const user = getUser('test_user_1');
  assert.equal(user.userId, 'test_user_1');
  assert.equal(user.curriculum, null);
  assert.deepEqual(user.masteryMap, {});
});

test('store updates user profile safely', () => {
  updateUser('test_user_1', { preferredMode: 'technical' });
  const updated = getUser('test_user_1');
  assert.equal(updated.preferredMode, 'technical');
});

test('store protects against prototype pollution keys', () => {
  const protoUser = getUser('__proto__');
  assert.equal(protoUser.userId, '__proto__');
  assert.equal(Object.prototype.userId, undefined);
});

test('store clearUser removes user entry', () => {
  getUser('delete_me');
  assert.equal(clearUser('delete_me'), true);
});
