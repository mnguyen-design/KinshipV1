import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2 } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';
import { TERM_TABLE, resolveTerm } from '../data/teochewTerms';

function useCountUp(target: number, duration = 1600) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

// All nodes including extended family
const BLOOM_NODES = [
  // Grandparents
  { id: 'pa-gong',     x: -170, y: -105, r: 19, color: '#BF5A35', char: '亞公', label: 'A-gong',   delay: 0.38 },
  { id: 'pa-ma',       x: -120, y: -105, r: 19, color: '#BF5A35', char: '亞嫲', label: 'A-ma',     delay: 0.41 },
  { id: 'ma-gong',     x:   80, y: -105, r: 19, color: '#4A7B6B', char: '亞公', label: 'A-gong',   delay: 0.46 },
  { id: 'ma-ma',       x:  130, y: -105, r: 19, color: '#4A7B6B', char: '亞嫲', label: 'A-ma',     delay: 0.49 },
  // Great-aunt
  { id: 'gm-sis',      x:  265, y: -105, r: 19, color: '#4A7B6B', char: '老姨', label: 'Siew-Gek', delay: 0.55 },
  { id: 'gm-sis-h',    x:  320, y: -105, r: 15, color: '#4A7B6B', char: '老丈', label: 'Ah-Loh',   delay: 0.58 },
  // Parents' generation — wives inline at same y
  // Parents' generation — paternal side
  { id: 'aunt-m',         x: -316, y: -30, r: 15, color: '#BF5A35', char: '姆',  label: 'Ah-Mui',   delay: 0.63 },
  { id: 'uncle-be',       x: -272, y: -30, r: 21, color: '#BF5A35', char: '伯',  label: 'Gek-Ang',  delay: 0.60 },
  { id: 'uncle-zeg',      x: -216, y: -30, r: 21, color: '#BF5A35', char: '叔',  label: 'Ah-Huat',  delay: 0.61 },
  { id: 'aunt-sim',       x: -174, y: -30, r: 15, color: '#BF5A35', char: '嬸',  label: 'Ah-Kim',   delay: 0.64 },
  { id: 'ba',             x: -108, y: -30, r: 25, color: '#BF5A35', char: '爸',  label: 'Ba',       delay: 0.26 },
  { id: 'aunt-gou',       x:  -50, y: -30, r: 21, color: '#BF5A35', char: '姑',  label: 'Ah-Lian',  delay: 0.62 },
  // Maternal side — Ma + 6 ranked siblings
  { id: 'ma',             x:   50, y: -30, r: 25, color: '#4A7B6B', char: '媽',  label: 'Ma',       delay: 0.28 },
  { id: 'aunt-yi-older',  x:  108, y: -30, r: 17, color: '#4A7B6B', char: '大姨', label: 'Siew-Lan', delay: 0.65 },
  { id: 'uncle-gu-older', x:  148, y: -30, r: 17, color: '#4A7B6B', char: '大舅', label: 'Ah-Cheng', delay: 0.66 },
  { id: 'uncle-gu',       x:  190, y: -30, r: 17, color: '#4A7B6B', char: '二舅', label: 'Ah-Kuan',  delay: 0.67 },
  { id: 'uncle-gu-2',     x:  230, y: -30, r: 17, color: '#4A7B6B', char: '三舅', label: 'Ah-Boon',  delay: 0.68 },
  { id: 'uncle-gu-3',     x:  270, y: -30, r: 17, color: '#4A7B6B', char: '細舅', label: 'Ah-Seng',  delay: 0.69 },
  { id: 'aunt-yi',        x:  310, y: -30, r: 17, color: '#4A7B6B', char: '細姨', label: 'Ah-Eng',   delay: 0.70 },
  // Great-aunt's children
  { id: 'gm-child1',      x:  408, y: -30, r: 21, color: '#4A7B6B', char: '?',   label: 'Betty',    delay: 0.72 },
  { id: 'gm-child2',      x:  465, y: -30, r: 21, color: '#4A7B6B', char: '?',   label: 'Raymond',  delay: 0.74 },
  // Your generation
  { id: 'bro-older',   x:  -95, y:   33, r: 22, color: '#C8A45A', char: '兄',   label: 'Ming',     delay: 0.16 },
  { id: 'mei',         x:    0, y:   33, r: 33, color: '#BF5A35', char: '我',   label: 'Mei',      delay: 0.05 },
  { id: 'sis-younger', x:   95, y:   33, r: 22, color: '#C8A45A', char: '妹',   label: 'Lin',      delay: 0.18 },
  { id: 'cousin-alvin',x:  168, y:   33, r: 17, color: '#4A7B6B', char: '弟',   label: 'Alvin',    delay: 0.76 },
  { id: 'gm-gc1',      x:  255, y:   33, r: 17, color: '#4A7B6B', char: '?',    label: 'Sophie',   delay: 0.80 },
  { id: 'gm-gc2',      x:  310, y:   33, r: 17, color: '#4A7B6B', char: '?',    label: 'Marcus',   delay: 0.82 },
];

const BLOOM_LINES = [
  { x1:-170, y1:-105, x2:-120, y2:-105, color:'#BF5A35', dashed:true,  delay:0.36 },
  { x1:  80, y1:-105, x2: 130, y2:-105, color:'#4A7B6B', dashed:true,  delay:0.42 },
  { x1: 130, y1:-105, x2: 265, y2:-105, color:'#4A7B6B', dashed:false, delay:0.48 },
  { x1: 265, y1:-105, x2: 320, y2:-105, color:'#4A7B6B', dashed:true,  delay:0.52 },
  { x1:-145, y1:-105, x2:-110, y2: -35, color:'#BF5A35', dashed:false, delay:0.30 },
  { x1: 105, y1:-105, x2:  52, y2: -35, color:'#4A7B6B', dashed:false, delay:0.33 },
  { x1:-260, y1: -35, x2: -52, y2: -35, color:'#BF5A35', dashed:false, delay:0.56 },
  { x1:  52, y1: -35, x2: 168, y2: -35, color:'#4A7B6B', dashed:false, delay:0.60 },
  { x1:-110, y1: -35, x2:  52, y2: -35, color:'#A89880', dashed:true,  delay:0.46 },
  { x1:-260, y1: -35, x2:-260, y2:   2, color:'#A89880', dashed:true,  delay:0.65 },
  { x1:-205, y1: -35, x2:-205, y2:   2, color:'#A89880', dashed:true,  delay:0.66 },
  { x1: -72, y1: -35, x2: -72, y2:  -8, color:'#C8A45A', dashed:false, delay:0.13 },
  { x1:  28, y1: -35, x2:  28, y2:  -8, color:'#C8A45A', dashed:false, delay:0.13 },
  { x1: -72, y1:  -8, x2:  28, y2:  -8, color:'#C8A45A', dashed:false, delay:0.14 },
  { x1:   0, y1:  -8, x2:   0, y2:  31, color:'#BF5A35', dashed:false, delay:0.09 },
  { x1: -95, y1:  31, x2:  95, y2:  31, color:'#C8A45A', dashed:false, delay:0.16 },
  { x1: 110, y1: -35, x2: 110, y2:  -8, color:'#4A7B6B', dashed:false, delay:0.70 },
  { x1: 110, y1:  -8, x2: 168, y2:  31, color:'#4A7B6B', dashed:false, delay:0.71 },
  { x1: 293, y1:-105, x2: 270, y2: -35, color:'#4A7B6B', dashed:false, delay:0.68 },
  { x1: 293, y1:-105, x2: 332, y2: -35, color:'#4A7B6B', dashed:false, delay:0.69 },
  { x1: 270, y1: -35, x2: 270, y2: 135, color:'#4A7B6B', dashed:false, delay:0.77 },
  { x1: 270, y1:  70, x2: 332, y2: 135, color:'#4A7B6B', dashed:false, delay:0.79 },
];

const VERIFIED_TERMS = Object.entries(TERM_TABLE)
  .filter(([, t]) => t.guaranteed && !t.addressByName && t.characters !== '—')
  .slice(0, 20);

export function BloomScreen() {
  const { state } = useFamilyStore();
  const [revealed, setRevealed] = useState(false);
  const [showList, setShowList] = useState(false);

  // Bloom count = total people in the family
  const familyCount = state.people.length || 23;
  const displayCount = useCountUp(revealed ? familyCount : 0, 1600);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (revealed) {
      const t = setTimeout(() => setShowList(true), 900);
      return () => clearTimeout(t);
    }
  }, [revealed]);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#F4EDE0' }}>
      {/* ── Left: tree + counter ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 36px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '26px', color: '#2A1F14', fontWeight: 600, margin: '0 0 4px' }}>
              The bloom
            </h2>
            <p style={{ fontSize: '13px', color: '#8A7A68', margin: 0 }}>Your full family, all at once</p>
          </div>
          <button style={{ padding: '7px 14px', borderRadius: '9px', background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#8A7A68' }}>
            <Share2 size={13} /> Export
          </button>
        </div>

        {/* People counter card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            background: '#BF5A35', borderRadius: '18px', padding: '20px 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '20px', boxShadow: '0 6px 28px rgba(191,90,53,0.22)', flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: '60px', fontWeight: 600, color: '#FDF8F0', lineHeight: 1 }}>
              {displayCount}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(253,248,240,0.75)', marginTop: '4px' }}>
              people in your family tree
            </div>
          </div>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '88px', color: 'rgba(253,248,240,0.12)', lineHeight: 1, userSelect: 'none' }}>
            親
          </div>
        </motion.div>

        {/* Bloom SVG */}
        <div style={{ flex: 1, background: '#EDE4D2', borderRadius: '18px', border: '1px solid rgba(42,31,20,0.08)', overflow: 'hidden' }}>
          <svg viewBox="-370 -220 1030 440" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
            {BLOOM_LINES.map((ln, i) => (
              <motion.line key={i}
                x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                stroke={ln.color} strokeWidth={2} strokeLinecap="round"
                strokeDasharray={ln.dashed ? '5 4' : undefined}
                initial={{ opacity: 0 }}
                animate={revealed ? { opacity: 0.52 } : {}}
                transition={{ delay: ln.delay, duration: 0.35 }}
              />
            ))}

            {BLOOM_NODES.map(node => {
              const person = state.people.find(p => p.id === node.id);
              const term = person ? resolveTerm(node.id, state.termOverrides) : null;
              const displayChar = term?.characters ?? node.char;
              const hasPhoto = !!person?.photo;

              return (
                <motion.g key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={revealed ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: node.delay, duration: 0.38, type: 'spring', stiffness: 210 }}
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                >
                  <circle cx={node.x} cy={node.y} r={node.r} fill={node.color} opacity={node.id === 'mei' ? 1 : 0.85} />

                  {hasPhoto && person?.photo ? (
                    <>
                      <defs>
                        <clipPath id={`bclip-${node.id}`}>
                          <circle cx={node.x} cy={node.y} r={node.r} />
                        </clipPath>
                      </defs>
                      <image href={person.photo} x={node.x - node.r} y={node.y - node.r} width={node.r * 2} height={node.r * 2} clipPath={`url(#bclip-${node.id})`} preserveAspectRatio="xMidYMid slice" />
                    </>
                  ) : (
                    <text
                      x={node.x} y={node.y + (node.r > 24 ? 8 : node.r > 16 ? 6 : 5)}
                      textAnchor="middle" fill="white"
                      fontSize={node.r > 26 ? 18 : node.r > 18 ? 14 : node.r > 13 ? 11 : 9}
                      fontFamily="'Noto Serif SC', serif"
                    >
                      {displayChar}
                    </text>
                  )}

                  <text x={node.x} y={node.y + node.r + 14} textAnchor="middle" fill="#8A7A68" fontSize={9} fontFamily="'DM Sans', sans-serif">
                    {node.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── Right: term scroll ── */}
      <div style={{ width: '288px', flexShrink: 0, borderLeft: '1px solid rgba(42,31,20,0.10)', overflowY: 'auto', padding: '28px 22px' }}>
        <div style={{ fontSize: '11px', color: '#A89880', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: '14px' }}>
          Teochew terms
        </div>

        <AnimatePresence>
          {showList && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {VERIFIED_TERMS.map(([key, term], i) => (
                <motion.div key={key}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.035, duration: 0.28 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '11px', background: '#EDE4D2', border: '1px solid rgba(42,31,20,0.07)' }}
                >
                  <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '26px', color: '#2A1F14', minWidth: '34px', textAlign: 'center', lineHeight: 1 }}>
                    {term.characters}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Lora', serif", fontSize: '13px', color: '#BF5A35', fontWeight: 500 }}>{term.romanization}</div>
                    <div style={{ fontSize: '10px', color: '#8A7A68', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{term.breakdown}</div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#A89880', flexShrink: 0, fontStyle: 'italic' }}>{term.pronunciation}</span>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', background: 'rgba(42,31,20,0.04)', border: '1px solid rgba(42,31,20,0.07)' }}>
          <p style={{ fontSize: '11px', color: '#A89880', lineHeight: 1.6, margin: 0 }}>
            Terms from The Teochew Store & learnteochew.com. AI parses intent; a rule table produces the term. The app never asserts a term it can't verify.
          </p>
        </div>
      </div>
    </div>
  );
}
