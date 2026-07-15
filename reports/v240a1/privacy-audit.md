# v2.4.0-alpha1 Privacy Audit

Date: 2026-07-15

## Findings

- Default-local Room storage; no remote AI, advertising SDK, analytics SDK or WebView product surface.
- APK has no `android.permission.INTERNET`, location, microphone, contacts, SMS or body-sensor permission.
- Installed APK requests only `USE_BIOMETRIC`, compatibility `USE_FINGERPRINT`, and Android's package-scoped dynamic-receiver permission.
- `allowBackup=false`, `fullBackupContent=false`, data extraction rules deny cloud/device transfer, and cleartext traffic is disabled.
- `FLAG_SECURE` blocks screenshots of the activity; the black ADB capture was verified as expected behavior.
- Export tests verify redaction; journal tests verify no raw burden text; privacy controls delete check-ins, sleep, load data, feedback or all local data.
- Source log calls contain operation type or aggregate recovery counts only. No task title, burden text, body tag, sleep entry or suggestion comment is logged.
- Changed-content secret scan and common PII-pattern scan returned zero matches.

## Residual Risk

- Debug builds remain debuggable and should not be treated as release artifacts.
- Physical-device backup, OEM screenshot behavior, biometric availability and storage inspection remain unverified.
- Human research data handling is not active; any pilot requires explicit consent and separate governance review.
