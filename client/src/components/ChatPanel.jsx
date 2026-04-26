import { useState, useRef, useEffect } from 'react';
import { streamExplanation, evaluateAnswer } from '../api/uale';
import { MISTAKE_META, EXPLANATION_MODES } from '../utils/adaptiveEngine';
import { useLearningStore } from '../store/learningStore';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

function MistakeBadge({ type }) {
  const meta = MISTAKE_META[type];
  if (!meta) return null;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, marginBottom: 6, border: `1px solid ${meta.color}44` }}>
      <span>{meta.icon}</span><span>{meta.label}</span>
      <span style={{ fontWeight: 400, opacity: 0.8 }}>— {meta.description}</span>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 10, marginBottom: 18, animation: 'fadeIn 0.2s ease' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: isUser ? 'linear-gradient(135deg,var(--accent),#6366f1)' : 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: isUser ? '#fff' : 'var(--accent)' }}>
        {isUser ? 'U' : '✨'}
      </div>
      <div style={{ maxWidth: '78%' }}>
        {msg.mistakeType && <MistakeBadge type={msg.mistakeType} />}
        <div style={{ padding: '11px 14px', background: isUser ? 'rgba(59,130,246,0.1)' : 'var(--surface)', border: `1px solid ${isUser ? 'rgba(59,130,246,0.2)' : 'var(--border)'}`, borderRadius: isUser ? '12px 2px 12px 12px' : '2px 12px 12px 12px', lineHeight: 1.65 }}>
          <div className="prose" style={{ fontSize: 14 }}>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
          </div>
          {msg.streaming && <span style={{ display: 'inline-block', width: 6, height: 14, background: 'var(--accent)', marginLeft: 3, borderRadius: 1, animation: 'blink 0.7s step-end infinite', verticalAlign: 'middle' }} />}
        </div>
        {msg.followUpQuestion && (
          <div style={{ marginTop: 8, padding: '9px 12px', background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--accent2)', lineHeight: 1.5 }}>
            <strong style={{ opacity: 0.7 }}>Check your understanding: </strong>{msg.followUpQuestion}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({ activeTopic, userId }) {
  const { messages, addMessage, updateMessage, awaitingAnswer, setAwaitingAnswer, preferredMode, setPreferredMode, updateMastery } = useLearningStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(preferredMode || 'simple');
  const chatRef = useRef(null);
  const msgIdRef = useRef(0);
  const prevTopic = useRef(null);

  const scrollBottom = () => { setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 50); };
  useEffect(scrollBottom, [messages]);

  const startLesson = async (topic) => {
    setIsLoading(true);
    addMessage({ role: 'user', content: `Teach me: ${topic.label}` });
    const id = ++msgIdRef.current;
    addMessage({ id, role: 'assistant', content: '', streaming: true });
    let lastFU = null;
    await streamExplanation({ topicId: topic.id, topicLabel: topic.label, mode, userId }, chunk => {
      const m = chunk.match(/## Check Your Understanding\n(.+?)(?:\n|$)/);
      lastFU = m ? m[1].trim() : null;
      updateMessage(id, { content: chunk, streaming: true, followUpQuestion: lastFU });
    });
    updateMessage(id, { streaming: false, followUpQuestion: lastFU });
    if (lastFU) setAwaitingAnswer({ topicId: topic.id, topicLabel: topic.label, question: lastFU });
    setIsLoading(false);
    scrollBottom();
  };

  const handleEvaluate = async (userAnswer) => {
    if (!awaitingAnswer) return;
    const { topicId, topicLabel, question } = awaitingAnswer;
    setAwaitingAnswer(null);
    addMessage({ role: 'user', content: userAnswer });
    const id = ++msgIdRef.current;
    addMessage({ id, role: 'assistant', content: '🔍 Analyzing your answer…', streaming: false });
    setIsLoading(true);
    try {
      const result = await evaluateAnswer({ topicId, topicLabel, question, userAnswer, userId });
      updateMessage(id, { content: result.feedback + (result.betterExplanation ? '\n\n' + result.betterExplanation : ''), mistakeType: result.mistakeType, followUpQuestion: result.followUpQuestion, streaming: false });
      if (result.newMastery !== undefined) updateMastery(topicId, result.newMastery);
      if (result.followUpQuestion) setAwaitingAnswer({ topicId, topicLabel, question: result.followUpQuestion });
    } catch {
      updateMessage(id, { content: 'Error evaluating answer.', streaming: false });
    }
    setIsLoading(false);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    if (awaitingAnswer) { handleEvaluate(text); return; }
    addMessage({ role: 'user', content: text });
  };

  useEffect(() => {
    if (activeTopic && activeTopic.id !== prevTopic.current) {
      prevTopic.current = activeTopic.id;
      startLesson(activeTopic);
    }
  }, [activeTopic?.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Mode bar */}
      <div className="glass-panel" style={{ display: 'flex', gap: 8, padding: '10px 20px', flexShrink: 0, margin: '0 20px', borderRadius: 'var(--radius)' }}>
        <span style={{ fontSize: 12, color: 'var(--text3)', alignSelf: 'center', marginRight: 8, fontWeight: 600 }}>TUTOR MODE:</span>
        {EXPLANATION_MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setPreferredMode(m.id); }} title={m.desc}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', background: mode === m.id ? 'var(--accent)' : 'transparent', border: `1px solid ${mode === m.id ? 'var(--accent)' : 'var(--border)'}`, color: mode === m.id ? '#fff' : 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: mode === m.id ? 600 : 400, boxShadow: mode === m.id ? '0 2px 10px rgba(157, 78, 221, 0.4)' : 'none' }}>
            <span>{m.icon}</span><span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text3)', marginTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 6 }}>Select a topic from the sidebar to start learning</p>
            <p style={{ fontSize: 12 }}>or type a question below</p>
          </div>
        ) : messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
      </div>

      {awaitingAnswer && (
        <div style={{ padding: '7px 16px', background: 'rgba(245,158,11,0.1)', borderTop: '1px solid rgba(245,158,11,0.2)', fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span>✍</span><span>Type your answer to track mastery</span>
        </div>
      )}

      {/* Input */}
      {/* Input */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', gap: 12, flexShrink: 0, margin: '0 20px 20px', borderRadius: 'var(--radius-lg)' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder={awaitingAnswer ? 'Type your answer here…' : 'Ask anything or select a topic…'}
          disabled={isLoading}
          style={{ flex: 1, padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14, outline: 'none' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}
          style={{ padding: '12px 24px', borderRadius: 'var(--radius)', background: isLoading ? 'var(--surface)' : 'linear-gradient(135deg,var(--accent),var(--accent2))', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(157, 78, 221, 0.4)' }}>
          {isLoading ? '…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
