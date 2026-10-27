// Global managers from Sketchware Pro's settings: Component manager, Event manager (with listeners) and Block selector menus.
// Files: <workspace>/data/system/{component.json, events.json, listeners.json}, <workspace>/resources/block/My Block/menu.json
import React, { useEffect, useState } from 'react';
import { Page, ListRow, EmptyState, IconButton } from '../common/m3';
import { Modal, mount, contextMenu, confirmDialog, toast } from '../common/dialogs';
import { Icon } from '../icons/Icon';
import { host, joinPath, baseName } from '../../core/host';
import { workspace, customBlocksDir } from '../appstate';
import { CodeEditor } from '../common/CodeEditor';
import { ensureGeneratorReady } from '../../codegen/generator';

type M = Record<string, any>;
interface Field {
  key: string;
  label: string;
  kind?: 'text' | 'multi' | 'code' | 'check' | 'list';
  hint?: string;
  required?: boolean;
}

const sysPath = (f: string) => joinPath(workspace().root, 'data', 'system', f);

async function readList(p: string): Promise<M[]> {
  try {
    if (!(await host().exists(p))) return [];
    const v = JSON.parse((await host().readText(p)) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
async function writeList(p: string, l: M[]) {
  await host().mkdir(joinPath(p, '..'));
  await host().write(p, JSON.stringify(l));
  // the code generator caches custom components/events
  await ensureGeneratorReady(workspace().root);
}

function FormDialog(props: { title: string; fields: Field[]; initial: M; onClose: () => void; onSave: (m: M) => void; wide?: boolean }) {
  const [m, setM] = useState<M>({ ...props.initial });
  const missing = props.fields.find((f) => f.required && !String(m[f.key] ?? '').trim());
  return (
    <Modal
      title={props.title}
      onClose={props.onClose}
      width={props.wide ? 860 : 620}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!!missing}
            onClick={() => {
              props.onSave(m);
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      {props.fields.map((f, i) =>
        f.kind === 'check' ? (
          <label key={f.key} className="row" style={{ margin: '6px 0 12px', color: 'var(--on-surface)' }}>
            <input type="checkbox" checked={m[f.key] === 'true' || m[f.key] === true} onChange={(e) => setM({ ...m, [f.key]: e.target.checked ? 'true' : 'false' })} /> {f.label}
          </label>
        ) : (
          <div key={f.key} className="field">
            <label>
              {f.label}
              {f.required && ' *'}
            </label>
            {f.kind === 'code' ? (
              <div style={{ height: 220 }}>
                <CodeEditor value={String(m[f.key] ?? '')} lang="java" onChange={(v) => setM((x) => ({ ...x, [f.key]: v }))} />
              </div>
            ) : f.kind === 'multi' || f.kind === 'list' ? (
              <textarea
                className="mono"
                rows={f.kind === 'list' ? 8 : 3}
                placeholder={f.hint}
                value={f.kind === 'list' ? (Array.isArray(m[f.key]) ? m[f.key].join('\n') : String(m[f.key] ?? '')) : String(m[f.key] ?? '')}
                onChange={(e) => setM({ ...m, [f.key]: f.kind === 'list' ? e.target.value.split('\n') : e.target.value })}
              />
            ) : (
              <input autoFocus={i === 0} className="mono" placeholder={f.hint} value={String(m[f.key] ?? '')} onChange={(e) => setM({ ...m, [f.key]: e.target.value })} />
            )}
          </div>
        ),
      )}
    </Modal>
  );
}

/** A list of JSON maps with add/edit/delete/import/export, used by the managers below. */
function MapListPage(props: {
  title: string;
  subtitle?: string;
  path: string;
  fields: Field[];
  icon: string;
  itemTitle: (m: M) => string;
  itemSub?: (m: M) => string;
  filter?: (m: M) => boolean;
  defaults?: M;
  emptyText: string;
  onClose: () => void;
  wide?: boolean;
  header?: React.ReactNode;
  exportName: string;
}) {
  const [all, setAll] = useState<M[] | null>(null);
  const reload = async () => setAll(await readList(props.path));
  useEffect(() => {
    reload();
  }, []);
  if (!all) return null;
  const rows = all.map((m, i) => ({ m, i })).filter(({ m }) => !props.filter || props.filter(m));
  const commit = async (l: M[]) => {
    setAll(l);
    await writeList(props.path, l);
  };
  const edit = (i: number | null) =>
    mount((c) => (
      <FormDialog
        title={i == null ? 'Add' : 'Edit'}
        fields={props.fields}
        wide={props.wide}
        initial={i == null ? props.defaults ?? {} : all[i]}
        onClose={c}
        onSave={(m) => commit(i == null ? [...all, m] : all.map((x, j) => (j === i ? m : x)))}
      />
    ));
  const importFile = async () => {
    const f = await host().openDialog({ title: 'Import', properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json', 'txt'] }] });
    if (!f) return;
    try {
      const l = JSON.parse(await host().readText(f[0]));
      const items: M[] = Array.isArray(l) ? l : [l];
      await commit([...all, ...items.map((x) => ({ ...(props.defaults ?? {}), ...x }))]);
      toast(`Imported ${items.length} item(s)`);
    } catch (e: any) {
      toast('Invalid file: ' + (e?.message ?? e), true);
    }
  };
  const exportFile = async () => {
    const out = await host().saveDialog({ title: 'Export', defaultPath: props.exportName, filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (!out) return;
    await host().write(out, JSON.stringify(rows.map((r) => r.m), null, 2));
    toast('Exported to ' + baseName(out));
  };
  return (
    <Page
      title={props.title}
      subtitle={props.subtitle ?? `${rows.length} items`}
      onClose={props.onClose}
      actions={
        <>
          <IconButton icon="x_import" title="Import" onClick={importFile} />
          <IconButton icon="x_export" title="Export" onClick={exportFile} disabled={!rows.length} />
        </>
      }
      fab={
        <button className="fab" onClick={() => edit(null)}>
          <Icon name="ic_mtrl_add" />
        </button>
      }
    >
      {props.header}
      {rows.length === 0 && <EmptyState icon={props.icon} text={props.emptyText} />}
      <div className="card-list">
        {rows.map(({ m, i }) => (
          <ListRow
            key={i}
            icon={props.icon}
            title={props.itemTitle(m) || '(no name)'}
            sub={props.itemSub?.(m)}
            onClick={() => edit(i)}
            onContextMenu={(e) => {
              e.preventDefault();
              contextMenu(e.clientX, e.clientY, [
                { label: 'Edit', icon: 'ic_mtrl_edit', onClick: () => edit(i) },
                { label: 'Duplicate', icon: 'x_copy', onClick: () => commit([...all.slice(0, i + 1), { ...m }, ...all.slice(i + 1)]) },
                {
                  label: 'Delete',
                  icon: 'ic_mtrl_delete',
                  danger: true,
                  onClick: async () => {
                    if (await confirmDialog('Delete', `Delete "${props.itemTitle(m)}"?`, 'Delete', true)) commit(all.filter((_, j) => j !== i));
                  },
                },
              ]);
            }}
          />
        ))}
      </div>
    </Page>
  );
}

// ------------------------------------------------------------------ Component manager
const COMPONENT_FIELDS: Field[] = [
  { key: 'name', label: 'Component name', required: true, hint: 'e.g. Toolbar helper' },
  { key: 'id', label: 'Component id (type number, unique)', required: true, hint: 'e.g. 36' },
  { key: 'icon', label: 'Icon (drawable resource id)', hint: '2131166216' },
  { key: 'varName', label: 'Variable name prefix', hint: 'e.g. tb' },
  { key: 'typeName', label: 'Type name (used by blocks, %m.<typeName>)', required: true },
  { key: 'class', label: 'Class name (used for blocks/events)', hint: 'e.g. Toolbar' },
  { key: 'buildClass', label: 'Build class (variable type in Java)', hint: 'e.g. androidx.appcompat.widget.Toolbar' },
  { key: 'description', label: 'Description', kind: 'multi' },
  { key: 'url', label: 'Documentation URL' },
  { key: 'defineAdditionalVar', label: 'Define additional variable (code)', kind: 'multi' },
  { key: 'additionalVar', label: 'Additional variable (code in onCreate)', kind: 'multi' },
  { key: 'imports', label: 'Imports', kind: 'multi', hint: 'import ...;' },
];

export function ComponentManager(props: { onClose: () => void }) {
  return (
    <MapListPage
      title="Component manager"
      path={sysPath('component.json')}
      fields={COMPONENT_FIELDS}
      icon="ic_mtrl_component"
      itemTitle={(m) => String(m.name ?? '')}
      itemSub={(m) => `id ${m.id ?? '?'} · ${m.typeName ?? ''}${m.buildClass ? ' · ' + m.buildClass : ''}`}
      emptyText={'No custom components.\nCustom components appear in the Component tab of every project.'}
      exportName="components.json"
      onClose={props.onClose}
    />
  );
}

// ------------------------------------------------------------------ Event manager
const EVENT_FIELDS: Field[] = [
  { key: 'name', label: 'Event name', required: true, hint: 'e.g. onScrolled' },
  { key: 'var', label: 'Variable / class name (empty for activity events)', hint: 'e.g. RecyclerView' },
  { key: 'icon', label: 'Icon (drawable resource id)', hint: '2131165298' },
  { key: 'description', label: 'Description' },
  { key: 'parameters', label: 'Parameters (Java signature)', hint: 'final RecyclerView _param1, final int _param2' },
  { key: 'headerSpec', label: 'Header spec (text of the event block)', hint: 'on scrolled %d.dx %d.dy' },
  { key: 'code', label: 'Code', kind: 'code' },
];
const LISTENER_FIELDS: Field[] = [
  { key: 'name', label: 'Listener name', required: true },
  { key: 'code', label: 'Code (use "@" where the events go)', kind: 'code' },
  { key: 's', label: 'Independent class or method', kind: 'check' },
  { key: 'imports', label: 'Custom imports', kind: 'multi' },
];

export function EventManager(props: { onClose: () => void }) {
  const [listeners, setListeners] = useState<M[] | null>(null);
  const [events, setEvents] = useState<M[]>([]);
  const reload = async () => {
    setListeners(await readList(sysPath('listeners.json')));
    setEvents(await readList(sysPath('events.json')));
  };
  useEffect(() => {
    reload();
  }, []);
  if (!listeners) return null;
  const count = (l: string) => events.filter((e) => String(e.listener ?? '') === l).length;
  const openEvents = (listener: string) =>
    mount((c) => (
      <MapListPage
        title={listener ? listener : 'Activity events'}
        subtitle={listener ? 'Events of this listener' : 'Events added to every activity'}
        path={sysPath('events.json')}
        fields={EVENT_FIELDS}
        icon="ic_mtrl_list"
        filter={(m) => String(m.listener ?? '') === listener}
        defaults={{ listener, icon: '2131165298', var: '' }}
        itemTitle={(m) => String(m.name ?? '')}
        itemSub={(m) => (listener ? String(m.var ?? '') : 'Activity event')}
        emptyText="No events yet."
        exportName={(listener || 'activity_events') + '.json'}
        wide
        onClose={() => (c(), reload())}
      />
    ));
  const editListener = (i: number | null) =>
    mount((c) => (
      <FormDialog
        title={i == null ? 'New Listener' : 'Edit Listener'}
        fields={LISTENER_FIELDS}
        wide
        initial={i == null ? { s: 'false', imports: '' } : { ...listeners[i], code: listeners[i].s === 'true' ? String(listeners[i].code).replace(new RegExp('^//' + listeners[i].name + '\\n'), '') : listeners[i].code }}
        onClose={c}
        onSave={async (m) => {
          const item = { ...m, code: m.s === 'true' ? '//' + m.name + '\n' + (m.code ?? '') : m.code ?? '' };
          const l = i == null ? [...listeners, item] : listeners.map((x, j) => (j === i ? item : x));
          await writeList(sysPath('listeners.json'), l);
          reload();
        }}
      />
    ));
  return (
    <Page
      title="Event manager"
      subtitle={`${events.length} events · ${listeners.length} listeners`}
      onClose={props.onClose}
      fab={
        <button className="fab" onClick={() => editListener(null)}>
          <Icon name="ic_mtrl_add" /> New listener
        </button>
      }
    >
      <div className="card-list" style={{ marginTop: 8 }}>
        <ListRow icon="ic_mtrl_lifecycle" title="Activity events" sub={`${count('')} events`} chevron onClick={() => openEvents('')} />
      </div>
      <div className="section-title">Listeners</div>
      {listeners.length === 0 && <EmptyState icon="ic_mtrl_list" text={'No listeners.\nA listener groups events of a view or class (e.g. a RecyclerView scroll listener).'} />}
      <div className="card-list">
        {listeners.map((l, i) => (
          <ListRow
            key={i}
            icon="ic_mtrl_list"
            title={String(l.name)}
            sub={`${count(String(l.name))} events`}
            chevron
            onClick={() => openEvents(String(l.name))}
            onContextMenu={(e) => {
              e.preventDefault();
              contextMenu(e.clientX, e.clientY, [
                { label: 'Edit listener', icon: 'ic_mtrl_edit', onClick: () => editListener(i) },
                {
                  label: 'Delete',
                  icon: 'ic_mtrl_delete',
                  danger: true,
                  onClick: async () => {
                    if (!(await confirmDialog('Delete listener', `Delete "${l.name}" and its ${count(String(l.name))} events?`, 'Delete', true))) return;
                    await writeList(
                      sysPath('listeners.json'),
                      listeners.filter((_, j) => j !== i),
                    );
                    await writeList(
                      sysPath('events.json'),
                      events.filter((e) => e.listener !== l.name),
                    );
                    reload();
                  },
                },
              ]);
            }}
          />
        ))}
      </div>
    </Page>
  );
}

// ------------------------------------------------------------------ Block selector menus
export function BlockSelectorManager(props: { onClose: () => void }) {
  return (
    <MapListPage
      title="Block selector menu manager"
      path={joinPath(customBlocksDir(), 'menu.json')}
      fields={[
        { key: 'title', label: 'Title (shown on the menu dialog)', required: true },
        { key: 'name', label: 'Name (use it in a block spec as %m.<name>)', required: true },
        { key: 'data', label: 'Options (one per line)', kind: 'list' },
      ]}
      icon="ic_mtrl_pull_down"
      defaults={{ data: [] }}
      itemTitle={(m) => String(m.title ?? m.name ?? '')}
      itemSub={(m) => `%m.${m.name} · ${(m.data ?? []).length} options`}
      emptyText={'No selector menus.\nCreate a menu, then use %m.<name> in your custom block specs.'}
      exportName="All_Menus.json"
      onClose={props.onClose}
    />
  );
}
