import { getMasteryColor, recommendNextTopic } from '../utils/adaptiveEngine';

export default function CurriculumPanel({ curriculum, masteryMap, activeTopic, onSelectTopic }) {
  if (!curriculum) return null;
  const next = recommendNextTopic(curriculum, masteryMap);
  const groups = {};
  (curriculum.nodes || []).forEach(node => {
    const g = node.group || 'General';
    if (!groups[g]) groups[g] = [];
    groups[g].push(node);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontWeight: 600 }}>CURRICULUM</div>
        <div style={{ fontSize: 18, fontFamily: 'Outfit', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{curriculum.subject}</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>{curriculum.summary}</div>
      </div>

      {next && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(59,130,246,0.04)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>✨ Recommended next</div>
          <button onClick={() => onSelectTopic(next)}
            style={{ width: '100%', padding: '12px 16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 10px rgba(59, 130, 246, 0.1)' }}>
            <span>→</span><span>{next.label}</span>
          </button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {Object.entries(groups).map(([groupName, nodes]) => (
          <div key={groupName} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, paddingLeft: 4, fontWeight: 600 }}>{groupName}</div>
            {nodes.map(node => {
              const mastery = masteryMap[node.id] || 0;
              const isActive = activeTopic?.id === node.id;
              const color = getMasteryColor(mastery);
              return (
                <button key={node.id} onClick={() => onSelectTopic(node)}
                  style={{ width: '100%', padding: '14px 16px', marginBottom: 6, background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent', border: `1px solid ${isActive ? 'rgba(59,130,246,0.3)' : 'transparent'}`, borderRadius: '12px', color: isActive ? 'var(--text)' : 'var(--text2)', fontSize: 13, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border)'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'transparent'; } }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}66` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>{node.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${mastery * 100}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0, fontWeight: 600 }}>{Math.round(mastery * 100)}%</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{node.estimatedMinutes}m</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
