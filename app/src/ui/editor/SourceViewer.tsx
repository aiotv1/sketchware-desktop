// "Show Source Code": every generated file, read-only, in the code editor (Sketchware's SrcViewerActivity).
import React, { useEffect, useState } from 'react';
import { ProjectStore } from './store';
import { ensureGeneratorReady, generateSourceFiles, GeneratedFile } from '../../codegen/generator';
import { toast } from '../common/dialogs';
import { Page, IconButton } from '../common/m3';
import { CodeEditor, langFor } from '../common/CodeEditor';
import { Icon } from '../icons/Icon';

export function SourceViewer(props: { store: ProjectStore; initial?: string; onClose: () => void }) {
  const [files, setFiles] = useState<GeneratedFile[] | null>(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState(props.initial ?? '');
  useEffect(() => {
    (async () => {
      try {
        await ensureGeneratorReady(props.store.ws.root, (m, e) => e && toast(m, true));
        const f = generateSourceFiles(props.store.project, props.store.ws.root);
        setFiles(f);
        if (!f.find((x) => x.name === sel)) setSel(f[0]?.name ?? '');
      } catch (e: any) {
        setError(String(e?.stack ?? e));
      }
    })();
  }, []);
  const cur = files?.find((f) => f.name === sel);
  return (
    <Page
      title="Source code"
      subtitle={cur?.name}
      onClose={props.onClose}
      noContent
      actions={<IconButton icon="x_copy" title="Copy" onClick={() => cur && navigator.clipboard.writeText(cur.source).then(() => toast('Copied'))} />}
    >
      {error && <pre className="mono" style={{ color: 'var(--danger)', whiteSpace: 'pre-wrap', padding: 16 }}>{error}</pre>}
      {!files && !error && <div className="empty">Generating…</div>}
      {files && (
        <div className="row" style={{ alignItems: 'stretch', height: '100%', gap: 12, padding: '0 12px 12px' }}>
          <div style={{ width: 240, overflow: 'auto', flexShrink: 0 }}>
            {files.map((f) => (
              <div key={f.name} className={'list-item' + (f.name === sel ? ' selected' : '')} onClick={() => setSel(f.name)}>
                <Icon name={f.name.endsWith('.java') ? 'ic_mtrl_java' : 'ic_mtrl_code'} size={20} />
                <span className="ellipsis">{f.name}</span>
              </div>
            ))}
          </div>
          <div className="grow">
            <CodeEditor value={cur?.source ?? ''} lang={langFor(cur?.name ?? '')} readOnly />
          </div>
        </div>
      )}
    </Page>
  );
}
