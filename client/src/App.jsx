import { useState, useEffect } from 'react';
import { useLearningStore } from './store/learningStore';
import { generateCurriculum, getProgress } from './api/uale';
import SetupScreen from './components/SetupScreen';
import CurriculumPanel from './components/CurriculumPanel';
import ChatPanel from './components/ChatPanel';
import Dashboard from './components/Dashboard';
import QuizMode from './components/QuizMode';

const TABS = [
  { id: 'learn', label: 'Learn', icon: '💬' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'quiz', label: 'Quiz', icon: '🧠' },
];

export default function App() {
  const {
    userId, subject, curriculum, masteryMap, activeTab, activeTopic,
    setSubject, setCurriculum, setActiveTab, setActiveTopic,
    setProgress, addMessage, clearMessages,
  } = useLearningStore();

  const [isSetupLoading, setIsSetupLoading] = useState(false);

  useEffect(() => { getProgress(userId).then(setProgress).catch(() => { }); }, [userId]);

  const handleStart = async (subj) => {
    setIsSetupLoading(true);
    try {
      const data = await generateCurriculum(subj, userId);
      setSubject(subj);
      setCurriculum(data.curriculum);
      clearMessages();
      addMessage({ role: 'assistant', content: `## Welcome to your ${subj} curriculum!\n\n${data.curriculum.summary}\n\nGenerated **${data.curriculum.nodes?.length || 0} topics** organized from fundamentals to advanced.\n\nClick any topic in the sidebar to start learning.` });
      setActiveTab('learn');
    } catch (err) { alert('Error: ' + err.message); }
    setIsSetupLoading(false);
  };

  const handleSelectTopic = (node) => { setActiveTopic(node); setActiveTab('learn'); clearMessages(); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: 340, borderRight: '1px solid var(--border)', borderRightColor: 'var(--border-glow)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, zIndex: 10, borderRadius: '0 20px 20px 0' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>✨</div>
            <div>
              <div style={{ fontSize: 18, fontFamily: 'Outfit', fontWeight: 800, letterSpacing: '-0.4px', background: 'linear-gradient(135deg,var(--text),var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LuminAI</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.3px', fontWeight: 600 }}>Omniscient Agent</div>
            </div>
          </div>
          {curriculum && (
            <button onClick={() => { setCurriculum(null); setSubject(null); setActiveTopic(null); clearMessages(); }}
              style={{ width: '100%', padding: 6, background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text3)', fontSize: 11, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent2)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)'; }}>
              ↩ Change Subject
            </button>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {curriculum
            ? <CurriculumPanel curriculum={curriculum} masteryMap={masteryMap} activeTopic={activeTopic} onSelectTopic={handleSelectTopic} />
            : <div style={{ padding: 20, color: 'var(--text3)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>Enter any subject to get started</div>
          }
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!curriculum ? (
          <SetupScreen onStart={handleStart} isLoading={isSetupLoading} />
        ) : (
          <>
            <div className="glass-panel" style={{ display: 'flex', borderBottom: '1px solid var(--border)', borderBottomColor: 'var(--border-glow)', padding: '0 20px', flexShrink: 0, alignItems: 'center', zIndex: 5, borderRadius: '0 0 20px 20px', margin: '0 20px 20px 20px' }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent)' : 'transparent'}`, color: activeTab === tab.id ? 'var(--accent2)' : 'var(--text3)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: activeTab === tab.id ? 600 : 400, marginBottom: -1 }}>
                  <span>{tab.icon}</span><span>{tab.label}</span>
                </button>
              ))}
              <div style={{ flex: 1 }} />
              {activeTopic && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text3)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
                  Studying: {activeTopic.label}
                </div>
              )}
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {activeTab === 'learn' && <ChatPanel activeTopic={activeTopic} userId={userId} />}
              {activeTab === 'dashboard' && <Dashboard curriculum={curriculum} masteryMap={masteryMap} subject={subject} onSelectTopic={handleSelectTopic} />}
              {activeTab === 'quiz' && <QuizMode userId={userId} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
