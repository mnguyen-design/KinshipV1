import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';
import type { Person } from '../data/types';

interface ConfirmFlowProps {
  person: Person;
  onClose: () => void;
  onSaved: () => void;
}

export function ConfirmFlow({ person, onClose, onSaved }: ConfirmFlowProps) {
  const { dispatch } = useFamilyStore();
  const [characters, setCharacters] = useState('');
  const [romanization, setRomanization] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!characters && !romanization) return;
    dispatch({
      type: 'SET_TERM_OVERRIDE',
      payload: {
        personId: person.id,
        characters: characters || '?',
        romanization: romanization || '?',
        pronunciation,
      },
    });
    setSaved(true);
    setTimeout(() => {
      onSaved();
      onClose();
    }, 1000);
  }

  if (saved) {
    return (
      <div className="p-6 text-center">
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#4A7B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Check size={26} color="white" />
        </div>
        <p style={{ fontFamily: "'Lora', serif", fontSize: '18px', color: '#2A1F14', marginBottom: '6px' }}>Term saved</p>
        <p style={{ fontSize: '13px', color: '#8A7A68' }}>It'll be remembered for {person.name} from now on.</p>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 style={{ fontFamily: "'Lora', serif", fontSize: '18px', color: '#2A1F14', fontWeight: 600 }}>
          Confirm the term
        </h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} color="#8A7A68" />
        </button>
      </div>

      <p style={{ fontSize: '13px', color: '#8A7A68', lineHeight: 1.6, marginBottom: '20px' }}>
        This relationship is outside the guaranteed boundary. Ask a family elder and save the term — it will be remembered for <strong>{person.name}</strong> from now on.
      </p>

      <div className="space-y-4">
        <div>
          <label style={{ fontSize: '12px', color: '#8A7A68', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Chinese characters
          </label>
          <input
            type="text"
            value={characters}
            onChange={e => setCharacters(e.target.value)}
            placeholder="e.g. 叔公"
            className="w-full px-4 py-3 rounded-xl outline-none"
            style={{
              background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.15)',
              fontSize: '22px', fontFamily: "'Noto Serif SC', serif", color: '#2A1F14',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#8A7A68', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Romanization (Peng'im)
          </label>
          <input
            type="text"
            value={romanization}
            onChange={e => setRomanization(e.target.value)}
            placeholder="e.g. Zeg-gong"
            className="w-full px-4 py-3 rounded-xl outline-none"
            style={{
              background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.15)',
              fontSize: '16px', fontFamily: "'DM Sans', sans-serif", color: '#2A1F14',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#8A7A68', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Pronunciation (plain English)
          </label>
          <input
            type="text"
            value={pronunciation}
            onChange={e => setPronunciation(e.target.value)}
            placeholder="e.g. Tsek-gong"
            className="w-full px-4 py-3 rounded-xl outline-none"
            style={{
              background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.15)',
              fontSize: '16px', fontFamily: "'DM Sans', sans-serif", color: '#2A1F14',
            }}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl"
          style={{
            background: 'transparent', border: '1px solid rgba(42,31,20,0.15)',
            color: '#8A7A68', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Skip for now
        </button>
        <button
          onClick={handleSave}
          disabled={!characters && !romanization}
          className="flex-1 py-3 rounded-xl"
          style={{
            background: (characters || romanization) ? '#BF5A35' : '#DDD4C2',
            color: (characters || romanization) ? '#FDF8F0' : '#8A7A68',
            border: 'none', cursor: (characters || romanization) ? 'pointer' : 'default',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          }}
        >
          Save term
        </button>
      </div>

      <p style={{ fontSize: '11px', color: '#A89880', textAlign: 'center', marginTop: '12px', lineHeight: 1.5 }}>
        Terms are saved to your family only. Kinship never asserts a term it can't verify.
      </p>
    </div>
  );
}
