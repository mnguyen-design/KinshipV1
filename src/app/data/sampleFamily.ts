import type { FamilyState } from './types';

// Demo family for Mei — full extended maternal side.
// Mom's siblings (birth order left→right):
//   aunt-yi-older (older sister) | uncle-gu-older (older brother) | Ma | uncle-gu | uncle-gu-2 | uncle-gu-3
export const SAMPLE_FAMILY: FamilyState = {
  egoId: 'mei',
  hasCompletedOnboarding: true,
  language: 'teochew',
  termOverrides: {},
  people: [
    // ── Ego ───────────────────────────────────────────────────────────────
    { id: 'mei', name: 'Mei', gender: 'female', isEgo: true },

    // ── Ego's siblings (gen 0) ────────────────────────────────────────────
    { id: 'bro-older',   name: 'Ming',  gender: 'male',   birthOrder: 1 },
    { id: 'sis-younger', name: 'Lin',   gender: 'female',  birthOrder: 3 },

    // ── Maternal cousins (gen 0) ──────────────────────────────────────────
    { id: 'cousin-alvin', name: 'Alvin', gender: 'male' },

    // ── Great-aunt's grandchildren (gen 0) ───────────────────────────────
    { id: 'gm-gc1', name: 'Sophie', gender: 'female' },
    { id: 'gm-gc2', name: 'Marcus', gender: 'male'   },

    // ── Parents (gen +1) ─────────────────────────────────────────────────
    { id: 'ba', name: 'Ba', nickname: 'Ah-Teck', gender: 'male'   },
    { id: 'ma', name: 'Ma', nickname: 'Ah-Luan', gender: 'female' },

    // ── Father's siblings (gen +1) ───────────────────────────────────────
    { id: 'uncle-be',  name: 'Gek-Ang', gender: 'male',   birthOrder: 1 },
    { id: 'aunt-m',    name: 'Ah-Mui',  gender: 'female'               },  // wife of uncle-be
    { id: 'uncle-zeg', name: 'Ah-Huat', gender: 'male',   birthOrder: 3 },
    { id: 'aunt-sim',  name: 'Ah-Kim',  gender: 'female'               },  // wife of uncle-zeg
    { id: 'aunt-gou',  name: 'Ah-Lian', gender: 'female', birthOrder: 4 },

    // ── Mother's siblings (gen +1) ───────────────────────────────────────
    // Birth order: aunt-yi-older, uncle-gu-older, Ma, uncle-gu, uncle-gu-2, uncle-gu-3
    { id: 'aunt-yi-older',  name: 'Siew-Lan', gender: 'female', birthOrder: 1 }, // older sister of Ma
    { id: 'uncle-gu-older', name: 'Ah-Cheng', gender: 'male',   birthOrder: 2 }, // older brother of Ma
    { id: 'uncle-gu',       name: 'Ah-Kuan',  gender: 'male',   birthOrder: 4 }, // 1st younger
    { id: 'uncle-gu-2',     name: 'Ah-Boon',  gender: 'male',   birthOrder: 5 }, // 2nd younger
    { id: 'uncle-gu-3',     name: 'Ah-Seng',  gender: 'male',   birthOrder: 6 }, // 3rd younger
    { id: 'aunt-yi',        name: 'Ah-Eng',   gender: 'female', birthOrder: 7 }, // younger sister

    // ── Great-aunt's children (gen +1) ───────────────────────────────────
    { id: 'gm-child1', name: 'Betty',   gender: 'female' },
    { id: 'gm-child2', name: 'Raymond', gender: 'male'   },

    // ── Paternal grandparents (gen +2) ───────────────────────────────────
    { id: 'pa-gong', name: 'A-gong', nickname: 'Gek-Seng', gender: 'male'   },
    { id: 'pa-ma',   name: 'A-ma',   nickname: 'Ah-Choo',  gender: 'female' },

    // ── Maternal grandparents (gen +2) ───────────────────────────────────
    { id: 'ma-gong', name: 'A-gong', nickname: 'Ah-Koh',   gender: 'male'   },
    { id: 'ma-ma',   name: 'A-ma',   nickname: 'Siew-Nah', gender: 'female' },

    // ── Maternal grandmother's sister + husband (gen +2) ─────────────────
    { id: 'gm-sis',   name: 'Siew-Gek', gender: 'female' },
    { id: 'gm-sis-h', name: 'Ah-Loh',   gender: 'male'   },
  ],
  edges: [
    // ── Paternal grandparents ──────────────────────────────────────────
    { id: 'e-pagong-pama',  type: 'spouse', fromId: 'pa-gong', toId: 'pa-ma'     },
    { id: 'e-pagong-ba',    type: 'parent', fromId: 'pa-gong', toId: 'ba'         },
    { id: 'e-pama-ba',      type: 'parent', fromId: 'pa-ma',   toId: 'ba'         },
    { id: 'e-pagong-ube',   type: 'parent', fromId: 'pa-gong', toId: 'uncle-be'   },
    { id: 'e-pama-ube',     type: 'parent', fromId: 'pa-ma',   toId: 'uncle-be'   },
    { id: 'e-pagong-uzeg',  type: 'parent', fromId: 'pa-gong', toId: 'uncle-zeg'  },
    { id: 'e-pama-uzeg',    type: 'parent', fromId: 'pa-ma',   toId: 'uncle-zeg'  },
    { id: 'e-pagong-agou',  type: 'parent', fromId: 'pa-gong', toId: 'aunt-gou'   },
    { id: 'e-pama-agou',    type: 'parent', fromId: 'pa-ma',   toId: 'aunt-gou'   },

    // ── Paternal uncle marriages ───────────────────────────────────────
    { id: 'e-ube-am',    type: 'spouse', fromId: 'uncle-be',  toId: 'aunt-m'   },
    { id: 'e-uzeg-asim', type: 'spouse', fromId: 'uncle-zeg', toId: 'aunt-sim' },

    // ── Maternal grandparents ──────────────────────────────────────────
    { id: 'e-magong-mama',   type: 'spouse', fromId: 'ma-gong', toId: 'ma-ma'         },
    { id: 'e-magong-ma',     type: 'parent', fromId: 'ma-gong', toId: 'ma'             },
    { id: 'e-mama-ma',       type: 'parent', fromId: 'ma-ma',   toId: 'ma'             },
    { id: 'e-magong-ayio',   type: 'parent', fromId: 'ma-gong', toId: 'aunt-yi-older'  },
    { id: 'e-mama-ayio',     type: 'parent', fromId: 'ma-ma',   toId: 'aunt-yi-older'  },
    { id: 'e-magong-uguo',   type: 'parent', fromId: 'ma-gong', toId: 'uncle-gu-older' },
    { id: 'e-mama-uguo',     type: 'parent', fromId: 'ma-ma',   toId: 'uncle-gu-older' },
    { id: 'e-magong-ugu',    type: 'parent', fromId: 'ma-gong', toId: 'uncle-gu'       },
    { id: 'e-mama-ugu',      type: 'parent', fromId: 'ma-ma',   toId: 'uncle-gu'       },
    { id: 'e-magong-ugu2',   type: 'parent', fromId: 'ma-gong', toId: 'uncle-gu-2'     },
    { id: 'e-mama-ugu2',     type: 'parent', fromId: 'ma-ma',   toId: 'uncle-gu-2'     },
    { id: 'e-magong-ugu3',   type: 'parent', fromId: 'ma-gong', toId: 'uncle-gu-3'     },
    { id: 'e-mama-ugu3',     type: 'parent', fromId: 'ma-ma',   toId: 'uncle-gu-3'     },
    { id: 'e-magong-ayi',    type: 'parent', fromId: 'ma-gong', toId: 'aunt-yi'        },
    { id: 'e-mama-ayi',      type: 'parent', fromId: 'ma-ma',   toId: 'aunt-yi'        },

    // ── Maternal grandmother's sister ──────────────────────────────────
    { id: 'e-magong-gmsis',  type: 'parent', fromId: 'ma-gong',  toId: 'gm-sis'    },
    { id: 'e-mama-gmsis',    type: 'parent', fromId: 'ma-ma',    toId: 'gm-sis'    },
    { id: 'e-gmsis-gmsh',    type: 'spouse', fromId: 'gm-sis',   toId: 'gm-sis-h'  },
    { id: 'e-gmsis-gmc1',    type: 'parent', fromId: 'gm-sis',   toId: 'gm-child1' },
    { id: 'e-gmsh-gmc1',     type: 'parent', fromId: 'gm-sis-h', toId: 'gm-child1' },
    { id: 'e-gmsis-gmc2',    type: 'parent', fromId: 'gm-sis',   toId: 'gm-child2' },
    { id: 'e-gmsh-gmc2',     type: 'parent', fromId: 'gm-sis-h', toId: 'gm-child2' },
    { id: 'e-gmc1-gc1',      type: 'parent', fromId: 'gm-child1',toId: 'gm-gc1'    },
    { id: 'e-gmc1-gc2',      type: 'parent', fromId: 'gm-child1',toId: 'gm-gc2'    },

    // ── Parents → Mei and siblings ─────────────────────────────────────
    { id: 'e-ba-ma',   type: 'spouse', fromId: 'ba', toId: 'ma'         },
    { id: 'e-ba-mei',  type: 'parent', fromId: 'ba', toId: 'mei'        },
    { id: 'e-ma-mei',  type: 'parent', fromId: 'ma', toId: 'mei'        },
    { id: 'e-ba-bro',  type: 'parent', fromId: 'ba', toId: 'bro-older'  },
    { id: 'e-ma-bro',  type: 'parent', fromId: 'ma', toId: 'bro-older'  },
    { id: 'e-ba-sis',  type: 'parent', fromId: 'ba', toId: 'sis-younger'},
    { id: 'e-ma-sis',  type: 'parent', fromId: 'ma', toId: 'sis-younger'},

    // ── Uncle-gu → cousin-alvin ────────────────────────────────────────
    { id: 'e-ugu-alvin', type: 'parent', fromId: 'uncle-gu', toId: 'cousin-alvin' },
  ],
};

export const DEMO_PEOPLE_COUNT = SAMPLE_FAMILY.people.length;
