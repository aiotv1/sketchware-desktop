// "Create a widget" / "Widget editor" dialog (WidgetsCreatorManager.showWidgetsCreatorDialog).
import React, { useState } from 'react';
import { Modal, contextMenu } from '../common/dialogs';
import { Icon } from '../icons/Icon';
import { CustomWidget, BASE_WIDGETS, baseType, customWidgetIdBase } from './customWidgets';
import { viewTypeName } from '../../sw/viewtypes';
import { viewIcon } from '../icons/iconmap';
import CONVERT_OPTIONS from './convertOptions.json';

export function WidgetCreatorDialog(props: {
  initial: CustomWidget | null;
  categories: string[];
  onClose: () => void;
  onSave: (w: CustomWidget) => void;
  onImport: () => void;
  onExportAll: () => void;
}) {
  const i = props.initial;
  const [title, setTitle] = useState(i?.title ?? '');
  const [name, setName] = useState(i?.name ?? '');
  const [type, setType] = useState(i ? viewTypeName(i.type) || 'TextView' : 'TextView');
  const [category, setCategory] = useState(i?.Class ?? 'Widgets');
  const [newCategory, setNewCategory] = useState('');
  const [inject, setInject] = useState(i?.inject ?? '');
  const cat = category === '__new' ? newCategory.trim() : category;
  const missing = !title.trim() ? 'Widget title' : !name.trim() ? 'Widget class name' : !type ? 'Widget type' : !cat ? 'Category' : null;
  const typeId = baseType(type);
  const types = BASE_WIDGETS.includes(type) ? BASE_WIDGETS : [type, ...BASE_WIDGETS];
  return (
    <Modal
      title={
        <>
          <Icon name="ic_mtrl_component" /> {i ? 'Widget editor' : 'Create a widget'}
        </>
      }
      onClose={props.onClose}
      width={640}
      footer={
        <>
          {!i && (
            <button
              className="text"
              onClick={(e) =>
                contextMenu(e.clientX, e.clientY - 100, [
                  {
                    label: 'Import widgets',
                    icon: 'x_import',
                    onClick: () => {
                      props.onClose();
                      props.onImport();
                    },
                  },
                  { label: 'Export all widgets', icon: 'x_export', onClick: props.onExportAll },
                ])
              }
            >
              See more
            </button>
          )}
          <div className="grow" />
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!!missing}
            title={missing ? missing + ' is required' : undefined}
            onClick={() => {
              props.onSave({ Class: cat, title: title.trim(), name: name.trim(), inject, type: typeId, position: i?.position });
              props.onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="field grow">
          <label>Widget title (shown in the palette)</label>
          <input autoFocus value={title} placeholder="e.g. Rounded Button" onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field grow">
          <label>Widget class name</label>
          <input className="mono" list="widget-class-options" value={name} placeholder="e.g. com.google.android.material.chip.Chip" onChange={(e) => setName(e.target.value)} />
          <datalist id="widget-class-options">
            {(CONVERT_OPTIONS as string[]).map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="field grow">
          <label>Widget type (base view: decides properties and blocks)</label>
          <div className="row">
            <Icon name={viewIcon(typeId, 1)} style={{ color: 'var(--on-surface-variant)' }} />
            <select className="grow" value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field grow">
          <label>Add to</label>
          <select value={props.categories.includes(category) ? category : category === '__new' ? '__new' : category} onChange={(e) => setCategory(e.target.value)}>
            {[...new Set([...props.categories, ...(i && !props.categories.includes(i.Class) ? [i.Class] : [])])].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__new">New category…</option>
          </select>
          {category === '__new' && <input style={{ marginTop: 6 }} placeholder="New category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />}
        </div>
      </div>
      <div className="field">
        <label>Inject (extra XML attributes, one per line)</label>
        <textarea className="mono" rows={6} value={inject} placeholder={'app:chipIcon="@drawable/ic_add"\napp:chipCornerRadius="16dp"'} onChange={(e) => setInject(e.target.value)} />
      </div>
      {name.trim() && (
        <div className="muted small">
          New views will be named <span className="mono">{customWidgetIdBase(name.trim())}1</span>, <span className="mono">{customWidgetIdBase(name.trim())}2</span>… and generated as <span className="mono">&lt;{name.trim()}&gt;</span>.
        </div>
      )}
    </Modal>
  );
}
