// Exposes a narrow, promise-based host API to the renderer as window.host.
const { contextBridge, ipcRenderer } = require('electron');

const listeners = { out: new Set(), err: new Set(), exit: new Set() };
ipcRenderer.on('proc:out', (_e, id, d) => listeners.out.forEach((f) => f(id, d)));
ipcRenderer.on('proc:err', (_e, id, d) => listeners.err.forEach((f) => f(id, d)));
ipcRenderer.on('proc:exit', (_e, id, d) => listeners.exit.forEach((f) => f(id, d)));

contextBridge.exposeInMainWorld('host', {
  read: (p) => ipcRenderer.invoke('fs:read', p),
  readText: (p) => ipcRenderer.invoke('fs:readText', p),
  write: (p, data) => ipcRenderer.invoke('fs:write', p, data),
  exists: (p) => ipcRenderer.invoke('fs:exists', p),
  mkdir: (p) => ipcRenderer.invoke('fs:mkdir', p),
  list: (p) => ipcRenderer.invoke('fs:list', p),
  listRecursive: (p) => ipcRenderer.invoke('fs:listRecursive', p),
  remove: (p) => ipcRenderer.invoke('fs:remove', p),
  copy: (a, b) => ipcRenderer.invoke('fs:copy', a, b),
  stat: (p) => ipcRenderer.invoke('fs:stat', p),
  paths: () => ipcRenderer.invoke('app:paths'),
  openDialog: (o) => ipcRenderer.invoke('dialog:open', o),
  saveDialog: (o) => ipcRenderer.invoke('dialog:save', o),
  openPath: (p) => ipcRenderer.invoke('shell:open', p),
  reveal: (p) => ipcRenderer.invoke('shell:reveal', p),
  openExternal: (u) => ipcRenderer.invoke('shell:external', u),
  setTitle: (t) => ipcRenderer.invoke('win:title', t),
  spawn: (cmd, args, opts) => ipcRenderer.invoke('proc:spawn', cmd, args, opts),
  kill: (id) => ipcRenderer.invoke('proc:kill', id),
  sync: (op, a, b) => ipcRenderer.sendSync('fsSync', op, a, b),
  download: (url, dest) => ipcRenderer.invoke('net:download', url, dest),
  onDownloadProgress: (fn) => {
    const h = (_e, url, done, total) => fn(url, done, total);
    ipcRenderer.on('net:progress', h);
    return () => ipcRenderer.removeListener('net:progress', h);
  },
  onProc: (kind, fn) => {
    listeners[kind].add(fn);
    return () => listeners[kind].delete(fn);
  },
});
