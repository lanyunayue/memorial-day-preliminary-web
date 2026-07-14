# 时刻 Android 原生 Alpha

这是 `v2.3.0-alpha1` Android Parcel Intelligence 工程。核心应用位于 `apps/android/app`，不是 WebView。

## 固定工具链

- JDK 17
- Gradle 8.9（使用仓库 wrapper）
- Android Gradle Plugin 8.7.3
- compile/target SDK 35
- min SDK 26
- Build Tools 35.0.0

## 构建

在仓库根目录设置 `JAVA_HOME` 与 `ANDROID_SDK_ROOT` 后运行：

```powershell
.\gradlew.bat :apps:android:app:testDebugUnitTest :packages:parcel-domain:test
.\gradlew.bat :apps:android:app:assembleDebug
```

安装：

```powershell
adb install -r apps\android\app\build\outputs\apk\debug\app-debug.apk
```

Debug APK 使用 Android 默认调试签名。仓库不包含发布签名、keystore 或 `local.properties`。

## 真实设备

通知访问必须由用户在 Android 系统设置中开启。自动化测试通知只能标记为 `DEBUG TEST SOURCE`，不能替代 [真实设备检查表](../../docs/android-testing/real-device-validation.md)。
