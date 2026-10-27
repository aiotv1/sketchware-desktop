"""Best-effort Java -> TypeScript transpiler for the Sketchware sources we port.

It handles the idioms these files use (string-heavy code generators): classes, fields, methods
(overloads become dispatchers), locals, for-each, switch arrows / switch expressions, text blocks,
lambdas, casts, generics, and bare field references (-> this.x / Cls.x). The output is then fixed
by hand where the compiler complains. Runtime Java semantics come from src/codegen/jshim.ts.
"""
import re
import sys

PRIMS = {'int': 'number', 'long': 'number', 'double': 'number', 'float': 'number', 'short': 'number', 'byte': 'number',
         'char': 'string', 'boolean': 'boolean', 'String': 'string', 'void': 'void', 'Object': 'any', 'Integer': 'number',
         'Double': 'number', 'Boolean': 'boolean', 'Long': 'number', 'Float': 'number', 'CharSequence': 'string'}

import os as _os
_AAA = 'D:/sketchware-desktop/ref/Sketchware-Pro/app/src/main/java/a/a/a'
OBF = sorted({f[:-5] for f in _os.listdir(_AAA) if f.endswith('.java') and len(f) <= 7} |
             {'Rs', 'Ts', 'Ss', 'eC', 'hC', 'iC', 'kC', 'oB', 'lC', 'yB', 'xB', 'FB', 'jC', 'KB', 'Jp', 'nB', 'GB', 'DB'}) if _os.path.isdir(_AAA) else []
TYPE_RE = r'(?:[A-Z][\w.]*|int|long|double|float|short|byte|char|boolean|var' + ''.join('|' + o for o in OBF) + r')(?:\s*<[^;=(){}]*?>)?(?:\[\])*'


# ---------------------------------------------------------------- lexing helpers
def mask_strings(src):
    """Replace string/char literals and comments with placeholders; return (masked, table)."""
    out = []
    table = []
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        if src.startswith('"""', i):
            j = src.index('"""', i + 3)
            table.append(('text', src[i:j + 3]))
            out.append('\x00%d\x00' % (len(table) - 1))
            i = j + 3
            continue
        if c == '"':
            j = i + 1
            while src[j] != '"':
                j += 2 if src[j] == '\\' else 1
            table.append(('str', src[i:j + 1]))
            out.append('\x00%d\x00' % (len(table) - 1))
            i = j + 1
            continue
        if c == "'":
            j = i + 1
            while src[j] != "'":
                j += 2 if src[j] == '\\' else 1
            table.append(('chr', src[i:j + 1]))
            out.append('\x00%d\x00' % (len(table) - 1))
            i = j + 1
            continue
        if src.startswith('//', i):
            j = src.find('\n', i)
            j = n if j < 0 else j
            table.append(('com', src[i:j]))
            out.append('\x00%d\x00' % (len(table) - 1))
            i = j
            continue
        if src.startswith('/*', i):
            j = src.index('*/', i + 2)
            table.append(('com', src[i:j + 2]))
            out.append('\x00%d\x00' % (len(table) - 1))
            i = j + 2
            continue
        out.append(c)
        i += 1
    return ''.join(out), table


def unmask(s, table):
    def rep(m):
        kind, lit = table[int(m.group(1))]
        if kind == 'text':
            return text_block(lit)
        if kind == 'chr':
            inner = lit[1:-1]
            if inner == '"':
                return "'\"'"
            return '"' + inner + '"'
        return lit
    prev = None
    while prev != s:
        prev = s
        s = re.sub('\x00(\\d+)\x00', rep, s)
    return s


def text_block(lit):
    raw = lit[3:-3]
    lines = raw.split('\n')[1:]
    if not lines:
        return '``'
    last = lines[-1]
    content = [l for l in lines if l.strip()]
    ind = min([len(l) - len(l.lstrip()) for l in content] or [0])
    if last.strip() == '':
        ind = min(ind, len(last))
        body = '\n'.join(l[ind:].rstrip() for l in lines[:-1]) + '\n'
    else:
        body = '\n'.join(l[ind:].rstrip() for l in lines)
    body = body.replace('\\\n', '')
    body = body.replace('`', '\\`').replace('${', '\\${')
    return '`' + body + '`'


def find_matching(s, i, open_c='{', close_c='}'):
    depth = 0
    for j in range(i, len(s)):
        if s[j] == open_c:
            depth += 1
        elif s[j] == close_c:
            depth -= 1
            if depth == 0:
                return j
    raise ValueError('unbalanced at %d' % i)


def split_top(s, sep=','):
    parts = []
    depth = 0
    cur = ''
    for c in s:
        if c in '(<[{':
            depth += 1
        elif c in ')>]}':
            depth -= 1
        if c == sep and depth == 0:
            parts.append(cur)
            cur = ''
        else:
            cur += c
    if cur.strip():
        parts.append(cur)
    return parts


def ts_type(t):
    t = t.strip()
    t = re.sub(r'\bfinal\s+', '', t)
    arr = ''
    while t.endswith('[]'):
        t = t[:-2].strip()
        arr += '[]'
    if t.endswith('...'):
        t = t[:-3]
        arr += '[]'
    base = re.sub(r'<.*>', '', t).strip()
    if base in PRIMS:
        return PRIMS[base] + arr
    return 'any' + arr


# ---------------------------------------------------------------- expression rewrites
TYPE_TESTS = {
    'String': "typeof %s === 'string'", 'CharSequence': "typeof %s === 'string'",
    'Integer': "typeof %s === 'number'", 'Double': "typeof %s === 'number'", 'Long': "typeof %s === 'number'",
    'Float': "typeof %s === 'number'", 'Number': "typeof %s === 'number'", 'Boolean': "typeof %s === 'boolean'",
    'ArrayList': 'Array.isArray(%s)', 'List': 'Array.isArray(%s)', 'Collection': 'Array.isArray(%s)',
    'HashMap': '(%s instanceof JMap)', 'Map': '(%s instanceof JMap)', 'LinkedHashMap': '(%s instanceof JMap)',
    'File': '(%s instanceof JFile)',
}


def rewrite_instanceof(s):
    """x instanceof T [v]  ->  type test; pattern variables are replaced by the tested expression."""
    binds = {}

    def rep(m):
        expr, typ, var = m.group(1), m.group(2), m.group(3)
        base = typ.split('.')[-1]
        test = TYPE_TESTS.get(base, '(%s instanceof ' + base + ')') % expr
        if var:
            binds[var] = expr
        return test
    # parenthesised left operands: (x = y.get(z)) instanceof T
    while True:
        m = re.search(r'\)\s+instanceof\s+([\w.]+)(?:<[^>]*>)?(?:\s+(?!&&|\|\|)([a-z]\w*))?', s)
        if not m:
            break
        start = m.start()
        depth = 0
        j = start
        while j >= 0:
            if s[j] == ')':
                depth += 1
            elif s[j] == '(':
                depth -= 1
                if depth == 0:
                    break
            j -= 1
        k = j
        while k > 0 and (s[k - 1].isalnum() or s[k - 1] in '_.$'):
            k -= 1
        expr = s[k:start + 1]
        base = m.group(1).split('.')[-1]
        test = TYPE_TESTS.get(base, '(%s instanceof ' + base + ')') % expr
        if m.group(2):
            binds[m.group(2)] = expr
        s = s[:k] + test + s[m.end():]
    s = re.sub(r'([\w.]+(?:\([^()]*\))?)\s+instanceof\s+([\w.]+)(?:<[^>]*>)?(?:\s+(?!&&|\|\|)([a-z]\w*))?', rep, s)
    for var, expr in binds.items():
        s = re.sub(r'(?<![\w.])' + re.escape(var) + r'\b', expr, s)
    return s


RESERVED = {'var', 'function', 'delete', 'in', 'with', 'arguments', 'export', 'debugger', 'let', 'typeof', 'of'}


def _operand_end(s, i):
    """End index of the unary operand starting at i (identifier chains, calls, indexes, parens, literals)."""
    n = len(s)
    while i < n and s[i] == ' ':
        i += 1
    if i < n and s[i] in '-!+':
        i += 1
    if i < n and s[i] == '(':
        i = find_matching(s, i, '(', ')') + 1
    elif i < n and s[i] == '\x00':
        i = s.index('\x00', i + 1) + 1
    else:
        while i < n and (s[i].isalnum() or s[i] in '_$.'):
            i += 1
    while i < n:
        if s[i] == '(':
            i = find_matching(s, i, '(', ')') + 1
        elif s[i] == '[':
            i = find_matching(s, i, '[', ']') + 1
        elif s[i] == '.' and i + 1 < n and (s[i + 1].isalpha() or s[i + 1] == '_'):
            i += 1
            while i < n and (s[i].isalnum() or s[i] in '_$'):
                i += 1
        else:
            break
    return i


def convert_int_casts(s):
    out = ''
    i = 0
    pat = re.compile(r'\(\s*(?:int|long|short|byte)\s*\)\s*')
    while True:
        m = pat.search(s, i)
        if not m:
            out += s[i:]
            return out
        out += s[i:m.start()]
        e = _operand_end(s, m.end())
        out += 'jint(' + s[m.end():e] + ')'
        i = e


def rename_reserved(s):
    s = re.sub(r'\bvar\b(?!\s+\w+\s*(?:=|:|;|,))', 'var_', s)
    for w in ('function', 'delete', 'in', 'with', 'arguments', 'export', 'debugger', 'let', 'typeof', 'of'):
        s = re.sub(r'(?<![\w.])' + w + r'\b(?=\s*[=;,)\].]|\s*\+|\s*\))', w + '_', s)
        s = re.sub(r'(\(\s*|,\s*)' + w + r'\b(?=\s*[,)])', r'\1' + w + '_', s)
    return s


def rewrite_expr(s):
    s = rename_reserved(s)
    # generics on constructors / static calls
    s = re.sub(r'\bnew\s+([\w.]+)\s*<[^()]*?>\s*\(', r'new \1(', s)
    s = re.sub(r'\bnew\s+([\w.]+)\s*<[^()]*?>\s*\(', r'new \1(', s)
    s = re.sub(r'\.<[\w<>, ?]+>(\w)', r'.\1', s)
    # arrays: new T[]{a, b} -> [a, b]  (matching brace replaced too)
    while True:
        m = re.search(r'\bnew\s+[\w.]+(?:<[^>]*>)?\s*(?:\[\s*\])+\s*\{', s)
        if not m:
            break
        j = find_matching(s, m.end() - 1)
        s = s[:m.start()] + array_init(s[m.end() - 1:j + 1]) + s[j + 1:]
    s = re.sub(r'\bnew\s+(int|long|double|float|short|byte)\s*\[([^\]]+)\]', r'jnewArray(\2, 0)', s)
    s = re.sub(r'\bnew\s+boolean\s*\[([^\]]+)\]', r'jnewArray(\1, false)', s)
    s = re.sub(r'\bnew\s+[\w.]+\s*\[([^\]]+)\]', r'jnewArray(\1, null)', s)
    # collections
    s = re.sub(r'\bnew\s+(?:ArrayList|LinkedList|Vector)\s*\(\s*\)', '[]', s)
    s = re.sub(r'\bnew\s+(?:ArrayList|LinkedList)\s*\(', 'jlist(', s)
    s = re.sub(r'\bnew\s+(?:HashMap|LinkedHashMap|TreeMap|Hashtable)\s*\(', 'new JMap(', s)
    s = re.sub(r'\bnew\s+(?:HashSet|LinkedHashSet|TreeSet)\s*\(', 'new JSet(', s)
    s = re.sub(r'\b(?:List|Arrays)\.asList\(', 'jlist([', s) if False else s
    s = re.sub(r'\bList\.of\(', 'jlistOf(', s)
    s = re.sub(r'\bArrays\.asList\(', 'jlistOf(', s)
    s = re.sub(r'\bSet\.of\(', 'jsetOf(', s)
    # string api
    s = re.sub(r'\bString\.format\(', 'jformat(', s)
    s = re.sub(r'\bString\.valueOf\(', 'jstr(', s)
    s = re.sub(r'\bString\.join\(', 'jjoin(', s)
    s = re.sub(r'\bInteger\.parseInt\(', 'jparseInt(', s)
    s = re.sub(r'\bInteger\.valueOf\(', 'jparseInt(', s)
    s = re.sub(r'\bLong\.parseLong\(', 'jparseInt(', s)
    s = re.sub(r'\bDouble\.parseDouble\(', 'jparseDouble(', s)
    s = re.sub(r'\bInteger\.toHexString\(', 'jtoHex(', s)
    s = re.sub(r'\bTextUtils\.isEmpty\(', 'jisEmpty(', s)
    s = re.sub(r'\.length\(\)', '.length', s)
    s = re.sub(r'\.replace\(', '.jreplace(', s)
    s = re.sub(r'\.replaceAll\(', '.jreplaceAll(', s)
    s = re.sub(r'\.replaceFirst\(', '.jreplaceFirst(', s)
    s = re.sub(r'\.split\(', '.jsplit(', s)
    s = re.sub(r'\.matches\(', '.jmatches(', s)
    s = re.sub(r'\.size\(\)', '.size()', s)
    s = rewrite_instanceof(s)
    # casts
    s = convert_int_casts(s)
    s = re.sub(r'\(\s*(?:double|float|char)\s*\)\s*', '', s)
    s = re.sub(r'\((?:final\s+)?[A-Z][\w.]*(?:<[^()]*?>)?(?:\[\])?\)\s*(?=[\w(\x00!])', '', s)
    # lambdas
    s = re.sub(r'\(([\w\s,]*)\)\s*->', r'(\1) =>', s)
    s = re.sub(r'(?<![\w)])(\w+)\s*->', r'(\1) =>', s)
    # method references Foo::bar
    s = re.sub(r'(\w+)::new\b', r'((...a) => new \1(...a))', s)
    s = re.sub(r'([\w.]+)::(\w+)', r'((...a) => \1.\2(...a))', s)
    # misc
    s = re.sub(r'\bequals\(', 'equals(', s)
    s = re.sub(r'(\d+)[lL]\b', r'\1', s)
    s = re.sub(r'(\d+\.?\d*)[fFdD]\b', r'\1', s)
    s = re.sub(r'\bSystem\.currentTimeMillis\(\)', 'Date.now()', s)
    s = re.sub(r'\bSystem\.lineSeparator\(\)', '"\\n"', s)
    s = re.sub(r'\bCharacter\.toUpperCase\(([^()]+)\)', r'(\1).toUpperCase()', s)
    s = re.sub(r'\bCharacter\.toLowerCase\(([^()]+)\)', r'(\1).toLowerCase()', s)
    s = re.sub(r'\bCharacter\.isDigit\(', 'jisDigit(', s)
    s = re.sub(r'\bCharacter\.isLetter\(', 'jisLetter(', s)
    s = re.sub(r'\bCharacter\.isLetterOrDigit\(', 'jisLetterOrDigit(', s)
    s = re.sub(r'\bCharacter\.isUpperCase\(', 'jisUpper(', s)
    s = re.sub(r'\bCharacter\.isWhitespace\(', 'jisWhitespace(', s)
    s = re.sub(r'\bObjects\.equals\(', 'jequals(', s)
    s = re.sub(r'\bObjects\.requireNonNull\(', '(', s)
    s = re.sub(r'\bnew\s+StringBuilder\(', 'new StringBuilder(', s)
    s = re.sub(r'\bnew\s+File\(', 'new JFile(', s)
    s = re.sub(r'\bnew\s+TypeToken\s*\(\)\s*\{\s*\}\s*\.getType\(\)', 'null', s)
    s = re.sub(r'\.getClass\(\)', '.constructor', s)
    s = re.sub(r'(?<![\w.])getClass\(\)', 'this.constructor', s)
    s = re.sub(r'(?<![\w.$])isEmpty\(', 'jisEmpty(', s)
    # Java 14 multi-label classic case:  case "a", "b":
    s = re.sub(r'^(\s*)case\s+([^\n:]*,[^\n:]*):\s*$',
               lambda m: m.group(1) + ' '.join('case %s:' % x.strip() for x in split_top(m.group(2))), s, flags=re.M)
    s = re.sub(r'\bnew\s+Gson\(\)', 'new Gson()', s)
    s = re.sub(r'\bBoolean\.parseBoolean\(', 'jparseBool(', s)
    s = re.sub(r'\bString\.class\b', '"String"', s)
    s = re.sub(r'\bnew\s+StringBuffer\(', 'new StringBuilder(', s)
    return s


# ---------------------------------------------------------------- statements
LOCAL_DECL = re.compile(r'^(\s*)(?:final\s+)?(' + TYPE_RE + r')\s+(\w+)\s*(=|;|:)')


def hoist_switch_lets(body):
    """Java switch blocks share one scope across cases; `let` there hits the TDZ, so use `var`."""
    out = body
    pos = 0
    while True:
        m = re.search(r'\bswitch\s*\(', out[pos:])
        if not m:
            return out
        p0 = pos + m.end() - 1
        p1 = find_matching(out, p0, '(', ')')
        b = out.find('{', p1)
        if b < 0:
            return out
        e = find_matching(out, b)
        block = out[b + 1:e]
        res = ''
        depth = 0
        i = 0
        while i < len(block):
            c = block[i]
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
            if depth == 0 and block.startswith('let ', i) and (i == 0 or not (block[i - 1].isalnum() or block[i - 1] == '_')):
                res += 'var '
                i += 4
                continue
            res += c
            i += 1
        out = out[:b + 1] + res + out[e:]
        pos = b + 1


def array_init(s):
    """Java array initializer {a, {b}} -> [a, [b]] (only when the expression starts with '{')."""
    t = s.strip()
    if not t.startswith('{'):
        return s
    out = ''
    depth = 0
    for c in t:
        if c == '{':
            out += '['
            depth += 1
        elif c == '}':
            out += ']'
            depth -= 1
        else:
            out += c
    return out


def fix_local_array_inits(body):
    # Type[] name = { ... };  (possibly multi-line)
    res = ''
    i = 0
    pat = re.compile(r'(\[\]\s*\w+\s*=\s*)\{')
    while True:
        m = pat.search(body, i)
        if not m:
            res += body[i:]
            break
        res += body[i:m.end() - 1]
        j = find_matching(body, m.end() - 1)
        res += array_init(body[m.end() - 1:j + 1])
        i = j + 1
    return res


def convert_body(body, locals_set):
    body = fix_local_array_inits(body)
    """Convert a method body (already string-masked). Collect local names into locals_set."""
    lines = body.split('\n')
    out = []
    for line in lines:
        st = line
        # for-each
        m = re.match(r'^(\s*)for\s*\(\s*(?:final\s+)?(' + TYPE_RE + r')\s+(\w+)\s*:\s*(.*)\)\s*(\{?)\s*$', st)
        if m:
            locals_set.add(m.group(3))
            out.append('%sfor (const %s of jiter(%s)) %s' % (m.group(1), m.group(3), m.group(4), m.group(5)))
            continue
        # classic for with declaration
        m = re.match(r'^(\s*)for\s*\(\s*(?:final\s+)?(?:int|long|var|double|' + TYPE_RE + r')\s+(\w+)\s*=(.*)$', st)
        if m:
            locals_set.add(m.group(2))
            rest = m.group(3)
            rest = re.sub(r',\s*(?:int\s+)?(\w+)\s*=', lambda mm: (locals_set.add(mm.group(1)) or ', %s =' % mm.group(1)), rest, count=3)
            out.append('%sfor (let %s =%s' % (m.group(1), m.group(2), rest))
            continue
        # catch
        st = re.sub(r'catch\s*\(\s*(?:final\s+)?[\w.|\s]+\s+(\w+)\s*\)', r'catch (\1: any)', st)
        # local declaration
        m = LOCAL_DECL.match(st)
        if m and m.group(2) not in ('return', 'new', 'throw', 'else', 'case', 'yield') and not re.match(r'^\s*(return|throw|case|yield|else)\b', st):
            name = m.group(3)
            locals_set.add(name)
            rest = st[m.end(3):]
            if m.group(4) == ':':
                out.append(st)
                continue
            out.append('%slet %s%s' % (m.group(1), name, rest))
            continue
        out.append(st)
    return '\n'.join(out)


def convert_switches(s):
    """Arrow-style switches -> classic; switch expressions -> IIFEs."""
    pos = 0
    while True:
        m = re.search(r'\bswitch\s*\(', s[pos:])
        if not m:
            break
        start = pos + m.start()
        paren_start = pos + m.end() - 1
        paren_end = find_matching(s, paren_start, '(', ')')
        brace = s.index('{', paren_end)
        end = find_matching(s, brace)
        block = s[brace + 1:end]
        before = s[:start].rstrip()
        is_expr = bool(re.search(r'(=|return|\(|,|->|=>|\?|:)\s*$', before)) and not before.endswith('->')
        if before.endswith('->') or before.endswith('=>'):
            is_expr = True
        has_arrow = any(depth_at(block, mm.start()) == 0 for mm in re.finditer(r'^\s*(case\s[^\n]*?|default)\s*->', block, re.M))
        if not has_arrow and not is_expr:
            pos = brace + 1
            continue
        new_block = convert_case_block(convert_switches(block), is_expr, has_arrow)
        head = 'switch (' + s[paren_start + 1:paren_end] + ') {' + new_block + '}'
        if is_expr:
            head = '(() => { ' + head + ' })()'
        s = s[:start] + head + s[end + 1:]
        pos = start + len(head)
    return s


def convert_case_block(block, is_expr, has_arrow):
    if not has_arrow:
        # old style switch used as expression (yield)
        return re.sub(r'\byield\b', 'return', block)
    out = ''
    i = 0
    pat = re.compile(r'(case\s+(.*?)|default)\s*->\s*', re.S)
    while i < len(block):
        m = pat.search(block, i)
        if not m:
            out += block[i:]
            break
        out += block[i:m.start()]
        labels = m.group(2)
        if labels is not None:
            lab = ''.join('case %s: ' % l.strip() for l in split_top(labels))
        else:
            lab = 'default: '
        j = m.end()
        if block[j] == '{':
            k = find_matching(block, j)
            body = block[j + 1:k]
            body = re.sub(r'\byield\b', 'return', body)
            if is_expr:
                out += lab + '{' + body + '}'
            else:
                out += lab + '{' + body + ' break; }'
            i = k + 1
        else:
            k = j
            depth = 0
            while True:
                c = block[k]
                if c in '([{':
                    depth += 1
                elif c in ')]}':
                    depth -= 1
                elif c == ';' and depth == 0:
                    break
                k += 1
            stmt = block[j:k].strip()
            if is_expr:
                if stmt.startswith('throw '):
                    out += lab + stmt + ';'
                else:
                    out += lab + 'return ' + stmt + ';'
            else:
                out += lab + stmt + '; break;'
            i = k + 1
    return out


# ---------------------------------------------------------------- class level
METHOD_RE = re.compile(
    r'^(\s*)((?:@\w+(?:\([^)]*\))?\s+)*)((?:(?:public|private|protected|static|final|abstract|synchronized|native|default)\s+)*)'
    r'(?:<[^>]+>\s+)?((?:void|' + TYPE_RE + r')\s+)?(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w.,\s]+)?\s*\{', re.M)
FIELD_RE = re.compile(
    r'^(\s*)((?:@\w+(?:\([^)]*\))?\s+)*)((?:(?:public|private|protected|static|final|transient|volatile)\s+)*)(' + TYPE_RE + r')\s+(\w+)\s*(=[^;]*)?;', re.M)


def parse_params(ps):
    res = []
    for p in split_top(ps):
        p = re.sub(r'@\w+(?:\([^)]*\))?\s*', '', p).strip()
        p = re.sub(r'^final\s+', '', p)
        if not p:
            continue
        m = re.match(r'(.+?)\s+(\w+)$', p)
        res.append((m.group(2), m.group(1).strip()))
    return res


def convert_class(src, cls_name, outer_ctx=None):
    global OUTER
    OUTER = outer_ctx
    masked, table = mask_strings(src)
    masked = re.sub(r'^\s*package .*?;\s*$', '', masked, flags=re.M)
    imports = re.findall(r'^\s*import\s+(?:static\s+)?([\w.]+)\s*;', masked, re.M)
    masked = re.sub(r'^\s*import .*?;\s*$', '', masked, flags=re.M)
    masked = re.sub(r'@(Override|NonNull|Nullable|Deprecated|SuppressWarnings\([^)]*\)|SafeVarargs|ColorInt|DrawableRes|StringRes|Keep|IntDef\([^)]*\)|Expose|SerializedName\([^)]*\)|FunctionalInterface)\s*', '', masked)
    masked = convert_switches(masked)

    cm = re.search(r'(public\s+)?(?:final\s+)?(?:abstract\s+)?class\s+(\w+)[^{]*\{', masked)
    body_start = cm.end()
    body_end = find_matching(masked, cm.end() - 1)
    cbody = masked[body_start:body_end]

    # gather members (top level of class body only)
    members = []  # (kind, start, end, data)
    i = 0
    depth = 0
    top_spans = []
    # find top-level segments by scanning braces
    seg_start = 0
    k = 0
    while k < len(cbody):
        c = cbody[k]
        if c == '{':
            if depth == 0:
                pass
            depth += 1
        elif c == '}':
            depth -= 1
        k += 1

    fields = {}
    methods = []
    pos = 0
    while pos < len(cbody):
        mm = METHOD_RE.search(cbody, pos)
        fm = FIELD_RE.search(cbody, pos)
        # choose the earliest match that is at class depth 0
        cands = []
        mm = next_top(METHOD_RE, cbody, pos)
        fm = next_top(FIELD_RE, cbody, pos)
        for m, kind in ((mm, 'm'), (fm, 'f')):
            if m:
                cands.append((m.start(), kind, m))
        # also skip nested classes / static blocks
        nested = re.search(r'^\s*(?:(?:public|private|protected|static|final|abstract)\s+)*(?:class|interface|enum|record)\s+\w+[^{;]*\{', cbody[pos:], re.M)
        static_blk = re.search(r'^\s*static\s*\{', cbody[pos:], re.M)
        for nm_, kind in ((nested, 'n'), (static_blk, 's')):
            if nm_ and depth_at(cbody, pos + nm_.start()) == 0:
                cands.append((pos + nm_.start(), kind, nm_))
        if not cands:
            break
        cands.sort(key=lambda x: x[0])
        st, kind, m = cands[0]
        if kind == 'm':
            if m.group(5) in ('if', 'for', 'while', 'switch', 'catch', 'synchronized', 'return', 'new'):
                pos = m.end()
                continue
            b = cbody.index('{', m.end() - 1)
            e = find_matching(cbody, b)
            mods = m.group(3) or ''
            methods.append({'name': m.group(5), 'ret': (m.group(4) or '').strip(), 'params': parse_params(m.group(6)),
                            'static': 'static' in mods, 'body': cbody[b + 1:e], 'ctor': m.group(5) == cls_name and not m.group(4)})
            pos = e + 1
        elif kind == 'f':
            mods = m.group(3) or ''
            fields[m.group(5)] = {'type': m.group(4), 'static': 'static' in mods, 'init': (m.group(6) or '')[1:].strip()}
            pos = m.end()
        elif kind == 'n':
            b = pos + m.end() - 1
            e = find_matching(cbody, b)
            nested_src = cbody[pos + m.start():e + 1]
            methods.append({'nested': nested_src})
            pos = e + 1
        else:
            b = pos + m.end() - 1
            e = find_matching(cbody, b)
            methods.append({'name': '__static_init', 'ret': 'void', 'params': [], 'static': True, 'body': cbody[b + 1:e], 'ctor': False})
            pos = e + 1

    global METHOD_NAMES
    METHOD_NAMES = {m['name'] for m in methods if 'name' in m}
    static_names = {n for n, f in fields.items() if f['static']} | {m['name'] for m in methods if m.get('static')}
    inst_names = {n for n, f in fields.items() if not f['static']} | {m['name'] for m in methods if 'name' in m and not m.get('static') and not m.get('ctor')}

    out = []
    out.append('// Auto-ported from %s.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.' % cls_name)
    out.append('// imports: ' + ', '.join(imports))
    ext = re.search(r'\bextends\s+([\w.]+)', masked[cm.start():cm.end()])
    UI_BASES = ('Activity', 'View', 'Adapter', 'Fragment', 'Thread', 'Dialog', 'Layout', 'Holder', 'MA', 'Task', 'Receiver', 'Service', 'Exception')
    if ext and not ext.group(1).endswith(UI_BASES):
        out.append('export class %s extends %s {' % (cls_name, ext.group(1).split('.')[-1]))
    else:
        out.append('export class %s {' % cls_name)
    for n, f in fields.items():
        init = array_init(f['init'])
        line = '  %s%s: %s%s;' % ('static ' if f['static'] else '', n, ts_type(f['type']),
                                   (' = ' + qualify(rewrite_expr(init), set(), static_names, inst_names, cls_name, f['static'])) if init else '')
        out.append(line)
    # overload detection
    by_name = {}
    for m in methods:
        if 'name' in m:
            by_name.setdefault(m['name'], []).append(m)
    nested_out = []
    nested_names = []
    for m in methods:
        if 'nested' in m:
            nsrc = unmask_raw(m['nested'], table)
            saved_methods = METHOD_NAMES
            nname, nts = convert_nested(nsrc, cls_name, static_names)
            METHOD_NAMES = saved_methods
            nested_out.append(nts)
            nested_names.append(nname)
            out.append('  static %s = %s_%s;' % (nname, cls_name, nname))
            continue
        name = m['name']
        overloads = by_name[name]
        locals_set = set(p[0] for p in m['params'])
        body = convert_body(m['body'], locals_set)
        body = hoist_switch_lets(body)
        body = rewrite_expr(body)
        body = qualify(body, locals_set, static_names, inst_names, cls_name, m['static'])
        params = ', '.join(('...' if p[1].strip().endswith('...') else '') + '%s: %s' % (p[0] + '_' if p[0] in RESERVED else p[0], ts_type(p[1])) for p in m['params'])
        ret = '' if m['ctor'] else ': ' + ts_type(m['ret'] or 'void')
        if m['ctor']:
            mname = 'constructor' if len(overloads) == 1 else 'init_' + sig_suffix(m)
        elif name == '__static_init':
            out.append('  static {%s}' % body)
            continue
        else:
            mname = name if len(overloads) == 1 else name + '_' + sig_suffix(m)
        out.append('  %s%s(%s)%s {%s}' % ('static ' if m['static'] else '', mname, params, ret, body))
    # dispatchers
    for name, ovs in by_name.items():
        if len(ovs) < 2:
            continue
        if ovs[0]['ctor']:
            out.append('  constructor(...args: any[]) {')
            target = 'this'
        else:
            out.append('  %s%s(...args: any[]): any {' % ('static ' if ovs[0]['static'] else '', name))
            target = cls_name if ovs[0]['static'] else 'this'
        def is_var(o):
            return bool(o['params']) and o['params'][-1][1].strip().endswith('...')
        for ov in sorted(ovs, key=lambda o: (is_var(o), -len(o['params']), -sum(1 for p in o['params'] if ts_type(p[1]) in ('number','string','boolean') or ts_type(p[1]).endswith('[]')))):
            fixed = ov['params'][:-1] if is_var(ov) else ov['params']
            conds = ['args.length >= %d' % len(fixed)] if is_var(ov) else ['args.length === %d' % len(ov['params'])]
            for idx, (pn, pt) in enumerate(fixed):
                tt = ts_type(pt)
                if tt == 'string':
                    conds.append("(args[%d] == null || typeof args[%d] === 'string')" % (idx, idx))
                elif tt in ('number', 'boolean'):
                    conds.append("typeof args[%d] === '%s'" % (idx, tt))
                elif tt.endswith('[]'):
                    conds.append('Array.isArray(args[%d])' % idx)
            fn = ('init_' if ov['ctor'] else name + '_') + sig_suffix(ov)
            call = '%s.%s.apply(%s, args as any)' % (target, fn, target)
            if ov['ctor']:
                out.append('    if (%s) { %s; return; }' % (' && '.join(conds), call))
            else:
                out.append('    if (%s) return %s;' % (' && '.join(conds), call))
        out.append('    %s' % ('' if ovs[0]['ctor'] else "throw new Error('no overload of %s for ' + args.length);" % name))
        out.append('  }')
    out.append('}')
    res = '\n'.join(out)
    # a field and a method with the same name: the field becomes name$
    for n in set(fields) & {m['name'] for m in methods if 'name' in m}:
        res = re.sub(r'^(\s*(?:static )?)' + n + r':', r'\1' + n + '$:', res, flags=re.M)
        res = re.sub(r'\b(this|' + cls_name + r')\.' + n + r'\b(?![$\w])(?!\s*\()', r'\1.' + n + '$', res)
    # constructor chaining: this(...) inside overloaded constructors
    if 'init_' in res and '__ctor' not in res:
        res = re.sub(r'(?<![\w.])this\(', 'this.__ctor(', res)
        res = res.replace('  constructor(...args: any[]) {', '  constructor(...args: any[]) { this.__ctor(...args); }\n  __ctor(...args: any[]) {')
    res = unmask(res, table)
    if nested_out:
        lines = res.split('\n')
        res = '\n'.join(lines[:2] + nested_out + lines[2:])
        for nn in nested_names:
            full = '%s_%s' % (cls_name, nn)
            res = re.sub(r'\bnew\s+' + nn + r'\(', 'new %s(' % full, res)
            res = re.sub(r'instanceof ' + nn + r'\b', 'instanceof ' + full, res)
            if len(nn) > 1:
                res = re.sub(r'(?<![\w.])' + nn + r'\.(?=[A-Za-z_])', full + '.', res)
            res = re.sub(r'^export (class|enum) ' + nn + r'\b', r'export \1 ' + full, res, flags=re.M)
            res = re.sub(r'^export type ' + nn + r' = any;\nexport const ' + nn + r':', 'export type %s = any;\nexport const %s:' % (full, full), res, flags=re.M)
    return res


def unmask_raw(s, table):
    prev = None
    while prev != s:
        prev = s
        s = re.sub('\x00(\\d+)\x00', lambda m: table[int(m.group(1))][1], s)
    return s


def convert_nested(src, outer=None, outer_statics=None):
    m = re.search(r'\b(class|enum|interface|record)\s+(\w+)', src)
    kind, name = m.group(1), m.group(2)
    if kind == 'class':
        ts = convert_class(src, name, (outer, outer_statics or set()))
        ts = '\n'.join(l for l in ts.split('\n') if not l.startswith('// '))
        return name, ts
    if kind == 'enum':
        body = src[src.index('{') + 1:src.rindex('}')]
        body = re.sub(r'/\*.*?\*/', '', body, flags=re.S)
        body = re.sub(r'//[^\n]*', '', body)
        semi = body.find(';')
        consts = body if semi < 0 else body[:semi]
        rest = '' if semi < 0 else body[semi + 1:]
        items = []
        for c in split_top(consts):
            mm = re.match(r'\s*(?:@\w+\s*)*(\w+)\s*(\((.*)\))?\s*$', c, re.S)
            if mm and c.strip():
                items.append((mm.group(1), mm.group(3)))
        if not rest.strip():
            return name, 'export enum %s { %s }' % (name, ', '.join("%s = '%s'" % (n, n) for n, _ in items))
        # enum with members: a class with static instances
        rest = re.sub(r'(^|\n)(\s*)' + name + r'\s*\(', r'\1\2public ' + name + '(', rest)
        ts = convert_class('class %s {%s}' % (name, rest), name, (outer, outer_statics or set()))
        ts = '\n'.join(l for l in ts.split('\n') if not l.startswith('// '))
        inst = ''.join("\n  static %s = Object.assign(new %s(%s), { __name: '%s', __ordinal: %d });" % (n, name, j2ts_args(a), n, i)
                       for i, (n, a) in enumerate(items))
        inst += "\n  __name: string;\n  __ordinal: number;\n  ordinal() { return this.__ordinal; }\n  toString() { return this.__name; }"
        if not re.search(r'^\s*name\s*:', ts, re.M):
            inst += "\n  name() { return this.__name; }"
        inst += "\n  static values() { return [%s]; }" % ', '.join('%s.%s' % (name, n) for n, _ in items)
        ts = ts.replace('export class %s {' % name, 'export class %s {%s' % (name, inst), 1)
        return name, ts
    if kind == 'record':
        params = parse_params(src[src.index('(') + 1:src.index(')')])
        fields = ', '.join('public _%s: any' % p[0] for p in params)
        getters = ' '.join('%s() { return this._%s; }' % (p[0], p[0]) for p in params)
        return name, 'export class %s { constructor(%s) {} %s }' % (name, fields, getters)
    return name, 'export type %s = any;\nexport const %s: any = {};' % (name, name)


def j2ts_args(a):
    if not a:
        return ''
    return rewrite_expr(a)


def sig_suffix(m):
    if not m['params']:
        return '0'
    return '_'.join(re.sub(r'\W', '', re.sub(r'<.*>', '', p[1]).replace('[]', 'Arr')) for p in m['params'])


def next_top(regex, s, pos):
    while True:
        m = regex.search(s, pos)
        if not m:
            return None
        if depth_at(s, m.start()) == 0:
            return m
        pos = m.end()


def depth_at(s, idx):
    d = 0
    for c in s[:idx]:
        if c == '{':
            d += 1
        elif c == '}':
            d -= 1
    return d


OUTER = None


def qualify(body, locals_set, static_names, inst_names, cls, is_static):
    """Prefix bare references to fields/methods with this. / Cls."""
    def rep(m):
        name = m.group(2)
        pre = m.group(1)
        is_method_call = bool(m.group(3)) and name in METHOD_NAMES
        if name in locals_set and not is_method_call:
            return m.group(0)
        if name in static_names:
            return pre + cls + '.' + name
        if name in inst_names and not is_static:
            return pre + 'this.' + name
        if OUTER and OUTER[0] and name in OUTER[1]:
            return pre + OUTER[0] + '.' + name
        return m.group(0)
    return re.sub(r'(^|[^\w.\x00$])([A-Za-z_]\w*)\b(?=(\s*\())?(?!\s*:(?!:))', rep, body)


METHOD_NAMES = set()


if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    name = re.search(r'class\s+(\w+)', src).group(1)
    ts = convert_class(src, name)
    if len(sys.argv) > 2:
        open(sys.argv[2], 'w', encoding='utf8').write(ts)
    else:
        print(ts)
