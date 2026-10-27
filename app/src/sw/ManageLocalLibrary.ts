// Auto-ported from ManageLocalLibrary.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.os.Environment, android.widget.Toast, com.google.gson.Gson, com.google.gson.JsonParseException, java.io.File, java.util.ArrayList, java.util.HashMap, mod.hey.studios.util.Helper, mod.jbk.util.LogUtil, pro.sketchware.utility.FilePathUtil, pro.sketchware.utility.FileUtil, pro.sketchware.utility.SketchwareUtil
// <imports>
import { jiter, StringBuilder } from '../codegen/jshim';
import { FilePathUtil } from './FilePathUtil';
import { Environment, File, FileUtil, Gson, Helper, JFile, LogUtil, SketchwareUtil, Toast } from './env';
// </imports>
export class ManageLocalLibrary {
  projectId: string;
  list: any;
  constructor(sc_id: string) {
        this.projectId = sc_id;
        let localLibraryConfigPath = new FilePathUtil().getPathLocalLibrary(this.projectId);
        if (FileUtil.isExistFile(localLibraryConfigPath)) {
            try {
                let content = FileUtil.readFile(localLibraryConfigPath);
                if (content.trim().isEmpty() || content.trim().equals("null")) {
                    /* Old projects often have an empty file here, that simply means "no Local libraries" */
                    this.list = [];
                    return;
                }

                this.list = new Gson().fromJson(content, Helper.TYPE_MAP_LIST);

                if (this.list == null) {
                    LogUtil.w(this.constructor.name, "Read null from file " + localLibraryConfigPath + ", deleting invalid configuration.");
                    if (!new JFile(localLibraryConfigPath).delete()) {
                        LogUtil.e(this.constructor.name, "Couldn't delete file " + localLibraryConfigPath);
                    }

                    // fall-through to shared error handler
                } else {
                    return;
                }
            } catch (e: any) {
                // fall-through to shared error handler
            }

            SketchwareUtil.toastError("Invalid Local library configuration found! Temporarily using none");
        }
        this.list = [];
    }
  getAssets(): any {
        let assets = [];

        for (let i = 0, listSize = this.list.size(); i < listSize; i++) {
            let localLibrary = this.list.get(i);

            if (localLibrary.containsKey("assetsPath")) {
                let assetsPath = localLibrary.get("assetsPath");

                if (typeof assetsPath === 'string') {
                    assets.add(assetsPath);
                } else {
                    SketchwareUtil.toastError("Invalid assets path of enabled Local library #" + i, Toast.LENGTH_LONG);
                }
            }
        }

        return assets;
    }
  getDexLocalLibrary(): any {
        let dexes = [];

        for (let i = 0, listSize = this.list.size(); i < listSize; i++) {
            let localLibrary = this.list.get(i);
            let dexPath = localLibrary.get("dexPath");

            if (typeof dexPath === 'string') {
                dexes.add(dexPath);
            } else {
                SketchwareUtil.toastError("Invalid DEX path of enabled Local library #" + i, Toast.LENGTH_LONG);
            }
        }

        return dexes;
    }
  getExtraDexes(): any {
        let extraDexes = [];

        for (const localLibraryDexPath of jiter(this.getDexLocalLibrary())) {
            let dexPath = new JFile(localLibraryDexPath);
            if (dexPath.getParentFile() != null) {
                let dexPathFiles = dexPath.getParentFile().listFiles();

                if (dexPathFiles != null) {
                    for (const dexPathFile of jiter(dexPathFiles)) {
                        let dexPathFilename = dexPathFile.getName();
                        if (!dexPathFilename.equals("classes.dex")
                                && dexPathFilename.startsWith("classes")
                                && dexPathFilename.endsWith(".dex")) {
                            extraDexes.add(dexPathFile.getAbsolutePath());
                        }
                    }
                }
            }
        }

        return extraDexes;
    }
  getGenLocalLibrary(): any {
        let genPaths = [];

        for (const packageName of jiter(this.getPackageNames())) {
            if (!packageName.isEmpty()) {
                let projectGenFolder = new JFile(Environment.getExternalStorageDirectory(),
                        ".sketchware/mysc/".concat(this.projectId).concat("/gen"));
                let rJavaPath = packageName.jreplace(".", File.separator)
                        .concat(File.separator).concat("R.java");
                genPaths.add(new JFile(projectGenFolder, rJavaPath).getAbsolutePath());
            }
        }

        return genPaths;
    }
  getImportLocalLibrary(): any {
        let imports = [];

        for (const packageName of jiter(this.getPackageNames())) {
            if (!packageName.isEmpty()) {
                imports.add(packageName.concat(".*"));
            }
        }

        return imports;
    }
  getLocalLibraryJars(): any {
        let jars = [];

        for (let i = 0, listSize = this.list.size(); i < listSize; i++) {
            let localLibrary = this.list.get(i);
            let jarPath = localLibrary.get("jarPath");

            if (typeof jarPath === 'string') {
                jars.add(new JFile(jarPath));
            } else {
                SketchwareUtil.toastError("Invalid JAR path of enabled Local library #" + i + "->" + localLibrary.get("name"), Toast.LENGTH_LONG);
            }
        }

        return jars;
    }
  getJarLocalLibrary(): string {
        let classpath = new StringBuilder();

        for (let i = 0, listSize = this.list.size(); i < listSize; i++) {
            let localLibrary = this.list.get(i);
            let jarPath = localLibrary.get("jarPath");

            if (typeof jarPath === 'string') {
                classpath.append(":");
                classpath.append(jarPath);
            } else {
                SketchwareUtil.toastError("Invalid JAR path of enabled Local library #" + i + "->" + localLibrary.get("name"), Toast.LENGTH_LONG);
            }
        }

        return classpath.toString();
    }
  getNativeLibs(): any {
        let nativeLibraryDirectories = [];

        for (const localLibraryDexPath of jiter(this.getDexLocalLibrary())) {
            let localLibraryDexFile = new JFile(localLibraryDexPath);
            let jniFolder = new JFile(localLibraryDexFile.getParentFile(), "jni");
            if (jniFolder.isDirectory()) {
                nativeLibraryDirectories.add(jniFolder.getAbsolutePath());
            }
        }

        return nativeLibraryDirectories;
    }
  getPackageNames(): any {
        let packageNames = [];

        for (let i = 0, listSize = this.list.size(); i < listSize; i++) {
            let localLibrary = this.list.get(i);
            if (localLibrary.containsKey("packageName")) {
                let packageName = localLibrary.get("packageName");

                if (typeof packageName === 'string') {
                    packageNames.add(packageName);
                } else {
                    SketchwareUtil.toastError("Invalid package name of enabled Local library #" + i, Toast.LENGTH_LONG);
                }
            }
        }

        return packageNames;
    }
  getPackageNameLocalLibrary(): string {
        let packageNames = new StringBuilder();

        for (const packageName of jiter(this.getPackageNames())) {
            if (!packageName.isEmpty()) {
                packageNames.append(packageName);
                packageNames.append(":");
            }
        }

        return packageNames.toString();
    }
  getPgRules(): any {
        let proguardRules = [];

        for (let i = 0, listSize = this.list.size(); i < listSize; i++) {
            let localLibrary = this.list.get(i);
            if (localLibrary.containsKey("pgRulesPath")) {
                let proguardRulesPath = localLibrary.get("pgRulesPath");

                if (typeof proguardRulesPath === 'string') {
                    proguardRules.add(proguardRulesPath);
                } else {
                    SketchwareUtil.toastError("Invalid ProGuard path of enabled Local library #" + i, Toast.LENGTH_LONG);
                }
            }
        }

        return proguardRules;
    }
  getResLocalLibrary(): any {
        let localLibraryRes = [];

        for (let i = 0, listSize = this.list.size(); i < listSize; i++) {
            let localLibrary = this.list.get(i);
            if (localLibrary.containsKey("resPath")) {
                let resPath = localLibrary.get("resPath");

                if (typeof resPath === 'string') {
                    localLibraryRes.add(resPath);
                } else {
                    SketchwareUtil.toastError("Invalid res/ folder path of enabled Local library #" + i, Toast.LENGTH_LONG);
                }
            }
        }

        return localLibraryRes;
    }
}