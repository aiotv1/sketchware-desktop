// Collection Manager (ManageCollectionActivity): images, sounds, fonts, widgets, blocks and more blocks saved for reuse.
import React, { useEffect, useRef, useState } from 'react';
import { Page, ListRow, EmptyState, Tabs } from '../../common/m3';
import { contextMenu, confirmDialog, promptDialog, toast } from '../../common/dialogs';
import { Icon } from '../../icons/Icon';
import { workspace } from '../../appstate';
import { joinPath } from '../../../core/host';
import { fileUrl } from '../../common/fileurl';
import { CollectionKind, CollectionBean, readCollection, writeCollection, removeFromCollection, collectionDataDir } from '../../../core/collections';
import { BlockPreview } from '../../logic/BlockPreview';

const KINDS: { value: CollectionKind; label: string; icon: string }[] = [
  { value: 'image', label: 'Image', icon: 'ic_mtrl_image' },
  { value: 'sound', label: 'Sound', icon: 'ic_mtrl_music' },
  { value: 'font', label: 'Font', icon: 'ic_mtrl_font' },
  { value: 'widget', label: 'Widget', icon: 'ic_mtrl_devices' },
  { value: 'block', label: 'Block', icon: 'ic_mtrl_block' },
  { value: 'more_block', label: 'More Block', icon: 'ic_mtrl_moreblock' },
];

function firstBlock(data: string) {
  try {
    const list = JSON.parse(data);
    const b = Array.isArray(list) ? list[0] : null;
    return b && b.spec != null ? b : null;
  } catch {
    return null;
  }
}

export function CollectionManager(props: { onClose: () => void; initial?: CollectionKind }) {
  const root = workspace().root;
  const [kind, setKind] = useState<CollectionKind>(props.initial ?? 'image');
  const [list, setList] = useState<CollectionBean[] | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const reload = async () => setList(await readCollection(root, kind));
  useEffect(() => {
    setList(null);
    reload();
  }, [kind]);

  const rename = async (b: CollectionBean) => {
    const n = await promptDialog('Rename', b.name, { validate: (v) => (!v.trim() ? 'Enter a name' : v !== b.name && list!.some((x) => x.name === v) ? 'Already exists' : null) });
    if (!n || n === b.name) return;
    await writeCollection(
      root,
      kind,
      list!.map((x) => (x.name === b.name ? { ...x, name: n } : x)),
    );
    reload();
  };
  const remove = async (b: CollectionBean) => {
    if (!(await confirmDialog('Delete', `Delete "${b.name}" from your collection?`, 'Delete', true))) return;
    await removeFromCollection(root, kind, b.name);
    reload();
  };
  const dataFile = (b: CollectionBean) => joinPath(collectionDataDir(root, kind), b.data);
  const icon = KINDS.find((k) => k.value === kind)!.icon;

  return (
    <Page title="Collection Manager" subtitle="My saved collections" onClose={props.onClose} noContent>
      <Tabs value={kind} onChange={setKind} items={KINDS.map((k) => ({ value: k.value, label: k.label }))} />
      <div className="page-content">
        {list && list.length === 0 && (
          <EmptyState
            icon={icon}
            text={
              kind === 'block' || kind === 'more_block'
                ? 'No collected blocks.\nUse the bookmark button in the logic editor to save blocks here.'
                : kind === 'widget'
                  ? 'No collected widgets.'
                  : `No collected ${kind}s.\nTick "Add to my collection" when importing in the ${kind[0].toUpperCase() + kind.slice(1)} Manager.`
            }
          />
        )}
        <div className={kind === 'image' ? 'collection-grid' : 'card-list'}>
          {list?.map((b) => {
            const menu = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              contextMenu(e.clientX, e.clientY, [
                { label: 'Rename', icon: 'ic_mtrl_text_change', onClick: () => rename(b) },
                { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, onClick: () => remove(b) },
              ]);
            };
            if (kind === 'image')
              return (
                <div key={b.name} className="collection-tile" onContextMenu={menu} onClick={menu}>
                  <img src={fileUrl(dataFile(b))} />
                  <div className="ellipsis">{b.name}</div>
                </div>
              );
            const blk = kind === 'block' || kind === 'more_block' ? firstBlock(b.data) : null;
            return (
              <ListRow
                key={b.name}
                icon={icon}
                title={b.name}
                sub={kind === 'more_block' ? b.data.split('\n')[0] : kind === 'font' || kind === 'sound' ? b.data : undefined}
                onContextMenu={menu}
                onClick={() => {
                  if (kind === 'sound') {
                    audio.current?.pause();
                    audio.current = new Audio(fileUrl(dataFile(b)));
                    audio.current.play().catch(() => toast('Cannot play this file', true));
                  }
                }}
                trailing={
                  <>
                    {blk && <BlockPreview spec={blk.spec} type={blk.type} typeName={blk.typeName} color={blk.color} maxWidth={420} scale={1} />}
                    <button className="ib" onClick={menu}>
                      <Icon name="ic_mtrl_more_vertical" />
                    </button>
                  </>
                }
              />
            );
          })}
        </div>
      </div>
    </Page>
  );
}
