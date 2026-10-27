// Electron main process: window + filesystem / dialog / process bridge for the renderer.
const { app, BrowserWindow, ipcMain, dialog, shell, Menu, protocol, net } = require('electron');
const { pathToFileURL } = require('url');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { spawn } = require('child_process');

const isDev = process.env.SW_DEV === '1';
if (process.env.SW_USERDATA) app.setPath('userData', process.env.SW_USERDATA);
if (process.env.SW_OFFSCREEN === '1') app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 980,
    // automated UI tests run in an off-screen window so they don't disturb a visible instance
    ...(process.env.SW_OFFSCREEN === '1' ? { x: -4000, y: 0, skipTaskbar: true, focusable: false } : {}),
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#1e1f22',
    title: 'Sketchware Desktop',
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: process.env.SW_OFFSCREEN !== '1',
    },
  });
  Menu.setApplicationMenu(null);
  if (isDev) {
    win.loadURL('http://localhost:5199');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') win.webContents.toggleDevTools();
    if (input.type === 'keyDown' && input.key === 'F5' && isDev) win.webContents.reload();
  });
}

protocol.registerSchemesAsPrivileged([{ scheme: 'swfile', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);

app.whenReady().then(() => {
  // swfile://local/<encoded absolute path> -> local file (images, fonts, sounds of projects)
  protocol.handle('swfile', (req) => {
    const u = new URL(req.url);
    const p = decodeURIComponent(u.pathname.replace(/^\//, ''));
    return net.fetch(pathToFileURL(p).toString());
  });
  createWindow();
});
app.on('window-all-closed', () => app.quit());

// ---------- filesystem ----------
const toBuf = (data) => (typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data));

ipcMain.handle('fs:read', async (_e, p) => {
  const b = await fsp.readFile(p);
  return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
});
ipcMain.handle('fs:readText', async (_e, p) => fsp.readFile(p, 'utf8'));
ipcMain.handle('fs:write', async (_e, p, data) => {
  await fsp.mkdir(path.dirname(p), { recursive: true });
  await fsp.writeFile(p, toBuf(data));
});
ipcMain.handle('fs:exists', async (_e, p) => fs.existsSync(p));
ipcMain.handle('fs:mkdir', async (_e, p) => { await fsp.mkdir(p, { recursive: true }); });
ipcMain.handle('fs:list', async (_e, p) => {
  if (!fs.existsSync(p)) return [];
  const ents = await fsp.readdir(p, { withFileTypes: true });
  return ents.map((d) => ({ name: d.name, dir: d.isDirectory() }));
});
ipcMain.handle('fs:listRecursive', async (_e, root) => {
  const out = [];
  async function walk(dir, rel) {
    if (!fs.existsSync(dir)) return;
    for (const d of await fsp.readdir(dir, { withFileTypes: true })) {
      const r = rel ? rel + '/' + d.name : d.name;
      if (d.isDirectory()) await walk(path.join(dir, d.name), r);
      else out.push(r);
    }
  }
  await walk(root, '');
  return out;
});
ipcMain.handle('fs:remove', async (_e, p) => { await fsp.rm(p, { recursive: true, force: true }); });
ipcMain.handle('fs:copy', async (_e, src, dst) => {
  await fsp.mkdir(path.dirname(dst), { recursive: true });
  await fsp.cp(src, dst, { recursive: true, force: true });
});
ipcMain.handle('fs:stat', async (_e, p) => {
  try {
    const s = await fsp.stat(p);
    return { size: s.size, mtime: s.mtimeMs, dir: s.isDirectory() };
  } catch {
    return null;
  }
});

// ---------- app / dialogs ----------
ipcMain.handle('app:paths', async () => ({
  documents: app.getPath('documents'),
  home: app.getPath('home'),
  userData: app.getPath('userData'),
  temp: app.getPath('temp'),
  appDir: path.join(__dirname, '..'),
  platform: process.platform,
}));
ipcMain.handle('dialog:open', async (_e, opts) => {
  const r = await dialog.showOpenDialog(win, opts || {});
  return r.canceled ? null : r.filePaths;
});
ipcMain.handle('dialog:save', async (_e, opts) => {
  const r = await dialog.showSaveDialog(win, opts || {});
  return r.canceled ? null : r.filePath;
});
ipcMain.handle('shell:open', async (_e, p) => shell.openPath(p));
ipcMain.handle('shell:reveal', async (_e, p) => shell.showItemInFolder(p));
ipcMain.handle('shell:external', async (_e, url) => {
  if (/^https?:\/\//.test(url)) await shell.openExternal(url);
});
ipcMain.handle('win:title', async (_e, t) => { if (win) win.setTitle(t); });

// ---------- processes (gradle / java builds) ----------
const procs = new Map();
let procSeq = 1;
ipcMain.handle('proc:spawn', async (e, cmd, args, opts) => {
  const id = procSeq++;
  const child = spawn(cmd, args || [], {
    cwd: opts && opts.cwd,
    env: { ...process.env, ...((opts && opts.env) || {}) },
    shell: !!(opts && opts.shell),
    windowsHide: true,
  });
  procs.set(id, child);
  const send = (ch, data) => { if (!e.sender.isDestroyed()) e.sender.send(ch, id, data); };
  child.stdout.on('data', (d) => send('proc:out', d.toString()));
  child.stderr.on('data', (d) => send('proc:err', d.toString()));
  child.on('error', (err) => send('proc:err', String(err && err.message ? err.message : err) + '\n'));
  child.on('close', (code) => { procs.delete(id); send('proc:exit', code); });
  return id;
});
ipcMain.handle('proc:kill', async (_e, id) => {
  const c = procs.get(id);
  if (!c) return;
  // shell-launched commands: kill the whole tree, not just cmd.exe
  if (process.platform === 'win32' && c.pid) spawn('taskkill', ['/pid', String(c.pid), '/T', '/F'], { windowsHide: true });
  else c.kill();
});

// ---------- synchronous fs (used by code ported from Java, which expects blocking IO) ----------
ipcMain.on('fsSync', (e, op, a, b) => {
  try {
    switch (op) {
      case 'readText':
        e.returnValue = { ok: true, v: fs.readFileSync(a, 'utf8') };
        return;
      case 'readBytes': {
        const buf = fs.readFileSync(a);
        e.returnValue = { ok: true, v: new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength) };
        return;
      }
      case 'write':
        fs.mkdirSync(path.dirname(a), { recursive: true });
        fs.writeFileSync(a, typeof b === 'string' ? b : Buffer.from(b));
        e.returnValue = { ok: true };
        return;
      case 'exists':
        e.returnValue = { ok: true, v: fs.existsSync(a) };
        return;
      case 'stat': {
        const s = fs.statSync(a);
        e.returnValue = { ok: true, v: { size: s.size, mtime: s.mtimeMs, dir: s.isDirectory() } };
        return;
      }
      case 'list':
        e.returnValue = { ok: true, v: fs.existsSync(a) ? fs.readdirSync(a, { withFileTypes: true }).map((d) => ({ name: d.name, dir: d.isDirectory() })) : [] };
        return;
      case 'mkdir':
        fs.mkdirSync(a, { recursive: true });
        e.returnValue = { ok: true };
        return;
      case 'remove':
        fs.rmSync(a, { recursive: true, force: true });
        e.returnValue = { ok: true };
        return;
      case 'copy':
        fs.mkdirSync(path.dirname(b), { recursive: true });
        fs.cpSync(a, b, { recursive: true, force: true });
        e.returnValue = { ok: true };
        return;
      case 'rename':
        fs.renameSync(a, b);
        e.returnValue = { ok: true };
        return;
    }
    e.returnValue = { ok: false, err: 'unknown op ' + op };
  } catch (err) {
    e.returnValue = { ok: false, err: String(err && err.message ? err.message : err) };
  }
});

// ---------- downloads (gradle distribution, etc.) ----------
ipcMain.handle('net:download', async (e, url, dest) => {
  const res = await net.fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
  const total = Number(res.headers.get('content-length') || 0);
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  const out = fs.createWriteStream(dest);
  const reader = res.body.getReader();
  let done = 0;
  let last = 0;
  for (;;) {
    const { done: end, value } = await reader.read();
    if (end) break;
    out.write(Buffer.from(value));
    done += value.length;
    if (Date.now() - last > 300 && !e.sender.isDestroyed()) {
      last = Date.now();
      e.sender.send('net:progress', url, done, total);
    }
  }
  await new Promise((r) => out.end(r));
  return dest;
});
