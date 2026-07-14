# v2.3.0-alpha1 Build Evidence

- Built at: 2026-07-14 (Asia/Shanghai)
- Worktree: `E:\lifetime-v230a1-android-parcel`
- Branch: `program-v230a1-android-parcel`
- Base: `fb900d61fab1a0a0ab834a72dacffb83baebcf34`
- JDK: Eclipse Temurin 17.0.19+10
- Gradle: 8.9
- Android Gradle Plugin: 8.7.3
- Android SDK: Platform 35, Build Tools 35.0.0, Platform Tools 37.0.0
- Release application ID: `com.chronos.shike`
- Debug application ID: `com.chronos.shike.debug`
- Version: `2.3.0-alpha1-debug` (`23001`)
- Min/target SDK: 26 / 35
- APK: `apps/android/app/build/outputs/apk/debug/app-debug.apk`
- APK bytes: `23566528`
- APK SHA-256: `03b7b5c6271948cd0fa96a1ec58583234518bbd820e950092addf854f2d580ec`

## Automated results

- Event contract: 3 tests, 0 failures.
- Parcel domain: 11 tests, 0 failures.
- Corpus gate: 36 cases, precision 1.0, non-parcel false-positive rate 0.0, pickup-code accuracy 1.0.
- Android local unit: 2 tests, 0 failures.
- Arbitrary-input property exercise: 2,000 deterministic Unicode inputs without crash.
- Android Lint: PASS with no baseline.
- Manifest/APK audit: no `android.permission.INTERNET`, AccessibilityService, SMS, microphone or location permission.
- Secret/sensitive fixture location audit: PASS.
- Debug APK assembly: PASS.

## Device boundary

- Instrumentation and Compose UI test sources compile successfully.
- `adb devices -l` returned no connected device.
- Instrumentation/UI execution: **NOT RUN — REAL DEVICE VALIDATION REQUIRED**.
- NotificationListenerService real notification capture: **NOT RUN — REAL DEVICE VALIDATION REQUIRED**.
- Human pilot: **NOT RUN — HUMAN PILOT REQUIRED**.

The APK is an engineering Debug Alpha. It has not been uploaded to an app store or production channel.
