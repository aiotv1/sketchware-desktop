// Small helpers shared by the Configuration managers.
import { host, joinPath, dirName } from '../../../core/host';
import { ProjectStore } from '../store';

export function dataPath(store: ProjectStore, ...rel: string[]) {
  return joinPath(store.ws.dataDir(store.scId), ...rel);
}

export async function readText(path: string, def = ''): Promise<string> {
  try {
    return (await host().exists(path)) ? await host().readText(path) : def;
  } catch {
    return def;
  }
}

export async function readJson<T>(path: string, def: T): Promise<T> {
  const t = await readText(path);
  if (!t.trim()) return def;
  try {
    return JSON.parse(t) as T;
  } catch {
    return def;
  }
}

export async function writeText(path: string, text: string) {
  await host().mkdir(dirName(path));
  await host().write(path, text);
}

export async function writeJson(path: string, v: any) {
  await writeText(path, JSON.stringify(v));
}

export type MapList = Record<string, any>[];
