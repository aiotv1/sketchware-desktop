// Auto-ported from XmlBuilderHelper.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: java.util.HashMap
// <imports>
import { jstr, JMap } from '../codegen/jshim';
import { XmlBuilder } from './XmlBuilder';
// </imports>
export class XmlBuilderHelper {
  rootBuilder: any = new XmlBuilder("resources");
  styleBuilders: any = new JMap();
  toCode(): string {
        return this.rootBuilder.toCode();
    }
  addInteger(name: string, value: number): void {
        let integerBuilder = new XmlBuilder("integer", true);
        integerBuilder.addAttribute("", "name", name);
        integerBuilder.setNodeValue(jstr(value));
        this.rootBuilder.addChildNode(integerBuilder);
    }
  addColor(name: string, value: string): void {
        let colorBuilder = new XmlBuilder("color", true);
        colorBuilder.addAttribute("", "name", name);
        colorBuilder.setNodeValue(value);
        this.rootBuilder.addChildNode(colorBuilder);
    }
  addItemToStyle(styleName: string, itemName: string, itemValue: string): void {
        let styleBuilder = this.styleBuilders.get(styleName);
        if (styleBuilder != null) {
            let itemBuilder = new XmlBuilder("item", true);
            itemBuilder.addAttribute("", "name", itemName);
            itemBuilder.setNodeValue(itemValue);
            styleBuilder.addChildNode(itemBuilder);
        }
    }
  addString(name: string, value: string, isTranslatable: boolean): void {
        let stringBuilder = new XmlBuilder("string", true);
        stringBuilder.addAttribute("", "name", name);
        if (!isTranslatable) {
            stringBuilder.addAttribute("", "translatable", "false");
        }

        let trimmedValue = value.trim();
        value = trimmedValue;
        if (!trimmedValue.isEmpty()) {
            name = trimmedValue;
            if (trimmedValue.charAt(0) == '"') {
                name = trimmedValue.substring(1);
            }

            value = name;
            if (name.charAt(name.length - 1) == '"') {
                value = name.substring(0, name.length - 1);
            }
        }

        stringBuilder.setNodeValue(value);
        this.rootBuilder.addChildNode(stringBuilder);
    }
  addNonTranslatableString(name: string, value: string): void {
        this.addString(name, value, false);
    }
  addStyle(styleName: string, parentStyleName: string): void {
        let styleBuilder = new XmlBuilder("style", true);
        styleBuilder.addAttribute("", "name", styleName);
        if (parentStyleName != null && !parentStyleName.isEmpty()) {
            styleBuilder.addAttribute("", "parent", parentStyleName);
        }

        this.rootBuilder.addChildNode(styleBuilder);
        this.styleBuilders.put(styleName, styleBuilder);
    }
}