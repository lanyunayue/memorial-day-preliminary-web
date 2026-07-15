# v2.4.0-alpha1 Test Evidence

Date: 2026-07-15

## Result

- JVM test executions: 88 passed, 0 failed, 0 skipped (81 unique test methods; Android debug and release variants execute 7 app tests twice).
- Android instrumentation: 75 passed, 0 failed, 0 skipped on Android 15 API 35 emulator `chronos_v240a1`.
- Compose UI: 20 passed, including onboarding and 19 overload/recovery UI tests.
- Accessibility-specific checks: 4 passed: 200% font scaling, screen-reader labels, visible risk text, and WCAG AA contrast pairs.
- Android lint: 0 errors, 2 warnings. Warnings are one available dependency update and one dormant parcel resource.
- Debug APK build: passed.

## Commands

```powershell
.\gradlew.bat test :apps:android:app:lintDebug --no-build-cache --no-parallel
.\gradlew.bat :apps:android:app:connectedDebugAndroidTest --no-build-cache --no-parallel
.\gradlew.bat :apps:android:app:assembleDebug --no-build-cache --no-parallel
```

## Covered Behavior

- Daily check-in, manual sleep, task/commitment/waiting persistence, load explanation and missing-data disclosure.
- Reversible de-load preview, modification, confirmation, operation journal and undo.
- Next-day suggestion feedback, weekly observations without causal language and preference persistence.
- Room writes, deletion, export redaction, process recovery, feature flags, encryption and parcel regression paths.
- Safety routing over randomized input, no diagnosis output and visible non-clinical escalation text.
- Fresh APK cold start in airplane mode with the application process alive and no app error logs.

## Evidence Locations

- JVM reports: `apps/android/app/build/reports/tests/` and each package's `build/reports/tests/`.
- Instrumentation report: `apps/android/app/build/reports/androidTests/connected/debug/index.html`.
- Lint report: `apps/android/app/build/reports/lint-results-debug.html`.

The connected test target was an emulator, not a physical device. `REAL DEVICE CONNECTION REQUIRED` remains open.
