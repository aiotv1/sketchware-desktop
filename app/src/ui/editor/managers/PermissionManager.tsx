// Permission Manager (ManagePermissionActivity). Data: data/<id>/permission (JSON array of permission names)
import React, { useEffect, useState } from 'react';
import { ProjectStore } from '../store';
import { Page, IconButton } from '../../common/m3';
import { confirmDialog } from '../../common/dialogs';
import { Icon } from '../../icons/Icon';
import { dataPath, readJson, writeJson } from './util';
import ALL from './permissions.json';

export function PermissionManager(props: { store: ProjectStore; onClose: () => void }) {
  const path = dataPath(props.store, 'permission');
  const [sel, setSel] = useState<string[] | null>(null);
  const [initial, setInitial] = useState<string[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => {
    readJson<string[]>(path, []).then((l) => {
      setSel(l);
      setInitial(l);
    });
  }, []);
  if (!sel) return null;
  const toggle = (p: string) => {
    const next = sel.includes(p) ? sel.filter((x) => x !== p) : [...sel, p];
    setSel(next);
    writeJson(path, next);
  };
  // checked ones first (as the app sorts them), then alphabetical
  const list = [...new Set([...(ALL as string[]), ...sel])]
    .filter((p) => !q || p.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(!initial.includes(a)) - Number(!initial.includes(b)) || a.localeCompare(b));
  return (
    <Page
      title="Permission Manager"
      subtitle={`${sel.length} selected`}
      onClose={props.onClose}
      actions={
        <IconButton
          icon="ic_mtrl_delete"
          title="Reset (uncheck all)"
          onClick={async () => {
            if (!(await confirmDialog('Reset permissions', 'Uncheck all custom permissions?', 'Reset', true))) return;
            setSel([]);
            writeJson(path, []);
          }}
        />
      }
    >
      <div className="search-bar" style={{ maxWidth: 'none', margin: '4px 0 14px' }}>
        <Icon name="ic_mtrl_search" />
        <input autoFocus placeholder="Search permissions" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="card-list plain">
        {list.map((p) => (
          <label key={p} className="list-row" style={{ minHeight: 52, padding: '10px 20px' }}>
            <input type="checkbox" checked={sel.includes(p)} onChange={() => toggle(p)} />
            <div className="grow">
              <div className="lr-title mono" style={{ fontSize: 14 }}>
                {p.split('.').pop()}
              </div>
              <div className="lr-sub">{p}</div>
            </div>
          </label>
        ))}
      </div>
    </Page>
  );
}
