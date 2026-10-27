import re

ESC = {'n': '\n', 't': '\t', 'r': '\r', '"': '"', '\\': '\\', "'": "'", '0': '\0', 'b': '\b', 'f': '\f', 's': ' '}


def jstr_tokens(expr):
    """Evaluate a Java expression made only of string literals joined by '+'; None otherwise."""
    out = ''
    i = 0
    expr = expr.strip()
    while i < len(expr):
        c = expr[i]
        if c.isspace() or c == '+':
            i += 1
            continue
        if c == '"':
            if expr.startswith('"""', i):
                j = expr.index('"""', i + 3)
                raw = expr[i + 3:j]
                i = j + 3
                lines = raw.split('\n')[1:]
                ind = min([len(l) - len(l.lstrip()) for l in lines if l.strip()] or [0])
                # closing delimiter indentation also counts
                last = lines[-1] if lines else ''
                if last.strip() == '':
                    ind = min(ind, len(last))
                txt = '\n'.join(l[ind:] for l in lines)
                txt = re.sub(r'\\(.)', lambda m: ESC.get(m.group(1), m.group(1)), txt)
                out += txt
                continue
            j = i + 1
            s = ''
            while expr[j] != '"':
                if expr[j] == '\\':
                    n = expr[j + 1]
                    if n == 'u':
                        s += chr(int(expr[j + 2:j + 6], 16))
                        j += 6
                        continue
                    s += ESC.get(n, n)
                    j += 2
                    continue
                s += expr[j]
                j += 1
            out += s
            i = j + 1
            continue
        return None
    return out


def split_args(s):
    args = []
    depth = 0
    cur = ''
    i = 0
    instr = False
    while i < len(s):
        c = s[i]
        if instr:
            cur += c
            if c == '\\':
                cur += s[i + 1]
                i += 2
                continue
            if c == '"':
                instr = False
        elif c == '"':
            instr = True
            cur += c
        elif c in '([{':
            depth += 1
            cur += c
        elif c in ')]}':
            depth -= 1
            cur += c
        elif c == ',' and depth == 0:
            args.append(cur)
            cur = ''
        else:
            cur += c
        i += 1
    args.append(cur)
    return args


def calls(text, name):
    """Return the raw argument text of every call `name(...)` (string-aware paren matching)."""
    res = []
    for m in re.finditer(re.escape(name) + r'\(', text):
        i = m.end()
        depth = 1
        instr = False
        j = i
        while depth:
            c = text[j]
            if instr:
                if c == '\\':
                    j += 2
                    continue
                if c == '"':
                    instr = False
            elif c == '"':
                instr = True
            elif c == '(':
                depth += 1
            elif c == ')':
                depth -= 1
            j += 1
        res.append(text[i:j - 1])
    return res
