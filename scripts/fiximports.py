"""Adds/refreshes the import header of ported TS files in app/src/sw.

Imports jshim helpers that are referenced, bean classes from core/beans, and other ported classes
(one class per file, file name == class name)."""
import os
import re
import sys

APP = 'D:/sketchware-desktop/app/src'
SW = APP + '/sw'
SHIM = ['jparseBool', 'jformat', 'jstr', 'jjoin', 'jparseInt', 'jparseDouble', 'jtoHex', 'jisEmpty', 'jint', 'jIsString', 'jisDigit',
        'jisLetter', 'jisLetterOrDigit', 'jisUpper', 'jisWhitespace', 'jlist', 'jlistOf', 'jsetOf', 'jnewArray', 'jiter',
        'jequals', 'JMap', 'JSet', 'Pair', 'StringBuilder', 'Collectors', 'MapEntry', 'jregex', 'jsplitLines']
BEANS = ['ColorBean', 'SrcCodeBean', 'beanHooks', 'BlockBean', 'ViewBean', 'LayoutBean', 'TextBean', 'ImageBean', 'ComponentBean', 'EventBean', 'ProjectFileBean',
         'ProjectResourceBean', 'ProjectLibraryBean', 'AdUnitBean', 'AdTestDeviceBean']
MARK_START = '// <imports>'
MARK_END = '// </imports>'


def classes_in_sw():
    out = {}
    for f in os.listdir(SW):
        if f.endswith('.ts'):
            name = f[:-3]
            src = open(os.path.join(SW, f), encoding='utf8').read()
            for m in re.finditer(r'^export (?:class|const|function|interface|type|enum) (\w+)', src, re.M):
                out[m.group(1)] = './' + name
    return out


def strip_strings(src):
    src = re.sub(r'`(?:\\.|[^`\\])*`', '``', src, flags=re.S)
    src = re.sub(r'"(?:\\.|[^"\\\n])*"', '""', src)
    src = re.sub(r"'(?:\\.|[^'\\\n])*'", "''", src)
    src = re.sub(r'//[^\n]*', '', src)
    src = re.sub(r'/\*.*?\*/', '', src, flags=re.S)
    return src


def fix(path, known):
    src = open(path, encoding='utf8').read()
    if 'Auto-ported' not in src.splitlines()[0]:
        if MARK_START in src:
            a = src.index(MARK_START); b = src.index(MARK_END) + len(MARK_END) + 1
            open(path, 'w', encoding='utf8').write(src[:a] + src[b:])
        return
    if MARK_START in src:
        a = src.index(MARK_START)
        b = src.index(MARK_END) + len(MARK_END) + 1
        src = src[:a] + src[b:]
    me = os.path.basename(path)[:-3]
    body = strip_strings(src)
    used = set(re.findall(r'\b([A-Za-z_]\w*)\b', body))
    defined = set(re.findall(r'^export (?:class|const|function|interface|type|enum) (\w+)', src, re.M))
    lines = [MARK_START]
    shim = [s for s in SHIM if s in used and s not in defined]
    if shim:
        lines.append("import { %s } from '../codegen/jshim';" % ', '.join(shim))
    beans = [b for b in BEANS if b in used and b not in defined]
    if beans:
        lines.append("import { %s } from '../core/beans';" % ', '.join(beans))
    groups = {}
    for name, mod in known.items():
        if name in used and name not in defined and mod != './' + me:
            groups.setdefault(mod, []).append(name)
    for mod in sorted(groups):
        lines.append("import { %s } from '%s';" % (', '.join(sorted(groups[mod])), mod))
    lines.append(MARK_END)
    header = '\n'.join(lines) + '\n'
    # put after leading comment lines
    m = re.match(r'((?://[^\n]*\n)*)', src)
    src = src[:m.end()] + header + src[m.end():]
    open(path, 'w', encoding='utf8').write(src)


if __name__ == '__main__':
    known = classes_in_sw()
    files = sys.argv[1:] or [os.path.join(SW, f) for f in os.listdir(SW) if f.endswith('.ts')]
    for f in files:
        fix(f, known)
    print('fixed', len(files))


def main_all():
    known = classes_in_sw()
    for f in os.listdir(SW):
        if f.endswith('.ts'):
            fix(os.path.join(SW, f), known)
