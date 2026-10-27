"""Re-runs the whole Java -> TS port of Sketchware Pro's code generator into app/src/sw.

Two passes: (1) collect field/method name clashes per class, (2) convert every file, rename
clashing fields to name$ (and references Cls.name -> Cls.name$), drop UI-only methods, apply the
hand-written fixups from portfix.py, then refresh imports.
"""
import os
import re
import sys
import importlib

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import j2ts  # noqa: E402

J = 'D:/sketchware-desktop/ref/Sketchware-Pro/app/src/main/java/'
OUT = 'D:/sketchware-desktop/app/src/sw/'

PORT = [
    'a/a/a/Gx', 'a/a/a/mq', 'a/a/a/uq', 'a/a/a/sq', 'a/a/a/wq', 'a/a/a/oq', 'a/a/a/jq',
    'a/a/a/Fx', 'a/a/a/Lx', 'a/a/a/Jx', 'a/a/a/Hx', 'a/a/a/Ox', 'a/a/a/Ix', 'a/a/a/yq',
    'mod/agus/jcoderz/editor/event/ManageEvent',
    'mod/hilal/saif/components/ComponentsHandler',
    'mod/hilal/saif/events/EventsHandler',
    'mod/hilal/saif/blocks/CommandBlock',
    'mod/hilal/saif/events/LogicHandler',
    'mod/hilal/saif/components/ComponentExtraCode',
    'mod/agus/jcoderz/handle/component/ConstVarComponent',
    'mod/hilal/saif/android_manifest/AndroidManifestInjector',
    'pro/sketchware/utility/InjectAttributeHandler',
    'pro/sketchware/xml/XmlBuilder',
    'pro/sketchware/xml/XmlBuilderHelper',
    'mod/hey/studios/project/ProjectSettings',
    'mod/hey/studios/build/BuildSettings',
    'mod/jbk/build/BuiltInLibraries',
    'pro/sketchware/util/library/BuiltInLibraryManager',
    'pro/sketchware/control/logic/PermissionManager',
    'pro/sketchware/utility/FileResConfig',
    'pro/sketchware/utility/FilePathUtil',
    'mod/agus/jcoderz/editor/manage/library/locallibrary/ManageLocalLibrary',
    'mod/hey/studios/project/proguard/ProguardHandler',
    'dev/aldi/sayuti/editor/injection/AppCompatInjection',
    'pro/sketchware/managers/inject/InjectRootLayoutManager',
    'mod/agus/jcoderz/editor/manifest/EditorManifest',
    'mod/hey/studios/editor/view/IdGenerator',
    'mod/hey/studios/moreblock/ReturnMoreblockManager',
    'a/a/a/Jp',
    'mod/agus/jcoderz/editor/library/ExtLibSelected',
    'pro/sketchware/util/library/BuiltInLibraryUtils',
    'com/besome/sketch/editor/manage/library/material3/Material3LibraryManager',
    'pro/sketchware/menu/DefaultExtraMenuBean',
    'pro/sketchware/utility/CustomVariableUtil',
]


def class_members(path):
    src = open(J + path + '.java', encoding='utf8').read()
    masked, _ = j2ts.mask_strings(src)
    fields = set(m.group(5) for m in j2ts.FIELD_RE.finditer(masked) if j2ts.depth_at(masked, m.start()) <= 1)
    methods = set(m.group(5) for m in j2ts.METHOD_RE.finditer(masked) if j2ts.depth_at(masked, m.start()) <= 1)
    return fields, methods


def main(only=None):
    import portfix
    importlib.reload(portfix)
    clashes = {}
    for p in PORT:
        cls = os.path.basename(p)
        f, m = class_members(p)
        c = f & m
        if c:
            clashes[cls] = c
    for p in PORT:
        cls = os.path.basename(p)
        if only and cls not in only:
            continue
        src = open(J + p + '.java', encoding='utf8').read()
        src = portfix.pre(cls, src)
        try:
            ts = j2ts.convert_class(src, cls)
        except Exception as e:
            print('FAIL', cls, e)
            continue
        # field/method clashes: the field becomes name$
        for other, names in clashes.items():
            for n in names:
                if other != cls:
                    ts = re.sub(r'\b' + other + r'\.' + n + r'\b(?![$\w])(?!\s*\()', other + '.' + n + '$', ts)
        ts = portfix.post(cls, ts)
        open(OUT + cls + '.ts', 'w', encoding='utf8').write(ts)
    import fiximports
    fiximports.main_all()
    print('ported', len(PORT) if not only else len(only))


if __name__ == '__main__':
    main(sys.argv[1:] or None)
