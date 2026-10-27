// mod.agus.jcoderz.beans.ViewBeans: view types added by Sketchware Pro.
import { viewTypeName, viewTypeByName } from './viewtypes';

export class ViewBeans {
  static VIEW_TYPE_WIDGET_RADIOBUTTON = 19;
  static VIEW_TYPE_WIDGET_RATINGBAR = 20;
  static VIEW_TYPE_WIDGET_VIDEOVIEW = 21;
  static VIEW_TYPE_WIDGET_SEARCHVIEW = 22;
  static VIEW_TYPE_WIDGET_AUTOCOMPLETETEXTVIEW = 23;
  static VIEW_TYPE_WIDGET_MULTIAUTOCOMPLETETEXTVIEW = 24;
  static VIEW_TYPE_WIDGET_GRIDVIEW = 25;
  static VIEW_TYPE_WIDGET_ANALOGCLOCK = 26;
  static VIEW_TYPE_WIDGET_DATEPICKER = 27;
  static VIEW_TYPE_WIDGET_TIMEPICKER = 28;
  static VIEW_TYPE_WIDGET_DIGITALCLOCK = 29;
  static VIEW_TYPE_LAYOUT_TABLAYOUT = 30;
  static VIEW_TYPE_LAYOUT_VIEWPAGER = 31;
  static VIEW_TYPE_LAYOUT_BOTTOMNAVIGATIONVIEW = 32;
  static VIEW_TYPE_WIDGET_BADGEVIEW = 33;
  static VIEW_TYPE_WIDGET_PATTERNLOCKVIEW = 34;
  static VIEW_TYPE_WIDGET_WAVESIDEBAR = 35;
  static VIEW_TYPE_LAYOUT_CARDVIEW = 36;
  static VIEW_TYPE_LAYOUT_COLLAPSINGTOOLBARLAYOUT = 37;
  static VIEW_TYPE_LAYOUT_TEXTINPUTLAYOUT = 38;
  static VIEW_TYPE_LAYOUT_SWIPEREFRESHLAYOUT = 39;
  static VIEW_TYPE_LAYOUT_RADIOGROUP = 40;
  static VIEW_TYPE_WIDGET_MATERIALBUTTON = 41;
  static VIEW_TYPE_WIDGET_SIGNINBUTTON = 42;
  static VIEW_TYPE_WIDGET_CIRCLEIMAGEVIEW = 43;
  static VIEW_TYPE_WIDGET_LOTTIEANIMATIONVIEW = 44;
  static VIEW_TYPE_WIDGET_YOUTUBEPLAYERVIEW = 45;
  static VIEW_TYPE_WIDGET_OTPVIEW = 46;
  static VIEW_TYPE_WIDGET_CODEVIEW = 47;
  static VIEW_TYPE_WIDGET_RECYCLERVIEW = 48;

  static buildClassInfo(id: number): string {
    return ViewBeans.getViewTypeName(id);
  }
  static getViewTypeByTypeName(typeName: string): number {
    const t = viewTypeByName(typeName);
    return t >= 19 ? t : 0;
  }
  static getViewTypeName(id: number): string {
    return id >= 19 ? viewTypeName(id) : '';
  }
  static getViewTypeResId(id: number): number {
    return id;
  }
}

/** pro.sketchware.tools.ViewBeanParser (only the lookup used by the generator). */
export const ViewBeanParser = {
  getViewTypeByClassName: (cls: string) => viewTypeByName(cls.substring(cls.lastIndexOf('.') + 1)),
};
