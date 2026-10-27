import sys
p = 'D:/sketchware-desktop/app/src/core/beans.ts'
lines = open(p, encoding='utf8').read().split('\n')
for i, l in enumerate(lines):
    if l.startswith("  return JSON.stringify(v).replace(/[<>&='"):
        lines[i] = "  return JSON.stringify(v).replace(/[<>&='\\u2028\\u2029]/g, (c) => '\\\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));"
open(p, 'w', encoding='utf8').write('\n'.join(lines))
