// Auto-ported from BuiltInLibraryManager.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.util.Log, java.util.ArrayList, java.util.HashSet, java.util.List, java.util.Optional, java.util.Set, a.a.a.Jp, a.a.a.ProjectBuilder, mod.jbk.build.BuiltInLibraries, mod.jbk.editor.manage.library.ExcludeBuiltInLibrariesActivity
// <imports>
import { jiter, JSet } from '../codegen/jshim';
import { BuiltInLibraries } from './BuiltInLibraries';
import { BuiltInLibraryUtils } from './BuiltInLibraryUtils';
import { ExcludeBuiltInLibrariesActivity } from './ExcludeBuiltInLibraries';
import { Jp } from './Jp';
import { Log } from './env';
import { ProjectBuilder } from './platform';
// </imports>
export class BuiltInLibraryManager {
  libraries: any = [];
  excludedLibraries: any;
  processedLibraries: any = new JSet();
  constructor(projectId: string) {
        if (ExcludeBuiltInLibrariesActivity.isExcludingEnabled(projectId)) {
            this.excludedLibraries = ExcludeBuiltInLibrariesActivity.getExcludedLibraries(projectId);
        } else {
            this.excludedLibraries = [];
        }
    }
  addLibrary(libraryName: string): void {
        if (this.processedLibraries.contains(libraryName)) {
            Log.v(ProjectBuilder.TAG, "Didn't add built-in library \"" + libraryName + "\" to project's dependencies again");
            return;
        }
        this.processedLibraries.add(libraryName);

        let library = BuiltInLibraries.BuiltInLibrary.ofName(libraryName);
        //noinspection SimplifyOptionalCallChains because #isEmpty() isn't available on Android.
        if (!library.isPresent() || !this.excludedLibraries.contains(library.get())) {
            Log.d(ProjectBuilder.TAG, "Added built-in library \"" + libraryName + "\" to project's dependencies");
            this.libraries.add(new Jp(libraryName));
        } else {
            Log.v(ProjectBuilder.TAG, "Didn't add built-in library \"" + libraryName + "\" to project's dependencies as it's excluded");
            Log.v(ProjectBuilder.TAG, "Adding its dependencies though");
        }
        this.addDependencies(libraryName);
    }
  addDependencies(libraryName: string): void {
        for (const libraryDependency of jiter(BuiltInLibraryUtils.getKnownDependencies(libraryName))) {
            this.addLibrary(libraryDependency);
        }
    }
  containsLibrary(libraryName: string): boolean {
        let library = BuiltInLibraries.BuiltInLibrary.ofName(libraryName);
        //noinspection SimplifyOptionalCallChains because #isEmpty() isn't available on Android.
        if (!library.isPresent()) {
            return false;
        }
        return this.libraries.contains(new Jp(library.get().getName()));
    }
  getLibraries(): any {
        return this.libraries;
    }
}