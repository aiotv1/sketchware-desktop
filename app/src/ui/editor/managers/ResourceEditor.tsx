// Resource Editor (ResourcesEditorActivity): strings / colors / styles / themes / arrays
// in data/<id>/files/resource/<values|values-night>/<kind>.xml
import React, { useEffect, useState } from 'react';
import { ProjectStore } from '../store';
import { Page, ListRow, EmptyState, Tabs, IconButton } from '../../common/m3';
import { Modal, mount, contextMenu, confirmDialog, toast } from '../../common/dialogs';
import { Icon } from '../../icons/Icon';
import { CodePage } from '../CodePage';
import { ColorPicker, normalizeColor, colorToCss } from '../../common/ColorPicker';
import { dataPath, readText, writeText } from './util';

type Kind = 'strings' | 'colors' | 'styles' | 'themes' | 'arrays';
interface Res {
  tag: string; // string, color, style, string-array...
  name: string;
  value: string; // text for string/color
  parent?: string;
  items: { name?: string; value: string }[];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s: string) => esc(s).replace(/"/g, '&quot;');

function parse(xml: string): Res[] {
  if (!xml.trim()) return [];
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Invalid XML');
  const out: Res[] = [];
  const root = doc.documentElement;
  for (const el of Array.from(root.children)) {
    const r: Res = { tag: el.tagName, name: el.getAttribute('name') ?? '', value: '', items: [] };
    if (el.tagName === 'style') {
      r.parent = el.getAttribute('parent') ?? undefined;
      for (const it of Array.from(el.children)) r.items.push({ name: it.getAttribute('name') ?? '', value: it.textContent ?? '' });
    } else if (el.tagName.endsWith('array')) {
      for (const it of Array.from(el.children)) r.items.push({ value: it.textContent ?? '' });
    } else r.value = el.textContent ?? '';
    out.push(r);
  }
  return out;
}

function serialize(list: Res[]): string {
  const lines = ['<?xml version="1.0" encoding="utf-8"?>', '<resources>'];
  for (const r of list) {
    if (r.tag === 'style') {
      lines.push(`    <style name="${escAttr(r.name)}"${r.parent ? ` parent="${escAttr(r.parent)}"` : ''}>`);
      for (const it of r.items) lines.push(`        <item name="${escAttr(it.name ?? '')}">${esc(it.value)}</item>`);
      lines.push('    </style>');
    } else if (r.tag.endsWith('array')) {
      lines.push(`    <${r.tag} name="${escAttr(r.name)}">`);
      for (const it of r.items) lines.push(`        <item>${esc(it.value)}</item>`);
      lines.push(`    </${r.tag}>`);
    } else lines.push(`    <${r.tag} name="${escAttr(r.name)}">${esc(r.value)}</${r.tag}>`);
  }
  lines.push('</resources>', '');
  return lines.join('\n');
}

export function ResourceEditor(props: { store: ProjectStore; onClose: () => void }) {
  const [kind, setKind] = useState<Kind>('strings');
  const [variant, setVariant] = useState('values');
  const [list, setList] = useState<Res[] | null>(null);
  const [err, setErr] = useState('');
  const path = dataPath(props.store, 'files', 'resource', variant, kind + '.xml');
  const reload = async () => {
    setErr('');
    try {
      setList(parse(await readText(path)));
    } catch (e: any) {
      setList([]);
      setErr(`Failed to parse ${kind}.xml — open it in the code editor to fix it.`);
    }
  };
  useEffect(() => {
    reload();
  }, [path]);
  const save = async (l: Res[]) => {
    setList(l);
    await writeText(path, serialize(l));
  };
  const tagFor = kind === 'strings' ? 'string' : kind === 'colors' ? 'color' : kind === 'arrays' ? 'string-array' : 'style';

  const edit = (i: number | null) =>
    mount((c) => (
      <ResDialog
        kind={kind}
        initial={i == null ? { tag: tagFor, name: '', value: kind === 'colors' ? '#FF2196F3' : '', items: [], parent: kind === 'themes' ? 'Theme.MaterialComponents.DayNight.NoActionBar' : undefined } : list![i]}
        names={list!.filter((_, j) => j !== i).map((r) => r.name)}
        onClose={c}
        onSave={(r) => {
          const l = list!.slice();
          if (i == null) l.push(r);
          else l[i] = r;
          save(l);
        }}
      />
    ));

  return (
    <Page
      title="Resource Editor"
      subtitle={`files/resource/${variant}/${kind}.xml`}
      onClose={props.onClose}
      noContent
      actions={
        <>
          <select value={variant} onChange={(e) => setVariant(e.target.value)} style={{ marginRight: 4 }} title="Resource variant">
            <option value="values">values</option>
            <option value="values-night">values-night</option>
            <option value="values-v31">values-v31</option>
          </select>
          <IconButton
            icon="ic_mtrl_code"
            title="Edit XML"
            onClick={async () => {
              const t = await readText(path, serialize([]));
              mount((c) => (
                <CodePage
                  title={kind + '.xml'}
                  subtitle={variant}
                  text={t}
                  lang="xml"
                  onClose={() => (c(), reload())}
                  onSave={(x) => writeText(path, x)}
                />
              ));
            }}
          />
        </>
      }
      fab={
        <button className="fab" onClick={() => list && edit(null)} title="Add">
          <Icon name="ic_mtrl_add" />
        </button>
      }
    >
      <Tabs
        value={kind}
        onChange={setKind}
        items={(['strings', 'colors', 'styles', 'themes', 'arrays'] as Kind[]).map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) }))}
      />
      <div className="page-content">
        {err && <div className="err" style={{ color: 'var(--error)', padding: 12 }}>{err}</div>}
        {list && list.length === 0 && !err && <EmptyState icon="ic_mtrl_folder_code" text={`No ${kind} yet.\nPress + to add one.`} />}
        <div className="card-list">
          {list?.map((r, i) => (
            <ListRow
              key={i}
              lead={
                kind === 'colors' ? (
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: normalizeColor(r.value) ? colorToCss(normalizeColor(r.value)!) : 'transparent', border: '1px solid var(--outline-variant)', flexShrink: 0 }} />
                ) : (
                  <Icon name={kind === 'strings' ? 'ic_mtrl_formattext' : kind === 'arrays' ? 'ic_mtrl_list' : 'ic_mtrl_palette'} />
                )
              }
              title={<span className="mono" style={{ fontSize: 14.5 }}>{r.name}</span>}
              sub={r.tag === 'style' ? (r.parent ? 'parent: ' + r.parent + ' · ' : '') + r.items.length + ' items' : r.tag.endsWith('array') ? r.items.map((x) => x.value).join(', ') : r.value}
              onClick={() => edit(i)}
              onContextMenu={(e) => {
                e.preventDefault();
                contextMenu(e.clientX, e.clientY, [
                  { label: 'Edit', icon: 'ic_mtrl_edit', onClick: () => edit(i) },
                  {
                    label: 'Delete',
                    icon: 'ic_mtrl_delete',
                    danger: true,
                    onClick: async () => {
                      if (await confirmDialog('Delete', `Delete "${r.name}"?`, 'Delete', true)) save(list.filter((_, j) => j !== i));
                    },
                  },
                ]);
              }}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

function ResDialog(props: { kind: Kind; initial: Res; names: string[]; onClose: () => void; onSave: (r: Res) => void }) {
  const [r, setR] = useState<Res>({ ...props.initial, items: props.initial.items.map((x) => ({ ...x })) });
  const nameErr = !r.name.trim() ? 'Enter a name' : props.names.includes(r.name) ? 'Already exists' : null;
  const isStyle = props.kind === 'styles' || props.kind === 'themes';
  const isArray = props.kind === 'arrays';
  const setItem = (i: number, patch: Partial<Res['items'][0]>) => setR({ ...r, items: r.items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  return (
    <Modal
      title={props.initial.name ? 'Edit ' + props.initial.name : 'Add ' + props.kind.replace(/s$/, '')}
      onClose={props.onClose}
      width={isStyle || isArray ? 680 : 520}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!!nameErr}
            onClick={() => {
              props.onSave(r);
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="field">
        <label>Name</label>
        <input autoFocus className="mono" value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} />
        {nameErr && r.name && <div className="err">{nameErr}</div>}
      </div>
      {props.kind === 'strings' && (
        <div className="field">
          <label>Value</label>
          <textarea rows={4} value={r.value} onChange={(e) => setR({ ...r, value: e.target.value })} />
        </div>
      )}
      {props.kind === 'colors' && (
        <div className="field">
          <label>Color</label>
          <div className="row">
            <input className="grow mono" value={r.value} onChange={(e) => setR({ ...r, value: e.target.value })} />
            <button
              onClick={() =>
                mount((c) => (
                  <ColorPicker
                    initial={r.value}
                    onClose={c}
                    onPick={(_s, n) => {
                      c();
                      setR({ ...r, value: normalizeColor(n) ?? r.value });
                    }}
                  />
                ))
              }
            >
              <span style={{ width: 18, height: 18, borderRadius: 4, background: normalizeColor(r.value) ? colorToCss(normalizeColor(r.value)!) : 'transparent' }} />
              Pick
            </button>
          </div>
        </div>
      )}
      {isStyle && (
        <div className="field">
          <label>Parent</label>
          <input className="mono" value={r.parent ?? ''} onChange={(e) => setR({ ...r, parent: e.target.value || undefined })} />
        </div>
      )}
      {isArray && (
        <div className="field">
          <label>Type</label>
          <select value={r.tag} onChange={(e) => setR({ ...r, tag: e.target.value })}>
            <option>string-array</option>
            <option>integer-array</option>
            <option>array</option>
          </select>
        </div>
      )}
      {(isStyle || isArray) && (
        <>
          <div className="row" style={{ margin: '8px 0' }}>
            <span className="grow">Items</span>
            <button className="text" onClick={() => setR({ ...r, items: [...r.items, isStyle ? { name: '', value: '' } : { value: '' }] })}>
              <Icon name="ic_mtrl_add" size={18} /> Add item
            </button>
          </div>
          <div style={{ maxHeight: '38vh', overflow: 'auto' }}>
            {r.items.map((it, i) => (
              <div key={i} className="row" style={{ marginBottom: 6 }}>
                {isStyle && <input className="mono" style={{ width: '45%' }} placeholder="android:textColor" value={it.name ?? ''} onChange={(e) => setItem(i, { name: e.target.value })} />}
                <input className="grow mono" placeholder="value" value={it.value} onChange={(e) => setItem(i, { value: e.target.value })} />
                <button className="ib" onClick={() => setR({ ...r, items: r.items.filter((_, j) => j !== i) })}>
                  <Icon name="ic_mtrl_close" size={20} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}

export { toast };
