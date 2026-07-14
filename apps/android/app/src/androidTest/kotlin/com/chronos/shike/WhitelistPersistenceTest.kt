package com.chronos.shike

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class WhitelistPersistenceTest {
    private lateinit var context: Context
    private lateinit var preferences: ChronosPreferences

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        context.getSharedPreferences("chronos_preferences", Context.MODE_PRIVATE).edit().clear().commit()
        preferences = ChronosPreferences(context)
    }

    @After
    fun tearDown() {
        context.getSharedPreferences("chronos_preferences", Context.MODE_PRIVATE).edit().clear().commit()
    }

    @Test
    fun whitelistSurvivesProcessRecreation() {
        preferences.setPackageAllowed("com.cainiao.wireless", true)
        preferences.setPackageAllowed("com.sf.activity", true)
        preferences.setPackageAllowed("com.jingdong.app.mall", true)

        // Simulate process recreation by creating a new ChronosPreferences instance
        // with the same context. SharedPreferences persists across process recreation.
        val recreatedPreferences = ChronosPreferences(context)
        val packages = recreatedPreferences.allowedPackages()

        assertEquals("Whitelist should have 3 packages after recreation", 3, packages.size)
        assertTrue("Whitelist should contain cainiao", packages.contains("com.cainiao.wireless"))
        assertTrue("Whitelist should contain sf", packages.contains("com.sf.activity"))
        assertTrue("Whitelist should contain jd", packages.contains("com.jingdong.app.mall"))
    }

    @Test
    fun addingAndRemovingPackagesWorks() {
        // Initially empty
        assertTrue("Whitelist should be empty initially", preferences.allowedPackages().isEmpty())

        // Add a package
        preferences.setPackageAllowed("com.test.app", true)
        val afterAdd = preferences.allowedPackages()
        assertEquals("Whitelist should have 1 package after adding", 1, afterAdd.size)
        assertTrue("Whitelist should contain the added package", afterAdd.contains("com.test.app"))

        // Add another package
        preferences.setPackageAllowed("com.other.app", true)
        val afterSecondAdd = preferences.allowedPackages()
        assertEquals("Whitelist should have 2 packages", 2, afterSecondAdd.size)

        // Remove the first package
        preferences.setPackageAllowed("com.test.app", false)
        val afterRemove = preferences.allowedPackages()
        assertEquals("Whitelist should have 1 package after removal", 1, afterRemove.size)
        assertFalse("Whitelist should not contain removed package", afterRemove.contains("com.test.app"))
        assertTrue("Whitelist should still contain the other package", afterRemove.contains("com.other.app"))
    }

    @Test
    fun clearingWhitelistWorks() {
        preferences.setPackageAllowed("com.app1", true)
        preferences.setPackageAllowed("com.app2", true)
        preferences.setPackageAllowed("com.app3", true)
        assertEquals("Whitelist should have 3 packages before clearing", 3, preferences.allowedPackages().size)

        // clearCaptureSettings removes all allowed packages and resets automation mode
        preferences.clearCaptureSettings()

        assertTrue("Whitelist should be empty after clearing", preferences.allowedPackages().isEmpty())
        assertEquals(
            "Automation mode should be MANUAL after clearCaptureSettings",
            AutomationMode.MANUAL,
            preferences.automationMode,
        )
    }

    @Test
    fun removingNonExistentPackageDoesNotCrash() {
        // Start with an empty whitelist
        assertTrue(preferences.allowedPackages().isEmpty())

        // Removing a package that was never added should not throw an exception
        preferences.setPackageAllowed("com.never.added", false)

        // The whitelist should still be empty
        assertTrue("Whitelist should remain empty after removing non-existent package", preferences.allowedPackages().isEmpty())
    }

    @Test
    fun addingSamePackageTwiceDoesNotDuplicate() {
        preferences.setPackageAllowed("com.duplicate.app", true)
        preferences.setPackageAllowed("com.duplicate.app", true)

        val packages = preferences.allowedPackages()
        assertEquals("Whitelist should have 1 package (no duplicates)", 1, packages.size)
        assertTrue(packages.contains("com.duplicate.app"))
    }

    @Test
    fun whitelistSurvivesMultipleRecreations() {
        preferences.setPackageAllowed("com.persist.app", true)

        // First recreation
        val prefs1 = ChronosPreferences(context)
        assertTrue(prefs1.allowedPackages().contains("com.persist.app"))

        // Second recreation
        val prefs2 = ChronosPreferences(context)
        assertTrue(prefs2.allowedPackages().contains("com.persist.app"))

        // Third recreation
        val prefs3 = ChronosPreferences(context)
        assertTrue(prefs3.allowedPackages().contains("com.persist.app"))
    }

    @Test
    fun emptyWhitelistByDefault() {
        val freshPreferences = ChronosPreferences(context)
        assertTrue("Fresh preferences should have an empty whitelist", freshPreferences.allowedPackages().isEmpty())
    }
}
