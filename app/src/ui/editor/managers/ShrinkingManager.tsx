// Code Shrinking Manager (ManageProguardActivity) and StringFog Manager (ManageStringFogFragment).
// Data: data/<id>/{proguard, proguard_fm, proguard-rules.pro, stringfog}
import React, { useRef, useState } from 'react';
import { ProjectStore } from '../store';
import { Page, ListRow, Switch } from '../../common/m3';
import { Modal, mount } from '../../common/dialogs';
import { CodePage } from '../CodePage';
import { ProguardHandler } from '../../../sw/ProguardHandler';
import { ManageLocalLibrary } from '../../../sw/ManageLocalLibrary';
import { host } from '../../../core/host';
import { dataPath, readJson, writeJson } from './util';

export function ShrinkingManager(props: { store: ProjectStore; onClose: () => void }) {
  const pg = useRef(new ProguardHandler(props.store.scId)).current;
  const [, force] = useState(0);
  const set = (f: () => void) => {
    f();
    force((x) => x + 1);
  };
  const editRules = async () => {
    const path = pg.getCustomProguardRules();
    const t = (await host().exists(path)) ? await host().readText(path) : '';
    mount((c) => <CodePage title="ProGuard rules" subtitle="proguard-rules.pro" text={t} lang="text" onClose={c} onSave={(x) => host().write(path, x)} />);
  };
  const fullMode = () => {
    let libs: string[] = [];
    try {
      const m = new ManageLocalLibrary(props.store.scId);
      libs = (m.list?.toArray?.() ?? m.list ?? []).map((x: any) => String(x.get ? x.get('name') : x.name));
    } catch {
      libs = [];
    }
    mount((c) => <FullModeDialog libs={libs} pg={pg} onClose={c} />);
  };
  const on = pg.isShrinkingEnabled();
  return (
    <Page title="Code Shrinking Manager" onClose={props.onClose}>
      <div className="card-list" style={{ marginTop: 8 }}>
        <ListRow icon="ic_mtrl_shield_lock" title="Enable shrinking" sub="Remove unused code and resources (R8/ProGuard). Applied as minifyEnabled in the Gradle build." trailing={<Switch on={on} onChange={(v) => set(() => pg.setProguardEnabled(v))} />} onClick={() => set(() => pg.setProguardEnabled(!on))} />
        <ListRow icon="ic_mtrl_code" title="Use R8" sub="Use R8 instead of ProGuard" disabled={!on} trailing={<Switch on={pg.isR8Enabled()} disabled={!on} onChange={(v) => set(() => pg.setR8Enabled(v))} />} />
        <ListRow icon="ic_mtrl_article" title="Generate debug files" sub="Write mapping.txt, seeds.txt and usage.txt" disabled={!on} trailing={<Switch on={pg.isDebugFilesEnabled()} disabled={!on} onChange={(v) => set(() => pg.setDebugEnabled(v))} />} />
        <ListRow icon="ic_mtrl_edit" title="ProGuard rules" sub="Edit custom rules (proguard-rules.pro)" chevron onClick={editRules} />
        <ListRow icon="ic_mtrl_box" title="Full mode libraries" sub="Local libraries processed in full mode" chevron disabled={!on} onClick={fullMode} />
      </div>
    </Page>
  );
}

function FullModeDialog(props: { libs: string[]; pg: ProguardHandler; onClose: () => void }) {
  const [sel, setSel] = useState(props.libs.filter((l) => props.pg.libIsProguardFMEnabled(l)));
  return (
    <Modal
      title="Full mode libraries"
      onClose={props.onClose}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            onClick={() => {
              props.pg.setProguardFMLibs(sel as any);
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      {props.libs.length === 0 && <div className="empty">No local libraries are enabled in this project.</div>}
      {props.libs.map((l) => (
        <label key={l} className="list-item">
          <input type="checkbox" checked={sel.includes(l)} onChange={() => setSel(sel.includes(l) ? sel.filter((x) => x !== l) : [...sel, l])} />
          {l}
        </label>
      ))}
    </Modal>
  );
}

export function StringFogManager(props: { store: ProjectStore; onClose: () => void }) {
  const path = dataPath(props.store, 'stringfog');
  const [on, setOn] = useState<boolean | null>(null);
  if (on === null) readJson<Record<string, string>>(path, { enabled: 'false' }).then((c) => setOn(c.enabled === 'true'));
  const toggle = async (v: boolean) => {
    setOn(v);
    await writeJson(path, { enabled: String(v) });
  };
  return (
    <Page title="StringFog Manager" onClose={props.onClose}>
      <div className="card-list" style={{ marginTop: 8 }}>
        <ListRow
          icon="ic_mtrl_regular_expression"
          title="Enable StringFog"
          sub="Encrypt the strings of your app at compilation time to make reverse engineering harder."
          trailing={<Switch on={!!on} onChange={toggle} />}
          onClick={() => toggle(!on)}
        />
      </div>
      <p className="muted small" style={{ padding: '12px 8px' }}>
        This setting is stored in the project the same way as in Sketchware Pro, so it is applied when the project is built there. The desktop Gradle build does not run StringFog.
      </p>
    </Page>
  );
}
