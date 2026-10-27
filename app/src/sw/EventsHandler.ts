// Auto-ported from EventsHandler.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: com.google.gson.Gson, com.google.gson.JsonParseException, java.util.ArrayList, java.util.Arrays, java.util.HashMap, a.a.a.Gx, a.a.a.oq, mod.hey.studios.util.Helper, mod.jbk.util.LogUtil, mod.jbk.util.OldResourceIdMapper, pro.sketchware.R, pro.sketchware.utility.FileUtil, pro.sketchware.utility.SketchwareUtil
// <imports>
import { jformat, jparseInt, jlist, jlistOf, jnewArray } from '../codegen/jshim';
import { FileUtil, Gson, Helper, LogUtil, R, SketchwareUtil, capitalize } from './env';
import { OldResourceIdMapper } from './platform';
// </imports>
export class EventsHandler {
  static get CUSTOM_EVENTS_FILE_PATH(): string {
      return FileUtil.getExternalStorageDir() + "/.sketchware/data/system/events.json";
    }
  static get CUSTOM_LISTENERE_FILE_PATH(): string {
      return FileUtil.getExternalStorageDir() + "/.sketchware/data/system/listeners.json";
    }
  static cachedCustomEvents: any = EventsHandler.readCustomEvents();
  static cachedCustomListeners: any = EventsHandler.readCustomListeners();
  constructor() {
    }
  static getActivityEvents(): string[] {
        let array = [];

        array.add("Import");
        array.add("initializeLogic");
        array.add("onActivityResult");
        array.add("onBackPressed");
        array.add("onPostCreate");
        array.add("onStart");
        array.add("onResume");
        array.add("onPause");
        array.add("onStop");
        array.add("onDestroy");
        array.add("onSaveInstanceState");
        array.add("onRestoreInstanceState");
        array.add("onCreateOptionsMenu");
        array.add("onOptionsItemSelected");
        array.add("onCreateContextMenu");
        array.add("onContextItemSelected");
        array.add("onTabLayoutNewTabAdded");

        for (let i = EventsHandler.cachedCustomEvents.size() - 1; i >= 0; i--) {
            let customEvent = EventsHandler.cachedCustomEvents.get(i);
            if (customEvent != null) {
                let var_ = customEvent.get("var");

                if (typeof var_ === 'string') {
                    if (var_.equals("")) {
                        let name = customEvent.get("name");

                        if (typeof name === 'string') {
                            array.add(name);
                        } else {
                            SketchwareUtil.toastError("Found invalid name data type in Custom Event #" + (i + 1));
                        }
                    }
                } else {
                    SketchwareUtil.toastError("Found invalid var data type in Custom Event #" + (i + 1));
                }
            } else {
                SketchwareUtil.toastError("Found invalid (null) Custom Event at position " + i);
            }
        }

        return array.toArray(jnewArray(0, null));
    }
  static addEvents(gx: any, list: any): void {
        if (gx.a("Clickable")) {
            list.add(" onLongClick");
        }
        if (gx.a("SwipeRefreshLayout")) {
            list.add("onSwipeRefreshLayout");
        }
        if (gx.a("AsyncTask")) {
            list.add("onPreExecute");
            list.add("doInBackground");
            list.add("onProgressUpdate");
            list.add("onPostExecute");
        }

        for (let i = 0, cachedCustomEventsSize = EventsHandler.cachedCustomEvents.size(); i < cachedCustomEventsSize; i++) {
            let customEvent = EventsHandler.cachedCustomEvents.get(i);
            if (customEvent != null) {
                let var_ = customEvent.get("var");

                if (typeof var_ === 'string') {
                    if (gx.a(var_)) {
                        let name = customEvent.get("name");

                        if (typeof name === 'string') {
                            list.add(name);
                        } else {
                            SketchwareUtil.toastError("Found invalid name data type in Custom Event #" + (i + 1));
                        }
                    }
                } else {
                    SketchwareUtil.toastError("Found invalid var data type in Custom Event #" + (i + 1));
                }
            } else {
                SketchwareUtil.toastError("Found invalid (null) Custom Event at position " + i);
            }
        }
    }
  static addListeners(gx: any, list: any): void {
        if (gx.a("Clickable")) {
            list.add(" onLongClickListener");
        }
        if (gx.a("SwipeRefreshLayout")) {
            list.add("onSwipeRefreshLayoutListener");
        }
        if (gx.a("AsyncTask")) {
            list.add("AsyncTaskClass");
        }

        for (let i = 0, cachedCustomEventsSize = EventsHandler.cachedCustomEvents.size(); i < cachedCustomEventsSize; i++) {
            let customEvent = EventsHandler.cachedCustomEvents.get(i);
            if (customEvent != null) {
                let var_ = customEvent.get("var");

                if (typeof var_ === 'string') {
                    if (gx.a(var_)) {
                        let listener = customEvent.get("listener");

                        if (typeof listener === 'string') {
                            if (!list.contains(listener)) {
                                list.add(listener);
                            }
                        } else {
                            SketchwareUtil.toastError("Found invalid listener data type in Custom Event #" + (i + 1));
                        }
                    }
                } else {
                    SketchwareUtil.toastError("Found invalid var data type in Custom Event #" + (i + 1));
                }
            } else {
                SketchwareUtil.toastError("Found invalid (null) Custom Event at position " + i);
            }
        }
    }
  static addEventsToListener(name: string, list: any): void {
        switch (name) {
            case " onLongClickListener":
                list.add(" onLongClick");
                break;

            case "onSwipeRefreshLayoutListener":
                list.add("onSwipeRefreshLayout");
                break;

            case "AsyncTaskClass":
                list.add("onPreExecute");
                list.add("doInBackground");
                list.add("onProgressUpdate");
                list.add("onPostExecute");
                break;

            default:
                for (var i = 0, cachedCustomEventsSize = EventsHandler.cachedCustomEvents.size(); i < cachedCustomEventsSize; i++) {
                    let customEvent = EventsHandler.cachedCustomEvents.get(i);
                    if (customEvent != null) {
                        let listener = customEvent.get("listener");

                        if (typeof listener === 'string') {
                            if (name.equals(listener)) {
                                let eventName = customEvent.get("name");

                                if (typeof eventName === 'string') {
                                    list.add(eventName);
                                } else {
                                    SketchwareUtil.toastError("Found invalid name data type in Custom Event #" + (i + 1));
                                }
                            }
                        } else {
                            SketchwareUtil.toastError("Found invalid listener data type in Custom Event #" + (i + 1));
                        }
                    } else {
                        SketchwareUtil.toastError("Found invalid (null) Custom Event at position " + i);
                    }
                }
                break;
        }
    }
  static getIcon(name: string): number {
        return (() => { switch (name) {
            case "Import": case "onActivityResult": case "initializeLogic": case "onBackPressed": case "onPostCreate": case "onStart": case "onResume": case "onPause": case "onStop": case "onDestroy": case "onTabLayoutNewTabAdded": return R.drawable.ic_mtrl_code;
            case " onLongClick": return R.drawable.ic_mtrl_touch_long;
            case "onSwipeRefreshLayout": return R.drawable.ic_mtrl_refresh;
            case "onPreExecute": return R.drawable.ic_mtrl_track_started;
            case "doInBackground": return R.drawable.ic_mtrl_sprint;
            case "onProgressUpdate": return R.drawable.ic_mtrl_progress;
            case "onPostExecute": return R.drawable.ic_mtrl_progress_check;
            default: {
                for (let i = 0, cachedCustomEventsSize = EventsHandler.cachedCustomEvents.size(); i < cachedCustomEventsSize; i++) {
                    let customEvent = EventsHandler.cachedCustomEvents.get(i);
                    if (customEvent != null) {
                        let eventName = customEvent.get("name");

                        if (typeof eventName === 'string') {
                            if (name.equals(eventName)) {
                                let icon = customEvent.get("icon");

                                if (typeof icon === 'string') {
                                    try {
                                        return OldResourceIdMapper.getDrawableFromOldResourceId(jparseInt(icon));
                                    } catch (e: any) {
                                        SketchwareUtil.toastError("Found invalid icon data type in Custom Event #" + (i + 1));
                                        return R.drawable.android_icon;
                                    }
                                } else {
                                    SketchwareUtil.toastError("Found invalid icon data type in Custom Event #" + (i + 1));
                                }
                            }
                        } else {
                            SketchwareUtil.toastError("Found invalid name data type in Custom Event #" + (i + 1));
                        }
                    } else {
                        SketchwareUtil.toastError("Found invalid (null) Custom Event at position " + i);
                    }
                }

                return R.drawable.android_icon;
            }
        } })();
    }
  static getDesc(name: string): string {
        return (() => { switch (name) {
            case "Import": return "add custom imports";
            case "onActivityResult": return "onActivityResult";
            case "initializeLogic": return "initializeLogic";
            case "onSwipeRefreshLayout": return "On SwipeRefreshLayout swipe";
            case " onLongClick": return "onLongClick";
            case "onTabLayoutNewTabAdded": return "return the name of current tab";
            case "onPreExecute": return "This method contains the code which is executed before the background processing starts.";
            case "doInBackground": return "This method contains the code which needs to be executed in background.";
            case "onProgressUpdate": return "This method receives progress updates from doInBackground method.";
            case "onPostExecute": return "This method is called after doInBackground method completes processing.";
            default: {
                for (let i = 0, cachedCustomEventsSize = EventsHandler.cachedCustomEvents.size(); i < cachedCustomEventsSize; i++) {
                    let customEvent = EventsHandler.cachedCustomEvents.get(i);
                    if (customEvent != null) {
                        let eventName = customEvent.get("name");

                        if (typeof eventName === 'string') {
                            if (name.equals(eventName)) {
                                let description = customEvent.get("description");

                                if (typeof description === 'string') {
                                    return description;
                                } else {
                                    SketchwareUtil.toastError("Found invalid description data type in Custom Event #" + (i + 1));
                                }
                            }
                        } else {
                            SketchwareUtil.toastError("Found invalid name data type in Custom Event #" + (i + 1));
                        }
                    } else {
                        SketchwareUtil.toastError("Found invalid (null) Custom Event at position " + i);
                    }
                }

                return "No_Description";
            }
        } })();
    }
  static getEventCode(targetId: string, name: string, param: string): string {
        return (() => { switch (name) {
            case "Import": return // Changed from: "...vF\n${param}\n//3b..."
                    "//Ul5kmZqmO867OV0QTGOpjwX7MXmgzxzQBSZTf0Y16PnDXkhLsZfvF\r\n" +
                            param + "\r\n" +
                            "//3b5IqsVG57gNqLi7FBO2MeOW6iI7tOustUGwcA7HKXm0o7lovZ";
            case "onActivityResult": case "initializeLogic": return "";
            case "onSwipeRefreshLayout": return // Changed from: "@Override \npublic void..."
                    "@Override\r\n" +
                            "public void onRefresh() {\n" +
                            param + "\r\n" +
                            "}";
            case " onLongClick": return // Changed from: "@Override\r\n public boolean..."
                    "@Override\r\n" +
                            "public boolean onLongClick(View _view) {\r\n" +
                            param + "\r\n" +
                            "return true;\r\n" +
                            "}";
            case "onTabLayoutNewTabAdded": return // Changed from: "public  CharSequence  onTabLayoutNewTabAdded( int   _position ){..."
                    "public CharSequence onTabLayoutNewTabAdded(int _position) {\r\n" +
                            (param.isEmpty() ? "return \"\";\r\n" :
                                    param + "\r\n"
                            ) + "}";
            case "onPreExecute": return "@Override\r\n" +
                    "protected void onPreExecute() {\r\n" +
                    param + "\r\n" +
                    "}";
            case "doInBackground": return "@Override\r\n" +
                    "protected String doInBackground(String... params) {\r\n" +
                    "String _param = params[0];\r\n" +
                    param + "\r\n" +
                    "}";
            case "onProgressUpdate": return "@Override\r\n" +
                    "protected void onProgressUpdate(Integer... values) {\r\n" +
                    "int _value = values[0];\r\n" +
                    param + "\r\n" +
                    "}";
            case "onPostExecute": return "@Override\r\n" +
                    "protected void onPostExecute(String _result) {\r\n" +
                    param + "\r\n" +
                    "}";
            default: {
                for (let i = 0, cachedCustomEventsSize = EventsHandler.cachedCustomEvents.size(); i < cachedCustomEventsSize; i++) {
                    let customEvent = EventsHandler.cachedCustomEvents.get(i);
                    if (customEvent != null) {
                        let eventName = customEvent.get("name");

                        if (typeof eventName === 'string') {
                            if (name.equals(eventName)) {
                                let code = customEvent.get("code");

                                if (typeof code === 'string') {
                                    let formattedCode = code.jreplace("###", targetId)
                                            .jreplace("$name", targetId)
                                            .jreplace("$Name", EventsHandler.capitalize(targetId))
                                            .jreplace("$NAME", targetId.toUpperCase());
                                    return jformat(formattedCode, param);
                                } else {
                                    SketchwareUtil.toastError("Found invalid code data type in Custom Event #" + (i + 1));
                                }
                            }
                        } else {
                            SketchwareUtil.toastError("Found invalid name data type in Custom Event #" + (i + 1));
                        }
                    } else {
                        SketchwareUtil.toastError("Found invalid (null) Custom Event at position " + i);
                    }
                }

                return "//no code";
            }
        } })();
    }
  static getBlocks(name: string): string {
        return (() => { switch (name) {
            case "Import": case "initializeLogic": case "onSwipeRefreshLayout": case " onLongClick": case "onPreExecute": return "";
            case "onActivityResult": return "%d.requestCode %d.resultCode %m.intent";
            case "onTabLayoutNewTabAdded": case "onProgressUpdate": return "%d";
            case "doInBackground": case "onPostExecute": return "%s";
            default: {
                for (let i = 0, cachedCustomEventsSize = EventsHandler.cachedCustomEvents.size(); i < cachedCustomEventsSize; i++) {
                    let customEvent = EventsHandler.cachedCustomEvents.get(i);
                    if (customEvent != null) {
                        let eventName = customEvent.get("name");

                        if (typeof eventName === 'string') {
                            if (name.equals(eventName)) {
                                let parameters = customEvent.get("parameters");

                                if (typeof parameters === 'string') {
                                    return parameters;
                                } else {
                                    SketchwareUtil.toastError("Found invalid parameters data type in Custom Event #" + (i + 1));
                                }
                            }
                        } else {
                            SketchwareUtil.toastError("Found invalid name data type in Custom Event #" + (i + 1));
                        }
                    } else {
                        SketchwareUtil.toastError("Found invalid (null) Custom Event at position " + i);
                    }
                }

                return "";
            }
        } })();
    }
  static getSpec(name: string, event: string): string {
        return (() => { switch (event) {
            case "Import": return "create new import";
            case "onActivityResult": return "OnActivityResult %d.requestCode %d.resultCode %m.intent.data";
            case "initializeLogic": return "initializeLogic";
            case "onSwipeRefreshLayout": return "when " + name + " refresh";
            case " onLongClick": return "when " + name + " long clicked";
            case "onTabLayoutNewTabAdded": return name + " return tab title %d.position";
            case "onPreExecute": return name + " onPreExecute ";
            case "doInBackground": return name + " doInBackground %s.param";
            case "onProgressUpdate": return name + " onProgressUpdate progress %d.value";
            case "onPostExecute": return name + " onPostExecute result %s.result";
            default: {
                for (let i = 0, cachedCustomEventsSize = EventsHandler.cachedCustomEvents.size(); i < cachedCustomEventsSize; i++) {
                    let customEvent = EventsHandler.cachedCustomEvents.get(i);
                    if (customEvent != null) {
                        let eventName = customEvent.get("name");

                        if (typeof eventName === 'string') {
                            if (event.equals(eventName)) {
                                let headerSpec = customEvent.get("headerSpec");

                                if (typeof headerSpec === 'string') {
                                    return (headerSpec).jreplace("###", name);
                                } else {
                                    SketchwareUtil.toastError("Found invalid header spec data type in Custom Event #" + (i + 1));
                                }
                            }
                        } else {
                            SketchwareUtil.toastError("Found invalid name data type in Custom Event #" + (i + 1));
                        }
                    } else {
                        SketchwareUtil.toastError("Found invalid (null) Custom Event at position " + i);
                    }
                }

                return "no spec";
            }
        } })();
    }
  static getListenerCode(name: string, var_: string, param: string): string {
        return (() => { switch (name) {
            case " onLongClickListener": return var_ + ".setOnLongClickListener(new View.OnLongClickListener() {\r\n" +
                            param + "\r\n" +
                            "});";
            case "onSwipeRefreshLayoutListener": return var_ + ".setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {\r\n" +
                            param + "\r\n" +
                            "});";
            case "AsyncTaskClass": return "private class " + var_ + " extends AsyncTask<String, Integer, String> {\r\n" +
                            param + "\r\n" +
                            "}";
            default: {
                for (let i = 0, cachedCustomListenersSize = EventsHandler.cachedCustomListeners.size(); i < cachedCustomListenersSize; i++) {
                    let customListener = EventsHandler.cachedCustomListeners.get(i);
                    let eventName = customListener.get("name");

                    if (typeof eventName === 'string') {
                        if (name.equals(eventName)) {
                            let code = customListener.get("code");

                            if (typeof code === 'string') {
                                let formattedCode = code.jreplace("###", var_)
                                        .jreplace("$name", var_)
                                        .jreplace("$Name", EventsHandler.capitalize(var_))
                                        .jreplace("$NAME", var_.toUpperCase());
                                return jformat(formattedCode, param);
                            } else {
                                SketchwareUtil.toastError("Found invalid code data type in Custom Event #" + (i + 1));
                            }
                        }
                    } else {
                        SketchwareUtil.toastError("Found invalid name data type in Custom Event #" + (i + 1));
                    }
                }

                return "//no listener code";
            }
        } })();
    }
  static capitalize(value: string): string {
        if (value == null || value.isEmpty()) {
            return value;
        }
        return value.substring(0, 1).toUpperCase() +
                value.substring(1);
    }
  static getImports(list: any, name: string): void {
        for (let i = 0, cachedCustomListenersSize = EventsHandler.cachedCustomListeners.size(); i < cachedCustomListenersSize; i++) {
            let customEvent = EventsHandler.cachedCustomListeners.get(i);
            let eventName = customEvent.get("name");

            if (typeof eventName === 'string') {
                if (name.equals(eventName)) {
                    let imports = customEvent.get("imports");

                    if (typeof imports === 'string') {
                        if (!imports.equals("")) {
                            list.addAll(jlist(jlistOf((imports).jsplit("\n"))));
                        }
                    } else {
                        SketchwareUtil.toastError("Found invalid import data type in Custom Event #" + (i + 1));
                    }
                }
            } else {
                SketchwareUtil.toastError("Found invalid name data type in Custom Event #" + (i + 1));
            }
        }
    }
  static refreshCachedCustomEvents(): void {
        EventsHandler.cachedCustomEvents = EventsHandler.readCustomEvents();
    }
  static refreshCachedCustomListeners(): void {
        EventsHandler.cachedCustomListeners = EventsHandler.readCustomListeners();
    }
  static readCustomEvents(): any {
        let customEvents = [];

        if (FileUtil.isExistFile(EventsHandler.CUSTOM_EVENTS_FILE_PATH)) {
            let customEventsContent = FileUtil.readFile(EventsHandler.CUSTOM_EVENTS_FILE_PATH);

            if (!customEventsContent.isEmpty() && !customEventsContent.equals("[]")) {
                try {
                    customEvents = new Gson().fromJson(customEventsContent, Helper.TYPE_MAP_LIST);

                    if (customEvents == null) {
                        LogUtil.e("EventsHandler", "Failed to parse Custom Events file! Now using none");
                        customEvents = [];
                    }
                } catch (e: any) {
                    LogUtil.e("EventsHandler", "Failed to parse Custom Events file! Now using none");
                }
            }
        }

        return customEvents;
    }
  static readCustomListeners(): any {
        let customListeners = [];

        if (FileUtil.isExistFile(EventsHandler.CUSTOM_LISTENERE_FILE_PATH)) {
            let customListenersContent = FileUtil.readFile(EventsHandler.CUSTOM_LISTENERE_FILE_PATH);

            if (!customListenersContent.isEmpty() && !customListenersContent.equals("[]")) {
                try {
                    customListeners = new Gson().fromJson(customListenersContent, Helper.TYPE_MAP_LIST);

                    if (customListeners == null) {
                        LogUtil.e("EventsHandler", "Failed to parse Custom Listeners file! Now using none");
                        customListeners = [];
                    }
                } catch (e: any) {
                    LogUtil.e("EventsHandler", "Failed to parse Custom Listeners file! Now using none");
                }
            }
        }

        return customListeners;
    }
}