// CodeMirror 6 editor themed with the app's Material 3 colors.
import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { java } from '@codemirror/lang-java';
import { xml } from '@codemirror/lang-xml';
import { json } from '@codemirror/lang-json';
import { StreamLanguage, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { kotlin } from '@codemirror/legacy-modes/mode/clike';
import { tags as t } from '@lezer/highlight';

export type CodeLang = 'java' | 'kotlin' | 'xml' | 'json' | 'text';

export function langFor(file: string): CodeLang {
  const f = file.toLowerCase();
  if (f.endsWith('.java')) return 'java';
  if (f.endsWith('.kt')) return 'kotlin';
  if (f.endsWith('.xml') || f.endsWith('.svg')) return 'xml';
  if (f.endsWith('.json')) return 'json';
  return 'text';
}

const theme = EditorView.theme({
  '&': { height: '100%', fontSize: '13.5px', backgroundColor: 'var(--surface-lowest)', color: 'var(--on-surface)' },
  '.cm-scroller': { fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace", lineHeight: '1.55' },
  '.cm-gutters': { backgroundColor: 'var(--surface-lowest)', color: 'var(--outline)', border: 'none' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'color-mix(in srgb, var(--primary) 7%, transparent)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-cursor': { borderLeftColor: 'var(--primary)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'color-mix(in srgb, var(--primary) 30%, transparent) !important' },
  '.cm-panels': { backgroundColor: 'var(--surface-high)', color: 'var(--on-surface)' },
  '.cm-tooltip': { backgroundColor: 'var(--surface-high)', border: 'none' },
});

// colors close to Sketchware Pro's code viewer (orange keywords/tags, green strings, violet attributes)
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword], color: '#f0a35e' },
  { tag: [t.string, t.special(t.string), t.attributeValue], color: '#9bc98a' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#7d8a96', fontStyle: 'italic' },
  { tag: [t.number, t.bool, t.null], color: '#78b6ff' },
  { tag: [t.typeName, t.className], color: '#e5c07b' },
  { tag: [t.tagName, t.angleBracket], color: '#f0a35e' },
  { tag: [t.attributeName, t.propertyName], color: '#c7a6ff' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#80cbff' },
  { tag: t.annotation, color: '#d7ba7d' },
]);

function langExt(l: CodeLang) {
  switch (l) {
    case 'java':
      return java();
    case 'kotlin':
      return StreamLanguage.define(kotlin);
    case 'xml':
      return xml();
    case 'json':
      return json();
    default:
      return [];
  }
}

export function CodeEditor(props: { value: string; lang: CodeLang; onChange?: (v: string) => void; readOnly?: boolean; wrap?: boolean; style?: React.CSSProperties }) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const langComp = useRef(new Compartment()).current;
  const onChange = useRef(props.onChange);
  onChange.current = props.onChange;

  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: props.value,
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          theme,
          syntaxHighlighting(highlight),
          langComp.of(langExt(props.lang)),
          EditorState.readOnly.of(!!props.readOnly),
          props.wrap ? EditorView.lineWrapping : [],
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChange.current?.(u.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = v;
    return () => v.destroy();
  }, []);

  // external value changes (e.g. switching files)
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== props.value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: props.value } });
  }, [props.value]);

  useEffect(() => {
    view.current?.dispatch({ effects: langComp.reconfigure(langExt(props.lang)) });
  }, [props.lang]);

  return <div ref={host} className="code-box" style={{ height: '100%', ...props.style }} />;
}
