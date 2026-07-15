package com.chronos.shike.load

import com.chronos.shike.wellbeing.BodyTag
import com.chronos.shike.wellbeing.DailyCheckIn
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.PressureLevel
import com.chronos.shike.wellbeing.SleepLog
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class LoadExplanationEngineTest {
    private val engine = LoadExplanationEngine()
    private val now = Instant.parse("2026-07-15T10:00:00Z")
    private val today = LocalDate.of(2026, 7, 15)

    private fun makeItem(
        id: String,
        sourceType: LoadSourceType = LoadSourceType.TASK,
        title: String = "测试任务",
        dueAt: Instant? = null,
        effort: Int = 30,
        importance: Int = 2,
        negotiability: Negotiability = Negotiability.FLEXIBLE,
        responsibility: ResponsibilityType = ResponsibilityType.SELF_CHOSEN,
        waitingSince: Instant? = null,
        status: LoadStatus = LoadStatus.ACTIVE,
    ): LoadItem = LoadItem(
        id = id,
        sourceType = sourceType,
        title = title,
        dueAt = dueAt,
        estimatedEffortMinutes = effort,
        importance = importance,
        negotiability = negotiability,
        responsibilityType = responsibility,
        waitingSince = waitingSince,
        status = status,
        createdAt = now.minusSeconds(3600),
    )

    @Test
    fun `empty input does not crash and returns data insufficient explanation`() {
        val result = engine.analyze(
            items = emptyList(),
            checkIn = null,
            sleepLog = null,
            availableTimeMinutes = 480,
            personalHistoryDays = 0,
            now = now,
            localDate = today,
        )
        assertEquals(0, result.snapshot.activeTaskCount)
        assertEquals(0, result.snapshot.overdueCount)
        assertEquals(0, result.snapshot.dueSoonCount)
        assertEquals("partial", result.snapshot.evidenceCompleteness)
        assertTrue(result.explanation.missingData.isNotEmpty(), "空输入应报告缺失数据")
        assertTrue(
            result.explanation.missingData.contains("今日状态签到"),
            "缺少签到时应报告",
        )
        assertTrue(
            result.explanation.missingData.contains("最近手动作息"),
            "缺少作息时应报告",
        )
        assertTrue(
            result.explanation.missingData.contains("至少七天个人历史"),
            "历史不足七天时应报告",
        )
    }

    @Test
    fun `correctly classifies load sources - self chosen, commitments, assigned, waiting`() {
        val items = listOf(
            makeItem("task-1", sourceType = LoadSourceType.TASK, responsibility = ResponsibilityType.SELF_CHOSEN, title = "自己选择的任务"),
            makeItem("commitment-1", sourceType = LoadSourceType.COMMITMENT, responsibility = ResponsibilityType.PROMISED_TO_OTHERS, title = "对他人的承诺"),
            makeItem("assigned-1", sourceType = LoadSourceType.TASK, responsibility = ResponsibilityType.ASSIGNED_BY_OTHERS, title = "被分配的任务"),
            makeItem("waiting-1", sourceType = LoadSourceType.WAITING_FOR, responsibility = ResponsibilityType.WAITING_ON_OTHERS, waitingSince = now.minusSeconds(7200), title = "等待他人回复"),
        )
        val result = engine.analyze(
            items = items,
            checkIn = null,
            sleepLog = null,
            availableTimeMinutes = 480,
            personalHistoryDays = 7,
            now = now,
            localDate = today,
        )
        assertEquals(4, result.snapshot.activeTaskCount)
        assertEquals(1, result.snapshot.commitmentCount, "应正确统计承诺数量")
        assertEquals(1, result.snapshot.waitingCount, "应正确统计等待数量")
        assertTrue(
            result.explanation.reasons.any { it.contains("承诺") },
            "原因中应提及承诺",
        )
        assertTrue(
            result.explanation.reasons.any { it.contains("等待") },
            "原因中应提及等待",
        )
    }

    @Test
    fun `waiting for items are counted and acknowledged in reasons`() {
        val items = listOf(
            makeItem("wait-1", sourceType = LoadSourceType.WAITING_FOR, waitingSince = now.minusSeconds(7200)),
            makeItem("wait-2", sourceType = LoadSourceType.WAITING_FOR, waitingSince = now.minusSeconds(3600)),
            makeItem("task-1", sourceType = LoadSourceType.TASK),
        )
        val result = engine.analyze(
            items = items,
            checkIn = null,
            sleepLog = null,
            availableTimeMinutes = 480,
            personalHistoryDays = 7,
            now = now,
            localDate = today,
        )
        assertEquals(2, result.snapshot.waitingCount, "应正确统计等待项数量")
        val waitingReason = result.explanation.reasons.find { it.contains("等待") }
        assertNotNull(waitingReason, "应包含等待相关原因")
        assertTrue(waitingReason.contains("2"), "原因中应包含等待项数量")
    }

    @Test
    fun `deadline approaching within 24 hours is detected`() {
        val items = listOf(
            makeItem("due-soon-1", dueAt = now.plus(Duration.ofHours(3)), title = "三小时后截止"),
            makeItem("due-soon-2", dueAt = now.plus(Duration.ofHours(20)), title = "二十小时后截止"),
            makeItem("due-later-1", dueAt = now.plus(Duration.ofHours(48)), title = "两天后截止"),
            makeItem("overdue-1", dueAt = now.minus(Duration.ofHours(2)), title = "已过期"),
        )
        val result = engine.analyze(
            items = items,
            checkIn = null,
            sleepLog = null,
            availableTimeMinutes = 480,
            personalHistoryDays = 7,
            now = now,
            localDate = today,
        )
        assertEquals(2, result.snapshot.dueSoonCount, "应检测到2项24小时内截止")
        assertEquals(1, result.snapshot.overdueCount, "应检测到1项已过期")
        assertTrue(
            result.explanation.reasons.any { it.contains("临近截止") },
            "原因中应提及临近截止",
        )
        assertTrue(
            result.explanation.reasons.any { it.contains("超过") && it.contains("截止时间") },
            "原因中应提及已过期",
        )
    }

    @Test
    fun `insufficient data shows cannot compare with personal baseline message`() {
        val result = engine.analyze(
            items = emptyList(),
            checkIn = null,
            sleepLog = null,
            availableTimeMinutes = 480,
            personalHistoryDays = 3,
            now = now,
            localDate = today,
        )
        assertTrue(
            result.explanation.userVisibleText.contains("目前记录不足，无法与个人常态比较"),
            "历史不足七天时应显示无法比较的说明",
        )
        assertEquals(null, result.snapshot.baselineComparison, "不足七天时不应有基线比较")
    }

    @Test
    fun `sufficient data enables baseline comparison without comparing to other users`() {
        val items = listOf(makeItem("task-1"))
        val checkIn = DailyCheckIn(
            id = "ci-1",
            localDate = today,
            energyLevel = EnergyLevel.STEADY,
            pressureLevel = PressureLevel.MEDIUM,
            bodyTags = setOf(BodyTag.OK),
            optionalBurdenText = null,
            createdAt = now,
            updatedAt = now,
        )
        val result = engine.analyze(
            items = items,
            checkIn = checkIn,
            sleepLog = null,
            availableTimeMinutes = 480,
            personalHistoryDays = 10,
            now = now,
            localDate = today,
        )
        assertNotNull(result.snapshot.baselineComparison, "足七天时应有基线比较")
        assertTrue(
            result.snapshot.baselineComparison.contains("个人常态"),
            "基线比较应基于个人常态",
        )
        assertFalse(
            result.explanation.userVisibleText.contains("目前记录不足，无法与个人常态比较"),
            "足七天时不应显示无法比较的说明",
        )
        assertFalse(
            result.explanation.userVisibleText.contains("其他用户") ||
                result.explanation.userVisibleText.contains("排名") ||
                result.explanation.userVisibleText.contains("平均值"),
            "不应与其他用户比较",
        )
        assertFalse(
            result.snapshot.baselineComparison.contains("其他用户") ||
                result.snapshot.baselineComparison.contains("排名"),
            "基线比较不应涉及其他用户",
        )
    }

    @Test
    fun `does not output a single pseudo-scientific score`() {
        val items = listOf(
            makeItem("task-1", effort = 120, importance = 3),
            makeItem("task-2", effort = 60, importance = 2),
        )
        val result = engine.analyze(
            items = items,
            checkIn = null,
            sleepLog = null,
            availableTimeMinutes = 240,
            personalHistoryDays = 7,
            now = now,
            localDate = today,
        )
        val visibleText = result.explanation.userVisibleText
        assertFalse(
            visibleText.contains("分数") || visibleText.contains("得分") || visibleText.contains("评分"),
            "不应输出单一分数",
        )
        assertFalse(
            visibleText.matches(Regex(".*\\d+(\\.\\d+)?分.*")),
            "不应输出数字分数",
        )
        assertTrue(
            result.explanation.confidenceBand in setOf("moderate", "limited"),
            "置信度应为描述性区间而非数字分数",
        )
        assertEquals("partial", result.snapshot.evidenceCompleteness)
    }

    @Test
    fun `effort exceeding available time is reported as a reason`() {
        val items = listOf(
            makeItem("task-1", effort = 300, importance = 3),
            makeItem("task-2", effort = 300, importance = 2),
        )
        val result = engine.analyze(
            items = items,
            checkIn = null,
            sleepLog = null,
            availableTimeMinutes = 240,
            personalHistoryDays = 7,
            now = now,
            localDate = today,
        )
        assertEquals(600, result.snapshot.estimatedEffortMinutes)
        assertTrue(
            result.explanation.reasons.any { it.contains("预计耗时超过") },
            "当预计耗时超过可用时间时应报告",
        )
    }

    @Test
    fun `done and cancelled items are excluded from active count`() {
        val items = listOf(
            makeItem("active-1", status = LoadStatus.ACTIVE),
            makeItem("done-1", status = LoadStatus.DONE),
            makeItem("cancelled-1", status = LoadStatus.CANCELLED),
            makeItem("deferred-1", status = LoadStatus.DEFERRED),
            makeItem("lowered-1", status = LoadStatus.LOWERED_STANDARD),
        )
        val result = engine.analyze(
            items = items,
            checkIn = null,
            sleepLog = null,
            availableTimeMinutes = 480,
            personalHistoryDays = 7,
            now = now,
            localDate = today,
        )
        assertEquals(3, result.snapshot.activeTaskCount, "ACTIVE、DEFERRED、LOWERED_STANDARD 应计入活跃")
    }
}
