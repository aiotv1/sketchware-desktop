// Static part of mod.jbk.editor.manage.library.ExcludeBuiltInLibrariesActivity.
import { FileUtil, getExternalStorage } from './env';
import { BuiltInLibraries } from './BuiltInLibraries';

function readConfig(scId: string): { enabled: boolean; libs: any[] } | null {
  const path = getExternalStorage() + '/.sketchware/data/' + scId + '/excluded_library';
  if (!FileUtil.isExistFile(path)) return null;
  try {
    const o = JSON.parse(FileUtil.readFile(path));
    // stored as {"first": bool, "second": [{"name": ...}, ...]} (Gson of Pair)
    const enabled = !!(o.first ?? o.enabled);
    const names: string[] = (o.second ?? o.libraries ?? []).map((l: any) => (typeof l === 'string' ? l : l.name));
    const libs = names
      .map((n) => BuiltInLibraries.KNOWN_BUILT_IN_LIBRARIES.find((b: any) => b.getName() === n))
      .filter((x: any) => x);
    return { enabled, libs };
  } catch {
    return null;
  }
}

export class ExcludeBuiltInLibrariesActivity {
  static isExcludingEnabled(scId: string): boolean {
    return readConfig(scId)?.enabled ?? false;
  }
  static getExcludedLibraries(scId: string): any[] {
    return readConfig(scId)?.libs ?? [];
  }
  static getItemTitle() {
    return 'Exclude built-in libraries';
  }
  static getItemIcon() {
    return 0;
  }
  static getDefaultItemDescription() {
    return 'Exclude built-in libraries from your project';
  }
  static getSelectedLibrariesItemDescription() {
    return '';
  }
}
