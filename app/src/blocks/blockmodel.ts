// Editable block tree used by the logic editor; mirrors a.a.a.Rs (blocks) / a.a.a.Ss (inputs).
import { BlockBean } from '../core/beans';
import { G, typeStyle, isReporterType, measureText, hasSub1, hasSub2, hasBottomNotchHeight } from './geometry';
import { parseSpec, resolveBlock, tokenizeSpec } from './registry';
import { menuDisplayName, blockTypeForMenu } from './kq';
import { mq } from '../sw/mq';

export type ArgType = 'b' | 'd' | 's' | 'm' | 'n';

export interface LArg {
  argType: ArgType;
  menu: string; // %m.<menu> / %s.<typeName>
  value: string;
  block: LNode | null;
  // layout (relative to owner)
  x: number;
  y: number;
  w: number;
  prefix: string; // "TextView : " for dropdowns
  prefixW: number;
  textW: number;
}

export interface LLabel {
  text: string;
  x: number;
  y: number;
  w: number;
}

export type LPart = { kind: 'label'; label: LLabel } | { kind: 'arg'; arg: LArg };

export type ParentKind = 'next' | 'sub1' | 'sub2' | 'arg';

export class LNode {
  parts: LPart[] = [];
  args: LArg[] = [];
  sub1: LNode | null = null;
  sub2: LNode | null = null;
  next: LNode | null = null;
  parent: LNode | null = null;
  parentKind: ParentKind | null = null;
  parentArg: LArg | null = null;
  elseLabel: LLabel | null = null;

  // absolute position (dp)
  x = 0;
  y = 0;
  // measured
  z = 0;
  A = 0;
  B = G.i;
  C = G.i;
  na = 0;
  totalH = 0;

  constructor(
    public id: number,
    public opCode: string,
    public type: string,
    public typeName: string,
    public spec: string,
    public color: number,
    public spec2 = '',
  ) {
    this.buildParts();
  }

  get style() {
    return typeStyle(this.type);
  }
  get isReporter() {
    return isReporterType(this.type);
  }
  get isHat() {
    return this.type === 'h';
  }
  get isCap() {
    return this.type === 'f';
  }

  buildParts() {
    const old = this.args;
    this.parts = [];
    this.args = [];
    const labelPrefix = (this.opCode === 'getVar' || this.opCode === 'getArg') && this.typeName ? this.typeName + ' : ' : '';
    for (const p of parseSpec(this.spec)) {
      if (p.kind === 'label') {
        this.parts.push({ kind: 'label', label: { text: labelPrefix + p.text, x: 0, y: 0, w: 0 } });
      } else {
        const a: LArg = { argType: p.argType as ArgType, menu: p.menu ?? '', value: '', block: null, x: 0, y: 0, w: 0, prefix: '', prefixW: 0, textW: 0 };
        const prev = old[this.args.length];
        if (prev && prev.argType === a.argType) {
          a.value = prev.value;
          a.block = prev.block;
          if (a.block) a.block.parentArg = a;
        }
        this.args.push(a);
        this.parts.push({ kind: 'arg', arg: a });
      }
    }
  }

  /** Last block of the chain starting here (Rs.h()). */
  last(): LNode {
    let n: LNode = this;
    while (n.next) n = n.next;
    return n;
  }

  /** Top of the stack this block belongs to. */
  top(): LNode {
    let n: LNode = this;
    while (n.parent) n = n.parent;
    return n;
  }

  /** All nodes of this block, its inputs, substacks and following blocks (Rs.getAllChildren order). */
  allChildren(out: LNode[] = []): LNode[] {
    let n: LNode | null = this;
    while (n) {
      out.push(n);
      for (const a of n.args) if (a.block) a.block.allChildren(out);
      if (hasSub1(n.style.d) && n.sub1) n.sub1.allChildren(out);
      if (hasSub2(n.style.d) && n.sub2) n.sub2.allChildren(out);
      n = n.next;
    }
    return out;
  }

  /** Only this block and what is nested inside it (not following blocks). */
  selfTree(out: LNode[] = []): LNode[] {
    out.push(this);
    for (const a of this.args) if (a.block) a.block.selfTree(out);
    if (this.sub1) this.sub1.allChildren(out);
    if (this.sub2) this.sub2.allChildren(out);
    return out;
  }

  heightSum(): number {
    let h = 0;
    let n: LNode | null = this;
    while (n) {
      if (h > 0) h -= G.h;
      h += n.totalH;
      n = n.next;
    }
    return h;
  }

  widthSum(): number {
    let w = 0;
    let n: LNode | null = this;
    while (n) {
      w = Math.max(w, n.z);
      if (hasSub1(n.style.d) && n.sub1) w = Math.max(w, n.sub1.widthSum() + G.j);
      if (hasSub2(n.style.d) && n.sub2) w = Math.max(w, n.sub2.widthSum() + G.j);
      n = n.next;
    }
    return w;
  }

  /** Ts.g(): y of the second substack. */
  sub2Y(): number {
    return this.A + this.B + G.n - G.h;
  }

  toBean(): BlockBean {
    const b = new BlockBean(String(this.id), this.spec, this.type, this.typeName, this.opCode);
    b.color = this.color;
    b.parameters = this.args.map((a) => (a.block ? '@' + a.block.id : a.value));
    b.subStack1 = hasSub1(this.style.d) && this.sub1 ? this.sub1.id : -1;
    b.subStack2 = hasSub2(this.style.d) && this.sub2 ? this.sub2.id : -1;
    b.nextBlock = this.next ? this.next.id : -1;
    return b;
  }
}

// ---------------------------------------------------------------- measuring

const LABEL_SIZE = 10;
const ARG_SIZE = 9;
const PREFIX_SIZE = 8;

function measureArg(a: LArg) {
  const ca = 2;
  const aa = a.argType === 'b' ? 25 : 20;
  let da = ca;
  if (a.argType === 'm') {
    const name = menuDisplayName(a.menu);
    a.prefix = name.length > 0 ? name + ' : ' : '';
    a.prefixW = measureText(a.prefix, PREFIX_SIZE, true) + ca * 2;
    da = a.prefixW;
  } else {
    a.prefix = '';
    a.prefixW = 0;
  }
  let textArea = aa;
  if (a.argType !== 'b') {
    const tw = measureText(a.value ?? '', ARG_SIZE, false) + 4;
    textArea = Math.max(aa, tw);
  }
  a.textW = textArea;
  a.w = textArea + da + (a.argType === 'm' ? G.H : 0);
}

export function measureNode(n: LNode) {
  const st = n.style;
  let na = 0;
  for (const a of n.args) {
    if (a.block) {
      measureTree(a.block);
      na = Math.max(na, a.block.na + 1);
    } else measureArg(a);
  }
  n.na = na;
  let x = st.w;
  for (const p of n.parts) {
    let w: number;
    if (p.kind === 'label') {
      p.label.w = measureText(p.label.text, LABEL_SIZE, true);
      p.label.x = x;
      p.label.y = st.u + na * G.y;
      w = p.label.w;
    } else if (p.arg.block) {
      const c = p.arg.block;
      p.arg.x = x;
      p.arg.y = st.u + (na - c.na - 1) * G.y;
      w = c.widthSum();
    } else {
      p.arg.x = x;
      p.arg.y = st.u + na * G.y;
      w = p.arg.w;
    }
    x += w + G.GAP;
  }
  let width = x;
  const t = n.type;
  if (t === 'b' || t === 'd' || t === 's' || t === 'a') width = Math.max(width, G.MIN_REPORTER_W);
  if (t === ' ' || t === '' || t === 'f') width = Math.max(width, G.MIN_CMD_W);
  if (t === 'c' || t === 'e') width = Math.max(width, G.MIN_C_W);
  if (t === 'h') width = Math.max(width, G.MIN_HAT_W);
  n.A = st.u + G.LABEL_H + na * G.y * 2 + G.v;

  // else / spec2 label
  n.elseLabel = null;
  if (t === 'e') {
    const text = n.opCode === 'ifElse' ? 'else' : n.spec2;
    if (text) {
      const w = measureText(text, LABEL_SIZE, true);
      n.elseLabel = { text, x: st.w, y: 0, w };
      width = Math.max(width, w + st.w + 2);
    }
  }
  n.z = width + st.x;

  if (hasSub1(st.d)) {
    let b = G.i;
    if (n.sub1) {
      measureChain(n.sub1);
      b = Math.max(n.sub1.heightSum(), G.i);
    }
    n.B = b;
  }
  if (hasSub2(st.d)) {
    let c = G.i;
    if (n.sub2) {
      measureChain(n.sub2);
      c = n.sub2.heightSum();
      if (n.sub2.last().isCap) c += G.h;
      c = Math.max(c, G.i);
    }
    n.C = c;
  }
  if (n.elseLabel) n.elseLabel.y = n.sub2Y() - G.n + 0.5;

  let total = n.A;
  if (hasSub1(st.d)) total += G.n + n.B - G.h;
  if (hasSub2(st.d)) total += G.m + n.C - G.h;
  if (hasBottomNotchHeight(st.d)) total += G.h;
  n.totalH = total;
}

function measureTree(n: LNode) {
  measureNode(n);
}

export function measureChain(n: LNode | null) {
  while (n) {
    measureNode(n);
    n = n.next;
  }
}

/** Assigns absolute positions to everything attached to a top-level block. */
export function placeChain(n: LNode | null, x: number, y: number) {
  while (n) {
    n.x = x;
    n.y = y;
    for (const a of n.args) {
      if (a.block) placeChain(a.block, x + a.x, y + a.y);
    }
    if (hasSub1(n.style.d) && n.sub1) placeChain(n.sub1, x + G.j, y + n.A);
    if (hasSub2(n.style.d) && n.sub2) placeChain(n.sub2, x + G.j, y + n.sub2Y());
    y = y + n.totalH - G.h;
    n = n.next;
  }
}

export function layoutTop(n: LNode) {
  measureChain(n);
  placeChain(n, n.x, n.y);
}

// ---------------------------------------------------------------- type compatibility (BlockPane.a(Rs, View))

export function classOfBlock(n: LNode) {
  return mq.a(n.type, n.typeName);
}

export function classOfArg(a: LArg) {
  if (a.argType === 'm' || a.argType === 'n') return mq.a(a.argType, a.menu);
  return mq.a(a.argType, a.menu);
}

export function canDropInto(dragged: LNode, a: LArg): boolean {
  if (!dragged.isReporter) return false;
  if (a.menu === '!') return true;
  const dc = classOfBlock(dragged);
  const tc = classOfArg(a);
  if (!dc || !tc) return false;
  return dc.a(tc);
}

// ---------------------------------------------------------------- construction

export interface NodeFactoryInfo {
  opCode: string;
  type: string;
  typeName?: string;
  spec?: string; // explicit spec (getVar etc.)
  color?: number;
}

export function makeNode(id: number, info: NodeFactoryInfo): LNode {
  const r = resolveBlock(info.opCode, info.type);
  const spec = info.spec ?? r.spec;
  const n = new LNode(id, info.opCode, info.type, info.typeName ?? '', spec, info.color ?? r.color, r.spec2);
  return n;
}

/** The hat block of an event plus its parameter reporters (LogicEditorActivity.onPostCreate). */
export function makeHat(title: string, eventName: string): LNode {
  const hat = new LNode(0, eventName, 'h', '', title, resolveBlock(eventName, 'h').color);
  let id = 0;
  for (const tok of tokenizeSpec(title)) {
    if (tok.charAt(0) !== '%') continue;
    const v = variableBlock(id + 1, tok, 'getArg');
    if (v) {
      const arg = hat.args[id];
      if (arg) {
        arg.block = v;
        v.parent = hat;
        v.parentKind = 'arg';
        v.parentArg = arg;
      }
      id++;
    }
  }
  return hat;
}

/** BlockUtil.getVariableBlock */
export function variableBlock(id: number, spec: string, opCode: string): LNode | null {
  const type = spec.charAt(1);
  if (type === 'b' || type === 'd' || type === 's') {
    return makeNode(id, { opCode, type, spec: spec.substring(3) });
  }
  if (type === 'm') {
    const last = spec.substring(spec.lastIndexOf('.') + 1);
    const first = spec.substring(spec.indexOf('.') + 1, spec.lastIndexOf('.'));
    return makeNode(id, { opCode, type: blockTypeForMenu(first), typeName: menuDisplayName(first), spec: last });
  }
  return null;
}

export function fromBean(b: BlockBean): LNode {
  const n = new LNode(parseInt(b.id, 10) || 0, b.opCode, b.type, b.typeName ?? '', b.spec ?? '', b.color);
  if (n.type === 'e') n.spec2 = resolveBlock(b.opCode, b.type).spec2;
  return n;
}

/**
 * Rebuilds a saved stack (a block collection: BlockBeans as JSON, first bean = top block) with fresh ids,
 * so it can be dropped into an editor that already uses the saved ids.
 */
export function stackFromBeans(saved: any[], newId: () => number): LNode | null {
  if (!Array.isArray(saved) || !saved.length) return null;
  const remap = new Map<number, number>();
  for (const b of saved) remap.set(parseInt(String(b.id), 10), newId());
  const ref = (v: any) => (Number(v) >= 0 && remap.has(Number(v)) ? remap.get(Number(v))! : -1);
  const beans = saved.map((b) => {
    const bean = new BlockBean(String(remap.get(parseInt(String(b.id), 10))), String(b.spec ?? ''), String(b.type ?? ' '), String(b.typeName ?? ''), String(b.opCode ?? ''));
    bean.color = Number(b.color ?? 0) | 0;
    bean.nextBlock = ref(b.nextBlock);
    bean.subStack1 = ref(b.subStack1);
    bean.subStack2 = ref(b.subStack2);
    bean.parameters = (Array.isArray(b.parameters) ? b.parameters : []).map((p: any) => {
      const s = String(p ?? '');
      return s.charAt(0) === '@' && remap.has(parseInt(s.substring(1), 10)) ? '@' + remap.get(parseInt(s.substring(1), 10)) : s;
    });
    return bean;
  });
  const holder = new LNode(-1, 'collection', 'h', '', '', 0);
  attachBeans(holder, beans);
  const top = holder.next;
  if (!top) return null;
  detach(top);
  return top;
}

/** Rebuilds the stack under `hat` from saved beans (LogicEditorActivity.loadEventBlocks). */
export function attachBeans(hat: LNode, beans: BlockBean[]): Map<number, LNode> {
  const byId = new Map<number, LNode>();
  for (const b of beans) {
    const n = fromBean(b);
    byId.set(n.id, n);
  }
  const first = beans.length ? byId.get(parseInt(beans[0].id, 10)) : undefined;
  if (first) connect(hat, first, 'next');
  for (const b of beans) {
    const n = byId.get(parseInt(b.id, 10));
    if (!n) continue;
    if (b.subStack1 >= 0) {
      const s = byId.get(b.subStack1);
      if (s) connect(n, s, 'sub1');
    }
    if (b.subStack2 >= 0) {
      const s = byId.get(b.subStack2);
      if (s) connect(n, s, 'sub2');
    }
    if (b.nextBlock >= 0) {
      const s = byId.get(b.nextBlock);
      if (s) connect(n, s, 'next');
    }
    b.parameters.forEach((p, i) => {
      const a = n.args[i];
      if (!a) return;
      if (p && p.charAt(0) === '@') {
        const c = byId.get(parseInt(p.substring(1), 10));
        if (c) connect(n, c, 'arg', a);
      } else {
        a.value = p ?? '';
      }
    });
  }
  return byId;
}

export function connect(parent: LNode, child: LNode, kind: ParentKind, arg?: LArg) {
  child.parent = parent;
  child.parentKind = kind;
  child.parentArg = arg ?? null;
  if (kind === 'next') parent.next = child;
  else if (kind === 'sub1') parent.sub1 = child;
  else if (kind === 'sub2') parent.sub2 = child;
  else if (kind === 'arg' && arg) arg.block = child;
}

/** Detaches a block (with the blocks following it) from its parent. */
export function detach(n: LNode) {
  const p = n.parent;
  if (!p) return;
  if (n.parentKind === 'next') p.next = null;
  else if (n.parentKind === 'sub1') p.sub1 = null;
  else if (n.parentKind === 'sub2') p.sub2 = null;
  else if (n.parentKind === 'arg' && n.parentArg) n.parentArg.block = null;
  n.parent = null;
  n.parentKind = null;
  n.parentArg = null;
}

export function toBeans(hat: LNode): BlockBean[] {
  return hat.next ? hat.next.allChildren().map((n) => n.toBean()) : [];
}

// ---------------------------------------------------------------- drop targets

export type DropKind = 'next' | 'top' | 'sub1' | 'sub2' | 'wrap' | 'arg';

export interface DropTarget {
  kind: DropKind;
  node: LNode; // block the dragged one attaches to
  arg?: LArg;
  x: number; // where the dragged block's top-left will land
  y: number;
}

/**
 * BlockPane.a(...)/b(...): candidates and nearest match using |dx|/2 + |dy| with a 40dp (reporter) or
 * 60dp (stack) radius.
 */
export function findDropTarget(tops: LNode[], dragged: LNode, dx: number, dy: number): DropTarget | null {
  const cands: DropTarget[] = [];
  const isRep = dragged.isReporter;
  const draggedLast = dragged.last();
  const draggedH = dragged.heightSum();
  const visit = (n: LNode) => {
    for (const a of n.args) {
      if (isRep && (!a.block || a.block !== dragged)) cands.push({ kind: 'arg', node: n, arg: a, x: n.x + a.x, y: n.y + a.y });
      if (a.block) visitTree(a.block);
    }
    if (!isRep && !n.isReporter) {
      if (!n.isCap && !(draggedLast.isCap && n.next)) {
        cands.push({ kind: 'next', node: n, x: n.x, y: n.y + n.totalH - G.h });
      }
      if (hasSub1(n.style.d)) cands.push({ kind: 'sub1', node: n, x: n.x + G.j, y: n.y + n.A });
      if (hasSub2(n.style.d)) cands.push({ kind: 'sub2', node: n, x: n.x + G.j, y: n.y + n.sub2Y() });
    }
  };
  const visitTree = (n: LNode | null) => {
    while (n) {
      visit(n);
      if (n.sub1) visitTree(n.sub1);
      if (n.sub2) visitTree(n.sub2);
      n = n.next;
    }
  };
  for (const t of tops) {
    if (t === dragged) continue;
    visitTree(t);
    if (!isRep && !t.isReporter && !t.isHat) {
      if (!draggedLast.isCap) cands.push({ kind: 'top', node: t, x: t.x, y: t.y - draggedH + G.h });
      if (hasSub1(dragged.style.d) && !dragged.sub1 && !dragged.next) {
        cands.push({ kind: 'wrap', node: t, x: t.x - G.j, y: t.y - dragged.A });
      }
    }
  }
  const radius = isRep ? 40 : 60;
  let best: DropTarget | null = null;
  let bestD = 100000;
  for (const c of cands) {
    if (c.kind === 'arg' && !canDropInto(dragged, c.arg!)) continue;
    const d = Math.abs((dx - c.x) / 2) + Math.abs(dy - c.y);
    if (d < bestD && d < radius) {
      best = c;
      bestD = d;
    }
  }
  return best;
}

/** Applies a drop: attaches `dragged` (a top-level stack) at the target. Returns the new top-level list. */
export function applyDrop(tops: LNode[], dragged: LNode, t: DropTarget): LNode[] {
  let list = tops.filter((x) => x !== dragged);
  switch (t.kind) {
    case 'arg': {
      const a = t.arg!;
      const old = a.block;
      if (old) {
        detach(old);
        old.x = t.node.x + t.node.widthSum() + 10;
        old.y = t.node.y + 5;
        list.push(old);
      }
      connect(t.node, dragged, 'arg', a);
      break;
    }
    case 'next': {
      const old = t.node.next;
      if (old) detach(old);
      connect(t.node, dragged, 'next');
      if (old) connect(dragged.last(), old, 'next');
      break;
    }
    case 'sub1':
    case 'sub2': {
      const old = t.kind === 'sub1' ? t.node.sub1 : t.node.sub2;
      if (old) detach(old);
      connect(t.node, dragged, t.kind);
      if (old) connect(dragged.last(), old, 'next');
      break;
    }
    case 'top': {
      const old = t.node;
      list = list.filter((x) => x !== old);
      dragged.x = t.x;
      dragged.y = t.y;
      connect(dragged.last(), old, 'next');
      list.push(dragged);
      break;
    }
    case 'wrap': {
      const old = t.node;
      list = list.filter((x) => x !== old);
      dragged.x = t.x;
      dragged.y = t.y;
      connect(dragged, old, 'sub1');
      list.push(dragged);
      break;
    }
  }
  return list;
}
