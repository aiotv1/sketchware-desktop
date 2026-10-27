// Custom widgets of the "Create a widget" tool (pro.sketchware.widgets.WidgetsCreatorManager / IconCustomWidget).
// <workspace>/resources/widgets/widgets.json = [{Class, title, name, inject, type, position}]
//   Class = palette category, title = palette label, name = class used for the view (convert), type = base view type.
import { host, joinPath } from '../../core/host';
import { ViewBean } from '../../core/beans';
import { workspace } from '../appstate';
import { viewTypeByName } from '../../sw/viewtypes';

export interface CustomWidget {
  Class: string;
  title: string;
  name: string;
  inject: string;
  type: number;
  position?: number;
}

/** Categories offered by the creator; anything else becomes its own palette section. */
export const MAIN_CATEGORIES = ['Layouts', 'AndroidX', 'Widgets', 'List', 'Library', 'Google', 'Date & Time'];

/** Base views a custom widget can be built on (availableWidgetsNames). */
export const BASE_WIDGETS = [
  'BottomNavigationView', 'Button', 'CardView', 'CheckBox', 'CodeView', 'EditText', 'GridView',
  'HScrollView', 'ImageView', 'LinearLayout', 'ListView', 'MapView', 'MaterialButton', 'ProgressBar',
  'RadioButton', 'RecyclerView', 'RelativeLayout', 'ScrollView', 'SeekBar', 'Spinner', 'Switch',
  'SwipeRefreshLayout', 'TabLayout', 'TextInputLayout', 'TextView', 'VideoView', 'ViewPager', 'WebView',
];
export const baseType = (name: string) => viewTypeByName(name);

export const widgetsDir = () => joinPath(workspace().root, 'resources', 'widgets');
const widgetsFile = () => joinPath(widgetsDir(), 'widgets.json');

export async function readCustomWidgets(): Promise<CustomWidget[]> {
  try {
    if (!(await host().exists(widgetsFile()))) return [];
    const list = JSON.parse((await host().readText(widgetsFile())) || '[]');
    return (Array.isArray(list) ? list : [])
      .filter((w) => w && w.Class != null && w.title != null && w.name != null && w.type != null)
      .map((w) => ({ ...w, type: Math.trunc(Number(w.type)), inject: String(w.inject ?? '') }))
      .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0));
  } catch {
    return [];
  }
}

export async function writeCustomWidgets(list: CustomWidget[]) {
  await host().mkdir(widgetsDir());
  await host().write(widgetsFile(), JSON.stringify(list.map((w, i) => ({ ...w, position: i }))));
}

/** IconCustomWidget.getBean */
export function customWidgetBean(w: CustomWidget): ViewBean {
  const v = new ViewBean();
  v.type = w.type;
  const L = v.layout;
  L.height = -2;
  L.paddingLeft = 8;
  L.paddingTop = 8;
  L.paddingRight = 8;
  L.paddingBottom = 8;
  v.convert = w.name;
  switch (v.type) {
    case 0:
    case 1:
    case 2:
      L.width = -1;
      L.orientation = 1;
      break;
    case 3:
    case 13:
    case 4:
    case 11:
    case 19:
    case 41:
      v.text.text = w.title;
      break;
    case 5:
      v.text.hint = w.title;
      break;
    case 6:
      v.image.resName = '';
      break;
    case 7:
    case 10:
    case 12:
    case 14:
    case 36:
    case 39:
      L.width = -1;
    // falls through, like the original switch
    case 8:
      v.text.text = w.title;
      L.width = -1;
      break;
  }
  v.inject = w.inject;
  v.isCustomWidget = true;
  return v;
}

/** WidgetsCreatorManager.generateCustomWidgetId: "com.foo.MyView" -> "myView" */
export function customWidgetIdBase(convert: string) {
  const s = convert.substring(convert.lastIndexOf('.') + 1);
  return s ? s.charAt(0).toLowerCase() + s.substring(1) : 'view';
}
