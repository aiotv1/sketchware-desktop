// Auto-ported from ProjectSettings.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.app.Application, android.content.pm.ApplicationInfo, android.os.Environment, android.util.Log, android.view.View, android.widget.Checkable, android.widget.EditText, android.widget.RadioButton, android.widget.RadioGroup, com.google.gson.Gson, java.io.File, java.util.HashMap, mod.hey.studios.util.Helper, mod.jbk.util.LogUtil, pro.sketchware.utility.FileUtil
// <imports>
import { jparseInt, JMap } from '../codegen/jshim';
import { Environment, FileUtil, Gson, Helper, JFile, Log, LogUtil } from './env';
// </imports>
export class ProjectSettings {
  static SETTING_MINIMUM_SDK_VERSION: string = "min_sdk";
  static SETTING_ENABLE_BRIDGELESS_THEMES: string = "enable_bridgeless_themes";
  static SETTING_ENABLE_VIEWBINDING: string = "enable_viewbinding";
  static SETTING_APPLICATION_CLASS: string = "app_class";
  static SETTING_TARGET_SDK_VERSION: string = "target_sdk";
  static SETTING_DISABLE_OLD_METHODS: string = "disable_old_methods";
  static SETTING_NEW_XML_COMMAND: string = "xml_command";
  static SETTING_GENERIC_VALUE_TRUE: string = "true";
  static SETTING_GENERIC_VALUE_FALSE: string = "false";
  static TAG: string = "ProjectSettings";
  path: string;
  sc_id: string;
  hashmap: any;
  constructor(scId: string) {
        this.sc_id = scId;

        this.path = this.getPath();

        if (FileUtil.isExistFile(this.path)) {
            try {
                this.hashmap = new Gson().fromJson(FileUtil.readFile(this.path).trim(), Helper.TYPE_STRING_MAP);
            } catch (e: any) {
                Log.e("ProjectSettings", "Failed to read project settings for project " + this.sc_id + "!", e);
                this.hashmap = new JMap();
                this.save();
            }
        } else {
            this.hashmap = new JMap();
        }
    }
  getMinSdkVersion(): number {
        if (this.hashmap.containsKey(ProjectSettings.SETTING_MINIMUM_SDK_VERSION)) {
            try {
                //noinspection ConstantConditions because we catch that already
                return jparseInt(this.hashmap.get(ProjectSettings.SETTING_MINIMUM_SDK_VERSION));
            } catch (e: any) {
                LogUtil.e(ProjectSettings.TAG, "Failed to parse the project's minimum SDK version! Defaulting to 21", e);
                return 21;
            }
        } else {
            return 21;
        }
    }
  getPath(): string {
        return new JFile(Environment.getExternalStorageDirectory(), ".sketchware/data/" + this.sc_id + "/project_config").getAbsolutePath();
    }
  getValue(key: string, defaultValue: string): string {
        if (this.hashmap != null && this.hashmap.containsKey(key)) {
            if (!this.hashmap.get(key).isEmpty()) {
                return this.hashmap.get(key);
            } else {
                return defaultValue;
            }
        } else {
            return defaultValue;
        }
    }
  setValue(key: string, value: string): void {
        this.hashmap.put(key, value);
        this.save();
    }
  save(): void {
        FileUtil.writeFile(this.path, new Gson().toJson(this.hashmap));
    }
}