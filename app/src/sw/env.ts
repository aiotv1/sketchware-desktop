// Minimal Android / Java platform surface for code ported from Sketchware Pro.
// File access is synchronous (Electron sendSync) because the original code is blocking.
import { host } from '../core/host';
import { JMap, JOptional, jiter, jregex } from '../codegen/jshim';

// ------------------------------------------------------------------ sync fs
export interface SyncFs {
  readText(p: string): string;
  readBytes(p: string): Uint8Array;
  write(p: string, data: string | Uint8Array): void;
  exists(p: string): boolean;
  stat(p: string): { size: number; mtime: number; dir: boolean };
  list(p: string): { name: string; dir: boolean }[];
  mkdir(p: string): void;
  remove(p: string): void;
  copy(a: string, b: string): void;
  rename(a: string, b: string): void;
}

let syncFs: SyncFs | null = null;

export function setSyncFs(fs: SyncFs) {
  syncFs = fs;
}

export function sfs(): SyncFs {
  if (syncFs) return syncFs;
  const h: any = host();
  if (!h.sync) throw new Error('synchronous fs unavailable');
  const call = (op: string, a?: any, b?: any) => {
    const r = h.sync(op, a, b);
    if (!r.ok) throw new Error(r.err);
    return r.v;
  };
  syncFs = {
    readText: (p) => call('readText', p),
    readBytes: (p) => call('readBytes', p),
    write: (p, d) => call('write', p, d),
    exists: (p) => call('exists', p),
    stat: (p) => call('stat', p),
    list: (p) => call('list', p),
    mkdir: (p) => call('mkdir', p),
    remove: (p) => call('remove', p),
    copy: (a, b) => call('copy', a, b),
    rename: (a, b) => call('rename', a, b),
  };
  return syncFs;
}

function norm(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+/g, '/');
}

// ------------------------------------------------------------------ external storage (parent of the workspace)
let externalStorage = '/sdcard';
export function setExternalStorage(path: string) {
  externalStorage = norm(path).replace(/\/$/, '');
}
export function getExternalStorage() {
  return externalStorage;
}

export class JFile {
  path: string;
  constructor(a: any, b?: string) {
    if (b === undefined) this.path = norm(a instanceof JFile ? a.path : String(a));
    else {
      const parent = a instanceof JFile ? a.path : String(a);
      this.path = norm(parent + '/' + b);
    }
    if (this.path.length > 1 && this.path.endsWith('/')) this.path = this.path.slice(0, -1);
  }
  getAbsolutePath() {
    return this.path;
  }
  getPath() {
    return this.path;
  }
  getCanonicalPath() {
    return this.path;
  }
  toString() {
    return this.path;
  }
  getName() {
    const i = this.path.lastIndexOf('/');
    return i < 0 ? this.path : this.path.substring(i + 1);
  }
  getParent() {
    const i = this.path.lastIndexOf('/');
    return i <= 0 ? null : this.path.substring(0, i);
  }
  getParentFile() {
    const p = this.getParent();
    return p == null ? null : new JFile(p);
  }
  exists() {
    return sfs().exists(this.path);
  }
  isDirectory() {
    return this.exists() && sfs().stat(this.path).dir;
  }
  isFile() {
    return this.exists() && !sfs().stat(this.path).dir;
  }
  length() {
    return this.exists() ? sfs().stat(this.path).size : 0;
  }
  lastModified() {
    return this.exists() ? sfs().stat(this.path).mtime : 0;
  }
  mkdirs() {
    sfs().mkdir(this.path);
    return true;
  }
  mkdir() {
    return this.mkdirs();
  }
  delete() {
    if (!this.exists()) return false;
    sfs().remove(this.path);
    return true;
  }
  createNewFile() {
    if (this.exists()) return false;
    sfs().write(this.path, '');
    return true;
  }
  list(): string[] | null {
    if (!this.isDirectory()) return null;
    return sfs()
      .list(this.path)
      .map((e) => e.name);
  }
  listFiles(filter?: any): JFile[] | null {
    if (!this.isDirectory()) return null;
    let files = sfs()
      .list(this.path)
      .map((e) => new JFile(this.path, e.name));
    if (typeof filter === 'function') files = files.filter((f) => filter(f));
    return files;
  }
  renameTo(f: JFile) {
    sfs().rename(this.path, f.path);
    return true;
  }
  equals(o: any) {
    return o instanceof JFile && o.path === this.path;
  }
  toPath() {
    return this;
  }
}

export const File = { separator: '/', separatorChar: '/', pathSeparator: ':' };

export const Environment = {
  getExternalStorageDirectory: () => new JFile(externalStorage),
  DIRECTORY_DOWNLOADS: 'Download',
  DIRECTORY_DCIM: 'DCIM',
};

// ------------------------------------------------------------------ pro.sketchware.utility.FileUtil (subset)
export const FileUtil = {
  getExternalStorageDir: () => externalStorage,
  readFile(path: string): string {
    try {
      return sfs().exists(path) ? sfs().readText(path) : '';
    } catch {
      return '';
    }
  },
  readFileIfExist(path: string): string {
    return FileUtil.readFile(path);
  },
  writeFile(path: string, content: string) {
    // static initializers of ported classes may run before the workspace is known: never write to /sdcard
    if (externalStorage === '/sdcard' && norm(path).startsWith('/sdcard')) return;
    sfs().write(path, content ?? '');
  },
  isExistFile(path: string): boolean {
    return !!path && sfs().exists(path);
  },
  makeDir(path: string) {
    sfs().mkdir(path);
  },
  deleteFile(path: string) {
    if (sfs().exists(path)) sfs().remove(path);
  },
  copyFile(a: string, b: string) {
    if (sfs().exists(a)) sfs().copy(a, b);
  },
  copyDirectory(a: any, b: any) {
    const sa = a instanceof JFile ? a.path : a;
    const sb = b instanceof JFile ? b.path : b;
    if (sfs().exists(sa)) sfs().copy(sa, sb);
  },
  moveFile(a: string, b: string) {
    sfs().rename(a, b);
  },
  isDirectory(path: string) {
    return sfs().exists(path) && sfs().stat(path).dir;
  },
  isFile(path: string) {
    return sfs().exists(path) && !sfs().stat(path).dir;
  },
  getFileLength(path: string) {
    return sfs().exists(path) ? sfs().stat(path).size : 0;
  },
  listDir(path: string, list: string[]) {
    list.length = 0;
    if (!sfs().exists(path)) return;
    for (const e of sfs().list(path)) list.push(norm(path + '/' + e.name));
  },
  getLastSegmentPath(path: string) {
    const p = norm(path);
    return p.substring(p.lastIndexOf('/') + 1);
  },
};

// ------------------------------------------------------------------ messages
export const envLog: { level: 'info' | 'error'; message: string }[] = [];
let toastHandler: ((msg: string, error: boolean) => void) | null = null;
export function setToastHandler(fn: (msg: string, error: boolean) => void) {
  toastHandler = fn;
}
function say(level: 'info' | 'error', msg: any) {
  const m = String(msg);
  envLog.push({ level, message: m });
  if (envLog.length > 500) envLog.shift();
  toastHandler?.(m, level === 'error');
}
export const SketchwareUtil = {
  toast: (msg: any, _len?: any) => say('info', msg),
  toastError: (msg: any, _len?: any) => say('error', msg),
  showMessage: (_ctx: any, msg: any) => say('info', msg),
  showAnotherMessage: (_ctx: any, msg: any) => say('info', msg),
  getDip: (_ctx: any, v: number) => v,
};
export const Toast = { LENGTH_SHORT: 0, LENGTH_LONG: 1 };
export const Log = {
  v: (..._a: any[]) => {},
  d: (..._a: any[]) => {},
  i: (..._a: any[]) => {},
  w: (..._a: any[]) => {},
  e: (...a: any[]) => console.warn('[sw]', ...a),
  getStackTraceString: (e: any) => String(e?.stack ?? e),
};

// ------------------------------------------------------------------ exceptions
export class RuntimeException extends Error {
  constructor(msg?: any) {
    super(msg instanceof Error ? msg.message : msg == null ? '' : String(msg));
  }
  getMessage() {
    return this.message;
  }
  printStackTrace() {
    console.warn(this);
  }
}
export class IllegalArgumentException extends RuntimeException {}
export class IllegalStateException extends RuntimeException {}
export class IOException extends RuntimeException {}
export class NumberFormatException extends RuntimeException {}
(Error.prototype as any).getMessage = function () {
  return this.message;
};
(Error.prototype as any).printStackTrace = function () {
  console.warn(this);
};

// ------------------------------------------------------------------ android.view / widget constants
export const ViewGroup = { LayoutParams: { MATCH_PARENT: -1, WRAP_CONTENT: -2, FILL_PARENT: -1 } };
export const LinearLayout = { HORIZONTAL: 0, VERTICAL: 1, LayoutParams: { MATCH_PARENT: -1, WRAP_CONTENT: -2 } };

export const CharBuffer = {
  wrap: (s: string) => {
    let pos = 0;
    return {
      get: (i?: number) => (i === undefined ? s.charAt(pos++) : s.charAt(i)),
      hasRemaining: () => pos < s.length,
      length: s.length,
      toString: () => s,
    };
  },
};

// ------------------------------------------------------------------ org.json (subset)
export class JSONObject {
  o: any;
  constructor(src?: any) {
    this.o = typeof src === 'string' ? JSON.parse(src) : src ?? {};
  }
  getString(k: string) {
    if (!(k in this.o)) throw new Error('JSONObject["' + k + '"] not found.');
    return String(this.o[k]);
  }
  optString(k: string, d = '') {
    return k in this.o ? String(this.o[k]) : d;
  }
  getInt(k: string) {
    return Number(this.o[k]) | 0;
  }
  getBoolean(k: string) {
    return this.o[k] === true || this.o[k] === 'true';
  }
  has(k: string) {
    return k in this.o;
  }
  isNull(k: string) {
    return this.o[k] === null || this.o[k] === undefined;
  }
  get(k: string) {
    return this.o[k];
  }
  getJSONArray(k: string) {
    return new JSONArray(this.o[k]);
  }
  getJSONObject(k: string) {
    return new JSONObject(this.o[k]);
  }
  put(k: string, v: any) {
    this.o[k] = v instanceof JSONObject || v instanceof JSONArray ? (v as any).o ?? (v as any).a : v;
    return this;
  }
  toString() {
    return JSON.stringify(this.o);
  }
}
export class JSONArray {
  a: any[];
  constructor(src?: any) {
    this.a = typeof src === 'string' ? JSON.parse(src) : src ?? [];
  }
  get length() {
    return this.a.length;
  }
  getJSONObject(i: number) {
    return new JSONObject(this.a[i]);
  }
  getString(i: number) {
    return String(this.a[i]);
  }
  get(i: number) {
    return this.a[i];
  }
  put(v: any) {
    this.a.push(v);
    return this;
  }
  toString() {
    return JSON.stringify(this.a);
  }
}

// ------------------------------------------------------------------ XmlPullParser (DOM-backed)
export const XmlPullParser = { START_DOCUMENT: 0, END_DOCUMENT: 1, START_TAG: 2, END_TAG: 3, TEXT: 4 };

class PullParser {
  private events: { type: number; el?: Element; text?: string }[] = [];
  private pos = 0;
  setInput(reader: any) {
    const src = typeof reader === 'string' ? reader : reader?.s ?? '';
    const doc = new DOMParser().parseFromString(src, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('XmlPullParserException');
    this.events = [{ type: 0 }];
    const walk = (n: Node) => {
      if (n.nodeType === 1) {
        this.events.push({ type: 2, el: n as Element });
        for (let i = 0; i < n.childNodes.length; i++) walk(n.childNodes[i] ?? (n.childNodes as any).item(i));
        this.events.push({ type: 3, el: n as Element });
      } else if (n.nodeType === 3 && n.textContent!.trim()) {
        this.events.push({ type: 4, text: n.textContent! });
      }
    };
    walk(doc.documentElement);
    this.events.push({ type: 1 });
    this.pos = 0;
  }
  getEventType() {
    return this.events[this.pos].type;
  }
  next() {
    this.pos = Math.min(this.pos + 1, this.events.length - 1);
    return this.getEventType();
  }
  private attrs() {
    const el = this.events[this.pos].el;
    if (!el) return [];
    const out: Attr[] = [];
    for (let i = 0; i < el.attributes.length; i++) out.push(el.attributes[i] ?? (el.attributes as any).item(i));
    return out;
  }
  getName() {
    return this.events[this.pos].el?.localName ?? null;
  }
  getText() {
    return this.events[this.pos].text ?? null;
  }
  getAttributeCount() {
    return this.attrs().length;
  }
  getAttributeName(i: number) {
    return this.attrs()[i].localName;
  }
  getAttributeNamespace(i: number) {
    return this.attrs()[i].namespaceURI ?? '';
  }
  getAttributePrefix(i: number) {
    return this.attrs()[i].prefix;
  }
  getAttributeValue(i: any, name?: string) {
    if (typeof i === 'number') return this.attrs()[i].value;
    return this.events[this.pos].el?.getAttributeNS(i, name!) ?? null;
  }
}
export const XmlPullParserFactory = {
  newInstance: () => ({ setNamespaceAware: (_b: boolean) => {}, newPullParser: () => new PullParser() }),
};
export const LogUtil = Log;

// ------------------------------------------------------------------ resources: R.x.y -> "y"
const rCategory = (cat: string) => new Proxy({}, { get: (_t, k) => (typeof k === 'string' ? k : undefined) });
export const R: any = new Proxy({}, { get: (_t, k) => rCategory(String(k)) });

/** A small subset of Sketchware's strings.xml used by ported non-UI code. */
const STRINGS: Record<string, string> = {
  common_word_select: 'Select',
  common_word_cancel: 'Cancel',
};

export const Helper = {
  getResString: (id: any) => STRINGS[id] ?? String(id),
  getText: (v: any) => String(v?.value ?? v ?? ''),
  TYPE_MAP: 'map',
  TYPE_MAP_LIST: 'mapList',
  TYPE_STRING_MAP: 'map',
  TYPE_STRING_ARRAY: 'list',
  TYPE_STRING: 'list',
  createStringList: (...xs: string[]) => [...xs],
};

// ------------------------------------------------------------------ Gson
export function toJava(v: any): any {
  if (Array.isArray(v)) return v.map(toJava);
  if (v && typeof v === 'object') {
    const m = new JMap();
    for (const k of Object.keys(v)) m.put(k, toJava(v[k]));
    return m;
  }
  return v;
}

export function fromJava(v: any): any {
  if (v instanceof JMap) {
    const o: any = {};
    v.forEach((k, val) => (o[k] = fromJava(val)));
    return o;
  }
  if (Array.isArray(v)) return v.map(fromJava);
  if (v && typeof v === 'object' && typeof v.toJsonObject === 'function') return v.toJsonObject();
  return v;
}

export class Gson {
  pretty = false;
  fromJson(json: string, _type?: any): any {
    if (json == null) return null;
    const t = String(json).trim();
    if (!t) return null;
    return toJava(JSON.parse(t));
  }
  toJson(obj: any): string {
    return this.pretty ? JSON.stringify(fromJava(obj), null, 2) : JSON.stringify(fromJava(obj));
  }
}
export class GsonBuilder {
  private g = new Gson();
  setPrettyPrinting() {
    this.g.pretty = true;
    return this;
  }
  excludeFieldsWithoutExposeAnnotation() {
    return this;
  }
  disableHtmlEscaping() {
    return this;
  }
  create() {
    return this.g;
  }
}
export class TypeToken {
  getType() {
    return null;
  }
}

// ------------------------------------------------------------------ regex
export class Matcher {
  private re: RegExp;
  private m: RegExpExecArray | null = null;
  constructor(re: RegExp, private input: string) {
    this.re = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  }
  find(): boolean {
    this.m = this.re.exec(this.input);
    if (this.m && this.m[0].length === 0) this.re.lastIndex++;
    return this.m !== null;
  }
  matches(): boolean {
    const r = new RegExp('^(?:' + this.re.source + ')$', this.re.flags.replace('g', ''));
    this.m = r.exec(this.input);
    return this.m !== null;
  }
  lookingAt(): boolean {
    const r = new RegExp('^(?:' + this.re.source + ')', this.re.flags.replace('g', ''));
    this.m = r.exec(this.input);
    return this.m !== null;
  }
  group(i: number | string = 0): string | null {
    if (!this.m) throw new Error('No match found');
    const v = typeof i === 'string' ? this.m.groups?.[i] : this.m[i];
    return v === undefined ? null : v;
  }
  groupCount() {
    return this.m ? this.m.length - 1 : 0;
  }
  start(i = 0) {
    return this.m ? this.m.index + (i === 0 ? 0 : this.m[0].indexOf(this.m[i])) : -1;
  }
  end(i = 0) {
    return this.m ? this.start(i) + (this.m[i] ?? '').length : -1;
  }
  replaceAll(repl: string | ((m: any) => string)): string {
    const r = new RegExp(this.re.source, this.re.flags);
    if (typeof repl === 'function') return this.input.replace(r, (...a) => repl({ group: (i: number) => a[i] }));
    return this.input.replace(r, repl.replace(/\\\$/g, '$$$$'));
  }
  replaceFirst(repl: string): string {
    return this.input.replace(new RegExp(this.re.source, this.re.flags.replace('g', '')), repl);
  }
  jreplaceAll(repl: any): string {
    return this.replaceAll(repl);
  }
  jreplaceFirst(repl: string): string {
    return this.replaceFirst(repl);
  }
  reset(input?: string) {
    if (input !== undefined) this.input = input;
    this.re.lastIndex = 0;
    return this;
  }
}

export class Pattern {
  static CASE_INSENSITIVE = 2;
  static MULTILINE = 8;
  static DOTALL = 32;
  constructor(public re: RegExp) {}
  static compile(regex: string, flags = 0): Pattern {
    let f = '';
    if (flags & 2) f += 'i';
    if (flags & 8) f += 'm';
    if (flags & 32) f += 's';
    let src = jregex(regex);
    if (src.startsWith('(?s)')) {
      src = src.substring(4);
      f += 's';
    }
    if (src.startsWith('(?i)')) {
      src = src.substring(4);
      f += 'i';
    }
    return new Pattern(new RegExp(src, f));
  }
  static quote(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  static matches(regex: string, input: string) {
    return Pattern.compile(regex).matcher(input).matches();
  }
  matcher(input: string) {
    return new Matcher(this.re, String(input));
  }
  pattern() {
    return this.re.source;
  }
  split(s: string) {
    return s.split(this.re);
  }
  jsplit(s: string) {
    return s.split(this.re);
  }
}

// ------------------------------------------------------------------ collections & misc
export const Collections = {
  sort<T>(list: T[], cmp?: any) {
    if (cmp && typeof cmp === 'object' && typeof cmp.compare === 'function') list.sort((a, b) => cmp.compare(a, b));
    else if (typeof cmp === 'function') list.sort(cmp);
    else list.sort((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0));
  },
  reverse<T>(list: T[]) {
    list.reverse();
  },
  emptyList: () => [],
  emptyMap: () => new JMap(),
  swap<T>(list: T[], i: number, j: number) {
    const t = list[i];
    list[i] = list[j];
    list[j] = t;
  },
  unmodifiableList: <T>(l: T[]) => l,
  addAll<T>(list: T[], ...items: T[]) {
    list.push(...items);
    return true;
  },
  singletonList: <T>(x: T) => [x],
};
export const Arrays = {
  asList: <T>(...xs: T[]) => (xs.length === 1 && Array.isArray(xs[0]) ? [...(xs[0] as any)] : xs),
  sort: (a: any[]) => a.sort(),
  toString: (a: any[]) => '[' + a.join(', ') + ']',
  fill: (a: any[], v: any) => a.fill(v),
  stream: (a: any[]) => a.stream(),
};
export const Optional = {
  of: <T>(v: T) => new JOptional(v),
  ofNullable: <T>(v: T) => new JOptional(v),
  empty: () => new JOptional(undefined),
};
export const Objects = {
  equals: (a: any, b: any) => (a == null ? b == null : a === b || (typeof a.equals === 'function' && a.equals(b))),
  requireNonNull: <T>(x: T) => x,
  hash: (...a: any[]) => a.join('|').length,
};

export const Build = { VERSION: { SDK_INT: 34 }, VERSION_CODES: { S: 31, LOLLIPOP: 21, M: 23, N: 24, O: 26, P: 28, Q: 29, R: 30, TIRAMISU: 33 } };

export const Color = {
  TRANSPARENT: 0,
  BLACK: 0xff000000 | 0,
  WHITE: 0xffffffff | 0,
  RED: 0xffff0000 | 0,
  GREEN: 0xff00ff00 | 0,
  BLUE: 0xff0000ff | 0,
  GRAY: 0xff888888 | 0,
  parseColor(s: string): number {
    let t = String(s).trim();
    const named: Record<string, string> = { black: '#000000', white: '#ffffff', red: '#ff0000', green: '#00ff00', blue: '#0000ff', gray: '#888888', transparent: '#00000000' };
    if (named[t.toLowerCase()]) t = named[t.toLowerCase()];
    if (!t.startsWith('#')) throw new Error('Unknown color');
    t = t.substring(1);
    if (t.length === 6) return (0xff000000 | parseInt(t, 16)) | 0;
    if (t.length === 8) return parseInt(t, 16) | 0;
    throw new Error('Unknown color');
  },
  argb: (a: number, r: number, g: number, b: number) => ((a << 24) | (r << 16) | (g << 8) | b) | 0,
  rgb: (r: number, g: number, b: number) => ((0xff << 24) | (r << 16) | (g << 8) | b) | 0,
};

export const Gravity = {
  NO_GRAVITY: 0,
  TOP: 48,
  BOTTOM: 80,
  LEFT: 3,
  RIGHT: 5,
  START: 0x800003,
  END: 0x800005,
  CENTER_VERTICAL: 16,
  CENTER_HORIZONTAL: 1,
  CENTER: 17,
  FILL: 119,
  FILL_VERTICAL: 112,
  FILL_HORIZONTAL: 7,
};

export const Uri = {
  parse: (s: string) => ({
    toString: () => s,
    getLastPathSegment: () => {
      const p = s.split('?')[0].split('/');
      return p[p.length - 1];
    },
    getPath: () => s,
  }),
  fromFile: (f: JFile) => Uri.parse('file://' + f.path),
};

export const TextUtils = { isEmpty: (s: any) => s == null || String(s).length === 0, join: (sep: string, l: any) => [...jiter(l)].join(sep) };

/** android.content.Context placeholder (ported code only passes it around). */
const fakeContext = {
  getFilesDir: () => new JFile(externalStorage + '/.sketchware/.desktop/files'),
  getCacheDir: () => new JFile(externalStorage + '/.sketchware/.desktop/cache'),
  getExternalFilesDir: () => new JFile(externalStorage + '/.sketchware/.desktop/files'),
  getString: (id: any) => Helper.getResString(id),
  getPackageName: () => 'pro.sketchware',
  getApplicationContext: () => fakeContext,
};
export const SketchApplication = { getContext: () => fakeContext };
export const getContext = () => fakeContext;

export function capitalize(value: string): string {
  if (value == null || value.length === 0) return value;
  return value.substring(0, 1).toUpperCase() + value.substring(1);
}
