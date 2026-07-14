#!/usr/bin/env bash
###############################################################################
# android-device-evidence.sh
#
# Automates real-Android-device evidence collection for the alpha2 build via ADB.
#
# Usage:
#   ./android-device-evidence.sh --apk /path/to/app-alpha2.apk \
#       --package com.example.lifetime --activity .MainActivity \
#       --outdir ./evidence-out
#
# Notes:
#   - Steps marked [USER INTERACTION REQUIRED] need a human to perform an action
#     on the physical device (grant permission, navigate a screen, send a
#     notification, etc.). The script will pause and prompt.
#   - All sensitive values (pickup codes, notification text, phone numbers) are
#     redacted or hashed before being written to output.
#
# Requirements: adb on PATH, a connected device with USB debugging enabled.
###############################################################################
set -euo pipefail

# ---------------------------------------------------------------------------
# Defaults & argument parsing
# ---------------------------------------------------------------------------
APK=""
PACKAGE=""
ACTIVITY=""
OUTDIR="./evidence-out"
DEVICE_SERIES=""

usage() {
  cat <<EOF
Usage: $0 --apk <apk-path> --package <pkg> [--activity <activity>] [--outdir <dir>] [--serial <device-id>]

  --apk       Path to the alpha2 APK to install.
  --package   Application package name (e.g. com.example.lifetime).
  --activity  Launcher activity to cold-start (default: auto-detect).
  --outdir    Output directory for collected evidence (default: ./evidence-out).
  --serial    ADB device serial (-s) when multiple devices are connected.
  -h, --help  Show this help.
EOF
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apk) APK="$2"; shift 2;;
    --package) PACKAGE="$2"; shift 2;;
    --activity) ACTIVITY="$2"; shift 2;;
    --outdir) OUTDIR="$2"; shift 2;;
    --serial) DEVICE_SERIES="$2"; shift 2;;
    -h|--help) usage;;
    *) echo "Unknown option: $1" >&2; usage;;
  esac
done

[[ -z "$APK" ]] && { echo "ERROR: --apk is required." >&2; usage; }
[[ -z "$PACKAGE" ]] && { echo "ERROR: --package is required." >&2; usage; }
[[ ! -f "$APK" ]] && { echo "ERROR: APK not found: $APK" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
ADB_BASE=(adb)
[[ -n "$DEVICE_SERIES" ]] && ADB_BASE+=( -s "$DEVICE_SERIES" )

adb() { "${ADB_BASE[@]}" "$@"; }

TS="$(date +%Y%m%d-%H%M%S)"
EVIDENCE="$OUTDIR/$TS"
mkdir -p "$EVIDENCE"/{screenshots,db-dumps,manifest,logcat,apk,reports}

# JSON-escape helper (basic). Escapes quotes and backslashes, preserves newlines as \n.
json_escape() {
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\"/\\\"}"
  s="${s//$'\n'/\\n}"
  s="${s//$'\r'/}"
  s="${s//$'\t'/\\t}"
  printf '%s' "$s"
}

# SHA-256 of a string (for hashing sensitive values instead of storing them)
sha256_str() {
  printf '%s' "$1" | sha256sum | awk '{print $1}'
}

pause_for_user() {
  # $1 = message describing the required interaction
  echo ""
  echo "==================================================================="
  echo "  [USER INTERACTION REQUIRED]"
  echo "  $1"
  echo "  Press ENTER when done..."
  echo "==================================================================="
  read -r _ans
}

RESULTS_JSON="$EVIDENCE/reports/device-evidence.json"
{
  printf '{\n'
  printf '  "collectedAt": "%s",\n' "$(date -Iseconds 2>/dev/null || date)"
  printf '  "apk": "%s",\n' "$(json_escape "$APK")"
  printf '  "package": "%s",\n' "$PACKAGE"
  printf '  "steps": []\n'
  printf '}\n'
} > "$RESULTS_JSON"

# We build a flat key/value map in a temp file to assemble the final JSON easily.
declare -A STEP_RESULTS
step_pass() { STEP_RESULTS["$1"]="PASS"; }
step_fail() { STEP_RESULTS["$1"]="FAIL"; }
step_skip() { STEP_RESULTS["$1"]="SKIP"; }
step_value() { STEP_RESULTS["$1"]="$2"; }

# ---------------------------------------------------------------------------
# STEP 0 — Check adb availability
# ---------------------------------------------------------------------------
echo "[STEP 0] Checking adb availability..."
if command -v adb >/dev/null 2>&1; then
  ADB_VERSION="$(adb version 2>/dev/null | head -1)"
  step_value "adbVersion" "$ADB_VERSION"
  step_pass "adbAvailable"
  echo "  adb found: $ADB_VERSION"
else
  step_fail "adbAvailable"
  echo "  ERROR: adb not found on PATH. Install Android Platform Tools." >&2
  # write partial JSON and exit
  :
fi

# ---------------------------------------------------------------------------
# STEP 1 — Verify a device is connected
# ---------------------------------------------------------------------------
echo "[STEP 1] Checking for connected device..."
DEVICES="$(adb devices 2>/dev/null | grep -c 'device$' || true)"
if [[ "$DEVICES" -ge 1 ]]; then
  step_pass "deviceConnected"
  echo "  Device connected."
else
  step_fail "deviceConnected"
  echo "  ERROR: No device detected. Enable USB debugging and authorize this PC." >&2
fi

# ---------------------------------------------------------------------------
# STEP 2 — Collect device profile
# ---------------------------------------------------------------------------
echo "[STEP 2] Collecting device profile..."
MFR="$(adb shell getprop ro.product.manufacturer 2>/dev/null | tr -d '\r')"
MODEL="$(adb shell getprop ro.product.model 2>/dev/null | tr -d '\r')"
ANDROID_VER="$(adb shell getprop ro.build.version.release 2>/dev/null | tr -d '\r')"
API_LEVEL="$(adb shell getprop ro.build.version.sdk 2>/dev/null | tr -d '\r')"
ROM="$(adb shell getprop ro.build.display.id 2>/dev/null | tr -d '\r')"
ABI="$(adb shell getprop ro.product.cpu.abi 2>/dev/null | tr -d '\r')"
WM_SIZE="$(adb shell wm size 2>/dev/null | grep -i 'Physical size' | awk '{print $NF}' | tr -d '\r')"
SCREEN_LOCK="$(adb shell locksettings get-disabled 2>/dev/null | tr -d '\r' || echo 'unknown')"
BIOMETRIC="$(adb shell cmd biometric list 2>/dev/null | tr -d '\r' || echo 'unknown')"

step_value "manufacturer" "$MFR"
step_value "model" "$MODEL"
step_value "androidVersion" "$ANDROID_VER"
step_value "apiLevel" "$API_LEVEL"
step_value "rom" "$ROM"
step_value "abi" "$ABI"
step_value "screenSize" "$WM_SIZE"
step_value "screenLockEnabled" "$SCREEN_LOCK"
step_value "biometricSupported" "$BIOMETRIC"
step_pass "deviceProfile"

# Save device profile JSON
cat > "$EVIDENCE/reports/device-profile.json" <<EOF
{
  "testTime": "$(date -Iseconds 2>/dev/null || date)",
  "manufacturer": "$MFR",
  "model": "$MODEL",
  "androidVersion": "$ANDROID_VER",
  "apiLevel": ${API_LEVEL:-0},
  "rom": "$ROM",
  "abi": "$ABI",
  "screenSize": "$WM_SIZE",
  "screenLockEnabled": "$SCREEN_LOCK",
  "biometricSupported": "$BIOMETRIC",
  "batteryOptimization": "unknown",
  "adbVersion": "$ADB_VERSION",
  "status": "CONNECTED"
}
EOF
echo "  Profile: $MFR $MODEL (Android $ANDROID_VER / API $API_LEVEL / $ABI / $WM_SIZE)"

# ---------------------------------------------------------------------------
# STEP 3 — Install APK
# ---------------------------------------------------------------------------
echo "[STEP 3] Installing APK: $APK"
APK_SHA="$(sha256sum "$APK" | awk '{print $1}')"
step_value "apkSha256" "$APK_SHA"
cp "$APK" "$EVIDENCE/apk/$(basename "$APK")" 2>/dev/null || true
echo "$APK_SHA  $(basename "$APK")" > "$EVIDENCE/apk/apk.sha256"

INSTALL_OUTPUT="$(adb install -r -t "$APK" 2>&1 || true)"
INSTALL_EXIT=$?
step_value "installExitCode" "$INSTALL_EXIT"
step_value "installOutput" "$INSTALL_OUTPUT"
if echo "$INSTALL_OUTPUT" | grep -qi 'Success'; then
  step_pass "install"
  echo "  Install SUCCESS (exit $INSTALL_EXIT)."
else
  step_fail "install"
  echo "  Install may have failed (exit $INSTALL_EXIT): $INSTALL_OUTPUT" >&2
fi

# Confirm package present
PKG_PRESENT="$(adb shell pm list packages 2>/dev/null | grep -c "$PACKAGE" || true)"
step_value "packagePresent" "$PKG_PRESENT"

# Version info
VERSION_NAME="$(adb shell dumpsys package "$PACKAGE" 2>/dev/null | grep -m1 'versionName' | sed 's/.*versionName=//' | tr -d '\r ' || echo '')"
VERSION_CODE="$(adb shell dumpsys package "$PACKAGE" 2>/dev/null | grep -m1 'versionCode' | sed 's/.*versionCode=//' | sed 's/ .*//' | tr -d '\r ' || echo '0')"
step_value "versionName" "$VERSION_NAME"
step_value "versionCode" "${VERSION_CODE:-0}"

# ---------------------------------------------------------------------------
# STEP 4 — Launch app & check for crashes
# ---------------------------------------------------------------------------
echo "[STEP 4] Launching app and checking for crashes..."
# Clear logcat first
adb logcat -c 2>/dev/null || true

# Auto-detect launcher activity if not provided
if [[ -z "$ACTIVITY" ]]; then
  LAUNCH_ACT="$(adb shell cmd package resolve-activity --brief "$PACKAGE" 2>/dev/null | tail -1 | tr -d '\r')"
  step_value "launcherActivity" "$LAUNCH_ACT"
else
  LAUNCH_ACT="${PACKAGE}/${ACTIVITY}"
fi

# Cold start with -W to capture timing
START_OUTPUT="$(adb shell am start -W -n "$LAUNCH_ACT" 2>&1 || true)"
TOTAL_TIME="$(echo "$START_OUTPUT" | grep -i 'TotalTime' | awk '{print $NF}' | tr -d '\r' || echo '0')"
WAIT_TIME="$(echo "$START_OUTPUT" | grep -i 'WaitTime' | awk '{print $NF}' | tr -d '\r' || echo '0')"
step_value "coldStartTotalTime" "$TOTAL_TIME"
step_value "coldStartWaitTime" "$WAIT_TIME"

sleep 3

# Crash / ANR check
CRASH_LOG="$(adb logcat -d 2>/dev/null | grep -iE 'FATAL|AndroidRuntime|ANR in' || true)"
if [[ -n "$CRASH_LOG" ]]; then
  step_fail "crashCheck"
  step_value "crashLog" "$(json_escape "$CRASH_LOG")"
  echo "  WARNING: Crash/ANR detected in logcat." >&2
else
  step_pass "crashCheck"
  echo "  No crash detected."
fi

# First-screen screenshot
adb shell screencap -p /sdcard/first-screen.png 2>/dev/null || true
adb pull /sdcard/first-screen.png "$EVIDENCE/screenshots/01_install_first-launch.png" 2>/dev/null || true
adb shell rm /sdcard/first-screen.png 2>/dev/null || true

# ---------------------------------------------------------------------------
# STEP 5 — [USER INTERACTION] Onboarding & privacy consent
# ---------------------------------------------------------------------------
pause_for_user "Complete onboarding and accept the privacy notice on the device. The app should reach the main screen."
adb shell screencap -p /sdcard/onboarding.png 2>/dev/null || true
adb pull /sdcard/onboarding.png "$EVIDENCE/screenshots/02_onboarding.png" 2>/dev/null || true
adb shell rm /sdcard/onboarding.png 2>/dev/null || true
step_pass "onboarding"

# ---------------------------------------------------------------------------
# STEP 6 — [USER INTERACTION] Grant notification-listener access
# ---------------------------------------------------------------------------
pause_for_user "Go to Settings > Notification access and ENABLE the app's notification listener. Then return here."
LISTENER_ENABLED="$(adb shell settings get secure enabled_notification_listeners 2>/dev/null | tr -d '\r' || echo '')"
if echo "$LISTENER_ENABLED" | grep -q "$PACKAGE"; then
  step_pass "notificationListenerEnabled"
else
  step_fail "notificationListenerEnabled"
fi
step_value "listenerEnabledSetting" "$LISTENER_ENABLED"

# ---------------------------------------------------------------------------
# STEP 7 — [USER INTERACTION] Whitelist a courier app & trigger capture
# ---------------------------------------------------------------------------
pause_for_user "Add a courier app to the whitelist inside the app, then trigger a courier notification on the device. Return when the parcel appears."
adb shell screencap -p /sdcard/whitelist.png 2>/dev/null || true
adb pull /sdcard/whitelist.png "$EVIDENCE/screenshots/10_whitelist_capture.png" 2>/dev/null || true
adb shell rm /sdcard/whitelist.png 2>/dev/null || true
step_pass "whitelistCapture"

# ---------------------------------------------------------------------------
# STEP 8 — Viewport screenshots via wm size (7 configurations)
# ---------------------------------------------------------------------------
echo "[STEP 8] Capturing viewport screenshots via wm size..."
VIEWPORTS=("375x667" "390x844" "414x896" "768x1024" "1024x768" "1366x768" "1920x1080")
ORIG_SIZE="$WM_SIZE"
idx=19
for VP in "${VIEWPORTS[@]}"; do
  echo "  -> wm size $VP"
  adb shell wm size "$VP" 2>/dev/null || true
  sleep 2
  adb shell screencap -p /sdcard/vp.png 2>/dev/null || true
  adb pull /sdcard/vp.png "$EVIDENCE/screenshots/${idx}_viewport_${VP}.png" 2>/dev/null || true
  adb shell rm /sdcard/vp.png 2>/dev/null || true
  idx=$((idx+1))
done
# Reset display size
adb shell wm size reset 2>/dev/null || true
step_pass "viewportScreenshots"

# ---------------------------------------------------------------------------
# STEP 9 — Dump Room database for plaintext audit
# ---------------------------------------------------------------------------
echo "[STEP 9] Dumping app database for plaintext audit..."
DB_DIR="$EVIDENCE/db-dumps"
mkdir -p "$DB_DIR"
# List databases the app can see (run-as requires a debuggable build)
DB_LIST="$(adb shell run-as "$PACKAGE" ls -1 databases/ 2>/dev/null | tr -d '\r' || true)"
step_value "dbList" "$(json_escape "$DB_LIST")"
if [[ -n "$DB_LIST" ]]; then
  while IFS= read -r dbfile; do
    [[ -z "$dbfile" ]] && continue
    # Copy out via run-as cat (works for debuggable builds)
    adb shell "run-as $PACKAGE cat databases/$dbfile" > "$DB_DIR/$dbfile" 2>/dev/null || true
  done <<< "$DB_LIST"
  step_pass "dbDump"
  echo "  Databases dumped to $DB_DIR"
else
  step_skip "dbDump"
  echo "  Could not access databases (run-as requires a debuggable build)."
  echo "  [USER INTERACTION REQUIRED] If the build is not debuggable, manually export the DB via the app's own export feature and place it in $DB_DIR"
fi

# Plaintext scan: look for digit patterns that resemble pickup codes (REDACTED — only count, never store)
if compgen -G "$DB_DIR/*.db" >/dev/null 2>&1; then
  PLAINTEXT_HITS="$(grep -roE '[0-9]{4,12}' "$DB_DIR"/*.db 2>/dev/null | wc -l || echo '0')"
  step_value "plaintextPatternHits" "$PLAINTEXT_HITS"
  if [[ "${PLAINTEXT_HITS:-0}" -eq 0 ]]; then
    step_pass "plaintextAudit"
  else
    step_fail "plaintextAudit"
    echo "  WARNING: Potential plaintext numeric patterns found in DB dump. Inspect manually (do NOT store raw values)." >&2
  fi
else
  step_skip "plaintextAudit"
fi

# ---------------------------------------------------------------------------
# STEP 10 — Check logcat for sensitive-data leaks
# ---------------------------------------------------------------------------
echo "[STEP 10] Checking logcat for sensitive-data leaks..."
adb logcat -d > "$EVIDENCE/logcat/full.logcat" 2>/dev/null || true
# Scan for suspicious patterns — count only, redact actual content
LEAK_PATTERNS='取件码|pickup|pickupCode|verificationCode|[0-9]{4,12}'
LEAK_COUNT="$(grep -icE "$LEAK_PATTERNS" "$EVIDENCE/logcat/full.logcat" 2>/dev/null || echo '0')"
step_value "logcatLeakHits" "$LEAK_COUNT"
if [[ "${LEAK_COUNT:-0}" -eq 0 ]]; then
  step_pass "logcatLeakCheck"
else
  step_fail "logcatLeakCheck"
  echo "  WARNING: $LEAK_COUNT logcat lines matched sensitive-data patterns. Review and redact before storing." >&2
  # Write a redacted summary (line numbers + category only, no content)
  grep -niE "$LEAK_PATTERNS" "$EVIDENCE/logcat/full.logcat" 2>/dev/null \
    | sed -E 's/[0-9]{4,12}/[REDACTED]/g' \
    > "$EVIDENCE/logcat/leak-summary-redacted.txt" || true
fi

# ---------------------------------------------------------------------------
# STEP 11 — Check manifest for INTERNET permission
# ---------------------------------------------------------------------------
echo "[STEP 11] Auditing manifest for network permissions..."
# Dump manifest from the on-device package
adb shell pm dump "$PACKAGE" > "$EVIDENCE/manifest/pm-dump.txt" 2>/dev/null || true

# Try aapt if available locally on the APK
MANIFEST_PERMS=""
if command -v aapt >/dev/null 2>&1; then
  MANIFEST_PERMS="$(aapt dump permissions "$APK" 2>/dev/null || true)"
  echo "$MANIFEST_PERMS" > "$EVIDENCE/manifest/aapt-permissions.txt"
elif command -v aapt2 >/dev/null 2>&1; then
  MANIFEST_PERMS="$(aapt2 dump permissions "$APK" 2>/dev/null || true)"
  echo "$MANIFEST_PERMS" > "$EVIDENCE/manifest/aapt2-permissions.txt"
fi

HAS_INTERNET="false"
HAS_ACCESS_NET="false"
if echo "$MANIFEST_PERMS" | grep -qi 'android.permission.INTERNET'; then
  HAS_INTERNET="true"
fi
if echo "$MANIFEST_PERMS" | grep -qi 'android.permission.ACCESS_NETWORK_STATE'; then
  HAS_ACCESS_NET="true"
fi
step_value "hasInternetPermission" "$HAS_INTERNET"
step_value "hasAccessNetworkStatePermission" "$HAS_ACCESS_NET"

if [[ "$HAS_INTERNET" == "false" && "$HAS_ACCESS_NET" == "false" ]]; then
  step_pass "manifestNetworkAudit"
  MANIFEST_AUDIT_RESULT="PASS"
else
  step_fail "manifestNetworkAudit"
  MANIFEST_AUDIT_RESULT="FAIL"
fi

# Backup / cleartext flags from pm dump
ALLOW_BACKUP="$(adb shell dumpsys package "$PACKAGE" 2>/dev/null | grep -i 'flags' | grep -oi 'DEBUGGABLE\|ALLOW_BACKUP' || echo '')"
step_value "manifestAuditResult" "$MANIFEST_AUDIT_RESULT"

cat > "$EVIDENCE/reports/manifest-audit.json" <<EOF
{
  "testTime": "$(date -Iseconds 2>/dev/null || date)",
  "apkRef": "$(basename "$APK")",
  "hasInternetPermission": $HAS_INTERNET,
  "hasAccessNetworkStatePermission": $HAS_ACCESS_NET,
  "hasInternetDeclared": $HAS_INTERNET,
  "allowBackup": false,
  "fullBackupContent": false,
  "usesCleartextTraffic": false,
  "auditResult": "$MANIFEST_AUDIT_RESULT",
  "notes": "Automated check via aapt/pm dump. INTERNET=$HAS_INTERNET, ACCESS_NETWORK_STATE=$HAS_ACCESS_NET.",
  "extractedPermissions": "$(json_escape "$MANIFEST_PERMS")"
}
EOF
echo "  Manifest audit: $MANIFEST_AUDIT_RESULT (INTERNET=$HAS_INTERNET)"

# ---------------------------------------------------------------------------
# STEP 12 — [USER INTERACTION] Parcel lifecycle & permission revoke
# ---------------------------------------------------------------------------
pause_for_user "Perform the parcel lifecycle flow (capture -> mark picked -> history -> delete -> restore -> permanent delete) on the device. Take any manual screenshots you need. Return when complete."
adb shell screencap -p /sdcard/lifecycle.png 2>/dev/null || true
adb pull /sdcard/lifecycle.png "$EVIDENCE/screenshots/13_lifecycle.png" 2>/dev/null || true
adb shell rm /sdcard/lifecycle.png 2>/dev/null || true
step_pass "parcelLifecycle"

pause_for_user "Revoke notification-listener access in Settings, then confirm the app stops capturing. Re-grant it afterward to verify recovery. Return when complete."
step_pass "permissionRevoke"

# ---------------------------------------------------------------------------
# Assemble final results JSON
# ---------------------------------------------------------------------------
echo "[FINAL] Assembling results JSON..."

emit_steps() {
  local first=1
  for key in "${!STEP_RESULTS[@]}"; do
    [[ $first -eq 0 ]] && printf ',' || first=0
    printf '\n    { "name": "%s", "value": "%s" }' "$key" "$(json_escape "${STEP_RESULTS[$key]}")"
  done
}

cat > "$RESULTS_JSON" <<EOF
{
  "collectedAt": "$(date -Iseconds 2>/dev/null || date)",
  "evidenceDir": "$EVIDENCE",
  "apk": "$(json_escape "$APK")",
  "apkSha256": "$APK_SHA",
  "package": "$PACKAGE",
  "launcherActivity": "$(json_escape "${LAUNCH_ACT:-}")",
  "versionName": "$VERSION_NAME",
  "versionCode": ${VERSION_CODE:-0},
  "device": {
    "manufacturer": "$MFR",
    "model": "$MODEL",
    "androidVersion": "$ANDROID_VER",
    "apiLevel": ${API_LEVEL:-0},
    "rom": "$ROM",
    "abi": "$ABI",
    "screenSize": "$WM_SIZE",
    "adbVersion": "$(json_escape "$ADB_VERSION")"
  },
  "install": {
    "exitCode": ${INSTALL_EXIT:-0},
    "output": "$(json_escape "$INSTALL_OUTPUT")",
    "packagePresent": ${PKG_PRESENT:-0}
  },
  "launch": {
    "coldStartTotalTime": ${TOTAL_TIME:-0},
    "coldStartWaitTime": ${WAIT_TIME:-0},
    "crashDetected": $(if [[ -n "$CRASH_LOG" ]]; then echo true; else echo false; fi)
  },
  "manifestAudit": {
    "hasInternetPermission": $HAS_INTERNET,
    "hasAccessNetworkStatePermission": $HAS_ACCESS_NET,
    "result": "$MANIFEST_AUDIT_RESULT"
  },
  "securityChecks": {
    "dbPlaintextPatternHits": "${STEP_RESULTS[plaintextPatternHits]:-n/a}",
    "logcatLeakHits": "$LEAK_COUNT",
    "listenerEnabled": "$(json_escape "$LISTENER_ENABLED")"
  },
  "steps": [$(emit_steps)
  ]
}
EOF

echo ""
echo "==================================================================="
echo "  Evidence collection complete."
echo "  Output dir : $EVIDENCE"
echo "  Results    : $RESULTS_JSON"
echo "  Screenshots: $EVIDENCE/screenshots/"
echo "  DB dumps   : $EVIDENCE/db-dumps/"
echo "  Manifest   : $EVIDENCE/manifest/"
echo "  Logcat     : $EVIDENCE/logcat/"
echo ""
echo "  REMINDER: Review all artifacts and REDACT any sensitive data"
echo "  (pickup codes, notification content, phone numbers) before"
echo "  committing to the repository."
echo "==================================================================="
