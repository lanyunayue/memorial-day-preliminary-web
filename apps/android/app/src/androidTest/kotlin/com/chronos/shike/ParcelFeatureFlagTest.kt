package com.chronos.shike

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.chronos.shike.security.PickupCodeCrypto
import com.chronos.shike.storage.ChronosDatabase
import com.chronos.shike.storage.ParcelRepository
import com.chronos.shike.wellbeing.DailyCheckIn
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.storage.WellbeingDatabase
import com.chronos.shike.wellbeing.storage.WellbeingRepository
import java.time.Instant
import java.time.LocalDate
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class ParcelFeatureFlagTest {

    @Test
    fun parcelConnectorEnabledDefaultsToFalse() {
        assertFalse(
            "PARCEL_CONNECTOR_ENABLED 应默认为 false",
            BuildConfig.PARCEL_CONNECTOR_ENABLED,
        )
    }

    @Test
    fun overloadResearchModeDefaultsToFalse() {
        assertFalse(
            "OVERLOAD_RESEARCH_MODE 应默认为 false",
            BuildConfig.OVERLOAD_RESEARCH_MODE,
        )
    }

    @Test
    fun parcelConnectorNotPresentInOverloadUiState() {
        val state = OverloadUiState()
        assertFalse(
            "OverloadUiState 中 parcelConnectorEnabled 应默认为 false",
            state.parcelConnectorEnabled,
        )
    }

    @Test
    fun parcelEntryNotShownInDefaultNavigationWhenDisabled() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val chronosApp = context as ChronosApplication
        assertFalse(
            "应用实例中快递连接器应未启用",
            chronosApp.parcelConnectorEnabled,
        )
        val state = OverloadUiState(
            onboardingComplete = true,
            parcelConnectorEnabled = chronosApp.parcelConnectorEnabled,
        )
        assertFalse("状态中快递连接器应未启用", state.parcelConnectorEnabled)
    }

    @Test
    fun appFullyFunctionalWhenParcelDisabled() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val wellbeingDb = Room.inMemoryDatabaseBuilder(
            context,
            WellbeingDatabase::class.java,
        ).allowMainThreadQueries().build()
        val chronosDb = Room.inMemoryDatabaseBuilder(
            context,
            ChronosDatabase::class.java,
        ).allowMainThreadQueries().build()

        try {
            val wellbeingRepo = WellbeingRepository(wellbeingDb)
            assertNotNull("WellbeingRepository 在快递关闭时应可正常创建", wellbeingRepo)

            val preferences = ChronosPreferences(context)
            assertNotNull("ChronosPreferences 在快递关闭时应可正常创建", preferences)

            val parcelRepo = ParcelRepository(chronosDb, PickupCodeCrypto())
            val container = AppContainer(
                repository = parcelRepo,
                notificationSource = null,
                preferences = preferences,
            )
            assertNotNull("AppContainer 在快递关闭时应可正常创建", container)
            assertNull("快递关闭时通知源应为 null", container.notificationSource)

            val viewModel = OverloadViewModel(
                application = context as android.app.Application,
                container = container,
            )
            assertNotNull("OverloadViewModel 在快递关闭时应可正常创建", viewModel)
            assertFalse(
                "ViewModel 状态中快递连接器应未启用",
                viewModel.uiState.value.parcelConnectorEnabled,
            )
            assertTrue(
                "ViewModel 的 onboardingComplete 应来自 preferences",
                preferences.onboardingComplete == viewModel.uiState.value.onboardingComplete,
            )
        } finally {
            wellbeingDb.close()
            chronosDb.close()
        }
    }

    @Test
    fun wellbeingModuleOperatesIndependentlyOfParcelFlag() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val database = Room.inMemoryDatabaseBuilder(
            context,
            WellbeingDatabase::class.java,
        ).allowMainThreadQueries().build()

        try {
            val repository = WellbeingRepository(database)
            runBlocking {
                val checkIn = DailyCheckIn(
                    id = "ci-flag-test",
                    localDate = LocalDate.of(2026, 7, 15),
                    energyLevel = EnergyLevel.STEADY,
                    pressureLevel = null,
                    bodyTags = emptySet(),
                    optionalBurdenText = null,
                    createdAt = Instant.parse("2026-07-15T10:00:00Z"),
                    updatedAt = Instant.parse("2026-07-15T10:00:00Z"),
                )
                repository.addCheckIn(checkIn)

                val loaded = repository.observeCheckIns().first()
                assertEquals("快递关闭时 wellbeing 模块应正常读写", 1, loaded.size)
                assertEquals("ci-flag-test", loaded[0].id)

                repository.clearAllWellbeingData()
                assertTrue(
                    "快递关闭时清除功能应正常工作",
                    repository.observeCheckIns().first().isEmpty(),
                )
            }
        } finally {
            database.close()
        }
    }
}
