// Auto-ported from FileResConfig.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: com.google.gson.Gson, java.util.ArrayList, mod.hey.studios.util.Helper
// <imports>
import { FilePathUtil } from './FilePathUtil';
import { FileUtil, Gson, Helper } from './env';
// </imports>
export class FileResConfig {
  fpu: any = new FilePathUtil();
  listBroadcastManifest: any = [];
  listFileAssets: any = [];
  listFileBroadcast: any = [];
  listFileImport: any = [];
  listFileJava: any = [];
  listFileNativeLibs: any = [];
  listFilePermission: any = [];
  listFileResource: any = [];
  listFileService: any = [];
  listJavaManifest: any = [];
  listServiceManifest: any = [];
  numProj: string;
  constructor(sc_id: string) {
        this.numProj = sc_id;
        if ((sc_id == null || sc_id.isEmpty())) return;

        let permissions = FileUtil.readFile(this.fpu.getPathPermission(this.numProj));
        if (permissions.isEmpty()) return;

        this.listFilePermission = new Gson().fromJson(FileUtil.readFile(this.fpu.getPathPermission(this.numProj)), Helper.TYPE_STRING);
    }
  getNativelibsFile(str: string): any {
        this.listFileNativeLibs.clear();
        FileUtil.listDir(str, this.listFileNativeLibs);
        return this.listFileNativeLibs;
    }
  getPackageNameProject(): string {
        return "mod.agus.jcoderz";
    }
  listDir(path: string, existing_list: any): any {
        existing_list.clear();
        FileUtil.listDir(path, existing_list);
        return existing_list;
    }
  getJavaFile(): any {
        return this.listDir(new FilePathUtil().getPathJava(this.numProj), this.listFileJava);
    }
  getAssetsFile(): any {
        return this.listDir(new FilePathUtil().getPathAssets(this.numProj), this.listFileAssets);
    }
  getResourceFile(str: string): any {
        return this.listDir(str, this.listFileResource);
    }
  getPermissionList(): any {
        return this.listFilePermission;
    }
  getImportList(): any {
        let readFile = FileUtil.readFile(this.fpu.getPathImport(this.numProj));
        if (readFile.isEmpty()) return this.listFileImport;

        this.listFileImport = new Gson().fromJson(readFile, Helper.TYPE_STRING);

        return this.listFileImport;
    }
  getBroadcastFile(): any {
        return this.listDir(new FilePathUtil().getPathBroadcast(this.numProj), this.listFileBroadcast);
    }
  getServiceFile(): any {
        return this.listDir(new FilePathUtil().getPathService(this.numProj), this.listFileService);
    }
  getJavaManifestList(): any {
        let readFile = FileUtil.readFile(this.fpu.getManifestJava(this.numProj));
        if (readFile.isEmpty()) return this.listJavaManifest;

        this.listJavaManifest = new Gson().fromJson(readFile, Helper.TYPE_STRING);

        return this.listJavaManifest;
    }
  getBroadcastManifestList(): any {
        let readFile = FileUtil.readFile(this.fpu.getManifestBroadcast(this.numProj));
        if (readFile.isEmpty()) return this.listBroadcastManifest;

        this.listBroadcastManifest = new Gson().fromJson(readFile, Helper.TYPE_STRING);

        return this.listBroadcastManifest;
    }
  getServiceManifestList(): any {
        let readFile = FileUtil.readFile(this.fpu.getManifestService(this.numProj));
        if (readFile.isEmpty()) return this.listServiceManifest;

        this.listServiceManifest = new Gson().fromJson(readFile, Helper.TYPE_STRING);

        return this.listServiceManifest;
    }
}