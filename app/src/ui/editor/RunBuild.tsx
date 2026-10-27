// Run button + Run ▾ menu (DesignActivity's run/build options).
import React, { useEffect, useRef, useState } from 'react';
import { Modal, mount, toast, choiceDialog, contextMenu, confirmDialog } from '../common/dialogs';
import { ProjectStore } from './store';
import { host, joinPath, baseName } from '../../core/host';
import { ensureGeneratorReady, exportAndroidStudio } from '../../codegen/generator';
import { buildApk } from '../../codegen/apkbuild';
import { listDevices, installApk, launchApp, runCollect, AdbDevice } from '../../codegen/adb';
import { getSettings } from '../appstate';
import { Icon } from '../icons/Icon';
import { SourceViewer } from './SourceViewer';
import { CodePage } from './CodePage';
import { BuildSettings } from '../../sw/BuildSettings';

const lastApkFile = (s: ProjectStore) => s.ws.extraPath(s.scId, '.desktop_last_apk');
const compileLogFile = (s: ProjectStore) => s.ws.extraPath(s.scId, 'compile_log');

type Phase = 'build' | 'install' | 'done' | 'failed';

function BuildDialog(props: { store: ProjectStore; onClose: () => void; installOnly?: string }) {
  const { store } = props;
  const p = store.project;
  const [phase, setPhase] = useState<Phase>(props.installOnly ? 'install' : 'build');
  const [step, setStep] = useState(props.installOnly ? 'Looking for devices…' : 'Saving project…');
  const [log, setLog] = useState('');
  const [showLog, setShowLog] = useState(false);
  const [apk, setApk] = useState<string | null>(props.installOnly ?? null);
  const logRef = useRef<HTMLPreElement>(null);
  const append = (s: string) => {
    setLog((l) => (l + s).slice(-200000));
    const m = s.match(/> Task :app:(\w+)/g);
    if (m) setStep('Gradle: ' + m[m.length - 1].replace('> Task :app:', ''));
  };

  useEffect(() => {
    logRef.current?.scrollTo(0, logRef.current.scrollHeight);
  }, [log, showLog]);

  const install = async (file: string) => {
    setPhase('install');
    setStep('Looking for devices…');
    const devs = await listDevices();
    if (!devs.length) {
      setStep('APK ready. Connect a phone with USB debugging (or start an emulator) to install it.');
      setPhase('done');
      return;
    }
    let dev: AdbDevice | null = devs[0];
    if (devs.length > 1) {
      dev = await choiceDialog(
        'Install on',
        devs.map((d) => ({ label: d.model || d.serial, value: d, hint: d.serial })),
      );
      if (!dev) {
        setPhase('done');
        setStep('APK ready.');
        return;
      }
    }
    setStep(`Installing on ${dev.model || dev.serial}…`);
    const r = await installApk(dev.serial, file, append);
    if (r.code !== 0 || !/Success/.test(r.out)) {
      setPhase('failed');
      setStep('Install failed');
      setShowLog(true);
      return;
    }
    await launchApp(dev.serial, p.packageName);
    setPhase('done');
    setStep(`Installed and opened on ${dev.model || dev.serial}`);
  };

  useEffect(() => {
    (async () => {
      if (props.installOnly) return install(props.installOnly);
      try {
        await store.save();
        setStep('Generating source code…');
        await ensureGeneratorReady(store.ws.root, (m, e) => e && append(m + '\n'));
        setStep('Building APK with Gradle…');
        const out = await buildApk(p, store.ws, append);
        setLog((l) => {
          host().write(compileLogFile(store), l);
          return l;
        });
        if (!out) {
          setPhase('failed');
          setStep('Build failed');
          setShowLog(true);
          return;
        }
        await host().write(lastApkFile(store), out);
        setApk(out);
        await install(out);
      } catch (e: any) {
        append('\n' + String(e?.stack ?? e));
        setPhase('failed');
        setStep('Build failed');
        setShowLog(true);
      }
    })();
  }, []);

  const busy = phase === 'build' || phase === 'install';
  return (
    <Modal
      title={
        <>
          <Icon name={phase === 'failed' ? 'x_bug' : 'ic_mtrl_android'} color={phase === 'failed' ? 'var(--error)' : 'var(--primary)'} />
          {busy ? 'Building' : phase === 'failed' ? 'Failed' : 'Done'} · {p.projectName}
        </>
      }
      onClose={() => !busy && props.onClose()}
      width={showLog ? 900 : 560}
      footer={
        <>
          <button className="text" onClick={() => setShowLog(!showLog)}>
            {showLog ? 'Hide log' : 'Show log'}
          </button>
          <div className="grow" />
          {apk && !busy && (
            <button className="text" onClick={() => host().reveal(apk)}>
              Show in folder
            </button>
          )}
          {apk && phase === 'done' && (
            <button className="text" onClick={() => install(apk)}>
              Install again
            </button>
          )}
          <button className="primary" disabled={busy} onClick={props.onClose}>
            Close
          </button>
        </>
      }
    >
      <div style={{ margin: '4px 0 12px', color: 'var(--on-surface)' }}>{step}</div>
      {busy && (
        <div className="progress">
          <div />
        </div>
      )}
      {showLog && (
        <pre ref={logRef} className="code-view mono" style={{ height: '50vh', whiteSpace: 'pre-wrap', marginTop: 12, borderRadius: 12 }}>
          {log || '(no output yet)'}
        </pre>
      )}
    </Modal>
  );
}

export function runProject(store: ProjectStore) {
  mount((c) => <BuildDialog store={store} onClose={c} />);
}

function BuildSettingsDialog(props: { store: ProjectStore; onClose: () => void }) {
  const bs = useRef(new BuildSettings(props.store.scId)).current;
  const get = (k: string, d: string) => bs.getValue(k, d);
  const [javaVer, setJavaVer] = useState(get(BuildSettings.SETTING_JAVA_VERSION, BuildSettings.SETTING_JAVA_VERSION_1_8));
  const [classpath, setClasspath] = useState(get(BuildSettings.SETTING_CLASSPATH, ''));
  const [noHttp, setNoHttp] = useState(get(BuildSettings.SETTING_NO_HTTP_LEGACY, 'false') === 'true');
  const [noWarn, setNoWarn] = useState(get(BuildSettings.SETTING_NO_WARNINGS, 'true') === 'true');
  const [logcat, setLogcat] = useState(get(BuildSettings.SETTING_ENABLE_LOGCAT, 'true') === 'true');
  return (
    <Modal
      title={
        <>
          <Icon name="ic_mtrl_settings" /> Build Settings
        </>
      }
      onClose={props.onClose}
      width={560}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            onClick={() => {
              bs.setValue(BuildSettings.SETTING_JAVA_VERSION, javaVer);
              bs.setValue(BuildSettings.SETTING_CLASSPATH, classpath);
              bs.setValue(BuildSettings.SETTING_NO_HTTP_LEGACY, String(noHttp));
              bs.setValue(BuildSettings.SETTING_NO_WARNINGS, String(noWarn));
              bs.setValue(BuildSettings.SETTING_ENABLE_LOGCAT, String(logcat));
              toast('Saved');
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="field">
        <label>Java version</label>
        <select value={javaVer} onChange={(e) => setJavaVer(e.target.value)}>
          {['1.7', '1.8', '1.9', '10', '11'].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Classpath (extra .jar files, separated by ":")</label>
        <input value={classpath} onChange={(e) => setClasspath(e.target.value)} />
      </div>
      <label className="row" style={{ margin: '6px 0' }}>
        <input type="checkbox" checked={noHttp} onChange={(e) => setNoHttp(e.target.checked)} /> Don't include http-legacy-android
      </label>
      <label className="row" style={{ margin: '6px 0' }}>
        <input type="checkbox" checked={noWarn} onChange={(e) => setNoWarn(e.target.checked)} /> Hide Java compiler warnings
      </label>
      <label className="row" style={{ margin: '6px 0' }}>
        <input type="checkbox" checked={logcat} onChange={(e) => setLogcat(e.target.checked)} /> Enable debug logcat (for Logcat Reader)
      </label>
    </Modal>
  );
}

async function newestBuildTools(): Promise<string | null> {
  const sdk = getSettings().androidSdk;
  if (!sdk) return null;
  const dir = joinPath(sdk, 'build-tools');
  if (!(await host().exists(dir))) return null;
  const vers = (await host().list(dir)).filter((d) => d.dir).map((d) => d.name);
  vers.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  return vers.length ? joinPath(dir, vers[0]) : null;
}

export function runMenu(store: ProjectStore, x: number, y: number) {
  const lastApk = async () => {
    const f = await store.ws.readExtra(store.scId, '.desktop_last_apk');
    return f && (await host().exists(f.trim())) ? f.trim() : null;
  };
  contextMenu(x, y, [
    { label: 'Build Settings', icon: 'ic_mtrl_settings', onClick: () => mount((c) => <BuildSettingsDialog store={store} onClose={c} />) },
    {
      label: 'Clean temporary files',
      icon: 'x_clean',
      onClick: async () => {
        if (!(await confirmDialog('Clean temporary files', 'Delete the generated project and Gradle build output for this project? Your project itself is not touched.', 'Clean'))) return;
        await host().remove(store.ws.buildDir(store.scId));
        toast('Temporary files cleaned');
      },
    },
    {
      label: 'Show last compile error',
      icon: 'x_bug',
      onClick: async () => {
        const t = await store.ws.readExtra(store.scId, 'compile_log');
        if (!t) return toast('No compile log yet');
        mount((c) => <CodePage title="Last compile log" text={t} lang="text" onClose={c} />);
      },
    },
    { label: 'Show source code', icon: 'ic_mtrl_frame_source', onClick: () => mount((c) => <SourceViewer store={store} onClose={c} />) },
    {
      label: 'Install last built APK',
      icon: 'x_install',
      onClick: async () => {
        const f = await lastApk();
        if (!f) return toast('No APK built yet. Press Run first.', true);
        mount((c) => <BuildDialog store={store} installOnly={f} onClose={c} />);
      },
    },
    {
      label: 'Show Apk signatures',
      icon: 'x_signature',
      onClick: async () => {
        const f = await lastApk();
        if (!f) return toast('No APK built yet. Press Run first.', true);
        const bt = await newestBuildTools();
        if (!bt) return toast('Android SDK build-tools not found (set the SDK folder in Settings)', true);
        const env: Record<string, string> = {};
        if (getSettings().javaHome) env.JAVA_HOME = getSettings().javaHome;
        const r = await runCollect(`"${joinPath(bt, 'apksigner.bat')}"`, ['verify', '--verbose', '--print-certs', `"${f}"`], { env });
        mount((c) => <CodePage title={'Signatures · ' + baseName(f)} text={r.out} lang="text" onClose={c} />);
      },
    },
    { separator: true, label: '' },
    {
      label: 'Export Android Studio project (.zip)',
      icon: 'x_export',
      onClick: async () => {
        const out = await host().saveDialog({ title: 'Save Android Studio project', defaultPath: (store.project.projectName || 'project') + '.zip', filters: [{ name: 'Zip', extensions: ['zip'] }] });
        if (!out) return;
        await store.save();
        await ensureGeneratorReady(store.ws.root);
        await exportAndroidStudio(store.project, store.ws.root, out);
        toast('Exported ' + baseName(out));
      },
    },
    {
      label: 'Export backup (.swb)',
      icon: 'ic_mtrl_save',
      onClick: async () => {
        const out = await host().saveDialog({ title: 'Save Sketchware backup', defaultPath: `${store.project.projectName} v${store.project.versionName}.swb`, filters: [{ name: 'Sketchware backup', extensions: ['swb'] }] });
        if (!out) return;
        await store.save();
        await host().write(out, await store.ws.exportSwb(store.scId));
        toast('Backup saved: ' + baseName(out));
      },
    },
    {
      label: 'Open generated project folder',
      icon: 'ic_mtrl_folder',
      onClick: async () => {
        await store.save();
        await ensureGeneratorReady(store.ws.root);
        const r = await exportAndroidStudio(store.project, store.ws.root);
        host().openPath(r.projectDir);
      },
    },
  ]);
}
