import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';
import type { Person, Edge } from '../data/types';

type Step = 'name' | 'siblings' | 'parents' | 'dads-side' | 'moms-side' | 'done';
const STEPS: Step[] = ['name', 'siblings', 'parents', 'dads-side', 'moms-side', 'done'];

interface Answers {
  egoName: string;
  egoGender: 'male' | 'female';
  olderBrothers: number;
  youngerBrothers: number;
  olderSisters: number;
  youngerSisters: number;
  fatherOlderBrothers: number;
  fatherYoungerBrothers: number;
  fatherSisters: number;
  motherBrothers: number;
  motherSisters: number;
}

function Counter({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(42,31,20,0.08)' }}>
      <span style={{ fontSize: '14px', color: '#2A1F14' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => onChange(Math.max(0, value - 1))} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid rgba(42,31,20,0.2)', background: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1F14' }}>−</button>
        <span style={{ fontSize: '18px', fontWeight: 500, color: '#2A1F14', minWidth: '20px', textAlign: 'center' }}>{value}</span>
        <button onClick={() => onChange(value + 1)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#BF5A35', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>+</button>
      </div>
    </div>
  );
}

function buildFamily(answers: Answers): { people: Person[]; edges: Edge[]; egoId: string } {
  const people: Person[] = [];
  const edges: Edge[] = [];
  const egoId = 'ego';
  const baId = 'ba'; const maId = 'ma';

  people.push({ id: egoId, name: answers.egoName || 'You', gender: answers.egoGender, isEgo: true });
  people.push({ id: baId, name: 'Ba', gender: 'male' });
  people.push({ id: maId, name: 'Ma', gender: 'female' });
  edges.push({ id: 'e-ba-ego', type: 'parent', fromId: baId, toId: egoId });
  edges.push({ id: 'e-ma-ego', type: 'parent', fromId: maId, toId: egoId });
  edges.push({ id: 'e-ba-ma', type: 'spouse', fromId: baId, toId: maId });

  let idx = 0;
  const addSib = (gender: 'male' | 'female', namePrefix: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const id = `sib-${namePrefix}-${i}`;
      people.push({ id, name: `${namePrefix} ${i + 1}`, gender, birthOrder: idx++ });
      edges.push({ id: `e-ba-${id}`, type: 'parent', fromId: baId, toId: id });
      edges.push({ id: `e-ma-${id}`, type: 'parent', fromId: maId, toId: id });
    }
  };
  addSib('male', 'Older Bro', answers.olderBrothers);
  addSib('female', 'Older Sis', answers.olderSisters);
  addSib('male', 'Younger Bro', answers.youngerBrothers);
  addSib('female', 'Younger Sis', answers.youngerSisters);

  const pagongId = 'pa-gong-ob'; const pamaId = 'pa-ma-ob';
  people.push({ id: pagongId, name: 'A-gong', gender: 'male' });
  people.push({ id: pamaId, name: 'A-ma', gender: 'female' });
  edges.push({ id: 'e-pagong-ba', type: 'parent', fromId: pagongId, toId: baId });
  edges.push({ id: 'e-pama-ba', type: 'parent', fromId: pamaId, toId: baId });
  edges.push({ id: 'e-pagong-pama', type: 'spouse', fromId: pagongId, toId: pamaId });

  for (let i = 0; i < answers.fatherOlderBrothers; i++) {
    const id = `dad-ob-${i}`;
    people.push({ id, name: `Uncle (伯) ${i + 1}`, gender: 'male' });
    edges.push({ id: `e1-${id}`, type: 'parent', fromId: pagongId, toId: id });
    edges.push({ id: `e2-${id}`, type: 'parent', fromId: pamaId, toId: id });
  }
  for (let i = 0; i < answers.fatherYoungerBrothers; i++) {
    const id = `dad-yb-${i}`;
    people.push({ id, name: `Uncle (叔) ${i + 1}`, gender: 'male' });
    edges.push({ id: `e1-${id}`, type: 'parent', fromId: pagongId, toId: id });
    edges.push({ id: `e2-${id}`, type: 'parent', fromId: pamaId, toId: id });
  }
  for (let i = 0; i < answers.fatherSisters; i++) {
    const id = `dad-sis-${i}`;
    people.push({ id, name: `Aunt (姑) ${i + 1}`, gender: 'female' });
    edges.push({ id: `e1-${id}`, type: 'parent', fromId: pagongId, toId: id });
    edges.push({ id: `e2-${id}`, type: 'parent', fromId: pamaId, toId: id });
  }

  const magongId = 'ma-gong-ob'; const mamamaId = 'ma-ma-ob';
  people.push({ id: magongId, name: 'A-gong', gender: 'male' });
  people.push({ id: mamamaId, name: 'A-ma', gender: 'female' });
  edges.push({ id: 'e-magong-ma', type: 'parent', fromId: magongId, toId: maId });
  edges.push({ id: 'e-mama-ma', type: 'parent', fromId: mamamaId, toId: maId });
  edges.push({ id: 'e-magong-mama', type: 'spouse', fromId: magongId, toId: mamamaId });

  for (let i = 0; i < answers.motherBrothers; i++) {
    const id = `mom-br-${i}`;
    people.push({ id, name: `Uncle (舅) ${i + 1}`, gender: 'male' });
    edges.push({ id: `e1-${id}`, type: 'parent', fromId: magongId, toId: id });
    edges.push({ id: `e2-${id}`, type: 'parent', fromId: mamamaId, toId: id });
  }
  for (let i = 0; i < answers.motherSisters; i++) {
    const id = `mom-sis-${i}`;
    people.push({ id, name: `Aunt (姨) ${i + 1}`, gender: 'female' });
    edges.push({ id: `e1-${id}`, type: 'parent', fromId: magongId, toId: id });
    edges.push({ id: `e2-${id}`, type: 'parent', fromId: mamamaId, toId: id });
  }

  return { people, edges, egoId };
}

const STEP_TITLES: Record<Step, string> = {
  name: 'Let\'s start with you', siblings: 'Your siblings',
  parents: 'Your parents added', 'dads-side': "Your father's side", 'moms-side': "Your mother's side", done: 'Your family is ready',
};

const TEOCHEW_HINTS: Record<Step, { char: string; text: string } | null> = {
  name: null,
  siblings: { char: '兄妹', text: 'Older brother = 兄 Hia[n] · Younger sister = 妹 Mue' },
  parents: { char: '爸媽', text: 'Father = 爸 Ba · Mother = 媽 Ma' },
  'dads-side': { char: '伯叔姑', text: 'Older uncle = 伯 Be · Younger uncle = 叔 Zeg · Aunt = 姑 Gou' },
  'moms-side': { char: '舅姨', text: "Mother's brother = 舅 Gu · Mother's sister = 姨 Yi" },
  done: null,
};

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { dispatch } = useFamilyStore();
  const [step, setStep] = useState<Step>('name');
  const [answers, setAnswers] = useState<Answers>({
    egoName: '', egoGender: 'female',
    olderBrothers: 0, youngerBrothers: 0, olderSisters: 0, youngerSisters: 0,
    fatherOlderBrothers: 0, fatherYoungerBrothers: 0, fatherSisters: 0,
    motherBrothers: 0, motherSisters: 0,
  });

  const stepIdx = STEPS.indexOf(step);
  const progress = (stepIdx / (STEPS.length - 1)) * 100;
  const hint = TEOCHEW_HINTS[step];
  const nodeCount = 3
    + answers.olderBrothers + answers.youngerBrothers + answers.olderSisters + answers.youngerSisters
    + answers.fatherOlderBrothers + answers.fatherYoungerBrothers + answers.fatherSisters
    + answers.motherBrothers + answers.motherSisters + 4; // grandparents

  function finish() {
    const { people, edges, egoId } = buildFamily(answers);
    dispatch({ type: 'COMPLETE_ONBOARDING', payload: { people, edges, egoId } });
    navigate('/tree');
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: '#F4EDE0', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left: form */}
      <div style={{ width: '480px', flexShrink: 0, padding: '60px 56px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(42,31,20,0.10)', overflowY: 'auto' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          {stepIdx > 0 && (
            <button onClick={() => setStep(STEPS[stepIdx - 1])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7A68', padding: '4px' }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(42,31,20,0.12)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#BF5A35', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '12px', color: '#A89880' }}>{stepIdx + 1} / {STEPS.length}</span>
        </div>

        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '26px', fontWeight: 600, color: '#2A1F14', margin: '0 0 8px' }}>
          {STEP_TITLES[step]}
        </h2>

        {/* Teochew hint */}
        {hint && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: 'rgba(191,90,53,0.07)', border: '1px solid rgba(191,90,53,0.18)', marginBottom: '24px' }}>
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '22px', color: '#BF5A35', flexShrink: 0 }}>{hint.char}</span>
            <span style={{ fontSize: '12px', color: '#8A7A68', lineHeight: 1.5 }}>{hint.text}</span>
          </div>
        )}

        {/* Step content */}
        <div style={{ flex: 1 }}>
          {step === 'name' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#8A7A68', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Your name</label>
                <input
                  type="text"
                  value={answers.egoName}
                  onChange={e => setAnswers(a => ({ ...a, egoName: e.target.value }))}
                  placeholder="Mei"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(42,31,20,0.15)', background: '#EDE4D2', fontSize: '16px', color: '#2A1F14', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8A7A68', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>I am</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {(['female', 'male'] as const).map(g => (
                    <button key={g} onClick={() => setAnswers(a => ({ ...a, egoGender: g }))}
                      style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${answers.egoGender === g ? '#BF5A35' : 'rgba(42,31,20,0.15)'}`, background: answers.egoGender === g ? '#BF5A35' : '#EDE4D2', color: answers.egoGender === g ? '#FDF8F0' : '#2A1F14', cursor: 'pointer', fontSize: '15px', fontFamily: "'DM Sans', sans-serif" }}>
                      {g === 'female' ? 'Female' : 'Male'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'siblings' && (
            <>
              <Counter label="Older brothers" value={answers.olderBrothers} onChange={v => setAnswers(a => ({ ...a, olderBrothers: v }))} />
              <Counter label="Older sisters" value={answers.olderSisters} onChange={v => setAnswers(a => ({ ...a, olderSisters: v }))} />
              <Counter label="Younger brothers" value={answers.youngerBrothers} onChange={v => setAnswers(a => ({ ...a, youngerBrothers: v }))} />
              <Counter label="Younger sisters" value={answers.youngerSisters} onChange={v => setAnswers(a => ({ ...a, youngerSisters: v }))} />
            </>
          )}

          {step === 'parents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[{ id: 'ba', char: '爸', rom: 'Ba', label: 'Your father', color: '#BF5A35' }, { id: 'ma', char: '媽', rom: 'Ma', label: 'Your mother', color: '#4A7B6B' }].map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '14px', background: '#EDE4D2' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: 'white' }}>{p.char}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: '#2A1F14' }}>{p.rom} <span style={{ fontFamily: "'Lora', serif", color: p.color }}>· {p.char}</span></div>
                    <div style={{ fontSize: '12px', color: '#8A7A68' }}>{p.label}</div>
                  </div>
                  <Check size={16} color={p.color} style={{ marginLeft: 'auto' }} />
                </div>
              ))}
              <p style={{ fontSize: '13px', color: '#8A7A68', textAlign: 'center', marginTop: '8px' }}>Names can be added later from the tree.</p>
            </div>
          )}

          {step === 'dads-side' && (
            <>
              <Counter label="Father's older brothers (伯 Be)" value={answers.fatherOlderBrothers} onChange={v => setAnswers(a => ({ ...a, fatherOlderBrothers: v }))} />
              <Counter label="Father's younger brothers (叔 Zeg)" value={answers.fatherYoungerBrothers} onChange={v => setAnswers(a => ({ ...a, fatherYoungerBrothers: v }))} />
              <Counter label="Father's sisters (姑 Gou)" value={answers.fatherSisters} onChange={v => setAnswers(a => ({ ...a, fatherSisters: v }))} />
            </>
          )}

          {step === 'moms-side' && (
            <>
              <Counter label="Mother's brothers (舅 Gu)" value={answers.motherBrothers} onChange={v => setAnswers(a => ({ ...a, motherBrothers: v }))} />
              <Counter label="Mother's sisters (姨 Yi)" value={answers.motherSisters} onChange={v => setAnswers(a => ({ ...a, motherSisters: v }))} />
            </>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', paddingTop: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#BF5A35', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={28} color="white" />
              </div>
              <p style={{ fontSize: '16px', color: '#2A1F14', lineHeight: 1.6 }}>
                <strong>{nodeCount} people</strong> added to your family tree.
              </p>
              <p style={{ fontSize: '13px', color: '#8A7A68', marginTop: '8px', lineHeight: 1.6 }}>Tap any node in the tree to see their Teochew term, add names, or connect any two relatives.</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={step === 'done' ? finish : () => setStep(STEPS[stepIdx + 1])}
          style={{ marginTop: '32px', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: '#BF5A35', color: '#FDF8F0', fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(191,90,53,0.25)' }}
        >
          {step === 'done' ? 'See my family tree' : 'Continue'}
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Right: live preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ fontSize: '12px', color: '#A89880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>
          Your family, forming now
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '400px' }}>
          {Array.from({ length: Math.min(nodeCount, 30) }).map((_, i) => {
            const colors = ['#BF5A35', '#4A7B6B', '#C8A45A'];
            const color = i === 0 ? '#BF5A35' : colors[i % 3];
            return (
              <div
                key={i}
                style={{
                  width: i === 0 ? '52px' : i <= 2 ? '36px' : '26px',
                  height: i === 0 ? '52px' : i <= 2 ? '36px' : '26px',
                  borderRadius: '50%',
                  background: i === 0 ? color : '#EDE4D2',
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                {i === 0 && <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: 'white' }}>我</span>}
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: '13px', color: '#A89880', marginTop: '28px', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6 }}>
          Each dot is a person. Every relationship has an exact Teochew term waiting to be revealed.
        </p>
      </div>
    </div>
  );
}
