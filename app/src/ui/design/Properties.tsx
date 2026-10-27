// Property panel for the selected view (com.besome.sketch.editor.property.ViewPropertyItems).
import React from 'react';
import { ViewBean, TextBean } from '../../core/beans';
import { ProjectStore } from '../editor/store';
import { mount, choiceDialog, promptDialog } from '../common/dialogs';
import { ColorPicker, normalizeColor, colorToCss } from '../common/ColorPicker';
import { fileUrl } from '../common/fileurl';
import { LAYOUT_TYPES } from './widgets';
import { viewTypeName } from '../../sw/viewtypes';

const TEXT_TYPES = new Set([3, 4, 5, 11, 13, 19, 23, 24, 29, 33, 41, 22, 35]);
const EDIT_TYPES = new Set([5, 23, 24, 22]);
const IMAGE_TYPES = new Set([6, 43]);
const LIST_TYPES = new Set([9, 10, 25, 48, 31]);

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="prop-row">
      <label>{props.label}</label>
      <div className="prop-val">{props.children}</div>
    </div>
  );
}

function NumberInput(props: { value: number; onChange: (v: number) => void; step?: number; min?: number }) {
  return (
    <input
      type="number"
      value={Number.isFinite(props.value) ? props.value : 0}
      step={props.step ?? 1}
      min={props.min}
      onChange={(e) => {
        const n = parseFloat(e.target.value);
        if (!isNaN(n)) props.onChange(n);
      }}
    />
  );
}

function Size(props: { value: number; onChange: (v: number) => void }) {
  const mode = props.value === -1 ? 'match' : props.value === -2 ? 'wrap' : 'dp';
  return (
    <div className="row" style={{ gap: 4 }}>
      <select value={mode} onChange={(e) => props.onChange(e.target.value === 'match' ? -1 : e.target.value === 'wrap' ? -2 : 100)}>
        <option value="match">match_parent</option>
        <option value="wrap">wrap_content</option>
        <option value="dp">fixed (dp)</option>
      </select>
      {mode === 'dp' && <NumberInput value={props.value} min={0} onChange={props.onChange} />}
    </div>
  );
}

const DEFAULT_COLOR = 0xffffff;

function ColorField(props: { value: number; onChange: (v: number) => void; allowTransparent?: boolean }) {
  const hex = normalizeColor(props.value) ?? '#00000000';
  return (
    <div
      className="color-field"
      onClick={() =>
        mount((close) => (
          <ColorPicker
            initial={props.value}
            allowTransparent={props.allowTransparent}
            onClose={close}
            onPick={(_s, n) => {
              close();
              props.onChange(n);
            }}
          />
        ))
      }
    >
      {/* 0xffffff is Sketchware's "not set": the attribute is left out of the XML */}
      <span style={{ background: props.value === DEFAULT_COLOR ? 'transparent' : colorToCss(hex), borderStyle: props.value === DEFAULT_COLOR ? 'dashed' : undefined }} />
      {props.value === DEFAULT_COLOR ? 'default' : hex.substring(3) === '000000' && hex.substring(1, 3) === '00' ? 'transparent' : hex}
      {props.value !== DEFAULT_COLOR && (
        <button
          className="ghost icon"
          style={{ marginLeft: 'auto', padding: '0 4px' }}
          title="Reset to default"
          onClick={(e) => {
            e.stopPropagation();
            props.onChange(DEFAULT_COLOR);
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

const GRAVITY_FLAGS = [
  ['left', 3],
  ['center_horizontal', 1],
  ['right', 5],
  ['top', 48],
  ['center_vertical', 16],
  ['bottom', 80],
] as const;

function Gravity(props: { value: number; onChange: (v: number) => void }) {
  const v = props.value;
  const hz = v & 7;
  const vt = v & 112;
  return (
    <div className="grav-grid">
      {GRAVITY_FLAGS.map(([name, f]) => {
        const on = f <= 5 ? hz === f : vt === f;
        return (
          <button
            key={name}
            className={on ? 'on' : ''}
            onClick={() => {
              if (f <= 5) props.onChange((v & ~7) | (on ? 0 : f));
              else props.onChange((v & ~112) | (on ? 0 : f));
            }}
          >
            {name.replace('center_', 'c_')}
          </button>
        );
      })}
    </div>
  );
}

function Quad(props: { values: number[]; onChange: (i: number, v: number) => void }) {
  return (
    <div className="quad">
      {['L', 'T', 'R', 'B'].map((n, i) => (
        <span key={n}>
          {n}
          <NumberInput value={props.values[i]} onChange={(v) => props.onChange(i, v)} />
        </span>
      ))}
    </div>
  );
}

export function Properties(props: { store: ProjectStore; view: ViewBean; xmlName: string; onRename: (oldId: string, newId: string) => string | null }) {
  const { store, view: v } = props;
  const p = store.project;
  const ch = (f: () => void) => {
    f();
    store.changed();
    store.recordViews(props.xmlName);
  };
  const L = v.layout;
  const T = v.text;
  const isText = TEXT_TYPES.has(v.type);
  const pickImage = async (current: string | null, withNone: boolean) => {
    const opts = [
      ...(withNone ? [{ label: 'NONE', value: 'NONE' }] : [{ label: 'default_image', value: 'default_image' }]),
      ...p.images.map((im) => ({
        label: (
          <span className="row">
            <img src={fileUrl(store.imagePath(im.resName))} style={{ width: 28, height: 28, objectFit: 'contain' }} />
            {im.resName}
          </span>
        ),
        value: im.resName,
      })),
    ];
    return choiceDialog('Select an image', opts as any, current ?? undefined);
  };
  return (
    <div className="props">
      <div className="props-head">
        <div className="title">{v.id}</div>
        <div className="muted small">{v.convert ? v.convert : viewTypeName(v.type)}</div>
      </div>
      <Row label="id">
        <input
          key={v.id}
          defaultValue={v.id}
          onBlur={(e) => {
            const nv = e.target.value.trim();
            if (nv === v.id) return;
            const err = props.onRename(v.id, nv);
            if (err) {
              e.target.value = v.id;
              alert(err);
            }
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        />
      </Row>
      <div className="props-sec">Layout</div>
      <Row label="layout_width">
        <Size value={L.width} onChange={(x) => ch(() => (L.width = x))} />
      </Row>
      <Row label="layout_height">
        <Size value={L.height} onChange={(x) => ch(() => (L.height = x))} />
      </Row>
      <Row label="padding">
        <Quad values={[L.paddingLeft, L.paddingTop, L.paddingRight, L.paddingBottom]} onChange={(i, x) => ch(() => ((L as any)[['paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'][i]] = x))} />
      </Row>
      <Row label="margin">
        <Quad values={[L.marginLeft, L.marginTop, L.marginRight, L.marginBottom]} onChange={(i, x) => ch(() => ((L as any)[['marginLeft', 'marginTop', 'marginRight', 'marginBottom'][i]] = x))} />
      </Row>
      {(LAYOUT_TYPES.has(v.type) || isText) && (
        <Row label="gravity">
          <Gravity value={L.gravity} onChange={(x) => ch(() => (L.gravity = x))} />
        </Row>
      )}
      <Row label="layout_gravity">
        <Gravity value={L.layoutGravity} onChange={(x) => ch(() => (L.layoutGravity = x))} />
      </Row>
      <Row label="weight">
        <NumberInput value={L.weight} min={0} onChange={(x) => ch(() => (L.weight = x))} />
      </Row>
      {(v.type === 0 || v.type === 40 || v.type === 36 || v.type === 37 || v.type === 38 || v.type === 39) && (
        <>
          <Row label="orientation">
            <select value={L.orientation} onChange={(e) => ch(() => (L.orientation = parseInt(e.target.value, 10)))}>
              <option value={-1}>none</option>
              <option value={0}>horizontal</option>
              <option value={1}>vertical</option>
            </select>
          </Row>
          <Row label="weightSum">
            <NumberInput value={L.weightSum} min={0} onChange={(x) => ch(() => (L.weightSum = x))} />
          </Row>
        </>
      )}
      <div className="props-sec">Appearance</div>
      <Row label="background color">
        <ColorField value={L.backgroundColor} allowTransparent onChange={(x) => ch(() => (L.backgroundColor = x))} />
      </Row>
      <Row label="background image">
        <button
          onClick={async () => {
            const r = await pickImage(L.backgroundResource, true);
            if (r != null) ch(() => (L.backgroundResource = r === 'NONE' ? null : r));
          }}
        >
          {L.backgroundResource ?? 'NONE'}
        </button>
      </Row>
      {isText && (
        <>
          <div className="props-sec">Text</div>
          <Row label="text">
            <textarea rows={2} value={T.text} onChange={(e) => ch(() => (T.text = e.target.value))} />
          </Row>
          <Row label="textSize (sp)">
            <NumberInput value={T.textSize} min={1} onChange={(x) => ch(() => (T.textSize = x))} />
          </Row>
          <Row label="textColor">
            <ColorField value={T.textColor} onChange={(x) => ch(() => (T.textColor = x))} />
          </Row>
          <Row label="textStyle">
            <select value={T.textType} onChange={(e) => ch(() => (T.textType = parseInt(e.target.value, 10)))}>
              <option value={0}>normal</option>
              <option value={1}>bold</option>
              <option value={2}>italic</option>
              <option value={3}>bold|italic</option>
            </select>
          </Row>
          <Row label="textFont">
            <select value={T.textFont} onChange={(e) => ch(() => (T.textFont = e.target.value))}>
              <option value="default_font">default_font</option>
              {p.fonts.map((f) => (
                <option key={f.resName}>{f.resName}</option>
              ))}
            </select>
          </Row>
          <Row label="singleLine">
            <input type="checkbox" checked={!!T.singleLine} onChange={(e) => ch(() => (T.singleLine = e.target.checked ? 1 : 0))} />
          </Row>
          <Row label="lines">
            <NumberInput value={T.line} min={0} onChange={(x) => ch(() => (T.line = x))} />
          </Row>
          {EDIT_TYPES.has(v.type) && (
            <>
              <Row label="hint">
                <input value={T.hint} onChange={(e) => ch(() => (T.hint = e.target.value))} />
              </Row>
              <Row label="hintColor">
                <ColorField value={T.hintColor} onChange={(x) => ch(() => (T.hintColor = x))} />
              </Row>
              <Row label="inputType">
                <select value={T.inputType} onChange={(e) => ch(() => (T.inputType = parseInt(e.target.value, 10)))}>
                  <option value={TextBean.INPUT_TYPE_TEXT}>text</option>
                  <option value={TextBean.INPUT_TYPE_NUMBER_DECIMAL}>numberDecimal</option>
                  <option value={TextBean.INPUT_TYPE_NUMBER_SIGNED}>numberSigned</option>
                  <option value={TextBean.INPUT_TYPE_NUMBER_SIGNED_DECIMAL}>numberSigned|numberDecimal</option>
                  <option value={TextBean.INPUT_TYPE_PASSWORD}>textPassword</option>
                  <option value={TextBean.INPUT_TYPE_PHONE}>phone</option>
                </select>
              </Row>
              <Row label="imeOptions">
                <select value={T.imeOption} onChange={(e) => ch(() => (T.imeOption = parseInt(e.target.value, 10)))}>
                  {[
                    ['normal', 0],
                    ['actionNone', 1],
                    ['actionGo', 2],
                    ['actionSearch', 3],
                    ['actionSend', 4],
                    ['actionNext', 5],
                    ['actionDone', 6],
                  ].map(([n, x]) => (
                    <option key={n} value={x}>
                      {n}
                    </option>
                  ))}
                </select>
              </Row>
            </>
          )}
        </>
      )}
      {IMAGE_TYPES.has(v.type) && (
        <>
          <div className="props-sec">Image</div>
          <Row label="image">
            <button
              onClick={async () => {
                const r = await pickImage(v.image.resName, false);
                if (r != null) ch(() => (v.image.resName = r));
              }}
            >
              {v.image.resName ?? '(none)'}
            </button>
          </Row>
          <Row label="scaleType">
            <select value={v.image.scaleType} onChange={(e) => ch(() => (v.image.scaleType = e.target.value))}>
              {['CENTER', 'CENTER_CROP', 'CENTER_INSIDE', 'FIT_CENTER', 'FIT_END', 'FIT_START', 'FIT_XY'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Row>
        </>
      )}
      {(v.type === 11 || v.type === 13 || v.type === 19) && (
        <Row label="checked">
          <input type="checkbox" checked={!!v.checked} onChange={(e) => ch(() => (v.checked = e.target.checked ? 1 : 0))} />
        </Row>
      )}
      {(v.type === 14 || v.type === 8) && (
        <>
          <Row label="max">
            <NumberInput value={v.max} onChange={(x) => ch(() => (v.max = x))} />
          </Row>
          <Row label="progress">
            <NumberInput value={v.progress} onChange={(x) => ch(() => (v.progress = x))} />
          </Row>
        </>
      )}
      {v.type === 8 && (
        <>
          <Row label="style">
            <select value={v.progressStyle} onChange={(e) => ch(() => (v.progressStyle = e.target.value))}>
              <option value={ViewBean.PROGRESSBAR_STYLE_CIRCLE}>circle</option>
              <option value={ViewBean.PROGRESSBAR_STYLE_HORIZONTAL}>horizontal</option>
            </select>
          </Row>
          <Row label="indeterminate">
            <input type="checkbox" checked={v.indeterminate === 'true'} onChange={(e) => ch(() => (v.indeterminate = e.target.checked ? 'true' : 'false'))} />
          </Row>
        </>
      )}
      {LIST_TYPES.has(v.type) && (
        <>
          <div className="props-sec">List</div>
          <Row label="customView">
            <select value={v.customView || ''} onChange={(e) => ch(() => (v.customView = e.target.value))}>
              <option value="">none</option>
              {p.customViews.map((c) => (
                <option key={c.fileName}>{c.fileName}</option>
              ))}
            </select>
          </Row>
          {v.type === 9 && (
            <>
              <Row label="dividerHeight">
                <NumberInput value={v.dividerHeight} min={0} onChange={(x) => ch(() => (v.dividerHeight = x))} />
              </Row>
              <Row label="choiceMode">
                <select value={v.choiceMode} onChange={(e) => ch(() => (v.choiceMode = parseInt(e.target.value, 10)))}>
                  <option value={0}>none</option>
                  <option value={1}>single</option>
                  <option value={2}>multiple</option>
                </select>
              </Row>
            </>
          )}
          {v.type === 10 && (
            <Row label="spinnerMode">
              <select value={v.spinnerMode} onChange={(e) => ch(() => (v.spinnerMode = parseInt(e.target.value, 10)))}>
                <option value={0}>dialog</option>
                <option value={1}>dropdown</option>
              </select>
            </Row>
          )}
        </>
      )}
      {v.type === 15 && (
        <Row label="firstDayOfWeek">
          <NumberInput value={v.firstDayOfWeek} min={1} onChange={(x) => ch(() => (v.firstDayOfWeek = x))} />
        </Row>
      )}
      {v.type === 17 && (
        <>
          <Row label="adSize">
            <select value={v.adSize} onChange={(e) => ch(() => (v.adSize = e.target.value))}>
              {['BANNER', 'LARGE_BANNER', 'MEDIUM_RECTANGLE', 'FULL_BANNER', 'LEADERBOARD', 'SMART_BANNER'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Row>
          <Row label="adUnitId">
            <input value={v.adUnitId} onChange={(e) => ch(() => (v.adUnitId = e.target.value))} />
          </Row>
        </>
      )}
      <div className="props-sec">State & transform</div>
      <Row label="enabled">
        <input type="checkbox" checked={!!v.enabled} onChange={(e) => ch(() => (v.enabled = e.target.checked ? 1 : 0))} />
      </Row>
      <Row label="clickable">
        <input type="checkbox" checked={!!v.clickable} onChange={(e) => ch(() => (v.clickable = e.target.checked ? 1 : 0))} />
      </Row>
      <Row label="alpha">
        <NumberInput value={v.alpha} step={0.1} min={0} onChange={(x) => ch(() => (v.alpha = x))} />
      </Row>
      <Row label="translation X/Y">
        <div className="row" style={{ gap: 4 }}>
          <NumberInput value={v.translationX} onChange={(x) => ch(() => (v.translationX = x))} />
          <NumberInput value={v.translationY} onChange={(x) => ch(() => (v.translationY = x))} />
        </div>
      </Row>
      <Row label="scale X/Y">
        <div className="row" style={{ gap: 4 }}>
          <NumberInput value={v.scaleX} step={0.1} onChange={(x) => ch(() => (v.scaleX = x))} />
          <NumberInput value={v.scaleY} step={0.1} onChange={(x) => ch(() => (v.scaleY = x))} />
        </div>
      </Row>
      <div className="props-sec">Advanced (Sketchware Pro)</div>
      <Row label="convert (class)">
        <input value={v.convert} placeholder="e.g. com.google.android.material.button.MaterialButton" onChange={(e) => ch(() => (v.convert = e.target.value))} />
      </Row>
      <Row label="inject (XML attributes)">
        <button
          onClick={async () => {
            const r = await promptDialog('Inject XML attributes', v.inject, { multiline: true, mono: true, placeholder: 'app:cornerRadius="8dp"' });
            if (r != null) ch(() => (v.inject = r));
          }}
        >
          {v.inject ? v.inject.split('\n').length + ' line(s)…' : 'Edit…'}
        </button>
      </Row>
    </div>
  );
}
