// Project settings (MyProjectSettingActivity), activity manager (ManageViewActivity), library manager.
import React, { useEffect, useState } from 'react';
import { Modal, promptDialog, confirmDialog, toast } from '../common/dialogs';
import { ProjectStore, useStore } from './store';
import { ProjectFileBean } from '../../core/beans';
import { ColorPicker, normalizeColor, colorToCss } from '../common/ColorPicker';
import { mount } from '../common/dialogs';
import { host } from '../../core/host';
import { fileUrl } from '../common/fileurl';

const COLOR_KEYS: [string, string][] = [
  ['color_accent', 'colorAccent'],
  ['color_primary', 'colorPrimary'],
  ['color_primary_dark', 'colorPrimaryDark'],
  ['color_control_highlight', 'colorControlHighlight'],
  ['color_control_normal', 'colorControlNormal'],
];
const DEFAULTS: Record<string, number> = {
  color_accent: 0xff2196f3 | 0,
  color_primary: 0xff2196f3 | 0,
  color_primary_dark: 0xff1976d2 | 0,
  color_control_highlight: 0x202196f3,
  color_control_normal: 0xff2196f3 | 0,
};

export function ProjectSettingsDialog(props: { store: ProjectStore; onClose: () => void }) {
  const { store } = props;
  const m = store.project.meta;
  const [appName, setAppName] = useState(m.my_app_name ?? '');
  const [name, setName] = useState(m.my_ws_name ?? '');
  const [pkg, setPkg] = useState(m.my_sc_pkg_name ?? '');
  const [vc, setVc] = useState(String(m.sc_ver_code ?? '1'));
  const [vn, setVn] = useState(String(m.sc_ver_name ?? '1.0'));
  const [colors, setColors] = useState<Record<string, number>>(Object.fromEntries(COLOR_KEYS.map(([k]) => [k, typeof m[k] === 'number' ? m[k] : DEFAULTS[k]])));
  const [icon, setIcon] = useState<string | null>(null);
  const iconPath = store.ws.iconPath(store.project.scId);
  useEffect(() => {
    host().exists(iconPath).then((e) => e && setIcon(fileUrl(iconPath, Date.now())));
  }, []);
  const pkgOk = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(pkg);
  return (
    <Modal
      title="Project settings"
      onClose={props.onClose}
      width={560}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!pkgOk || !appName || !/^\d+$/.test(vc)}
            onClick={() => {
              Object.assign(m, { my_app_name: appName, my_ws_name: name, my_sc_pkg_name: pkg, sc_ver_code: vc, sc_ver_name: vn, ...colors });
              store.changed();
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
        <div
          style={{ width: 72, height: 72, borderRadius: 16, background: 'var(--bg3)', display: 'grid', placeItems: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}
          title="Change app icon (PNG)"
          onClick={async () => {
            const f = await host().openDialog({ filters: [{ name: 'PNG image', extensions: ['png'] }], properties: ['openFile'] });
            if (!f) return;
            await host().copy(f[0], iconPath);
            m.custom_icon = true;
            setIcon(fileUrl(iconPath, Date.now()));
            store.changed();
          }}
        >
          {icon ? <img src={icon} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span className="muted small">Icon</span>}
        </div>
        <div className="grow">
          <div className="field">
            <label>Application name</label>
            <input value={appName} onChange={(e) => setAppName(e.target.value)} />
          </div>
          <div className="field">
            <label>Project name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="field">
        <label>Package name</label>
        <input value={pkg} onChange={(e) => setPkg(e.target.value)} />
        {!pkgOk && <div className="err">Invalid package name</div>}
      </div>
      <div className="row">
        <div className="field grow">
          <label>Version code</label>
          <input value={vc} onChange={(e) => setVc(e.target.value)} />
        </div>
        <div className="field grow">
          <label>Version name</label>
          <input value={vn} onChange={(e) => setVn(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Theme colors</label>
        {COLOR_KEYS.map(([k, label]) => (
          <div key={k} className="row" style={{ marginBottom: 4 }}>
            <span style={{ width: 170 }}>{label}</span>
            <div
              className="color-field"
              onClick={() =>
                mount((close) => (
                  <ColorPicker
                    initial={colors[k]}
                    onClose={close}
                    onPick={(_s, n) => {
                      close();
                      setColors({ ...colors, [k]: n });
                    }}
                  />
                ))
              }
            >
              <span style={{ background: colorToCss(normalizeColor(colors[k])!) }} />
              {normalizeColor(colors[k])}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

const NAME_RE = /^[a-z][a-z0-9_]*$/;

export function ActivitiesDialog(props: { store: ProjectStore; onClose: () => void }) {
  const store = useStore(props.store);
  const p = store.project;
  const allNames = () => new Set([...p.activities, ...p.customViews].map((f) => f.fileName));
  const add = async (custom: boolean) => {
    const names = allNames();
    const n = await promptDialog(custom ? 'New custom view' : 'New activity', '', {
      label: 'File name (lowercase, e.g. "second" → second.xml / SecondActivity.java)',
      validate: (v) => (!NAME_RE.test(v) ? 'Use lowercase letters, digits and _' : names.has(v) ? 'Already exists' : v === 'main' ? 'Reserved' : null),
    });
    if (!n) return;
    const f = new ProjectFileBean(custom ? 1 : 0, n);
    if (custom) p.customViews.push(f);
    else p.activities.push(f);
    store.changed();
  };
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
  const Row = ({ f }: { f: ProjectFileBean }) => (
    <div className="event-row" style={{ cursor: 'default' }}>
      <div className="grow">
        <div className="event-title">{f.getXmlName()}</div>
        <div className="muted small">{f.fileType === 0 ? f.getJavaName() : 'custom view (list item / include layout)'}</div>
      </div>
      {f.fileType === 0 && (
        <>
          <select
            value={f.orientation}
            onChange={(e) => {
              f.orientation = parseInt(e.target.value, 10);
              store.changed();
            }}
            title="Screen orientation"
          >
            <option value={0}>Portrait</option>
            <option value={1}>Landscape</option>
            <option value={2}>Both</option>
          </select>
          <select
            value={f.keyboardSetting}
            onChange={(e) => {
              f.keyboardSetting = parseInt(e.target.value, 10);
              store.changed();
            }}
            title="Keyboard"
          >
            <option value={0}>Keyboard: unspecified</option>
            <option value={1}>Keyboard: visible</option>
            <option value={2}>Keyboard: hidden</option>
          </select>
        </>
      )}
      {f.fileName !== 'main' && (
        <button className="ghost icon" onClick={() => remove(f)}>
          ✕
        </button>
      )}
    </div>
  );
  return (
    <Modal title="Activities & custom views" onClose={props.onClose} width={720} footer={<button onClick={props.onClose}>Close</button>}>
      <div className="row" style={{ marginBottom: 8 }}>
        <button onClick={() => add(false)}>+ Activity</button>
        <button onClick={() => add(true)}>+ Custom view</button>
      </div>
      <div className="panel-title">Activities</div>
      {p.activities.map((f) => (
        <Row key={'a' + f.fileName} f={f} />
      ))}
      <div className="panel-title">Custom views</div>
      {p.customViews.length === 0 && <div className="muted small">None</div>}
      {p.customViews.map((f) => (
        <Row key={'c' + f.fileName} f={f} />
      ))}
    </Modal>
  );
}

export function LibraryDialog(props: { store: ProjectStore; onClose: () => void }) {
  const store = useStore(props.store);
  const p = store.project;
  const toggle = (lib: { useYn: string }) => {
    lib.useYn = lib.useYn === 'Y' ? 'N' : 'Y';
    store.changed();
  };
  return (
    <Modal title="Libraries" onClose={props.onClose} width={640} footer={<button onClick={props.onClose}>Close</button>}>
      <LibRow title="AppCompat & Design" desc="Material components, Toolbar, CoordinatorLayout (recommended)" on={p.compat.useYn === 'Y'} onToggle={() => toggle(p.compat)} />
      <LibRow title="Firebase" desc="Realtime Database, Auth, Storage" on={p.firebase.useYn === 'Y'} onToggle={() => toggle(p.firebase)}>
        <div className="field">
          <label>Project ID / database URL (data)</label>
          <input value={p.firebase.data} onChange={(e) => ((p.firebase.data = e.target.value), store.changed())} />
        </div>
        <div className="field">
          <label>App ID (reserved1)</label>
          <input value={p.firebase.reserved1} onChange={(e) => ((p.firebase.reserved1 = e.target.value), store.changed())} />
        </div>
        <div className="field">
          <label>API key (reserved2)</label>
          <input value={p.firebase.reserved2} onChange={(e) => ((p.firebase.reserved2 = e.target.value), store.changed())} />
        </div>
        <div className="field">
          <label>Storage bucket (reserved3)</label>
          <input value={p.firebase.reserved3} onChange={(e) => ((p.firebase.reserved3 = e.target.value), store.changed())} />
        </div>
      </LibRow>
      <LibRow title="AdMob" desc="Banner, interstitial and rewarded ads" on={p.admob.useYn === 'Y'} onToggle={() => toggle(p.admob)}>
        <div className="field">
          <label>App ID</label>
          <input value={p.admob.appId} onChange={(e) => ((p.admob.appId = e.target.value), store.changed())} />
        </div>
        <div className="field">
          <label>Test devices (comma separated)</label>
          <input
            value={p.admob.testDevices.map((d) => d.deviceId).join(',')}
            onChange={(e) => {
              p.admob.testDevices = e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((deviceId) => ({ deviceId }));
              store.changed();
            }}
          />
        </div>
      </LibRow>
      <LibRow title="Google Maps" desc="MapView widget" on={p.googleMap.useYn === 'Y'} onToggle={() => toggle(p.googleMap)}>
        <div className="field">
          <label>API key</label>
          <input value={p.googleMap.data} onChange={(e) => ((p.googleMap.data = e.target.value), store.changed())} />
        </div>
      </LibRow>
    </Modal>
  );
}

function LibRow(props: { title: string; desc: string; on: boolean; onToggle: () => void; children?: React.ReactNode }) {
  return (
    <div className="event-row" style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'default' }}>
      <div className="row">
        <div className="grow">
          <div className="event-title">{props.title}</div>
          <div className="muted small">{props.desc}</div>
        </div>
        <label className="row">
          <input type="checkbox" checked={props.on} onChange={props.onToggle} /> {props.on ? 'Enabled' : 'Disabled'}
        </label>
      </div>
      {props.on && props.children && <div style={{ marginTop: 8 }}>{props.children}</div>}
    </div>
  );
}

export { toast };
