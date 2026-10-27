"""Convert Sketchware Pro's Android vector drawables to SVG snippets.

Output: app/src/ui/icons/icons.json  {name: {"vb": "0 0 w h", "svg": "<path .../>"}}
Theme-tinted fills (white, ?attr/..., @color/...) become currentColor so icons follow the text color.
"""
import json, os, re, sys
import xml.etree.ElementTree as ET

RES = 'D:/sketchware-desktop/ref/Sketchware-Pro/app/src/main/res/drawable'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'D:/sketchware-desktop/app/src/ui/icons/icons.json'
A = '{http://schemas.android.com/apk/res/android}'


def color(v):
    if not v:
        return None
    v = v.strip()
    m = re.fullmatch(r'#([0-9a-fA-F]{3,8})', v)
    if m:
        h = m.group(1)
        if len(h) == 8:  # AARRGGBB -> rgba
            a = int(h[:2], 16) / 255
            return 'rgba(%d,%d,%d,%.3f)' % (int(h[2:4], 16), int(h[4:6], 16), int(h[6:8], 16), a)
        if len(h) == 4:
            return '#' + h[1:]
        return '#' + h
    return 'currentColor'


def num(v, d=0.0):
    try:
        return float(str(v).replace('dp', ''))
    except Exception:
        return d


TINTED = False  # a root android:tint recolors every path (SRC_IN), so fills follow the text color


def path(el):
    d = el.get(A + 'pathData')
    if not d:
        return ''
    fill = color(el.get(A + 'fillColor'))
    stroke = color(el.get(A + 'strokeColor'))
    if TINTED:
        fill = 'currentColor' if fill else None
        stroke = 'currentColor' if stroke else None
    attrs = ['d="%s"' % d]
    attrs.append('fill="%s"' % (fill or 'none'))
    if el.get(A + 'fillAlpha'):
        attrs.append('fill-opacity="%s"' % el.get(A + 'fillAlpha'))
    if el.get(A + 'fillType', '').lower() == 'evenodd':
        attrs.append('fill-rule="evenodd"')
    if stroke:
        attrs.append('stroke="%s"' % stroke)
        attrs.append('stroke-width="%s"' % num(el.get(A + 'strokeWidth'), 1))
        if el.get(A + 'strokeLineCap'):
            attrs.append('stroke-linecap="%s"' % el.get(A + 'strokeLineCap'))
        if el.get(A + 'strokeLineJoin'):
            attrs.append('stroke-linejoin="%s"' % el.get(A + 'strokeLineJoin'))
    return '<path %s/>' % ' '.join(attrs)


def group(el):
    out = []
    for c in el:
        tag = c.tag.split('}')[-1]
        if tag == 'path':
            out.append(path(c))
        elif tag == 'group':
            tr = []
            tx, ty = num(c.get(A + 'translateX')), num(c.get(A + 'translateY'))
            px, py = num(c.get(A + 'pivotX')), num(c.get(A + 'pivotY'))
            rot = num(c.get(A + 'rotation'))
            sx, sy = num(c.get(A + 'scaleX'), 1), num(c.get(A + 'scaleY'), 1)
            # Android order: translate, then rotate/scale about the pivot
            if tx or ty:
                tr.append('translate(%g %g)' % (tx, ty))
            if rot or sx != 1 or sy != 1:
                tr.append('translate(%g %g)' % (px, py))
                if rot:
                    tr.append('rotate(%g)' % rot)
                if sx != 1 or sy != 1:
                    tr.append('scale(%g %g)' % (sx, sy))
                tr.append('translate(%g %g)' % (-px, -py))
            inner = group(c)
            out.append('<g transform="%s">%s</g>' % (' '.join(tr), inner) if tr else inner)
        elif tag == 'clip-path':
            pass
    return ''.join(out)


icons = {}
files = []
for d in (RES, RES + '-xhdpi'):
    if os.path.isdir(d):
        files += [(d, f) for f in sorted(os.listdir(d))]
for d, f in files:
    if not f.endswith('.xml') or f[:-4] in icons:
        continue
    try:
        root = ET.parse(os.path.join(d, f)).getroot()
    except ET.ParseError:
        continue
    if root.tag != 'vector':
        continue
    vw, vh = num(root.get(A + 'viewportWidth'), 24), num(root.get(A + 'viewportHeight'), 24)
    TINTED = bool(root.get(A + 'tint'))
    svg = group(root)
    if svg:
        icons[f[:-4]] = {'vb': '0 0 %g %g' % (vw, vh), 'svg': svg}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(icons, open(OUT, 'w', encoding='utf8'), separators=(',', ':'))
print(len(icons), 'icons ->', OUT, os.path.getsize(OUT) // 1024, 'KB')
