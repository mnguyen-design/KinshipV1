import type { TeochewTerm, TermOverride, RankStep } from './types';

// ── Birth-rank sequence helpers ───────────────────────────────────────────────
// Maternal aunts (Yi 姨): 2 in this family — aunt-yi-older and aunt-yi
const YI_SEQUENCE: RankStep[] = [
  { characters: '大姨', romanization: 'Tua-Yi', label: 'Big — eldest' },
  { characters: '細姨', romanization: 'Soi-Yi', label: 'Small — youngest' },
];

// Maternal uncles (Gu 舅): 4 in this family
const GU_SEQUENCE: RankStep[] = [
  { characters: '大舅', romanization: 'Tua-Gu', label: 'Big — eldest' },
  { characters: '二舅', romanization: 'Zi-Gu',  label: '2nd' },
  { characters: '三舅', romanization: 'Sa-Gu',  label: '3rd' },
  { characters: '細舅', romanization: 'Soi-Gu', label: 'Small — youngest' },
];

// ── Canonical Teochew term table ──────────────────────────────────────────────
// Sources: The Teochew Store "How to Address Your Relatives in Teochew"
// and learnteochew.com Terms of Address reference.
export const TERM_TABLE: Record<string, TeochewTerm> = {

  // ── Parents ──────────────────────────────────────────────────────────────
  father: { characters: '爸', romanization: 'Ba',  pronunciation: 'Bah', breakdown: 'Your father', guaranteed: true },
  mother: { characters: '媽', romanization: 'Ma',  pronunciation: 'Mah', breakdown: 'Your mother', guaranteed: true },

  // ── Grandparents ─────────────────────────────────────────────────────────
  'paternal-grandfather': { characters: '亞公', romanization: 'A-gong', pronunciation: 'Ah-gong', breakdown: "Father's father", side: 'paternal', guaranteed: true },
  'paternal-grandmother': { characters: '亞嫲', romanization: 'A-ma',   pronunciation: 'Ah-mah',  breakdown: "Father's mother", side: 'paternal', guaranteed: true },
  'maternal-grandfather': {
    characters: '亞公', romanization: 'A-gong', pronunciation: 'Ah-gong',
    breakdown: "Mother's father", side: 'maternal', guaranteed: true,
    note: 'May also use Gua-gong 外公 to distinguish from paternal grandfather',
  },
  'maternal-grandmother': {
    characters: '亞嫲', romanization: 'A-ma', pronunciation: 'Ah-mah',
    breakdown: "Mother's mother", side: 'maternal', guaranteed: true,
    note: 'May also use Gua-ma 外嫲 to distinguish from paternal grandmother',
  },

  // ── Paternal uncles & aunts ───────────────────────────────────────────────
  'paternal-uncle-older':       { characters: '伯',  romanization: 'Be',     pronunciation: 'Beh',  breakdown: "Father's older brother",          side: 'paternal', guaranteed: true, note: 'Prefix A- in casual address: A-be' },
  'paternal-uncle-older-wife':  { characters: '姆',  romanization: 'M',      pronunciation: 'Em',   breakdown: "Wife of father's older brother",   side: 'paternal', guaranteed: true },
  'paternal-uncle-younger':     { characters: '叔',  romanization: 'Zeg',    pronunciation: 'Tsek', breakdown: "Father's younger brother",          side: 'paternal', guaranteed: true, note: 'Prefix A- in casual address: A-zeg' },
  'paternal-uncle-younger-wife':{ characters: '嬸',  romanization: 'Sim',    pronunciation: 'Sim',  breakdown: "Wife of father's younger brother", side: 'paternal', guaranteed: true },
  'paternal-aunt':              { characters: '姑',  romanization: 'Gou',    pronunciation: 'Goh',  breakdown: "Father's sister",                  side: 'paternal', guaranteed: true, note: 'Prefix A- in casual address: A-gou' },
  'paternal-aunt-husband':      { characters: '丈',  romanization: 'Die[n]', pronunciation: 'Deen', breakdown: "Husband of father's sister",       side: 'paternal', guaranteed: true },

  // ── Maternal uncles — ranked within the 舅 Gu group ──────────────────────
  // Birth order in this family: uncle-gu-older → uncle-gu → uncle-gu-2 → uncle-gu-3
  // Rank rule: eldest = Tua 大, middle = number, youngest = Soi 細
  // (Gu 舅 does NOT split by age relative to mother — only by rank within the Gu set)
  'maternal-uncle-big': {
    characters: '大舅', romanization: 'Tua-Gu', pronunciation: 'Twa-Goo',
    breakdown: "Mother's eldest brother — Big Uncle",
    side: 'maternal', guaranteed: true,
    rankLabel: '1st of 4 maternal uncles',
    rankSequence: GU_SEQUENCE.map((s, i) => ({ ...s, isCurrent: i === 0 })),
    note: 'Tua 大 (big/eldest) + Gu 舅. Applied to the oldest uncle when the sibling set is known.',
  },
  'maternal-uncle-2': {
    characters: '二舅', romanization: 'Zi-Gu', pronunciation: 'Tsee-Goo',
    breakdown: "Mother's 2nd brother — Second Uncle",
    side: 'maternal', guaranteed: true,
    rankLabel: '2nd of 4 maternal uncles',
    rankSequence: GU_SEQUENCE.map((s, i) => ({ ...s, isCurrent: i === 1 })),
    note: 'Zi 二 (second) + Gu 舅. From your cousins\' perspective, your mother is 二姨 Zi-Yi (Second Aunt).',
  },
  'maternal-uncle-3': {
    characters: '三舅', romanization: 'Sa-Gu', pronunciation: 'Sah-Goo',
    breakdown: "Mother's 3rd brother — Third Uncle",
    side: 'maternal', guaranteed: true,
    rankLabel: '3rd of 4 maternal uncles',
    rankSequence: GU_SEQUENCE.map((s, i) => ({ ...s, isCurrent: i === 2 })),
    note: 'Sa 三 (third) + Gu 舅.',
  },
  'maternal-uncle-small': {
    characters: '細舅', romanization: 'Soi-Gu', pronunciation: 'Soy-Goo',
    breakdown: "Mother's youngest brother — Small Uncle",
    side: 'maternal', guaranteed: true,
    rankLabel: '4th of 4 maternal uncles (youngest)',
    rankSequence: GU_SEQUENCE.map((s, i) => ({ ...s, isCurrent: i === 3 })),
    note: 'Soi 細 (small/youngest) + Gu 舅. The youngest always gets Soi, regardless of the number.',
  },
  'maternal-uncle-wife': { characters: '妗', romanization: 'Gim', pronunciation: 'Gim', breakdown: "Wife of mother's brother", side: 'maternal', guaranteed: true },

  // ── Maternal aunts — ranked within the 姨 Yi group ───────────────────────
  // Birth order: aunt-yi-older → Ma → aunt-yi
  // (Ma is 二姨 Zi-Yi from cousins' perspective; from Mei's she is just 媽)
  'maternal-aunt-big': {
    characters: '大姨', romanization: 'Tua-Yi', pronunciation: 'Twa-Yee',
    breakdown: "Mother's eldest sister — Big Aunt",
    side: 'maternal', guaranteed: true,
    rankLabel: '1st of 2 maternal aunts (not counting your mother)',
    rankSequence: YI_SEQUENCE.map((s, i) => ({ ...s, isCurrent: i === 0 })),
    note: 'Tua 大 (big/eldest) + Yi 姨. Your mother is the middle Yi (2nd); cousins call her 二姨 Zi-Yi.',
  },
  'maternal-aunt-small': {
    characters: '細姨', romanization: 'Soi-Yi', pronunciation: 'Soy-Yee',
    breakdown: "Mother's youngest sister — Small Aunt",
    side: 'maternal', guaranteed: true,
    rankLabel: '2nd of 2 maternal aunts (youngest)',
    rankSequence: YI_SEQUENCE.map((s, i) => ({ ...s, isCurrent: i === 1 })),
    note: 'Soi 細 (small/youngest) + Yi 姨. With only 2 aunts, the 2nd is automatically the smallest.',
  },
  'maternal-aunt-husband': { characters: '丈', romanization: 'Die[n]', pronunciation: 'Deen', breakdown: "Husband of mother's sister", side: 'maternal', guaranteed: true },

  // ── Grandparents' siblings (Lau- 老 = one generation above) ─────────────
  'maternal-great-aunt': {
    characters: '老姨', romanization: 'Lau-yi', pronunciation: 'Lao-yee',
    breakdown: "Mother's mother's sister",
    side: 'maternal', guaranteed: true,
    note: 'Lau- 老 (grand) applied to Yi 姨, stepping one generation up.',
  },
  'maternal-great-aunt-husband': {
    characters: '老丈', romanization: 'Lau-die[n]', pronunciation: 'Lao-deen',
    breakdown: "Husband of mother's mother's sister",
    side: 'maternal', guaranteed: true,
  },

  // ── Siblings ─────────────────────────────────────────────────────────────
  'older-brother':  { characters: '兄', romanization: 'Hia[n]', pronunciation: 'Hian', breakdown: 'Your older brother',  side: 'self', guaranteed: true },
  'younger-brother':{ characters: '弟', romanization: 'Di',     pronunciation: 'Dee',  breakdown: 'Your younger brother', side: 'self', guaranteed: true, addressByName: true, note: 'Junior relatives may also be addressed by first name' },
  'older-sister':   { characters: '姊', romanization: 'Ze',     pronunciation: 'Tse',  breakdown: 'Your older sister',   side: 'self', guaranteed: true },
  'younger-sister': { characters: '妹', romanization: 'Mue',    pronunciation: 'Mweh', breakdown: 'Your younger sister',  side: 'self', guaranteed: true, addressByName: true, note: 'Junior relatives may also be addressed by first name' },

  // ── Cousins (addressed as siblings in Teochew) ───────────────────────────
  'cousin-older-male':    { characters: '兄', romanization: 'Hia[n]', pronunciation: 'Hian', breakdown: 'Older male cousin — addressed as elder brother',    guaranteed: true, descriptiveLabel: '表兄 Bieu-hia[n]', note: 'In Teochew, cousins are addressed exactly as siblings. 表/堂 is descriptive only.' },
  'cousin-younger-male':  { characters: '弟', romanization: 'Di',     pronunciation: 'Dee',  breakdown: 'Younger male cousin — addressed as younger brother', guaranteed: true, descriptiveLabel: '表弟 Bieu-di', addressByName: true },
  'cousin-older-female':  { characters: '姊', romanization: 'Ze',     pronunciation: 'Tse',  breakdown: 'Older female cousin — addressed as elder sister',     guaranteed: true, descriptiveLabel: '表姊 Bieu-ze' },
  'cousin-younger-female':{ characters: '妹', romanization: 'Mue',    pronunciation: 'Mweh', breakdown: 'Younger female cousin — addressed as younger sister',  guaranteed: true, descriptiveLabel: '表妹 Bieu-mue', addressByName: true },

  // ── Grandchildren / nephews / nieces ─────────────────────────────────────
  'grandchild': {
    characters: '孫', romanization: 'Sung', pronunciation: 'Soong',
    breakdown: 'Grandchild (also used broadly for nephew/niece)',
    guaranteed: true, addressByName: true,
    note: 'Nephews, nieces, and grandchildren broadly collapse to Sung in Teochew address',
  },

  // ── Addressed by name ─────────────────────────────────────────────────────
  'address-by-name': {
    characters: '—', romanization: '(name)', pronunciation: '—',
    breakdown: 'Addressed by first name', guaranteed: true, addressByName: true,
    note: 'Anyone junior in both age and generation is addressed by first name. Exception: a young uncle or aunt (senior in generation even if young in years) still uses the title.',
  },
};

// ── Person → role mapping ─────────────────────────────────────────────────────
export const PERSON_ROLES: Record<string, string> = {
  'ba':              'father',
  'ma':              'mother',
  'pa-gong':         'paternal-grandfather',
  'pa-ma':           'paternal-grandmother',
  'ma-gong':         'maternal-grandfather',
  'ma-ma':           'maternal-grandmother',
  'uncle-be':        'paternal-uncle-older',
  'aunt-m':          'paternal-uncle-older-wife',
  'uncle-zeg':       'paternal-uncle-younger',
  'aunt-sim':        'paternal-uncle-younger-wife',
  'aunt-gou':        'paternal-aunt',
  // Ranked maternal uncles — 4 brothers, oldest to youngest
  'uncle-gu-older':  'maternal-uncle-big',    // 大舅 Tua-Gu  (older than Ma)
  'uncle-gu':        'maternal-uncle-2',      // 二舅 Zi-Gu   (1st younger)
  'uncle-gu-2':      'maternal-uncle-3',      // 三舅 Sa-Gu   (2nd younger)
  'uncle-gu-3':      'maternal-uncle-small',  // 細舅 Soi-Gu  (youngest)
  // Ranked maternal aunts — 2 sisters (Ma is the middle, not in this list)
  'aunt-yi-older':   'maternal-aunt-big',     // 大姨 Tua-Yi  (older than Ma)
  'aunt-yi':         'maternal-aunt-small',   // 細姨 Soi-Yi  (younger than Ma, youngest)
  'bro-older':       'older-brother',
  'sis-younger':     'younger-sister',
  'cousin-alvin':    'cousin-younger-male',
  'gm-sis':          'maternal-great-aunt',
  'gm-sis-h':        'maternal-great-aunt-husband',
  // gm-child1, gm-child2, gm-gc1, gm-gc2 — outside guaranteed boundary
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export function resolveTerm(personId: string, overrides: Record<string, TermOverride>): TeochewTerm | null {
  if (overrides[personId]) {
    const ov = overrides[personId];
    return { characters: ov.characters, romanization: ov.romanization, pronunciation: ov.pronunciation ?? '', breakdown: 'User-confirmed term', guaranteed: true };
  }
  const role = PERSON_ROLES[personId];
  if (!role) return null;
  return TERM_TABLE[role] ?? null;
}

export function lineageColor(personId: string): string {
  const role = PERSON_ROLES[personId] ?? '';
  if (
    role.startsWith('paternal') ||
    ['ba','pa-gong','pa-ma','uncle-be','uncle-zeg','aunt-gou','aunt-m','aunt-sim'].includes(personId)
  ) return '#BF5A35';
  if (
    role.startsWith('maternal') ||
    ['ma','ma-gong','ma-ma','uncle-gu','uncle-gu-2','uncle-gu-3','uncle-gu-older',
     'aunt-yi','aunt-yi-older','cousin-alvin','gm-sis','gm-sis-h',
     'gm-child1','gm-child2','gm-gc1','gm-gc2'].includes(personId)
  ) return '#4A7B6B';
  return '#C8A45A';
}

export function describeRelationship(personId: string): string {
  const role = PERSON_ROLES[personId];
  const descriptions: Record<string, string> = {
    father: 'Your father',
    mother: 'Your mother',
    'paternal-grandfather': "Your father's father",
    'paternal-grandmother': "Your father's mother",
    'maternal-grandfather': "Your mother's father",
    'maternal-grandmother': "Your mother's mother",
    'paternal-uncle-older':       "Your father's older brother",
    'paternal-uncle-older-wife':  "Wife of your father's older brother",
    'paternal-uncle-younger':     "Your father's younger brother",
    'paternal-uncle-younger-wife':"Wife of your father's younger brother",
    'paternal-aunt':              "Your father's sister",
    'maternal-uncle-big':    "Your mother's eldest brother — Big Uncle",
    'maternal-uncle-2':      "Your mother's 2nd brother — Second Uncle",
    'maternal-uncle-3':      "Your mother's 3rd brother — Third Uncle",
    'maternal-uncle-small':  "Your mother's youngest brother — Small Uncle",
    'maternal-uncle-wife':   "Wife of your mother's brother",
    'maternal-aunt-big':     "Your mother's eldest sister — Big Aunt",
    'maternal-aunt-small':   "Your mother's youngest sister — Small Aunt",
    'maternal-aunt-husband': "Husband of your mother's sister",
    'maternal-great-aunt':          "Your mother's mother's sister",
    'maternal-great-aunt-husband':  "Husband of your mother's mother's sister",
    'older-brother': 'Your older brother',
    'younger-brother': 'Your younger brother',
    'older-sister': 'Your older sister',
    'younger-sister': 'Your younger sister',
    'cousin-younger-male': "Your mother's brother's son",
  };
  if (role && descriptions[role]) return descriptions[role];
  const extended: Record<string, string> = {
    'gm-child1': "Your grandmother's sister's daughter",
    'gm-child2': "Your grandmother's sister's son",
    'gm-gc1':    "Your grandmother's sister's granddaughter",
    'gm-gc2':    "Your grandmother's sister's grandson",
  };
  return extended[personId] ?? 'Relative';
}
