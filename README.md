# Sketchware Desktop

> **Work in progress.** This project is still under development and is not finished yet. Some features are incomplete or untested, and things may change or break. The screenshots below show the current interface.

A desktop version of [Sketchware Pro](https://github.com/Sketchware-Pro/Sketchware-Pro) for Windows: build Android apps with the same blocks, the same designer and the same project format, on a big screen.

> Unofficial project, not affiliated with Sketchware or the Sketchware Pro team. See [Credits and license](#credits-and-license).

<img width="1584" height="941" alt="image" src="https://github.com/user-attachments/assets/23f7d33e-390f-4eeb-bffc-608eb71f9376" />
<img width="1584" height="941" alt="image" src="https://github.com/user-attachments/assets/2188fb8c-99da-4873-b7e5-cbd7a954326a" />
<img width="1584" height="941" alt="image" src="https://github.com/user-attachments/assets/5209552e-e4de-4d66-8e27-415189aff2e6" />
<img width="1584" height="941" alt="image" src="https://github.com/user-attachments/assets/bb77a0f5-bb6f-4ffb-9dd0-a8391a6ccc1b" />
<img width="1584" height="941" alt="image" src="https://github.com/user-attachments/assets/2d171fcb-670e-418b-ba3f-502d94d4cdca" />
<img width="1584" height="941" alt="image" src="https://github.com/user-attachments/assets/0496392a-8ca6-4c00-bd77-cf1e2e2b4d0b" />
<img width="1919" height="1003" alt="image" src="https://github.com/user-attachments/assets/af690088-d13a-43ac-b091-f8cea4d75653" />
<img width="537" height="177" alt="image" src="https://github.com/user-attachments/assets/6137a958-7c27-4ace-8c06-9bba3b1af278" />
<img width="1574" height="932" alt="image" src="https://github.com/user-attachments/assets/1912b3a5-be83-4a49-814f-6f1e80fdb80a" />

## Features

- **Same projects as the phone**: open, edit and save Sketchware / Sketchware Pro projects; import and export `.swb` backups, or import a copied `.sketchware` folder.
- **Blocks editor**: all built-in Sketchware blocks plus the Sketchware Pro extra blocks, with the original shapes and colors, drag & drop, block search, undo/redo, variables, lists, more blocks and component blocks.
- **View designer**: phone preview with drag & drop, outline, property panel, toolbar / fullscreen / drawer / FAB options, undo/redo, and **Create a widget** (custom widgets).
- **Configuration managers** (like the ⋮ drawer on Android): Library, View, Image, Sound, Font, Java/Kotlin, Resource Manager, Resource Editor, Asset, Permission, AppCompat, AndroidManifest, Custom blocks used, Code Shrinking, StringFog, Source code, XML Command, Logcat Reader and Collection Manager.
- **Settings**: Block manager (palettes, import/export of block JSON, block creator with live preview), Block selector menus, Component manager, Event manager, Local libraries, APK signing.
- **Run**: builds a debug APK with Gradle and installs/launches it on a connected phone or emulator over adb. Also exports an Android Studio project (`.zip`).
- **Code generation**: the Java/XML generator is an automatic port of Sketchware Pro's own generator, so the output matches what the app produces on Android.

## Running from source

Requirements: Windows 10/11, [Node.js](https://nodejs.org) 20+, and for building APKs the Android SDK (platform 34, build-tools) and a JDK 17+ (set both in *Settings → App settings*). Gradle is downloaded automatically on the first build.

```bash
cd app
npm install
npm run build
npx electron .
```

During development, `npm run dev` starts Vite on port 5199 and `SW_DEV=1 npx electron .` loads it.

Tests: `npx tsx scripts/test-gen.ts` builds a sample project, generates its sources, exports an Android Studio project and round-trips a `.swb` backup.

## Project layout

| Path | What it is |
| --- | --- |
| `app/electron` | Electron main process (file system, dialogs, processes, downloads) |
| `app/src/core` | Project model, Sketchware file format (encrypted project files), workspace, collections |
| `app/src/blocks` | Block definitions, geometry, palette, menus |
| `app/src/sw` | Code generator, auto-ported from Sketchware Pro's Java sources (`scripts/port_all.py`) |
| `app/src/codegen` | Generator entry points, Gradle APK build, adb helpers |
| `app/src/ui` | React UI: home, designer, blocks editor, managers |
| `scripts` | Java→TypeScript porter and tools that extracted block specs and icons |

## Credits and license

This project would not exist without **[Sketchware Pro](https://github.com/Sketchware-Pro/Sketchware-Pro)** and the original **Sketchware**. Parts of this repository are derived from Sketchware Pro: the code generator in `app/src/sw` is converted from its sources, and block definitions, icons and template files come from it.

Sketchware Pro is *source-available, not open source*: its [license](https://github.com/Sketchware-Pro/Sketchware-Pro/blob/main/LICENSE.md) allows forks for personal use and for improving Sketchware Pro, and asks not to use its code in other serious projects. Those terms apply to the derived parts here as well. This repository is a personal, non-commercial project and comes with no warranty.
