// Auto-ported from Hx.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: com.besome.sketch.beans.BlockBean, com.besome.sketch.beans.ComponentBean, com.besome.sketch.beans.EventBean, com.besome.sketch.beans.ProjectFileBean, com.besome.sketch.beans.ViewBean, java.util.ArrayList, java.util.HashMap, java.util.Map, mod.hey.studios.project.ProjectSettings, mod.hilal.saif.components.ComponentExtraCode, mod.pranav.viewbinding.ViewBindingBuilder
// <imports>
import { jlist, jiter, JMap, StringBuilder } from '../codegen/jshim';
import { ComponentBean, EventBean, ProjectFileBean } from '../core/beans';
import { ComponentExtraCode } from './ComponentExtraCode';
import { Fx } from './Fx';
import { Jx } from './Jx';
import { Lx } from './Lx';
import { ProjectSettings } from './ProjectSettings';
import { ViewBindingBuilder } from './ViewBindingBuilder';
import { jq } from './jq';
import { mq } from './mq';
import { oq } from './oq';
import { eC } from './platform';
// </imports>
export class Hx_ActivityEvent {
  name: string;
  logic: string = "";
  targetId: string = "";
  constructor(name: string) {
            this.name = name;
        }
  getCode(): string {
            return Lx.getEventCode(this.targetId, this.name, this.logic);
        }
  setLogic(logic: string): void {
            this.logic = logic;
        }
  setTargetId(targetId: string): void {
            this.targetId = targetId;
        }
}
export class Hx_ComponentCallback {
  componentId: number;
  componentName: string;
  onSuccessCode: string = "";
  onCancelledCode: string = "";
  constructor(componentId: number, componentName: string) {
            this.componentId = componentId;
            this.componentName = componentName;
        }
  setOnCancelledLogic(onCancelledLogic: string): void {
            this.onCancelledCode = onCancelledLogic;
        }
  setOnSuccessLogic(onSuccessLogic: string): void {
            this.onSuccessCode = onSuccessLogic;
        }
  getCode(): string {
            return Lx.getOnActivityResultCode(this.componentId, this.componentName, this.onSuccessCode, this.onCancelledCode);
        }
}
export class Hx_Event {
  hx: any;
  id: string;
  listeners: any = [];
  constructor(hx: any, id: string, classInfo: any, isViewBindingEnabled: boolean) {
            this.hx = hx;
            this.id = id;

            let listeners = oq.getListenersForClass(classInfo);
            if (listeners.length > 0) {
                for (const listener of jiter(listeners)) {
                    /* Found functionally same instructions in vanilla Sketchware, keep it this way */
                    if (!this.listeners.contains(listener)) {
                        this.listeners.add(new Hx_ComponentEvents(listener));
                    }
                }

                switch (classInfo.getClassName()) {
                    case "FirebaseDB":
                    case "FirebaseStorage":
                    case "FirebaseAuth":
                    case "Gyroscope":
                    case "FragmentAdapter":
                    case "WebView":
                    case "MapView":
                    case "InterstitialAd":
                    case "RequestNetwork":
                    case "BluetoothConnect":
                        for (const value of jiter(this.listeners)) {
                            value.isInitialized = true;
                        }
                        break;

                    default:
                }
            }
        }
  generateEvent(): string {
            let sb = new StringBuilder(4096);
            for (const value of jiter(this.listeners)) {
                let event = value.generateEvent(this.id);
                if (sb.length > 0 && !event.isEmpty()) {
                    sb.append(Jx.EOL);
                    sb.append(Jx.EOL);
                }
                sb.append(event);
            }

            return sb.toString();
        }
  addEvent(targetId: string, eventName: string, eventLogic: string): void {
            for (const listener of jiter(this.listeners)) {
                for (const activityEvent of jiter(listener.activityEvents)) {
                    if (activityEvent.name.equals(eventName)) {
                        activityEvent.setLogic(eventLogic);
                        activityEvent.setTargetId(targetId);
                        listener.isInitialized = true;
                    }
                }

                if (listener.isInitialized) {
                    this.hx.imports.addAll(mq.d(listener.listenerName));
                }
            }
        }
}
export class Hx_ComponentEvents {
  listenerName: string;
  activityEvents: any;
  isInitialized: boolean = false;
  constructor(listenerName: string) {
            this.listenerName = listenerName;
            this.activityEvents = [];
            for (const eventName of jiter(oq.getEventsForListener(listenerName))) {
                this.activityEvents.add(new Hx_ActivityEvent(eventName));
            }
        }
  generateEvent(componentName: string): string {
            if (!this.isInitialized) {
                return "";
            }
            let eventsCode = new StringBuilder(4096);
            for (const activityEvent of jiter(this.activityEvents)) {
                let code = activityEvent.getCode();
                if (eventsCode.length > 0 && !code.isEmpty()) {
                    eventsCode.append(Jx.EOL);
                    eventsCode.append(Jx.EOL);
                }
                eventsCode.append(code);
            }
            return Lx.getListenerCode(this.listenerName, componentName, eventsCode.toString());
        }
}
export class Hx {
  projectFileBean: any;
  jq: any;
  viewEvents: any = [];
  componentEvents: any = [];
  activityEvents: any = [];
  authEvents: any = [];
  drawerViewEvents: any = [];
  callbackEvents: any = [];
  imports: any = [];
  activityLifecycleEvents: any = new JMap();
  isViewBindingEnabled: boolean;
  k: string = "";
  l: string = "";
  constructor(logicHolder: any, projectFileBean: any, eC: any) {
        this.jq = logicHolder;
        this.projectFileBean = projectFileBean;

        let projectSettings = new ProjectSettings(logicHolder.sc_id);
        this.isViewBindingEnabled = projectSettings.getValue(ProjectSettings.SETTING_ENABLE_VIEWBINDING, "false").equals("true");

        let views = jlist(eC.d(projectFileBean.getXmlName()));
        if (projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FAB)) {
            let fab = eC.h(projectFileBean.getXmlName());
            views.add(fab);
        }
        for (const view of jiter(views)) {
            this.viewEvents.add(new Hx_Event(this, this.isViewBindingEnabled ? "binding." + ViewBindingBuilder.generateParameterFromId(view.id) : view.id, view.getClassInfo(), this.isViewBindingEnabled));
        }

        let components = eC.e(projectFileBean.getJavaName());
        for (const componentBean of jiter(components)) {
            let type = componentBean.type;
            if (type == ComponentBean.COMPONENT_TYPE_FIREBASE_AUTH || type == ComponentBean.COMPONENT_TYPE_INTERSTITIAL_AD) {
                this.authEvents.add(new Hx_Event(this, componentBean.componentId, componentBean.getClassInfo(), this.isViewBindingEnabled));
            } else {
                this.componentEvents.add(new Hx_Event(this, componentBean.componentId, componentBean.getClassInfo(), this.isViewBindingEnabled));
            }
        }

        if (projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER)) {
            let drawerViews = eC.d(projectFileBean.getDrawerXmlName());
            for (const view of jiter(drawerViews)) {
                this.drawerViewEvents.add(new Hx_Event(this, this.isViewBindingEnabled ? "binding.drawer." + ViewBindingBuilder.generateParameterFromId(view.id) : "_drawer_" + view.id, view.getClassInfo(), this.isViewBindingEnabled));
            }
        }

        this.a(eC.g(projectFileBean.getJavaName()), eC.b(projectFileBean.getJavaName()));
    }
  getOnActivityResultSwitchCases(): string {
        let sb = new StringBuilder(4096);
        for (const value of jiter(this.callbackEvents)) {
            let code = value.getCode();
            if (sb.length > 0 && !code.isEmpty()) {
                sb.append(Jx.EOL);
                sb.append(Jx.EOL);
            }
            sb.append(code);
        }
        return sb.toString();
    }
  addCallbackEvents_int_String_String_String(targetType: number, targetId: string, eventName: string, eventLogic: string): void {
        let hasOnSuccessLogic = eventName.equals("onPictureTaken") || eventName.equals("onAccountPicker") || eventName.equals("onFilesPicked");
        let hasOnCancelledLogic = eventName.equals("onPictureTakenCancel") || eventName.equals("onFilesPickedCancel") || eventName.equals("onAccountPickerCancelled");

        let alreadyRegistered = false;
        for (const next of jiter(this.callbackEvents)) {
            if (next.componentName.equals(targetId)) {
                if (hasOnSuccessLogic) {
                    next.setOnSuccessLogic(eventLogic);
                    return;
                } else if (hasOnCancelledLogic) {
                    next.setOnCancelledLogic(eventLogic);
                    return;
                } else {
                    alreadyRegistered = true;
                }
            }
        }
        if (!alreadyRegistered) {
            let event = new Hx_ComponentCallback(targetType, targetId);
            if (hasOnSuccessLogic) {
                event.setOnSuccessLogic(eventLogic);
            } else if (hasOnCancelledLogic) {
                event.setOnCancelledLogic(eventLogic);
            }
            this.callbackEvents.add(event);
        }
    }
  addActivityEvent(eventName: string, eventLogic: string): void {
        let target = null;

        for (const next of jiter(this.activityEvents)) {
            if (next.name.equals(eventName)) {
                target = next;
                break;
            }
        }

        if (target == null) {
            target = new Hx_ActivityEvent(eventName);
            this.activityEvents.add(target);
        }
        target.setLogic(eventLogic);
    }
  addLifecycleEvent(eventName: string, viewType: string, viewId: string): void {
        if (!this.activityLifecycleEvents.containsKey(eventName)) {
            this.activityLifecycleEvents.put(eventName, Lx.getDefaultActivityLifecycleCode(eventName, viewType, this.isViewBindingEnabled ? "binding." + ViewBindingBuilder.generateParameterFromId(viewId) : viewId));
        }
    }
  a(events: any, logicBlocks: any): void {
        for (const eventBean of jiter(events)) {
            let eventLogicBlocks = logicBlocks.get(eventBean.targetId + "_" + eventBean.eventName);
            let eventLogic = (eventLogicBlocks == null || eventLogicBlocks.isEmpty()) ? "" :
                    new Fx(this.projectFileBean.getActivityName(), this.jq, eventLogicBlocks, this.isViewBindingEnabled).a();

            switch (eventBean.eventType) {
                case EventBean.EVENT_TYPE_VIEW:
                    this.addViewListeners(eventBean.targetId, eventBean.eventName, eventLogic);
                    break;

                case EventBean.EVENT_TYPE_COMPONENT:
                    (() => { switch (eventBean.targetType) {
                        case ComponentBean.COMPONENT_TYPE_FIREBASE_AUTH:
                        case ComponentBean.COMPONENT_TYPE_INTERSTITIAL_AD:
                            this.addCallbackEvents(eventBean.targetId, eventBean.eventName, eventLogic);
                            break;

                        case ComponentBean.COMPONENT_TYPE_CAMERA:
                        case ComponentBean.COMPONENT_TYPE_FILE_PICKER:
                        case ComponentBean.COMPONENT_TYPE_FIREBASE_AUTH_GOOGLE_LOGIN:
                            this.addCallbackEvents(eventBean.targetType, eventBean.targetId, eventBean.eventName, eventLogic);
                            break;

                        default:
                            this.addViewImports(eventBean.targetId, eventBean.eventName, eventLogic);
                    } })()
                    break;

                case EventBean.EVENT_TYPE_ACTIVITY:
                    this.addActivityEvent(eventBean.eventName, eventLogic);
                    break;

                case EventBean.EVENT_TYPE_DRAWER_VIEW:
                    this.addDrawerEvents(eventBean.targetId, eventBean.eventName, eventLogic);
                    break;

                default:
            }
        }
    }
  generateActivityLifecycleEventCode(): string {
        let sb = new StringBuilder(4096);
        for (const event of jiter(this.activityLifecycleEvents.entrySet())) {
            let name = event.getKey();
            let logic = event.getValue();

            let found = false;
            for (const next of jiter(this.activityEvents)) {
                if (next.name.equals(name)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                let a = new Hx_ActivityEvent(name);
                a.setLogic(logic);
                this.activityEvents.add(a);
            }
        }

        for (const value of jiter(this.activityEvents)) {
            let code = value.getCode();
            if (sb.length > 0 && !code.isEmpty()) {
                sb.append(Jx.EOL);
                sb.append(Jx.EOL);
            }
            sb.append(code);
        }
        return sb.toString();
    }
  addViewImports(targetId: string, eventName: string, eventLogic: string): void {
        for (const next of jiter(this.componentEvents)) {
            if (next.id.equals(targetId)) {
                next.addEvent(targetId, eventName, eventLogic);
                return;
            }
        }
    }
  generateComponentEvents(): string {
        let sb = new StringBuilder(4096);
        let componentExtraCode = new ComponentExtraCode(this, sb);
        for (const next of jiter(this.componentEvents)) {
            componentExtraCode.s(next.generateEvent());
        }
        return sb.toString();
    }
  addDrawerEvents(targetId: string, eventName: string, eventLogic: string): void {
        for (const next of jiter(this.drawerViewEvents)) {
            if (next.id.equals(this.isViewBindingEnabled ? "binding.drawer." + ViewBindingBuilder.generateParameterFromId(targetId) : "_drawer_" + targetId)) {
                next.addEvent(targetId, eventName, eventLogic);
                return;
            }
        }
    }
  generateDrawerEvents(): string {
        let sb = new StringBuilder(4096);
        for (const drawerViewEvent of jiter(this.drawerViewEvents)) {
            let eventCodes = drawerViewEvent.generateEvent();
            if (sb.length > 0 && !eventCodes.isEmpty()) {
                sb.append(Jx.EOL);
                sb.append(Jx.EOL);
            }
            sb.append(eventCodes);
        }
        return sb.toString();
    }
  addCallbackEvents_String_String_String(targetId: string, eventName: string, eventLogic: string): void {
        for (const next of jiter(this.authEvents)) {
            if (next.id.equals(targetId)) {
                next.addEvent(targetId, eventName, eventLogic);
                return;
            }
        }
    }
  getImports(): any {
        return this.imports;
    }
  addViewListeners(targetId: string, eventName: string, eventLogic: string): void {
        for (const next of jiter(this.viewEvents)) {
            if (next.id.equals(this.isViewBindingEnabled ? "binding." + ViewBindingBuilder.generateParameterFromId(targetId) : targetId)) {
                next.addEvent(targetId, eventName, eventLogic);
                return;
            }
        }
    }
  generateAuthEvents(): string {
        let sb = new StringBuilder(4096);
        for (const authEvent of jiter(this.authEvents)) {
            let event = authEvent.generateEvent();
            if (sb.length > 0 && !event.isEmpty()) {
                sb.append(Jx.EOL);
                sb.append(Jx.EOL);
            }
            sb.append(event);
        }
        return sb.toString();
    }
  generateViewEvents(): string {
        let sb = new StringBuilder(4096);
        for (const value of jiter(this.viewEvents)) {
            let event = value.generateEvent();
            if (sb.length > 0 && !event.isEmpty()) {
                sb.append(Jx.EOL);
                sb.append(Jx.EOL);
            }
            sb.append(event);
        }
        return sb.toString();
    }
  static ActivityEvent = Hx_ActivityEvent;
  static ComponentCallback = Hx_ComponentCallback;
  static Event = Hx_Event;
  static ComponentEvents = Hx_ComponentEvents;
  addCallbackEvents(...args: any[]): any {
    if (args.length === 4 && typeof args[0] === 'number' && (args[1] == null || typeof args[1] === 'string') && (args[2] == null || typeof args[2] === 'string') && (args[3] == null || typeof args[3] === 'string')) return this.addCallbackEvents_int_String_String_String.apply(this, args as any);
    if (args.length === 3 && (args[0] == null || typeof args[0] === 'string') && (args[1] == null || typeof args[1] === 'string') && (args[2] == null || typeof args[2] === 'string')) return this.addCallbackEvents_String_String_String.apply(this, args as any);
    throw new Error('no overload of addCallbackEvents for ' + args.length);
  }
}