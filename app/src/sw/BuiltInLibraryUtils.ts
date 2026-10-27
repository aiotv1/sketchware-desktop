// Auto-ported from BuiltInLibraryUtils.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: mod.jbk.build.BuiltInLibraries, mod.jbk.build.BuiltInLibraries.BuiltInLibrary
// <imports>
import { jnewArray, jiter } from '../codegen/jshim';
import { BuiltInLibraries } from './BuiltInLibraries';
import { IllegalArgumentException, IllegalStateException } from './env';
// </imports>
export class BuiltInLibraryUtils {
  static getKnownDependencies(libraryName: string): string[] {
        for (const library of jiter(BuiltInLibraries.KNOWN_BUILT_IN_LIBRARIES)) {
            if (library.getName().equals(libraryName)) {
                return library.getDependencyNames().toArray(jnewArray(0, null));
            }
        }

        throw new IllegalArgumentException("Unknown built-in library '" + libraryName + "'!");
    }
  static getPackageName(libraryName: string): string {
        for (const library of jiter(BuiltInLibraries.KNOWN_BUILT_IN_LIBRARIES)) {
            if (library.getName().equals(libraryName)) {
                return library.getPackageName().orElseThrow(((...a) => new IllegalStateException(...a)));
            }
        }

        throw new IllegalArgumentException("Unknown built-in library '" + libraryName + "'!");
    }
  static hasResources(libraryName: string): boolean {
        for (const library of jiter(BuiltInLibraries.KNOWN_BUILT_IN_LIBRARIES)) {
            if (library.getName().equals(libraryName)) {
                return library.hasResources();
            }
        }

        throw new IllegalArgumentException("Unknown built-in library '" + libraryName + "'!");
    }
}