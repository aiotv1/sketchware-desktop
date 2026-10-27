// Auto-ported from IdGenerator.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: 
// <imports>
// </imports>
export class IdGenerator {
  static getLastPath(str: string): string {
        if (!str.contains(".")) {
            return str;
        }

        let split = str.jsplit("\\.");
        return split[split.length - 1];
    }
}