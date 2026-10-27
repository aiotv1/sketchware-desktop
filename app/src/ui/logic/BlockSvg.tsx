// SVG rendering of block trees (shapes from geometry.ts; layout from blockmodel.ts).
import React from 'react';
import { LNode, LArg } from '../../blocks/blockmodel';
import { G, argb, blockPath, blockShading, menuArrowPath, fontCss, hasSub1, hasSub2 } from '../../blocks/geometry';

const LABEL_FONT = { fontFamily: "Roboto, 'Segoe UI', Arial, sans-serif" };

function ArgSlot({ a, nodeId, index }: { a: LArg; nodeId: number; index: number }) {
  const h = G.LABEL_H;
  const w = a.w;
  let shape: React.ReactNode;
  let text: React.ReactNode = null;
  const cy = h / 2;
  switch (a.argType) {
    case 'b': {
      const h2 = h / 2;
      shape = <path d={`M${h2} ${h} L0 ${h2} L${h2} 0 L${w - h2} 0 L${w} ${h2} L${w - h2} ${h} Z`} fill="rgba(0,0,0,0.31)" />;
      break;
    }
    case 'd':
    case 'n': {
      const r = h / 2;
      shape = <rect x={0} y={0} width={w} height={h} rx={r} ry={r} fill={a.argType === 'd' ? '#F5F5F5' : '#CFD8DC'} />;
      text = (
        <text x={2 + a.textW / 2} y={cy} fill="rgba(0,0,0,0.94)" fontSize={9} textAnchor="middle" dominantBaseline="central" style={LABEL_FONT}>
          {a.value}
        </text>
      );
      break;
    }
    case 's':
      shape = <rect x={0} y={0} width={w} height={h} fill="#FFFFFF" />;
      text = (
        <text x={2 + a.textW / 2} y={cy} fill="rgba(0,0,0,0.94)" fontSize={9} textAnchor="middle" dominantBaseline="central" style={{ ...LABEL_FONT, whiteSpace: 'pre' }}>
          {a.value}
        </text>
      );
      break;
    case 'm':
      shape = (
        <>
          <rect x={0} y={0} width={w} height={h} fill="rgba(0,0,0,0.19)" />
          <path d={menuArrowPath(w)} fill="rgba(0,0,0,0.88)" />
        </>
      );
      text = (
        <>
          {a.prefix && (
            <text x={2} y={cy} fill="#fff" fontSize={8} fontWeight="bold" dominantBaseline="central" style={LABEL_FONT}>
              {a.prefix}
            </text>
          )}
          <text x={a.prefixW + a.textW / 2} y={cy} fill="rgba(255,255,255,0.94)" fontSize={9} textAnchor="middle" dominantBaseline="central" style={LABEL_FONT}>
            {a.value}
          </text>
        </>
      );
      break;
  }
  return (
    <g transform={`translate(${a.x},${a.y})`} data-nid={nodeId} data-arg={index} className="sw-arg">
      {shape}
      {text}
    </g>
  );
}

/** Draws one block (not its children) at its absolute position. */
function BlockBody({ n, ghost }: { n: LNode; ghost?: boolean }) {
  const sh = { d: n.style.d, z: n.z, A: n.A, B: n.B, C: n.C };
  const path = blockPath(sh);
  const shading = ghost ? null : blockShading(sh);
  const fill = ghost ? 'rgba(0,0,0,0.25)' : argb(n.color);
  return (
    <g transform={`translate(${n.x},${n.y})`} data-nid={n.id} className="sw-block">
      <path d={path} fill={fill} />
      {shading && (
        <>
          <path d={shading.shadow} stroke="rgba(0,0,0,0.63)" strokeWidth={G.P} fill="none" />
          <path d={shading.light} stroke="rgba(255,255,255,0.63)" strokeWidth={G.P} fill="none" />
        </>
      )}
      {!ghost &&
        n.parts.map((p, i) =>
          p.kind === 'label' ? (
            <text
              key={i}
              x={p.label.x}
              y={p.label.y + G.LABEL_H / 2}
              fill="#fff"
              fontSize={10}
              fontWeight="bold"
              dominantBaseline="central"
              style={{ ...LABEL_FONT, whiteSpace: 'pre' }}
            >
              {p.label.text}
            </text>
          ) : p.arg.block ? null : (
            <ArgSlot key={i} a={p.arg} nodeId={n.id} index={n.args.indexOf(p.arg)} />
          ),
        )}
      {!ghost && n.elseLabel && (
        <text x={n.elseLabel.x} y={n.elseLabel.y + G.LABEL_H / 2} fill="#fff" fontSize={10} fontWeight="bold" dominantBaseline="central" style={LABEL_FONT}>
          {n.elseLabel.text}
        </text>
      )}
    </g>
  );
}

/** A block, its inputs, substacks and following blocks (Rs z-order: parent first). */
export function StackSvg({ top, highlight }: { top: LNode; highlight?: number | null }) {
  const out: React.ReactNode[] = [];
  const walk = (n: LNode | null) => {
    while (n) {
      out.push(<BlockBody key={'b' + n.id + '_' + out.length} n={n} />);
      if (highlight === n.id) {
        out.push(
          <path
            key={'h' + n.id}
            transform={`translate(${n.x},${n.y})`}
            d={blockPath({ d: n.style.d, z: n.z, A: n.A, B: n.B, C: n.C })}
            fill="none"
            stroke="#ffd54f"
            strokeWidth={1.5}
            pointerEvents="none"
          />,
        );
      }
      for (const a of n.args) if (a.block) walk(a.block);
      if (hasSub1(n.style.d) && n.sub1) walk(n.sub1);
      if (hasSub2(n.style.d) && n.sub2) walk(n.sub2);
      n = n.next;
    }
  };
  walk(top);
  return <>{out}</>;
}

/** Translucent preview where a dragged stack would land. */
export function GhostSvg({ node, x, y }: { node: LNode; x: number; y: number }) {
  const sh = { d: node.style.d, z: node.z, A: node.A, B: node.B, C: node.C };
  return <path transform={`translate(${x},${y})`} d={blockPath(sh)} fill="rgba(0,0,0,0.22)" stroke="rgba(255,255,255,0.6)" strokeWidth={0.8} pointerEvents="none" />;
}

export { fontCss };
