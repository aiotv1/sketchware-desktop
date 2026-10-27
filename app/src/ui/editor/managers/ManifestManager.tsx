// AndroidManifest Manager (AndroidManifestInjection / AndroidManifestInjectionDetails).
// Data: data/<id>/Injection/androidmanifest/{attributes.json, activity_launcher.txt, activities_components.json, app_components.txt}
import React, { useEffect, useState } from 'react';
import { ProjectStore } from '../store';
import { Page, ListRow, Fab, IconButton, EmptyState } from '../../common/m3';
import { Modal, mount, promptDialog, contextMenu, confirmDialog, toast } from '../../common/dialogs';
import { Icon } from '../../icons/Icon';
import { CodePage } from '../CodePage';
import { dataPath, readJson, writeJson, readText, writeText, MapList } from './util';
import { generateSourceFiles } from '../../../codegen/generator';

const APP = '_application_attrs';
const ALL = '_apply_for_all_activities';
const PERM = '_application_permissions';
const SPECIAL = new Set([APP, ALL, PERM]);

const attrsPath = (s: ProjectStore) => dataPath(s, 'Injection', 'androidmanifest', 'attributes.json');
const launcherPath = (s: ProjectStore) => dataPath(s, 'Injection', 'androidmanifest', 'activity_launcher.txt');
const actCompPath = (s: ProjectStore) => dataPath(s, 'Injection', 'androidmanifest', 'activities_components.json');
const appCompPath = (s: ProjectStore) => dataPath(s, 'Injection', 'androidmanifest', 'app_components.txt');

const NEW_ACTIVITY_ATTRS = [
  'android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout"',
  'android:hardwareAccelerated="true"',
  'android:supportsPictureInPicture="true"',
  'android:screenOrientation="portrait"',
  'android:theme="@style/AppTheme"',
  'android:windowSoftInputMode="stateHidden"',
];

function showManifestSource(store: ProjectStore) {
  try {
    const f = generateSourceFiles(store.project, store.ws.root).find((x) => x.name === 'AndroidManifest.xml');
    mount((c) => <CodePage title="Code Viewer" subtitle={store.scId} text={f?.source || 'Failed to generate source.'} lang="xml" onClose={c} />);
  } catch (e: any) {
    toast('Failed to generate source: ' + (e?.message ?? e), true);
  }
}

export function ManifestManager(props: { store: ProjectStore; onClose: () => void }) {
  const { store } = props;
  const [data, setData] = useState<MapList | null>(null);
  const reload = async () => {
    let d = await readJson<MapList>(attrsPath(store), []);
    // like checkAttrs(): make sure the application has a theme attribute
    if (!d.some((x) => x.name === APP && String(x.value).includes('android:theme'))) {
      d.push({ name: APP, value: 'android:theme="@style/AppTheme"' });
      await writeJson(attrsPath(store), d);
    }
    setData(d);
  };
  useEffect(() => {
    reload();
  }, []);

  const activities = data ? [...new Set(data.map((x) => String(x.name)).filter((n) => !SPECIAL.has(n)))] : [];
  const openDetails = (type: string, name: string) => mount((c) => <AttributePage store={store} type={type} name={name} onClose={() => (c(), reload())} />);

  const addActivity = async () => {
    const def = store.file.fileType === 0 ? store.file.getActivityName() : 'MainActivity';
    const name = await promptDialog('Add Activity', def, { label: 'Activity name (e.g. SecondActivity or a full class name)', validate: (v) => (!v.trim() ? 'Enter activity name' : null) });
    if (!name) return;
    const d = await readJson<MapList>(attrsPath(store), []);
    for (const v of NEW_ACTIVITY_ATTRS) d.push({ name: name.trim(), value: v });
    await writeJson(attrsPath(store), d);
    toast('New Activity added');
    reload();
  };

  const deleteActivity = async (name: string) => {
    if (!(await confirmDialog('Remove activity', `Remove all manifest attributes of ${name}?`, 'Remove', true))) return;
    const d = (await readJson<MapList>(attrsPath(store), [])).filter((x) => x.name !== name);
    await writeJson(attrsPath(store), d);
    const comps = (await readJson<MapList>(actCompPath(store), [])).filter((x) => x.name !== name);
    await writeJson(actCompPath(store), comps);
    toast('Activity removed');
    reload();
  };

  const launcher = async () => {
    const cur = (await readText(launcherPath(store))).trim() || 'MainActivity';
    const v = await promptDialog('Change launcher activity', cur, { label: 'Activity name', validate: (x) => (!x.trim() ? 'Enter activity name' : null) });
    if (!v) return;
    await writeText(launcherPath(store), v.trim());
    toast('Saved');
  };

  const appComponents = async () => {
    const t = await readText(appCompPath(store));
    mount((c) => <CodePage title="App Components" text={t} lang="xml" onClose={c} onSave={(x) => writeText(appCompPath(store), x)} />);
  };

  return (
    <Page title="AndroidManifest Manager" onClose={props.onClose} actions={<IconButton icon="ic_mtrl_code" title="Show AndroidManifest.xml" onClick={() => showManifestSource(store)} />}>
      <div className="card-list" style={{ marginTop: 8 }}>
        <ListRow icon="ic_mtrl_settings_applications" title="Application" sub="Default properties for the app" onClick={() => openDetails('application', APP)} />
        <ListRow icon="ic_mtrl_shield_check" title="Permissions" sub="Add custom Permissions to the app" onClick={() => openDetails('permission', PERM)} />
        <ListRow icon="ic_mtrl_login" title="Launcher Activity" sub="Change the default Launcher Activity" onClick={launcher} />
        <ListRow icon="ic_mtrl_frame_source" title="All Activities" sub="Add attributes for all Activities" onClick={() => openDetails('all', ALL)} />
        <ListRow icon="ic_mtrl_component" title="App Components" sub="Add extra components" onClick={appComponents} />
      </div>
      <div className="section-title">Activities</div>
      <div className="card-list">
        {activities.map((a) => (
          <ListRow
            key={a}
            icon="ic_mtrl_java"
            title={a}
            onClick={() => openDetails('activity', a)}
            trailing={
              <button
                className="ib"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteActivity(a);
                }}
                title="Remove"
              >
                <Icon name="ic_mtrl_delete" />
              </button>
            }
          />
        ))}
      </div>
      <button className="primary" style={{ width: '100%', height: 48, marginTop: 20 }} onClick={addActivity}>
        Add Activity
      </button>
    </Page>
  );
}

function coloredAttr(v: string) {
  const c = v.indexOf(':');
  const eq = v.indexOf('=');
  if (c < 0 || eq < 0) return <span>{v}</span>;
  return (
    <span className="mono" style={{ fontSize: 14 }}>
      <span style={{ color: '#c7a6ff' }}>{v.slice(0, c)}</span>
      <span>{v.slice(c, eq + 1)}</span>
      <span style={{ color: '#9bc98a' }}>{v.slice(eq + 1)}</span>
    </span>
  );
}

function AttributePage(props: { store: ProjectStore; type: string; name: string; onClose: () => void }) {
  const { store } = props;
  const [items, setItems] = useState<MapList>([]);
  const title = props.type === 'all' ? 'Attributes for all activities' : props.type === 'application' ? 'Application Attributes' : props.type === 'permission' ? 'Application Permissions' : props.name;
  const load = async () => setItems((await readJson<MapList>(attrsPath(store), [])).filter((x) => x.name === props.name));
  useEffect(() => {
    load();
  }, []);
  const apply = async (list: MapList) => {
    const d = (await readJson<MapList>(attrsPath(store), [])).filter((x) => x.name !== props.name);
    await writeJson(attrsPath(store), [...d, ...list]);
    setItems(list);
  };
  const edit = async (i: number) => {
    const v = await promptDialog('Edit Value', String(items[i].value), { placeholder: 'android:attr="value"', mono: true });
    if (v == null) return;
    const list = items.slice();
    list[i] = { ...list[i], value: v };
    apply(list);
  };
  const add = () => mount((c) => <AddAttributeDialog permission={props.type === 'permission'} onClose={c} onAdd={(v) => apply([...items, { name: props.name, value: v }])} />);
  const components = async () => {
    const all = await readJson<MapList>(actCompPath(store), []);
    const cur = all.find((x) => x.name === props.name);
    mount((c) => (
      <CodePage
        title={props.name + ' Components'}
        text={cur ? String(cur.value ?? '') : ''}
        lang="xml"
        onClose={c}
        onSave={async (t) => {
          const list = (await readJson<MapList>(actCompPath(store), [])).filter((x) => x.name !== props.name);
          list.push({ name: props.name, value: t });
          await writeJson(actCompPath(store), list);
        }}
      />
    ));
  };
  return (
    <Page
      title={title}
      onClose={props.onClose}
      actions={props.type === 'activity' ? <IconButton icon="ic_mtrl_component" title="Activity components (intent filters, meta-data…)" onClick={components} /> : undefined}
      fab={<Fab onClick={add} title={props.type === 'permission' ? 'Add new permission' : 'Add new attribute'} />}
    >
      {items.length === 0 && <EmptyState text="Nothing added yet" />}
      <div className="card-list">
        {items.map((it, i) => (
          <ListRow
            key={i}
            title={coloredAttr(String(it.value))}
            onClick={() => edit(i)}
            onContextMenu={(e) => {
              e.preventDefault();
              contextMenu(e.clientX, e.clientY, [
                { label: 'Edit', icon: 'ic_mtrl_edit', onClick: () => edit(i) },
                { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, onClick: () => apply(items.filter((_, j) => j !== i)) },
              ]);
            }}
            trailing={
              <button
                className="ib"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  apply(items.filter((_, j) => j !== i));
                }}
              >
                <Icon name="ic_mtrl_delete" />
              </button>
            }
          />
        ))}
      </div>
    </Page>
  );
}

function AddAttributeDialog(props: { permission: boolean; onClose: () => void; onAdd: (v: string) => void }) {
  const [res, setRes] = useState(props.permission ? 'android' : 'android');
  const [attr, setAttr] = useState(props.permission ? 'name' : '');
  const [val, setVal] = useState('');
  return (
    <Modal
      title={props.permission ? 'Add new permission' : 'Add new attribute'}
      onClose={props.onClose}
      width={520}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!attr.trim()}
            onClick={() => {
              props.onAdd(`${res.trim()}:${attr.trim()}="${val.trim()}"`);
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="row">
        <div className="field" style={{ width: 120 }}>
          <label>Namespace</label>
          <input value={res} onChange={(e) => setRes(e.target.value)} />
        </div>
        <div className="field grow">
          <label>Attribute</label>
          <input autoFocus={!props.permission} value={attr} onChange={(e) => setAttr(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>{props.permission ? 'Permission' : 'Value'}</label>
        <input autoFocus={props.permission} value={val} placeholder={props.permission ? 'android.permission.INTERNET' : ''} onChange={(e) => setVal(e.target.value)} />
      </div>
    </Modal>
  );
}
