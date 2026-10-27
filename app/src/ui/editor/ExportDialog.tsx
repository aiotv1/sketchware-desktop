import React, { useState } from 'react';
import { Modal, toast } from '../common/dialogs';
import { ProjectStore } from './store';
import { host, baseName } from '../../core/host';
import { ensureGeneratorReady, exportAndroidStudio } from '../../codegen/generator';
import { buildApk } from '../../codegen/apkbuild';

export function ExportDialog(props: { store: ProjectStore; onClose: () => void }) {
  const { store } = props;
  const p = store.project;
  const [busy, setBusy] = useState('');
  const [log, setLog] = useState('');
  const [result, setResult] = useState<{ path: string; folder?: boolean } | null>(null);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setLog('');
    setResult(null);
    try {
      await store.save();
      await fn();
    } catch (e: any) {
      setLog((l) => l + '\n' + String(e?.stack ?? e));
      toast(label + ' failed', true);
    }
    setBusy('');
  };

  const exportZip = () =>
    run('Exporting Android Studio project', async () => {
      const out = await host().saveDialog({
        title: 'Save Android Studio project',
        defaultPath: (p.projectName || 'project') + '.zip',
        filters: [{ name: 'Zip', extensions: ['zip'] }],
      });
      if (!out) return;
      await ensureGeneratorReady(store.ws.root, (m, e) => e && setLog((l) => l + m + '\n'));
      const r = await exportAndroidStudio(p, store.ws.root, out);
      setLog((l) => l + `Project generated in ${r.projectDir}\nZip written to ${out}\n`);
      setResult({ path: out });
    });

  const exportFolder = () =>
    run('Generating project folder', async () => {
      await ensureGeneratorReady(store.ws.root, (m, e) => e && setLog((l) => l + m + '\n'));
      const r = await exportAndroidStudio(p, store.ws.root);
      setLog((l) => l + `Android Studio project generated in\n${r.projectDir}\n`);
      setResult({ path: r.projectDir, folder: true });
    });

  const exportSwb = () =>
    run('Exporting backup', async () => {
      const out = await host().saveDialog({
        title: 'Save Sketchware backup',
        defaultPath: `${p.projectName} v${p.versionName}.swb`,
        filters: [{ name: 'Sketchware backup', extensions: ['swb'] }],
      });
      if (!out) return;
      await host().write(out, await store.ws.exportSwb(p.scId));
      setLog(`Backup saved to ${out}\nRestore it in Sketchware Pro (Android) with "Restore project".`);
      setResult({ path: out });
    });

  const apk = () =>
    run('Building APK', async () => {
      await ensureGeneratorReady(store.ws.root, (m, e) => e && setLog((l) => l + m + '\n'));
      const out = await buildApk(p, store.ws, (line) => setLog((l) => (l + line).slice(-60000)));
      if (out) setResult({ path: out });
    });

  return (
    <Modal title="Export / Build" onClose={() => !busy && props.onClose()} width={760} footer={<button onClick={props.onClose} disabled={!!busy}>Close</button>}>
      <div className="export-grid">
        <button disabled={!!busy} onClick={apk}>
          <b>Build APK</b>
          <span>Debug APK via Gradle (needs Android SDK + JDK 17)</span>
        </button>
        <button disabled={!!busy} onClick={exportZip}>
          <b>Android Studio project (.zip)</b>
          <span>Complete Gradle project, like Sketchware Pro's "Export to Android Studio"</span>
        </button>
        <button disabled={!!busy} onClick={exportFolder}>
          <b>Generate project folder</b>
          <span>Writes the sources to the workspace (mysc/{p.scId})</span>
        </button>
        <button disabled={!!busy} onClick={exportSwb}>
          <b>Sketchware backup (.swb)</b>
          <span>Open it again in Sketchware Pro on Android</span>
        </button>
      </div>
      {busy && <div className="muted" style={{ margin: '10px 0' }}>{busy}…</div>}
      {result && (
        <div className="row" style={{ margin: '10px 0' }}>
          <span className="grow mono small">{baseName(result.path)}</span>
          <button onClick={() => (result.folder ? host().openPath(result.path) : host().reveal(result.path))}>Show in folder</button>
        </div>
      )}
      {log && <pre className="code-view mono" style={{ maxHeight: 300, whiteSpace: 'pre-wrap' }}>{log}</pre>}
    </Modal>
  );
}
