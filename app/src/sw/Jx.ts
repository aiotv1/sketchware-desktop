// Auto-ported from Jx.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: dev.aldi.sayuti.block.ExtraBlockFile.getExtraBlockData, android.text.TextUtils, android.util.Pair, com.besome.sketch.beans.BlockBean, com.besome.sketch.beans.ComponentBean, com.besome.sketch.beans.ProjectFileBean, com.besome.sketch.beans.ViewBean, com.besome.sketch.editor.manage.library.material3.Material3LibraryManager, java.util.ArrayList, java.util.Collections, java.util.HashMap, java.util.Map, java.util.Set, java.util.regex.Pattern, mod.agus.jcoderz.beans.ViewBeans, mod.agus.jcoderz.editor.manage.library.locallibrary.ManageLocalLibrary, mod.agus.jcoderz.handle.component.ConstVarComponent, mod.hey.studios.build.BuildSettings, mod.hey.studios.project.ProjectSettings, mod.hilal.saif.android_manifest.AndroidManifestInjector, mod.hilal.saif.blocks.CommandBlock, mod.hilal.saif.events.LogicHandler, mod.pranav.viewbinding.ViewBindingBuilder, pro.sketchware.control.logic.PermissionManager
// <imports>
import { jisEmpty, jlist, jiter, StringBuilder } from '../codegen/jshim';
import { ViewBean, ComponentBean, ProjectFileBean } from '../core/beans';
import { AndroidManifestInjector } from './AndroidManifestInjector';
import { BuildSettings } from './BuildSettings';
import { CommandBlock } from './CommandBlock';
import { Fx } from './Fx';
import { Hx } from './Hx';
import { LogicHandler } from './LogicHandler';
import { Lx } from './Lx';
import { ManageLocalLibrary } from './ManageLocalLibrary';
import { Material3LibraryManager } from './Material3LibraryManager';
import { Ox } from './Ox';
import { PermissionManager } from './PermissionManager';
import { ProjectSettings } from './ProjectSettings';
import { ViewBeans } from './ViewBeans';
import { ViewBindingBuilder } from './ViewBindingBuilder';
import { Collections, Pattern } from './env';
import { mq } from './mq';
import { getExtraBlockData, jC } from './platform';
// </imports>
export class Jx {
  static EOL: string = "\r\n";
  static WIDGET_NAME_PATTERN: any = Pattern.compile("\\w*\\..*\\.");
  settings: any;
  permissionManager: any;
  packageName: string;
  projectFileBean: any;
  projectDataManager: any;
  buildConfig: any;
  ox: any;
  isViewBindingEnabled: boolean;
  fieldsWithStaticInitializers: any = [];
  fields: any = [];
  lists: any = [];
  views: any = [];
  components: any = [];
  initializeMethodCode: any = [];
  mll: any;
  componentInitializers: any = [];
  moreBlocks: any = [];
  adapterClasses: any = [];
  filePickerRequestCodes: any = [];
  extraBlocks: any;
  eventManager: any;
  imports: any = [];
  onCreateEventCode: string = "";
  materialLibraryManager: any;
  constructor(jqVar: any, projectFileBean: any, eCVar: any) {
        this.packageName = jqVar.packageName;
        this.projectFileBean = projectFileBean;
        this.projectDataManager = eCVar;
        this.buildConfig = jqVar;
        this.mll = new ManageLocalLibrary(eCVar.a);
        this.settings = new ProjectSettings(eCVar.a);
        this.permissionManager = new PermissionManager(eCVar.a, projectFileBean.getJavaName());
        this.ox = new Ox(this.buildConfig, projectFileBean);
        this.extraBlocks = getExtraBlockData();
        this.isViewBindingEnabled = this.settings.getValue(ProjectSettings.SETTING_ENABLE_VIEWBINDING, BuildSettings.SETTING_GENERIC_VALUE_FALSE)
                .equals(BuildSettings.SETTING_GENERIC_VALUE_TRUE);
        this.materialLibraryManager = new Material3LibraryManager(this.projectDataManager.a$);
    }
  activityResult(): string {
        let blocks = jC.a(this.projectDataManager.a$).a(this.projectFileBean.getJavaName(), "onActivityResult_onActivityResult");
        return Lx.j(new Fx(this.projectFileBean.getActivityName(), this.buildConfig, blocks, this.isViewBindingEnabled).a(), false);
    }
  initializeLogic(): string {
        let blocks = jC.a(this.projectDataManager.a$).a(this.projectFileBean.getJavaName(), "initializeLogic_initializeLogic");
        return Lx.j(new Fx(this.projectFileBean.getActivityName(), this.buildConfig, blocks, this.isViewBindingEnabled).a(), false);
    }
  extraVariables(): void {
        for (const blocks of jiter(jC.a(this.projectDataManager.a$).b(this.projectFileBean.getJavaName()).entrySet())) {
            for (const block of jiter(blocks.getValue())) {
                switch (block.opCode) {
                    case "addCustomVariable":
                        if (!block.parameters.get(0).trim().isEmpty()) {
                            this.fields.add(block.parameters.get(0));
                        }
                        break;

                    case "addInitializer":
                        if (!block.parameters.get(0).trim().isEmpty()) {
                            this.initializeMethodCode.add(block.parameters.get(0));
                        }
                        break;
                }
            }
        }
    }
  removeExtraImports(): void {
        let newImports = [];
        for (const value of jiter(this.imports)) {
            if (!newImports.contains(value) && !value.trim().isEmpty()) {
                newImports.add(value);
            }
        }
        this.imports = newImports;
    }
  getLauncherActivity(packageName: string): string {
        let theImport = "";

        let activityName = ProjectFileBean.getActivityName(AndroidManifestInjector.getLauncherActivity(this.projectDataManager.a$));
        if (!activityName.equals("MainActivity")) {
            theImport = "import " + packageName + "." + activityName + ";" + Jx.EOL;
        }

        return theImport;
    }
  getBillingResponseCode(component: any): string {
        let param = component.param;
        if (param == null || !param.containsKey("OnResultBillingResponse")) {
            return "";
        }

        let arrayList = param.get("OnResultBillingResponse");
        return "if (!" + arrayList.get(0) + ".handleActivityResult(_requestCode, _resultCode, _data))";
    }
  generateCode(isAndroidStudioExport: boolean, sc_id: string): string {
        let isDialogFragment = this.projectFileBean.fileName.contains("_dialog_fragment");
        let isBottomDialogFragment = this.projectFileBean.fileName.contains("_bottomdialog_fragment");
        let isFragment = this.projectFileBean.fileName.contains("_fragment");

        this.extraVariables();
        this.handleAppCompat();
        this.addFieldsDeclaration();
        this.addDrawerComponentInitializer();
        this.initializeEventsCodeGenerator();
        this.addMoreBlockCodes();
        this.addAdapterCode();
        this.addRequestCodeConstants();
        this.addImportsForBlocks();
        this.addLocalLibraryImports();

        let sb = new StringBuilder(8192);
        sb.append("package ").append(this.packageName).append(";").append(Jx.EOL)
                .append(Jx.EOL);
        if (this.projectFileBean.getActivityName().equals("MainActivity")) {
            sb.append(this.getLauncherActivity(this.packageName));
        }

        if (this.buildConfig.isFirebaseEnabled) this.addImport("com.google.firebase.FirebaseApp");

        if (this.buildConfig.isAdMobEnabled) {
            this.addImport("com.google.android.gms.ads.MobileAds");

            if (this.buildConfig.isDebugBuild)
                this.addImport("com.google.android.gms.ads.RequestConfiguration");
        }

        if (this.buildConfig.g) {
            this.addImport("androidx.fragment.app.Fragment");
            this.addImport("androidx.fragment.app.FragmentManager");
            this.addImport("androidx.fragment.app.DialogFragment");
            if (isBottomDialogFragment) {
                this.addImport("com.google.android.material.bottomsheet.BottomSheetDialogFragment");
            }
        } else {
            this.addImport("android.app.Fragment");
            this.addImport("android.app.FragmentManager");
            this.addImport("android.app.DialogFragment");
        }
        if (this.permissionManager.hasNewPermission() || this.buildConfig.a(this.projectFileBean.getActivityName()).a()) {
            if (this.buildConfig.g) {
                this.addImport("androidx.core.content.ContextCompat");
                this.addImport("androidx.core.app.ActivityCompat");
            }
            this.addImport("android.Manifest");
            this.addImport("android.content.pm.PackageManager");
        }
        if (this.isViewBindingEnabled) {
            this.addImport(this.packageName + ".databinding.*");
        }

        this.removeExtraImports();
        Collections.sort(this.imports);
        for (const anImport of jiter(this.imports)) {
            sb.append("import ").append(anImport).append(";").append(Jx.EOL);
        }

        let importsAddedByImportBlocks = LogicHandler.imports(this.eventManager.generateActivityLifecycleEventCode());
        if (!importsAddedByImportBlocks.isEmpty()) {
            sb.append(importsAddedByImportBlocks).append(Jx.EOL);
        }
        sb.append(Jx.EOL);

        sb.append("public class ").append(this.projectFileBean.getActivityName()).append(" extends ");
        if (this.buildConfig.g) {
            if (isBottomDialogFragment) {
                sb.append("BottomSheetDialogFragment");
            } else if (isDialogFragment) {
                sb.append("DialogFragment");
            } else if (isFragment) {
                sb.append("Fragment");
            } else {
                sb.append("AppCompatActivity");
            }
        } else {
            if (isBottomDialogFragment) {
                sb.append("/* Enable AppCompat to use it */");
            } else if (isDialogFragment) {
                sb.append("DialogFragment");
            } else if (isFragment) {
                sb.append("Fragment");
            } else {
                sb.append("Activity");
            }
        }
        sb.append(" {").append(Jx.EOL);

        let activityHasFields = false;

        for (const constant of jiter(this.filePickerRequestCodes)) {
            if (!constant.isEmpty()) {
                activityHasFields = true;
                sb.append(Jx.EOL);
                sb.append(constant);
            }
        }

        if (!this.fieldsWithStaticInitializers.isEmpty()) {
            if (activityHasFields) sb.append(Jx.EOL);
            activityHasFields = true;

            for (const componentFieldDeclaration of jiter(this.fieldsWithStaticInitializers)) {
                if (!componentFieldDeclaration.isEmpty()) {
                    sb.append(Jx.EOL);
                    sb.append(componentFieldDeclaration);
                }
            }
        }

        if (!this.fields.isEmpty()) {
            if (activityHasFields) sb.append(Jx.EOL);
            activityHasFields = true;

            for (const field of jiter(this.fields)) {
                if (!field.isEmpty()) {
                    sb.append(Jx.EOL);
                    sb.append(field);
                }
            }
        }

        if (!this.lists.isEmpty()) {
            if (activityHasFields) sb.append(Jx.EOL);
            activityHasFields = true;

            for (const value of jiter(this.lists)) {
                if (!value.isEmpty()) {
                    sb.append(Jx.EOL);
                    sb.append(value);
                }
            }
        }

        if (!this.views.isEmpty()) {
            if (activityHasFields) sb.append(Jx.EOL);
            activityHasFields = true;

            for (const viewDeclaration of jiter(this.views)) {
                if (!viewDeclaration.isEmpty()) {
                    sb.append(Jx.EOL);
                    sb.append(viewDeclaration);
                }
            }
        }

        if (!this.components.isEmpty()) {
            if (activityHasFields) sb.append(Jx.EOL);
            activityHasFields = true;

            for (const componentFieldDeclaration of jiter(this.components)) {
                if (!componentFieldDeclaration.isEmpty()) {
                    sb.append(Jx.EOL);
                    sb.append(componentFieldDeclaration);
                }
            }
        }

        if (activityHasFields) sb.append(Jx.EOL);

        sb.append(Jx.EOL);
        let bindingName = ViewBindingBuilder.generateFileNameForLayout(this.projectFileBean.fileName);
        if (isFragment) {
            if (this.buildConfig.g) {
                sb.append("@NonNull").append(Jx.EOL);
                sb.append("@Override").append(Jx.EOL);
                sb.append("public View onCreateView(@NonNull LayoutInflater _inflater, " +
                        "@Nullable ViewGroup _container, @Nullable Bundle _savedInstanceState) {").append(Jx.EOL);
            } else {
                sb.append("@Override").append(Jx.EOL);
                sb.append("public View onCreateView(LayoutInflater _inflater, ViewGroup _container, " +
                        "Bundle _savedInstanceState) {").append(Jx.EOL);
            }
            if (this.isViewBindingEnabled) {
                sb.append("binding = ").append(bindingName).append(".inflate(_inflater, _container, false);").append(Jx.EOL);
                sb.append("initialize(_savedInstanceState, binding.getRoot());");
            } else {
                sb.append("View _view = _inflater.inflate(R.layout.").append(this.projectFileBean.fileName).append(", _container, false);").append(Jx.EOL);
                sb.append("initialize(_savedInstanceState, _view);");
            }
        } else {
            sb.append("@Override").append(Jx.EOL);
            sb.append("protected void onCreate(Bundle _savedInstanceState) {").append(Jx.EOL);
            sb.append("super.onCreate(_savedInstanceState);").append(Jx.EOL);

            if (this.isViewBindingEnabled) {
                sb.append("binding = ").append(bindingName).append(".inflate(getLayoutInflater());").append(Jx.EOL);
                sb.append("setContentView(binding.getRoot());").append(Jx.EOL);
            } else {
                sb.append("setContentView(R.layout.").append(this.projectFileBean.fileName).append(");").append(Jx.EOL);
            }
            sb.append("initialize(_savedInstanceState);");
        }
        sb.append(Jx.EOL);
        if (this.buildConfig.isFirebaseEnabled) {
            if (isFragment) {
                sb.append("FirebaseApp.initializeApp(getContext());");
            } else {
                sb.append("FirebaseApp.initializeApp(this);");
            }
            sb.append(Jx.EOL);
        }

        if (this.buildConfig.isAdMobEnabled && !isFragment) {
            if (!this.buildConfig.isFirebaseEnabled) {
                sb.append(Jx.EOL);
            }
            sb.append("MobileAds.initialize(this);");
            sb.append(Jx.EOL);
            if (this.fieldsWithStaticInitializers.contains(Lx.getComponentFieldCode("InterstitialAd"))) {
                sb.append("_ad_unit_id = \"").append(this.buildConfig.isDebugBuild ? "ca-app-pub-3940256099942544/1033173712" : this.buildConfig.interstitialAdUnitId).append("\";");
            }
            if (this.fieldsWithStaticInitializers.contains(Lx.getComponentFieldCode("RewardedVideoAd"))) {
                sb.append("_reward_ad_unit_id = \"").append(this.buildConfig.isDebugBuild ? "ca-app-pub-3940256099942544/5224354917" : this.buildConfig.rewardAdUnitId).append("\";");
            }

            if (this.buildConfig.isDebugBuild) {
                let testDevicesListCode = new StringBuilder("List<String> testDeviceIds = Arrays.asList(");
                let testDevices = this.buildConfig.t;
                for (let j = 0, testDevicesSize = testDevices.size(); j < testDevicesSize; j++) {
                    let testDeviceId = testDevices.get(j);

                    testDevicesListCode.append("\"").append(testDeviceId).append("\"");
                    if (j != testDevicesSize - 1) {
                        testDevicesListCode.append(", ");
                    }
                }
                testDevicesListCode.append(");").append(Jx.EOL);

                sb.append(Jx.EOL);
                sb.append(testDevicesListCode);
                sb.append("MobileAds.setRequestConfiguration(new RequestConfiguration.Builder().setTestDeviceIds(testDeviceIds).build());");
            }

            sb.append(Jx.EOL);
        }

        if (!isFragment) {
            // Adds initializeLogic() call too, don't worry
            sb.append(this.permissionManager.writePermission(this.buildConfig.g, this.buildConfig.a(this.projectFileBean.getActivityName()).c));
        } else {
            sb.append("initializeLogic();").append(Jx.EOL);
            if (this.isViewBindingEnabled) {
                sb.append("return binding.getRoot();").append(Jx.EOL);
            } else {
                sb.append("return _view;").append(Jx.EOL);
            }
        }
        sb.append("}").append(Jx.EOL);

        if (this.permissionManager.hasPermission && !isFragment) {
            sb.append(Jx.EOL);
            sb.append("@Override").append(Jx.EOL);
            sb.append("public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {").append(Jx.EOL);
            sb.append("super.onRequestPermissionsResult(requestCode, permissions, grantResults);").append(Jx.EOL);
            sb.append("if (requestCode == 1000) {").append(Jx.EOL);
            sb.append("initializeLogic();").append(Jx.EOL);
            sb.append("}").append(Jx.EOL);
            sb.append("}").append(Jx.EOL);
        }
        sb.append(Jx.EOL);

        if (isFragment) {
            sb.append("private void initialize(Bundle _savedInstanceState, View _view) {");
        } else {
            sb.append("private void initialize(Bundle _savedInstanceState) {");
        }
        if (!jisEmpty(this.initializeLogic())) {
            sb.append(Jx.EOL);
            sb.append(this.initializeLogic());
        }

        for (const value of jiter(this.initializeMethodCode)) {
            if (!value.isEmpty()) {
                sb.append(Jx.EOL);
                sb.append(value);
            }
        }

        for (const componentInitializer of jiter(this.componentInitializers)) {
            if (!componentInitializer.isEmpty()) {
                sb.append(Jx.EOL);
                sb.append(componentInitializer);
            }
        }

        let hxG = this.eventManager.generateViewEvents();
        if (!hxG.isEmpty()) {
            sb.append(Jx.EOL);
            sb.append(Jx.EOL);
            sb.append(hxG);
        }

        let hxC = this.eventManager.generateComponentEvents();
        if (!hxC.isEmpty()) {
            sb.append(Jx.EOL);
            sb.append(Jx.EOL);
            sb.append(hxC);
        }

        let hxD = this.eventManager.generateDrawerEvents();
        if (!hxD.isEmpty()) {
            sb.append(Jx.EOL);
            sb.append(Jx.EOL);
            sb.append(hxD);
        }

        let hxF = this.eventManager.generateAuthEvents();
        if (!hxF.isEmpty()) {
            sb.append(Jx.EOL);
            sb.append(Jx.EOL);
            sb.append(hxF);
        }

        sb.append(Jx.EOL);
        sb.append("}").append(Jx.EOL);
        sb.append(Jx.EOL);
        sb.append("private void initializeLogic() {").append(Jx.EOL);
        if (!this.onCreateEventCode.isEmpty()) {
            sb.append(this.onCreateEventCode).append(Jx.EOL);
        }
        sb.append("}").append(Jx.EOL);

        let agusComponentsOnActivityResultCode = this.getBillingResponseCode(this.buildConfig.x);
        let onActivityResultLogic = this.activityResult();
        let onActivityResultSwitchLogic = this.eventManager.getOnActivityResultSwitchCases();
        if (!agusComponentsOnActivityResultCode.isEmpty() || !onActivityResultLogic.isEmpty() || !onActivityResultSwitchLogic.isEmpty()) {
            sb.append(Jx.EOL);
            sb.append("@Override").append(Jx.EOL);
            if (isFragment) {
                sb.append("public");
            } else {
                sb.append("protected");
            }
            sb.append(" void onActivityResult(int _requestCode, int _resultCode, Intent _data) {").append(Jx.EOL);
            sb.append(agusComponentsOnActivityResultCode);
            sb.append("super.onActivityResult(_requestCode, _resultCode, _data);").append(Jx.EOL);
            sb.append(onActivityResultLogic).append(Jx.EOL);
            sb.append("switch (_requestCode) {").append(Jx.EOL);
            sb.append(onActivityResultSwitchLogic).append(Jx.EOL);
            sb.append("default:").append(Jx.EOL);
            sb.append("break;").append(Jx.EOL);
            sb.append("}").append(Jx.EOL);
            sb.append("}").append(Jx.EOL);
        }

        if (this.projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER) && !this.isViewBindingEnabled) {
            this.eventManager.addLifecycleEvent("onBackPressed", "DrawerLayout", "_drawer");
        }

        let beans = this.projectDataManager.d(this.projectFileBean.getXmlName());
        for (const next of jiter(beans)) {
            if (next.type == ViewBean.VIEW_TYPE_WIDGET_MAPVIEW) {
                this.eventManager.addLifecycleEvent("onStart", "MapView", next.id);
                this.eventManager.addLifecycleEvent("onResume", "MapView", next.id);
                this.eventManager.addLifecycleEvent("onPause", "MapView", next.id);
                this.eventManager.addLifecycleEvent("onStop", "MapView", next.id);
                this.eventManager.addLifecycleEvent("onDestroy", "MapView", next.id);
            }
            if (next.type == ViewBean.VIEW_TYPE_WIDGET_ADVIEW) {
                this.eventManager.addLifecycleEvent("onResume", "AdView", next.id);
                this.eventManager.addLifecycleEvent("onPause", "AdView", next.id);
                this.eventManager.addLifecycleEvent("onDestroy", "AdView", next.id);
            }
        }
        if (!this.eventManager.k.isEmpty()) {
            sb.append(Jx.EOL);
            sb.append(this.eventManager.k).append(Jx.EOL);
        }
        if (!this.eventManager.l.isEmpty()) {
            sb.append(Jx.EOL);
            sb.append(this.eventManager.l);
            sb.append(Jx.EOL);
        }

        let base = LogicHandler.base(this.eventManager.generateActivityLifecycleEventCode());
        if (!base.isEmpty()) {
            sb.append(Jx.EOL);
            sb.append(base);
        }

        for (const moreBlocksCode of jiter(this.moreBlocks)) {
            sb.append(Jx.EOL);
            sb.append(moreBlocksCode).append(Jx.EOL);
        }

        sb.append(Jx.EOL);
        for (let j = 0, qSize = this.adapterClasses.size(); j < qSize; j++) {
            let adapterCode = this.adapterClasses.get(j);

            if (base.contains("public CharSequence onTabLayoutNewTabAdded(int _position) {")
                    || !adapterCode.contains("return onTabLayoutNewTabAdded(pos);")) {
                sb.append(adapterCode);
            } else {
                sb.append(adapterCode.jreplace("return onTabLayoutNewTabAdded(pos);",
                        "// Use the Activity Event (onTabLayoutNewTabAdded) in order to use this method" + Jx.EOL +
                                "return \"page \" + String.valueOf(pos);"));
            }
            if (j != qSize - 1) {
                sb.append(Jx.EOL);
            }
        }
        if (!isFragment && !this.settings.getValue(ProjectSettings.SETTING_DISABLE_OLD_METHODS, BuildSettings.SETTING_GENERIC_VALUE_TRUE)
                .equals(BuildSettings.SETTING_GENERIC_VALUE_TRUE)) {
            sb.append(this.getDeprecatedMethodsCode());
        }
        sb.append("}").append(Jx.EOL);
        let code = sb.toString();

        if (isFragment) {
            code = code.jreplaceAll("getApplicationContext\\(\\)", "getContext().getApplicationContext()")
                    .jreplaceAll("getBaseContext\\(\\)", "getActivity().getBaseContext()")
                    .jreplaceAll("\\(ClipboardManager\\) getSystemService", "(ClipboardManager) getContext().getSystemService")
                    .jreplaceAll("\\(Vibrator\\) getSystemService", "(Vibrator) getContext().getSystemService")
                    .jreplaceAll("\\(SensorManager\\) getSystemService", "(SensorManager) getContext().getSystemService")
                    .jreplaceAll("Typeface.createFromAsset\\(getAssets\\(\\)", "Typeface.createFromAsset(getContext().getAssets()")
                    .jreplaceAll("= getAssets\\(\\).open", "= getContext().getAssets().open")
                    .jreplaceAll("(?<!\\.)getSharedPreferences", "getContext().getSharedPreferences")
                    .jreplaceAll("AlertDialog.Builder\\(this\\);", "AlertDialog.Builder(getActivity());")
                    .jreplaceAll("SpeechRecognizer.createSpeechRecognizer\\(this\\);", "SpeechRecognizer.createSpeechRecognizer(getContext());")
                    .jreplaceAll("new RequestNetwork\\(this\\);", "new RequestNetwork((Activity) getContext());")
                    .jreplaceAll("new BluetoothConnect\\(this\\);", "new BluetoothConnect((Activity) getContext());")
                    .jreplaceAll("MobileAds.getRewardedVideoAdInstance\\(this\\);", "MobileAds.getRewardedVideoAdInstance(getContext());")
                    .jreplaceAll("runOnUiThread\\(new", "getActivity().runOnUiThread(new")
                    .jreplaceAll(".setLayoutManager\\(new LinearLayoutManager\\(this", ".setLayoutManager(new LinearLayoutManager(getContext()")
                    .jreplaceAll("getLayoutInflater\\(\\)", "getActivity().getLayoutInflater()")
                    .jreplaceAll("getSupportFragmentManager\\(\\)", "getActivity().getSupportFragmentManager()");
        } else if (this.buildConfig.g) {
            code = code.jreplaceAll("getFragmentManager", "getSupportFragmentManager");
        }

        // Handle dynamic class name and context placeholders
        code = code.jreplaceAll("\\$className", this.projectFileBean.getActivityName())
                .jreplaceAll("\\$context", isFragment ? "getContext()" : this.projectFileBean.getActivityName() + ".this");

        if (isFragment) {
            // Also replace ClassName.this with getContext() for compatibility with code blocks using ActivityName.this
            code = code.jreplaceAll(this.projectFileBean.getActivityName() + "\\.this", "getContext()");
        }

        return CommandBlock.CB(Lx.j(code, false));
    }
  getListDeclarationAndAddImports(listType: number, listName: string): string {
        let typeName = mq.b(listType);
        this.addImports(mq.getImportsByTypeName(this.projectDataManager.a$, typeName, null));
        return Lx.a(typeName, listName, Lx.AccessModifier.PRIVATE);
    }
  getComponentDeclarationAndAddImports(componentBean: any): string {
        let typeName = mq.a(componentBean.type);
        this.addImports(mq.getImportsByTypeName(this.projectDataManager.a$, typeName, null));
        return Lx.a(typeName, componentBean.componentId, Lx.AccessModifier.PRIVATE, componentBean.param1, componentBean.param2, componentBean.param3);
    }
  getDrawerViewDeclarationAndAddImports(viewBean: any): string {
        let viewType = Jx.WIDGET_NAME_PATTERN.matcher(viewBean.convert).jreplaceAll("");
        if (viewType.isEmpty()) {
            viewType = viewBean.getClassInfo().getClassName();
        }
        this.addImports(mq.getImportsByTypeName(this.projectDataManager.a$, viewType, null));
        return Lx.a(viewType, "_drawer_" + viewBean.id, Lx.AccessModifier.PRIVATE, this.isViewBindingEnabled);
    }
  getVariableDeclarationAndAddImports(variableType: number, name: string): string {
        let variableTypeName = mq.c(variableType);
        this.addImports(mq.getImportsByTypeName(this.projectDataManager.a$, variableTypeName, null));
        return Lx.a(variableTypeName, name, Lx.AccessModifier.PRIVATE);
    }
  getViewDeclarationAndAddImports(viewBean: any): string {
        let viewType = Jx.WIDGET_NAME_PATTERN.matcher(viewBean.convert).jreplaceAll("");
        if (viewType.isEmpty()) {
            viewType = viewBean.getClassInfo().getClassName();
        }
        if (this.requireImports(viewBean)) {
            this.addImports(mq.getImportsByTypeName(this.projectDataManager.a$, viewType, viewBean.convert));
        }
        return Lx.a(viewType, viewBean.id, Lx.AccessModifier.PRIVATE, this.isViewBindingEnabled);
    }
  getDeprecatedMethodsCode(): string {
        return Jx.EOL +
                "@Deprecated" + Jx.EOL +
                "public void showMessage(String _s) {" + Jx.EOL +
                "Toast.makeText(getApplicationContext(), _s, Toast.LENGTH_SHORT).show();" + Jx.EOL +
                "}" + Jx.EOL +
                Jx.EOL +
                "@Deprecated" + Jx.EOL +
                "public int getLocationX(View _v) {" + Jx.EOL +
                "int _location[] = new int[2];" + Jx.EOL +
                "_v.getLocationInWindow(_location);" + Jx.EOL +
                "return _location[0];" + Jx.EOL +
                "}" + Jx.EOL +
                Jx.EOL +
                "@Deprecated" + Jx.EOL +
                "public int getLocationY(View _v) {" + Jx.EOL +
                "int _location[] = new int[2];" + Jx.EOL +
                "_v.getLocationInWindow(_location);" + Jx.EOL +
                "return _location[1];" + Jx.EOL +
                "}" + Jx.EOL +
                Jx.EOL +
                "@Deprecated" + Jx.EOL +
                "public int getRandom(int _min, int _max) {" + Jx.EOL +
                "Random random = new Random();" + Jx.EOL +
                "return random.nextInt(_max - _min + 1) + _min;" + Jx.EOL +
                "}" + Jx.EOL +
                Jx.EOL +
                "@Deprecated" + Jx.EOL +
                "public ArrayList<Double> getCheckedItemPositionsToArray(ListView _list) {" + Jx.EOL +
                "ArrayList<Double> _result = new ArrayList<Double>();" + Jx.EOL +
                "SparseBooleanArray _arr = _list.getCheckedItemPositions();" + Jx.EOL +
                "for (int _iIdx = 0; _iIdx < _arr.size(); _iIdx++) {" + Jx.EOL +
                "if (_arr.valueAt(_iIdx))" + Jx.EOL +
                "_result.add((double)_arr.keyAt(_iIdx));" + Jx.EOL +
                "}" + Jx.EOL +
                "return _result;" + Jx.EOL +
                "}" + Jx.EOL +
                Jx.EOL +
                "@Deprecated" + Jx.EOL +
                "public float getDip(int _input) {" + Jx.EOL +
                "return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, _input, getResources().getDisplayMetrics());" + Jx.EOL +
                "}" + Jx.EOL +
                Jx.EOL +
                "@Deprecated" + Jx.EOL +
                "public int getDisplayWidthPixels() {" + Jx.EOL +
                "return getResources().getDisplayMetrics().widthPixels;" + Jx.EOL +
                "}" + Jx.EOL +
                Jx.EOL +
                "@Deprecated" + Jx.EOL +
                "public int getDisplayHeightPixels() {" + Jx.EOL +
                "return getResources().getDisplayMetrics().heightPixels;" + Jx.EOL +
                "}" + Jx.EOL;
    }
  addImport(classToImport: string): void {
        if (!this.imports.contains(classToImport)) {
            this.imports.add(classToImport);
        }
    }
  addImports(imports: any): void {
        if (imports != null) {
            for (const value of jiter(imports)) {
                this.addImport(value);
            }
        }
    }
  getComponentBeanInitializer(componentBean: any): string {
        return Lx.getComponentInitializerCode(mq.a(componentBean.type), componentBean.componentId, componentBean.param1, componentBean.param2, componentBean.param3);
    }
  handleAppCompat(): void {
        if (this.buildConfig.g) {
            this.addImport("androidx.appcompat.app.AppCompatActivity");
            this.addImport("androidx.annotation.*");
        } else {
            this.addImport("android.app.Activity");
        }
        if (this.isViewBindingEnabled) {
            this.fields.add("private " + ViewBindingBuilder.generateFileNameForLayout(this.projectFileBean.fileName) + " binding;");
        }

        if (this.buildConfig.g) {
            if (this.projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR) && !this.projectFileBean.fileName.contains("_fragment")) {
                this.addImport(
                        (this.materialLibraryManager.isMaterial3Enabled()) ? "com.google.android.material.appbar.MaterialToolbar" : "androidx.appcompat.widget.Toolbar"
                );
                this.addImport("androidx.coordinatorlayout.widget.CoordinatorLayout");
                this.addImport("com.google.android.material.appbar.AppBarLayout");

                if (this.isViewBindingEnabled) {
                    this.initializeMethodCode.add(
                            "setSupportActionBar(binding.Toolbar);" + Jx.EOL +
                                    "getSupportActionBar().setDisplayHomeAsUpEnabled(true);" + Jx.EOL +
                                    "getSupportActionBar().setHomeButtonEnabled(true);" + Jx.EOL +
                                    "binding.Toolbar.setNavigationOnClickListener(new View.OnClickListener() {" + Jx.EOL +
                                    "@Override" + Jx.EOL +
                                    "public void onClick(View _v) {" + Jx.EOL +
                                    "onBackPressed();" + Jx.EOL +
                                    "}" + Jx.EOL +
                                    "});"
                    );
                } else {
                    this.fields.add("private " +
                            (this.materialLibraryManager.isMaterial3Enabled() ? "MaterialToolbar" : "Toolbar") +
                            " _toolbar;");
                    this.fields.add("private AppBarLayout _app_bar;");
                    this.fields.add("private CoordinatorLayout _coordinator;");

                    this.initializeMethodCode.add(
                            "_app_bar = findViewById(R.id._app_bar);" + Jx.EOL +
                                    "_coordinator = findViewById(R.id._coordinator);" + Jx.EOL +
                                    "_toolbar = findViewById(R.id._toolbar);" + Jx.EOL +
                                    "setSupportActionBar(_toolbar);" + Jx.EOL +
                                    "getSupportActionBar().setDisplayHomeAsUpEnabled(true);" + Jx.EOL +
                                    "getSupportActionBar().setHomeButtonEnabled(true);" + Jx.EOL +
                                    "_toolbar.setNavigationOnClickListener(new View.OnClickListener() {" + Jx.EOL +
                                    "@Override" + Jx.EOL +
                                    "public void onClick(View _v) {" + Jx.EOL +
                                    "onBackPressed();" + Jx.EOL +
                                    "}" + Jx.EOL +
                                    "});"
                    );
                }
            }
            if (this.projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_FAB)) {
                this.addImport("com.google.android.material.floatingactionbutton.FloatingActionButton");

                if (!this.isViewBindingEnabled) {
                    this.fields.add("private FloatingActionButton _fab;");
                    this.initializeMethodCode.add("_fab = " +
                            (this.projectFileBean.fileName.contains("_fragment") ? "_view." : "") +
                            "findViewById(R.id._fab);");
                }
            }
            if (this.projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER) && !this.projectFileBean.fileName.contains("_fragment")) {
                this.addImport("androidx.core.view.GravityCompat");
                this.addImport("androidx.drawerlayout.widget.DrawerLayout");
                this.addImport("androidx.appcompat.app.ActionBarDrawerToggle");


                if (this.isViewBindingEnabled) {
                    this.initializeMethodCode.add(
                            "ActionBarDrawerToggle _toggle = new ActionBarDrawerToggle(" +
                                    this.projectFileBean.getActivityName() + ".this, binding.Drawer, " +

                                    (this.projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR) ?
                                            "binding.Toolbar, " : "") +

                                    "R.string.app_name, R.string.app_name);" + Jx.EOL +
                                    "binding.Drawer.addDrawerListener(_toggle);" + Jx.EOL +
                                    "_toggle.syncState();" + Jx.EOL
                    );
                } else {
                    this.fields.add("private DrawerLayout _drawer;");
                    this.initializeMethodCode.add("_drawer = findViewById(R.id._drawer);" + Jx.EOL +
                            "ActionBarDrawerToggle _toggle = new ActionBarDrawerToggle(" +
                            this.projectFileBean.getActivityName() + ".this, _drawer, " +
                            (this.projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_TOOLBAR) ?
                                    "_toolbar, " : "") +
                            "R.string.app_name, R.string.app_name);" + Jx.EOL +
                            "_drawer.addDrawerListener(_toggle);" + Jx.EOL +
                            "_toggle.syncState();" + Jx.EOL + Jx.EOL +
                            "LinearLayout _nav_view = findViewById(R.id._nav_view);" + Jx.EOL
                    );
                }
                this.addImports(mq.getImportsByTypeName(this.projectDataManager.a$, "LinearLayout", null));
            }
        }
        this.addImport("android.app.*");
        this.addImport("android.os.*");
        this.addImport("android.view.*");
        this.addImport("android.view.View.*");
        this.addImport("android.widget.*");
        this.addImport("android.content.*");
        this.addImport("android.content.res.*");
        this.addImport("android.graphics.*");
        this.addImport("android.graphics.drawable.*");
        this.addImport("android.media.*");
        this.addImport("android.net.*");
        this.addImport("android.text.*");
        this.addImport("android.text.style.*");
        this.addImport("android.util.*");
        this.addImport("android.webkit.*");
        this.addImport("android.animation.*");
        this.addImport("android.view.animation.*");
        this.addImport("java.io.*");
        this.addImport("java.util.*");
        this.addImport("java.util.regex.*");
        this.addImport("java.text.*");
        this.addImport("org.json.*");
        this.onCreateEventCode = new Fx(this.projectFileBean.getActivityName(), this.buildConfig, this.projectDataManager.a(this.projectFileBean.getJavaName(), "onCreate_initializeLogic"), this.isViewBindingEnabled).a();
    }
  getDrawerViewInitializer(viewBean: any): string {
        let replaceAll = Jx.WIDGET_NAME_PATTERN.matcher(viewBean.convert).jreplaceAll("");
        if (replaceAll.isEmpty()) {
            replaceAll = viewBean.getClassInfo().getClassName();
        }
        return Lx.getDrawerViewInitializer(replaceAll, viewBean.id, "_nav_view");
    }
  addAdapterCode(): void {
        for (const viewBean of jiter(this.projectDataManager.f(this.projectFileBean.getXmlName()))) {
            let xmlName = ProjectFileBean.getXmlName(viewBean.customView);
            this.projectFileBean.getJavaName();
            let eventName = viewBean.id + "_onBindCustomView";
            let adapterLogic = new Fx(this.projectFileBean.getActivityName(), this.buildConfig, this.projectDataManager.a(this.projectFileBean.getJavaName(), eventName), this.isViewBindingEnabled).a();
            let adapterCode;
            if (viewBean.type == ViewBeans.VIEW_TYPE_LAYOUT_VIEWPAGER) {
                adapterCode = Lx.pagerAdapter(this.ox, viewBean.id, viewBean.customView, this.projectDataManager.d(xmlName), adapterLogic, this.isViewBindingEnabled);
            } else if (viewBean.type == ViewBeans.VIEW_TYPE_WIDGET_RECYCLERVIEW) {
                adapterCode = Lx.recyclerViewAdapter(this.ox, viewBean.id, viewBean.customView, this.projectDataManager.d(xmlName), adapterLogic, this.isViewBindingEnabled);
                this.addImport("androidx.recyclerview.widget.LinearLayoutManager");
                this.addImport("androidx.recyclerview.widget.RecyclerView");
            } else {
                adapterCode = Lx.getListAdapterCode(this.ox, viewBean.id, viewBean.customView, this.projectDataManager.d(xmlName), adapterLogic, this.isViewBindingEnabled);
            }
            this.adapterClasses.add(adapterCode);
        }
    }
  getViewInitializer(viewBean: any): string {
        let replaceAll = Jx.WIDGET_NAME_PATTERN.matcher(viewBean.convert).jreplaceAll("");
        if (replaceAll.isEmpty()) {
            replaceAll = viewBean.getClassInfo().getClassName();
        }
        if (this.projectFileBean.fileName.contains("_fragment")) {
            return Lx.getViewInitializer(replaceAll, viewBean.id, true, this.isViewBindingEnabled);
        }
        return Lx.getViewInitializer(replaceAll, viewBean.id, false, this.isViewBindingEnabled);
    }
  addMoreBlockCodes(): void {
        let javaName = this.projectFileBean.getJavaName();
        let pairs = this.projectDataManager.i(javaName);
        for (let index = 0, pairsSize = pairs.size(); index < pairsSize; index++) {
            let next = pairs.get(index);
            let name = next.first + "_moreBlock";
            let code = Lx.getMoreBlockCode(next.first, next.second, new Fx(this.projectFileBean.getActivityName(), this.buildConfig, this.projectDataManager.a(javaName, name), this.isViewBindingEnabled).a());
            if (index < (pairsSize - 1)) {
                this.moreBlocks.add(code);
            } else {
                // Removes unnecessary newline at end of More Block code
                this.moreBlocks.add(code.substring(0, code.length - 2));
            }
        }
    }
  initializeEventsCodeGenerator(): void {
        this.eventManager = new Hx(this.buildConfig, this.projectFileBean, this.projectDataManager);
        this.addImports(this.eventManager.getImports());
    }
  addImportsForBlocks(): void {
        for (const entry of jiter(this.projectDataManager.b(this.projectFileBean.getJavaName()).entrySet())) {
            for (const blockBean of jiter(entry.getValue())) {
                switch (blockBean.opCode) {
                    case "toStringWithDecimal":
                    case "toStringFormat":
                        this.addImport("java.text.DecimalFormat");
                        break;

                    case "strToListMap":
                    case "strToListStr":
                    case "strToMap":
                    case "GsonStringToListString":
                    case "GsonStringToListNumber":
                        this.addImport("com.google.gson.Gson");
                        this.addImport("com.google.gson.reflect.TypeToken");
                        break;

                    case "mapToStr":
                    case "listMapToStr":
                    case "GsonListTojsonString":
                        this.addImport("com.google.gson.Gson");
                        break;

                    case "setTypeface":
                        this.addImport("android.graphics.Typeface");
                        break;

                    case "copyToClipboard":
                        this.addImport("android.content.ClipData");
                        this.addImport("android.content.ClipboardManager");
                        break;

                    case "fileutilGetLastSegmentPath":
                        this.addImport("android.net.Uri");
                        break;

                    case "setImageUrl":
                        this.addImport("com.bumptech.glide.Glide");
                        break;

                    case "interstitialAdLoad":
                    case "rewardedVideoAdLoad":
                        this.addImport("com.google.android.gms.ads.AdRequest");
                        this.addImport("com.google.android.gms.ads.LoadAdError");
                        break;
                    default:
                        var block = this.getExtraBlockByName(blockBean.opCode);
                        if (block != null && block.containsKey("imports")) {
                            let imports = block.get("imports").toString().jsplit("\n");
                            for (const importCode of jiter(imports)) {
                                this.addImport(importCode);
                            }
                        }
                        break;
                }
            }
        }
    }
  getExtraBlockByName(name: string): any {
        for (const block of jiter(this.extraBlocks)) {
            if (block.containsKey("name") && block.get("name").toString().equals(name)) {
                return block;
            }
        }
        return null;
    }
  addDrawerComponentInitializer(): void {
        let viewBeans = this.projectDataManager.d(this.projectFileBean.getXmlName());
        for (const viewBean of jiter(viewBeans)) {
            if (!viewBean.convert.equals("include")) {
                let toNotAdd = this.ox.readAttributesToReplace(viewBean);
                if (!toNotAdd.contains("android:id")) {
                    this.initializeMethodCode.add(this.getViewInitializer(viewBean));
                }
            }
        }
        if (!this.isViewBindingEnabled) {
            if (this.projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER)) {
                let drawerBeans = this.projectDataManager.d(this.projectFileBean.getDrawerXmlName());
                for (const viewBean of jiter(drawerBeans)) {
                    if (!viewBean.convert.equals("include")) {
                        let toNotAdd = this.ox.readAttributesToReplace(viewBean);
                        if (!toNotAdd.contains("android:id")) {
                            this.initializeMethodCode.add(this.getDrawerViewInitializer(viewBean));
                        }
                    }
                }
            }
        }
        let componentBeans = this.projectDataManager.e(this.projectFileBean.getJavaName());
        for (const componentBean of jiter(componentBeans)) {
            this.componentInitializers.add(this.getComponentBeanInitializer(componentBean));
        }
    }
  addRequestCodeConstants(): void {
        let startValue = 100;
        for (const next of jiter(this.projectDataManager.e(this.projectFileBean.getJavaName()))) {
            switch (next.type) {
                case ComponentBean.COMPONENT_TYPE_CAMERA:
                case ComponentBean.COMPONENT_TYPE_FILE_PICKER:
                case 31:
                    var incrementedValue = startValue + 1;
                    this.filePickerRequestCodes.add(Lx.getRequestCodeConstant(next.componentId, incrementedValue));
                    startValue = incrementedValue;
                    break;
            }
        }
    }
  addFieldsDeclaration(): void {
        let javaName = this.projectFileBean.getJavaName();
        for (const next of jiter(jlist(this.projectDataManager.k(javaName)))) {
            let variableId = next.first;
            let variableValue = next.second;
            if (variableId == 9) {
                this.addImport(variableValue);
            } else if (variableId == 6) {
                this.fields.add(variableValue + ";");
            } else {
                this.fields.add(this.getVariableDeclarationAndAddImports(variableId, variableValue));
            }
        }
        for (const next2 of jiter(this.projectDataManager.j(javaName))) {
            this.lists.add(this.getListDeclarationAndAddImports(next2.first, next2.second));
        }
        for (const viewBean of jiter(this.projectDataManager.d(this.projectFileBean.getXmlName()))) {
            if (!viewBean.convert.equals("include")) {
                let toNotAdd = this.ox.readAttributesToReplace(viewBean);
                if (!toNotAdd.contains("android:id")) {
                    let viewDeclarations = this.getViewDeclarationAndAddImports(viewBean);
                    if (!viewDeclarations.isEmpty()) {
                        this.views.add(viewDeclarations);
                    }
                }
            }
        }

        if (this.projectFileBean.hasActivityOption(ProjectFileBean.OPTION_ACTIVITY_DRAWER)) {
            for (const viewBean of jiter(this.projectDataManager.d(this.projectFileBean.getDrawerXmlName()))) {
                if (!viewBean.convert.equals("include")) {
                    let toNotAdd = this.ox.readAttributesToReplace(viewBean);
                    if (!toNotAdd.contains("android:id")) {
                        let drawerViewDeclarations = this.getDrawerViewDeclarationAndAddImports(viewBean);
                        if (!drawerViewDeclarations.isEmpty()) {
                            this.views.add(drawerViewDeclarations);
                        }
                    }
                }
            }
        }
        let componentBeans = this.projectDataManager.e(javaName);
        for (const bean of jiter(componentBeans)) {
            this.components.add(this.getComponentDeclarationAndAddImports(bean));
        }

        let hasTimer = false;
        let hasFirebaseDB = false;
        let hasFirebaseStorage = false;
        let hasInterstitialAd = false;
        let hasRewardedVideoAd = false;
        for (const bean of jiter(componentBeans)) {
            switch (bean.type) {
                case ComponentBean.COMPONENT_TYPE_TIMERTASK:
                    hasTimer = true;
                    break;

                case ComponentBean.COMPONENT_TYPE_FIREBASE:
                    hasFirebaseDB = true;
                    break;

                case ComponentBean.COMPONENT_TYPE_FIREBASE_STORAGE:
                    hasFirebaseStorage = true;
                    break;

                case ComponentBean.COMPONENT_TYPE_INTERSTITIAL_AD:
                    hasInterstitialAd = true;
                    break;

                case ComponentBean.COMPONENT_TYPE_REWARDED_VIDEO_AD:
                    hasRewardedVideoAd = true;
                    break;
            }
        }
        if (hasTimer) {
            this.fieldsWithStaticInitializers.add(Lx.getComponentFieldCode("Timer"));
        }
        if (hasFirebaseDB) {
            this.fieldsWithStaticInitializers.add(Lx.getComponentFieldCode("FirebaseDB"));
        }
        if (hasFirebaseStorage) {
            this.fieldsWithStaticInitializers.add(Lx.getComponentFieldCode("FirebaseStorage"));
        }
        if (hasInterstitialAd) {
            this.fieldsWithStaticInitializers.add(Lx.getComponentFieldCode("InterstitialAd"));
        }
        if (hasRewardedVideoAd) {
            this.fieldsWithStaticInitializers.add(Lx.getComponentFieldCode("RewardedVideoAd"));
        }
    }
  requireImports(viewBean: any): boolean {
        if (!this.isViewBindingEnabled) {
            return true;
        }
        return (() => { switch (viewBean.type) {
            case ViewBean.VIEW_TYPE_WIDGET_LISTVIEW: case ViewBeans.VIEW_TYPE_WIDGET_RECYCLERVIEW: case ViewBeans.VIEW_TYPE_LAYOUT_BOTTOMNAVIGATIONVIEW: case ViewBean.VIEW_TYPE_WIDGET_SPINNER: case ViewBean.VIEW_TYPE_WIDGET_WEBVIEW: case ViewBean.VIEW_TYPE_WIDGET_ADVIEW: case ViewBean.VIEW_TYPE_WIDGET_MAPVIEW: case ViewBeans.VIEW_TYPE_LAYOUT_SWIPEREFRESHLAYOUT: case ViewBeans.VIEW_TYPE_WIDGET_PATTERNLOCKVIEW: case ViewBeans.VIEW_TYPE_WIDGET_CODEVIEW: case ViewBeans.VIEW_TYPE_WIDGET_LOTTIEANIMATIONVIEW: case ViewBeans.VIEW_TYPE_WIDGET_YOUTUBEPLAYERVIEW: case ViewBeans.VIEW_TYPE_LAYOUT_TABLAYOUT: case ViewBeans.VIEW_TYPE_LAYOUT_VIEWPAGER: return true; // it's necessary for the adapters, listeners...
            default: return false;
        } })();
    }
  addLocalLibraryImports(): void {
        for (const value of jiter(this.mll.getImportLocalLibrary())) {
            this.addImport(value);
        }
    }
}