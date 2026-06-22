export interface Person {
  id: string;
  name: string;
  nickname?: string;
  gender: 'male' | 'female';
  isEgo?: boolean;
  birthOrder?: number;
  photo?: string;
  notes?: string;
}

export interface Edge {
  id: string;
  type: 'parent' | 'spouse' | 'sibling';
  fromId: string;
  toId: string;
  metadata?: {
    relativeAge?: 'older' | 'younger'; // sibling relative to the linking parent
    siblingSetComplete?: boolean;
  };
}

export interface RankStep {
  characters: string;
  romanization: string;
  label: string;       // e.g. "Big", "2nd", "Small"
  isCurrent?: boolean;
}

export interface TeochewTerm {
  characters: string;
  romanization: string;
  pronunciation: string;
  breakdown: string;
  side?: 'paternal' | 'maternal' | 'self';
  guaranteed: boolean;
  addressByName?: boolean;
  note?: string;
  descriptiveLabel?: string;
  // Birth-rank fields — set when a rank prefix (Tua/number/Soi) is applied
  rankLabel?: string;      // e.g. "1st of 4 maternal uncles"
  rankSequence?: RankStep[]; // full sibling set in birth order
}

export interface TermOverride {
  personId: string;
  characters: string;
  romanization: string;
  pronunciation?: string;
}

export interface OnboardingAnswers {
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
  isMarried: boolean;
  hasChildren: boolean;
}

export interface FamilyState {
  people: Person[];
  edges: Edge[];
  termOverrides: Record<string, TermOverride>;
  egoId: string;
  hasCompletedOnboarding: boolean;
  language: 'teochew' | 'mandarin';
}

export type FamilyAction =
  | { type: 'COMPLETE_ONBOARDING'; payload: { people: Person[]; edges: Edge[]; egoId: string } }
  | { type: 'ADD_PERSON'; payload: Person }
  | { type: 'UPDATE_PERSON'; payload: Person }
  | { type: 'REMOVE_PERSON'; payload: string }
  | { type: 'ADD_EDGE'; payload: Edge }
  | { type: 'SET_TERM_OVERRIDE'; payload: TermOverride }
  | { type: 'SET_LANGUAGE'; payload: 'teochew' | 'mandarin' }
  | { type: 'LOAD_STATE'; payload: FamilyState }
  | { type: 'RESET' };
