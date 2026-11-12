// server/test/jsonParser.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGenerativeJson } from '../src/utils/jsonParser.js';

test('parseGenerativeJson parses plain JSON string', () => {
  const input = '{"subject": "Physics", "nodes": []}';
  const parsed = parseGenerativeJson(input);
  assert.equal(parsed.subject, 'Physics');
  assert.deepEqual(parsed.nodes, []);
});

test('parseGenerativeJson handles markdown code fence with json tag', () => {
  const input = '```json\n{\n  "greeting": "hello"\n}\n```';
  const parsed = parseGenerativeJson(input);
  assert.equal(parsed.greeting, 'hello');
});

test('parseGenerativeJson handles markdown commentary before and after json', () => {
  const input = 'Here is the curriculum you requested:\n```json\n{"topics": [1, 2, 3]}\n```\nHope this helps!';
  const parsed = parseGenerativeJson(input);
  assert.deepEqual(parsed.topics, [1, 2, 3]);
});

test('parseGenerativeJson parses JSON arrays', () => {
  const input = '[{"id": "node_1"}, {"id": "node_2"}]';
  const parsed = parseGenerativeJson(input);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].id, 'node_1');
});

test('parseGenerativeJson throws on invalid input', () => {
  assert.throws(() => parseGenerativeJson(''), /Empty or invalid response/);
  assert.throws(() => parseGenerativeJson(null), /Empty or invalid response/);
  assert.throws(() => parseGenerativeJson('not json at all'), /Failed to parse model output as JSON/);
});
