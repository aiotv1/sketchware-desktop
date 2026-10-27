// Auto-ported from ReturnMoreblockManager.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.util.Pair, com.besome.sketch.editor.LogicEditorActivity, com.google.android.material.chip.ChipGroup, java.util.Iterator, pro.sketchware.R
// <imports>
// </imports>
export class ReturnMoreblockManager {
  static getLogicEditorTitle(str: string): string {
        return str.jreplaceAll("\\[.*]", " (returns " + ReturnMoreblockManager.getMbTypeList(str) + ")");
    }
  static getMbEnd(str: string): string {
        if (str.equals(" ")) {
            return ";";
        } else {
            return "";
        }
    }
  static getMbName(str: string): string {
        let name = str;

        if (str.contains("[") && str.contains("]")) {
            name = str.jreplaceAll("\\[.*]", "");
        }

        return name;
    }
  static getMbType(str: string): string {
        try {
            if (!str.contains("]") || !str.contains("[")) return "void";

            return str.substring(str.indexOf("[") + 1, str.lastIndexOf("]"));
        } catch (e: any) {
            return "void";
        }
    }
  static getMbTypeList(str: string): string {
        try {
            if (!str.contains("]") || !str.contains("["))
                return "void";

            let substring = str.substring(str.indexOf("[") + 1, str.lastIndexOf("]"));
            if (substring.contains("|")) {
                substring = substring.jsplit("\\|")[1];
            }

            return substring;
        } catch (e: any) {
            return "void";
        }
    }
  static getMbTypeCode(str: string): string {
        try {
            if (!str.contains("]") || !str.contains("[")) return "void";

            let substring = str.substring(str.indexOf("[") + 1, str.lastIndexOf("]"));
            if (substring.contains("|")) {
                let split = substring.jsplit("\\|");

                if (substring.equals("a|Map")) {
                    substring = "HashMap<String, Object>";

                } else if (substring.equals("l|List String")) {
                    substring = "ArrayList<String>";

                } else if (substring.equals("l|List Map")) {
                    substring = "ArrayList<HashMap<String, Object>>";

                } else if (split.length == 2) {
                    substring = split[1];

                } else if (split.length == 3) {
                    substring = split[2];
                }
            }

            return substring;
        } catch (e: any) {
            return "void";
        }
    }
  static getMoreblockChar(str: string): string {
        let moreBlockChar;
        let mbType = ReturnMoreblockManager.getMbType(str);

        if (mbType.equals("void")) {
            moreBlockChar = " ";
        } else if (mbType.equals("String")) {
            moreBlockChar = "s";
        } else if (mbType.equals("double")) {
            moreBlockChar = "d";
        } else if (mbType.equals("boolean")) {
            moreBlockChar = "b";
        } else if (mbType.contains("|")) {
            return mbType;
        } else {
            moreBlockChar = " ";
        }

        return moreBlockChar;
    }
  static getMoreblockType(spec: string): string {
        let type = ReturnMoreblockManager.getMoreblockChar(spec);
        if (!type.contains("|")) return type;
        let splits = type.jsplit("\\|");
        return splits[0];
    }
  static injectMbType(str: string, str2: string, str3: string): string {
        let str4 = str;

        if (!str3.equals(" ")) {
            if (str3.contains("|")) {
                str4 = ReturnMoreblockManager.injectToMbName(str4, str2, str3);

            } else if (str3.equals("s")) {
                str4 = ReturnMoreblockManager.injectToMbName(str4, str2, "String");

            } else if (str3.equals("d")) {
                str4 = ReturnMoreblockManager.injectToMbName(str4, str2, "double");

            } else if (str3.equals("b")) {
                str4 = ReturnMoreblockManager.injectToMbName(str4, str2, "boolean");
            }
        }

        return str4;

    }
  static injectToMbName(str: string, str2: string, str3: string): string {
        let replaceFirst;

        if (str.equals(str2)) {
            replaceFirst = str + "[" + str3 + "]";
        } else {
            replaceFirst = str.jreplaceFirst(str2, str2 + "[" + str3 + "]");
        }

        return replaceFirst;
    }
  static getPreviewType(str: string): string {
        if (str.contains("|")) return "a";

        return str;
    }
  static getMbNameWithTypeFromSpec(spec: string): string {
        if (spec.contains("[") && spec.contains("]")) {
            return spec.substring(0, spec.lastIndexOf("]") + 1);
        } else {
            let name = spec;

            if (spec.contains(" ")) {
                name = name.substring(0, name.indexOf(" "));
            }

            return name;
        }
    }
}