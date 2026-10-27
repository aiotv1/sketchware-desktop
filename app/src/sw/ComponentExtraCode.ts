// Auto-ported from ComponentExtraCode.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: org.json.JSONArray, java.util.ArrayList, java.util.Arrays, a.a.a.Hx, pro.sketchware.utility.FileUtil
// <imports>
import { jlist, jlistOf } from '../codegen/jshim';
import { FileUtil, JSONArray } from './env';
// </imports>
export class ComponentExtraCode {
  b: any;
  hx: any;
  constructor(h: any, st: any) {
        this.b = st;
        this.hx = h;
    }
  s(str: string): void {
        // Aldi's original Components
        if (str.contains("DatePickerFragment")) {
            this.hx.l = str;
            return;
        }
        if (str.contains("FragmentStatePagerAdapter")) {
            let temp = this.hx.k;
            if (temp.isEmpty()) {
                this.hx.k = str;
            } else {
                this.hx.k = temp.concat("\r\n\r\n").concat(str);
            }
            return;
        }
        if (str.contains("extends AsyncTask<String, Integer, String>")) {
            let temp = this.hx.k;
            if (temp.isEmpty()) {
                this.hx.k = str;
            } else {
                this.hx.k = temp.concat("\r\n\r\n").concat(str);
            }
            return;
        }

        // Hilal's components
        let path = FileUtil.getExternalStorageDir().concat("/.sketchware/data/system/listeners.json");
        try {
            if (FileUtil.isExistFile(path) && !FileUtil.readFile(path).isEmpty() && !FileUtil.readFile(path).equals("[]")) {
                let arr = new JSONArray(FileUtil.readFile(path));
                if (arr.length > 0) {
                    for (let i = 0; i < arr.length; i++) {
                        let c = arr.getJSONObject(i).getString("code");
                        let f = this.getFirstLine(c);
                        if (!arr.getJSONObject(i).isNull("s") && str.contains(f)) {
                            let q = arr.getJSONObject(i).getString("s");
                            if (q.equals("true")) {
                                let temp = this.hx.k;
                                if (temp.isEmpty()) {
                                    this.hx.k = str.jreplace(f, "");
                                    return;
                                } else {
                                    this.hx.k = temp.concat("\r\n\r\n").concat(str.jreplace(f, ""));
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        } catch (e: any) {
            if (this.b.length > 0 && !str.isEmpty()) {
                this.b.append("\r\n");
                this.b.append("\r\n");
                this.b.append(str);
            }
        }


        ///others
        if (this.b.length > 0 && !str.isEmpty()) {
            this.b.append("\r\n");
            this.b.append("\r\n");
        }
        this.b.append(str);
    }
  getFirstLine(con: string): string {
        let list = jlist(jlistOf(con.jsplit("\n")));
        if (!list.isEmpty()) {
            for (let i = 0; i < list.size(); i++) {
                let a = list.get(i);
                if (!a.isEmpty()) {
                    return a.trim();
                }
            }
        }
        return "qTHwdyRjVoEqNjuXx";
    }
}