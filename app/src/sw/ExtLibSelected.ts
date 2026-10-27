// Auto-ported from ExtLibSelected.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: mod.agus.jcoderz.handle.component.ConstVarComponent, mod.jbk.build.BuiltInLibraries, pro.sketchware.util.library.BuiltInLibraryManager
// <imports>
import { BuiltInLibraries } from './BuiltInLibraries';
// </imports>
export class ExtLibSelected {
  constructor() {
    }
  static addUsedDependencies(component: any, kp: any): void {
        if (component.isFCMUsed) {
            kp.addLibrary(BuiltInLibraries.FIREBASE_MESSAGING);
        }
        if (component.isLottieUsed) {
            kp.addLibrary(BuiltInLibraries.LOTTIE);
        }
        if (component.isYoutubePlayerUsed) {
            kp.addLibrary(BuiltInLibraries.ANDROID_YOUTUBE_PLAYER);
        }
        if (component.isCircleImageViewUsed) {
            kp.addLibrary(BuiltInLibraries.CIRCLEIMAGEVIEW);
        }
        if (component.isFBGoogleUsed) {
            kp.addLibrary(BuiltInLibraries.PLAY_SERVICES_AUTH);
        }
        if (component.isOTPViewUsed) {
            kp.addLibrary(BuiltInLibraries.OTPVIEW);
        }
        if (component.isCodeViewUsed) {
            kp.addLibrary(BuiltInLibraries.CODEVIEW);
        }
        if (component.isPatternLockViewUsed) {
            kp.addLibrary(BuiltInLibraries.PATTERN_LOCK_VIEW);
        }
        if (component.isWaveSideBarUsed) {
            kp.addLibrary(BuiltInLibraries.WAVE_SIDE_BAR);
        }
        if (component.isSwipeRefreshLayoutUsed) {
            kp.addLibrary(BuiltInLibraries.ANDROIDX_SWIPEREFRESHLAYOUT);
        }
    }
}