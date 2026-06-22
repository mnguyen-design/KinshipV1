import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Edit3, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ResultCard, UnconfirmedCard } from './ResultCard';
import { ConfirmFlow } from './ConfirmFlow';
import { resolveTerm, describeRelationship, lineageColor } from '../data/teochewTerms';
import { useFamilyStore } from '../store/familyStore';
import type { Person } from '../data/types';

interface PersonDetailProps {
  person: Person | null;
  open: boolean;
  onClose: () => void;
}

export function PersonDetail({ person, open, onClose }: PersonDetailProps) {
  const { state } = useFamilyStore();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!person) return null;

  const term = resolveTerm(person.id, state.termOverrides);
  const relationship = describeRelationship(person.id);
  const color = lineageColor(person.id);
  const initial = (person.nickname ?? person.name).charAt(0).toUpperCase();

  function handleAsk() {
    onClose();
    navigate('/ask', { state: { preselectedId: person.id } });
  }

  if (showConfirm) {
    return (
      <Dialog.Root open={open} onOpenChange={open => { if (!open) { setShowConfirm(false); onClose(); } }}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(42,31,20,0.4)', zIndex: 40 }} />
          <Dialog.Content
            style={{
              position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: '390px', zIndex: 50,
              background: '#F4EDE0', borderRadius: '20px 20px 0 0',
              boxShadow: '0 -8px 40px rgba(42,31,20,0.15)',
            }}
          >
            <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(42,31,20,0.2)', margin: '12px auto 0' }} />
            <ConfirmFlow
              person={person}
              onClose={() => { setShowConfirm(false); onClose(); }}
              onSaved={() => { setShowConfirm(false); onClose(); }}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(42,31,20,0.35)', zIndex: 40 }} />
        <Dialog.Content
          style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: '390px', zIndex: 50,
            background: '#F4EDE0', borderRadius: '20px 20px 0 0',
            boxShadow: '0 -8px 40px rgba(42,31,20,0.18)',
            maxHeight: '88vh', overflowY: 'auto',
          }}
        >
          {/* Drag handle */}
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(42,31,20,0.2)', margin: '12px auto 0' }} />

          <div className="px-5 pt-4 pb-8">
            {/* Person header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                style={{
                  width: '48px', height: '48px', borderRadius: '50%', background: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <span style={{ color: 'white', fontSize: '20px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                  {initial}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "'Lora', serif", fontSize: '18px', color: '#2A1F14', fontWeight: 600, lineHeight: 1.2 }}>
                  {person.nickname ?? person.name}
                </div>
                <div style={{ fontSize: '12px', color: '#8A7A68', marginTop: '2px' }}>
                  {person.isEgo ? 'You' : relationship}
                </div>
              </div>
              <Dialog.Close asChild>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#8A7A68' }}>
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            {/* Term card */}
            {person.isEgo ? (
              <div className="rounded-2xl p-5 text-center" style={{ background: '#EDE4D2' }}>
                <p style={{ fontSize: '14px', color: '#8A7A68', lineHeight: 1.6 }}>
                  This is you — the centre of the tree. Everyone else's terms are calculated from your position.
                </p>
              </div>
            ) : term ? (
              <ResultCard
                term={term}
                personName={person.nickname ?? person.name}
                relationshipLabel={relationship}
                onConfirm={() => setShowConfirm(true)}
              />
            ) : (
              <UnconfirmedCard
                personName={person.nickname ?? person.name}
                onConfirm={() => setShowConfirm(true)}
              />
            )}

            {/* Actions */}
            {!person.isEgo && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAsk}
                  className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                  style={{
                    background: '#BF5A35', color: '#FDF8F0', border: 'none', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 500,
                  }}
                >
                  <MessageCircle size={15} />
                  Connect two people
                </button>
                <button
                  className="px-4 py-3 rounded-xl flex items-center justify-center"
                  style={{
                    background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.12)', cursor: 'pointer',
                  }}
                >
                  <Edit3 size={15} color="#8A7A68" />
                </button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
