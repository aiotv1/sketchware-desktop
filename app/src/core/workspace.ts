// Workspace on disk, laid out exactly like the phone's /sdcard/.sketchware folder:
//   mysc/list/<sc_id>/project            encrypted project meta (JSON)
//   data/<sc_id>/{file,logic,view,library,resource,...}
//   resources/{images,sounds,fonts,icons}/<sc_id>/...
import JSZip from 'jszip';
import { decryptText, encryptText } from './crypto';
import { host, joinPath } from './host';
import { ProjectData } from './project';

export const RES_SUBFOLDERS = ['fonts', 'icons', 'images', 'sounds'] as const;

export interface ProjectSummary {
  scId: string;
  meta: Record<string, any>;
  iconPath?: string;
}

export class Workspace {
  constructor(public root: string) {}

  projectMetaPath(scId: string) {
    return joinPath(this.root, 'mysc', 'list', scId, 'project');
  }
  dataDir(scId: string) {
    return joinPath(this.root, 'data', scId);
  }
  resDir(kind: string, scId: string) {
    return joinPath(this.root, 'resources', kind, scId);
  }
  /** Generated Android project output (like /.sketchware/mysc/<sc_id>/app). */
  buildDir(scId: string) {
    return joinPath(this.root, 'mysc', scId);
  }
  iconPath(scId: string) {
    return joinPath(this.resDir('icons', scId), 'icon.png');
  }

  async ensure() {
    const h = host();
    await h.mkdir(joinPath(this.root, 'mysc', 'list'));
    await h.mkdir(joinPath(this.root, 'data'));
    for (const r of RES_SUBFOLDERS) await h.mkdir(joinPath(this.root, 'resources', r));
  }

  async listProjects(): Promise<ProjectSummary[]> {
    const h = host();
    const dir = joinPath(this.root, 'mysc', 'list');
    const out: ProjectSummary[] = [];
    for (const e of await h.list(dir)) {
      if (!e.dir) continue;
      try {
        const meta = await this.readMeta(e.name);
        if (!meta) continue;
        const icon = this.iconPath(e.name);
        out.push({ scId: e.name, meta, iconPath: (await h.exists(icon)) ? icon : undefined });
      } catch {
        /* skip broken */
      }
    }
    out.sort((a, b) => Number(b.scId) - Number(a.scId));
    return out;
  }

  async readMeta(scId: string): Promise<Record<string, any> | null> {
    const p = this.projectMetaPath(scId);
    if (!(await host().exists(p))) return null;
    const text = await decryptText(await host().read(p));
    return JSON.parse(text.trim());
  }

  async writeMeta(scId: string, meta: Record<string, any>) {
    await host().write(this.projectMetaPath(scId), await encryptText(JSON.stringify(meta)));
  }

  async newScId(): Promise<string> {
    const list = await host().list(joinPath(this.root, 'mysc', 'list'));
    let max = 600;
    for (const e of list) {
      const n = parseInt(e.name, 10);
      if (!isNaN(n) && n > max) max = n;
    }
    return String(max + 1);
  }

  private async readData(scId: string, name: string): Promise<string> {
    const p = joinPath(this.dataDir(scId), name);
    if (!(await host().exists(p))) return '';
    return decryptText(await host().read(p));
  }

  private async writeData(scId: string, name: string, text: string) {
    await host().write(joinPath(this.dataDir(scId), name), await encryptText(text));
  }

  async loadProject(scId: string): Promise<ProjectData> {
    const p = new ProjectData();
    p.scId = scId;
    p.meta = (await this.readMeta(scId)) ?? { sc_id: scId };
    p.parseFile(await this.readData(scId, 'file'));
    p.parseView(await this.readData(scId, 'view'));
    p.parseLogic(await this.readData(scId, 'logic'));
    p.parseLibrary(await this.readData(scId, 'library'));
    p.parseResource(await this.readData(scId, 'resource'));
    if (p.activities.length === 0) {
      const { ProjectFileBean } = await import('./beans');
      p.activities.push(new ProjectFileBean(0, 'main'));
    }
    return p;
  }

  async saveProject(p: ProjectData) {
    p.meta.sc_id = p.scId;
    await this.writeMeta(p.scId, p.meta);
    await this.writeData(p.scId, 'file', p.serializeFile());
    await this.writeData(p.scId, 'view', p.serializeView());
    await this.writeData(p.scId, 'logic', p.serializeLogic());
    await this.writeData(p.scId, 'library', p.serializeLibrary());
    await this.writeData(p.scId, 'resource', p.serializeResource());
  }

  async deleteProject(scId: string) {
    const h = host();
    await h.remove(joinPath(this.root, 'mysc', 'list', scId));
    await h.remove(this.dataDir(scId));
    await h.remove(this.buildDir(scId));
    for (const r of RES_SUBFOLDERS) await h.remove(this.resDir(r, scId));
  }

  /** Path of an extra (Sketchware Pro) data file such as project_config, files/java/..., etc. */
  extraPath(scId: string, ...rel: string[]) {
    return joinPath(this.dataDir(scId), ...rel);
  }

  async readExtra(scId: string, ...rel: string[]): Promise<string | null> {
    const p = this.extraPath(scId, ...rel);
    if (!(await host().exists(p))) return null;
    return host().readText(p);
  }

  // ===================== .swb backup (Sketchware Pro BackupFactory format) =====================

  async exportSwb(scId: string): Promise<Uint8Array> {
    const h = host();
    const zip = new JSZip();
    zip.file('project', await h.read(this.projectMetaPath(scId)));
    const dataDir = this.dataDir(scId);
    for (const rel of await h.listRecursive(dataDir)) {
      zip.file('data/' + rel, await h.read(joinPath(dataDir, ...rel.split('/'))));
    }
    if ((await h.listRecursive(dataDir)).length === 0) zip.folder('data');
    for (const sub of RES_SUBFOLDERS) {
      const dir = this.resDir(sub, scId);
      const files = await h.listRecursive(dir);
      zip.folder('resources/' + sub);
      for (const rel of files) {
        if (rel.endsWith('.nomedia')) continue;
        zip.file(`resources/${sub}/${rel}`, await h.read(joinPath(dir, ...rel.split('/'))));
      }
      if (sub !== 'icons') zip.file(`resources/${sub}/.nomedia`, '');
    }
    return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  }

  /** Restores a .swb backup into a new project id. Returns the new sc_id. */
  async importSwb(bytes: Uint8Array): Promise<string> {
    const h = host();
    const zip = await JSZip.loadAsync(bytes);
    // Some backups are zipped with a leading folder; detect the prefix that contains "project".
    let prefix = '';
    if (!zip.file('project')) {
      const proj = Object.keys(zip.files).find((n) => /(^|\/)project$/.test(n) && !zip.files[n].dir);
      if (!proj) throw new Error('Not a Sketchware backup: "project" file is missing');
      prefix = proj.substring(0, proj.length - 'project'.length);
    }
    const scId = await this.newScId();
    const metaText = await decryptText(await zip.file(prefix + 'project')!.async('uint8array'));
    let meta: any;
    try {
      meta = JSON.parse(metaText.trim());
    } catch {
      throw new Error("Couldn't read the project file inside the backup");
    }
    meta.sc_id = scId;
    for (const name of Object.keys(zip.files)) {
      const entry = zip.files[name];
      if (entry.dir || !name.startsWith(prefix)) continue;
      const rel = name.substring(prefix.length).replace(/\\/g, '/');
      const parts = rel.split('/');
      if (rel === 'project') continue;
      if (parts[0] === 'data' && parts.length > 1) {
        await h.write(joinPath(this.dataDir(scId), ...parts.slice(1)), await entry.async('uint8array'));
      } else if (parts[0] === 'resources' && parts.length > 2 && (RES_SUBFOLDERS as readonly string[]).includes(parts[1])) {
        if (parts[parts.length - 1] === '.nomedia') continue;
        await h.write(joinPath(this.resDir(parts[1], scId), ...parts.slice(2)), await entry.async('uint8array'));
      } else if (parts[0] === 'local_libs' && parts.length > 2) {
        await h.write(joinPath(this.root, 'libs', 'local_libs', ...parts.slice(1)), await entry.async('uint8array'));
      }
    }
    await this.writeMeta(scId, meta);
    return scId;
  }

  /** Imports every project from a copied phone ".sketchware" folder. */
  async importSketchwareFolder(src: string): Promise<string[]> {
    const h = host();
    const listDir = joinPath(src, 'mysc', 'list');
    const ids: string[] = [];
    for (const e of await h.list(listDir)) {
      if (!e.dir) continue;
      const scId = await this.newScId();
      await h.copy(joinPath(listDir, e.name), joinPath(this.root, 'mysc', 'list', scId));
      if (await h.exists(joinPath(src, 'data', e.name))) await h.copy(joinPath(src, 'data', e.name), this.dataDir(scId));
      for (const r of RES_SUBFOLDERS) {
        const rp = joinPath(src, 'resources', r, e.name);
        if (await h.exists(rp)) await h.copy(rp, this.resDir(r, scId));
      }
      const meta = await this.readMeta(scId);
      if (meta) {
        meta.sc_id = scId;
        await this.writeMeta(scId, meta);
      }
      ids.push(scId);
    }
    return ids;
  }
}
