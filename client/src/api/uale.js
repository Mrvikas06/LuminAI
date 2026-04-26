const BASE = '/api';

async function post(url, body) {
  const res = await fetch(BASE + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

async function get(url) {
  const res = await fetch(BASE + url);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export const generateCurriculum = (subject, userId) => post('/curriculum/generate', { subject, userId });
export const getCurriculum      = (userId)           => get(`/curriculum/${userId}`);
export const evaluateAnswer     = (data)             => post('/learning/evaluate', data);
export const generateQuiz       = (userId, count=5)  => post('/quiz/generate', { userId, count });
export const submitQuiz         = (userId, results)  => post('/quiz/submit', { userId, results });
export const getProgress        = (userId)           => get(`/progress/${userId}`);
export const updateProgress     = (userId, updates)  => post(`/progress/${userId}`, updates);
export const getRecommendation  = (userId)           => get(`/learning/recommend/${userId}`);

export async function streamExplanation({ topicId, topicLabel, mode, userId }, onChunk) {
  const res = await fetch(`${BASE}/learning/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId, topicLabel, mode, userId }),
  });
  if (!res.ok) throw new Error('Explanation request failed');

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.chunk)  { full = data.chunk; onChunk(full); }
          if (data.done)   return full;
        } catch {}
      }
    }
  }
  return full;
}
