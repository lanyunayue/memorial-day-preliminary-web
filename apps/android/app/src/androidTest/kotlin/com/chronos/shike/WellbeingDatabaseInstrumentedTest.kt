package com.chronos.shike

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.chronos.shike.load.LoadItem
import com.chronos.shike.load.LoadSourceType
import com.chronos.shike.load.LoadStatus
import com.chronos.shike.load.Negotiability
import com.chronos.shike.load.ResponsibilityType
import com.chronos.shike.recovery.DeLoadPlan
import com.chronos.shike.util.CryptoUtils
import com.chronos.shike.wellbeing.BodyTag
import com.chronos.shike.wellbeing.DailyCheckIn
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.InterventionPreference
import com.chronos.shike.wellbeing.PressureLevel
import com.chronos.shike.wellbeing.SleepLog
import com.chronos.shike.wellbeing.storage.WellbeingDatabase
import com.chronos.shike.wellbeing.storage.WellbeingRepository
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
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

@RunWith(AndroidJUnit4::class)
class WellbeingDatabaseInstrumentedTest {
    private lateinit var context: Context
    private lateinit var database: WellbeingDatabase
    private lateinit var repository: WellbeingRepository
    private val now = Instant.parse("2026-07-15T10:00:00Z")
    private val today = LocalDate.of(2026, 7, 15)

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        database = Room.inMemoryDatabaseBuilder(
            context,
            WellbeingDatabase::class.java,
        ).allowMainThreadQueries().build()
        repository = WellbeingRepository(database)
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun checkInWriteAndReadRoundTrip() = runBlocking {
        val checkIn = DailyCheckIn(
            id = "ci-test-1",
            localDate = today,
            energyLevel = EnergyLevel.LOW,
            pressureLevel = PressureLevel.HIGH,
            bodyTags = setOf(BodyTag.TIRED, BodyTag.HEADACHE),
            optionalBurdenText = "今天事情太多了",
            createdAt = now,
            updatedAt = now,
        )
        repository.addCheckIn(checkIn)

        val loaded = repository.observeCheckIns().first()
        assertEquals(1, loaded.size)
        val retrieved = loaded[0]
        assertEquals("ci-test-1", retrieved.id)
        assertEquals(today, retrieved.localDate)
        assertEquals(EnergyLevel.LOW, retrieved.energyLevel)
        assertEquals(PressureLevel.HIGH, retrieved.pressureLevel)
        assertTrue(retrieved.bodyTags.contains(BodyTag.TIRED))
        assertTrue(retrieved.bodyTags.contains(BodyTag.HEADACHE))
        assertEquals("今天事情太多了", retrieved.optionalBurdenText)
        assertEquals(1, retrieved.schemaVersion)
    }

    @Test
    fun checkInWithNullFieldsPersistsCorrectly() = runBlocking {
        val checkIn = DailyCheckIn(
            id = "ci-null-1",
            localDate = today,
            energyLevel = null,
            pressureLevel = null,
            bodyTags = emptySet(),
            optionalBurdenText = null,
            createdAt = now,
            updatedAt = now,
        )
        repository.addCheckIn(checkIn)

        val loaded = repository.observeCheckIns().first()
        assertEquals(1, loaded.size)
        assertNull(loaded[0].energyLevel)
        assertNull(loaded[0].pressureLevel)
        assertTrue(loaded[0].bodyTags.isEmpty())
        assertNull(loaded[0].optionalBurdenText)
    }

    @Test
    fun sleepLogWriteAndReadRoundTrip() = runBlocking {
        val sleepLog = SleepLog(
            id = "sl-test-1",
            sleepDate = today.minusDays(1),
            approximateSleepStart = LocalTime.of(23, 30),
            approximateWakeTime = LocalTime.of(6, 45),
            estimatedDuration = SleepLog.estimatedDuration(LocalTime.of(23, 30), LocalTime.of(6, 45)),
            longAwakening = true,
            feltRestored = false,
            createdAt = now,
            updatedAt = now,
        )
        repository.addSleepLog(sleepLog)

        val loaded = repository.observeSleepLogs().first()
        assertEquals(1, loaded.size)
        val retrieved = loaded[0]
        assertEquals("sl-test-1", retrieved.id)
        assertEquals(today.minusDays(1), retrieved.sleepDate)
        assertEquals(LocalTime.of(23, 30), retrieved.approximateSleepStart)
        assertEquals(LocalTime.of(6, 45), retrieved.approximateWakeTime)
        assertEquals(435, retrieved.estimatedDuration.toMinutes())
        assertEquals(true, retrieved.longAwakening)
        assertEquals(false, retrieved.feltRestored)
        assertEquals(1, retrieved.schemaVersion)
    }

    @Test
    fun loadItemWriteAndQueryRoundTrip() = runBlocking {
        val item = LoadItem(
            id = "li-test-1",
            sourceType = LoadSourceType.COMMITMENT,
            title = "测试承诺事项",
            dueAt = now.plusSeconds(86400),
            estimatedEffortMinutes = 90,
            importance = 3,
            negotiability = Negotiability.DISCUSSABLE,
            responsibilityType = ResponsibilityType.PROMISED_TO_OTHERS,
            waitingSince = null,
            status = LoadStatus.ACTIVE,
            createdAt = now,
        )
        repository.addLoadItem(item)

        val loaded = repository.observeLoadItems().first()
        assertEquals(1, loaded.size)
        val retrieved = loaded[0]
        assertEquals("li-test-1", retrieved.id)
        assertEquals(LoadSourceType.COMMITMENT, retrieved.sourceType)
        assertEquals("测试承诺事项", retrieved.title)
        assertEquals(90, retrieved.estimatedEffortMinutes)
        assertEquals(3, retrieved.importance)
        assertEquals(Negotiability.DISCUSSABLE, retrieved.negotiability)
        assertEquals(ResponsibilityType.PROMISED_TO_OTHERS, retrieved.responsibilityType)
        assertEquals(LoadStatus.ACTIVE, retrieved.status)
    }

    @Test
    fun waitingForItemWithWaitingSincePersistsCorrectly() = runBlocking {
        val item = LoadItem(
            id = "li-waiting-1",
            sourceType = LoadSourceType.WAITING_FOR,
            title = "等待回复",
            dueAt = null,
            estimatedEffortMinutes = 0,
            importance = 1,
            negotiability = Negotiability.FIXED,
            responsibilityType = ResponsibilityType.WAITING_ON_OTHERS,
            waitingSince = now.minusSeconds(7200),
            status = LoadStatus.ACTIVE,
            createdAt = now.minusSeconds(7200),
        )
        repository.addLoadItem(item)

        val loaded = repository.observeLoadItems().first()
        assertEquals(1, loaded.size)
        assertNotNull(loaded[0].waitingSince)
        assertEquals(now.minusSeconds(7200), loaded[0].waitingSince)
    }

    @Test
    fun operationJournalRecoveryCompletesPendingOperations() = runBlocking {
        val checkIn = DailyCheckIn(
            id = "ci-op-1",
            localDate = today,
            energyLevel = EnergyLevel.STEADY,
            pressureLevel = null,
            bodyTags = emptySet(),
            optionalBurdenText = null,
            createdAt = now,
            updatedAt = now,
        )
        repository.addCheckIn(checkIn)
        repository.addSleepLog(
            SleepLog(
                id = "sl-op-1",
                sleepDate = today,
                approximateSleepStart = LocalTime.of(23, 0),
                approximateWakeTime = LocalTime.of(7, 0),
                estimatedDuration = SleepLog.estimatedDuration(LocalTime.of(23, 0), LocalTime.of(7, 0)),
                createdAt = now,
                updatedAt = now,
            )
        )

        val report = repository.recoverPendingOperations()
        assertEquals("已完成的操作不应有 pending 项", 0, report.totalPending)
        assertEquals("恢复不应有失败项", 0, report.quarantined)
    }

    @Test
    fun deleteAllDataLeavesNoResidue() = runBlocking {
        repository.addCheckIn(
            DailyCheckIn(
                id = "ci-del-1",
                localDate = today,
                energyLevel = EnergyLevel.LOW,
                pressureLevel = null,
                bodyTags = setOf(BodyTag.TIRED),
                optionalBurdenText = null,
                createdAt = now,
                updatedAt = now,
            )
        )
        repository.addSleepLog(
            SleepLog(
                id = "sl-del-1",
                sleepDate = today,
                approximateSleepStart = LocalTime.of(23, 0),
                approximateWakeTime = LocalTime.of(7, 0),
                estimatedDuration = SleepLog.estimatedDuration(LocalTime.of(23, 0), LocalTime.of(7, 0)),
                createdAt = now,
                updatedAt = now,
            )
        )
        repository.addLoadItem(
            LoadItem(
                id = "li-del-1",
                sourceType = LoadSourceType.TASK,
                title = "待删除任务",
                dueAt = null,
                estimatedEffortMinutes = 30,
                importance = 2,
                negotiability = Negotiability.FLEXIBLE,
                responsibilityType = ResponsibilityType.SELF_CHOSEN,
                waitingSince = null,
                status = LoadStatus.ACTIVE,
                createdAt = now,
            )
        )

        repository.clearAllWellbeingData()

        assertTrue("签到应全部清除", repository.observeCheckIns().first().isEmpty())
        assertTrue("作息记录应全部清除", repository.observeSleepLogs().first().isEmpty())
        assertTrue("负荷项应全部清除", repository.observeLoadItems().first().isEmpty())
        assertNull("快照应全部清除", repository.observeLatestSnapshot().first())
        assertNull("降载方案应全部清除", repository.observeLatestDeLoadPlan().first())
    }

    @Test
    fun operationJournalHashIsSha256AndDoesNotContainRawPayload() = runBlocking {
        val checkIn = DailyCheckIn(
            id = "ci-hash-1",
            localDate = today,
            energyLevel = EnergyLevel.STEADY,
            pressureLevel = null,
            bodyTags = emptySet(),
            optionalBurdenText = "敏感的负担文本内容",
            createdAt = now,
            updatedAt = now,
        )
        repository.addCheckIn(checkIn)

        val operations = repository.observeOperations().first()
        assertTrue("应有操作记录", operations.isNotEmpty())
        val op = operations.first()
        assertEquals("hash 应为 SHA-256（64 位十六进制字符）", 64, op.safePayloadHash.length)
        assertTrue(
            "hash 应为有效的 SHA-256 十六进制字符串",
            op.safePayloadHash.matches(Regex("[0-9a-f]{64}")),
        )
        assertFalse(
            "安全负载不应包含敏感用户文本",
            op.safePayload.contains("敏感的负担文本内容"),
        )
        val expectedHash = CryptoUtils.sha256(op.safePayload)
        assertEquals("hash 应与安全负载的 SHA-256 一致", expectedHash, op.safePayloadHash)
    }

    @Test
    fun deLoadPlanConfirmAndUndoWorkflow() = runBlocking {
        val plan = DeLoadPlan(
            id = "plan-1",
            localDate = today,
            keepItemIds = listOf("keep-1"),
            deferItemIds = listOf("defer-1"),
            lowerStandardItemIds = listOf("lower-1"),
            renegotiateItemIds = emptyList(),
            cancelItemIds = emptyList(),
            saveAndStop = false,
            userConfirmed = false,
            appliedAt = null,
            undoUntil = null,
        )
        repository.createDeLoadPlan(plan)

        val beforeConfirm = repository.observeLatestDeLoadPlan().first()
        assertNotNull(beforeConfirm)
        assertFalse("确认前应为未确认状态", beforeConfirm!!.userConfirmed)
        assertNull("确认前不应有应用时间", beforeConfirm!!.appliedAt)
        assertNull("确认前不应有撤销截止时间", beforeConfirm!!.undoUntil)

        val confirmResult = repository.confirmDeLoadPlan("plan-1")
        assertTrue("确认应成功", confirmResult)

        val afterConfirm = repository.observeLatestDeLoadPlan().first()
        assertNotNull(afterConfirm)
        assertTrue("确认后应为已确认状态", afterConfirm!!.userConfirmed)
        assertNotNull("确认后应有应用时间", afterConfirm!!.appliedAt)
        assertNotNull("确认后应有撤销截止时间", afterConfirm!!.undoUntil)
        val undoWindow = Duration.between(afterConfirm!!.appliedAt!!, afterConfirm!!.undoUntil!!)
        assertEquals("撤销窗口应为 30 分钟", 30, undoWindow.toMinutes())

        val undoResult = repository.undoDeLoadPlan("plan-1")
        assertTrue("撤销应成功", undoResult)
        assertNull("撤销后方案应被清除", repository.observeLatestDeLoadPlan().first())
    }

    @Test
    fun deLoadPlanUndoFailsAfterUndoWindowExpires() = runBlocking {
        val plan = DeLoadPlan(
            id = "plan-expired-1",
            localDate = today,
            keepItemIds = listOf("keep-1"),
            deferItemIds = listOf("defer-1"),
            lowerStandardItemIds = emptyList(),
            renegotiateItemIds = emptyList(),
            cancelItemIds = emptyList(),
            saveAndStop = false,
            userConfirmed = false,
            appliedAt = null,
            undoUntil = null,
        )
        repository.createDeLoadPlan(plan)
        repository.confirmDeLoadPlan("plan-expired-1")

        val entity = database.deLoadPlanDao().findLatest()
        assertNotNull("确认后应能查到方案实体", entity)
        val expiredUndoTime = System.currentTimeMillis() - 1
        database.deLoadPlanDao().insert(
            entity!!.copy(undoUntilEpochMs = expiredUndoTime)
        )

        val undoResult = repository.undoDeLoadPlan("plan-expired-1")
        assertFalse("过期后撤销应失败", undoResult)
    }

    @Test
    fun multipleCheckInsForDifferentDatesPersistIndependently() = runBlocking {
        val dates = listOf(today, today.minusDays(1), today.minusDays(2))
        dates.forEachIndexed { index, date ->
            repository.addCheckIn(
                DailyCheckIn(
                    id = "ci-multi-$index",
                    localDate = date,
                    energyLevel = EnergyLevel.STEADY,
                    pressureLevel = PressureLevel.LOW,
                    bodyTags = emptySet(),
                    optionalBurdenText = null,
                    createdAt = now.minusSeconds(index.toLong() * 86400),
                    updatedAt = now.minusSeconds(index.toLong() * 86400),
                )
            )
        }

        val loaded = repository.observeCheckIns().first()
        assertEquals("三条不同日期的签到应独立保存", 3, loaded.size)
        assertTrue(loaded.map { it.localDate }.containsAll(dates))
    }

    @Test
    fun interventionPreferenceSaveAndLoad() = runBlocking {
        val pref = InterventionPreference(
            nightModeStart = LocalTime.of(22, 0),
            nightModeEnd = LocalTime.of(7, 0),
            nightModeEnabled = true,
            loadAnalysisEnabled = true,
            safetyExpressionAnalysisEnabled = false,
            suggestionFrequency = "reduced",
            consecutiveDeclines = 2,
        )
        repository.saveInterventionPreference(pref)

        val loaded = repository.getInterventionPreference()
        assertEquals(LocalTime.of(22, 0), loaded.nightModeStart)
        assertEquals(LocalTime.of(7, 0), loaded.nightModeEnd)
        assertTrue(loaded.nightModeEnabled)
        assertTrue(loaded.loadAnalysisEnabled)
        assertFalse(loaded.safetyExpressionAnalysisEnabled)
        assertEquals("reduced", loaded.suggestionFrequency)
        assertEquals(2, loaded.consecutiveDeclines)
    }
}
