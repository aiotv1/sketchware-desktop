// Builds a debug APK from the generated Android Studio project with Gradle.
import { ProjectData } from '../core/project';
import { Workspace } from '../core/workspace';
import { host, joinPath, dirName } from '../core/host';
import { exportAndroidStudio } from './generator';
import { getSettings } from '../ui/appstate';

const GRADLE_VERSION = '8.14.3';
const GRADLE_URL = `https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip`;

function run(cmd: string, args: string[], opts: { cwd?: string; env?: Record<string, string> }, log: (s: string) => void): Promise<number> {
  return new Promise(async (resolve) => {
    const h = host();
    let id = -1;
    // events can arrive before spawn() resolves with the id: queue them until then
    const early: [string, number, any][] = [];
    const offs: (() => void)[] = [];
    const handle = (kind: string, pid: number, d: any) => {
      if (id < 0) return void early.push([kind, pid, d]);
      if (pid !== id) return;
      if (kind !== 'exit') return log(String(d));
      offs.forEach((f) => f());
      resolve(d ?? 1);
    };
    for (const k of ['out', 'err', 'exit'] as const) offs.push(h.onProc(k, (pid, d) => handle(k, pid, d)));
    id = await h.spawn(cmd, args, { ...opts, shell: true });
    for (const [k, pid, d] of early) handle(k, pid, d);
  });
}

async function findGradle(ws: Workspace, log: (s: string) => void): Promise<string> {
  const h = host();
  const isWin = (await h.paths()).platform === 'win32';
  const dir = joinPath(ws.root, '.desktop', 'gradle');
  const bin = joinPath(dir, `gradle-${GRADLE_VERSION}`, 'bin', isWin ? 'gradle.bat' : 'gradle');
  if (await h.exists(bin)) return bin;
  const zip = joinPath(dir, `gradle-${GRADLE_VERSION}-bin.zip`);
  // the zip only exists once a download completed (it is written as .part first)
  if (!(await h.exists(zip))) {
    if (!h.download) throw new Error('Downloading is not available');
    log(`Downloading Gradle ${GRADLE_VERSION} (one time, ~130 MB)…\n`);
    let lastPct = -1;
    const off = h.onDownloadProgress?.((_u, d, t) => {
      const pct = t ? Math.floor((d / t) * 10) * 10 : -1;
      if (pct > lastPct) {
        lastPct = pct;
        log(`  ${pct}%\n`);
      }
    });
    try {
      await h.download(GRADLE_URL, zip + '.part');
    } finally {
      off?.();
    }
    await h.copy(zip + '.part', zip);
    await h.remove(zip + '.part');
  }
  log('Extracting Gradle…\n');
  // on Windows use the system bsdtar: a GNU tar on PATH (e.g. from Git) reads "D:" as a remote host
  const tar = isWin ? '"%SystemRoot%\\System32\\tar.exe"' : 'tar';
  const code = await run(tar, ['-xf', `"${zip}"`, '-C', `"${dir}"`], {}, log);
  if (code !== 0 || !(await h.exists(bin))) throw new Error('Could not extract Gradle');
  await h.remove(zip);
  return bin;
}

/** Returns the path of the built APK, or null on failure (details are logged). */
export async function buildApk(p: ProjectData, ws: Workspace, log: (s: string) => void): Promise<string | null> {
  const h = host();
  const s = { ...getSettings() };
  if (!s.androidSdk) {
    // Android Studio's default SDK location
    const paths = await h.paths();
    const guess = paths.platform === 'win32' ? joinPath(paths.home, 'AppData', 'Local', 'Android', 'Sdk') : joinPath(paths.home, paths.platform === 'darwin' ? 'Library/Android/sdk' : 'Android/Sdk');
    if (await h.exists(joinPath(guess, 'platforms'))) {
      s.androidSdk = guess;
      log(`Using Android SDK at ${guess}\n`);
    }
  }
  if (!s.androidSdk || !(await h.exists(joinPath(s.androidSdk, 'platforms')))) {
    log(
      'Android SDK not found.\n\n' +
        'Install Android Studio (or the Android command-line tools) and set the SDK folder in Settings\n' +
        '(usually C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk). The SDK needs "platforms;android-34" and build-tools.\n' +
        'Alternatively use "Android Studio project (.zip)" and build it in Android Studio.\n',
    );
    return null;
  }
  const javaHome = s.javaHome;
  if (javaHome && !(await h.exists(joinPath(javaHome, 'bin')))) {
    log('The JDK folder in Settings does not contain bin/. Point it to a JDK 17 or newer.\n');
    return null;
  }

  log('Generating project…\n');
  const r = await exportAndroidStudio(p, ws.root);
  const dir = r.projectDir.replace(/\//g, '\\');
  await h.write(joinPath(r.projectDir, 'local.properties'), 'sdk.dir=' + s.androidSdk.replace(/\\/g, '\\\\') + '\n');

  const gradle = await findGradle(ws, log);
  log(`Running Gradle in ${dir}\n`);
  // keep Gradle's dependency cache next to the workspace instead of filling the system drive
  const env: Record<string, string> = { ANDROID_HOME: s.androidSdk, ANDROID_SDK_ROOT: s.androidSdk, GRADLE_USER_HOME: joinPath(ws.root, '.desktop', 'gradle-home') };
  if (javaHome) env.JAVA_HOME = javaHome;
  const code = await run(`"${gradle}"`, ['assembleDebug', '--no-daemon', '--console=plain'], { cwd: r.projectDir, env }, log);
  if (code !== 0) {
    log(`\nGradle failed (exit code ${code}).\n`);
    return null;
  }
  const apk = joinPath(r.projectDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (!(await h.exists(apk))) {
    log('Build finished but app-debug.apk was not found.\n');
    return null;
  }
  const outDir = joinPath(dirName(ws.root), 'apk');
  const out = joinPath(outDir, `${p.projectName || 'app'}_v${p.versionName}.apk`);
  await h.copy(apk, out);
  log(`\nAPK ready: ${out}\n`);
  return out;
}
