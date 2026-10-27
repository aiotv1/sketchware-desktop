// Palette widgets with the exact default beans of Sketchware's Icon*.getBean().
import { ViewBean } from '../../core/beans';
import { wq } from '../../sw/wq';
import { ProjectData } from '../../core/project';

export interface WidgetDef {
  label: string;
  group: 'Layouts' | 'Widgets' | 'AndroidX' | 'Library' | 'Google';
  icon: string;
  make: () => ViewBean;
  /** set for widgets made with "Create a widget": their ids come from the class name */
  idBase?: string;
}

function vb(type: number, convert: string, f?: (v: ViewBean) => void, pad = 8): ViewBean {
  const v = new ViewBean();
  v.type = type;
  v.layout.paddingLeft = v.layout.paddingTop = v.layout.paddingRight = v.layout.paddingBottom = pad;
  v.convert = convert;
  f?.(v);
  return v;
}

export const WIDGETS: WidgetDef[] = [
  { label: 'Linear(H)', group: 'Layouts', icon: '▭', make: () => vb(0, 'LinearLayout', (v) => ((v.layout.orientation = 0), (v.layout.width = -1))) },
  { label: 'Linear(V)', group: 'Layouts', icon: '▯', make: () => vb(0, 'LinearLayout', (v) => ((v.layout.orientation = 1), (v.layout.height = -1))) },
  { label: 'RelativeLayout', group: 'Layouts', icon: '▣', make: () => vb(1, 'RelativeLayout', (v) => (v.layout.width = -1)) },
  { label: 'Scroll(H)', group: 'Layouts', icon: '⇔', make: () => vb(2, 'HorizontalScrollView', (v) => (v.layout.width = -1)) },
  { label: 'Scroll(V)', group: 'Layouts', icon: '⇕', make: () => vb(12, 'ScrollView', (v) => (v.layout.height = -1)) },
  { label: 'CardView', group: 'AndroidX', icon: '▢', make: () => vb(36, 'androidx.cardview.widget.CardView', (v) => ((v.layout.orientation = 1), (v.layout.width = -1), (v.inject = 'app:cardElevation="2dp"\napp:cardCornerRadius="20dp"'))) },
  { label: 'RadioGroup', group: 'Layouts', icon: '◉', make: () => vb(40, 'RadioGroup', (v) => ((v.layout.orientation = 0), (v.layout.width = -1))) },
  { label: 'TextInputLayout', group: 'AndroidX', icon: '⌨', make: () => vb(38, 'com.google.android.material.textfield.TextInputLayout', (v) => ((v.layout.orientation = 1), (v.layout.width = -1), (v.inject = 'style="@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox"')), 0) },
  { label: 'SwipeRefreshLayout', group: 'AndroidX', icon: '⟳', make: () => vb(39, 'androidx.swiperefreshlayout.widget.SwipeRefreshLayout', (v) => ((v.layout.orientation = 1), (v.layout.width = -1), (v.layout.height = -1))) },
  { label: 'CollapsingToolbar', group: 'AndroidX', icon: '▤', make: () => vb(37, 'com.google.android.material.appbar.CollapsingToolbarLayout', (v) => ((v.layout.orientation = 1), (v.layout.width = -1), (v.inject = 'android:fitsSystemWindows="true"\napp:layout_scrollFlags="scroll|exitUntilCollapsed"'))) },
  { label: 'Button', group: 'Widgets', icon: '⏺', make: () => vb(3, 'Button', (v) => (v.text.text = 'Button')) },
  { label: 'TextView', group: 'Widgets', icon: 'T', make: () => vb(4, 'TextView', (v) => (v.text.text = 'TextView')) },
  { label: 'EditText', group: 'Widgets', icon: '✎', make: () => vb(5, 'EditText', (v) => (v.text.hint = 'EditText')) },
  { label: 'ImageView', group: 'Widgets', icon: '🖼', make: () => { const v = new ViewBean(); v.type = 6; v.convert = 'ImageView'; v.image.resName = 'default_image'; return v; } },
  { label: 'ListView', group: 'Widgets', icon: '☰', make: () => vb(9, 'ListView', (v) => ((v.layout.width = -1), (v.text.text = 'ListView'))) },
  { label: 'Spinner', group: 'Widgets', icon: '▾', make: () => vb(10, 'Spinner', (v) => ((v.layout.width = -1), (v.layout.height = -2))) },
  { label: 'CheckBox', group: 'Widgets', icon: '☑', make: () => vb(11, 'CheckBox', (v) => (v.text.text = 'CheckBox')) },
  { label: 'RadioButton', group: 'Widgets', icon: '◎', make: () => vb(19, 'RadioButton', (v) => (v.text.text = 'RadioButton')) },
  { label: 'Switch', group: 'Widgets', icon: '⊙', make: () => vb(13, 'Switch', (v) => (v.text.text = 'Switch')) },
  { label: 'SeekBar', group: 'Widgets', icon: '━', make: () => vb(14, 'SeekBar', (v) => ((v.layout.width = -1), (v.text.text = 'SeekBar'))) },
  { label: 'ProgressBar', group: 'Widgets', icon: '◌', make: () => vb(8, 'ProgressBar', (v) => ((v.layout.width = -1), (v.text.text = 'ProgressBar'))) },
  { label: 'RatingBar', group: 'Widgets', icon: '★', make: () => vb(20, 'RatingBar', (v) => (v.text.text = 'RatingBar')) },
  { label: 'WebView', group: 'Widgets', icon: '🌐', make: () => vb(7, 'WebView', (v) => ((v.layout.width = -1), (v.layout.height = -1)), 0) },
  { label: 'VideoView', group: 'Widgets', icon: '▶', make: () => vb(21, 'VideoView', (v) => (v.text.text = 'VideoView')) },
  { label: 'SearchView', group: 'Widgets', icon: '⌕', make: () => vb(22, 'SearchView', (v) => ((v.layout.width = -1), (v.text.hint = 'SearchView'), (v.text.hintColor = 0xff607d8b | 0))) },
  { label: 'AutoCompleteTextView', group: 'Widgets', icon: '✎', make: () => vb(23, 'AutoCompleteTextView', (v) => (v.text.hint = 'AutoCompleteTextView')) },
  { label: 'MultiAutoCompleteTextView', group: 'Widgets', icon: '✎', make: () => vb(24, 'MultiAutoCompleteTextView', (v) => (v.text.hint = 'MultiAutoCompleteTextView')) },
  { label: 'GridView', group: 'Widgets', icon: '▦', make: () => vb(25, 'GridView', (v) => ((v.layout.orientation = 0), (v.layout.width = -1), (v.inject = 'android:numColumns="3"\nandroid:stretchMode="columnWidth"'))) },
  { label: 'CalendarView', group: 'Widgets', icon: '📅', make: () => vb(15, 'CalendarView', (v) => ((v.layout.width = -1), (v.layout.height = -1))) },
  { label: 'DatePicker', group: 'Widgets', icon: '📆', make: () => vb(27, 'DatePicker', (v) => (v.layout.width = -1)) },
  { label: 'TimePicker', group: 'Widgets', icon: '🕑', make: () => vb(28, 'TimePicker', (v) => (v.layout.width = -1)) },
  { label: 'AnalogClock', group: 'Widgets', icon: '🕓', make: () => vb(26, 'AnalogClock', (v) => (v.text.text = 'AnalogClock')) },
  { label: 'DigitalClock', group: 'Widgets', icon: '⏲', make: () => vb(29, 'DigitalClock', (v) => (v.text.text = 'DigitalClock')) },
  { label: 'RecyclerView', group: 'AndroidX', icon: '☷', make: () => vb(48, 'androidx.recyclerview.widget.RecyclerView', (v) => ((v.layout.orientation = 1), (v.layout.width = -1), (v.layout.height = -2))) },
  { label: 'ViewPager', group: 'AndroidX', icon: '⧉', make: () => vb(31, 'androidx.viewpager.widget.ViewPager', (v) => ((v.layout.width = -1), (v.layout.height = -1), (v.text.text = 'ViewPager'))) },
  { label: 'TabLayout', group: 'AndroidX', icon: '⊟', make: () => { const v = new ViewBean(); v.type = 30; v.layout.width = -1; v.layout.backgroundColor = 0xff008dcd | 0; v.convert = 'com.google.android.material.tabs.TabLayout'; v.inject = 'app:tabGravity="fill"\napp:tabMode="fixed"\napp:tabIndicatorHeight="3dp"\napp:tabIndicatorColor="@android:color/white"\napp:tabSelectedTextColor="@android:color/white"\napp:tabTextColor="@android:color/white"\napp:tabTextAppearance="@android:style/TextAppearance.Widget.TabWidget"'; return v; } },
  { label: 'BottomNavigationView', group: 'AndroidX', icon: '▁', make: () => vb(32, 'com.google.android.material.bottomnavigation.BottomNavigationView', (v) => ((v.layout.width = -1), (v.text.text = 'BottomNavigationView')), 0) },
  { label: 'MaterialButton', group: 'AndroidX', icon: '⏺', make: () => vb(41, 'com.google.android.material.button.MaterialButton', (v) => ((v.layout.orientation = 1), (v.layout.gravity = 17), (v.text.textColor = 0xffffffff | 0), (v.text.text = 'MaterialButton'), (v.inject = 'app:cornerRadius="8dp"'))) },
  { label: 'CircleImageView', group: 'Library', icon: '◯', make: () => { const v = new ViewBean(); v.type = 43; v.convert = 'de.hdodenhof.circleimageview.CircleImageView'; v.inject = 'app:civ_border_width="3dp"\napp:civ_border_color="#008DCD"\napp:civ_circle_background_color="#FFFFFF"\napp:civ_border_overlay="true"'; v.image.resName = 'default_image'; return v; } },
  { label: 'BadgeView', group: 'Library', icon: '❶', make: () => { const v = new ViewBean(); v.type = 33; v.text.text = 'BadgeView'; v.convert = 'com.allenliu.badgeview.BadgeView'; return v; } },
  { label: 'PatternLockView', group: 'Library', icon: '⁘', make: () => vb(34, 'com.andrognito.patternlockview.PatternLockView', (v) => ((v.layout.width = -1), (v.text.text = 'PatternLockView'))) },
  { label: 'WaveSideBar', group: 'Library', icon: '≡', make: () => { const v = new ViewBean(); v.type = 35; v.layout.height = -1; v.text.text = 'WaveSideBar'; v.text.textSize = 16; v.text.textColor = 0xff008dcd | 0; v.convert = 'com.sayuti.lib.WaveSideBar'; v.inject = 'app:sidebar_text_alignment="center"\napp:sidebar_position="left"\napp:sidebar_max_offset="80dp"'; return v; } },
  { label: 'Lottie', group: 'Library', icon: '✺', make: () => vb(44, 'com.airbnb.lottie.LottieAnimationView', (v) => ((v.layout.orientation = 1), (v.inject = 'android:scaleType="fitCenter"\nandroid:layout_centerInParent="true"\napp:lottie_fileName="your_file.json"\napp:lottie_loop="true" \napp:lottie_autoPlay="true"'))) },
  { label: 'OTPView', group: 'Library', icon: '▪▪▪', make: () => vb(46, 'affan.ahmad.otp.OTPView', (v) => ((v.layout.orientation = 1), (v.layout.width = -1))) },
  { label: 'CodeView', group: 'Library', icon: '</>', make: () => vb(47, 'br.tiagohm.codeview.CodeView', (v) => ((v.layout.orientation = 1), (v.layout.width = -1), (v.layout.height = -2))) },
  { label: 'YoutubePlayer', group: 'Library', icon: '▶', make: () => { const v = new ViewBean(); v.type = 45; v.layout.width = -1; v.text.text = 'YoutubePlayer'; v.convert = 'com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView'; v.inject = 'app:autoPlay="false"\napp:useWebUi="false"\napp:showYouTubeButton="true"\napp:showFullScreenButton="true"\napp:showVideoCurrentTime="true"\napp:showVideoDuration="true"\napp:showSeekBar="true"\napp:handleNetworkEvents="false"\napp:enableAutomaticInitialization="true"'; return v; } },
  { label: 'AdView', group: 'Google', icon: 'Ad', make: () => vb(17, 'com.google.android.gms.ads.AdView', (v) => ((v.layout.width = -1), (v.adSize = 'SMART_BANNER'), (v.adUnitId = 'debug : ca-app-pub-3940256099942544/6300978111')), 0) },
  { label: 'MapView', group: 'Google', icon: '🗺', make: () => vb(18, 'com.google.android.gms.maps.MapView', (v) => ((v.layout.width = -1), (v.layout.height = -1)), 0) },
  { label: 'SignInButton', group: 'Google', icon: 'G', make: () => vb(42, 'com.google.android.gms.common.SignInButton', (v) => (v.layout.orientation = 1), 0) },
];

export const LAYOUT_TYPES = new Set([0, 1, 2, 12, 36, 37, 38, 39, 40]);

/** Next free id like "textview3" (wq.b(type) + number), unique in the whole project. */
export function nextViewId(p: ProjectData, type: number, customBase?: string): string {
  const base = customBase ?? wq.b(type);
  const used = new Set<string>();
  for (const list of p.views.values()) for (const v of list) used.add(v.id);
  let i = 1;
  while (used.has(base + i)) i++;
  return base + i;
}
