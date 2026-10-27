import React, { useEffect, useState } from 'react';
import { ProjectSummary } from '../../core/workspace';
import { createNewProject } from '../../core/project';
import { host, baseName, joinPath } from '../../core/host';
import { workspace, getSettings, saveSettings, AppSettings } from '../appstate';
import { Modal, mount, toast, confirmDialog, contextMenu } from '../common/dialogs';
import { fileUrl } from '../common/fileurl';
import { Icon } from '../icons/Icon';
import { IconButton, Page, ListRow, EmptyState } from '../common/m3';
import { BlockManager } from './BlockManager';
import { ComponentManager, EventManager, BlockSelectorManager } from './SystemManagers';
import { LocalLibraries } from '../editor/managers/LibraryManager';
import { LogcatPage } from '../editor/managers/LogcatPage';
import { CollectionManager } from '../editor/managers/CollectionManager';
import { runCollect } from '../../codegen/adb';

export function Home(props: { onOpen: (scId: string) => void }) {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'id' | 'name'>('id');

  const refresh = async () => setProjects(await workspace().listProjects());
  useEffect(() => {
    refresh();
    host().setTitle('Sketchware Desktop');
  }, []);

  const importBackup = async () => {
    const files = await host().openDialog({
      title: 'Import Sketchware project',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Sketchware backup', extensions: ['swb', 'zip', 'sh'] }],
    });
    if (!files) return;
    for (const f of files) {
      try {
        const id = await workspace().importSwb(await host().read(f));
        toast(`Imported ${baseName(f)} as project #${id}`);
      } catch (e: any) {
        toast(`${baseName(f)}: ${e.message ?? e}`, true, 5000);
      }
    }
    refresh();
  };

  const importFolder = async () => {
    const dirs = await host().openDialog({ title: 'Select a copied ".sketchware" folder from your phone', properties: ['openDirectory'] });
    if (!dirs) return;
    try {
      const ids = await workspace().importSketchwareFolder(dirs[0]);
      toast(ids.length ? `Imported ${ids.length} project(s)` : 'No projects found in that folder (expected mysc/list/<id>/project)', !ids.length, 4000);
    } catch (e: any) {
      toast(String(e.message ?? e), true, 5000);
    }
    refresh();
  };

  const exportBackup = async (p: ProjectSummary) => {
    const name = `${p.meta.my_ws_name ?? 'project'} v${p.meta.sc_ver_name ?? '1.0'}.swb`;
    const out = await host().saveDialog({ title: 'Export backup', defaultPath: name, filters: [{ name: 'Sketchware backup', extensions: ['swb'] }] });
    if (!out) return;
    await host().write(out, await workspace().exportSwb(p.scId));
    toast('Backup saved: ' + baseName(out));
  };

  const del = async (p: ProjectSummary) => {
    if (await confirmDialog('Delete project', `Delete "${p.meta.my_ws_name}" (#${p.scId})? This removes all its files from the workspace.`, 'Delete', true)) {
      await workspace().deleteProject(p.scId);
      refresh();
    }
  };

  const filtered = (projects ?? [])
    .filter((p) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return [p.meta.my_ws_name, p.meta.my_app_name, p.meta.my_sc_pkg_name, p.scId].some((x) => String(x ?? '').toLowerCase().includes(q));
    })
    .sort((a, b) => (sort === 'name' ? String(a.meta.my_ws_name).localeCompare(String(b.meta.my_ws_name)) : Number(b.scId) - Number(a.scId)));

  const projectMenu = (x: number, y: number, p: ProjectSummary) =>
    contextMenu(x, y, [
      { label: 'Open', icon: 'ic_mtrl_edit', onClick: () => props.onOpen(p.scId) },
      { label: 'Backup (.swb)', icon: 'ic_mtrl_save', onClick: () => exportBackup(p) },
      { label: 'Show in folder', icon: 'x_open', onClick: () => host().openPath(workspace().dataDir(p.scId)) },
      { separator: true, label: '' },
      { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, onClick: () => del(p) },
    ]);

  return (
    <div className="home">
      <div className="appbar" style={{ height: 76, padding: '0 16px', gap: 14 }}>
        <div className="logo">S</div>
        <div style={{ fontSize: 22, marginRight: 12 }}>Sketchware Desktop</div>
        <div className="search-bar">
          <Icon name="ic_mtrl_search" />
          <input placeholder={`Search ${projects?.length ?? ''} projects`} value={query} onChange={(e) => setQuery(e.target.value)} />
          <IconButton icon="ic_mtrl_list" title={sort === 'id' ? 'Sorted by newest — sort by name' : 'Sorted by name — sort by newest'} onClick={() => setSort(sort === 'id' ? 'name' : 'id')} />
        </div>
        <div className="grow" />
        <IconButton
          icon="x_import"
          title="Import"
          onClick={(e) => {
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            contextMenu(r.left - 220, r.bottom + 4, [
              { label: 'Restore backup (.swb)', icon: 'ic_mtrl_save', onClick: importBackup },
              { label: 'Import a .sketchware folder', icon: 'ic_mtrl_folder', onClick: importFolder },
            ]);
          }}
        />
        <IconButton icon="ic_mtrl_settings" title="Settings" onClick={() => mount((c) => <SettingsPage onClose={c} onChanged={refresh} />)} />
      </div>
      <div className="home-body">
        {projects && projects.length === 0 && <EmptyState icon="ic_sketchware_24" text={'No projects yet.\nCreate a new project, or restore a Sketchware / Sketchware Pro backup (.swb).'} />}
        <div className="project-grid">
          {filtered.map((p) => (
            <div
              key={p.scId}
              className="project-card"
              onClick={() => props.onOpen(p.scId)}
              onContextMenu={(e) => {
                e.preventDefault();
                projectMenu(e.clientX, e.clientY, p);
              }}
            >
              {p.iconPath ? <img src={fileUrl(p.iconPath)} /> : <div className="noicon">{String(p.meta.my_app_name ?? '?').charAt(0).toUpperCase()}</div>}
              <div className="grow">
                <div className="name">{p.meta.my_ws_name}</div>
                <div className="muted ellipsis">{p.meta.my_app_name}</div>
                <div className="muted small ellipsis">
                  {p.meta.my_sc_pkg_name} · v{p.meta.sc_ver_name} ({p.meta.sc_ver_code})
                </div>
              </div>
              <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}>
                <span className="muted small">#{p.scId}</span>
                <button
                  className="ib"
                  title="More"
                  onClick={(e) => {
                    e.stopPropagation();
                    projectMenu(e.clientX, e.clientY, p);
                  }}
                >
                  <Icon name="ic_mtrl_more_vertical" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="fab" onClick={() => mount((close) => <NewProjectDialog close={close} onCreated={(id) => props.onOpen(id)} />)}>
        <Icon name="ic_mtrl_add" /> New project
      </button>
    </div>
  );
}

const PKG_RE = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;

function NewProjectDialog(props: { close: () => void; onCreated: (id: string) => void }) {
  const [appName, setAppName] = useState('MyApp');
  const [projectName, setProjectName] = useState('NewProject');
  const [pkg, setPkg] = useState('com.my.newproject');
  const [busy, setBusy] = useState(false);
  const pkgErr = PKG_RE.test(pkg) ? '' : 'Invalid package name (e.g. com.example.app)';
  const create = async () => {
    setBusy(true);
    try {
      const id = await workspace().newScId();
      const p = createNewProject(id, appName, pkg, projectName);
      await workspace().saveProject(p);
      props.close();
      props.onCreated(id);
    } catch (e: any) {
      toast(String(e.message ?? e), true);
      setBusy(false);
    }
  };
  return (
    <Modal
      title={
        <>
          <Icon name="ic_mtrl_add" /> Create a new project
        </>
      }
      onClose={props.close}
      width={520}
      footer={
        <>
          <button onClick={props.close}>Cancel</button>
          <button className="primary" disabled={!!pkgErr || !appName || !projectName || busy} onClick={create}>
            Create project
          </button>
        </>
      }
    >
      <div className="field">
        <label>Application name</label>
        <input autoFocus value={appName} onChange={(e) => setAppName(e.target.value)} />
      </div>
      <div className="field">
        <label>Project name</label>
        <input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
      </div>
      <div className="field">
        <label>Package name</label>
        <input value={pkg} onChange={(e) => setPkg(e.target.value)} />
        {pkgErr && <div className="err">{pkgErr}</div>}
      </div>
    </Modal>
  );
}

// ------------------------------------------------------------------ settings (AppSettings)
function SettingsPage(props: { onClose: () => void; onChanged: () => void }) {
  const open = (f: (c: () => void) => React.ReactNode) => mount(f);
  const signApk = async () => {
    const f = await host().openDialog({ title: 'Select an APK to sign', properties: ['openFile'], filters: [{ name: 'APK', extensions: ['apk'] }] });
    if (!f) return;
    const s = getSettings();
    const sdk = s.androidSdk;
    if (!sdk) return toast('Set the Android SDK folder in App settings first', true);
    const btDir = joinPath(sdk, 'build-tools');
    const vers = (await host().list(btDir)).filter((d) => d.dir).map((d) => d.name).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    if (!vers.length) return toast('No build-tools found in the Android SDK', true);
    const ks = joinPath((await host().paths()).home, '.android', 'debug.keystore');
    if (!(await host().exists(ks))) return toast('No debug keystore yet — build any project once with Run to create it', true);
    const out = f[0].replace(/\.apk$/i, '_signed.apk');
    const env: Record<string, string> = {};
    if (s.javaHome) env.JAVA_HOME = s.javaHome;
    const r = await runCollect(`"${joinPath(btDir, vers[0], 'apksigner.bat')}"`, ['sign', '--ks', `"${ks}"`, '--ks-pass', 'pass:android', '--key-pass', 'pass:android', '--out', `"${out}"`, `"${f[0]}"`], { env });
    if (r.code === 0) {
      toast('Signed: ' + baseName(out));
      host().reveal(out);
    } else toast('Signing failed: ' + r.out.slice(0, 300), true, 6000);
  };
  return (
    <Page title="Settings" onClose={props.onClose}>
      <div className="section-title">Managers</div>
      <div className="card-list">
        <ListRow icon="ic_mtrl_block" title="Block manager" sub="Manage your own blocks to use in Logic Editor" chevron onClick={() => open((c) => <BlockManager onClose={c} />)} />
        <ListRow icon="ic_mtrl_pull_down" title="Block selector menu manager" sub="Manage your own block selector menus" chevron onClick={() => open((c) => <BlockSelectorManager onClose={c} />)} />
        <ListRow icon="ic_mtrl_component" title="Component manager" sub="Manage your own components" chevron onClick={() => open((c) => <ComponentManager onClose={c} />)} />
        <ListRow icon="ic_mtrl_list" title="Event manager" sub="Manage your own events" chevron onClick={() => open((c) => <EventManager onClose={c} />)} />
        <ListRow icon="ic_mtrl_box" title="Local library manager" sub="Manage local libraries" chevron onClick={() => open((c) => <LocalLibraries onClose={c} />)} />
        <ListRow icon="ic_mtrl_bookmark" title="Collection manager" sub="My saved collections" chevron onClick={() => open((c) => <CollectionManager onClose={c} />)} />
        <ListRow icon="ic_mtrl_article" title="Logcat Reader" sub="Read logs from a connected device" chevron onClick={() => open((c) => <LogcatPage onClose={c} />)} />
      </div>
      <div className="section-title">General</div>
      <div className="card-list">
        <ListRow icon="ic_mtrl_settings_applications" title="App settings" sub="Workspace, Android SDK, JDK, theme and block options" chevron onClick={() => open((c) => <AppSettingsDialog close={c} onSaved={props.onChanged} />)} />
        <ListRow icon="ic_mtrl_folder" title="Open working directory" sub={workspace().root} chevron onClick={() => host().openPath(workspace().root)} />
        <ListRow icon="ic_mtrl_apk_document" title="Sign an APK file" sub="Sign an existing APK with the Android debug key (apksigner)" chevron onClick={signApk} />
      </div>
    </Page>
  );
}

function AppSettingsDialog(props: { close: () => void; onSaved: () => void }) {
  const s = getSettings();
  const [wsPath, setWs] = useState(s.workspace);
  const [sdk, setSdk] = useState(s.androidSdk);
  const [jdk, setJdk] = useState(s.javaHome);
  const [builtin, setBuiltin] = useState(s.showBuiltInBlocks);
  const [every, setEvery] = useState(s.showEveryBlock);
  const [theme, setTheme] = useState<AppSettings['theme']>(s.theme);
  const pick = async (set: (v: string) => void) => {
    const d = await host().openDialog({ properties: ['openDirectory'] });
    if (d) set(d[0]);
  };
  return (
    <Modal
      title={
        <>
          <Icon name="ic_mtrl_settings_applications" /> App settings
        </>
      }
      onClose={props.close}
      width={640}
      footer={
        <>
          <button onClick={props.close}>Cancel</button>
          <button
            className="primary"
            onClick={async () => {
              await saveSettings({ workspace: wsPath, androidSdk: sdk, javaHome: jdk, showBuiltInBlocks: builtin, showEveryBlock: every, theme });
              props.close();
              props.onSaved();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="field">
        <label>Theme</label>
        <div className="row">
          {(['dark', 'light', 'system'] as const).map((t) => (
            <button key={t} className={'chip' + (theme === t ? ' on' : '')} onClick={() => setTheme(t)}>
              {t === 'dark' ? 'Dark' : t === 'light' ? 'Light' : 'System'}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Workspace folder (same layout as the phone's /sdcard/.sketchware)</label>
        <div className="row">
          <input className="grow" value={wsPath} onChange={(e) => setWs(e.target.value)} />
          <button onClick={() => pick(setWs)}>Browse</button>
        </div>
      </div>
      <div className="field">
        <label>Android SDK folder (used to build APKs)</label>
        <div className="row">
          <input className="grow" value={sdk} placeholder="e.g. C:\Users\you\AppData\Local\Android\Sdk" onChange={(e) => setSdk(e.target.value)} />
          <button onClick={() => pick(setSdk)}>Browse</button>
        </div>
      </div>
      <div className="field">
        <label>JDK folder (JAVA_HOME for builds, JDK 17 or newer)</label>
        <div className="row">
          <input className="grow" value={jdk} onChange={(e) => setJdk(e.target.value)} />
          <button onClick={() => pick(setJdk)}>Browse</button>
        </div>
      </div>
      <label className="row" style={{ color: 'var(--on-surface)' }}>
        <input type="checkbox" checked={builtin} onChange={(e) => setBuiltin(e.target.checked)} /> Show Sketchware Pro built-in extra blocks
      </label>
      <label className="row" style={{ marginTop: 8, color: 'var(--on-surface)' }}>
        <input type="checkbox" checked={every} onChange={(e) => setEvery(e.target.checked)} /> Show every single block (even for unused widgets/components)
      </label>
    </Modal>
  );
}
