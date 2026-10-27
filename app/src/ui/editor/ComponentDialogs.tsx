import React, { useState } from 'react';
import { ComponentBean, ProjectFileBean } from '../../core/beans';
import { ProjectStore } from './store';
import { Modal } from '../common/dialogs';
import { COMPONENT_CHOICES } from './eventinfo';
import { usedNames, validateIdentifier } from '../logic/paletteActions';
import { Icon } from '../icons/Icon';
import { componentIcon } from '../icons/iconmap';

export function AddComponentDialog(props: { store: ProjectStore; file: ProjectFileBean; onClose: () => void; onAdded: () => void }) {
  const [type, setType] = useState<number | null>(null);
  const [id, setId] = useState('');
  const [param, setParam] = useState('');
  const used = usedNames(props.store, props.file);
  const choice = COMPONENT_CHOICES.find((c) => c.type === type);
  const err = type == null ? 'Select a component' : validateIdentifier(id, used);
  const paramErr = choice?.param === 'filename' && !param ? 'Enter a file name' : choice?.param === 'mime' && !/^[\w*-]+\/[\w*.+-]+$/.test(param) ? 'Enter a MIME type like image/*' : null;
  return (
    <Modal
      title="Add component"
      onClose={props.onClose}
      width={640}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!!err || !!paramErr}
            onClick={() => {
              props.store.project.getComponents(props.file.getJavaName()).push(new ComponentBean(type!, id, param));
              props.onAdded();
            }}
          >
            Add
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
        {COMPONENT_CHOICES.map((c) => (
          <div
            key={c.type}
            className={'list-item' + (c.type === type ? ' selected' : '')}
            style={{ background: c.type === type ? undefined : 'var(--surface-c)' }}
            onClick={() => {
              setType(c.type);
              // suggest "<type>N" with the first free N, unless the user already typed a custom name
              if (!id || /^[a-z]+\d+$/.test(id)) {
                const base = c.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 12);
                let n = 1;
                while (used.has(base + n)) n++;
                setId(base + n);
              }
              setParam(c.param === 'mime' ? '*/*' : '');
            }}
          >
            <Icon name={componentIcon(c.type)} size={20} />
            {c.name}
          </div>
        ))}
      </div>
      {type != null && (
        <>
          <div className="field">
            <label>Name</label>
            <input autoFocus value={id} onChange={(e) => setId(e.target.value)} />
            {err && id && <div className="err">{err}</div>}
          </div>
          {choice?.param === 'filename' && (
            <div className="field">
              <label>File name</label>
              <input value={param} onChange={(e) => setParam(e.target.value)} />
            </div>
          )}
          {choice?.param === 'firebasePath' && (
            <div className="field">
              <label>Firebase path</label>
              <input value={param} onChange={(e) => setParam(e.target.value)} />
            </div>
          )}
          {choice?.param === 'mime' && (
            <div className="field">
              <label>MIME type</label>
              <input value={param} onChange={(e) => setParam(e.target.value)} />
              {paramErr && <div className="err">{paramErr}</div>}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
