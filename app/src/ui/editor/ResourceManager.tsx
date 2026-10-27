// Image / Sound / Font managers (ManageImageActivity etc.) with "This project" and "My collection" tabs.
import React, { useEffect, useRef, useState } from 'react';
import { Modal, promptDialog, confirmDialog, toast, mount, contextMenu } from '../common/dialogs';
import { ProjectStore, useStore } from './store';
import { ProjectResourceBean } from '../../core/beans';
import { host, baseName, joinPath } from '../../core/host';
import { fileUrl } from '../common/fileurl';
import { Page, Tabs, EmptyState } from '../common/m3';
import { Icon } from '../icons/Icon';
import { CollectionKind, readCollection, addToCollection, collectionDataDir, CollectionBean } from '../../core/collections';

type Kind = 'images' | 'sounds' | 'fonts';

const EXT: Record<Kind, string[]> = { images: ['png', 'jpg', 'jpeg', 'webp', 'gif'], sounds: ['mp3', 'wav', 'ogg', 'm4a'], fonts: ['ttf', 'otf'] };
const TITLE: Record<Kind, string> = { images: 'Image Manager', sounds: 'Sound Manager', fonts: 'Font Manager' };
const SINGLE: Record<Kind, string> = { images: 'Image', sounds: 'Sound', fonts: 'Font' };
const CKIND: Record<Kind, CollectionKind> = { images: 'image', sounds: 'sound', fonts: 'font' };
const ICON: Record<Kind, string> = { images: 'ic_mtrl_image', sounds: 'ic_mtrl_music', fonts: 'ic_mtrl_font' };
const EMPTY: Record<Kind, string> = { images: 'Add photos and icons here', sounds: 'Add background music\nor sound effects here', fonts: 'Add fonts here' };

const toResName = (file: string) => {
  let n = file.replace(/\.9\.png$/i, '').replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  if (!/^[a-z]/.test(n)) n = 'res_' + n;
  return n;
};
const NAME_RE = /^[a-z][a-z0-9_]*$/;

export function ResourceManager(props: { store: ProjectStore; kind: Kind; onClose: () => void }) {
  const store = useStore(props.store);
  const p = store.project;
  const { kind } = props;
  const list: ProjectResourceBean[] = p[kind];
  const dir = store.ws.resDir(kind, p.scId);
  const [tab, setTab] = useState<'project' | 'collection'>('project');
  const [bust, setBust] = useState(Date.now());
  const [coll, setColl] = useState<CollectionBean[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const root = store.ws.root;

  const reloadColl = async () => setColl(await readCollection(root, CKIND[kind]));
  useEffect(() => {
    reloadColl();
  }, []);

  const addFile = async (file: string, name: string, toCollection: boolean) => {
    const isNine = kind === 'images' && /\.9\.png$/i.test(file);
    const ext = isNine ? '.9.png' : file.substring(file.lastIndexOf('.')).toLowerCase();
    const full = name + ext;
    await host().copy(file, joinPath(dir, full));
    list.push(new ProjectResourceBean(1, name, full));
    if (toCollection) await addToCollection(root, CKIND[kind], { name, data: full }, file);
  };

  const openAdd = () =>
    mount((c) => (
      <AddResourceDialog
        kind={kind}
        taken={new Set(list.map((r) => r.resName))}
        onClose={c}
        onAdd={async (items, toCollection) => {
          for (const it of items) await addFile(it.file, it.name, toCollection);
          setBust(Date.now());
          store.changed();
          if (toCollection) reloadColl();
          toast(`Added ${items.length} ${SINGLE[kind].toLowerCase()}${items.length > 1 ? 's' : ''}`);
        }}
      />
    ));

  const rename = async (r: ProjectResourceBean) => {
    const n = await promptDialog('Rename', r.resName, {
      validate: (v) => (!NAME_RE.test(v) ? 'Lowercase letters, digits, _' : list.some((x) => x !== r && x.resName === v) ? 'Already exists' : null),
    });
    if (!n || n === r.resName) return;
    const ext = r.resFullName.substring(r.resName.length);
    const full = n + ext;
    await host().copy(joinPath(dir, r.resFullName), joinPath(dir, full));
    await host().remove(joinPath(dir, r.resFullName));
    r.resName = n;
    r.resFullName = full;
    store.changed();
  };

  const remove = async (r: ProjectResourceBean) => {
    if (!(await confirmDialog('Delete', `Delete ${r.resName}?`, 'Delete', true))) return;
    list.splice(list.indexOf(r), 1);
    await host().remove(joinPath(dir, r.resFullName));
    store.changed();
  };

  const importFromCollection = async (b: CollectionBean) => {
    let name = toResName(b.name);
    while (list.some((r) => r.resName === name)) name += '_1';
    const src = joinPath(collectionDataDir(root, CKIND[kind]), b.data);
    if (!(await host().exists(src))) return toast('File of this collection item is missing', true);
    await addFile(src, name, false);
    setBust(Date.now());
    store.changed();
    toast(`Added ${name} to the project`);
  };

  const play = (path: string) => {
    audio.current?.pause();
    audio.current = new Audio(fileUrl(path));
    audio.current.play().catch(() => toast('Cannot play this file', true));
  };

  const tile = (key: string, path: string, name: string, sub: string, menu: (e: React.MouseEvent) => void, onClick?: () => void) => (
    <div key={key} className="collection-tile" onContextMenu={menu} onClick={onClick ?? menu}>
      {kind === 'images' ? (
        <img src={fileUrl(path, bust)} />
      ) : (
        <div style={{ width: 96, height: 72, display: 'grid', placeItems: 'center', fontSize: 30 }}>
          {kind === 'fonts' ? <span style={{ fontFamily: `'rm_${key}'` }}>Aa</span> : <Icon name="ic_mtrl_music" size={40} />}
        </div>
      )}
      <div className="ellipsis" style={{ fontWeight: 500 }}>
        {name}
      </div>
      <div className="muted small ellipsis">{sub}</div>
    </div>
  );

  // load fonts for previews
  useEffect(() => {
    if (kind !== 'fonts') return;
    for (const r of list) new FontFace('rm_' + r.resName, `url("${fileUrl(joinPath(dir, r.resFullName))}")`).load().then((f) => (document as any).fonts.add(f)).catch(() => {});
  }, [list.length]);

  return (
    <Page
      title={TITLE[kind]}
      onClose={props.onClose}
      noContent
      fab={
        tab === 'project' ? (
          <button className="fab" onClick={openAdd}>
            <Icon name="ic_mtrl_add" /> Add {SINGLE[kind]}
          </button>
        ) : undefined
      }
    >
      <Tabs
        value={tab}
        onChange={setTab}
        compact
        items={[
          { value: 'project', label: 'This project' },
          { value: 'collection', label: 'My collection' },
        ]}
      />
      <div className="page-content">
        {tab === 'project' && (
          <>
            {list.length === 0 && <EmptyState icon={ICON[kind]} text={EMPTY[kind]} />}
            <div className="collection-grid">
              {list.map((r) =>
                tile(
                  r.resName,
                  joinPath(dir, r.resFullName),
                  r.resName,
                  r.resFullName,
                  (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    contextMenu(e.clientX, e.clientY, [
                      ...(kind === 'sounds' ? [{ label: 'Play', icon: 'x_play', onClick: () => play(joinPath(dir, r.resFullName)) }] : []),
                      { label: 'Rename', icon: 'ic_mtrl_text_change', onClick: () => rename(r) },
                      {
                        label: 'Add to my collection',
                        icon: 'ic_mtrl_bookmark',
                        onClick: async () => {
                          await addToCollection(root, CKIND[kind], { name: r.resName, data: r.resFullName }, joinPath(dir, r.resFullName));
                          reloadColl();
                          toast('Added to my collection');
                        },
                      },
                      { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, onClick: () => remove(r) },
                    ]);
                  },
                  kind === 'sounds' ? () => play(joinPath(dir, r.resFullName)) : undefined,
                ),
              )}
            </div>
          </>
        )}
        {tab === 'collection' && (
          <>
            {coll.length === 0 && <EmptyState icon="ic_mtrl_bookmark" text={'Your collection is empty.\nTick "Add to my collection" when adding files.'} />}
            <div className="collection-grid">
              {coll.map((b) =>
                tile(b.name, joinPath(collectionDataDir(root, CKIND[kind]), b.data), b.name, 'Click to add to this project', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  contextMenu(e.clientX, e.clientY, [
                    { label: 'Add to this project', icon: 'ic_mtrl_add', onClick: () => importFromCollection(b) },
                    ...(kind === 'sounds' ? [{ label: 'Play', icon: 'x_play', onClick: () => play(joinPath(collectionDataDir(root, CKIND[kind]), b.data)) }] : []),
                  ]);
                }),
              )}
            </div>
          </>
        )}
      </div>
    </Page>
  );
}

function AddResourceDialog(props: { kind: Kind; taken: Set<string>; onClose: () => void; onAdd: (items: { file: string; name: string }[], toCollection: boolean) => void }) {
  const [items, setItems] = useState<{ file: string; name: string }[]>([]);
  const [coll, setColl] = useState(false);
  const pick = async () => {
    const files = await host().openDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: SINGLE[props.kind], extensions: EXT[props.kind] }] });
    if (!files) return;
    const used = new Set([...props.taken, ...items.map((i) => i.name)]);
    const add = files.map((f) => {
      let n = toResName(baseName(f));
      while (used.has(n)) n += '_1';
      used.add(n);
      return { file: f, name: n };
    });
    setItems([...items, ...add]);
  };
  const names = items.map((i) => i.name);
  const bad = items.find((i, idx) => !NAME_RE.test(i.name) || props.taken.has(i.name) || names.indexOf(i.name) !== idx);
  return (
    <Modal
      title={'Add ' + SINGLE[props.kind]}
      onClose={props.onClose}
      width={560}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!items.length || !!bad}
            onClick={() => {
              props.onAdd(items, coll);
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div
        onClick={pick}
        style={{ height: items.length ? 'auto' : 200, minHeight: 120, border: '1px solid var(--outline-variant)', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', color: 'var(--primary)', padding: 12 }}
      >
        {items.length === 0 ? (
          <>
            <Icon name={ICON[props.kind]} size={32} />
            Add {SINGLE[props.kind]}
          </>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {items.map((i) =>
              props.kind === 'images' ? <img key={i.file} src={fileUrl(i.file)} style={{ width: 64, height: 64, objectFit: 'contain' }} /> : <span key={i.file} className="chip">{baseName(i.file)}</span>,
            )}
            <span className="chip">+ more</span>
          </div>
        )}
      </div>
      {items.map((it, idx) => (
        <div key={it.file} className="field" style={{ marginTop: 10 }}>
          <label>{baseName(it.file)}</label>
          <input value={it.name} placeholder={`Enter ${SINGLE[props.kind].toLowerCase()} name`} onChange={(e) => setItems(items.map((x, j) => (j === idx ? { ...x, name: e.target.value } : x)))} />
        </div>
      ))}
      {bad && <div style={{ color: 'var(--error)', fontSize: 12 }}>"{bad.name}": use lowercase letters, digits and _, and unique names</div>}
      <label className="row" style={{ marginTop: 12, color: 'var(--on-surface)' }}>
        <input type="checkbox" checked={coll} onChange={(e) => setColl(e.target.checked)} /> Add to my collection
      </label>
    </Modal>
  );
}
