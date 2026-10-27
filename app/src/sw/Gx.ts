// Auto-ported from Gx.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: mod.hilal.saif.components.ComponentsHandler
// <imports>
import { jiter } from '../codegen/jshim';
import { ComponentsHandler } from './ComponentsHandler';
// </imports>
export class Gx {
  className: string;
  classPath: string[];
  constructor(classInfo: string) {
        this.className = classInfo;
        this.classPath = null;
        this.initializeClassPath();
    }
  getClassName(): string {
        return this.className;
    }
  a_0(): string {
        return this.className;
    }
  a_Gx(gx: any): boolean {
        return this.a(gx.className);
    }
  a_String(classInfo: string): boolean {
        if (classInfo.equals("!") || classInfo.equals(this.className)) {
            return true;
        } else {
            for (const s of jiter(this.classPath)) {
                if (s.equals(classInfo)) return true;
            }
            return false;
        }
    }
  b_0(): boolean {
        return this.a("List");
    }
  b_String(classInfo: string): boolean {
        return this.className.equals(classInfo);
    }
  c(): boolean {
        return this.a("Var");
    }
  d(): boolean {
        return this.a("View");
    }
  initializeClassPath(): void {
        let classInfos = "";
        switch (this.className) {
            case "boolean":
                classInfos = "Var.boolean";
                break;

            case "double":
                classInfos = "Var.double";
                break;

            case "String":
                classInfos = "Var.String";
                break;

            case "Map":
                classInfos = "Var.Map";
                break;

            case "ListInt":
                classInfos = "List.ListInt";
                break;

            case "ListString":
                classInfos = "List.ListString";
                break;

            case "ListMap":
                classInfos = "List.ListMap";
                break;

            case "List":
                classInfos = "List";
                break;

            case "View":
                classInfos = "View";
                break;

            case "TextView":
                classInfos = "View.Clickable.TextView";
                break;

            case "Button":
                classInfos = "View.Clickable.TextView.Button";
                break;

            case "EditText":
                classInfos = "View.Clickable.TextView.EditText";
                break;

            case "ImageView":
                classInfos = "View.Clickable.ImageView";
                break;

            case "CheckBox":
                classInfos = "View.Clickable.TextView.Button.CompoundButton.CheckBox";
                break;

            case "Spinner":
                classInfos = "View.AdapterView.AbsSpinner.Spinner";
                break;

            case "ListView":
                classInfos = "View.AdapterView.AbsListView.ListView";
                break;

            case "WebView":
                classInfos = "View.AbsoluteLayout.WebView";
                break;

            case "Switch":
                classInfos = "View.Clickable.TextView.Button.CompoundButton.Switch";
                break;

            case "SeekBar":
                classInfos = "View.SeekBar";
                break;

            case "CalendarView":
                classInfos = "View.ViewGroup.FrameLayout.CalendarView";
                break;

            case "AdView":
                classInfos = "View.AdView";
                break;

            case "MapView":
                classInfos = "View.MapView";
                break;

            case "FloatingActionButton":
                classInfos = "View.Clickable.FloatingActionButton";
                break;

            case "LinearLayout":
                classInfos = "View.Clickable.ViewGroup.LinearLayout";
                break;

            case "RelativeLayout":
                classInfos = "View.Clickable.ViewGroup.RelativeLayout";
                break;

            case "ScrollView":
                classInfos = "View.ViewGroup.FrameLayout.ScrollView";
                break;

            case "HorizontalScrollView":
                classInfos = "View.ViewGroup.FrameLayout.HorizontalScrollView";
                break;

            case "ProgressBar":
                classInfos = "View.SeekBar.ProgressBar";
                break;

            case "RadioButton":
                classInfos = "View.Clickable.TextView.Button.CompoundButton.RadioButton";
                break;

            case "RatingBar":
                classInfos = "View.Clickable.RatingBar";
                break;

            case "SearchView":
                classInfos = "View.ViewGroup.LinearLayoutCompat.SearchView";
                break;

            case "VideoView":
                classInfos = "View.VideoView";
                break;

            case "AutoCompleteTextView":
                classInfos = "View.Clickable.TextView.EditText.AutoCompleteTextView";
                break;

            case "MultiAutoCompleteTextView":
                classInfos = "View.Clickable.TextView.EditText.MultiAutoCompleteTextView";
                break;

            case "GridView":
                classInfos = "View.ViewGroup.AdapterView.AbsListView.GridView";
                break;

            case "AnalogClock":
                classInfos = "View.Clickable.AnalogClock";
                break;

            case "DigitalClock":
                classInfos = "View.Clickable.DigitalClock";
                break;

            case "DatePicker":
                classInfos = "View.Clickable.DatePicker";
                break;

            case "TimePicker":
                classInfos = "View.Clickable.TimePicker";
                break;

            case "TabLayout":
                classInfos = "View.ViewGroup.FrameLayout.HorizontalScrollView.TabLayout";
                break;

            case "ViewPager":
                classInfos = "View.ViewGroup.ViewPager";
                break;

            case "BottomNavigationView":
                classInfos = "View.ViewGroup.BottomNavigationView";
                break;

            case "BadgeView":
                classInfos = "View.Clickable.FrameLayout.BadgeView";
                break;

            case "PatternLockView":
                classInfos = "View.PatternLockView";
                break;

            case "WaveSideBar":
                classInfos = "View.FrameLayout.RelativeLayout.WaveSideBar";
                break;

            case "SignInButton":
                classInfos = "View.Clickable.Button.SignInButton";
                break;

            case "MaterialButton":
                classInfos = "View.Clickable.TextView.Button";
                break;

            case "CircleImageView":
                classInfos = "View.Clickable.ImageView.CircleImageView";
                break;

            case "CollapsingToolbarLayout":
                classInfos = "View.ViewGroup.FrameLayout.CollapsingToolbarLayout";
                break;

            case "SwipeRefreshLayout":
                classInfos = "View.ViewGroup.SwipeRefreshLayout";
                break;

            case "TextInputLayout":
                classInfos = "View.ViewGroup.TextInputLayout";
                break;

            case "RadioGroup":
                classInfos = "View.ViewGroup.LinearLayout.RadioGroup";
                break;

            case "CardView":
                classInfos = "View.Clickable.ViewGroup.FrameLayout.CardView";
                break;

            case "LottieAnimationView":
                classInfos = "View.Clickable.LottieAnimation";
                break;

            case "YoutubePlayerView":
                classInfos = "View.Clickable.YoutubePlayer";
                break;

            case "OTPView":
                classInfos = "View.Clickable.OTPView";
                break;

            case "RecyclerView":
                classInfos = "View.ViewGroup.RecyclerView";
                break;

            case "TextToSpeech":
                classInfos = "Component.TextToSpeech";
                break;

            case "SpeechToText":
                classInfos = "Component.SpeechToText";
                break;

            case "BluetoothConnect":
                classInfos = "Component.BluetoothConnect";
                break;

            case "LocationManager":
                classInfos = "Component.LocationManager";
                break;

            case "Videos":
                classInfos = "Component.Videos";
                break;

            case "FirebaseCloudMessage":
                classInfos = "Component.FirebaseCloudMessage";
                break;

            case "TimePickerDialog":
                classInfos = "Component.TimePickerDialog";
                break;

            case "Notification":
                classInfos = "Component.Notification";
                break;

            case "ProgressDialog":
                classInfos = "Component.ProgressDialog";
                break;

            case "FirebaseGoogleLogin":
                classInfos = "Component.FirebaseGoogleLogin";
                break;

            case "PopupMenu":
                classInfos = "Component.PopupMenu";
                break;

            case "DatePickerDialog":
                classInfos = "Component.DatePickerDialog";
                break;

            case "FirebasePhoneAuth":
                classInfos = "Component.FirebasePhoneAuth";
                break;

            case "MediaController":
                classInfos = "Component.MediaController";
                break;

            case "Intent":
                classInfos = "Component.Intent";
                break;

            case "SharedPreferences":
                classInfos = "Component.SharedPreferences";
                break;

            case "Calendar":
                classInfos = "Component.Calendar";
                break;

            case "Vibrator":
                classInfos = "Component.Vibrator";
                break;

            case "Timer":
                classInfos = "Component.Timer";
                break;

            case "Dialog":
                classInfos = "Component.Dialog";
                break;

            case "MediaPlayer":
                classInfos = "Component.MediaPlayer";
                break;

            case "SoundPool":
                classInfos = "Component.SoundPool";
                break;

            case "ObjectAnimator":
                classInfos = "Component.ObjectAnimator";
                break;

            case "FirebaseDB":
                classInfos = "Component.FirebaseDB";
                break;

            case "FirebaseAuth":
                classInfos = "Component.FirebaseAuth";
                break;

            case "Gyroscope":
                classInfos = "Component.Gyroscope";
                break;

            case "FirebaseStorage":
                classInfos = "Component.FirebaseStorage";
                break;

            case "Camera":
                classInfos = "Component.Camera";
                break;

            case "FilePicker":
                classInfos = "Component.FilePicker";
                break;

            case "RequestNetwork":
                classInfos = "Component.RequestNetwork";
                break;

            default:
                classInfos = ComponentsHandler.getClassByTypeName(this.className);
        }

        this.classPath = classInfos.jsplit("\\.");
    }
  a(...args: any[]): any {
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) return this.a_String.apply(this, args as any);
    if (args.length === 1) return this.a_Gx.apply(this, args as any);
    if (args.length === 0) return this.a_0.apply(this, args as any);
    throw new Error('no overload of a for ' + args.length);
  }
  b(...args: any[]): any {
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) return this.b_String.apply(this, args as any);
    if (args.length === 0) return this.b_0.apply(this, args as any);
    throw new Error('no overload of b for ' + args.length);
  }
}