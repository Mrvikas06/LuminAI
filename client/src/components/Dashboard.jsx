import { useEffect, useRef } from 'react';
import { getMasteryColor, getMasteryLabel, getDifficultyFromMastery, getCurriculumProgress } from '../utils/adaptiveEngine';

function StatCard({ value, label, color = 'var(--text)' }) {
  return (
    <div className="glass-panel" style={{ padding: 16, borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: 32, fontFamily: 'Outfit', fontWeight: 800, color, marginBottom: 4, textShadow: `0 0 15px ${color}66` }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function MasteryCard({ node, mastery, onSelect }) {
  const pct = Math.round(mastery * 100);
  const color = getMasteryColor(mastery);
  const label = getMasteryLabel(mastery);
  return (
    <div className="glass-panel" onClick={() => onSelect(node)}
      style={{ padding: '16px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${color}33`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1, marginRight: 8, lineHeight: 1.3 }}>{node.label}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color, flexShrink: 0 }}>{pct}%</div>
      </div>
      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease', boxShadow: `0 0 8px ${color}88` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)' }}>
        <span style={{ color, fontWeight: 500 }}>{label}</span>
        <span>{getDifficultyFromMastery(mastery)}</span>
      </div>
    </div>
  );
}

function KnowledgeGraph({ curriculum, masteryMap, onSelectTopic }) {
  const canvas = useRef(null);
  const positions = useRef({});

  useEffect(() => {
    if (!curriculum?.nodes?.length || !canvas.current) return;
    const W = 600, H = 280, dpr = window.devicePixelRatio || 1;
    canvas.current.width = W * dpr; canvas.current.height = H * dpr;
    canvas.current.style.width = W + 'px'; canvas.current.style.height = H + 'px';
    const ctx = canvas.current.getContext('2d');
    ctx.scale(dpr, dpr);

    const path = curriculum.learningPath || curriculum.nodes.map(n => n.id);
    const cols = Math.ceil(Math.sqrt(curriculum.nodes.length));
    curriculum.nodes.forEach((node, i) => {
      const idx = path.indexOf(node.id); const ii = idx >= 0 ? idx : i;
      const col = ii % cols, row = Math.floor(ii / cols);
      positions.current[node.id] = {
        x: 60 + col * ((W - 80) / Math.max(cols - 1, 1)),
        y: 40 + row * ((H - 60) / Math.max(Math.ceil(curriculum.nodes.length / cols) - 1, 1)),
      };
    });

    ctx.clearRect(0, 0, W, H);
    (curriculum.edges || []).forEach(({ from, to }) => {
      const pa = positions.current[from], pb = positions.current[to];
      if (!pa || !pb) return;
      const op = 0.15 + Math.min(masteryMap[from] || 0, masteryMap[to] || 0) * 0.5;
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = `rgba(124,106,247,${op})`; ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
    });

    curriculum.nodes.forEach(node => {
      const pos = positions.current[node.id]; if (!pos) return;
      const mastery = masteryMap[node.id] || 0;
      const color = getMasteryColor(mastery);
      const r = 22;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#1e2130'; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
      if (mastery > 0) {
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * mastery);
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
      }
      ctx.fillStyle = '#e8eaf0'; ctx.font = '10px system-ui';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const words = node.label.split(' ');
      if (words.length > 1 && node.label.length > 10) {
        ctx.fillText(words[0], pos.x, pos.y - 5);
        ctx.fillText(words.slice(1).join(' '), pos.x, pos.y + 6);
      } else { ctx.fillText(node.label.slice(0, 10), pos.x, pos.y); }
    });
  }, [curriculum, masteryMap]);

  const handleClick = e => {
    if (!canvas.current) return;
    const rect = canvas.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    for (const [id, pos] of Object.entries(positions.current)) {
      if (Math.hypot(mx - pos.x, my - pos.y) <= 22) {
        const node = curriculum.nodes.find(n => n.id === id);
        if (node) onSelectTopic(node); break;
      }
    }
  };

  return <canvas ref={canvas} onClick={handleClick} style={{ cursor: 'pointer', display: 'block', margin: '0 auto', borderRadius: 8, border: '1px solid var(--border)' }} />;
}

export default function Dashboard({ curriculum, masteryMap, subject, onSelectTopic }) {
  if (!curriculum) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 36, marginBottom: 12 }}>📊</div><p>Generate a curriculum first</p></div>
    </div>
  );

  const mastered = curriculum.nodes.filter(n => (masteryMap[n.id] || 0) >= 0.80).length;
  const inProgress = curriculum.nodes.filter(n => { const m = masteryMap[n.id] || 0; return m > 0 && m < 0.80; }).length;
  const total = curriculum.nodes.length;
  const overall = getCurriculumProgress(curriculum, masteryMap);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{subject}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${overall}%`, height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--green))', borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent2)', flexShrink: 0 }}>{overall}% complete</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard value={total} label="Total Topics" />
        <StatCard value={mastered} label="Mastered" color="var(--green)" />
        <StatCard value={inProgress} label="In Progress" color="var(--amber)" />
        <StatCard value={`${overall}%`} label="Progress" color="var(--accent2)" />
      </div>

      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Knowledge Graph — click to study</h3>
        <KnowledgeGraph curriculum={curriculum} masteryMap={masteryMap} onSelectTopic={onSelectTopic} />
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10 }}>
          {[['#ef4444', 'Needs Work'], ['#f59e0b', 'Developing'], ['#3b82f6', 'Proficient'], ['#22d3a0', 'Mastered']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text3)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{l}
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Topic Mastery</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
        {[...curriculum.nodes].sort((a, b) => (masteryMap[b.id] || 0) - (masteryMap[a.id] || 0)).map(node => (
          <MasteryCard key={node.id} node={node} mastery={masteryMap[node.id] || 0} onSelect={onSelectTopic} />
        ))}
      </div>
    </div>
  );
}
