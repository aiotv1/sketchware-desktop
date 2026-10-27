// Palette contents per category: a port of dev.aldi.sayuti.block.ExtraPaletteBlock#setBlock
// and mod.hilal.saif.blocks.BlocksHandler#primaryBlocksA..D.
import { ProjectData } from '../core/project';
import { ProjectFileBean, ViewBean, ComponentBean } from '../core/beans';
import { CATEGORY_COLORS, getAllExtraBlocks, getCustomPalettes } from './registry';
import { listTypeName } from './kq';
import { Gx } from '../sw/Gx';
import { classNameOfType, viewTypeName } from '../sw/viewtypes';
import { ReturnMoreblockManager } from '../sw/ReturnMoreblockManager';

export type PaletteItem =
  | { kind: 'label'; text: string }
  | { kind: 'button'; text: string; action: string }
  | { kind: 'block'; type: string; opCode: string; typeName?: string; spec?: string; deprecated?: string }
  | { kind: 'stack'; name: string; beans: any[] };

/** Palette category listing the user's block collection (saved stacks). */
export const COLLECTION_CATEGORY: PaletteCategory = { id: 1000, name: 'Collection', color: 0xff607d8b | 0 };

export interface PaletteCategory {
  id: number;
  name: string;
  color: number;
}

export const MAIN_CATEGORIES: PaletteCategory[] = [
  { id: 0, name: 'Variable', color: CATEGORY_COLORS.var },
  { id: 1, name: 'List', color: CATEGORY_COLORS.list },
  { id: 2, name: 'Control', color: CATEGORY_COLORS.control },
  { id: 3, name: 'Operator', color: CATEGORY_COLORS.operator },
  { id: 4, name: 'Math', color: CATEGORY_COLORS.math },
  { id: 5, name: 'File', color: CATEGORY_COLORS.file },
  { id: 6, name: 'View', color: CATEGORY_COLORS.view },
  { id: 7, name: 'Component', color: CATEGORY_COLORS.component },
  { id: -1, name: 'XML Strings', color: CATEGORY_COLORS.resString },
  { id: 8, name: 'More Block', color: CATEGORY_COLORS.moreBlock },
];

export function allCategories(): PaletteCategory[] {
  return [...MAIN_CATEGORIES, ...getCustomPalettes().map((p) => ({ id: p.index, name: p.text, color: p.color }))];
}

export interface PaletteContext {
  project: ProjectData;
  file: ProjectFileBean; // the activity being edited
  eventName: string;
  eventId: string; // target id of the event (view id for onBindCustomView)
  showBuiltIn: boolean;
  showAll: boolean;
  viewBinding: boolean;
  resStrings: string[]; // keys from files/resource/values/strings.xml
  hasAssets: boolean;
  hasBroadcast: boolean;
  hasService: boolean;
}

function classOf(v: ViewBean): Gx {
  return new Gx(classNameOfType(v.type));
}

function generateParameterFromId(id: string): string {
  // mod.pranav.viewbinding.ViewBindingBuilder.generateParameterFromId: snake/other -> camelCase
  const parts = id.split('_').filter((p) => p.length);
  if (!parts.length) return id;
  return parts[0] + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.substring(1)).join('');
}

export function lastPath(convert: string): string {
  const i = convert.lastIndexOf('.');
  return i >= 0 ? convert.substring(i + 1) : convert;
}

export function buildPalette(paletteId: number, ctx: PaletteContext): PaletteItem[] {
  const out: PaletteItem[] = [];
  const p = ctx.project;
  const javaName = ctx.file.getJavaName();
  const xmlName = ctx.file.getXmlName();
  const label = (text: string) => out.push({ kind: 'label', text });
  const b = (type: string, opCode: string) => out.push({ kind: 'block', type, opCode });
  const v = (spec: string, type: string, opCode: string, typeName = '') => out.push({ kind: 'block', type, opCode, spec, typeName });
  const btn = (text: string, action: string) => out.push({ kind: 'button', text, action });
  const showAll = () => ctx.showAll;
  const showBuiltIn = () => ctx.showBuiltIn || ctx.showAll;

  const memo = new Map<string, boolean>();
  const isWidgetUsed = (cls: string): boolean => {
    if (ctx.showAll) return true;
    if (memo.has(cls)) return memo.get(cls)!;
    let used = false;
    if (ctx.eventName === 'onBindCustomView') {
      const view = p.getView(xmlName, ctx.eventId) ?? p.getView('_drawer_' + xmlName, ctx.eventId);
      if (view && view.customView) {
        const cv = p.views.get(ProjectFileBean.getXmlNameOf(view.customView)) ?? [];
        used = cv.some((x) => classOf(x).a(cls));
      }
    } else {
      used = (p.views.get(xmlName) ?? []).some((x) => classOf(x).a(cls));
    }
    memo.set(cls, used);
    return used;
  };
  const isVarUsed = (t: number) => p.getVars(javaName).some((x) => x[0] === t);
  const isListUsed = (t: number) => p.getLists(javaName).some((x) => x[0] === t);
  const isComponentUsed = (t: number) => ctx.showAll || p.hasComponentType(javaName, t);
  const isCustomVarUsed = (name: string) => {
    if (ctx.showAll) return true;
    return p
      .getVars(javaName)
      .filter((x) => x[0] === 5)
      .some((x) => {
        const m = /^(\w+)[\s]+(\w+)/.exec(x[1]);
        return m && m[1] === name;
      });
  };

  if (ctx.eventName === 'Import') {
    if (paletteId === 3) b(' ', 'addSourceDirectly');
    else {
      label('Enter the path without import & semicolon');
      b(' ', 'customImport');
      b(' ', 'customImport2');
    }
    return out;
  }

  switch (paletteId) {
    case -1: {
      b('s', 'getResString');
      label('Saved Res Strings :');
      if (!ctx.resStrings.includes('app_name')) out.push({ kind: 'block', type: 's', opCode: 'getResStr', spec: 'app_name' });
      for (const k of ctx.resStrings) out.push({ kind: 'block', type: 's', opCode: 'getResStr', spec: k });
      return out;
    }
    case 0: {
      btn('Add variable', 'variableAdd');
      btn('Add custom variable', 'variableAddNew');
      btn('Remove variable', 'variableRemove');
      const vars = p.getVars(javaName);
      const group = (t: number, title: string, type: string) => {
        const list = vars.filter((x) => x[0] === t);
        list.forEach((x, i) => {
          if (i === 0) label(title);
          v(x[1], type, 'getVar');
        });
      };
      group(0, 'Boolean', 'b');
      group(1, 'Number', 'd');
      group(2, 'String', 's');
      group(3, 'Map', 'a');
      vars
        .filter((x) => x[0] === 5)
        .forEach((x, i) => {
          if (i === 0) label('Custom Variable');
          const split = x[1].split(' ');
          if (split.length > 1) v(split[1], 'v', 'getVar', split[0]);
        });
      vars
        .filter((x) => x[0] === 6)
        .forEach((x, i) => {
          if (i === 0) label('Custom Variable');
          const parsed = parseCustomVariable(x[1]);
          if (parsed) {
            const t = parsed.type;
            const bt =
              t === 'boolean' || t === 'Boolean'
                ? 'b'
                : t === 'String'
                  ? 's'
                  : ['double', 'Double', 'int', 'Integer', 'float', 'Float', 'long', 'Long', 'short', 'Short'].includes(t)
                    ? 'd'
                    : 'v';
            v(parsed.name, bt, 'getVar', t);
          } else label('Invalid: ' + x[1]);
        });
      // BlocksHandler.primaryBlocksA
      label('Blocks');
      if (showAll() || isVarUsed(0)) b(' ', 'setVarBoolean');
      if (showAll() || isVarUsed(1)) {
        b(' ', 'setVarInt');
        b(' ', 'increaseInt');
        b(' ', 'decreaseInt');
      }
      if (showAll() || isVarUsed(2)) b(' ', 'setVarString');
      if (showAll() || isVarUsed(3)) {
        b(' ', 'mapCreateNew');
        label('Map put values');
        b(' ', 'mapPut');
      }
      if (showBuiltIn() && (showAll() || isVarUsed(3))) {
        ['hashmapPutNumber', 'hashmapPutNumber2', 'hashmapPutBoolean', 'hashmapPutMap', 'hashmapPutListstr', 'hashmapPutListmap'].forEach((o) => b(' ', o));
      }
      if (showAll() || isVarUsed(3)) {
        label('Map get values');
        b('s', 'mapGet');
      }
      if (showBuiltIn() && (showAll() || isVarUsed(3))) {
        b('d', 'hashmapGetNumber');
        b('b', 'hashmapGetBoolean');
        b('a', 'hashmapGetMap');
        out.push({ kind: 'block', type: 'l', typeName: 'List String', opCode: 'hashmapListstr' });
        out.push({ kind: 'block', type: 'l', typeName: 'List Map', opCode: 'hashmapGetListmap' });
      }
      if (showAll() || isVarUsed(3)) {
        label('Map general');
        b('b', 'mapIsEmpty');
        b('b', 'mapContainKey');
        b('b', 'mapContainValue');
        b('d', 'mapSize');
        b(' ', 'mapRemoveKey');
        b(' ', 'mapClear');
        b(' ', 'mapGetAllKeys');
      }
      blockCustomViews();
      blockDrawer();
      blockEvents();
      if (ctx.eventName === 'onCreateOptionsMenu') {
        label('Menu Item');
        b(' ', 'menuItemSetVisible');
        b(' ', 'menuItemSetEnabled');
        out.push({ kind: 'block', type: 'v', typeName: 'MenuItem', opCode: 'menuFindItem' });
      }
      blockComponents();
      return out;
    }
    case 1: {
      btn('Add list', 'listAdd');
      btn('Add custom List', 'listAddCustom');
      btn('Remove list', 'listRemove');
      for (const [t, name] of p.getLists(javaName)) {
        if (t === 1 || t === 2 || t === 3) v(name, 'l', 'getVar', listTypeName(t));
        else {
          const parsed = parseCustomVariable(name);
          if (parsed) v(parsed.name, 'l', 'getVar', 'List');
          else label('Invalid: ' + name);
        }
      }
      const inBind = ctx.eventName === 'onBindCustomView';
      const inFiles = ctx.eventName === 'onFilesPicked';
      const n = isListUsed(1);
      const s = isListUsed(2);
      const m = isListUsed(3);
      if (showAll() || n) {
        label('List Number');
        b('b', 'containListInt');
        b('d', 'getAtListInt');
        b('d', 'indexListInt');
        b(' ', 'addListInt');
        b(' ', 'insertListInt');
      }
      if (showBuiltIn() && (showAll() || n)) b(' ', 'setAtPosListnum');
      if (showBuiltIn() && (showAll() || n)) b(' ', 'sortListnum');
      if (showAll() || s || inFiles) {
        label('List String');
        b('b', 'containListStr');
        b('d', 'indexListStr');
        b('s', 'getAtListStr');
        b(' ', 'addListStr');
        b(' ', 'insertListStr');
      }
      if (showBuiltIn() && (showAll() || s)) b(' ', 'setAtPosListstr');
      if (showAll() || s) b(' ', 'sortList');
      if (showAll() || m || inBind) {
        label('List Map');
        b('b', 'containListMap');
        b('s', 'getAtListMap');
        if (showBuiltIn()) b('a', 'getMapAtPosListmap');
        b(' ', 'addListMap');
        b(' ', 'insertListMap');
        b(' ', 'setListMap');
        b(' ', 'setMapAtPosListmap');
      }
      if (showAll() || m) {
        b(' ', 'addMapToList');
        b(' ', 'insertMapToList');
        b(' ', 'getMapInList');
        b(' ', 'deleteMapFromListmap');
        b(' ', 'sortListmap');
      }
      if (showAll() || m || s || n || inBind || inFiles) {
        label('General');
        b(' ', 'listAddAll');
        b('d', 'lengthList');
        b(' ', 'deleteList');
        b(' ', 'clearList');
        b(' ', 'reverseList');
        if (showBuiltIn()) {
          b(' ', 'shuffleList');
          b(' ', 'swapInList');
        }
      }
      return out;
    }
    case 2: {
      b('c', 'repeat');
      if (showBuiltIn()) {
        b('c', 'repeatKnownNum');
        b('c', 'RepeatKnownNumDescending');
      }
      b('c', 'forever');
      if (showBuiltIn()) b('c', 'whileLoop');
      b('c', 'if');
      b('e', 'ifElse');
      if (showBuiltIn()) {
        b('b', 'instanceOfOperator');
        b('b', 'isEmpty');
        b('c', 'switchStr');
        b(' ', 'caseStrAnd');
        b('c', 'caseStr');
        b('c', 'switchNum');
        b(' ', 'caseNumAnd');
        b('c', 'caseNum');
        b('c', 'defaultSwitch');
        b('e', 'tryCatch');
        b('s', 'ternaryString');
        b('d', 'ternaryNumber');
        b('f', 'returnString');
        b('f', 'returnNumber');
        b('f', 'returnBoolean');
        b('f', 'returnMap');
        b('f', 'returnListStr');
        b('f', 'returnListMap');
        b('f', 'returnView');
        b('f', 'break');
        b('f', 'continue');
      }
      return out;
    }
    case 3: {
      for (const o of ['true', 'false', '<', '=', '>', '&&', '||', 'not']) b('b', o);
      for (const o of ['+', '-', '*', '/', '%', 'random', 'stringLength']) b('d', o);
      b('s', 'stringJoin');
      b('d', 'stringIndex');
      b('d', 'stringLastIndex');
      b('s', 'stringSub');
      if (showBuiltIn()) b('s', 'stringSubSingle');
      b('b', 'stringEquals');
      b('b', 'stringContains');
      if (showBuiltIn()) b('b', 'stringMatches');
      b('s', 'stringReplace');
      if (showBuiltIn()) {
        b('s', 'stringReplaceFirst');
        b('s', 'stringReplaceAll');
        b('s', 'reverse');
        b('s', 'html');
      }
      b('s', 'trim');
      b('s', 'toUpperCase');
      b('s', 'toLowerCase');
      b('d', 'toNumber');
      b('d', 'strParseInteger');
      b('d', 'toHashCode');
      b('s', 'toString');
      b('s', 'toStringWithDecimal');
      b('s', 'toStringFormat');
      b(' ', 'strToMap');
      b('s', 'mapToStr');
      b(' ', 'strToListMap');
      b('s', 'listMapToStr');
      if (showBuiltIn()) {
        b(' ', 'GsonStringToListString');
        b(' ', 'GsonStringToListNumber');
        b('s', 'GsonListTojsonString');
        b(' ', 'stringSplitToList');
      }
      label('add source directly');
      b(' ', 'addSourceDirectly');
      b('b', 'asdBoolean');
      b('d', 'asdNumber');
      b('s', 'asdString');
      return out;
    }
    case 4: {
      b('d', 'mathGetDip');
      b('d', 'mathGetDisplayWidth');
      b('d', 'mathGetDisplayHeight');
      for (const o of ['mathPi', 'mathE', 'mathPow', 'mathMin', 'mathMax', 'mathSqrt', 'mathAbs', 'mathRound', 'mathCeil', 'mathFloor', 'mathSin', 'mathCos', 'mathTan', 'mathAsin', 'mathAcos', 'mathAtan', 'mathExp', 'mathLog', 'mathLog10', 'mathToRadian', 'mathToDegree'])
        b('d', o);
      return out;
    }
    case 5: {
      if (isCustomVarUsed('File')) {
        label('File Blocks');
        b('b', 'fileCanExecute');
        b('b', 'fileCanRead');
        b('b', 'fileCanWrite');
        b('s', 'fileGetName');
        b('s', 'fileGetParent');
        b('s', 'fileGetPath');
        b('b', 'fileIsHidden');
      }
      label('FileUtil Blocks');
      if (ctx.hasAssets) {
        b(' ', 'getAssetFile');
        b('s', 'copyAssetFile');
      }
      b('s', 'fileutilread');
      for (const o of ['fileutilwrite', 'fileutilcopy', 'fileutilcopydir', 'fileutilmove', 'fileutildelete', 'renameFile']) b(' ', o);
      b('b', 'fileutilisexist');
      b(' ', 'fileutilmakedir');
      b(' ', 'fileutillistdir');
      b('b', 'fileutilisdir');
      b('b', 'fileutilisfile');
      b('d', 'fileutillength');
      b('b', 'fileutilStartsWith');
      b('b', 'fileutilEndsWith');
      b('s', 'fileutilGetLastSegmentPath');
      b('s', 'getExternalStorageDir');
      b('s', 'getPackageDataDir');
      b('s', 'getPublicDir');
      for (const o of ['resizeBitmapFileRetainRatio', 'resizeBitmapFileToSquare', 'resizeBitmapFileToCircle', 'resizeBitmapFileWithRoundedBorder', 'cropBitmapFileFromCenter', 'rotateBitmapFile', 'scaleBitmapFile', 'skewBitmapFile', 'setBitmapFileColorFilter', 'setBitmapFileBrightness', 'setBitmapFileContrast'])
        b(' ', o);
      b('d', 'getJpegRotate');
      return out;
    }
    case 6:
      viewPalette();
      return out;
    case 7:
      componentPalette();
      return out;
    case 8: {
      btn('Create', 'blockAdd');
      btn('Import From Collection', 'blockImport');
      if (ctx.showBuiltIn) {
        b(' ', 'customToast');
        b(' ', 'customToastWithIcon');
      }
      for (const [, spec] of p.getFuncs(javaName)) {
        const ch = ReturnMoreblockManager.getMoreblockChar(spec);
        const name = ReturnMoreblockManager.getMbName(spec);
        if (ch.includes('|')) {
          const [t, tn] = ch.split('|');
          v(name, t, 'definedFunc', tn);
        } else v(name, ch, 'definedFunc');
      }
      if (ctx.showBuiltIn) {
        label('Command Blocks');
        b('c', 'CommandBlockJava');
        out.push({ kind: 'block', type: 'c', opCode: 'CommandBlockXML', deprecated: 'Deprecated: Use XML Command Manager' });
        label('Permission Command Blocks');
        b(' ', 'addPermission');
        b(' ', 'removePermission');
        label('Other Command Blocks');
        b(' ', 'addCustomVariable');
        b(' ', 'addInitializer');
      }
      return out;
    }
    default: {
      for (const ex of getAllExtraBlocks()) {
        if (String(ex.palette) !== String(paletteId)) continue;
        if (ex.type === 'h') label(ex.spec ?? '');
        else out.push({ kind: 'block', type: ex.type, typeName: ex.typeName ?? '', opCode: ex.name });
      }
      return out;
    }
  }

  // ------------------------------------------------------------ helpers (closures over ctx)
  function blockComponents() {
    const comps = p.getComponents(javaName);
    comps.forEach((c, i) => {
      if (i === 0) label('Components');
      if (c.type !== 27) v(c.componentId, 'p', 'getVar', componentTypeName(c.type));
    });
  }

  function blockCustomViews() {
    if (ctx.eventName === 'onBindCustomView') {
      const view = p.getView(xmlName, ctx.eventId) ?? p.getView('_drawer_' + xmlName, ctx.eventId);
      if (!view) return;
      if (view.customView) {
        const cv = p.views.get(ProjectFileBean.getXmlNameOf(view.customView)) ?? [];
        cv.forEach((x, i) => {
          if (i === 0) label('Custom Views');
          if (x.convert !== 'include') {
            const tn = x.convert === '' ? viewTypeName(x.type) : lastPath(x.convert);
            const id = ctx.viewBinding ? 'binding.' + generateParameterFromId(x.id) : x.id;
            v(id, 'v', 'getVar', tn);
          }
        });
      }
      b(' ', 'notifyDataSetChanged');
      b('c', 'viewOnClick');
      b('c', 'viewOnLongClick');
      b('c', 'checkboxOnChecked');
      b('b', 'checkboxIsChecked');
      return;
    }
    const views = p.views.get(xmlName) ?? [];
    views.forEach((x, i) => {
      if (i === 0) label('Views');
      if (x.convert !== 'include') {
        const tn = x.convert === '' ? viewTypeName(x.type) : lastPath(x.convert);
        const id = ctx.viewBinding ? 'binding.' + generateParameterFromId(x.id) : x.id;
        v(id, 'v', 'getVar', tn);
      }
    });
  }

  function blockDrawer() {
    if (!ctx.file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER)) return;
    const views = p.views.get(ctx.file.getDrawerXmlName()) ?? [];
    views.forEach((x, i) => {
      if (i === 0) label('Drawer Views');
      if (x.convert !== 'include') {
        const tn = x.convert === '' ? viewTypeName(x.type) : lastPath(x.convert);
        v(ctx.viewBinding ? 'binding.drawer.' + generateParameterFromId(x.id) : '_drawer_' + x.id, 'v', 'getVar', tn);
      }
    });
  }

  function blockEvents() {
    switch (ctx.eventName) {
      case 'onTabAdded':
      case 'onTabLayoutNewTabAdded':
        label('Fragment & TabLayout');
        b('f', 'returnTitle');
        break;
      case 'onFragmentAdded':
        label('Fragment & TabLayout');
        b('f', 'returnFragment');
        break;
      case 'onScrollChanged':
        label('ListView');
        b('d', 'listscrollparam');
        b('d', 'getLastVisiblePosition');
        break;
      case 'onScrollChanged2':
        label('RecyclerView');
        b('d', 'recyclerscrollparam');
        break;
      case 'onPageChanged':
        label('ViewPager');
        b('d', 'pagerscrollparam');
        break;
      case 'onCreateOptionsMenu':
        label('Menu');
        b(' ', 'menuInflater');
        b(' ', 'menuAddItem');
        b(' ', 'menuAddMenuItem');
        b('c', 'menuAddSubmenu');
        b(' ', 'submenuAddItem');
        break;
    }
  }

  function viewPalette() {
    for (const o of ['setEnable']) b(' ', o);
    b('b', 'getEnable');
    b(' ', 'setVisible');
    b('b', 'checkViewVisibility');
    b(' ', 'setElevation');
    b(' ', 'setRotate');
    b('d', 'getRotate');
    b(' ', 'setAlpha');
    b('d', 'getAlpha');
    b(' ', 'setTranslationX');
    b('d', 'getTranslationX');
    b(' ', 'setTranslationY');
    b('d', 'getTranslationY');
    b(' ', 'setScaleX');
    b('d', 'getScaleX');
    b(' ', 'setScaleY');
    b('d', 'getScaleY');
    b('d', 'getLocationX');
    b('d', 'getLocationY');
    b('d', 'getHeight');
    b('d', 'getWidth');
    b(' ', 'requestFocus');
    b(' ', 'removeView');
    b(' ', 'removeViews');
    b(' ', 'addView');
    out.push({ kind: 'block', type: 'v', typeName: 'View', opCode: 'viewGetChildAt' });
    for (const o of ['addViews', 'setGravity', 'setColorFilterView', 'setBgColor', 'setBgResource', 'setBgDrawable', 'setStrokeView', 'setCornerRadiusView', 'setGradientBackground', 'setRadiusAndStrokeView']) b(' ', o);
    {
      const editText = isWidgetUsed('EditText') || isCustomVarUsed('EditText');
      const textView = isWidgetUsed('TextView') || isCustomVarUsed('TextView') || editText;
      const compound =
        isWidgetUsed('CompoundButton') || ['CompoundButton', 'CheckBox', 'RadioButton', 'Switch', 'ToggleButton'].some(isCustomVarUsed);
      const actv = isWidgetUsed('AutoCompleteTextView') || isCustomVarUsed('AutoCompleteTextView');
      const mactv = isWidgetUsed('MultiAutoCompleteTextView') || isCustomVarUsed('MultiAutoCompleteTextView');
      const image = isWidgetUsed('ImageView') || isWidgetUsed('CircleImageView') || isCustomVarUsed('ImageView');
      const rating = isWidgetUsed('RatingBar') || isCustomVarUsed('RatingBar');
      const seek = isWidgetUsed('SeekBar') || isCustomVarUsed('SeekBar');
      const progress = isWidgetUsed('ProgressBar') || isCustomVarUsed('ProgressBar');
      const video = isWidgetUsed('VideoView') || isCustomVarUsed('VideoView');
      const web = isWidgetUsed('WebView') || isCustomVarUsed('WebView');
      if (textView || compound || actv || mactv || image || rating || seek || progress || video || web) {
        label('Widgets');
        if (textView) {
          b(' ', 'setText');
          b('s', 'getText');
          b(' ', 'setTypeface');
          b(' ', 'setTextColor');
          b(' ', 'setTextSize');
        }
        if (editText) {
          for (const o of ['setHint', 'setHintTextColor', 'EditTextdiableSuggestion', 'EditTextLines', 'EditTextSingleLine', 'EditTextShowError', 'EditTextSelectAll', 'EditTextSetSelection', 'EditTextSetMaxLines']) b(' ', o);
          b('d', 'EdittextGetselectionStart');
          b('d', 'EdittextGetselectionEnd');
        }
        if (compound) {
          b(' ', 'setChecked');
          b('b', 'getChecked');
        }
        if (actv) b(' ', 'autoComSetData');
        if (mactv) {
          b(' ', 'multiAutoComSetData');
          b(' ', 'setThreshold');
          b(' ', 'setTokenizer');
        }
        if (image) for (const o of ['setImage', 'setImageCustomRes', 'setImageIdentifier', 'setImageFilePath', 'setImageUrl', 'setColorFilter']) b(' ', o);
        if (rating) {
          b('d', 'getRating');
          b(' ', 'setRating');
          b(' ', 'setNumStars');
          b(' ', 'setStepSize');
        }
        if (seek) {
          b(' ', 'seekBarSetProgress');
          b('d', 'seekBarGetProgress');
          b(' ', 'seekBarSetMax');
          b('d', 'seekBarGetMax');
        }
        if (progress) b(' ', 'progressBarSetIndeterminate');
        if (video) {
          for (const o of ['videoviewSetVideoUri', 'videoviewStart', 'videoviewPause', 'videoviewStop']) b(' ', o);
          for (const o of ['videoviewIsPlaying', 'videoviewCanPause', 'videoviewCanSeekForward', 'videoviewCanSeekBackward']) b('b', o);
          b('d', 'videoviewGetCurrentPosition');
          b('d', 'videoviewGetDuration');
        }
        if (web) {
          b(' ', 'webViewLoadUrl');
          b('s', 'webViewGetUrl');
          b('d', 'webviewGetProgress');
          b(' ', 'webViewSetCacheMode');
          b('b', 'webViewCanGoBack');
          b('b', 'webViewCanGoForward');
          for (const o of ['webViewGoBack', 'webViewGoForward', 'webViewClearCache', 'webViewClearHistory', 'webViewStopLoading', 'webViewZoomIn', 'webViewZoomOut']) b(' ', o);
        }
      }
    }
    {
      const inBind = ctx.eventName === 'onBindCustomView';
      const spinner = isWidgetUsed('Spinner');
      const listView = isWidgetUsed('ListView');
      const recycler = isWidgetUsed('RecyclerView');
      const grid = isWidgetUsed('GridView') || isCustomVarUsed('GridView');
      const pager = isWidgetUsed('ViewPager');
      if (spinner || listView || recycler || grid || pager) {
        label('List');
        if (spinner) {
          for (const o of ['spnSetData', 'spnSetCustomViewData', 'spnRefresh', 'spnSetSelection']) b(' ', o);
          b('d', 'spnGetSelection');
        }
        if (!inBind) {
          if (listView)
            for (const o of ['listSetData', 'listSetCustomViewData', 'listRefresh', 'refreshingList', 'listSmoothScrollTo', 'listViewSetSelection', 'listSetTranscriptMode', 'listSetStackFromBottom', 'ListViewAddHeader', 'listViewRemoveHeader', 'ListViewAddFooter', 'listViewRemoveFooter'])
              b(' ', o);
          if (recycler)
            for (const o of ['recyclerSetCustomViewData', 'recyclerSetLayoutManager', 'recyclerSetLayoutManagerHorizontal', 'recyclerSetHasFixedSize', 'recyclerSmoothScrollToPosition', 'recyclerScrollToPositionWithOffset'])
              b(' ', o);
          if (grid) for (const o of ['gridSetCustomViewData', 'gridSetNumColumns', 'gridSetColumnWidth', 'gridSetVerticalSpacing', 'gridSetHorizontalSpacing', 'gridSetStretchMode']) b(' ', o);
          if (pager) {
            b(' ', 'pagerSetCustomViewData');
            b(' ', 'pagerSetFragmentAdapter');
            b('d', 'pagerGetOffscreenPageLimit');
            b(' ', 'pagerSetOffscreenPageLimit');
            b('d', 'pagerGetCurrentItem');
            b(' ', 'pagerSetCurrentItem');
            b(' ', 'ViewPagerNotifyOnDtatChange');
          }
        } else b(' ', 'setRecyclerViewLayoutParams');
      }
    }
    {
      const drawer = ctx.file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER);
      const fab = ctx.file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FAB);
      const bnv = isWidgetUsed('BottomNavigationView');
      const srl = isWidgetUsed('SwipeRefreshLayout');
      const card = isWidgetUsed('CardView');
      const tab = isWidgetUsed('TabLayout');
      const til = isWidgetUsed('TextInputLayout') || isCustomVarUsed('TextInputLayout');
      if (drawer || fab || bnv || srl || card || tab || til) {
        label('AndroidX components');
        if (drawer) {
          b('b', 'isDrawerOpen');
          b(' ', 'openDrawer');
          b(' ', 'closeDrawer');
        }
        if (fab) for (const o of ['fabIcon', 'fabSize', 'fabVisibility']) b(' ', o);
        if (bnv) b(' ', 'bottomMenuAddItem');
        if (srl) {
          b('c', 'onSwipeRefreshLayout');
          b(' ', 'setRefreshing');
        }
        if (card) for (const o of ['setCardBackgroundColor', 'setCardRadius', 'setCardElevation', 'setPreventCornerOverlap', 'setUseCompatPadding']) b(' ', o);
        if (tab) for (const o of ['addTab', 'setupWithViewPager', 'setInlineLabel', 'setTabTextColors', 'setTabRippleColor', 'setSelectedTabIndicatorColor', 'setSelectedTabIndicatorHeight']) b(' ', o);
        if (til) {
          for (const o of ['tilSetBoxBgColor', 'tilSetBoxStrokeColor', 'tilSetBoxBgMode', 'tilSetBoxCornerRadii', 'tilSetError', 'tilSetErrorEnabled', 'tilSetCounterEnabled', 'tilSetCounterMaxLength']) b(' ', o);
          b('d', 'tilGetCounterMaxLength');
        }
      }
    }
    {
      const wave = isWidgetUsed('WaveSideBar');
      const badge = isWidgetUsed('BadgeView');
      const bubble = isWidgetUsed('BubbleLayout');
      const pattern = isWidgetUsed('PatternLockView');
      const code = isWidgetUsed('CodeView');
      const lottie = isWidgetUsed('LottieAnimationView');
      const otp = isWidgetUsed('OTPView');
      if (wave || badge || bubble || pattern || code || lottie) {
        label('Library');
        if (otp) {
          b(' ', 'otpViewSetFieldCount');
          b(' ', 'otpViewSetOTPText');
          b('s', 'otpViewGetOTPText');
          b('c', 'otpViewSetOTPListener');
        }
        if (wave) b(' ', 'setCustomLetter');
        if (badge) {
          b('d', 'getBadgeCount');
          for (const o of ['setBadgeNumber', 'setBadgeString', 'setBadgeBackground', 'setBadgeTextColor', 'setBadgeTextSize']) b(' ', o);
        }
        if (bubble) for (const o of ['setBubbleColor', 'setBubbleStrokeColor', 'setBubbleStrokeWidth', 'setBubbleCornerRadius', 'setBubbleArrowHeight', 'setBubbleArrowWidth', 'setBubbleArrowPosition']) b(' ', o);
        if (pattern) {
          b('s', 'patternToString');
          b('s', 'patternToMD5');
          b('s', 'patternToSha1');
          for (const o of ['patternSetDotCount', 'patternSetNormalStateColor', 'patternSetCorrectStateColor', 'patternSetWrongStateColor', 'patternSetViewMode', 'patternLockClear']) b(' ', o);
        }
        if (code) for (const o of ['codeviewSetCode', 'codeviewSetLanguage', 'codeviewSetTheme', 'codeviewApply']) b(' ', o);
        if (lottie) for (const o of ['lottieSetAnimationFromAsset', 'lottieSetAnimationFromJson', 'lottieSetAnimationFromUrl', 'lottieSetRepeatCount', 'lottieSetSpeed']) b(' ', o);
      }
    }
    {
      const signIn = isWidgetUsed('SignInButton');
      const yt = isWidgetUsed('YoutubePlayerView');
      const admob = p.admob.useYn === 'Y';
      const map = isWidgetUsed('MapView');
      if (signIn || yt || admob || map) {
        label('Google');
        if (signIn) {
          b(' ', 'signInButtonSetColorScheme');
          b(' ', 'signInButtonSetSize');
        }
        if (yt) {
          b(' ', 'YTPVLifecycle');
          b('c', 'YTPVSetListener');
        }
        if (admob) b(' ', 'bannerAdViewLoadAd');
        if (map)
          for (const o of ['mapViewSetMapType', 'mapViewMoveCamera', 'mapViewZoomTo', 'mapViewZoomIn', 'mapViewZoomOut', 'mapViewAddMarker', 'mapViewSetMarkerInfo', 'mapViewSetMarkerPosition', 'mapViewSetMarkerColor', 'mapViewSetMarkerIcon', 'mapViewSetMarkerVisible'])
            b(' ', o);
      }
    }
    {
      const tp = isWidgetUsed('TimePicker');
      const cv = isWidgetUsed('CalendarView');
      if (tp || cv) {
        label('Date & Time');
        if (tp) for (const o of ['timepickerSetHour', 'timepickerSetMinute', 'timepickerSetCurrentHour', 'timepickerSetCurrentMinute', 'timepickerSetIs24Hour']) b(' ', o);
        if (cv) for (const o of ['calendarViewSetDate', 'calendarViewSetMinDate', 'calnedarViewSetMaxDate']) b(' ', o);
      }
    }
    label('Function');
    b(' ', 'performClick');
    b('c', 'viewOnClick');
    b('c', 'viewOnLongClick');
    b('c', 'viewOnTouch');
    b('c', 'showSnackbar');
  }

  function componentPalette() {
    btn('Add component', 'componentAdd');
    for (const o of ['changeStatebarColour', 'LightStatusBar', 'showKeyboard', 'hideKeyboard', 'doToast', 'copyToClipboard', 'setTitle']) b(' ', o);
    b('b', 'intentHasExtra');
    b('s', 'intentGetString');
    b('f', 'finishActivity');
    b('f', 'finishAffinity');
    const C = ComponentBean;
    if (isComponentUsed(C.COMPONENT_TYPE_INTENT) || isCustomVarUsed('Intent')) {
      label('Intent');
      for (const o of ['intentSetAction', 'intentSetData', 'intentSetType', 'intentSetScreen', 'launchApp', 'intentPutExtra', 'intentRemoveExtra', 'intentSetFlags', 'startActivity', 'startActivityWithChooser']) b(' ', o);
    }
    if (ctx.hasBroadcast) {
      label('Broadcast');
      b(' ', 'sendBroadcast');
    }
    if (ctx.hasService) {
      label('Service');
      b(' ', 'startService');
      b(' ', 'stopService');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_SHAREDPREF)) {
      label('SharedPreferences');
      b('b', 'fileContainsData');
      b('s', 'fileGetData');
      b(' ', 'fileSetData');
      b(' ', 'fileRemoveData');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_DATE_PICKER_DIALOG)) {
      label('DatePickerDialog');
      b(' ', 'datePickerDialogShow');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_TIME_PICKER_DIALOG)) {
      label('TimePickerDialog');
      b(' ', 'timePickerDialogShow');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_CALENDAR)) {
      label('Calendar');
      b(' ', 'calendarGetNow');
      b(' ', 'calendarAdd');
      b(' ', 'calendarSet');
      b('s', 'calendarFormat');
      b('d', 'calendarDiff');
      b('d', 'calendarGetTime');
      b(' ', 'calendarSetTime');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_VIBRATOR)) {
      label('Vibrator');
      b(' ', 'vibratorAction');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_TIMERTASK) || isCustomVarUsed('Timer')) {
      label('Timer');
      b('c', 'timerAfter');
      b('c', 'timerEvery');
      b(' ', 'timerCancel');
    }
    if (isComponentUsed(36)) {
      label('AsyncTask');
      b(' ', 'AsyncTaskExecute');
      b(' ', 'AsyncTaskPublishProgress');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_DIALOG) || isCustomVarUsed('Dialog')) {
      label('Dialog');
      b(' ', 'dialogSetTitle');
      b(' ', 'Dialog SetIcon');
      b(' ', 'dialogSetMessage');
      b('c', 'dialogOkButton');
      b('c', 'dialogCancelButton');
      b('c', 'dialogNeutralButton');
      b(' ', 'dialogShow');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_MEDIAPLAYER)) {
      label('MediaPlayer');
      for (const o of ['mediaplayerCreate', 'mediaplayerStart', 'mediaplayerPause', 'mediaplayerSeek']) b(' ', o);
      b('d', 'mediaplayerGetCurrent');
      b('d', 'mediaplayerGetDuration');
      b('b', 'mediaplayerIsPlaying');
      b(' ', 'mediaplayerSetLooping');
      b('b', 'mediaplayerIsLooping');
      b(' ', 'mediaplayerReset');
      b(' ', 'mediaplayerRelease');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_SOUNDPOOL)) {
      label('SoundPool');
      b(' ', 'soundpoolCreate');
      b('d', 'soundpoolLoad');
      b('d', 'soundpoolStreamPlay');
      b(' ', 'soundpoolStreamStop');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_OBJECTANIMATOR)) {
      label('ObjectAnimator');
      for (const o of ['objectanimatorSetTarget', 'objectanimatorSetProperty', 'objectanimatorSetValue', 'objectanimatorSetFromTo', 'objectanimatorSetDuration', 'objectanimatorSetRepeatMode', 'objectanimatorSetRepeatCount', 'objectanimatorSetInterpolator', 'objectanimatorStart', 'objectanimatorCancel'])
        b(' ', o);
      b('b', 'objectanimatorIsRunning');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_FIREBASE)) {
      label('Firebase');
      b(' ', 'firebaseAdd');
      b(' ', 'firebasePush');
      b('s', 'firebaseGetPushKey');
      b(' ', 'firebaseDelete');
      b('c', 'firebaseGetChildren');
      b(' ', 'firebaseStartListen');
      b(' ', 'firebaseStopListen');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_FIREBASE_AUTH)) {
      label('FirebaseAuth');
      b('b', 'firebaseauthIsLoggedIn');
      b('s', 'firebaseauthGetCurrentUser');
      b('s', 'firebaseauthGetUid');
      for (const o of ['firebaseauthCreateUser', 'firebaseauthSignInUser', 'firebaseauthSignInAnonymously', 'firebaseauthResetPassword', 'firebaseauthSignOutUser']) b(' ', o);
    }
    if (isComponentUsed(C.COMPONENT_TYPE_GYROSCOPE)) {
      label('Gyroscope');
      b(' ', 'gyroscopeStartListen');
      b(' ', 'gyroscopeStopListen');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_INTERSTITIAL_AD)) {
      label('AdMob Interstitial');
      b(' ', 'interstitialAdLoad');
      b(' ', 'interstitialAdShow');
      b('b', 'interstitialAdIsLoaded');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_REWARDED_VIDEO_AD)) {
      label('RewardedVideoAd');
      b(' ', 'rewardedVideoAdLoad');
      b(' ', 'rewardedVideoAdShow');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_FIREBASE_STORAGE)) {
      label('Firebase Storage');
      for (const o of ['firebasestorageUploadFile', 'firebasestorageDownloadFile', 'firebasestorageDelete']) b(' ', o);
    }
    if (isComponentUsed(C.COMPONENT_TYPE_CAMERA)) {
      label('Camera');
      b(' ', 'camerastarttakepicture');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_FILE_PICKER)) {
      label('FilePicker');
      b(' ', 'filepickerstartpickfiles');
      b(' ', 'imageCrop');
    }
    if (isComponentUsed(C.COMPONENT_TYPE_REQUEST_NETWORK)) {
      label('RequestNetwork');
      b('b', 'isConnected');
      for (const o of ['requestnetworkSetParams', 'requestnetworkSetHeaders', 'requestnetworkStartRequestNetwork']) b(' ', o);
    }
    if (isComponentUsed(C.COMPONENT_TYPE_TEXT_TO_SPEECH)) {
      label('TextToSpeech');
      b('b', 'textToSpeechIsSpeaking');
      for (const o of ['textToSpeechSetPitch', 'textToSpeechSetSpeechRate', 'textToSpeechSpeak', 'textToSpeechStop', 'textToSpeechShutdown']) b(' ', o);
    }
    if (isComponentUsed(C.COMPONENT_TYPE_SPEECH_TO_TEXT)) {
      label('SpeechToText');
      for (const o of ['speechToTextStartListening', 'speechToTextStopListening', 'speechToTextShutdown']) b(' ', o);
    }
    if (isComponentUsed(C.COMPONENT_TYPE_BLUETOOTH_CONNECT)) {
      label('Bluetooth');
      b('b', 'bluetoothConnectIsBluetoothEnabled');
      b('b', 'bluetoothConnectIsBluetoothActivated');
      b('s', 'bluetoothConnectGetRandomUuid');
      for (const o of ['bluetoothConnectReadyConnection', 'bluetoothConnectReadyConnectionToUuid', 'bluetoothConnectStartConnection', 'bluetoothConnectStartConnectionToUuid', 'bluetoothConnectStopConnection', 'bluetoothConnectSendData', 'bluetoothConnectActivateBluetooth', 'bluetoothConnectGetPairedDevices'])
        b(' ', o);
    }
    if (isComponentUsed(C.COMPONENT_TYPE_LOCATION_MANAGER)) {
      label('LocationManager');
      b(' ', 'locationManagerRequestLocationUpdates');
      b(' ', 'locationManagerRemoveUpdates');
    }
    if (
      isComponentUsed(C.COMPONENT_TYPE_PROGRESS_DIALOG) ||
      isCustomVarUsed('ProgressDialog') ||
      ['onPreExecute', 'onProgressUpdate', 'onPostExecute'].includes(ctx.eventName)
    ) {
      label('ProgressDialog');
      for (const o of ['progressdialogCreate', 'progressdialogSetTitle', 'progressdialogSetMessage', 'progressdialogSetMax', 'progressdialogSetProgress', 'progressdialogSetCancelable', 'progressdialogSetCanceledOutside', 'progressdialogSetStyle', 'progressdialogShow', 'progressdialogDismiss'])
        b(' ', o);
    }
  }
}

/** ComponentBean.getComponentTypeName (display type name used as getVar typeName). */
export function componentTypeName(type: number): string {
  const names: Record<number, string> = {
    1: 'Intent', 2: 'File', 3: 'Calendar', 4: 'Vibrator', 5: 'Timer', 6: 'FirebaseDB', 7: 'Dialog', 8: 'MediaPlayer',
    9: 'SoundPool', 10: 'ObjectAnimator', 11: 'Gyroscope', 12: 'FirebaseAuth', 13: 'InterstitialAd', 14: 'FirebaseStorage',
    15: 'Camera', 16: 'FilePicker', 17: 'RequestNetwork', 18: 'TextToSpeech', 19: 'SpeechToText', 20: 'BluetoothConnect',
    21: 'LocationManager', 22: 'RewardedVideoAd', 23: 'ProgressDialog', 24: 'DatePickerDialog', 25: 'TimePickerDialog',
    26: 'Notification', 27: 'FragmentAdapter', 28: 'FirebasePhoneAuth', 30: 'FirebaseCloudMessage', 31: 'FirebaseGoogleLogin',
    36: 'AsyncTask',
  };
  return names[type] ?? '';
}

/** pro.sketchware.utility.CustomVariableUtil: "private Type name = value;" style declarations. */
const PATTERN_CUSTOM_VARIABLE =
  /\b((private|public|protected|static|final|transient|volatile)\s+)*([\w$]+(?:\s*,\s*[\w$]+)*(?:\s*<[a-zA-Z0-9.,_ ?<>\[\]]*>)?(?:\[\])*)?\s+([\w$]+)(?:\s*=\s*([^;]+))?\s*/;

export function parseCustomVariable(decl: string): { type: string; name: string; initializer: string | null } | null {
  const m = PATTERN_CUSTOM_VARIABLE.exec(decl);
  if (!m || !m[3] || !m[4]) return null;
  return { type: m[3].replace(/\s/g, ''), name: m[4], initializer: m[5] ?? null };
}
