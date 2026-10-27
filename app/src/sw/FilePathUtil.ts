// Auto-ported from FilePathUtil.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.os.Environment, java.io.File
// <imports>
import { Environment, File, JFile } from './env';
// </imports>
export class FilePathUtil {
  static get SKETCHWARE_DATA(): any {
      return new JFile(Environment.getExternalStorageDirectory(), ".sketchware/data/");
    }
  static get SKETCHWARE_LOCAL_LIBS(): any {
      return new JFile(Environment.getExternalStorageDirectory(), ".sketchware/libs/local_libs");
    }
  static getLastCompileLogPath(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/compile_log").getAbsolutePath();
    }
  getPathPermission(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/permission").getAbsolutePath();
    }
  getPathImport(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/import").getAbsolutePath();
    }
  getPathBroadcast(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/files/broadcast").getAbsolutePath();
    }
  getPathSvg(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/converted-vectors/").getAbsolutePath();
    }
  getSvgFullPath(sc_id: string, resName: string): string {
        return new JFile(this.getPathSvg(sc_id) + File.separator + resName + ".svg").getAbsolutePath();
    }
  getPathService(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/files/service").getAbsolutePath();
    }
  getPathAssets(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/files/assets").getAbsolutePath();
    }
  getPathJava(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/files/java").getAbsolutePath();
    }
  getPathKotlinCompilerPlugins(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/files/kt_plugins").getAbsolutePath();
    }
  getPathResource(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/files/resource").getAbsolutePath();
    }
  getPathProguard(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/proguard-rules.pro").getAbsolutePath();
    }
  getPathLocalLibrary(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/local_library").getAbsolutePath();
    }
  getJarPathLocalLibrary(libraryName: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_LOCAL_LIBS, libraryName + "/classes.jar").getAbsolutePath();
    }
  getDexPathLocalLibrary(libraryName: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_LOCAL_LIBS, libraryName + "/classes.dex").getAbsolutePath();
    }
  getResPathLocalLibrary(libraryName: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_LOCAL_LIBS, libraryName + "/res").getAbsolutePath();
    }
  getJarPathLocalLibraryUser(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/files/library/jar").getAbsolutePath();
    }
  getDexPathLocalLibraryUser(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/files/library/dex").getAbsolutePath();
    }
  getResPathLocalLibraryUser(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/files/library/res").getAbsolutePath();
    }
  getManifestJava(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/java").getAbsolutePath();
    }
  getManifestBroadcast(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/broadcast").getAbsolutePath();
    }
  getPathNativelibs(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/files/native_libs").getAbsolutePath();
    }
  getManifestService(sc_id: string): string {
        return new JFile(FilePathUtil.SKETCHWARE_DATA, sc_id + "/service").getAbsolutePath();
    }
}