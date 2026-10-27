// Renders one block from its spec/type/color, as in the Block manager and "See custom blocks" lists.
import React from 'react';
import { LNode, layoutTop } from '../../blocks/blockmodel';
import { StackSvg } from './BlockSvg';

export function parseBlockColor(c: any): number {
  if (typeof c === 'number') return c | 0;
  const s = String(c ?? '').trim();
  const m = s.match(/^#?([0-9a-fA-F]{6,8})$/);
  if (m) return (m[1].length === 6 ? 0xff000000 | parseInt(m[1], 16) : parseInt(m[1], 16)) | 0;
  if (/^-?\d+$/.test(s)) return Number(s) | 0;
  return 0xff8a55d7 | 0;
}

export function BlockPreview(props: { spec: string; type: string; typeName?: string; color: any; spec2?: string; scale?: number; maxWidth?: number }) {
  const type = !props.type || props.type === 'regular' ? ' ' : props.type;
  let n: LNode;
  try {
    n = new LNode(1, 'preview', type, props.typeName ?? '', props.spec || ' ', parseBlockColor(props.color), props.spec2 ?? '');
    const top = type === 'h' ? 16 : 2;
    n.x = 2;
    n.y = top;
    layoutTop(n);
    const s = props.scale ?? 1.25;
    const w = (n.z + 6) * s;
    const h = (n.totalH + top + 4) * s;
    return (
      <svg width={props.maxWidth ? Math.min(w, props.maxWidth) : w} height={h} viewBox={`0 0 ${n.z + 6} ${n.totalH + top + 4}`} preserveAspectRatio="xMinYMin meet" style={{ display: 'block', flexShrink: 0 }}>
        <StackSvg top={n} />
      </svg>
    );
  } catch {
    return <span className="muted small">(invalid block spec)</span>;
  }
}
