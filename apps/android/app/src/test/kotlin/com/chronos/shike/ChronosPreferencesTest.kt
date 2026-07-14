package com.chronos.shike

import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class ChronosPreferencesTest {
    private lateinit var preferences: ChronosPreferences

    @Before
    fun setUp() {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        context.getSharedPreferences("chronos_preferences", 0).edit().clear().commit()
        preferences = ChronosPreferences(context)
    }

    @Test
    fun defaultsToSuggestWithEmptyWhitelist() {
        assertEquals(AutomationMode.SUGGEST, preferences.automationMode)
        assertTrue(preferences.allowedPackages().isEmpty())
        assertFalse(preferences.onboardingComplete)
    }

    @Test
    fun revokeClearsWhitelistAndFallsBackToManual() {
        preferences.setPackageAllowed("com.example.delivery", true)
        preferences.automationMode = AutomationMode.AUTO_ORGANIZE
        preferences.clearCaptureSettings()
        assertTrue(preferences.allowedPackages().isEmpty())
        assertEquals(AutomationMode.MANUAL, preferences.automationMode)
    }
}
