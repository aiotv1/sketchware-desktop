// Auto-ported from AndroidManifestInjector.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: pro.sketchware.utility.GsonUtils.getGson, android.os.Environment, com.google.gson.JsonParseException, java.io.File, java.util.ArrayList, java.util.Arrays, java.util.HashMap, mod.hey.studios.util.Helper, pro.sketchware.utility.FileUtil, pro.sketchware.utility.SketchwareUtil, pro.sketchware.xml.XmlBuilder
// <imports>
import { jlist, jlistOf, jiter, StringBuilder } from '../codegen/jshim';
import { XmlBuilder } from './XmlBuilder';
import { Environment, File, FileUtil, Helper, JFile, SketchwareUtil } from './env';
import { getGson } from './platform';
// </imports>
export class AndroidManifestInjector {
  static getPathAndroidManifestAttributeInjection(sc_id: string): any {
        return new JFile(Environment.getExternalStorageDirectory(),
                ".sketchware" + File.separator + "data" + File.separator + sc_id + File.separator +
                        "Injection" + File.separator + "androidmanifest" + File.separator + "attributes.json");
    }
  static getPathAndroidManifestLauncherActivity(sc_id: string): any {
        return new JFile(Environment.getExternalStorageDirectory(),
                ".sketchware" + File.separator + "data" + File.separator + sc_id + File.separator +
                        "Injection" + File.separator + "androidmanifest" + File.separator + "activity_launcher.txt");
    }
  static getPathAndroidManifestActivitiesComponents(sc_id: string): any {
        return new JFile(Environment.getExternalStorageDirectory(),
                ".sketchware" + File.separator + "data" + File.separator + sc_id + File.separator +
                        "Injection" + File.separator + "androidmanifest" + File.separator + "activities_components.json");
    }
  static getPathAndroidManifestAppComponents(sc_id: string): any {
        return new JFile(Environment.getExternalStorageDirectory(),
                ".sketchware" + File.separator + "data" + File.separator + sc_id + File.separator +
                        "Injection" + File.separator + "androidmanifest" + File.separator + "app_components.txt");
    }
  static readAndroidManifestAttributeInjections(sc_id: string): any {
        let attributes;

        parseAttributes:
        {
            let errorMessage;

            try {
                let injections = AndroidManifestInjector.getPathAndroidManifestAttributeInjection(sc_id);

                if (injections.exists()) {
                    attributes = getGson().fromJson(FileUtil.readFile(injections.getAbsolutePath()), Helper.TYPE_MAP_LIST);

                    if (attributes == null) {
                        errorMessage = "result == null";
                        // fall-through for shared error handling
                    } else {
                        break parseAttributes;
                    }
                } else {
                    return [];
                }
            } catch (e: any) {
                errorMessage = e.toString();
                // fall-through for shared error handling
            }

            attributes = [];
            SketchwareUtil.toastError("Failed to parse AndroidManifest attribute injections; Reason: " + errorMessage);
        }

        return attributes;
    }
  static getP(nx: any, id: string): void {
        let attributes = AndroidManifestInjector.readAndroidManifestAttributeInjections(id);

        for (let i = 0; i < attributes.size(); i++) {
            let attribute = attributes.get(i);
            let name = attribute.get("name");

            if (typeof name === 'string') {
                let value = attribute.get("value");

                if (typeof value === 'string') {
                    if ("_application_permissions".equals(name)) {
                        let usesPermissionTag = new XmlBuilder("uses-permission");
                        usesPermissionTag.addAttributeValue(value);
                        nx.addChildNode(usesPermissionTag);
                    }
                } else {
                    SketchwareUtil.toastError("Invalid AndroidManifest attribute injection value in attribute #" + (i + 1));
                }
            } else {
                SketchwareUtil.toastError("Invalid AndroidManifest attribute injection name in attribute #" + (i + 1));
            }
        }
    }
  static getAppAttrs(nx: any, projectId: string): void {
        AndroidManifestInjector.addToApp(nx, projectId);
    }
  static getActivityAttrs(nx: any, projectId: string, actName: string): boolean {
        let attributes = AndroidManifestInjector.readAndroidManifestAttributeInjections(projectId);
        let className = actName.substring(0, actName.indexOf(".java"));

        for (let i = 0; i < attributes.size(); i++) {
            let attribute = attributes.get(i);
            let name = attribute.get("name");

            if (typeof name === 'string') {
                if (className.equals(name)) {
                    AndroidManifestInjector.addToAct(nx, projectId, actName);
                    return true;
                }
            } else {
                SketchwareUtil.toastError("Invalid AndroidManifest attribute injection name in attribute #" + (i + 1));
            }
        }

        return false;
    }
  static isActivityThemeUsed(nx: any, projectId: string, actName: string): boolean {
        return AndroidManifestInjector.isActivityAttributeUsed("android:theme", projectId, actName);
    }
  static isActivityOrientationUsed(nx: any, projectId: string, actName: string): boolean {
        return AndroidManifestInjector.isActivityAttributeUsed("android:screenOrientation", projectId, actName);
    }
  static isActivityKeyboardUsed(nx: any, projectId: string, actName: string): boolean {
        return AndroidManifestInjector.isActivityAttributeUsed("android:windowSoftInputMode", projectId, actName);
    }
  static isActivityExportedUsed(sc_id: string, activityName: string): boolean {
        return AndroidManifestInjector.isActivityAttributeUsed("android:exported", sc_id, activityName);
    }
  static isActivityAttributeUsed(attribute: string, sc_id: string, activityName: string): boolean {
        let attributes = AndroidManifestInjector.readAndroidManifestAttributeInjections(sc_id);
        let className = activityName.substring(0, activityName.indexOf(".java"));

        for (let i = 0; i < attributes.size(); i++) {
            let attributeMap = attributes.get(i);
            let name = attributeMap.get("name");

            if (typeof name === 'string') {
                if (className.equals(name) || "_apply_for_all_activities".equals(name)) {
                    let value = attributeMap.get("value");

                    if (typeof value === 'string') {
                        if ((value).contains(attribute)) {
                            return true;
                        }
                    } else {
                        SketchwareUtil.toastError("Invalid AndroidManifest attribute injection value in attribute #" + (i + 1));
                    }
                }
            } else {
                SketchwareUtil.toastError("Invalid AndroidManifest attribute injection name in attribute #" + (i + 1));
            }
        }

        return false;
    }
  static getLauncherActivity(projectId: string): string {
        let launcherActivityFile = AndroidManifestInjector.getPathAndroidManifestLauncherActivity(projectId);

        if (launcherActivityFile.exists()) {
            let launcherActivity = FileUtil.readFile(launcherActivityFile.getAbsolutePath());

            if (!launcherActivity.contains(" ") && !launcherActivity.contains(".")) {
                return launcherActivity;
            }
        }

        return "main";
    }
  static setLauncherActivity(projectId: string, a: string): void {
        FileUtil.writeFile(AndroidManifestInjector.getPathAndroidManifestLauncherActivity(projectId).getAbsolutePath(),
                a);
    }
  static mHolder(m: string, projectId: string): string {
        let manifestLines = jlist(jlistOf(m.jsplit("\n")));

        let path = AndroidManifestInjector.getPathAndroidManifestActivitiesComponents(projectId).getAbsolutePath();
        if (FileUtil.isExistFile(path)) {
            let data = getGson().fromJson(FileUtil.readFile(path), Helper.TYPE_MAP_LIST);
            for (let i = 0; i < data.size(); i++) {
                let activityComponents = data.get(i);

                let name = activityComponents.get("name");

                if (typeof name === 'string') {
                    let value = activityComponents.get("value");

                    if (typeof value === 'string') {
                        if (!(value).trim().isEmpty()) {
                            for (let k = 3; k < manifestLines.size(); k++) {
                                let line = manifestLines.get(k);
                                let _line = manifestLines.get(k - 1);
                                if (line.contains("android:name=\"") && line.contains(name) && _line.contains("<activity")) {
                                    for (let q = k; q < manifestLines.size(); q++) {
                                        let v = manifestLines.get(q);
                                        let v2 = manifestLines.get(q - 1);
                                        if (v.jmatches("^		<[a-zA-Z_-]+[^>]")) {
                                            let hasShortClosing = false, spaceBeforeClosing = false;

                                            if (v2.contains("\"/>")) {
                                                hasShortClosing = true;
                                            } else if (v2.contains("\" />")) {
                                                hasShortClosing = true;
                                                spaceBeforeClosing = true;
                                            }

                                            if (hasShortClosing) {
                                                manifestLines.set(q - 1, manifestLines.get(q - 1).jreplace(spaceBeforeClosing ? "\" />" : "\"/>", "\">"));
                                                manifestLines.set(q - 1, manifestLines.get(q - 1) + "\r\n" + value + "\r\n" + "</activity>");
                                            } else {
                                                manifestLines.set(q - 2, manifestLines.get(q - 2) + "\r\n" + value);
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        let appComponents = AndroidManifestInjector.getPathAndroidManifestAppComponents(projectId);
        if (appComponents.exists()) {
            let appComponentsContent;
            if (!(appComponentsContent = FileUtil.readFile(appComponents.getAbsolutePath())).trim().isEmpty()) {
                let str2 = manifestLines.get(manifestLines.size() - 3);
                let str3 = str2 + "\r\n" + appComponentsContent;
                manifestLines.set(manifestLines.size() - 3, str3);
            }
        }

        //assemble
        let returnValue = new StringBuilder();
        for (const manifestLine of jiter(manifestLines)) {
            returnValue.append("\n").append(manifestLine);
        }
        return returnValue.toString();
    }
  static addToApp(nx: any, projectId: string): void {
        let attributes = AndroidManifestInjector.readAndroidManifestAttributeInjections(projectId);

        let themeInjected = false;
        for (let i = 0; i < attributes.size(); i++) {
            let attribute = attributes.get(i);
            let name = attribute.get("name");

            if (typeof name === 'string') {
                if ("_application_attrs".equals(name)) {
                    let value = attribute.get("value");

                    if (typeof value === 'string') {
                        nx.addAttributeValue(value);

                        if (!themeInjected && (value).contains("android:theme")) {
                            themeInjected = true;
                        }
                    } else {
                        SketchwareUtil.toastError("Invalid AndroidManifest attribute injection value in attribute #" + (i + 1));
                    }
                }
            } else {
                SketchwareUtil.toastError("Invalid AndroidManifest attribute injection name in attribute #" + (i + 1));
            }
        }

        if (!themeInjected) {
            nx.addAttributeValue("android:theme=\"@style/AppTheme\"");
        }
    }
  static addToAct(nx: any, projectId: string, actName: string): void {
        let attributes = AndroidManifestInjector.readAndroidManifestAttributeInjections(projectId);
        let className = actName.substring(0, actName.indexOf(".java"));

        for (let i = 0; i < attributes.size(); i++) {
            let attribute = attributes.get(i);
            let name = attribute.get("name");

            if (typeof name === 'string') {
                if (className.equals(name) || "_apply_for_all_activities".equals(name)) {
                    let value = attribute.get("value");

                    if (typeof value === 'string') {
                        nx.addAttributeValue(value);
                    } else {
                        SketchwareUtil.toastError("Invalid AndroidManifest attribute injection value in attribute #" + (i + 1));
                    }
                }
            } else {
                SketchwareUtil.toastError("Invalid AndroidManifest attribute injection name in attribute #" + (i + 1));
            }
        }
    }
}