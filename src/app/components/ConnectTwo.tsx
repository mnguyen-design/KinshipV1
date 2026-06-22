import { useState } from 'react';
import { ArrowLeftRight, Users } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';
import { resolveTerm, describeRelationship, lineageColor, PERSON_ROLES, TERM_TABLE } from '../data/teochewTerms';
import { ResultCard, UnconfirmedCard } from './ResultCard';
import type { Person } from '../data/types';

// Hardcoded connect-two results for key demo family pairs
const CONNECT_PAIRS: Record<string, {
  chainText: string;
  aToBRole?: string; // role key from TERM_TABLE
  bToARole?: string;
}> = {
  // bro-older <-> uncle-gu
  'bro-older|uncle-gu': {
    chainText: "Ah-Kuan is your brother Ming's maternal uncle — and Ming is his nephew.",
    aToBRole: 'maternal-uncle',
    bToARole: 'grandchild', // nephew → broad Sung 孫
  },
  'uncle-gu|bro-older': {
    chainText: "Ming is your uncle Ah-Kuan's nephew.",
    aToBRole: 'grandchild',
    bToARole: 'maternal-uncle',
  },
  'uncle-be|sis-younger': {
    chainText: "Gek-Ang is Lin's father's older brother.",
    aToBRole: 'paternal-uncle-older',
    bToARole: 'grandchild',
  },
  'sis-younger|uncle-be': {
    chainText: "Lin's father's older brother is Gek-Ang.",
    aToBRole: 'grandchild',
    bToARole: 'paternal-uncle-older',
  },
  'pa-gong|cousin-alvin': {
    chainText: "Alvin's maternal grandfather and your paternal grandfather are connected through your parents' marriage.",
    aToBRole: undefined,
    bToARole: undefined,
  },
  'mei|uncle-gu': {
    chainText: "Ah-Kuan is Mei's mother's brother.",
    aToBRole: 'maternal-uncle',
    bToARole: 'grandchild',
  },
  'uncle-gu|mei': {
    chainText: "Mei is Ah-Kuan's sister's daughter.",
    aToBRole: 'grandchild',
    bToARole: 'maternal-uncle',
  },
  'bro-older|pa-gong': {
    chainText: "A-gong is your older brother Ming's paternal grandfather.",
    aToBRole: 'paternal-grandfather',
    bToARole: 'address-by-name',
  },
  'pa-gong|bro-older': {
    chainText: "Ming is A-gong's grandson.",
    aToBRole: 'address-by-name',
    bToARole: 'paternal-grandfather',
  },
};

function getPairResult(aId: string, bId: string) {
  const key = `${aId}|${bId}`;
  const reverseKey = `${bId}|${aId}`;
  return CONNECT_PAIRS[key] || CONNECT_PAIRS[reverseKey] || null;
}

function PersonPicker({
  label,
  selected,
  people,
  onSelect,
}: {
  label: string;
  selected: Person | null;
  people: Person[];
  onSelect: (p: Person) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div style={{ fontSize: '11px', color: '#8A7A68', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
        {label}
      </div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all"
        style={{
          background: selected ? '#EDE4D2' : 'rgba(42,31,20,0.06)',
          border: selected ? `1.5px solid ${lineageColor(selected.id)}` : '1.5px dashed rgba(42,31,20,0.2)',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {selected ? (
          <>
            <div
              style={{
                width: '28px', height: '28px', borderRadius: '50%', background: lineageColor(selected.id),
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <span style={{ color: 'white', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                {(selected.nickname ?? selected.name).charAt(0)}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#2A1F14', fontWeight: 500 }}>{selected.nickname ?? selected.name}</div>
              <div style={{ fontSize: '11px', color: '#8A7A68' }}>{describeRelationship(selected.id)}</div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: '14px', color: '#A89880' }}>Choose a person…</div>
        )}
      </button>

      {open && (
        <div
          className="mt-1 rounded-xl overflow-hidden"
          style={{ background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.12)', maxHeight: '200px', overflowY: 'auto' }}
        >
          {people.map(p => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setOpen(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 text-left transition-all hover:opacity-80"
              style={{ background: 'none', border: 'none', borderBottom: '1px solid rgba(42,31,20,0.08)', cursor: 'pointer' }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: lineageColor(p.id), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '10px' }}>{(p.nickname ?? p.name).charAt(0)}</span>
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

export function ConnectTwo() {
  const { state } = useFamilyStore();
  const [personA, setPersonA] = useState<Person | null>(null);
  const [personB, setPersonB] = useState<Person | null>(null);
  const [showResult, setShowResult] = useState(false);

  const nonEgoPeople = state.people.filter(p => !p.isEgo || p.id !== state.egoId);
  const allPeople = state.people;

  function handleConnect() {
    if (personA && personB) setShowResult(true);
  }

  function handleSwap() {
    const tmp = personA;
    setPersonA(personB);
    setPersonB(tmp);
    setShowResult(false);
  }

  const pairResult = personA && personB ? getPairResult(personA.id, personB.id) : null;
  const termAtoB = personA && pairResult?.aToBRole ? (TERM_TABLE[pairResult.aToBRole] ?? null) : null;
  const termBtoA = personB && pairResult?.bToARole ? (TERM_TABLE[pairResult.bToARole] ?? null) : null;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 pt-5 pb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex items-center gap-2 mb-4">
        <ArrowLeftRight size={18} color="#BF5A35" />
        <h3 style={{ fontFamily: "'Lora', serif", fontSize: '18px', color: '#2A1F14', fontWeight: 600 }}>
          Connect any two people
        </h3>
      </div>
      <p style={{ fontSize: '13px', color: '#8A7A68', lineHeight: 1.6, marginBottom: '20px' }}>
        Pick two people from the tree. Kinship shows what each calls the other — and the relationship chain between them.
      </p>

      {/* Pickers */}
      <div className="space-y-4 mb-5">
        <PersonPicker label="Person A" selected={personA} people={allPeople} onSelect={p => { setPersonA(p); setShowResult(false); }} />

        <div className="flex items-center justify-center">
          <button
            onClick={handleSwap}
            style={{ background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.12)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeftRight size={14} color="#8A7A68" />
          </button>
        </div>

        <PersonPicker label="Person B" selected={personB} people={allPeople} onSelect={p => { setPersonB(p); setShowResult(false); }} />
      </div>

      <button
        onClick={handleConnect}
        disabled={!personA || !personB || personA.id === personB.id}
        className="w-full py-3.5 rounded-xl mb-6"
        style={{
          background: personA && personB && personA.id !== personB.id ? '#BF5A35' : '#DDD4C2',
          color: personA && personB && personA.id !== personB.id ? '#FDF8F0' : '#8A7A68',
          border: 'none', cursor: personA && personB ? 'pointer' : 'default',
          fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 500,
        }}
      >
        Show relationship
      </button>

      {/* Results */}
      {showResult && personA && personB && (
        <div className="space-y-4">
          {/* Chain description */}
          <div className="p-4 rounded-xl" style={{ background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} color="#BF5A35" />
              <span style={{ fontSize: '12px', color: '#BF5A35', fontWeight: 500 }}>Relationship chain</span>
            </div>
            <p style={{ fontSize: '14px', color: '#2A1F14', lineHeight: 1.6 }}>
              {pairResult?.chainText ?? `${personA.nickname ?? personA.name} and ${personB.nickname ?? personB.name} are connected through your family tree.`}
            </p>
          </div>

          {/* A→B */}
          <div>
            <div style={{ fontSize: '12px', color: '#8A7A68', marginBottom: '8px', fontWeight: 500 }}>
              {personA.nickname ?? personA.name} calls {personB.nickname ?? personB.name}…
            </div>
            {termAtoB ? (
              <ResultCard term={termAtoB} personName={personB.nickname ?? personB.name} compact />
            ) : (
              <UnconfirmedCard personName={personB.nickname ?? personB.name} />
            )}
          </div>

          {/* B→A */}
          <div>
            <div style={{ fontSize: '12px', color: '#8A7A68', marginBottom: '8px', fontWeight: 500 }}>
              {personB.nickname ?? personB.name} calls {personA.nickname ?? personA.name}…
            </div>
            {termBtoA ? (
              <ResultCard term={termBtoA} personName={personA.nickname ?? personA.name} compact />
            ) : (
              <UnconfirmedCard personName={personA.nickname ?? personA.name} />
            )}
          </div>

          <div
            className="p-3 rounded-xl"
            style={{ background: 'rgba(42,31,20,0.04)', border: '1px solid rgba(42,31,20,0.06)' }}
          >
            <p style={{ fontSize: '12px', color: '#8A7A68', lineHeight: 1.5 }}>
              Note the asymmetry — in Teochew, a senior relative always has a different term than the junior one. This is what makes the naming system meaningful.
            </p>
          </div>
        </div>
      )}

      {showResult && personA && personB && personA.id === personB.id && (
        <div className="text-center py-6">
          <p style={{ color: '#8A7A68' }}>Pick two different people.</p>
        </div>
      )}
    </div>
  );
}
