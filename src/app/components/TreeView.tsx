import { useState, useRef } from 'react';
import { Info, Camera } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';
import { ResultCard, UnconfirmedCard } from './ResultCard';
import { ConfirmFlow } from './ConfirmFlow';
import { resolveTerm, describeRelationship, lineageColor, PERSON_ROLES } from '../data/teochewTerms';
import type { Person } from '../data/types';

// ─── Types ────────────────────────────────────────────────────────────────────
type Side = 'paternal' | 'maternal' | 'self' | 'marriage';
type SideFilter = 'all' | 'paternal' | 'maternal';

interface SvgLine {
  x1: number; y1: number; x2: number; y2: number;
  color: string; dashed?: boolean; w: number; op: number; side: Side;
}
interface SvgPath {
  d: string; color: string; dashed?: boolean; w: number; op: number; side: Side;
}

// ─── Swimlanes ────────────────────────────────────────────────────────────────
const SWIMLANES = [
  { label: 'Grandparents',        yTop: -150, yBottom:  -57, color: 'rgba(191,90,53,0.05)'  },
  { label: "Parents' generation", yTop:  -57, yBottom:   -8, color: 'rgba(74,123,107,0.05)' },
  { label: 'Your generation',     yTop:   -8, yBottom:   72, color: 'rgba(200,164,90,0.06)' },
  { label: 'Next generation',     yTop:   72, yBottom:  200, color: 'rgba(42,31,20,0.025)'  },
];

// ─── Node positions ───────────────────────────────────────────────────────────
// ViewBox: "-420 -185 1260 380"
// Maternal side extended: 4 uncles + older sister to the right of Ma.
const GEN_BAR_Y = -68;   // sibling bar y
const EGO_BAR_Y =  -8;   // ego generation bar y

const NODE_POSITIONS: Record<string, { x: number; y: number; r: number }> = {
  // ── Gen +2: Grandparents (y = -100) ────────────────────────────────────
  'pa-gong':         { x: -168, y: -100, r: 19 },
  'pa-ma':           { x: -118, y: -100, r: 19 },
  'ma-gong':         { x:   78, y: -100, r: 19 },
  'ma-ma':           { x:  128, y: -100, r: 19 },
  'gm-sis':          { x:  440, y: -100, r: 19 },
  'gm-sis-h':        { x:  480, y: -100, r: 15 },

  // ── Gen +1: Parents' generation (y = -30) ──────────────────────────────
  // Paternal side
  'aunt-m':          { x: -316, y:  -30, r: 15 },  // wife of uncle-be (inline)
  'uncle-be':        { x: -272, y:  -30, r: 21 },
  'uncle-zeg':       { x: -216, y:  -30, r: 21 },
  'aunt-sim':        { x: -174, y:  -30, r: 15 },  // wife of uncle-zeg (inline)
  'ba':              { x: -108, y:  -30, r: 25 },
  'aunt-gou':        { x:  -50, y:  -30, r: 21 },
  // Maternal side — birth order: aunt-yi-older, uncle-gu-older, Ma, uncle-gu, gu-2, gu-3, aunt-yi
  'ma':              { x:   52, y:  -30, r: 25 },
  'aunt-yi-older':   { x:  108, y:  -30, r: 17 },  // older sister
  'uncle-gu-older':  { x:  148, y:  -30, r: 17 },  // older brother
  'uncle-gu':        { x:  190, y:  -30, r: 17 },  // 1st younger
  'uncle-gu-2':      { x:  230, y:  -30, r: 17 },  // 2nd younger
  'uncle-gu-3':      { x:  270, y:  -30, r: 17 },  // 3rd younger
  'aunt-yi':         { x:  310, y:  -30, r: 17 },  // younger sister
  // Great-aunt's children
  'gm-child1':       { x:  408, y:  -30, r: 21 },
  'gm-child2':       { x:  465, y:  -30, r: 21 },

  // ── Gen 0: Your generation (y = 33) ────────────────────────────────────
  'bro-older':       { x:  -95, y:   33, r: 22 },
  'mei':             { x:    0, y:   33, r: 33 },
  'sis-younger':     { x:   95, y:   33, r: 22 },
  'cousin-alvin':    { x:  168, y:   33, r: 17 },  // uncle-gu's son
  'gm-gc1':          { x:  395, y:   33, r: 17 },  // Betty's daughter
  'gm-gc2':          { x:  435, y:   33, r: 17 },  // Betty's son
};

// Paternal sibling bar spans blood children of pa-gong/pa-ma: uncle-be(-272) → aunt-gou(-50)
// Maternal sibling bar spans blood children of ma-gong/ma-ma: ma(52) → aunt-yi(310)
// gm-sis branch bar: gm-child1(408) → gm-child2(465) (midpoint 436)

// ─── Generation drops (THICK — visually distinguished from sibling bars) ──────
const GENERATION_DROPS: SvgLine[] = [
  // Midpoint pa-gong(-168)/pa-ma(-118) = -143
  { x1: -143, y1: -100, x2: -143, y2: GEN_BAR_Y, color: '#BF5A35', w: 4,   op: 0.55, side: 'paternal' },
  // Midpoint ma-gong(78)/ma-ma(128) = 103
  { x1:  103, y1: -100, x2:  103, y2: GEN_BAR_Y, color: '#4A7B6B', w: 4,   op: 0.55, side: 'maternal' },
  // Midpoint gm-sis(440)/gm-sis-h(480) = 460
  { x1:  460, y1: -100, x2:  460, y2: GEN_BAR_Y, color: '#4A7B6B', w: 2.5, op: 0.45, side: 'maternal' },
];

// ─── Sibling bars (thin horizontal) ──────────────────────────────────────────
const SIBLING_BARS: SvgLine[] = [
  // Paternal blood siblings
  { x1: -272, y1: GEN_BAR_Y, x2: -50, y2: GEN_BAR_Y, color: '#BF5A35', w: 1.8, op: 0.28, side: 'paternal' },
  // Maternal blood siblings (all children of ma-gong/ma-ma)
  { x1:   52, y1: GEN_BAR_Y, x2: 310, y2: GEN_BAR_Y, color: '#4A7B6B', w: 1.8, op: 0.28, side: 'maternal' },
  // gm-sis children
  { x1:  408, y1: GEN_BAR_Y, x2: 465, y2: GEN_BAR_Y, color: '#4A7B6B', w: 1.8, op: 0.28, side: 'maternal' },
  // Betty's children (ego generation)
  { x1:  395, y1: EGO_BAR_Y, x2: 435, y2: EGO_BAR_Y, color: '#4A7B6B', w: 1.5, op: 0.26, side: 'maternal' },
  // Ego siblings
  { x1:  -95, y1: EGO_BAR_Y, x2:  95, y2: EGO_BAR_Y, color: '#C8A45A', w: 2.0, op: 0.40, side: 'self'     },
];

// ─── Stubs (bar → node, thin vertical) ───────────────────────────────────────
const STUBS: SvgLine[] = [
  // Paternal stubs
  { x1: -272, y1: GEN_BAR_Y, x2: -272, y2: -30, color: '#BF5A35', w: 1.5, op: 0.34, side: 'paternal' },
  { x1: -216, y1: GEN_BAR_Y, x2: -216, y2: -30, color: '#BF5A35', w: 1.5, op: 0.34, side: 'paternal' },
  { x1: -108, y1: GEN_BAR_Y, x2: -108, y2: -30, color: '#BF5A35', w: 2.2, op: 0.50, side: 'paternal' }, // ba
  { x1:  -50, y1: GEN_BAR_Y, x2:  -50, y2: -30, color: '#BF5A35', w: 1.5, op: 0.34, side: 'paternal' },
  // Maternal stubs — all 6 siblings + Ma
  { x1:   52, y1: GEN_BAR_Y, x2:   52, y2: -30, color: '#4A7B6B', w: 2.2, op: 0.50, side: 'maternal' }, // Ma
  { x1:  108, y1: GEN_BAR_Y, x2:  108, y2: -30, color: '#4A7B6B', w: 1.5, op: 0.34, side: 'maternal' }, // aunt-yi-older
  { x1:  148, y1: GEN_BAR_Y, x2:  148, y2: -30, color: '#4A7B6B', w: 1.5, op: 0.34, side: 'maternal' }, // uncle-gu-older
  { x1:  190, y1: GEN_BAR_Y, x2:  190, y2: -30, color: '#4A7B6B', w: 1.5, op: 0.34, side: 'maternal' }, // uncle-gu
  { x1:  230, y1: GEN_BAR_Y, x2:  230, y2: -30, color: '#4A7B6B', w: 1.5, op: 0.34, side: 'maternal' }, // uncle-gu-2
  { x1:  270, y1: GEN_BAR_Y, x2:  270, y2: -30, color: '#4A7B6B', w: 1.5, op: 0.34, side: 'maternal' }, // uncle-gu-3
  { x1:  310, y1: GEN_BAR_Y, x2:  310, y2: -30, color: '#4A7B6B', w: 1.5, op: 0.34, side: 'maternal' }, // aunt-yi
  // gm-sis children stubs
  { x1:  408, y1: GEN_BAR_Y, x2:  408, y2: -30, color: '#4A7B6B', w: 1.5, op: 0.34, side: 'maternal' },
  { x1:  465, y1: GEN_BAR_Y, x2:  465, y2: -30, color: '#4A7B6B', w: 1.5, op: 0.34, side: 'maternal' },
  // Ego stubs
  { x1:  -95, y1: EGO_BAR_Y, x2:  -95, y2:  33, color: '#C8A45A', w: 1.5, op: 0.45, side: 'self'     }, // bro-older
  { x1:    0, y1: EGO_BAR_Y, x2:    0, y2:  33, color: '#BF5A35', w: 2.5, op: 0.58, side: 'self'     }, // Mei
  { x1:   95, y1: EGO_BAR_Y, x2:   95, y2:  33, color: '#C8A45A', w: 1.5, op: 0.45, side: 'self'     }, // sis-younger
  // Betty's children stubs
  { x1:  395, y1: EGO_BAR_Y, x2:  395, y2:  33, color: '#4A7B6B', w: 1.5, op: 0.34, side: 'maternal' },
  { x1:  435, y1: EGO_BAR_Y, x2:  435, y2:  33, color: '#4A7B6B', w: 1.5, op: 0.34, side: 'maternal' },
];

// ─── Marriage connectors (short dashed) ──────────────────────────────────────
const MARRIAGE_LINES: SvgLine[] = [
  // Grandparent couple brackets
  { x1: -168, y1: -100, x2: -118, y2: -100, color: '#A89880', dashed: true, w: 1.5, op: 0.60, side: 'marriage' },
  { x1:   78, y1: -100, x2:  128, y2: -100, color: '#A89880', dashed: true, w: 1.5, op: 0.60, side: 'marriage' },
  { x1:  440, y1: -100, x2:  480, y2: -100, color: '#A89880', dashed: true, w: 1.5, op: 0.60, side: 'marriage' },
  // ma-ma ↔ gm-sis sibling line (they share parents; thin solid)
  { x1:  128, y1: -100, x2:  440, y2: -100, color: '#4A7B6B', w: 1.0, op: 0.18, side: 'maternal' },
  // Parent-level marriages (inline)
  { x1: -316, y1:  -30, x2: -272, y2:  -30, color: '#A89880', dashed: true, w: 1.8, op: 0.65, side: 'marriage' }, // aunt-m ─ uncle-be
  { x1: -216, y1:  -30, x2: -174, y2:  -30, color: '#A89880', dashed: true, w: 1.8, op: 0.65, side: 'marriage' }, // uncle-zeg ─ aunt-sim
  { x1: -108, y1:  -30, x2:   52, y2:  -30, color: '#A89880', dashed: true, w: 2.0, op: 0.55, side: 'marriage' }, // Ba ─── Ma
];

// ─── Smooth cross-band paths ──────────────────────────────────────────────────
const CURVE_PATHS: SvgPath[] = [
  // Ba/Ma couple midpoint → ego bar   (midpoint of -108 and 52 = -28)
  { d: 'M -28,-30 L -28,-8',                           color: '#C8A45A', w: 2.0, op: 0.50, side: 'self'     },
  // uncle-gu (190,-30) → Alvin (168,33): orthogonal routing
  { d: 'M 190,-30 L 190,-8 L 168,-8 L 168,33',         color: '#4A7B6B', w: 1.5, op: 0.38, side: 'maternal' },
  // Betty (408,-30) → her children bar midpoint (415,-8)
  { d: 'M 408,-30 L 415,-8',                           color: '#4A7B6B', w: 1.5, op: 0.38, side: 'maternal' },
];

// ─── Legend items ─────────────────────────────────────────────────────────────
const LEGEND = [
  { color: '#BF5A35', label: 'Paternal',       dashed: false, thick: false },
  { color: '#4A7B6B', label: 'Maternal',        dashed: false, thick: false },
  { color: '#C8A45A', label: 'Your generation', dashed: false, thick: false },
  { color: '#A89880', label: 'Marriage',         dashed: true,  thick: false },
  { color: '#BF5A35', label: 'Gen. drop',        dashed: false, thick: true  },
];

// ─── Photo-aware avatar ───────────────────────────────────────────────────────
function PhotoAvatar({ person, size, onUpload }: { person: Person; size: number; onUpload?: (base64: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const color = lineageColor(person.id);
  return (
    <div
      onClick={() => onUpload && inputRef.current?.click()}
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: person.photo ? 'transparent' : color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onUpload ? 'pointer' : 'default', position: 'relative', overflow: 'hidden', border: `2px solid ${color}` }}
    >
      {person.photo
        ? <img src={person.photo} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: 'white', fontSize: size * 0.38, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{(person.nickname ?? person.name).charAt(0)}</span>}
      {onUpload && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
          <Camera size={size * 0.3} color="white" />
        </div>
      )}
      {onUpload && <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
        const file = e.target.files?.[0]; if (!file || !onUpload) return;
        const r = new FileReader(); r.onload = ev => onUpload(ev.target?.result as string); r.readAsDataURL(file);
      }} />}
    </div>
  );
}

// ─── Person detail panel ──────────────────────────────────────────────────────
function PersonPanel({ person, onClose }: { person: Person; onClose: () => void }) {
  const { state, dispatch } = useFamilyStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const term = resolveTerm(person.id, state.termOverrides);
  const relationship = describeRelationship(person.id);
  const color = lineageColor(person.id);

  if (showConfirm) return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      <ConfirmFlow person={person} onClose={() => setShowConfirm(false)} onSaved={() => setShowConfirm(false)} />
    </div>
  );

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
        <PhotoAvatar person={person} size={52} onUpload={b64 => dispatch({ type: 'UPDATE_PERSON', payload: { ...person, photo: b64 } })} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Lora', serif", fontSize: '18px', color: '#2A1F14', fontWeight: 600, lineHeight: 1.2 }}>
            {person.nickname ?? person.name}
          </div>
          <div style={{ fontSize: '12px', color: '#8A7A68', marginTop: '3px' }}>
            {person.isEgo ? 'You — the centre of the tree' : relationship}
          </div>
          <div style={{ display: 'inline-block', marginTop: '5px', fontSize: '10px', color, background: `${color}18`, padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
            {color === '#BF5A35' ? 'Paternal' : color === '#4A7B6B' ? 'Maternal' : 'Your side'}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7A68', fontSize: '18px', lineHeight: 1, padding: '2px' }}>✕</button>
      </div>

      <button
        style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px dashed rgba(42,31,20,0.2)', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#8A7A68', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        onClick={() => {
          const el = document.createElement('input'); el.type = 'file'; el.accept = 'image/*';
          el.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => dispatch({ type: 'UPDATE_PERSON', payload: { ...person, photo: ev.target?.result as string } }); r.readAsDataURL(f); };
          el.click();
        }}
      >
        <Camera size={13} /> {person.photo ? 'Change photo' : 'Add photo'}
      </button>

      {person.isEgo ? (
        <div style={{ borderRadius: '14px', padding: '24px', background: '#EDE4D2', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '80px', color: '#BF5A35', lineHeight: 1, marginBottom: '12px' }}>我</div>
          <p style={{ fontSize: '13px', color: '#8A7A68', lineHeight: 1.6, margin: 0 }}>Everyone else's terms are calculated from your position.</p>
        </div>
      ) : term ? (
        <ResultCard term={term} personName={person.nickname ?? person.name} relationshipLabel={relationship} onConfirm={() => setShowConfirm(true)} />
      ) : (
        <UnconfirmedCard personName={person.nickname ?? person.name} onConfirm={() => setShowConfirm(true)} />
      )}
    </div>
  );
}

// ─── Tree View ────────────────────────────────────────────────────────────────
export function TreeView() {
  const { state, getPerson } = useFamilyStore();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [sideFilter, setSideFilter] = useState<SideFilter>('all');
  const [showMarriages, setShowMarriages] = useState(true);

  const ego = state.people.find(p => p.isEgo || p.id === state.egoId);
  const isDemoFamily = state.people.some(p => p.id === 'mei' || p.id === 'ba');
  const VB = { x: -420, w: 1260 };

  // ── Filter helpers ──────────────────────────────────────────────────────
  function lineVisible(side: Side): boolean {
    if (side === 'marriage') return showMarriages;
    if (sideFilter === 'all') return true;
    if (side === 'self') return true;
    return side === sideFilter;
  }

  function nodeOpacity(personId: string): number {
    if (sideFilter === 'all') return 1;
    const color = lineageColor(personId);
    const isEgo = personId === state.egoId || getPerson(personId)?.isEgo;
    if (isEgo) return 1;
    if (personId === 'bro-older' || personId === 'sis-younger') return 1; // ego's siblings always
    if (sideFilter === 'paternal' && color === '#BF5A35') return 1;
    if (sideFilter === 'maternal' && color === '#4A7B6B') return 1;
    return 0.10;
  }

  function handleNodeClick(personId: string) {
    const person = getPerson(personId);
    if (person) setSelectedPerson(prev => prev?.id === personId ? null : person);
  }

  // ── Filter pill button ──────────────────────────────────────────────────
  const PillBtn = ({ value, label, active, onClick }: { value: string; label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        padding: '5px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
        background: active ? (value === 'paternal' ? '#BF5A35' : value === 'maternal' ? '#4A7B6B' : '#2A1F14') : 'transparent',
        color: active ? '#FDF8F0' : '#8A7A68',
        fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: active ? 500 : 400,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Main SVG area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 20px 10px', overflow: 'hidden' }}>

        {/* ── Header row ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexShrink: 0, gap: '12px' }}>
          <div style={{ flexShrink: 0 }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '19px', color: '#2A1F14', fontWeight: 600, margin: 0 }}>
              {ego ? `${ego.nickname ?? ego.name}'s Family` : 'My Family'}
            </h2>
            <p style={{ fontSize: '11px', color: '#8A7A68', margin: '2px 0 0' }}>
              {state.people.length} people · tap any node
            </p>
          </div>

          {/* ── Filter controls ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
            {/* Side filter pill group */}
            <div style={{ display: 'flex', padding: '3px', background: '#EDE4D2', borderRadius: '24px', gap: '2px' }}>
              <PillBtn value="all"      label="All lines"  active={sideFilter === 'all'}      onClick={() => setSideFilter('all')} />
              <PillBtn value="paternal" label="父 Paternal" active={sideFilter === 'paternal'} onClick={() => setSideFilter('paternal')} />
              <PillBtn value="maternal" label="母 Maternal" active={sideFilter === 'maternal'} onClick={() => setSideFilter('maternal')} />
            </div>

            {/* Marriage toggle */}
            <button
              onClick={() => setShowMarriages(v => !v)}
              style={{
                padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(42,31,20,0.18)',
                background: showMarriages ? 'transparent' : 'rgba(42,31,20,0.07)',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
                color: showMarriages ? '#8A7A68' : '#2A1F14',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke="#A89880" strokeWidth="1.5" strokeDasharray="4 2" strokeLinecap="round" /></svg>
              {showMarriages ? 'Marriages' : 'Marriages hidden'}
            </button>
          </div>

          <button onClick={() => setShowLegend(v => !v)} style={{ padding: '5px 11px', borderRadius: '8px', border: '1px solid rgba(42,31,20,0.15)', background: showLegend ? '#EDE4D2' : 'transparent', cursor: 'pointer', fontSize: '11px', color: '#8A7A68', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Info size={11} /> Legend
          </button>
        </div>

        {/* Legend */}
        {showLegend && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', padding: '7px 12px', borderRadius: '8px', background: '#EDE4D2', width: 'fit-content', flexShrink: 0, flexWrap: 'wrap' }}>
            {LEGEND.map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="24" height="10">
                  <line x1="0" y1="5" x2="24" y2="5" stroke={l.color} strokeWidth={l.thick ? 4 : 2}
                    strokeDasharray={l.dashed ? '4 3' : undefined} strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: '11px', color: '#8A7A68' }}>{l.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── SVG Tree ── */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <svg viewBox="-420 -185 1260 390" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">

            {/* Swimlane bands */}
            {SWIMLANES.map(lane => (
              <g key={lane.label}>
                <rect x={VB.x} y={lane.yTop} width={VB.w} height={lane.yBottom - lane.yTop} fill={lane.color} />
                <text x={VB.x + 10} y={lane.yTop + 14} fill="rgba(42,31,20,0.20)" fontSize="9" fontFamily="'DM Sans', sans-serif" letterSpacing="0.10em">
                  {lane.label.toUpperCase()}
                </text>
                <line x1={VB.x} y1={lane.yBottom} x2={VB.x + VB.w} y2={lane.yBottom} stroke="rgba(42,31,20,0.06)" strokeWidth="1" />
              </g>
            ))}

            {/* 1. Generation drops (THICK) */}
            {GENERATION_DROPS.filter(l => lineVisible(l.side)).map((ln, i) => (
              <line key={`gd-${i}`} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                stroke={ln.color} strokeWidth={ln.w} strokeLinecap="round" opacity={ln.op} />
            ))}

            {/* 2. Sibling bars */}
            {SIBLING_BARS.filter(l => lineVisible(l.side)).map((ln, i) => (
              <line key={`sb-${i}`} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                stroke={ln.color} strokeWidth={ln.w} strokeLinecap="round" opacity={ln.op} />
            ))}

            {/* 3. Stubs */}
            {STUBS.filter(l => lineVisible(l.side)).map((ln, i) => (
              <line key={`st-${i}`} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                stroke={ln.color} strokeWidth={ln.w} strokeLinecap="round" opacity={ln.op} />
            ))}

            {/* 4. Marriage connectors */}
            {MARRIAGE_LINES.filter(l => lineVisible(l.side)).map((ln, i) => (
              <line key={`ml-${i}`} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                stroke={ln.color} strokeWidth={ln.w} strokeLinecap="round"
                strokeDasharray={ln.dashed ? '5 4' : undefined} opacity={ln.op} />
            ))}

            {/* 5. Smooth routing paths */}
            {CURVE_PATHS.filter(p => lineVisible(p.side)).map((p, i) => (
              <path key={`cp-${i}`} d={p.d} stroke={p.color} strokeWidth={p.w} fill="none"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={p.dashed ? '5 4' : undefined} opacity={p.op} />
            ))}

            {/* Clip defs for photos */}
            <defs>
              {isDemoFamily && Object.entries(NODE_POSITIONS).map(([id, pos]) => {
                const person = getPerson(id);
                if (!person?.photo) return null;
                return <clipPath key={`clip-${id}`} id={`clip-${id}`}><circle cx={pos.x} cy={pos.y} r={pos.r} /></clipPath>;
              })}
            </defs>

            {/* Nodes */}
            {isDemoFamily && Object.entries(NODE_POSITIONS).map(([id, pos]) => {
              const person = getPerson(id);
              if (!person) return null;
              const color    = lineageColor(id);
              const isEgo    = person.isEgo || id === state.egoId;
              const selected = selectedPerson?.id === id;
              const term     = resolveTerm(id, state.termOverrides);
              const char     = isEgo ? '我' : (term?.characters ?? person.name.charAt(0));
              const hasPhoto = !!person.photo;
              const hasTerm  = !!PERSON_ROLES[id];
              const opacity  = nodeOpacity(id);

              return (
                <g key={id} onClick={() => handleNodeClick(id)} style={{ cursor: 'pointer' }} opacity={opacity}>
                  {/* Generous click target — extra large for small nodes */}
                  <circle cx={pos.x} cy={pos.y} r={pos.r < 20 ? pos.r + 14 : pos.r + 10} fill="transparent" />
                  {selected && <circle cx={pos.x} cy={pos.y} r={pos.r + 5} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />}
                  <circle cx={pos.x} cy={pos.y} r={pos.r}
                    fill={hasPhoto ? 'transparent' : isEgo ? color : selected ? color : '#EDE4D2'}
                    stroke={color} strokeWidth={isEgo ? 0 : 2} />
                  {hasPhoto && (
                    <image href={person.photo} x={pos.x - pos.r} y={pos.y - pos.r}
                      width={pos.r * 2} height={pos.r * 2}
                      clipPath={`url(#clip-${id})`} preserveAspectRatio="xMidYMid slice" />
                  )}
                  {!hasPhoto && (
                    <text x={pos.x} y={pos.y + (pos.r > 26 ? 8 : pos.r > 15 ? 6 : 4)}
                      textAnchor="middle" fill={isEgo || selected ? 'white' : color}
                      fontSize={pos.r > 26 ? 20 : pos.r > 18 ? 14 : pos.r > 14 ? 11 : 9}
                      fontFamily="'Noto Serif SC','Songti SC',serif" fontWeight={isEgo ? '500' : '400'}>
                      {char}
                    </text>
                  )}
                  <text x={pos.x} y={pos.y + pos.r + 14} textAnchor="middle"
                    fill="#2A1F14" fontSize={pos.r > 20 ? 10 : 8}
                    fontFamily="'DM Sans',sans-serif" fontWeight="500">
                    {(person.nickname ?? person.name).split(' ')[0]}
                  </text>
                  {term && pos.r >= 17 && (
                    <text x={pos.x} y={pos.y + pos.r + 24} textAnchor="middle"
                      fill="#A89880" fontSize={7} fontFamily="'Lora',serif" fontStyle="italic">
                      {term.romanization}
                    </text>
                  )}
                  {!hasTerm && !isEgo && (
                    <circle cx={pos.x + pos.r - 3} cy={pos.y - pos.r + 3} r={4} fill="#C8A45A" />
                  )}
                </g>
              );
            })}

            {/* Generic non-demo layout */}
            {!isDemoFamily && state.people.map((person, i) => {
              const angle = (i / state.people.length) * Math.PI * 2 - Math.PI / 2;
              const r = person.isEgo ? 0 : 120;
              const x = Math.cos(angle) * r, y = Math.sin(angle) * r;
              const term = resolveTerm(person.id, state.termOverrides);
              return (
                <g key={person.id} onClick={() => handleNodeClick(person.id)} style={{ cursor: 'pointer' }}>
                  <circle cx={x} cy={y} r={person.isEgo ? 32 : 20} fill={person.isEgo ? '#BF5A35' : '#EDE4D2'} stroke="#BF5A35" strokeWidth={2} />
                  <text x={x} y={y + 6} textAnchor="middle" fill={person.isEgo ? 'white' : '#BF5A35'} fontSize={person.isEgo ? 18 : 13} fontFamily="'Noto Serif SC',serif">
                    {person.isEgo ? '我' : (term?.characters ?? person.name.charAt(0))}
                  </text>
                  <text x={x} y={y + (person.isEgo ? 48 : 34)} textAnchor="middle" fill="#8A7A68" fontSize={10} fontFamily="'DM Sans',sans-serif">{person.name}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ flexShrink: 0, paddingTop: '5px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#C8A45A' }} />
          <span style={{ fontSize: '10px', color: '#8A7A68' }}>Amber dot = term outside verified boundary</span>
        </div>
      </div>

      {/* ── Right detail panel ── */}
      <div style={{ width: selectedPerson ? '340px' : 0, flexShrink: 0, overflow: 'hidden', transition: 'width 0.22s ease', borderLeft: selectedPerson ? '1px solid rgba(42,31,20,0.10)' : 'none', background: '#F4EDE0' }}>
        {selectedPerson && <PersonPanel person={selectedPerson} onClose={() => setSelectedPerson(null)} />}
      </div>
    </div>
  );
}
