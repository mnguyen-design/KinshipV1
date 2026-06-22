import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChevronDown, Check } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';

const NAV_TABS = [
  { path: '/tree',  char: '家', label: 'My Family' },
  { path: '/ask',   char: '問', label: 'Ask'       },
  { path: '/bloom', char: '花', label: 'Bloom'      },
];

const LANGUAGES = [
  { value: 'teochew',  char: '潮州', label: 'Teochew',           available: true  },
  { value: 'mandarin', char: '普通話', label: 'Mandarin',         available: false },
  { value: 'cantonese',char: '廣東話', label: 'Cantonese',        available: false },
];

export function DesktopNav() {
  const location         = useLocation();
  const navigate         = useNavigate();
  const { state, dispatch } = useFamilyStore();
  const ego              = state.people.find(p => p.isEgo || p.id === state.egoId);

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentLang = LANGUAGES.find(l => l.value === state.language) ?? LANGUAGES[0];

  function selectLang(value: string) {
    dispatch({ type: 'SET_LANGUAGE', payload: value as 'teochew' | 'mandarin' });
    setLangOpen(false);
  }

  return (
    <header
      style={{
        height: '58px',
        background: '#EDE4D2',
        borderBottom: '1px solid rgba(42,31,20,0.10)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: '32px',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Lora', serif", fontSize: '21px', fontWeight: 600, color: '#2A1F14' }}>
          Kinship
        </span>
        <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '15px', color: '#A89880', letterSpacing: '0.1em' }}>
          親情
        </span>
      </div>

      {/* Nav tabs */}
      <nav style={{ display: 'flex', gap: '2px', flex: 1 }}>
        {NAV_TABS.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '6px 14px', borderRadius: '9px', border: 'none',
                background: active ? '#BF5A35' : 'transparent',
                color: active ? '#FDF8F0' : '#8A7A68',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(42,31,20,0.06)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '15px' }}>{tab.char}</span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Language dropdown */}
      <div ref={langRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setLangOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px', borderRadius: '9px',
            border: '1px solid rgba(42,31,20,0.18)',
            background: langOpen ? '#EDE4D2' : 'transparent',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px', color: '#2A1F14',
          }}
        >
          <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '14px', color: '#BF5A35' }}>
            {currentLang.char}
          </span>
          {currentLang.label}
          <ChevronDown size={13} color="#8A7A68" style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {langOpen && (
          <div
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: '#F4EDE0', borderRadius: '12px',
              border: '1px solid rgba(42,31,20,0.12)',
              boxShadow: '0 8px 24px rgba(42,31,20,0.14)',
              minWidth: '180px', overflow: 'hidden', zIndex: 100,
            }}
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.value}
                onClick={() => lang.available && selectLang(lang.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'none', border: 'none',
                  borderBottom: '1px solid rgba(42,31,20,0.06)',
                  cursor: lang.available ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  opacity: lang.available ? 1 : 0.45,
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (lang.available) e.currentTarget.style.background = '#EDE4D2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '16px', color: '#BF5A35', minWidth: '32px' }}>
                  {lang.char}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#2A1F14', fontFamily: "'DM Sans', sans-serif" }}>{lang.label}</div>
                  {!lang.available && (
                    <div style={{ fontSize: '10px', color: '#A89880' }}>Coming in v2</div>
                  )}
                </div>
                {state.language === lang.value && lang.available && (
                  <Check size={13} color="#BF5A35" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ego chip */}
      {ego && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: ego.photo ? 'transparent' : '#BF5A35',
            border: '2px solid #BF5A35',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {ego.photo
              ? <img src={ego.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={ego.name} />
              : <span style={{ color: '#FDF8F0', fontSize: '12px' }}>{(ego.nickname ?? ego.name).charAt(0)}</span>
            }
          </div>
          <span style={{ fontSize: '13px', color: '#2A1F14' }}>{ego.nickname ?? ego.name}</span>
        </div>
      )}
    </header>
  );
}
