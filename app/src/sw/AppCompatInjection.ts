// Auto-ported from AppCompatInjection.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.os.Environment, com.besome.sketch.beans.ProjectFileBean, com.google.gson.Gson, java.io.File, java.util.HashMap, java.util.Iterator, java.util.LinkedList, java.util.List, java.util.Map, java.util.Objects, a.a.a.jq, mod.hey.studios.util.Helper, pro.sketchware.utility.FileUtil, pro.sketchware.xml.XmlBuilder
// <imports>
import { jiter, JMap } from '../codegen/jshim';
import { ProjectFileBean } from '../core/beans';
import { Environment, FileUtil, Gson, Helper, JFile } from './env';
import { jq } from './jq';
// </imports>
export class AppCompatInjection {
  static INJECTIONS: any = new JMap();
  sc_id: string;
  projectFile: any;
  constructor(jq: any, projectFileBean: any) {
        this.sc_id = jq.sc_id;
        this.projectFile = projectFileBean;
    }
  static getDefaultActivityInjections(): string {
        return "[{\"type\":\"toolbar\",\"value\":\"android:layout_width=\\\"match_parent\\\"\"},{\"type\":\"toolbar\",\"value\":\"android:layout_height=\\\"?attr/actionBarSize\\\"\"},{\"type\":\"toolbar\",\"value\":\"android:background=\\\"?attr/colorPrimary\\\"\"},{\"type\":\"toolbar\",\"value\":\"app:popupTheme=\\\"@style/AppTheme.PopupOverlay\\\"\"},{\"type\":\"appbarlayout\",\"value\":\"android:layout_width=\\\"match_parent\\\"\"},{\"type\":\"appbarlayout\",\"value\":\"android:layout_height=\\\"wrap_content\\\"\"},{\"type\":\"appbarlayout\",\"value\":\"android:theme=\\\"@style/AppTheme.AppBarOverlay\\\"\"},{\"type\":\"coordinatorlayout\",\"value\":\"android:layout_width=\\\"match_parent\\\"\"},{\"type\":\"coordinatorlayout\",\"value\":\"android:layout_height=\\\"match_parent\\\"\"},{\"type\":\"drawerlayout\",\"value\":\"android:layout_width=\\\"match_parent\\\"\"},{\"type\":\"drawerlayout\",\"value\":\"android:layout_height=\\\"match_parent\\\"\"},{\"type\":\"drawerlayout\",\"value\":\"tools:openDrawer=\\\"start\\\"\"},{\"type\":\"navigationdrawer\",\"value\":\"android:layout_width=\\\"320dp\\\"\"},{\"type\":\"navigationdrawer\",\"value\":\"android:layout_height=\\\"match_parent\\\"\"},{\"type\":\"navigationdrawer\",\"value\":\"android:layout_gravity=\\\"start\\\"\"},{\"type\":\"navigationdrawer\",\"value\":\"android:background=\\\"#EEEEEE\\\"\"}]";
    }
  static readAppCompatInjections(sc_id: string, activityFilename: string): any {
        let toParse;

        let injectionFile = new JFile(Environment.getExternalStorageDirectory(),
                ".sketchware/data/" + sc_id + "/injection/appcompat/" + activityFilename);
        let fileContent;
        if (injectionFile.exists() && !(fileContent = FileUtil.readFile(injectionFile.getAbsolutePath())).isEmpty()) {
            toParse = fileContent;
        } else {
            toParse = AppCompatInjection.getDefaultActivityInjections();
        }

        return new Gson().fromJson(toParse, Helper.TYPE_MAP_LIST);
    }
  static refreshInjections(): void {
        for (const project of jiter(AppCompatInjection.INJECTIONS.entrySet())) {
            let projectInjections = project.getValue();

            let activityFilenames = [];
            for (let iterator = (projectInjections).keySet().iterator(); iterator.hasNext(); iterator.remove()) {
                activityFilenames.add(iterator.next());
            }

            for (const activityFilename of jiter(activityFilenames)) {
                projectInjections.put(activityFilename, AppCompatInjection.readAppCompatInjections(project.getKey(), activityFilename));
            }
        }
    }
  inject(nx: any, str: string): void {
        if (this.projectFile.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR) ||
                this.projectFile.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER) ||
                this.projectFile.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FAB)) {
            if (!AppCompatInjection.INJECTIONS.containsKey(this.sc_id)) {
                AppCompatInjection.INJECTIONS.put(this.sc_id, new JMap());
            }
            let projectInjections = AppCompatInjection.INJECTIONS.get(this.sc_id);
            if (!(projectInjections).containsKey(this.projectFile.fileName)) {
                projectInjections.put(this.projectFile.fileName, AppCompatInjection.readAppCompatInjections(this.sc_id, this.projectFile.fileName));
            }

            for (const injection of jiter((projectInjections.get(this.projectFile.fileName)))) {
                let value;
                if (str.toLowerCase().equals(injection.get("type")) && typeof (value = injection.get("value")) === 'string') {
                    nx.addAttributeValue(value);
                }
            }
        }
    }
}