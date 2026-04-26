import { useState } from 'react';
import { generateQuiz, submitQuiz } from '../api/uale';
import { useLearningStore } from '../store/learningStore';
import { getMasteryColor } from '../utils/adaptiveEngine';

export default function QuizMode({ userId }) {
  const { curriculum, masteryMap, updateMastery, setActiveTab } = useLearningStore();
  const [questions, setQuestions] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!curriculum) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text3)' }}><div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div><p>Generate a curriculum first</p></div>
    </div>
  );

  const weakTopics = (curriculum.nodes || []).map(n => ({ ...n, mastery: masteryMap[n.id] || 0 })).sort((a, b) => a.mastery - b.mastery).slice(0, 5);

  const handleGenerate = async () => {
    setIsLoading(true); setResults([]); setCurrent(0); setSelected(null); setAnswered(false); setSubmitted(false);
    try { const d = await generateQuiz(userId, 5); setQuestions(d.questions || []); }
    catch (err) { alert('Error: ' + err.message); }
    setIsLoading(false);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    setAnswered(true);
    const q = questions[current];
    setResults(r => [...r, { topicId: q.topicId, topicLabel: q.topicLabel, correct: selected === q.correctIndex, selectedIndex: selected, correctIndex: q.correctIndex }]);
  };

  const handleNext = async () => {
    if (current + 1 < questions.length) { setCurrent(c => c + 1); setSelected(null); setAnswered(false); }
    else {
      setSubmitted(true);
      try { const d = await submitQuiz(userId, results); Object.entries(d.masteryMap || {}).forEach(([id, v]) => updateMastery(id, v)); } catch { }
    }
  };

  if (!questions && !isLoading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div className="glass-panel" style={{ maxWidth: 500, width: '100%', textAlign: 'center', padding: 40, borderRadius: 'var(--radius-lg)' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 6s infinite' }}>🧠</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: 'var(--accent2)' }}>Adaptive Quiz</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Questions tailored to your weakest areas</p>
        <div style={{ marginBottom: 30, textAlign: 'left' }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, fontWeight: 600 }}>Targeting weak areas</p>
          {weakTopics.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{t.label}</div>
              <div style={{ width: 100, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(t.mastery * 100)}%`, height: '100%', background: getMasteryColor(t.mastery), borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 12, color: getMasteryColor(t.mastery), width: 36, textAlign: 'right', fontWeight: 600 }}>{Math.round(t.mastery * 100)}%</div>
            </div>
          ))}
        </div>
        <button onClick={handleGenerate} style={{ padding: '14px 32px', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', border: 'none', borderRadius: 'var(--radius-lg)', color: '#000', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%', boxShadow: '0 4px 15px rgba(0, 245, 212, 0.3)' }}>
          Generate Quiz (5 Questions)
        </button>
      </div>
    </div>
  );

  if (isLoading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: 32, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
        <p style={{ marginTop: 12, fontSize: 14 }}>Crafting personalized questions…</p>
      </div>
    </div>
  );

  if (submitted) {
    const score = results.filter(r => r.correct).length;
    const pct = Math.round(score / questions.length * 100);
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{pct >= 80 ? '🎉' : pct >= 50 ? '📈' : '📚'}</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)', marginBottom: 8 }}>{score}/{questions.length}</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 24 }}>{pct >= 80 ? 'Excellent! Mastery improving.' : pct >= 50 ? 'Good effort — keep practicing.' : 'Keep going — AI will adapt.'}</p>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface)', borderRadius: 8, marginBottom: 6, textAlign: 'left' }}>
              <span style={{ fontSize: 16 }}>{r.correct ? '✅' : '❌'}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1 }}>{r.topicLabel}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleGenerate} style={{ flex: 1, padding: 11, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>Try Again</button>
            <button onClick={() => setActiveTab('learn')} style={{ flex: 1, padding: 11, background: 'linear-gradient(135deg,var(--accent),#6366f1)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Continue Learning</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: 'var(--text3)' }}>
          <span>Question {current + 1} of {questions.length}</span>
          <span style={{ padding: '2px 8px', borderRadius: 10, background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)', fontSize: 11 }}>{q.topicLabel}</span>
        </div>
        <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--green))', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, color: 'var(--text)' }}>{q.question}</p>
        </div>

        {q.options.map((opt, i) => {
          let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--text2)';
          if (answered) {
            if (i === q.correctIndex) { bg = 'rgba(34,211,160,0.1)'; border = 'var(--green)'; color = 'var(--green)'; }
            else if (i === selected) { bg = 'rgba(239,68,68,0.1)'; border = 'var(--red)'; color = 'var(--red)'; }
          } else if (selected === i) { bg = 'rgba(124,106,247,0.12)'; border = 'var(--accent)'; color = 'var(--accent2)'; }
          return (
            <div key={i} onClick={() => !answered && setSelected(i)}
              style={{ padding: '12px 16px', border: `1px solid ${border}`, borderRadius: 'var(--radius)', marginBottom: 8, cursor: answered ? 'default' : 'pointer', background: bg, color, fontSize: 13, lineHeight: 1.4 }}>
              <strong style={{ marginRight: 8 }}>{String.fromCharCode(65 + i)}.</strong>{opt}
            </div>
          );
        })}

        {answered && (
          <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(34,211,160,0.08)', border: '1px solid rgba(34,211,160,0.2)', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--green)' }}>Explanation: </strong>{q.explanation}
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          {!answered ? (
            <button onClick={handleConfirm} disabled={selected === null}
              style={{ padding: '11px 28px', background: selected !== null ? 'linear-gradient(135deg,var(--accent),#6366f1)' : 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: selected !== null ? '#fff' : 'var(--text3)', fontSize: 13, fontWeight: 600, cursor: selected !== null ? 'pointer' : 'not-allowed' }}>
              Confirm Answer
            </button>
          ) : (
            <button onClick={handleNext}
              style={{ padding: '11px 28px', background: 'linear-gradient(135deg,var(--accent),#6366f1)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {current + 1 < questions.length ? 'Next Question →' : 'View Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
