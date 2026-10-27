// Auto-ported from InjectRootLayoutManager.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.util.Pair, com.besome.sketch.beans.ViewBean, com.google.gson.Gson, com.google.gson.annotations.SerializedName, com.google.gson.reflect.TypeToken, java.util.LinkedHashMap, java.util.Map, a.a.a.wq, pro.sketchware.tools.ViewBeanFactory, pro.sketchware.tools.ViewBeanParser, pro.sketchware.utility.FileUtil
// <imports>
import { JMap } from '../codegen/jshim';
import { ViewBean } from '../core/beans';
import { ViewBeanParser } from './ViewBeans';
import { FileUtil, Gson } from './env';
import { wq } from './wq';
// </imports>
export class InjectRootLayoutManager_Root {
  className: string;
  attrs: any;
  init_0() {
        }
  init_String_Map(className: string, attrs: any) {
            this.className = className;
            this.attrs = attrs;
        }
  getClassName(): string {
            return this.className;
        }
  getAttributes(): any {
            return this.attrs;
        }
  constructor(...args: any[]) { this.__ctor(...args); }
  __ctor(...args: any[]) {
    if (args.length === 2 && (args[0] == null || typeof args[0] === 'string')) { this.init_String_Map.apply(this, args as any); return; }
    if (args.length === 0) { this.init_0.apply(this, args as any); return; }
    
  }
}
export class InjectRootLayoutManager {
  path: string;
  constructor(sc_id: string) {
        this.path = wq.b(sc_id) + "/view_root";
    }
  static getDefaultRootLayout(): any {
        let attrs = new JMap();
        attrs.put("android:layout_width", "match_parent");
        attrs.put("android:layout_height", "match_parent");
        attrs.put("android:orientation", "vertical");
        return new InjectRootLayoutManager_Root("LinearLayout", attrs);
    }
  static toRoot(root: any): any {
        return new InjectRootLayoutManager_Root(root.first, root.second);
    }
  set(name: string, layout: any): void {
        let data = this.get();
        if (data == null) {
            data = new JMap();
        }
        data.put(name, layout);
        this.save(data);
    }
  save(data: any): void {
        FileUtil.writeFile(this.path, new Gson().toJson(data));
    }
  getLayoutByFileName(name: string): any {
        return this.get().getOrDefault(name, InjectRootLayoutManager.getDefaultRootLayout());
    }
  get(): any {
        if (FileUtil.isExistFile(this.path)) {
            return new Gson()
                    .fromJson(
                            FileUtil.readFile(this.path),
                            null);
        }
        return new JMap();
    }
  toBean(name: string): any {
        let root = this.getLayoutByFileName(name);
        let viewBean = new ViewBean("root", ViewBeanParser.getViewTypeByClassName(root.className));
        viewBean.convert = root.className;
        
        return viewBean;
    }
  static Root = InjectRootLayoutManager_Root;
}