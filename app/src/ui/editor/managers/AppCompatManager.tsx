// AppCompat Manager (ManageAppCompatActivity). Data: data/<id>/injection/appcompat/<layout name> = [{type, value}]
import React, { useEffect, useState } from 'react';
import { ProjectStore, useStore } from '../store';
import { Page, ListRow, EmptyState, Tabs, IconButton } from '../../common/m3';
import { Modal, mount, contextMenu, confirmDialog, toast } from '../../common/dialogs';
import { Icon } from '../../icons/Icon';
import { ProjectFileBean } from '../../../core/beans';
import { AppCompatInjection } from '../../../sw/AppCompatInjection';
import { dataPath, readText, writeText, MapList } from './util';

export function AppCompatManager(props: { store: ProjectStore; onClose: () => void }) {
  const store = useStore(props.store);
  const p = store.project;
  const [file, setFile] = useState<ProjectFileBean>(store.file.fileType === 0 ? store.file : p.activities[0]);
  const [list, setList] = useState<MapList | null>(null);
  const path = dataPath(store, 'injection', 'appcompat', file.getXmlName().replace(/\.xml$/, ''));

  const tabs: string[] = [];
  if (p.compat.useYn === 'Y') {
    if (file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR)) tabs.push('Toolbar', 'AppBarLayout');
    if (file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR) || file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FAB)) tabs.push('CoordinatorLayout');
    if (file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FAB)) tabs.push('FloatingActionButton');
    if (file.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER)) tabs.push('DrawerLayout', 'NavigationDrawer');
  }
  const [tab, setTab] = useState(tabs[0] ?? '');
  useEffect(() => {
    if (!tabs.includes(tab)) setTab(tabs[0] ?? '');
  }, [file]);

  useEffect(() => {
    (async () => {
      const t = await readText(path);
      try {
        setList(t.trim() ? JSON.parse(t) : JSON.parse(AppCompatInjection.getDefaultActivityInjections()));
      } catch {
        setList(JSON.parse(AppCompatInjection.getDefaultActivityInjections()));
      }
    })();
  }, [path]);

  const save = async (l: MapList) => {
    setList(l);
    await writeText(path, JSON.stringify(l));
    AppCompatInjection.refreshInjections();
  };
  const shown = (list ?? []).map((x, i) => ({ x, i })).filter(({ x }) => String(x.type ?? '').toLowerCase() === tab.toLowerCase());

  const edit = (i: number | null) => {
    const cur = i == null ? '' : String(list![i].value);
    const eq = cur.indexOf('=');
    mount((c) => (
      <AttrDialog
        title={i == null ? 'Add new attribute' : 'Edit attribute'}
        attr={eq > 0 ? cur.slice(0, eq) : ''}
        value={eq > 0 ? cur.slice(cur.indexOf('"') + 1, cur.length - 1) : ''}
        onClose={c}
        onSave={(a, v) => {
          const m = { type: tab.toLowerCase(), value: `${a}="${v}"` };
          const l = list!.slice();
          if (i == null) l.push(m);
          else l[i] = m;
          save(l);
          toast(i == null ? 'Added' : 'Saved');
        }}
      />
    ));
  };

  return (
    <Page
      title="AppCompat Manager"
      subtitle={file.getXmlName()}
      onClose={props.onClose}
      noContent
      actions={
        <>
          <select
            value={file.fileName}
            onChange={(e) => setFile(p.activities.find((f) => f.fileName === e.target.value)!)}
            title="Activity layout"
          >
            {p.activities.map((f) => (
              <option key={f.fileName} value={f.fileName}>
                {f.getXmlName()}
              </option>
            ))}
          </select>
          <IconButton
            icon="x_restore"
            title="Reset"
            onClick={async () => {
              if (!(await confirmDialog('Reset', `Are you sure you want to reset appcompat attributes for ${file.getXmlName()}?`, 'Reset', true))) return;
              save(JSON.parse(AppCompatInjection.getDefaultActivityInjections()));
            }}
          />
        </>
      }
      fab={
        tabs.length > 0 ? (
          <button className="fab" onClick={() => edit(null)} title="Add new attribute">
            <Icon name="ic_mtrl_add" />
          </button>
        ) : undefined
      }
    >
      {p.compat.useYn !== 'Y' ? (
        <EmptyState icon="ic_mtrl_inject" text={'AppCompat is disabled.\nPlease enable AppCompat in the Library Manager to use it.'} />
      ) : tabs.length === 0 ? (
        <EmptyState icon="ic_mtrl_inject" text={'No options are found.\nEnable Toolbar, FAB or Drawer for this activity in the View tab.'} />
      ) : (
        <>
          <Tabs value={tab} onChange={setTab} compact items={tabs.map((t) => ({ value: t, label: t }))} />
          <div className="page-content">
            {shown.length === 0 && <EmptyState text="No attributes" />}
            <div className="card-list">
              {shown.map(({ x, i }) => (
                <ListRow
                  key={i}
                  icon="ic_mtrl_code"
                  title={<span className="mono" style={{ fontSize: 14 }}>{String(x.value)}</span>}
                  onClick={(e) =>
                    contextMenu(e.clientX, e.clientY, [
                      { label: 'Edit', icon: 'ic_mtrl_edit', onClick: () => edit(i) },
                      { label: 'Delete', icon: 'ic_mtrl_delete', danger: true, onClick: () => save(list!.filter((_, j) => j !== i)) },
                    ])
                  }
                />
              ))}
            </div>
          </div>
        </>
      )}
    </Page>
  );
}

function AttrDialog(props: { title: string; attr: string; value: string; onClose: () => void; onSave: (a: string, v: string) => void }) {
  const [a, setA] = useState(props.attr);
  const [v, setV] = useState(props.value);
  return (
    <Modal
      title={props.title}
      onClose={props.onClose}
      width={520}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!a.trim() || !v.trim()}
            onClick={() => {
              props.onSave(a.trim(), v.trim());
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="field">
        <label>Attribute</label>
        <input autoFocus className="mono" placeholder="android:background" value={a} onChange={(e) => setA(e.target.value)} />
      </div>
      <div className="field">
        <label>Value</label>
        <input className="mono" placeholder="@color/colorPrimary" value={v} onChange={(e) => setV(e.target.value)} />
      </div>
    </Modal>
  );
}
