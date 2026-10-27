// Palette buttons: Add variable / list / component / more block (LogicEditorActivity dialogs).
import React, { useState } from 'react';
import { ComponentBean, ProjectFileBean } from '../../core/beans';
import { ProjectStore } from '../editor/store';
import { Modal, mount, choiceDialog, promptDialog, toast, confirmDialog } from '../common/dialogs';
import { uq } from '../../sw/uq';
import { ReturnMoreblockManager } from '../../sw/ReturnMoreblockManager';
import { parseCustomVariable } from '../../blocks/palette';
import { AddComponentDialog } from '../editor/ComponentDialogs';

export interface ActionCtx {
  store: ProjectStore;
  file: ProjectFileBean;
  java: string;
  eventName: string;
}

const RESERVED = new Set<string>([...uq.b$, ...uq.m]);

/** Names already used in an activity (vars, lists, views, components, more blocks). */
export function usedNames(store: ProjectStore, file: ProjectFileBean): Set<string> {
  const p = store.project;
  const java = file.getJavaName();
  const s = new Set<string>();
  for (const [, n] of p.getVars(java)) s.add(parseCustomVariable(n)?.name ?? n.split(' ').pop()!);
  for (const [, n] of p.getLists(java)) s.add(parseCustomVariable(n)?.name ?? n);
  for (const v of p.views.get(file.getXmlName()) ?? []) s.add(v.id);
  for (const c of p.getComponents(java)) s.add(c.componentId);
  for (const [n] of p.getFuncs(java)) s.add(n);
  return s;
}

export function validateIdentifier(name: string, used: Set<string>): string | null {
  if (!name) return 'Enter a name';
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) return 'Only letters, digits and _ (must not start with a digit)';
  if (RESERVED.has(name)) return 'This name is reserved';
  if (used.has(name)) return 'This name is already used';
  return null;
}

export async function paletteActions(action: string, ctx: ActionCtx): Promise<boolean> {
  const { store, file, java } = ctx;
  const p = store.project;
  switch (action) {
    case 'variableAdd': {
      const type = await choiceDialog('Variable type', [
        { label: 'Boolean', value: 0 },
        { label: 'Number', value: 1 },
        { label: 'String', value: 2 },
        { label: 'Map', value: 3 },
      ]);
      if (type == null) return false;
      const used = usedNames(store, file);
      const name = await promptDialog('Add variable', '', { label: 'Name', validate: (v) => validateIdentifier(v, used) });
      if (!name) return false;
      p.getVars(java).push([type, name]);
      return true;
    }
    case 'variableAddNew': {
      const decl = await promptDialog('Add custom variable', '', {
        label: 'Declaration, e.g.  private String myText = "";  or  ArrayList<Integer> items',
        validate: (v) => (parseCustomVariable(v) ? null : 'Not a valid declaration'),
      });
      if (!decl) return false;
      const c = parseCustomVariable(decl)!;
      if (usedNames(store, file).has(c.name)) {
        toast('This name is already used', true);
        return false;
      }
      p.getVars(java).push([6, decl.trim().replace(/;$/, '')]);
      return true;
    }
    case 'variableRemove': {
      const vars = p.getVars(java);
      const v = await choiceDialog(
        'Remove variable',
        vars.map((x, i) => ({ label: x[1], value: i, hint: ['boolean', 'number', 'string', 'map', '', 'custom', 'custom'][x[0]] ?? '' })),
      );
      if (v == null) return false;
      const name = parseCustomVariable(vars[v][1])?.name ?? vars[v][1].split(' ').pop()!;
      if (isNameUsedInBlocks(store, java, name) && !(await confirmDialog('Variable in use', `"${name}" is used by some blocks. Remove anyway?`, 'Remove', true))) return false;
      vars.splice(v, 1);
      return true;
    }
    case 'listAdd': {
      const type = await choiceDialog('List type', [
        { label: 'List Number', value: 1 },
        { label: 'List String', value: 2 },
        { label: 'List Map', value: 3 },
      ]);
      if (type == null) return false;
      const used = usedNames(store, file);
      const name = await promptDialog('Add list', '', { label: 'Name', validate: (v) => validateIdentifier(v, used) });
      if (!name) return false;
      p.getLists(java).push([type, name]);
      return true;
    }
    case 'listAddCustom': {
      const decl = await promptDialog('Add custom list', '', {
        label: 'Declaration, e.g.  ArrayList<Integer> numbers = new ArrayList<>()',
        validate: (v) => (parseCustomVariable(v) ? null : 'Not a valid declaration'),
      });
      if (!decl) return false;
      p.getLists(java).push([4, decl.trim().replace(/;$/, '')]);
      return true;
    }
    case 'listRemove': {
      const lists = p.getLists(java);
      const v = await choiceDialog('Remove list', lists.map((x, i) => ({ label: x[1], value: i })));
      if (v == null) return false;
      lists.splice(v, 1);
      return true;
    }
    case 'componentAdd':
      return new Promise((resolve) => {
        mount((close) => (
          <AddComponentDialog
            store={store}
            file={file}
            onClose={() => {
              close();
              resolve(false);
            }}
            onAdded={() => {
              close();
              resolve(true);
            }}
          />
        ));
      });
    case 'blockAdd':
      return new Promise((resolve) => {
        mount((close) => (
          <MoreBlockDialog
            store={store}
            file={file}
            onClose={() => {
              close();
              resolve(false);
            }}
            onAdded={() => {
              close();
              resolve(true);
            }}
          />
        ));
      });
    case 'blockImport':
      toast('Block collections are not available yet in Sketchware Desktop');
      return false;
  }
  return false;
}

function isNameUsedInBlocks(store: ProjectStore, java: string, name: string): boolean {
  for (const list of store.project.blocks.get(java)?.values() ?? []) {
    for (const b of list) {
      if ((b.opCode === 'getVar' && b.spec === name) || b.parameters.includes(name)) return true;
    }
  }
  return false;
}

type MbParam = { kind: 'b' | 'd' | 's' | 'm' | 'label'; name: string; menu?: string };

/** MakeBlockActivity: name, parameters, return type -> spec like "myBlock %s.text %d.count". */
export function MoreBlockDialog(props: { store: ProjectStore; file: ProjectFileBean; onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('');
  const [params, setParams] = useState<MbParam[]>([]);
  const [ret, setRet] = useState(' ');
  const used = usedNames(props.store, props.file);
  const err = validateIdentifier(name, used);
  const spec = [name, ...params.map((p) => (p.kind === 'label' ? p.name.replace(/ /g, '\\ ') : p.kind === 'm' ? `%m.${p.menu}.${p.name}` : `%${p.kind}.${p.name}`))].join(' ');
  const finalSpec = ReturnMoreblockManager.injectMbType(spec, name, ret);
  const paramErr = params.some((p) => p.kind !== 'label' && !/^[a-zA-Z_]\w*$/.test(p.name)) ? 'Invalid parameter name' : null;
  return (
    <Modal
      title="Create more block"
      onClose={props.onClose}
      width={620}
      footer={
        <>
          <button onClick={props.onClose}>Cancel</button>
          <button
            className="primary"
            disabled={!!err || !!paramErr}
            onClick={() => {
              props.store.project.getFuncs(props.file.getJavaName()).push([name, finalSpec]);
              props.onAdded();
            }}
          >
            Add
          </button>
        </>
      }
    >
      <div className="field">
        <label>Block name</label>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        {err && name && <div className="err">{err}</div>}
      </div>
      <div className="field">
        <label>Return type</label>
        <select value={ret} onChange={(e) => setRet(e.target.value)}>
          <option value=" ">void (command block)</option>
          <option value="s">String</option>
          <option value="d">Number</option>
          <option value="b">Boolean</option>
          <option value="a|Map">Map</option>
          <option value="l|List String">List String</option>
          <option value="l|List Map">List Map</option>
          <option value="v|View">View</option>
        </select>
      </div>
      <div className="field">
        <label>Parameters & labels</label>
        {params.map((p, i) => (
          <div className="row" key={i} style={{ marginBottom: 4 }}>
            <select
              value={p.kind}
              onChange={(e) => {
                const c = [...params];
                c[i] = { ...p, kind: e.target.value as any };
                setParams(c);
              }}
            >
              <option value="b">Boolean</option>
              <option value="d">Number</option>
              <option value="s">String</option>
              <option value="m">Typed (view/component…)</option>
              <option value="label">Label text</option>
            </select>
            {p.kind === 'm' && (
              <select
                value={p.menu ?? 'view'}
                onChange={(e) => {
                  const c = [...params];
                  c[i] = { ...p, menu: e.target.value };
                  setParams(c);
                }}
              >
                {['view', 'textview', 'edittext', 'imageview', 'listview', 'varMap', 'listStr', 'listMap', 'listInt', 'intent', 'file', 'calendar', 'timer', 'dialog', 'requestnetwork'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            )}
            <input
              className="grow"
              placeholder={p.kind === 'label' ? 'text' : 'name'}
              value={p.name}
              onChange={(e) => {
                const c = [...params];
                c[i] = { ...p, name: e.target.value };
                setParams(c);
              }}
            />
            <button className="ghost" onClick={() => setParams(params.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
        ))}
        <div className="row">
          <button onClick={() => setParams([...params, { kind: 's', name: '' }])}>+ Parameter</button>
          <button onClick={() => setParams([...params, { kind: 'label', name: '' }])}>+ Label</button>
        </div>
      </div>
      <div className="muted small mono">spec: {finalSpec}</div>
    </Modal>
  );
}

export { ComponentBean };
