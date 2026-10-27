// Small imperative dialog/toast/context-menu helpers rendered into a portal host.
import React, { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Icon } from '../icons/Icon';

let host: HTMLDivElement | null = null;
let root: Root | null = null;
let stack: { id: number; el: React.ReactNode }[] = [];
let seq = 1;

function render() {
  if (!host) {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  }
  root!.render(<>{stack.map((s) => <React.Fragment key={s.id}>{s.el}</React.Fragment>)}</>);
}

export function mount(el: (close: () => void) => React.ReactNode): () => void {
  const id = seq++;
  const close = () => {
    stack = stack.filter((s) => s.id !== id);
    render();
  };
  stack.push({ id, el: el(close) });
  render();
  return close;
}

const modalStack: ((e: KeyboardEvent) => void)[] = [];
export const modalOpen = () => modalStack.length > 0 || !!document.querySelector('.modal-back, .menu');

export function Modal(props: {
  title: React.ReactNode;
  children?: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    // capture phase + stack: only the topmost modal closes on Escape; editors check modalOpen() for other keys
    const k = (e: KeyboardEvent) => {
      if (modalStack[modalStack.length - 1] !== k || e.key !== 'Escape') return;
      e.stopPropagation();
      props.onClose();
    };
    modalStack.push(k);
    window.addEventListener('keydown', k, true);
    return () => {
      modalStack.splice(modalStack.indexOf(k), 1);
      window.removeEventListener('keydown', k, true);
    };
  }, []);
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && props.onClose()}>
      <div className="modal" style={props.width ? { width: props.width } : undefined}>
        <div className="modal-head">{props.title}</div>
        <div className="modal-body">{props.children}</div>
        {props.footer !== undefined && <div className="modal-foot">{props.footer}</div>}
      </div>
    </div>
  );
}

export function confirmDialog(title: string, message: React.ReactNode, okText = 'OK', danger = false): Promise<boolean> {
  return new Promise((resolve) => {
    mount((close) => (
      <Modal
        title={title}
        onClose={() => {
          close();
          resolve(false);
        }}
        footer={
          <>
            <button
              onClick={() => {
                close();
                resolve(false);
              }}
            >
              Cancel
            </button>
            <button
              className={danger ? 'danger' : 'primary'}
              autoFocus
              onClick={() => {
                close();
                resolve(true);
              }}
            >
              {okText}
            </button>
          </>
        }
      >
        <div style={{ maxWidth: 520, whiteSpace: 'pre-wrap' }}>{message}</div>
      </Modal>
    ));
  });
}

export function alertDialog(title: string, message: React.ReactNode): Promise<void> {
  return new Promise((resolve) => {
    mount((close) => (
      <Modal
        title={title}
        onClose={() => {
          close();
          resolve();
        }}
        footer={
          <button
            className="primary"
            autoFocus
            onClick={() => {
              close();
              resolve();
            }}
          >
            OK
          </button>
        }
      >
        <div style={{ maxWidth: 640, whiteSpace: 'pre-wrap' }}>{message}</div>
      </Modal>
    ));
  });
}

function PromptBody(props: {
  label?: string;
  initial: string;
  multiline?: boolean;
  validate?: (v: string) => string | null;
  onDone: (v: string | null) => void;
  title: string;
  placeholder?: string;
  mono?: boolean;
}) {
  const [v, setV] = useState(props.initial);
  const ref = useRef<any>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select?.();
  }, []);
  const err = props.validate ? props.validate(v) : null;
  const ok = () => {
    if (!err) props.onDone(v);
  };
  return (
    <Modal
      title={props.title}
      onClose={() => props.onDone(null)}
      width={props.multiline ? 640 : 420}
      footer={
        <>
          <button onClick={() => props.onDone(null)}>Cancel</button>
          <button className="primary" disabled={!!err} onClick={ok}>
            OK
          </button>
        </>
      }
    >
      <div className="field">
        {props.label && <label>{props.label}</label>}
        {props.multiline ? (
          <textarea
            ref={ref}
            className={props.mono ? 'mono' : undefined}
            value={v}
            rows={12}
            placeholder={props.placeholder}
            onChange={(e) => setV(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) ok();
            }}
          />
        ) : (
          <input
            ref={ref}
            value={v}
            placeholder={props.placeholder}
            onChange={(e) => setV(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') ok();
            }}
          />
        )}
        {err && v !== '' && <div className="err">{err}</div>}
      </div>
    </Modal>
  );
}

export function promptDialog(
  title: string,
  initial = '',
  opts: { label?: string; multiline?: boolean; validate?: (v: string) => string | null; placeholder?: string; mono?: boolean } = {},
): Promise<string | null> {
  return new Promise((resolve) => {
    mount((close) => (
      <PromptBody
        title={title}
        initial={initial}
        {...opts}
        onDone={(v) => {
          close();
          resolve(v);
        }}
      />
    ));
  });
}

export function choiceDialog<T>(title: string, items: { label: React.ReactNode; value: T; hint?: string }[], selected?: T): Promise<T | null> {
  return new Promise((resolve) => {
    mount((close) => (
      <ChoiceBody
        title={title}
        items={items}
        selected={selected}
        onDone={(v) => {
          close();
          resolve(v);
        }}
      />
    ));
  });
}

function ChoiceBody<T>(props: { title: string; items: { label: React.ReactNode; value: T; hint?: string }[]; selected?: T; onDone: (v: T | null) => void }) {
  const [q, setQ] = useState('');
  const filtered = props.items.filter((i) => !q || String(i.value).toLowerCase().includes(q.toLowerCase()) || String(i.label).toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal title={props.title} onClose={() => props.onDone(null)} width={420} footer={<button onClick={() => props.onDone(null)}>Cancel</button>}>
      {props.items.length > 10 && (
        <input autoFocus placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
      )}
      <div style={{ maxHeight: '55vh', overflow: 'auto' }}>
        {filtered.length === 0 && <div className="empty">Nothing to select</div>}
        {filtered.map((i, idx) => (
          <div key={idx} className={'list-item' + (i.value === props.selected ? ' selected' : '')} onClick={() => props.onDone(i.value)}>
            <span className="grow">{i.label}</span>
            {i.hint && <span className="muted small">{i.hint}</span>}
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------- toast
export function toast(message: string, error = false, ms = 2600) {
  const close = mount(() => <div className={'toast' + (error ? ' error' : '')}>{message}</div>);
  setTimeout(close, ms);
}

// ---------------------------------------------------------------- context menu
export interface MenuItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

export function contextMenu(x: number, y: number, items: MenuItem[]) {
  const close = mount((c) => <ContextMenuView x={x} y={y} items={items} close={c} />);
  return close;
}

function ContextMenuView(props: { x: number; y: number; items: MenuItem[]; close: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: props.x, y: props.y });
  useEffect(() => {
    const r = ref.current!.getBoundingClientRect();
    setPos({ x: Math.min(props.x, window.innerWidth - r.width - 8), y: Math.min(props.y, window.innerHeight - r.height - 8) });
    const down = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) props.close();
    };
    setTimeout(() => window.addEventListener('mousedown', down), 0);
    return () => window.removeEventListener('mousedown', down);
  }, []);
  return (
    <div className="menu" ref={ref} style={{ left: pos.x, top: pos.y }} onContextMenu={(e) => e.preventDefault()}>
      {props.items.map((it, i) =>
        it.separator ? (
          <div key={i} style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
        ) : (
          <div
            key={i}
            className="list-item"
            style={{ color: it.danger ? 'var(--danger)' : undefined, opacity: it.disabled ? 0.4 : 1 }}
            onClick={() => {
              if (it.disabled) return;
              props.close();
              it.onClick?.();
            }}
          >
            {it.icon && <Icon name={it.icon} size={22} style={{ color: it.danger ? 'var(--danger)' : 'var(--on-surface-variant)' }} />}
            {it.label}
          </div>
        ),
      )}
    </div>
  );
}
