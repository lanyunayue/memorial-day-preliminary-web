param(
    [string]$JavaHome = $env:JAVA_HOME,
    [string]$AndroidSdkRoot = $env:ANDROID_SDK_ROOT
)

$ErrorActionPreference = 'Stop'
if (-not $JavaHome) { throw 'JAVA_HOME is required' }
if (-not $AndroidSdkRoot) { throw 'ANDROID_SDK_ROOT is required' }
$env:JAVA_HOME = $JavaHome
$env:ANDROID_SDK_ROOT = $AndroidSdkRoot

& .\gradlew.bat :packages:event-contract:test :packages:temporal-contract:test :packages:parcel-domain:test :apps:android:app:testDebugUnitTest :apps:android:app:lintDebug :apps:android:app:assembleDebug
if ($LASTEXITCODE -ne 0) { throw "Gradle verification failed: $LASTEXITCODE" }

$manifest = Get-Content -Raw -LiteralPath 'apps\android\app\src\main\AndroidManifest.xml'
$prohibited = @('android.permission.INTERNET', 'BIND_ACCESSIBILITY_SERVICE', 'READ_SMS', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION')
foreach ($permission in $prohibited) {
    if ($manifest.Contains($permission)) { throw "Prohibited permission found: $permission" }
}

$tracked = git ls-files
$secretPattern = '(?i)(BEGIN (RSA|EC|OPENSSH) PRIVATE KEY|AIza[0-9A-Za-z_-]{30,}|sk-[0-9A-Za-z]{20,})'
foreach ($file in $tracked) {
    if (Test-Path -LiteralPath $file -PathType Leaf) {
        $match = Select-String -LiteralPath $file -Pattern $secretPattern -ErrorAction SilentlyContinue
        if ($match -and $file -notmatch '(test|corpus|docs)') { throw "Potential secret/sensitive fixture outside tests: $file" }
    }
}

$apk = Get-Item -LiteralPath 'apps\android\app\build\outputs\apk\debug\app-debug.apk'
$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $apk.FullName
Write-Output "ANDROID_AUDIT=PASS"
Write-Output "APK=$($apk.FullName)"
Write-Output "APK_SIZE=$($apk.Length)"
Write-Output "APK_SHA256=$($hash.Hash.ToLowerInvariant())"
