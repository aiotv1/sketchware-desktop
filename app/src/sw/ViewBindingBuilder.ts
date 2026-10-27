// Port of mod/pranav/viewbinding/ViewBindingBuilder.kt (generates *Binding.java classes from layout XML).
import { JFile, FileUtil } from './env';

interface BView {
  type: string;
  fullType: string;
  id: string;
  isInclude: boolean;
  name: string;
}

function bview(type: string, fullType: string, id: string, isInclude = false): BView {
  return { type, fullType, id, isInclude, name: ViewBindingBuilder.generateParameterFromId(id) };
}

const cap = (s: string) => (s.length ? s.charAt(0).toUpperCase() + s.substring(1) : s);

export class ViewBindingBuilder {
  constructor(private inputFiles: any[], private outputDir: any, private packageName = 'dev.pranav.viewbinding') {}

  static generateParameterFromId(id: string): string {
    if (!id.includes('_')) return id;
    const i = id.indexOf('_');
    return id.substring(0, i) + id.substring(i + 1).split('_').map(cap).join('');
  }

  static generateFileNameForLayout(layoutName: string): string {
    return layoutName.split('_').map(cap).join('') + 'Binding';
  }

  generateBindingForLayout(layoutFile: any): string {
    const path = layoutFile instanceof JFile ? layoutFile.path : String(layoutFile);
    const fileName = path.substring(path.replace(/\\/g, '/').lastIndexOf('/') + 1).replace(/\.xml$/, '');
    return this.generateBindingForXml(FileUtil.readFile(path), fileName);
  }

  generateBindingForXml(xml: string, layoutName: string): string {
    const name = ViewBindingBuilder.generateFileNameForLayout(layoutName);
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const root = doc.documentElement;
    const rootView = bview(
      root.nodeName.substring(root.nodeName.lastIndexOf('.') + 1),
      root.nodeName.includes('.') ? root.nodeName : 'android.widget.' + root.nodeName,
      (root.getAttribute('android:id') ?? '').replace(/^.*\//, '') || 'rootView',
    );
    const parsed: BView[] = [];
    this.parseNode(root, parsed);
    const ordered = [...parsed.filter((v) => !v.isInclude), ...parsed.filter((v) => v.isInclude)];
    const views = ordered.length && ordered[0].id === rootView.id && ordered[0].type === rootView.type ? ordered.slice(1) : ordered;

    const fields = views.map((v) => `    public final ${v.type} ${v.name};`).join('\n');
    const assigns = views.map((v) => `        this.${v.name} = ${v.name};`).join('\n');
    const params = views.length ? ', ' + views.map((v) => `${v.type} ${v.name}`).join(', ') : '';
    let bindBody = '';
    if (views.length) {
      bindBody =
        views
          .filter((v) => !v.isInclude)
          .map((v) => `        ${v.type} ${v.name} = findChildViewById(view, R.id.${v.id});`)
          .join('\n') +
        '\n' +
        views
          .filter((v) => v.isInclude)
          .map((v) => `        ${v.type} ${v.name} = ${v.fullType}.bind(findChildViewById(view, R.id.${v.id}));`)
          .join('\n') +
        `\n        if (${views.map((v) => `${v.name} == null`).join(' || ')}) {\n             throw new IllegalStateException("Required views are missing");\n        }`;
    }
    return `// Generated file. Do not modify.
package ${this.packageName}.databinding;

import ${this.packageName}.R;
${this.generateImports(views, rootView)}

public final class ${name} {
    public final ${rootView.type} ${rootView.name};
${fields}

    private ${name}(${rootView.type} ${rootView.name}${params}) {
        this.${rootView.name} = ${rootView.name};
${assigns}
    }

    public ${rootView.type} getRoot() {
        return ${rootView.name};
    }

    public static ${name} inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static ${name} inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.${layoutName}, parent, false);
        if (attachToParent) parent.addView(root);
        return bind(root);
    }

    public static ${name} bind(View view) {
        ${rootView.type} ${rootView.name} = (${rootView.type}) view;
${bindBody}

        return new ${name}(${rootView.name}${views.length ? ', ' + views.map((v) => v.name).join(', ') : ''});
    }

    private static <T extends View> T findChildViewById(View rootView, int id) {
         if (rootView instanceof ViewGroup) {
              ViewGroup rootViewGroup = (ViewGroup) rootView;
              for (int i = 0; i < rootViewGroup.getChildCount(); i++) {
                   T view = rootViewGroup.getChildAt(i).findViewById(id);
                   if (view != null) return view;
              }
         }
         return null;
    }
}`;
  }

  private generateImports(views: BView[], rootView: BView): string {
    const seen = new Set<string>();
    const imports = new Set([
      'import android.view.View;',
      'import android.view.LayoutInflater;',
      'import android.view.ViewGroup;',
      `import ${rootView.fullType};`,
    ]);
    for (const v of views) {
      if (v.type === 'View' || v.type === 'ViewGroup' || seen.has(v.fullType)) continue;
      seen.add(v.fullType);
      imports.add(v.fullType === 'android.widget.WebView' ? 'import android.webkit.WebView;' : `import ${v.fullType};`);
    }
    return [...imports].sort().join('\n');
  }

  private parseNode(node: Element, views: BView[]) {
    const id = node.getAttribute('android:id');
    if (id != null) {
      if (node.nodeName === 'include') {
        const layout = (node.getAttribute('layout') ?? '').replace(/^.*\//, '');
        if (layout) {
          const n = ViewBindingBuilder.generateFileNameForLayout(layout);
          views.push(bview(n, this.packageName + '.' + n, id.replace(/^.*\//, ''), true));
        }
      } else {
        views.push(
          bview(
            node.nodeName.substring(node.nodeName.lastIndexOf('.') + 1),
            node.nodeName.includes('.') ? node.nodeName : 'android.widget.' + node.nodeName,
            id.replace(/^.*\//, ''),
          ),
        );
      }
    }
    for (const c of Array.from(node.children)) this.parseNode(c, views);
  }
}
