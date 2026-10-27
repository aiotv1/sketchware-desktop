// Auto-ported from Ix.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: android.text.TextUtils.isEmpty, com.besome.sketch.Config.VAR_DEFAULT_TARGET_SDK_VERSION, android.Manifest, android.app.Service, android.content.BroadcastReceiver, android.content.ComponentName, android.content.Intent, android.util.Pair, com.besome.sketch.beans.ProjectFileBean, com.google.gson.Gson, java.util.ArrayList, java.util.HashMap, java.util.HashSet, java.util.Set, mod.agus.jcoderz.editor.manifest.EditorManifest, mod.hey.studios.build.BuildSettings, mod.hey.studios.project.ProjectSettings, mod.hey.studios.util.Helper, mod.hilal.saif.android_manifest.AndroidManifestInjector, mod.jbk.build.BuiltInLibraries, pro.sketchware.util.library.BuiltInLibraryManager, pro.sketchware.utility.FilePathUtil, pro.sketchware.utility.FileResConfig, pro.sketchware.utility.FileUtil, pro.sketchware.xml.XmlBuilder
// <imports>
import { jstr, jparseInt, jisEmpty, jsetOf, jiter, JSet, Pair } from '../codegen/jshim';
import { ProjectFileBean } from '../core/beans';
import { AndroidManifestInjector } from './AndroidManifestInjector';
import { BuildSettings } from './BuildSettings';
import { BuiltInLibraries } from './BuiltInLibraries';
import { EditorManifest } from './EditorManifest';
import { FilePathUtil } from './FilePathUtil';
import { FileResConfig } from './FileResConfig';
import { ProjectSettings } from './ProjectSettings';
import { XmlBuilder } from './XmlBuilder';
import { FileUtil, Gson, Helper } from './env';
import { jq } from './jq';
import { Intent, Manifest, VAR_DEFAULT_TARGET_SDK_VERSION, vq } from './platform';
// </imports>
export class Ix {
  builtInLibraryManager: any;
  a$: any = new XmlBuilder("manifest");
  b: any;
  buildSettings: any;
  c: any;
  fpu: any = new FilePathUtil();
  frc: any;
  settings: any;
  targetsSdkVersion31OrHigher: boolean = false;
  packageName: string;
  addedPermissions: any = new JSet();
  constructor(jq: any, projectFileBeans: any, builtInLibraryManager: any) {
        this.c = jq;
        this.b = projectFileBeans;
        this.builtInLibraryManager = builtInLibraryManager;
        this.buildSettings = new BuildSettings(jq.sc_id);
        this.frc = new FileResConfig(this.c.sc_id);
        this.a$.addAttribute("xmlns", "android", "http://schemas.android.com/apk/res/android");
    }
  writeFileProvider(applicationTag: any): void {
        let providerTag = new XmlBuilder("provider");
        providerTag.addAttribute("android", "authorities", this.c.packageName + ".provider");
        providerTag.addAttribute("android", "name", "androidx.core.content.FileProvider");
        providerTag.addAttribute("android", "exported", "false");
        providerTag.addAttribute("android", "grantUriPermissions", "true");
        let metadataTag = new XmlBuilder("meta-data");
        metadataTag.addAttribute("android", "name", "android.support.FILE_PROVIDER_PATHS");
        metadataTag.addAttribute("android", "resource", "@xml/provider_paths");
        providerTag.addChildNode(metadataTag);
        applicationTag.addChildNode(providerTag);
    }
  writePermission(manifestTag: any, permissionName: string): void {
        if (this.addedPermissions.contains(permissionName)) {
            return;
        }
        let usesPermissionTag = new XmlBuilder("uses-permission");
        usesPermissionTag.addAttribute("android", "name", permissionName);
        manifestTag.addChildNode(usesPermissionTag);
        this.addedPermissions.add(permissionName);
    }
  writeFirebaseMetaData(applicationTag: any): void {
        let providerTag = new XmlBuilder("provider");
        providerTag.addAttribute("android", "name", "com.google.firebase.provider.FirebaseInitProvider");
        providerTag.addAttribute("android", "authorities", this.c.packageName + ".firebaseinitprovider");
        providerTag.addAttribute("android", "exported", "false");
        providerTag.addAttribute("android", "initOrder", "100");
        applicationTag.addChildNode(providerTag);
        let serviceTag = new XmlBuilder("service");
        serviceTag.addAttribute("android", "name", "com.google.firebase.components.ComponentDiscoveryService");
        serviceTag.addAttribute("android", "exported", "false");
        if (this.c.isFirebaseAuthUsed) {
            let metadataTag = new XmlBuilder("meta-data");
            metadataTag.addAttribute("android", "name", "com.google.firebase.components:com.google.firebase.auth.FirebaseAuthRegistrar");
            metadataTag.addAttribute("android", "value", "com.google.firebase.components.ComponentRegistrar");
            serviceTag.addChildNode(metadataTag);
        }
        if (this.c.isFirebaseDatabaseUsed) {
            let metadataTag = new XmlBuilder("meta-data");
            metadataTag.addAttribute("android", "name", "com.google.firebase.components:com.google.firebase.database.DatabaseRegistrar");
            metadataTag.addAttribute("android", "value", "com.google.firebase.components.ComponentRegistrar");
            serviceTag.addChildNode(metadataTag);
        }
        if (this.c.isFirebaseStorageUsed) {
            let metadataTag = new XmlBuilder("meta-data");
            metadataTag.addAttribute("android", "name", "com.google.firebase.components:com.google.firebase.storage.StorageRegistrar");
            metadataTag.addAttribute("android", "value", "com.google.firebase.components.ComponentRegistrar");
            serviceTag.addChildNode(metadataTag);
        }
        if (this.c.x.isFCMUsed) {
            let metadataTag = new XmlBuilder("meta-data");
            metadataTag.addAttribute("android", "name", "com.google.firebase.components:com.google.firebase.iid.Registrar");
            metadataTag.addAttribute("android", "value", "com.google.firebase.components.ComponentRegistrar");
            serviceTag.addChildNode(metadataTag);
        }
        applicationTag.addChildNode(serviceTag);
    }
  writeGoogleMapMetaData(applicationTag: any): void {
        let metadataTag = new XmlBuilder("meta-data");
        metadataTag.addAttribute("android", "name", "com.google.android.geo.API_KEY");
        metadataTag.addAttribute("android", "value", "@string/google_maps_key");
        applicationTag.addChildNode(metadataTag);
    }
  writeLegacyLibrary(applicationTag: any): void {
        let usesLibraryTag = new XmlBuilder("uses-library");
        usesLibraryTag.addAttribute("android", "name", "org.apache.http.legacy");
        usesLibraryTag.addAttribute("android", "required", "false");
        applicationTag.addChildNode(usesLibraryTag);
    }
  writeGMSVersion(applicationTag: any): void {
        let metadataTag = new XmlBuilder("meta-data");
        metadataTag.addAttribute("android", "name", "com.google.android.gms.version");
        metadataTag.addAttribute("android", "value", "@integer/google_play_services_version");
        applicationTag.addChildNode(metadataTag);
    }
  writeBroadcast(applicationTag: any, receiverName: string): void {
        let receiverTag = new XmlBuilder("receiver");
        receiverTag.addAttribute("android", "name", receiverName);
        let intentFilterTag = new XmlBuilder("intent-filter");
        let actionTag = new XmlBuilder("action");
        actionTag.addAttribute("android", "name", receiverName);
        intentFilterTag.addChildNode(actionTag);
        if (this.targetsSdkVersion31OrHigher) {
            receiverTag.addAttribute("android", "exported", "true");
        }
        receiverTag.addChildNode(intentFilterTag);
        applicationTag.addChildNode(receiverTag);
    }
  writeAdmobAppId(applicationTag: any): void {
        let metadataTag = new XmlBuilder("meta-data");
        metadataTag.addAttribute("android", "name", "com.google.android.gms.ads.APPLICATION_ID");
        metadataTag.addAttribute("android", "value", this.c.appId);
        applicationTag.addChildNode(metadataTag);
    }
  writeService(applicationTag: any, serviceName: string): void {
        let serviceTag = new XmlBuilder("service");
        serviceTag.addAttribute("android", "name", serviceName);
        serviceTag.addAttribute("android", "enabled", "true");
        applicationTag.addChildNode(serviceTag);
    }
  writeAndroidxRoomService(application: any): void {
        let invalidationService = new XmlBuilder("service");
        invalidationService.addAttribute("android", "name", "androidx.room.MultiInstanceInvalidationService");
        invalidationService.addAttribute("android", "directBootAware", "true");
        invalidationService.addAttribute("android", "exported", "false");
        application.addChildNode(invalidationService);
    }
  writeAndroidxStartupInitializationProvider(application: any): void {
        let initializers = jsetOf(
                new Pair(this.builtInLibraryManager.containsLibrary(BuiltInLibraries.ANDROIDX_EMOJI2), "androidx.emoji2.text.EmojiCompatInitializer"),
                new Pair(this.builtInLibraryManager.containsLibrary(BuiltInLibraries.ANDROIDX_LIFECYCLE_PROCESS), "androidx.lifecycle.ProcessLifecycleInitializer"),
                new Pair(this.builtInLibraryManager.containsLibrary(BuiltInLibraries.ANDROIDX_WORK_RUNTIME), "androidx.work.WorkManagerInitializer")
        );

        if (initializers.stream().anyMatch((initializer) => initializer.first)) {
            let initializationProvider = new XmlBuilder("provider");
            initializationProvider.addAttribute("android", "name", "androidx.startup.InitializationProvider");
            initializationProvider.addAttribute("android", "authorities", this.c.packageName + ".androidx-startup");
            initializationProvider.addAttribute("android", "exported", "false");
            for (const pair of jiter(initializers)) {
                if (pair.first) {
                    let metadata = new XmlBuilder("meta-data");
                    metadata.addAttribute("android", "name", pair.second);
                    metadata.addAttribute("android", "value", "androidx.startup");
                    initializationProvider.addChildNode(metadata);
                }
            }
            application.addChildNode(initializationProvider);
        }
    }
  writeAndroidxWorkRuntimeTags(application: any): void {
        let alarmService = new XmlBuilder("service");
        alarmService.addAttribute("android", "name", "androidx.work.impl.background.systemalarm.SystemAlarmService");
        alarmService.addAttribute("android", "directBootAware", "false");
        alarmService.addAttribute("android", "enabled", "@bool/enable_system_alarm_service_default");
        alarmService.addAttribute("android", "exported", "false");
        application.addChildNode(alarmService);

        let jobService = new XmlBuilder("service");
        jobService.addAttribute("android", "name", "androidx.work.impl.background.systemjob.SystemJobService");
        jobService.addAttribute("android", "directBootAware", "false");
        jobService.addAttribute("android", "enabled", "@bool/enable_system_job_service_default");
        jobService.addAttribute("android", "exported", "true");
        jobService.addAttribute("android", "permission", "android.permission.BIND_JOB_SERVICE");
        application.addChildNode(jobService);

        let foregroundService = new XmlBuilder("service");
        foregroundService.addAttribute("android", "name", "androidx.work.impl.foreground.SystemForegroundService");
        foregroundService.addAttribute("android", "directBootAware", "false");
        foregroundService.addAttribute("android", "enabled", "@bool/enable_system_foreground_service_default");
        foregroundService.addAttribute("android", "exported", "false");
        application.addChildNode(foregroundService);

        let forceStopRunnableReceiver = new XmlBuilder("receiver");
        forceStopRunnableReceiver.addAttribute("android", "name", "androidx.work.impl.utils.ForceStopRunnable$BroadcastReceiver");
        forceStopRunnableReceiver.addAttribute("android", "directBootAware", "false");
        forceStopRunnableReceiver.addAttribute("android", "enabled", "true");
        forceStopRunnableReceiver.addAttribute("android", "exported", "false");
        application.addChildNode(forceStopRunnableReceiver);

        let batteryChargingReceiver = new XmlBuilder("receiver");
        batteryChargingReceiver.addAttribute("android", "name", "androidx.work.impl.background.systemalarm.ConstraintProxy$BatteryChargingProxy");
        batteryChargingReceiver.addAttribute("android", "directBootAware", "false");
        batteryChargingReceiver.addAttribute("android", "enabled", "false");
        batteryChargingReceiver.addAttribute("android", "exported", "false");
        {
            let intentFilter = new XmlBuilder("intent-filter");
            let connectedAction = new XmlBuilder("action");
            connectedAction.addAttribute("android", "name", "android.intent.action.ACTION_POWER_CONNECTED");
            intentFilter.addChildNode(connectedAction);
            let disconnectedAction = new XmlBuilder("action");
            disconnectedAction.addAttribute("android", "name", "android.intent.action.ACTION_POWER_DISCONNECTED");
            intentFilter.addChildNode(disconnectedAction);
            batteryChargingReceiver.addChildNode(intentFilter);
        }
        application.addChildNode(batteryChargingReceiver);

        let batteryNotLowReceiver = new XmlBuilder("receiver");
        batteryNotLowReceiver.addAttribute("android", "name", "androidx.work.impl.background.systemalarm.ConstraintProxy$BatteryNotLowProxy");
        batteryNotLowReceiver.addAttribute("android", "directBootAware", "false");
        batteryNotLowReceiver.addAttribute("android", "enabled", "false");
        batteryNotLowReceiver.addAttribute("android", "exported", "false");
        {
            let intentFilter = new XmlBuilder("intent-filter");
            let okayAction = new XmlBuilder("action");
            okayAction.addAttribute("android", "name", "android.intent.action.BATTERY_OKAY");
            intentFilter.addChildNode(okayAction);
            let lowAction = new XmlBuilder("action");
            lowAction.addAttribute("android", "name", "android.intent.action.BATTERY_LOW");
            intentFilter.addChildNode(lowAction);
            batteryNotLowReceiver.addChildNode(intentFilter);
        }
        application.addChildNode(batteryNotLowReceiver);

        let storageNotLowReceiver = new XmlBuilder("receiver");
        storageNotLowReceiver.addAttribute("android", "name", "androidx.work.impl.background.systemalarm.ConstraintProxy$StorageNotLowProxy");
        storageNotLowReceiver.addAttribute("android", "directBootAware", "false");
        storageNotLowReceiver.addAttribute("android", "enabled", "false");
        storageNotLowReceiver.addAttribute("android", "exported", "false");
        {
            let intentFilter = new XmlBuilder("intent-filter");
            let lowAction = new XmlBuilder("action");
            lowAction.addAttribute("android", "name", "android.intent.action.DEVICE_STORAGE_LOW");
            intentFilter.addChildNode(lowAction);
            let okAction = new XmlBuilder("action");
            okAction.addAttribute("android", "name", "android.intent.action.DEVICE_STORAGE_OK");
            intentFilter.addChildNode(okAction);
            storageNotLowReceiver.addChildNode(intentFilter);
        }
        application.addChildNode(storageNotLowReceiver);

        let networkStateReceiver = new XmlBuilder("receiver");
        networkStateReceiver.addAttribute("android", "name", "androidx.work.impl.background.systemalarm.ConstraintProxy$NetworkStateProxy");
        networkStateReceiver.addAttribute("android", "directBootAware", "false");
        networkStateReceiver.addAttribute("android", "enabled", "false");
        networkStateReceiver.addAttribute("android", "exported", "false");
        {
            let intentFilter = new XmlBuilder("intent-filter");
            let action = new XmlBuilder("action");
            action.addAttribute("android", "name", "android.net.conn.CONNECTIVITY_CHANGE");
            intentFilter.addChildNode(action);
            networkStateReceiver.addChildNode(intentFilter);
        }
        application.addChildNode(networkStateReceiver);

        let rescheduleReceiver = new XmlBuilder("receiver");
        rescheduleReceiver.addAttribute("android", "name", "androidx.work.impl.background.systemalarm.RescheduleReceiver");
        rescheduleReceiver.addAttribute("android", "directBootAware", "false");
        rescheduleReceiver.addAttribute("android", "enabled", "false");
        rescheduleReceiver.addAttribute("android", "exported", "false");
        {
            let intentFilter = new XmlBuilder("intent-filter");
            let bootCompletedAction = new XmlBuilder("action");
            bootCompletedAction.addAttribute("android", "name", "android.intent.action.BOOT_COMPLETED");
            intentFilter.addChildNode(bootCompletedAction);
            let timeSetAction = new XmlBuilder("action");
            timeSetAction.addAttribute("android", "name", "android.intent.action.TIME_SET");
            intentFilter.addChildNode(timeSetAction);
            let timezoneChangedAction = new XmlBuilder("action");
            timezoneChangedAction.addAttribute("android", "name", "android.intent.action.TIMEZONE_CHANGED");
            intentFilter.addChildNode(timezoneChangedAction);
            rescheduleReceiver.addChildNode(intentFilter);
        }
        application.addChildNode(rescheduleReceiver);

        let proxyUpdateReceiver = new XmlBuilder("receiver");
        proxyUpdateReceiver.addAttribute("android", "name", "androidx.work.impl.background.systemalarm.ConstraintProxyUpdateReceiver");
        proxyUpdateReceiver.addAttribute("android", "directBootAware", "false");
        proxyUpdateReceiver.addAttribute("android", "enabled", "@bool/enable_system_alarm_service_default");
        proxyUpdateReceiver.addAttribute("android", "exported", "false");
        {
            let intentFilter = new XmlBuilder("intent-filter");
            let action = new XmlBuilder("action");
            action.addAttribute("android", "name", "androidx.work.impl.background.systemalarm.UpdateProxies");
            intentFilter.addChildNode(action);
            proxyUpdateReceiver.addChildNode(intentFilter);
        }
        application.addChildNode(proxyUpdateReceiver);

        let diagnosticsReceiver = new XmlBuilder("receiver");
        diagnosticsReceiver.addAttribute("android", "name", "androidx.work.impl.diagnostics.DiagnosticsReceiver");
        diagnosticsReceiver.addAttribute("android", "directBootAware", "false");
        diagnosticsReceiver.addAttribute("android", "enabled", "true");
        diagnosticsReceiver.addAttribute("android", "exported", "true");
        diagnosticsReceiver.addAttribute("android", "permission", "android.permission.DUMP");
        {
            let intentFilter = new XmlBuilder("intent-filter");
            let action = new XmlBuilder("action");
            action.addAttribute("android", "name", "androidx.work.diagnostics.REQUEST_DIAGNOSTICS");
            intentFilter.addChildNode(action);
            diagnosticsReceiver.addChildNode(intentFilter);
        }
        application.addChildNode(diagnosticsReceiver);
    }
  setYq(yqVar: any): void {
        this.settings = new ProjectSettings(yqVar.sc_id);
        this.targetsSdkVersion31OrHigher = jparseInt(this.settings.getValue(ProjectSettings.SETTING_TARGET_SDK_VERSION, jstr(VAR_DEFAULT_TARGET_SDK_VERSION))) >= 31;
        this.packageName = yqVar.packageName;
    }
  a(): string {
        let targetSdkVersion;
        try {
            targetSdkVersion = jparseInt(this.settings.getValue(ProjectSettings.SETTING_TARGET_SDK_VERSION, jstr(VAR_DEFAULT_TARGET_SDK_VERSION)));
        } catch (ignored: any) {
            targetSdkVersion = VAR_DEFAULT_TARGET_SDK_VERSION;
        }
        let addRequestLegacyExternalStorage = targetSdkVersion >= 28;

        this.a$.addAttribute("", "package", this.c.packageName);

        if (!this.c.hasPermissions()) {
            if (this.c.hasPermission(jq.PERMISSION_CALL_PHONE)) {
                this.writePermission(this.a$, Manifest.permission.CALL_PHONE);
            }
            if (this.c.hasPermission(jq.PERMISSION_INTERNET)) {
                this.writePermission(this.a$, Manifest.permission.INTERNET);
            }
            if (this.c.hasPermission(jq.PERMISSION_VIBRATE)) {
                this.writePermission(this.a$, Manifest.permission.VIBRATE);
            }
            if (this.c.hasPermission(jq.PERMISSION_ACCESS_NETWORK_STATE)) {
                this.writePermission(this.a$, Manifest.permission.ACCESS_NETWORK_STATE);
            }
            if (this.c.hasPermission(jq.PERMISSION_CAMERA)) {
                this.writePermission(this.a$, Manifest.permission.CAMERA);
            }
            if (this.c.hasPermission(jq.PERMISSION_READ_EXTERNAL_STORAGE)) {
                this.writePermission(this.a$, Manifest.permission.READ_EXTERNAL_STORAGE);
            }
            if (this.c.hasPermission(jq.PERMISSION_WRITE_EXTERNAL_STORAGE)) {
                this.writePermission(this.a$, Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }
            if (this.c.hasPermission(jq.PERMISSION_RECORD_AUDIO)) {
                this.writePermission(this.a$, Manifest.permission.RECORD_AUDIO);
            }
            if (this.c.hasPermission(jq.PERMISSION_BLUETOOTH)) {
                this.writePermission(this.a$, Manifest.permission.BLUETOOTH);
            }
            if (this.c.hasPermission(jq.PERMISSION_BLUETOOTH_ADMIN)) {
                this.writePermission(this.a$, Manifest.permission.BLUETOOTH_ADMIN);
            }
            if (this.c.hasPermission(jq.PERMISSION_ACCESS_FINE_LOCATION)) {
                this.writePermission(this.a$, Manifest.permission.ACCESS_FINE_LOCATION);
            }
        }
        if (FileUtil.isExistFile(this.fpu.getPathPermission(this.c.sc_id))) {
            for (const s of jiter(this.frc.getPermissionList())) {
                this.writePermission(this.a$, s);
            }
        }
        if (this.c.isAdMobEnabled) {
            this.writePermission(this.a$, "com.google.android.gms.permission.AD_ID");
        }
        if (this.builtInLibraryManager.containsLibrary(BuiltInLibraries.ANDROIDX_WORK_RUNTIME)) {
            this.writePermission(this.a$, "android.permission.WAKE_LOCK");
            this.writePermission(this.a$, "android.permission.ACCESS_NETWORK_STATE");
            this.writePermission(this.a$, "android.permission.RECEIVE_BOOT_COMPLETED");
            this.writePermission(this.a$, "android.permission.FOREGROUND_SERVICE");
        }
        if (this.c.x.isFCMUsed) {
            this.writePermission(this.a$, Manifest.permission.WAKE_LOCK);
            this.writePermission(this.a$, "com.google.android.c2dm.permission.RECEIVE");
        }
        AndroidManifestInjector.getP(this.a$, this.c.sc_id);

        if (this.c.isAdMobEnabled || this.c.isTextToSpeechUsed || this.c.isSpeechToTextUsed) {
            let queries = new XmlBuilder("queries");
            if (this.c.isAdMobEnabled) {
                let forBrowserContent = new XmlBuilder("intent");
                {
                    let action = new XmlBuilder("action");
                    action.addAttribute("android", "name", "android.intent.action.VIEW");
                    forBrowserContent.addChildNode(action);
                    let category = new XmlBuilder("category");
                    category.addAttribute("android", "name", "android.intent.category.BROWSABLE");
                    forBrowserContent.addChildNode(category);
                    let data = new XmlBuilder("data");
                    data.addAttribute("android", "scheme", "https");
                    forBrowserContent.addChildNode(data);
                }
                queries.addChildNode(forBrowserContent);
                let forCustomTabsService = new XmlBuilder("intent");
                {
                    let action = new XmlBuilder("action");
                    action.addAttribute("android", "name", "android.support.customtabs.action.CustomTabsService");
                    forCustomTabsService.addChildNode(action);
                }
                queries.addChildNode(forCustomTabsService);
            }
            if (this.c.isTextToSpeechUsed && targetSdkVersion >= 30) {
                let intent = new XmlBuilder("intent");
                let action = new XmlBuilder("action");
                action.addAttribute("android", "name", "android.intent.action.TTS_SERVICE");
                intent.addChildNode(action);
                queries.addChildNode(intent);
            }
            if (this.c.isSpeechToTextUsed && targetSdkVersion >= 30) {
                let intent = new XmlBuilder("intent");
                let action = new XmlBuilder("action");
                action.addAttribute("android", "name", "android.speech.RecognitionService");
                intent.addChildNode(action);
                queries.addChildNode(intent);
            }
            this.a$.addChildNode(queries);
        }

        let applicationTag = new XmlBuilder("application");
        applicationTag.addAttribute("android", "allowBackup", "true");
        applicationTag.addAttribute("android", "icon", "@mipmap/ic_launcher");
        applicationTag.addAttribute("android", "label", "@string/app_name");

        let applicationClassName = this.settings.getValue(ProjectSettings.SETTING_APPLICATION_CLASS, ".SketchApplication");
        applicationTag.addAttribute("android", "name", applicationClassName);
        if (addRequestLegacyExternalStorage) {
            applicationTag.addAttribute("android", "requestLegacyExternalStorage", "true");
        }
        if (!this.buildSettings.getValue(BuildSettings.SETTING_NO_HTTP_LEGACY, BuildSettings.SETTING_GENERIC_VALUE_FALSE)
                .equals(BuildSettings.SETTING_GENERIC_VALUE_TRUE)) {
            applicationTag.addAttribute("android", "usesCleartextTraffic", "true");
        }
        AndroidManifestInjector.getAppAttrs(applicationTag, this.c.sc_id);

        let hasDebugActivity = false;
        for (const projectFileBean of jiter(this.b)) {
            if (!projectFileBean.fileName.contains("_fragment")) {
                let activityTag = new XmlBuilder("activity");

                let javaName = projectFileBean.getJavaName();
                activityTag.addAttribute("android", "name", "." + javaName.substring(0, javaName.indexOf(".java")));

                if (!AndroidManifestInjector.getActivityAttrs(activityTag, this.c.sc_id, projectFileBean.getJavaName())) {
                    activityTag.addAttribute("android", "configChanges", "orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout");
                    activityTag.addAttribute("android", "hardwareAccelerated", "true");
                    activityTag.addAttribute("android", "supportsPictureInPicture", "true");
                }
                if (!AndroidManifestInjector.isActivityThemeUsed(activityTag, this.c.sc_id, projectFileBean.getJavaName())) {
                    if (this.c.g) {
                        if (projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FULLSCREEN)) {
                            activityTag.addAttribute("android", "theme", "@style/AppTheme.FullScreen");
                        }
                    } else if (projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FULLSCREEN)) {
                        if (projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR)) {
                            activityTag.addAttribute("android", "theme", "@style/NoStatusBar");
                        } else {
                            activityTag.addAttribute("android", "theme", "@style/FullScreen");
                        }
                    } else if (!projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR)) {
                        activityTag.addAttribute("android", "theme", "@style/NoActionBar");
                    }
                }
                if (!AndroidManifestInjector.isActivityOrientationUsed(activityTag, this.c.sc_id, projectFileBean.getJavaName())) {
                    let orientation = projectFileBean.orientation;
                    if (orientation == ProjectFileBean.ORIENTATION_PORTRAIT) {
                        activityTag.addAttribute("android", "screenOrientation", "portrait");
                    } else if (orientation == ProjectFileBean.ORIENTATION_LANDSCAPE) {
                        activityTag.addAttribute("android", "screenOrientation", "landscape");
                    }
                }
                if (!AndroidManifestInjector.isActivityKeyboardUsed(activityTag, this.c.sc_id, projectFileBean.getJavaName())) {
                    let keyboardSetting = vq.a(projectFileBean.keyboardSetting);
                    if (!keyboardSetting.isEmpty()) {
                        activityTag.addAttribute("android", "windowSoftInputMode", keyboardSetting);
                    }
                }
                if (projectFileBean.fileName.equals(AndroidManifestInjector.getLauncherActivity(this.c.sc_id))) {
                    let intentFilterTag = new XmlBuilder("intent-filter");
                    let actionTag = new XmlBuilder("action");
                    actionTag.addAttribute("android", "name", Intent.ACTION_MAIN);
                    intentFilterTag.addChildNode(actionTag);
                    let categoryTag = new XmlBuilder("category");
                    categoryTag.addAttribute("android", "name", Intent.CATEGORY_LAUNCHER);
                    intentFilterTag.addChildNode(categoryTag);
                    if (this.targetsSdkVersion31OrHigher && !AndroidManifestInjector.isActivityExportedUsed(this.c.sc_id, javaName)) {
                        activityTag.addAttribute("android", "exported", "true");
                    }
                    activityTag.addChildNode(intentFilterTag);
                }
                applicationTag.addChildNode(activityTag);
            }
            if (projectFileBean.fileName.equals("debug")) {
                hasDebugActivity = true;
            }
        }

        if (!hasDebugActivity) {
            let activityTag = new XmlBuilder("activity");
            activityTag.addAttribute("android", "name", ".DebugActivity");
            activityTag.addAttribute("android", "screenOrientation", "portrait");
            activityTag.addAttribute("android", "theme", "@style/AppTheme.DebugActivity");
            applicationTag.addChildNode(activityTag);
        }
        if (this.c.isAdMobEnabled) {
            let activityTag = new XmlBuilder("activity");
            activityTag.addAttribute("android", "name", "com.google.android.gms.ads.AdActivity");
            activityTag.addAttribute("android", "configChanges", "keyboard|keyboardHidden|orientation|screenLayout|uiMode|screenSize|smallestScreenSize");
            activityTag.addAttribute("android", "exported", "false");
            activityTag.addAttribute("android", "theme", "@android:style/Theme.Translucent");
            applicationTag.addChildNode(activityTag);

            let initProvider = new XmlBuilder("provider");
            initProvider.addAttribute("android", "name", "com.google.android.gms.ads.MobileAdsInitProvider");
            initProvider.addAttribute("android", "authorities", this.c.packageName + ".mobileadsinitprovider");
            initProvider.addAttribute("android", "exported", "false");
            initProvider.addAttribute("android", "initOrder", "100");
            applicationTag.addChildNode(initProvider);

            let adService = new XmlBuilder("service");
            adService.addAttribute("android", "name", "com.google.android.gms.ads.AdService");
            adService.addAttribute("android", "enabled", "true");
            adService.addAttribute("android", "exported", "false");
            applicationTag.addChildNode(adService);

            let testingActivity = new XmlBuilder("activity");
            testingActivity.addAttribute("android", "name", "com.google.android.gms.ads.OutOfContextTestingActivity");
            testingActivity.addAttribute("android", "configChanges", "keyboard|keyboardHidden|orientation|screenLayout|uiMode|screenSize|smallestScreenSize");
            testingActivity.addAttribute("android", "exported", "false");
            applicationTag.addChildNode(testingActivity);
        }
        if (this.builtInLibraryManager.containsLibrary(BuiltInLibraries.ANDROIDX_ROOM_RUNTIME)) {
            this.writeAndroidxRoomService(applicationTag);
        }
        this.writeAndroidxStartupInitializationProvider(applicationTag);
        if (this.builtInLibraryManager.containsLibrary(BuiltInLibraries.ANDROIDX_WORK_RUNTIME)) {
            this.writeAndroidxWorkRuntimeTags(applicationTag);
        }
        if (this.c.isFirebaseEnabled || this.c.isAdMobEnabled || this.c.isMapUsed) {
            this.writeGMSVersion(applicationTag);
        }
        if (this.c.isFirebaseEnabled) {
            this.writeFirebaseMetaData(applicationTag);
        }
        if (this.c.u) {
            this.writeFileProvider(applicationTag);
        }
        if (this.c.isAdMobEnabled && !jisEmpty(this.c.appId)) {
            this.writeAdmobAppId(applicationTag);
        }
        if (this.c.isMapUsed) {
            this.writeGoogleMapMetaData(applicationTag);
        }
        if (this.c.x.isFCMUsed) {
            EditorManifest.writeDefFCM(applicationTag);
        }
        if (this.c.x.isFBGoogleUsed) {
            EditorManifest.manifestFBGoogleLogin(applicationTag);
        }
        if (FileUtil.isExistFile(this.fpu.getManifestJava(this.c.sc_id))) {
            let activityAttrs = this.getActivityAttrs();
            for (const activityName of jiter(this.frc.getJavaManifestList())) {
                this.writeJava(applicationTag, activityName, activityAttrs);
            }
        }
        if (this.buildSettings.getValue(BuildSettings.SETTING_NO_HTTP_LEGACY, BuildSettings.SETTING_GENERIC_VALUE_FALSE)
                .equals(BuildSettings.SETTING_GENERIC_VALUE_FALSE)) {
            this.writeLegacyLibrary(applicationTag);
        }
        if (FileUtil.isExistFile(this.fpu.getManifestService(this.c.sc_id))) {
            for (const serviceName of jiter(this.frc.getServiceManifestList())) {
                this.writeService(applicationTag, serviceName);
            }
        }
        if (FileUtil.isExistFile(this.fpu.getManifestBroadcast(this.c.sc_id))) {
            for (const receiverName of jiter(this.frc.getBroadcastManifestList())) {
                this.writeBroadcast(applicationTag, receiverName);
            }
        }
        this.a$.addChildNode(applicationTag);
        // Needed, as crashing on my SM-A526B with Android 12 / One UI 4.1 / firmware build A526BFXXS1CVD1 otherwise
        //noinspection RegExpRedundantEscape
        return AndroidManifestInjector.mHolder(this.a$.toCode(), this.c.sc_id).jreplaceAll("\\$\\{applicationId\\}", this.packageName);
    }
  writeJava(applicationTag: any, activityName: string, activityAttrs: any): void {
        let activityTag = new XmlBuilder("activity");
        let specifiedActivityName = false;
        let specifiedConfigChanges = false;
        for (const hashMap of jiter(activityAttrs)) {
            if (hashMap.containsKey("name") && hashMap.containsKey("value")) {
                let nameObject = hashMap.get("name");
                let valueObject = hashMap.get("value");
                if (typeof nameObject === 'string' && typeof valueObject === 'string') {
                    let name = nameObject.toString();
                    let value = valueObject.toString();
                    if (name.equals(activityName)) {
                        activityTag.addAttributeValue(value);
                        if (value.contains("android:name=")) {
                            specifiedActivityName = true;
                        } else if (value.contains("android:configChanges=")) {
                            specifiedConfigChanges = true;
                        }
                    }
                }
            }
        }
        if (!specifiedActivityName) {
            activityTag.addAttribute("android", "name", activityName);
        }
        if (!specifiedConfigChanges) {
            activityTag.addAttribute("android", "configChanges", "orientation|screenSize");
        }
        applicationTag.addChildNode(activityTag);
    }
  getActivityAttrs(): any {
        let activityAttributesPath = FileUtil.getExternalStorageDir().concat("/.sketchware/data/").concat(this.c.sc_id).concat("/Injection/androidmanifest/attributes.json");
        if (FileUtil.isExistFile(activityAttributesPath)) {
            try {
                return new Gson().fromJson(FileUtil.readFile(activityAttributesPath), Helper.TYPE_MAP_LIST);
            } catch (ignored: any) {
            }
        }
        return [];
    }
}