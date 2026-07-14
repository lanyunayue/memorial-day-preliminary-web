package com.chronos.shike

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.chronos.shike.capture.NotificationSourceAdapter
import com.chronos.shike.capture.UserProvidedInput
import com.chronos.shike.capture.UserProvidedSourceAdapter
import com.chronos.shike.contract.EventSourceType
import com.chronos.shike.contract.PermissionStatus
import com.chronos.shike.security.PickupCodeCrypto
import com.chronos.shike.storage.ChronosDatabase
import com.chronos.shike.storage.ParcelRepository
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class PermissionStateTest {
    private lateinit var context: Context
    private lateinit var database: ChronosDatabase
    private lateinit var repository: ParcelRepository
    private lateinit var preferences: ChronosPreferences
    private lateinit var notificationAdapter: NotificationSourceAdapter

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        context.getSharedPreferences("chronos_preferences", Context.MODE_PRIVATE).edit().clear().commit()
        PickupCodeCrypto().deleteKey()
        database = Room.inMemoryDatabaseBuilder(context, ChronosDatabase::class.java).build()
        repository = ParcelRepository(database, PickupCodeCrypto())
        preferences = ChronosPreferences(context)
        notificationAdapter = NotificationSourceAdapter(context, repository, preferences)
    }

    @After
    fun tearDown() {
        database.close()
        context.getSharedPreferences("chronos_preferences", Context.MODE_PRIVATE).edit().clear().commit()
        PickupCodeCrypto().deleteKey()
    }

    @Test
    fun defaultPermissionStatusIsNotGranted() {
        // The test application does not have notification listener access,
        // so permissionStatus() should return NOT_GRANTED.
        val status = notificationAdapter.permissionStatus()
        assertEquals(
            "Default permission status should be NOT_GRANTED",
            PermissionStatus.NOT_GRANTED,
            status,
        )
    }

    @Test
    fun preferencesCanToggleCaptureState() {
        // In MANUAL mode, no packages are allowed even if whitelisted
        preferences.automationMode = AutomationMode.MANUAL
        preferences.setPackageAllowed("com.test.app", true)
        assertFalse(
            "isAllowed should be false in MANUAL mode",
            notificationAdapter.isAllowed("com.test.app"),
        )

        // Switching to SUGGEST mode enables capture for whitelisted packages
        preferences.automationMode = AutomationMode.SUGGEST
        assertTrue(
            "isAllowed should be true for whitelisted package in SUGGEST mode",
            notificationAdapter.isAllowed("com.test.app"),
        )
        assertFalse(
            "isAllowed should be false for non-whitelisted package",
            notificationAdapter.isAllowed("com.other.app"),
        )

        // Switching to AUTO_ORGANIZE mode also enables capture for whitelisted packages
        preferences.automationMode = AutomationMode.AUTO_ORGANIZE
        assertTrue(
            "isAllowed should be true for whitelisted package in AUTO_ORGANIZE mode",
            notificationAdapter.isAllowed("com.test.app"),
        )

        // Switching back to MANUAL disables all capture
        preferences.automationMode = AutomationMode.MANUAL
        assertFalse(
            "isAllowed should be false in MANUAL mode",
            notificationAdapter.isAllowed("com.test.app"),
        )
    }

    @Test
    fun revokingPermissionClearsCaptureData() = runBlocking {
        // Create some capture data using a manual adapter
        val manualAdapter = UserProvidedSourceAdapter(EventSourceType.MANUAL, "test.source")
        val text = "圆通快递 运单号 YT77777777 已到达南苑驿站，取件码 9-9-9999"
        val envelope = manualAdapter.capture(UserProvidedInput(text))!!
        repository.captureConfirmed(envelope, text)

        // Set up whitelist and automation mode to simulate an active capture configuration
        preferences.automationMode = AutomationMode.SUGGEST
        preferences.setPackageAllowed("com.test.app", true)
        assertTrue(repository.observeParcels().first().isNotEmpty())
        assertTrue(preferences.allowedPackages().isNotEmpty())

        // Simulate the revokeAndClear flow from ShikeViewModel:
        // 1. Revoke (stop) the notification source
        notificationAdapter.revoke()

        // 2. Clear capture settings (clears whitelist and resets mode to MANUAL)
        preferences.clearCaptureSettings()

        // 3. Clear all local data (parcels, events, drafts, and crypto key)
        repository.clearAll()

        // Verify all capture data is cleared
        assertTrue("Parcels should be empty after clearAll", repository.observeParcels().first().isEmpty())
        assertTrue("Whitelist should be empty after clearCaptureSettings", preferences.allowedPackages().isEmpty())
        assertEquals(
            "Automation mode should be MANUAL after clearCaptureSettings",
            AutomationMode.MANUAL,
            preferences.automationMode,
        )
    }

    @Test
    fun clearCaptureSettingsResetsAutomationModeToManual() {
        preferences.automationMode = AutomationMode.AUTO_ORGANIZE
        preferences.setPackageAllowed("com.app1", true)
        preferences.setPackageAllowed("com.app2", true)

        preferences.clearCaptureSettings()

        assertEquals(AutomationMode.MANUAL, preferences.automationMode)
        assertTrue(preferences.allowedPackages().isEmpty())
    }
}
