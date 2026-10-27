// Sketchware Pro's own vector icons (res/drawable/*.xml), converted by scripts/genicons.py.
import React from 'react';
import ICONS from './icons.json';

// a few standard Material icons that Sketchware takes from the platform instead of its drawables
const p = (d: string) => ({ vb: '0 0 24 24', svg: `<path fill="currentColor" d="${d}"/>` });
const EXTRA: Record<string, { vb: string; svg: string }> = {
  x_back: p('M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z'),
  x_copy: p('M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'),
  x_play: p('M8 5v14l11-7z'),
  x_pause: p('M6 19h4V5H6v14zm8-14v14h4V5h-4z'),
  x_trash_restore: p('M19 4h-3.5l-1-1h-5l-1 1H5v2h14zM6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm6 3 4 4h-3v4h-2v-4H8z'),
  x_drop: p('M7 10l5 5 5-5z'),
  x_import: p('M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'),
  x_export: p('M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z'),
  x_menu: p('M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'),
  x_refresh: p('M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'),
  x_chevron: p('M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'),
  x_open: p('M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z'),
  x_restore: p('M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.95 8.95 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z'),
  x_upward: p('M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z'),
  x_downward: p('M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z'),
  x_bug: p('M20 8h-2.81a5.99 5.99 0 0 0-1.82-1.96L17 4.41 15.59 3l-2.17 2.17a6.03 6.03 0 0 0-2.83 0L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81A5.98 5.98 0 0 0 12 21a5.98 5.98 0 0 0 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z'),
  x_clean: p('M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z'),
  x_signature: p('M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z'),
  x_install: p('M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-1-6h-3V8h-2v5H8l4 4 4-4z'),
  x_sun: p('M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM2 13h2a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm18 0h2a1 1 0 0 0 0-2h-2a1 1 0 0 0 0 2zM11 2v2a1 1 0 0 0 2 0V2a1 1 0 0 0-2 0zm0 18v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-2 0zM5.99 4.58a1 1 0 0 0-1.41 1.41l1.06 1.06a1 1 0 0 0 1.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 0 0-1.41 1.41l1.06 1.06a1 1 0 0 0 1.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 0 0-1.41-1.41l-1.06 1.06a1 1 0 0 0 1.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 0 0-1.41-1.41l-1.06 1.06a1 1 0 0 0 1.41 1.41l1.06-1.06z'),
};

const table = { ...(ICONS as Record<string, { vb: string; svg: string }>), ...EXTRA };

export function hasIcon(name: string) {
  return !!table[name];
}

export function Icon(props: { name: string; size?: number; color?: string; className?: string; style?: React.CSSProperties; title?: string }) {
  const ic = table[props.name] ?? table['ic_mtrl_code'];
  const s = props.size ?? 24;
  return (
    <svg
      className={'icon' + (props.className ? ' ' + props.className : '')}
      width={s}
      height={s}
      viewBox={ic.vb}
      style={{ color: props.color, flexShrink: 0, ...props.style }}
      aria-hidden={props.title ? undefined : true}
      dangerouslySetInnerHTML={{ __html: (props.title ? `<title>${props.title}</title>` : '') + ic.svg }}
    />
  );
}
