// Java/Kotlin Manager, Resource Manager and Asset Manager (ManageJavaActivity / ManageResourceActivity / ManageAssetsActivity).
// Data: data/<id>/files/{java,resource,assets}
import React, { useEffect, useState } from 'react';
import { ProjectStore } from '../store';
import { Page, ListRow, EmptyState, IconButton } from '../../common/m3';
import { Modal, mount, promptDialog, contextMenu, confirmDialog, toast } from '../../common/dialogs';
import { Icon } from '../../icons/Icon';
import { CodePage } from '../CodePage';
import { langFor } from '../../common/CodeEditor';
import { host, joinPath, baseName } from '../../../core/host';
import { dataPath, writeText } from './util';
import { fileUrl } from '../../common/fileurl';

type Kind = 'java' | 'resource' | 'assets';
const TITLE: Record<Kind, string> = { java: 'Java/Kotlin Manager', resource: 'Resource Manager', assets: 'Asset Manager' };
const TEXT_EXT = /\.(java|kt|xml|json|txt|html?|css|js|md|properties|pro|gradle|csv|svg)$/i;
const IMG_EXT = /\.(png|jpe?g|webp|gif|bmp)$/i;

function fileIcon(name: string, dir: boolean) {
  if (dir) return 'ic_mtrl_folder';
  if (/\.java$/i.test(name)) return 'ic_mtrl_java';
  if (/\.kt$/i.test(name)) return 'ic_mtrl_code';
  if (/\.xml$/i.test(name)) return 'ic_mtrl_code';
  if (IMG_EXT.test(name)) return 'ic_mtrl_image';
  return 'ic_mtrl_file';
}

const JAVA_TEMPLATES: Record<string, (pkg: string, name: string) => string> = {
  Class: (p, n) => `${p ? `package ${p};\n\n` : ''}public class ${n} {\n    \n}\n`,
  Activity: (p, n) =>
    `${p ? `package ${p};\n\n` : ''}import android.os.Bundle;\nimport androidx.appcompat.app.AppCompatActivity;\n\npublic class ${n} extends AppCompatActivity {\n\n    @Override\n    protected void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n    }\n}\n`,
  Interface: (p, n) => `${p ? `package ${p};\n\n` : ''}public interface ${n} {\n    \n}\n`,
  Enum: (p, n) => `${p ? `package ${p};\n\n` : ''}public enum ${n} {\n    \n}\n`,
  'Abstract class': (p, n) => `${p ? `package ${p};\n\n` : ''}public abstract class ${n} {\n    \n}\n`,
  'Kotlin class': (p, n) => `${p ? `package ${p}\n\n` : ''}class ${n} {\n    \n}\n`,
  'Kotlin object': (p, n) => `${p ? `package ${p}\n\n` : ''}object ${n} {\n    \n}\n`,
};

export function FileTreeManager(props: { store: ProjectStore; kind: Kind; onClose: () => void }) {
  const { store, kind } = props;
  const root = dataPath(store, 'files', kind);
  const [rel, setRel] = useState<string[]>([]);
  const [entries, setEntries] = useState<{ name: string; dir: boolean }[] | null>(null);
  const cwd = joinPath(root, ...rel);
  const reload = async () => {
    await host().mkdir(cwd);
    const l = await host().list(cwd);
    l.sort((a, b) => Number(b.dir) - Number(a.dir) || a.name.localeCompare(b.name));
    setEntries(l);
  };
  useEffect(() => {
    reload();
  }, [cwd]);

  // files/java is the app's package folder: classes live in <package>[.<sub folders>]
  const javaPkg = () => (kind === 'java' ? [store.project.packageName, ...rel].join('.') : '');

  const open = async (e: { name: string; dir: boolean }) => {
    if (e.dir) return setRel([...rel, e.name]);
    const p = joinPath(cwd, e.name);
    if (TEXT_EXT.test(e.name) || !/\.\w+$/.test(e.name)) {
      const t = await host().readText(p);
      mount((c) => <CodePage title={e.name} subtitle={[kind, ...rel].join('/')} text={t} lang={langFor(e.name)} onClose={c} onSave={(x) => host().write(p, x)} />);
    } else if (IMG_EXT.test(e.name)) {
      mount((c) => (
        <Modal title={e.name} onClose={c} footer={<button onClick={c}>Close</button>}>
          <img src={fileUrl(p, Date.now())} style={{ maxWidth: '70vw', maxHeight: '65vh', background: '#fff2', borderRadius: 8 }} />
        </Modal>
      ));
    } else host().openPath(p);
  };

  const validName = (v: string) => (!v.trim() ? 'Enter a name' : /[\\/:*?"<>|]/.test(v) ? 'Invalid character' : entries?.some((x) => x.name === v) ? 'Already exists' : null);

  const newFolder = async () => {
    const n = await promptDialog('Create a new folder', kind === 'resource' && !rel.length ? 'values' : '', { validate: validName });
    if (!n) return;
    await host().mkdir(joinPath(cwd, n.trim()));
    reload();
  };

  const newFile = () => {
    if (kind === 'java') return mount((c) => <NewJavaDialog onClose={c} onCreate={async (name, type) => {
      const ext = type.startsWith('Kotlin') ? '.kt' : '.java';
      const file = joinPath(cwd, name + ext);
      if (await host().exists(file)) return toast('File already exists', true);
      await writeText(file, JAVA_TEMPLATES[type](javaPkg(), name));
      reload();
      if (type === 'Activity') toast(`Remember to add ${name} in AndroidManifest Manager → Add Activity`, false, 5000);
    }} />);
    (async () => {
      const n = await promptDialog('Create a new file', kind === 'resource' ? 'file.xml' : 'index.html', { validate: validName });
      if (!n) return;
      const isXml = n.endsWith('.xml');
      await writeText(joinPath(cwd, n.trim()), isXml ? '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    \n</resources>\n' : '');
      reload();
    })();
  };

  const importFiles = async () => {
    const files = await host().openDialog({ title: 'Import files', properties: ['openFile', 'multiSelections'] });
    if (!files) return;
    for (const f of files) {
      const dest = joinPath(cwd, baseName(f));
      if (kind === 'java' && /\.(java|kt)$/i.test(f)) {
        // like ManageJavaActivity: fix the package declaration for its new location
        let t = await host().readText(f);
        if (/^\s*package /m.test(t)) t = t.replace(/package (.*?);?\n/, `package ${javaPkg()}${f.endsWith('.java') ? ';' : ''}\n`);
        await host().write(dest, t);
      } else await host().copy(f, dest);
    }
    toast(`Imported ${files.length} file(s)`);
    reload();
  };

  const importFolder = async () => {
    const d = await host().openDialog({ title: 'Import a folder', properties: ['openDirectory'] });
    if (!d) return;
    await host().copy(d[0], joinPath(cwd, baseName(d[0])));
    reload();
  };

  const rename = async (e: { name: string; dir: boolean }) => {
    const n = await promptDialog('Rename', e.name, { validate: (v) => (v === e.name ? null : validName(v)) });
    if (!n || n === e.name) return;
    await host().copy(joinPath(cwd, e.name), joinPath(cwd, n.trim()));
    await host().remove(joinPath(cwd, e.name));
    reload();
  };

  const remove = async (e: { name: string; dir: boolean }) => {
    if (!(await confirmDialog('Delete', `Delete ${e.dir ? 'folder' : 'file'} "${e.name}"?`, 'Delete', true))) return;
    await host().remove(joinPath(cwd, e.name));
    reload();
  };

  const menu = (ev: React.MouseEvent, e: { name: string; dir: boolean }) => {
    ev.preventDefault();
    ev.stopPropagation();
    contextMenu(ev.clientX, ev.clientY, [
      { label: e.dir ? 'Open' : 'Edit', icon: 'ic_mtrl_edit', onClick: () => open(e) },
      { label: 'Rename', icon: 'ic_mtrl_text_change', onClick: () => rename(e) },
      { label: 'Show in folder', icon: 'x_open', onClick: () => host().reveal(joinPath(cwd, e.name)) },
      { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, onClick: () => remove(e) },
    ]);
  };

  const addMenu = (ev: React.MouseEvent) => {
    const r = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    contextMenu(r.right - 230, r.top - 200, [
      { label: kind === 'java' ? 'Create Java/Kotlin file' : 'Create a new file', icon: 'ic_mtrl_file', onClick: newFile },
      { label: 'Create a new folder', icon: 'ic_mtrl_folder', onClick: newFolder },
      { label: 'Import files', icon: 'x_import', onClick: importFiles },
      { label: 'Import a folder', icon: 'x_import', onClick: importFolder },
    ]);
  };

  return (
    <Page
      title={TITLE[kind]}
      subtitle={['files', kind, ...rel].join('/')}
      onClose={() => (rel.length ? setRel(rel.slice(0, -1)) : props.onClose())}
      actions={<IconButton icon="x_open" title="Open folder in Explorer" onClick={() => host().openPath(cwd)} />}
      fab={
        <button className="fab" onClick={addMenu} title="Add">
          <Icon name="ic_mtrl_add" />
        </button>
      }
    >
      {rel.length > 0 && (
        <div className="row" style={{ margin: '4px 0 12px', flexWrap: 'wrap' }}>
          <button className="chip" onClick={() => setRel([])}>
            {kind}
          </button>
          {rel.map((r, i) => (
            <React.Fragment key={i}>
              <Icon name="x_chevron" size={18} style={{ color: 'var(--outline)' }} />
              <button className={'chip' + (i === rel.length - 1 ? ' on' : '')} onClick={() => setRel(rel.slice(0, i + 1))}>
                {r}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
      {entries && entries.length === 0 && <EmptyState icon={kind === 'java' ? 'ic_mtrl_java' : 'ic_mtrl_folder'} text={'No files here yet.\nPress + to create or import files.'} />}
      <div className="card-list">
        {entries?.map((e) => (
          <ListRow
            key={e.name}
            icon={fileIcon(e.name, e.dir)}
            title={e.name}
            sub={e.dir ? 'Folder' : undefined}
            onClick={() => open(e)}
            onContextMenu={(ev) => menu(ev, e)}
            trailing={
              <button className="ib" onClick={(ev) => menu(ev, e)} title="More">
                <Icon name="ic_mtrl_more_vertical" />
              </button>
            }
          />
        ))}
      </div>
    </Page>
  );
}

function NewJavaDialog(props: { onClose: () => void; onCreate: (name: string, type: string) => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Class');
  const err = !/^[A-Za-z_$][\w$]*$/.test(name) ? 'Enter a valid class name' : null;
  return (
    <Modal
      title={
        <>
          <Icon name="ic_mtrl_java" /> Create a new file
        </>
      }
      onClose={props.onClose}
      width={560}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!!err}
            onClick={() => {
              props.onCreate(name, type);
              props.onClose();
            }}
          >
            Create
          </button>
        </>
      }
    >
      <div className="row" style={{ flexWrap: 'wrap', marginBottom: 14 }}>
        {Object.keys(JAVA_TEMPLATES).map((t) => (
          <button key={t} className={'chip' + (t === type ? ' on' : '')} onClick={() => setType(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="field">
        <label>Name</label>
        <input autoFocus value={name} placeholder="MyClass" onChange={(e) => setName(e.target.value)} />
        {err && name && <div className="err">{err}</div>}
      </div>
    </Modal>
  );
}
