// Auto-ported from BuildSettings.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: java.io.Serializable, mod.hey.studios.project.ProjectSettings, pro.sketchware.utility.FileUtil
// <imports>
import { ProjectSettings } from './ProjectSettings';
import { FileUtil } from './env';
// </imports>
export class BuildSettings extends ProjectSettings {
  static SETTING_ANDROID_JAR_PATH: string = "android_jar";
  static SETTING_CLASSPATH: string = "classpath";
  static SETTING_DEXER: string = "dexer";
  static SETTING_JAVA_VERSION: string = "java_ver";
  static SETTING_NO_HTTP_LEGACY: string = "no_http_legacy";
  static SETTING_NO_WARNINGS: string = "no_warn";
  static SETTING_ENABLE_LOGCAT: string = "enable_logcat";
  static SETTING_DEXER_D8: string = "D8";
  static SETTING_DEXER_DX: string = "Dx";
  static SETTING_JAVA_VERSION_1_7: string = "1.7";
  static SETTING_JAVA_VERSION_1_8: string = "1.8";
  static SETTING_JAVA_VERSION_1_9: string = "1.9";
  static SETTING_JAVA_VERSION_10: string = "10";
  static SETTING_JAVA_VERSION_11: string = "11";
  constructor(sc_id: string) {
        super(sc_id);
    }
  getPath(): string {
        return FileUtil.getExternalStorageDir() + "/.sketchware/data/" + this.sc_id + "/build_config";
    }
}