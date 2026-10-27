// View Manager (ManageViewActivity): activities and custom views of the project.
import React, { useState } from 'react';
import { ProjectStore, useStore } from '../store';
import { Page, ListRow, EmptyState } from '../../common/m3';
import { Modal, mount, confirmDialog, contextMenu } from '../../common/dialogs';
import { Icon } from '../../icons/Icon';
import { ProjectFileBean } from '../../../core/beans';

const NAME_RE = /^[a-z][a-z0-9_]*$/;
const ORIENT = ['Portrait', 'Landscape', 'Both'];
const KEYB = ['Unspecified', 'Visible', 'Hidden'];

export function ViewManager(props: { store: ProjectStore; onClose: () => void }) {
  const store = useStore(props.store);
  const p = store.project;
  const [tab, setTab] = useState<'activity' | 'custom'>('activity');

  const remove = async (f: ProjectFileBean) => {
    if (f.fileName === 'main') return;
    if (!(await confirmDialog('Delete', `Delete ${f.getXmlName()}${f.fileType === 0 ? ' / ' + f.getJavaName() : ''} with all its views and blocks?`, 'Delete', true))) return;
    const list = f.fileType === 0 ? p.activities : p.customViews;
    list.splice(list.indexOf(f), 1);
    p.views.delete(f.getXmlName());
    p.fabs.delete(f.getXmlName());
    if (f.fileType === 0) {
      const j = f.getJavaName();
      for (const m of [p.vars, p.lists, p.funcs, p.components, p.events, p.blocks]) (m as Map<string, any>).delete(j);
      p.views.delete(f.getDrawerXmlName());
    }
    if (store.file === f) store.setFile(p.activities[0]);
    store.changed();
  };

  const list = tab === 'activity' ? p.activities : p.customViews;
  return (
    <Page
      title="View Manager"
      subtitle={`${p.activities.length} activities · ${p.customViews.length} custom views`}
      onClose={props.onClose}
      fab={
        <button className="fab" onClick={() => mount((c) => <AddViewDialog store={store} custom={tab === 'custom'} onClose={c} />)} title="Add">
          <Icon name="ic_mtrl_add" />
        </button>
      }
    >
      <div className="row" style={{ margin: '4px 0 14px' }}>
        <button className={'chip' + (tab === 'activity' ? ' on' : '')} onClick={() => setTab('activity')}>
          Activity
        </button>
        <button className={'chip' + (tab === 'custom' ? ' on' : '')} onClick={() => setTab('custom')}>
          Custom View
        </button>
      </div>
      {list.length === 0 && <EmptyState icon="ic_mtrl_devices" text={'No custom views.\nCustom views are layouts for list items, dialogs and includes.'} />}
      <div className="card-list">
        {list.map((f) => (
          <ListRow
            key={f.fileName}
            icon={f.fileType === 0 ? 'ic_mtrl_devices' : 'ic_mtrl_view_vertical'}
            title={f.getXmlName()}
            sub={f.fileType === 0 ? `${f.getJavaName()} · ${ORIENT[f.orientation] ?? ''} · keyboard ${KEYB[f.keyboardSetting]?.toLowerCase() ?? ''}` : 'custom view'}
            onClick={() => f.fileType === 0 && mount((c) => <ScreenOptionsDialog store={store} file={f} onClose={c} />)}
            onContextMenu={(e) => {
              e.preventDefault();
              contextMenu(e.clientX, e.clientY, [
                { label: 'Open in editor', icon: 'ic_mtrl_edit', onClick: () => (store.setFile(f), props.onClose()) },
                ...(f.fileType === 0 ? [{ label: 'Screen options', icon: 'ic_mtrl_settings', onClick: () => mount((c) => <ScreenOptionsDialog store={store} file={f} onClose={c} />) }] : []),
                { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, disabled: f.fileName === 'main', onClick: () => remove(f) },
              ]);
            }}
            trailing={
              f.fileName !== 'main' ? (
                <button
                  className="ib"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(f);
                  }}
                >
                  <Icon name="ic_mtrl_delete" />
                </button>
              ) : undefined
            }
          />
        ))}
      </div>
    </Page>
  );
}

function AddViewDialog(props: { store: ProjectStore; custom: boolean; onClose: () => void }) {
  const p = props.store.project;
  const [custom, setCustom] = useState(props.custom);
  const [name, setName] = useState('');
  const [opts, setOpts] = useState(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR);
  const names = new Set([...p.activities, ...p.customViews].map((f) => f.fileName));
  const err = !NAME_RE.test(name) ? 'Use lowercase letters, digits and _' : names.has(name) || name === 'main' ? 'Already exists' : null;
  const flag = (o: number, label: string) => (
    <button key={o} className={'chip' + (opts & o ? ' on' : '')} onClick={() => setOpts(opts ^ o)}>
      {opts & o ? <Icon name="ic_mtrl_check" size={18} /> : null}
      {label}
    </button>
  );
  return (
    <Modal
      title={
        <>
          <Icon name="ic_mtrl_add" /> Create a new view
        </>
      }
      onClose={props.onClose}
      width={520}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!!err}
            onClick={() => {
              const f = new ProjectFileBean(custom ? 1 : 0, name);
              if (custom) p.customViews.push(f);
              else {
                f.options = opts;
                p.activities.push(f);
              }
              props.store.changed();
              props.onClose();
            }}
          >
            Add
          </button>
        </>
      }
    >
      <div className="row" style={{ marginBottom: 12 }}>
        <button className={'chip' + (!custom ? ' on' : '')} onClick={() => setCustom(false)}>
          Activity
        </button>
        <button className={'chip' + (custom ? ' on' : '')} onClick={() => setCustom(true)}>
          Custom View
        </button>
      </div>
      <div className="field">
        <label>Name {name && !err && <span className="muted">→ {name}.xml{!custom && ' · ' + new ProjectFileBean(0, name).getJavaName()}</span>}</label>
        <input autoFocus value={name} placeholder="second" onChange={(e) => setName(e.target.value)} />
        {err && name && <div className="err">{err}</div>}
      </div>
      {!custom && <div className="row" style={{ flexWrap: 'wrap' }}>{[flag(1, 'Toolbar'), flag(2, 'Fullscreen'), flag(4, 'Drawer'), flag(8, 'FAB')]}</div>}
    </Modal>
  );
}

function ScreenOptionsDialog(props: { store: ProjectStore; file: ProjectFileBean; onClose: () => void }) {
  const f = props.file;
  const [o, setO] = useState(f.orientation);
  const [k, setK] = useState(f.keyboardSetting);
  return (
    <Modal
      title={f.getXmlName()}
      onClose={props.onClose}
      width={460}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            onClick={() => {
              f.orientation = o;
              f.keyboardSetting = k;
              props.store.changed();
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="panel-title" style={{ paddingLeft: 0 }}>
        Screen orientation
      </div>
      {ORIENT.map((l, i) => (
        <label key={l} className="list-item">
          <input type="radio" checked={o === i} onChange={() => setO(i)} /> {l}
        </label>
      ))}
      <div className="panel-title" style={{ paddingLeft: 0 }}>
        Keyboard
      </div>
      {KEYB.map((l, i) => (
        <label key={l} className="list-item">
          <input type="radio" checked={k === i} onChange={() => setK(i)} /> {l}
        </label>
      ))}
    </Modal>
  );
}
