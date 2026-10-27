// Auto-ported from jq.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.text.TextUtils.isEmpty, com.besome.sketch.beans.AdTestDeviceBean, com.besome.sketch.beans.ProjectLibraryBean, java.util.ArrayList, java.util.HashMap, mod.agus.jcoderz.handle.component.ConstVarComponent
// <imports>
import { jisEmpty, jiter, JMap } from '../codegen/jshim';
import { ConstVarComponent } from './ConstVarComponent';
// </imports>
export class jq_ActivityConfig {
  hasDrawer: boolean = false;
  usesFirebaseAuth: boolean = false;
  c: number = 0;
  a_int(i: number): void {
            this.c = i | this.c;
        }
  b(i: number): boolean {
            return (this.c & i) == i;
        }
  a_0(): boolean {
            return this.b(jq.PERMISSION_CALL_PHONE)
                    || this.b(jq.PERMISSION_READ_EXTERNAL_STORAGE) || this.b(jq.PERMISSION_WRITE_EXTERNAL_STORAGE)
                    || this.b(jq.PERMISSION_CAMERA)
                    || this.b(jq.PERMISSION_RECORD_AUDIO)
                    || this.b(jq.PERMISSION_ACCESS_FINE_LOCATION);
        }
  a(...args: any[]): any {
    if (args.length === 1 && typeof args[0] === 'number') return this.a_int.apply(this, args as any);
    if (args.length === 0) return this.a_0.apply(this, args as any);
    throw new Error('no overload of a for ' + args.length);
  }
}
export class jq {
  static PERMISSION_CALL_PHONE: number = 1;
  static PERMISSION_INTERNET: number = 2;
  static PERMISSION_VIBRATE: number = 4;
  static PERMISSION_ACCESS_NETWORK_STATE: number = 8;
  static PERMISSION_CAMERA: number = 16;
  static PERMISSION_READ_EXTERNAL_STORAGE: number = 32;
  static PERMISSION_WRITE_EXTERNAL_STORAGE: number = 64;
  static PERMISSION_RECORD_AUDIO: number = 128;
  static PERMISSION_BLUETOOTH: number = 256;
  static PERMISSION_BLUETOOTH_ADMIN: number = 512;
  static PERMISSION_ACCESS_FINE_LOCATION: number = 1024;
  packageName: string = "";
  projectName: string;
  versionCode: string;
  versionName: string;
  isDebugBuild: boolean = false;
  g: boolean = false;
  isFirebaseEnabled: boolean = false;
  isFirebaseAuthUsed: boolean = false;
  isFirebaseDatabaseUsed: boolean = false;
  isFirebaseStorageUsed: boolean = false;
  isAdMobEnabled: boolean = false;
  isMapUsed: boolean = false;
  isGlideUsed: boolean = false;
  isGsonUsed: boolean = false;
  isHttp3Used: boolean = false;
  isTextToSpeechUsed: boolean = false;
  isSpeechToTextUsed: boolean = false;
  q: number = 0;
  bannerAdUnitId: string = "ca-app-pub-3940256099942544/6300978111";
  interstitialAdUnitId: string = "ca-app-pub-3940256099942544/1033173712";
  rewardAdUnitId: string = "ca-app-pub-3940256099942544/5224354917";
  appId: string = "";
  sc_id: string = "";
  t: any = [];
  u: boolean = false;
  mapApiKey: string = "";
  w: any = new JMap();
  x: any = new ConstVarComponent();
  hasPermissions(): boolean {
        return this.q == 0;
    }
  b(): void {
    }
  hasPermission(permission: number): boolean {
        return (this.q & permission) == permission;
    }
  addPermission_int(permission: number): void {
        this.q = permission | this.q;
    }
  setupGoogleMap(googleMapsLibrary: any): void {
        let data;
        if (googleMapsLibrary != null && (data = googleMapsLibrary.data) != null) {
            this.mapApiKey = data;
        }
    }
  addPermission_String_int(activityName: string, permission: number): void {
        if (!this.w.containsKey(activityName)) {
            this.w.put(activityName, new jq_ActivityConfig());
        }
        this.w.get(activityName).a(permission);
        this.addPermission(permission);
    }
  a(activityName: string): any {
        if (!this.w.containsKey(activityName)) {
            this.w.put(activityName, new jq_ActivityConfig());
        }
        return this.w.get(activityName);
    }
  setupAdmob(projectLibraryBean: any): void {
        let testDevices;
        if (!(projectLibraryBean == null || (testDevices = projectLibraryBean.testDevices) == null || testDevices.size() <= 0)) {
            for (const adTestDeviceBean of jiter(projectLibraryBean.testDevices)) {
                this.t.add(adTestDeviceBean.deviceId);
            }
        }
        let reserved1;
        if (!(projectLibraryBean == null || (reserved1 = projectLibraryBean.reserved1) == null || reserved1.isEmpty())) {
            this.bannerAdUnitId = reserved1.substring(reserved1.lastIndexOf(" : ") + 3);
        }
        let reserved2;
        if (projectLibraryBean != null && (reserved2 = projectLibraryBean.reserved2) != null && !reserved2.isEmpty()) {
            this.interstitialAdUnitId = reserved2.substring(reserved2.lastIndexOf(" : ") + 3);
        }
        let reserved3;
        if (projectLibraryBean != null && (reserved3 = projectLibraryBean.reserved3) != null && !reserved3.isEmpty()) {
            this.rewardAdUnitId = reserved3.substring(reserved3.lastIndexOf(" : ") + 3);
        }
        let app_id;
        if (!(projectLibraryBean == null || (app_id = projectLibraryBean.appId) == null || jisEmpty(app_id))) {
            this.appId = app_id;
        }
    }
  static ActivityConfig = jq_ActivityConfig;
  addPermission(...args: any[]): any {
    if (args.length === 2 && (args[0] == null || typeof args[0] === 'string') && typeof args[1] === 'number') return this.addPermission_String_int.apply(this, args as any);
    if (args.length === 1 && typeof args[0] === 'number') return this.addPermission_int.apply(this, args as any);
    throw new Error('no overload of addPermission for ' + args.length);
  }
}