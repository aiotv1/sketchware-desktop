// Tiny Chrome DevTools Protocol client for driving the running Electron window in tests.
// usage: node scripts/cdp.mjs shot out.png | eval "js" | click x y | drag x1 y1 x2 y2 | key Key
import fs from 'fs';

const port = process.env.CDP_PORT || 9333;
const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    pending.get(d.id)(d);
    pending.delete(d.id);
  }
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra });

const [cmd, ...a] = process.argv.slice(2);
if (cmd === 'reload') {
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.method === 'Runtime.exceptionThrown') console.log('EXC', JSON.stringify(d.params.exceptionDetails).slice(0, 1500));
    if (d.method === 'Runtime.consoleAPICalled') console.log(d.params.type, d.params.args.map((x) => x.value ?? x.description).join(' ').slice(0, 1500));
    if (d.method === 'Log.entryAdded') console.log('LOG', d.params.entry.level, d.params.entry.text, d.params.entry.url ?? '');
  });
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.reload', { ignoreCache: true });
  await sleep(Number(a[0] ?? 3000));
} else if (cmd === 'shot') {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(a[0], Buffer.from(r.result.data, 'base64'));
  console.log('saved', a[0]);
} else if (cmd === 'eval') {
  const r = await send('Runtime.evaluate', { expression: a[0], awaitPromise: true, returnByValue: true });
  console.log(JSON.stringify(r.result.result?.value ?? r.result, null, 1));
} else if (cmd === 'click') {
  const [x, y] = a.map(Number);
  await mouse('mouseMoved', x, y, { buttons: 0 });
  await mouse('mousePressed', x, y);
  await mouse('mouseReleased', x, y);
  if (a[2] === 'double') {
    await mouse('mousePressed', x, y, { clickCount: 2 });
    await mouse('mouseReleased', x, y, { clickCount: 2 });
  }
} else if (cmd === 'rclick') {
  const [x, y] = a.map(Number);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'right', buttons: 2, clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'right', buttons: 0, clickCount: 1 });
} else if (cmd === 'drag') {
  const [x1, y1, x2, y2] = a.map(Number);
  await mouse('mouseMoved', x1, y1, { buttons: 0 });
  await mouse('mousePressed', x1, y1);
  const n = 12;
  for (let i = 1; i <= n; i++) {
    await mouse('mouseMoved', x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n);
    await sleep(16);
  }
  await mouse('mouseReleased', x2, y2);
} else if (cmd === 'type') {
  await send('Input.insertText', { text: a[0] });
} else if (cmd === 'key') {
  const key = a[0];
  const codes = { Enter: 13, Escape: 27, Backspace: 8, Tab: 9, Delete: 46 };
  const mods = a[1] === 'ctrl' ? 2 : 0;
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, windowsVirtualKeyCode: codes[key] ?? key.toUpperCase().charCodeAt(0), modifiers: mods });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, windowsVirtualKeyCode: codes[key] ?? key.toUpperCase().charCodeAt(0), modifiers: mods });
}
await sleep(150);
ws.close();
process.exit(0);
