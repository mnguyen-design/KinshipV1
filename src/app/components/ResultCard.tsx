import { AlertCircle, User } from 'lucide-react';
import type { TeochewTerm } from '../data/types';

interface ResultCardProps {
  term: TeochewTerm;
  personName?: string;
  relationshipLabel?: string;
  compact?: boolean;
  onConfirm?: () => void;
}

// Birth-rank sequence strip — shows sibling set in order, current highlighted
function RankStrip({ term }: { term: TeochewTerm }) {
  if (!term.rankSequence || !term.rankLabel) return null;

  const color = term.side === 'maternal' ? '#4A7B6B' : '#BF5A35';

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '11px', color: '#A89880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
        Birth rank — {term.rankLabel}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {term.rankSequence.map((step, i) => (
          <div
            key={i}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              background: step.isCurrent ? color : 'rgba(42,31,20,0.06)',
              border: step.isCurrent ? 'none' : '1px solid rgba(42,31,20,0.10)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              minWidth: '52px',
            }}
          >
            <span style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '18px',
              color: step.isCurrent ? 'white' : '#2A1F14',
              lineHeight: 1,
            }}>
              {step.characters}
            </span>
            <span style={{ fontSize: '10px', color: step.isCurrent ? 'rgba(255,255,255,0.85)' : '#8A7A68', fontFamily: "'Lora', serif", fontStyle: 'italic' }}>
              {step.romanization}
            </span>
            <span style={{ fontSize: '9px', color: step.isCurrent ? 'rgba(255,255,255,0.7)' : '#A89880', fontFamily: "'DM Sans', sans-serif" }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultCard({ term, personName, relationshipLabel, compact = false, onConfirm }: ResultCardProps) {
  const sideColor = term.side === 'paternal' ? '#BF5A35'
    : term.side === 'maternal' ? '#4A7B6B'
    : term.side === 'self'     ? '#C8A45A'
    : '#BF5A35';

  if (term.addressByName && term.characters === '—') {
    return (
      <div style={{ borderRadius: '16px', padding: '24px', background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.1)', textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(42,31,20,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <User size={24} color="#8A7A68" />
        </div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: '18px', color: '#2A1F14', fontWeight: 500, marginBottom: '8px' }}>
          {personName ? `Call them "${personName}"` : 'Addressed by first name'}
        </div>
        <p style={{ fontSize: '13px', color: '#8A7A68', lineHeight: 1.6, margin: 0 }}>
          {term.note ?? 'Junior relatives (younger in both age and generation) are addressed by first name in Teochew.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.1)' }}>
      {/* Lineage side stripe */}
      <div style={{ height: '4px', background: sideColor }} />

      <div style={{ padding: compact ? '18px' : '26px' }}>
        {/* Relationship label */}
        {relationshipLabel && (
          <p style={{ fontSize: '12px', color: '#8A7A68', marginBottom: compact ? '10px' : '14px', letterSpacing: '0.04em' }}>
            {relationshipLabel}
          </p>
        )}

        {/* Hero: Chinese character(s) */}
        <div style={{ textAlign: 'center', marginBottom: compact ? '6px' : '10px' }}>
          <div style={{
            fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif",
            fontSize: compact ? '64px' : '100px',
            lineHeight: 1,
            color: '#2A1F14',
            letterSpacing: '0.04em',
            userSelect: 'none',
          }}>
            {term.characters}
          </div>
        </div>

        {/* Romanization */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <div style={{ fontFamily: "'Lora', serif", fontSize: compact ? '20px' : '28px', fontWeight: 500, color: sideColor }}>
            {term.romanization}
          </div>
        </div>

        {/* Pronunciation */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span style={{ fontSize: '14px', color: '#8A7A68' }}>
            Say it: <em style={{ color: '#2A1F14' }}>{term.pronunciation}</em>
          </span>
        </div>

        <div style={{ height: '1px', background: 'rgba(42,31,20,0.08)', marginBottom: '14px' }} />

        {/* Breakdown */}
        {!compact && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#A89880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>Breakdown</div>
            <div style={{ fontSize: '14px', color: '#2A1F14', lineHeight: 1.6 }}>{term.breakdown}</div>
          </div>
        )}

        {/* Birth-rank sequence — the key feature for ranked terms */}
        {!compact && <RankStrip term={term} />}

        {/* Descriptive label */}
        {term.descriptiveLabel && !compact && (
          <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(42,31,20,0.05)' }}>
            <div style={{ fontSize: '11px', color: '#8A7A68', marginBottom: '4px' }}>Descriptive (not used in direct address)</div>
            <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '15px', color: '#2A1F14' }}>{term.descriptiveLabel}</div>
          </div>
        )}

        {/* Cultural note */}
        {term.note && !compact && (
          <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(42,31,20,0.04)', border: '1px solid rgba(42,31,20,0.06)' }}>
            <p style={{ fontSize: '12px', color: '#8A7A68', lineHeight: 1.6, margin: 0 }}>{term.note}</p>
          </div>
        )}

        {/* Unverified prompt */}
        {!term.guaranteed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} color="#C8A45A" />
              <span style={{ fontSize: '12px', color: '#C8A45A', fontWeight: 500 }}>Best-effort — please confirm</span>
            </div>
            {onConfirm && (
              <button onClick={onConfirm} style={{ background: 'rgba(200,164,90,0.15)', border: '1px solid rgba(200,164,90,0.4)', color: '#C8A45A', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>
                Confirm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function UnconfirmedCard({ personName, onConfirm }: { personName?: string; onConfirm?: () => void }) {
  return (
    <div style={{ borderRadius: '16px', padding: '24px', background: '#EDE4D2', border: '1.5px dashed rgba(200,164,90,0.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <AlertCircle size={16} color="#C8A45A" />
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#2A1F14' }}>Outside verified boundary</span>
      </div>
      <p style={{ fontSize: '13px', color: '#8A7A68', lineHeight: 1.6, marginBottom: '16px' }}>
        This relationship is beyond the verified Teochew term set for v1. Ask a family elder to confirm the correct term.
      </p>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '80px', color: '#C8A45A', opacity: 0.45, lineHeight: 1 }}>?</div>
      </div>
      {onConfirm && (
        <button onClick={onConfirm} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(200,164,90,0.15)', border: '1px solid rgba(200,164,90,0.4)', color: '#C8A45A', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
          Enter the correct term
        </button>
      )}
    </div>
  );
}
