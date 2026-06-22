import { useLocation, useNavigate } from 'react-router';
import { Home, MessageCircle, Sparkles, Plus } from 'lucide-react';

const tabs = [
  { path: '/tree', label: '家', sublabel: 'My Family', icon: Home },
  { path: '/ask', label: '問', sublabel: 'Ask', icon: MessageCircle },
  { path: '/add', label: '添', sublabel: 'Add', icon: Plus },
  { path: '/bloom', label: '花', sublabel: 'Bloom', icon: Sparkles },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="flex items-stretch"
      style={{
        background: '#EDE4D2',
        borderTop: '1px solid rgba(42,31,20,0.10)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        minHeight: '72px',
      }}
    >
      {tabs.map(tab => {
        const active = location.pathname === tab.path || (tab.path === '/ask' && location.pathname.startsWith('/ask'));
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path === '/add' ? '/tree' : tab.path)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all active:scale-95"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div
              className="flex flex-col items-center gap-0.5"
            >
              {tab.path === '/add' ? (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: active ? '#BF5A35' : 'rgba(191,90,53,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1px',
                  }}
                >
                  <Icon size={18} color={active ? '#FDF8F0' : '#BF5A35'} strokeWidth={2} />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '18px', fontFamily: "'Noto Serif SC', serif", color: active ? '#BF5A35' : '#A89880', lineHeight: 1 }}>
                    {tab.label}
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: "'DM Sans', sans-serif", color: active ? '#BF5A35' : '#A89880', letterSpacing: '0.04em' }}>
                    {tab.sublabel}
                  </div>
                </>
              )}
            </div>
            {active && tab.path !== '/add' && (
              <div style={{ width: '20px', height: '2px', borderRadius: '1px', background: '#BF5A35', marginTop: '1px' }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
