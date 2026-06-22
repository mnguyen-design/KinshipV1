import { useState } from 'react';
import { Search, Sparkles, ChevronRight, ArrowLeftRight, Users } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';
import { resolveTerm, TERM_TABLE, describeRelationship, lineageColor } from '../data/teochewTerms';
import { ResultCard, UnconfirmedCard } from './ResultCard';
import type { TeochewTerm, Person } from '../data/types';

// ── NL pattern matcher ─────────────────────────────────────────
function matchQuery(query: string): string | null {
  const q = query.toLowerCase();
  if (q.match(/dad.*old.*bro|father.*old.*bro|ba.*be|uncle.*be/)) return 'paternal-uncle-older';
  if (q.match(/dad.*young.*bro|father.*young.*bro|ba.*zeg|uncle.*zeg|叔/)) return 'paternal-uncle-younger';
  if (q.match(/dad.*sis|father.*sis|ba.*gou|aunt.*gou|姑/)) return 'paternal-aunt';
  if (q.match(/mum.*bro|mother.*bro|ma.*gu|uncle.*gu|舅/)) return 'maternal-uncle';
  if (q.match(/mum.*sis|mother.*sis|ma.*yi|aunt.*yi|姨/)) return 'maternal-aunt';
  if (q.match(/old.*bro|兄/)) return 'older-brother';
  if (q.match(/young.*bro|弟/)) return 'younger-brother';
  if (q.match(/old.*sis|姊/)) return 'older-sister';
  if (q.match(/young.*sis|妹/)) return 'younger-sister';
  if (q.match(/dad.*dad|grandad.*pat|a-gong.*pat|公/)) return 'paternal-grandfather';
  if (q.match(/dad.*mum|a-ma.*pat|嫲/)) return 'paternal-grandmother';
  if (q.match(/mum.*dad|mat.*grandad/)) return 'maternal-grandfather';
  if (q.match(/mum.*mum|mat.*gran/)) return 'maternal-grandmother';
  if (q.match(/dad|father|爸/)) return 'father';
  if (q.match(/mum|mother|媽/)) return 'mother';
  if (q.match(/wife.*older.*uncle|older.*uncle.*wife|姆/)) return 'paternal-uncle-older-wife';
  if (q.match(/wife.*younger.*uncle|younger.*uncle.*wife|嬸/)) return 'paternal-uncle-younger-wife';
  if (q.match(/wife.*mum.*bro|gim|妗/)) return 'maternal-uncle-wife';
  return null;
}

const QUICK_EXAMPLES = [
  { label: "Dad's older brother", roleKey: 'paternal-uncle-older' },
  { label: "Dad's younger brother", roleKey: 'paternal-uncle-younger' },
  { label: "Mum's brother", roleKey: 'maternal-uncle' },
  { label: "Mum's sister", roleKey: 'maternal-aunt' },
  { label: "Dad's sister", roleKey: 'paternal-aunt' },
  { label: 'Older sister', roleKey: 'older-sister' },
  { label: 'Older brother', roleKey: 'older-brother' },
  { label: 'Paternal grandmother', roleKey: 'paternal-grandmother' },
];

// ── Guided tap-to-build flow ───────────────────────────────────
type GuideStep = 'root' | 'paternal-rel' | 'maternal-rel' | 'sibling-type';

function GuidedFlow({ onResult }: { onResult: (term: TeochewTerm, label: string) => void }) {
  const [path, setPath] = useState<string[]>([]);
  const [step, setStep] = useState<GuideStep>('root');

  function pick(label: string, nextStep: GuideStep | null, roleKey?: string) {
    const newPath = [...path, label];
    if (roleKey) {
      const term = TERM_TABLE[roleKey];
      if (term) { onResult(term, newPath.join(' → ')); }
      return;
    }
    if (nextStep) { setPath(newPath); setStep(nextStep); }
  }

  function reset() { setPath([]); setStep('root'); }

  const Btn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '10px 14px', borderRadius: '10px', textAlign: 'left',
        background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.10)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '13px', color: '#2A1F14', fontFamily: "'DM Sans', sans-serif",
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#E6DDD0')}
      onMouseLeave={e => (e.currentTarget.style.background = '#EDE4D2')}
    >
      {label} <ChevronRight size={13} color="#A89880" />
    </button>
  );

  return (
    <div>
      {path.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
          {path.map((c, i) => (
            <span key={i} style={{ fontSize: '12px', color: '#BF5A35', background: 'rgba(191,90,53,0.10)', padding: '2px 8px', borderRadius: '20px' }}>{c}</span>
          ))}
          <button onClick={reset} style={{ fontSize: '12px', color: '#8A7A68', background: 'none', border: 'none', cursor: 'pointer' }}>Start over</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {step === 'root' && (
          <>
            <Btn label="On your father's side" onClick={() => pick("Father's side", 'paternal-rel')} />
            <Btn label="On your mother's side" onClick={() => pick("Mother's side", 'maternal-rel')} />
            <Btn label="Your own sibling" onClick={() => pick('Sibling', 'sibling-type')} />
            <Btn label="Your father" onClick={() => pick('Father', null, 'father')} />
            <Btn label="Your mother" onClick={() => pick('Mother', null, 'mother')} />
          </>
        )}
        {step === 'paternal-rel' && (
          <>
            <Btn label="Father's older brother — 伯 Be" onClick={() => pick("Older brother", null, 'paternal-uncle-older')} />
            <Btn label="Father's younger brother — 叔 Zeg" onClick={() => pick("Younger brother", null, 'paternal-uncle-younger')} />
            <Btn label="Father's sister — 姑 Gou" onClick={() => pick("Sister", null, 'paternal-aunt')} />
            <Btn label="Father's father — 亞公 A-gong" onClick={() => pick("Father's father", null, 'paternal-grandfather')} />
            <Btn label="Father's mother — 亞嫲 A-ma" onClick={() => pick("Father's mother", null, 'paternal-grandmother')} />
            <Btn label="Wife of father's older brother — 姆 M" onClick={() => pick("Older uncle's wife", null, 'paternal-uncle-older-wife')} />
            <Btn label="Wife of father's younger brother — 嬸 Sim" onClick={() => pick("Younger uncle's wife", null, 'paternal-uncle-younger-wife')} />
          </>
        )}
        {step === 'maternal-rel' && (
          <>
            <Btn label="Mother's brother — 舅 Gu" onClick={() => pick("Brother", null, 'maternal-uncle')} />
            <Btn label="Mother's sister — 姨 Yi" onClick={() => pick("Sister", null, 'maternal-aunt')} />
            <Btn label="Mother's father — 亞公 A-gong" onClick={() => pick("Mother's father", null, 'maternal-grandfather')} />
            <Btn label="Mother's mother — 亞嫲 A-ma" onClick={() => pick("Mother's mother", null, 'maternal-grandmother')} />
            <Btn label="Wife of mother's brother — 妗 Gim" onClick={() => pick("Uncle's wife", null, 'maternal-uncle-wife')} />
          </>
        )}
        {step === 'sibling-type' && (
          <>
            <Btn label="Older brother — 兄 Hia[n]" onClick={() => pick("Older brother", null, 'older-brother')} />
            <Btn label="Younger brother — 弟 Di" onClick={() => pick("Younger brother", null, 'younger-brother')} />
            <Btn label="Older sister — 姊 Ze" onClick={() => pick("Older sister", null, 'older-sister')} />
            <Btn label="Younger sister — 妹 Mue" onClick={() => pick("Younger sister", null, 'younger-sister')} />
          </>
        )}
      </div>
    </div>
  );
}

// ── Connect Two ────────────────────────────────────────────────
const CONNECT_PAIRS: Record<string, { chainText: string; aToBRole?: string; bToARole?: string }> = {
  'bro-older|uncle-gu': { chainText: "Ah-Kuan is Ming's maternal uncle, and Ming is his nephew.", aToBRole: 'maternal-uncle', bToARole: 'grandchild' },
  'uncle-gu|bro-older': { chainText: "Ming is Ah-Kuan's nephew.", aToBRole: 'grandchild', bToARole: 'maternal-uncle' },
  'uncle-be|sis-younger': { chainText: "Gek-Ang is Lin's father's older brother.", aToBRole: 'paternal-uncle-older', bToARole: 'grandchild' },
  'sis-younger|uncle-be': { chainText: "Lin's father's older brother is Gek-Ang.", aToBRole: 'grandchild', bToARole: 'paternal-uncle-older' },
  'mei|uncle-gu': { chainText: "Ah-Kuan is Mei's mother's brother.", aToBRole: 'maternal-uncle', bToARole: 'grandchild' },
  'uncle-gu|mei': { chainText: "Mei is Ah-Kuan's sister's daughter.", aToBRole: 'grandchild', bToARole: 'maternal-uncle' },
  'bro-older|pa-gong': { chainText: "A-gong is Ming's paternal grandfather.", aToBRole: 'paternal-grandfather', bToARole: 'address-by-name' },
  'pa-gong|bro-older': { chainText: "Ming is A-gong's grandson.", aToBRole: 'address-by-name', bToARole: 'paternal-grandfather' },
  'mei|uncle-be': { chainText: "Gek-Ang is Mei's father's older brother.", aToBRole: 'paternal-uncle-older', bToARole: 'grandchild' },
  'uncle-be|mei': { chainText: "Mei is Gek-Ang's niece.", aToBRole: 'grandchild', bToARole: 'paternal-uncle-older' },
};

function PersonPicker({ label, selected, people, onSelect }: { label: string; selected: Person | null; people: Person[]; onSelect: (p: Person) => void }) {
  const [open, setOpen] = useState(false);
  const color = selected ? lineageColor(selected.id) : '#A89880';

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: '11px', color: '#8A7A68', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1.5px ${selected ? 'solid' : 'dashed'} ${selected ? color : 'rgba(42,31,20,0.2)'}`,
          background: selected ? '#EDE4D2' : 'rgba(42,31,20,0.04)', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}
      >
        {selected ? (
          <>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontFamily: "'Noto Serif SC', serif", fontSize: '14px' }}>
                {resolveTerm(selected.id, {})?.characters ?? selected.name.charAt(0)}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#2A1F14', fontWeight: 500 }}>{selected.nickname ?? selected.name}</div>
              <div style={{ fontSize: '11px', color: '#8A7A68' }}>{describeRelationship(selected.id)}</div>
            </div>
          </>
        ) : (
          <span style={{ fontSize: '13px', color: '#A89880' }}>Choose a person…</span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: '#EDE4D2', borderRadius: '12px', border: '1px solid rgba(42,31,20,0.12)', marginTop: '4px', maxHeight: '220px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(42,31,20,0.12)' }}>
          {people.map(p => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setOpen(false); }}
              style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid rgba(42,31,20,0.08)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: lineageColor(p.id), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontFamily: "'Noto Serif SC', serif", fontSize: '12px' }}>
                  {resolveTerm(p.id, {})?.characters ?? p.name.charAt(0)}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#2A1F14' }}>{p.nickname ?? p.name}</div>
                <div style={{ fontSize: '11px', color: '#8A7A68' }}>{describeRelationship(p.id)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConnectPanel() {
  const { state } = useFamilyStore();
  const [personA, setPersonA] = useState<Person | null>(null);
  const [personB, setPersonB] = useState<Person | null>(null);
  const [result, setResult] = useState(false);

  const pairKey = personA && personB ? `${personA.id}|${personB.id}` : '';
  const pairData = CONNECT_PAIRS[pairKey] || CONNECT_PAIRS[`${personB?.id}|${personA?.id}`] || null;
  const termAtoB = pairData?.aToBRole ? TERM_TABLE[pairData.aToBRole] ?? null : null;
  const termBtoA = pairData?.bToARole ? TERM_TABLE[pairData.bToARole] ?? null : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PersonPicker label="Person A" selected={personA} people={state.people} onSelect={p => { setPersonA(p); setResult(false); }} />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => { const t = personA; setPersonA(personB); setPersonB(t); setResult(false); }}
          style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid rgba(42,31,20,0.15)', background: '#EDE4D2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeftRight size={14} color="#8A7A68" />
        </button>
      </div>

      <PersonPicker label="Person B" selected={personB} people={state.people} onSelect={p => { setPersonB(p); setResult(false); }} />

      <button
        onClick={() => setResult(true)}
        disabled={!personA || !personB || personA.id === personB.id}
        style={{
          padding: '12px', borderRadius: '12px', border: 'none', cursor: personA && personB ? 'pointer' : 'default',
          background: personA && personB && personA.id !== personB.id ? '#BF5A35' : '#DDD4C2',
          color: personA && personB && personA.id !== personB.id ? '#FDF8F0' : '#8A7A68',
          fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 500,
        }}
      >
        Show relationship
      </button>

      {result && personA && personB && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Chain */}
          <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.10)' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
              <Users size={13} color="#BF5A35" />
              <span style={{ fontSize: '11px', color: '#BF5A35', fontWeight: 500 }}>Relationship chain</span>
            </div>
            <p style={{ fontSize: '13px', color: '#2A1F14', lineHeight: 1.6, margin: 0 }}>
              {pairData?.chainText ?? `${personA.nickname ?? personA.name} and ${personB.nickname ?? personB.name} are connected through the family tree.`}
            </p>
          </div>

          {/* A → B */}
          <div>
            <div style={{ fontSize: '11px', color: '#8A7A68', marginBottom: '6px' }}>
              <strong>{personA.nickname ?? personA.name}</strong> calls <strong>{personB.nickname ?? personB.name}</strong>…
            </div>
            {termAtoB ? <ResultCard term={termAtoB} compact /> : <UnconfirmedCard />}
          </div>

          {/* B → A */}
          <div>
            <div style={{ fontSize: '11px', color: '#8A7A68', marginBottom: '6px' }}>
              <strong>{personB.nickname ?? personB.name}</strong> calls <strong>{personA.nickname ?? personA.name}</strong>…
            </div>
            {termBtoA ? <ResultCard term={termBtoA} compact /> : <UnconfirmedCard />}
          </div>

          <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(42,31,20,0.04)', border: '1px solid rgba(42,31,20,0.06)' }}>
            <p style={{ fontSize: '12px', color: '#8A7A68', margin: 0, lineHeight: 1.5 }}>
              Note the asymmetry — in Teochew, the senior relative always has a distinct term from the junior one.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main AskScreen ─────────────────────────────────────────────
export function AskScreen() {
  const [query, setQuery] = useState('');
  const [resolvedTerm, setResolvedTerm] = useState<TeochewTerm | null>(null);
  const [resolvedLabel, setResolvedLabel] = useState('');
  const [panel, setPanel] = useState<'ask' | 'connect'>('ask');

  function handleSearch() {
    const roleKey = matchQuery(query);
    if (roleKey) {
      const term = TERM_TABLE[roleKey];
      setResolvedTerm(term ?? null);
      setResolvedLabel(query);
    } else {
      setResolvedTerm(null);
      setResolvedLabel(query);
    }
  }

  function setExample(roleKey: string, label: string) {
    const term = TERM_TABLE[roleKey];
    if (term) { setResolvedTerm(term); setResolvedLabel(label); setQuery(label); }
  }

  function handleGuideResult(term: TeochewTerm, label: string) {
    setResolvedTerm(term); setResolvedLabel(label);
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Left: input + guided flow ── */}
      <div
        style={{
          width: '380px', flexShrink: 0, borderRight: '1px solid rgba(42,31,20,0.10)',
          overflowY: 'auto', padding: '28px',
        }}
      >
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', color: '#2A1F14', fontWeight: 600, margin: '0 0 4px' }}>
          What do I call…
        </h2>
        <p style={{ fontSize: '12px', color: '#8A7A68', margin: '0 0 20px' }}>Type a relationship or use the guided picker</p>

        {/* NL input */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#EDE4D2', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(42,31,20,0.15)' }}>
            <Search size={14} color="#8A7A68" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setResolvedTerm(null); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. dad's older brother"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: '#2A1F14', fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{ padding: '10px 16px', background: '#BF5A35', color: '#FDF8F0', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, flexShrink: 0 }}
          >
            Look up
          </button>
        </div>

        {/* Panel toggle */}
        <div style={{ display: 'flex', gap: '4px', background: '#EDE4D2', borderRadius: '10px', padding: '3px', marginBottom: '20px' }}>
          {(['ask', 'connect'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPanel(p)}
              style={{
                flex: 1, padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: panel === p ? '#BF5A35' : 'transparent',
                color: panel === p ? '#FDF8F0' : '#8A7A68',
                fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: panel === p ? 500 : 400,
              }}
            >
              {p === 'ask' ? 'Guided picker' : 'Connect two'}
            </button>
          ))}
        </div>

        {panel === 'ask' && (
          <>
            {/* Quick examples */}
            <div style={{ fontSize: '11px', color: '#A89880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Quick examples</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
              {QUICK_EXAMPLES.map(ex => (
                <button
                  key={ex.roleKey}
                  onClick={() => setExample(ex.roleKey, ex.label)}
                  style={{ padding: '5px 12px', borderRadius: '20px', background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.12)', fontSize: '12px', color: '#2A1F14', cursor: 'pointer' }}
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Sparkles size={13} color="#BF5A35" />
              <span style={{ fontSize: '11px', color: '#A89880', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Step-by-step</span>
            </div>
            <GuidedFlow onResult={handleGuideResult} />
          </>
        )}

        {panel === 'connect' && <ConnectPanel />}
      </div>

      {/* ── Right: result panel ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
        {resolvedTerm ? (
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <p style={{ fontSize: '12px', color: '#A89880', marginBottom: '16px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Result
            </p>
            <ResultCard term={resolvedTerm} relationshipLabel={resolvedLabel} />
          </div>
        ) : resolvedLabel && !resolvedTerm ? (
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <UnconfirmedCard />
            <p style={{ fontSize: '13px', color: '#8A7A68', marginTop: '16px', textAlign: 'center', lineHeight: 1.6 }}>
              No match found for "{resolvedLabel}" — try the guided picker or choose a quick example.
            </p>
          </div>
        ) : (
          /* Empty state — term table showcase */
          <div style={{ width: '100%', maxWidth: '560px' }}>
            <p style={{ fontSize: '12px', color: '#A89880', marginBottom: '20px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              The complete guaranteed term set
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {Object.entries(TERM_TABLE)
                .filter(([, t]) => t.guaranteed && !t.addressByName && t.characters !== '—')
                .map(([key, term]) => (
                  <button
                    key={key}
                    onClick={() => { setResolvedTerm(term); setResolvedLabel(term.breakdown); }}
                    style={{
                      padding: '16px 12px', borderRadius: '14px', background: '#EDE4D2',
                      border: '1px solid rgba(42,31,20,0.08)', cursor: 'pointer', textAlign: 'center',
                      transition: 'transform 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: term.characters.length > 1 ? '28px' : '36px', color: '#2A1F14', lineHeight: 1, marginBottom: '8px' }}>
                      {term.characters}
                    </div>
                    <div style={{ fontFamily: "'Lora', serif", fontSize: '13px', color: '#BF5A35', marginBottom: '4px' }}>
                      {term.romanization}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8A7A68', lineHeight: 1.3 }}>
                      {term.breakdown}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
