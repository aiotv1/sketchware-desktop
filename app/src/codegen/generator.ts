// Drives the ported Sketchware Pro generator (a.a.a.yq & co) for one project:
//  - generateSourceFiles(): Java / XML sources (source viewer)
//  - exportAndroidStudio(): full Gradle project folder + zip (ExportProjectActivity#exportSrc)
import JSZip from 'jszip';
import '../codegen/jshim';
import { ProjectData } from '../core/project';
import { host, joinPath } from '../core/host';
import { configurePorted, bindProject } from '../sw/init';
import { sfs, FileUtil } from '../sw/env';
import { yq, yq_ExportType } from '../sw/yq';
import { eC, hC, iC, lC, ProjectBuilder, assetPath } from '../sw/platform';
import { wq } from '../sw/wq';
import { FilePathUtil } from '../sw/FilePathUtil';

export interface GeneratedFile {
  name: string;
  source: string;
}

let assetsDir = '';

export async function ensureGeneratorReady(workspaceRoot: string, toast?: (m: string, e: boolean) => void) {
  if (!assetsDir) {
    const paths = await host().paths();
    assetsDir = joinPath(paths.appDir, 'assets');
  }
  configurePorted(workspaceRoot, assetsDir, toast);
}

function managers(p: ProjectData) {
  return { e: new eC(p), h: new hC(p), i: new iC(p) };
}

function newYq(p: ProjectData): any {
  return new yq(null, wq.d(p.scId), lC.b(p.scId));
}

/** All generated sources, as shown in Sketchware's "Source code" viewer. */
export function generateSourceFiles(p: ProjectData, workspaceRoot: string): GeneratedFile[] {
  bindProject(p, workspaceRoot);
  const { e, h, i } = managers(p);
  const y = newYq(p);
  y.a_iC_hC_eC_ExportType(i, h, e, yq_ExportType.SOURCE_CODE_VIEWING);
  const builder = new ProjectBuilder(null, y);
  builder.buildBuiltInLibraryInformation();
  const beans = y.a_hC_eC_BuiltInLibraryManager(h, e, builder.getBuiltInLibraryManager());
  return beans.map((b: any) => ({ name: b.srcFileName, source: b.source }));
}

/** Source of one generated file (Java of an activity, layout XML, manifest...). */
export function generateSingleFile(p: ProjectData, workspaceRoot: string, fileName: string): string {
  bindProject(p, workspaceRoot);
  const { e, h, i } = managers(p);
  const y = newYq(p);
  return y.getFileSrc(fileName, h, e, i);
}

async function extractZipInto(zipPath: string, dest: string) {
  const zip = await JSZip.loadAsync(await host().read(zipPath));
  for (const name of Object.keys(zip.files)) {
    const f = zip.files[name];
    if (f.dir) continue;
    await host().write(joinPath(dest, ...name.split('/')), await f.async('uint8array'));
  }
}

export interface ExportResult {
  projectDir: string;
  zipPath?: string;
}

/**
 * Port of ExportProjectActivity#exportSrc: writes a complete Android Studio project to
 * <workspace>/mysc/<sc_id>/ and optionally zips it.
 */
export async function exportAndroidStudio(p: ProjectData, workspaceRoot: string, zipOut?: string): Promise<ExportResult> {
  bindProject(p, workspaceRoot);
  const { e, h, i } = managers(p);
  const y = newYq(p);
  const myscPath: string = y.projectMyscPath;
  FileUtil.deleteFile(myscPath);

  // project template resources (default_image, launcher icon, values)
  await extractZipInto(assetPath('res600.zip'), y.resDirectoryPath);

  const builder = new ProjectBuilder(null, y);
  y.a_iC_hC_eC_ExportType(i, h, e, yq_ExportType.ANDROID_STUDIO);
  builder.buildBuiltInLibraryInformation();
  y.b(h, e, i, builder.getBuiltInLibraryManager());

  const meta = p.meta;
  const iconDir = wq.e() + '/' + p.scId;
  if (meta.custom_icon === true || meta.custom_icon === 'true') {
    if (sfs().exists(iconDir + '/mipmaps')) {
      y.aa(iconDir + '/mipmaps');
      if (meta.isIconAdaptive === true) {
        y.createLauncherIconXml(`<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android" >
<background android:drawable="@mipmap/ic_launcher_background"/>
<foreground android:drawable="@mipmap/ic_launcher_foreground"/>
<monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>`);
      }
    } else if (sfs().exists(iconDir + '/icon.png')) {
      y.a_String(iconDir + '/icon.png');
    }
  }
  y.a_0();

  // project resources (kC.b/c/a)
  const copyRes = (kind: string, list: { resFullName: string }[], dest: string) => {
    if (!list.length) return;
    sfs().mkdir(dest);
    const src = joinPath(workspaceRoot, 'resources', kind, p.scId);
    for (const r of list) {
      const from = src + '/' + r.resFullName;
      if (sfs().exists(from)) sfs().copy(from, dest + '/' + r.resFullName.toLowerCase());
    }
  };
  copyRes('images', p.images, y.resDirectoryPath + '/drawable-xhdpi');
  copyRes('sounds', p.sounds, y.resDirectoryPath + '/raw');
  copyRes('fonts', p.fonts, y.assetsPath + '/fonts');
  y.f();

  // files added with Sketchware Pro's managers
  const util = new FilePathUtil();
  const copyDir = (from: string, to: string) => {
    if (sfs().exists(from)) sfs().copy(from, to);
  };
  copyDir(util.getPathJava(p.scId), y.javaFilesPath + '/' + y.packageNameAsFolders);
  copyDir(util.getPathResource(p.scId), y.resDirectoryPath);
  if (FileUtil.isExistFile(util.getPathProguard(p.scId))) FileUtil.copyFile(util.getPathProguard(p.scId), y.proguardFilePath);
  copyDir(util.getPathAssets(p.scId), y.assetsPath);
  copyDir(util.getPathNativelibs(p.scId), y.generatedFilesPath + '/jniLibs');

  // enabled local libraries without a Maven coordinate: their classes.jar goes to app/libs (picked up by fileTree)
  try {
    const libs = JSON.parse(FileUtil.readFile(util.getPathLocalLibrary(p.scId)) || '[]');
    for (const lib of Array.isArray(libs) ? libs : []) {
      if (lib && !lib.dependency && lib.jarPath && sfs().exists(lib.jarPath)) sfs().copy(lib.jarPath, myscPath + '/app/libs/' + String(lib.name).replace(/[^\w.-]/g, '_') + '.jar');
    }
  } catch {
    /* no local libraries */
  }

  if (zipOut) {
    const exclude = new Set<string>(['DebugActivity.java']);
    if (!sfs().exists(util.getPathJava(p.scId) + '/SketchApplication.java')) exclude.add('SketchApplication.java');
    const zip = new JSZip();
    const root = p.projectName || 'project';
    for (const rel of await host().listRecursive(myscPath)) {
      const base = rel.substring(rel.lastIndexOf('/') + 1);
      if (exclude.has(base)) continue;
      if (rel.startsWith('bin/') || rel.startsWith('gen/')) continue;
      zip.file(root + '/' + rel, await host().read(joinPath(myscPath, ...rel.split('/'))));
    }
    await host().write(zipOut, await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }));
  }
  return { projectDir: myscPath, zipPath: zipOut };
}

export { sfs };
