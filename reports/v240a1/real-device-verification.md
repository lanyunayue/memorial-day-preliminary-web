# v2.4.0-alpha1 Real-Device Verification

Date: 2026-07-15

`REAL DEVICE CONNECTION REQUIRED`

No physical ADB device was connected. The Android 15 emulator passed installation, cold start, airplane-mode startup and 75 instrumentation tests, but these results are not real-device evidence.

Still required on at least one supported physical Android device:

1. Install and first launch.
2. Create task, check-in and manual sleep entry.
3. Review load explanation, de-load, confirm and undo.
4. Force-stop/restart and confirm persisted state.
5. Delete category data and all data.
6. Verify airplane mode, no network requests and no sensitive logcat text.
7. Verify screen reader, 200% font, touch targets, night mode and OEM screenshot blocking.
8. Confirm parcel connector is hidden by default.

Next command after authorizing a physical device:

```powershell
& 'C:\Users\PC\.cache\chronos-android\sdk\platform-tools\adb.exe' install -r 'E:\lifetime-v240a1-overload-recovery\artifacts\android\v240a1\shike-v2.4.0-alpha1-debug.apk'
```
