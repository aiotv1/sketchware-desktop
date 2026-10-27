// Block manager (mod.hilal.saif BlocksManager / BlocksManagerDetailsActivity / BlocksManagerCreatorActivity).
// <workspace>/resources/block/My Block/palette.json = [{name, color}]; block.json = [{name, type, typeName, spec, spec2, color, code, imports, palette}]
// A block's "palette" is the palette index + 9 (as a string); "-1" is the recycle bin.
import React, { useEffect, useState } from 'react';
import { Page, ListRow, EmptyState, IconButton } from '../common/m3';
import { Modal, mount, contextMenu, confirmDialog, toast, choiceDialog } from '../common/dialogs';
import { Icon } from '../icons/Icon';
import { host, joinPath, baseName } from '../../core/host';
import { customBlocksDir, reloadCustomBlocks, workspace } from '../appstate';
import { BlockPreview } from '../logic/BlockPreview';
import { CodeEditor } from '../common/CodeEditor';
import { ColorPicker, normalizeColor } from '../common/ColorPicker';

type Palette = { name: string; color: string };
type Block = Record<string, any>;

const palettePath = () => joinPath(customBlocksDir(), 'palette.json');
const blocksPath = () => joinPath(customBlocksDir(), 'block.json');

async function readList<T>(p: string): Promise<T[]> {
  try {
    if (!(await host().exists(p))) return [];
    const v = JSON.parse((await host().readText(p)) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
async function save(palettes: Palette[] | null, blocks: Block[] | null) {
  await host().mkdir(customBlocksDir());
  if (palettes) await host().write(palettePath(), JSON.stringify(palettes));
  if (blocks) await host().write(blocksPath(), JSON.stringify(blocks));
  await reloadCustomBlocks();
}
const palNum = (b: Block) => Number(b.palette ?? -999);
const hexOf = (c: any) => {
  const n = normalizeColor(String(c ?? '').startsWith('#') || typeof c === 'number' ? c : '#' + c);
  return n ? '#' + n.substring(3) : '#8A55D7';
};

// ------------------------------------------------------------------ palettes
export function BlockManager(props: { onClose: () => void }) {
  const [pals, setPals] = useState<Palette[] | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const reload = async () => {
    setPals(await readList<Palette>(palettePath()));
    setBlocks(await readList<Block>(blocksPath()));
  };
  useEffect(() => {
    reload();
  }, []);
  if (!pals) return null;
  const count = (n: number) => blocks.filter((b) => palNum(b) === n).length;

  const editPalette = (i: number | null, insertAt?: number) =>
    mount((c) => (
      <PaletteDialog
        initial={i == null ? null : pals[i]}
        onClose={c}
        onSave={async (pal) => {
          let ps = pals.slice();
          let bs = blocks;
          if (i != null) ps[i] = pal;
          else if (insertAt != null) {
            ps.splice(insertAt, 0, pal);
            // blocks of following palettes shift by one (insertBlocksAt)
            bs = blocks.map((b) => (palNum(b) >= insertAt + 9 ? { ...b, palette: String(palNum(b) + 1) } : b));
          } else ps.push(pal);
          await save(ps, bs);
          reload();
        }}
      />
    ));

  const removePalette = async (i: number) => {
    if (!(await confirmDialog('Move to recycle bin', `Move palette "${pals[i].name}" to the recycle bin? Its ${count(i + 9)} blocks go to the recycle bin too.`, 'Move', true))) return;
    const n = i + 9;
    const bs = blocks.map((b) => (palNum(b) === n ? { ...b, palette: '-1' } : palNum(b) > n ? { ...b, palette: String(palNum(b) - 1) } : b));
    await save(
      pals.filter((_, j) => j !== i),
      bs,
    );
    reload();
  };

  const move = async (i: number, d: number) => {
    const j = i + d;
    const ps = pals.slice();
    [ps[i], ps[j]] = [ps[j], ps[i]];
    const a = i + 9;
    const b = j + 9;
    const bs = blocks.map((x) => (palNum(x) === a ? { ...x, palette: String(b) } : palNum(x) === b ? { ...x, palette: String(a) } : x));
    await save(ps, bs);
    reload();
  };

  const exportPalette = async (i: number) => {
    const out = await host().saveDialog({ title: 'Export blocks', defaultPath: pals[i].name + '.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (!out) return;
    await host().write(out, JSON.stringify(blocks.filter((b) => palNum(b) === i + 9)));
    toast('Exported to ' + baseName(out));
  };

  const open = (n: number) => mount((c) => <PaletteBlocks paletteNum={n} palettes={pals} onClose={() => (c(), reload())} />);

  return (
    <Page
      title="Block manager"
      subtitle={pals.length ? `${pals.length} palettes` : 'No palettes'}
      onClose={props.onClose}
      actions={<IconButton icon="x_open" title="Open block folder" onClick={async () => (await host().mkdir(customBlocksDir()), host().openPath(customBlocksDir()))} />}
      fab={
        <button className="fab" onClick={() => editPalette(null)}>
          <Icon name="ic_mtrl_add" /> Create palette
        </button>
      }
    >
      <div className="card-list" style={{ marginTop: 8 }}>
        <ListRow icon="ic_mtrl_delete" title="Recycle bin" sub={`Blocks: ${count(-1)}`} chevron onClick={() => open(-1)} />
      </div>
      <div className="section-title">Palettes</div>
      {pals.length === 0 && <EmptyState icon="ic_mtrl_block" text={'No palettes yet.\nCreate a palette, then add or import blocks into it.'} />}
      <div className="card-list">
        {pals.map((pal, i) => (
          <ListRow
            key={i}
            lead={<span style={{ width: 28, height: 28, borderRadius: 14, background: hexOf(pal.color), flexShrink: 0 }} />}
            title={pal.name}
            sub={`Blocks: ${count(i + 9)}`}
            onClick={() => open(i + 9)}
            onContextMenu={(e) => {
              e.preventDefault();
              contextMenu(e.clientX, e.clientY, [
                { label: 'Edit', icon: 'ic_mtrl_edit', onClick: () => editPalette(i) },
                { label: 'Insert palette above', icon: 'ic_mtrl_add', onClick: () => editPalette(null, i) },
                { label: 'Move up', icon: 'x_upward', disabled: i === 0, onClick: () => move(i, -1) },
                { label: 'Move down', icon: 'x_downward', disabled: i === pals.length - 1, onClick: () => move(i, 1) },
                { label: 'Export blocks', icon: 'x_export', onClick: () => exportPalette(i) },
                { label: 'Move to recycle bin', icon: 'ic_mtrl_delete', danger: true, onClick: () => removePalette(i) },
              ]);
            }}
            trailing={
              <button
                className="ib"
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget.closest('.list-row') as HTMLElement).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: e.clientX, clientY: e.clientY }));
                }}
              >
                <Icon name="ic_mtrl_more_vertical" />
              </button>
            }
          />
        ))}
      </div>
    </Page>
  );
}

function PaletteDialog(props: { initial: Palette | null; onClose: () => void; onSave: (p: Palette) => void }) {
  const [name, setName] = useState(props.initial?.name ?? '');
  const [color, setColor] = useState(props.initial ? hexOf(props.initial.color).substring(1) : '8A55D7');
  const ok = !!name.trim() && /^[0-9a-fA-F]{6}$/.test(color);
  return (
    <Modal
      title={props.initial ? 'Edit palette' : 'Create a new palette'}
      onClose={props.onClose}
      width={460}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!ok}
            onClick={() => {
              props.onSave({ name: name.trim(), color: '#' + color.toUpperCase() });
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
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Color (HEX)</label>
        <div className="row">
          <span style={{ width: 36, height: 36, borderRadius: 18, background: /^[0-9a-fA-F]{6}$/.test(color) ? '#' + color : 'transparent', border: '1px solid var(--outline-variant)' }} />
          <span className="muted">#</span>
          <input className="grow mono" value={color} onChange={(e) => setColor(e.target.value.replace('#', ''))} />
          <button
            onClick={() =>
              mount((c) => (
                <ColorPicker
                  initial={'#' + color}
                  onClose={c}
                  onPick={(_s, n) => {
                    c();
                    const h = normalizeColor(n);
                    if (h) setColor(h.substring(3));
                  }}
                />
              ))
            }
          >
            <Icon name="ic_mtrl_palette" size={18} /> Pick
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ------------------------------------------------------------------ blocks of one palette
function PaletteBlocks(props: { paletteNum: number; palettes: Palette[]; onClose: () => void }) {
  const [all, setAll] = useState<Block[] | null>(null);
  const reload = async () => setAll(await readList<Block>(blocksPath()));
  useEffect(() => {
    reload();
  }, []);
  if (!all) return null;
  const n = props.paletteNum;
  const isBin = n === -1;
  const pal = isBin ? null : props.palettes[n - 9];
  const idx = all.map((b, i) => ({ b, i })).filter(({ b }) => palNum(b) === n);
  const commit = async (list: Block[]) => {
    setAll(list);
    await save(null, list);
  };

  const edit = (i: number | null) =>
    mount((c) => (
      <BlockCreator
        initial={i == null ? null : all[i]}
        defaultColor={pal ? hexOf(pal.color) : '#8A55D7'}
        existing={all.filter((_, j) => j !== i).map((b) => String(b.name))}
        onClose={c}
        onSave={(b) => {
          const list = all.slice();
          if (i == null) list.push({ ...b, palette: String(n) });
          else list[i] = { ...b, palette: all[i].palette };
          commit(list);
        }}
      />
    ));

  const moveTo = async (i: number) => {
    const target = await choiceDialog(
      isBin ? 'Restore to' : 'Move to',
      props.palettes.map((p, j) => ({ label: p.name, value: j + 9 })).filter((x) => x.value !== n),
    );
    if (target == null) return;
    commit(all.map((b, j) => (j === i ? { ...b, palette: String(target) } : b)));
  };

  const swap = (a: number, b: number) => {
    const list = all.slice();
    [list[a], list[b]] = [list[b], list[a]];
    commit(list);
  };

  const importBlocks = async () => {
    const f = await host().openDialog({ title: 'Select a JSON file', properties: ['openFile'], filters: [{ name: 'Blocks', extensions: ['json'] }] });
    if (!f) return;
    let list: Block[];
    try {
      list = JSON.parse(await host().readText(f[0]));
      if (!Array.isArray(list)) throw new Error('not a list');
    } catch (e: any) {
      return toast('Invalid blocks file: ' + (e?.message ?? e), true);
    }
    const valid = list.filter((b) => b && typeof b.name === 'string');
    if (valid.length < list.length) toast(`${list.length - valid.length} entries without a valid name were skipped`, true);
    mount((c) => <ImportDialog blocks={valid} onClose={c} onImport={(sel) => commit([...all, ...sel.map((b) => ({ ...b, palette: String(n) }))]).then(() => toast('Imported successfully'))} />);
  };

  const exportBlocks = async () => {
    const out = await host().saveDialog({ title: 'Export blocks', defaultPath: (pal?.name ?? 'Recycle bin') + '.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (!out) return;
    await host().write(out, JSON.stringify(idx.map(({ b }) => b)));
    toast('Exported to ' + baseName(out));
  };

  const emptyBin = async () => {
    if (!(await confirmDialog('Recycle bin', 'Are you sure you want to empty the recycle bin? Blocks inside will be deleted PERMANENTLY.', 'Empty', true))) return;
    commit(all.filter((b) => palNum(b) !== -1));
  };

  return (
    <Page
      title={isBin ? 'Recycle Bin' : pal?.name ?? 'Palette'}
      subtitle={`${idx.length} blocks`}
      onClose={props.onClose}
      actions={
        <>
          {!isBin && <IconButton icon="x_import" title="Import blocks (JSON)" onClick={importBlocks} />}
          <IconButton icon="x_export" title="Export blocks (JSON)" onClick={exportBlocks} disabled={!idx.length} />
          {isBin && <IconButton icon="ic_mtrl_delete" title="Empty recycle bin" onClick={emptyBin} disabled={!idx.length} />}
        </>
      }
      fab={
        !isBin ? (
          <button className="fab" onClick={() => edit(null)}>
            <Icon name="ic_mtrl_add" /> Add block
          </button>
        ) : undefined
      }
    >
      {idx.length === 0 && <EmptyState icon="ic_mtrl_block" text={isBin ? 'The recycle bin is empty.' : 'No blocks in this palette.\nAdd a block or import a blocks JSON file.'} />}
      {idx.map(({ b, i }, k) => (
        <div
          key={i}
          className="block-card"
          onClick={() => !isBin && edit(i)}
          onContextMenu={(e) => {
            e.preventDefault();
            contextMenu(e.clientX, e.clientY, [
              ...(!isBin
                ? [
                    { label: 'Edit', icon: 'ic_mtrl_edit', onClick: () => edit(i) },
                    {
                      label: 'Duplicate',
                      icon: 'x_copy',
                      onClick: () => {
                        const copy = { ...b, name: String(b.name).replace(/_copy\d\d$/, '') + '_copy' + (11 + Math.floor(Math.random() * 89)) };
                        const list = all.slice();
                        list.splice(i + 1, 0, copy);
                        commit(list);
                      },
                    },
                  ]
                : []),
              { label: isBin ? 'Restore to…' : 'Move to palette…', icon: isBin ? 'x_restore' : 'ic_mtrl_category', onClick: () => moveTo(i) },
              { label: 'Move up', icon: 'x_upward', disabled: k === 0, onClick: () => swap(i, idx[k - 1].i) },
              { label: 'Move down', icon: 'x_downward', disabled: k === idx.length - 1, onClick: () => swap(i, idx[k + 1].i) },
              isBin
                ? {
                    label: 'Delete permanently',
                    icon: 'ic_mtrl_delete',
                    danger: true,
                    onClick: async () => {
                      if (await confirmDialog('Delete block?', `"${b.name}" will be deleted permanently.`, 'Delete', true)) commit(all.filter((_, j) => j !== i));
                    },
                  }
                : { label: 'Move to recycle bin', icon: 'ic_mtrl_delete', danger: true, onClick: () => commit(all.map((x, j) => (j === i ? { ...x, palette: '-1' } : x))) },
            ]);
          }}
        >
          <div className="row" style={{ marginBottom: 6 }}>
            <span className="mono" style={{ fontWeight: 500 }}>
              {String(b.name ?? '(Invalid block name entry)')}
            </span>
            <span className="chip" style={{ height: 22, padding: '0 8px', fontSize: 11 }}>
              {b.type === ' ' || !b.type ? 'regular' : b.type}
            </span>
          </div>
          <BlockPreview spec={String(b.spec ?? '')} type={String(b.type ?? ' ')} typeName={b.typeName} color={b.color ?? (pal ? pal.color : '#8A55D7')} spec2={b.spec2} maxWidth={1000} />
        </div>
      ))}
    </Page>
  );
}

function ImportDialog(props: { blocks: Block[]; onClose: () => void; onImport: (b: Block[]) => void }) {
  const [sel, setSel] = useState<Set<number>>(new Set());
  const done = (list: Block[]) => {
    props.onImport(list);
    props.onClose();
  };
  return (
    <Modal
      title="Import blocks"
      onClose={props.onClose}
      width={620}
      footer={
        <>
          <button className="text" onClick={() => done(props.blocks)}>
            All
          </button>
          <button className="text" onClick={() => done(props.blocks.filter((_, i) => !sel.has(i)))} title="Import the blocks that are NOT checked">
            Reverse
          </button>
          <div className="grow" />
          <button onClick={props.onClose}>Cancel</button>
          <button className="primary" disabled={!sel.size} onClick={() => done(props.blocks.filter((_, i) => sel.has(i)))}>
            Import
          </button>
        </>
      }
    >
      <div style={{ maxHeight: '55vh', overflow: 'auto' }}>
        {props.blocks.map((b, i) => (
          <label key={i} className="list-item" style={{ alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={sel.has(i)}
              onChange={() => {
                const s = new Set(sel);
                if (s.has(i)) s.delete(i);
                else s.add(i);
                setSel(s);
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div className="mono">{b.name}</div>
              <BlockPreview spec={String(b.spec ?? '')} type={String(b.type ?? ' ')} typeName={b.typeName} color={b.color ?? '#8A55D7'} scale={1} maxWidth={480} />
            </div>
          </label>
        ))}
      </div>
    </Modal>
  );
}

// ------------------------------------------------------------------ block creator
const TYPES: { v: string; label: string }[] = [
  { v: 'regular', label: 'regular — statement' },
  { v: 'c', label: 'c — if-like, one substack' },
  { v: 'e', label: 'e — if/else, two substacks' },
  { v: 's', label: 's — returns String' },
  { v: 'b', label: 'b — returns boolean' },
  { v: 'd', label: 'd — returns number' },
  { v: 'v', label: 'v — returns a typed value' },
  { v: 'a', label: 'a — returns Map' },
  { v: 'f', label: 'f — cap (ends the stack)' },
  { v: 'l', label: 'l — returns List' },
  { v: 'p', label: 'p — returns a component' },
  { v: 'h', label: 'h — event hat' },
];
const PARAMS = ['%s', '%d', '%b', '%m.view', '%m.textview', '%m.imageview', '%m.listview', '%m.varMap', '%m.listStr', '%m.listInt', '%m.listMap', '%m.intent', '%m.color', '%m.resource', '%s.inputOnly'];

function BlockCreator(props: { initial: Block | null; defaultColor: string; existing: string[]; onClose: () => void; onSave: (b: Block) => void }) {
  const i = props.initial;
  const [name, setName] = useState(String(i?.name ?? ''));
  const [type, setType] = useState(!i || i.type === ' ' || !i.type ? 'regular' : String(i.type));
  const [typeName, setTypeName] = useState(String(i?.typeName ?? ''));
  const [spec, setSpec] = useState(String(i?.spec ?? ''));
  const [spec2, setSpec2] = useState(String(i?.spec2 ?? ''));
  const [color, setColor] = useState(i?.color ? hexOf(i.color) : props.defaultColor);
  const [code, setCode] = useState(String(i?.code ?? ''));
  const [imports, setImports] = useState(String(i?.imports ?? ''));
  const nameErr = !name.trim() ? 'Name is required' : /\s/.test(name) ? 'No spaces' : props.existing.includes(name) ? 'A block with this name already exists' : null;
  const specErr = (() => {
    const m = spec.match(/%m(?!\.\w)/);
    return m ? "'%m' must be followed by '.param'" : null;
  })();
  const insertParam = (p: string) => setSpec((s) => (s.endsWith(' ') || !s ? s : s + ' ') + p + ' ');
  return (
    <Page
      title={i ? 'Edit block' : 'Create a new block'}
      subtitle={name || undefined}
      onClose={props.onClose}
      actions={
        <button
          className="primary"
          style={{ marginRight: 8 }}
          disabled={!!nameErr || !!specErr}
          onClick={() => {
            const b: Block = { name: name.trim(), type: type === 'regular' ? ' ' : type, typeName, spec, color, code };
            if (type === 'e') b.spec2 = spec2;
            if (imports.trim()) b.imports = imports;
            props.onSave(b);
            props.onClose();
          }}
        >
          <Icon name="ic_mtrl_save" size={18} /> Save
        </button>
      }
    >
      <div className="creator-preview">
        <BlockPreview spec={spec || name || ' '} type={type} typeName={typeName} color={color} spec2={spec2} maxWidth={940} scale={1.4} />
      </div>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="field grow">
          <label>Name (unique id of the block)</label>
          <input autoFocus className="mono" value={name} onChange={(e) => setName(e.target.value)} />
          {nameErr && name && <div className="err">{nameErr}</div>}
        </div>
        <div className="field" style={{ width: 260 }}>
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t.v} value={t.v}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ width: 200 }}>
          <label>Type name</label>
          <input className="mono" value={typeName} placeholder={type === 'v' || type === 'p' ? 'e.g. Intent' : ''} onChange={(e) => setTypeName(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Spec (the text on the block; parameters like %s %d %b %m.view)</label>
        <input className="mono" value={spec} onChange={(e) => setSpec(e.target.value)} />
        {specErr && <div className="err">{specErr}</div>}
        <div className="row" style={{ flexWrap: 'wrap', marginTop: 6, gap: 6 }}>
          {PARAMS.map((p) => (
            <button key={p} className="chip mono" style={{ height: 28 }} onClick={() => insertParam(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>
      {type === 'e' && (
        <div className="field">
          <label>Spec 2 (text of the second part, e.g. "else")</label>
          <input className="mono" value={spec2} onChange={(e) => setSpec2(e.target.value)} />
        </div>
      )}
      <div className="field">
        <label>Color</label>
        <div className="row">
          <span style={{ width: 32, height: 32, borderRadius: 8, background: color }} />
          <input className="mono" style={{ width: 140 }} value={color} onChange={(e) => setColor(e.target.value)} />
          <button
            onClick={() =>
              mount((c) => (
                <ColorPicker
                  initial={color}
                  onClose={c}
                  onPick={(_s, n) => {
                    c();
                    const h = normalizeColor(n);
                    if (h) setColor('#' + h.substring(3));
                  }}
                />
              ))
            }
          >
            <Icon name="ic_mtrl_palette" size={18} /> Pick
          </button>
          <button className="text" onClick={() => setColor(props.defaultColor)}>
            Palette color
          </button>
        </div>
      </div>
      <div className="field">
        <label>Code (Java; parameters are inserted in order with %s, like String.format)</label>
        <div style={{ height: 260 }}>
          <CodeEditor value={code} lang="java" onChange={setCode} />
        </div>
      </div>
      <div className="field">
        <label>Imports (one per line, e.g. import android.net.Uri;)</label>
        <textarea className="mono" rows={3} value={imports} onChange={(e) => setImports(e.target.value)} />
      </div>
    </Page>
  );
}

export { workspace };
