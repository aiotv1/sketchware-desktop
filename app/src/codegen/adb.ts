// adb helpers for installing / running the built APK on a phone or emulator (Sketchware's "Install" step).
import { host, joinPath } from '../core/host';
import { getSettings } from '../ui/appstate';

export interface AdbDevice {
  serial: string;
  model: string;
}

export function adbPath(): string {
  const sdk = getSettings().androidSdk;
  return sdk ? joinPath(sdk, 'platform-tools', 'adb.exe') : 'adb';
}

/** Runs a command and collects its output. */
export function runCollect(cmd: string, args: string[], opts: { cwd?: string; env?: Record<string, string> } = {}, onLine?: (s: string) => void): Promise<{ code: number; out: string }> {
  return new Promise(async (resolve) => {
    const h = host();
    let id = -1;
    let out = '';
    const early: [string, number, any][] = [];
    const offs: (() => void)[] = [];
    const handle = (kind: string, pid: number, d: any) => {
      if (id < 0) return void early.push([kind, pid, d]);
      if (pid !== id) return;
      if (kind !== 'exit') {
        out += String(d);
        onLine?.(String(d));
        return;
      }
      offs.forEach((f) => f());
      resolve({ code: d ?? 1, out });
    };
    for (const k of ['out', 'err', 'exit'] as const) offs.push(h.onProc(k, (pid, d) => handle(k, pid, d)));
    id = await h.spawn(cmd, args, { ...opts, shell: true });
    for (const [k, pid, d] of early) handle(k, pid, d);
  });
}

const q = (s: string) => `"${s}"`;

export async function listDevices(): Promise<AdbDevice[]> {
  const r = await runCollect(q(adbPath()), ['devices', '-l']);
  return r.out
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => /\sdevice(\s|$)/.test(l))
    .map((l) => ({ serial: l.split(/\s+/)[0], model: (l.match(/model:(\S+)/)?.[1] ?? '').replace(/_/g, ' ') }));
}

export async function installApk(serial: string, apk: string, log: (s: string) => void) {
  return runCollect(q(adbPath()), ['-s', serial, 'install', '-r', '-t', q(apk)], {}, log);
}

export async function launchApp(serial: string, pkg: string) {
  return runCollect(q(adbPath()), ['-s', serial, 'shell', 'monkey', '-p', pkg, '-c', 'android.intent.category.LAUNCHER', '1']);
}

/** Streams `adb logcat` until the returned function is called. */
export async function startLogcat(serial: string, onText: (s: string) => void): Promise<() => void> {
  const h = host();
  const id = await h.spawn(q(adbPath()), ['-s', serial, 'logcat', '-v', 'threadtime'], { shell: true });
  const offs = [h.onProc('out', (pid, d) => pid === id && onText(String(d))), h.onProc('err', (pid, d) => pid === id && onText(String(d)))];
  return () => {
    offs.forEach((f) => f());
    h.kill(id);
  };
}
