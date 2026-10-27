// Material 3 building blocks styled after Sketchware Pro's screens.
import React, { useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { mount } from './dialogs';

export function IconButton(props: { icon: string; title?: string; onClick?: (e: React.MouseEvent) => void; disabled?: boolean; size?: number; active?: boolean }) {
  return (
    <button className="ib" title={props.title} disabled={props.disabled} onClick={props.onClick} style={props.active ? { color: 'var(--primary)' } : undefined}>
      <Icon name={props.icon} size={props.size ?? 24} />
    </button>
  );
}

export function AppBar(props: { title: React.ReactNode; subtitle?: React.ReactNode; onBack?: () => void; actions?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="appbar">
      {props.onBack && <IconButton icon="x_back" title="Back" onClick={props.onBack} />}
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="appbar-title ellipsis">{props.title}</div>
        {props.subtitle != null && <div className="appbar-sub ellipsis">{props.subtitle}</div>}
      </div>
      {props.children}
      {props.actions}
    </div>
  );
}

const pageStack: (() => void)[] = [];

/** A full-screen page with a back arrow, like an Android activity. Escape goes back. */
export function Page(props: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  fab?: React.ReactNode;
  wide?: boolean;
  bodyStyle?: React.CSSProperties;
  noContent?: boolean;
}) {
  useEffect(() => {
    const me = props.onClose;
    pageStack.push(me);
    const k = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || pageStack[pageStack.length - 1] !== me) return;
      if (document.querySelector('.modal-back, .menu')) return;
      e.stopPropagation();
      props.onClose();
    };
    window.addEventListener('keydown', k, true);
    return () => {
      pageStack.splice(pageStack.indexOf(me), 1);
      window.removeEventListener('keydown', k, true);
    };
  }, []);
  return (
    <div className="page">
      <AppBar title={props.title} subtitle={props.subtitle} onBack={props.onClose} actions={props.actions} />
      <div className="page-body" style={props.bodyStyle}>
        {props.noContent ? props.children : <div className={'page-content' + (props.wide ? ' wide' : '')}>{props.children}</div>}
      </div>
      {props.fab}
    </div>
  );
}

/** Opens a page component on top of everything; returns its close function. */
export function openPage(render: (close: () => void) => React.ReactNode) {
  return mount(render);
}

export function ListRow(props: {
  icon?: string;
  iconColor?: string;
  lead?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  trailing?: React.ReactNode;
  chevron?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={'list-row' + (props.disabled ? ' disabled' : '')}
      onClick={props.disabled ? undefined : props.onClick}
      onContextMenu={props.onContextMenu}
      style={props.style}
    >
      {props.lead ?? (props.icon && <Icon name={props.icon} color={props.iconColor} />)}
      <div className="grow">
        <div className="lr-title ellipsis">{props.title}</div>
        {props.sub != null && props.sub !== '' && <div className="lr-sub">{props.sub}</div>}
      </div>
      {props.trailing}
      {props.chevron && <Icon name="x_chevron" size={22} style={{ color: 'var(--on-surface-variant)' }} />}
    </div>
  );
}

export function Fab(props: { icon?: string; label?: string; onClick: () => void; title?: string; small?: boolean }) {
  return (
    <button className={'fab' + (props.small ? ' small' : '')} onClick={props.onClick} title={props.title ?? props.label}>
      <Icon name={props.icon ?? 'ic_mtrl_add'} />
      {props.label}
    </button>
  );
}

export function Switch(props: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div
      className={'switch' + (props.on ? ' on' : '')}
      style={props.disabled ? { opacity: 0.4, cursor: 'default' } : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (!props.disabled) props.onChange(!props.on);
      }}
    />
  );
}

export function Tabs<T extends string>(props: { value: T; items: { value: T; label: React.ReactNode }[]; onChange: (v: T) => void; compact?: boolean }) {
  return (
    <div className={'m3-tabs' + (props.compact ? ' compact' : '')}>
      {props.items.map((i) => (
        <button key={i.value} className={i.value === props.value ? 'active' : ''} onClick={() => props.onChange(i.value)}>
          {i.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState(props: { icon?: string; text: React.ReactNode }) {
  return (
    <div className="empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '80px 20px' }}>
      {props.icon && <Icon name={props.icon} size={48} style={{ opacity: 0.6 }} />}
      <div style={{ whiteSpace: 'pre-line' }}>{props.text}</div>
    </div>
  );
}
