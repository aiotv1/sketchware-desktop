// The block editor (com.besome.sketch.editor.LogicEditorActivity) for one event of one activity.
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { BlockBean, ProjectFileBean } from '../../core/beans';
import {
  LNode,
  makeHat,
  makeNode,
  fromBean,
  connect,
  detach,
  layoutTop,
  findDropTarget,
  applyDrop,
  DropTarget,
  toBeans,
  measureChain,
  placeChain,
  stackFromBeans,
} from '../../blocks/blockmodel';
import { hasSub1, hasSub2, argb } from '../../blocks/geometry';
import { allCategories, buildPalette, PaletteItem, PaletteContext, COLLECTION_CATEGORY } from '../../blocks/palette';
import { menuFor, MenuSpec } from '../../blocks/menus';
import { ProjectStore, useStore } from '../editor/store';
import { getSettings, saveSettings, customMenus } from '../appstate';
import { choiceDialog, contextMenu, promptDialog, toast, mount, Modal, modalOpen } from '../common/dialogs';
import { StackSvg, GhostSvg } from './BlockSvg';
import { fileUrl } from '../common/fileurl';
import { paletteActions } from './paletteActions';
import { ColorPicker } from '../common/ColorPicker';
import { AppBar, IconButton } from '../common/m3';
import { Icon } from '../icons/Icon';
import { resolveBlock } from '../../blocks/registry';
import { addToCollection, readCollection, CollectionBean } from '../../core/collections';
import './logic.css';

/** "onCreate" for activity events, "button1 : onClick" for others, the name for more blocks. */
function hatTitle(id: string, eventName: string) {
  if (eventName === 'moreBlock') return id;
  if (eventName === 'initializeLogic' || id === eventName) return id;
  return `${id.replace(/^_drawer_/, '')} : ${eventName}`;
}

function resolveSpecText(it: PaletteItem): string {
  return it.kind === 'block' ? resolveBlock(it.opCode, it.type).spec : '';
}

interface Snapshot {
  beans: BlockBean[];
  loose: { beans: BlockBean[]; x: number; y: number }[];
}

// loose (unattached) stacks are not part of Sketchware's file format; keep them for the session
const looseMemory = new Map<string, Snapshot['loose']>();

function buildStack(beans: BlockBean[]): LNode | null {
  if (!beans.length) return null;
  const byId = new Map<number, LNode>();
  for (const b of beans) byId.set(parseInt(b.id, 10), fromBean(b));
  for (const b of beans) {
    const n = byId.get(parseInt(b.id, 10))!;
    const link = (id: number, kind: 'sub1' | 'sub2' | 'next') => {
      const c = id >= 0 ? byId.get(id) : undefined;
      if (c) connect(n, c, kind);
    };
    link(b.subStack1, 'sub1');
    link(b.subStack2, 'sub2');
    link(b.nextBlock, 'next');
    b.parameters.forEach((pv, i) => {
      const a = n.args[i];
      if (!a) return;
      if (pv && pv.charAt(0) === '@') {
        const c = byId.get(parseInt(pv.substring(1), 10));
        if (c) connect(n, c, 'arg', a);
      } else a.value = pv ?? '';
    });
  }
  return byId.get(parseInt(beans[0].id, 10)) ?? null;
}

export interface LogicEditorProps {
  store: ProjectStore;
  file: ProjectFileBean;
  id: string;
  eventName: string;
  title: string;
  onClose: () => void;
  onShowSource: () => void;
}

interface DragState {
  node: LNode;
  offX: number; // pointer offset inside the block, in dp
  offY: number;
  clientX: number;
  clientY: number;
  target: DropTarget | null;
  overPalette: boolean;
  origin: Snapshot; // for cancel
}

export function LogicEditor(props: LogicEditorProps) {
  const { store, file, id, eventName } = props;
  useStore(store);
  const p = store.project;
  const java = file.getJavaName();
  const key = id + '_' + eventName;
  const memKey = p.scId + '/' + java + '/' + key;
  const [, rerender] = useReducer((x) => x + 1, 0);
  const [zoom, setZoom] = useState(getSettings().blockZoom || 1.5);
  const [category, setCategory] = useState(0);
  const [paletteVersion, setPaletteVersion] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------- document
  const doc = useRef<{ hat: LNode; tops: LNode[]; nextId: number }>(null as any);
  const history = useRef<{ undo: string[]; redo: string[] }>({ undo: [], redo: [] });
  const drag = useRef<DragState | null>(null);
  const [, setDragTick] = useState(0);

  const snapshot = (): Snapshot => ({
    beans: toBeans(doc.current.hat),
    loose: doc.current.tops.map((t) => ({ beans: t.allChildren().map((n) => n.toBean()), x: t.x, y: t.y })),
  });

  const load = (s: Snapshot) => {
    const hat = makeHat(props.title, eventName);
    hat.x = 8;
    hat.y = 8;
    const first = buildStack(s.beans);
    if (first) connect(hat, first, 'next');
    const tops: LNode[] = [];
    for (const l of s.loose) {
      const t = buildStack(l.beans);
      if (t) {
        t.x = l.x;
        t.y = l.y;
        tops.push(t);
      }
    }
    let max = 10;
    const scan = (n: LNode) => n.allChildren().forEach((c) => (max = Math.max(max, c.id)));
    scan(hat);
    tops.forEach(scan);
    doc.current = { hat, tops, nextId: max + 1 };
  };

  if (!doc.current) {
    load({ beans: p.getBlocks(java, key), loose: looseMemory.get(memKey) ?? [] });
  }

  const persist = () => {
    p.setBlocks(java, key, toBeans(doc.current.hat));
    looseMemory.set(memKey, snapshot().loose);
    store.changed();
  };

  const commit = (before: string) => {
    history.current.undo.push(before);
    if (history.current.undo.length > 100) history.current.undo.shift();
    history.current.redo = [];
    persist();
    rerender();
  };

  const undo = () => {
    const h = history.current;
    const prev = h.undo.pop();
    if (!prev) return;
    h.redo.push(JSON.stringify(snapshot()));
    load(JSON.parse(prev));
    persist();
    rerender();
  };
  const redo = () => {
    const h = history.current;
    const next = h.redo.pop();
    if (!next) return;
    h.undo.push(JSON.stringify(snapshot()));
    load(JSON.parse(next));
    persist();
    rerender();
  };

  const newId = () => doc.current.nextId++;

  // ---------------------------------------------------------------- layout
  const { hat, tops } = doc.current;
  layoutTop(hat);
  tops.forEach(layoutTop);
  let maxX = 600;
  let maxY = 400;
  for (const t of [hat, ...tops]) {
    maxX = Math.max(maxX, t.x + t.widthSum() + 150);
    maxY = Math.max(maxY, t.y + t.heightSum() + 150);
  }
  const d = drag.current;

  // ---------------------------------------------------------------- palette
  const [resStrings, setResStrings] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const txt = await store.ws.readExtra(p.scId, 'files', 'resource', 'values', 'strings.xml');
      if (!txt) return;
      setResStrings([...txt.matchAll(/<string\s+name="([^"]+)"/g)].map((m) => m[1]));
    })();
  }, [p.scId]);

  const settings = getSettings();
  const pctx: PaletteContext = {
    project: p,
    file,
    eventName,
    eventId: id,
    showBuiltIn: settings.showBuiltInBlocks,
    showAll: settings.showEveryBlock,
    viewBinding: false,
    resStrings,
    hasAssets: false,
    hasBroadcast: false,
    hasService: false,
  };
  const [search, setSearch] = useState('');
  const categories = [...allCategories(), COLLECTION_CATEGORY];
  // the user's block collection (Mp: collection/block), shown in the "Collection" category
  const [collected, setCollected] = useState<CollectionBean[]>([]);
  const reloadCollection = () => readCollection(store.ws.root, 'block').then(setCollected);
  useEffect(() => {
    reloadCollection();
  }, []);
  const paletteItems = useMemo(() => {
    if (category === COLLECTION_CATEGORY.id && !search.trim()) {
      const out: PaletteItem[] = [];
      for (const c of collected) {
        let beans: any[] = [];
        try {
          beans = JSON.parse(c.data);
        } catch {
          continue;
        }
        if (!Array.isArray(beans) || !beans.length) continue;
        out.push({ kind: 'label', text: c.name }, { kind: 'stack', name: c.name, beans });
      }
      return out;
    }
    if (!search.trim()) return buildPalette(category, pctx);
    // search every category, like the palette search of Sketchware Pro
    const q = search.trim().toLowerCase();
    const out: PaletteItem[] = [];
    for (const c of categories) {
      if (c.id === COLLECTION_CATEGORY.id) continue;
      const hits = buildPalette(c.id, pctx).filter((it) => it.kind === 'block' && ((it.opCode ?? '').toLowerCase().includes(q) || (it.spec ?? resolveSpecText(it)).toLowerCase().includes(q)));
      if (hits.length) out.push({ kind: 'label', text: c.name } as PaletteItem, ...hits);
    }
    return out;
  }, [category, search, collected, paletteVersion, resStrings, store.dirty, p.views, p.vars]);

  // ---------------------------------------------------------------- pointer handling
  const toCanvas = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: (clientX - r.left) / zoom, y: (clientY - r.top) / zoom };
  };

  const findNode = (nid: number): LNode | null => {
    for (const t of [doc.current.hat, ...doc.current.tops]) {
      const f = t.allChildren().find((n) => n.id === nid);
      if (f) return f;
    }
    return null;
  };

  const pointerStart = useRef<{ x: number; y: number; nid: number; arg: number | null; fromPalette?: PaletteItem; paletteRect?: DOMRect } | null>(null);

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = (e.target as Element).closest('[data-nid]') as Element | null;
    if (!el) {
      // pan the canvas
      const c = canvasRef.current!;
      const sx = e.clientX;
      const sy = e.clientY;
      const sl = c.scrollLeft;
      const st = c.scrollTop;
      setSelected(null);
      const move = (ev: PointerEvent) => {
        c.scrollLeft = sl - (ev.clientX - sx);
        c.scrollTop = st - (ev.clientY - sy);
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      return;
    }
    const nid = parseInt(el.getAttribute('data-nid')!, 10);
    const argAttr = el.getAttribute('data-arg');
    pointerStart.current = { x: e.clientX, y: e.clientY, nid, arg: argAttr != null ? parseInt(argAttr, 10) : null };
    window.addEventListener('pointermove', onWindowMove);
    window.addEventListener('pointerup', onWindowUp);
  };

  const onPalettePointerDown = (e: React.PointerEvent, item: PaletteItem) => {
    if (e.button !== 0 || (item.kind !== 'block' && item.kind !== 'stack')) return;
    const rect = (e.currentTarget as Element).getBoundingClientRect();
    pointerStart.current = { x: e.clientX, y: e.clientY, nid: -1, arg: null, fromPalette: item, paletteRect: rect };
    window.addEventListener('pointermove', onWindowMove);
    window.addEventListener('pointerup', onWindowUp);
  };

  const startDrag = (ev: PointerEvent) => {
    const s = pointerStart.current!;
    const before = snapshot();
    let node: LNode;
    let offX: number;
    let offY: number;
    if (s.fromPalette && (s.fromPalette.kind === 'block' || s.fromPalette.kind === 'stack')) {
      const it = s.fromPalette;
      if (it.kind === 'stack') {
        const top = stackFromBeans(it.beans, newId);
        if (!top) return false;
        node = top;
      } else node = makeNode(newId(), { opCode: it.opCode, type: it.type, typeName: it.typeName, spec: it.spec });
      offX = (s.x - s.paletteRect!.left) / zoom - 2;
      offY = (s.y - s.paletteRect!.top) / zoom - 2;
    } else {
      const n = findNode(s.nid);
      if (!n || n.isHat) return false;
      const pos = toCanvas(s.x, s.y);
      offX = pos.x - n.x;
      offY = pos.y - n.y;
      if (n.parent && n.parent.isHat && n.parentKind === 'arg') {
        // event parameter reporters are copied out of the hat
        node = makeNode(newId(), { opCode: n.opCode, type: n.type, typeName: n.typeName, spec: n.spec });
      } else {
        node = n;
        if (n.parent) detach(n);
        else doc.current.tops = doc.current.tops.filter((t) => t !== n);
      }
    }
    measureChain(node);
    drag.current = { node, offX, offY, clientX: ev.clientX, clientY: ev.clientY, target: null, overPalette: false, origin: before };
    return true;
  };

  const onWindowMove = (ev: PointerEvent) => {
    const s = pointerStart.current;
    if (!s) return;
    if (!drag.current) {
      if (Math.abs(ev.clientX - s.x) + Math.abs(ev.clientY - s.y) < 5) return;
      if (!startDrag(ev)) return;
    }
    const dr = drag.current!;
    dr.clientX = ev.clientX;
    dr.clientY = ev.clientY;
    // the palette (blocks + categories) sits right of the canvas: anything past its left edge deletes
    const pal = paletteRef.current?.getBoundingClientRect();
    dr.overPalette = !!pal && ev.clientX >= pal.left;
    if (!dr.overPalette && svgRef.current) {
      const pos = toCanvas(ev.clientX, ev.clientY);
      dr.target = findDropTarget([doc.current.hat, ...doc.current.tops], dr.node, pos.x - dr.offX, pos.y - dr.offY);
    } else dr.target = null;
    autoScroll(ev);
    setDragTick((t) => t + 1);
  };

  const autoScroll = (ev: PointerEvent) => {
    const c = canvasRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const m = 30;
    if (ev.clientX > r.right - m) c.scrollLeft += 12;
    if (ev.clientY > r.bottom - m) c.scrollTop += 12;
    if (ev.clientY < r.top + m && ev.clientY > r.top) c.scrollTop -= 12;
  };

  const onWindowUp = (ev: PointerEvent) => {
    window.removeEventListener('pointermove', onWindowMove);
    window.removeEventListener('pointerup', onWindowUp);
    const s = pointerStart.current;
    pointerStart.current = null;
    const dr = drag.current;
    if (!dr) {
      // a click
      if (s && s.nid >= 0) {
        setSelected(s.nid);
        if (s.arg != null) {
          const n = findNode(s.nid);
          if (n) editArg(n, s.arg);
        }
      } else if (s?.fromPalette && s.fromPalette.kind === 'block') {
        toast('Drag the block into the editor');
      }
      return;
    }
    drag.current = null;
    const before = JSON.stringify(dr.origin);
    if (dr.overPalette) {
      // dropped on the palette: delete
      commit(before);
      return;
    }
    const pos = toCanvas(ev.clientX, ev.clientY);
    if (dr.target) {
      doc.current.tops = applyDrop(doc.current.tops, dr.node, dr.target);
    } else {
      dr.node.x = Math.max(0, pos.x - dr.offX);
      dr.node.y = Math.max(0, pos.y - dr.offY);
      doc.current.tops.push(dr.node);
    }
    commit(before);
  };

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', onWindowMove);
      window.removeEventListener('pointerup', onWindowUp);
    },
    [],
  );

  // ---------------------------------------------------------------- editing inputs
  const setArg = (n: LNode, idx: number, value: string) => {
    const before = JSON.stringify(snapshot());
    n.args[idx].value = value;
    commit(before);
  };

  const editArg = async (n: LNode, idx: number) => {
    const a = n.args[idx];
    if (!a || a.block || a.argType === 'b') return;
    if (n.isHat) return;
    const spec: MenuSpec = menuFor(a.argType, a.menu, {
      project: p,
      file,
      eventName,
      eventId: id,
      customMenus,
      resStrings,
      extraActivities: [],
    });
    switch (spec.kind) {
      case 'text': {
        if (a.argType === 'd') {
          const v = await promptDialog(spec.title, a.value, {
            validate: (s) => (/^-?\d*\.?\d*$/.test(s) ? null : 'Enter a number'),
          });
          if (v != null) setArg(n, idx, v);
        } else {
          const multiline = spec.code || a.value.includes('\n') || a.value.length > 60 || n.opCode === 'addSourceDirectly';
          let v = await promptDialog(spec.title, a.value, { multiline, mono: spec.code || n.opCode === 'addSourceDirectly', placeholder: spec.hint });
          if (v != null) {
            if (v.length && v.charAt(0) === '@') v = ' ' + v; // ExtraMenuBean.asdDialog
            setArg(n, idx, v);
          }
        }
        return;
      }
      case 'list': {
        const items = spec.options.map((o) => ({ label: o.label ?? o.value, value: o.value, hint: o.hint }));
        if (spec.allowCode) items.push({ label: '✎ Enter code…', value: '\u0000code', hint: '' });
        const v = await choiceDialog(spec.title, items, a.value);
        if (v === '\u0000code') {
          const c = await promptDialog('Code', a.value, { multiline: true, mono: true });
          if (c != null) setArg(n, idx, c);
        } else if (v != null) setArg(n, idx, v);
        return;
      }
      case 'multi': {
        const cur = new Set(a.value.split(',').map((s) => s.trim()).filter(Boolean));
        mount((close) => (
          <MultiSelect
            title={spec.title}
            options={spec.options}
            selected={cur}
            onClose={close}
            onDone={(vals) => {
              close();
              setArg(n, idx, vals.join(','));
            }}
          />
        ));
        return;
      }
      case 'image': {
        const items = p.images.map((im) => ({
          label: (
            <span className="row">
              <img src={fileUrl(store.imagePath(im.resName))} style={{ width: 28, height: 28, objectFit: 'contain', background: '#fff3', borderRadius: 4 }} />
              {im.resName}
            </span>
          ),
          value: im.resName,
        }));
        const extra = spec.withNone ? [{ label: 'NONE', value: 'NONE' }] : [{ label: 'default_image', value: 'default_image' }];
        const v = await choiceDialog(spec.title, [...extra, ...items] as any, a.value);
        if (v != null) setArg(n, idx, v as string);
        return;
      }
      case 'sound': {
        const v = await choiceDialog(spec.title, p.sounds.map((s) => ({ label: s.resName, value: s.resName })), a.value);
        if (v != null) setArg(n, idx, v);
        return;
      }
      case 'font': {
        const v = await choiceDialog(spec.title, [{ label: 'default_font', value: 'default_font' }, ...p.fonts.map((s) => ({ label: s.resName, value: s.resName }))], a.value);
        if (v != null) setArg(n, idx, v);
        return;
      }
      case 'color': {
        mount((close) => (
          <ColorPicker
            initial={a.value}
            allowTransparent
            onClose={close}
            onPick={(v) => {
              close();
              setArg(n, idx, v);
            }}
          />
        ));
        return;
      }
    }
  };

  // ---------------------------------------------------------------- block context menu
  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = (e.target as Element).closest('[data-nid]') as Element | null;
    if (!el) {
      contextMenu(e.clientX, e.clientY, [
        { label: 'Clean up blocks', onClick: cleanUp },
        { label: 'Undo', onClick: undo, disabled: !history.current.undo.length },
        { label: 'Redo', onClick: redo, disabled: !history.current.redo.length },
      ]);
      return;
    }
    const n = findNode(parseInt(el.getAttribute('data-nid')!, 10));
    if (!n || n.isHat) return;
    contextMenu(e.clientX, e.clientY, [
      { label: 'Duplicate', onClick: () => duplicate(n) },
      { label: 'Delete block', danger: true, onClick: () => deleteBlock(n, false) },
      { label: 'Delete with blocks below', danger: true, onClick: () => deleteBlock(n, true), disabled: n.isReporter },
    ]);
  };

  const duplicate = (n: LNode) => {
    const before = JSON.stringify(snapshot());
    const beans = n.selfTree().map((x) => x.toBean());
    const idMap = new Map<string, string>();
    for (const b of beans) idMap.set(b.id, String(newId()));
    const remap = (v: number) => (v >= 0 && idMap.has(String(v)) ? parseInt(idMap.get(String(v))!, 10) : -1);
    for (const b of beans) {
      b.id = idMap.get(b.id)!;
      b.subStack1 = remap(b.subStack1);
      b.subStack2 = remap(b.subStack2);
      b.nextBlock = b === beans[0] ? -1 : remap(b.nextBlock);
      b.parameters = b.parameters.map((pv) => (pv.startsWith('@') && idMap.has(pv.substring(1)) ? '@' + idMap.get(pv.substring(1)) : pv));
    }
    const copy = buildStack(beans);
    if (copy) {
      copy.x = n.x + 20;
      copy.y = n.y + 20;
      doc.current.tops.push(copy);
    }
    commit(before);
  };

  const deleteBlock = (n: LNode, withBelow: boolean) => {
    const before = JSON.stringify(snapshot());
    const parent = n.parent;
    const kind = n.parentKind;
    const below = withBelow ? null : n.next;
    if (parent) detach(n);
    else doc.current.tops = doc.current.tops.filter((t) => t !== n);
    if (below) {
      detach(below);
      if (parent && kind && kind !== 'arg') connect(parent, below, kind);
      else {
        below.x = n.x;
        below.y = n.y;
        doc.current.tops.push(below);
      }
    }
    commit(before);
  };

  const cleanUp = () => {
    const before = JSON.stringify(snapshot());
    let y = doc.current.hat.y + doc.current.hat.heightSum() + 30;
    for (const t of doc.current.tops) {
      t.x = 8;
      t.y = y;
      measureChain(t);
      y += t.heightSum() + 24;
    }
    commit(before);
  };

  // ---------------------------------------------------------------- keyboard
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input,textarea') || modalOpen()) return;
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' && selected != null) {
        const n = findNode(selected);
        if (n && !n.isHat) deleteBlock(n, false);
      } else if (e.key === 'Escape') props.onClose();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const setZoomPersist = (z: number) => {
    const v = Math.min(3, Math.max(0.6, Math.round(z * 10) / 10));
    setZoom(v);
    saveSettings({ blockZoom: v });
  };

  // ---------------------------------------------------------------- render
  const onPaletteAction = async (action: string) => {
    const changed = await paletteActions(action, { store, file, java, eventName });
    if (changed) {
      store.changed();
      setPaletteVersion((v) => v + 1);
    }
  };

  // bookmark: the selected block and everything below it go to "My collection" (Mp, block collection)
  const saveToCollection = async () => {
    const n = selected != null ? findNode(selected) : null;
    if (!n || n.isHat) return toast('Select a block first', true);
    const name = await promptDialog('Save to collection', '', { label: 'Collection name', validate: (v) => (!v.trim() ? 'Enter a name' : null) });
    if (!name) return;
    const beans = n.allChildren().map((x) => x.toBean());
    await addToCollection(store.ws.root, 'block', { name: name.trim(), data: JSON.stringify(beans) });
    reloadCollection();
    toast('Saved to my collection');
  };

  const canvasW = maxX * zoom;
  const canvasH = maxY * zoom;
  return (
    <div className="logic-editor">
      <AppBar
        title={hatTitle(props.id, props.eventName)}
        subtitle={props.title.replace(/%\w(\.\w+)*/g, (m) => m.split('.').pop()!)}
        onBack={props.onClose}
        actions={
          <>
            <IconButton icon="ic_mtrl_code" title="Show source code" onClick={props.onShowSource} />
            <IconButton icon="ic_mtrl_undo" title="Undo (Ctrl+Z)" disabled={!history.current.undo.length} onClick={undo} />
            <IconButton icon="ic_mtrl_redo" title="Redo (Ctrl+Y)" disabled={!history.current.redo.length} onClick={redo} />
            <IconButton icon="ic_mtrl_bookmark" title="Save selected blocks to my collection" disabled={selected == null} onClick={saveToCollection} />
            <span style={{ width: 8 }} />
            <IconButton icon="ic_mtrl_padding" title="Clean up" onClick={cleanUp} />
            <button className="ib" title="Zoom out" onClick={() => setZoomPersist(zoom - 0.1)}>
              −
            </button>
            <span className="small muted" style={{ width: 44, textAlign: 'center' }}>
              {Math.round((zoom * 100) / 1.5)}%
            </span>
            <button className="ib" title="Zoom in" onClick={() => setZoomPersist(zoom + 0.1)}>
              +
            </button>
          </>
        }
      />
      <div className="logic-body">
        <div className="logic-canvas" ref={canvasRef} onPointerDown={onCanvasPointerDown} onContextMenu={onContextMenu}
          onWheel={(e) => {
            if (e.ctrlKey) {
              e.preventDefault();
              setZoomPersist(zoom + (e.deltaY < 0 ? 0.1 : -0.1));
            }
          }}
        >
          <svg ref={svgRef} width={canvasW} height={canvasH} style={{ display: 'block' }}>
            <defs>
              <pattern id="grid" width={20} height={20} patternUnits="userSpaceOnUse">
                <circle cx={1} cy={1} r={0.9} fill="var(--canvas-dot)" />
              </pattern>
            </defs>
            <g transform={`scale(${zoom})`}>
              <rect x={0} y={0} width={maxX} height={maxY} fill="url(#grid)" />
              <StackSvg top={hat} highlight={selected} />
              {tops.map((t) => (
                <StackSvg key={'t' + t.id} top={t} highlight={selected} />
              ))}
              {d && d.target && d.target.kind !== 'arg' && <GhostSvg node={d.node} x={d.target.x} y={d.target.y} />}
              {d && d.target && d.target.kind === 'arg' && (
                <rect x={d.target.x - 1.5} y={d.target.y - 1.5} width={(d.target.arg!.block?.z ?? d.target.arg!.w) + 3} height={17} rx={3} fill="none" stroke="#fff" strokeWidth={1.5} />
              )}
            </g>
          </svg>
        </div>
        <div className="palette-blocks" ref={paletteRef} style={d?.overPalette ? { background: 'rgba(229,83,75,0.18)' } : undefined}>
          {d?.overPalette && <div className="palette-trash">Drop here to delete</div>}
          {paletteItems.map((it, i) => (
            <PaletteRow key={category + ':' + i} item={it} zoom={zoom} onPointerDown={onPalettePointerDown} onAction={onPaletteAction} />
          ))}
          {!paletteItems.length && (
            <div className="empty small">
              {category === COLLECTION_CATEGORY.id && !search ? 'Your block collection is empty. Select a block on the canvas and press the bookmark button to save it here.' : 'No blocks in this category for this event.'}
            </div>
          )}
        </div>
        <div className="palette-cats">
          <div className="palette-search">
            <Icon name="ic_mtrl_search" size={18} />
            <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && (
              <button className="ib" style={{ padding: 2 }} onClick={() => setSearch('')}>
                <Icon name="ic_mtrl_close" size={16} />
              </button>
            )}
          </div>
          {categories.map((c) => (
            <div
              key={c.id}
              className={'palette-cat' + (c.id === category && !search ? ' active' : '')}
              onClick={() => {
                setSearch('');
                setCategory(c.id);
              }}
              title={c.name}
              style={{ ['--cat' as any]: argb(c.color) }}
            >
              <span className="bar" />
              <span className="name">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
      {d && <DragLayer d={d} zoom={zoom} />}
    </div>
  );
}

function DragLayer({ d, zoom }: { d: DragState; zoom: number }) {
  const n = d.node;
  measureChain(n);
  placeChain(n, 0, 0);
  const w = (n.widthSum() + 10) * zoom;
  const h = (n.heightSum() + 10) * zoom;
  return (
    <svg
      style={{ position: 'fixed', left: d.clientX - d.offX * zoom, top: d.clientY - d.offY * zoom, pointerEvents: 'none', zIndex: 50, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))', opacity: d.overPalette ? 0.5 : 0.95 }}
      width={w}
      height={h}
    >
      <g transform={`scale(${zoom})`}>
        <StackSvg top={n} />
      </g>
    </svg>
  );
}

const paletteCache = new Map<string, LNode>();

/** A saved stack from the collection, drawn like Sketchware's collection preview. */
function StackPaletteRow({ item, zoom, onPointerDown }: { item: Extract<PaletteItem, { kind: 'stack' }>; zoom: number; onPointerDown: (e: React.PointerEvent, it: PaletteItem) => void }) {
  const key = 'stack|' + item.name + '|' + JSON.stringify(item.beans).length;
  let n = paletteCache.get(key);
  if (!n) {
    // preview-only ids; must be >= 0 because negative links mean "no block"
    let id = 1_000_000;
    n = stackFromBeans(item.beans, () => id++) ?? undefined;
    if (n) paletteCache.set(key, n);
  }
  if (!n) return <div className="empty small">(broken collection item)</div>;
  n.x = 2;
  n.y = 2;
  layoutTop(n);
  const pz = zoom * 0.9;
  return (
    <div className="palette-item" title={item.name}>
      <svg width={(n.widthSum() + 6) * pz} height={(n.heightSum() + 6) * pz} onPointerDown={(e) => onPointerDown(e, item)} style={{ cursor: 'grab' }}>
        <g transform={`scale(${pz})`}>
          <StackSvg top={n} />
        </g>
      </svg>
    </div>
  );
}

function PaletteRow({ item, zoom, onPointerDown, onAction }: { item: PaletteItem; zoom: number; onPointerDown: (e: React.PointerEvent, it: PaletteItem) => void; onAction: (a: string) => void }) {
  if (item.kind === 'label') return <div className="palette-label">{item.text}</div>;
  if (item.kind === 'button')
    return (
      <button className="palette-btn" onClick={() => onAction(item.action)}>
        {item.text}
      </button>
    );
  if (item.kind === 'stack') return <StackPaletteRow item={item} zoom={zoom} onPointerDown={onPointerDown} />;
  const key = item.opCode + '|' + item.type + '|' + (item.typeName ?? '') + '|' + (item.spec ?? '');
  let n = paletteCache.get(key);
  if (!n) {
    n = makeNode(-1, { opCode: item.opCode, type: item.type, typeName: item.typeName, spec: item.spec });
    paletteCache.set(key, n);
  }
  n.x = 2;
  n.y = 2;
  layoutTop(n);
  const pz = zoom * 0.9;
  const w = (n.widthSum() + 6) * pz;
  const h = (n.heightSum() + 6) * pz;
  return (
    <div className="palette-item" title={item.opCode + (item.deprecated ? ' — ' + item.deprecated : '')}>
      <svg width={w} height={h} onPointerDown={(e) => onPointerDown(e, item)} style={{ cursor: 'grab', opacity: item.deprecated ? 0.6 : 1 }}>
        <g transform={`scale(${pz})`}>
          <StackSvg top={n} />
        </g>
      </svg>
    </div>
  );
}

function MultiSelect(props: { title: string; options: string[]; selected: Set<string>; onClose: () => void; onDone: (v: string[]) => void }) {
  const [sel, setSel] = useState(new Set(props.selected));
  return (
    <Modal
      title={props.title}
      onClose={props.onClose}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button className="primary" onClick={() => props.onDone(props.options.filter((o) => sel.has(o)))}>
            Select
          </button>
        </>
      }
    >
      <div style={{ maxHeight: '55vh', overflow: 'auto' }}>
        {props.options.map((o) => (
          <label key={o} className="list-item">
            <input
              type="checkbox"
              checked={sel.has(o)}
              onChange={(e) => {
                const s = new Set(sel);
                if (e.target.checked) s.add(o);
                else s.delete(o);
                setSel(s);
              }}
            />
            {o}
          </label>
        ))}
      </div>
    </Modal>
  );
}

export { hasSub1, hasSub2 };
