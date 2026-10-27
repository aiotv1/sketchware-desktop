// Auto-ported from EditorManifest.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: java.util.ArrayList, java.util.HashMap, pro.sketchware.xml.XmlBuilder
// <imports>
import { XmlBuilder } from './XmlBuilder';
// </imports>
export class EditorManifest {
  static writeDefFCM(applicationTag: any): void {
        let firebaseMessagingServiceTag = new XmlBuilder("service");
        firebaseMessagingServiceTag.addAttribute("android", "name", "com.google.firebase.messaging.FirebaseMessagingService");
        firebaseMessagingServiceTag.addAttribute("android", "exported", "false");
        let firebaseMessagingServiceIntentFilterTag = new XmlBuilder("intent-filter");
        firebaseMessagingServiceIntentFilterTag.addAttribute("android", "priority", "-500");
        let messagingEventActionTag = new XmlBuilder("action");
        messagingEventActionTag.addAttribute("android", "name", "com.google.firebase.MESSAGING_EVENT");
        firebaseMessagingServiceIntentFilterTag.addChildNode(messagingEventActionTag);
        firebaseMessagingServiceTag.addChildNode(firebaseMessagingServiceIntentFilterTag);
        let firebaseInstanceIdReceiverTag = new XmlBuilder("receiver");
        firebaseInstanceIdReceiverTag.addAttribute("android", "name", "com.google.firebase.iid.FirebaseInstanceIdReceiver");
        firebaseInstanceIdReceiverTag.addAttribute("android", "exported", "true");
        firebaseInstanceIdReceiverTag.addAttribute("android", "permission", "com.google.android.c2dm.permission.SEND");
        let firebaseInstanceIdReceiverIntentFilterTag = new XmlBuilder("intent-filter");
        let receiveActionTag = new XmlBuilder("action");
        receiveActionTag.addAttribute("android", "name", "com.google.android.c2dm.intent.RECEIVE");
        firebaseInstanceIdReceiverIntentFilterTag.addChildNode(receiveActionTag);
        firebaseInstanceIdReceiverTag.addChildNode(firebaseInstanceIdReceiverIntentFilterTag);
        applicationTag.addChildNode(firebaseMessagingServiceTag);
        applicationTag.addChildNode(firebaseInstanceIdReceiverTag);
    }
  static manifestFBGoogleLogin(applicationTag: any): void {
        let activityTag = new XmlBuilder("activity");
        activityTag.addAttribute("android", "name", "com.google.android.gms.auth.api.signin.internal.SignInHubActivity");
        activityTag.addAttribute("android", "excludeFromRecents", "true");
        activityTag.addAttribute("android", "exported", "false");
        activityTag.addAttribute("android", "theme", "@android:style/Theme.Translucent.NoTitleBar");
        applicationTag.addChildNode(activityTag);
        let serviceTag = new XmlBuilder("service");
        serviceTag.addAttribute("android", "name", "com.google.android.gms.auth.api.signin.RevocationBoundService");
        serviceTag.addAttribute("android", "exported", "true");
        serviceTag.addAttribute("android", "permission", "com.google.android.gms.auth.api.signin.permission.REVOCATION_NOTIFICATION");
        applicationTag.addChildNode(serviceTag);
    }
}