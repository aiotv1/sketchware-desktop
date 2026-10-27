// Block geometry, ported from Sketchware's a.a.a.Ts (shapes) / a.a.a.Rs (layout) / a.a.a.Ss (inputs).
// All values are in dp; the canvas applies a zoom factor.

export const G = {
  h: 3, // notch depth
  i: 12, // min substack height
  j: 15, // C-block arm width
  k: 3, // corner cut
  l: 2,
  m: 15, // bottom arm height
  n: 15, // middle (else) arm height
  o: 15, // notch start
  p: 18,
  q: 28,
  r: 31,
  s: 6, // hat bump height
  t: 60, // hat bump width
  v: 2, // bottom padding
  y: 2, // nesting step
  LABEL_H: 14,
  H: 15, // dropdown arrow area
  I: 6, // arrow size
  J: 4, // arrow margin
  P: 1, // shadow stroke
  MIN_REPORTER_W: 30,
  MIN_CMD_W: 50,
  MIN_HAT_W: 90,
  MIN_C_W: 90,
  GAP: 4,
};

export type DrawStyle = 1 | 2 | 3 | 4 | 5 | 7 | 9 | 10 | 12;

export interface TypeStyle {
  d: DrawStyle; // Ts.dI
  u: number; // top padding
  w: number; // left padding
  x: number; // right padding
}

/** Ts constructor switch on the block type character. */
export function typeStyle(type: string): TypeStyle {
  switch (type) {
    case ' ':
      return { d: 4, u: 4, w: 3, x: 0 };
    case 'b':
      return { d: 2, u: 2, w: 8, x: 5 };
    case 'd':
      return { d: 3, u: 2, w: 4, x: 0 };
    case 'n':
      return { d: 3, u: 2, w: 3, x: 0 };
    case 'c':
      return { d: 10, u: 4, w: 3, x: 0 };
    case 'e':
      return { d: 12, u: 4, w: 3, x: 0 };
    case 'f':
      return { d: 5, u: 4, w: 3, x: 0 };
    case 'h':
      return { d: 7, u: 8, w: 3, x: 0 };
    case 'm':
      return { d: 9, u: 2, w: 3, x: 0 };
    case 's':
    case 'v':
    case 'p':
    case 'l':
    case 'a':
      return { d: 1, u: 2, w: 3, x: 0 };
    default:
      return { d: 4, u: 2, w: 3, x: 0 };
  }
}

export const isReporterType = (t: string) => t === 'b' || t === 'd' || t === 's' || t === 'v' || t === 'p' || t === 'l' || t === 'a';
export const hasSub1 = (d: number) => d >= 10;
export const hasSub2 = (d: number) => d === 12;
/** Types whose total height includes the bottom notch (Ts.getTotalHeight). */
export const hasBottomNotchHeight = (d: number) => d === 4 || d === 7 || d === 10 || d === 12;

// ---------------------------------------------------------------- text measuring
const FONT_FAMILY = "Roboto, 'Segoe UI', Arial, sans-serif";
let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();

export function fontCss(size: number, bold: boolean) {
  return `${bold ? 'bold ' : ''}${size}px ${FONT_FAMILY}`;
}

export function measureText(text: string, size: number, bold: boolean): number {
  const key = size + (bold ? 'b' : 'n') + text;
  const c = cache.get(key);
  if (c !== undefined) return c;
  if (!ctx) {
    if (typeof document === 'undefined') return text.length * size * 0.55;
    ctx = document.createElement('canvas').getContext('2d');
  }
  ctx!.font = fontCss(size, bold);
  const w = ctx!.measureText(text).width;
  cache.set(key, w);
  return w;
}

export function clearMeasureCache() {
  cache.clear();
}

// ---------------------------------------------------------------- paths

/** Ts.a(Path): top edge with the notch. */
function topEdge(z: number): string {
  const { k, o, p, q, r, h } = G;
  return `M0 ${k} L${k} 0 L${o} 0 L${p} ${h} L${q} ${h} L${r} 0 L${z - k} 0 L${z} ${k}`;
}

/** Ts.a(Path,y,notch,offset): right side down to y, then bottom edge back to the left. */
function bottomEdge(z: number, y: number, notch: boolean, off: number): string {
  const { k, o, p, q, r, h, l } = G;
  let s = ` L${z} ${y - k} L${z - k} ${y}`;
  if (notch) s += ` L${r + off} ${y} L${q + off} ${h + y} L${p + off} ${h + y} L${o + off} ${y}`;
  if (off > 0) s += ` L${l + off} ${y} L${off} ${y + l}`;
  else s += ` L${off + k} ${y} L0 ${y - k}`;
  return s;
}

/** Ts.a(Path,y): inner arm left side going down to y, then the arm's top edge to the right. */
function armEdge(z: number, y: number): string {
  const { j, l, k } = G;
  return ` L${j} ${y - l} L${j + l} ${y} L${z - k} ${y} L${z} ${y + k}`;
}

export interface ShapeInfo {
  d: DrawStyle;
  z: number; // width
  A: number; // top height
  B: number; // substack 1 height
  C: number; // substack 2 height
}

/** Fill path for a block body. */
export function blockPath(sh: ShapeInfo): string {
  const { d, z, A, B, C } = sh;
  const { h, m, n, j, s, t, k } = G;
  switch (d) {
    case 1: // rect reporter
    case 9:
      return `M0 0 H${z} V${A} H0 Z`;
    case 2: {
      const a2 = A / 2;
      return `M${a2} ${A} L0 ${a2} L${a2} 0 L${z - a2} 0 L${z} ${a2} L${z - a2} ${A} Z`;
    }
    case 3: {
      const r2 = A / 2;
      return `M${r2} ${A} A${r2} ${r2} 0 0 1 ${r2} 0 L${z - r2} 0 A${r2} ${r2} 0 0 1 ${z - r2} ${A} Z`;
    }
    case 4:
    case 5:
      return topEdge(z) + bottomEdge(z, A, d !== 5, 0) + ' Z';
    case 7:
      return `M0 ${s} A${t / 2} ${s} 0 0 1 ${t} ${s} L${z - k} ${s} L${z} ${s + k}` + bottomEdge(z, A, true, 0) + ' Z';
    case 10: {
      const v3 = A + B - h;
      return topEdge(z) + bottomEdge(z, A, true, j) + armEdge(z, v3) + bottomEdge(z, m + v3, true, 0) + ' Z';
    }
    case 12: {
      const v3 = A + B - h;
      const v5 = n + v3 + C - h;
      return topEdge(z) + bottomEdge(z, A, true, j) + armEdge(z, v3) + bottomEdge(z, n + v3, true, j) + armEdge(z, v5) + bottomEdge(z, m + v5, true, 0) + ' Z';
    }
  }
  return `M0 0 H${z} V${A} H0 Z`;
}

function pairsToPath(arr: number[]): string {
  let s = '';
  for (let i = 0; i + 3 < arr.length; i += 4) s += `M${arr[i]} ${arr[i + 1]} L${arr[i + 2]} ${arr[i + 3]} `;
  return s;
}

/** Ts.b(II): right edge between two y's. */
function rightEdgeShadow(z: number, y1: number, y2: number) {
  const P2 = G.P / 2;
  return [z - P2, y1 + G.k, z - P2, y2 - G.k];
}

/** Ts.a(IZI): bottom-edge shadow. */
function bottomShadow(z: number, y: number, notch: boolean, off: number) {
  const { k, P, r, q, h, p, o, l } = G;
  const P2 = P / 2;
  const v: number[] = [z, y - k - P2, z - k, y - P2];
  if (notch) {
    v.push(z - k, y - P2, off + r, y - P2, r + off, y - P2, off + q, y + h - P2, q + off, y + h - P2, off + p, y + h - P2, p + off, y + h - P2, off + o, y - P2);
    v.push(o + off, y - P2, off > 0 ? off + l : off + k, y - P2);
  } else {
    v.push(z - k, y - P2, off > 0 ? off + l : off + k, y - P2);
  }
  return v;
}

/** Ts.a(I): top-edge reflection with notch. */
function topReflection(z: number, A: number) {
  const { k, P, o, p, h, q, r } = G;
  const P2 = P / 2;
  return [P2, A - k, P2, k, P2, k, k, P2, k, P2, o, P2, p, h + P2, q, h + P2, q, h + P2, r, P2, r, P2, z - k, P2];
}

/** Ts.c(II): arm top reflection. */
function armReflection(z: number, y: number) {
  const P2 = G.P / 2;
  return [G.j + G.l, y + P2, z - G.k, y + P2];
}

/** Ts.a(II): inner left side shadow of an arm. */
function armSideShadow(y1: number, y2: number) {
  const { j, l, P } = G;
  const P2 = P / 2;
  return [j + l, y1 - P2, j - P2, y1 + l, j - P2, y1 + l, j - P2, y2 - l];
}

export interface ShadowPaths {
  shadow: string;
  light: string;
}

/** Shadow (dark, bottom/right) + reflection (light, top/left) strokes. */
export function blockShading(sh: ShapeInfo): ShadowPaths {
  const { d, z, A, B, C } = sh;
  const { P, h, m, n, j } = G;
  const P2 = P / 2;
  let shadow: number[] = [];
  let light: number[] = [];
  switch (d) {
    case 1:
      shadow = [z - P2, 0, z - P2, A - P2, z - P2, A - P2, 0, A - P2];
      light = [0, P2, z - P2, P2, P2, 0, P2, A - P2];
      break;
    case 2: {
      const a2 = A / 2;
      shadow = [z - P2, a2, z - a2, A - P2, z - a2, A - P2, a2, A - P2];
      light = [P2, a2, a2, P2, a2, P2, z - a2, P2];
      break;
    }
    case 3: {
      const a2 = A / 2;
      shadow = [z - a2, A - P2, a2, A - P2];
      light = [a2, P2, z - a2, P2];
      break;
    }
    case 4:
    case 5:
      shadow = [...rightEdgeShadow(z, 0, A), ...bottomShadow(z, A, d !== 5, 0)];
      light = topReflection(z, A);
      break;
    case 7:
      shadow = [...rightEdgeShadow(z, G.s, A), ...bottomShadow(z, A, true, 0)];
      break;
    case 10: {
      const v3 = A + B - h;
      shadow = [...rightEdgeShadow(z, 0, A), ...bottomShadow(z, A, true, j), ...armSideShadow(A, v3), ...rightEdgeShadow(z, v3, m + v3), ...bottomShadow(z, m + v3, true, 0)];
      light = [...topReflection(z, A), ...armReflection(z, v3)];
      break;
    }
    case 12: {
      const v3 = A + B - h;
      const v5 = n + v3 + C - h;
      shadow = [
        ...rightEdgeShadow(z, 0, A),
        ...bottomShadow(z, A, true, j),
        ...armSideShadow(A, v3),
        ...rightEdgeShadow(z, v3, n + v3),
        ...bottomShadow(z, n + v3, true, j),
        ...armSideShadow(n + v3, v5),
        ...rightEdgeShadow(z, v5, m + v5),
        ...bottomShadow(z, m + v5, true, 0),
      ];
      light = [...topReflection(z, A), ...armReflection(z, v3), ...armReflection(z, v5)];
      break;
    }
  }
  let extraShadow = '';
  let extraLight = '';
  if (d === 3) {
    // the arcs at both ends
    const a2 = A / 2;
    extraShadow = `M${z - a2 + a2 * Math.cos(-Math.PI / 6)} ${a2 + a2 * Math.sin(-Math.PI / 6)} A${a2 - P2} ${a2 - P2} 0 0 1 ${z - a2} ${A - P2} M${a2} ${A - P2} A${a2 - P2} ${a2 - P2} 0 0 1 ${a2 - a2 * Math.sin(Math.PI / 6)} ${a2 + a2 * Math.cos(Math.PI / 6)}`;
    extraLight = `M${a2 - a2 * Math.cos(Math.PI / 6)} ${a2 + a2 * Math.sin(Math.PI / 6)} A${a2 - P2} ${a2 - P2} 0 0 1 ${a2} ${P2} M${z - a2} ${P2} A${a2 - P2} ${a2 - P2} 0 0 1 ${z - a2 + a2 * Math.sin(Math.PI / 6)} ${a2 - a2 * Math.cos(Math.PI / 6)}`;
  }
  return { shadow: pairsToPath(shadow) + extraShadow, light: pairsToPath(light) + extraLight };
}

/** Dropdown arrow of a menu input (Ts.c(Canvas)). */
export function menuArrowPath(z: number): string {
  const { J, I } = G;
  return `M${z - J} ${J} L${z - J - I / 2} ${J + I} L${z - J - I} ${J} Z`;
}

/** ARGB int -> css color. */
export function argb(c: number): string {
  const a = ((c >>> 24) & 0xff) / 255;
  const r = (c >>> 16) & 0xff;
  const g = (c >>> 8) & 0xff;
  const b = c & 0xff;
  return a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a.toFixed(3)})`;
}
