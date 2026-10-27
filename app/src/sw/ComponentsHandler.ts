// Auto-ported from ComponentsHandler.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: mod.hilal.saif.events.EventsHandler.capitalize, android.content.Context, android.os.Bundle, android.text.TextUtils, android.util.Pair, android.widget.Toast, androidx.annotation.NonNull, com.besome.sketch.beans.ComponentBean, com.google.gson.Gson, java.util.ArrayList, java.util.Arrays, java.util.Collections, java.util.HashMap, java.util.List, java.util.Map, java.util.Optional, a.a.a.Lx, mod.hey.studios.util.Helper, mod.jbk.util.OldResourceIdMapper, pro.sketchware.R, pro.sketchware.SketchApplication, pro.sketchware.utility.FileUtil, pro.sketchware.utility.SketchwareUtil
// <imports>
import { jparseInt, jisEmpty, jlistOf, jiter, Pair } from '../codegen/jshim';
import { ComponentBean } from '../core/beans';
import { Collections, FileUtil, Gson, Helper, Optional, R, SketchwareUtil, Toast, capitalize } from './env';
// </imports>
export class ComponentsHandler {
  static cachedCustomComponents: any = ComponentsHandler.readCustomComponents();
  constructor() {
    }
  static id(name: string): number {
        if (name.equals("AsyncTask")) {
            return 36;
        }

        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let typeName = component.get("typeName");

                if (typeof typeName === 'string') {
                    if (name.equals(typeName)) {
                        let id = component.get("id");

                        if (typeof id === 'string') {
                            try {
                                return jparseInt(id);
                            } catch (e: any) {
                                SketchwareUtil.toastError("Invalid ID entry in Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                                break;
                            }
                        } else {
                            SketchwareUtil.toastError("Invalid ID entry in Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                        }
                    }
                } else {
                    SketchwareUtil.toastError("Invalid type name entry in Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }

        return -1;
    }
  static typeName(id: number): string {
        if (id == 36) {
            return "AsyncTask";
        }

        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let componentId = component.get("id");

                if (typeof componentId === 'string') {
                    try {
                        let idInt = jparseInt(componentId);

                        if (idInt == id) {
                            let componentTypeName = component.get("typeName");

                            if (typeof componentTypeName === 'string') {
                                return componentTypeName;
                            } else {
                                SketchwareUtil.toastError("Invalid type name entry at Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                                break;
                            }
                        }
                    } catch (e: any) {
                        SketchwareUtil.toastError("Invalid ID entry at Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                    }
                } else {
                    SketchwareUtil.toastError("Invalid ID entry at Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }

        return "";
    }
  static name(id: number): string {
        if (id == 36) {
            return "AsyncTask";
        }

        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let componentId = component.get("id");

                if (typeof componentId === 'string') {
                    try {
                        let idInt = jparseInt(componentId);

                        if (idInt == id) {
                            let componentName = component.get("name");

                            if (typeof componentName === 'string') {
                                return componentName;
                            } else {
                                SketchwareUtil.toastError("Invalid name entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                                break;
                            }
                        }
                    } catch (e: any) {
                        SketchwareUtil.toastError("Invalid ID entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                    }
                } else {
                    SketchwareUtil.toastError("Invalid ID entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }
        return "component";
    }
  static description2(id: number): string {
        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let componentId = component.get("id");

                if (typeof componentId === 'string') {
                    try {
                        let idInt = jparseInt(componentId);

                        if (idInt == id) {
                            let componentDescription = component.get("description");

                            if (typeof componentDescription === 'string') {
                                return component.get("description");
                            } else {
                                SketchwareUtil.toastError("Invalid description entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                                break;
                            }
                        }
                    } catch (e: any) {
                        SketchwareUtil.toastError("Invalid ID entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                    }
                } else {
                    SketchwareUtil.toastError("Invalid ID entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }

        return "new component";
    }
  static getBuildClassById(id: number): string {
        if (id == 36) {
            return "AsyncTask";
        }

        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let componentId = component.get("id");

                if (typeof componentId === 'string') {
                    try {
                        let componentIdInteger = jparseInt(componentId);

                        if (componentIdInteger == id) {
                            let componentBuildClass = component.get("buildClass");

                            if (typeof componentBuildClass === 'string') {
                                return componentBuildClass;
                            } else {
                                SketchwareUtil.toastError("Invalid build class entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                                break;
                            }
                        }
                    } catch (e: any) {
                        SketchwareUtil.toastError("Invalid ID entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                    }
                } else {
                    SketchwareUtil.toastError("Invalid ID entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }

        return "";
    }
  static add(list: any): void {
        list.add(new ComponentBean(36));

        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let componentId = component.get("id");

                if (typeof componentId === 'string') {
                    try {
                        list.add(new ComponentBean(jparseInt(componentId)));
                    } catch (e: any) {
                        SketchwareUtil.toastError("Invalid ID entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                    }
                } else {
                    SketchwareUtil.toastError("Invalid ID entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }
    }
  static getTypeName(id: number): string {
        if (id == 36) {
            return "#";
        }

        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let componentId = component.get("id");

                if (typeof componentId === 'string') {
                    try {
                        let componentIdInteger = jparseInt(componentId);

                        if (componentIdInteger == id) {
                            let componentTypeName = component.get("typeName");

                            if (typeof componentTypeName === 'string') {
                                return componentTypeName;
                            } else {
                                SketchwareUtil.toastError("Invalid type name entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                                break;
                            }
                        }
                    } catch (e: any) {
                        SketchwareUtil.toastError("Invalid ID entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                    }
                } else {
                    SketchwareUtil.toastError("Invalid ID entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }

        return "";
    }
  static getVarName(componentTypeName: string): string {
        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let typeName = component.get("typeName");

                if (typeof typeName === 'string') {
                    if (componentTypeName.equals(typeName)) {
                        let varName = component.get("varName");

                        if (typeof varName === 'string') {
                            return varName;
                        } else {
                            SketchwareUtil.toastError("Invalid variable name entry in Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                        }
                    }
                } else {
                    SketchwareUtil.toastError("Invalid type name entry in Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }

        return componentTypeName;
    }
  static getClassByTypeName(name: string): string {
        if (name.equals("AsyncTask")) {
            return "Component.AsyncTask";
        }

        for (let i = 0, customComponentsSize = ComponentsHandler.cachedCustomComponents.size(); i < customComponentsSize; i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let componentTypeName = component.get("typeName");

                if (typeof componentTypeName === 'string') {
                    if (name.equals(componentTypeName)) {
                        let componentClass = component.get("class");

                        if (typeof componentClass === 'string') {
                            return componentClass;
                        } else {
                            SketchwareUtil.toastError("Invalid class entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                            break;
                        }
                    }
                } else {
                    SketchwareUtil.toastError("Invalid type name entry for Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }

        return "Component";
    }
  static extraVar(name: string, code: string, varName: string): string {
        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let componentTypeName = component.get("typeName");

                if (typeof componentTypeName === 'string') {
                    if (name.equals(componentTypeName)) {
                        let componentAdditionalVar = component.get("additionalVar");

                        if (typeof componentAdditionalVar === 'string') {
                            if (jisEmpty(componentAdditionalVar)) {
                                return code;
                            } else {
                                return code + "\r\n" +
                                        componentAdditionalVar.jreplace("###", varName).
                                                replace("$name", varName).
                                                replace("$Name", capitalize(varName)).
                                                replace("$NAME", varName.toUpperCase());
                            }
                        } else {
                            SketchwareUtil.toastError("Invalid additional variable entry at Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                        }
                    }
                } else {
                    SketchwareUtil.toastError("Invalid type name entry at Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }

        return code;
    }
  static defineExtraVar(name: string, varName: string): string {
        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let componentTypeName = component.get("typeName");

                if (typeof componentTypeName === 'string') {
                    if (name.equals(componentTypeName)) {
                        let componentDefineAdditionalVar = component.get("defineAdditionalVar");

                        if (typeof componentDefineAdditionalVar === 'string') {
                            if (jisEmpty(componentDefineAdditionalVar)) {
                                break;
                            } else {
                                return componentDefineAdditionalVar.jreplace("###", varName).
                                        replace("$name", varName).
                                        replace("$Name", capitalize(varName)).
                                        replace("$NAME", varName.toUpperCase());
                            }
                        } else {
                            SketchwareUtil.toastError("Invalid additional variable entry in Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                        }
                    }
                } else {
                    SketchwareUtil.toastError("Invalid type name entry in Custom Component #" + (i + 1));
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }

        return "";
    }
  static getImports(name: string, arrayList: any): void {
        for (let i = 0; i < ComponentsHandler.cachedCustomComponents.size(); i++) {
            let component = ComponentsHandler.cachedCustomComponents.get(i);
            if (component != null) {
                let componentTypeName = component.get("typeName");

                if (typeof componentTypeName === 'string') {
                    if (name.equals(componentTypeName)) {
                        let componentImports = component.get("imports");

                        if (typeof componentImports === 'string') {
                            let componentImportsArray = componentImports.jsplit("\n");
                            arrayList.addAll(jlistOf(componentImportsArray));
                        } else {
                            SketchwareUtil.toastError("Invalid imports entry in Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                            break;
                        }
                    }
                } else {
                    SketchwareUtil.toastError("Invalid type name entry in Custom Component #" + (i + 1), Toast.LENGTH_LONG);
                }
            } else {
                SketchwareUtil.toastError("Invalid (null) Custom Component at position " + i);
            }
        }
    }
  static getPath(): string {
        return FileUtil.getExternalStorageDir().concat("/.sketchware/data/system/component.json");
    }
  static readCustomComponents(): any {
        let data;
        if (FileUtil.isExistFile(ComponentsHandler.getPath())) {
            try {
                data = new Gson().fromJson(FileUtil.readFile(ComponentsHandler.getPath()), Helper.TYPE_MAP_LIST);
            } catch (e: any) {
                data = [];
                SketchwareUtil.toastError("Couldn't read Custom Components file: " + e.getMessage());
            }
            if (data == null) {
                SketchwareUtil.toastError("Found invalid Custom Components file");
                data = [];
            }
        } else {
            data = [];
        }

        return data;
    }
  static refreshCachedCustomComponents(): void {
        ComponentsHandler.cachedCustomComponents = ComponentsHandler.readCustomComponents();
    }
  static isValidComponent(map: any): boolean {
        return map.containsKey("name")
                && map.containsKey("id")
                && map.containsKey("icon")
                && map.containsKey("varName")
                && map.containsKey("typeName")
                && map.containsKey("buildClass")
                && map.containsKey("class")
                && map.containsKey("description")
                && map.containsKey("url")
                && map.containsKey("additionalVar")
                && map.containsKey("defineAdditionalVar")
                && map.containsKey("imports");
    }
  static isValidComponentList(list: any): boolean {
        for (const map of jiter(list)) {
            if (!ComponentsHandler.isValidComponent(map)) {
                return false;
            }
        }
        return true;
    }
  static readComponents(filePath: string): any {
        let content = FileUtil.readFile(filePath);
        if (content.isEmpty() || content.equals("[]")) {
            return new Pair(Optional.of(Helper.getResString(R.string.common_message_selected_file_empty)), Collections.emptyList());
        }

        let components = new Gson().fromJson(content, Helper.TYPE_MAP_LIST);
        if (components == null || components.isEmpty() || !ComponentsHandler.isValidComponentList(components)) {
            return new Pair(Optional.of(Helper.getResString(R.string.message_dialog_invalid_json)), Collections.emptyList());
        }

        return new Pair(Optional.empty(), components);
    }
}