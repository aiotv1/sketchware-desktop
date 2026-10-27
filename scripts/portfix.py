"""Per-class fixups for the Java -> TS port (applied by port_all.py)."""
import re

# methods that only make sense inside the Android UI: removed from the port
DROP_METHODS = {
    'ReturnMoreblockManager': ['getMbTypeFromChipGroup', 'listMoreblocks'],
    'Material3LibraryManager': ['getViewEditorThemeOverlay', 'canUseNightVariantColors'],
    'ProjectSettings': ['setValues', 'processView', 'getCheckedRbValue'],
    'ComponentsHandler': ['description', 'icon', 'docs', 'descriptions'],
    'DefaultExtraMenuBean': ['getMenu', 'getPath', 'getFilename'],
    'InjectRootLayoutManager': ['getRootLayout'],
}

# (regex, replacement) applied to the Java source before conversion
PRE = {
    'XmlBuilder': [
        (r'resultCode\.append\(attr\.toCode\(\)\);', 'resultCode.append(attr.toCode(g));'),
        (r'private String toCode\(\) \{(\s*)if \(namespace', r'private String toCode(String g) {\1if (namespace'),
    ],
    'Ox': [
        # XmlPullParser-based tools:replace reader -> regex helper
        (r'public Set<String> readAttributesToReplace\(ViewBean viewBean\) \{.*?\n    \}\n',
         'public Set<String> readAttributesToReplace(ViewBean viewBean) {\n        return new HashSet<>(Platform.readToolsReplace(viewBean.inject));\n    }\n'),
    ],
    'jq': [
        (r'public static class a \{', 'public static class ActivityConfig {'),
        (r'public a a\(String activityName\)', 'public ActivityConfig a(String activityName)'),
        (r'new a\(\)', 'new ActivityConfig()'),
        (r'HashMap<String, a>', 'HashMap<String, ActivityConfig>'),
    ],
    'BuildSettings': [
        (r'"/\.sketchware/data/" \+ sc_id \+', '"/.sketchware/data/" + this.sc_id +'),
    ],
}

# (regex, replacement) applied to the generated TypeScript
POST = {
    'Ox': [(r'Platform\.readToolsReplace', 'readToolsReplace')],
    'Lx': [(r'Lx\.getInitializer\(typeName, parameters\)', 'Lx.getInitializer(typeName, ...parameters)')],
    'Jx': [(r'projectDataManager\.a\b(?!\s*\()', 'projectDataManager.a$')],
    'yq': [(r'if \(args\.length === 3\) return this\.a_iC_hC_eC\.', 'if (args.length === 3 && args[0] instanceof iC) return this.a_iC_hC_eC.')],
    'ManageLocalLibrary': [(r'\.constructor\.getSimpleName\(\)', '.constructor.name')],
    'InjectRootLayoutManager': [(r'new ViewBeanFactory\(viewBean\)\.applyAttributes\([^;]*\);', '')],
}


def _block_end(src, brace_index):
    depth = 0
    j = brace_index
    while True:
        c = src[j]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return j
        j += 1


def strip_parcelable(src):
    """Removes Parcelable CREATOR fields, writeToParcel/describeContents and Parcel constructors."""
    while True:
        i = src.find('CREATOR = new')
        if i < 0:
            break
        start = src.rfind('\n', 0, i) + 1
        j = _block_end(src, src.index('{', i))
        end = src.index(';', j) + 1
        src = src[:start] + src[end:]
    pats = [
        r'(public|protected|private)?\s*\w+\s*\(\s*Parcel\s+\w+\s*\)\s*\{',
        r'public\s+void\s+writeToParcel\s*\(',
        r'public\s+int\s+describeContents\s*\(',
    ]
    for pat in pats:
        while True:
            m = re.search(pat, src)
            if not m:
                break
            start = src.rfind('\n', 0, m.start()) + 1
            j = _block_end(src, src.index('{', m.start()))
            src = src[:start] + src[j + 1:]
    return src


def pre(cls, src):
    src = strip_parcelable(src)
    for a, b in PRE.get(cls, []):
        src = re.sub(a, b, src, flags=re.S)
    return src


def drop_method(ts, name):
    out = ts
    while True:
        m = re.search(r'^  (?:static )?' + re.escape(name) + r'(?:_\w+)?\(', out, re.M)
        if not m:
            return out
        i = m.start()
        b = out.index('{', out.index(')', m.end() - 1))
        j = _block_end(out, b)
        out = out[:i] + out[j + 1:].lstrip('\n')


def post(cls, ts):
    for name in DROP_METHODS.get(cls, []):
        ts = drop_method(ts, name)
    for a, b in POST.get(cls, []):
        ts = re.sub(a, b, ts, flags=re.S)
    # static fields built from the storage path are evaluated when the module loads, before the
    # workspace is configured: turn them into getters so they always use the current workspace
    ts = re.sub(r'^(\s*)static (\w+): (\w+) = (.*(?:getExternalStorageDir|getExternalStorageDirectory)\(\).*);$',
                r'\1static get \2(): \3 {\n\1    return \4;\n\1  }', ts, flags=re.M)
    return ts
