import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from javalit import jstr_tokens, split_args, calls

SRC = 'D:/sketchware-desktop/ref/Sketchware-Pro/app/src/main/java/'
blocks = []
bh = open(SRC + 'mod/hilal/saif/blocks/BlocksHandler.java', encoding='utf8').read()
body = bh[bh.index('public static void builtInBlocks'):bh.index('public static void primaryBlocksA')]
cur = None
for a in calls(body, 'hashMap.put'):
    args = split_args(a)
    if len(args) != 2:
        continue
    k = jstr_tokens(args[0])
    v = jstr_tokens(args[1])
    if k == 'name':
        cur = {}
        blocks.append(cur)
    if cur is None:
        continue
    if v is None:
        v = {'__expr': args[1].strip()}
    cur[k] = v

eb = open(SRC + 'pro/sketchware/blocks/ExtraBlocks.java', encoding='utf8').read()
eb = eb[eb.index('public static void extraBlocks'):eb.index('private static HashMap')]
extra = []
for a in calls(eb, 'addBlock'):
    args = [jstr_tokens(x) for x in split_args(a)]
    d = dict(zip(['name', 'type', 'typeName', 'code', 'color', 'spec', 'spec2'], args))
    d['palette'] = '-1'
    extra.append(d)
blocks = extra + blocks
odd = [b for b in blocks if any(isinstance(v, dict) for v in b.values())]
print(len(blocks), 'blocks;', len(odd), 'with non-literal values')
for b in odd[:30]:
    print({k: v for k, v in b.items() if isinstance(v, dict) or k == 'name'})
json.dump(blocks, open(sys.argv[1], 'w', encoding='utf8'), indent=1, ensure_ascii=False)
