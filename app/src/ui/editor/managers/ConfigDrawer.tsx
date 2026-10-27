// Project "Configuration" side sheet (DesignDrawer) with every manager of Sketchware Pro.
import React from 'react';
import { ProjectStore } from '../store';
import { mount } from '../../common/dialogs';
import { ListRow } from '../../common/m3';
import { SourceViewer } from '../SourceViewer';
import { LibraryManager } from './LibraryManager';
import { ViewManager } from './ViewManager';
import { ResourceManager } from '../ResourceManager';
import { FileTreeManager } from './FileTreeManager';
import { ResourceEditor } from './ResourceEditor';
import { PermissionManager } from './PermissionManager';
import { AppCompatManager } from './AppCompatManager';
import { ManifestManager } from './ManifestManager';
import { CustomBlocksUsed } from './CustomBlocksUsed';
import { ShrinkingManager, StringFogManager } from './ShrinkingManager';
import { XmlCommandManager } from './XmlCommandManager';
import { LogcatPage } from './LogcatPage';
import { CollectionManager } from './CollectionManager';
import { ProjectSettingsDialog } from '../ProjectDialogs';

type Item = { icon: string; title: string; sub: string; open: (s: ProjectStore) => void };

const page = (f: (s: ProjectStore, close: () => void) => React.ReactNode) => (s: ProjectStore) => mount((c) => f(s, c));

export const CONFIG_ITEMS: Item[] = [
  { icon: 'ic_mtrl_category', title: 'Library Manager', sub: 'Component settings', open: page((s, c) => <LibraryManager store={s} onClose={c} />) },
  { icon: 'ic_mtrl_devices', title: 'View Manager', sub: 'Manage multiple screens', open: page((s, c) => <ViewManager store={s} onClose={c} />) },
  { icon: 'ic_mtrl_image', title: 'Image Manager', sub: 'Import photos and icons', open: page((s, c) => <ResourceManager store={s} kind="images" onClose={c} />) },
  { icon: 'ic_mtrl_music', title: 'Sound Manager', sub: 'Import music and sound effects', open: page((s, c) => <ResourceManager store={s} kind="sounds" onClose={c} />) },
  { icon: 'ic_mtrl_font', title: 'Font Manager', sub: 'Import different fonts', open: page((s, c) => <ResourceManager store={s} kind="fonts" onClose={c} />) },
  { icon: 'ic_mtrl_java', title: 'Java/Kotlin Manager', sub: 'Import Java/Kotlin files', open: page((s, c) => <FileTreeManager store={s} kind="java" onClose={c} />) },
  { icon: 'ic_mtrl_folder', title: 'Resource Manager', sub: 'Manage resource files', open: page((s, c) => <FileTreeManager store={s} kind="resource" onClose={c} />) },
  { icon: 'ic_mtrl_folder_code', title: 'Resource Editor', sub: 'Edit resource files', open: page((s, c) => <ResourceEditor store={s} onClose={c} />) },
  { icon: 'ic_mtrl_file_present', title: 'Asset Manager', sub: 'Import asset files', open: page((s, c) => <FileTreeManager store={s} kind="assets" onClose={c} />) },
  { icon: 'ic_mtrl_shield_check', title: 'Permission Manager', sub: 'Add custom permissions', open: page((s, c) => <PermissionManager store={s} onClose={c} />) },
  { icon: 'ic_mtrl_inject', title: 'AppCompat Manager', sub: 'Modify AppCompat layouts', open: page((s, c) => <AppCompatManager store={s} onClose={c} />) },
  { icon: 'ic_mtrl_deployed_code', title: 'AndroidManifest Manager', sub: 'Modify AndroidManifest', open: page((s, c) => <ManifestManager store={s} onClose={c} />) },
  { icon: 'ic_mtrl_block', title: 'See Custom Blocks', sub: 'See used custom blocks', open: page((s, c) => <CustomBlocksUsed store={s} onClose={c} />) },
  { icon: 'ic_mtrl_shield_lock', title: 'Code Shrinking Manager', sub: 'Minimize/obfuscate your app with R8/ProGuard', open: page((s, c) => <ShrinkingManager store={s} onClose={c} />) },
  { icon: 'ic_mtrl_regular_expression', title: 'StringFog Manager', sub: 'Encrypt strings in your app at compilation time', open: page((s, c) => <StringFogManager store={s} onClose={c} />) },
  { icon: 'ic_mtrl_frame_source', title: 'Show Source Code', sub: 'View built-in Java and XML files', open: page((s, c) => <SourceViewer store={s} onClose={c} />) },
  { icon: 'ic_mtrl_code', title: 'XML Command Manager', sub: 'Modify built-in XML files', open: page((s, c) => <XmlCommandManager store={s} onClose={c} />) },
  { icon: 'ic_mtrl_article', title: 'Logcat Reader Manager', sub: 'Read logs from enabled projects', open: page((s, c) => <LogcatPage store={s} onClose={c} />) },
];

export function ConfigDrawer(props: { store: ProjectStore; onClose: () => void }) {
  const go = (f: (s: ProjectStore) => void) => {
    props.onClose();
    f(props.store);
  };
  return (
    <>
      <div className="sheet-back" onMouseDown={props.onClose} />
      <div className="sheet">
        <div className="sheet-head">Configuration</div>
        <div className="sheet-body">
          <ListRow icon="ic_mtrl_settings" title="Project settings" sub="App name, package, version, icon and theme colors" chevron onClick={() => go((s) => mount((c) => <ProjectSettingsDialog store={s} onClose={c} />))} />
          {CONFIG_ITEMS.map((i) => (
            <ListRow key={i.title} icon={i.icon} title={i.title} sub={i.sub} chevron onClick={() => go(i.open)} />
          ))}
          <div style={{ height: 1, background: 'var(--outline-variant)', margin: '8px 24px' }} />
          <ListRow icon="ic_mtrl_bookmark" title="Collection Manager" sub="My saved collections" chevron onClick={() => go((s) => mount((c) => <CollectionManager onClose={c} />))} />
        </div>
      </div>
    </>
  );
}
