// Hand-written replacements for Sketchware classes that are compiled-only (a.a.a.eC/hC/iC/lC/yB/oB/...),
// Kotlin, or tied to Android. They expose the same method names the ported generator code calls.
import { JMap, Pair, jiter } from '../codegen/jshim';
import { BlockBean, ComponentBean, EventBean, ProjectFileBean, ProjectLibraryBean, ViewBean } from '../core/beans';
import type { ProjectData } from '../core/project';
import { getExtraBlock, getAllExtraBlocks, parseColor, tokenizeSpec } from '../blocks/registry';
import { FileUtil, JFile, sfs, getExternalStorage, Gson } from './env';
import { BuiltInLibraryManager } from './BuiltInLibraryManager';
import { BuiltInLibraries } from './BuiltInLibraries';
import { ExtLibSelected } from './ExtLibSelected';

// ------------------------------------------------------------------ current project
let current: ProjectData | null = null;
let workspaceRoot = '';

/** Must be called before running ported code: binds jC.a(sc_id) & co to this project. */
export function setCurrentProject(p: ProjectData, wsRoot: string) {
  current = p;
  workspaceRoot = wsRoot.replace(/\\/g, '/');
}
export function currentProject(): ProjectData {
  if (!current) throw new Error('No project bound for code generation');
  return current;
}
export function workspaceRootPath() {
  return workspaceRoot;
}

// ------------------------------------------------------------------ com.besome.sketch.Config
export const VAR_DEFAULT_MIN_SDK_VERSION = 21;
export const VAR_DEFAULT_TARGET_SDK_VERSION = 34;
export const Config = { VAR_DEFAULT_MIN_SDK_VERSION, VAR_DEFAULT_TARGET_SDK_VERSION };

// ------------------------------------------------------------------ a.a.a.yB (typed map getters)
export class yB {
  static a(map: any, key: string, def?: any): any {
    const v = map instanceof JMap ? map.get(key) : map?.[key];
    if (def === undefined) {
      // a(Map, String) -> boolean
      return v === true || v === 'true';
    }
    if (typeof def === 'boolean') return v == null ? def : v === true || v === 'true';
    if (v == null) return def;
    const n = Number(v);
    return isNaN(n) ? def : n | 0;
  }
  static b(map: any, key: string): number {
    const v = map instanceof JMap ? map.get(key) : map?.[key];
    const n = Number(v);
    return v == null || isNaN(n) ? 0 : n | 0;
  }
  static c(map: any, key: string): string {
    const v = map instanceof JMap ? map.get(key) : map?.[key];
    return v == null ? '' : String(v);
  }
}

// ------------------------------------------------------------------ a.a.a.lC (project list)
export class lC {
  static b(_scId: string): JMap {
    return new JMap(currentProject().meta);
  }
}

// ------------------------------------------------------------------ project data managers
function pairs<A, B>(list: [A, B][] | undefined): Pair<A, B>[] {
  return (list ?? []).map(([a, b]) => new Pair(a, b));
}

const LAYOUT_TYPES = [0, 2, 1, 36, 37, 38, 39, 40, 12];

/** a.a.a.eC: logic + view data of a project. */
export class eC {
  constructor(public p: ProjectData) {}

  /** field "a" of a.a.a.eC: the sc_id */
  get a$(): string {
    return this.p.scId;
  }

  /** eC.a(ArrayList<ViewBean>) static: views ordered as a tree (root children by index, then nested). */
  static a(...args: any[]): any {
    if (args.length === 1 && Array.isArray(args[0])) return eC.sortViews(args[0]);
    if (args.length === 2 && Array.isArray(args[0])) return eC.childrenOf(args[0], args[1]);
    throw new Error('eC.a static overload');
  }

  static sortViews(list: ViewBean[]): ViewBean[] {
    const roots = list.filter((v) => v.parent === 'root').sort((a, b) => a.index - b.index);
    const out = [...roots];
    for (const v of roots) if (LAYOUT_TYPES.includes(v.type)) out.push(...eC.childrenOf(list, v));
    return out;
  }

  static childrenOf(list: ViewBean[], parent: ViewBean): ViewBean[] {
    const kids = list.filter((v) => v.parent === parent.id).sort((a, b) => a.index - b.index);
    const out = [...kids];
    for (const v of kids) if (LAYOUT_TYPES.includes(v.type)) out.push(...eC.childrenOf(list, v));
    return out;
  }

  // ---- instance overloads (by argument types)
  a(...args: any[]): any {
    if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'string') return this.p.getBlocks(args[0], args[1]);
    if (args.length === 1 && Array.isArray(args[0])) return eC.sortViews(args[0]);
    throw new Error('eC.a overload ' + args.length);
  }
  b(...args: any[]): any {
    if (args.length === 1) {
      const m = new JMap<string, BlockBean[]>();
      this.p.blocks.get(args[0])?.forEach((v, k) => m.put(k, v));
      return m;
    }
    if (args.length === 2 && typeof args[1] === 'number') return this.p.getComponentsOfType(args[0], args[1]).map((c) => c.componentId);
    if (args.length === 2) return this.p.getFuncs(args[0]).find((f) => f[0] === args[1])?.[1] ?? '';
    throw new Error('eC.b overload');
  }
  c(...args: any[]): any {
    if (args.length === 1) return this.p.getLists(args[0]).map((l) => l[1]);
    if (args.length === 2 && typeof args[1] === 'number') return this.p.getComponentsOfType(args[0], args[1]);
    if (args.length === 2) return this.p.getView(args[0], args[1]) ?? null;
    throw new Error('eC.c overload');
  }
  d(...args: any[]): any {
    if (args.length === 1) return this.p.views.get(args[0]) ?? [];
    if (args.length === 2) return this.p.getListNames(args[0], args[1]);
    throw new Error('eC.d overload');
  }
  e(...args: any[]): any {
    if (args.length === 1) return this.p.components.get(args[0]) ?? [];
    if (args.length === 2) return this.p.getVarNames(args[0], args[1]);
    throw new Error('eC.e overload');
  }
  f(...args: any[]): any {
    if (args.length === 1) {
      return (this.p.views.get(args[0]) ?? []).filter((v) => [9, 10, 25, 48, 31].includes(v.type) && v.customView && v.customView !== 'none');
    }
    if (args.length === 2 && typeof args[1] === 'number') return this.p.hasComponentType(args[0], args[1]);
    if (args.length === 3) return (this.p.vars.get(args[0]) ?? []).some((x) => x[0] === args[1] && x[1] === args[2]);
    // f(java, name): is a more block used
    const name = args[1];
    for (const [k, list] of this.p.blocks.get(args[0]) ?? new Map()) {
      if (k === name + '_moreBlock') continue;
      for (const b of list) {
        if (b.opCode !== 'definedFunc') continue;
        const i = b.spec.indexOf(' ');
        if ((i > 0 ? b.spec.substring(0, i) : b.spec) === name) return true;
      }
    }
    return false;
  }
  g(...args: any[]): any {
    if (args.length === 1) return this.p.events.get(args[0]) ?? [];
    if (args.length === 3) return (this.p.views.get(args[0]) ?? []).some((v) => v.type === args[1] && v.id === args[2]);
    return (this.p.views.get(args[0]) ?? []).some((v) => (v as any).getClassInfo().a('TextView') && v.id === args[1]);
  }
  h(...args: any[]): any {
    if (args.length === 1) return this.p.getFab(args[0]);
    return (this.p.views.get(args[0]) ?? []).some((v) => v.id === args[1]);
  }
  i(java: string) {
    return pairs(this.p.getFuncs(java));
  }
  j(java: string) {
    return pairs(this.p.getLists(java));
  }
  k(java: string) {
    return pairs(this.p.getVars(java));
  }
  x(xml: string, type: number) {
    return (this.p.views.get(xml) ?? []).some((v) => v.type === type);
  }
  y(xml: string, cls: string) {
    return (this.p.views.get(xml) ?? []).some((v) => (v as any).getClassInfo().a(cls));
  }
  static z(s: string) {
    return s.includes('.') ? s.split('.').pop() : s;
  }
}

/** a.a.a.hC: activities / custom views. */
export class hC {
  constructor(public p: ProjectData) {}
  b(...args: any[]): any {
    if (args.length === 0) return this.p.activities;
    return this.p.findFileByXml(args[0]) ?? null;
  }
  c(...args: any[]): any {
    if (args.length === 0) return this.p.customViews;
    return false;
  }
  a(java: string) {
    return this.p.findActivityByJava(java) ?? null;
  }
  d() {
    return [];
  }
}

/** a.a.a.iC: libraries. */
export class iC {
  constructor(public p: ProjectData) {}
  b() {
    return this.p.admob;
  }
  c() {
    return this.p.compat;
  }
  d() {
    return this.p.firebase;
  }
  e() {
    return this.p.googleMap;
  }
}

/** a.a.a.kC: resources. */
export class kC {
  constructor(public p: ProjectData) {}
  k() {
    return this.p.images;
  }
  m() {
    return this.p.sounds;
  }
  p_() {
    return this.p.fonts;
  }
}

export class jC {
  static a(_scId?: string) {
    return new eC(currentProject());
  }
  static b(_scId?: string) {
    return new hC(currentProject());
  }
  static c(_scId?: string) {
    return new iC(currentProject());
  }
  static d(_scId?: string) {
    return new kC(currentProject());
  }
}

// ------------------------------------------------------------------ mod.hey.studios.util.ProjectFile
export const ProjectFile = {
  COLOR_ACCENT: 'color_accent',
  COLOR_PRIMARY: 'color_primary',
  COLOR_PRIMARY_DARK: 'color_primary_dark',
  COLOR_CONTROL_HIGHLIGHT: 'color_control_highlight',
  COLOR_CONTROL_NORMAL: 'color_control_normal',
  getDefaultColor,
  getColor: (_sc: string, color: string) => yB.a(currentProject().meta, color, getDefaultColor(color)),
};
export function getDefaultColor(color: string): number {
  switch (color) {
    case 'color_primary_dark':
      return 0xff1976d2 | 0;
    case 'color_control_highlight':
      return 0x202196f3;
    default:
      return 0xff2196f3 | 0;
  }
}

// ------------------------------------------------------------------ custom blocks (BlockLoader / ExtraBlockInfo)
export class ExtraBlockInfo {
  isMissing = false;
  code = '';
  color = 0;
  name = '';
  paletteColor = 0;
  spec = '';
  spec2 = '';
  getName() {
    return this.name;
  }
  setName(s: string) {
    this.name = s;
  }
  getCode() {
    return this.code;
  }
  setCode(s: string) {
    this.code = s;
  }
  getColor() {
    return this.color;
  }
  getPaletteColor() {
    return this.paletteColor;
  }
  getSpec() {
    return this.spec;
  }
  getSpec2() {
    return this.spec2;
  }
}

function infoFrom(def: any, name: string): ExtraBlockInfo {
  const i = new ExtraBlockInfo();
  i.name = name;
  if (!def) {
    i.isMissing = true;
    return i;
  }
  i.code = def.code ?? '';
  i.spec = def.spec ?? '';
  i.spec2 = def.spec2 ?? '';
  i.color = parseColor(def.color) ?? 0;
  return i;
}

export const BlockLoader = {
  getBlockInfo: (name: string) => infoFrom(getExtraBlock(name), name),
  getBlockFromProject: (_sc: string, name: string) => infoFrom(getExtraBlock(name), name),
  refresh: () => {},
  log: () => {},
};

export function getExtraBlockData(): JMap[] {
  return getAllExtraBlocks().map((b) => new JMap(b as any));
}
export const ExtraBlockFile = { getExtraBlockData };

// ------------------------------------------------------------------ small compiled helpers
/** a.a.a.vq */
export class vq {
  static a$ = ['Default', 'NoActionBar', 'FullScreen'];
  static b$ = ['Portrait', 'Landscape', 'Both'];
  static a(i: number): string {
    const v = i & 15;
    return v === 1 ? 'stateVisible' : v === 2 ? 'stateHidden' : '';
  }
}

/** a.a.a.FB: spec tokenizer etc. */
export class FB {
  static c(spec: string): string[] {
    return tokenizeSpec(spec);
  }
  static d(s: string): string {
    let r = '';
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '\\') r += s[++i] ?? '';
      else r += s[i];
    }
    return r;
  }
}

/** a.a.a.oB: file utilities used by yq (sync). */
export class oB {
  constructor(_encrypt?: boolean) {}
  f(path: string) {
    sfs().mkdir(path);
  }
  b(...args: any[]): any {
    if (args.length === 1) {
      FileUtil.deleteFile(args[0]);
      return;
    }
    if (typeof args[0] === 'string') {
      FileUtil.writeFile(args[0], args[1]);
      return;
    }
    // b(Context, assetPath): read a bundled asset
    return readAsset(args[1]);
  }
  a(...args: any[]): any {
    if (args.length === 1) {
      const f = args[0] instanceof JFile ? args[0].path : args[0];
      FileUtil.deleteFile(f);
      return;
    }
    FileUtil.copyFile(args[0], args[1]);
  }
  c(path: string) {
    FileUtil.deleteFile(path);
  }
}

/** Bundled Sketchware assets (debug/*.java etc.), see app/assets. */
let assetsDir = '';
export function setAssetsDir(p: string) {
  assetsDir = p.replace(/\\/g, '/');
}
export function readAsset(rel: string): string {
  return FileUtil.readFile(assetsDir + '/' + rel.replace(/\\/g, '/'));
}
export function assetPath(rel: string): string {
  return assetsDir + '/' + rel;
}

/** a.a.a.KB: zip extraction (only used by the on-device compiler). */
export class KB {
  static a(_ctx: any, _asset: string, _dest: string) {}
  a(_zip: string, _dest: string) {}
}

/** SharedPreferences wrapper a.a.a.DB (only defaults on desktop). */
export class DB {
  constructor(_ctx?: any, _name?: string) {}
  a(_key?: any, def?: any) {
    return def ?? '';
  }
  b(_key?: any, def?: any) {
    return def ?? '';
  }
  c(_key?: any, def?: any) {
    return def ?? false;
  }
  d(_key?: any, def?: any) {
    return def ?? 0;
  }
}

/** Subset of a.a.a.ProjectBuilder: which built-in libraries a project needs. */
export class ProjectBuilder {
  static TAG = 'ProjectBuilder';
  static hasFileChanged(..._a: any[]) {
    return false;
  }
  builtInLibraryManager: any;
  constructor(_ctx: any, public yq: any) {
    this.builtInLibraryManager = new BuiltInLibraryManager(yq.sc_id);
  }
  getBuiltInLibraryManager() {
    return this.builtInLibraryManager;
  }
  buildBuiltInLibraryInformation() {
    const N = this.yq.N;
    const m = this.builtInLibraryManager;
    const B = BuiltInLibraries as any;
    if (N.g) {
      m.addLibrary(B.ANDROIDX_APPCOMPAT);
      m.addLibrary(B.ANDROIDX_COORDINATORLAYOUT);
      m.addLibrary(B.MATERIAL);
    }
    if (N.isFirebaseEnabled) m.addLibrary(B.FIREBASE_COMMON);
    if (N.isFirebaseAuthUsed) m.addLibrary(B.FIREBASE_AUTH);
    if (N.isFirebaseDatabaseUsed) m.addLibrary(B.FIREBASE_DATABASE);
    if (N.isFirebaseStorageUsed) m.addLibrary(B.FIREBASE_STORAGE);
    if (N.isMapUsed) m.addLibrary(B.PLAY_SERVICES_MAPS);
    if (N.isAdMobEnabled) m.addLibrary(B.PLAY_SERVICES_ADS);
    if (N.isGsonUsed) m.addLibrary(B.GSON);
    if (N.isGlideUsed) m.addLibrary(B.GLIDE);
    if (N.isHttp3Used) m.addLibrary(B.OKHTTP_ANDROID);
    ExtLibSelected.addUsedDependencies(N.x, m);
  }
}

export const ViewBeanFactory = class {
  constructor(public bean: any) {}
  applyAttributes() {}
};

export const OldResourceIdMapper = { getDrawableFromOldResourceId: (id: any) => id };

/** com.besome.sketch.editor.property.PropertyAttributesItem.RELATIVE_IDS */
export const RELATIVE_IDS = [
  'android:layout_alignStart', 'android:layout_alignEnd', 'android:layout_alignLeft', 'android:layout_alignRight',
  'android:layout_alignTop', 'android:layout_alignBottom', 'android:layout_alignBaseline', 'android:layout_toStartOf',
  'android:layout_toEndOf', 'android:layout_toLeftOf', 'android:layout_toRightOf', 'android:layout_above', 'android:layout_below',
];

export const Manifest = {
  permission: new Proxy({}, { get: (_t, k) => 'android.permission.' + String(k) }) as any,
};

export const Intent = {
  FLAG_GRANT_READ_URI_PERMISSION: 1,
  EXTRA_ALLOW_MULTIPLE: 'android.intent.extra.ALLOW_MULTIPLE',
  CATEGORY_LAUNCHER: 'android.intent.category.LAUNCHER',
  ACTION_MAIN: 'android.intent.action.MAIN',
};

export function getGson() {
  return new Gson();
}

/** Tells whether generated Java code always returns (BlockReturnAnalyzer, simplified). */
export class BlockReturnAnalyzer {
  hasAnyMissingReturn(code: string): boolean {
    try {
      const stmts = splitStatements(stripComments(code));
      if (!stmts.length) return true;
      return !stmts.some((s) => alwaysReturns(s));
    } catch {
      return false;
    }
  }
}

function stripComments(s: string) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/** Splits a code block into top-level statements (handles braces/parens/strings). */
function splitStatements(code: string): string[] {
  const out: string[] = [];
  let cur = '';
  let depth = 0;
  let paren = 0;
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== c) j += code[j] === '\\' ? 2 : 1;
      cur += code.substring(i, j + 1);
      i = j;
      continue;
    }
    cur += c;
    if (c === '(') paren++;
    else if (c === ')') paren--;
    else if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0 && paren === 0) {
        const rest = code.substring(i + 1).trimStart();
        if (!rest.startsWith('else') && !rest.startsWith('catch') && !rest.startsWith('finally')) {
          out.push(cur.trim());
          cur = '';
        }
      }
    } else if (c === ';' && depth === 0 && paren === 0) {
      out.push(cur.trim());
      cur = '';
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter((s) => s.length);
}

function blockBody(s: string, from: number): [string, number] {
  const b = s.indexOf('{', from);
  let depth = 0;
  for (let i = b; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') {
      depth--;
      if (depth === 0) return [s.substring(b + 1, i), i + 1];
    }
  }
  return [s.substring(b + 1), s.length];
}

function alwaysReturns(stmt: string): boolean {
  const s = stmt.trim();
  if (/^return\b/.test(s) || /^throw\b/.test(s)) return true;
  if (s.startsWith('{')) return splitStatements(blockBody(s, 0)[0]).some(alwaysReturns);
  if (/^if\s*\(/.test(s)) {
    // if (...) {A} else {B} | else if ...
    let i = 0;
    let depth = 0;
    for (i = s.indexOf('('); i < s.length; i++) {
      if (s[i] === '(') depth++;
      else if (s[i] === ')') {
        depth--;
        if (depth === 0) break;
      }
    }
    const after = s.substring(i + 1).trimStart();
    let thenPart: string;
    let rest: string;
    if (after.startsWith('{')) {
      const [body, end] = blockBody(after, 0);
      thenPart = '{' + body + '}';
      rest = after.substring(end).trimStart();
    } else {
      const semi = after.indexOf(';');
      thenPart = after.substring(0, semi + 1);
      rest = after.substring(semi + 1).trimStart();
    }
    if (!rest.startsWith('else')) return false;
    return alwaysReturns(thenPart) && alwaysReturns(rest.substring(4));
  }
  return false;
}

/** Tiny XmlPullParser replacement used by Ox.readAttributesToReplace (see portfix). */
export function readToolsReplace(inject: string): string[] {
  const m = /tools:replace\s*=\s*"([^"]*)"/.exec(inject ?? '');
  return m ? m[1].split(/\s*,\s*/).filter((x) => x) : [];
}

export const StringReader = class {
  constructor(public s: string) {}
};

/** For Lx: whether the asset/library exists. */
export function workspacePath(...rel: string[]) {
  return [workspaceRoot, ...rel].join('/');
}

export { getExternalStorage };
