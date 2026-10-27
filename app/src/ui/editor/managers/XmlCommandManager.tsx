// XML Command Manager (ManageXMLCommandActivity). Data: data/<id>/command, enabled by project_config "xml_command".
import React, { useEffect, useRef, useState } from 'react';
import { ProjectStore } from '../store';
import { Page, ListRow, EmptyState, IconButton } from '../../common/m3';
import { Modal, mount, contextMenu, confirmDialog, toast } from '../../common/dialogs';
import { Icon } from '../../icons/Icon';
import { CodePage } from '../CodePage';
import { ProjectSettings } from '../../../sw/ProjectSettings';
import { generateSourceFiles } from '../../../codegen/generator';
import { dataPath, readJson, writeJson, MapList } from './util';

const ACTIONS = ['insert', 'add', 'replace', 'find-replace', 'find-replace-first', 'find-replace-all'];
const inputName = (input: string) => (input.startsWith('>') ? input.split('\n')[0].substring(1) : '');
const inputBody = (input: string) => (input.includes('\n') ? input.substring(input.indexOf('\n') + 1) : '');

export function XmlCommandManager(props: { store: ProjectStore; onClose: () => void }) {
  const { store } = props;
  const settings = useRef(new ProjectSettings(store.scId)).current;
  const path = dataPath(store, 'command');
  const [enabled, setEnabled] = useState(settings.getValue(ProjectSettings.SETTING_NEW_XML_COMMAND, 'false') === 'true');
  const [list, setList] = useState<MapList>([]);
  const xmlFiles = [...store.project.activities.map((f) => f.getXmlName()), ...store.project.customViews.map((f) => f.getXmlName()), 'strings.xml', 'colors.xml', 'styles.xml', 'AndroidManifest.xml'];

  useEffect(() => {
    if (enabled) readJson<MapList>(path, []).then(setList);
  }, [enabled]);

  const enable = async () => {
    if (!(await confirmDialog('Confirmation', 'Would you like to enable the new XML Command? It will speed up XML generation and compilation, but this change cannot be undone.', 'Yes'))) return props.onClose();
    settings.setValue(ProjectSettings.SETTING_NEW_XML_COMMAND, ProjectSettings.SETTING_GENERIC_VALUE_TRUE);
    if (!(await readJson<MapList | null>(path, null))) await writeJson(path, []);
    setEnabled(true);
  };
  useEffect(() => {
    if (!enabled) enable();
  }, []);

  const save = async (l: MapList) => {
    setList(l);
    await writeJson(path, l);
  };
  const edit = (i: number | null) => mount((c) => <CommandDialog files={xmlFiles} initial={i == null ? null : list[i]} onClose={c} onSave={(m) => save(i == null ? [...list, m] : list.map((x, j) => (j === i ? m : x)))} />);
  const move = (i: number, d: number) => {
    const l = list.slice();
    [l[i], l[i + d]] = [l[i + d], l[i]];
    save(l);
  };
  const showXml = () =>
    mount((c) => (
      <XmlPicker
        files={xmlFiles}
        onClose={c}
        onPick={(f) => {
          try {
            const src = generateSourceFiles(store.project, store.ws.root).find((x) => x.name === f)?.source ?? 'Failed to generate source.';
            mount((cc) => <CodePage title={f} text={src} lang="xml" onClose={cc} />);
          } catch (e: any) {
            toast(String(e?.message ?? e), true);
          }
        }}
      />
    ));

  return (
    <Page
      title="XML Command Manager"
      onClose={props.onClose}
      actions={<IconButton icon="ic_mtrl_frame_source" title="Show generated XML" onClick={showXml} />}
      fab={
        enabled ? (
          <button className="fab" onClick={() => edit(null)} title="Add new command">
            <Icon name="ic_mtrl_add" />
          </button>
        ) : undefined
      }
    >
      {enabled && list.length === 0 && <EmptyState icon="ic_mtrl_code" text={'No commands yet.\nCommands modify the generated XML files (layouts, strings, manifest…).'} />}
      <div className="card-list">
        {list.map((m, i) => (
          <ListRow
            key={i}
            icon="ic_mtrl_code"
            title={
              <>
                <span style={{ color: 'var(--primary)' }}>{String(m.command)}</span> · <span className="mono">{String(m.reference)}</span>
              </>
            }
            sub={`${inputName(String(m.input ?? ''))} · distance ${m.distance} · front ${m.after} · back ${m.before}`}
            onClick={() => edit(i)}
            onContextMenu={(e) => {
              e.preventDefault();
              contextMenu(e.clientX, e.clientY, [
                { label: 'Edit', icon: 'ic_mtrl_edit', onClick: () => edit(i) },
                { label: 'Move up', icon: 'x_upward', disabled: i === 0, onClick: () => move(i, -1) },
                { label: 'Move down', icon: 'x_downward', disabled: i === list.length - 1, onClick: () => move(i, 1) },
                { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, onClick: () => save(list.filter((_, j) => j !== i)) },
              ]);
            }}
          />
        ))}
      </div>
    </Page>
  );
}

function XmlPicker(props: { files: string[]; onClose: () => void; onPick: (f: string) => void }) {
  return (
    <Modal title="Select file" onClose={props.onClose} footer={<button onClick={props.onClose}>Cancel</button>}>
      {props.files.map((f) => (
        <div
          key={f}
          className="list-item"
          onClick={() => {
            props.onClose();
            props.onPick(f);
          }}
        >
          <Icon name="ic_mtrl_code" size={20} /> {f}
        </div>
      ))}
    </Modal>
  );
}

function CommandDialog(props: { files: string[]; initial: Record<string, any> | null; onClose: () => void; onSave: (m: Record<string, any>) => void }) {
  const i = props.initial;
  const num = (v: any) => String(Math.trunc(Number(v ?? 0)) || 0);
  const [xml, setXml] = useState(i ? inputName(String(i.input ?? '')) : props.files[0]);
  const [reference, setReference] = useState(i ? String(i.reference) : '');
  const [command, setCommand] = useState(i ? String(i.command) : 'insert');
  const [distance, setDistance] = useState(i ? num(i.distance) : '0');
  const [front, setFront] = useState(i ? num(i.after) : '0');
  const [back, setBack] = useState(i ? num(i.before) : '0');
  const [changes, setChanges] = useState(i ? inputBody(String(i.input ?? '')) : '');
  return (
    <Modal
      title={i ? 'Edit command' : 'Add new command'}
      onClose={props.onClose}
      width={680}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!xml || !reference.trim()}
            onClick={() => {
              props.onSave({ reference, distance: Number(distance) || 0, after: Number(front) || 0, before: Number(back) || 0, command, input: '>' + xml + '\n' + changes });
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="row">
        <div className="field grow">
          <label>XML file</label>
          <input list="xmlcmd-files" value={xml} onChange={(e) => setXml(e.target.value)} />
          <datalist id="xmlcmd-files">
            {props.files.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </div>
        <div className="field" style={{ width: 200 }}>
          <label>Command</label>
          <select value={command} onChange={(e) => setCommand(e.target.value)}>
            {ACTIONS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Reference (text to find in the file)</label>
        <input className="mono" value={reference} onChange={(e) => setReference(e.target.value)} />
      </div>
      <div className="row">
        <div className="field grow">
          <label>Distance</label>
          <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} />
        </div>
        <div className="field grow">
          <label>Front</label>
          <input type="number" value={front} onChange={(e) => setFront(e.target.value)} />
        </div>
        <div className="field grow">
          <label>Back</label>
          <input type="number" value={back} onChange={(e) => setBack(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Changes</label>
        <textarea className="mono" rows={8} value={changes} onChange={(e) => setChanges(e.target.value)} />
      </div>
    </Modal>
  );
}
