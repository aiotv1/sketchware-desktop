// Auto-ported from PermissionManager.java (Sketchware Pro) by scripts/j2ts.py, then hand-fixed.
// imports: com.besome.sketch.beans.BlockBean, java.util.ArrayList, java.util.Map.Entry, a.a.a.Jx, a.a.a.jC, a.a.a.jq
// <imports>
import { jiter, StringBuilder } from '../codegen/jshim';
import { Jx } from './Jx';
import { jq } from './jq';
import { jC } from './platform';
// </imports>
export class PermissionManager {
  javaName: string;
  sc_id: string;
  hasPermission: boolean = false;
  constructor(id: string, javaName: string) {
        this.javaName = javaName;
        this.sc_id = id;
    }
  addedPermissions(): any {
        let permList = [];
        for (const blocks of jiter(jC.a(this.sc_id).b(this.javaName).entrySet())) {
            for (const block of jiter(blocks.getValue())) {
                if (block.opCode.equals("addPermission")) {
                    let firstParam = block.parameters.get(0);
                    if (!firstParam.trim().isEmpty()) {
                        if (firstParam.startsWith("Manifest")) {
                            permList.add(firstParam);
                        } else {
                            permList.add("Manifest.permission." + firstParam);
                        }
                    }
                }
            }
        }
        return permList;
    }
  formatPermission(isAppCompat: boolean, permission: string): string {
        if (isAppCompat) {
            return "ContextCompat.checkSelfPermission(this, " + permission + ") == PackageManager.PERMISSION_DENIED";
        } else {
            return "checkSelfPermission(" + permission + ") == PackageManager.PERMISSION_DENIED";
        }
    }
  addReqPermission(isAppCompat: boolean, checkPerm: any, reqPerm: any): void {
        for (const permission of jiter(this.addedPermissions())) {
            checkPerm.add(this.formatPermission(isAppCompat, permission));
            reqPerm.add(permission);
        }
    }
  removePermission(isAppCompat: boolean, checkPerm: any, reqPerm: any): void {
        for (const blocks of jiter(jC.a(this.sc_id).b(this.javaName).entrySet())) {
            for (const block of jiter(blocks.getValue())) {
                if (block.opCode.equals("removePermission") && !block.parameters.get(0).trim().isEmpty()) {
                    let permission = block.parameters.get(0).startsWith("Manifest") ? block.parameters.get(0) : ("Manifest.permission." + block.parameters.get(0));
                    checkPerm.remove(this.formatPermission(isAppCompat, permission));
                    reqPerm.remove(permission);
                }
            }
        }
    }
  hasNewPermission(): boolean {
        return !this.addedPermissions().isEmpty();
    }
  writePermission(isAppCompat: boolean, var1: number): string {
        let checkPerm = [];
        let addPerm = [];
        let permissionCode = new StringBuilder();

        this.addReqPermission(isAppCompat, checkPerm, addPerm);

        if (isAppCompat) {
            if ((var1 & jq.PERMISSION_CALL_PHONE) == jq.PERMISSION_CALL_PHONE) {
                checkPerm.add("ContextCompat.checkSelfPermission(this, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.CALL_PHONE");
            }
            if ((var1 & jq.PERMISSION_CAMERA) == jq.PERMISSION_CAMERA) {
                checkPerm.add("ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.CAMERA");
            }
            if ((var1 & jq.PERMISSION_READ_EXTERNAL_STORAGE) == jq.PERMISSION_READ_EXTERNAL_STORAGE) {
                checkPerm.add("ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.READ_EXTERNAL_STORAGE");
            }
            if ((var1 & jq.PERMISSION_WRITE_EXTERNAL_STORAGE) == jq.PERMISSION_WRITE_EXTERNAL_STORAGE) {
                checkPerm.add("ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.WRITE_EXTERNAL_STORAGE");
            }
            if ((var1 & jq.PERMISSION_RECORD_AUDIO) == jq.PERMISSION_RECORD_AUDIO) {
                checkPerm.add("ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.RECORD_AUDIO");
            }
            if ((var1 & jq.PERMISSION_ACCESS_FINE_LOCATION) == jq.PERMISSION_ACCESS_FINE_LOCATION) {
                checkPerm.add("ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.ACCESS_FINE_LOCATION");
            }
            this.removePermission(true, checkPerm, addPerm);

            if (!checkPerm.isEmpty() && !addPerm.isEmpty()) {
                permissionCode.append("if (");

                for (let i = 0; i < checkPerm.size(); i++) {
                    if (i != 0) permissionCode.append("\r\n|| ");
                    permissionCode.append(checkPerm.get(i));
                }

                permissionCode.append(") {" + Jx.EOL + "ActivityCompat.requestPermissions(this, new String[] {");

                for (let i = 0; i < addPerm.size(); i++) {
                    if (i != 0) permissionCode.append(", ");
                    permissionCode.append(addPerm.get(i));
                }

                permissionCode.append("}, 1000);" + Jx.EOL +
                        "} else {" + Jx.EOL +
                        "initializeLogic();" + Jx.EOL +
                        "}" + Jx.EOL);
            }

        } else {
            if ((var1 & jq.PERMISSION_CALL_PHONE) == jq.PERMISSION_CALL_PHONE) {
                checkPerm.add("checkSelfPermission(Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.CALL_PHONE");
            }
            if ((var1 & jq.PERMISSION_CAMERA) == jq.PERMISSION_CAMERA) {
                checkPerm.add("checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.CAMERA");
            }
            if ((var1 & jq.PERMISSION_READ_EXTERNAL_STORAGE) == jq.PERMISSION_READ_EXTERNAL_STORAGE) {
                checkPerm.add("checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.READ_EXTERNAL_STORAGE");
            }
            if ((var1 & jq.PERMISSION_WRITE_EXTERNAL_STORAGE) == jq.PERMISSION_WRITE_EXTERNAL_STORAGE) {
                checkPerm.add("checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.WRITE_EXTERNAL_STORAGE");
            }
            if ((var1 & jq.PERMISSION_RECORD_AUDIO) == jq.PERMISSION_RECORD_AUDIO) {
                checkPerm.add("checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.RECORD_AUDIO");
            }
            if ((var1 & jq.PERMISSION_ACCESS_FINE_LOCATION) == jq.PERMISSION_ACCESS_FINE_LOCATION) {
                checkPerm.add("checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_DENIED");
                addPerm.add("Manifest.permission.ACCESS_FINE_LOCATION");
            }
            this.removePermission(false, checkPerm, addPerm);

            if (!checkPerm.isEmpty() && !addPerm.isEmpty()) {
                permissionCode.append("if (Build.VERSION.SDK_INT >= 23) {" + Jx.EOL + "if (");

                for (let i = 0; i < checkPerm.size(); i++) {
                    if (i != 0) permissionCode.append(Jx.EOL + "||");
                    permissionCode.append(checkPerm.get(i));
                }

                permissionCode.append(") {" + Jx.EOL + "requestPermissions(new String[] {");

                for (let i = 0; i < addPerm.size(); i++) {
                    if (i != 0) permissionCode.append(", ");
                    permissionCode.append(addPerm.get(i));
                }

                permissionCode.append("}, 1000);" + Jx.EOL +
                        "} else {" + Jx.EOL +
                        "initializeLogic();" + Jx.EOL +
                        "}" + Jx.EOL +
                        "} else {" + Jx.EOL +
                        "initializeLogic();" + Jx.EOL +
                        "}" + Jx.EOL);
            }
        }

        this.hasPermission = !checkPerm.isEmpty() || !addPerm.isEmpty();

        if (permissionCode.toString().trim().isEmpty()) {
            return "initializeLogic();" + Jx.EOL;
        } else {
            return Jx.EOL + permissionCode;
        }
    }
}