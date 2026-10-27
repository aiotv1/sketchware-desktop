// Auto-ported from Material3LibraryManager.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: pro.sketchware.SketchApplication.getContext, android.content.Context, androidx.annotation.StyleRes, com.besome.sketch.beans.ProjectLibraryBean, a.a.a.jC, pro.sketchware.R, pro.sketchware.utility.ThemeUtils
// <imports>
import { getContext } from './env';
import { jC } from './platform';
// </imports>
export class Material3LibraryManager {
  isEditingState: boolean;
  isAppCompatEnabled$: boolean;
  appCombatLibraryBean: any;
  context: any;
  init_String(sc_id: string) {
        this.isEditingState = false;
        this.appCombatLibraryBean = jC.c(sc_id).c();
        this.isAppCompatEnabled$ = this.appCombatLibraryBean.isEnabled();
        this.context = getContext();
    }
  init_Context_String(context: any, sc_id: string) {
        this.context = context;
        this.isEditingState = false;
        this.appCombatLibraryBean = jC.c(sc_id).c();
        this.isAppCompatEnabled$ = this.appCombatLibraryBean.isEnabled();
    }
  init_ProjectLibraryBean(projectLibraryBean: any) {
        this.context = getContext();
        this.isEditingState = true;
        this.appCombatLibraryBean = projectLibraryBean;
        this.isAppCompatEnabled$ = projectLibraryBean.isEnabled();
    }
  isAppCompatEnabled(): boolean {
        return this.isAppCompatEnabled$;
    }
  isMaterial3Enabled(): boolean {
        return this.isAppCompatEnabled$ && this.safeGetBoolean("material3");
    }
  isDynamicColorsEnabled(): boolean {
        return (this.isMaterial3Enabled() || this.isEditingState) && this.safeGetBoolean("dynamic_colors");
    }
  getTheme(): string {
        return this.isMaterial3Enabled() || this.isEditingState ? this.safeGetString("theme") : "DayNight";
    }
  safeGetString(key: string): string {
        if (this.appCombatLibraryBean.configurations != null &&
                this.appCombatLibraryBean.configurations.containsKey(key) &&
                typeof this.appCombatLibraryBean.configurations.get(key) === 'string') {
            return this.appCombatLibraryBean.configurations.get(key);
        }
        return "";
    }
  safeGetBoolean(key: string): boolean {
        if (this.appCombatLibraryBean.configurations != null &&
                this.appCombatLibraryBean.configurations.containsKey(key) &&
                typeof this.appCombatLibraryBean.configurations.get(key) === 'boolean') {
            return this.appCombatLibraryBean.configurations.get(key);
        }
        return false;
    }
  getAppCombatLibraryBean(): any {
        return this.appCombatLibraryBean;
    }
  constructor(...args: any[]) { this.__ctor(...args); }
  __ctor(...args: any[]) {
    if (args.length === 2 && (args[1] == null || typeof args[1] === 'string')) { this.init_Context_String.apply(this, args as any); return; }
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) { this.init_String.apply(this, args as any); return; }
    if (args.length === 1) { this.init_ProjectLibraryBean.apply(this, args as any); return; }
    
  }
}