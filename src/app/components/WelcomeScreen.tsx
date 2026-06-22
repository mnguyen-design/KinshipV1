import { useNavigate } from 'react-router';
import { useFamilyStore } from '../store/familyStore';
import { TERM_TABLE } from '../data/teochewTerms';

const TERM_SHOWCASE = [
  { char: '伯', rom: 'Be', eng: "Father's older brother" },
  { char: '叔', rom: 'Zeg', eng: "Father's younger brother" },
  { char: '姑', rom: 'Gou', eng: "Father's sister" },
  { char: '舅', rom: 'Gu', eng: "Mother's brother" },
  { char: '姨', rom: 'Yi', eng: "Mother's sister" },
  { char: '姆', rom: 'M', eng: "Wife of father's older brother" },
  { char: '嬸', rom: 'Sim', eng: "Wife of father's younger brother" },
  { char: '妗', rom: 'Gim', eng: "Wife of mother's brother" },
  { char: '亞公', rom: 'A-gong', eng: 'Grandfather' },
  { char: '亞嫲', rom: 'A-ma', eng: 'Grandmother' },
  { char: '兄', rom: 'Hia[n]', eng: 'Older brother' },
  { char: '姊', rom: 'Ze', eng: 'Older sister' },
];

export function WelcomeScreen() {
  const navigate   = useNavigate();
  const { loadDemo } = useFamilyStore();

  return (
    <div
      style={{
        width: '100vw', height: '100vh', display: 'flex',
        background: '#F4EDE0', fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* ── Left column — branding + CTA ── */}
      <div
        style={{
          width: '44%', minWidth: '420px', padding: '64px 60px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          borderRight: '1px solid rgba(42,31,20,0.10)',
        }}
      >
        {/* Badge */}
        <div style={{ fontSize: '11px', color: '#BF5A35', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '28px', fontWeight: 500 }}>
          v1 · Teochew Families · Figma Config Makeathon
        </div>

        {/* Logotype */}
        <div style={{ marginBottom: '10px' }}>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: '64px', fontWeight: 600, color: '#2A1F14', lineHeight: 1, letterSpacing: '-0.02em', margin: 0 }}>
            Kinship
          </h1>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '36px', color: '#A89880', letterSpacing: '0.12em', marginTop: '4px' }}>
            親情
          </div>
        </div>

        {/* Tagline */}
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '26px', fontWeight: 400, color: '#2A1F14', lineHeight: 1.4, margin: '28px 0 20px', maxWidth: '380px' }}>
          Know what to call everyone at the table.
        </h2>

        {/* Body */}
        <p style={{ fontSize: '15px', color: '#8A7A68', lineHeight: 1.7, maxWidth: '380px', marginBottom: '40px' }}>
          In Teochew families, every relative has a precise term — determined by which side they're on, their generation, and whether they're older or younger than the linking parent. Kinship keeps it straight, so you never freeze at a wedding again.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '340px' }}>
          <button
            onClick={() => { loadDemo(); navigate('/tree'); }}
            style={{
              padding: '16px 28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              background: '#BF5A35', color: '#FDF8F0',
              fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 500,
              boxShadow: '0 4px 20px rgba(191,90,53,0.30)', textAlign: 'left',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span>Explore Mei's family tree</span>
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '22px', opacity: 0.85 }}>家 →</span>
          </button>

          <button
            onClick={() => navigate('/onboard')}
            style={{
              padding: '14px 28px', borderRadius: '14px', cursor: 'pointer',
              background: 'transparent', color: '#2A1F14',
              fontFamily: "'DM Sans', sans-serif", fontSize: '15px',
              border: '1px solid rgba(42,31,20,0.18)', textAlign: 'left',
            }}
          >
            Build my own family tree
          </button>
        </div>

        {/* Attribution */}
        <p style={{ fontSize: '11px', color: '#C4B9AA', marginTop: '40px', lineHeight: 1.6 }}>
          Terms sourced from The Teochew Store & learnteochew.com.<br />
          Guaranteed-correct within the v1 boundary. AI parses intent; rules produce the term.
        </p>
      </div>

      {/* ── Right column — term showcase grid ── */}
      <div
        style={{
          flex: 1, padding: '64px 60px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div style={{ fontSize: '11px', color: '#A89880', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: '24px' }}>
          Teochew kinship terms — a sample
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}
        >
          {TERM_SHOWCASE.map((t, i) => (
            <div
              key={i}
              style={{
                background: '#EDE4D2',
                borderRadius: '16px',
                padding: '20px 16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                border: '1px solid rgba(42,31,20,0.08)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {/* Character — hero */}
              <div
                style={{
                  fontFamily: "'Noto Serif SC', 'Songti SC', serif",
                  fontSize: t.char.length > 1 ? '36px' : '48px',
                  color: '#2A1F14',
                  lineHeight: 1,
                  marginBottom: '10px',
                }}
              >
                {t.char}
              </div>
              {/* Romanization */}
              <div style={{ fontFamily: "'Lora', serif", fontSize: '15px', color: '#BF5A35', fontWeight: 500, marginBottom: '4px' }}>
                {t.rom}
              </div>
              {/* English */}
              <div style={{ fontSize: '11px', color: '#8A7A68', textAlign: 'center', lineHeight: 1.4 }}>
                {t.eng}
              </div>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div
          style={{
            marginTop: '24px', padding: '16px 20px', borderRadius: '12px',
            background: 'rgba(191,90,53,0.06)', border: '1px solid rgba(191,90,53,0.15)',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}
        >
          <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '28px', color: '#BF5A35', flexShrink: 0, lineHeight: 1 }}>伯</span>
          <div>
            <p style={{ fontSize: '13px', color: '#2A1F14', fontWeight: 500, marginBottom: '4px' }}>
              The same uncle, two different words.
            </p>
            <p style={{ fontSize: '13px', color: '#8A7A68', lineHeight: 1.6, margin: 0 }}>
              Your father's <em>older</em> brother is 伯 Be. His <em>younger</em> brother is 叔 Zeg.
              Your mother's brother is 舅 Gu — and that term doesn't split by age at all.
              Kinship knows all the distinctions so you don't have to memorise them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
