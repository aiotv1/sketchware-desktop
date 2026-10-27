// Block definitions: built-in Sketchware blocks (specs rebuilt from block_strings + a.a.a.lq/xB),
// Sketchware Pro's extra blocks (BlocksHandler/ExtraBlocks) and the user's custom blocks (block.json).
import builtin from './builtin_specs.json';
import extraList from './extra_blocks.json';

export interface ExtraBlockDef {
  name: string;
  type: string;
  typeName?: string;
  code?: string;
  color?: string;
  palette?: string;
  spec?: string;
  spec2?: string;
}

export interface PaletteDef {
  index: number;
  text: string;
  color: number;
}

const BUILTIN_SPECS: Record<string, string> = (builtin as any).blocks;
export const EVENT_SPECS: Record<string, string> = (builtin as any).events;

const extraByName = new Map<string, ExtraBlockDef>();
let customBlocks: ExtraBlockDef[] = [];
let customPalettes: PaletteDef[] = [];
let projectBlocks = new Map<string, ExtraBlockDef>();

function rebuildExtra() {
  extraByName.clear();
  // custom blocks (block.json) come first, like ExtraBlockFile.getExtraBlockData()
  for (const b of customBlocks) if (b && b.name && !extraByName.has(b.name)) extraByName.set(b.name, b);
  for (const b of extraList as ExtraBlockDef[]) if (!extraByName.has(b.name)) extraByName.set(b.name, b);
}
rebuildExtra();

export function setCustomBlocks(blocks: ExtraBlockDef[], palettes: PaletteDef[]) {
  customBlocks = Array.isArray(blocks) ? blocks : [];
  customPalettes = Array.isArray(palettes) ? palettes : [];
  rebuildExtra();
}

/** Blocks bundled inside a project's data/<sc_id>/custom_blocks (used when the block is missing locally). */
export function setProjectBlocks(blocks: ExtraBlockDef[] | null) {
  projectBlocks = new Map();
  for (const b of blocks ?? []) if (b && b.name) projectBlocks.set(b.name, b);
}

/** Definition of a user block: from the local Block manager first, else the one bundled with the project. */
export function getUserBlockDef(name: string): ExtraBlockDef | undefined {
  return customBlocks.find((b) => b && b.name === name) ?? projectBlocks.get(name);
}

export function getCustomPalettes(): PaletteDef[] {
  return customPalettes;
}
export function getCustomBlocks(): ExtraBlockDef[] {
  return customBlocks;
}
export function getAllExtraBlocks(): ExtraBlockDef[] {
  return [...extraByName.values()];
}

export const DEFAULT_EXTRA_COLOR = 0xff8a55d7 | 0;

export const CATEGORY_COLORS = {
  var: 0xffee7d16 | 0,
  list: 0xffcc5b22 | 0,
  control: 0xffe1a92a | 0,
  operator: 0xff5cb722 | 0,
  math: 0xff23b9a9 | 0,
  file: 0xffa1887f | 0,
  view: 0xff4a6cd4 | 0,
  component: 0xff2ca5e2 | 0,
  resString: 0xff7c83db | 0,
  moreBlock: 0xff8a55d7 | 0,
  event: 0xffc88330 | 0,
};

const LIST_OPS = new Set('addListInt insertListInt deleteList getAtListInt indexListInt lengthList containListInt clearList addListStr insertListStr getAtListStr indexListStr containListStr addListMap insertListMap getAtListMap setListMap containListMap addMapToList insertMapToList getMapInList'.split(' '));
const VAR_OPS = new Set('setVarBoolean setVarInt increaseInt decreaseInt setVarString mapCreateNew mapPut mapGet mapContainKey mapRemoveKey mapSize mapIsEmpty mapClear mapGetAllKeys'.split(' '));
const CONTROL_OPS = new Set('repeat forever break if ifElse'.split(' '));
const OPERATOR_OPS = new Set(['true', 'false', '<', '=', '>', '&&', '||', 'not', '+', '-', '*', '/', '%', ...'random stringLength stringJoin stringIndex stringLastIndex stringSub stringEquals stringContains stringReplace stringReplaceFirst stringReplaceAll toNumber trim toUpperCase toLowerCase toString toStringWithDecimal toStringFormat addSourceDirectly strToMap mapToStr strToListMap listMapToStr'.split(' ')]);
const MATH_OPS = new Set('mathGetDip mathGetDisplayWidth mathGetDisplayHeight mathPi mathE mathPow mathMin mathMax mathSqrt mathAbs mathRound mathCeil mathFloor mathSin mathCos mathTan mathAsin mathAcos mathAtan mathExp mathLog mathLog10 mathToRadian mathToDegree'.split(' '));
const VIEW_OPS = new Set('viewOnClick isDrawerOpen openDrawer closeDrawer setEnable getEnable setVisible setClickable setText setTypeface getText setBgColor setBgResource setTextColor setImage setColorFilter requestFocus setRotate getRotate setAlpha getAlpha setTranslationX getTranslationX setTranslationY getTranslationY setScaleX getScaleX setScaleY getScaleY getLocationX getLocationY setChecked getChecked seekBarGetMax seekBarGetProgress seekBarSetMax seekBarSetProgress setThumbResource setTrackResource listSetData listSetCustomViewData listRefresh listSetItemChecked listGetCheckedPosition listGetCheckedPositions listGetCheckedCount listSmoothScrollTo spnSetData spnRefresh spnSetSelection spnGetSelection webViewLoadUrl webViewGetUrl webViewSetCacheMode webViewCanGoBack webViewCanGoForward webViewGoBack webViewGoForward webViewClearCache webViewClearHistory webViewStopLoading webViewZoomIn webViewZoomOut calendarViewGetDate calendarViewSetDate calendarViewSetMinDate calnedarViewSetMaxDate adViewLoadAd setImageFilePath setImageUrl setHint setHintTextColor progressBarSetIndeterminate mapViewSetMapType mapViewMoveCamera mapViewZoomTo mapViewZoomIn mapViewZoomOut mapViewAddMarker mapViewSetMarkerInfo mapViewSetMarkerPosition mapViewSetMarkerColor mapViewSetMarkerIcon mapViewSetMarkerVisible'.split(' '));
const COMPONENT_OPS = new Set('doToast copyToClipboard setTitle intentSetAction intentSetData intentSetScreen intentPutExtra intentSetFlags startActivity intentGetString finishActivity fileGetData fileSetData fileRemoveData calendarGetNow calendarAdd calendarSet calendarFormat calendarDiff calendarGetTime calendarSetTime vibratorAction timerAfter timerEvery timerCancel dialogSetTitle dialogSetMessage dialogOkButton dialogCancelButton dialogNeutralButton dialogShow dialogDismiss mediaplayerCreate mediaplayerStart mediaplayerPause mediaplayerSeek mediaplayerGetCurrent mediaplayerGetDuration mediaplayerIsPlaying mediaplayerSetLooping mediaplayerIsLooping mediaplayerReset mediaplayerRelease soundpoolCreate soundpoolLoad soundpoolStreamPlay soundpoolStreamStop objectanimatorSetTarget objectanimatorSetProperty objectanimatorSetValue objectanimatorSetFromTo objectanimatorSetDuration objectanimatorSetRepeatMode objectanimatorSetRepeatCount objectanimatorSetInterpolator objectanimatorStart objectanimatorCancel objectanimatorIsRunning firebaseAdd firebaseDelete firebasePush firebaseGetPushKey firebaseGetChildren firebaseauthCreateUser firebaseauthSignInUser firebaseauthSignInAnonymously firebaseauthIsLoggedIn firebaseauthGetCurrentUser firebaseauthGetUid firebaseauthResetPassword firebaseauthSignOutUser firebaseStartListen firebaseStopListen gyroscopeStartListen gyroscopeStopListen interstitialadCreate interstitialadLoadAd interstitialadShow firebasestorageUploadFile firebasestorageDownloadFile firebasestorageDelete camerastarttakepicture filepickerstartpickfiles requestnetworkSetParams requestnetworkSetHeaders requestnetworkStartRequestNetwork textToSpeechSetPitch textToSpeechSetSpeechRate textToSpeechSpeak textToSpeechIsSpeaking textToSpeechStop textToSpeechShutdown speechToTextStartListening speechToTextStopListening speechToTextShutdown bluetoothConnectReadyConnection bluetoothConnectReadyConnectionToUuid bluetoothConnectStartConnection bluetoothConnectStartConnectionToUuid bluetoothConnectStopConnection bluetoothConnectSendData bluetoothConnectIsBluetoothEnabled bluetoothConnectIsBluetoothActivated bluetoothConnectActivateBluetooth bluetoothConnectGetPairedDevices bluetoothConnectGetRandomUuid locationManagerRequestLocationUpdates locationManagerRemoveUpdates'.split(' '));
const FILE_OPS = new Set('fileutildelete fileutilcopy fileutilwrite fileutilread fileutilmove fileutilisexist fileutilmakedir fileutillistdir fileutilisdir fileutilisfile fileutillength fileutilStartsWith fileutilEndsWith fileutilGetLastSegmentPath getExternalStorageDir getPackageDataDir getPublicDir resizeBitmapFileRetainRatio resizeBitmapFileToSquare resizeBitmapFileToCircle resizeBitmapFileWithRoundedBorder cropBitmapFileFromCenter rotateBitmapFile scaleBitmapFile skewBitmapFile setBitmapFileColorFilter setBitmapFileBrightness setBitmapFileContrast getJpegRotate'.split(' '));

/** a.a.a.kq#a(opcode, blockType): the block's colour. Returns DEFAULT_EXTRA_COLOR for non built-ins. */
export function builtinColor(opCode: string, blockType: string): number {
  const C = CATEGORY_COLORS;
  if (blockType === 'h') return C.event;
  if (opCode === 'getResStr') return C.resString;
  if (opCode === 'getVar') {
    if (blockType === 'v') return C.view;
    if (blockType === 'p') return C.component;
    if (blockType === 'l') return C.list;
    return C.var;
  }
  if (LIST_OPS.has(opCode)) return C.list;
  if (VAR_OPS.has(opCode)) return C.var;
  if (CONTROL_OPS.has(opCode)) return C.control;
  if (OPERATOR_OPS.has(opCode)) return C.operator;
  if (MATH_OPS.has(opCode)) return C.math;
  if (VIEW_OPS.has(opCode)) return C.view;
  if (COMPONENT_OPS.has(opCode)) return C.component;
  if (FILE_OPS.has(opCode)) return C.file;
  return DEFAULT_EXTRA_COLOR;
}

export function parseColor(c: string | undefined | null): number | null {
  if (!c) return null;
  let s = c.trim();
  if (s.startsWith('#')) s = s.substring(1);
  if (/^[0-9a-fA-F]{6}$/.test(s)) return (0xff000000 | parseInt(s, 16)) | 0;
  if (/^[0-9a-fA-F]{8}$/.test(s)) return parseInt(s, 16) | 0;
  return null;
}

export function getExtraBlock(name: string): ExtraBlockDef | undefined {
  return extraByName.get(name) ?? projectBlocks.get(name);
}

export interface ResolvedBlock {
  spec: string;
  spec2: string;
  color: number;
  missing: boolean;
}

const PALETTE_COLOR_BY_INDEX: Record<string, number> = {
  '0': CATEGORY_COLORS.var,
  '1': CATEGORY_COLORS.list,
  '2': CATEGORY_COLORS.control,
  '3': CATEGORY_COLORS.operator,
  '4': CATEGORY_COLORS.math,
  '5': CATEGORY_COLORS.file,
  '6': CATEGORY_COLORS.view,
  '7': CATEGORY_COLORS.component,
  '8': CATEGORY_COLORS.moreBlock,
};

/** Spec + colour a palette block gets (Rs.l()). */
export function resolveBlock(opCode: string, type: string): ResolvedBlock {
  let color = builtinColor(opCode, type);
  const special = opCode === 'definedFunc' || opCode === 'getVar' || opCode === 'getResStr' || opCode === 'getArg';
  if (type !== 'h' && !special && color !== DEFAULT_EXTRA_COLOR) {
    return { spec: BUILTIN_SPECS[opCode] ?? opCode, spec2: '', color, missing: false };
  }
  if (color === DEFAULT_EXTRA_COLOR) {
    const ex = getExtraBlock(opCode);
    if (ex) {
      let c = parseColor(ex.color);
      if (c == null && ex.palette != null) {
        const pal = customPalettes.find((p) => String(p.index) === String(ex.palette));
        c = pal ? pal.color | 0 : PALETTE_COLOR_BY_INDEX[String(ex.palette)] ?? null;
      }
      if (c != null && !special) color = c;
      return { spec: ex.spec ?? '', spec2: ex.spec2 ?? '', color, missing: false };
    }
    // ManageEvent.h(): event-specific spec fallbacks are resolved by the caller
    return { spec: BUILTIN_SPECS[opCode] ?? '', spec2: '', color, missing: !BUILTIN_SPECS[opCode] && !special };
  }
  return { spec: '', spec2: '', color, missing: false };
}

export function builtinSpec(opCode: string): string | undefined {
  return BUILTIN_SPECS[opCode];
}

export function isBuiltinOpcode(opCode: string): boolean {
  return opCode in BUILTIN_SPECS;
}

// ---------------------------------------------------------------------------
// Spec tokenizer (a.a.a.FB$a): words split by spaces, "%x" only starts an argument at a token start.

export function tokenizeSpec(spec: string): string[] {
  const out: string[] = [];
  let i = 0;
  const n = spec.length;
  while (i < n) {
    while (i < n && spec[i] === ' ') i++;
    if (i >= n) break;
    const start = i;
    let isArg = false;
    let tok = '';
    while (i < n && spec[i] !== ' ') {
      const c = spec[i];
      if (c === '\\') {
        tok += c + (spec[i + 1] ?? '');
        i += 2;
        continue;
      }
      if (c === '%') {
        if (i > start) break;
        isArg = true;
      }
      if (isArg && (c === '?' || c === '-')) break;
      tok += c;
      i++;
    }
    if (tok.length > 0) out.push(tok);
    else i++;
  }
  return out;
}

export function unescapeLabel(s: string): string {
  let r = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\') {
      i++;
      r += s[i] ?? '';
    } else r += s[i];
  }
  return r;
}

export type ArgKind = 'b' | 'd' | 's' | 'm';

export interface SpecPart {
  kind: 'label' | 'arg';
  text: string; // label text, or raw token for args
  argType?: ArgKind;
  menu?: string; // for %m.xxx: "xxx"; for %s.xxx: "xxx"
}

export function parseSpec(spec: string): SpecPart[] {
  return tokenizeSpec(spec).map((t) => {
    if (t.length >= 2 && t[0] === '%') {
      const c = t[1];
      if (c === 'b' || c === 'd') return { kind: 'arg', text: t, argType: c as ArgKind, menu: t.length > 3 ? t.substring(3) : '' };
      if (c === 'm') return { kind: 'arg', text: t, argType: 'm', menu: t.substring(3) };
      if (c === 's') return { kind: 'arg', text: t, argType: 's', menu: t.length > 2 ? t.substring(3) : '' };
    }
    return { kind: 'label', text: unescapeLabel(t) };
  });
}

/** Parameter type tokens of a spec, as used by the code generator (Fx#extractParamsTypes). */
export function specParamTypes(spec: string): string[] {
  const m = spec.match(/%\w+(?:\.\w+)?|%\w/g);
  return m ? m.map((x) => x.toLowerCase()) : [];
}
