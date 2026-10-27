// Auto-ported from DefaultExtraMenuBean.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.net.Uri, android.util.Pair, com.besome.sketch.beans.ComponentBean, com.besome.sketch.editor.LogicEditorActivity, java.util.ArrayList, java.util.Arrays, java.util.regex.Matcher, java.util.regex.Pattern, a.a.a.Ss, a.a.a.eC, a.a.a.jC, a.a.a.uq, a.a.a.wq, mod.agus.jcoderz.editor.manage.block.makeblock.BlockMenu, mod.hey.studios.util.Helper, pro.sketchware.utility.CustomVariableUtil, pro.sketchware.utility.FileUtil
// <imports>
import { jC } from './platform';
// </imports>
export class DefaultExtraMenuBean {
  logicEditor: any;
  projectDataManager: any;
  sc_id: string;
  constructor(logicEditor: any) {
        this.logicEditor = logicEditor;
        this.sc_id = logicEditor.scId;
        this.projectDataManager = jC.a(this.sc_id);
    }
  static getName(menuName: string): string {
        return (() => { switch (menuName) {
            case "image": return "Custom Image";
            case "til_box_mode": return "Box Mode";
            case "fabsize": return "Fab Size";
            case "fabvisible": return "Fab Visible";
            case "menuaction": return "Menu Action";
            case "porterduff": return "Porterduff Mode";
            case "transcriptmode": return "Transcript Mode";
            case "listscrollparam": case "recyclerscrollparam": case "pagerscrollparam": return "Scroll Param";
            case "gridstretchmode": return "Stretch Mode";
            case "gravity_v": return "Gravity Vertical";
            case "gravity_h": return "Gravity Horizontal";
            case "gravity_t": return "Gravity Toast";
            case "patternviewmode": return "Pattern Mode";
            case "styleprogress": return "Progress Style";
            case "cv_theme": return "Theme";
            case "cv_language": return "Language";
            case "import": return "Import";
            case "permissions": return "Permissions";
            default: return menuName;
        } })();
    }
}