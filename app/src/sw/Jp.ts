// Auto-ported from Jp.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: java.util.Objects, mod.jbk.build.BuiltInLibraries, pro.sketchware.util.library.BuiltInLibraryUtils
// <imports>
import { BuiltInLibraries } from './BuiltInLibraries';
import { BuiltInLibraryUtils } from './BuiltInLibraryUtils';
import { Objects } from './env';
// </imports>
export class Jp {
  name: string;
  packageName: string;
  hasResources$: boolean;
  hasAssets$: boolean;
  constructor(libraryName: string) {
        this.name = libraryName;
        this.hasResources$ = BuiltInLibraryUtils.hasResources(libraryName);
        this.hasAssets$ = libraryName.equals(BuiltInLibraries.CODEVIEW);
        if (this.hasResources$ || this.hasAssets$) {
            this.packageName = BuiltInLibraryUtils.getPackageName(libraryName);
        } else {
            this.packageName = "";
        }
    }
  equals(o: any): boolean {
        if (this == o) return true;
        if (o == null || this.constructor != o.constructor) return false;
        let jp = o;
        return this.name.equals(jp.name);
    }
  hashCode(): number {
        return Objects.hash(this.name);
    }
  getName(): string {
        return this.name;
    }
  getPackageName(): string {
        return this.packageName;
    }
  hasResources(): boolean {
        return this.hasResources$;
    }
  hasAssets(): boolean {
        return this.hasAssets$;
    }
}