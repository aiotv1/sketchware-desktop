// Renders Sketchware ViewBeans approximately like Android would (LinearLayout -> flexbox etc.).
import React from 'react';
import { ViewBean } from '../../core/beans';
import { LAYOUT_TYPES } from './widgets';
import { fileUrl } from '../common/fileurl';

export interface PreviewCtx {
  imageUrl: (name: string) => string | null;
  fontFamily: (name: string) => string | null;
  selected: string | null;
  dropTarget: { parent: string; index: number } | null;
  accent: string;
  primary: string;
}

const argbCss = (c: number) => {
  const a = ((c >>> 24) & 0xff) / 255;
  return `rgba(${(c >>> 16) & 0xff},${(c >>> 8) & 0xff},${c & 0xff},${a.toFixed(3)})`;
};
const alphaOf = (c: number) => (c >>> 24) & 0xff;

export function childrenOf(views: ViewBean[], parent: string): ViewBean[] {
  return views.filter((v) => v.parent === parent).sort((a, b) => a.index - b.index);
}

function dimension(v: number, parentHorizontal: boolean | null, axis: 'w' | 'h', weight: number): React.CSSProperties {
  const s: React.CSSProperties = {};
  const key = axis === 'w' ? 'width' : 'height';
  if (v === -1) {
    if (parentHorizontal === null) (s as any)[key] = '100%';
    else if ((axis === 'w') === parentHorizontal) {
      s.flexGrow = 1;
      s.flexBasis = 0;
      s.minWidth = 0;
    } else s.alignSelf = 'stretch';
  } else if (v > 0) {
    (s as any)[key] = v + 'px';
    s.flexShrink = 0;
  }
  if (weight > 0 && parentHorizontal !== null) {
    s.flexGrow = weight;
    s.flexBasis = 0;
  }
  return s;
}

function gravityToFlex(g: number, horizontal: boolean): React.CSSProperties {
  const hz = g & 7;
  const vt = g & 112;
  const hv = hz === 1 ? 'center' : hz === 5 ? 'flex-end' : hz === 3 ? 'flex-start' : undefined;
  const vv = vt === 16 ? 'center' : vt === 80 ? 'flex-end' : vt === 48 ? 'flex-start' : undefined;
  // like Android, wrap_content children keep their size on the cross axis (match_parent ones stretch via alignSelf)
  return horizontal ? { justifyContent: hv, alignItems: vv ?? 'flex-start' } : { justifyContent: vv, alignItems: hv ?? 'flex-start' };
}

function layoutGravitySelf(g: number, parentHorizontal: boolean | null): React.CSSProperties {
  if (!g || parentHorizontal === null) return {};
  if (parentHorizontal) {
    const vt = g & 112;
    return { alignSelf: vt === 16 ? 'center' : vt === 80 ? 'flex-end' : vt === 48 ? 'flex-start' : undefined };
  }
  const hz = g & 7;
  return { alignSelf: hz === 1 ? 'center' : hz === 5 ? 'flex-end' : hz === 3 ? 'flex-start' : undefined };
}

function textStyle(v: ViewBean, ctx: PreviewCtx, defColor = '#000'): React.CSSProperties {
  const t = v.text;
  const s: React.CSSProperties = {
    fontSize: t.textSize + 'px',
    color: alphaOf(t.textColor) ? argbCss(t.textColor) : defColor,
    fontWeight: t.textType === 1 || t.textType === 3 ? 'bold' : undefined,
    fontStyle: t.textType === 2 || t.textType === 3 ? 'italic' : undefined,
    whiteSpace: t.singleLine ? 'nowrap' : 'pre-wrap',
    overflow: 'hidden',
    textOverflow: t.singleLine ? 'ellipsis' : undefined,
  };
  if (t.line > 0) {
    s.display = '-webkit-box';
    (s as any).WebkitLineClamp = t.line;
    (s as any).WebkitBoxOrient = 'vertical';
  }
  const ff = t.textFont && t.textFont !== 'default_font' ? ctx.fontFamily(t.textFont) : null;
  if (ff) s.fontFamily = ff;
  return s;
}

export function ViewNode(props: { v: ViewBean; views: ViewBean[]; ctx: PreviewCtx; parentHorizontal: boolean | null }) {
  const { v, views, ctx, parentHorizontal } = props;
  const L = v.layout;
  const isLayout = LAYOUT_TYPES.has(v.type);
  const horizontal = v.type === 2 || ((v.type === 0 || v.type === 40) && L.orientation !== 1) || (v.type !== 0 && v.type !== 40 && L.orientation === 0);
  const style: React.CSSProperties = {
    boxSizing: 'border-box',
    position: 'relative',
    paddingLeft: L.paddingLeft,
    paddingTop: L.paddingTop,
    paddingRight: L.paddingRight,
    paddingBottom: L.paddingBottom,
    marginLeft: L.marginLeft,
    marginTop: L.marginTop,
    marginRight: L.marginRight,
    marginBottom: L.marginBottom,
    opacity: v.alpha,
    transform: v.scaleX !== 1 || v.scaleY !== 1 || v.translationX || v.translationY ? `translate(${v.translationX}px,${v.translationY}px) scale(${v.scaleX},${v.scaleY})` : undefined,
    ...dimension(L.width, parentHorizontal, 'w', L.weight),
    ...dimension(L.height, parentHorizontal, 'h', 0),
    ...layoutGravitySelf(L.layoutGravity, parentHorizontal),
  };
  if (alphaOf(L.backgroundColor)) style.background = argbCss(L.backgroundColor);
  if (L.backgroundResource && L.backgroundResource !== 'NONE') {
    const u = ctx.imageUrl(L.backgroundResource);
    if (u) {
      style.backgroundImage = `url("${u}")`;
      style.backgroundSize = '100% 100%';
    }
  }
  if (L.weight > 0 && parentHorizontal !== null) {
    if (parentHorizontal) style.width = undefined;
    else style.height = undefined;
  }
  const sel = ctx.selected === v.id;
  const cls = 'pv' + (sel ? ' pv-sel' : '') + (isLayout ? ' pv-layout' : '');

  let content: React.ReactNode = null;
  if (isLayout) {
    const kids = childrenOf(views, v.id);
    const flex: React.CSSProperties = { display: 'flex', flexDirection: horizontal ? 'row' : 'column', ...gravityToFlex(L.gravity, horizontal) };
    if (v.type === 2) Object.assign(style, { overflowX: 'auto' });
    if (v.type === 12) Object.assign(style, { overflowY: 'auto' });
    if (v.type === 36) Object.assign(style, { borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.35)', background: style.background ?? '#fff' });
    Object.assign(style, flex);
    if (v.type === 1) Object.assign(style, { display: 'block' });
    const drop = ctx.dropTarget && ctx.dropTarget.parent === v.id ? ctx.dropTarget.index : -1;
    const items: React.ReactNode[] = [];
    kids.forEach((k, i) => {
      if (i === drop) items.push(<DropLine key={'d' + i} horizontal={horizontal} />);
      items.push(<ViewNode key={k.id} v={k} views={views} ctx={ctx} parentHorizontal={v.type === 1 ? null : horizontal} />);
    });
    if (drop >= kids.length) items.push(<DropLine key="dend" horizontal={horizontal} />);
    if (!kids.length) {
      if (L.width === -2 && L.height === -2) Object.assign(style, { minWidth: 40, minHeight: 40 });
      else if (L.height === -2) style.minHeight = 40;
      else if (L.width === -2) style.minWidth = 40;
    }
    content = items;
  } else {
    content = widgetContent(v, ctx, style);
  }
  return (
    <div className={cls} style={style} data-vid={v.id} data-layout={isLayout ? (horizontal ? 'h' : 'v') : undefined}>
      {content}
    </div>
  );
}

function DropLine({ horizontal }: { horizontal: boolean }) {
  return <div className="pv-drop" style={horizontal ? { width: 3, alignSelf: 'stretch', minHeight: 20 } : { height: 3, alignSelf: 'stretch' }} />;
}

function widgetContent(v: ViewBean, ctx: PreviewCtx, style: React.CSSProperties): React.ReactNode {
  const t = v.text;
  const g = v.layout.gravity;
  const textAlign = (g & 7) === 1 ? 'center' : (g & 7) === 5 ? 'right' : undefined;
  switch (v.type) {
    case 4: // TextView
    case 29:
    case 33:
      return <div style={{ ...textStyle(v, ctx), textAlign }}>{t.text}</div>;
    case 3: // Button
    case 41: {
      if (!alphaOf(v.layout.backgroundColor) && !style.backgroundImage) {
        style.background = v.type === 41 ? ctx.primary : '#d6d7d7';
        style.borderRadius = v.type === 41 ? 8 : 2;
        style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)';
      }
      style.display = 'flex';
      style.alignItems = 'center';
      style.justifyContent = (g & 7) === 3 ? 'flex-start' : (g & 7) === 5 ? 'flex-end' : 'center';
      if (v.layout.height === -2) style.minHeight = 36;
      if (v.layout.width === -2) style.minWidth = 64;
      return <span style={{ ...textStyle(v, ctx), textTransform: v.type === 3 ? undefined : undefined }}>{t.text}</span>;
    }
    case 5: // EditText
    case 23:
    case 24: {
      const s = textStyle(v, ctx);
      return (
        <div style={{ borderBottom: '1px solid #888', paddingBottom: 2, minWidth: 60 }}>
          {t.text ? <span style={s}>{t.text}</span> : <span style={{ ...s, color: alphaOf(t.hintColor) ? argbCss(t.hintColor) : '#9e9e9e' }}>{t.hint || ' '}</span>}
        </div>
      );
    }
    case 6:
    case 43: {
      const u = v.image.resName ? ctx.imageUrl(v.image.resName) : null;
      const fit = { CENTER: 'none', CENTER_CROP: 'cover', CENTER_INSIDE: 'contain', FIT_CENTER: 'contain', FIT_END: 'contain', FIT_START: 'contain', FIT_XY: 'fill' }[v.image.scaleType] ?? 'none';
      const w = v.layout.width === -2 ? undefined : '100%';
      const h = v.layout.height === -2 ? undefined : '100%';
      return u ? (
        <img src={u} draggable={false} style={{ width: w, height: h, objectFit: fit as any, display: 'block', borderRadius: v.type === 43 ? '50%' : undefined, transform: v.image.rotate ? `rotate(${v.image.rotate}deg)` : undefined }} />
      ) : (
        <div className="pv-ph" style={{ width: 48, height: 48, borderRadius: v.type === 43 ? '50%' : 4 }}>🖼</div>
      );
    }
    case 11:
    case 19:
    case 13: {
      const on = !!v.checked;
      const box =
        v.type === 13 ? (
          <span className={'pv-switch' + (on ? ' on' : '')} style={on ? { background: ctx.accent + '88' } : undefined}>
            <span style={on ? { background: ctx.accent } : undefined} />
          </span>
        ) : (
          <span className={v.type === 19 ? 'pv-radio' : 'pv-check'} style={on ? { background: ctx.accent, borderColor: ctx.accent } : undefined}>
            {on ? (v.type === 19 ? '•' : '✓') : ''}
          </span>
        );
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: v.type === 13 ? 'row-reverse' : 'row', justifyContent: v.type === 13 ? 'space-between' : undefined }}>
          {box}
          <span style={textStyle(v, ctx)}>{t.text}</span>
        </div>
      );
    }
    case 14: {
      const pct = v.max > 0 ? (v.progress / v.max) * 100 : 0;
      return (
        <div className="pv-seek">
          <div style={{ width: pct + '%', background: ctx.accent }} />
          <span style={{ left: pct + '%', background: ctx.accent }} />
        </div>
      );
    }
    case 8: {
      if (v.progressStyle === '?android:progressBarStyleHorizontal') {
        const pct = v.max > 0 ? (v.progress / v.max) * 100 : 0;
        return (
          <div className="pv-prog">
            <div style={{ width: v.indeterminate === 'true' ? '40%' : pct + '%', background: ctx.accent }} />
          </div>
        );
      }
      return <div className="pv-spin" style={{ borderTopColor: ctx.accent }} />;
    }
    case 20:
      return <div style={{ color: ctx.accent, fontSize: 26, letterSpacing: 2 }}>★★★★★</div>;
    case 10:
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#333', minHeight: 24 }}>
          <span>Spinner</span>
          <span>▾</span>
        </div>
      );
    case 9:
    case 48:
    case 25:
      return (
        <div className="pv-list">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              {v.type === 25 ? 'Grid item ' : 'List item '}
              {i}
              {v.customView ? <span style={{ color: '#888' }}> · {v.customView}</span> : null}
            </div>
          ))}
        </div>
      );
    case 7:
      return <div className="pv-ph">WebView</div>;
    case 15:
    case 27:
      return <div className="pv-ph" style={{ minHeight: 200 }}>📅 {v.type === 15 ? 'CalendarView' : 'DatePicker'}</div>;
    case 28:
    case 26:
      return <div className="pv-ph" style={{ minHeight: 120 }}>🕑 {v.type === 28 ? 'TimePicker' : 'AnalogClock'}</div>;
    case 17:
      return <div className="pv-ph" style={{ height: 50, background: '#fff8dc' }}>Ad · {v.adSize}</div>;
    case 18:
      return <div className="pv-ph" style={{ minHeight: 160, background: '#cfe8cf' }}>🗺 MapView</div>;
    case 22:
      return <div style={{ display: 'flex', gap: 6, color: '#777' }}>⌕ {t.hint}</div>;
    case 30:
      return (
        <div style={{ display: 'flex', color: '#fff', minHeight: 40, alignItems: 'center' }}>
          <span style={{ flex: 1, textAlign: 'center', borderBottom: '3px solid #fff', padding: 8 }}>TAB 1</span>
          <span style={{ flex: 1, textAlign: 'center', padding: 8, opacity: 0.7 }}>TAB 2</span>
        </div>
      );
    case 32:
      return (
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: 8, background: style.background ?? '#fff', color: '#666' }}>
          <span>⌂</span>
          <span>⌕</span>
          <span>☺</span>
        </div>
      );
    default:
      return <div className="pv-ph">{v.convert ? v.convert.split('.').pop() : 'View'}</div>;
  }
}

export { fileUrl, argbCss };
