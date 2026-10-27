// Auto-ported from CustomVariableUtil.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: java.util.regex.Matcher, java.util.regex.Pattern
// <imports>
import { Pattern } from './env';
// </imports>
export class CustomVariableUtil {
  static PATTERN_CUSTOM_VARIABLE: any = Pattern.compile(
            "\\b((private|public|protected|static|final|transient|volatile)\\s+)*"
                    + "([\\w$]+(?:\\s*,\\s*[\\w$]+)*"
                    + "(?:\\s*<[a-zA-Z0-9.,_ ?<>\\[\\]]*>)?"
                    + "(?:\\[\\])*)?\\s+"
                    + "([\\w$]+)"
                    + "(?:\\s*=\\s*([^;]+))?\\s*"
    );
  static VARIABLE_TYPE: number = 3;
  static VARIABLE_NAME: number = 4;
  static VARIABLE_INITIALIZER: number = 5;
  static getVariableModifier(input: string): string {
        let matcher = CustomVariableUtil.getMatcher(input);
        if (matcher.find()) {
            let variableType = matcher.group(CustomVariableUtil.VARIABLE_TYPE);
            if (variableType != null) {
                let equalIndex = input.indexOf(variableType);
                let varLength = variableType.length;
                if (equalIndex != -1) {
                    return input.substring(0, equalIndex).trim();
                }
            }
        }
        return null;
    }
  static getVariableType(input: string): string {
        let matcher = CustomVariableUtil.getMatcher(input);
        if (matcher.find()) {
            return CustomVariableUtil.removeSpaces(matcher.group(CustomVariableUtil.VARIABLE_TYPE));
        }
        return null;
    }
  static getVariableName(input: string): string {
        let matcher = CustomVariableUtil.getMatcher(input);
        if (matcher.find()) {
            return matcher.group(CustomVariableUtil.VARIABLE_NAME);
        }
        return null;
    }
  static getVariableInitializer(input: string): string {
        let matcher = CustomVariableUtil.getMatcher(input);
        if (matcher.find()) {
            return matcher.group(CustomVariableUtil.VARIABLE_INITIALIZER);
        }
        return null;
    }
  static getMatcher(input: string): any {
        return CustomVariableUtil.PATTERN_CUSTOM_VARIABLE.matcher(input);
    }
  static removeSpaces(variableType: string): string {
        return variableType.jreplaceAll("\\s", "");
    }
}