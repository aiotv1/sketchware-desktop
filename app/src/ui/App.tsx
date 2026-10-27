import React, { useEffect, useState } from 'react';
import { loadSettings } from './appstate';
import { Home } from './home/Home';
import { ProjectEditor } from './editor/ProjectEditor';

export function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings()
      .then(() => setReady(true))
      .catch((e) => setError(String(e?.stack ?? e)));
  }, []);

  if (error) return <div className="empty mono" style={{ whiteSpace: 'pre-wrap' }}>{error}</div>;
  if (!ready) return <div className="empty">Loading…</div>;
  if (openId) return <ProjectEditor scId={openId} onClose={() => setOpenId(null)} />;
  return <Home onOpen={setOpenId} />;
}
