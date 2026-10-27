// Java-semantics runtime used by code ported from Sketchware's Java sources (see scripts/j2ts.py).
// Adds non-enumerable Java-style helpers to String/Array, plus JMap/JSet/StringBuilder/Pair and jformat.

declare global {
  interface String {
    equals(o: any): boolean;
    equalsIgnoreCase(o: any): boolean;
    isEmpty(): boolean;
    isBlank(): boolean;
    contains(s: any): boolean;
    jreplace(a: any, b: any): string;
    jreplaceAll(regex: string, repl: string): string;
    jreplaceFirst(regex: string, repl: string): string;
    jsplit(regex: string, limit?: number): string[];
    jmatches(regex: string): boolean;
    toCharArray(): string[];
    compareTo(o: string): number;
    hashCode(): number;
    strip(): string;
  }
  interface Array<T> {
    get(i: number): T;
    add(a: any, b?: any): boolean;
    size(): number;
    isEmpty(): boolean;
    contains(o: any): boolean;
    set(i: number, v: T): T;
    remove(o: any): any;
    removeIf(fn: (x: T) => boolean): boolean;
    addAll(a: any, b?: any): boolean;
    clear(): void;
    containsAll(o: any[]): boolean;
    stream(): JStream<T>;
    getFirst(): T;
    getLast(): T;
    subList(a: number, b: number): T[];
    toArray(x?: any): T[];
    iterator(): { hasNext(): boolean; next(): T; remove(): void };
  }
}

function def(proto: any, name: string, fn: Function) {
  if (Object.prototype.hasOwnProperty.call(proto, name)) return;
  Object.defineProperty(proto, name, { value: fn, writable: true, configurable: true, enumerable: false });
}

/** Convert a Java regex to a JS RegExp source (handles the few differences we hit). */
export function jregex(re: string): string {
  return re
    .replace(/\(\?<(\w+)>/g, '(?<$1>')
    .replace(/\\p\{Alpha\}/g, '[A-Za-z]')
    .replace(/\\p\{Digit\}/g, '[0-9]')
    .replace(/\\p\{Alnum\}/g, '[A-Za-z0-9]')
    .replace(/\\p\{Upper\}/g, '[A-Z]')
    .replace(/\\p\{Lower\}/g, '[a-z]')
    .replace(/\\p\{Space\}/g, '\\s')
    .replace(/\\Q(.*?)\\E/g, (_, q) => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .replace(/\(\?s\)/g, '');
}

/** Java replacement strings use $1 like JS but escape with backslash. */
function jrepl(r: string): string {
  return r.replace(/\\\$/g, '$$$$').replace(/\\\\/g, '\\');
}

def(String.prototype, 'equals', function (this: string, o: any) {
  return o != null && String(this) === String(o);
});
def(String.prototype, 'equalsIgnoreCase', function (this: string, o: any) {
  return o != null && String(this).toLowerCase() === String(o).toLowerCase();
});
def(String.prototype, 'isEmpty', function (this: string) {
  return this.length === 0;
});
def(String.prototype, 'isBlank', function (this: string) {
  return this.trim().length === 0;
});
def(String.prototype, 'strip', function (this: string) {
  return this.trim();
});
def(String.prototype, 'contains', function (this: string, s: any) {
  return String(this).includes(String(s));
});
def(String.prototype, 'jreplace', function (this: string, a: any, b: any) {
  return String(this).split(String(a)).join(String(b));
});
def(String.prototype, 'jreplaceAll', function (this: string, regex: string, repl: string) {
  return String(this).replace(new RegExp(jregex(regex), 'g'), jrepl(repl));
});
def(String.prototype, 'jreplaceFirst', function (this: string, regex: string, repl: string) {
  return String(this).replace(new RegExp(jregex(regex)), jrepl(repl));
});
def(String.prototype, 'jsplit', function (this: string, regex: string, limit = 0) {
  const s = String(this);
  if (s.length === 0) return [''];
  let parts: string[];
  if (limit > 0) {
    parts = [];
    const re = new RegExp(jregex(regex), 'g');
    let last = 0;
    let m: RegExpExecArray | null;
    while (parts.length < limit - 1 && (m = re.exec(s))) {
      if (m[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      parts.push(s.substring(last, m.index));
      last = m.index + m[0].length;
    }
    parts.push(s.substring(last));
    return parts;
  }
  parts = s.split(new RegExp(jregex(regex)));
  if (parts.length > 1 && parts[0] === '' && s.length > 0) {
    // Java drops a leading empty string only for zero-width matches; keep JS behaviour otherwise
  }
  while (parts.length > 1 && parts[parts.length - 1] === '') parts.pop();
  return parts;
});
def(String.prototype, 'jmatches', function (this: string, regex: string) {
  return new RegExp('^(?:' + jregex(regex) + ')$').test(String(this));
});
def(String.prototype, 'toCharArray', function (this: string) {
  return String(this).split('');
});
def(String.prototype, 'compareTo', function (this: string, o: string) {
  const a = String(this);
  return a < o ? -1 : a > o ? 1 : 0;
});
def(String.prototype, 'hashCode', function (this: string) {
  let h = 0;
  const s = String(this);
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
});

def(Array.prototype, 'get', function (this: any[], i: number) {
  if (i < 0 || i >= this.length) throw new RangeError('Index ' + i + ' out of bounds for length ' + this.length);
  return this[i];
});
def(Array.prototype, 'add', function (this: any[], a: any, b?: any) {
  if (arguments.length === 2) {
    this.splice(a, 0, b);
    return true;
  }
  this.push(a);
  return true;
});
def(Array.prototype, 'size', function (this: any[]) {
  return this.length;
});
def(Array.prototype, 'isEmpty', function (this: any[]) {
  return this.length === 0;
});
def(Array.prototype, 'contains', function (this: any[], o: any) {
  return this.some((x) => jequals(x, o));
});
def(Array.prototype, 'containsAll', function (this: any[], o: any[]) {
  return o.every((x) => this.contains(x));
});
def(Array.prototype, 'set', function (this: any[], i: number, v: any) {
  const old = this[i];
  this[i] = v;
  return old;
});
def(Array.prototype, 'remove', function (this: any[], o: any) {
  if (typeof o === 'number') {
    return this.splice(o, 1)[0];
  }
  const idx = this.findIndex((x) => jequals(x, o));
  if (idx >= 0) {
    this.splice(idx, 1);
    return true;
  }
  return false;
});
def(Array.prototype, 'removeIf', function (this: any[], fn: (x: any) => boolean) {
  let changed = false;
  for (let i = this.length - 1; i >= 0; i--) {
    if (fn(this[i])) {
      this.splice(i, 1);
      changed = true;
    }
  }
  return changed;
});
def(Array.prototype, 'addAll', function (this: any[], a: any, b?: any) {
  if (arguments.length === 2) {
    this.splice(a, 0, ...jiter(b));
    return true;
  }
  for (const x of jiter(a)) this.push(x);
  return true;
});
def(Array.prototype, 'clear', function (this: any[]) {
  this.length = 0;
});
def(Array.prototype, 'getFirst', function (this: any[]) {
  return this[0];
});
def(Array.prototype, 'getLast', function (this: any[]) {
  return this[this.length - 1];
});
def(Array.prototype, 'stream', function (this: any[]) {
  return new JStream(this);
});
def(Array.prototype, 'subList', function (this: any[], a: number, b: number) {
  return this.slice(a, b);
});
def(Array.prototype, 'toArray', function (this: any[]) {
  return [...this];
});
def(Array.prototype, 'iterator', function (this: any[]) {
  let i = 0;
  const arr = this;
  return { hasNext: () => i < arr.length, next: () => arr[i++], remove: () => arr.splice(--i, 1) };
});

export class JStream<T> {
  constructor(public items: T[]) {}
  map<R>(f: (x: T) => R) {
    return new JStream(this.items.map(f));
  }
  filter(f: (x: T) => boolean) {
    return new JStream(this.items.filter(f));
  }
  anyMatch(f: (x: T) => boolean) {
    return this.items.some(f);
  }
  allMatch(f: (x: T) => boolean) {
    return this.items.every(f);
  }
  noneMatch(f: (x: T) => boolean) {
    return !this.items.some(f);
  }
  forEach(f: (x: T) => void) {
    this.items.forEach(f);
  }
  collect(c: (items: any[]) => any) {
    return c(this.items);
  }
  toList() {
    return [...this.items];
  }
  findFirst() {
    return new JOptional(this.items[0]);
  }
  distinct() {
    return new JStream([...new Set(this.items)]);
  }
  sorted() {
    return new JStream([...this.items].sort());
  }
  count() {
    return this.items.length;
  }
}

export class JOptional<T> {
  constructor(public v: T | undefined) {}
  isPresent() {
    return this.v !== undefined && this.v !== null;
  }
  get() {
    return this.v as T;
  }
  orElse(o: T) {
    return this.isPresent() ? (this.v as T) : o;
  }
  orElseThrow(f?: any): T {
    if (this.isPresent()) return this.v as T;
    throw new Error('NoSuchElementException');
  }
  orElseGet(f: () => T) {
    return this.isPresent() ? (this.v as T) : f();
  }
  isEmpty() {
    return !this.isPresent();
  }
  ifPresent(f: (v: T) => void) {
    if (this.isPresent()) f(this.v as T);
  }
  map<R>(f: (v: T) => R): JOptional<R> {
    return this.isPresent() ? new JOptional(f(this.v as T)) : new JOptional<R>(undefined);
  }
}

export const Collectors = {
  joining: (sep = '') => (items: any[]) => items.join(sep),
  toList: () => (items: any[]) => [...items],
  toSet: () => (items: any[]) => new JSet(items),
};

export function jequals(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a === 'string' || typeof b === 'string') return String(a) === String(b);
  if (typeof a.equals === 'function') return a.equals(b);
  return false;
}

export function jiter<T = any>(x: any): Iterable<T> {
  if (x == null) return [];
  if (x instanceof JMap) return x.entrySet() as any;
  return x;
}

export class MapEntry<K, V> {
  constructor(public key: K, public value: V) {}
  getKey() {
    return this.key;
  }
  getValue() {
    return this.value;
  }
}

export class JMap<K = any, V = any> {
  m = new Map<any, V>();
  constructor(init?: any) {
    if (init instanceof JMap) init.m.forEach((v, k) => this.m.set(k, v));
    else if (init && typeof init === 'object' && !(typeof init === 'number')) {
      for (const k of Object.keys(init)) this.m.set(k, init[k]);
    }
  }
  static fromObject(o: Record<string, any>) {
    return new JMap(o);
  }
  get(k: K): V | null {
    return this.m.has(k) ? (this.m.get(k) as V) : null;
  }
  getOrDefault(k: K, d: V): V {
    return this.m.has(k) ? (this.m.get(k) as V) : d;
  }
  put(k: K, v: V): V | null {
    const old = this.get(k);
    this.m.set(k, v);
    return old;
  }
  putIfAbsent(k: K, v: V) {
    if (!this.m.has(k)) this.m.set(k, v);
  }
  putAll(o: JMap<K, V>) {
    o.m.forEach((v, k) => this.m.set(k, v));
  }
  containsKey(k: K) {
    return this.m.has(k);
  }
  containsValue(v: V) {
    for (const x of this.m.values()) if (jequals(x, v)) return true;
    return false;
  }
  remove(k: K) {
    const old = this.get(k);
    this.m.delete(k);
    return old;
  }
  size() {
    return this.m.size;
  }
  isEmpty() {
    return this.m.size === 0;
  }
  clear() {
    this.m.clear();
  }
  keySet(): K[] {
    return [...this.m.keys()];
  }
  values(): V[] {
    return [...this.m.values()];
  }
  entrySet(): MapEntry<K, V>[] {
    return [...this.m.entries()].map(([k, v]) => new MapEntry(k, v));
  }
  forEach(f: (k: K, v: V) => void) {
    this.m.forEach((v, k) => f(k, v));
  }
  computeIfAbsent(k: K, f: (k: K) => V): V {
    if (!this.m.has(k)) this.m.set(k, f(k));
    return this.m.get(k) as V;
  }
  [Symbol.iterator]() {
    return this.entrySet()[Symbol.iterator]();
  }
}

export class JSet<T = any> {
  s = new Set<T>();
  constructor(init?: any) {
    if (init) for (const x of jiter(init)) this.s.add(x as T);
  }
  add(x: T) {
    const had = this.s.has(x);
    this.s.add(x);
    return !had;
  }
  addAll(xs: any) {
    for (const x of jiter(xs)) this.s.add(x as T);
    return true;
  }
  contains(x: T) {
    return this.s.has(x);
  }
  remove(x: T) {
    return this.s.delete(x);
  }
  size() {
    return this.s.size;
  }
  isEmpty() {
    return this.s.size === 0;
  }
  clear() {
    this.s.clear();
  }
  stream() {
    return new JStream([...this.s]);
  }
  [Symbol.iterator]() {
    return this.s[Symbol.iterator]();
  }
}

export class Pair<A = any, B = any> {
  constructor(public first: A, public second: B) {}
  static create<A, B>(a: A, b: B) {
    return new Pair(a, b);
  }
}

export class StringBuilder {
  private s: string;
  constructor(init?: any) {
    this.s = typeof init === 'string' ? init : '';
  }
  append(x: any): StringBuilder {
    this.s += x === null ? 'null' : String(x);
    return this;
  }
  insert(i: number, x: any): StringBuilder {
    this.s = this.s.substring(0, i) + String(x) + this.s.substring(i);
    return this;
  }
  get length() {
    return this.s.length;
  }
  setLength(n: number) {
    this.s = this.s.substring(0, n);
  }
  charAt(i: number) {
    return this.s.charAt(i);
  }
  deleteCharAt(i: number) {
    this.s = this.s.substring(0, i) + this.s.substring(i + 1);
    return this;
  }
  delete(a: number, b: number) {
    this.s = this.s.substring(0, a) + this.s.substring(b);
    return this;
  }
  jreplace(a: number, b: number, str: string) {
    this.s = this.s.substring(0, a) + str + this.s.substring(b);
    return this;
  }
  indexOf(x: string, from?: number) {
    return this.s.indexOf(x, from);
  }
  lastIndexOf(x: string) {
    return this.s.lastIndexOf(x);
  }
  substring(a: number, b?: number) {
    return this.s.substring(a, b);
  }
  reverse() {
    this.s = this.s.split('').reverse().join('');
    return this;
  }
  isEmpty() {
    return this.s.length === 0;
  }
  toString() {
    return this.s;
  }
}

/** java.lang.String.format subset: %s %d %f %x %n %% and positional %1$s. */
export function jformat(fmt: string, ...args: any[]): string {
  // String.format(fmt, list.toArray()) — Java spreads a single Object[] into the varargs
  if (args.length === 1 && Array.isArray(args[0])) args = args[0];
  let auto = 0;
  return fmt.replace(/%(?:(\d+)\$)?([-#+ 0,(]*)(\d+)?(?:\.(\d+))?([sSdfxXnbc%])/g, (all, pos, flags, width, prec, conv) => {
    if (conv === '%') return '%';
    if (conv === 'n') return '\n';
    const idx = pos ? parseInt(pos, 10) - 1 : auto++;
    const v = args[idx];
    let out: string;
    switch (conv) {
      case 'd':
        out = String(Math.trunc(Number(v)));
        break;
      case 'f':
        out = Number(v).toFixed(prec ? parseInt(prec, 10) : 6);
        break;
      case 'x':
        out = (Number(v) >>> 0).toString(16);
        break;
      case 'X':
        out = (Number(v) >>> 0).toString(16).toUpperCase();
        break;
      case 'b':
        out = String(!!v);
        break;
      case 'S':
        out = String(v).toUpperCase();
        break;
      default:
        out = v === null ? 'null' : v === undefined ? 'null' : String(v);
    }
    if (width) {
      const w = parseInt(width, 10);
      if (out.length < w) out = flags.includes('-') ? out.padEnd(w) : out.padStart(w, flags.includes('0') ? '0' : ' ');
    }
    return out;
  });
}

export function jstr(x: any): string {
  if (x === null || x === undefined) return 'null';
  if (Array.isArray(x)) return x.join('');
  return String(x);
}

export function jjoin(sep: string, items: any): string {
  return [...jiter(items)].join(sep);
}

export function jparseInt(s: any): number {
  if (typeof s === 'number') return Math.trunc(s);
  const t = String(s).trim();
  if (!/^[+-]?\d+$/.test(t)) throw new Error('NumberFormatException: For input string: "' + s + '"');
  return parseInt(t, 10);
}

export function jparseDouble(s: any): number {
  if (typeof s === 'number') return s;
  const t = String(s).trim();
  if (t === '' || isNaN(Number(t.replace(/[dDfF]$/, '')))) throw new Error('NumberFormatException: For input string: "' + s + '"');
  return Number(t.replace(/[dDfF]$/, ''));
}

export function jtoHex(n: number): string {
  return (n >>> 0).toString(16);
}

export function jisEmpty(s: any): boolean {
  return s == null || String(s).length === 0;
}

export const jint = (x: any): number => Math.trunc(Number(x));
export const jIsString = (x: any) => typeof x === 'string';
export const jisDigit = (c: string) => /^[0-9]$/.test(c);
export const jisLetter = (c: string) => /^\p{L}$/u.test(c);
export const jisLetterOrDigit = (c: string) => /^[\p{L}0-9]$/u.test(c);
export const jisUpper = (c: string) => c !== c.toLowerCase() && c === c.toUpperCase();
export const jisWhitespace = (c: string) => /^\s$/.test(c);

export function jlist<T = any>(x?: any): T[] {
  if (x === undefined || typeof x === 'number') return [];
  return [...jiter<T>(x)];
}
export function jlistOf<T = any>(...xs: T[]): T[] {
  if (xs.length === 1 && Array.isArray(xs[0])) return [...(xs[0] as any)];
  return xs;
}
export function jsetOf<T = any>(...xs: T[]): JSet<T> {
  return new JSet(xs);
}
export function jnewArray<T>(n: number, fill: T): T[] {
  return new Array(n).fill(fill);
}

export function jsplitLines(s: string): string[] {
  return s.split(/\r?\n/);
}

export function jparseBool(s: any): boolean {
  return String(s).toLowerCase() === 'true';
}
