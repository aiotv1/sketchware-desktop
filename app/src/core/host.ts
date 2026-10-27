// Host abstraction: Electron preload bridge in the app, Node fs in scripts/tests.
export interface DirEntry {
  name: string;
  dir: boolean;
}

export interface Host {
  read(p: string): Promise<Uint8Array>;
  readText(p: string): Promise<string>;
  write(p: string, data: string | Uint8Array): Promise<void>;
  exists(p: string): Promise<boolean>;
  mkdir(p: string): Promise<void>;
  list(p: string): Promise<DirEntry[]>;
  listRecursive(p: string): Promise<string[]>;
  remove(p: string): Promise<void>;
  copy(a: string, b: string): Promise<void>;
  stat(p: string): Promise<{ size: number; mtime: number; dir: boolean } | null>;
  paths(): Promise<{ documents: string; home: string; userData: string; temp: string; appDir: string; platform: string }>;
  openDialog(o: any): Promise<string[] | null>;
  saveDialog(o: any): Promise<string | null>;
  openPath(p: string): Promise<string>;
  reveal(p: string): Promise<void>;
  openExternal(u: string): Promise<void>;
  setTitle(t: string): Promise<void>;
  spawn(cmd: string, args: string[], opts?: { cwd?: string; env?: Record<string, string>; shell?: boolean }): Promise<number>;
  kill(id: number): Promise<void>;
  onProc(kind: 'out' | 'err' | 'exit', fn: (id: number, data: any) => void): () => void;
  sync?(op: string, a?: any, b?: any): any;
  download?(url: string, dest: string): Promise<string>;
  onDownloadProgress?(fn: (url: string, done: number, total: number) => void): () => void;
}

let current: Host | null = null;

export function setHost(h: Host) {
  current = h;
}

export function host(): Host {
  if (current) return current;
  const w = (globalThis as any).host;
  if (w) {
    current = w as Host;
    return current;
  }
  throw new Error('No host available');
}

export function joinPath(...parts: string[]): string {
  const sep = parts.some((p) => p.includes('\\')) ? '\\' : '/';
  return parts
    .filter((p) => p !== '')
    .map((p, i) => (i === 0 ? p.replace(/[\\/]+$/, '') : p.replace(/^[\\/]+|[\\/]+$/g, '')))
    .join(sep);
}

export function baseName(p: string): string {
  const m = p.replace(/[\\/]+$/, '').split(/[\\/]/);
  return m[m.length - 1];
}

export function dirName(p: string): string {
  const i = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return i < 0 ? '' : p.substring(0, i);
}
