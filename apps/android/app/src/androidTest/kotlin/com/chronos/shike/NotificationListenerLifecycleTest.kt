package com.chronos.shike

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.chronos.shike.capture.NotificationInput
import com.chronos.shike.capture.NotificationSourceAdapter
import com.chronos.shike.security.PickupCodeCrypto
import com.chronos.shike.storage.ChronosDatabase
import com.chronos.shike.storage.ParcelRepository
import java.time.Instant
import org.junit.After
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class NotificationListenerLifecycleTest {
    private lateinit var context: Context
    private lateinit var database: ChronosDatabase
    private lateinit var repository: ParcelRepository
    private lateinit var preferences: ChronosPreferences
    private lateinit var adapter: NotificationSourceAdapter

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        context.getSharedPreferences("chronos_preferences", Context.MODE_PRIVATE).edit().clear().commit()
        PickupCodeCrypto().deleteKey()
        database = Room.inMemoryDatabaseBuilder(context, ChronosDatabase::class.java).build()
        repository = ParcelRepository(database, PickupCodeCrypto())
        preferences = ChronosPreferences(context)
        adapter = NotificationSourceAdapter(context, repository, preferences)
    }

    @After
    fun tearDown() {
        database.close()
        context.getSharedPreferences("chronos_preferences", Context.MODE_PRIVATE).edit().clear().commit()
        PickupCodeCrypto().deleteKey()
    }

    private fun parcelNotification(packageName: String): NotificationInput = NotificationInput(
        sourcePackage = packageName,
        sourceLabel = "Test App",
        title = "圆通快递",
        text = "已到达南苑驿站，取件码 4-2-6187",
        occurredAt = Instant.now(),
    )

    private fun configureWhitelist(vararg packages: String) {
        preferences.automationMode = AutomationMode.SUGGEST
        packages.forEach { preferences.setPackageAllowed(it, true) }
    }

    @Test
    fun doesNotCaptureWhenNotStarted() {
        configureWhitelist("com.test.app")

        // The adapter has not been started, so active = false.
        // Even with a whitelisted package, capture should return null.
        val result = adapter.capture(parcelNotification("com.test.app"))
        assertNull("Capture should return null when adapter is not started", result)
    }

    @Test
    fun whitelistFiltersNonWhitelistedPackages() {
        configureWhitelist("com.allowed.app")
        adapter.start()

        val allowedResult = adapter.capture(parcelNotification("com.allowed.app"))
        assertNotNull("Whitelisted package should be captured", allowedResult)

        val blockedResult = adapter.capture(parcelNotification("com.blocked.app"))
        assertNull("Non-whitelisted package should not be captured", blockedResult)
    }

    @Test
    fun whitelistFiltersInManualMode() {
        // In MANUAL mode, no packages are allowed regardless of whitelist
        preferences.automationMode = AutomationMode.MANUAL
        preferences.setPackageAllowed("com.test.app", true)
        adapter.start()

        val result = adapter.capture(parcelNotification("com.test.app"))
        assertNull("Capture should return null in MANUAL mode even for whitelisted packages", result)
    }

    @Test
    fun canRebindAfterDisconnect() {
        configureWhitelist("com.test.app")

        // First binding: start and capture
        adapter.start()
        val firstCapture = adapter.capture(parcelNotification("com.test.app"))
        assertNotNull("Capture should work after start", firstCapture)

        // Disconnect: stop the adapter
        adapter.stop()
        val stoppedCapture = adapter.capture(parcelNotification("com.test.app"))
        assertNull("Capture should return null after stop", stoppedCapture)

        // Rebind: start again and capture
        adapter.start()
        val reboundCapture = adapter.capture(parcelNotification("com.test.app"))
        assertNotNull("Capture should work after rebind (start again)", reboundCapture)
    }

    @Test
    fun newAdapterWorksAfterProcessRecreation() {
        configureWhitelist("com.test.app")
        adapter.start()
        assertNotNull("Original adapter should capture", adapter.capture(parcelNotification("com.test.app")))

        // Simulate process recreation: create a new adapter instance.
        // SharedPreferences persists across process recreation, so the whitelist survives.
        val recreatedAdapter = NotificationSourceAdapter(context, repository, preferences)
        recreatedAdapter.start()
        val result = recreatedAdapter.capture(parcelNotification("com.test.app"))
        assertNotNull("Recreated adapter should capture after start", result)
    }

    @Test
    fun stoppedAdapterDoesNotCaptureEvenIfPreviouslyAllowed() {
        configureWhitelist("com.test.app")
        adapter.start()
        assertNotNull(adapter.capture(parcelNotification("com.test.app")))

        adapter.stop()

        // After stop, even the same whitelisted package should not be captured
        assertNull(adapter.capture(parcelNotification("com.test.app")))
    }

    @Test
    fun adapterHealthReflectsActiveState() {
        // Before start, the adapter is not active.
        // health() checks active && permissionStatus() == GRANTED.
        // Since the test app does not have notification listener access,
        // health().available should be false.
        val stoppedHealth = adapter.health()
        assertFalse("Stopped adapter health should not be available", stoppedHealth.available)

        adapter.start()
        // Even after start, health is not available because notification access is not granted
        val startedHealth = adapter.health()
        assertFalse("Health should not be available without notification access", startedHealth.available)
        // The detail should identify the notification listener
        assertNotNull(startedHealth.detail)
    }
}
