# v2.4.0-alpha1 Manifest Permissions

Extracted from the built APK with Android build-tools `aapt` on 2026-07-15.

| Permission | Source | Purpose |
|---|---|---|
| `android.permission.USE_BIOMETRIC` | Application | Local biometric access for protected connector data |
| `android.permission.USE_FINGERPRINT` | AndroidX compatibility merge | Backward-compatible biometric API support |
| `com.chronos.shike.debug.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` | Android manifest merger | Package-scoped protection for non-exported dynamic receivers |

Absent: `INTERNET`, `RECORD_AUDIO`, `ACCESS_FINE_LOCATION`, `READ_CONTACTS`, `READ_SMS`, `BODY_SENSORS`.
