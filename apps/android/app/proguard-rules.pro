-keep class com.chronos.shike.storage.** { *; }
-keepattributes *Annotation*

# Remove Log calls in release builds to prevent sensitive data leakage
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** i(...);
    public static *** v(...);
    public static *** e(...);
    public static *** w(...);
}
