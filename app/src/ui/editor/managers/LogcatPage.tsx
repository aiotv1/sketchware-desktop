// Logcat Reader: live `adb logcat` from a connected phone/emulator, filtered to the project's app.
import React, { useEffect, useRef, useState } from 'react';
import { ProjectStore } from '../store';
import { Page, IconButton, EmptyState } from '../../common/m3';
import { Icon } from '../../icons/Icon';
import { listDevices, startLogcat, runCollect, adbPath, AdbDevice } from '../../../codegen/adb';

interface Line {
  level: string;
  pid: string;
  tag: string;
  text: string;
  raw: string;
}
const LEVEL_COLOR: Record<string, string> = { V: 'var(--outline)', D: '#78b6ff', I: '#9bc98a', W: '#f0c35a', E: '#ffb4ab', F: '#ff6e6e' };
const RE = /^\d\d-\d\d\s+[\d:.]+\s+(\d+)\s+\d+\s+([VDIWEF])\s+(.*?):\s?(.*)$/;

export function LogcatPage(props: { store?: ProjectStore; onClose: () => void }) {
  const pkg = props.store?.project.packageName;
  const [devices, setDevices] = useState<AdbDevice[] | null>(null);
  const [dev, setDev] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [onlyApp, setOnlyApp] = useState(!!pkg);
  const [minLevel, setMinLevel] = useState('V');
  const [q, setQ] = useState('');
  const [paused, setPaused] = useState(false);
  const [pids, setPids] = useState<string[]>([]);
  const buf = useRef('');
  const box = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  const refreshDevices = async () => {
    const d = await listDevices();
    setDevices(d);
    if (d.length && !d.some((x) => x.serial === dev)) setDev(d[0].serial);
  };
  useEffect(() => {
    refreshDevices();
  }, []);

  useEffect(() => {
    if (!dev) return;
    let stop: (() => void) | null = null;
    setLines([]);
    startLogcat(dev, (t) => {
      buf.current += t;
      const parts = buf.current.split(/\r?\n/);
      buf.current = parts.pop() ?? '';
      if (pausedRef.current) return;
      const add = parts.filter(Boolean).map((raw) => {
        const m = raw.match(RE);
        return m ? { pid: m[1], level: m[2], tag: m[3].trim(), text: m[4], raw } : { pid: '', level: 'I', tag: '', text: raw, raw };
      });
      if (add.length) setLines((l) => (l.length + add.length > 6000 ? [...l.slice(-(5000 - add.length)), ...add] : [...l, ...add]));
    }).then((s) => (stop = s));
    // the app's process ids change when it restarts
    const t = pkg
      ? setInterval(async () => {
          const r = await runCollect(`"${adbPath()}"`, ['-s', dev, 'shell', 'pidof', pkg]);
          setPids(r.out.trim().split(/\s+/).filter(Boolean));
        }, 1500)
      : null;
    return () => {
      stop?.();
      if (t) clearInterval(t);
    };
  }, [dev]);

  const order = 'VDIWEF';
  const shown = lines.filter(
    (l) =>
      order.indexOf(l.level) >= order.indexOf(minLevel) &&
      (!onlyApp || !pkg || pids.includes(l.pid) || l.text.includes(pkg)) &&
      (!q || l.raw.toLowerCase().includes(q.toLowerCase())),
  );

  useEffect(() => {
    const b = box.current;
    if (b && b.scrollHeight - b.scrollTop - b.clientHeight < 200) b.scrollTop = b.scrollHeight;
  }, [shown.length]);

  return (
    <Page
      title="Logcat Reader"
      subtitle={pkg}
      onClose={props.onClose}
      noContent
      actions={
        <>
          <IconButton icon={paused ? 'x_play' : 'x_pause'} title={paused ? 'Resume' : 'Pause'} onClick={() => setPaused(!paused)} />
          <IconButton icon="ic_mtrl_delete" title="Clear" onClick={() => setLines([])} />
          <IconButton icon="x_refresh" title="Refresh devices" onClick={refreshDevices} />
        </>
      }
    >
      {devices && devices.length === 0 ? (
        <EmptyState icon="ic_mtrl_devices" text={'No device connected.\nConnect a phone with USB debugging enabled, or start an emulator, then press refresh.'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="row" style={{ padding: '0 16px 10px', flexWrap: 'wrap' }}>
            <select value={dev} onChange={(e) => setDev(e.target.value)}>
              {devices?.map((d) => (
                <option key={d.serial} value={d.serial}>
                  {d.model || d.serial}
                </option>
              ))}
            </select>
            {pkg && (
              <button className={'chip' + (onlyApp ? ' on' : '')} onClick={() => setOnlyApp(!onlyApp)}>
                {onlyApp && <Icon name="ic_mtrl_check" size={18} />}
                This app only
              </button>
            )}
            <select value={minLevel} onChange={(e) => setMinLevel(e.target.value)} title="Minimum level">
              {[...order].map((l) => (
                <option key={l} value={l}>
                  {{ V: 'Verbose', D: 'Debug', I: 'Info', W: 'Warning', E: 'Error', F: 'Fatal' }[l]}
                </option>
              ))}
            </select>
            <div className="search-bar" style={{ height: 40 }}>
              <Icon name="ic_mtrl_search" size={20} />
              <input placeholder="Filter" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div ref={box} className="code-view mono" style={{ flex: 1, margin: '0 12px 12px', borderRadius: 12, whiteSpace: 'pre-wrap' }}>
            {shown.length === 0 && <span className="muted">{onlyApp && pkg ? `Waiting for logs from ${pkg}… (run the app on the device)` : 'Waiting for logs…'}</span>}
            {shown.map((l, i) => (
              <div key={i} style={{ color: LEVEL_COLOR[l.level] }}>
                <b style={{ display: 'inline-block', width: 16 }}>{l.level}</b> <span style={{ opacity: 0.8 }}>{l.tag}</span> {l.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
