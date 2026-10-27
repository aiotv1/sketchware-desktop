import React from 'react';
import { ProjectStore, useStore } from './store';
import { componentLabel } from './eventinfo';
import { AddComponentDialog } from './ComponentDialogs';
import { mount, confirmDialog, contextMenu } from '../common/dialogs';
import { Icon } from '../icons/Icon';
import { componentIcon } from '../icons/iconmap';
import { Fab, EmptyState } from '../common/m3';
import { ComponentBean } from '../../core/beans';

export function ComponentTab(props: { store: ProjectStore }) {
  const store = useStore(props.store);
  const p = store.project;
  const file = store.file;
  if (file.fileType !== 0) return <EmptyState icon="ic_mtrl_java" text="Components are available for activities only." />;
  const java = file.getJavaName();
  const comps = p.getComponents(java);

  const remove = async (c: ComponentBean) => {
    if (!(await confirmDialog('Delete component', `Delete "${c.componentId}"? Its events will be removed too.`, 'Delete', true))) return;
    comps.splice(comps.indexOf(c), 1);
    const evs = p.getEvents(java);
    for (let j = evs.length - 1; j >= 0; j--) {
      if (evs[j].eventType === 2 && evs[j].targetId === c.componentId) {
        p.setBlocks(java, evs[j].targetId + '_' + evs[j].eventName, []);
        evs.splice(j, 1);
      }
    }
    store.changed();
  };

  return (
    <div className="event-tab">
      <div className="event-list" style={{ paddingLeft: 16 }}>
        {comps.length === 0 && <EmptyState text="No components to display" />}
        {comps.map((c) => (
          <div
            key={c.componentId}
            className="event-card"
            onContextMenu={(e) => {
              e.preventDefault();
              contextMenu(e.clientX, e.clientY, [{ label: 'Delete', icon: 'ic_mtrl_delete', danger: true, onClick: () => remove(c) }]);
            }}
          >
            <Icon name={componentIcon(c.type)} />
            <div className="grow">
              <div className="ev-name">{c.componentId}</div>
              <div className="ev-desc">
                {componentLabel(c)}
                {c.param1 ? ' · ' + c.param1 : ''}
              </div>
            </div>
            <button className="ib" title="Delete" onClick={() => remove(c)}>
              <Icon name="ic_mtrl_delete" />
            </button>
          </div>
        ))}
      </div>
      <Fab
        title="Add component"
        onClick={() =>
          mount((close) => (
            <AddComponentDialog
              store={store}
              file={file}
              onClose={close}
              onAdded={() => {
                close();
                store.changed();
              }}
            />
          ))
        }
      />
    </div>
  );
}
