// Global app settings + workspace access.
import { host, joinPath } from '../core/host';
import { Workspace } from '../core/workspace';
import { setCustomBlocks } from '../blocks/registry';

export interface AppSettings {
  workspace: string;
  androidSdk: string;
  javaHome: string;
  blockZoom: number;
  showBuiltInBlocks: boolean;
  showEveryBlock: boolean;
  recent: string[];
  theme: 'dark' | 'light' | 'system';
}

export function applyTheme(t: AppSettings['theme']) {
  const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

let settings: AppSettings;
let settingsPath = '';
let ws: Workspace;

export async function loadSettings(): Promise<AppSettings> {
  const p = await host().paths();
  settingsPath = joinPath(p.userData, 'settings.json');
  const defaults: AppSettings = {
    workspace: joinPath(p.documents, 'SketchwareDesktop', '.sketchware'),
    androidSdk: '',
    javaHome: '',
    blockZoom: 1.5,
    showBuiltInBlocks: true,
    showEveryBlock: false,
    recent: [],
    theme: 'dark',
  };
  try {
    if (await host().exists(settingsPath)) {
      settings = { ...defaults, ...JSON.parse(await host().readText(settingsPath)) };
    } else settings = defaults;
  } catch {
    settings = defaults;
  }
  applyTheme(settings.theme);
  ws = new Workspace(settings.workspace);
  await ws.ensure();
  await reloadCustomBlocks();
  return settings;
}

export function getSettings(): AppSettings {
  return settings;
}

export async function saveSettings(patch: Partial<AppSettings>) {
  const wsChanged = patch.workspace && patch.workspace !== settings.workspace;
  settings = { ...settings, ...patch };
  if (patch.theme) applyTheme(patch.theme);
  await host().write(settingsPath, JSON.stringify(settings, null, 2));
  if (wsChanged) {
    ws = new Workspace(settings.workspace);
    await ws.ensure();
    await reloadCustomBlocks();
  }
}

export function workspace(): Workspace {
  return ws;
}

/** Custom blocks live in <workspace>/resources/block/My Block/{block.json,palette.json}, like on the phone. */
export function customBlocksDir() {
  return joinPath(settings.workspace, 'resources', 'block', 'My Block');
}

export async function reloadCustomBlocks() {
  const dir = customBlocksDir();
  let blocks: any[] = [];
  let palettes: any[] = [];
  try {
    const b = joinPath(dir, 'block.json');
    if (await host().exists(b)) blocks = JSON.parse((await host().readText(b)) || '[]');
  } catch {
    blocks = [];
  }
  try {
    const p = joinPath(dir, 'palette.json');
    if (await host().exists(p)) {
      palettes = JSON.parse((await host().readText(p)) || '[]').map((x: any, i: number) => ({
        index: 9 + i,
        text: String(x.name ?? 'Palette ' + (9 + i)),
        color: parseColorValue(x.color),
      }));
    }
  } catch {
    palettes = [];
  }
  setCustomBlocks(blocks, palettes);
  try {
    const m = joinPath(dir, 'menu.json');
    const list = (await host().exists(m)) ? JSON.parse((await host().readText(m)) || '[]') : [];
    customMenus = (Array.isArray(list) ? list : []).filter((x: any) => x && x.name).map((x: any) => ({ name: String(x.name), title: String(x.title ?? x.name), data: Array.isArray(x.data) ? x.data.map(String) : [] }));
  } catch {
    customMenus = [];
  }
}

/** Block selector menus (Block selector menu manager), used by %m.<name> inputs of custom blocks. */
export let customMenus: { name: string; title: string; data: string[] }[] = [];

function parseColorValue(c: any): number {
  if (typeof c === 'number') return c | 0;
  if (typeof c === 'string') {
    const s = c.replace('#', '');
    if (/^[0-9a-f]{6}$/i.test(s)) return (0xff000000 | parseInt(s, 16)) | 0;
    if (/^[0-9a-f]{8}$/i.test(s)) return parseInt(s, 16) | 0;
    const n = Number(c);
    if (!isNaN(n)) return n | 0;
  }
  return 0xff8a55d7 | 0;
}
