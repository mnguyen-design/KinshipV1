import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { FamilyState, FamilyAction, Person, Edge } from '../data/types';
import { SAMPLE_FAMILY } from '../data/sampleFamily';

const STORAGE_KEY = 'kinship-family-v2'; // bump version to drop stale localStorage

const initialState: FamilyState = {
  people: [],
  edges: [],
  termOverrides: {},
  egoId: '',
  hasCompletedOnboarding: false,
  language: 'teochew',
};

function reducer(state: FamilyState, action: FamilyAction): FamilyState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        people: action.payload.people,
        edges: action.payload.edges,
        egoId: action.payload.egoId,
        hasCompletedOnboarding: true,
      };

    case 'ADD_PERSON':
      return { ...state, people: [...state.people, action.payload] };

    case 'UPDATE_PERSON':
      return {
        ...state,
        people: state.people.map(p => p.id === action.payload.id ? action.payload : p),
      };

    case 'REMOVE_PERSON':
      return {
        ...state,
        people: state.people.filter(p => p.id !== action.payload),
        edges: state.edges.filter(e => e.fromId !== action.payload && e.toId !== action.payload),
      };

    case 'ADD_EDGE':
      return { ...state, edges: [...state.edges, action.payload] };

    case 'SET_TERM_OVERRIDE':
      return {
        ...state,
        termOverrides: { ...state.termOverrides, [action.payload.personId]: action.payload },
      };

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface FamilyContextValue {
  state: FamilyState;
  dispatch: React.Dispatch<FamilyAction>;
  loadDemo: () => void;
  getEgo: () => Person | undefined;
  getPerson: (id: string) => Person | undefined;
  getChildren: (personId: string) => Person[];
  getParents: (personId: string) => Person[];
  getSpouse: (personId: string) => Person | undefined;
  getSiblings: (personId: string) => Person[];
}

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted state on mount; auto-upgrade stale demo families
  useEffect(() => {
    // Clear any data saved under the old key
    try { localStorage.removeItem('kinship-family-v1'); } catch { /* ignore */ }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FamilyState;
        // If this is the demo family but is missing the expanded maternal side,
        // replace it with the latest SAMPLE_FAMILY so new nodes appear.
        const isDemoFamily = parsed.people.some(p => p.id === 'mei' || p.id === 'ba');
        const isUpToDate   = parsed.people.some(p => p.id === 'aunt-yi-older');
        if (isDemoFamily && !isUpToDate) {
          dispatch({ type: 'LOAD_STATE', payload: SAMPLE_FAMILY });
        } else {
          dispatch({ type: 'LOAD_STATE', payload: parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist state on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  function loadDemo() {
    dispatch({ type: 'LOAD_STATE', payload: SAMPLE_FAMILY });
  }

  function getEgo() {
    return state.people.find(p => p.id === state.egoId);
  }

  function getPerson(id: string) {
    return state.people.find(p => p.id === id);
  }

  function getChildren(personId: string): Person[] {
    const childIds = state.edges
      .filter(e => e.type === 'parent' && e.fromId === personId)
      .map(e => e.toId);
    return state.people.filter(p => childIds.includes(p.id));
  }

  function getParents(personId: string): Person[] {
    const parentIds = state.edges
      .filter(e => e.type === 'parent' && e.toId === personId)
      .map(e => e.fromId);
    return state.people.filter(p => parentIds.includes(p.id));
  }

  function getSpouse(personId: string): Person | undefined {
    const edge = state.edges.find(
      e => e.type === 'spouse' && (e.fromId === personId || e.toId === personId)
    );
    if (!edge) return undefined;
    const spouseId = edge.fromId === personId ? edge.toId : edge.fromId;
    return state.people.find(p => p.id === spouseId);
  }

  function getSiblings(personId: string): Person[] {
    // Find all people who share at least one parent
    const parentIds = state.edges
      .filter(e => e.type === 'parent' && e.toId === personId)
      .map(e => e.fromId);

    const siblingIds = new Set<string>();
    for (const parentId of parentIds) {
      state.edges
        .filter(e => e.type === 'parent' && e.fromId === parentId && e.toId !== personId)
        .forEach(e => siblingIds.add(e.toId));
    }
    return state.people.filter(p => siblingIds.has(p.id));
  }

  return (
    <FamilyContext.Provider value={{ state, dispatch, loadDemo, getEgo, getPerson, getChildren, getParents, getSpouse, getSiblings }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyStore() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamilyStore must be used within FamilyProvider');
  return ctx;
}
