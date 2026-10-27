// Auto-ported from XmlBuilder.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: java.util.ArrayList, a.a.a.Jx
// <imports>
import { jiter, StringBuilder } from '../codegen/jshim';
import { Jx } from './Jx';
// </imports>
export class XmlBuilder_AttributeBuilder {
  value: string;
  namespace: string;
  attr: string;
  init_String_String_String(namespace: string, attr: string, value: string) {
            this.namespace = namespace;
            this.attr = attr;
            this.value = value;
        }
  init_String(value: string) {
            this.value = value;
        }
  toCode(g: string): string {
            if (this.namespace != null && !this.namespace.isEmpty()) {
                return this.namespace + ":" + this.attr + "=" + "\"" + this.value + "\"";
            } else if (this.attr == null || this.attr.length <= 0) {
                return g != null ? this.value.jreplaceAll("\n", g) : this.value;
            } else {
                return this.attr + "=" + "\"" + this.value + "\"";
            }
        }
  constructor(...args: any[]) { this.__ctor(...args); }
  __ctor(...args: any[]) {
    if (args.length === 3 && (args[0] == null || typeof args[0] === 'string') && (args[1] == null || typeof args[1] === 'string') && (args[2] == null || typeof args[2] === 'string')) { this.init_String_String_String.apply(this, args as any); return; }
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) { this.init_String.apply(this, args as any); return; }
    
  }
}
export class XmlBuilder {
  childNodes: any;
  d: boolean;
  rootElementName: string;
  attributes: any;
  g: string;
  indentationLevel: number;
  nodeValue: string;
  init_String(rootElementName: string) {
        this.__ctor(rootElementName, false);
    }
  init_String_boolean(rootElementName: string, z: boolean) {
        this.d = z;
        this.rootElementName = rootElementName;
        this.indentationLevel = 0;
        this.attributes = [];
        this.childNodes = [];
    }
  addZeroIndent(): string {
        return this.addIndent(0);
    }
  addIndent(indentSize: number): string {
        let str = new StringBuilder();
        for (let i = 0; i < this.indentationLevel + indentSize; i++) {
            str.append("\t");
        }
        return str.toString();
    }
  addNamespaceDeclaration(position: number, namespace: string, attr: string, value: string): void {
        this.attributes.add(position, new XmlBuilder_AttributeBuilder(namespace, attr, value));
    }
  addChildNode(xmlBuilder: any): void {
        xmlBuilder.b(this.indentationLevel + 1);
        this.childNodes.add(xmlBuilder);
    }
  setNodeValue(value: string): void {
        this.nodeValue = value;
    }
  addAttribute(namespace: string, attr: string, value: string): void {
        this.attributes.add(new XmlBuilder_AttributeBuilder(namespace, attr, value));
    }
  addAttributeValue(value: string): void {
        this.attributes.add(new XmlBuilder_AttributeBuilder(value));
    }
  toCode(): string {
        let resultCode = new StringBuilder();
        resultCode.append(this.addZeroIndent());
        resultCode.append("<");
        resultCode.append(this.rootElementName);
        for (const attr of jiter(this.attributes)) {
            if (this.attributes.size() <= 1 || this.d) {
                resultCode.append(" ");
            } else {
                resultCode.append("\r\n");
                resultCode.append(this.addIndent(1));
                this.g = "\r\n" + this.addIndent(1);
            }
            resultCode.append(attr.toCode(this.g));
        }
        if (this.childNodes.size() <= 0) {
            if (this.nodeValue == null || this.nodeValue.length <= 0) {
                resultCode.append(" />");
            } else {
                resultCode.append(">");
                resultCode.append(this.nodeValue);
                resultCode.append("</");
                resultCode.append(this.rootElementName);
                resultCode.append(">");
            }
        } else {
            resultCode.append(">");
            resultCode.append("\r\n");
            for (const xmlBuilder of jiter(this.childNodes)) {
                resultCode.append(xmlBuilder.toCode());
            }
            resultCode.append(this.addZeroIndent());
            resultCode.append("</");
            resultCode.append(this.rootElementName);
            resultCode.append(">");
        }
        resultCode.append("\r\n");
        return resultCode.toString();
    }
  c(): string {
        return Jx.WIDGET_NAME_PATTERN.matcher(this.rootElementName).jreplaceAll("");
    }
  b(indentSize: number): void {
        this.indentationLevel = indentSize;
        if (this.childNodes != null) {
            for (const nx of jiter(this.childNodes)) {
                nx.b(indentSize + 1);
            }
        }
    }
  static AttributeBuilder = XmlBuilder_AttributeBuilder;
  constructor(...args: any[]) { this.__ctor(...args); }
  __ctor(...args: any[]) {
    if (args.length === 2 && (args[0] == null || typeof args[0] === 'string') && typeof args[1] === 'boolean') { this.init_String_boolean.apply(this, args as any); return; }
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) { this.init_String.apply(this, args as any); return; }
    
  }
}