import React, { useState } from 'react';
import { EventBean } from '../../core/beans';
import { ProjectStore, useStore } from './store';
import { addableEvents, listEvents, EventEntry } from './eventinfo';
import { Modal, mount, confirmDialog, contextMenu, toast } from '../common/dialogs';
import { MoreBlockDialog } from '../logic/paletteActions';
import { Icon } from '../icons/Icon';
import { eventIcon } from '../icons/iconmap';
import { Fab, EmptyState } from '../common/m3';

type Cat = EventEntry['category'];
const RAIL: { key: Cat; label: string; icon: string }[] = [
  { key: 'activity', label: 'Activity', icon: 'ic_mtrl_lifecycle' },
  { key: 'view', label: 'View', icon: 'ic_mtrl_view_vertical' },
  { key: 'component', label: 'Component', icon: 'ic_mtrl_component' },
  { key: 'drawer', label: 'Drawer', icon: 'ic_drawer' },
  { key: 'moreblock', label: 'Moreblock', icon: 'ic_mtrl_moreblock' },
];

const plainTitle = (t: string) => t.replace(/%\w(\.\w+)*/g, (m) => m.split('.').pop()!);

export function EventTab(props: { store: ProjectStore; onOpen: (e: EventEntry) => void }) {
  const store = useStore(props.store);
  const p = store.project;
  const file = store.file;
  const [cat, setCat] = useState<Cat>('activity');
  if (file.fileType !== 0) return <EmptyState icon="ic_mtrl_java" text="Events are available for activities only." />;
  const all = listEvents(p, file);
  const events = all.filter((e) => e.category === cat);
  const java = file.getJavaName();
  const blockCount = (e: EventEntry) => p.getBlocks(java, e.id + '_' + e.eventName).length;

  const remove = async (e: EventEntry) => {
    if (e.category === 'moreblock') {
      const used = [...(p.blocks.get(java)?.entries() ?? [])].some(([k, list]) => k !== e.id + '_moreBlock' && list.some((b) => b.opCode === 'definedFunc' && b.spec.split(' ')[0] === e.id));
      if (used) {
        toast('This block is currently in use', true);
        return;
      }
      if (!(await confirmDialog('Delete more block', `Delete "${e.id}" and its blocks?`, 'Delete', true))) return;
      const funcs = p.getFuncs(java);
      funcs.splice(funcs.findIndex((f) => f[0] === e.id), 1);
      p.setBlocks(java, e.id + '_moreBlock', []);
    } else {
      if (e.id === 'onCreate') return;
      if (!(await confirmDialog('Delete event', `Delete "${plainTitle(e.title)}" and its blocks?`, 'Delete', true))) return;
      const list = p.getEvents(java);
      list.splice(list.indexOf(e.bean), 1);
      p.setBlocks(java, e.id + '_' + e.eventName, []);
    }
    store.changed();
  };

  const add = () => {
    if (cat === 'moreblock')
      mount((close) => (
        <MoreBlockDialog
          store={store}
          file={file}
          onClose={close}
          onAdded={() => {
            close();
            store.changed();
          }}
        />
      ));
    else mount((close) => <AddEventDialog store={store} onClose={close} initial={cat} />);
  };

  const menu = (ev: React.MouseEvent, e: EventEntry) => {
    ev.preventDefault();
    ev.stopPropagation();
    contextMenu(ev.clientX, ev.clientY, [
      { label: 'Open', icon: 'ic_mtrl_edit', onClick: () => props.onOpen(e) },
      { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, disabled: e.id === 'onCreate', onClick: () => remove(e) },
    ]);
  };

  return (
    <div className="event-tab">
      <div className="navrail">
        {RAIL.map((r) => (
          <button key={r.key} className={cat === r.key ? 'active' : ''} onClick={() => setCat(r.key)}>
            <span className="pill">
              <Icon name={r.icon} />
            </span>
            {r.label}
          </button>
        ))}
      </div>
      <div className="event-list">
        {events.length === 0 && <EmptyState text={cat === 'moreblock' ? 'No more blocks yet.\nPress + to define one.' : 'No events here yet.\nPress + to add events.'} />}
        {events.map((e) => {
          const n = blockCount(e);
          const isMore = e.category === 'moreblock';
          return (
            <div key={e.id + e.eventName} className="event-card" onClick={() => props.onOpen(e)} onContextMenu={(ev) => menu(ev, e)}>
              <Icon name={isMore ? 'ic_mtrl_moreblock' : eventIcon(e.bean.eventType, e.bean.targetType)} />
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="ev-name ellipsis">{isMore ? e.id : e.category === 'activity' ? e.id : `${e.bean.targetId} : ${e.eventName}`}</div>
                <div className="ev-desc ellipsis">{plainTitle(e.title)}</div>
              </div>
              {n > 0 && <span className="count">{n} blocks</span>}
              <button className="ib" title="Options" onClick={(ev) => menu(ev, e)}>
                <Icon name="x_drop" />
              </button>
            </div>
          );
        })}
      </div>
      <Fab onClick={add} title={cat === 'moreblock' ? 'Add a more block' : 'Add events'} />
    </div>
  );
}

function AddEventDialog(props: { store: ProjectStore; onClose: () => void; initial: Cat }) {
  const { store } = props;
  const groups = addableEvents(store.project, store.file);
  const want = { activity: 'Activity', view: 'View', component: 'Component', drawer: 'Drawer', moreblock: 'Activity' }[props.initial];
  const [cat, setCat] = useState(Math.max(0, groups.findIndex((g) => g.category === want)));
  const [sel, setSel] = useState<Set<EventBean>>(new Set());
  const [q, setQ] = useState('');
  const list = groups[cat].events.filter((e) => !q || (e.targetId + ' ' + e.eventName).toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal
      title={
        <>
          <Icon name="ic_mtrl_add" /> Add events
        </>
      }
      onClose={props.onClose}
      width={720}
      footer={
        <>
          <span className="muted small grow">{sel.size} selected</span>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!sel.size}
            onClick={() => {
              store.project.getEvents(store.file.getJavaName()).push(...sel);
              store.changed();
              props.onClose();
            }}
          >
            Add
          </button>
        </>
      }
    >
      <div className="row" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
        {groups.map((g, i) => (
          <button key={g.category} className={'chip' + (i === cat ? ' on' : '')} onClick={() => setCat(i)}>
            {g.category} · {g.events.length}
          </button>
        ))}
        <input className="grow" placeholder="Filter" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 160 }} />
      </div>
      <div style={{ height: '50vh', overflow: 'auto' }}>
        {list.length === 0 && <div className="empty">No events to add here</div>}
        {list.map((e, i) => (
          <label key={i} className={'list-item' + (sel.has(e) ? ' selected' : '')}>
            <input
              type="checkbox"
              checked={sel.has(e)}
              onChange={(ev) => {
                const s = new Set(sel);
                if (ev.target.checked) s.add(e);
                else s.delete(e);
                setSel(s);
              }}
            />
            <Icon name={eventIcon(e.eventType, e.targetType)} size={20} style={{ color: 'var(--on-surface-variant)' }} />
            <span className="grow">
              {e.eventType === 3 ? e.eventName : e.targetId} <span className="muted">· {e.eventName}</span>
            </span>
          </label>
        ))}
      </div>
    </Modal>
  );
}
