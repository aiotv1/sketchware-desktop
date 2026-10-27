// Auto-ported from BuiltInLibraries.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.os.Parcel, android.os.Parcelable, androidx.annotation.NonNull, java.io.File, java.io.IOException, java.util.List, java.util.Objects, java.util.Optional, a.a.a.Jp, a.a.a.KB, a.a.a.ProjectBuilder, a.a.a.oB, pro.sketchware.SketchApplication
// <imports>
import { jlistOf, jiter } from '../codegen/jshim';
import { Jp } from './Jp';
import { File, IOException, IllegalArgumentException, JFile, Objects, Optional, RuntimeException, SketchApplication, getContext } from './env';
import { KB, ProjectBuilder, oB } from './platform';
// </imports>
export class BuiltInLibraries_BuiltInLibrary {
  name: string;
  dependencyNames: any;
  packageName: string;
  hasResources$: boolean;
  init_String_List_String(name: string, dependencyNames: any, packageName: string) {
            this.name = name;
            this.dependencyNames = dependencyNames;
            this.packageName = packageName;
            this.hasResources$ = packageName != null;
        }
  init_String_List(name: string, dependencyNames: any) {
            this.__ctor(name, dependencyNames, null);
        }
  init_String(name: string) {
            this.__ctor(name, jlistOf());
        }
  static ofName(name: string): any {
            for (const builtInLibrary of jiter(BuiltInLibraries.KNOWN_BUILT_IN_LIBRARIES)) {
                if (builtInLibrary.getName().equals(name)) {
                    return Optional.of(builtInLibrary);
                }
            }

            return Optional.empty();
        }
  getName(): string {
            return this.name;
        }
  getDependencyNames(): any {
            return this.dependencyNames;
        }
  getPackageName(): any {
            return this.packageName == null ? Optional.empty() : Optional.of(this.packageName);
        }
  hasResources(): boolean {
            return this.hasResources$;
        }
  equals(o: any): boolean {
            if (this == o) return true;
            if (o == null || this.constructor != o.constructor) return false;
            let that = o;
            return this.name.equals(that.name);
        }
  hashCode(): number {
            return Objects.hash(this.name);
        }
  toString(): string {
            return "BuiltInLibrary{" +
                    "name='" + this.name + "\'" +
                    ", dependencyNames=" + this.dependencyNames +
                    ", packageName='" + this.packageName + "\'" +
                    ", hasResources=" + this.hasResources$ +
                    "}";
        }
  constructor(...args: any[]) { this.__ctor(...args); }
  __ctor(...args: any[]) {
    if (args.length === 3 && (args[0] == null || typeof args[0] === 'string') && (args[2] == null || typeof args[2] === 'string')) { this.init_String_List_String.apply(this, args as any); return; }
    if (args.length === 2 && (args[0] == null || typeof args[0] === 'string')) { this.init_String_List.apply(this, args as any); return; }
    if (args.length === 1 && (args[0] == null || typeof args[0] === 'string')) { this.init_String.apply(this, args as any); return; }
    
  }
}
export class BuiltInLibraries {
  static EXTRACTED_COMPILE_ASSETS_PATH: any = new JFile(SketchApplication.getContext().getFilesDir(), "libs");
  static EXTRACTED_BUILT_IN_LIBRARIES_PATH: any = new JFile(BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH, "libs");
  static EXTRACTED_BUILT_IN_LIBRARY_DEX_FILES_PATH: any = new JFile(BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH, "dexs");
  static ANDROIDX_ACTIVITY: string = "activity-1.11.0";
  static ANDROIDX_ANNOTATION_EXPERIMENTAL: string = "annotation-experimental-1.4.1";
  static ANDROIDX_ANNOTATION_JVM: string = "annotation-jvm-1.9.1";
  static ANDROIDX_APPCOMPAT: string = "appcompat-1.7.1";
  static ANDROIDX_APPCOMPAT_RESOURCES: string = "appcompat-resources-1.7.1";
  static ANDROIDX_ASYNCLAYOUTINFLATER: string = "asynclayoutinflater-1.0.0";
  static ANDROIDX_BROWSER: string = "browser-1.4.0";
  static ANDROIDX_CARDVIEW: string = "cardview-1.0.0";
  static ANDROIDX_COLLECTION_JVM: string = "collection-jvm-1.4.2";
  static ANDROIDX_CONCURRENT_FUTURES: string = "concurrent-futures-1.0.0";
  static ANDROIDX_CONSTRAINTLAYOUT: string = "constraintlayout-2.2.1";
  static ANDROIDX_CONSTRAINTLAYOUT_CORE: string = "constraintlayout-core-1.1.1";
  static ANDROIDX_COORDINATORLAYOUT: string = "coordinatorlayout-1.3.0";
  static ANDROIDX_CORE: string = "core-1.17.0";
  static ANDROIDX_CORE_COMMON: string = "core-common-2.2.0";
  static ANDROIDX_CORE_KTX: string = "core-ktx-1.17.0";
  static ANDROIDX_CORE_RUNTIME: string = "core-runtime-2.2.0";
  static ANDROIDX_CORE_VIEWTREE: string = "core-viewtree-1.0.0";
  static ANDROIDX_CURSORADAPTER: string = "cursoradapter-1.0.0";
  static ANDROIDX_CUSTOMVIEW: string = "customview-1.1.0";
  static ANDROIDX_CUSTOMVIEW_POOLINGCONTAINER: string = "customview-poolingcontainer-1.0.0";
  static ANDROIDX_DOCUMENTFILE: string = "documentfile-1.0.0";
  static ANDROIDX_DRAWERLAYOUT: string = "drawerlayout-1.1.1";
  static ANDROIDX_DYNAMICANIMATION: string = "dynamicanimation-1.1.0";
  static ANDROIDX_EMOJI2: string = "emoji2-1.3.0";
  static ANDROIDX_EMOJI2_VIEWS_HELPER: string = "emoji2-views-helper-1.3.0";
  static ANDROIDX_EXIFINTERFACE: string = "exifinterface-1.3.6";
  static ANDROIDX_FRAGMENT: string = "fragment-1.6.1";
  static ANDROIDX_GRAPHICS_SHAPES_ANDROID: string = "graphics-shapes-android-1.0.1";
  static ANDROIDX_INTERPOLATOR: string = "interpolator-1.0.0";
  static ANDROIDX_LEGACY_SUPPORT_CORE_UI: string = "legacy-support-core-ui-1.0.0";
  static ANDROIDX_LEGACY_SUPPORT_CORE_UTILS: string = "legacy-support-core-utils-1.0.0";
  static ANDROIDX_LEGACY_SUPPORT_V13: string = "legacy-support-v13-1.0.0";
  static ANDROIDX_LEGACY_SUPPORT_V4: string = "legacy-support-v4-1.0.0";
  static ANDROIDX_LIFECYCLE_COMMON: string = "lifecycle-common-2.6.2";
  static ANDROIDX_LIFECYCLE_LIVEDATA: string = "lifecycle-livedata-2.6.2";
  static ANDROIDX_LIFECYCLE_LIVEDATA_CORE: string = "lifecycle-livedata-core-2.6.2";
  static ANDROIDX_LIFECYCLE_PROCESS: string = "lifecycle-process-2.6.2";
  static ANDROIDX_LIFECYCLE_RUNTIME: string = "lifecycle-runtime-2.6.2";
  static ANDROIDX_LIFECYCLE_SERVICE: string = "lifecycle-service-2.6.2";
  static ANDROIDX_LIFECYCLE_VIEWMODEL: string = "lifecycle-viewmodel-2.6.2";
  static ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE: string = "lifecycle-viewmodel-savedstate-2.6.2";
  static ANDROIDX_LOADER: string = "loader-1.0.0";
  static ANDROIDX_LOCALBROADCASTMANAGER: string = "localbroadcastmanager-1.0.0";
  static ANDROIDX_MEDIA: string = "media-1.0.0";
  static ANDROIDX_MULTIDEX: string = "multidex-2.0.1";
  static ANDROIDX_RECYCLERVIEW: string = "recyclerview-1.4.0";
  static ANDROIDX_ROOM_COMMON: string = "room-common-2.2.5";
  static ANDROIDX_ROOM_RUNTIME: string = "room-runtime-2.2.5";
  static ANDROIDX_SAVEDSTATE: string = "savedstate-1.2.1";
  static ANDROIDX_SLIDINGPANELAYOUT: string = "slidingpanelayout-1.0.0";
  static ANDROIDX_SQLITE: string = "sqlite-2.1.0";
  static ANDROIDX_SQLITE_FRAMEWORK: string = "sqlite-framework-2.1.0";
  static ANDROIDX_STARTUP_RUNTIME: string = "startup-runtime-1.2.0";
  static ANDROIDX_SWIPEREFRESHLAYOUT: string = "swiperefreshlayout-1.0.0";
  static ANDROIDX_TRACING: string = "tracing-1.2.0";
  static ANDROIDX_TRANSITION: string = "transition-1.5.0";
  static ANDROIDX_VECTORDRAWABLE: string = "vectordrawable-1.1.0";
  static ANDROIDX_VECTORDRAWABLE_ANIMATED: string = "vectordrawable-animated-1.1.0";
  static ANDROIDX_VERSIONEDPARCELABLE: string = "versionedparcelable-1.1.1";
  static ANDROIDX_VIEWPAGER: string = "viewpager-1.0.0";
  static ANDROIDX_VIEWPAGER2: string = "viewpager2-1.1.0-beta02";
  static ANDROIDX_WORK_RUNTIME: string = "work-runtime-2.7.0";
  static ANDROID_YOUTUBE_PLAYER: string = "android-youtube-player-10.0.5";
  static AUTO_VALUE_ANNOTATIONS: string = "auto-value-annotations-1.6.5";
  static CIRCLEIMAGEVIEW: string = "circleimageview-3.1.0";
  static CODEVIEW: string = "CodeView-0.4.0";
  static ERROR_PRONE_ANNOTATIONS: string = "error_prone_annotations-2.38.0";
  static FIREBASE_AUTH: string = "firebase-auth-19.0.0";
  static FIREBASE_AUTH_INTEROP: string = "firebase-auth-interop-18.0.0";
  static FIREBASE_COMMON: string = "firebase-common-19.3.0";
  static FIREBASE_COMPONENTS: string = "firebase-components-16.0.0";
  static FIREBASE_DATABASE: string = "firebase-database-19.3.1";
  static FIREBASE_DATABASE_COLLECTION: string = "firebase-database-collection-17.0.1";
  static FIREBASE_IID: string = "firebase-iid-19.0.0";
  static FIREBASE_IID_INTEROP: string = "firebase-iid-interop-17.0.0";
  static FIREBASE_MEASUREMENT_CONNECTOR: string = "firebase-measurement-connector-18.0.0";
  static FIREBASE_MESSAGING: string = "firebase-messaging-19.0.0";
  static FIREBASE_STORAGE: string = "firebase-storage-19.0.0";
  static GLIDE: string = "glide-5.0.4";
  static GLIDE_ANNOTATIONS: string = "annotations-5.0.4";
  static GLIDE_DISKLRUCACHE: string = "disklrucache-5.0.4";
  static GLIDE_GIFDECODER: string = "gifdecoder-5.0.4";
  static GSON: string = "gson-2.13.1";
  static HTTP_LEGACY_ANDROID: string = "http-legacy-android-28";
  static JETBRAINS_ANNOTATIONS: string = "annotations-23.0.0";
  static JETBRAINS_KOTLINX_COROUTINES_ANDROID: string = "kotlinx-coroutines-android-1.8.1";
  static JETBRAINS_KOTLINX_COROUTINES_CORE_JVM: string = "kotlinx-coroutines-core-jvm-1.8.1";
  static JETBRAINS_KOTLIN_STDLIB: string = "kotlin-stdlib-2.2.0";
  static JSPECIFY: string = "jspecify-1.0.0";
  static LOTTIE: string = "lottie-6.6.10";
  static MATERIAL: string = "material-1.13.0";
  static OKHTTP_ANDROID: string = "okhttp-android-5.1.0";
  static OKIO_JVM: string = "okio-jvm-3.15.0";
  static OTPVIEW: string = "OTPView-0.1.0";
  static PATTERN_LOCK_VIEW: string = "pattern-lock-view";
  static PLAY_SERVICES_ADS: string = "play-services-ads-22.2.0";
  static PLAY_SERVICES_ADS_BASE: string = "play-services-ads-base-22.2.0";
  static PLAY_SERVICES_ADS_IDENTIFIER: string = "play-services-ads-identifier-18.0.0";
  static PLAY_SERVICES_ADS_LITE: string = "play-services-ads-lite-22.2.0";
  static PLAY_SERVICES_APPSET: string = "play-services-appset-16.0.1";
  static PLAY_SERVICES_AUTH: string = "play-services-auth-19.0.0";
  static PLAY_SERVICES_AUTH_API_PHONE: string = "play-services-auth-api-phone-17.0.0";
  static PLAY_SERVICES_AUTH_BASE: string = "play-services-auth-base-17.0.0";
  static PLAY_SERVICES_BASE: string = "play-services-base-18.0.0";
  static PLAY_SERVICES_BASEMENT: string = "play-services-basement-18.0.0";
  static PLAY_SERVICES_GASS: string = "play-services-gass-20.0.0";
  static PLAY_SERVICES_GCM: string = "play-services-gcm-17.0.0";
  static PLAY_SERVICES_IID: string = "play-services-iid-17.0.0";
  static PLAY_SERVICES_LOCATION: string = "play-services-location-18.0.0";
  static PLAY_SERVICES_MAPS: string = "play-services-maps-17.0.1";
  static PLAY_SERVICES_MEASUREMENT_BASE: string = "play-services-measurement-base-20.1.2";
  static PLAY_SERVICES_MEASUREMENT_SDK_API: string = "play-services-measurement-sdk-api-20.1.2";
  static PLAY_SERVICES_PLACES_PLACEREPORT: string = "play-services-places-placereport-17.0.0";
  static PLAY_SERVICES_STATS: string = "play-services-stats-17.0.0";
  static PLAY_SERVICES_TASKS: string = "play-services-tasks-18.0.1";
  static USER_MESSAGING_PLATFORM: string = "user-messaging-platform-2.0.0";
  static WAVE_SIDE_BAR: string = "wave-side-bar";
  static KNOWN_BUILT_IN_LIBRARIES: any[] = [
            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_ACTIVITY, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE_KTX, BuiltInLibraries.ANDROIDX_CORE_VIEWTREE,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON, BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL,
                    BuiltInLibraries.ANDROIDX_SAVEDSTATE, BuiltInLibraries.ANDROIDX_TRACING, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB,
                    BuiltInLibraries.JETBRAINS_KOTLINX_COROUTINES_CORE_JVM), "androidx.activity"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_ANNOTATION_EXPERIMENTAL, jlistOf(BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, jlistOf(BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_APPCOMPAT, jlistOf(BuiltInLibraries.ANDROIDX_ACTIVITY, BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_APPCOMPAT_RESOURCES,
                    BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE_KTX, BuiltInLibraries.ANDROIDX_CORE,
                    BuiltInLibraries.ANDROIDX_CURSORADAPTER, BuiltInLibraries.ANDROIDX_CUSTOMVIEW, BuiltInLibraries.ANDROIDX_DRAWERLAYOUT,
                    BuiltInLibraries.ANDROIDX_EMOJI2_VIEWS_HELPER, BuiltInLibraries.ANDROIDX_EMOJI2, BuiltInLibraries.ANDROIDX_FRAGMENT,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL,
                    BuiltInLibraries.ANDROIDX_SAVEDSTATE, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB), "androidx.appcompat"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_APPCOMPAT_RESOURCES, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_APPCOMPAT, BuiltInLibraries.ANDROIDX_COLLECTION_JVM,
                    BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_VECTORDRAWABLE_ANIMATED,
                    BuiltInLibraries.ANDROIDX_VECTORDRAWABLE), "androidx.appcompat.resources"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_ASYNCLAYOUTINFLATER, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE), "androidx.asynclayoutinflater"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_BROWSER, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CONCURRENT_FUTURES,
                    BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_INTERPOLATOR), "androidx.browser"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CARDVIEW, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM), "androidx.cardview"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CONCURRENT_FUTURES, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CONSTRAINTLAYOUT, jlistOf(BuiltInLibraries.ANDROIDX_APPCOMPAT, BuiltInLibraries.ANDROIDX_CONSTRAINTLAYOUT_CORE, BuiltInLibraries.ANDROIDX_CORE), "androidx.constraintlayout.widget"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CONSTRAINTLAYOUT_CORE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_COORDINATORLAYOUT, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE,
                    BuiltInLibraries.ANDROIDX_CUSTOMVIEW, BuiltInLibraries.JSPECIFY), "androidx.coordinatorlayout"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CORE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_EXPERIMENTAL, BuiltInLibraries.ANDROIDX_ANNOTATION_JVM,
                    BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CONCURRENT_FUTURES,
                    BuiltInLibraries.ANDROIDX_CORE_KTX, BuiltInLibraries.ANDROIDX_CORE_VIEWTREE, BuiltInLibraries.ANDROIDX_INTERPOLATOR,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON, BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME,
                    BuiltInLibraries.ANDROIDX_TRACING, BuiltInLibraries.ANDROIDX_VERSIONEDPARCELABLE,
                    BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB, BuiltInLibraries.JETBRAINS_KOTLINX_COROUTINES_CORE_JVM,
                    BuiltInLibraries.JSPECIFY), "androidx.core"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CORE_COMMON, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CORE_KTX, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CORE_RUNTIME, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE_COMMON)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CORE_VIEWTREE, jlistOf(BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB), "androidx.core.viewtree"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CURSORADAPTER, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CUSTOMVIEW, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_CUSTOMVIEW_POOLINGCONTAINER, jlistOf(BuiltInLibraries.ANDROIDX_CORE_KTX, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB), "androidx.customview.poolingcontainer"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_DOCUMENTFILE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_DRAWERLAYOUT, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_CUSTOMVIEW), "androidx.drawerlayout"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_DYNAMICANIMATION, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.JSPECIFY)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_EMOJI2, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE,
                    BuiltInLibraries.ANDROIDX_EMOJI2_VIEWS_HELPER, BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_PROCESS, BuiltInLibraries.ANDROIDX_STARTUP_RUNTIME)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_EMOJI2_VIEWS_HELPER, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_EMOJI2)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_EXIFINTERFACE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_FRAGMENT, jlistOf(BuiltInLibraries.ANDROIDX_ACTIVITY, BuiltInLibraries.ANDROIDX_ANNOTATION_EXPERIMENTAL, BuiltInLibraries.ANDROIDX_ANNOTATION_JVM,
                    BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE_KTX,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA_CORE, BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL,
                    BuiltInLibraries.ANDROIDX_LOADER, BuiltInLibraries.ANDROIDX_SAVEDSTATE, BuiltInLibraries.ANDROIDX_VIEWPAGER,
                    BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB), "androidx.fragment"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_GRAPHICS_SHAPES_ANDROID, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_EXPERIMENTAL, BuiltInLibraries.ANDROIDX_ANNOTATION_JVM,
                    BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE_KTX, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_INTERPOLATOR, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_CORE_UI, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_ASYNCLAYOUTINFLATER, BuiltInLibraries.ANDROIDX_COORDINATORLAYOUT,
                    BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_CURSORADAPTER, BuiltInLibraries.ANDROIDX_CUSTOMVIEW,
                    BuiltInLibraries.ANDROIDX_DRAWERLAYOUT, BuiltInLibraries.ANDROIDX_INTERPOLATOR,
                    BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_CORE_UTILS, BuiltInLibraries.ANDROIDX_SLIDINGPANELAYOUT,
                    BuiltInLibraries.ANDROIDX_SWIPEREFRESHLAYOUT, BuiltInLibraries.ANDROIDX_VIEWPAGER)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_CORE_UTILS, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_DOCUMENTFILE, BuiltInLibraries.ANDROIDX_LOADER,
                    BuiltInLibraries.ANDROIDX_LOCALBROADCASTMANAGER)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_V13, jlistOf(BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_V4)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_V4, jlistOf(BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_FRAGMENT, BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_CORE_UI,
                    BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_CORE_UTILS, BuiltInLibraries.ANDROIDX_MEDIA)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA_CORE,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA, BuiltInLibraries.ANDROIDX_LIFECYCLE_PROCESS,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME, BuiltInLibraries.ANDROIDX_LIFECYCLE_SERVICE,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL,
                    BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB, BuiltInLibraries.JETBRAINS_KOTLINX_COROUTINES_ANDROID)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA, jlistOf(BuiltInLibraries.ANDROIDX_CORE_COMMON, BuiltInLibraries.ANDROIDX_CORE_RUNTIME, BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA_CORE, BuiltInLibraries.ANDROIDX_LIFECYCLE_PROCESS,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME, BuiltInLibraries.ANDROIDX_LIFECYCLE_SERVICE,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL,
                    BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA_CORE, jlistOf(BuiltInLibraries.ANDROIDX_CORE_COMMON, BuiltInLibraries.ANDROIDX_CORE_RUNTIME, BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA, BuiltInLibraries.ANDROIDX_LIFECYCLE_PROCESS,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME, BuiltInLibraries.ANDROIDX_LIFECYCLE_SERVICE,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL,
                    BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LIFECYCLE_PROCESS, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA_CORE, BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME, BuiltInLibraries.ANDROIDX_LIFECYCLE_SERVICE,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL,
                    BuiltInLibraries.ANDROIDX_STARTUP_RUNTIME, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE_COMMON, BuiltInLibraries.ANDROIDX_CORE_RUNTIME,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON, BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA_CORE,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA, BuiltInLibraries.ANDROIDX_LIFECYCLE_PROCESS,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_SERVICE, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB), "androidx.lifecycle.runtime"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LIFECYCLE_SERVICE, jlistOf(BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON, BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA_CORE,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA, BuiltInLibraries.ANDROIDX_LIFECYCLE_PROCESS,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA_CORE, BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_PROCESS, BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_SERVICE, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE,
                    BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB), "androidx.lifecycle.viewmodel"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL_SAVEDSTATE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE_KTX, BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA_CORE, BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_PROCESS, BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_SERVICE, BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL,
                    BuiltInLibraries.ANDROIDX_SAVEDSTATE, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB,
                    BuiltInLibraries.JETBRAINS_KOTLINX_COROUTINES_ANDROID)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LOADER, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_VIEWMODEL)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_LOCALBROADCASTMANAGER, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_MEDIA, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_VERSIONEDPARCELABLE), "androidx.media"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_MULTIDEX),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_RECYCLERVIEW, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE,
                    BuiltInLibraries.ANDROIDX_CUSTOMVIEW_POOLINGCONTAINER, BuiltInLibraries.ANDROIDX_CUSTOMVIEW,
                    BuiltInLibraries.ANDROIDX_VIEWPAGER2), "androidx.recyclerview"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_ROOM_COMMON, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_ROOM_RUNTIME, jlistOf(BuiltInLibraries.ANDROIDX_CORE_RUNTIME, BuiltInLibraries.ANDROIDX_ROOM_COMMON, BuiltInLibraries.ANDROIDX_SQLITE_FRAMEWORK,
                    BuiltInLibraries.ANDROIDX_SQLITE)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_SAVEDSTATE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE_COMMON, BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON,
                    BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB), "androidx.savedstate"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_SLIDINGPANELAYOUT, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_CUSTOMVIEW)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_SQLITE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_SQLITE_FRAMEWORK, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_SQLITE)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_STARTUP_RUNTIME, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON, BuiltInLibraries.ANDROIDX_TRACING), "androidx.startup"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_SWIPEREFRESHLAYOUT, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_INTERPOLATOR)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_TRACING, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_TRANSITION, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE,
                    BuiltInLibraries.ANDROIDX_DYNAMICANIMATION), "androidx.transition"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_VECTORDRAWABLE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_VECTORDRAWABLE_ANIMATED, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_INTERPOLATOR, BuiltInLibraries.ANDROIDX_VECTORDRAWABLE)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_VERSIONEDPARCELABLE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_COLLECTION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_VIEWPAGER, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_CUSTOMVIEW)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_VIEWPAGER2, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_EXPERIMENTAL, BuiltInLibraries.ANDROIDX_ANNOTATION_JVM,
                    BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_FRAGMENT,
                    BuiltInLibraries.ANDROIDX_RECYCLERVIEW), "androidx.viewpager2"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROIDX_WORK_RUNTIME, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_EXPERIMENTAL, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_LIFECYCLE_LIVEDATA,
                    BuiltInLibraries.ANDROIDX_LIFECYCLE_SERVICE, BuiltInLibraries.ANDROIDX_ROOM_RUNTIME,
                    BuiltInLibraries.ANDROIDX_SQLITE_FRAMEWORK, BuiltInLibraries.ANDROIDX_SQLITE, BuiltInLibraries.ANDROIDX_STARTUP_RUNTIME), "androidx.work"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ANDROID_YOUTUBE_PLAYER, jlistOf(BuiltInLibraries.ANDROIDX_APPCOMPAT, BuiltInLibraries.ANDROIDX_LIFECYCLE_COMMON, BuiltInLibraries.ANDROIDX_RECYCLERVIEW,
                    BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB), "com.pierfrancescosoffritti.androidyoutubeplayer"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.AUTO_VALUE_ANNOTATIONS),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.CIRCLEIMAGEVIEW, jlistOf(), "de.hdodenhof.circleimageview"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.CODEVIEW, jlistOf(), "br.tiagohm.codeview"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.ERROR_PRONE_ANNOTATIONS),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_AUTH, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_FRAGMENT, BuiltInLibraries.ANDROIDX_LOCALBROADCASTMANAGER,
                    BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_TASKS,
                    BuiltInLibraries.FIREBASE_AUTH_INTEROP, BuiltInLibraries.FIREBASE_COMMON)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_AUTH_INTEROP, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_TASKS, BuiltInLibraries.FIREBASE_COMMON)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_COMMON, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_TASKS, BuiltInLibraries.AUTO_VALUE_ANNOTATIONS,
                    BuiltInLibraries.FIREBASE_COMPONENTS)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_COMPONENTS, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_DATABASE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT,
                    BuiltInLibraries.PLAY_SERVICES_TASKS, BuiltInLibraries.FIREBASE_AUTH_INTEROP, BuiltInLibraries.FIREBASE_COMMON,
                    BuiltInLibraries.FIREBASE_COMPONENTS, BuiltInLibraries.FIREBASE_DATABASE_COLLECTION)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_DATABASE_COLLECTION, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASE)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_IID, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_CORE_UTILS,
                    BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_STATS, BuiltInLibraries.PLAY_SERVICES_TASKS,
                    BuiltInLibraries.FIREBASE_COMMON, BuiltInLibraries.FIREBASE_IID_INTEROP)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_IID_INTEROP, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_MEASUREMENT_CONNECTOR, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASEMENT)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_MESSAGING, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.PLAY_SERVICES_BASEMENT,
                    BuiltInLibraries.PLAY_SERVICES_TASKS, BuiltInLibraries.FIREBASE_COMMON, BuiltInLibraries.FIREBASE_IID,
                    BuiltInLibraries.FIREBASE_MEASUREMENT_CONNECTOR), "com.google.firebase.messaging"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.FIREBASE_STORAGE, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_TASKS,
                    BuiltInLibraries.FIREBASE_AUTH_INTEROP, BuiltInLibraries.FIREBASE_COMMON)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.GLIDE, jlistOf(BuiltInLibraries.ANDROIDX_EXIFINTERFACE, BuiltInLibraries.ANDROIDX_FRAGMENT, BuiltInLibraries.ANDROIDX_TRACING,
                    BuiltInLibraries.ANDROIDX_VECTORDRAWABLE_ANIMATED, BuiltInLibraries.GLIDE_ANNOTATIONS,
                    BuiltInLibraries.GLIDE_DISKLRUCACHE, BuiltInLibraries.GLIDE_GIFDECODER), "com.bumptech.glide"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.GLIDE_ANNOTATIONS),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.GLIDE_DISKLRUCACHE),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.GLIDE_GIFDECODER, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.GSON, jlistOf(BuiltInLibraries.ERROR_PRONE_ANNOTATIONS)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.HTTP_LEGACY_ANDROID),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.JETBRAINS_ANNOTATIONS),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.JETBRAINS_KOTLINX_COROUTINES_ANDROID, jlistOf(BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB, BuiltInLibraries.JETBRAINS_KOTLINX_COROUTINES_CORE_JVM)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.JETBRAINS_KOTLINX_COROUTINES_CORE_JVM, jlistOf(BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB, BuiltInLibraries.JETBRAINS_ANNOTATIONS)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB, jlistOf(BuiltInLibraries.JETBRAINS_ANNOTATIONS)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.JSPECIFY),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.LOTTIE, jlistOf(BuiltInLibraries.ANDROIDX_APPCOMPAT, BuiltInLibraries.OKIO_JVM), "com.airbnb.lottie"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.MATERIAL, jlistOf(BuiltInLibraries.ANDROIDX_ACTIVITY, BuiltInLibraries.ANDROIDX_ANNOTATION_EXPERIMENTAL, BuiltInLibraries.ANDROIDX_ANNOTATION_JVM,
                    BuiltInLibraries.ANDROIDX_APPCOMPAT, BuiltInLibraries.ANDROIDX_CARDVIEW, BuiltInLibraries.ANDROIDX_CONSTRAINTLAYOUT,
                    BuiltInLibraries.ANDROIDX_COORDINATORLAYOUT, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_DRAWERLAYOUT,
                    BuiltInLibraries.ANDROIDX_DYNAMICANIMATION, BuiltInLibraries.ANDROIDX_FRAGMENT,
                    BuiltInLibraries.ANDROIDX_GRAPHICS_SHAPES_ANDROID, BuiltInLibraries.ANDROIDX_LIFECYCLE_RUNTIME,
                    BuiltInLibraries.ANDROIDX_RECYCLERVIEW, BuiltInLibraries.ANDROIDX_TRANSITION, BuiltInLibraries.ANDROIDX_VECTORDRAWABLE,
                    BuiltInLibraries.ANDROIDX_VIEWPAGER2, BuiltInLibraries.ERROR_PRONE_ANNOTATIONS, BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB), "com.google.android.material"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.OKHTTP_ANDROID, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.ANDROIDX_STARTUP_RUNTIME, BuiltInLibraries.OKIO_JVM,
                    BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.OKIO_JVM, jlistOf(BuiltInLibraries.JETBRAINS_KOTLIN_STDLIB)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.OTPVIEW, jlistOf(BuiltInLibraries.ANDROIDX_APPCOMPAT, BuiltInLibraries.ANDROIDX_CORE_KTX), "affan.ahmad.otp"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PATTERN_LOCK_VIEW, jlistOf(BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.JETBRAINS_ANNOTATIONS), "com.andrognito.patternlockview"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_ADS, jlistOf(BuiltInLibraries.ANDROIDX_BROWSER, BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.PLAY_SERVICES_ADS_BASE,
                    BuiltInLibraries.PLAY_SERVICES_ADS_IDENTIFIER, BuiltInLibraries.PLAY_SERVICES_ADS_LITE,
                    BuiltInLibraries.PLAY_SERVICES_APPSET, BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_TASKS), "com.google.android.gms.ads.impl"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_ADS_BASE, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASEMENT)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_ADS_IDENTIFIER, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASEMENT)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_ADS_LITE, jlistOf(BuiltInLibraries.ANDROIDX_WORK_RUNTIME, BuiltInLibraries.PLAY_SERVICES_ADS_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT,
                    BuiltInLibraries.PLAY_SERVICES_MEASUREMENT_SDK_API, BuiltInLibraries.USER_MESSAGING_PLATFORM), "com.google.android.gms.ads"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_APPSET, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_TASKS)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_AUTH, jlistOf(BuiltInLibraries.ANDROIDX_FRAGMENT, BuiltInLibraries.ANDROIDX_LOADER, BuiltInLibraries.PLAY_SERVICES_AUTH_API_PHONE,
                    BuiltInLibraries.PLAY_SERVICES_AUTH_BASE, BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT,
                    BuiltInLibraries.PLAY_SERVICES_TASKS), "com.google.android.gms.auth.api"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_AUTH_API_PHONE, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_TASKS)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_AUTH_BASE, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT,
                    BuiltInLibraries.PLAY_SERVICES_TASKS)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_BASE, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_FRAGMENT, BuiltInLibraries.PLAY_SERVICES_BASEMENT,
                    BuiltInLibraries.PLAY_SERVICES_TASKS), "com.google.android.gms.base"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_BASEMENT, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_FRAGMENT), "com.google.android.gms.common"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_GASS, jlistOf(BuiltInLibraries.PLAY_SERVICES_ADS_BASE, BuiltInLibraries.PLAY_SERVICES_ADS_IDENTIFIER, BuiltInLibraries.PLAY_SERVICES_ADS_LITE,
                    BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_TASKS)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_GCM, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_CORE_UTILS,
                    BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_IID,
                    BuiltInLibraries.PLAY_SERVICES_STATS), "com.google.android.gms.gcm"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_IID, jlistOf(BuiltInLibraries.ANDROIDX_COLLECTION_JVM, BuiltInLibraries.ANDROIDX_CORE, BuiltInLibraries.PLAY_SERVICES_BASE,
                    BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_STATS, BuiltInLibraries.PLAY_SERVICES_TASKS)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_LOCATION, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_PLACES_PLACEREPORT,
                    BuiltInLibraries.PLAY_SERVICES_TASKS)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_MAPS, jlistOf(BuiltInLibraries.ANDROIDX_FRAGMENT, BuiltInLibraries.PLAY_SERVICES_BASE, BuiltInLibraries.PLAY_SERVICES_BASEMENT), "com.google.android.gms.maps"),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_MEASUREMENT_BASE, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASEMENT)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_MEASUREMENT_SDK_API, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASEMENT, BuiltInLibraries.PLAY_SERVICES_MEASUREMENT_BASE)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_PLACES_PLACEREPORT, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASEMENT)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_STATS, jlistOf(BuiltInLibraries.ANDROIDX_LEGACY_SUPPORT_CORE_UTILS, BuiltInLibraries.PLAY_SERVICES_BASEMENT)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.PLAY_SERVICES_TASKS, jlistOf(BuiltInLibraries.PLAY_SERVICES_BASEMENT)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.USER_MESSAGING_PLATFORM, jlistOf(BuiltInLibraries.ANDROIDX_ANNOTATION_JVM, BuiltInLibraries.PLAY_SERVICES_ADS_IDENTIFIER, BuiltInLibraries.PLAY_SERVICES_BASEMENT)),

            new BuiltInLibraries_BuiltInLibrary(BuiltInLibraries.WAVE_SIDE_BAR, jlistOf(), "com.sayuti.lib"),

    ];
  static getLibraryPath(libraryName: string): any {
        return new JFile(BuiltInLibraries.EXTRACTED_BUILT_IN_LIBRARIES_PATH, libraryName);
    }
  static getLibraryPathString(libraryName: string): string {
        return BuiltInLibraries.getLibraryPath(libraryName).getAbsolutePath();
    }
  static getLibraryClassesJarPath(libraryName: string): any {
        return new JFile(BuiltInLibraries.getLibraryPath(libraryName), "classes.jar");
    }
  static getLibraryClassesJarPathString(libraryName: string): string {
        return BuiltInLibraries.getLibraryClassesJarPath(libraryName).getAbsolutePath();
    }
  static getLibraryDexFile(libraryName: string): any {
        return new JFile(BuiltInLibraries.EXTRACTED_BUILT_IN_LIBRARY_DEX_FILES_PATH, libraryName + ".dex");
    }
  static getLibraryDexFilePath(libraryName: string): string {
        return new JFile(BuiltInLibraries.EXTRACTED_BUILT_IN_LIBRARY_DEX_FILES_PATH, libraryName + ".dex").getAbsolutePath();
    }
  static getLibraryAssets(libraryName: string): any {
        let library = new Jp(libraryName);

        if (library.hasAssets()) {
            return new JFile(BuiltInLibraries.EXTRACTED_BUILT_IN_LIBRARIES_PATH, libraryName + File.separator + "assets");
        } else {
            throw new IllegalArgumentException("Built-in library '" + libraryName + "' doesn't have any assets.");
        }
    }
  static getLibraryAssetsPath(libraryName: string): string {
        return BuiltInLibraries.getLibraryAssets(libraryName).getAbsolutePath();
    }
  static getLibraryResources(libraryName: string): any {
        let library = new Jp(libraryName);

        if (library.hasResources()) {
            return new JFile(BuiltInLibraries.EXTRACTED_BUILT_IN_LIBRARIES_PATH, libraryName + File.separator + "res");
        } else {
            throw new IllegalArgumentException("Built-in library '" + libraryName + "' doesn't have any resources.");
        }
    }
  static getLibraryResourcesPath(libraryName: string): string {
        return BuiltInLibraries.getLibraryResources(libraryName).getAbsolutePath();
    }
  static getLibraryProguardConfiguration(libraryName: string): any {
        return new JFile(BuiltInLibraries.EXTRACTED_BUILT_IN_LIBRARIES_PATH, libraryName + File.separator + "proguard.txt");
    }
  static getLibraryProguardConfigurationPath(libraryName: string): string {
        return BuiltInLibraries.getLibraryProguardConfiguration(libraryName).getAbsolutePath();
    }
  static extractCompileAssets(...progressReceivers: any[]): void {
        if (!BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH.exists()) {
            if (!BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH.mkdirs()) {
                throw new RuntimeException(new IOException("Failed to create directory " + BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH));
            }
        }

        let dexsArchiveName = "dexs.zip";
        let libsArchiveName = "libs.zip";
        let testkeyArchiveName = "testkey.zip";

        let dexsArchivePath = new JFile(BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH, dexsArchiveName).getAbsolutePath();
        let libsArchivePath = new JFile(BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH, libsArchiveName).getAbsolutePath();
        let testkeyArchivePath = new JFile(BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH, testkeyArchiveName).getAbsolutePath();
        let dexsDirectoryPath = BuiltInLibraries.EXTRACTED_BUILT_IN_LIBRARY_DEX_FILES_PATH.getAbsolutePath();
        let libsDirectoryPath = BuiltInLibraries.EXTRACTED_BUILT_IN_LIBRARIES_PATH.getAbsolutePath();
        let testkeyDirectoryPath = new JFile(BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH, "testkey").getAbsolutePath();

        let baseAssetsPath = "libs" + File.separator;
        let fileUtil = new oB(false);

        BuiltInLibraries.maybeExtractAndroidJar(progressReceivers);

        if (ProjectBuilder.hasFileChanged(baseAssetsPath + dexsArchiveName, dexsArchivePath)) {
            for (const receiver of jiter(progressReceivers)) {
                receiver.onProgress("Extracting built-in libraries' DEX files...", 4);
            }
            /* Delete the directory */
            fileUtil.b(dexsDirectoryPath);
            /* Create the directories */
            fileUtil.f(dexsDirectoryPath);
            /* Extract dexs.zip to dexs/ */
            new KB().a(dexsArchivePath, dexsDirectoryPath);
        }
        if (ProjectBuilder.hasFileChanged(baseAssetsPath + libsArchiveName, libsArchivePath)) {
            for (const receiver of jiter(progressReceivers)) {
                receiver.onProgress("Extracting built-in libraries' resources...", 5);
            }
            /* Delete the directory */
            fileUtil.b(libsDirectoryPath);
            /* Create the directories */
            fileUtil.f(libsDirectoryPath);
            /* Extract libs.zip to libs/ */
            new KB().a(libsArchivePath, libsDirectoryPath);
        }
        BuiltInLibraries.maybeExtractCoreLambdaStubsJar();
        if (ProjectBuilder.hasFileChanged(baseAssetsPath + testkeyArchiveName, testkeyArchivePath)) {
            for (const receiver of jiter(progressReceivers)) {
                receiver.onProgress("Extracting built-in signing keys...", 6);
            }
            /* Delete the directory */
            fileUtil.b(testkeyDirectoryPath);
            /* Create the directories */
            fileUtil.f(testkeyDirectoryPath);
            /* Extract testkey.zip to testkey/ */
            new KB().a(testkeyArchivePath, testkeyDirectoryPath);
        }
    }
  static maybeExtractAndroidJar(...receivers: any[]): void {
        let androidJarArchiveName = "android.jar.zip";
        let androidJarPath = new JFile(BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH, androidJarArchiveName).getAbsolutePath();
        if (ProjectBuilder.hasFileChanged("libs" + File.separator + androidJarArchiveName, androidJarPath)) {
            for (const receiver of jiter(receivers)) {
                receiver.onProgress("Extracting built-in android.jar...", 7);
            }
            /* Delete android.jar */
            new oB().c(BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH.getAbsolutePath() + File.separator + "android.jar");
            /* Extract android.jar.zip to android.jar */
            new KB().a(androidJarPath, BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH.getAbsolutePath());
        }
    }
  static maybeExtractCoreLambdaStubsJar(): void {
        let coreLambdaStubsJarName = "core-lambda-stubs.jar";
        let coreLambdaStubsJarPath = new JFile(BuiltInLibraries.EXTRACTED_COMPILE_ASSETS_PATH, coreLambdaStubsJarName).getAbsolutePath();
        ProjectBuilder.hasFileChanged("libs" + File.separator + coreLambdaStubsJarName, coreLambdaStubsJarPath);
    }
  static BuiltInLibrary = BuiltInLibraries_BuiltInLibrary;
}