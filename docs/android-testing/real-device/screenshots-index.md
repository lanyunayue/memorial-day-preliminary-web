# Screenshots Index

> Index of all screenshots captured during the alpha2 real-device test.
>
> Place actual screenshot files under `artifacts/android-alpha2/screenshots/` and reference them here.
> **Redaction policy:** All screenshots MUST redact real pickup codes, notification content, and phone numbers before storage.

---

## Naming convention

```
screenshots/<seq>_<category>_<description>.png
```

Example: `screenshots/01_install_first-launch.png`

Categories: `install`, `onboarding`, `privacy`, `runtime`, `listener`, `whitelist`, `lifecycle`, `permission`, `viewport`.

---

## Screenshot index

| # | File | Category | Description | Capture method | Redacted | Linked result |
|---|---|---|---|---|---|---|
| 01 | | install | First launch after install | `adb shell screencap` | [ ] | installation-result.json |
| 02 | | onboarding | Welcome screen | `adb shell screencap` | [ ] | runtime-result.json |
| 03 | | privacy | Privacy notice / consent | `adb shell screencap` | [ ] | runtime-result.json |
| 04 | | runtime | Three modes selector | `adb shell screencap` | [ ] | runtime-result.json |
| 05 | | runtime | Default mode confirmation | `adb shell screencap` | [ ] | runtime-result.json |
| 06 | | runtime | Unauthorized state guidance | `adb shell screencap` | [ ] | runtime-result.json |
| 07 | | runtime | Manual entry form | `adb shell screencap` | [ ] | runtime-result.json |
| 08 | | listener | Notification access settings | `adb shell screencap` | [ ] | notification-listener-result.json |
| 09 | | listener | Listener enabled state | `adb shell screencap` | [ ] | notification-listener-result.json |
| 10 | | whitelist | Whitelist management screen | `adb shell screencap` | [ ] | whitelist-result.json |
| 11 | | whitelist | Source A capture result | `adb shell screencap` | [ ] | whitelist-result.json |
| 12 | | whitelist | Source B ignored (no capture) | `adb shell screencap` | [ ] | whitelist-result.json |
| 13 | | lifecycle | Active parcel list | `adb shell screencap` | [ ] | parcel-lifecycle-result.json |
| 14 | | lifecycle | Picked-up status | `adb shell screencap` | [ ] | parcel-lifecycle-result.json |
| 15 | | lifecycle | History list | `adb shell screencap` | [ ] | parcel-lifecycle-result.json |
| 16 | | lifecycle | Trash / recycle bin | `adb shell screencap` | [ ] | parcel-lifecycle-result.json |
| 17 | | permission | Permission revoked state | `adb shell screencap` | [ ] | permission-revoke-result.json |
| 18 | | permission | Re-grant restored state | `adb shell screencap` | [ ] | permission-revoke-result.json |
| 19 | | viewport | wm size 375x667 | `adb shell wm size 375x667` | [ ] | screenshots-index.md |
| 20 | | viewport | wm size 390x844 | `adb shell wm size 390x844` | [ ] | screenshots-index.md |
| 21 | | viewport | wm size 414x896 | `adb shell wm size 414x896` | [ ] | screenshots-index.md |
| 22 | | viewport | wm size 768x1024 | `adb shell wm size 768x1024` | [ ] | screenshots-index.md |
| 23 | | viewport | wm size 1024x768 | `adb shell wm size 1024x768` | [ ] | screenshots-index.md |
| 24 | | viewport | wm size 1366x768 | `adb shell wm size 1366x768` | [ ] | screenshots-index.md |
| 25 | | viewport | wm size 1920x1080 | `adb shell wm size 1920x1080` | [ ] | screenshots-index.md |

---

## Viewport matrix (Android `wm size` overrides)

Android does not use CSS breakpoints; instead we override the display density / size via `adb shell wm size` and `adb shell wm density` to emulate different screen configurations.

| Target | wm size | wm density | Notes |
|---|---|---|---|
| Small phone | 375x667 | 320 | |
| Standard phone | 390x844 | 460 | |
| Large phone | 414x896 | 480 | |
| Small tablet (portrait) | 768x1024 | 320 | |
| Small tablet (landscape) | 1024x768 | 320 | |
| Desktop / large tablet | 1366x768 | 240 | |
| Full HD landscape | 1920x1080 | 320 | |

> Remember to reset after testing: `adb shell wm size reset` and `adb shell wm density reset`.

---

## Checklist

- [ ] All screenshots stored under `artifacts/android-alpha2/screenshots/`
- [ ] All screenshots redacted (no real pickup codes / notification content / phone numbers)
- [ ] This index fully populated with file paths and descriptions
- [ ] Each screenshot cross-referenced with the relevant result JSON
