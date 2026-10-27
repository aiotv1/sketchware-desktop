// Library Manager (ManageLibraryActivity) + Local library manager (ManageLocalLibraryActivity).
// Local libraries live in <workspace>/libs/local_libs/<name>/ (classes.jar, classes.dex, res, AndroidManifest.xml, config, ...);
// the project's selection is data/<id>/local_library (list of LocalLibrariesUtil.createLibraryMap maps).
import React, { useEffect, useState } from 'react';
import { ProjectStore, useStore } from '../store';
import { Page, ListRow, Switch, EmptyState, IconButton } from '../../common/m3';
import { Modal, mount, promptDialog, confirmDialog, toast, contextMenu } from '../../common/dialogs';
import { Icon } from '../../icons/Icon';
import { host, joinPath, baseName } from '../../../core/host';
import { workspace } from '../../appstate';
import { dataPath, readJson, writeJson, writeText, MapList } from './util';

export function LibraryManager(props: { store: ProjectStore; onClose: () => void }) {
  const store = useStore(props.store);
  const p = store.project;
  const [localCount, setLocalCount] = useState(0);
  useEffect(() => {
    readJson<MapList>(dataPath(store, 'local_library'), []).then((l) => setLocalCount(l.length));
  });
  const toggle = (lib: { useYn: string }) => {
    lib.useYn = lib.useYn === 'Y' ? 'N' : 'Y';
    store.changed();
  };
  const settings = (title: string, fields: { label: string; get: () => string; set: (v: string) => void }[]) => mount((c) => <LibSettingsDialog title={title} fields={fields} onClose={c} onSaved={() => store.changed()} />);
  const row = (icon: string, title: string, lib: { useYn: string }, sub: string, open?: () => void) => (
    <ListRow icon={icon} title={title} sub={sub} chevron={!!open} onClick={() => (open ? open() : toggle(lib))} trailing={<Switch on={lib.useYn === 'Y'} onChange={() => toggle(lib)} />} />
  );
  return (
    <Page title="Library Manager" subtitle="Component settings" onClose={props.onClose}>
      <div className="card-list" style={{ marginTop: 8 }}>
        {row('ic_mtrl_material3', 'AppCompat and Design', p.compat, 'Material components, Toolbar, CoordinatorLayout')}
        {row('ic_mtrl_firebase', 'Firebase', p.firebase, p.firebase.useYn === 'Y' ? p.firebase.data || 'Not configured' : 'Realtime Database, Auth, Storage', () =>
          settings('Firebase settings', [
            { label: 'Project ID (Firebase project URL)', get: () => p.firebase.data, set: (v) => (p.firebase.data = v) },
            { label: 'App ID', get: () => p.firebase.reserved1, set: (v) => (p.firebase.reserved1 = v) },
            { label: 'API key', get: () => p.firebase.reserved2, set: (v) => (p.firebase.reserved2 = v) },
            { label: 'Storage bucket', get: () => p.firebase.reserved3, set: (v) => (p.firebase.reserved3 = v) },
          ]),
        )}
        {row('ic_mtrl_admob', 'AdMob', p.admob, p.admob.useYn === 'Y' ? p.admob.appId || 'Not configured' : 'Banner, interstitial and rewarded ads', () =>
          settings('AdMob settings', [
            { label: 'App ID', get: () => p.admob.appId, set: (v) => (p.admob.appId = v) },
            {
              label: 'Test devices (comma separated)',
              get: () => p.admob.testDevices.map((d) => d.deviceId).join(','),
              set: (v) =>
                (p.admob.testDevices = v
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((deviceId) => ({ deviceId }))),
            },
          ]),
        )}
        {row('ic_mtrl_map', 'Google Maps', p.googleMap, p.googleMap.useYn === 'Y' ? (p.googleMap.data ? 'API key set' : 'Not configured') : 'MapView widget', () =>
          settings('Google Maps settings', [{ label: 'API key', get: () => p.googleMap.data, set: (v) => (p.googleMap.data = v) }]),
        )}
        <ListRow icon="ic_mtrl_box" title="Local libraries" sub={`${localCount} enabled in this project`} chevron onClick={() => mount((c) => <LocalLibraries store={store} onClose={c} />)} />
      </div>
    </Page>
  );
}

function LibSettingsDialog(props: { title: string; fields: { label: string; get: () => string; set: (v: string) => void }[]; onClose: () => void; onSaved: () => void }) {
  const [vals, setVals] = useState(props.fields.map((f) => f.get() ?? ''));
  return (
    <Modal
      title={props.title}
      onClose={props.onClose}
      width={560}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            onClick={() => {
              props.fields.forEach((f, i) => f.set(vals[i].trim()));
              props.onSaved();
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      {props.fields.map((f, i) => (
        <div key={f.label} className="field">
          <label>{f.label}</label>
          <input autoFocus={i === 0} value={vals[i]} onChange={(e) => setVals(vals.map((v, j) => (j === i ? e.target.value : v)))} />
        </div>
      ))}
    </Modal>
  );
}

const libsRoot = () => joinPath(workspace().root, 'libs', 'local_libs');

/** LocalLibrariesUtil.createLibraryMap */
async function createLibraryMap(name: string, dependency?: string): Promise<Record<string, any>> {
  const dir = joinPath(libsRoot(), name);
  const m: Record<string, any> = { name };
  if (dependency) m.dependency = dependency;
  const ex = (f: string) => host().exists(joinPath(dir, f));
  if (await ex('config')) m.packageName = (await host().readText(joinPath(dir, 'config'))).trim();
  if (await ex('res')) m.resPath = joinPath(dir, 'res');
  if (await ex('classes.jar')) m.jarPath = joinPath(dir, 'classes.jar');
  if (await ex('classes.dex')) m.dexPath = joinPath(dir, 'classes.dex');
  if (await ex('AndroidManifest.xml')) m.manifestPath = joinPath(dir, 'AndroidManifest.xml');
  if (await ex('proguard.txt')) m.pgRulesPath = joinPath(dir, 'proguard.txt');
  if (await ex('assets')) m.assetsPath = joinPath(dir, 'assets');
  return m;
}

export function LocalLibraries(props: { store?: ProjectStore; onClose: () => void }) {
  const projectFile = props.store ? dataPath(props.store, 'local_library') : null;
  const [libs, setLibs] = useState<string[] | null>(null);
  const [enabled, setEnabled] = useState<MapList>([]);
  const [q, setQ] = useState('');
  const reload = async () => {
    await host().mkdir(libsRoot());
    setLibs((await host().list(libsRoot())).filter((d) => d.dir).map((d) => d.name).sort());
    if (projectFile) setEnabled(await readJson<MapList>(projectFile, []));
  };
  useEffect(() => {
    reload();
  }, []);

  const toggle = async (name: string) => {
    if (!projectFile) return;
    let list = enabled.slice();
    if (list.some((x) => x.name === name)) list = list.filter((x) => x.name !== name);
    else {
      const dep = (await host().exists(joinPath(libsRoot(), name, 'dependency'))) ? (await host().readText(joinPath(libsRoot(), name, 'dependency'))).trim() : undefined;
      list.push(await createLibraryMap(name, dep));
    }
    setEnabled(list);
    await writeJson(projectFile, list);
  };

  const importJar = async () => {
    const f = await host().openDialog({ title: 'Import a .jar or .aar library', properties: ['openFile', 'multiSelections'], filters: [{ name: 'Library', extensions: ['jar', 'aar'] }] });
    if (!f) return;
    for (const file of f) {
      const name = baseName(file).replace(/\.(jar|aar)$/i, '');
      const dir = joinPath(libsRoot(), name);
      if (/\.jar$/i.test(file)) await host().copy(file, joinPath(dir, 'classes.jar'));
      else {
        // an .aar is a zip with classes.jar, res/, AndroidManifest.xml
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(await host().read(file));
        for (const [p, e] of Object.entries(zip.files)) if (!e.dir) await host().write(joinPath(dir, ...p.split('/')), await e.async('uint8array'));
        const mf = joinPath(dir, 'AndroidManifest.xml');
        if (await host().exists(mf)) {
          const pkg = (await host().readText(mf)).match(/package="([^"]+)"/)?.[1];
          if (pkg) await writeText(joinPath(dir, 'config'), pkg);
        }
      }
    }
    toast(`Imported ${f.length} librar${f.length > 1 ? 'ies' : 'y'}`);
    reload();
  };

  const importFolder = async () => {
    const d = await host().openDialog({ title: 'Import a local library folder (from Sketchware Pro /.sketchware/libs/local_libs)', properties: ['openDirectory', 'multiSelections'] });
    if (!d) return;
    for (const dir of d) await host().copy(dir, joinPath(libsRoot(), baseName(dir)));
    reload();
  };

  const addMaven = async () => {
    const dep = await promptDialog('Add a Gradle dependency', '', {
      label: 'Maven coordinates, e.g. com.squareup.okhttp3:okhttp:4.12.0 (resolved by Gradle when building)',
      validate: (v) => (/^[\w.-]+:[\w.-]+:[\w.+-]+$/.test(v.trim()) ? null : 'Use group:artifact:version'),
    });
    if (!dep) return;
    const [, a, v] = dep.trim().split(':');
    const dir = joinPath(libsRoot(), `${a}-v${v}`);
    await writeText(joinPath(dir, 'dependency'), dep.trim());
    reload();
  };

  const remove = async (name: string) => {
    if (!(await confirmDialog('Delete library', `Delete "${name}" from your local libraries? Projects using it will lose it.`, 'Delete', true))) return;
    await host().remove(joinPath(libsRoot(), name));
    if (projectFile && enabled.some((x) => x.name === name)) await writeJson(projectFile, enabled.filter((x) => x.name !== name));
    reload();
  };

  const shown = (libs ?? []).filter((l) => !q || l.toLowerCase().includes(q.toLowerCase()));
  return (
    <Page
      title="Local libraries"
      subtitle={props.store ? `${enabled.length} enabled in this project` : 'libs/local_libs'}
      onClose={props.onClose}
      actions={<IconButton icon="x_open" title="Open folder" onClick={() => host().openPath(libsRoot())} />}
      fab={
        <button
          className="fab"
          title="Add library"
          onClick={(e) => {
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            contextMenu(r.right - 260, r.top - 150, [
              { label: 'Gradle dependency (Maven)', icon: 'ic_mtrl_download', onClick: addMaven },
              { label: 'Import .jar / .aar', icon: 'x_import', onClick: importJar },
              { label: 'Import library folder', icon: 'ic_mtrl_folder', onClick: importFolder },
            ]);
          }}
        >
          <Icon name="ic_mtrl_add" />
        </button>
      }
    >
      <div className="search-bar" style={{ maxWidth: 'none', margin: '4px 0 14px' }}>
        <Icon name="ic_mtrl_search" />
        <input placeholder="Search libraries" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {libs && libs.length === 0 && <EmptyState icon="ic_mtrl_box" text={'No local libraries yet.\nAdd a Gradle dependency, import a .jar/.aar, or copy libraries from Sketchware Pro.'} />}
      <div className="card-list plain">
        {shown.map((l) => (
          <ListRow
            key={l}
            icon="ic_mtrl_box"
            title={l}
            onClick={() => toggle(l)}
            onContextMenu={(e) => {
              e.preventDefault();
              contextMenu(e.clientX, e.clientY, [
                { label: 'Show in folder', icon: 'x_open', onClick: () => host().openPath(joinPath(libsRoot(), l)) },
                { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, onClick: () => remove(l) },
              ]);
            }}
            trailing={props.store ? <Switch on={enabled.some((x) => x.name === l)} onChange={() => toggle(l)} /> : undefined}
          />
        ))}
      </div>
    </Page>
  );
}
