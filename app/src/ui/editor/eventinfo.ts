// Event lists and titles (rs.refreshEvents / AddEventActivity / xB#a(ctx, id, event)).
import { EventBean, ProjectFileBean, ComponentBean } from '../../core/beans';
import { ProjectData } from '../../core/project';
import { EVENT_SPECS } from '../../blocks/registry';
import { oq } from '../../sw/oq';
import { ManageEvent } from '../../sw/ManageEvent';
import { ReturnMoreblockManager } from '../../sw/ReturnMoreblockManager';
import { installHooks } from '../../sw/init';

installHooks();

const WHEN_EVENTS = new Set(
  'onFilesPicked onItemLongClicked onMarkerClicked onFilesPickedCancel onPageStarted onStopTrackingTouch onDownloadSuccess onPictureTakenCancel onDownloadProgress onPictureTaken onItemClicked onSpeechResult onCancelled onTextChanged onChildAdded onDataSent onFailure onBindCustomView onAnimationCancel onUploadSuccess onErrorResponse onChildRemoved onPageFinished onItemSelected onCheckedChange onConnected onAnimationStart onConnectionError onConnectionStopped onUploadProgress onLocationChanged onChildChanged onDateChange onAnimationEnd onDeleteSuccess onClick onMapReady onProgressChanged onDataReceived onResponse onSpeechError onStartTrackingTouch'.split(' '),
);

/** Title of an event's hat block (xB.a(ctx, id, eventName) / LogicEditorActivity.onPostCreate). */
export function eventTitle(p: ProjectData, javaName: string, id: string, eventName: string): string {
  if (eventName === 'moreBlock') {
    const spec = p.getFuncs(javaName).find((f) => f[0] === id)?.[1] ?? id;
    return 'Define ' + ReturnMoreblockManager.getLogicEditorTitle(spec);
  }
  const target = id === '_fab' ? 'fab' : id;
  if (WHEN_EVENTS.has(eventName)) return 'When ' + target + ' ' + (EVENT_SPECS[eventName] ?? '');
  const spec = EVENT_SPECS[eventName];
  if (spec != null) return spec;
  try {
    return ManageEvent.i(target, eventName);
  } catch {
    return target + ' ' + eventName;
  }
}

export interface EventEntry {
  bean: EventBean;
  id: string; // logic editor id (key prefix)
  eventName: string;
  title: string;
  category: 'activity' | 'view' | 'component' | 'drawer' | 'moreblock';
}

export function listEvents(p: ProjectData, file: ProjectFileBean): EventEntry[] {
  const java = file.getJavaName();
  const out: EventEntry[] = [];
  const add = (b: EventBean, category: EventEntry['category']) => {
    const id = b.eventType === EventBean.EVENT_TYPE_DRAWER_VIEW ? '_drawer_' + b.targetId : b.targetId;
    out.push({ bean: b, id, eventName: b.eventName, title: eventTitle(p, java, id, b.eventName), category });
  };
  add(new EventBean(EventBean.EVENT_TYPE_ACTIVITY, -1, 'onCreate', 'initializeLogic'), 'activity');
  for (const b of p.getEvents(java)) {
    if (b.eventType === EventBean.EVENT_TYPE_VIEW) add(b, 'view');
    else if (b.eventType === EventBean.EVENT_TYPE_COMPONENT) add(b, 'component');
    else if (b.eventType === EventBean.EVENT_TYPE_ACTIVITY) add(b, 'activity');
    else if (b.eventType === EventBean.EVENT_TYPE_DRAWER_VIEW) add(b, 'drawer');
  }
  for (const [name] of p.getFuncs(java)) add(new EventBean(EventBean.EVENT_TYPE_ETC, -1, name, 'moreBlock'), 'moreblock');
  return out;
}

/** Events that can still be added (AddEventActivity.initialize). */
export function addableEvents(p: ProjectData, file: ProjectFileBean): { category: string; events: EventBean[] }[] {
  const java = file.getJavaName();
  const existing = p.getEvents(java);
  const has = (type: number, id: string, ev: string) => existing.some((e) => e.eventType === type && e.targetId === id && e.eventName === ev);
  const activity: EventBean[] = [];
  for (const ev of oq.getAllActivityEvents()) {
    // initializeLogic is the fixed "On activity create" event, always present
    if (ev !== 'initializeLogic' && !existing.some((e) => e.eventType === EventBean.EVENT_TYPE_ACTIVITY && e.eventName === ev)) {
      activity.push(new EventBean(EventBean.EVENT_TYPE_ACTIVITY, 0, ev, ev));
    }
  }
  const views: EventBean[] = [];
  for (const v of p.views.get(file.getXmlName()) ?? []) {
    for (const ev of oq.getEventsForClass(v.getClassInfo())) {
      if (ev === 'onBindCustomView' && (!v.customView || v.customView === 'none')) continue;
      if (!has(EventBean.EVENT_TYPE_VIEW, v.id, ev)) views.push(new EventBean(EventBean.EVENT_TYPE_VIEW, v.type, v.id, ev));
    }
  }
  if (file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FAB)) {
    const fab = p.getFab(file.getXmlName());
    for (const ev of oq.getEventsForClass(fab.getClassInfo())) {
      if (!has(EventBean.EVENT_TYPE_VIEW, fab.id, ev)) views.push(new EventBean(EventBean.EVENT_TYPE_VIEW, fab.type, fab.id, ev));
    }
  }
  const comps: EventBean[] = [];
  for (const c of p.getComponents(java)) {
    for (const ev of oq.getComponentEventsForClass(c.getClassInfo())) {
      if (!has(EventBean.EVENT_TYPE_COMPONENT, c.componentId, ev)) comps.push(new EventBean(EventBean.EVENT_TYPE_COMPONENT, c.type, c.componentId, ev));
    }
  }
  const drawer: EventBean[] = [];
  if (file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER)) {
    for (const v of p.views.get(file.getDrawerXmlName()) ?? []) {
      for (const ev of oq.getEventsForClass(v.getClassInfo())) {
        if (!has(EventBean.EVENT_TYPE_DRAWER_VIEW, v.id, ev)) drawer.push(new EventBean(EventBean.EVENT_TYPE_DRAWER_VIEW, v.type, v.id, ev));
      }
    }
  }
  return [
    { category: 'Activity', events: activity },
    { category: 'View', events: views },
    { category: 'Component', events: comps },
    { category: 'Drawer', events: drawer },
  ];
}

export const COMPONENT_CHOICES: { type: number; name: string; param?: 'filename' | 'firebasePath' | 'mime' }[] = [
  { type: 1, name: 'Intent' },
  { type: 2, name: 'SharedPreferences', param: 'filename' },
  { type: 16, name: 'FilePicker', param: 'mime' },
  { type: 3, name: 'Calendar' },
  { type: 4, name: 'Vibrator' },
  { type: 5, name: 'Timer' },
  { type: 7, name: 'Dialog' },
  { type: 8, name: 'MediaPlayer' },
  { type: 9, name: 'SoundPool' },
  { type: 10, name: 'ObjectAnimator' },
  { type: 15, name: 'Camera' },
  { type: 11, name: 'Gyroscope' },
  { type: 18, name: 'TextToSpeech' },
  { type: 19, name: 'SpeechToText' },
  { type: 17, name: 'RequestNetwork' },
  { type: 20, name: 'BluetoothConnect' },
  { type: 21, name: 'LocationManager' },
  { type: 23, name: 'ProgressDialog' },
  { type: 24, name: 'DatePickerDialog' },
  { type: 25, name: 'TimePickerDialog' },
  { type: 26, name: 'Notification' },
  { type: 27, name: 'FragmentAdapter' },
  { type: 13, name: 'InterstitialAd' },
  { type: 22, name: 'RewardedVideoAd' },
  { type: 6, name: 'Firebase DB', param: 'firebasePath' },
  { type: 12, name: 'Firebase Auth' },
  { type: 14, name: 'Firebase Storage', param: 'firebasePath' },
  { type: 28, name: 'Firebase Phone Auth' },
  { type: 30, name: 'Firebase Cloud Message' },
  { type: 31, name: 'Firebase Google Login' },
];

export function componentLabel(c: ComponentBean): string {
  return COMPONENT_CHOICES.find((x) => x.type === c.type)?.name ?? ComponentBean.getComponentTypeName(c.type);
}
