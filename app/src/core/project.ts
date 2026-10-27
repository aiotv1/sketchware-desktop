// In-memory Sketchware project + (de)serialization of the encrypted data files:
//   data/<sc_id>/file      -> activities / custom views          (a.a.a.hC)
//   data/<sc_id>/view      -> ViewBeans per layout               (a.a.a.eC)
//   data/<sc_id>/logic     -> vars, lists, more blocks, components, events, blocks (a.a.a.eC)
//   data/<sc_id>/library   -> firebase / compat / admob / maps   (a.a.a.iC)
//   data/<sc_id>/resource  -> images / sounds / fonts            (a.a.a.kC)
import {
  BlockBean,
  ComponentBean,
  EventBean,
  ProjectFileBean,
  ProjectLibraryBean,
  ProjectResourceBean,
  ViewBean,
  toGson,
} from './beans';

export type VarEntry = [number, string];
export type FuncEntry = [string, string];

export const LOGIC_SECTIONS = ['var', 'list', 'func', 'components', 'events'] as const;

export class ProjectData {
  scId = '601';
  meta: Record<string, any> = {};

  activities: ProjectFileBean[] = [];
  customViews: ProjectFileBean[] = [];

  views = new Map<string, ViewBean[]>();
  fabs = new Map<string, ViewBean>();

  vars = new Map<string, VarEntry[]>();
  lists = new Map<string, VarEntry[]>();
  funcs = new Map<string, FuncEntry[]>();
  components = new Map<string, ComponentBean[]>();
  events = new Map<string, EventBean[]>();
  blocks = new Map<string, Map<string, BlockBean[]>>();

  firebase = new ProjectLibraryBean(ProjectLibraryBean.PROJECT_LIB_TYPE_FIREBASE);
  compat = new ProjectLibraryBean(ProjectLibraryBean.PROJECT_LIB_TYPE_COMPAT);
  admob = new ProjectLibraryBean(ProjectLibraryBean.PROJECT_LIB_TYPE_ADMOB);
  googleMap = new ProjectLibraryBean(ProjectLibraryBean.PROJECT_LIB_TYPE_GOOGLE_MAP);

  images: ProjectResourceBean[] = [];
  sounds: ProjectResourceBean[] = [];
  fonts: ProjectResourceBean[] = [];

  // ----- project meta -----
  get appName(): string {
    return this.meta.my_app_name ?? '';
  }
  get projectName(): string {
    return this.meta.my_ws_name ?? '';
  }
  get packageName(): string {
    return this.meta.my_sc_pkg_name ?? '';
  }
  get versionCode(): string {
    return String(this.meta.sc_ver_code ?? '1');
  }
  get versionName(): string {
    return String(this.meta.sc_ver_name ?? '1.0');
  }

  // ----- files -----
  getDrawers(): ProjectFileBean[] {
    const out: ProjectFileBean[] = [];
    for (const a of this.activities) {
      if (a.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER)) {
        const d = new ProjectFileBean(ProjectFileBean.PROJECT_FILE_TYPE_DRAWER, a.getDrawerName());
        d.options = 0;
        out.push(d);
      }
    }
    return out;
  }

  allFiles(): ProjectFileBean[] {
    return [...this.activities, ...this.customViews, ...this.getDrawers()];
  }

  findFileByXml(xmlName: string): ProjectFileBean | undefined {
    return this.allFiles().find((f) => f.getXmlName() === xmlName);
  }

  findActivityByJava(javaName: string): ProjectFileBean | undefined {
    return this.activities.find((f) => f.getJavaName() === javaName);
  }

  // ----- views -----
  getViews(xmlName: string): ViewBean[] {
    let v = this.views.get(xmlName);
    if (!v) {
      v = [];
      this.views.set(xmlName, v);
    }
    return v;
  }

  getView(xmlName: string, id: string): ViewBean | undefined {
    return this.views.get(xmlName)?.find((v) => v.id === id);
  }

  getFab(xmlName: string): ViewBean {
    let f = this.fabs.get(xmlName);
    if (!f) {
      f = new ViewBean('_fab', 16);
      f.layout.marginLeft = 16;
      f.layout.marginTop = 16;
      f.layout.marginRight = 16;
      f.layout.marginBottom = 16;
      f.layout.layoutGravity = 85;
      this.fabs.set(xmlName, f);
    }
    return f;
  }

  // ----- logic -----
  private listOf<T>(map: Map<string, T[]>, key: string): T[] {
    let v = map.get(key);
    if (!v) {
      v = [];
      map.set(key, v);
    }
    return v;
  }
  getVars(javaName: string) {
    return this.listOf(this.vars, javaName);
  }
  getLists(javaName: string) {
    return this.listOf(this.lists, javaName);
  }
  getFuncs(javaName: string) {
    return this.listOf(this.funcs, javaName);
  }
  getComponents(javaName: string) {
    return this.listOf(this.components, javaName);
  }
  getEvents(javaName: string) {
    return this.listOf(this.events, javaName);
  }
  getBlockMap(javaName: string): Map<string, BlockBean[]> {
    let m = this.blocks.get(javaName);
    if (!m) {
      m = new Map();
      this.blocks.set(javaName, m);
    }
    return m;
  }
  getBlocks(javaName: string, eventKey: string): BlockBean[] {
    return this.blocks.get(javaName)?.get(eventKey) ?? [];
  }
  setBlocks(javaName: string, eventKey: string, list: BlockBean[]) {
    const m = this.getBlockMap(javaName);
    if (list.length === 0) m.delete(eventKey);
    else m.set(eventKey, list);
  }
  /** Variables of a given type, as names (custom types keep "Type name" form). */
  getVarNames(javaName: string, type: number): string[] {
    return (this.vars.get(javaName) ?? []).filter((v) => v[0] === type).map((v) => v[1]);
  }
  getListNames(javaName: string, type: number): string[] {
    return (this.lists.get(javaName) ?? []).filter((v) => v[0] === type).map((v) => v[1]);
  }
  getComponentsOfType(javaName: string, type: number): ComponentBean[] {
    return (this.components.get(javaName) ?? []).filter((c) => c.type === type);
  }
  hasComponentType(javaName: string, type: number): boolean {
    return this.getComponentsOfType(javaName, type).length > 0;
  }
  /** True if any view of the layout is (or extends) the given widget class name. */
  hasViewClass(xmlName: string, typeName: string, classOf: (v: ViewBean) => string[]): boolean {
    return (this.views.get(xmlName) ?? []).some((v) => classOf(v).includes(typeName));
  }

  // ===================== serialization =====================

  serializeFile(): string {
    let s = '';
    if (this.activities.length) {
      s += '@activity\n';
      for (const f of this.activities) s += toGson(f) + '\n';
    }
    if (this.customViews.length) {
      s += '@customview\n';
      for (const f of this.customViews) s += toGson(f) + '\n';
    }
    return s;
  }

  parseFile(text: string) {
    this.activities = [];
    this.customViews = [];
    let section = '';
    for (const line of lines(text)) {
      if (line.startsWith('@')) {
        section = line.substring(1);
        continue;
      }
      const o = safeJson(line);
      if (!o) continue;
      const bean = ProjectFileBean.fromJson(o);
      if (section === 'activity') this.activities.push(bean);
      else if (section === 'customview') this.customViews.push(bean);
    }
  }

  serializeView(): string {
    let s = '';
    for (const [xml, list] of this.views) {
      if (!list.length) continue;
      s += '@' + xml + '\n';
      for (const v of list) s += toGson(v) + '\n';
      s += '\n';
    }
    for (const [xml, fab] of this.fabs) {
      s += '@' + xml + '_fab\n' + toGson(fab) + '\n\n';
    }
    return s;
  }

  parseView(text: string) {
    this.views = new Map();
    this.fabs = new Map();
    let key = '';
    for (const line of lines(text)) {
      if (line.startsWith('@')) {
        key = line.substring(1);
        continue;
      }
      const o = safeJson(line);
      if (!o || !key) continue;
      if (key.endsWith('_fab')) {
        this.fabs.set(key.substring(0, key.length - 4), ViewBean.fromJson(o));
      } else {
        this.getViews(key).push(ViewBean.fromJson(o));
      }
    }
  }

  serializeLogic(): string {
    let s = '';
    for (const [java, list] of this.vars) {
      if (!list.length) continue;
      s += `@${java}_var\n` + list.map(([t, n]) => `${t}:${n}\n`).join('') + '\n';
    }
    for (const [java, list] of this.lists) {
      if (!list.length) continue;
      s += `@${java}_list\n` + list.map(([t, n]) => `${t}:${n}\n`).join('') + '\n';
    }
    for (const [java, list] of this.funcs) {
      if (!list.length) continue;
      s += `@${java}_func\n` + list.map(([n, spec]) => `${n}:${spec}\n`).join('') + '\n';
    }
    for (const [java, list] of this.components) {
      if (!list.length) continue;
      s += `@${java}_components\n` + list.map((c) => toGson(c) + '\n').join('') + '\n';
    }
    for (const [java, list] of this.events) {
      if (!list.length) continue;
      s += `@${java}_events\n` + list.map((e) => toGson(e) + '\n').join('') + '\n';
    }
    for (const [java, map] of this.blocks) {
      for (const [eventKey, list] of map) {
        if (!list.length) continue;
        s += `@${java}_${eventKey}\n` + list.map((b) => toGson(b) + '\n').join('') + '\n';
      }
    }
    return s;
  }

  parseLogic(text: string) {
    this.vars = new Map();
    this.lists = new Map();
    this.funcs = new Map();
    this.components = new Map();
    this.events = new Map();
    this.blocks = new Map();
    let java = '';
    let kind = '';
    for (const raw of text.split(/\r?\n/)) {
      const line = raw;
      if (line.startsWith('@')) {
        const key = line.substring(1).trim();
        const idx = key.indexOf('.java_');
        if (idx < 0) {
          java = '';
          kind = '';
          continue;
        }
        java = key.substring(0, idx + 5);
        kind = key.substring(idx + 6);
        continue;
      }
      if (!java || line.trim() === '') continue;
      switch (kind) {
        case 'var':
        case 'list': {
          const c = line.indexOf(':');
          if (c < 0) break;
          const t = parseInt(line.substring(0, c), 10);
          const entry: VarEntry = [isNaN(t) ? 0 : t, line.substring(c + 1)];
          (kind === 'var' ? this.getVars(java) : this.getLists(java)).push(entry);
          break;
        }
        case 'func': {
          const c = line.indexOf(':');
          if (c < 0) break;
          this.getFuncs(java).push([line.substring(0, c), line.substring(c + 1)]);
          break;
        }
        case 'components': {
          const o = safeJson(line);
          if (o) this.getComponents(java).push(ComponentBean.fromJson(o));
          break;
        }
        case 'events': {
          const o = safeJson(line);
          if (o) this.getEvents(java).push(EventBean.fromJson(o));
          break;
        }
        default: {
          const o = safeJson(line);
          if (!o) break;
          const m = this.getBlockMap(java);
          let list = m.get(kind);
          if (!list) {
            list = [];
            m.set(kind, list);
          }
          list.push(BlockBean.fromJson(o));
        }
      }
    }
  }

  serializeLibrary(): string {
    return (
      '@firebaseDB\n' + toGson(this.firebase) + '\n' +
      '@compat\n' + toGson(this.compat) + '\n' +
      '@admob\n' + toGson(this.admob) + '\n' +
      '@googleMap\n' + toGson(this.googleMap) + '\n'
    );
  }

  parseLibrary(text: string) {
    let section = '';
    for (const line of lines(text)) {
      if (line.startsWith('@')) {
        section = line.substring(1);
        continue;
      }
      const o = safeJson(line);
      if (!o) continue;
      const lib = ProjectLibraryBean.fromJson(o);
      if (section === 'firebaseDB') this.firebase = lib;
      else if (section === 'compat') this.compat = lib;
      else if (section === 'admob') this.admob = lib;
      else if (section === 'googleMap') this.googleMap = lib;
    }
  }

  serializeResource(): string {
    let s = '';
    const sec = (name: string, list: ProjectResourceBean[]) => {
      if (!list.length) return;
      s += '@' + name + '\n' + list.map((r) => toGson(r) + '\n').join('');
    };
    sec('images', this.images);
    sec('sounds', this.sounds);
    sec('fonts', this.fonts);
    return s;
  }

  parseResource(text: string) {
    this.images = [];
    this.sounds = [];
    this.fonts = [];
    let section = '';
    for (const line of lines(text)) {
      if (line.startsWith('@')) {
        section = line.substring(1);
        continue;
      }
      const o = safeJson(line);
      if (!o) continue;
      const r = ProjectResourceBean.fromJson(o);
      if (section === 'images') this.images.push(r);
      else if (section === 'sounds') this.sounds.push(r);
      else if (section === 'fonts') this.fonts.push(r);
    }
  }
}

function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function safeJson(line: string): any {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

/** Creates the default content of a brand new project (same as Sketchware's "new project"). */
export function createNewProject(scId: string, appName: string, pkg: string, projectName: string): ProjectData {
  const p = new ProjectData();
  p.scId = scId;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  p.meta = {
    sc_id: scId,
    my_sc_pkg_name: pkg,
    my_ws_name: projectName,
    my_app_name: appName,
    sc_ver_code: '1',
    sc_ver_name: '1.0',
    my_sc_reg_dt: `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`,
    custom_icon: false,
    isIconAdaptive: false,
    sketchware_ver: 150,
    color_accent: 0xff2196f3 | 0,
    color_primary: 0xff2196f3 | 0,
    color_primary_dark: 0xff1976d2 | 0,
    color_control_highlight: 0x202196f3,
    color_control_normal: 0xff2196f3 | 0,
  };
  const main = new ProjectFileBean(ProjectFileBean.PROJECT_FILE_TYPE_ACTIVITY, 'main');
  p.activities.push(main);
  p.compat.useYn = 'Y';
  return p;
}
