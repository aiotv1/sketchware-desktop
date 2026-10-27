// Auto-ported from CommandBlock.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.util.Pair, com.google.gson.Gson, java.util.ArrayList, java.util.Arrays, java.util.HashMap, mod.hey.studios.util.Helper, pro.sketchware.utility.FileUtil
// <imports>
import { jparseInt, jint, jlist, jlistOf, JMap, Pair } from '../codegen/jshim';
import { FileUtil, Gson, Helper } from './env';
// </imports>
export class CommandBlock {
  static applyCommands(fileName: string, c: string): string {
        let str = c;
        let path = FileUtil.getExternalStorageDir().concat("/.sketchware/temp/commands");
        let data;
        try {
            //writeLog("try");
            if (FileUtil.isExistFile(path) && !FileUtil.readFile(path).isEmpty() && !FileUtil.readFile(path).equals("[]")) {
                //writeLog("the file is found and has content :)");
                data = new Gson().fromJson(FileUtil.readFile(path), Helper.TYPE_MAP_LIST);
                //writeLog("get gson from file is done");
                for (let i = 0; i < data.size(); i++) {
                    //writeLog("element : " + i);
                    if (CommandBlock.getInputName(data.get(i).get("input")).equals(fileName)) {
                        //writeLog("element : " + i + " > find a target !!");
                        str = CommandBlock.N(str, data.get(i));
                        //writeLog("element : " + i + " > N is done :l");
                    }
                }
                //writeLog("process is succeeded");
                return str;
            } else {
                //writeLog("file isn't found :(");
                return c;
            }
        } catch (e: any) { /*writeLog("error :("); */
            return c;
        }
    }
  static N(c: string, map: any): string {
        let a = jlist(jlistOf(c.jsplit("\n")));
        let res = "";
        let reference = map.get("reference");
        let distance = map.get("distance");
        let after = map.get("after");
        let before = map.get("before");
        let command = map.get("command");
        let input = CommandBlock.getExceptFirstLine(map.get("input"));

        if (command.equals("find-replace")) {
            return c.jreplace(reference, input);
        }
        if (command.equals("find-replace-first")) {
            try {
                return c.jreplaceFirst(reference, input);
            } catch (e: any) {
                return c;
            }
        }

        if (command.equals("find-replace-all")) {
            try {
                return c.jreplaceAll(reference, input);
            } catch (e: any) {
                return c;
            }
        }

        let index = CommandBlock.getIndex(a, reference);
        if (index == -1) {
            return c;
        }

        if (command.equals("insert")) {
            if ((index + distance - before) < 0) {
                a.add(0, input);
            } else if ((index + distance - before) > (a.size() - 1)) {
                a.add(input);
            } else {
                a.add(jint((index + distance - before)), input);
            }
        }
        if (command.equals("add")) {
            if ((index + distance + after + 1) < 0) {
                a.add(0, input);
            } else if ((index + distance + after + 1) > (a.size() - 1)) {
                a.add(input);
            } else {
                a.add(jint((index + distance + after + 1)), input);
            }
        }

        //old method
        /*
        if(command.equals("replace")){
            int xxx = (int)(index + distance - before -1);
            if ( xxx <0 ){ xxx = 0; }

            int ff = (int)(index + distance - before);
            if ( ff <0 ){ ff = 0; }
            int tt = (int)(index + distance + after +1);
            if ( tt > a.size() ){ tt = a.size(); }
            a.subList(ff , tt).clear();

            if (xxx > a.size()-2){
                a.add(input);
            } else {
                a.add((int)(xxx+1) , input);
            }
        }
        */

        if (command.equals("replace")) {
            if (before == 0 && after == 0) {
                let lineToChange = jint((index + distance));
                if (lineToChange < 0) {
                    lineToChange = 0;
                }
                if (lineToChange > (a.size() - 1)) {
                    lineToChange = a.size() - 1;
                }
                a.set(lineToChange, input);
            } else {
                let lineToChange = jint((index + distance));
                if (lineToChange <= 0) { // ignore backend
                    lineToChange = 0;
                    let from = 1;
                    let to = jint(after) + 1;
                    if (to > (a.size() - 1)) {
                        to = a.size() - 1;
                    }
                    a.subList(from, to).clear();
                    a.set(0, input);
                } else if (lineToChange >= (a.size() - 1)) { //ignore frontend
                    lineToChange = a.size() - 1;
                    let from = jint((lineToChange - before));
                    let to = lineToChange;
                    if (from < 0) {
                        from = 0;
                    }
                    a.set(lineToChange, input);
                    a.subList(from, to).clear();
                } else {  //handle everything
                    if (before < 0) {
                        before = 0;
                    }
                    if (after < 0) {
                        after = 0;
                    }
                    let from = lineToChange + 1;
                    let to = lineToChange + jint(after);
                    if (to > (a.size() - 1)) {
                        to = a.size() - 1;
                    }
                    a.subList(from, to).clear();
                    a.set(lineToChange, input);
                    from = jint((lineToChange - before));
                    to = lineToChange;
                    if (from < 0) {
                        from = 0;
                    }
                    a.subList(from, to).clear();
                }
            }
        }

        for (let i = 0; i < a.size(); i++) {
            if (res.isEmpty()) {
                res = a.get(i);
            } else {
                res = res.concat("\n").concat(a.get(i));
            }
        }

        return res;
    }
  static getExceptFirstLine(c: string): string {
        let a = jlist(jlistOf(c.jsplit("\n")));
        let res = "";
        if (!a.isEmpty()) {
            a.remove(0);
        } else {
            return c;
        }
        for (let i = 0; i < a.size(); i++) {
            if (res.isEmpty()) {
                res = a.get(i);
            } else {
                res = res.concat("\n").concat(a.get(i));
            }
        }
        return res;
    }
  static getFirstLine(c: string): string {
        let a = jlist(jlistOf(c.jsplit("\n")));
        if (!a.isEmpty()) {
            return a.get(0);
        } else {
            return "";
        }
    }
  static getInputName(input: string): string {
        let firstLine = CommandBlock.getFirstLine(input);
        if (firstLine.startsWith(">")) {
            firstLine = firstLine.substring(1).trim();
        }
        return firstLine;
    }
  static CBForXml(c: string): string {
        let OC = c;
        let RC = OC;
        let SID = "/*AXAVajPNTpbJjsz-NGVTp08YDzfI-04kA7ZsuCl4GHqTQQiuWL45sV6Vf4gwK";
        let EID = "Ui5_PNTJb21WO6OuGwQ3psk3su1LIvyXo_OAol-kVQBC5jtN_DcPLaRCJ0yXp*/";
        try {
            //commands list
            let Cs = [];
            //get command blocks from java code and add them to the list
            CommandBlock.getCBs(Cs, RC, SID, EID);
            //remove commands lines from java file
            RC = CommandBlock.rCCs(RC, SID, EID);
            //write temporary file
            CommandBlock.WTF(Cs);
            return RC;
        } catch (e: any) {
            CommandBlock.writeLog(e.toString());
            return CommandBlock.rCCs(c, SID, EID);
        }
    }
  static WTF(list: any): void {
        let path = FileUtil.getExternalStorageDir().concat("/.sketchware/temp/commands");
        let data = [];
        try {
            if (FileUtil.isExistFile(path) && !FileUtil.readFile(path).isEmpty() && !FileUtil.readFile(path).equals("[]")) {
                data = new Gson().fromJson(FileUtil.readFile(path), Helper.TYPE_MAP_LIST);
            }
        } catch (ignored: any) {
        }
        data.addAll(list);
        FileUtil.writeFile(path, new Gson().toJson(data));
    }
  static x(): void {
        let path = FileUtil.getExternalStorageDir().concat("/.sketchware/temp/commands");
        if (FileUtil.isExistFile(path)) {
            FileUtil.deleteFile(path);
        }
    }
  static CB(c: string): string {
        let OC = c;
        let RC = OC;
        let SID = "/*-JX4UA2y_f1OckjjvxWI.bQwRei-sLEsBmds7ArsRfi0xSFEP3Php97kjdMCs5ed";
        let EID = "BpWI8U4flOpx8Ke66QTlZYBA_NEusQ7BN-D0wvZs7ArsRfi0.EP3Php97kjdMCs*/";
        try {
            //commands list
            let Cs = [];
            //get command blocks from java code and add them to the list
            CommandBlock.getCBs(Cs, RC, SID, EID);
            //remove commands lines from java file
            RC = CommandBlock.rCCs(RC, SID, EID);
            //command blocks for xml
            RC = CommandBlock.CBForXml(RC);
            //apply commands
            RC = CommandBlock.aCs(Cs, RC);
            return RC;
        } catch (e: any) {
            CommandBlock.writeLog(e.toString());
            return CommandBlock.rCCs(c, SID, EID);
        }
    }
  static writeLog(s: string): void {
        let path = FileUtil.getExternalStorageDir().concat("/.sketchware/temp/log.txt");
        let text = "";
        if (FileUtil.isExistFile(path)) {
            text = FileUtil.readFile(path);
        }
        FileUtil.writeFile(path, text.concat("\n=>").concat(s));
    }
  static getCBs(arr: any, c: string, sid: string, eid: string): void {
        let a = jlist(jlistOf(c.jsplit("\n")));
        let b = false;
        let n = -1;
        for (let i = 0; i < a.size(); i++) {
            if (b) {
                if (a.get(i).contains(eid)) {
                    let p = new Pair(n, i);
                    CommandBlock.aC(a, arr, p);
                    b = false;
                    n = -1;
                }
            } else {
                if (a.get(i).contains(sid)) {
                    n = i;
                    b = true;
                }
            }
        }
    }
  static assemble(a: any): string {
        let res = "";
        for (let i = 0; i < a.size(); i++) {
            if (res.isEmpty()) {
                res = a.get(i);
            } else {
                res = res.concat("\n").concat(a.get(i));
            }
        }
        return res;
    }
  static aCs(arr: any, c: string): string {
        let a = jlist(jlistOf(c.jsplit("\n")));
        let res = "";
        for (let i = 0; i < arr.size(); i++) {
            let reference = arr.get(i).get("reference");
            let distance = jint(arr.get(i).get("distance"));
            let after = jint(arr.get(i).get("after"));
            let before = jint(arr.get(i).get("before"));
            let command = arr.get(i).get("command");
            let input = arr.get(i).get("input");

            if (command.equals("find-replace")) {
                let temp = CommandBlock.assemble(a);
                temp = temp.jreplace(reference, input);
                a = jlist(jlistOf(temp.jsplit("\n")));
                continue;
            }
            if (command.equals("find-replace-first")) {
                try {
                    let temp = CommandBlock.assemble(a);
                    temp = temp.jreplaceFirst(reference, input);
                    a = jlist(jlistOf(temp.jsplit("\n")));
                    continue;
                } catch (e: any) {
                    continue;
                }
            }

            if (command.equals("find-replace-all")) {
                try {
                    let temp = CommandBlock.assemble(a);
                    temp = temp.jreplaceAll(reference, input);
                    a = jlist(jlistOf(temp.jsplit("\n")));
                    continue;
                } catch (e: any) {
                    continue;
                }
            }

            let index = CommandBlock.getIndex(a, reference);
            if (index == -1) {
                continue;
            }


            if (command.equals("insert")) {
                if ((index + distance - before) < 0) {
                    a.add(0, input);
                } else if ((index + distance - before) > (a.size() - 1)) {
                    a.add(input);
                } else {
                    a.add(index + distance - before, input);
                }
                continue;
            }
            if (command.equals("add")) {
                if ((index + distance + after + 1) < 0) {
                    a.add(0, input);
                } else if ((index + distance + after + 1) > (a.size() - 1)) {
                    a.add(input);
                } else {
                    a.add(index + distance + after + 1, input);
                }
                continue;
            }

            ///old method
        /*
        if(command.equals("replace")){
            boolean isZ = false;
            int xxx = (int)(index + distance - before -1);
            if ( xxx <=0 ){ isZ = true; xxx = 0; }

            int ff = (int)(index + distance - before);
            if ( ff <0 ){ ff = 0; }
            int tt = (int)(index + distance + after +1);
            if ( tt > a.size() ){ tt = a.size(); }
            a.subList(ff , tt).clear();
            //// fix bug
            if (xxx > a.size()-2){
                a.add(input);
            } else if(isZ) {
                a.add(0, input);
            } else {
                a.add((int)(xxx+1) , input);
            } continue ;}*/

            if (command.equals("replace")) {
                if (before == 0 && after == 0) {
                    let lineToChange = index + distance;
                    if (lineToChange < 0) {
                        lineToChange = 0;
                    }
                    if (lineToChange > (a.size() - 1)) {
                        lineToChange = a.size() - 1;
                    }
                    a.set(lineToChange, input);
                } else {
                    let lineToChange = index + distance;
                    if (lineToChange <= 0) { // ignore backend
                        lineToChange = 0;
                        let from = 1;
                        let to = after + 1;
                        if (to > (a.size() - 1)) {
                            to = a.size() - 1;
                        }
                        a.subList(from, to).clear();
                        a.set(0, input);
                    } else if (lineToChange >= (a.size() - 1)) { //ignore frontend
                        lineToChange = a.size() - 1;
                        let from = lineToChange - before;
                        let to = lineToChange;
                        if (from < 0) {
                            from = 0;
                        }
                        a.set(lineToChange, input);
                        a.subList(from, to).clear();
                    } else {  //handle everything
                        if (before < 0) {
                            before = 0;
                        }
                        if (after < 0) {
                            after = 0;
                        }
                        let from = lineToChange + 1;
                        let to = lineToChange + after;
                        if (to > (a.size() - 1)) {
                            to = a.size() - 1;
                        }
                        a.subList(from, to).clear();
                        a.set(lineToChange, input);
                        from = lineToChange - before;
                        to = lineToChange;
                        if (from < 0) {
                            from = 0;
                        }
                        a.subList(from, to).clear();
                    }
                }
            }
        }

        for (let i = 0; i < a.size(); i++) {
            if (res.isEmpty()) {
                res = a.get(i);
            } else {
                res = res.concat("\n").concat(a.get(i));
            }
        }

        return res;
    }
  static getIndex(a: any, r: string): number {
        for (let i = 0; i < a.size(); i++) {
            if (a.get(i).contains(r)) {
                return i;
            }
        }
        return -1;
    }
  static rCCs(c: string, sid: string, eid: string): string {
        let a = jlist(jlistOf(c.jsplit("\n")));
        let r = [];
        let res = "";
        let w = 1;
        for (let i = 0; i < a.size(); i++) {
            if (w == 1) {
                if (!a.get(i).contains(sid)) {
                    r.add(a.get(i));
                }
            }

            if (a.get(i).contains(sid)) {
                w = 0;
            }
            if (a.get(i).contains(eid)) {
                w = 1;
            }
        }

        for (let i = 0; i < r.size(); i++) {
            if (res.isEmpty()) {
                res = r.get(i);
            } else {
                res = res.concat("\n").concat(r.get(i));
            }
        }

        return res;
    }
  static aC(arr: any, arr2: any, p: any): void {
        let ref;
        let dis;
        let af;
        let be;
        let c;
        let input = "";

        let v = arr.get(p.first + 1);
        let kk = v.substring(v.indexOf(">") + 1);
        let aa = new Gson().fromJson(kk, Helper.TYPE_STRING);
        ref = aa.get(0);

        v = arr.get(p.first + 2);
        dis = jparseInt(v.substring(v.indexOf(">") + 1));

        v = arr.get(p.first + 3);
        af = jparseInt(v.substring(v.indexOf(">") + 1));

        v = arr.get(p.first + 4);
        be = jparseInt(v.substring(v.indexOf(">") + 1));

        v = arr.get(p.first + 5);
        c = v.substring(v.indexOf(">") + 1);

        for (let i = 0; i < (p.second - p.first - 6); i++) {
            if (i == 0) {
                input = arr.get(p.first + i + 6);
            } else {
                input = input.concat("\n").concat(arr.get(p.first + i + 6));
            }
        }

        let hm = new JMap();
        hm.put("reference", ref);
        hm.put("distance", dis);
        hm.put("after", af);
        hm.put("before", be);
        hm.put("command", c);
        hm.put("input", input);
        arr2.add(hm);
    }
}