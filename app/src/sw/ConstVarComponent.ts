// Auto-ported from ConstVarComponent.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: java.util.ArrayList, java.util.HashMap
// <imports>
import { JMap } from '../codegen/jshim';
// </imports>
export class ConstVarComponent {
  isCircleImageViewUsed: boolean = false;
  isCodeViewUsed: boolean = false;
  isFBGoogleUsed: boolean = false;
  isFCMUsed: boolean = false;
  isLottieUsed: boolean = false;
  isOTPViewUsed: boolean = false;
  isPatternLockViewUsed: boolean = false;
  isWaveSideBarUsed: boolean = false;
  isYoutubePlayerUsed: boolean = false;
  isSwipeRefreshLayoutUsed: boolean = false;
  param: any = new JMap();
  handleDeleteComponent(componentNameId: string): void {
        switch (componentNameId) {
            case "FirebaseCloudMessage":
                this.isFCMUsed = false;
                break;

            case "FirebaseGoogleLogin":
                this.isFBGoogleUsed = false;
                break;

            default:
        }
    }
}