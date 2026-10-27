// View type ids and names (ViewBean + mod.agus.jcoderz.beans.ViewBeans).
import { Gx } from './Gx';
import type { ViewBean } from '../core/beans';

export const VT = {
  LINEAR: 0,
  RELATIVE: 1,
  HSCROLL: 2,
  BUTTON: 3,
  TEXTVIEW: 4,
  EDITTEXT: 5,
  IMAGEVIEW: 6,
  WEBVIEW: 7,
  PROGRESSBAR: 8,
  LISTVIEW: 9,
  SPINNER: 10,
  CHECKBOX: 11,
  VSCROLL: 12,
  SWITCH: 13,
  SEEKBAR: 14,
  CALENDARVIEW: 15,
  FAB: 16,
  ADVIEW: 17,
  MAPVIEW: 18,
  RADIOBUTTON: 19,
  RATINGBAR: 20,
  VIDEOVIEW: 21,
  SEARCHVIEW: 22,
  AUTOCOMPLETE: 23,
  MULTIAUTOCOMPLETE: 24,
  GRIDVIEW: 25,
  ANALOGCLOCK: 26,
  DATEPICKER: 27,
  TIMEPICKER: 28,
  DIGITALCLOCK: 29,
  TABLAYOUT: 30,
  VIEWPAGER: 31,
  BOTTOMNAV: 32,
  BADGEVIEW: 33,
  PATTERNLOCK: 34,
  WAVESIDEBAR: 35,
  CARDVIEW: 36,
  COLLAPSINGTOOLBAR: 37,
  TEXTINPUTLAYOUT: 38,
  SWIPEREFRESH: 39,
  RADIOGROUP: 40,
  MATERIALBUTTON: 41,
  SIGNINBUTTON: 42,
  CIRCLEIMAGEVIEW: 43,
  LOTTIE: 44,
  YOUTUBE: 45,
  OTPVIEW: 46,
  CODEVIEW: 47,
  RECYCLERVIEW: 48,
} as const;

const TYPE_NAMES: Record<number, string> = {
  0: 'LinearLayout', 1: 'RelativeLayout', 2: 'HScrollView', 3: 'Button', 4: 'TextView', 5: 'EditText', 6: 'ImageView',
  7: 'WebView', 8: 'ProgressBar', 9: 'ListView', 10: 'Spinner', 11: 'CheckBox', 12: 'ScrollView', 13: 'Switch',
  14: 'SeekBar', 15: 'CalendarView', 17: 'AdView', 18: 'MapView',
  19: 'RadioButton', 20: 'RatingBar', 21: 'VideoView', 22: 'SearchView', 23: 'AutoCompleteTextView',
  24: 'MultiAutoCompleteTextView', 25: 'GridView', 26: 'AnalogClock', 27: 'DatePicker', 28: 'TimePicker',
  29: 'DigitalClock', 30: 'TabLayout', 31: 'ViewPager', 32: 'BottomNavigationView', 33: 'BadgeView',
  34: 'PatternLockView', 35: 'WaveSideBar', 36: 'CardView', 37: 'CollapsingToolbarLayout', 38: 'TextInputLayout',
  39: 'SwipeRefreshLayout', 40: 'RadioGroup', 41: 'MaterialButton', 42: 'SignInButton', 43: 'CircleImageView',
  44: 'LottieAnimationView', 45: 'YoutubePlayerView', 46: 'OTPView', 47: 'CodeView', 48: 'RecyclerView',
};

/** ViewBean.getViewTypeName */
export function viewTypeName(type: number): string {
  return TYPE_NAMES[type] ?? '';
}

/** ViewBean.getViewTypeByTypeName */
export function viewTypeByName(name: string): number {
  for (const k of Object.keys(TYPE_NAMES)) if (TYPE_NAMES[+k] === name) return +k;
  if (name === 'FloatingActionButton') return 16;
  return 0;
}

/** ViewBean.buildClassInfo(type) class name (differs for scroll views / fab). */
export function classNameOfType(type: number): string {
  switch (type) {
    case 2:
      return 'HorizontalScrollView';
    case 12:
      return 'ScrollView';
    case 16:
      return 'FloatingActionButton';
    default:
      return TYPE_NAMES[type] ?? '';
  }
}

export function classInfoOfView(v: ViewBean): Gx {
  return new Gx(classNameOfType(v.type));
}

export function isLayoutType(type: number): boolean {
  return [0, 1, 2, 12, 36, 37, 38, 39, 40].includes(type);
}

/** Widgets the Sketchware designer offers, grouped like its palette. */
export const PALETTE_LAYOUTS: { type: number; label: string }[] = [
  { type: 0, label: 'LinearLayout (H)' },
  { type: 0, label: 'LinearLayout (V)' },
  { type: 12, label: 'ScrollView (V)' },
  { type: 2, label: 'ScrollView (H)' },
  { type: 36, label: 'CardView' },
  { type: 40, label: 'RadioGroup' },
  { type: 38, label: 'TextInputLayout' },
  { type: 39, label: 'SwipeRefreshLayout' },
  { type: 37, label: 'CollapsingToolbar' },
  { type: 1, label: 'RelativeLayout' },
];

export const PALETTE_WIDGETS: { type: number; label: string }[] = [
  { type: 3, label: 'Button' },
  { type: 41, label: 'MaterialButton' },
  { type: 4, label: 'TextView' },
  { type: 5, label: 'EditText' },
  { type: 6, label: 'ImageView' },
  { type: 43, label: 'CircleImageView' },
  { type: 9, label: 'ListView' },
  { type: 48, label: 'RecyclerView' },
  { type: 25, label: 'GridView' },
  { type: 10, label: 'Spinner' },
  { type: 11, label: 'CheckBox' },
  { type: 19, label: 'RadioButton' },
  { type: 13, label: 'Switch' },
  { type: 14, label: 'SeekBar' },
  { type: 8, label: 'ProgressBar' },
  { type: 20, label: 'RatingBar' },
  { type: 7, label: 'WebView' },
  { type: 21, label: 'VideoView' },
  { type: 22, label: 'SearchView' },
  { type: 23, label: 'AutoCompleteTextView' },
  { type: 24, label: 'MultiAutoCompleteTextView' },
  { type: 15, label: 'CalendarView' },
  { type: 27, label: 'DatePicker' },
  { type: 28, label: 'TimePicker' },
  { type: 26, label: 'AnalogClock' },
  { type: 29, label: 'DigitalClock' },
  { type: 30, label: 'TabLayout' },
  { type: 31, label: 'ViewPager' },
  { type: 32, label: 'BottomNavigationView' },
  { type: 17, label: 'AdView' },
  { type: 18, label: 'MapView' },
  { type: 42, label: 'SignInButton' },
  { type: 33, label: 'BadgeView' },
  { type: 34, label: 'PatternLockView' },
  { type: 35, label: 'WaveSideBar' },
  { type: 44, label: 'LottieAnimationView' },
  { type: 45, label: 'YoutubePlayerView' },
  { type: 46, label: 'OTPView' },
  { type: 47, label: 'CodeView' },
];
