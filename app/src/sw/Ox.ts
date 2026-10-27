// Auto-ported from Ox.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: com.besome.sketch.editor.property.PropertyAttributesItem.RELATIVE_IDS, android.annotation.SuppressLint, android.view.Gravity, android.view.View, android.view.ViewGroup, android.widget.ImageView, android.widget.LinearLayout, com.besome.sketch.beans.ImageBean, com.besome.sketch.beans.LayoutBean, com.besome.sketch.beans.ProjectFileBean, com.besome.sketch.beans.TextBean, com.besome.sketch.beans.ViewBean, com.besome.sketch.editor.manage.library.material3.Material3LibraryManager, org.xmlpull.v1.XmlPullParser, org.xmlpull.v1.XmlPullParserException, org.xmlpull.v1.XmlPullParserFactory, java.io.IOException, java.io.StringReader, java.nio.CharBuffer, java.util.ArrayList, java.util.Arrays, java.util.HashSet, java.util.Map, java.util.Set, java.util.regex.Pattern, dev.aldi.sayuti.editor.injection.AppCompatInjection, mod.agus.jcoderz.beans.ViewBeans, mod.jbk.util.LogUtil, pro.sketchware.managers.inject.InjectRootLayoutManager, pro.sketchware.utility.InjectAttributeHandler, pro.sketchware.xml.XmlBuilder
// <imports>
import { jformat, jstr, jiter, JSet, StringBuilder } from '../codegen/jshim';
import { ViewBean, TextBean, ImageBean, ProjectFileBean } from '../core/beans';
import { AppCompatInjection } from './AppCompatInjection';
import { InjectAttributeHandler } from './InjectAttributeHandler';
import { InjectRootLayoutManager } from './InjectRootLayoutManager';
import { Material3LibraryManager } from './Material3LibraryManager';
import { ViewBeans } from './ViewBeans';
import { XmlBuilder } from './XmlBuilder';
import { CharBuffer, Gravity, LinearLayout, Pattern, ViewGroup } from './env';
import { jq } from './jq';
import { RELATIVE_IDS, readToolsReplace } from './platform';
import { sq } from './sq';
// </imports>
export class Ox {
  buildConfig: any;
  rootManager: any;
  aci: any;
  projectFile: any;
  fab: any;
  views: any;
  rootLayout: any = null;
  collapsingToolbarLayout: any = null;
  excludeAppCompat: boolean;
  constructor(jq: any, projectFileBean: any) {
        this.buildConfig = jq;
        this.projectFile = projectFileBean;
        this.rootManager = new InjectRootLayoutManager(jq.sc_id);
        this.aci = new AppCompatInjection(jq, projectFileBean);
    }
  static formatColor(color: number): string {
        if (color == 0) {
            return "#00000000";
        }
        let alpha = (color >> 24) & 0xff;

        if (alpha != 0xff && alpha != 0) {
            return jformat("#%08X", color);
        } else {
            return jformat("#%06X", 0xFFFFFF & color);
        }
    }
  escapeXML(str: string): string {
        let buffer = CharBuffer.wrap(str);
        let result = new StringBuilder(str.length);
        while (buffer.hasRemaining()) {
            let got = buffer.get();
            switch (got) {
                case "?": result.append("\\?"); break;
                case "@": result.append("\\@"); break;
                case "\"": result.append("&quot;"); break;
                case "&": result.append("&amp;"); break;
                case "<": result.append("&lt;"); break;
                case ">": result.append("&gt;"); break;
                case "\n": result.append("\\n"); break;
                default: result.append(got); break;
            }
        }
        return result.toString();
    }
  setExcludeAppCompat(exclude: boolean): void {
        this.excludeAppCompat = exclude;
    }
  writeRootLayout(): void {
        let root = this.rootManager.getLayoutByFileName(this.projectFile.getXmlName());
        let nx = new XmlBuilder(root.getClassName());
        let rootAttributes = root.getAttributes();
        if (!rootAttributes.containsKey("android:layout_width")) {
            nx.addAttribute("android", "layout_width", "match_parent");
        }
        if (!rootAttributes.containsKey("android:layout_height")) {
            nx.addAttribute("android", "layout_height", "match_parent");
        }
        for (const entry of jiter(rootAttributes.entrySet())) {
            nx.addAttribute(null, entry.getKey(), entry.getValue());
        }
        for (const viewBean of jiter(this.views)) {
            let parent = viewBean.parent;
            if (parent == null || parent.isEmpty() || parent.equals("root")) {
                this.writeWidget(nx, viewBean);
            }
        }
        if (!this.excludeAppCompat && this.buildConfig.g) {
            if (this.projectFile.fileType == ProjectFileBean.PROJECT_FILE_TYPE_ACTIVITY) {
                if (this.projectFile.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR)) {
                    if (!root.getAttributes().containsKey("app:layout_behavior")) {
                        nx.addAttribute("app", "layout_behavior", "@string/appbar_scrolling_view_behavior");
                    }
                }
                if (this.projectFile.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR)
                        || this.projectFile.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FAB)) {
                    let coordinatorLayoutTag = new XmlBuilder("androidx.coordinatorlayout.widget.CoordinatorLayout");
                    coordinatorLayoutTag.addAttribute("android", "id", "@+id/_coordinator");
                    this.aci.inject(coordinatorLayoutTag, "CoordinatorLayout");
                    this.rootLayout = coordinatorLayoutTag;
                }
                if (this.projectFile.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR)) {
                    let materialLibraryManager = new Material3LibraryManager(this.buildConfig.sc_id);

                    let toolbarTag = new XmlBuilder(
                            (materialLibraryManager.isMaterial3Enabled()) ? "com.google.android.material.appbar.MaterialToolbar" : "androidx.appcompat.widget.Toolbar"
                    );
                    toolbarTag.addAttribute("android", "id", "@+id/_toolbar");
                    this.aci.inject(toolbarTag, "Toolbar");
                    let appBarLayoutTag = new XmlBuilder("com.google.android.material.appbar.AppBarLayout");
                    appBarLayoutTag.addAttribute("android", "id", "@+id/_app_bar");
                    this.aci.inject(appBarLayoutTag, "AppBarLayout");
                    if (this.collapsingToolbarLayout != null) {
                        this.collapsingToolbarLayout.addChildNode(toolbarTag);
                        appBarLayoutTag.addChildNode(this.collapsingToolbarLayout);
                    } else {
                        appBarLayoutTag.addChildNode(toolbarTag);
                    }
                    this.rootLayout.addChildNode(appBarLayoutTag);
                    this.rootLayout.addChildNode(nx);
                } else {
                    if (this.rootLayout == null) {
                        this.rootLayout = nx;
                    } else {
                        this.rootLayout.addChildNode(nx);
                    }
                }
                if (this.projectFile.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FAB)) {
                    this.writeFabView(this.rootLayout, this.fab);
                }
                if (this.fab.type == ViewBeans.VIEW_TYPE_LAYOUT_BOTTOMNAVIGATIONVIEW) {
                    this.writeWidget(this.rootLayout, this.fab);
                }
                if (this.projectFile.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER)) {
                    let drawerLayoutTag = new XmlBuilder("androidx.drawerlayout.widget.DrawerLayout");
                    drawerLayoutTag.addAttribute("android", "id", "@+id/_drawer");
                    this.aci.inject(drawerLayoutTag, "DrawerLayout");
                    drawerLayoutTag.addChildNode(this.rootLayout);
                    let linearLayoutTag = new XmlBuilder("LinearLayout");
                    linearLayoutTag.addAttribute("android", "id", "@+id/_nav_view");
                    this.aci.inject(linearLayoutTag, "NavigationDrawer");
                    let includeTag = new XmlBuilder("include", true);
                    includeTag.addAttribute("", "layout", "@layout/_drawer_" + this.projectFile.fileName);
                    includeTag.addAttribute("android", "id", "@+id/drawer");
                    linearLayoutTag.addChildNode(includeTag);
                    drawerLayoutTag.addChildNode(linearLayoutTag);
                    this.rootLayout = drawerLayoutTag;
                }
            } else {
                this.rootLayout = nx;
            }
        } else {
            this.rootLayout = nx;
        }
        this.rootLayout.addNamespaceDeclaration(0, "xmlns", "tools", "http://schemas.android.com/tools");
        this.rootLayout.addNamespaceDeclaration(0, "xmlns", "app", "http://schemas.android.com/apk/res-auto");
        this.rootLayout.addNamespaceDeclaration(0, "xmlns", "android", "http://schemas.android.com/apk/res/android");
    }
  writeBackgroundResource(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        let backgroundResource = viewBean.layout.backgroundResource;
        let type = viewBean.type;

        if (backgroundResource == null || "NONE".equalsIgnoreCase(backgroundResource)) {
            let backgroundColor = viewBean.layout.backgroundColor;
            let backgroundResColor = viewBean.layout.backgroundResColor;

            if (backgroundColor != 0xffffff) {
                if (backgroundColor != 0) {
                    let color = backgroundColor;
                    if (nx.c().equals("BottomAppBar")) {
                        if (!toNotAdd.contains("app:backgroundTint") && !injectHandler.contains("backgroundTint") && (backgroundResColor != null)) {
                            if (backgroundResColor.startsWith("?") || backgroundResColor.startsWith("@color/")) {
                                nx.addAttribute("app", "backgroundTint", backgroundResColor);
                            } else {
                                nx.addAttribute("app", "backgroundTint", "@color/" + backgroundResColor);
                            }
                        } else if (!toNotAdd.contains("app:backgroundTint") && !injectHandler.contains("backgroundTint")) {
                            nx.addAttribute("app", "backgroundTint", Ox.formatColor(color));
                        }
                    } else if (type == ViewBeans.VIEW_TYPE_LAYOUT_CARDVIEW) {
                        if (!toNotAdd.contains("app:cardBackgroundColor") && !injectHandler.contains("cardBackgroundColor") && backgroundResColor != null) {
                            if (backgroundResColor.startsWith("?") || backgroundResColor.startsWith("@color/")) {
                                nx.addAttribute("app", "cardBackgroundColor", backgroundResColor);
                            } else {
                                nx.addAttribute("app", "cardBackgroundColor", "@color/" + backgroundResColor);
                            }
                        } else if (!toNotAdd.contains("app:cardBackgroundColor") && !injectHandler.contains("cardBackgroundColor")) {
                            nx.addAttribute("app", "cardBackgroundColor", Ox.formatColor(color));
                        }
                    } else if (nx.c().equals("MaterialButton")) {
                        if (!toNotAdd.contains("app:backgroundTint") && !injectHandler.contains("backgroundTint")) {
                            nx.addAttribute("app", "backgroundTint", backgroundResColor == null ? Ox.formatColor(color) : backgroundResColor);
                        }
                    } else if (nx.c().equals("CollapsingToolbarLayout")) {
                        if (!toNotAdd.contains("app:contentScrim") && !injectHandler.contains("contentScrim") && backgroundResColor != null) {
                            if (backgroundResColor.startsWith("?") || backgroundResColor.startsWith("@color/")) {
                                nx.addAttribute("app", "contentScrim", backgroundResColor);
                            } else {
                                nx.addAttribute("app", "contentScrim", "@color/" + backgroundResColor);
                            }
                        } else if (!toNotAdd.contains("app:contentScrim") && !injectHandler.contains("contentScrim")) {
                            nx.addAttribute("app", "contentScrim", Ox.formatColor(color));
                        }
                    } else {
                        if (!this.hasAttr("background", viewBean) && !toNotAdd.contains("android:background") && !injectHandler.contains("background") && backgroundResColor != null) {
                            if (backgroundResColor.startsWith("?") || backgroundResColor.startsWith("@color/")) {
                                nx.addAttribute("android", "background", backgroundResColor);
                            } else {
                                nx.addAttribute("android", "background", "@color/" + backgroundResColor);
                            }
                        } else if (!this.hasAttr("background", viewBean) && !toNotAdd.contains("android:background") && !injectHandler.contains("background")) {
                            nx.addAttribute("android", "background", Ox.formatColor(color));
                        }
                    }
                } else if (nx.c().equals("BottomAppBar")) {
                    if (!toNotAdd.contains("android:backgroundTint") && !injectHandler.contains("backgroundTint")) {
                        nx.addAttribute("android", "backgroundTint", "@android:color/transparent");
                    }
                } else if (nx.c().equals("CollapsingToolbarLayout")) {
                    if (!toNotAdd.contains("app:contentScrim") && !injectHandler.contains("contentScrim")) {
                        nx.addAttribute("app", "contentScrim", "?attr/colorPrimary");
                    }
                } else if (type == ViewBeans.VIEW_TYPE_LAYOUT_CARDVIEW) {
                    if (!toNotAdd.contains("app:cardBackgroundColor") && !injectHandler.contains("cardBackgroundColor")) {
                        nx.addAttribute("app", "cardBackgroundColor", "@android:color/transparent");
                    }
                } else {
                    if (!toNotAdd.contains("android:background") && !injectHandler.contains("background")) {
                        nx.addAttribute("android", "background", "@android:color/transparent");
                    }
                }
            }
        } else {
            if (!this.hasAttr("background", viewBean) && !toNotAdd.contains("android:background") && !injectHandler.contains("background")) {
                let isNinePatchBackground = backgroundResource.endsWith(".9");
                nx.addAttribute("android", "background", "@drawable/" +
                        (isNinePatchBackground ? backgroundResource.jreplaceAll("\\.9", "") :
                                backgroundResource));
            }
        }
    }
  a_ArrayList(arrayList: any): void {
        this.a(arrayList, null);
    }
  a_ArrayList_ViewBean(arrayList: any, viewBean: any): void {
        this.fab = viewBean;
        this.views = arrayList;
        this.writeRootLayout();
    }
  b(): string {
        return this.rootLayout.toCode();
    }
  writeWidget(nx: any, viewBean: any): void {
        viewBean.getClassInfo().getClassName();
        let convert = viewBean.convert;
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);

        let widgetTag = convert.isEmpty() ? new XmlBuilder(viewBean.getClassInfo().getClassName()) :
                new XmlBuilder(convert.jreplace(" ", ""));
        if (convert.equals("include")) {
            if (!toNotAdd.contains("layout") && !injectHandler.contains("layout")) {
                widgetTag.addAttribute("", "layout", "@layout/" + viewBean.id);
            }
        } else {
            if (!toNotAdd.contains("android:id")) {
                widgetTag.addAttribute("android", "id", "@+id/" + viewBean.id);
            }
            let type = viewBean.type;
            if (this.projectFile.fileType == ProjectFileBean.PROJECT_FILE_TYPE_CUSTOM_VIEW) {
                switch (type) {
                    case ViewBean.VIEW_TYPE_WIDGET_TEXTVIEW:
                    case ViewBean.VIEW_TYPE_WIDGET_EDITTEXT:
                    case ViewBean.VIEW_TYPE_WIDGET_IMAGEVIEW:
                    case ViewBean.VIEW_TYPE_WIDGET_PROGRESSBAR:
                    case ViewBean.VIEW_TYPE_WIDGET_CHECKBOX:
                    case ViewBean.VIEW_TYPE_WIDGET_SWITCH:
                    case ViewBean.VIEW_TYPE_WIDGET_SEEKBAR:
                    case ViewBean.VIEW_TYPE_WIDGET_CALENDARVIEW:
                    case ViewBeans.VIEW_TYPE_WIDGET_RADIOBUTTON:
                    case ViewBeans.VIEW_TYPE_WIDGET_SEARCHVIEW:
                    case ViewBeans.VIEW_TYPE_WIDGET_AUTOCOMPLETETEXTVIEW:
                    case ViewBeans.VIEW_TYPE_WIDGET_MULTIAUTOCOMPLETETEXTVIEW:
                    case ViewBeans.VIEW_TYPE_LAYOUT_BOTTOMNAVIGATIONVIEW:
                        if (!this.hasAttr("focusable", viewBean) && !toNotAdd.contains("android:focusable") && !injectHandler.contains("focusable")) {
                            widgetTag.addAttribute("android", "focusable", "false");
                        }
                        break;

                    default:
                        break;
                }
            }

            if (!toNotAdd.contains("android:layout_width") && !injectHandler.contains("layout_width")) {
                let width = viewBean.layout.width;
                if (width == ViewGroup.LayoutParams.MATCH_PARENT) {
                    widgetTag.addAttribute("android", "layout_width", "match_parent");
                } else if (width == ViewGroup.LayoutParams.WRAP_CONTENT) {
                    widgetTag.addAttribute("android", "layout_width", "wrap_content");
                } else {
                    widgetTag.addAttribute("android", "layout_width", width + "dp");
                }
            }

            if (!toNotAdd.contains("android:layout_height") && !injectHandler.contains("layout_height")) {
                let height = viewBean.layout.height;
                if (height == ViewGroup.LayoutParams.MATCH_PARENT) {
                    widgetTag.addAttribute("android", "layout_height", "match_parent");
                } else if (height == ViewGroup.LayoutParams.WRAP_CONTENT) {
                    widgetTag.addAttribute("android", "layout_height", "wrap_content");
                } else {
                    widgetTag.addAttribute("android", "layout_height", height + "dp");
                }
            }

            this.writeLayoutMargin(widgetTag, viewBean);
            if (type == ViewBeans.VIEW_TYPE_LAYOUT_CARDVIEW) {
                this.writeCardViewPadding(widgetTag, viewBean);
            } else {
                this.writeViewPadding(widgetTag, viewBean);
            }
            this.writeBackgroundResource(widgetTag, viewBean);
            if (viewBean.getClassInfo().a("ViewGroup")) {
                this.writeViewGravity(widgetTag, viewBean);
            }
        }
        if (viewBean.getClassInfo().a("LinearLayout") &&
                !widgetTag.c().jmatches("(BottomAppBar|NavigationView|Coordinator|Floating|Collaps|include)\\w*")) {
            if (!toNotAdd.contains("android:orientation") && !injectHandler.contains("orientation")) {
                let orientation = viewBean.layout.orientation;
                if (orientation == LinearLayout.HORIZONTAL) {
                    widgetTag.addAttribute("android", "orientation", "horizontal");
                } else if (orientation == LinearLayout.VERTICAL) {
                    widgetTag.addAttribute("android", "orientation", "vertical");
                }
            }

            if (!toNotAdd.contains("android:weightSum") && !injectHandler.contains("weightSum")) {
                let weightSum = viewBean.layout.weightSum;
                if (weightSum > 0) {
                    widgetTag.addAttribute("android", "weightSum", jstr(weightSum));
                }
            }
        }
        if (viewBean.getClassInfo().a("TextView")) {
            this.writeViewGravity(widgetTag, viewBean);
            this.writeTextAttributes(widgetTag, viewBean);
        }
        if (viewBean.getClassInfo().a("ImageView")) {
            this.writeImgSrcAttr(widgetTag, viewBean);
            if (!widgetTag.toCode().contains(".")) {
                this.writeImageScaleType(widgetTag, viewBean);
            }
        }
        if (viewBean.getClassInfo().b("SeekBar")) {
            this.writeViewGravity(widgetTag, viewBean);
        }
        if (viewBean.getClassInfo().b("ProgressBar")) {
            this.writeViewGravity(widgetTag, viewBean);
        }
        if (viewBean.getClassInfo().b("WaveSideBar")) {
            let textSize = viewBean.text.textSize;
            if (textSize > 0 && !toNotAdd.contains("app:sidebar_text_size")) {
                widgetTag.addAttribute("app", "sidebar_text_size", textSize + "sp");
            }

            let textColor = viewBean.text.textColor;
            let resTextColor = viewBean.text.resTextColor;
            if (textColor != 0 && !toNotAdd.contains("app:sidebar_text_color") && resTextColor != null) {
                if (resTextColor.startsWith("?") || resTextColor.startsWith("@color/")) {
                    widgetTag.addAttribute("app", "sidebar_text_color", resTextColor);
                } else {
                    widgetTag.addAttribute("app", "sidebar_text_color", "@color/" + resTextColor);
                }
            } else if (textColor != 0 && !toNotAdd.contains("app:sidebar_text_color")) {
                widgetTag.addAttribute("app", "sidebar_text_color", Ox.formatColor(textColor));
            }
        }
        this.k(widgetTag, viewBean);
        let parentViewType = viewBean.parentType;
        if (!viewBean.convert.equals("include")) {
            if (parentViewType == ViewBean.VIEW_TYPE_LAYOUT_LINEAR) {
                this.writeLayoutGravity(widgetTag, viewBean);
                let weight = viewBean.layout.weight;
                if (weight > 0 && !toNotAdd.contains("android:layout_weight") && !injectHandler.contains("layout_weight")) {
                    widgetTag.addAttribute("android", "layout_weight", jstr(weight));
                }
            } else if (parentViewType == ViewBean.VIEW_TYPE_LAYOUT_HSCROLLVIEW || parentViewType == ViewBean.VIEW_TYPE_LAYOUT_VSCROLLVIEW) {
                this.writeLayoutGravity(widgetTag, viewBean);
            }
        }
        if (viewBean.getClassInfo().a("ViewGroup")) {
            for (const bean of jiter(this.views)) {
                if (bean.parent != null && bean.parent.equals(viewBean.id)) {
                    this.writeWidget(widgetTag, bean);
                }
            }
        }
        if (!viewBean.inject.isEmpty()) {
            widgetTag.addAttributeValue(viewBean.inject.jreplace(" ", ""));
        }

        if (!viewBean.parentAttributes.isEmpty()) {
            viewBean.parentAttributes.forEach((key, value) => {
                let parts = key.jsplit(":");
                widgetTag.addAttribute(parts[0], parts[1], RELATIVE_IDS.contains(key) ? "@id/" + value : value);
            });
        }

        if (widgetTag.c().equals("CollapsingToolbarLayout")
                && this.buildConfig.g
                && this.projectFile.fileType == ProjectFileBean.PROJECT_FILE_TYPE_ACTIVITY) {
            if (this.projectFile.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR)) {
                if (this.collapsingToolbarLayout == null) {
                    this.collapsingToolbarLayout = widgetTag;
                    return;
                }
            }
        }
        // Adding tools:listitem allows the direct XML editor to recognize the customView
        // for ListView, GridView, Spinner, or RecyclerView.
        if ((viewBean.getClassInfo().b("ListView")
                || viewBean.getClassInfo().b("GridView")
                || viewBean.getClassInfo().b("Spinner")
                || viewBean.getClassInfo().b("RecyclerView")
                || viewBean.getClassInfo().b("ViewPager"))
                && !injectHandler.contains("listitem")) {
            let customView = viewBean.customView;
            if (customView != null && !customView.isEmpty() && !customView.equals("none")) {
                widgetTag.addAttribute("tools", "listitem", "@layout/" + customView);
            }
        }
        nx.addChildNode(widgetTag);
    }
  writeFabView(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        let floatingActionButtonTag = new XmlBuilder("com.google.android.material.floatingactionbutton.FloatingActionButton");
        if (!toNotAdd.contains("android:id")) {
            floatingActionButtonTag.addAttribute("android", "id", "@+id/" + viewBean.id);
        }
        if (!toNotAdd.contains("android:layout_width") && !injectHandler.contains("layout_width")) {
            floatingActionButtonTag.addAttribute("android", "layout_width", "wrap_content");
        }
        if (!toNotAdd.contains("android:layout_height") && !injectHandler.contains("layout_height")) {
            floatingActionButtonTag.addAttribute("android", "layout_height", "wrap_content");
        }
        this.writeLayoutMargin(floatingActionButtonTag, viewBean);
        this.writeLayoutGravity(floatingActionButtonTag, viewBean);

        let resName = viewBean.image.resName;
        if (resName != null && !resName.isEmpty() && !resName.equals("NONE") &&
                !toNotAdd.contains("app:srcCompat") && !injectHandler.contains("srcCompat")) {
            floatingActionButtonTag.addAttribute("app", "srcCompat", "@drawable/" + resName.toLowerCase());
        }
        if (viewBean.id.equals("_fab")) {
            this.aci.inject(floatingActionButtonTag, "FloatingActionButton");
        }
        this.k(floatingActionButtonTag, viewBean);
        nx.addChildNode(floatingActionButtonTag);
    }
  writeViewGravity(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        if (!toNotAdd.contains("android:gravity") && !injectHandler.contains("gravity")) {
            let gravity = viewBean.layout.gravity;
            if (gravity != Gravity.NO_GRAVITY) {
                let attrValue = "";
                let verticalGravity = gravity & Gravity.FILL_VERTICAL;
                let horizontalGravity = gravity & Gravity.FILL_HORIZONTAL;
                if (horizontalGravity == Gravity.CENTER_HORIZONTAL) {
                    attrValue = "center_horizontal";
                } else {
                    if ((horizontalGravity & Gravity.LEFT) == Gravity.LEFT) {
                        attrValue = "left";
                    }
                    if ((horizontalGravity & Gravity.RIGHT) == Gravity.RIGHT) {
                        if (!attrValue.isEmpty()) {
                            attrValue += "|";
                        }
                        attrValue += "right";
                    }
                }
                if (verticalGravity == Gravity.CENTER_VERTICAL) {
                    if (!attrValue.isEmpty()) {
                        attrValue += "|";
                    }
                    attrValue += "center_vertical";
                } else {
                    if ((verticalGravity & Gravity.TOP) == Gravity.TOP) {
                        if (!attrValue.isEmpty()) {
                            attrValue += "|";
                        }
                        attrValue += "top";
                    }
                    if ((verticalGravity & Gravity.BOTTOM) == Gravity.BOTTOM) {
                        if (!attrValue.isEmpty()) {
                            attrValue += "|";
                        }
                        attrValue += "bottom";
                    }
                }
                nx.addAttribute("android", "gravity", attrValue);
            }
        }
    }
  writeImgSrcAttr(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        let resName = viewBean.image.resName;
        if (!resName.isEmpty() && !"NONE".equals(resName)) {
            let value = "@drawable/" + resName.toLowerCase();
            if (nx.c().equals("FloatingActionButton")) {
                if (!toNotAdd.contains("app:srcCompat") && !injectHandler.contains("srcCompat")) {
                    nx.addAttribute("app", "srcCompat", value);
                }
            } else {
                if (!toNotAdd.contains("android:src") && !injectHandler.contains("src")) {
                    nx.addAttribute("android", "src", value);
                }
            }
        }
    }
  writeImageScaleType(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        if (!toNotAdd.contains("android:scaleType") && !injectHandler.contains("scaleType")) {
            if (viewBean.image.scaleType.equals(ImageBean.SCALE_TYPE_CENTER)) {
                nx.addAttribute("android", "scaleType", "center");
            } else if (viewBean.image.scaleType.equals(ImageBean.SCALE_TYPE_FIT_XY)) {
                nx.addAttribute("android", "scaleType", "fitXY");
            } else if (viewBean.image.scaleType.equals(ImageBean.SCALE_TYPE_FIT_START)) {
                nx.addAttribute("android", "scaleType", "fitStart");
            } else if (viewBean.image.scaleType.equals(ImageBean.SCALE_TYPE_FIT_END)) {
                nx.addAttribute("android", "scaleType", "fitEnd");
            } else if (viewBean.image.scaleType.equals(ImageBean.SCALE_TYPE_FIT_CENTER)) {
                nx.addAttribute("android", "scaleType", "fitCenter");
            } else if (viewBean.image.scaleType.equals(ImageBean.SCALE_TYPE_CENTER_CROP)) {
                nx.addAttribute("android", "scaleType", "centerCrop");
            } else if (viewBean.image.scaleType.equals(ImageBean.SCALE_TYPE_CENTER_INSIDE)) {
                nx.addAttribute("android", "scaleType", "centerInside");
            }
        }
    }
  writeLayoutGravity(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        if (!toNotAdd.contains("android:layout_gravity") && !injectHandler.contains("layout_gravity")) {
            let gravity = viewBean.layout.layoutGravity;
            if (gravity != Gravity.NO_GRAVITY) {
                let attrValue = "";
                let verticalGravity = gravity & Gravity.FILL_VERTICAL;
                let horizontalGravity = gravity & Gravity.FILL_HORIZONTAL;
                if (horizontalGravity == Gravity.CENTER_HORIZONTAL) {
                    attrValue = "center_horizontal";
                } else {
                    if ((horizontalGravity & Gravity.LEFT) == Gravity.LEFT) {
                        attrValue = "left";
                    }
                    if ((horizontalGravity & Gravity.RIGHT) == Gravity.RIGHT) {
                        if (!attrValue.isEmpty()) {
                            attrValue += "|";
                        }
                        attrValue += "right";
                    }
                }
                if (verticalGravity == Gravity.CENTER_VERTICAL) {
                    if (!attrValue.isEmpty()) {
                        attrValue += "|";
                    }
                    attrValue += "center_vertical";
                } else {
                    if ((verticalGravity & Gravity.TOP) == Gravity.TOP) {
                        if (!attrValue.isEmpty()) {
                            attrValue += "|";
                        }
                        attrValue += "top";
                    }
                    if ((verticalGravity & Gravity.BOTTOM) == Gravity.BOTTOM) {
                        if (!attrValue.isEmpty()) {
                            attrValue += "|";
                        }
                        attrValue += "bottom";
                    }
                }
                nx.addAttribute("android", "layout_gravity", attrValue);
            }
        }
    }
  writeLayoutMargin(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        let layoutBean = viewBean.layout;
        let marginLeft = layoutBean.marginLeft;
        let marginTop = layoutBean.marginTop;
        let marginRight = layoutBean.marginRight;
        let marginBottom = layoutBean.marginBottom;

        if (marginLeft == marginRight && marginTop == marginBottom
                && marginLeft == marginTop && marginLeft > 0) {
            if (!toNotAdd.contains("android:layout_margin") && !injectHandler.contains("layout_margin")) {
                nx.addAttribute("android", "layout_margin", marginLeft + "dp");
            }
            return;
        }

        if (marginLeft > 0 && !toNotAdd.contains("android:layout_marginLeft") && !injectHandler.contains("layout_marginLeft")) {
            nx.addAttribute("android", "layout_marginLeft", marginLeft + "dp");
        }
        if (viewBean.layout.marginTop > 0 && !toNotAdd.contains("android:layout_marginTop") && !injectHandler.contains("layout_marginTop")) {
            nx.addAttribute("android", "layout_marginTop", viewBean.layout.marginTop + "dp");
        }
        if (marginRight > 0 && !toNotAdd.contains("android:layout_marginRight") && !injectHandler.contains("layout_marginRight")) {
            nx.addAttribute("android", "layout_marginRight", marginRight + "dp");
        }
        if (marginBottom > 0 && !toNotAdd.contains("android:layout_marginBottom") && !injectHandler.contains("layout_marginBottom")) {
            nx.addAttribute("android", "layout_marginBottom", marginBottom + "dp");
        }
    }
  writeCardViewPadding(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        let layoutBean = viewBean.layout;
        let paddingLeft = layoutBean.paddingLeft;
        let paddingTop = layoutBean.paddingTop;
        let paddingRight = layoutBean.paddingRight;
        let paddingBottom = layoutBean.paddingBottom;

        if (paddingLeft == paddingRight && paddingTop == paddingBottom
                && paddingLeft == paddingTop && paddingLeft > 0) {
            if (!toNotAdd.contains("app:contentPadding") && !injectHandler.contains("contentPadding")) {
                nx.addAttribute("app", "contentPadding", paddingLeft + "dp");
            }
            return;
        }

        if (paddingLeft > 0 && !toNotAdd.contains("app:contentPaddingLeft") && !injectHandler.contains("contentPaddingLeft")) {
            nx.addAttribute("app", "contentPaddingLeft", paddingLeft + "dp");
        }
        if (paddingTop > 0 && !toNotAdd.contains("app:contentPaddingTop") && !injectHandler.contains("contentPaddingTop")) {
            nx.addAttribute("app", "contentPaddingTop", paddingTop + "dp");
        }
        if (paddingRight > 0 && !toNotAdd.contains("app:contentPaddingRight") && !injectHandler.contains("contentPaddingRight")) {
            nx.addAttribute("app", "contentPaddingRight", paddingRight + "dp");
        }
        if (paddingBottom > 0 && !toNotAdd.contains("app:contentPaddingBottom") && !injectHandler.contains("contentPaddingBottom")) {
            nx.addAttribute("app", "contentPaddingBottom", paddingBottom + "dp");
        }
    }
  writeViewPadding(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        let layoutBean = viewBean.layout;
        let paddingLeft = layoutBean.paddingLeft;
        let paddingTop = layoutBean.paddingTop;
        let paddingRight = layoutBean.paddingRight;
        let paddingBottom = layoutBean.paddingBottom;

        if (paddingLeft == paddingRight && paddingTop == paddingBottom
                && paddingLeft == paddingTop && paddingLeft > 0) {
            if (!toNotAdd.contains("android:padding") && !injectHandler.contains("padding")) {
                nx.addAttribute("android", "padding", paddingLeft + "dp");
            }
            return;
        }

        if (paddingLeft > 0 && !toNotAdd.contains("android:paddingLeft") && !injectHandler.contains("paddingLeft")) {
            nx.addAttribute("android", "paddingLeft", paddingLeft + "dp");
        }
        if (paddingTop > 0 && !toNotAdd.contains("android:paddingTop") && !injectHandler.contains("paddingTop")) {
            nx.addAttribute("android", "paddingTop", paddingTop + "dp");
        }
        if (paddingRight > 0 && !toNotAdd.contains("android:paddingRight") && !injectHandler.contains("paddingRight")) {
            nx.addAttribute("android", "paddingRight", paddingRight + "dp");
        }
        if (paddingBottom > 0 && !toNotAdd.contains("android:paddingBottom") && !injectHandler.contains("paddingBottom")) {
            nx.addAttribute("android", "paddingBottom", paddingBottom + "dp");
        }
    }
  writeTextAttributes(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        let text = viewBean.text.text;
        if (text != null && !text.isEmpty() && !toNotAdd.contains("android:text") && !injectHandler.contains("text")) {
            if (text.startsWith("@")) {
                nx.addAttribute("android", "text", text);
            } else {
                nx.addAttribute("android", "text", this.escapeXML(text));
            }
        }

        let textSize = viewBean.text.textSize;
        if (textSize > 0 && !toNotAdd.contains("android:textSize") && !injectHandler.contains("textSize")) {
            nx.addAttribute("android", "textSize", textSize + "sp");
        }
        if (!toNotAdd.contains("android:textStyle") && !injectHandler.contains("textStyle")) {
            let textType = viewBean.text.textType;
            if (textType == TextBean.TEXT_TYPE_BOLD) {
                nx.addAttribute("android", "textStyle", "bold");
            } else if (textType == TextBean.TEXT_TYPE_ITALIC) {
                nx.addAttribute("android", "textStyle", "italic");
            } else if (textType == TextBean.TEXT_TYPE_BOLDITALIC) {
                nx.addAttribute("android", "textStyle", "bold|italic");
            }
        }
        if (viewBean.text.textColor != 0xffffff) {
            if (!this.hasAttr("textColor", viewBean) && !toNotAdd.contains("android:textColor") && !injectHandler.contains("textColor") && viewBean.text.resTextColor != null) {
                if (viewBean.text.resTextColor.startsWith("?") || viewBean.text.resTextColor.startsWith("@color/")) {
                    nx.addAttribute("android", "textColor", viewBean.text.resTextColor);
                } else {
                    nx.addAttribute("android", "textColor", "@color/" + viewBean.text.resTextColor);
                }
            } else if (!this.hasAttr("textColor", viewBean) && !toNotAdd.contains("android:textColor") && !injectHandler.contains("textColor")) {
                nx.addAttribute("android", "textColor", Ox.formatColor(viewBean.text.textColor));
            }
        }
        switch (viewBean.type) {
            case ViewBean.VIEW_TYPE_WIDGET_EDITTEXT:
            case ViewBeans.VIEW_TYPE_WIDGET_AUTOCOMPLETETEXTVIEW:
            case ViewBeans.VIEW_TYPE_WIDGET_MULTIAUTOCOMPLETETEXTVIEW:
                var hint = viewBean.text.hint;
                if (hint != null && !hint.isEmpty() && !toNotAdd.contains("android:hint") && !injectHandler.contains("hint")) {
                    if (hint.startsWith("@")) {
                        nx.addAttribute("android", "hint", hint);
                    } else {
                        nx.addAttribute("android", "hint", this.escapeXML(hint));
                    }
                }
                if (viewBean.text.hintColor != 0xffffff) {
                    if (!this.hasAttr("textColorHint", viewBean) && !toNotAdd.contains("android:textColorHint") && (viewBean.text.resHintColor != null)) {
                        if (viewBean.text.resHintColor.startsWith("?") || viewBean.text.resHintColor.startsWith("@color/")) {
                            nx.addAttribute("android", "textColorHint", viewBean.text.resHintColor);
                        } else {
                            nx.addAttribute("android", "textColorHint", "@color/" + viewBean.text.resHintColor);
                        }
                    } else if (!this.hasAttr("textColorHint", viewBean) && !toNotAdd.contains("android:textColorHint")) {
                        nx.addAttribute("android", "textColorHint", Ox.formatColor(viewBean.text.hintColor));
                    }
                }
                if (viewBean.text.singleLine != 0 && !toNotAdd.contains("android:singleLine") && !injectHandler.contains("singleLine")) {
                    nx.addAttribute("android", "singleLine", "true");
                }

                var line = viewBean.text.line;
                if (line > 0 && !toNotAdd.contains("android:lines") && !injectHandler.contains("lines")) {
                    nx.addAttribute("android", "lines", jstr(line));
                }

                var inputType = viewBean.text.inputType;
                if (inputType != TextBean.INPUT_TYPE_TEXT && !toNotAdd.contains("android:inputType") && !injectHandler.contains("inputType")) {
                    nx.addAttribute("android", "inputType", sq.a("property_input_type", inputType));
                }

                var imeOption = viewBean.text.imeOption;
                if (imeOption != TextBean.IME_OPTION_NORMAL && !toNotAdd.contains("android:imeOptions") && !injectHandler.contains("imeOptions")) {
                    if (imeOption == TextBean.IME_OPTION_NONE) {
                        nx.addAttribute("android", "imeOptions", "actionNone");
                    } else if (imeOption == TextBean.IME_OPTION_GO) {
                        nx.addAttribute("android", "imeOptions", "actionGo");
                    } else if (imeOption == TextBean.IME_OPTION_SEARCH) {
                        nx.addAttribute("android", "imeOptions", "actionSearch");
                    } else if (imeOption == TextBean.IME_OPTION_SEND) {
                        nx.addAttribute("android", "imeOptions", "actionSend");
                    } else if (imeOption == TextBean.IME_OPTION_NEXT) {
                        nx.addAttribute("android", "imeOptions", "actionNext");
                    } else if (imeOption == TextBean.IME_OPTION_DONE) {
                        nx.addAttribute("android", "imeOptions", "actionDone");
                    }
                }
                break;

            case ViewBean.VIEW_TYPE_WIDGET_TEXTVIEW:
                if (viewBean.text.singleLine != 0 && !toNotAdd.contains("android:singleLine") && !injectHandler.contains("singleLine")) {
                    nx.addAttribute("android", "singleLine", "true");
                }
                line = viewBean.text.line;
                if (line > 0 && !toNotAdd.contains("android:lines") && !injectHandler.contains("lines")) {
                    nx.addAttribute("android", "lines", jstr(line));
                }
                break;
        }
    }
  k(nx: any, viewBean: any): void {
        let injectHandler = new InjectAttributeHandler(viewBean);
        let toNotAdd = this.readAttributesToReplace(viewBean);
        if (viewBean.enabled == 0 && !toNotAdd.contains("android:enabled") && !injectHandler.contains("enabled")) {
            nx.addAttribute("android", "enabled", "false");
        }
        if (viewBean.clickable == 0 && !toNotAdd.contains("android:clickable") && !injectHandler.contains("clickable")) {
            nx.addAttribute("android", "clickable", "false");
        }
        let rotate = viewBean.image.rotate;
        if (rotate != 0 && !toNotAdd.contains("android:rotation") && !injectHandler.contains("rotation")) {
            nx.addAttribute("android", "rotation", jstr(rotate));
        }
        let alpha = viewBean.alpha;
        if (1.0 != alpha && !toNotAdd.contains("android:alpha") && !injectHandler.contains("alpha")) {
            nx.addAttribute("android", "alpha", jstr(alpha));
        }
        if (0.0 != viewBean.translationX && !toNotAdd.contains("android:translationX") && !injectHandler.contains("translationX")) {
            nx.addAttribute("android", "translationX", viewBean.translationX + "dp");
        }
        if (0.0 != viewBean.translationY && !toNotAdd.contains("android:translationY") && !injectHandler.contains("translationY")) {
            nx.addAttribute("android", "translationY", viewBean.translationY + "dp");
        }
        let scaleX = viewBean.scaleX;
        if (1.0 != scaleX && !toNotAdd.contains("android:scaleX") && !injectHandler.contains("scaleX")) {
            nx.addAttribute("android", "scaleX", jstr(scaleX));
        }
        let scaleY = viewBean.scaleY;
        if (1.0 != scaleY && !toNotAdd.contains("android:scaleY") && !injectHandler.contains("scaleY")) {
            nx.addAttribute("android", "scaleY", jstr(scaleY));
        }

        switch (viewBean.type) {
            case ViewBean.VIEW_TYPE_WIDGET_CHECKBOX:
            case ViewBean.VIEW_TYPE_WIDGET_SWITCH:
            case ViewBeans.VIEW_TYPE_WIDGET_RADIOBUTTON:
                if (viewBean.checked == 1 && !toNotAdd.contains("android:checked") && !injectHandler.contains("checked")) {
                    nx.addAttribute("android", "checked", "true");
                }
                break;

            case ViewBean.VIEW_TYPE_WIDGET_SEEKBAR:
                var progress = viewBean.progress;
                if (progress > ViewBean.DEFAULT_PROGRESS && !toNotAdd.contains("android:progress") && !injectHandler.contains("progress")) {
                    nx.addAttribute("android", "progress", jstr(progress));
                }

                var max = viewBean.max;
                if (max != ViewBean.DEFAULT_MAX && !toNotAdd.contains("android:max") && !injectHandler.contains("max")) {
                    nx.addAttribute("android", "max", jstr(max));
                }
                break;

            case ViewBean.VIEW_TYPE_WIDGET_CALENDARVIEW:
                var firstDayOfWeek = viewBean.firstDayOfWeek;
                if (firstDayOfWeek != 1 && !toNotAdd.contains("android:firstDayOfWeek") && !injectHandler.contains("firstDayOfWeek")) {
                    nx.addAttribute("android", "firstDayOfWeek", jstr(firstDayOfWeek));
                }
                break;

            case ViewBean.VIEW_TYPE_WIDGET_SPINNER:
                var spinnerMode = viewBean.spinnerMode;
                if (!toNotAdd.contains("android:spinnerMode") && !injectHandler.contains("spinnerMode")) {
                    if (spinnerMode == ViewBean.SPINNER_MODE_DROPDOWN) {
                        nx.addAttribute("android", "spinnerMode", "dropdown");
                    } else if (spinnerMode == ViewBean.SPINNER_MODE_DIALOG) {
                        nx.addAttribute("android", "spinnerMode", "dialog");
                    }
                }
                break;

            case ViewBean.VIEW_TYPE_WIDGET_LISTVIEW:
                var dividerHeight = viewBean.dividerHeight;
                if (dividerHeight != 1 && !toNotAdd.contains("android:dividerHeight") && !injectHandler.contains("dividerHeight")) {
                    nx.addAttribute("android", "dividerHeight", dividerHeight + "dp");
                }
                if (dividerHeight == 0 && !toNotAdd.contains("android:divider") && !injectHandler.contains("divider")) {
                    nx.addAttribute("android", "divider", "@null");
                }

                if (!toNotAdd.contains("android:choiceMode") && !injectHandler.contains("choiceMode")) {
                    let value = (() => { switch (viewBean.choiceMode) {
                        case ViewBean.CHOICE_MODE_NONE: return "none";
                        case ViewBean.CHOICE_MODE_SINGLE: return "singleChoice";
                        case ViewBean.CHOICE_MODE_MULTI: return "multipleChoice";
                        default: return "";
                    } })();
                    if (!value.isEmpty()) {
                        nx.addAttribute("android", "choiceMode", value);
                    }
                }
                break;

            case ViewBean.VIEW_TYPE_WIDGET_ADVIEW:
                var adSize = viewBean.adSize;
                if (!toNotAdd.contains("app:adSize") && !injectHandler.contains("adSize")) {
                    if (adSize == null || adSize.isEmpty()) {
                        nx.addAttribute("app", "adSize", "SMART_BANNER");
                    } else {
                        nx.addAttribute("app", "adSize", adSize);
                    }
                }

                if (!toNotAdd.contains("app:adUnitId") && !injectHandler.contains("adUnitId")) {
                    if (this.buildConfig.isDebugBuild) {
                        nx.addAttribute("app", "adUnitId", "ca-app-pub-3940256099942544/6300978111");
                    } else {
                        nx.addAttribute("app", "adUnitId", this.buildConfig.bannerAdUnitId);
                    }
                }
                break;

            case ViewBean.VIEW_TYPE_WIDGET_PROGRESSBAR:
                progress = viewBean.progress;
                if (progress > ViewBean.DEFAULT_PROGRESS && !toNotAdd.contains("android:progress") && !injectHandler.contains("progress")) {
                    nx.addAttribute("android", "progress", jstr(progress));
                }

                max = viewBean.max;
                if (max != ViewBean.DEFAULT_MAX && !toNotAdd.contains("android:max") && !injectHandler.contains("max")) {
                    nx.addAttribute("android", "max", jstr(max));
                }

                var indeterminate = viewBean.indeterminate;
                if (indeterminate != null && !indeterminate.isEmpty() && !toNotAdd.contains("android:indeterminate") && !injectHandler.contains("indeterminate")) {
                    nx.addAttribute("android", "indeterminate", indeterminate);
                }
                var progressStyle = viewBean.progressStyle;
                if (progressStyle != null && !progressStyle.isEmpty() && !toNotAdd.contains("style") && !injectHandler.contains("style")) {
                    nx.addAttribute(null, "style", progressStyle);
                }
                break;
        }
    }
  hasAttr(attrName: string, bean: any): boolean {
        let inject = bean.inject;
        if (inject == null || inject.isEmpty()) return false;
        return Pattern.compile("(android|app) *?: *?" + attrName).matcher(inject).find();
    }
  readAttributesToReplace(viewBean: any): any {
        return new JSet(readToolsReplace(viewBean.inject));
    }
  a(...args: any[]): any {
    if (args.length === 2) return this.a_ArrayList_ViewBean.apply(this, args as any);
    if (args.length === 1) return this.a_ArrayList.apply(this, args as any);
    throw new Error('no overload of a for ' + args.length);
  }
}