// Auto-ported from Fx.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.util.Pair, com.besome.sketch.beans.BlockBean, java.nio.CharBuffer, java.util.ArrayList, java.util.Arrays, java.util.HashMap, java.util.List, java.util.Map, java.util.regex.Matcher, java.util.regex.Pattern, java.util.stream.Collectors, mod.hey.studios.editor.manage.block.ExtraBlockInfo, mod.hey.studios.editor.manage.block.v2.BlockLoader, mod.hey.studios.moreblock.ReturnMoreblockManager, mod.pranav.viewbinding.ViewBindingBuilder
// <imports>
import { jformat, jstr, jparseInt, jparseDouble, jlist, jlistOf, jnewArray, jiter, JMap, StringBuilder, Collectors } from '../codegen/jshim';
import { Lx } from './Lx';
import { ReturnMoreblockManager } from './ReturnMoreblockManager';
import { ViewBindingBuilder } from './ViewBindingBuilder';
import { CharBuffer, Pattern } from './env';
import { BlockLoader } from './platform';
import { sq } from './sq';
// </imports>
export class Fx {
  static PARAM_PATTERN: any = Pattern.compile("%m(?!\\.[\\w]+)");
  isViewBindingEnabled: boolean;
  viewParamsTypes: any = jlist(jlistOf(
            "%m.view", "%m.layout", "%m.textview", "%m.button", "%m.edittext", "%m.imageview", "%m.recyclerview",
            "%m.listview", "%m.gridview", "%m.cardview", "%m.viewpager", "%m.webview", "%m.videoview", "%m.progressbar",
            "%m.seekbar", "%m.switch", "%m.checkbox", "%m.spinner", "%m.tablayout", "%m.bottomnavigation", "%m.adview",
            "%m.swiperefreshlayout", "%m.textinputlayout", "%m.ratingbar", "%m.datepicker", "%m.otpview", "%m.lottie",
            "%m.badgeview", "%m.codeview", "%m.patternview", "%m.signinbutton", "%m.youtubeview"
    ));
  operators: string[] = ["repeat", "+", "-", "*", "/", "%", ">", "=", "<", "&&", "||", "not"];
  arithmetic: string[] = ["+", "-", "*", "/", "%", ">", "=", "<", "&&", "||"];
  moreBlock: string = "";
  activityName: string;
  buildConfig: any;
  eventBlocks: any;
  blockMap: any;
  isActivity: boolean;
  constructor(activityName: string, buildConfig: any, eventBlocks: any, isViewBindingEnabled: boolean) {
        this.activityName = activityName;

        this.isActivity = !(activityName.endsWith("DialogFragmentActivity") || activityName.endsWith("BottomDialogFragmentActivity") || activityName.endsWith("FragmentActivity"));

        this.buildConfig = buildConfig;
        this.eventBlocks = eventBlocks;
        this.isViewBindingEnabled = isViewBindingEnabled;
    }
  a_0(): string {
        this.blockMap = new JMap();
        let beans = this.eventBlocks;

        if (beans != null && !beans.isEmpty()) {
            for (const bean of jiter(this.eventBlocks)) {
                this.blockMap.put(bean.id, bean);
            }

            return this.generateBlock(this.eventBlocks.get(0), "");
        } else {
            return "";
        }
    }
  generateBlock(bean: any, var2: string): string {
        let params = this.getBlockParams(bean);

        let opcode = this.getBlockCode(bean, params);

        let code = opcode;

        if (this.b(bean.opCode, var2)) {
            code = "(" + opcode + ")";
        }

        if (bean.nextBlock >= 0) {
            code += (code.isEmpty() ? "" : "\r\n") + this.a(jstr(bean.nextBlock), this.moreBlock);
        }

        return code;
    }
  hasEmptySelectorParam(params: any, spec: string): boolean {
        let matcher = Fx.PARAM_PATTERN.matcher(spec);
        if (!matcher.find()) {
            let paramMatcher = Pattern.compile("%[bdsm]").matcher(spec);
            let count = 0;
            let selectorParamPositions = [];
            while (paramMatcher.find()) {
                let param = paramMatcher.group();
                if ("%m".equals(param)) {
                    selectorParamPositions.add(count);
                }
                count++;
            }
            if (!selectorParamPositions.isEmpty()) {
                for (const position of jiter(selectorParamPositions)) {
                    if (position >= params.size()) {
                        continue;
                    }
                    let param = params.get(position);
                    if (param == null || param.isEmpty()) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
  escapeString(input: string): string {
        let escapedString = new StringBuilder(4096);
        let charBuffer = CharBuffer.wrap(input);

        for (let i = 0; i < charBuffer.length; ++i) {
            let currentChar = charBuffer.get(i);
            if (currentChar == '"') {
                escapedString.append("\\\"");
            } else if (currentChar == "\\") {
                if (i < charBuffer.length - 1) {
                    let nextIndex = i + 1;
                    currentChar = charBuffer.get(nextIndex);
                    if (currentChar != "n" && currentChar != "t") {
                        escapedString.append("\\\\");
                    } else {
                        escapedString.append("\\").append(currentChar);
                        i = nextIndex;
                    }
                } else {
                    escapedString.append("\\\\");
                }
            } else if (currentChar == "\n") {
                escapedString.append("\\n");
            } else {
                escapedString.append(currentChar);
            }
        }

        return escapedString.toString();
    }
  a_String_int_String(param: string, type: number, opcode: string): string {
        if (!param.isEmpty() && param.charAt(0) == "@") {
            opcode = this.a(param.substring(1), opcode);
            if (type == 2 && opcode.isEmpty()) {
                return "\"\"";
            }
            return opcode;
        } else if (type == 2) {
            return "\"" + this.escapeString(param) + "\"";
        } else if (type == 1) {
            /**
             * Ideally, a.a.a.Fx#a(BlockBean, String) should be responsible for parsing the input properly.
             * However, upon decompiling this class, it seems to completely ignore this case.
             * This is the solution for now to prevent errors during code generation.
             */
            try {
                if (param.isEmpty()) {
                    return "0";
                }
                if (param.contains(".")) {
                    jparseDouble(param);
                    return param + "d";
                }
                jparseInt(param);
                return param;
            } catch (e: any) {
                return param;
            }
        } else if (type == 0) {
            //the same with type == 1
            if (param.isEmpty()) {
                return "true";
            }
        }
        return param;
    }
  a_String_String(blockId: string, var2: string): string {
        return !this.blockMap.containsKey(blockId) ? "" : this.generateBlock(this.blockMap.get(blockId), var2);
    }
  b(var1: string, var2: string): boolean {
        return jlistOf(this.operators).contains(var2) && jlistOf(this.arithmetic).contains(var1);
    }
  getBlockParams(bean: any): any {
        let params = [];
        let paramsTypes = this.extractParamsTypes(bean.spec);
        for (let i = 0; i < bean.parameters.size(); i++) {
            let param = this.getParamValue(bean.parameters.get(i), paramsTypes.get(i));
            let type = this.getBlockType(bean, i);
            params.add(this.a(param, type, bean.opCode));
        }
        return params;
    }
  getParamValue(param: string, paramType: string): string {
        let isWidgetParam = this.viewParamsTypes.contains(paramType);
        let isColorParam = paramType.equals("%m.color");

        if (isWidgetParam) {
            let bindingStart = "binding.";
            if (this.isViewBindingEnabled && !param.isEmpty() && !param.startsWith("@") && !param.startsWith(bindingStart)) {
                return bindingStart + ViewBindingBuilder.generateParameterFromId(param);
            }
        } else if (isColorParam) {
            if (param.startsWith("R.color.")) {
                return "getResources().getColor(" + param + ")";
            }
            let context = this.isActivity ? this.activityName + ".this" : "getContext()";
            let attr = null;
            if (param.startsWith("R.attr.")) {
                attr = param;
            } else if (param.startsWith("getMaterialColor(") && param.endsWith(")")) {
                // to keep backward compatibility with old getMaterialColor calls
                attr = param.substring("getMaterialColor(".length, param.length - 1);
            }
            if (attr != null) {
                return jformat("SketchwareUtil.getMaterialColor(%s, %s)", context, attr);
            }
        }
        return param;
    }
  extractParamsTypes(input: string): any {
        let matches = [];
        let pattern = Pattern.compile("%\\w+(?:\\.\\w+)?|%\\w"); // Supports %m.word.word, %m.word and %word
        let matcher = pattern.matcher(input);

        while (matcher.find()) {
            matches.add(matcher.group().toLowerCase());
        }

        return matches;
    }
  getBlockCode(bean: any, params: any): string {
        let opcode = "";
        switch (bean.opCode) {
            case "definedFunc":
                var space = bean.spec.indexOf(" ");
                if (bean.parameters.isEmpty()) {
                    opcode = bean.type;
                    this.moreBlock = "_" + (space < 0 ? bean.spec : bean.spec.substring(0, space)) + "()" + ReturnMoreblockManager.getMbEnd(bean.type);
                } else {
                    let paramsTypes = this.extractParamsTypes(bean.spec);
                    opcode = "_" + bean.spec.substring(0, space) + "(";
                    let hasStringParam = false;

                    for (let i = 0; i < params.size(); i++) {
                        if (i > 0) opcode += ", ";
                        let param = this.getParamValue(params.get(i), paramsTypes.get(i));
                        if (param.isEmpty()) {
                            let paramInfo = bean.getParamClassInfo().get(i);
                            if (paramInfo.b("boolean")) {
                                opcode += "true";
                            } else if (paramInfo.b("double")) {
                                opcode += "0";
                            } else if (paramInfo.b("String")) {
                                hasStringParam = true;
                            }
                        } else {
                            opcode += param;
                        }
                    }

                    this.moreBlock = opcode + ")" + ReturnMoreblockManager.getMbEnd(bean.type);
                    if (hasStringParam) this.moreBlock = bean.type;
                }

                var op = opcode;
                opcode = this.moreBlock;
                this.moreBlock = op;
                break;
            case "getArg":
                opcode = "_" + bean.spec;
                break;
            case "getVar":
                opcode = bean.spec;
                break;
            case "getResStr":
                opcode = "getString(R.string." + bean.spec + ")";
                break;
            case "setVarBoolean": case "setVarInt": case "setVarString":
                opcode = jformat("%s = %s;", params.get(0), params.get(1));
                break;
            case "increaseInt":
                opcode = jformat("%s++;", params.get(0));
                break;
            case "decreaseInt":
                opcode = jformat("%s--;", params.get(0));
                break;
            case "mapCreateNew":
                opcode = jformat("%s = new HashMap<>();", params.get(0));
                break;
            case "mapPut":
                opcode = jformat("%s.put(%s, %s);", params.get(0), params.get(1), params.get(2));
                break;
            case "mapGet":
                opcode = jformat("%s.get(%s).toString()", params.get(0), params.get(1));
                break;
            case "mapContainKey":
                opcode = jformat("%s.containsKey(%s)", params.get(0), params.get(1));
                break;
            case "mapRemoveKey":
                opcode = jformat("%s.remove(%s);", params.get(0), params.get(1));
                break;
            case "mapSize": case "lengthList":
                opcode = jformat("%s.size()", params.get(0));
                break;
            case "mapClear": case "clearList":
                opcode = jformat("%s.clear();", params.get(0));
                break;
            case "mapIsEmpty":
                opcode = jformat("%s.isEmpty()", params.get(0));
                break;
            case "mapGetAllKeys":
                opcode = jformat("SketchwareUtil.getAllKeysFromMap(%s, %s);", params.get(0), params.get(1));
                break;
            case "addListInt":
                opcode = jformat("%s.add(Double.valueOf(%s));", params.get(1), params.get(0));
                break;
            case "insertListInt":
                opcode = jformat("%s.add((int)(%s), Double.valueOf(%s));", params.get(2), params.get(1), params.get(0));
                break;
            case "getAtListInt":
                opcode = jformat("%s.get((int)(%s)).doubleValue()", params.get(1), params.get(0));
                break;
            case "indexListInt": case "indexListStr":
                opcode = jformat("%s.indexOf(%s)", params.get(1), params.get(0));
                break;
            case "containListInt": case "containListStr":
                opcode = jformat("%s.contains(%s)", params.get(0), params.get(1));
                break;
            case "addListStr": case "addMapToList":
                opcode = jformat("%s.add(%s);", params.get(1), params.get(0));
                break;
            case "insertListStr":
                opcode = jformat("%s.add((int)(%s), %s);", params.get(2), params.get(1), params.get(0));
                break;
            case "getAtListStr":
                opcode = jformat("%s.get((int)(%s))", params.get(1), params.get(0));
                break;
            case "addListMap":
                opcode = jformat("{\r\nHashMap<String, Object> _item = new HashMap<>();\r\n_item.put(%s, %s);\r\n%s.add(_item);\r\n}", params.get(0), params.get(1), params.get(2));
                break;
            case "insertListMap":
                opcode = jformat("{\r\nHashMap<String, Object> _item = new HashMap<>();\r\n_item.put(%s, %s);\r\n%s.add((int)%s, _item);\r\n}", params.get(0), params.get(1), params.get(3), params.get(2));
                break;
            case "getAtListMap":
                opcode = jformat("%s.get((int)%s).get(%s).toString()", params.get(2), params.get(0), params.get(1));
                break;
            case "setListMap":
                opcode = jformat("%s.get((int)%s).put(%s, %s);", params.get(3), params.get(2), params.get(0), params.get(1));
                break;
            case "containListMap":
                opcode = jformat("%s.get((int)%s).containsKey(%s)", params.get(0), params.get(1), params.get(2));
                break;
            case "insertMapToList":
                opcode = jformat("%s.add((int)%s, %s);", params.get(2), params.get(1), params.get(0));

                break;
            case "getMapInList":
                opcode = jformat("%s = %s.get((int)%s);", params.get(2), params.get(1), params.get(0));
                break;
            case "deleteList":
                opcode = jformat("%s.remove((int)(%s));", params.get(1), params.get(0));
                break;
            case "forever":
                var stack = bean.subStack1;
                opcode = jformat("while(true) {\r\n%s\r\n}", stack >= 0 ? this.a(jstr(stack), "") : "");
                break;
            case "repeat":
                stack = bean.subStack1;
                opcode = jformat(`for(int _repeat%s = 0; _repeat%s < (int)(%s); _repeat%s++) {
%s
}`,
                        bean.id, bean.id, params.get(0), bean.id,
                        stack >= 0 ? this.a(jstr(stack), "") : "");
                break;
            case "if":
                stack = bean.subStack1;
                opcode = jformat("if (%s) {\r\n%s\r\n}", params.get(0), stack >= 0 ? this.a(jstr(stack), "") : "");
                break;
            case "ifElse":
                stack = bean.subStack1;
                var ifBlock = stack >= 0 ? this.a(jstr(stack), "") : "";
                stack = bean.subStack2;
                var elseBlock = stack >= 0 ? this.a(jstr(stack), "") : "";
                opcode = jformat("if (%s) {\r\n%s\r\n} else {\r\n%s\r\n}", params.get(0), ifBlock, elseBlock);
                break;
            case "break":
                opcode = "break;";
                break;
            case "true":
            case "false":
                opcode = bean.opCode;
                break;
            case "not":
                opcode = jformat("!%s", params.get(0));
                break;
            case "+":
            case "-":
            case "*":
            case "/":
            case "%":
            case ">":
            case "<":
                opcode = jformat("%s %s %s", params.get(0), bean.opCode, params.get(1));
                break;
            case "=":
                opcode = jformat("%s == %s", params.get(0), params.get(1));
                break;
            case "&&":
            case "||":
                opcode = jformat("%s %s %s", params.get(0), bean.opCode, params.get(1));
                break;
            case "random":
                opcode = jformat("SketchwareUtil.getRandom((int)(%s), (int)(%s))", params.get(0), params.get(1));
                break;
            case "stringLength":
                opcode = jformat("%s.length()", params.get(0));
                break;
            case "stringJoin":
                opcode = jformat("%s.concat(%s)", params.get(0), params.get(1));
                break;
            case "stringIndex":
                opcode = jformat("%s.indexOf(%s)", params.get(1), params.get(0));
                break;
            case "stringLastIndex":
                opcode = jformat("%s.lastIndexOf(%s)", params.get(1), params.get(0));
                break;
            case "stringSub":
                opcode = jformat("%s.substring((int)(%s), (int)(%s))", params.get(0), params.get(1), params.get(2));
                break;
            case "stringEquals":
                opcode = jformat("%s.equals(%s)", params.get(0), params.get(1));
                break;
            case "stringContains":
                opcode = jformat("%s.contains(%s)", params.get(0), params.get(1));
                break;
            case "stringReplace":
                opcode = jformat("%s.replace(%s, %s)", params.get(0), params.get(1), params.get(2));
                break;
            case "stringReplaceFirst":
                opcode = jformat("%s.replaceFirst(%s, %s)", params.get(0), params.get(1), params.get(2));
                break;
            case "stringReplaceAll":
                opcode = jformat("%s.replaceAll(%s, %s)", params.get(0), params.get(1), params.get(2));
                break;
            case "toNumber":
                var doub = params.get(0);
                doub = (!doub.equals("\"\"")) ? doub : "\"0\"";
                opcode = jformat("Double.parseDouble(%s)", doub);
                break;
            case "currentTime":
                opcode = "System.currentTimeMillis()";
                break;
            case "trim":
                opcode = jformat("%s.trim()", params.get(0));
                break;
            case "toUpperCase":
                opcode = jformat("%s.toUpperCase()", params.get(0));
                break;
            case "toLowerCase":
                opcode = jformat("%s.toLowerCase()", params.get(0));
                break;
            case "toString":
                opcode = jformat("String.valueOf((long)(%s))", params.get(0));
                break;
            case "toStringWithDecimal":
                opcode = jformat("String.valueOf(%s)", params.get(0));
                break;
            case "toStringFormat":
                opcode = jformat("new DecimalFormat(%s).format(%s)", params.get(1), params.get(0));
                break;
            case "addSourceDirectly":
                var asd = bean.parameters.get(0);
                opcode = (asd != null) ? asd : opcode;
                break;
            case "strToMap":
                opcode = jformat("%s = new Gson().fromJson(%s, new TypeToken<HashMap<String, Object>>(){}.getType());", params.get(1), params.get(0));
                break;
            case "mapToStr": case "listMapToStr":
                opcode = jformat("new Gson().toJson(%s)", params.get(0));
                break;
            case "strToListMap":
                opcode = jformat("%s = new Gson().fromJson(%s, new TypeToken<ArrayList<HashMap<String, Object>>>(){}.getType());", params.get(1), params.get(0));

                break;
            case "mathGetDip":
                opcode = jformat("SketchwareUtil.getDip(getApplicationContext(), (int)(%s))", params.get(0));
                break;
            case "mathGetDisplayWidth":
                opcode = "SketchwareUtil.getDisplayWidthPixels(getApplicationContext())";
                break;
            case "mathGetDisplayHeight":
                opcode = "SketchwareUtil.getDisplayHeightPixels(getApplicationContext())";
                break;
            case "mathPi":
                opcode = "Math.PI";
                break;
            case "mathE":
                opcode = "Math.E";
                break;
            case "mathPow":
                opcode = jformat("Math.pow(%s, %s)", params.get(0), params.get(1));
                break;
            case "mathMin":
                opcode = jformat("Math.min(%s, %s)", params.get(0), params.get(1));
                break;
            case "mathMax":
                opcode = jformat("Math.max(%s, %s)", params.get(0), params.get(1));
                break;
            case "mathSqrt":
                opcode = jformat("Math.sqrt(%s)", params.get(0));
                break;
            case "mathAbs":
                opcode = jformat("Math.abs(%s)", params.get(0));
                break;
            case "mathRound":
                opcode = jformat("Math.round(%s)", params.get(0));
                break;
            case "mathCeil":
                opcode = jformat("Math.ceil(%s)", params.get(0));
                break;
            case "mathFloor":
                opcode = jformat("Math.floor(%s)", params.get(0));
                break;
            case "mathSin":
                opcode = jformat("Math.sin(%s)", params.get(0));
                break;
            case "mathCos":
                opcode = jformat("Math.cos(%s)", params.get(0));
                break;
            case "mathTan":
                opcode = jformat("Math.tan(%s)", params.get(0));
                break;
            case "mathAsin":
                opcode = jformat("Math.asin(%s)", params.get(0));
                break;
            case "mathAcos":
                opcode = jformat("Math.acos(%s)", params.get(0));
                break;
            case "mathAtan":
                opcode = jformat("Math.atan(%s)", params.get(0));
                break;
            case "mathExp":
                opcode = jformat("Math.exp(%s)", params.get(0));
                break;
            case "mathLog":
                opcode = jformat("Math.log(%s)", params.get(0));
                break;
            case "mathLog10":
                opcode = jformat("Math.log10(%s)", params.get(0));
                break;
            case "mathToRadian":
                opcode = jformat("Math.toRadians(%s)", params.get(0));
                break;
            case "mathToDegree":
                opcode = jformat("Math.toDegrees(%s)", params.get(0));
                break;
            case "viewOnClick":
                var listener = bean.subStack1 >= 0 ? this.a(jstr(bean.subStack1), "") : "";
                opcode = jformat("%s.setOnClickListener(new View.OnClickListener() {\n@Override\npublic void onClick(View _view) {\n%s\n}\n});", params.get(0), listener);
                break;
            case "isDrawerOpen":
                if (this.buildConfig.a(this.activityName).hasDrawer) {
                    opcode = this.isViewBindingEnabled ? "binding.Drawer.isDrawerOpen(GravityCompat.START)" : "_drawer.isDrawerOpen(GravityCompat.START)";
                } else {
                    opcode = "";
                }
                break;
            case "openDrawer":
                if (this.buildConfig.a(this.activityName).hasDrawer) {
                    opcode = this.isViewBindingEnabled ? "binding.Drawer.openDrawer(GravityCompat.START);" : "_drawer.openDrawer(GravityCompat.START);";
                } else {
                    opcode = "";
                }
                break;
            case "closeDrawer":
                if (this.buildConfig.a(this.activityName).hasDrawer) {
                    opcode = this.isViewBindingEnabled ? "binding.Drawer.closeDrawer(GravityCompat.START);" : "_drawer.closeDrawer(GravityCompat.START);";
                } else {
                    opcode = "";
                }
                break;
            case "setEnable":
                opcode = jformat("%s.setEnabled(%s);", params.get(0), params.get(1));
                break;
            case "getEnable":
                opcode = jformat("%s.isEnabled()", params.get(0));
                break;
            case "setText":
                opcode = jformat("%s.setText(%s);", params.get(0), params.get(1));
                break;
            case "setTypeface":
                var textStyle = params.get(2);
                var styles = sq.a("property_text_style");
                for (const style of jiter(styles)) {
                    if (style.second.equals(textStyle)) {
                        opcode = jstr(style.first);
                        break;
                    }
                }
                var fontName = params.get(1);
                if ("default_font".equals(fontName)) {
                    opcode = jformat("%s.setTypeface(Typeface.DEFAULT, %s);", params.get(0), opcode);
                } else {
                    opcode = jformat("%s.setTypeface(Typeface.createFromAsset(getAssets(),\"fonts/%s.ttf\"), %s);", params.get(0), fontName, opcode);
                }
                break;
            case "getText":
                opcode = jformat("%s.getText().toString()", params.get(0));
                break;
            case "setBgColor":
                opcode = jformat("%s.setBackgroundColor(%s);", params.get(0), params.get(1));
                break;
            case "setBgResource":
                opcode = params.get(1).equals("NONE") ? "0" : "R.drawable." + params.get(1).jreplaceAll("\\.9", "");
                opcode = jformat("%s.setBackgroundResource(%s);", params.get(0), opcode);
                break;
            case "setTextColor":
                opcode = jformat("%s.setTextColor(%s);", params.get(0), params.get(1));
                break;
            case "setImage":
                var name = params.get(1).jreplaceAll("\\.9", "");
                opcode = jformat("%s.setImageResource(R.drawable.%s);", params.get(0), name.toLowerCase());
                break;
            case "setColorFilter":
                opcode = jformat("%s.setColorFilter(%s, PorterDuff.Mode.MULTIPLY);", params.get(0), params.get(1));
                break;
            case "requestFocus":
                opcode = jformat("%s.requestFocus();", params.get(0));
                break;
            case "doToast":
                opcode = jformat("SketchwareUtil.showMessage(getApplicationContext(), %s);", params.get(0));
                break;
            case "copyToClipboard":
                opcode = jformat("((ClipboardManager) getSystemService(getApplicationContext().CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText(\"clipboard\", %s));", params.get(0));
                break;
            case "setTitle":
                opcode = jformat("setTitle(%s);", params.get(0));
                break;
            case "intentSetAction":
                opcode = jformat("%s.setAction(%s);", params.get(0), (params.get(1).equals("\"\"") ? "" : "Intent." + params.get(1)));
                break;
            case "intentSetData":
                opcode = jformat("%s.setData(Uri.parse(%s));", params.get(0), params.get(1));
                break;
            case "intentSetScreen":
                opcode = jformat("%s.setClass(getApplicationContext(), %s.class);", params.get(0), params.get(1));
                break;
            case "intentPutExtra":
                opcode = jformat("%s.putExtra(%s, %s);", params.get(0), params.get(1), params.get(2));
                break;
            case "intentSetFlags":
                opcode = jformat("%s.setFlags(%s);", params.get(0), "Intent.FLAG_ACTIVITY_" + params.get(1));
                break;
            case "intentGetString":
                opcode = jformat("getIntent().getStringExtra(%s)", params.get(0));
                break;
            case "startActivity":
                opcode = jformat("startActivity(%s);", params.get(0));
                break;
            case "finishActivity":
                opcode = "finish();";
                break;
            case "fileSetFileName":
                opcode = jformat("%s = getApplicationContext().getSharedPreferences(%s, Activity.MODE_PRIVATE);", params.get(0), params.get(1));
                break;
            case "fileGetData":
                opcode = jformat("%s.getString(%s, \"\")", params.get(0), params.get(1));
                break;
            case "fileSetData":
                opcode = jformat("%s.edit().putString(%s, %s).commit();", params.get(0), params.get(1), params.get(2));
                break;
            case "fileRemoveData":
                opcode = jformat("%s.edit().remove(%s).commit();", params.get(0), params.get(1));
                break;
            case "calendarGetNow":
                opcode = jformat("%s = Calendar.getInstance();", params.get(0));
                break;
            case "calendarAdd":
                opcode = jformat("%s.add(Calendar.%s, (int)(%s));", params.get(0), params.get(1), params.get(2));
                break;
            case "calendarSet":
                opcode = jformat("%s.set(Calendar.%s, (int)(%s));", params.get(0), params.get(1), params.get(2));
                break;
            case "calendarFormat":
                opcode = jformat("new SimpleDateFormat(%s).format(%s.getTime())", (!params.get(1).equals("\"\"")) ? params.get(1) : "\"yyyy/MM/dd hh:mm:ss\"", params.get(0));
                break;
            case "calendarDiff":
                opcode = jformat("(long)(%s.getTimeInMillis() - %s.getTimeInMillis())", params.get(0), params.get(1));
                break;
            case "calendarGetTime":
                opcode = jformat("%s.getTimeInMillis()", params.get(0));
                break;
            case "calendarSetTime":
                opcode = jformat("%s.setTimeInMillis((long)(%s));", params.get(0), params.get(1));
                break;
            case "setVisible":
                opcode = jformat("%s.setVisibility(View.%s);", params.get(0), params.get(1));
                break;
            case "setClickable":
                opcode = jformat("%s.setClickable(%s);", params.get(0), params.get(1));
                break;
            case "setRotate":
                opcode = jformat("%s.setRotation((float)(%s));", params.get(0), params.get(1));
                break;
            case "getRotate":
                opcode = jformat("%s.getRotation()", params.get(0));
                break;
            case "setAlpha":
                opcode = jformat("%s.setAlpha((float)(%s));", params.get(0), params.get(1));
                break;
            case "getAlpha":
                opcode = jformat("%s.getAlpha()", params.get(0));
                break;
            case "setTranslationX":
                opcode = jformat("%s.setTranslationX((float)(%s));", params.get(0), params.get(1));
                break;
            case "getTranslationX":
                opcode = jformat("%s.getTranslationX()", params.get(0));
                break;
            case "setTranslationY":
                opcode = jformat("%s.setTranslationY((float)(%s));", params.get(0), params.get(1));
                break;
            case "getTranslationY":
                opcode = jformat("%s.getTranslationY()", params.get(0));
                break;
            case "setScaleX":
                opcode = jformat("%s.setScaleX((float)(%s));", params.get(0), params.get(1));
                break;
            case "getScaleX":
                opcode = jformat("%s.getScaleX()", params.get(0));
                break;
            case "setScaleY":
                opcode = jformat("%s.setScaleY((float)(%s));", params.get(0), params.get(1));
                break;
            case "getScaleY":
                opcode = jformat("%s.getScaleY()", params.get(0));
                break;
            case "getLocationX":
                opcode = jformat("SketchwareUtil.getLocationX(%s)", params.get(0));
                break;
            case "getLocationY":
                opcode = jformat("SketchwareUtil.getLocationY(%s)", params.get(0));
                break;
            case "setChecked":
                opcode = jformat("%s.setChecked(%s);", params.get(0), params.get(1));
                break;
            case "getChecked":
                opcode = jformat("%s.isChecked()", params.get(0));
                break;
            case "listSetData":
                opcode = jformat("%s.setAdapter(new ArrayAdapter<String>(getBaseContext(), android.R.layout.simple_list_item_1, %s));", params.get(0), params.get(1));
                break;
            case "listSetCustomViewData":
            case "recyclerSetCustomViewData":
            case "spnSetCustomViewData":
            case "pagerSetCustomViewData":
            case "gridSetCustomViewData":
                var param = params.get(0);
                if (param.isEmpty()) {
                    break;
                }
                var paramAdapter = param;
                if (this.isViewBindingEnabled && paramAdapter.startsWith("binding.")) {
                    paramAdapter = paramAdapter.substring("binding.".length);
                }
                opcode = jformat("%s.setAdapter(new %s(%s));", param, Lx.a(paramAdapter, this.isViewBindingEnabled), params.get(1));
                break;
            case "listRefresh":
                opcode = jformat("((BaseAdapter)%s.getAdapter()).notifyDataSetChanged();", params.get(0));
                break;
            case "listSetItemChecked":
                opcode = jformat("%s.setItemChecked((int)(%s), %s);", params.get(0), params.get(1), params.get(2));
                break;
            case "listGetCheckedPosition":
                opcode = jformat("%s.getCheckedItemPosition()", params.get(0));
                break;
            case "listGetCheckedPositions":
                opcode = jformat("%s = SketchwareUtil.getCheckedItemPositionsToArray(%s);", params.get(1), params.get(0));
                break;
            case "listGetCheckedCount":
                opcode = jformat("%s.getCheckedItemCount()", params.get(0));
                break;
            case "listSmoothScrollTo":
                opcode = jformat("%s.smoothScrollToPosition((int)(%s));", params.get(0), params.get(1));
                break;
            case "spnSetData":
                opcode = jformat("%s.setAdapter(new ArrayAdapter<String>(getBaseContext(), android.R.layout.simple_spinner_dropdown_item, %s));", params.get(0), params.get(1));
                break;
            case "spnRefresh":
                opcode = jformat("((ArrayAdapter)%s.getAdapter()).notifyDataSetChanged();", params.get(0));
                break;
            case "spnSetSelection":
                opcode = jformat("%s.setSelection((int)(%s));", params.get(0), params.get(1));
                break;
            case "spnGetSelection":
                opcode = jformat("%s.getSelectedItemPosition()", params.get(0));
                break;
            case "webViewLoadUrl":
                opcode = jformat("%s.loadUrl(%s);", params.get(0), params.get(1));
                break;
            case "webViewGetUrl":
                opcode = jformat("%s.getUrl()", params.get(0));
                break;
            case "webViewSetCacheMode":
                opcode = jformat("%s.getSettings().setCacheMode(WebSettings.%s);", params.get(0), params.get(1));
                break;
            case "webViewCanGoBack":
                opcode = jformat("%s.canGoBack()", params.get(0));
                break;
            case "webViewCanGoForward":
                opcode = jformat("%s.canGoForward()", params.get(0));
                break;
            case "webViewGoBack":
                opcode = jformat("%s.goBack();", params.get(0));
                break;
            case "webViewGoForward":
                opcode = jformat("%s.goForward();", params.get(0));
                break;
            case "webViewClearCache":
                opcode = jformat("%s.clearCache(true);", params.get(0));
                break;
            case "webViewClearHistory":
                opcode = jformat("%s.clearHistory();", params.get(0));
                break;
            case "webViewStopLoading":
                opcode = jformat("%s.stopLoading();", params.get(0));
                break;
            case "webViewZoomIn":
                opcode = jformat("%s.zoomIn();", params.get(0));
                break;
            case "webViewZoomOut":
                opcode = jformat("%s.zoomOut();", params.get(0));
                break;
            case "calendarViewGetDate":
                opcode = jformat("%s.getDate()", params.get(0));
                break;
            case "calendarViewSetDate":
                opcode = jformat("%s.setDate((long)(%s), true, true);", params.get(0), params.get(1));
                break;
            case "calendarViewSetMinDate":
                opcode = jformat("%s.setMinDate((long)(%s));", params.get(0), params.get(1));
                break;
            case "calnedarViewSetMaxDate":
                opcode = jformat("%s.setMaxDate((long)(%s));", params.get(0), params.get(1));
                break;
            case "adViewLoadAd":
                opcode = jformat("%s.loadAd(new AdRequest.Builder()%s.build());", params.get(0), this.buildConfig.t.stream().map((device) => ".addTestDevice(\"" + device + "\")\n").collect(Collectors.joining()));
                break;
            case "mapViewSetMapType":
                opcode = jformat("_%s_controller.setMapType(GoogleMap.%s);", params.get(0), params.get(1));
                break;
            case "mapViewMoveCamera":
                opcode = jformat("_%s_controller.moveCamera(%s, %s);", params.get(0), params.get(1), params.get(2));
                break;
            case "mapViewZoomTo":
                opcode = jformat("_%s_controller.zoomTo(%s);", params.get(0), params.get(1));
                break;
            case "mapViewZoomIn":
                opcode = jformat("_%s_controller.zoomIn();", params.get(0));
                break;
            case "mapViewZoomOut":
                opcode = jformat("_%s_controller.zoomOut();", params.get(0));
                break;
            case "mapViewAddMarker":
                opcode = jformat("_%s_controller.addMarker(%s, %s, %s);", params.get(0), params.get(1), params.get(2), params.get(3));
                break;
            case "mapViewSetMarkerInfo":
                opcode = jformat("_%s_controller.setMarkerInfo(%s, %s, %s);", params.get(0), params.get(1), params.get(2), params.get(3));
                break;
            case "mapViewSetMarkerPosition":
                opcode = jformat("_%s_controller.setMarkerPosition(%s, %s, %s);", params.get(0), params.get(1), params.get(2), params.get(3));
                break;
            case "mapViewSetMarkerColor":
                opcode = jformat("_%s_controller.setMarkerColor(%s, BitmapDescriptorFactory.%s, %s);", params.get(0), params.get(1), params.get(2), params.get(3));
                break;
            case "mapViewSetMarkerIcon":
                name = params.get(2).endsWith(".9") ? params.get(2).jreplaceAll("\\.9", "") : params.get(2);
                opcode = jformat("_%s_controller.setMarkerIcon(%s, R.drawable.%s);", params.get(0), params.get(1), name.toLowerCase());
                break;
            case "mapViewSetMarkerVisible":
                opcode = jformat("_%s_controller.setMarkerVisible(%s, %s);", params.get(0), params.get(1), params.get(2));
                break;
            case "vibratorAction":
                opcode = jformat("%s.vibrate((long)(%s));", params.get(0), params.get(1));
                break;
            case "timerAfter":
                var onRun = (bean.subStack1 >= 0) ? this.a(jstr(bean.subStack1), "") : "";

                opcode = jformat("%s = new TimerTask() {\n@Override\npublic void run() {\nrunOnUiThread(new Runnable() {\n@Override\npublic void run() {\n%s\n}\n});\n}\n};\n_timer.schedule(%s, (int)(%s));", params.get(0), onRun, params.get(0), params.get(1));
                break;
            case "timerEvery":
                onRun = (bean.subStack1 >= 0) ? this.a(jstr(bean.subStack1), "") : "";

                opcode = jformat("%s = new TimerTask() {\n@Override\npublic void run() {\nrunOnUiThread(new Runnable() {\n@Override\npublic void run() {\n%s\n}\n});\n}\n};\n_timer.scheduleAtFixedRate(%s, (int)(%s), (int)(%s));", params.get(0), onRun, params.get(0), params.get(1), params.get(2));
                break;
            case "timerCancel":
                opcode = jformat("%s.cancel();", params.get(0));
                break;
            case "firebaseAdd":
                opcode = jformat("%s.child(%s).updateChildren(%s);", params.get(0), params.get(1), params.get(2));
                break;
            case "firebasePush":
                opcode = jformat("%s.push().updateChildren(%s);", params.get(0), params.get(1));
                break;
            case "firebaseGetPushKey":
                opcode = jformat("%s.push().getKey()", params.get(0));
                break;
            case "firebaseDelete":
                opcode = jformat("%s.child(%s).removeValue();", params.get(0), params.get(1));
                break;
            case "firebaseGetChildren":
                opcode = jformat(`%s.addListenerForSingleValueEvent(new ValueEventListener() {
@Override
public void onDataChange(DataSnapshot _dataSnapshot) {
%s = new ArrayList<>();
try {
GenericTypeIndicator<HashMap<String, Object>> _ind = new GenericTypeIndicator<HashMap<String, Object>>() {};
for (DataSnapshot _data : _dataSnapshot.getChildren()) {
HashMap<String, Object> _map = _data.getValue(_ind);
%s.add(_map);
}
} catch (Exception _e) {
_e.printStackTrace();
}
%s
}
@Override
public void onCancelled(DatabaseError _databaseError) {
}
});`, params.get(0), params.get(1), params.get(1), (bean.subStack1 >= 0) ? this.a(jstr(bean.subStack1), "") : "");
                break;
            case "firebaseauthCreateUser":
                if (!params.get(1).equals("\"\"") && !params.get(2).equals("\"\"")) {
                    opcode = jformat("%s.createUserWithEmailAndPassword(%s, %s).addOnCompleteListener(%s.this, %s);", params.get(0), params.get(1), params.get(2), this.activityName, "_" + params.get(0) + "_create_user_listener");
                }
                break;
            case "firebaseauthSignInUser":
                if (!params.get(1).equals("\"\"") && !params.get(2).equals("\"\"")) {
                    opcode = jformat("%s.signInWithEmailAndPassword(%s, %s).addOnCompleteListener(%s.this, %s);", params.get(0), params.get(1), params.get(2), this.activityName, "_" + params.get(0) + "_sign_in_listener");
                }
                break;
            case "firebaseauthSignInAnonymously":
                opcode = jformat("%s.signInAnonymously().addOnCompleteListener(%s.this, %s);", params.get(0), this.activityName, "_" + params.get(0) + "_sign_in_listener");
                break;
            case "firebaseauthIsLoggedIn":
                opcode = "(FirebaseAuth.getInstance().getCurrentUser() != null)";
                break;
            case "firebaseauthGetCurrentUser":
                opcode = "FirebaseAuth.getInstance().getCurrentUser().getEmail()";
                break;
            case "firebaseauthGetUid":
                opcode = "FirebaseAuth.getInstance().getCurrentUser().getUid()";
                break;
            case "firebaseauthResetPassword":
                if (!params.get(1).equals("\"\"")) {
                    opcode = jformat("%s.sendPasswordResetEmail(%s).addOnCompleteListener(%s);", params.get(0), params.get(1), "_" + params.get(0) + "_reset_password_listener");
                }
                break;
            case "firebaseauthSignOutUser":
                opcode = "FirebaseAuth.getInstance().signOut();";
                break;
            case "firebaseStartListen":
                opcode = jformat("%s.addChildEventListener(_%s_child_listener);", params.get(0), params.get(0));
                break;
            case "firebaseStopListen":
                opcode = jformat("%s.removeEventListener(_%s_child_listener);", params.get(0), params.get(0));
                break;
            case "gyroscopeStartListen":
                opcode = jformat("%s.registerListener(_%s_sensor_listener, %s.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR), SensorManager.SENSOR_DELAY_NORMAL);", params.get(0), params.get(0), params.get(0));
                break;
            case "gyroscopeStopListen":
                opcode = jformat("%s.unregisterListener(_%s_sensor_listener);", params.get(0), params.get(0));
                break;
            case "dialogSetTitle":
                opcode = jformat("%s.setTitle(%s);", params.get(0), params.get(1));
                break;
            case "dialogSetMessage":
                opcode = jformat("%s.setMessage(%s);", params.get(0), params.get(1));
                break;
            case "dialogShow":
                opcode = jformat("%s.create().show();", params.get(0));
                break;
            case "dialogOkButton":
                var onClick = (bean.subStack1 >= 0) ? this.a(jstr(bean.subStack1), "") : "";

                opcode = jformat("%s.setPositiveButton(%s, new DialogInterface.OnClickListener() {\n@Override\npublic void onClick(DialogInterface _dialog, int _which) {\n%s\n}\n});", params.get(0), params.get(1), onClick);
                break;
            case "dialogCancelButton":
                onClick = (bean.subStack1 >= 0) ? this.a(jstr(bean.subStack1), "") : "";

                opcode = jformat("%s.setNegativeButton(%s, new DialogInterface.OnClickListener() {\n@Override\npublic void onClick(DialogInterface _dialog, int _which) {\n%s\n}\n});", params.get(0), params.get(1), onClick);
                break;
            case "dialogNeutralButton":
                onClick = (bean.subStack1 >= 0) ? this.a(jstr(bean.subStack1), "") : "";

                opcode = jformat("%s.setNeutralButton(%s, new DialogInterface.OnClickListener() {\n@Override\npublic void onClick(DialogInterface _dialog, int _which) {\n%s\n}\n});", params.get(0), params.get(1), onClick);
                break;
            case "mediaplayerCreate":
                opcode = jformat("%s = MediaPlayer.create(getApplicationContext(), R.raw.%s);", params.get(0), params.get(1).toLowerCase());
                break;
            case "mediaplayerStart":
                opcode = jformat("%s.start();", params.get(0));
                break;
            case "mediaplayerPause":
                opcode = jformat("%s.pause();", params.get(0));
                break;
            case "mediaplayerSeek":
                opcode = jformat("%s.seekTo((int)(%s));", params.get(0), params.get(1));
                break;
            case "mediaplayerGetCurrent":
                opcode = jformat("%s.getCurrentPosition()", params.get(0));
                break;
            case "mediaplayerGetDuration":
                opcode = jformat("%s.getDuration()", params.get(0));
                break;
            case "mediaplayerReset":
                opcode = jformat("%s.reset();", params.get(0));
                break;
            case "mediaplayerRelease":
                opcode = jformat("%s.release();", params.get(0));

                break;
            case "mediaplayerIsPlaying":
                opcode = jformat("%s.isPlaying()", params.get(0));

                break;
            case "mediaplayerSetLooping":
                opcode = jformat("%s.setLooping(%s);", params.get(0), params.get(1));
                break;
            case "mediaplayerIsLooping":
                opcode = jformat("%s.isLooping()", params.get(0));
                break;
            case "soundpoolCreate":
                opcode = jformat("%s = new SoundPool((int)(%s), AudioManager.STREAM_MUSIC, 0);", params.get(0), params.get(1));
                break;
            case "soundpoolLoad":
                opcode = jformat("%s.load(getApplicationContext(), R.raw.%s, 1);", params.get(0), params.get(1));
                break;
            case "soundpoolStreamPlay":
                opcode = jformat("%s.play((int)(%s), 1.0f, 1.0f, 1, (int)(%s), 1.0f);", params.get(0), params.get(1), params.get(2));

                break;
            case "soundpoolStreamStop":
                opcode = jformat("%s.stop((int)(%s));", params.get(0), params.get(1));
                break;
            case "setThumbResource":
                name = params.get(1).jreplaceAll("\\.9", "");
                opcode = jformat("%s.setThumbResource(R.drawable.%s)", params.get(0), name.toLowerCase());
                break;
            case "setTrackResource":
                name = params.get(1).jreplaceAll("\\.9", "");
                opcode = jformat("%s.setTrackResource(R.drawable.%s)", params.get(0), name.toLowerCase());

                break;
            case "seekBarSetProgress":
                opcode = jformat("%s.setProgress((int)%s);", params.get(0), params.get(1));

                break;
            case "seekBarGetProgress":
                opcode = jformat("%s.getProgress()", params.get(0));

                break;
            case "seekBarSetMax":
                opcode = jformat("%s.setMax((int)%s);", params.get(0), params.get(1));

                break;
            case "seekBarGetMax":
                opcode = jformat("%s.getMax()", params.get(0));

                break;
            case "objectanimatorSetTarget":
                opcode = jformat("%s.setTarget(%s);", params.get(0), params.get(1));

                break;
            case "objectanimatorSetProperty":
                opcode = jformat("%s.setPropertyName(\"%s\");", params.get(0), params.get(1));
                break;
            case "objectanimatorSetValue":
                opcode = jformat("%s.setFloatValues((float)(%s));", params.get(0), params.get(1));
                break;
            case "objectanimatorSetFromTo":
                opcode = jformat("%s.setFloatValues((float)(%s), (float)(%s));", params.get(0), params.get(1), params.get(2));
                break;
            case "objectanimatorSetDuration":
                opcode = jformat("%s.setDuration((int)(%s));", params.get(0), params.get(1));
                break;
            case "objectanimatorSetRepeatMode":
                opcode = jformat("%s.setRepeatMode(ValueAnimator.%s);", params.get(0), params.get(1));

                break;
            case "objectanimatorSetRepeatCount":
                opcode = jformat("%s.setRepeatCount((int)(%s));", params.get(0), params.get(1));
                break;
            case "objectanimatorSetInterpolator":
                var interpolator = (() => { switch (params.get(1)) {
                    case "Accelerate": return "new AccelerateInterpolator()";
                    case "Decelerate": return "new DecelerateInterpolator()";
                    case "AccelerateDeccelerate": return "new AccelerateDecelerateInterpolator()";
                    case "Bounce": return "new BounceInterpolator()";
                    default: return "new LinearInterpolator()";
                } })();
                opcode = jformat("%s.setInterpolator(%s);", params.get(0), interpolator);
                break;
            case "objectanimatorStart":
                opcode = jformat("%s.start();", params.get(0));
                break;
            case "objectanimatorCancel":
                opcode = jformat("%s.cancel();", params.get(0));
                break;
            case "objectanimatorIsRunning":
                opcode = jformat("%s.isRunning()", params.get(0));
                break;
            case "interstitialadCreate":
            case "interstitialadLoadAd":
            case "interstitialadShow":
                opcode = "";
                break;
            case "firebasestorageUploadFile":
                if (!params.get(1).equals("\"\"") && !params.get(2).equals("\"\"")) {
                    opcode = jformat("%s.child(%s).putFile(Uri.fromFile(new File(%s))).addOnFailureListener(_%s_failure_listener).addOnProgressListener(_%s_upload_progress_listener).continueWithTask(new Continuation<UploadTask.TaskSnapshot, Task<Uri>>() {\n@Override\npublic Task<Uri> then(Task<UploadTask.TaskSnapshot> task) throws Exception {\nreturn %s.child(%s).getDownloadUrl();\n}}).addOnCompleteListener(_%s_upload_success_listener);", params.get(0), params.get(2), params.get(1), params.get(0), params.get(0), params.get(0), params.get(2), params.get(0));
                }
                break;
            case "firebasestorageDownloadFile":
                if (!params.get(1).equals("\"\"") && !params.get(2).equals("\"\"")) {
                    opcode = jformat("_firebase_storage.getReferenceFromUrl(%s).getFile(new File(%s)).addOnSuccessListener(_%s_download_success_listener).addOnFailureListener(_%s_failure_listener).addOnProgressListener(_%s_download_progress_listener);", params.get(1), params.get(2), params.get(0), params.get(0), params.get(0));
                }
                break;
            case "firebasestorageDelete":
                if (!params.get(1).equals("\"\"")) {
                    opcode = jformat("_firebase_storage.getReferenceFromUrl(%s).delete().addOnSuccessListener(_%s_delete_success_listener).addOnFailureListener(_%s_failure_listener);", params.get(1), params.get(0), params.get(0));
                }
                break;
            case "fileutilread":

                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("FileUtil.readFile(%s)", params.get(0));
                }
                break;
            case "fileutilwrite":
                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("FileUtil.writeFile(%s, %s);", params.get(1), params.get(0));
                }
                break;
            case "fileutilcopy":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.copyFile(%s, %s);", params.get(0), params.get(1));
                }
                break;
            case "fileutilmove":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.moveFile(%s, %s);", params.get(0), params.get(1));
                }
                break;
            case "fileutildelete":

                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("FileUtil.deleteFile(%s);", params.get(0));
                }
                break;
            case "fileutilisexist":

                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("FileUtil.isExistFile(%s)", params.get(0));
                }
                break;
            case "fileutilmakedir":
                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("FileUtil.makeDir(%s);", params.get(0));
                }
                break;
            case "fileutillistdir":
                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("FileUtil.listDir(%s, %s);", params.get(0), params.get(1));
                }
                break;
            case "fileutilisdir":
                if (!opcode.equals("\"\"")) {
                    opcode = jformat("FileUtil.isDirectory(%s)", params.get(0));
                }
                break;
            case "fileutilisfile":
                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("FileUtil.isFile(%s)", params.get(0));
                }
                break;
            case "fileutillength":

                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("FileUtil.getFileLength(%s)", params.get(0));
                }
                break;
            case "fileutilStartsWith":
                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("%s.startsWith(%s)", params.get(0), params.get(1));
                }
                break;
            case "fileutilEndsWith":
                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("%s.endsWith(%s)", params.get(0), params.get(1));
                }
                break;
            case "fileutilGetLastSegmentPath":
                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("Uri.parse(%s).getLastPathSegment()", params.get(0));
                }
                break;
            case "getExternalStorageDir":
                opcode = "FileUtil.getExternalStorageDir()";
                break;
            case "getPackageDataDir":
                opcode = "FileUtil.getPackageDataDir(getApplicationContext())";
                break;
            case "getPublicDir":
                opcode = jformat("FileUtil.getPublicDir(Environment.%s)", params.get(0));
                break;
            case "resizeBitmapFileRetainRatio":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.resizeBitmapFileRetainRatio(%s, %s, %s);", params.get(0), params.get(1), params.get(2));
                }
                break;
            case "resizeBitmapFileToSquare":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.resizeBitmapFileToSquare(%s, %s, %s);", params.get(0), params.get(1), params.get(2));
                }
                break;
            case "resizeBitmapFileToCircle":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.resizeBitmapFileToCircle(%s, %s);", params.get(0), params.get(1));
                }
                break;
            case "resizeBitmapFileWithRoundedBorder":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.resizeBitmapFileWithRoundedBorder(%s, %s, %s);", params.get(0), params.get(1), params.get(2));
                }
                break;
            case "cropBitmapFileFromCenter":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.cropBitmapFileFromCenter(%s, %s, %s, %s);", params.get(0), params.get(1), params.get(3), params.get(2));
                }
                break;
            case "rotateBitmapFile":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.rotateBitmapFile(%s, %s, %s);", params.get(0), params.get(1), params.get(2));
                }
                break;
            case "scaleBitmapFile":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.scaleBitmapFile(%s, %s, %s, %s);", params.get(0), params.get(1), params.get(2), params.get(3));
                }
                break;
            case "skewBitmapFile":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.skewBitmapFile(%s, %s, %s, %s);", params.get(0), params.get(1), params.get(2), params.get(3));
                }
                break;
            case "setBitmapFileColorFilter":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.setBitmapFileColorFilter(%s, %s, %s);", params.get(0), params.get(1), params.get(2));
                }
                break;
            case "setBitmapFileBrightness":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.setBitmapFileBrightness(%s, %s, %s);", params.get(0), params.get(1), params.get(2));
                }
                break;
            case "setBitmapFileContrast":
                if (!params.get(0).equals("\"\"") && !params.get(1).equals("\"\"")) {
                    opcode = jformat("FileUtil.setBitmapFileContrast(%s, %s, %s);", params.get(0), params.get(1), params.get(2));
                }
                break;
            case "getJpegRotate":
                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("FileUtil.getJpegRotate(%s)", params.get(0));
                }
                break;
            case "filepickerstartpickfiles":
                opcode = jformat("startActivityForResult(%s, REQ_CD_%s);", params.get(0), params.get(0).toUpperCase());
                break;
            case "camerastarttakepicture":
                opcode = jformat("startActivityForResult(%s, REQ_CD_%s);", params.get(0), params.get(0).toUpperCase());
                break;
            case "setImageFilePath":
                if (!params.get(1).equals("\"\"")) {
                    opcode = jformat("%s.setImageBitmap(FileUtil.decodeSampleBitmapFromPath(%s, 1024, 1024));", params.get(0), params.get(1));
                }
                break;
            case "setImageUrl":
                if (!params.get(1).equals("\"\"")) {
                    opcode = jformat("Glide.with(getApplicationContext()).load(Uri.parse(%s)).into(%s);", params.get(1), params.get(0));
                }
                break;
            case "setHint":
                if (!params.get(0).equals("\"\"")) {
                    opcode = jformat("%s.setHint(%s);", params.get(0), params.get(1));
                }
                break;
            case "setHintTextColor":
                if (!params.get(1).equals("\"\"")) {
                    opcode = jformat("%s.setHintTextColor(%s);", params.get(0), params.get(1));
                }
                break;
            case "requestnetworkSetParams":
                opcode = jformat("%s.setParams(%s, RequestNetworkController.%s);", params.get(0), params.get(1), params.get(2));
                break;
            case "requestnetworkSetHeaders":
                opcode = jformat("%s.setHeaders(%s);", params.get(0), params.get(1));
                break;
            case "requestnetworkStartRequestNetwork":
                opcode = jformat("%s.startRequestNetwork(RequestNetworkController.%s, %s, %s, _%s_request_listener);", params.get(0), params.get(1), params.get(2), params.get(3), params.get(0));
                break;
            case "progressBarSetIndeterminate":
                opcode = jformat("%s.setIndeterminate(%s);", params.get(0), params.get(1));
                break;
            case "textToSpeechSetPitch":
                opcode = jformat("%s.setPitch((float)%s);", params.get(0), params.get(1));
                break;
            case "textToSpeechSetSpeechRate":
                opcode = jformat("%s.setSpeechRate((float)%s);", params.get(0), params.get(1));
                break;
            case "textToSpeechSpeak":
                opcode = jformat("%s.speak(%s, TextToSpeech.QUEUE_ADD, null);", params.get(0), params.get(1));
                break;
            case "textToSpeechIsSpeaking":
                opcode = jformat("%s.isSpeaking()", params.get(0));

                break;
            case "textToSpeechStop":
                opcode = jformat("%s.stop();", params.get(0));

                break;
            case "textToSpeechShutdown":
                opcode = jformat("%s.shutdown();", params.get(0));

                break;
            case "speechToTextStartListening":
                opcode = jformat("Intent _intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);\n_intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());\n_intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);\n_intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());\n%s.startListening(_intent);", params.get(0));

                break;
            case "speechToTextStopListening":
                opcode = jformat("%s.stopListening();", params.get(0));
                break;
            case "speechToTextShutdown":
                opcode = jformat("%s.cancel();\n%s.destroy();", params.get(0), params.get(0));
                break;
            case "bluetoothConnectReadyConnection":
                opcode = jformat("%s.readyConnection(_%s_bluetooth_connection_listener, %s);", params.get(0), params.get(0), params.get(1));
                break;
            case "bluetoothConnectReadyConnectionToUuid":
                opcode = jformat("%s.readyConnection(_%s_bluetooth_connection_listener, %s, %s);", params.get(0), params.get(0), params.get(1), params.get(2));
                break;
            case "bluetoothConnectStartConnection":
                opcode = jformat("%s.startConnection(_%s_bluetooth_connection_listener, %s, %s);", params.get(0), params.get(0), params.get(1), params.get(2));
                break;
            case "bluetoothConnectStartConnectionToUuid":
                opcode = jformat("%s.startConnection(_%s_bluetooth_connection_listener, %s, %s, %s);", params.get(0), params.get(0), params.get(1), params.get(2), params.get(3));
                break;
            case "bluetoothConnectStopConnection":
                opcode = jformat("%s.stopConnection(_%s_bluetooth_connection_listener, %s);", params.get(0), params.get(0), params.get(1));
                break;
            case "bluetoothConnectSendData":
                opcode = jformat("%s.sendData(_%s_bluetooth_connection_listener, %s, %s);", params.get(0), params.get(0), params.get(1), params.get(2));
                break;
            case "bluetoothConnectIsBluetoothEnabled":
                opcode = jformat("%s.isBluetoothEnabled()", params.get(0));
                break;
            case "bluetoothConnectIsBluetoothActivated":
                opcode = jformat("%s.isBluetoothActivated()", params.get(0));
                break;
            case "bluetoothConnectActivateBluetooth":
                opcode = jformat("%s.activateBluetooth();", params.get(0));

                break;
            case "bluetoothConnectGetPairedDevices":
                opcode = jformat("%s.getPairedDevices(%s);", params.get(0), params.get(1));

                break;
            case "bluetoothConnectGetRandomUuid":
                opcode = params.get(0) + ".getRandomUUID()";

                break;

            case "locationManagerRequestLocationUpdates":
                var locationRequest = "%s.requestLocationUpdates(LocationManager.%s, %s, %s, _%s_location_listener);";
                if (this.buildConfig.g) {
                    opcode = jformat("if (ContextCompat.checkSelfPermission(%s.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {\n" + locationRequest + "\n}", this.activityName, params.get(0), params.get(1), params.get(2), params.get(3), params.get(0));
                } else {
                    opcode = jformat("if (Build.VERSION.SDK_INT >= 23) {\nif (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {\n" + locationRequest + "\n}\n}\nelse {\n" + locationRequest + "\n}", params.get(0), params.get(1), params.get(2), params.get(3), params.get(0), params.get(0), params.get(1), params.get(2), params.get(3), params.get(0));
                }
                break;

            case "locationManagerRemoveUpdates":
                opcode = params.get(0) + ".removeUpdates(_" + params.get(0) + "_location_listener);";
                break;

            case "fabIcon":
                name = params.get(0).jreplaceAll("\\.9", "");
                opcode = jformat("%s.setImageResource(R.drawable.%s);", this.isViewBindingEnabled ? "binding.Fab" : "_fab", name);
                break;

            case "fabSize":
                opcode = jformat("%s.setSize(FloatingActionButton.SIZE_%s);", this.isViewBindingEnabled ? "binding.Fab" : "_fab", params.get(0));
                break;

            case "fabVisibility":
                opcode = jformat("%s.%s();", this.isViewBindingEnabled ? "binding.Fab" : "_fab", params.get(0));
                break;

            default:
                opcode = this.getCodeExtraBlock(bean, "\"\"");
        }
        
        /*
          switch block above should be responsible for handling %m param.
          However, upon decompiling this class, it completely ignore this case.
          This is the solution for now to prevent errors during code generation.
         */
        if (this.hasEmptySelectorParam(params, bean.spec)) {
            opcode = "";
        }
        return opcode;
    }
  getCodeExtraBlock(blockBean: any, var2: string): string {
        let parameters = [];
        let paramsTypes = this.extractParamsTypes(blockBean.spec);

        for (let i = 0; i < blockBean.parameters.size(); i++) {
            let parameterValue = this.getParamValue(blockBean.parameters.get(i), paramsTypes.get(i));

            switch (this.getBlockType(blockBean, i)) {
                case 0:
                    if (parameterValue.isEmpty()) {
                        parameters.add("true");
                    } else {
                        parameters.add(this.a(parameterValue, this.getBlockType(blockBean, i), blockBean.opCode));
                    }
                    break;

                case 1:
                    if (parameterValue.isEmpty()) {
                        parameters.add("0");
                    } else {
                        parameters.add(this.a(parameterValue, this.getBlockType(blockBean, i), blockBean.opCode));
                    }
                    break;

                case 2:
                    if (parameterValue.isEmpty()) {
                        parameters.add("\"\"");
                    } else {
                        parameters.add(this.a(parameterValue, this.getBlockType(blockBean, i), blockBean.opCode));
                    }
                    break;

                default:
                    if (parameterValue.isEmpty()) {
                        parameters.add("");
                    } else {
                        parameters.add(this.a(parameterValue, this.getBlockType(blockBean, i), blockBean.opCode));
                    }
            }
        }

        if (blockBean.subStack1 >= 0) {
            parameters.add(this.a(jstr(blockBean.subStack1), var2));
        } else {
            parameters.add(" ");
        }

        if (blockBean.subStack2 >= 0) {
            parameters.add(this.a(jstr(blockBean.subStack2), var2));
        } else {
            parameters.add(" ");
        }

        let blockInfo = BlockLoader.getBlockInfo(blockBean.opCode);

        if (blockInfo.isMissing) {
            blockInfo = BlockLoader.getBlockFromProject(this.buildConfig.sc_id, blockBean.opCode);
        }

        let formattedCode;
        if (!parameters.isEmpty()) {
            try {
                formattedCode = jformat(blockInfo.getCode(), parameters.toArray(jnewArray(0, null)));
            } catch (e: any) {
                formattedCode = "/* Failed to resolve Custom Block's code: " + e + " */";
            }
        } else {
            formattedCode = blockInfo.getCode();
        }

        return formattedCode;
    }
  getBlockType(blockBean: any, parameterIndex: number): number {
        let blockType;

        let paramClassInfo = blockBean.getParamClassInfo().get(parameterIndex);

        if (paramClassInfo.b("boolean")) {
            blockType = 0;
        } else if (paramClassInfo.b("double")) {
            blockType = 1;
        } else if (paramClassInfo.b("String")) {
            blockType = 2;
        } else {
            blockType = 3;
        }

        return blockType;
    }
  a(...args: any[]): any {
    if (args.length === 3 && (args[0] == null || typeof args[0] === 'string') && typeof args[1] === 'number' && (args[2] == null || typeof args[2] === 'string')) return this.a_String_int_String.apply(this, args as any);
    if (args.length === 2 && (args[0] == null || typeof args[0] === 'string') && (args[1] == null || typeof args[1] === 'string')) return this.a_String_String.apply(this, args as any);
    if (args.length === 0) return this.a_0.apply(this, args as any);
    throw new Error('no overload of a for ' + args.length);
  }
}