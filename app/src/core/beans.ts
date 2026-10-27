import { JMap } from '../codegen/jshim';
// Data model mirroring com.besome.sketch.beans.* (only the @Expose'd, persisted fields).
// Field declaration order matches the Java classes so Gson-style output stays byte-compatible.

export class LayoutBean {
  static GRAVITY_BOTTOM = 80;
  static GRAVITY_CENTER = 17;
  static GRAVITY_CENTER_HORIZONTAL = 1;
  static GRAVITY_CENTER_VERTICAL = 16;
  static GRAVITY_LEFT = 3;
  static GRAVITY_NONE = 0;
  static GRAVITY_RIGHT = 5;
  static GRAVITY_TOP = 48;
  static LAYOUT_MATCH_PARENT = -1;
  static LAYOUT_NOTUSED = 0;
  static LAYOUT_WRAP_CONTENT = -2;
  static ORIENTATION_HORIZONTAL = 0;
  static ORIENTATION_NONE = -1;
  static ORIENTATION_VERTICAL = 1;

  backgroundColor = 0xffffff;
  backgroundResColor: string | null = null;
  backgroundResource: string | null = null;
  borderColor = 0xff008dcd | 0;
  gravity = 0;
  height = -2;
  layoutGravity = 0;
  marginBottom = 0;
  marginLeft = 0;
  marginRight = 0;
  marginTop = 0;
  orientation = -1;
  paddingBottom = 0;
  paddingLeft = 0;
  paddingRight = 0;
  paddingTop = 0;
  weight = 0;
  weightSum = 0;
  width = -2;

  copy(o: LayoutBean) {
    Object.assign(this, o);
  }
}

export class TextBean {
  static IME_OPTION_DONE = 6;
  static IME_OPTION_GO = 2;
  static IME_OPTION_NEXT = 5;
  static IME_OPTION_NONE = 1;
  static IME_OPTION_NORMAL = 0;
  static IME_OPTION_SEARCH = 3;
  static IME_OPTION_SEND = 4;
  static INPUT_TYPE_NUMBER_DECIMAL = 8194;
  static INPUT_TYPE_NUMBER_SIGNED = 4098;
  static INPUT_TYPE_NUMBER_SIGNED_DECIMAL = 12290;
  static INPUT_TYPE_PASSWORD = 129;
  static INPUT_TYPE_PHONE = 3;
  static INPUT_TYPE_TEXT = 1;
  static TEXT_FONT = 'default_font';
  static TEXT_TYPE_BOLD = 1;
  static TEXT_TYPE_BOLDITALIC = 3;
  static TEXT_TYPE_ITALIC = 2;
  static TEXT_TYPE_NORMAL = 0;

  hint = '';
  hintColor = 0xffffff;
  resHintColor: string | null = null;
  imeOption = 0;
  inputType = 1;
  line = 0;
  singleLine = 0;
  text = '';
  textColor = 0xffffff;
  resTextColor: string | null = null;
  textFont = 'default_font';
  textSize = 12;
  textType = 0;

  copy(o: TextBean) {
    Object.assign(this, o);
  }
}

/** Late-bound helpers (set by sw/init.ts) so beans don't import the ported type system directly. */
export const beanHooks: {
  viewClassInfo: (v: any, type: number) => any;
  blockClassInfo: (type: string, typeName: string) => any;
  paramClassInfo: (spec: string) => any[];
  componentTypeName: (type: number) => string;
  viewTypeName: (type: number) => string;
  componentClassInfo: (type: number) => any;
} = {
  componentClassInfo: () => null,
  viewClassInfo: () => null,
  blockClassInfo: () => null,
  paramClassInfo: () => [],
  componentTypeName: () => '',
  viewTypeName: () => '',
};

export class ColorBean {
  constructor(public colorCode: any = '', public colorName: any = '', public displayNameColor: any = '#ffffff', public icon: any = 0) {}
}

export class SrcCodeBean {
  constructor(public srcFileName = '', public source = '') {}
}

export class ImageBean {
  static SCALE_TYPES = ['CENTER', 'CENTER_CROP', 'CENTER_INSIDE', 'FIT_CENTER', 'FIT_END', 'FIT_START', 'FIT_XY'];
  static SCALE_TYPE_CENTER = 'CENTER';
  static SCALE_TYPE_CENTER_CROP = 'CENTER_CROP';
  static SCALE_TYPE_CENTER_INSIDE = 'CENTER_INSIDE';
  static SCALE_TYPE_FIT_CENTER = 'FIT_CENTER';
  static SCALE_TYPE_FIT_END = 'FIT_END';
  static SCALE_TYPE_FIT_START = 'FIT_START';
  static SCALE_TYPE_FIT_XY = 'FIT_XY';
  resName: string | null = null;
  rotate = 0;
  scaleType = 'CENTER';

  copy(o: ImageBean) {
    Object.assign(this, o);
  }
}

export class ViewBean {
  static CHOICE_MODE_NONE = 0;
  static CHOICE_MODE_SINGLE = 1;
  static CHOICE_MODE_MULTI = 2;
  static PROGRESSBAR_STYLE_CIRCLE = '?android:progressBarStyle';
  static PROGRESSBAR_STYLE_HORIZONTAL = '?android:progressBarStyleHorizontal';
  static SPINNER_MODE_DIALOG = 0;
  static SPINNER_MODE_DROPDOWN = 1;
  static DEFAULT_PROGRESS = 0;
  static DEFAULT_MAX = 100;
  static VIEW_TYPE_LAYOUT_LINEAR = 0;
  static VIEW_TYPE_LAYOUT_RELATIVE = 1;
  static VIEW_TYPE_LAYOUT_HSCROLLVIEW = 2;
  static VIEW_TYPE_WIDGET_BUTTON = 3;
  static VIEW_TYPE_WIDGET_TEXTVIEW = 4;
  static VIEW_TYPE_WIDGET_EDITTEXT = 5;
  static VIEW_TYPE_WIDGET_IMAGEVIEW = 6;
  static VIEW_TYPE_WIDGET_WEBVIEW = 7;
  static VIEW_TYPE_WIDGET_PROGRESSBAR = 8;
  static VIEW_TYPE_WIDGET_LISTVIEW = 9;
  static VIEW_TYPE_WIDGET_SPINNER = 10;
  static VIEW_TYPE_WIDGET_CHECKBOX = 11;
  static VIEW_TYPE_LAYOUT_VSCROLLVIEW = 12;
  static VIEW_TYPE_WIDGET_SWITCH = 13;
  static VIEW_TYPE_WIDGET_SEEKBAR = 14;
  static VIEW_TYPE_WIDGET_CALENDARVIEW = 15;
  static VIEW_TYPE_WIDGET_FAB = 16;
  static VIEW_TYPE_WIDGET_ADVIEW = 17;
  static VIEW_TYPE_WIDGET_MAPVIEW = 18;
  static VIEW_TYPE_COUNT = 19;

  static getViewTypeName(type: number): string {
    return beanHooks.viewTypeName(type);
  }

  adSize = '';
  adUnitId = '';
  alpha = 1.0;
  checked = 0;
  choiceMode = 0;
  clickable = 1;
  convert = '';
  customView = '';
  dividerHeight = 1;
  enabled = 1;
  firstDayOfWeek = 1;
  id = '';
  image = new ImageBean();
  indeterminate = 'false';
  index = 0;
  inject = '';
  layout = new LayoutBean();
  max = 100;
  parent: string | null = null;
  parentType = -1;
  preId: string | null = null;
  preIndex = 0;
  preParent: string | null = null;
  preParentType = 0;
  progress = 0;
  progressStyle = '?android:progressBarStyle';
  scaleX = 1.0;
  scaleY = 1.0;
  spinnerMode = 1;
  text = new TextBean();
  translationX = 0;
  translationY = 0;
  type = 0;
  parentAttributes: JMap<string, string> = new JMap();
  // not persisted
  name = '';
  isCustomWidget = false;

  constructor(id?: string, type?: number) {
    if (id !== undefined) {
      this.id = id;
      this.name = id;
    }
    if (type !== undefined) this.type = type;
  }

  clone(): ViewBean {
    return ViewBean.fromJson(JSON.parse(JSON.stringify(viewBeanToJson(this))));
  }

  getClassInfo(): any {
    return beanHooks.viewClassInfo(this, this.type);
  }

  getParentClassInfo(): any {
    return this.parentType === -1 ? null : beanHooks.viewClassInfo(this, this.parentType);
  }

  copy(o: ViewBean) {
    Object.assign(this, o.clone());
  }

  static fromJson(o: any): ViewBean {
    const v = new ViewBean();
    assignKnown(v, o, ['image', 'layout', 'text']);
    if (o.layout) assignKnown(v.layout, o.layout);
    if (o.text) assignKnown(v.text, o.text);
    if (o.image) assignKnown(v.image, o.image);
    v.parentAttributes = new JMap(o && o.parentAttributes && typeof o.parentAttributes === 'object' ? o.parentAttributes : {});
    v.name = v.id;
    return v;
  }
}

export class BlockBean {
  color = 0;
  id = '';
  nextBlock = -1;
  opCode = '';
  parameters: string[] = [];
  spec = '';
  subStack1 = -1;
  subStack2 = -1;
  type = ' ';
  typeName = '';

  constructor(id?: string, spec?: string, type?: string, typeName?: string, opCode?: string) {
    if (id !== undefined) this.id = id;
    if (spec !== undefined) this.spec = spec;
    if (type !== undefined) this.type = type;
    if (typeName !== undefined) this.typeName = typeName;
    if (opCode !== undefined) this.opCode = opCode;
  }

  clone(): BlockBean {
    const b = new BlockBean();
    Object.assign(b, this);
    b.parameters = [...this.parameters];
    return b;
  }

  getClassInfo(): any {
    return beanHooks.blockClassInfo(this.type, this.typeName);
  }

  getParamClassInfo(): any[] {
    return beanHooks.paramClassInfo(this.spec);
  }

  static fromJson(o: any): BlockBean {
    const b = new BlockBean();
    assignKnown(b, o);
    if (!Array.isArray(b.parameters)) b.parameters = [];
    b.parameters = b.parameters.map((p) => (p == null ? '' : String(p)));
    if (b.typeName == null) b.typeName = '';
    return b;
  }
}

export class ComponentBean {
  static COMPONENT_TYPE_INTENT = 1;
  static COMPONENT_TYPE_SHAREDPREF = 2;
  static COMPONENT_TYPE_CALENDAR = 3;
  static COMPONENT_TYPE_VIBRATOR = 4;
  static COMPONENT_TYPE_TIMERTASK = 5;
  static COMPONENT_TYPE_FIREBASE = 6;
  static COMPONENT_TYPE_DIALOG = 7;
  static COMPONENT_TYPE_MEDIAPLAYER = 8;
  static COMPONENT_TYPE_SOUNDPOOL = 9;
  static COMPONENT_TYPE_OBJECTANIMATOR = 10;
  static COMPONENT_TYPE_GYROSCOPE = 11;
  static COMPONENT_TYPE_FIREBASE_AUTH = 12;
  static COMPONENT_TYPE_INTERSTITIAL_AD = 13;
  static COMPONENT_TYPE_FIREBASE_STORAGE = 14;
  static COMPONENT_TYPE_CAMERA = 15;
  static COMPONENT_TYPE_FILE_PICKER = 16;
  static COMPONENT_TYPE_REQUEST_NETWORK = 17;
  static COMPONENT_TYPE_TEXT_TO_SPEECH = 18;
  static COMPONENT_TYPE_SPEECH_TO_TEXT = 19;
  static COMPONENT_TYPE_BLUETOOTH_CONNECT = 20;
  static COMPONENT_TYPE_LOCATION_MANAGER = 21;
  static COMPONENT_TYPE_REWARDED_VIDEO_AD = 22;
  static COMPONENT_TYPE_PROGRESS_DIALOG = 23;
  static COMPONENT_TYPE_DATE_PICKER_DIALOG = 24;
  static COMPONENT_TYPE_TIME_PICKER_DIALOG = 25;
  static COMPONENT_TYPE_NOTIFICATION = 26;
  static COMPONENT_TYPE_FRAGMENT_ADAPTER = 27;
  static COMPONENT_TYPE_FIREBASE_AUTH_PHONE = 28;
  static COMPONENT_TYPE_FIREBASE_CLOUD_MESSAGE = 30;
  static COMPONENT_TYPE_FIREBASE_AUTH_GOOGLE_LOGIN = 31;

  componentId = '';
  param1 = '';
  param2 = '';
  param3 = '';
  type = 0;

  constructor(type?: number, componentId?: string, param1 = '', param2 = '', param3 = '') {
    if (type !== undefined) this.type = type;
    if (componentId !== undefined) this.componentId = componentId;
    this.param1 = param1;
    this.param2 = param2;
    this.param3 = param3;
  }

  static fromJson(o: any): ComponentBean {
    const c = new ComponentBean();
    assignKnown(c, o);
    return c;
  }

  static getComponentTypeName(type: number): string {
    return beanHooks.componentTypeName(type);
  }

  getClassInfo(): any {
    return beanHooks.componentClassInfo(this.type);
  }

  static getDescStrResource(_type: number): string {
    return '';
  }

  static getComponentName(type: number): string {
    return beanHooks.componentTypeName(type);
  }
}

export class EventBean {
  static EVENT_TYPE_VIEW = 1;
  static EVENT_TYPE_COMPONENT = 2;
  static EVENT_TYPE_ACTIVITY = 3;
  static EVENT_TYPE_DRAWER_VIEW = 4;
  static EVENT_TYPE_ETC = 5;

  eventName = '';
  eventType = 0;
  targetId = '';
  targetType = 0;

  constructor(eventType?: number, targetType?: number, targetId?: string, eventName?: string) {
    if (eventType !== undefined) this.eventType = eventType;
    if (targetType !== undefined) this.targetType = targetType;
    if (targetId !== undefined) this.targetId = targetId;
    if (eventName !== undefined) this.eventName = eventName;
  }

  getEventKey(): string {
    return this.targetId + '_' + this.eventName;
  }

  static fromJson(o: any): EventBean {
    const e = new EventBean();
    assignKnown(e, o);
    return e;
  }
}

export class ProjectFileBean {
  static DEFAULT_XML_NAME = 'main.xml';
  static DEFAULT_JAVA_NAME = 'MainActivity.java';
  static KEYBOARD_STATE_HIDDEN = 2;
  static KEYBOARD_STATE_UNSPECIFIED = 0;
  static KEYBOARD_STATE_VISIBLE = 1;
  static OPTION_ACTIVITY_DRAWER = 4;
  static OPTION_ACTIVITY_FAB = 8;
  static OPTION_ACTIVITY_FULLSCREEN = 2;
  static OPTION_ACTIVITY_MASK = 15;
  static OPTION_ACTIVITY_SHIFT = 0;
  static OPTION_ACTIVITY_TOOLBAR = 1;
  static ORIENTATION_BOTH = 2;
  static ORIENTATION_LANDSCAPE = 1;
  static ORIENTATION_PORTRAIT = 0;
  static PROJECT_FILE_TYPE_ACTIVITY = 0;
  static PROJECT_FILE_TYPE_CUSTOM_VIEW = 1;
  static PROJECT_FILE_TYPE_DRAWER = 2;
  static PROJECT_FILE_TYPE_FRAGMENT = 3;
  static PROJECT_FILE_TYPE_SHEET = 4;
  static PROJECT_FILE_TYPE_DIALOG_FRAGMENT = 5;
  static THEME_DEFAULT = 0;
  static THEME_FULLSCREEN = 2;
  static THEME_NOACTIONBAR = 1;
  static THEME_NONE = -1;

  fileName = '';
  fileType = 0;
  keyboardSetting = 0;
  options = 0;
  orientation = 0;
  theme = -1;
  presetName = '';

  constructor(fileType?: number, fileName?: string) {
    if (fileType !== undefined) {
      this.fileType = fileType;
      this.fileName = fileName ?? '';
      if (fileType === ProjectFileBean.PROJECT_FILE_TYPE_ACTIVITY) {
        this.options |= ProjectFileBean.OPTION_ACTIVITY_TOOLBAR;
        this.orientation = 0;
      } else {
        this.orientation = 2;
      }
    }
  }

  static fromJson(o: any): ProjectFileBean {
    const f = new ProjectFileBean();
    assignKnown(f, o);
    f.setOptionsByTheme();
    return f;
  }

  static getActivityName(name: string): string {
    name = name.toLowerCase();
    while (name.includes('_')) {
      const index = name.indexOf('_');
      if (index + 1 === name.length) {
        name = name.substring(0, name.length - 1);
      } else {
        const firstPart = index === 0 ? '' : name.substring(0, index);
        const camel = name.charAt(index + 1).toUpperCase();
        name = firstPart + camel + name.substring(index + 2);
      }
    }
    name += 'Activity';
    return name.charAt(0).toUpperCase() + name.substring(1);
  }
  static getDrawerNameOf(filename: string) {
    return '_drawer_' + filename;
  }
  static getJavaNameOf(filename: string) {
    return ProjectFileBean.getActivityName(filename) + '.java';
  }
  static getXmlNameOf(filename: string) {
    return filename + '.xml';
  }
  static getXmlName(filename: string) {
    return filename + '.xml';
  }
  static getJavaName(filename: string) {
    return ProjectFileBean.getActivityName(filename) + '.java';
  }
  static getDrawerName(filename: string) {
    return '_drawer_' + filename;
  }

  getActivityName() {
    return this.fileType !== 0 ? '' : ProjectFileBean.getActivityName(this.fileName);
  }
  getDrawerName() {
    return this.fileType !== 0 ? '' : ProjectFileBean.getDrawerNameOf(this.fileName);
  }
  getDrawerXmlName() {
    return this.fileType !== 0 ? '' : this.getDrawerName() + '.xml';
  }
  getDrawersJavaName() {
    return this.fileType !== 2 ? '' : !this.fileName.includes('_drawer_') ? '' : ProjectFileBean.getJavaNameOf(this.fileName.substring(8));
  }
  getJavaName() {
    return this.fileType !== 0 ? '' : ProjectFileBean.getJavaNameOf(this.fileName);
  }
  getXmlName() {
    return ProjectFileBean.getXmlNameOf(this.fileName);
  }
  hasActivityOption(option: number) {
    return ((this.options & ProjectFileBean.OPTION_ACTIVITY_MASK) & option) === option;
  }
  setOptionsByTheme() {
    if (this.theme !== -1) {
      this.options = 0;
      if (this.theme === 0) this.options |= 1;
      else if (this.theme !== 1) this.options |= 2;
      this.theme = -1;
    }
  }
}

export class ProjectResourceBean {
  static PROJECT_RES_TYPE_FILE = 1;
  static PROJECT_RES_TYPE_RESOURCE = 0;
  resFullName = '';
  resName = '';
  resType = 1;

  constructor(resType?: number, resName?: string, resFullName?: string) {
    if (resType !== undefined) this.resType = resType;
    if (resName !== undefined) this.resName = resName;
    if (resFullName !== undefined) this.resFullName = resFullName;
  }

  static fromJson(o: any): ProjectResourceBean {
    const r = new ProjectResourceBean();
    assignKnown(r, o);
    return r;
  }
}

export class AdUnitBean {
  id = '';
  name = '';
}
export class AdTestDeviceBean {
  deviceId = '';
}

export class ProjectLibraryBean {
  static LIB_USE_N = 'N';
  static LIB_USE_Y = 'Y';
  static PROJECT_LIB_TYPE_ADMOB = 2;
  static PROJECT_LIB_TYPE_COMPAT = 1;
  static PROJECT_LIB_TYPE_FIREBASE = 0;
  static PROJECT_LIB_TYPE_GOOGLE_MAP = 3;

  appId = '';
  adUnits: AdUnitBean[] = [];
  data = '';
  libType = 0;
  reserved1 = '';
  reserved2 = '';
  reserved3 = '';
  testDevices: AdTestDeviceBean[] = [];
  useYn = 'N';
  configurations: JMap<string, any> = new JMap();

  constructor(libType?: number) {
    if (libType !== undefined) this.libType = libType;
  }

  isEnabled() {
    return this.useYn === 'Y';
  }

  static fromJson(o: any): ProjectLibraryBean {
    const l = new ProjectLibraryBean();
    assignKnown(l, o);
    if (!Array.isArray(l.adUnits)) l.adUnits = [];
    if (!Array.isArray(l.testDevices)) l.testDevices = [];
    l.configurations = new JMap(o && o.configurations && typeof o.configurations === 'object' ? o.configurations : {});
    return l;
  }
}

// ---------- serialization ----------

function assignKnown(target: any, src: any, skip: string[] = []) {
  if (!src || typeof src !== 'object') return;
  for (const k of Object.keys(src)) {
    if (skip.includes(k)) continue;
    if (k in target || src[k] !== undefined) target[k] = src[k];
  }
}

// Gson writes Java float/double fields with a trailing ".0"; we reproduce that so files round-trip identically.
const FLOAT_FIELDS = new Set(['alpha', 'scaleX', 'scaleY', 'translationX', 'translationY']);

function gson(value: any, floatKey = false): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') {
    if (floatKey && Number.isInteger(value)) return value.toFixed(1);
    return String(value);
  }
  if (typeof value === 'string' || typeof value === 'boolean') return gsonString(value);
  if (Array.isArray(value)) return '[' + value.map((v) => gson(v)).join(',') + ']';
  if (value instanceof JMap) {
    const o: any = {};
    value.forEach((k, v) => (o[k] = v));
    value = o;
  }
  const parts: string[] = [];
  for (const k of Object.keys(value)) {
    const v = value[k];
    if (v === undefined || v === null) continue; // Gson skips nulls by default
    if (typeof v === 'function') continue;
    parts.push(gsonString(k) + ':' + gson(v, FLOAT_FIELDS.has(k)));
  }
  return '{' + parts.join(',') + '}';
}

function gsonString(v: any): string {
  if (typeof v !== 'string') return JSON.stringify(v);
  // Gson HTML-escapes <, >, &, =, ' by default
  return JSON.stringify(v).replace(/[<>&='\u2028\u2029]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}

const LAYOUT_KEYS = Object.keys(new LayoutBean());
const TEXT_KEYS = Object.keys(new TextBean());
const IMAGE_KEYS = Object.keys(new ImageBean());
const VIEW_KEYS = Object.keys(new ViewBean()).filter((k) => k !== 'name' && k !== 'isCustomWidget');

function pick(o: any, keys: string[]) {
  const r: any = {};
  for (const k of keys) r[k] = o[k];
  return r;
}

export function viewBeanToJson(v: ViewBean): any {
  const o = pick(v, VIEW_KEYS);
  o.layout = pick(v.layout, LAYOUT_KEYS);
  o.text = pick(v.text, TEXT_KEYS);
  o.image = pick(v.image, IMAGE_KEYS);
  return o;
}

export function toGson(bean: any): string {
  if (bean instanceof ViewBean) return gson(viewBeanToJson(bean));
  if (bean instanceof ProjectFileBean) {
    return gson({
      fileName: bean.fileName,
      fileType: bean.fileType,
      keyboardSetting: bean.keyboardSetting,
      options: bean.options,
      orientation: bean.orientation,
      theme: bean.theme,
    });
  }
  return gson(bean);
}

export { gson as gsonStringify };
