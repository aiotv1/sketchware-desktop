// Auto-ported from sq.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.graphics.Color, android.util.Pair, android.view.Gravity, com.besome.sketch.beans.ColorBean, com.besome.sketch.beans.ImageBean, com.besome.sketch.beans.LayoutBean, com.besome.sketch.beans.TextBean, com.besome.sketch.beans.ViewBean, pro.sketchware.R
// <imports>
import { jnewArray, jiter, Pair } from '../codegen/jshim';
import { ColorBean, ViewBean, LayoutBean, TextBean, ImageBean } from '../core/beans';
import { Color, Gravity, R } from './env';
// </imports>
export class sq {
  static A: any[];
  static B: any[];
  static C: any[];
  static D: any[];
  static E: any[];
  static F: any[];
  static G: any[];
  static H: any[];
  static I: any[];
  static J: any[];
  static K: any[];
  static L: any[];
  static M: number[];
  static a$: any[];
  static b$: any[];
  static c: any[];
  static d: any[];
  static e: any[];
  static f: any[];
  static g: any[];
  static h: any[];
  static i: any[];
  static j: string[];
  static k: string[];
  static l: string[];
  static m: any[];
  static n: any[];
  static o: any[];
  static p: any[];
  static q: any[];
  static r: any[];
  static s: any[];
  static t: any[];
  static u: any[];
  static v: any[];
  static w: any[];
  static x: any[];
  static y: any[];
  static z: any[];
  static {
        sq.a$ = [new Pair(LayoutBean.LAYOUT_MATCH_PARENT, "match_parent"), new Pair(LayoutBean.LAYOUT_WRAP_CONTENT, "wrap_content")];
        sq.b$ = [new Pair(LayoutBean.ORIENTATION_NONE, "none"), new Pair(LayoutBean.ORIENTATION_HORIZONTAL, "horizontal"), new Pair(LayoutBean.ORIENTATION_VERTICAL, "vertical")];
        sq.c = [new Pair(LayoutBean.GRAVITY_TOP, "top"), new Pair(LayoutBean.GRAVITY_BOTTOM, "bottom"), new Pair(LayoutBean.GRAVITY_CENTER_VERTICAL, "center_vertical"), new Pair(LayoutBean.GRAVITY_LEFT, "left"), new Pair(LayoutBean.GRAVITY_RIGHT, "right"), new Pair(LayoutBean.GRAVITY_CENTER_HORIZONTAL, "center_horizontal")];
        sq.d = [new Pair(TextBean.TEXT_TYPE_NORMAL, "normal"), new Pair(TextBean.TEXT_TYPE_BOLD, "bold"), new Pair(TextBean.TEXT_TYPE_ITALIC, "italic"), new Pair(TextBean.TEXT_TYPE_BOLDITALIC, "bold|italic")];
        sq.e = [new Pair(TextBean.IME_OPTION_NORMAL, "normal"), new Pair(TextBean.IME_OPTION_NONE, "none"), new Pair(TextBean.IME_OPTION_GO, "go"), new Pair(TextBean.IME_OPTION_SEARCH, "search"), new Pair(TextBean.IME_OPTION_SEND, "send"), new Pair(TextBean.IME_OPTION_NEXT, "next"), new Pair(TextBean.IME_OPTION_DONE, "done")];
        sq.f = [new Pair(ViewBean.SPINNER_MODE_DIALOG, "dialog"), new Pair(ViewBean.SPINNER_MODE_DROPDOWN, "dropdown")];
        sq.g = [new Pair(ViewBean.CHOICE_MODE_NONE, "none"), new Pair(ViewBean.CHOICE_MODE_SINGLE, "single"), new Pair(ViewBean.CHOICE_MODE_MULTI, "multi")];
        sq.h = [new Pair(1, "Sunday"), new Pair(2, "Monday"), new Pair(3, "Tuesday"), new Pair(4, "Wednesday"), new Pair(5, "Thursday"), new Pair(6, "Friday"), new Pair(7, "Saturday")];
        sq.i = [new Pair(TextBean.INPUT_TYPE_TEXT, "text"), new Pair(TextBean.INPUT_TYPE_NUMBER_SIGNED, "numberSigned"), new Pair(TextBean.INPUT_TYPE_NUMBER_DECIMAL, "numberDecimal"), new Pair(TextBean.INPUT_TYPE_NUMBER_SIGNED_DECIMAL, "numberSigned|numberDecimal"), new Pair(TextBean.INPUT_TYPE_PHONE, "phone"), new Pair(TextBean.INPUT_TYPE_PASSWORD, "textPassword")];
        sq.j = [ImageBean.SCALE_TYPE_FIT_XY, ImageBean.SCALE_TYPE_FIT_START, ImageBean.SCALE_TYPE_FIT_CENTER, ImageBean.SCALE_TYPE_FIT_END, ImageBean.SCALE_TYPE_CENTER, ImageBean.SCALE_TYPE_CENTER_CROP, ImageBean.SCALE_TYPE_CENTER_INSIDE];
        sq.k = ["BANNER", "MEDIUM_RECTANGLE", "LARGE_BANNER", "SMART_BANNER"];
        sq.l = ["true", "false"];
        sq.m = [new Pair(ViewBean.PROGRESSBAR_STYLE_CIRCLE, "Circle"), new Pair(ViewBean.PROGRESSBAR_STYLE_HORIZONTAL, "Horizontal")];
        sq.n = [new Pair(10, "10sp"), new Pair(11, "11sp"), new Pair(12, "12sp"), new Pair(13, "13sp"), new Pair(14, "14sp"), new Pair(15, "15sp"), new Pair(16, "16sp"), new Pair(17, "17sp"), new Pair(18, "18sp")];
        sq.o = [new Pair(10, "10sp"), new Pair(11, "11sp"), new Pair(12, "12sp"), new Pair(14, "14sp"), new Pair(16, "16sp"), new Pair(18, "18sp"), new Pair(20, "20sp"), new Pair(25, "25sp"), new Pair(30, "30sp"), new Pair(40, "40sp"), new Pair(50, "50sp"), new Pair(60, "60sp"), new Pair(70, "70sp"), new Pair(80, "80sp"), new Pair(90, "90sp"), new Pair(100, "100sp")];
        sq.p = [new ColorBean("#F44336", "RED", "#ffffff", R.drawable.checked_white_32), new ColorBean("#FFEBEE", "RED", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFCDD2", "RED", "#212121", R.drawable.checked_grey_32), new ColorBean("#EF9A9A", "RED", "#212121", R.drawable.checked_grey_32), new ColorBean("#E57373", "RED", "#ffffff", R.drawable.checked_white_32), new ColorBean("#EF5350", "RED", "#ffffff", R.drawable.checked_white_32), new ColorBean("#F44336", "RED", "#ffffff", R.drawable.checked_white_32), new ColorBean("#E53935", "RED", "#ffffff", R.drawable.checked_white_32), new ColorBean("#D32F2F", "RED", "#ffffff", R.drawable.checked_white_32), new ColorBean("#C62828", "RED", "#ffffff", R.drawable.checked_white_32), new ColorBean("#B71C1C", "RED", "#ffffff", R.drawable.checked_white_32), new ColorBean("#FF8A80", "RED", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF5252", "RED", "#ffffff", R.drawable.checked_white_32), new ColorBean("#FF1744", "RED", "#ffffff", R.drawable.checked_white_32), new ColorBean("#D50000", "RED", "#ffffff", R.drawable.checked_white_32)];
        sq.q = [new ColorBean("#E91E63", "PINK", "#ffffff", R.drawable.checked_white_32), new ColorBean("#FCE4EC", "PINK", "#212121", R.drawable.checked_grey_32), new ColorBean("#F8BBD0", "PINK", "#212121", R.drawable.checked_grey_32), new ColorBean("#F48FB1", "PINK", "#212121", R.drawable.checked_grey_32), new ColorBean("#F06292", "PINK", "#ffffff", R.drawable.checked_white_32), new ColorBean("#EC407A", "PINK", "#ffffff", R.drawable.checked_white_32), new ColorBean("#E91E63", "PINK", "#ffffff", R.drawable.checked_white_32), new ColorBean("#D81B60", "PINK", "#ffffff", R.drawable.checked_white_32), new ColorBean("#C2185B", "PINK", "#ffffff", R.drawable.checked_white_32), new ColorBean("#AD1457", "PINK", "#ffffff", R.drawable.checked_white_32), new ColorBean("#880E4F", "PINK", "#ffffff", R.drawable.checked_white_32), new ColorBean("#FF80AB", "PINK", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF4081", "PINK", "#ffffff", R.drawable.checked_white_32), new ColorBean("#F50057", "PINK", "#ffffff", R.drawable.checked_white_32), new ColorBean("#C51162", "PINK", "#ffffff", R.drawable.checked_white_32)];
        sq.r = [new ColorBean("#9C27B0", "PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#F3E5F5", "PURPLE", "#212121", R.drawable.checked_grey_32), new ColorBean("#E1BEE7", "PURPLE", "#212121", R.drawable.checked_grey_32), new ColorBean("#CE93D8", "PURPLE", "#212121", R.drawable.checked_grey_32), new ColorBean("#BA68C8", "PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#AB47BC", "PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#9C27B0", "PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#8E24AA", "PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#7B1FA2", "PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#6A1B9A", "PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#4A148C", "PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#EA80FC", "PURPLE", "#212121", R.drawable.checked_grey_32), new ColorBean("#E040FB", "PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#D500F9", "PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#AA00FF", "PURPLE", "#ffffff", R.drawable.checked_white_32)];
        sq.s = [new ColorBean("#673AB7", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#EDE7F6", "DEEP PURPLE", "#212121", R.drawable.checked_grey_32), new ColorBean("#D1C4E9", "DEEP PURPLE", "#212121", R.drawable.checked_grey_32), new ColorBean("#B39DDB", "DEEP PURPLE", "#212121", R.drawable.checked_grey_32), new ColorBean("#9575CD", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#7E57C2", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#673AB7", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#5E35B1", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#512DA8", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#4527A0", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#311B92", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#B388FF", "DEEP PURPLE", "#212121", R.drawable.checked_grey_32), new ColorBean("#7C4DFF", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#651FFF", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#6200EA", "DEEP PURPLE", "#ffffff", R.drawable.checked_white_32)];
        sq.t = [new ColorBean("#3F51B5", "INDIGO", "#ffffff", R.drawable.checked_white_32), new ColorBean("#E8EAF6", "INDIGO", "#212121", R.drawable.checked_grey_32), new ColorBean("#C5CAE9", "INDIGO", "#212121", R.drawable.checked_grey_32), new ColorBean("#9FA8DA", "INDIGO", "#212121", R.drawable.checked_grey_32), new ColorBean("#7986CB", "INDIGO", "#ffffff", R.drawable.checked_white_32), new ColorBean("#5C6BC0", "INDIGO", "#ffffff", R.drawable.checked_white_32), new ColorBean("#3F51B5", "INDIGO", "#ffffff", R.drawable.checked_white_32), new ColorBean("#3949AB", "INDIGO", "#ffffff", R.drawable.checked_white_32), new ColorBean("#303F9F", "INDIGO", "#ffffff", R.drawable.checked_white_32), new ColorBean("#283593", "INDIGO", "#ffffff", R.drawable.checked_white_32), new ColorBean("#1A237E", "INDIGO", "#ffffff", R.drawable.checked_white_32), new ColorBean("#8C9EFF", "INDIGO", "#212121", R.drawable.checked_grey_32), new ColorBean("#536DFE", "INDIGO", "#ffffff", R.drawable.checked_white_32), new ColorBean("#3D5AFE", "INDIGO", "#ffffff", R.drawable.checked_white_32), new ColorBean("#304FFE", "INDIGO", "#ffffff", R.drawable.checked_white_32)];
        sq.u = [new ColorBean("#2196F3", "BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#E3F2FD", "BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#BBDEFB", "BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#90CAF9", "BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#64B5F6", "BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#42A5F5", "BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#2196F3", "BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#1E88E5", "BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#1976D2", "BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#1565C0", "BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#0D47A1", "BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#82B1FF", "BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#448AFF", "BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#2979FF", "BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#2962FF", "BLUE", "#ffffff", R.drawable.checked_white_32)];
        sq.v = [new ColorBean("#03A9F4", "LIGHT BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#E1F5FE", "LIGHT BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#B3E5FC", "LIGHT BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#81D4FA", "LIGHT BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#4FC3F7", "LIGHT BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#29B6F6", "LIGHT BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#03A9F4", "LIGHT BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#039BE5", "LIGHT BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#0288D1", "LIGHT BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#0277BD", "LIGHT BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#01579B", "LIGHT BLUE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#80D8FF", "LIGHT BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#40C4FF", "LIGHT BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#00B0FF", "LIGHT BLUE", "#212121", R.drawable.checked_grey_32), new ColorBean("#0091EA", "LIGHT BLUE", "#ffffff", R.drawable.checked_white_32)];
        sq.w = [new ColorBean("#00BCD4", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#E0F7FA", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#B2EBF2", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#80DEEA", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#4DD0E1", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#26C6DA", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#00BCD4", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#00ACC1", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#0097A7", "CYAN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#00838F", "CYAN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#006064", "CYAN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#84FFFF", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#18FFFF", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#00E5FF", "CYAN", "#212121", R.drawable.checked_grey_32), new ColorBean("#00B8D4", "CYAN", "#212121", R.drawable.checked_grey_32)];
        sq.x = [new ColorBean("#009688", "TEAL", "#ffffff", R.drawable.checked_white_32), new ColorBean("#E0F2F1", "TEAL", "#212121", R.drawable.checked_grey_32), new ColorBean("#B2DFDB", "TEAL", "#212121", R.drawable.checked_grey_32), new ColorBean("#80CBC4", "TEAL", "#212121", R.drawable.checked_grey_32), new ColorBean("#4DB6AC", "TEAL", "#212121", R.drawable.checked_grey_32), new ColorBean("#26A69A", "TEAL", "#212121", R.drawable.checked_grey_32), new ColorBean("#009688", "TEAL", "#ffffff", R.drawable.checked_white_32), new ColorBean("#00897B", "TEAL", "#ffffff", R.drawable.checked_white_32), new ColorBean("#00796B", "TEAL", "#ffffff", R.drawable.checked_white_32), new ColorBean("#00695C", "TEAL", "#ffffff", R.drawable.checked_white_32), new ColorBean("#004D40", "TEAL", "#ffffff", R.drawable.checked_white_32), new ColorBean("#A7FFEB", "TEAL", "#212121", R.drawable.checked_grey_32), new ColorBean("#64FFDA", "TEAL", "#212121", R.drawable.checked_grey_32), new ColorBean("#1DE9B6", "TEAL", "#212121", R.drawable.checked_grey_32), new ColorBean("#00BFA5", "TEAL", "#212121", R.drawable.checked_grey_32)];
        sq.y = [new ColorBean("#4CAF50", "GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#E8F5E9", "GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#C8E6C9", "GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#A5D6A7", "GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#81C784", "GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#66BB6A", "GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#4CAF50", "GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#43A047", "GREEN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#388E3C", "GREEN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#2E7D32", "GREEN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#1B5E20", "GREEN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#B9F6CA", "GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#69F0AE", "GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#00E676", "GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#00C853", "GREEN", "#212121", R.drawable.checked_grey_32)];
        sq.z = [new ColorBean("#8BC34A", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#F1F8E9", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#DCEDC8", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#C5E1A5", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#AED581", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#9CCC65", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#8BC34A", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#7CB342", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#689F38", "LIGHT GREEN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#558B2F", "LIGHT GREEN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#33691E", "LIGHT GREEN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#CCFF90", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#B2FF59", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#76FF03", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32), new ColorBean("#64DD17", "LIGHT GREEN", "#212121", R.drawable.checked_grey_32)];
        sq.A = [new ColorBean("#CDDC39", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#F9FBE7", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#F0F4C3", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#E6EE9C", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#DCE775", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#D4E157", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#CDDC39", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#C0CA33", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#AFB42B", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#9E9D24", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#827717", "LIME", "#ffffff", R.drawable.checked_white_32), new ColorBean("#F4FF81", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#EEFF41", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#C6FF00", "LIME", "#212121", R.drawable.checked_grey_32), new ColorBean("#AEEA00", "LIME", "#212121", R.drawable.checked_grey_32)];
        sq.B = [new ColorBean("#FFEB3B", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFFDE7", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFF9C4", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFF59D", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFF176", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFEE58", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFEB3B", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FDD835", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FBC02D", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#F9A825", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#F57F17", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFFF8D", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFFF00", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFEA00", "YELLOW", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFD600", "YELLOW", "#212121", R.drawable.checked_grey_32)];
        sq.C = [new ColorBean("#FFC107", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFF8E1", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFECB3", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFE082", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFD54F", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFCA28", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFC107", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFB300", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFA000", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF8F00", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF6F00", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFE57F", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFD740", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFC400", "AMBER", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFAB00", "AMBER", "#212121", R.drawable.checked_grey_32)];
        sq.D = [new ColorBean("#FF9800", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFF3E0", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFE0B2", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFCC80", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFB74D", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFA726", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF9800", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FB8C00", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#F57C00", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#EF6C00", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#E65100", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFD180", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFAB40", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF9100", "ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF6D00", "ORANGE", "#212121", R.drawable.checked_grey_32)];
        sq.E = [new ColorBean("#FF5722", "DEEP ORANGE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#FBE9E7", "DEEP ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFCCBC", "DEEP ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FFAB91", "DEEP ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF8A65", "DEEP ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF7043", "DEEP ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF5722", "DEEP ORANGE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#F4511E", "DEEP ORANGE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#E64A19", "DEEP ORANGE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#D84315", "DEEP ORANGE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#BF360C", "DEEP ORANGE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#FF9E80", "DEEP ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF6E40", "DEEP ORANGE", "#212121", R.drawable.checked_grey_32), new ColorBean("#FF3D00", "DEEP ORANGE", "#ffffff", R.drawable.checked_white_32), new ColorBean("#DD2C00", "DEEP ORANGE", "#ffffff", R.drawable.checked_white_32)];
        sq.F = [new ColorBean("#795548", "BROWN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#EFEBE9", "BROWN", "#212121", R.drawable.checked_grey_32), new ColorBean("#D7CCC8", "BROWN", "#212121", R.drawable.checked_grey_32), new ColorBean("#BCAAA4", "BROWN", "#212121", R.drawable.checked_grey_32), new ColorBean("#A1887F", "BROWN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#8D6E63", "BROWN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#795548", "BROWN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#6D4C41", "BROWN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#5D4037", "BROWN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#4E342E", "BROWN", "#ffffff", R.drawable.checked_white_32), new ColorBean("#3E2723", "BROWN", "#ffffff", R.drawable.checked_white_32)];
        sq.G = [new ColorBean("#9E9E9E", "GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#FAFAFA", "GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#F5F5F5", "GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#EEEEEE", "GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#E0E0E0", "GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#BDBDBD", "GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#9E9E9E", "GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#757575", "GREY", "#ffffff", R.drawable.checked_white_32), new ColorBean("#616161", "GREY", "#ffffff", R.drawable.checked_white_32), new ColorBean("#424242", "GREY", "#ffffff", R.drawable.checked_white_32), new ColorBean("#212121", "GREY", "#ffffff", R.drawable.checked_white_32)];
        sq.H = [new ColorBean("#607D8B", "BLUE GREY", "#ffffff", R.drawable.checked_white_32), new ColorBean("#ECEFF1", "BLUE GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#CFD8DC", "BLUE GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#B0BEC5", "BLUE GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#90A4AE", "BLUE GREY", "#212121", R.drawable.checked_grey_32), new ColorBean("#78909C", "BLUE GREY", "#ffffff", R.drawable.checked_white_32), new ColorBean("#607D8B", "BLUE GREY", "#ffffff", R.drawable.checked_white_32), new ColorBean("#546E7A", "BLUE GREY", "#ffffff", R.drawable.checked_white_32), new ColorBean("#455A64", "BLUE GREY", "#ffffff", R.drawable.checked_white_32), new ColorBean("#37474F", "BLUE GREY", "#ffffff", R.drawable.checked_white_32), new ColorBean("#263238", "BLUE GREY", "#ffffff", R.drawable.checked_white_32)];
        sq.I = [new ColorBean("#000000", "BLACK", "#ffffff", R.drawable.checked_white_32)];
        sq.J = [new ColorBean("#ffffff", "WHITE", "#212121", R.drawable.checked_grey_32)];
        sq.K = [new ColorBean(Color.TRANSPARENT, "TRANSPARENT", Color.parseColor("#9E9E9E"), R.drawable.checked_grey_32)];
        sq.L = [new ColorBean(0xffffff, "NONE", Color.parseColor("#9E9E9E"), R.drawable.checked_grey_32)];
        sq.M = [R.color.scolor_blue_01, R.color.scolor_red_02, R.color.scolor_green_02, R.color.scolor_dark_yellow_01];
    }
  static a_int(gravity: number): string {
        let verticalGravity = gravity & Gravity.FILL_VERTICAL;
        let horizontalGravity = gravity & Gravity.FILL_HORIZONTAL;
        let gravityValue = "";
        if (horizontalGravity == Gravity.CENTER_HORIZONTAL) {
            gravityValue = "center_horizontal";
        } else {
            if ((horizontalGravity & Gravity.LEFT) == Gravity.LEFT) {
                gravityValue = "left";
            }

            if ((horizontalGravity & Gravity.RIGHT) == Gravity.RIGHT) {
                if (!gravityValue.isEmpty()) gravityValue += ", ";
                gravityValue += "right";
            }
        }

        if (verticalGravity == Gravity.CENTER_VERTICAL) {
            if (!gravityValue.isEmpty()) gravityValue += ", ";
            gravityValue += "center_vertical";
        } else {
            if ((verticalGravity & Gravity.TOP) == Gravity.TOP) {
                if (!gravityValue.isEmpty()) gravityValue += ", ";
                gravityValue += "top";
            }

            if ((verticalGravity & Gravity.BOTTOM) == Gravity.BOTTOM) {
                if (!gravityValue.isEmpty()) gravityValue += ", ";
                gravityValue += "bottom";
            }
        }

        if (gravityValue.length <= 0) {
            gravityValue = "none";
        }

        return gravityValue;
    }
  static a_String_int(property: string, value: number): string {
        let pairs = sq.a(property);

        for (const integerStringPair of jiter(pairs)) {
            if (integerStringPair.first == value) {
                return integerStringPair.second;
            }
        }

        if (!property.equals("property_layout_width") && !property.equals("property_layout_height")) {
            return "";
        } else {
            return value + "dp";
        }
    }
  static a_String(property: string): any[] {
        return (() => { switch (property) {
            case "property_layout_width": case "property_layout_height": return sq.a$;
            case "property_orientation": return sq.b$;
            case "property_text_size": return sq.o;
            case "property_text_style": return sq.d;
            case "property_input_type": return sq.i;
            case "property_ime_option": return sq.e;
            case "property_spinner_mode": return sq.f;
            case "property_choice_mode": return sq.g;
            case "property_first_day_of_week": return sq.h;
            default: return jnewArray(0, null);
        } })();
    }
  static b(property: string): any[] {
        if (property.equals("property_progressbar_style")) {
            return sq.m;
        } else {
            return jnewArray(0, null);
        }
    }
  static a(...args: any[]): any {
    if (args.length === 2 && (args[0] == null || typeof args[0] === 'string') && typeof args[1] === 'number') return sq.a_String_int.apply(sq, args as any);
    if (args.length === 1 && typeof args[0] === 'number') return sq.a_int.apply(sq, args as any);
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) return sq.a_String.apply(sq, args as any);
    throw new Error('no overload of a for ' + args.length);
  }
}