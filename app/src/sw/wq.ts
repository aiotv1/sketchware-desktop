// Auto-ported from wq.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.content.Context, android.os.Environment, java.io.File, pro.sketchware.SketchApplication
// <imports>
import { Environment, File, JFile, SketchApplication, getContext } from './env';
import { DB } from './platform';
// </imports>
export class wq {
  static A: string = "sketchware" + File.separator + "localization" + File.separator + "strings_provided.xml";
  static B: string = "sketchware" + File.separator + "signed_apk";
  static C: string = "sketchware" + File.separator + "keystore";
  static D: string = "sketchware" + File.separator + "keystore" + File.separator + "release_key.jks";
  static a$: string = ".sketchware" + File.separator + "libs";
  static b$: string = ".sketchware" + File.separator + "mysc";
  static c$: string = ".sketchware" + File.separator + "mysc" + File.separator + "list";
  static d$: string = ".sketchware" + File.separator + "data";
  static e$: string = ".sketchware" + File.separator + "bak";
  static f: string = ".sketchware" + File.separator + "temp" + File.separator + "images";
  static g$: string = ".sketchware" + File.separator + "temp" + File.separator + "sounds";
  static h: string = ".sketchware" + File.separator + "temp" + File.separator + "fonts";
  static i$: string = ".sketchware" + File.separator + "temp" + File.separator + "proj";
  static j$: string = ".sketchware" + File.separator + "temp" + File.separator + "data";
  static l$: string = ".sketchware" + File.separator + "resources";
  static m$: string = ".sketchware" + File.separator + "resources" + File.separator + "icons";
  static n$: string = ".sketchware" + File.separator + "resources" + File.separator + "images";
  static o$: string = ".sketchware" + File.separator + "resources" + File.separator + "sounds";
  static p: string = ".sketchware" + File.separator + "resources" + File.separator + "fonts";
  static x: string = ".sketchware" + File.separator + "collection";
  static y: string = "sketchware" + File.separator + "localization";
  static z: string = "sketchware" + File.separator + "localization" + File.separator + "strings.xml";
  static EXTRA_SYSTEM_DATA: string = ".sketchware" + File.separator + "data" + File.separator + "system";
  static CUSTOM_COMPONENT_FILE: string = wq.EXTRA_SYSTEM_DATA + File.separator + "component.json";
  static EXTRA_DATA_EXPORT: string = wq.EXTRA_SYSTEM_DATA + File.separator + "export";
  static getAbsolutePathOf(path: string): string {
        return new JFile(Environment.getExternalStorageDirectory(), path).getAbsolutePath();
    }
  static a_0(): string {
        return wq.getAbsolutePathOf(wq.x);
    }
  static a_String(sc_id: string): string {
        return wq.getAbsolutePathOf(wq.e$ + File.separator + sc_id);
    }
  static a_Context_String(context: any, preferenceName: string): void {
        let dataP17 = new DB(context, "P17_" + preferenceName);
        let dataP18 = new DB(context, "P18_" + preferenceName);
        let dataP13 = new DB(context, "P13_" + preferenceName);
        let dataP14 = new DB(context, "P14_" + preferenceName);
        dataP17.a();
        dataP18.a();
        dataP13.a();
        dataP14.a();
        let dataD03 = new DB(context, "D03_" + preferenceName);
        let dataD04 = new DB(context, "D04_" + preferenceName);
        let dataD01 = new DB(context, "D01_" + preferenceName);
        let dataD02 = new DB(context, "D02_" + preferenceName);
        dataD03.a();
        dataD04.a();
        dataD01.a();
        dataD02.a();
    }
  static b_int(type: number): string {
        return (() => { switch (type) {
            case 0: return "linear";
            case 1: return "relativelayout";
            case 2: return "hscroll";
            case 3: return "button";
            case 4: return "textview";
            case 5: return "edittext";
            case 6: return "imageview";
            case 7: return "webview";
            case 8: return "progressbar";
            case 9: return "listview";
            case 10: return "spinner";
            case 11: return "checkbox";
            case 12: return "vscroll";
            case 13: return "switch";
            case 14: return "seekbar";
            case 15: return "calendarview";
            case 16: return "fab";
            case 17: return "adview";
            case 18: return "mapview";
            case 19: return "radiobutton";
            case 20: return "ratingbar";
            case 21: return "videoview";
            case 22: return "searchview";
            case 23: return "autocomplete";
            case 24: return "multiautocomplete";
            case 25: return "gridview";
            case 26: return "analogclock";
            case 27: return "datepicker";
            case 28: return "timepicker";
            case 29: return "digitalclock";
            case 30: return "tablayout";
            case 31: return "viewpager";
            case 32: return "bottomnavigation";
            case 33: return "badgeview";
            case 34: return "patternlockview";
            case 35: return "wavesidebar";
            case 36: return "cardview";
            case 37: return "collapsingtoolbar";
            case 38: return "textinputlayout";
            case 39: return "swiperefreshlayout";
            case 40: return "radiogroup";
            case 41: return "materialbutton";
            case 42: return "signinbutton";
            case 43: return "circleimageview";
            case 44: return "lottie";
            case 45: return "youtube";
            case 46: return "otpview";
            case 47: return "codeview";
            case 48: return "recyclerview";
            default: return "widget";
        } })();
    }
  static b_String(sc_id: string): string {
        return wq.getAbsolutePathOf(wq.d$ + File.separator + sc_id);
    }
  static c_0(): string {
        return wq.getAbsolutePathOf(".sketchware" + File.separator + "download");
    }
  static c_String(sc_id: string): string {
        return wq.getAbsolutePathOf(wq.c$ + File.separator + sc_id);
    }
  static d_0(): string {
        return wq.getAbsolutePathOf(wq.p);
    }
  static d_String(sc_id: string): string {
        return wq.getAbsolutePathOf(wq.b$ + File.separator + sc_id);
    }
  static e_0(): string {
        return wq.getAbsolutePathOf(wq.m$);
    }
  static e_String(sc_id: string): string {
        return "resource" + File.separator + sc_id + File.separator + "res.zip";
    }
  static getExtractedIconPackStoreLocation(): string {
        return new JFile(SketchApplication.getContext().getFilesDir(), "iconpack").getAbsolutePath();
    }
  static g(): string {
        return wq.getAbsolutePathOf(wq.n$);
    }
  static i(): string {
        return wq.getAbsolutePathOf(wq.C);
    }
  static j(): string {
        return wq.getAbsolutePathOf(wq.D);
    }
  static k(): string {
        return wq.getAbsolutePathOf(wq.y);
    }
  static l(): string {
        return wq.getAbsolutePathOf(wq.z);
    }
  static m(): string {
        return wq.getAbsolutePathOf(wq.A);
    }
  static n(): string {
        return wq.getAbsolutePathOf(wq.c$);
    }
  static o(): string {
        return wq.getAbsolutePathOf(wq.B);
    }
  static q(): string {
        return wq.getAbsolutePathOf(".sketchware" + File.separator);
    }
  static r(): string {
        return wq.getAbsolutePathOf(wq.a$);
    }
  static s(): string {
        return wq.getAbsolutePathOf("sketchware");
    }
  static t(): string {
        return wq.getAbsolutePathOf(wq.o$);
    }
  static u(): string {
        return wq.getAbsolutePathOf(wq.h);
    }
  static v(): string {
        return wq.getAbsolutePathOf(wq.f);
    }
  static w(): string {
        return wq.getAbsolutePathOf(wq.g$);
    }
  static getCustomComponent(): string {
        return wq.getAbsolutePathOf(wq.CUSTOM_COMPONENT_FILE);
    }
  static getExtraDataExport(): string {
        return wq.getAbsolutePathOf(wq.EXTRA_DATA_EXPORT);
    }
  static a(...args: any[]): any {
    if (args.length === 2 && (args[1] == null || typeof args[1] === 'string')) return wq.a_Context_String.apply(wq, args as any);
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) return wq.a_String.apply(wq, args as any);
    if (args.length === 0) return wq.a_0.apply(wq, args as any);
    throw new Error('no overload of a for ' + args.length);
  }
  static b(...args: any[]): any {
    if (args.length === 1 && typeof args[0] === 'number') return wq.b_int.apply(wq, args as any);
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) return wq.b_String.apply(wq, args as any);
    throw new Error('no overload of b for ' + args.length);
  }
  static c(...args: any[]): any {
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) return wq.c_String.apply(wq, args as any);
    if (args.length === 0) return wq.c_0.apply(wq, args as any);
    throw new Error('no overload of c for ' + args.length);
  }
  static d(...args: any[]): any {
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) return wq.d_String.apply(wq, args as any);
    if (args.length === 0) return wq.d_0.apply(wq, args as any);
    throw new Error('no overload of d for ' + args.length);
  }
  static e(...args: any[]): any {
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) return wq.e_String.apply(wq, args as any);
    if (args.length === 0) return wq.e_0.apply(wq, args as any);
    throw new Error('no overload of e for ' + args.length);
  }
}