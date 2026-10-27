// a.a.a.kq helpers: block type for a menu name and the human-readable menu prefix ("TextView : ").

/** kq.a(String): block type character for a %m.<name> variable reporter. */
export function blockTypeForMenu(name: string): string {
  switch (name) {
    case 'spinner': case 'adview': case 'textview': case 'switch': case 'imageview': case 'calendarview': case 'view':
    case 'progressbar': case 'webview': case 'listview': case 'checkbox': case 'edittext': case 'mapview':
      return 'v';
    case 'soundpool': case 'requestnetwork': case 'objectanimator': case 'dialog': case 'texttospeech':
    case 'intent': case 'locationmanager': case 'firebase': case 'speechtotext': case 'calendar': case 'file':
    case 'firebaseauth': case 'timer': case 'gyroscope': case 'mediaplayer': case 'bluetoothconnect':
    case 'vibrator': case 'firebasestorage': case 'phoneauth': case 'googlelogin': case 'cloudmessage':
      return 'p';
    case 'varMap':
      return 'a';
    case 'listInt': case 'listMap': case 'listStr':
      return 'l';
    default:
      return 'v';
  }
}

/** kq.a(int): list type name. */
export function listTypeName(t: number): string {
  return t === 1 ? 'List Number' : t === 2 ? 'List String' : t === 3 ? 'List Map' : '';
}

const MENU_NAMES: Record<string, string> = {
  spinner: 'Spinner', tablayout: 'TabLayout', soundpool: 'SoundPool', requestnetwork: 'RequestNetwork', filepicker: 'FilePicker',
  patternview: 'PatternLockView', objectanimator: 'ObjectAnimator', viewpager: 'ViewPager', adview: 'AdView',
  progressdialog: 'ProgressDialog', camera: 'Camera', dialog: 'Dialog', datepickerdialog: 'DatePickerDialog',
  texttospeech: 'TextToSpeech', intent: 'Intent', textview: 'TextView', locationmanager: 'LocationManager', switch: 'Switch',
  imageview: 'ImageView', varInt: 'Number', varMap: 'Map', varStr: 'String', searchview: 'SearchView', firebase: 'Firebase DB',
  bottomnavigation: 'BottomNavigation', calendarview: 'CalendarView', speechtotext: 'SpeechToText', calendar: 'Calendar',
  actv: 'AutoComplete', file: 'SharedPreferences', list: 'List', view: 'View', radiobutton: 'RadioButton',
  firebaseauth: 'Firebase Auth', mactv: 'MultiAutoComplete', timer: 'Timer', listInt: 'List Number', listMap: 'List Map',
  listStr: 'List String', varBool: 'Boolean', gridview: 'GridView', gyroscope: 'Gyroscope', ratingbar: 'RatingBar',
  videoad: 'VideoAd', mediaplayer: 'MediaPlayer', notification: 'Notification', bluetoothconnect: 'BluetoothConnect',
  mapview: 'MapView', vibrator: 'Vibrator', progressbar: 'ProgressBar', webview: 'WebView', interstitialad: 'InterstitialAd',
  videoview: 'VideoView', listBool: 'List Boolean', listview: 'ListView', checkbox: 'CheckBox', edittext: 'EditText',
  firebasestorage: 'FirebaseStorage', timepickerdialog: 'TimePickerDialog', seekbar: 'SeekBar', sidebar: 'WaveSideBar',
  badgeview: 'BadgeView', circleimageview: 'CircleImageView', customViews: 'CustomView', asynctask: 'AsyncTask',
  activity: 'Context', otpview: 'OTPView', lottie: 'LottieAnimation', phoneauth: 'FirebasePhoneAuth', codeview: 'CodeView',
  recyclerview: 'RecyclerView', resource: 'Image', googlelogin: 'FirebaseGoogleSignIn', youtubeview: 'YoutubePlayer',
  cardview: 'CardView', radiogroup: 'RadioGroup', color: 'Color', textinputlayout: 'TextInputLayout',
  collapsingtoolbar: 'CollapsingToolbarLayout', cloudmessage: 'FirebaseCloudMessage', resource_bg: 'BackgroundImage',
  datepicker: 'DatePicker', timepicker: 'TimePicker', swiperefreshlayout: 'SwipeRefreshLayout', signinbutton: 'SignInButton',
  materialButton: 'MaterialButton', fragmentAdapter: 'FragmentAdapter',
  // DefaultExtraMenuBean.getName
  image: 'Custom Image', til_box_mode: 'Box Mode', fabsize: 'Fab Size', fabvisible: 'Fab Visible', menuaction: 'Menu Action',
  porterduff: 'Porterduff Mode', transcriptmode: 'Transcript Mode', listscrollparam: 'Scroll Param', recyclerscrollparam: 'Scroll Param',
  pagerscrollparam: 'Scroll Param', gridstretchmode: 'Stretch Mode', gravity_v: 'Gravity Vertical', gravity_h: 'Gravity Horizontal',
  gravity_t: 'Gravity Toast', patternviewmode: 'Pattern Mode', styleprogress: 'Progress Style', cv_theme: 'Theme',
  cv_language: 'Language', import: 'Import', permissions: 'Permissions',
};

/** kq.b(String): placeholder name shown at the left of a dropdown input. */
export function menuDisplayName(typeName: string): string {
  return MENU_NAMES[typeName] ?? typeName;
}
