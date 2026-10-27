// "My collection" storage of Sketchware (a.a.a.Lp subclasses Op/Qp/Np/Rp/Mp/Pp):
// <workspace>/collection/<kind>/list = encrypted text, one CollectionBean JSON per line; files live in <kind>/data/<data>.
import { host, joinPath } from './host';
import { decryptText, encryptText } from './crypto';

export type CollectionKind = 'image' | 'sound' | 'font' | 'widget' | 'block' | 'more_block';
export interface CollectionBean {
  name: string;
  data: string;
  reserved1?: string;
}

export function collectionDir(wsRoot: string, kind: CollectionKind) {
  return joinPath(wsRoot, 'collection', kind);
}
/** Folder holding the files of image/sound/font collections. */
export function collectionDataDir(wsRoot: string, kind: CollectionKind) {
  return joinPath(collectionDir(wsRoot, kind), 'data');
}

export async function readCollection(wsRoot: string, kind: CollectionKind): Promise<CollectionBean[]> {
  const p = joinPath(collectionDir(wsRoot, kind), 'list');
  if (!(await host().exists(p))) return [];
  let text = '';
  try {
    text = await decryptText(await host().read(p));
  } catch {
    try {
      text = await host().readText(p);
    } catch {
      return [];
    }
  }
  const out: CollectionBean[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const b = JSON.parse(line);
      if (b && typeof b.name === 'string') out.push(b);
    } catch {
      /* skip broken line */
    }
  }
  return out;
}

export async function writeCollection(wsRoot: string, kind: CollectionKind, list: CollectionBean[]) {
  const dir = collectionDir(wsRoot, kind);
  await host().mkdir(dir);
  await host().write(joinPath(dir, 'list'), await encryptText(list.map((b) => JSON.stringify(b)).join('\n') + (list.length ? '\n' : '')));
}

/** Adds (or replaces) an entry; for file kinds `file` is copied into the data folder as `data`. */
export async function addToCollection(wsRoot: string, kind: CollectionKind, bean: CollectionBean, file?: string) {
  const list = (await readCollection(wsRoot, kind)).filter((b) => b.name !== bean.name);
  if (file) await host().copy(file, joinPath(collectionDataDir(wsRoot, kind), bean.data));
  list.push(bean);
  await writeCollection(wsRoot, kind, list);
}

export async function removeFromCollection(wsRoot: string, kind: CollectionKind, name: string) {
  const list = await readCollection(wsRoot, kind);
  const b = list.find((x) => x.name === name);
  if (b && (kind === 'image' || kind === 'sound' || kind === 'font') && b.data) await host().remove(joinPath(collectionDataDir(wsRoot, kind), b.data));
  await writeCollection(
    wsRoot,
    kind,
    list.filter((x) => x.name !== name),
  );
}
