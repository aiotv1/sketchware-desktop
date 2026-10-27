import React, { useEffect, useRef, useState } from 'react';
import { ProjectStore, useStore } from './store';
import { workspace } from '../appstate';
import { host } from '../../core/host';
import { ProjectFileBean } from '../../core/beans';
import { EventTab } from './EventTab';
import { ComponentTab } from './ComponentTab';
import { LogicEditor } from '../logic/LogicEditor';
import { SourceViewer } from './SourceViewer';
import { EventEntry } from './eventinfo';
import { mount, toast, contextMenu, confirmDialog } from '../common/dialogs';
import { Designer } from '../design/Designer';
import { AppBar, IconButton, Tabs } from '../common/m3';
import { Icon } from '../icons/Icon';
import { ConfigDrawer } from './managers/ConfigDrawer';
import { runProject, runMenu } from './RunBuild';
import { ensureGeneratorReady } from '../../codegen/generator';
import './editor.css';

type Tab = 'view' | 'event' | 'component';

export function ProjectEditor(props: { scId: string; onClose: () => void }) {
  const [store, setStore] = useState<ProjectStore | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    ProjectStore.open(workspace(), props.scId)
      .then(async (s) => {
        // the managers use the ported Sketchware classes, which need the workspace paths
        await ensureGeneratorReady(s.ws.root);
        setStore(s);
      })
      .catch((e) => setErr(String(e?.stack ?? e)));
  }, [props.scId]);
  if (err) return <div className="empty mono" style={{ whiteSpace: 'pre-wrap' }}>{err}</div>;
  if (!store) return <div className="empty">Opening project…</div>;
  return <Editor store={store} onClose={props.onClose} />;
}

function Editor(props: { store: ProjectStore; onClose: () => void }) {
  const store = useStore(props.store);
  const p = store.project;
  const [tab, setTab] = useState<Tab>('view');
  const [logic, setLogic] = useState<EventEntry | null>(null);
  const saveTimer = useRef<any>(null);

  useEffect(() => {
    host().setTitle(`${p.projectName} — Sketchware Desktop`);
  }, []);

  // autosave shortly after each change
  useEffect(() => {
    if (!store.dirty) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => store.save().catch((e) => toast('Save failed: ' + e, true)), 1200);
  });

  const save = () => store.save().then(() => toast('Project saved'));

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        runProject(store);
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const close = async () => {
    clearTimeout(saveTimer.current);
    if (store.dirty) await store.save();
    props.onClose();
  };

  const files: ProjectFileBean[] = [...p.activities, ...p.customViews];
  const showSource = (initial?: string) => mount((c) => <SourceViewer store={store} initial={initial} onClose={c} />);
  const isView = tab === 'view';
  const fileLabel = (f: ProjectFileBean) => (f.fileType === 0 && !isView ? f.getJavaName() : f.getXmlName());

  const pickFile = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const items = files
      .filter((f) => isView || f.fileType === 0)
      .map((f) => ({
        label: fileLabel(f) + (f.fileType !== 0 ? '   (custom view)' : ''),
        icon: isView ? 'ic_mtrl_devices' : 'ic_mtrl_java',
        onClick: () => store.setFile(f),
      }));
    contextMenu(r.left, r.top - Math.min(items.length, 12) * 44 - 24, items);
  };

  return (
    <div className="editor">
      <AppBar
        title={p.projectName}
        subtitle={p.scId}
        onBack={close}
        actions={
          <>
            <span className="small muted" style={{ marginRight: 8 }}>
              {store.dirty ? 'Saving…' : 'Saved'}
            </span>
            <IconButton icon="ic_mtrl_save" title="Save (Ctrl+S)" onClick={save} />
            <IconButton icon="ic_mtrl_more_vertical" title="Configuration" onClick={() => mount((c) => <ConfigDrawer store={store} onClose={c} />)} />
          </>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'view', label: 'View' },
          { value: 'event', label: 'Event' },
          { value: 'component', label: 'Component' },
        ]}
      />
      <div className="editor-body">
        {tab === 'view' && <Designer store={store} />}
        {tab === 'event' && <EventTab store={store} onOpen={setLogic} />}
        {tab === 'component' && <ComponentTab store={store} />}
      </div>
      <div className="bottom-bar">
        <button className="file-pill" onClick={pickFile} title="Switch file">
          <Icon name={isView ? 'ic_mtrl_devices' : 'ic_mtrl_java'} />
          <span className="grow ellipsis" style={{ textAlign: 'left' }}>
            {fileLabel(store.file)}
          </span>
          <Icon name="x_drop" />
        </button>
        <div className="grow" />
        <div className="run-split">
          <button className="run-main" onClick={() => runProject(store)} title="Build and run (F5)">
            <Icon name="x_play" />
            Run
          </button>
          <button
            className="run-more"
            title="More build options"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              runMenu(store, r.right - 300, r.top - 470);
            }}
          >
            <Icon name="ic_mtrl_arrow_down" />
          </button>
        </div>
      </div>
      {logic && (
        <LogicEditor
          key={logic.id + logic.eventName}
          store={store}
          file={store.file}
          id={logic.id}
          eventName={logic.eventName}
          title={logic.title}
          onClose={() => setLogic(null)}
          onShowSource={() => showSource(store.file.getJavaName())}
        />
      )}
    </div>
  );
}

export { confirmDialog };
