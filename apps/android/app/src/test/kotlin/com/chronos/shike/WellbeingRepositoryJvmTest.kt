package com.chronos.shike

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.chronos.shike.load.LoadItem
import com.chronos.shike.load.LoadSourceType
import com.chronos.shike.load.LoadStatus
import com.chronos.shike.load.Negotiability
import com.chronos.shike.load.ResponsibilityType
import com.chronos.shike.recovery.DeLoadPlanner
import com.chronos.shike.wellbeing.BodyTag
import com.chronos.shike.wellbeing.DailyCheckIn
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.InterventionPreference
import com.chronos.shike.wellbeing.PressureLevel
import com.chronos.shike.wellbeing.storage.WellbeingDatabase
import com.chronos.shike.wellbeing.storage.WellbeingRepository
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.concurrent.Executor
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class WellbeingRepositoryJvmTest {
    private lateinit var database: WellbeingDatabase
    private lateinit var repository: WellbeingRepository
    private val now = Instant.parse("2026-07-15T12:00:00Z")

    @Before
    fun setUp() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val directExecutor = Executor { command -> command.run() }
        database = Room.inMemoryDatabaseBuilder(context, WellbeingDatabase::class.java)
            .allowMainThreadQueries()
            .setQueryExecutor(directExecutor)
            .setTransactionExecutor(directExecutor)
            .build()
        repository = WellbeingRepository(database)
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun `preference updates are not suppressed by operation idempotency`() = runBlocking {
        repository.saveInterventionPreference(InterventionPreference(nightModeStart = LocalTime.of(22, 30)))
        repository.saveInterventionPreference(InterventionPreference(nightModeStart = LocalTime.of(1, 15)))

        assertEquals(LocalTime.of(1, 15), repository.getInterventionPreference().nightModeStart)
        assertEquals(2, repository.observeOperations().first().count { it.type == "SAVE_PREFERENCE" })
    }

    @Test
    fun `deload confirmation is reversible and fixed items remain active`() = runBlocking {
        val fixed = item("fixed", Negotiability.FIXED, importance = 3)
        val flexible = item("flexible", Negotiability.FLEXIBLE, importance = 1)
        repository.addLoadItem(fixed)
        repository.addLoadItem(flexible)
        val plan = DeLoadPlanner().preview(listOf(fixed, flexible), LocalDate.of(2026, 7, 15), now)
        repository.createDeLoadPlan(plan)

        assertTrue(repository.confirmDeLoadPlan(plan.id))
        val applied = repository.observeLoadItems().first().associateBy { it.id }
        assertEquals(LoadStatus.ACTIVE, applied.getValue("fixed").status)
        assertEquals(LoadStatus.DEFERRED, applied.getValue("flexible").status)

        assertTrue(repository.undoDeLoadPlan(plan.id))
        assertTrue(repository.observeLoadItems().first().all { it.status == LoadStatus.ACTIVE })
        assertNull(repository.observeLatestDeLoadPlan().first())
    }

    @Test
    fun `create multiple deload plans keeps only the latest`() = runBlocking {
        val first = item("first", Negotiability.FIXED, importance = 3)
        val second = item("second", Negotiability.FLEXIBLE, importance = 1)
        repository.addLoadItem(first)
        repository.addLoadItem(second)
        val plan1 = DeLoadPlanner().preview(listOf(first), LocalDate.of(2026, 7, 15), now)
        val plan2 = DeLoadPlanner().preview(listOf(first, second), LocalDate.of(2026, 7, 15), now)
        repository.createDeLoadPlan(plan1)
        repository.createDeLoadPlan(plan2)

        val latest = repository.observeLatestDeLoadPlan().first()
        assertNotNull(latest)
        assertEquals(plan2.id, latest!!.id)
        assertTrue(latest.keepItemIds.contains("first"))
    }

    @Test
    fun `export redacts user text and journal stores no raw burden`() = runBlocking {
        val secret = "private-burden-24001"
        repository.addCheckIn(
            DailyCheckIn(
                id = "check-in",
                localDate = LocalDate.of(2026, 7, 15),
                energyLevel = EnergyLevel.LOW,
                pressureLevel = PressureLevel.HIGH,
                bodyTags = setOf(BodyTag.TIRED),
                optionalBurdenText = secret,
                createdAt = now,
                updatedAt = now,
            ),
        )
        repository.addLoadItem(item("load", Negotiability.FLEXIBLE, title = "private-title-24001"))

        val exported = repository.exportMasked()
        assertFalse(exported.contains(secret))
        assertFalse(exported.contains("private-title-24001"))
        assertTrue(exported.contains("masked"))
        assertTrue(repository.observeOperations().first().none { it.safePayload.contains(secret) })
    }

    private fun item(
        id: String,
        negotiability: Negotiability,
        importance: Int = 2,
        title: String = "test item",
    ) = LoadItem(
        id = id,
        sourceType = LoadSourceType.TASK,
        title = title,
        dueAt = null,
        estimatedEffortMinutes = 60,
        importance = importance,
        negotiability = negotiability,
        responsibilityType = ResponsibilityType.SELF_CHOSEN,
        waitingSince = null,
        status = LoadStatus.ACTIVE,
        createdAt = now,
    )
}
