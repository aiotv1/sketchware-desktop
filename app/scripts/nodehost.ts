// Node implementations of the host + sync fs, for running core/codegen outside Electron.
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import { setHost, Host } from '../src/core/host';
import { setSyncFs } from '../src/sw/env';
import { DOMParser } from '@xmldom/xmldom';
(globalThis as any).DOMParser = DOMParser;

export function installNodeHost(appDir: string) {
  const h: Host = {
    read: async (p) => new Uint8Array(await fsp.readFile(p)),
    readText: (p) => fsp.readFile(p, 'utf8'),
    write: async (p, d) => {
      await fsp.mkdir(path.dirname(p), { recursive: true });
      await fsp.writeFile(p, typeof d === 'string' ? d : Buffer.from(d));
    },
    exists: async (p) => fs.existsSync(p),
    mkdir: async (p) => {
      await fsp.mkdir(p, { recursive: true });
    },
    list: async (p) => (fs.existsSync(p) ? (await fsp.readdir(p, { withFileTypes: true })).map((d) => ({ name: d.name, dir: d.isDirectory() })) : []),
    listRecursive: async (root) => {
      const out: string[] = [];
      const walk = (d: string, rel: string) => {
        if (!fs.existsSync(d)) return;
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          const r = rel ? rel + '/' + e.name : e.name;
          if (e.isDirectory()) walk(path.join(d, e.name), r);
          else out.push(r);
        }
      };
      walk(root, '');
      return out;
    },
    remove: async (p) => fsp.rm(p, { recursive: true, force: true }),
    copy: async (a, b) => {
      await fsp.mkdir(path.dirname(b), { recursive: true });
      await fsp.cp(a, b, { recursive: true, force: true });
    },
    stat: async (p) => {
      try {
        const s = await fsp.stat(p);
        return { size: s.size, mtime: s.mtimeMs, dir: s.isDirectory() };
      } catch {
        return null;
      }
    },
    paths: async () => ({ documents: os.homedir(), home: os.homedir(), userData: os.tmpdir(), temp: os.tmpdir(), appDir, platform: process.platform }),
    openDialog: async () => null,
    saveDialog: async () => null,
    openPath: async () => '',
    reveal: async () => {},
    openExternal: async () => {},
    setTitle: async () => {},
    spawn: async () => 0,
    kill: async () => {},
    onProc: () => () => {},
  };
  setHost(h);
  setSyncFs({
    readText: (p) => fs.readFileSync(p, 'utf8'),
    readBytes: (p) => new Uint8Array(fs.readFileSync(p)),
    write: (p, d) => {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, typeof d === 'string' ? d : Buffer.from(d));
    },
    exists: (p) => fs.existsSync(p),
    stat: (p) => {
      const s = fs.statSync(p);
      return { size: s.size, mtime: s.mtimeMs, dir: s.isDirectory() };
    },
    list: (p) => (fs.existsSync(p) ? fs.readdirSync(p, { withFileTypes: true }).map((d) => ({ name: d.name, dir: d.isDirectory() })) : []),
    mkdir: (p) => fs.mkdirSync(p, { recursive: true }),
    remove: (p) => fs.rmSync(p, { recursive: true, force: true }),
    copy: (a, b) => {
      fs.mkdirSync(path.dirname(b), { recursive: true });
      fs.cpSync(a, b, { recursive: true, force: true });
    },
    rename: (a, b) => fs.renameSync(a, b),
  });
}
