// Wires the ported Sketchware code to the desktop environment.
import { beanHooks } from '../core/beans';
import { Gx } from './Gx';
import { mq } from './mq';
import { classNameOfType, viewTypeName } from './viewtypes';
import { setExternalStorage, setToastHandler } from './env';
import { setAssetsDir, setCurrentProject } from './platform';
import { ComponentsHandler } from './ComponentsHandler';
import { EventsHandler } from './EventsHandler';
import type { ProjectData } from '../core/project';

const COMPONENT_NAMES: Record<number, string> = {
  1: 'Intent', 2: 'File', 3: 'Calendar', 4: 'Vibrator', 5: 'Timer', 6: 'FirebaseDB', 7: 'Dialog', 8: 'MediaPlayer',
  9: 'SoundPool', 10: 'ObjectAnimator', 11: 'Gyroscope', 12: 'FirebaseAuth', 13: 'InterstitialAd', 14: 'FirebaseStorage',
  15: 'Camera', 16: 'FilePicker', 17: 'RequestNetwork', 18: 'TextToSpeech', 19: 'SpeechToText', 20: 'BluetoothConnect',
  21: 'LocationManager', 22: 'RewardedVideoAd', 23: 'ProgressDialog', 24: 'DatePickerDialog', 25: 'TimePickerDialog',
  26: 'Notification', 27: 'FragmentAdapter', 28: 'FirebasePhoneAuth', 30: 'FirebaseCloudMessage', 31: 'FirebaseGoogleLogin',
};

let hooked = false;

export function installHooks() {
  if (hooked) return;
  hooked = true;
  beanHooks.viewClassInfo = (_v, type) => new Gx(classNameOfType(type));
  beanHooks.blockClassInfo = (type, typeName) => mq.a(type, typeName);
  beanHooks.paramClassInfo = (spec) => mq.a(spec);
  beanHooks.componentTypeName = (type) => COMPONENT_NAMES[type] ?? ComponentsHandler.typeName(type);
  beanHooks.viewTypeName = (type) => viewTypeName(type);
  beanHooks.componentClassInfo = (type) =>
    new Gx(type === 2 ? 'SharedPreferences' : type === 26 ? 'Notification' : (COMPONENT_NAMES[type] && type !== 2 ? COMPONENT_NAMES[type] : ComponentsHandler.getBuildClassById(type)));
}

let lastRoot = '';

/**
 * Points the ported code at a workspace ("<ext>/.sketchware") and the bundled assets folder.
 * Re-reads custom components/events (data/system/*.json) when the workspace changes.
 */
export function configurePorted(workspaceRoot: string, assetsDir: string, toast?: (m: string, e: boolean) => void) {
  installHooks();
  const root = workspaceRoot.replace(/\\/g, '/').replace(/\/$/, '');
  const ext = root.substring(0, root.lastIndexOf('/'));
  setExternalStorage(ext);
  setAssetsDir(assetsDir);
  if (toast) setToastHandler(toast);
  if (root !== lastRoot) {
    lastRoot = root;
    try {
      ComponentsHandler.refreshCachedCustomComponents();
      EventsHandler.refreshCachedCustomEvents();
      EventsHandler.refreshCachedCustomListeners();
    } catch {
      /* no custom data */
    }
  }
}

export function bindProject(p: ProjectData, workspaceRoot: string) {
  setCurrentProject(p, workspaceRoot);
}
