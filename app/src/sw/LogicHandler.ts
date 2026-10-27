// Auto-ported from LogicHandler.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: java.util.ArrayList, java.util.Arrays, pro.sketchware.utility.FileUtil
// <imports>
import { jlist, jlistOf } from '../codegen/jshim';
import { FileUtil } from './env';
// </imports>
export class LogicHandler {
  static base(codes: string): string {
        try {
            let n = 1;
            let newStr = "";
            let arr;
            let arr2 = [];
            arr = jlist(jlistOf(codes.jsplit("\n")));
            for (let i = 0; i < arr.size(); i++) {
                if (n == 1) {
                    if (!arr.get(i).contains("//Ul5kmZqmO867OV0QTGOpjwX7MXmgzxzQBSZTf0Y16PnDXkhLsZfvF")) { //it doesn't contain the starting code.
                        arr2.add(arr.get(i));
                    }
                }
                if (arr.get(i).contains("//Ul5kmZqmO867OV0QTGOpjwX7MXmgzxzQBSZTf0Y16PnDXkhLsZfvF")) { // if it contains the starting code, then stop injection.
                    n = 0;
                }
                if (arr.get(i).contains("//3b5IqsVG57gNqLi7FBO2MeOW6iI7tOustUGwcA7HKXm0o7lovZ")) { // if it contains the ending code, keep going.
                    n = 1;
                }
            }
            //assemble
            for (let i = 0; i < arr2.size(); i++) {
                if (newStr.isEmpty()) {
                    newStr = arr2.get(i);
                } else {
                    newStr = newStr.concat("\n").concat(arr2.get(i));
                }
            }
            return newStr;
        } catch (e: any) {
            return codes;
        }
    }
  static imports(codes: string): string {
        try {
            let n = 0;
            let newStr = "";
            let arr;
            let arr2 = [];
            arr = jlist(jlistOf(codes.jsplit("\n")));
            for (let i = 0; i < arr.size(); i++) {
                if (arr.get(i).contains("//3b5IqsVG57gNqLi7FBO2MeOW6iI7tOustUGwcA7HKXm0o7lovZ")) {//end
                    break;
                }
                if (n == 1) {
                    arr2.add(arr.get(i));
                }
                if (arr.get(i).contains("//Ul5kmZqmO867OV0QTGOpjwX7MXmgzxzQBSZTf0Y16PnDXkhLsZfvF")) {//start
                    n = 1;
                }
            }
            //assemble
            for (let i = 0; i < arr2.size(); i++) {
                if (newStr.isEmpty()) {
                    newStr = arr2.get(i);
                } else {
                    newStr = newStr.concat("\n").concat(arr2.get(i));
                }
            }
            return newStr;
        } catch (e: any) {
            return codes;
        }
    }
  static android(codes: string, javaName: string): void {
        try {
            let n = 0;
            let newStr = "";
            let arr;
            let arr2 = [];
            arr = jlist(jlistOf(codes.jsplit("\n")));
            for (let i = 0; i < arr.size(); i++) {
                if (arr.get(i).contains("//F45d45FDs4f56iq")) {
                    break;
                }
                if (n == 1) {
                    arr2.add(arr.get(i));
                }
                if (arr.get(i).contains("//AndroidManifest_Start")) {
                    n = 1;
                }
            }
            //assemble
            for (let i = 0; i < arr2.size(); i++) {
                if (newStr.isEmpty()) {
                    newStr = arr2.get(i);
                } else {
                    newStr = newStr.concat("\n").concat(arr2.get(i));
                }
            }
            FileUtil.writeFile(FileUtil.getExternalStorageDir().concat("/.sketchware/data/system/temp/").concat(javaName), newStr);
        } catch (ignored: any) {
        }
    }
  static deVar(codes: string): string {
        try {
            let n = 0;
            let newStr = "";
            let arr;
            let arr2 = [];
            arr = jlist(jlistOf(codes.jsplit("\n")));
            for (let i = 0; i < arr.size(); i++) {
                if (arr.get(i).contains("//F45d45FDs4f56ic")) {
                    break;
                }
                if (n == 1) {
                    arr2.add(arr.get(i));
                }
                if (arr.get(i).contains("//Define Variables_Start")) {
                    n = 1;
                }
            }
            //assemble
            for (let i = 0; i < arr2.size(); i++) {
                if (newStr.isEmpty()) {
                    newStr = arr2.get(i);
                } else {
                    newStr = newStr.concat("\n").concat(arr2.get(i));
                }
            }
            return newStr;
        } catch (e: any) {
            return codes;
        }
    }
  static V(): void {
    }
}