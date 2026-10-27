// Full-screen code viewer/editor page (Sketchware's CodeViewerActivity / SrcCodeEditor).
import React, { useState } from 'react';
import { Page, IconButton } from '../common/m3';
import { CodeEditor, CodeLang } from '../common/CodeEditor';
import { toast } from '../common/dialogs';

export function CodePage(props: {
  title: string;
  subtitle?: string;
  text: string;
  lang: CodeLang;
  onClose: () => void;
  /** when given, the page is editable and shows a save button */
  onSave?: (text: string) => Promise<void> | void;
}) {
  const [text, setText] = useState(props.text);
  const [dirty, setDirty] = useState(false);
  const save = async () => {
    await props.onSave!(text);
    setDirty(false);
    toast('Saved');
  };
  return (
    <Page
      title={props.title + (dirty ? ' •' : '')}
      subtitle={props.subtitle}
      onClose={props.onClose}
      noContent
      actions={
        <>
          <IconButton
            icon="x_copy"
            title="Copy all"
            onClick={() => {
              navigator.clipboard.writeText(text);
              toast('Copied');
            }}
          />
          {props.onSave && <IconButton icon="ic_mtrl_save" title="Save (Ctrl+S)" onClick={save} disabled={!dirty} />}
        </>
      }
    >
      <div
        style={{ height: '100%', padding: '0 12px 12px' }}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key.toLowerCase() === 's' && props.onSave) {
            e.preventDefault();
            e.stopPropagation();
            save();
          }
        }}
      >
        <CodeEditor
          value={props.text}
          lang={props.lang}
          readOnly={!props.onSave}
          onChange={(v) => {
            setText(v);
            setDirty(true);
          }}
        />
      </div>
    </Page>
  );
}
