#!/bin/bash
# Drive Sketchware Pro on MuMu for reference screenshots.
# usage: mu.sh shot NAME | tap X Y | back | ui | swipe X1 Y1 X2 Y2 | text STR
A=/d/Android/SDK/platform-tools/adb.exe
D=127.0.0.1:16384
OUT=/d/sketchware-desktop/ref/shots
mkdir -p $OUT
case "$1" in
  shot) $A -s $D exec-out screencap -p > $OUT/$2.png; echo $OUT/$2.png ;;
  tap) $A -s $D shell input tap $2 $3 ;;
  back) $A -s $D shell input keyevent KEYCODE_BACK ;;
  swipe) $A -s $D shell input swipe $2 $3 $4 $5 ${6:-300} ;;
  text) $A -s $D shell input text "$2" ;;
  ui) $A -s $D shell uiautomator dump /sdcard/ui.xml >/dev/null; $A -s $D exec-out cat /sdcard/ui.xml | tr '>' '\n' | grep -oE '(text|content-desc|resource-id)="[^"]+"|bounds="[^"]+"' | paste -sd' ' | sed 's/bounds=/\n/g' | grep -E 'text=|content-desc=' ;;
esac
