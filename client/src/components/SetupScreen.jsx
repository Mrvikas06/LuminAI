import { useState } from 'react';

const POPULAR = [
  { label: 'Data Structures & Algorithms', icon: '🌳' },
  { label: 'Machine Learning', icon: '🤖' },
  { label: 'Quantum Physics', icon: '⚛' },
  { label: 'Personal Finance', icon: '💰' },
  { label: 'Linear Algebra', icon: '📐' },
  { label: 'JavaScript', icon: '🟨' },
  { label: 'Organic Chemistry', icon: '🧪' },
  { label: 'World History', icon: '🌍' },
];

export default function SetupScreen({ onStart, isLoading }) {
  const [subject, setSubject] = useState('');
  const handleStart = () => { if (subject.trim()) onStart(subject.trim()); };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div className="glass-panel" style={{ maxWidth: 580, width: '100%', padding: '50px', borderRadius: 'var(--radius-lg)', animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: 45 }}>
          <div style={{ fontSize: 56, marginBottom: 16, animation: 'float 6s infinite', textShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' }}>✨</div>
          <h1 style={{ fontSize: 44, fontFamily: 'Outfit', fontWeight: 800, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 10 }}>
            LuminAI
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 16, fontWeight: 600, letterSpacing: '0.5px' }}>The Omniscient Learning Agent</p>
          <p style={{ color: 'var(--text3)', fontSize: 14, marginTop: 8 }}>Type any subject — let LuminAI craft your personalized journey.</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="What do you want to learn? (e.g. Quantum Mechanics)"
              disabled={isLoading}
              style={{ flex: 1, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 15, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={handleStart}
              disabled={isLoading || !subject.trim()}
              style={{ padding: '14px 24px', background: isLoading || !subject.trim() ? 'var(--surface)' : 'linear-gradient(135deg,var(--accent),#6366f1)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isLoading || !subject.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {isLoading ? '⟳ Building…' : 'Start Learning →'}
            </button>
          </div>
          {isLoading && <p style={{ marginTop: 12, color: 'var(--text3)', fontSize: 12, textAlign: 'center', animation: 'pulse 1.5s infinite' }}>🤖 Generating personalized curriculum…</p>}
        </div>

        <div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Popular subjects</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {POPULAR.map(s => (
              <button key={s.label} onClick={() => setSubject(s.label)}
                style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
              >
                <span>{s.icon}</span><span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
