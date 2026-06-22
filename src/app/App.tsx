/* MARKER-MAKE-KIT-INVOKED */
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { FamilyProvider, useFamilyStore } from './store/familyStore';
import { DesktopNav } from './components/DesktopNav';
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { TreeView } from './components/TreeView';
import { AskScreen } from './components/AskScreen';
import { BloomScreen } from './components/BloomScreen';

function AppShell() {
  const { state } = useFamilyStore();

  if (!state.hasCompletedOnboarding) {
    return (
      <Routes>
        <Route path="/"        element={<WelcomeScreen />} />
        <Route path="/onboard" element={<OnboardingFlow />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DesktopNav />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/tree"  element={<TreeView />} />
          <Route path="/ask"   element={<AskScreen />} />
          <Route path="/bloom" element={<BloomScreen />} />
          <Route path="*"      element={<Navigate to="/tree" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <FamilyProvider>
        <div
          style={{
            width: '100vw',
            height: '100vh',
            background: '#F4EDE0',
            fontFamily: "'DM Sans', sans-serif",
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AppShell />
        </div>
      </FamilyProvider>
    </HashRouter>
  );
}
