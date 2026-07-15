package com.chronos.shike

import android.content.Context

enum class AutomationMode { MANUAL, SUGGEST, AUTO_ORGANIZE }

class ChronosPreferences(context: Context) {
    private val prefs = context.getSharedPreferences("chronos_preferences", Context.MODE_PRIVATE)

    var onboardingComplete: Boolean
        get() = prefs.getBoolean(KEY_ONBOARDING, false)
        set(value) = prefs.edit().putBoolean(KEY_ONBOARDING, value).apply()

    var automationMode: AutomationMode
        get() = runCatching { AutomationMode.valueOf(prefs.getString(KEY_MODE, AutomationMode.SUGGEST.name)!!) }
            .getOrDefault(AutomationMode.SUGGEST)
        set(value) = prefs.edit().putString(KEY_MODE, value.name).apply()

    var protectScreens: Boolean
        get() = prefs.getBoolean(KEY_PROTECT_SCREENS, true)
        set(value) = prefs.edit().putBoolean(KEY_PROTECT_SCREENS, value).apply()

    var availableTimeMinutes: Int
        get() = prefs.getInt(KEY_AVAILABLE_TIME_MINUTES, 240).coerceIn(30, 24 * 60)
        set(value) = prefs.edit().putInt(KEY_AVAILABLE_TIME_MINUTES, value.coerceIn(30, 24 * 60)).apply()

    fun allowedPackages(): Set<String> = prefs.getStringSet(KEY_ALLOWED_PACKAGES, emptySet())?.toSet().orEmpty()

    fun setPackageAllowed(packageName: String, allowed: Boolean) {
        val updated = allowedPackages().toMutableSet()
        if (allowed) updated += packageName else updated -= packageName
        prefs.edit().putStringSet(KEY_ALLOWED_PACKAGES, updated).apply()
    }

    fun clearCaptureSettings() {
        prefs.edit().remove(KEY_ALLOWED_PACKAGES).putString(KEY_MODE, AutomationMode.MANUAL.name).apply()
    }

    companion object {
        private const val KEY_ONBOARDING = "onboarding_complete"
        private const val KEY_MODE = "automation_mode"
        private const val KEY_PROTECT_SCREENS = "protect_screens"
        private const val KEY_AVAILABLE_TIME_MINUTES = "available_time_minutes"
        private const val KEY_ALLOWED_PACKAGES = "allowed_packages"
    }
}
