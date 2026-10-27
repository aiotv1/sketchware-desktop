// Options shown when clicking a %m.<menu> input: port of pro.sketchware.menu.ExtraMenuBean#defineMenuSelector,
// ExtraMenuBean#defaultMenus, DefaultExtraMenuBean#getMenu and the LogicEditorActivity selectors.
import { ProjectData } from '../core/project';
import { ComponentBean, ProjectFileBean } from '../core/beans';
import { uq } from '../sw/uq';
import { mq } from '../sw/mq';
import { Gx } from '../sw/Gx';
import { classNameOfType, viewTypeName } from '../sw/viewtypes';
import { parseCustomVariable, lastPath } from './palette';

export type MenuSpec =
  | { kind: 'list'; title: string; options: { value: string; label?: string; hint?: string }[]; allowCode?: boolean }
  | { kind: 'image'; title: string; withNone: boolean }
  | { kind: 'sound'; title: string }
  | { kind: 'font'; title: string }
  | { kind: 'color'; title: string }
  | { kind: 'multi'; title: string; options: string[] }
  | { kind: 'text'; title: string; code?: boolean; hint?: string };

export interface MenuContext {
  project: ProjectData;
  file: ProjectFileBean;
  eventName: string;
  eventId: string;
  customMenus: { name: string; title: string; data: string[] }[];
  resStrings: string[];
  extraActivities: string[];
}

const VIEW_MENUS = new Set(
  'view textview edittext imageview listview spinner listSpn webview checkbox switch seekbar calendarview compoundButton materialButton adview progressbar mapview radiobutton ratingbar searchview videoview gridview actv mactv tablayout viewpager bottomnavigation badgeview patternview sidebar recyclerview cardview collapsingtoolbar textinputlayout swiperefreshlayout radiogroup lottie otpview signinbutton youtubeview codeview datepicker timepicker'.split(' '),
);

const PERMISSIONS = [
  'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'ACCESS_NETWORK_STATE', 'ACCESS_WIFI_STATE', 'BLUETOOTH', 'BLUETOOTH_ADMIN',
  'BLUETOOTH_CONNECT', 'BLUETOOTH_SCAN', 'CALL_PHONE', 'CAMERA', 'INTERNET', 'MANAGE_EXTERNAL_STORAGE', 'POST_NOTIFICATIONS',
  'READ_CONTACTS', 'READ_EXTERNAL_STORAGE', 'READ_MEDIA_AUDIO', 'READ_MEDIA_IMAGES', 'READ_MEDIA_VIDEO', 'READ_PHONE_STATE',
  'READ_SMS', 'RECEIVE_SMS', 'RECORD_AUDIO', 'SEND_SMS', 'SET_WALLPAPER', 'VIBRATE', 'WAKE_LOCK', 'WRITE_CONTACTS',
  'WRITE_EXTERNAL_STORAGE', 'WRITE_SETTINGS',
];

const COMPONENT_MENUS: Record<string, [string, number]> = {
  intent: ['Select an Intent', 1],
  file: ['Select a SharedPreferences', 2],
  calendar: ['Select a Calendar', 3],
  vibrator: ['Select a Vibrator', 4],
  timer: ['Select a Timer', 5],
  firebase: ['Select a Firebase DB', 6],
  dialog: ['Select a Dialog', 7],
  mediaplayer: ['Select a MediaPlayer', 8],
  soundpool: ['Select a SoundPool', 9],
  objectanimator: ['Select an ObjectAnimator', 10],
  gyroscope: ['Select a Gyroscope', 11],
  firebaseauth: ['Select a Firebase Auth', 12],
  interstitialad: ['Select an InterstitialAd', 13],
  firebasestorage: ['Select a FirebaseStorage', 14],
  camera: ['Select a Camera', 15],
  filepicker: ['Select a FilePicker', 16],
  requestnetwork: ['Select a RequestNetwork', 17],
  texttospeech: ['Select a TextToSpeech', 18],
  speechtotext: ['Select a SpeechToText', 19],
  bluetoothconnect: ['Select a BluetoothConnect', 20],
  locationmanager: ['Select a LocationManager', 21],
  videoad: ['Select a component', 22],
  progressdialog: ['Select a component', 23],
  datepickerdialog: ['Select a component', 24],
  timepickerdialog: ['Select a component', 25],
  notification: ['Select a component', 26],
  fragmentAdapter: ['Select a FragmentAdapter Component', 27],
  phoneauth: ['Select a FirebasePhone Component', 28],
  cloudmessage: ['Select a CloudMessage Component', 30],
  googlelogin: ['Select a FirebaseGoogle Component', 31],
  asynctask: ['Select a component', 36],
};

const CONSTANT_MENUS: Record<string, [string, () => string[]]> = {
  intentAction: ['Select an action', () => uq.c$],
  intentFlags: ['Select a flag', () => uq.d],
  calendarField: ['Select a field', () => uq.e],
  aniRepeatMode: ['Select a repeat mode', () => uq.j],
  aniInterpolator: ['Select an interpolator', () => uq.k],
  visible: ['Select visibility', () => uq.g],
  cacheMode: ['Select a cache mode', () => uq.h],
  animatorproperty: ['Select a property', () => uq.i],
  directoryType: ['Select a directory type', () => uq.l],
  method: ['Select a method', () => uq.n],
  requestType: ['Select a request type', () => uq.o],
  providerType: ['Select a provider', () => uq.p],
  mapType: ['Select a map type', () => uq.q],
  markerColor: ['Select a marker color', () => uq.r],
  SignButtonColor: ['Select a SignInButton Color', () => ['COLOR_AUTO', 'COLOR_DARK', 'COLOR_LIGHT']],
  SignButtonSize: ['Select SignInButton Size', () => ['SIZE_ICON_ONLY', 'SIZE_STANDARD', 'SIZE_WIDE']],
  LayoutParam: ['Select layout params', () => ['MATCH_PARENT', 'WRAP_CONTENT']],
  Command: ['Select command', () => ['insert', 'add', 'replace', 'find-replace', 'find-replace-first', 'find-replace-all']],
  til_box_mode: ['Select box mode', () => uq.TIL_BOX_MODE],
  fabsize: ['Select fab size', () => uq.FAB_SIZE],
  fabvisible: ['Select fab visibility', () => uq.FAB_VISIBLE],
  menuaction: ['Select menu action', () => uq.MENU_ACTION],
  porterduff: ['Select porterduff mode', () => uq.PORTER_DUFF],
  transcriptmode: ['Select transcript mode', () => uq.TRANSCRIPT_MODE],
  listscrollparam: ['Select scroll param', () => uq.LIST_SCROLL_STATES],
  recyclerscrollparam: ['Select scroll param', () => uq.RECYCLER_SCROLL_STATES],
  pagerscrollparam: ['Select scroll param', () => uq.RECYCLER_SCROLL_STATES],
  gridstretchmode: ['Select stretch mode', () => uq.GRID_STRETCH_MODE],
  gravity_v: ['Select gravity vertical', () => uq.GRAVITY_VERTICAL],
  gravity_h: ['Select gravity horizontal', () => uq.GRAVITY_HORIZONTAL],
  gravity_t: ['Select gravity toast', () => uq.GRAVITY_TOAST],
  patternviewmode: ['Select patternview mode', () => uq.PATTERNVIEW_MODE],
  styleprogress: ['Select progress style', () => uq.PROGRESS_STYLE],
  cv_theme: ['Select theme', () => uq.CODEVIEW_THEME],
  cv_language: ['Select language', () => uq.CODEVIEW_LANGUAGE],
  import: ['Select a class', () => uq.IMPORT_CLASS_PATH],
  typeface: ['Select a text style', () => ['normal', 'bold', 'italic', 'bold|italic']],
};

/** Menu shown for an input of type 'm' (or a special 's'/'d' input). */
export function menuFor(argType: string, menuName: string, ctx: MenuContext): MenuSpec {
  const p = ctx.project;
  const java = ctx.file.getJavaName();
  if (argType === 'd') return { kind: 'text', title: 'Enter number value' };
  if (argType === 's') {
    if (menuName === 'inputCode') return { kind: 'text', title: 'Enter code', code: true };
    if (menuName === 'import') return { kind: 'text', title: 'Enter the path without import & semicolon' };
    if (menuName === 'url') return { kind: 'text', title: 'Enter a URL' };
    if (menuName === 'intentData') return { kind: 'text', title: 'Enter intent data (e.g. tel:123, https://...)' };
    return { kind: 'text', title: 'Enter string value' };
  }
  const list = (title: string, values: string[], allowCode = true): MenuSpec => ({ kind: 'list', title, options: values.map((v) => ({ value: v })), allowCode });

  switch (menuName) {
    case 'resource':
      return { kind: 'image', title: 'Select an image', withNone: false };
    case 'resource_bg':
      return { kind: 'image', title: 'Select a background image', withNone: true };
    case 'sound':
      return { kind: 'sound', title: 'Select a sound' };
    case 'font':
      return { kind: 'font', title: 'Select a font' };
    case 'color':
      return { kind: 'color', title: 'Select a color' };
    case 'permissions':
      return { kind: 'multi', title: 'Select Permissions', options: PERMISSIONS };
    case 'varInt':
      return list('Select a number variable', p.getVarNames(java, 1));
    case 'varBool':
      return list('Select a boolean variable', p.getVarNames(java, 0));
    case 'String':
    case 'varStr': {
      const names = [...p.getVarNames(java, 2)];
      for (const v of p.getVarNames(java, 6)) {
        const c = parseCustomVariable(v);
        if (c && c.type === 'String') names.push(c.name);
      }
      return list('Select a string variable', names);
    }
    case 'varMap':
      return list('Select a map variable', p.getVarNames(java, 3));
    case 'listInt':
      return list('Select a number list', p.getListNames(java, 1));
    case 'listStr':
      return list('Select a string list', p.getListNames(java, 2));
    case 'listMap':
      return list('Select a map list', p.getListNames(java, 3));
    case 'list':
      return list(
        'Select a list',
        p.getLists(java).map(([, n]) => parseCustomVariable(n)?.name ?? n),
      );
    case 'activity': {
      const acts = p.activities.map((a) => a.getActivityName());
      return { kind: 'list', title: 'Select an activity', options: [...acts.map((v) => ({ value: v })), ...ctx.extraActivities.map((v) => ({ value: v, hint: 'custom' }))], allowCode: true };
    }
    case 'customViews':
      return list('Select a Custom View', p.customViews.map((f) => f.fileName));
    case 'ResString':
      return list('Select a ResString', ['R.string.app_name', ...ctx.resStrings.filter((s) => s !== 'app_name').map((s) => 'R.string.' + s)]);
    case 'AdUnit':
      return list('Select an Ad Unit', p.admob.adUnits.map((a) => a.id));
    case 'TestDevice':
      return list('Select a Test device', p.admob.testDevices.map((d) => d.deviceId));
    case 'Variable':
      return list(
        'Select a Variable',
        p.getVars(java).map(([, n]) => parseCustomVariable(n)?.name ?? n),
      );
    case 'Component':
      return list('Select a Component', p.getComponents(java).map((c) => c.componentId));
    case 'CustomVar': {
      const names: string[] = [];
      for (const v of p.getVarNames(java, 5)) {
        const m = /^(\w+)[\s]+(\w+)/.exec(v);
        if (m) names.push(m[2]);
      }
      for (const v of p.getVarNames(java, 6)) names.push(parseCustomVariable(v)?.name ?? v);
      return list('Select a Custom Variable', names);
    }
  }
  if (VIEW_MENUS.has(menuName)) return viewMenu(menuName, ctx);
  const comp = COMPONENT_MENUS[menuName];
  if (comp) return list(comp[0], p.getComponentsOfType(java, comp[1]).map((c) => c.componentId));
  const cons = CONSTANT_MENUS[menuName];
  if (cons) return list(cons[0], cons[1]());

  // custom menus (menu.json), custom variables of that type, custom components
  const custom = ctx.customMenus.find((m) => m.name === menuName);
  let title = custom?.title ?? 'Select a ' + menuName + ' Variable';
  const values = [...(custom?.data ?? [])];
  for (const v of p.getVarNames(java, 5)) {
    const m = /^(\w+)[\s]+(\w+)/.exec(v);
    if (m && m[1] === menuName) {
      title = 'Select a ' + m[1] + ' Variable';
      values.push(m[2]);
    }
  }
  for (const v of p.getVarNames(java, 6)) {
    const c = parseCustomVariable(v);
    if (c && c.type === menuName) {
      title = 'Select a ' + c.type + ' Variable';
      values.push(c.name);
    }
  }
  for (const c of p.getComponents(java)) {
    if (c.type > 36 && ComponentBean.getComponentTypeName(c.type) === menuName) {
      title = 'Select a ' + menuName;
      values.push(c.componentId);
    }
  }
  return list(title, values);
}

/** LogicEditorActivity.f(Ss): views of the layout whose class matches the input's class. */
function viewMenu(menuName: string, ctx: MenuContext): MenuSpec {
  const p = ctx.project;
  let xml = ctx.file.getXmlName();
  if (ctx.eventName === 'onBindCustomView') {
    const v = p.getView(xml, ctx.eventId) ?? p.getView('_drawer_' + xml, ctx.eventId);
    if (v && v.customView) xml = ProjectFileBean.getXmlNameOf(v.customView);
  }
  const target: Gx = mq.a('m', menuName);
  const cls = target?.getClassName() ?? 'View';
  const opts: { value: string; label?: string; hint?: string }[] = [];
  for (const v of p.views.get(xml) ?? []) {
    if (v.convert === 'include') continue;
    const vc = new Gx(classNameOfType(v.type));
    if ((cls === 'CheckBox' && vc.a('CompoundButton')) || vc.a(cls)) {
      opts.push({ value: v.id, hint: v.convert ? lastPath(v.convert) : viewTypeName(v.type) });
    }
  }
  return { kind: 'list', title: 'Select a view', options: opts, allowCode: true };
}
