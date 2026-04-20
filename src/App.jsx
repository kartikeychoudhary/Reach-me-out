import { useEffect, useMemo, useState } from 'react';
import config from '../config.yaml';
import Background from './components/Background.jsx';
import ProfileCard from './components/ProfileCard.jsx';
import LinkList from './components/LinkList.jsx';
import QrSheet from './components/QrSheet.jsx';
import Toast from './components/Toast.jsx';
import Footer from './components/Footer.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { useToast } from './hooks/useToast.js';
import { applyThemeToDocument, setMode } from './utils/theme.js';

const STORAGE_KEY = 'reach-me-out:mode';

function initialMode(configMode) {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  }
  return configMode === 'light' ? 'light' : 'dark';
}

export default function App() {
  const profile = config.profile || {};
  const theme = config.theme || {};
  const links = config.links || [];

  const [mode, setModeState] = useState(() => initialMode(theme.mode));
  const [qrOpen, setQrOpen] = useState(false);
  const { toast, show } = useToast();

  // apply theme tokens once (mode handled separately so toggle is instant)
  useEffect(() => {
    applyThemeToDocument({ ...theme, mode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMode(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [mode]);

  const shareUrl = useMemo(
    () => profile.website || (typeof window !== 'undefined' ? window.location.href : ''),
    [profile.website]
  );

  function toggleMode() {
    setModeState((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  return (
    <>
      <Background />
      <ThemeToggle mode={mode} onToggle={toggleMode} />
      <Toast toast={toast} />
      <QrSheet url={shareUrl} open={qrOpen} onClose={() => setQrOpen(false)} />
      <div className="page">
        <div className="container">
          <ProfileCard
            profile={profile}
            onShareQr={() => setQrOpen(true)}
            onToast={show}
          />
          <LinkList links={links} />
        </div>
        <Footer />
      </div>
    </>
  );
}
