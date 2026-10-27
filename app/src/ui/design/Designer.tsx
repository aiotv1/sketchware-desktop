// View tab: widget palette, phone preview with drag & drop, outline and properties.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProjectStore, useStore } from '../editor/store';
import { ViewBean, ProjectFileBean } from '../../core/beans';
import { WIDGETS, WidgetDef, nextViewId, LAYOUT_TYPES } from './widgets';
import { ViewNode, childrenOf, PreviewCtx, argbCss } from './Preview';
import { Properties } from './Properties';
import { fileUrl } from '../common/fileurl';
import { contextMenu, confirmDialog, toast, modalOpen, mount } from '../common/dialogs';
import { CustomWidget, MAIN_CATEGORIES, readCustomWidgets, writeCustomWidgets, customWidgetBean, customWidgetIdBase } from './customWidgets';
import { WidgetCreatorDialog } from './WidgetCreatorDialog';
import { host, baseName } from '../../core/host';
import { viewTypeName } from '../../sw/viewtypes';
import { validateIdentifier } from '../logic/paletteActions';
import { Icon } from '../icons/Icon';
import { IconButton } from '../common/m3';
import { viewIcon } from '../icons/iconmap';
import './design.css';

const iconCache = new Map<string, string>();
function widgetIcon(w: WidgetDef) {
  let n = iconCache.get(w.label);
  if (!n) {
    const b = w.make();
    n = viewIcon(b.type, b.layout.orientation);
    iconCache.set(w.label, n);
  }
  return n;
}

interface DragInfo {
  kind: 'new' | 'move';
  def?: WidgetDef;
  id?: string;
  label: string;
  x: number;
  y: number;
  target: { parent: string; index: number } | null;
}

export function Designer(props: { store: ProjectStore }) {
  const store = useStore(props.store);
  const p = store.project;
  const file = store.file;
  const isActivity = file.fileType === 0;
  const [editDrawer, setEditDrawer] = useState(false);
  const xml = editDrawer && isActivity ? file.getDrawerXmlName() : file.getXmlName();
  const views = p.getViews(xml);
  const commit = () => {
    store.changed();
    store.recordViews(xml);
  };
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.25);
  const [drag, setDrag] = useState<DragInfo | null>(null);
  const dragRef = useRef<DragInfo | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(0);
  const phoneRef = useRef<HTMLDivElement>(null);
  const pending = useRef<{ kind: 'new' | 'move'; def?: WidgetDef; id?: string; x: number; y: number } | null>(null);

  useEffect(() => {
    setSelected(null);
    store.recordViews(xml, true);
  }, [xml]);

  // load project fonts so text renders with them
  useEffect(() => {
    let n = 0;
    for (const f of p.fonts) {
      const face = new FontFace('swfont_' + f.resName, `url("${fileUrl(store.fontPath(f.resName))}")`);
      face
        .load()
        .then((ff) => {
          (document as any).fonts.add(ff);
          setFontsLoaded(++n);
        })
        .catch(() => {});
    }
  }, [p.fonts.length]);

  const colorOf = (key: string, def: number) => {
    const v = p.meta[key];
    return argbCss(typeof v === 'number' ? v : def);
  };
  const primary = colorOf('color_primary', 0xff2196f3 | 0);
  const primaryDark = colorOf('color_primary_dark', 0xff1976d2 | 0);
  const accent = colorOf('color_accent', 0xff2196f3 | 0);

  const ctx: PreviewCtx = {
    imageUrl: (name) => {
      if (name === 'default_image') return null;
      return p.images.some((i) => i.resName === name) ? fileUrl(store.imagePath(name)) : null;
    },
    fontFamily: (name) => (p.fonts.some((f) => f.resName === name) ? 'swfont_' + name : null),
    selected,
    dropTarget: drag?.target ?? null,
    accent,
    primary,
  };

  const sel = selected ? views.find((v) => v.id === selected) ?? null : null;

  // ---------------------------------------------------------------- tree ops
  const parentTypeOf = (parent: string) => (parent === 'root' ? 0 : views.find((v) => v.id === parent)?.type ?? 0);

  const reindex = (parent: string) => {
    childrenOf(views, parent).forEach((c, i) => (c.index = i));
  };

  const descendants = (id: string): string[] => {
    const out: string[] = [];
    const walk = (pid: string) => {
      for (const c of views.filter((v) => v.parent === pid)) {
        out.push(c.id);
        walk(c.id);
      }
    };
    walk(id);
    return out;
  };

  const insertAt = (bean: ViewBean, parent: string, index: number) => {
    const sib = childrenOf(views, parent).filter((v) => v !== bean);
    bean.parent = parent;
    bean.parentType = parentTypeOf(parent);
    sib.splice(index, 0, bean);
    sib.forEach((c, i) => (c.index = i));
    if (!views.includes(bean)) views.push(bean);
  };

  const removeView = async (id: string) => {
    const ids = [id, ...descendants(id)];
    const java = file.getJavaName();
    const hasEvents = isActivity && p.getEvents(java).some((e) => ids.includes(e.targetId));
    if (hasEvents && !(await confirmDialog('Delete view', `Delete "${id}"${ids.length > 1 ? ` and ${ids.length - 1} child view(s)` : ''}? Their events and blocks are deleted too.`, 'Delete', true))) return;
    const parent = views.find((v) => v.id === id)?.parent ?? 'root';
    for (let i = views.length - 1; i >= 0; i--) if (ids.includes(views[i].id)) views.splice(i, 1);
    if (isActivity) {
      const evs = p.getEvents(java);
      for (let i = evs.length - 1; i >= 0; i--) {
        if (ids.includes(evs[i].targetId) && (evs[i].eventType === 1 || evs[i].eventType === 4)) {
          p.setBlocks(java, (evs[i].eventType === 4 ? '_drawer_' : '') + evs[i].targetId + '_' + evs[i].eventName, []);
          evs.splice(i, 1);
        }
      }
    }
    reindex(parent);
    setSelected(null);
    commit();
  };

  const duplicateView = (id: string) => {
    const src = views.find((v) => v.id === id);
    if (!src) return;
    const map = new Map<string, string>();
    const clones: ViewBean[] = [];
    for (const vid of [id, ...descendants(id)]) {
      const v = views.find((x) => x.id === vid)!;
      const c = v.clone();
      c.id = nextViewId(p, c.type);
      map.set(vid, c.id);
      clones.push(c);
      views.push(c); // reserve id
    }
    for (const c of clones) if (map.has(c.parent!)) c.parent = map.get(c.parent!)!;
    const top = clones[0];
    views.splice(views.indexOf(top), 1);
    insertAt(top, src.parent ?? 'root', src.index + 1);
    setSelected(top.id);
    commit();
  };

  const renameView = (oldId: string, newId: string): string | null => {
    const all = new Set<string>();
    for (const list of p.views.values()) for (const v of list) all.add(v.id);
    all.delete(oldId);
    const err = validateIdentifier(newId, all);
    if (err) return err;
    for (const v of views) {
      if (v.id === oldId) {
        v.id = newId;
        v.name = newId;
      }
      if (v.parent === oldId) v.parent = newId;
    }
    if (isActivity) {
      const java = file.getJavaName();
      for (const e of p.getEvents(java)) {
        if (e.targetId === oldId) {
          const bl = p.getBlocks(java, oldId + '_' + e.eventName);
          p.setBlocks(java, oldId + '_' + e.eventName, []);
          e.targetId = newId;
          p.setBlocks(java, newId + '_' + e.eventName, bl);
        }
      }
      for (const list of p.blocks.get(java)?.values() ?? []) {
        for (const b of list) {
          if (b.opCode === 'getVar' && b.spec === oldId) b.spec = newId;
          b.parameters = b.parameters.map((x) => (x === oldId ? newId : x));
        }
      }
    }
    setSelected(newId);
    commit();
    return null;
  };

  // ---------------------------------------------------------------- drag & drop
  const computeTarget = (x: number, y: number, movingId?: string) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el || !phoneRef.current?.contains(el)) return null;
    let container = el.closest('[data-layout]') as HTMLElement | null;
    const blocked = movingId ? new Set([movingId, ...descendants(movingId)]) : new Set<string>();
    while (container && blocked.has(container.dataset.vid!)) container = container.parentElement?.closest('[data-layout]') as HTMLElement | null;
    if (!container) return null;
    const parent = container.dataset.vid!;
    const horizontal = container.dataset.layout === 'h';
    const kids = Array.from(container.children).filter((c) => (c as HTMLElement).dataset?.vid && !blocked.has((c as HTMLElement).dataset.vid!)) as HTMLElement[];
    let index = kids.length;
    for (let i = 0; i < kids.length; i++) {
      const r = kids[i].getBoundingClientRect();
      if (horizontal ? x < r.left + r.width / 2 : y < r.top + r.height / 2) {
        index = i;
        break;
      }
    }
    return { parent, index };
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const pd = pending.current;
      if (!pd) return;
      if (!dragRef.current && Math.abs(e.clientX - pd.x) + Math.abs(e.clientY - pd.y) < 5) return;
      const label = pd.kind === 'new' ? pd.def!.label : pd.id!;
      dragRef.current = { kind: pd.kind, def: pd.def, id: pd.id, label, x: e.clientX, y: e.clientY, target: computeTarget(e.clientX, e.clientY, pd.id) };
      setDrag(dragRef.current);
    };
    const up = () => {
      const pd = pending.current;
      pending.current = null;
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      {
        if (d && d.target) {
          if (d.kind === 'new') {
            const bean = d.def!.make();
            bean.id = nextViewId(p, bean.type, d.def!.idBase);
            bean.name = bean.id;
            if (bean.type === 6 && bean.image.resName === 'default_image' && !p.images.length) bean.image.resName = 'default_image';
            insertAt(bean, d.target.parent, d.target.index);
            setSelected(bean.id);
          } else {
            const bean = views.find((v) => v.id === d.id);
            if (bean) {
              const old = bean.parent ?? 'root';
              insertAt(bean, d.target.parent, d.target.index);
              reindex(old);
            }
          }
          commit();
        } else if (!d && pd?.kind === 'move' && pd.id) {
          setSelected(pd.id);
        }
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  });

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input,textarea,select') || modalOpen()) return;
      if (e.key === 'Delete' && selected) removeView(selected);
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        store.undoViews(xml);
      }
      if (e.ctrlKey && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        store.undoViews(xml, true);
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'd' && selected) {
        e.preventDefault();
        duplicateView(selected);
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const onPhonePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = (e.target as HTMLElement).closest('[data-vid]') as HTMLElement | null;
    const id = el?.dataset.vid;
    if (!id || id === 'root') {
      setSelected(null);
      return;
    }
    pending.current = { kind: 'move', id, x: e.clientX, y: e.clientY };
  };

  const onPhoneContext = (e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest('[data-vid]') as HTMLElement | null;
    const id = el?.dataset.vid;
    if (!id || id === 'root') return;
    e.preventDefault();
    setSelected(id);
    contextMenu(e.clientX, e.clientY, [
      { label: 'Duplicate (Ctrl+D)', icon: 'x_copy', onClick: () => duplicateView(id) },
      { label: 'Select parent', icon: 'x_upward', onClick: () => setSelected(views.find((v) => v.id === id)?.parent === 'root' ? null : views.find((v) => v.id === id)?.parent ?? null) },
      { separator: true, label: '' },
      { label: 'Delete (Del)', icon: 'ic_mtrl_delete', danger: true, onClick: () => removeView(id) },
    ]);
  };

  // ---------------------------------------------------------------- "Create a widget" (WidgetsCreatorManager)
  const [customWidgets, setCustomWidgets] = useState<CustomWidget[]>([]);
  useEffect(() => {
    readCustomWidgets().then(setCustomWidgets);
  }, []);
  const saveWidgets = async (l: CustomWidget[]) => {
    await writeCustomWidgets(l);
    setCustomWidgets(await readCustomWidgets());
  };
  const customDef = (cw: CustomWidget): WidgetDef => ({ label: cw.title, group: cw.Class as any, icon: '', make: () => customWidgetBean(cw), idBase: customWidgetIdBase(cw.name) });
  const editWidget = (i: number | null) =>
    mount((c) => (
      <WidgetCreatorDialog
        initial={i == null ? null : customWidgets[i]}
        categories={sections}
        onClose={c}
        onSave={(w) => saveWidgets(i == null ? [...customWidgets, w] : customWidgets.map((x, j) => (j === i ? w : x)))}
        onImport={async () => {
          const files = await host().openDialog({ title: 'Select .json widgets files', properties: ['openFile', 'multiSelections'], filters: [{ name: 'Widgets', extensions: ['json'] }] });
          if (!files) return;
          const add: CustomWidget[] = [];
          for (const f of files) {
            try {
              const v = JSON.parse(await host().readText(f));
              for (const w of Array.isArray(v) ? v : [v]) if (w && w.Class != null && w.title != null && w.name != null && w.type != null) add.push({ ...w, type: Math.trunc(Number(w.type)), inject: String(w.inject ?? '') });
            } catch {
              toast('Invalid widgets file: ' + baseName(f), true);
            }
          }
          if (add.length) {
            await saveWidgets([...customWidgets, ...add]);
            toast(`Imported ${add.length} widget(s)`);
          }
        }}
        onExportAll={() => exportWidgets(customWidgets, 'allWidgets')}
      />
    ));
  const exportWidgets = async (list: CustomWidget[], name: string) => {
    if (!list.length) return toast('No custom widgets to export', true);
    const out = await host().saveDialog({ title: 'Export widgets', defaultPath: name + '.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (!out) return;
    await host().write(out, JSON.stringify(list.length === 1 ? list[0] : list));
    toast('Exported to ' + baseName(out));
  };
  const deleteWidget = async (i: number) => {
    if (!(await confirmDialog('Delete widget', `Delete the custom widget "${customWidgets[i].title}"? Views already placed in layouts stay.`, 'Delete', true))) return;
    saveWidgets(customWidgets.filter((_, j) => j !== i));
  };

  const toggleOption = (opt: number) => {
    file.options ^= opt;
    if (opt === ProjectFileBean.OPTION_ACTIVITY_DRAWER && !file.hasActivityOption(opt)) setEditDrawer(false);
    commit();
  };

  // built-in groups, then the creator's other main categories and any new category used by a custom widget
  const sections = useMemo(() => {
    const out: string[] = ['Layouts', 'AndroidX', 'Widgets', 'Library', 'Google'];
    for (const c of [...MAIN_CATEGORIES, ...customWidgets.map((w) => w.Class)]) if (!out.includes(c)) out.push(c);
    return out;
  }, [customWidgets]);
  const hasToolbar = isActivity && file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR) && !editDrawer;
  const fullscreen = isActivity && file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FULLSCREEN);
  const hasFab = isActivity && file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FAB) && !editDrawer;
  const W = editDrawer ? 320 : 360;
  const H = 640;

  return (
    <div className="designer">
      <div className="panel designer-palette">
        <button className="create-widget" onClick={() => editWidget(null)}>
          <Icon name="ic_mtrl_add" size={26} />
          Create a widget
        </button>
        {sections.map((g) => {
          const builtin = WIDGETS.filter((w) => w.group === g);
          const custom = customWidgets.map((cw, i) => ({ cw, i })).filter(({ cw }) => cw.Class === g);
          if (!builtin.length && !custom.length) return null;
          return (
            <div key={g}>
              <div className="panel-title">{g}</div>
              {builtin.map((w) => (
                <div
                  key={w.label}
                  className="widget-item"
                  onPointerDown={(e) => {
                    if (e.button === 0) pending.current = { kind: 'new', def: w, x: e.clientX, y: e.clientY };
                  }}
                >
                  <Icon name={widgetIcon(w)} size={20} className="widget-icon" />
                  {w.label}
                </div>
              ))}
              {custom.map(({ cw, i }) => (
                <div
                  key={'cw' + i}
                  className="widget-item custom"
                  title={`${cw.name} (custom widget based on ${viewTypeName(cw.type)})`}
                  onPointerDown={(e) => {
                    if (e.button === 0) pending.current = { kind: 'new', def: customDef(cw), x: e.clientX, y: e.clientY };
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    contextMenu(e.clientX, e.clientY, [
                      { label: 'Edit', icon: 'ic_mtrl_edit', onClick: () => editWidget(i) },
                      { label: 'Export', icon: 'x_export', onClick: () => exportWidgets([cw], cw.title) },
                      { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, onClick: () => deleteWidget(i) },
                    ]);
                  }}
                >
                  <Icon name={viewIcon(cw.type, 1)} size={20} className="widget-icon" />
                  {cw.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="designer-center">
        <div className="designer-toolbar row">
          {isActivity && (
            <>
              {(
                [
                  [1, 'Toolbar', 'ic_mtrl_collapsing_toolbar'],
                  [2, 'Fullscreen', 'ic_mtrl_expand'],
                  [4, 'Drawer', 'ic_drawer'],
                  [8, 'FAB', 'ic_mtrl_fab'],
                ] as [number, string, string][]
              ).map(([o, label, ic]) => (
                <button key={o} className={'chip' + (file.hasActivityOption(o) ? ' on' : '')} onClick={() => toggleOption(o)}>
                  <Icon name={file.hasActivityOption(o) ? 'ic_mtrl_check' : ic} size={18} />
                  {label}
                </button>
              ))}
              {file.hasActivityOption(4) && (
                <div className="tabs" style={{ marginLeft: 8 }}>
                  <button className={!editDrawer ? 'active' : ''} onClick={() => setEditDrawer(false)}>
                    {file.getXmlName()}
                  </button>
                  <button className={editDrawer ? 'active' : ''} onClick={() => setEditDrawer(true)}>
                    drawer
                  </button>
                </div>
              )}
            </>
          )}
          <div className="grow" />
          <IconButton icon="ic_mtrl_undo" title="Undo (Ctrl+Z)" disabled={!store.canUndo(xml)} onClick={() => store.undoViews(xml)} />
          <IconButton icon="ic_mtrl_redo" title="Redo (Ctrl+Y)" disabled={!store.canRedo(xml)} onClick={() => store.undoViews(xml, true)} />
          <span style={{ width: 12 }} />
          <button className="icon" onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}>
            −
          </button>
          <span className="small muted">{Math.round(zoom * 100)}%</span>
          <button className="icon" onClick={() => setZoom(Math.min(2.5, zoom + 0.1))}>
            +
          </button>
        </div>
        <div className="phone-area">
          <div className="phone" style={{ width: W * zoom, height: (isActivity ? H : H) * zoom }}>
            <div className="phone-inner" style={{ width: W, height: H, transform: `scale(${zoom})` }} ref={phoneRef} onPointerDown={onPhonePointerDown} onContextMenu={onPhoneContext}>
              {isActivity && !fullscreen && !editDrawer && <div className="status-bar" style={{ background: primaryDark }}>12:00</div>}
              {hasToolbar && (
                <div className="toolbar" style={{ background: primary }}>
                  {p.appName}
                </div>
              )}
              <div className="pv-root" data-vid="root" data-layout="v" style={{ background: editDrawer ? '#EEEEEE' : '#fff' }}>
                {childrenOf(views, 'root').map((v) => (
                  <ViewNode key={v.id} v={v} views={views} ctx={ctx} parentHorizontal={false} />
                ))}
                {drag?.target?.parent === 'root' && drag.target.index >= childrenOf(views, 'root').length && <div className="pv-drop" style={{ height: 3 }} />}
                {!views.length && !drag && <div className="pv-empty">Drag widgets here</div>}
              </div>
              {hasFab && (
                <div className="pv-fab" style={{ background: accent }} data-vid="_fab">
                  +
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="panel designer-right">
        <div className="outline">
          <div className="panel-title">Outline · {xml}</div>
          <Outline views={views} parent="root" depth={0} selected={selected} onSelect={setSelected} />
        </div>
        <div className="props-wrap">{sel ? <Properties key={sel.id} store={store} view={sel} xmlName={xml} onRename={renameView} /> : <div className="empty small">Select a view to edit its properties</div>}</div>
      </div>
      {drag && (
        <div className="drag-ghost" style={{ left: drag.x + 12, top: drag.y + 8 }}>
          {drag.label}
          {!drag.target && <span className="muted"> · drop inside the screen</span>}
        </div>
      )}
      {fontsLoaded < 0 && null}
    </div>
  );
}

function Outline(props: { views: ViewBean[]; parent: string; depth: number; selected: string | null; onSelect: (id: string) => void }) {
  const kids = childrenOf(props.views, props.parent);
  return (
    <>
      {kids.map((v) => (
        <React.Fragment key={v.id}>
          <div className={'outline-item' + (props.selected === v.id ? ' selected' : '')} style={{ paddingLeft: 8 + props.depth * 14 }} onClick={() => props.onSelect(v.id)}>
            <Icon name={viewIcon(v.type, v.layout.orientation)} size={16} />
            <span>{v.id}</span>
            <span className="muted small">{v.convert ? v.convert.split('.').pop() : viewTypeName(v.type)}</span>
          </div>
          {LAYOUT_TYPES.has(v.type) && <Outline views={props.views} parent={v.id} depth={props.depth + 1} selected={props.selected} onSelect={props.onSelect} />}
        </React.Fragment>
      ))}
    </>
  );
}

export { toast };
