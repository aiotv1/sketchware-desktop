// Color picker in the spirit of Sketchware's ColorPickerDialog (material palette + custom hex).
import React, { useState } from 'react';
import { Modal } from './dialogs';

const MATERIAL: string[][] = [
  ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'],
  ['#FCE4EC', '#F8BBD0', '#F48FB1', '#F06292', '#EC407A', '#E91E63', '#D81B60', '#C2185B', '#AD1457', '#880E4F'],
  ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C'],
  ['#EDE7F6', '#D1C4E9', '#B39DDB', '#9575CD', '#7E57C2', '#673AB7', '#5E35B1', '#512DA8', '#4527A0', '#311B92'],
  ['#E8EAF6', '#C5CAE9', '#9FA8DA', '#7986CB', '#5C6BC0', '#3F51B5', '#3949AB', '#303F9F', '#283593', '#1A237E'],
  ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'],
  ['#E1F5FE', '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6', '#03A9F4', '#039BE5', '#0288D1', '#0277BD', '#01579B'],
  ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA', '#00BCD4', '#00ACC1', '#0097A7', '#00838F', '#006064'],
  ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A', '#009688', '#00897B', '#00796B', '#00695C', '#004D40'],
  ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'],
  ['#F1F8E9', '#DCEDC8', '#C5E1A5', '#AED581', '#9CCC65', '#8BC34A', '#7CB342', '#689F38', '#558B2F', '#33691E'],
  ['#F9FBE7', '#F0F4C3', '#E6EE9C', '#DCE775', '#D4E157', '#CDDC39', '#C0CA33', '#AFB42B', '#9E9D24', '#827717'],
  ['#FFFDE7', '#FFF9C4', '#FFF59D', '#FFF176', '#FFEE58', '#FFEB3B', '#FDD835', '#FBC02D', '#F9A825', '#F57F17'],
  ['#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FF6F00'],
  ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100'],
  ['#FBE9E7', '#FFCCBC', '#FFAB91', '#FF8A65', '#FF7043', '#FF5722', '#F4511E', '#E64A19', '#D84315', '#BF360C'],
  ['#EFEBE9', '#D7CCC8', '#BCAAA4', '#A1887F', '#8D6E63', '#795548', '#6D4C41', '#5D4037', '#4E342E', '#3E2723'],
  ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121'],
  ['#ECEFF1', '#CFD8DC', '#B0BEC5', '#90A4AE', '#78909C', '#607D8B', '#546E7A', '#455A64', '#37474F', '#263238'],
  ['#FFFFFF', '#000000'],
];

/** "0xFF2196F3" / "#2196F3" / int -> "#AARRGGBB" */
export function normalizeColor(v: any): string | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return '#' + (v >>> 0).toString(16).padStart(8, '0').toUpperCase();
  let s = String(v).trim();
  if (s === 'Color.TRANSPARENT') return '#00000000';
  if (s.startsWith('0x') || s.startsWith('0X')) s = '#' + s.substring(2);
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return '#FF' + s.substring(1).toUpperCase();
  if (/^#[0-9a-fA-F]{8}$/.test(s)) return s.toUpperCase();
  return null;
}

export function colorToCss(argbHex: string): string {
  const a = parseInt(argbHex.substring(1, 3), 16) / 255;
  return `rgba(${parseInt(argbHex.substring(3, 5), 16)},${parseInt(argbHex.substring(5, 7), 16)},${parseInt(argbHex.substring(7, 9), 16)},${a.toFixed(3)})`;
}

export function ColorPicker(props: {
  initial: any;
  allowTransparent?: boolean;
  /** block value format: "0xFFRRGGBB" or "Color.TRANSPARENT" */
  onPick: (blockValue: string, argbInt: number) => void;
  onClose: () => void;
}) {
  const [hex, setHex] = useState(normalizeColor(props.initial) ?? '#FF2196F3');
  const valid = /^#[0-9A-F]{8}$/i.test(hex);
  const pick = (h: string) => {
    const n = parseInt(h.substring(1), 16) | 0;
    props.onPick(n === 0 ? 'Color.TRANSPARENT' : '0x' + h.substring(1).toUpperCase(), n);
  };
  return (
    <Modal
      title="Select a color"
      onClose={props.onClose}
      width={520}
      footer={
        <>
          {props.allowTransparent && <button onClick={() => pick('#00000000')}>Transparent</button>}
          <div className="grow" />
          <button onClick={props.onClose}>Cancel</button>
          <button className="primary" disabled={!valid} onClick={() => pick(hex.toUpperCase())}>
            Select
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3, marginBottom: 12 }}>
        {MATERIAL.flat().map((c) => (
          <div
            key={c}
            title={c}
            onClick={() => setHex('#FF' + c.substring(1))}
            onDoubleClick={() => pick('#FF' + c.substring(1))}
            style={{ height: 22, background: c, borderRadius: 3, cursor: 'pointer', outline: hex.toUpperCase() === '#FF' + c.substring(1) ? '2px solid #fff' : 'none' }}
          />
        ))}
      </div>
      <div className="row">
        <div style={{ width: 40, height: 32, borderRadius: 6, background: valid ? colorToCss(hex) : '#000', border: '1px solid var(--line)' }} />
        <input className="mono grow" value={hex} onChange={(e) => setHex(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)} />
        <input type="color" value={'#' + hex.substring(3, 9)} onChange={(e) => setHex('#' + hex.substring(1, 3) + e.target.value.substring(1).toUpperCase())} />
      </div>
      <div className="muted small" style={{ marginTop: 6 }}>
        Format #AARRGGBB · double-click a swatch to pick it directly
      </div>
    </Modal>
  );
}
