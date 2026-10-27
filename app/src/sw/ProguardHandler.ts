// Auto-ported from ProguardHandler.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: com.google.gson.Gson, java.io.IOException, java.util.ArrayList, java.util.HashMap, a.a.a.ProjectBuilder, mod.hey.studios.util.Helper, mod.jbk.build.BuildProgressReceiver, pro.sketchware.utility.FileUtil
// <imports>
import { jstr, JMap } from '../codegen/jshim';
import { FileUtil, Gson, Helper } from './env';
// </imports>
export class ProguardHandler {
  static ANDROID_PROGUARD_RULES_PATH: string = ProguardHandler.createAndroidRules();
  static DEFAULT_PROGUARD_RULES_PATH: string = "";
  config_path: string;
  fm_config_path: string;
  constructor(sc_id: string) {
        ProguardHandler.DEFAULT_PROGUARD_RULES_PATH = ProguardHandler.createDefaultRules(sc_id);
        this.config_path = FileUtil.getExternalStorageDir() + "/.sketchware/data/" + sc_id + "/proguard";
        this.fm_config_path = FileUtil.getExternalStorageDir() + "/.sketchware/data/" + sc_id + "/proguard_fm";

        if (!FileUtil.isExistFile(this.config_path)) {
            FileUtil.writeFile(this.config_path, this.getDefaultConfig());
        }
    }
  static createAndroidRules(): string {
        let rulePath = FileUtil.getExternalStorageDir() + "/.sketchware/libs/android-proguard-rules.pro";

        if (!FileUtil.isExistFile(rulePath)) {
            FileUtil.writeFile(rulePath, `-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

-dontoptimize
-dontpreverify

-keepattributes *Annotation*
-keep public class com.google.vending.licensing.ILicensingService
-keep public class com.android.vending.licensing.ILicensingService

-keepclasseswithmembernames class * {
    native <methods>;
}

-keepclassmembers public class * extends android.view.View {
   void set*(***);
   *** get*();
}

-keepclassmembers class * extends android.app.Activity {
   public void *(android.view.View);
}

-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

-keepclassmembers class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator CREATOR;
}

-keepclassmembers class **.R$* {
    public static <fields>;
}

-dontwarn android.support.**

-keep class android.support.annotation.Keep

-keep @android.support.annotation.Keep class * {*;}

-keepclasseswithmembers class * {
    @android.support.annotation.Keep <methods>;
}

-keepclasseswithmembers class * {
    @android.support.annotation.Keep <fields>;
}

-keepclasseswithmembers class * {
    @android.support.annotation.Keep <init>(...);
}

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;}

-dontwarn android.arch.**
-dontwarn android.lifecycle.**
-keep class android.arch.** { *; }
-keep class android.lifecycle.** { *; }

-dontwarn androidx.arch.**
-dontwarn androidx.lifecycle.**
-keep class androidx.arch.** { *; }
-keep class androidx.lifecycle.** { *; }
`);
        }

        return rulePath;
    }
  static createDefaultRules(sc_id: string): string {
        let path = FileUtil.getExternalStorageDir() + "/.sketchware/data/" + sc_id + "/proguard-rules.pro";

        if (!FileUtil.isExistFile(path)) {
            FileUtil.writeFile(path, `-repackageclasses
-ignorewarnings
-dontwarn
-dontnote
`);
        }

        return path;
    }
  getDefaultConfig(): string {
        let defaultConfig = new JMap();

        defaultConfig.put("enabled", "false");
        defaultConfig.put("debug", "false");

        return new Gson().toJson(defaultConfig);
    }
  getCustomProguardRules(): string {
        return ProguardHandler.DEFAULT_PROGUARD_RULES_PATH;
    }
  isDebugFilesEnabled(): boolean {
        let debugFiles = true;
        if (FileUtil.isExistFile(this.config_path)) {
            try {
                let config = new Gson().fromJson(FileUtil.readFile(this.config_path), Helper.TYPE_STRING_MAP);

                if (!config.containsKey("debug")) return false;

                let debug = config.get("debug");
                if (debug != null) {
                    debugFiles = debug.equals("true");
                }

            } catch (e: any) {
                debugFiles = false;
            }
        }

        return debugFiles;
    }
  isShrinkingEnabled(): boolean {
        let proguardEnabled = true;
        if (FileUtil.isExistFile(this.config_path)) {
            try {
                let config = new Gson().fromJson(FileUtil.readFile(this.config_path), Helper.TYPE_STRING_MAP);

                let enabled = config.get("enabled");
                if (enabled == null) {
                    proguardEnabled = false;
                } else {
                    proguardEnabled = enabled.equals("true");
                }

            } catch (e: any) {
                proguardEnabled = false;
            }
        }

        return proguardEnabled;
    }
  setProguardEnabled(proguardEnabled: boolean): void {
        let config = new Gson().fromJson(FileUtil.readFile(this.config_path), Helper.TYPE_STRING_MAP);
        config.put("enabled", jstr(proguardEnabled));

        FileUtil.writeFile(this.config_path, new Gson().toJson(config));
    }
  isR8Enabled(): boolean {
        let r8Enabled = true;
        if (FileUtil.isExistFile(this.config_path)) {
            try {
                let config = new Gson().fromJson(FileUtil.readFile(this.config_path), Helper.TYPE_STRING_MAP);

                let enabled = config.get("r8");
                if (enabled == null) {
                    r8Enabled = false;
                } else {
                    r8Enabled = enabled.equals("true");
                }

            } catch (e: any) {
                r8Enabled = false;
            }
        }

        return r8Enabled;
    }
  setR8Enabled(r8Enabled: boolean): void {
        let config = new Gson().fromJson(FileUtil.readFile(this.config_path), Helper.TYPE_STRING_MAP);
        config.put("r8", jstr(r8Enabled));

        FileUtil.writeFile(this.config_path, new Gson().toJson(config));
    }
  libIsProguardFMEnabled(library: string): boolean {
        let enabled;
        if (this.isShrinkingEnabled() && FileUtil.isExistFile(this.fm_config_path)) {
            let configContent = FileUtil.readFile(this.fm_config_path);

            if (configContent.isEmpty()) {
                return false;
            }

            try {
                let config = new Gson().fromJson(configContent, Helper.TYPE_STRING);
                enabled = config.contains(library);
                return enabled;
            } catch (ignored: any) {
            }
        }

        return false;
    }
  setDebugEnabled(debugEnabled: boolean): void {
        let config = new Gson().fromJson(FileUtil.readFile(this.config_path), Helper.TYPE_STRING_MAP);
        config.put("debug", jstr(debugEnabled));

        FileUtil.writeFile(this.config_path, new Gson().toJson(config));
    }
  setProguardFMLibs(fullModeLibs: any): void {
        FileUtil.writeFile(this.fm_config_path, new Gson().toJson(fullModeLibs));
    }
  start(progressReceiver: any, builder: any): void {
        if (this.isShrinkingEnabled()) {
            if (this.isR8Enabled()) {
                progressReceiver.onProgress("Running R8 on classes...", 15);
                builder.runR8();
            } else {
                progressReceiver.onProgress("ProGuarding classes...", 16);
                builder.runProguard();
            }
        }
    }
}