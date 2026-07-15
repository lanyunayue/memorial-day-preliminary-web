package com.chronos.shike.recovery

import com.chronos.shike.load.LoadExplanationEngine
import com.chronos.shike.load.LoadItem
import com.chronos.shike.load.LoadSourceType
import com.chronos.shike.load.LoadStatus
import com.chronos.shike.load.Negotiability
import com.chronos.shike.load.ResponsibilityType
import com.chronos.shike.wellbeing.BodyTag
import com.chronos.shike.wellbeing.DailyCheckIn
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.InterventionPreference
import com.chronos.shike.wellbeing.PressureLevel
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class RecoveryEnginesTest {
    private val loadEngine = LoadExplanationEngine()
    private val recoveryEngine = RecoveryRecommendationEngine()
    private val deLoadPlanner = DeLoadPlanner()
    private val now = Instant.parse("2026-07-15T10:00:00Z")
    private val today = LocalDate.of(2026, 7, 15)

    private fun makeItem(
        id: String,
        sourceType: LoadSourceType = LoadSourceType.TASK,
        title: String = "测试任务",
        effort: Int = 30,
        importance: Int = 2,
        negotiability: Negotiability = Negotiability.FLEXIBLE,
        status: LoadStatus = LoadStatus.ACTIVE,
    ): LoadItem = LoadItem(
        id = id,
        sourceType = sourceType,
        title = title,
        dueAt = null,
        estimatedEffortMinutes = effort,
        importance = importance,
        negotiability = negotiability,
        responsibilityType = ResponsibilityType.SELF_CHOSEN,
        waitingSince = null,
        status = status,
        createdAt = now.minusSeconds(3600),
    )

    private fun makeAnalysis(
        items: List<LoadItem> = listOf(makeItem("t1")),
        checkIn: DailyCheckIn? = null,
        availableTime: Int = 480,
        historyDays: Int = 7,
    ) = loadEngine.analyze(items, checkIn, null, availableTime, historyDays, now, today)

    @Test
    fun `recommendation type is correct for normal overload`() {
        val analysis = makeAnalysis(
            items = listOf(makeItem("t1", effort = 60)),
            availableTime = 480,
        )
        val suggestion = recoveryEngine.recommend(analysis, null, today, now)
        assertEquals(RecoveryActionType.FIFTEEN_MINUTE_START, suggestion.actionType, "普通负荷应建议十五分钟启动")
    }

    @Test
    fun `recommendation type is defer when effort exceeds available time`() {
        val analysis = makeAnalysis(
            items = listOf(makeItem("t1", effort = 300), makeItem("t2", effort = 300)),
            availableTime = 240,
        )
        val suggestion = recoveryEngine.recommend(analysis, null, today, now)
        assertEquals(RecoveryActionType.DEFER, suggestion.actionType, "耗时超过可用时间应建议延期")
    }

    @Test
    fun `recommendation type is save and stop when energy is very low`() {
        val checkIn = DailyCheckIn(
            id = "ci-1",
            localDate = today,
            energyLevel = EnergyLevel.VERY_LOW,
            pressureLevel = null,
            bodyTags = emptySet(),
            optionalBurdenText = null,
            createdAt = now,
            updatedAt = now,
        )
        val analysis = makeAnalysis(checkIn = checkIn)
        val suggestion = recoveryEngine.recommend(analysis, checkIn, today, now)
        assertEquals(RecoveryActionType.SAVE_AND_STOP, suggestion.actionType, "精力很低时应建议保存并停止")
    }

    @Test
    fun `recommendation type is seek medical help when urgent body tag present`() {
        val checkIn = DailyCheckIn(
            id = "ci-1",
            localDate = today,
            energyLevel = EnergyLevel.STEADY,
            pressureLevel = null,
            bodyTags = setOf(BodyTag.CHEST_DISCOMFORT),
            optionalBurdenText = null,
            createdAt = now,
            updatedAt = now,
        )
        val analysis = makeAnalysis(checkIn = checkIn)
        val suggestion = recoveryEngine.recommend(analysis, checkIn, today, now)
        assertEquals(RecoveryActionType.SEEK_MEDICAL_HELP, suggestion.actionType, "胸部不适应建议寻求医疗帮助")
    }

    @Test
    fun `recommendation is explainable with rationale`() {
        val analysis = makeAnalysis()
        val suggestion = recoveryEngine.recommend(analysis, null, today, now)
        assertTrue(suggestion.rationale.isNotBlank(), "建议必须有可解释的依据")
        assertTrue(suggestion.rationale.length >= 10, "依据应足够详细")
    }

    @Test
    fun `recommendation is rejectable - requires confirmation for non-medical suggestions`() {
        val analysis = makeAnalysis()
        val suggestion = recoveryEngine.recommend(analysis, null, today, now)
        assertTrue(suggestion.requiresConfirmation, "非紧急建议应需要用户确认")
        assertTrue(suggestion.reversible, "非紧急建议应可撤销")
    }

    @Test
    fun `medical help suggestion does not require confirmation but is still reversible`() {
        val checkIn = DailyCheckIn(
            id = "ci-1",
            localDate = today,
            energyLevel = EnergyLevel.STEADY,
            pressureLevel = null,
            bodyTags = setOf(BodyTag.PALPITATIONS),
            optionalBurdenText = null,
            createdAt = now,
            updatedAt = now,
        )
        val analysis = makeAnalysis(checkIn = checkIn)
        val suggestion = recoveryEngine.recommend(analysis, checkIn, today, now)
        assertEquals(RecoveryActionType.SEEK_MEDICAL_HELP, suggestion.actionType)
        assertFalse(suggestion.requiresConfirmation, "医疗建议不应阻止用户继续使用")
    }

    @Test
    fun `consecutive declines reduce suggestion frequency`() {
        var pref = InterventionPreference()
        assertEquals("normal", pref.suggestionFrequency)
        assertEquals(0, pref.consecutiveDeclines)
        pref = pref.recordDecline()
        assertEquals(1, pref.consecutiveDeclines)
        assertEquals("normal", pref.suggestionFrequency, "第一次拒绝后频率不变")
        pref = pref.recordDecline()
        assertEquals(2, pref.consecutiveDeclines)
        assertEquals("reduced", pref.suggestionFrequency, "连续两次拒绝后应降低频率")
        pref = pref.recordDecline()
        assertEquals(3, pref.consecutiveDeclines)
        assertEquals("reduced", pref.suggestionFrequency, "降低后保持降低")
    }

    @Test
    fun `deload plan undo window is exactly 30 minutes`() {
        val items = listOf(
            makeItem("t1", importance = 3),
            makeItem("t2", importance = 2, negotiability = Negotiability.FLEXIBLE),
            makeItem("t3", importance = 1, negotiability = Negotiability.DISCUSSABLE),
        )
        val plan = deLoadPlanner.preview(items, today, now)
        assertFalse(plan.userConfirmed, "预览方案不应已确认")
        val confirmed = deLoadPlanner.confirm(plan, now)
        assertTrue(confirmed.userConfirmed, "确认后应为已确认状态")
        assertNotNull(confirmed.appliedAt, "确认后应有应用时间")
        assertNotNull(confirmed.undoUntil, "确认后应有撤销截止时间")
        val undoWindow = Duration.between(confirmed.appliedAt, confirmed.undoUntil)
        assertEquals(30, undoWindow.toMinutes(), "撤销窗口应为30分钟")
    }

    @Test
    fun `expired suggestion is not executed`() {
        val analysis = makeAnalysis()
        val suggestion = recoveryEngine.recommend(analysis, null, today, now)
        val expiredTime = now.plus(Duration.ofHours(13))
        assertTrue(suggestion.expiresAt.isAfter(now), "创建时建议应未过期")
        assertTrue(
            suggestion.expiresAt.isBefore(expiredTime),
            "建议应在12小时后过期",
        )
        val expiryDuration = Duration.between(suggestion.createdAt, suggestion.expiresAt)
        assertEquals(12, expiryDuration.toHours(), "建议有效期应为12小时")
    }

    @Test
    fun `engine does not recommend contacting trusted person automatically`() {
        val analysis = makeAnalysis()
        val suggestion = recoveryEngine.recommend(analysis, null, today, now)
        assertFalse(
            suggestion.actionType == RecoveryActionType.CONTACT_TRUSTED_PERSON,
            "引擎不应自动建议联系他人",
        )
        assertTrue(
            suggestion.affectedItemIds.isEmpty(),
            "建议不应自动影响外部事项",
        )
    }

    @Test
    fun `engine does not recommend calendar modification or external actions`() {
        val analysis = makeAnalysis(
            items = listOf(makeItem("t1", effort = 300), makeItem("t2", effort = 300)),
            availableTime = 240,
        )
        val suggestion = recoveryEngine.recommend(analysis, null, today, now)
        assertFalse(
            suggestion.actionType == RecoveryActionType.CONTACT_TRUSTED_PERSON,
            "不应自动联系他人",
        )
        assertEquals(RecoveryActionType.DEFER, suggestion.actionType)
        assertTrue(suggestion.affectedItemIds.isEmpty(), "建议本身不应直接修改外部日历或事项")
    }

    @Test
    fun `deload plan preview keeps highest importance item`() {
        val items = listOf(
            makeItem("flex", importance = 1, negotiability = Negotiability.FLEXIBLE),
            makeItem("discuss", importance = 2, negotiability = Negotiability.DISCUSSABLE),
            makeItem("fixed", importance = 1, negotiability = Negotiability.FIXED),
            makeItem("high", importance = 3, negotiability = Negotiability.FIXED),
        )
        val plan = deLoadPlanner.preview(items, today, now)
        assertEquals(1, plan.keepItemIds.size, "应保留一项")
        assertEquals("high", plan.keepItemIds.first(), "应保留最高重要性的任务")
        assertTrue(plan.deferItemIds.contains("flex"), "灵活事项应进入延期列表")
        assertTrue(plan.renegotiateItemIds.contains("discuss"), "可协商事项应进入重新协商列表")
        assertTrue(plan.cancelItemIds.contains("fixed"), "固定事项应进入取消列表")
    }

    @Test
    fun `deload plan excludes done and cancelled items`() {
        val items = listOf(
            makeItem("active-1", importance = 3, status = LoadStatus.ACTIVE),
            makeItem("done-1", importance = 3, status = LoadStatus.DONE),
            makeItem("cancelled-1", importance = 3, status = LoadStatus.CANCELLED),
        )
        val plan = deLoadPlanner.preview(items, today, now)
        val allIds = plan.keepItemIds + plan.deferItemIds + plan.lowerStandardItemIds + plan.renegotiateItemIds + plan.cancelItemIds
        assertFalse(allIds.contains("done-1"), "已完成事项不应出现在方案中")
        assertFalse(allIds.contains("cancelled-1"), "已取消事项不应出现在方案中")
        assertTrue(allIds.contains("active-1"), "活跃事项应出现在方案中")
    }
}
