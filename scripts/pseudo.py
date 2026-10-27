# Symbolic stack translator: JVM bytecode -> readable pseudo-Java (labels + gotos).
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jdis import CF

BIN = {96: '+', 97: '+', 98: '+', 99: '+', 100: '-', 101: '-', 102: '-', 103: '-', 104: '*', 105: '*', 106: '*', 107: '*',
       108: '/', 109: '/', 110: '/', 111: '/', 112: '%', 113: '%', 114: '%', 115: '%', 120: '<<', 121: '<<', 122: '>>', 123: '>>',
       124: '>>>', 125: '>>>', 126: '&', 127: '&', 128: '|', 129: '|', 130: '^', 131: '^'}
CONV = {133: '(long)', 134: '(float)', 135: '(double)', 136: '(int)', 137: '(float)', 138: '(double)', 139: '(int)', 140: '(long)',
        141: '(double)', 142: '(int)', 143: '(long)', 144: '(float)', 145: '(byte)', 146: '(char)', 147: '(short)'}
COND = {'ifeq': '== 0', 'ifne': '!= 0', 'iflt': '< 0', 'ifge': '>= 0', 'ifgt': '> 0', 'ifle': '<= 0'}
CMP = {'if_icmpeq': '==', 'if_icmpne': '!=', 'if_icmplt': '<', 'if_icmpge': '>=', 'if_icmpgt': '>', 'if_icmple': '<=',
       'if_acmpeq': '==', 'if_acmpne': '!='}


def short(sig):
    # a/a/a/Ts.hI -> this.h ; java/lang/String.equals(...)Z -> .equals
    return sig


def member(arg):
    m = re.match(r'([\w/$]+)\.([\w<>$]+)(.*)', arg)
    cls, name, desc = m.group(1), m.group(2), m.group(3)
    return cls.split('/')[-1], name, desc


def nargs(desc):
    inner = desc[desc.index('(') + 1:desc.index(')')]
    n = 0
    i = 0
    while i < len(inner):
        c = inner[i]
        if c == 'L':
            i = inner.index(';', i) + 1
            n += 1
        elif c == '[':
            i += 1
            continue
        else:
            i += 1
            n += 1
    return n


def translate(cf, code):
    ins = cf.dis(code)
    targets = set()
    for pc, nm, arg in ins:
        if (nm.startswith('if') or nm == 'goto') and isinstance(arg, int):
            targets.add(arg)
        if nm in ('tableswitch', 'lookupswitch'):
            targets.update(arg['cases'].values())
            targets.add(arg['default'])
    out = []
    st = []
    for pc, nm, arg in ins:
        if pc in targets:
            if st:
                out.append('    // stack carried: %s' % st)
            out.append('L%d:' % pc)
        o = None
        if nm.startswith('op'):
            o = int(nm[2:])
        if nm in ('aconst_null',):
            st.append('null')
        elif nm.startswith('iconst_'):
            st.append('-1' if nm == 'iconst_m1' else nm[7:])
        elif nm.startswith(('fconst_', 'dconst_', 'lconst_')):
            st.append(nm[7:] + nm[0])
        elif nm in ('bipush', 'sipush'):
            st.append(str(arg))
        elif nm in ('ldc', 'ldc_w', 'ldc2_w'):
            st.append(arg)
        elif re.match(r'[ilfda]load(_\d)?$', nm):
            idx = nm.split('_')[1] if '_' in nm else arg
            st.append('this' if str(idx) == '0' and nm.startswith('a') else 'v%s' % idx)
        elif re.match(r'[ilfda]store(_\d)?$', nm):
            idx = nm.split('_')[1] if '_' in nm else arg
            out.append('    v%s = %s;' % (idx, st.pop() if st else '?'))
        elif nm == 'iinc':
            out.append('    v%d += %d;' % arg)
        elif o in BIN:
            b = st.pop(); a = st.pop(); st.append('(%s %s %s)' % (a, BIN[o], b))
        elif o in (116, 117, 118, 119):
            st.append('-(%s)' % st.pop())
        elif o in CONV:
            st.append('%s%s' % (CONV[o], st.pop()))
        elif o in (148, 149, 150, 151, 152):
            b = st.pop(); a = st.pop(); st.append('cmp(%s, %s)' % (a, b))
        elif o == 87:
            out.append('    %s;' % st.pop())
        elif o == 88:
            st.pop()
        elif o == 89:
            st.append(st[-1])
        elif o == 90:
            v = st.pop(); w = st.pop(); st += [v, w, v]
        elif o == 92:
            st += st[-2:]
        elif o in (46, 47, 48, 49, 50, 51, 52, 53):
            i = st.pop(); a = st.pop(); st.append('%s[%s]' % (a, i))
        elif o in (79, 80, 81, 82, 83, 84, 85, 86):
            v = st.pop(); i = st.pop(); a = st.pop(); out.append('    %s[%s] = %s;' % (a, i, v))
        elif nm == 'arraylength':
            st.append('%s.length' % st.pop())
        elif nm in ('newarray', 'anewarray'):
            st.append('new[%s]' % st.pop())
        elif nm == 'new':
            st.append('new ' + arg.replace('class ', '').split('/')[-1])
        elif nm == 'checkcast':
            st.append('((%s)%s)' % (arg.replace('class ', '').split('/')[-1], st.pop()))
        elif nm == 'instanceof':
            st.append('(%s instanceof %s)' % (st.pop(), arg.replace('class ', '').split('/')[-1]))
        elif nm == 'getfield':
            c, n, d = member(arg); st.append('%s.%s' % (st.pop(), n))
        elif nm == 'getstatic':
            c, n, d = member(arg); st.append('%s.%s' % (c, n))
        elif nm == 'putfield':
            c, n, d = member(arg); v = st.pop(); obj = st.pop(); out.append('    %s.%s = %s;' % (obj, n, v))
        elif nm == 'putstatic':
            c, n, d = member(arg); out.append('    %s.%s = %s;' % (c, n, st.pop()))
        elif nm.startswith('invoke'):
            c, n, d = member(arg) if nm != 'invokedynamic' else ('indy', arg, arg)
            k = nargs(d) if nm != 'invokedynamic' else 0
            args = [st.pop() for _ in range(k)][::-1]
            if nm == 'invokestatic':
                expr = '%s.%s(%s)' % (c, n, ', '.join(args))
            elif nm == 'invokedynamic':
                expr = 'indy(%s)' % arg
            else:
                obj = st.pop()
                if n == '<init>':
                    expr = '%s(%s)' % (obj, ', '.join(args))
                    # constructor on a dup'd "new X": replace the remaining copy
                    if st and st[-1] == obj:
                        st[-1] = expr
                        continue
                else:
                    expr = '%s.%s(%s)' % (obj, n, ', '.join(args))
            if d.endswith(')V'):
                out.append('    %s;' % expr)
            else:
                st.append(expr)
        elif nm in COND:
            out.append('    if (%s %s) goto L%d;' % (st.pop(), COND[nm], arg))
        elif nm in ('ifnull', 'ifnonnull'):
            out.append('    if (%s %s null) goto L%d;' % (st.pop(), '==' if nm == 'ifnull' else '!=', arg))
        elif nm in CMP:
            b = st.pop(); a = st.pop(); out.append('    if (%s %s %s) goto L%d;' % (a, CMP[nm], b, arg))
        elif nm == 'goto':
            out.append('    goto L%d;' % arg)
        elif nm in ('tableswitch', 'lookupswitch'):
            out.append('    switch (%s) %s' % (st.pop(), {k: 'L%d' % v for k, v in arg['cases'].items()} | {'default': 'L%d' % arg['default']}))
        elif nm.endswith('return'):
            out.append('    return%s;' % ((' ' + st.pop()) if nm != 'return' and st else ''))
        elif nm == 'athrow':
            out.append('    throw %s;' % st.pop())
        elif nm in ('monitorenter', 'monitorexit'):
            st.pop()
        else:
            out.append('    /* %s %s */' % (nm, arg))
    return out


if __name__ == '__main__':
    cf = CF(sys.argv[1])
    want = sys.argv[2:] if len(sys.argv) > 2 else None
    for n, dsc, a in cf.methods:
        if want and n + dsc not in want and n not in want:
            continue
        print('### %s%s' % (n, dsc))
        if 'Code' in a:
            try:
                print('\n'.join(translate(cf, a['Code'])))
            except Exception as e:
                print('  !! %r' % e)
