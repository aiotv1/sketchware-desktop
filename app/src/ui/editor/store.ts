// Holds the open project and notifies React views about changes.
import { useEffect, useReducer } from 'react';
import { ProjectData } from '../../core/project';
import { Workspace } from '../../core/workspace';
import { ProjectFileBean, ViewBean } from '../../core/beans';
import { setProjectBlocks, getUserBlockDef } from '../../blocks/registry';
import { host } from '../../core/host';

export class ProjectStore {
  dirty = false;
  private listeners = new Set<() => void>();
  file: ProjectFileBean;

  constructor(public ws: Workspace, public project: ProjectData) {
    this.file = project.activities[0];
  }

  static async open(ws: Workspace, scId: string): Promise<ProjectStore> {
    const p = await ws.loadProject(scId);
    const s = new ProjectStore(ws, p);
    // custom blocks bundled with the backup (data/<id>/custom_blocks)
    try {
      const cb = await ws.readExtra(scId, 'custom_blocks');
      setProjectBlocks(cb ? JSON.parse(cb) : null);
    } catch {
      setProjectBlocks(null);
    }
    return s;
  }

  get scId() {
    return this.project.scId;
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach((f) => f());
  }

  changed() {
    this.dirty = true;
    this.notify();
  }

  setFile(f: ProjectFileBean) {
    this.file = f;
    this.notify();
  }

  async save() {
    await this.ws.saveProject(this.project);
    await this.saveUsedCustomBlocks();
    this.dirty = false;
    this.notify();
  }

  /** Custom blocks used by the project's logic (data/<id>/custom_blocks), like Sketchware Pro keeps them with the project. */
  usedCustomBlocks(): any[] {
    const seen = new Map<string, any>();
    for (const perFile of this.project.blocks.values())
      for (const list of perFile.values())
        for (const b of list) {
          if (seen.has(b.opCode)) continue;
          const def = getUserBlockDef(b.opCode);
          if (def) seen.set(b.opCode, def);
        }
    return [...seen.values()];
  }

  private async saveUsedCustomBlocks() {
    const used = this.usedCustomBlocks();
    const path = this.ws.extraPath(this.scId, 'custom_blocks');
    if (!used.length && !(await host().exists(path))) return;
    await host().write(path, JSON.stringify(used));
  }

  /** Absolute paths of project resources. */
  imagePath(name: string) {
    const r = this.project.images.find((i) => i.resName === name);
    return this.ws.resDir('images', this.scId) + '/' + (r?.resFullName ?? name + '.png');
  }
  soundPath(name: string) {
    const r = this.project.sounds.find((i) => i.resName === name);
    return this.ws.resDir('sounds', this.scId) + '/' + (r?.resFullName ?? name + '.mp3');
  }
  fontPath(name: string) {
    const r = this.project.fonts.find((i) => i.resName === name);
    return this.ws.resDir('fonts', this.scId) + '/' + (r?.resFullName ?? name + '.ttf');
  }

  async exists(p: string) {
    return host().exists(p);
  }

  // ------------------------------------------------ designer undo/redo (per layout file)
  private vh = new Map<string, { s: ViewBean[][]; i: number; t: number }>();

  /** Records the layout after a change; quick successive edits (typing) merge into one step. */
  recordViews(xml: string, initial = false) {
    const list = (this.project.views.get(xml) ?? []).map((v) => v.clone());
    let h = this.vh.get(xml);
    if (!h) {
      h = { s: [list], i: 0, t: 0 };
      this.vh.set(xml, h);
      return;
    }
    if (initial) return;
    const now = Date.now();
    h.s = h.s.slice(0, h.i + 1);
    if (now - h.t < 500 && h.i > 0) h.s[h.i] = list;
    else h.s.push(list);
    if (h.s.length > 80) h.s.shift();
    h.i = h.s.length - 1;
    h.t = now;
    this.notify();
  }
  canUndo(xml: string) {
    return (this.vh.get(xml)?.i ?? 0) > 0;
  }
  canRedo(xml: string) {
    const h = this.vh.get(xml);
    return !!h && h.i < h.s.length - 1;
  }
  undoViews(xml: string, redo = false) {
    const h = this.vh.get(xml);
    if (!h || (redo ? !this.canRedo(xml) : !this.canUndo(xml))) return;
    h.i += redo ? 1 : -1;
    h.t = 0;
    this.project.views.set(xml, h.s[h.i].map((v) => v.clone()));
    this.changed();
  }
}

export function useStore(store: ProjectStore) {
  const [, force] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    const off = store.subscribe(force);
    return () => void off();
  }, [store]);
  return store;
}
