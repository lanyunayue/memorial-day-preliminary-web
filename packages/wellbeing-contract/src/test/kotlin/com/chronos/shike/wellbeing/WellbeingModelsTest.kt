package com.chronos.shike.wellbeing

import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class WellbeingModelsTest {
    private val now = Instant.parse("2026-07-15T10:00:00Z")
    private val today = LocalDate.of(2026, 7, 15)

    @Test
    fun `daily check-in with all fields optional does not crash`() {
        val checkIn = DailyCheckIn(
            id = "ci-1",
            localDate = today,
            energyLevel = null,
            pressureLevel = null,
            bodyTags = emptySet(),
            optionalBurdenText = null,
            createdAt = now,
            updatedAt = now,
        )
        assertNull(checkIn.energyLevel)
        assertNull(checkIn.pressureLevel)
        assertTrue(checkIn.bodyTags.isEmpty())
        assertNull(checkIn.optionalBurdenText)
        assertEquals("manual", checkIn.source)
    }

    @Test
    fun `daily check-in with skipped energy and pressure fields persists correctly`() {
        val checkIn = DailyCheckIn(
            id = "ci-2",
            localDate = today,
            energyLevel = null,
            pressureLevel = PressureLevel.HIGH,
            bodyTags = setOf(BodyTag.TIRED),
            optionalBurdenText = "有点累",
            createdAt = now,
            updatedAt = now,
        )
        assertNull(checkIn.energyLevel, "精力字段可跳过")
        assertEquals(PressureLevel.HIGH, checkIn.pressureLevel)
        assertTrue(checkIn.bodyTags.contains(BodyTag.TIRED))
        assertEquals("有点累", checkIn.optionalBurdenText)
    }

    @Test
    fun `daily check-in schema version is correct`() {
        val checkIn = DailyCheckIn(
            id = "ci-3",
            localDate = today,
            energyLevel = EnergyLevel.STEADY,
            pressureLevel = PressureLevel.LOW,
            bodyTags = emptySet(),
            optionalBurdenText = null,
            createdAt = now,
            updatedAt = now,
        )
        assertEquals(1, checkIn.schemaVersion, "签到 schemaVersion 应为 1")
    }

    @Test
    fun `sleep log with all optional fields skipped does not crash`() {
        val sleepLog = SleepLog(
            id = "sl-1",
            sleepDate = today,
            approximateSleepStart = LocalTime.of(23, 0),
            approximateWakeTime = LocalTime.of(7, 0),
            estimatedDuration = SleepLog.estimatedDuration(LocalTime.of(23, 0), LocalTime.of(7, 0)),
            longAwakening = null,
            feltRestored = null,
            createdAt = now,
            updatedAt = now,
        )
        assertNull(sleepLog.longAwakening, "夜间醒来字段可跳过")
        assertNull(sleepLog.feltRestored, "是否恢复字段可跳过")
        assertEquals("manual", sleepLog.source)
        assertEquals("user_estimate", sleepLog.confidence)
    }

    @Test
    fun `sleep log schema version is correct`() {
        val sleepLog = SleepLog(
            id = "sl-2",
            sleepDate = today,
            approximateSleepStart = LocalTime.of(23, 30),
            approximateWakeTime = LocalTime.of(6, 30),
            estimatedDuration = SleepLog.estimatedDuration(LocalTime.of(23, 30), LocalTime.of(6, 30)),
            longAwakening = false,
            feltRestored = true,
            createdAt = now,
            updatedAt = now,
        )
        assertEquals(1, sleepLog.schemaVersion, "作息记录 schemaVersion 应为 1")
    }

    @Test
    fun `body tags do not auto-interpret as psychological issues`() {
        val physicalTags = setOf(
            BodyTag.HEADACHE,
            BodyTag.CHEST_DISCOMFORT,
            BodyTag.STOMACH_DISCOMFORT,
            BodyTag.BODY_PAIN,
            BodyTag.BREATHING_DISCOMFORT,
            BodyTag.PALPITATIONS,
        )
        val checkIn = DailyCheckIn(
            id = "ci-body",
            localDate = today,
            energyLevel = EnergyLevel.STEADY,
            pressureLevel = null,
            bodyTags = physicalTags,
            optionalBurdenText = null,
            createdAt = now,
            updatedAt = now,
        )
        assertEquals(6, checkIn.bodyTags.size)
        checkIn.bodyTags.forEach { tag ->
            val tagName = tag.name
            assertFalse(
                tagName.contains("DEPRESSION") || tagName.contains("ANXIETY") || tagName.contains("MENTAL"),
                "身体标签不应包含心理诊断词汇: $tagName",
            )
        }
        assertTrue(checkIn.bodyTags.all { it is BodyTag }, "身体标签应为纯身体描述")
    }

    @Test
    fun `body tags are discrete labels not psychological scores`() {
        val checkIn = DailyCheckIn(
            id = "ci-tags",
            localDate = today,
            energyLevel = null,
            pressureLevel = null,
            bodyTags = setOf(BodyTag.TIRED, BodyTag.HEADACHE),
            optionalBurdenText = null,
            createdAt = now,
            updatedAt = now,
        )
        assertEquals(2, checkIn.bodyTags.size)
        assertTrue(checkIn.bodyTags.contains(BodyTag.TIRED))
        assertTrue(checkIn.bodyTags.contains(BodyTag.HEADACHE))
        assertFalse(checkIn.bodyTags.contains(BodyTag.OK), "不应自动添加 OK 标签")
    }

    @Test
    fun `burden text length is limited to 240 characters`() {
        val longText = "a".repeat(240)
        val checkIn = DailyCheckIn(
            id = "ci-long",
            localDate = today,
            energyLevel = null,
            pressureLevel = null,
            bodyTags = emptySet(),
            optionalBurdenText = longText,
            createdAt = now,
            updatedAt = now,
        )
        assertEquals(240, checkIn.optionalBurdenText!!.length)
    }

    @Test
    fun `burden text exceeding 240 characters is rejected`() {
        val tooLong = "a".repeat(241)
        var threwException = false
        try {
            DailyCheckIn(
                id = "ci-reject",
                localDate = today,
                energyLevel = null,
                pressureLevel = null,
                bodyTags = emptySet(),
                optionalBurdenText = tooLong,
                createdAt = now,
                updatedAt = now,
            )
        } catch (e: IllegalArgumentException) {
            threwException = true
        }
        assertTrue(threwException, "超过240字的负担文本应被拒绝")
    }

    @Test
    fun `sleep duration calculation handles overnight correctly`() {
        val duration = SleepLog.estimatedDuration(LocalTime.of(23, 0), LocalTime.of(7, 0))
        assertEquals(8, duration.toHours(), "23:00到07:00应为8小时")
        assertEquals(480, duration.toMinutes())
    }

    @Test
    fun `sleep duration calculation handles same-day correctly`() {
        val duration = SleepLog.estimatedDuration(LocalTime.of(0, 0), LocalTime.of(6, 30))
        assertEquals(390, duration.toMinutes(), "00:00到06:30应为390分钟")
    }

    @Test
    fun `sleep duration rejects negative or excessive values`() {
        var threwException = false
        try {
            SleepLog(
                id = "sl-neg",
                sleepDate = today,
                approximateSleepStart = LocalTime.of(23, 0),
                approximateWakeTime = LocalTime.of(7, 0),
                estimatedDuration = Duration.ofHours(25),
                createdAt = now,
                updatedAt = now,
            )
        } catch (e: IllegalArgumentException) {
            threwException = true
        }
        assertTrue(threwException, "超过24小时的睡眠时长应被拒绝")
    }

    @Test
    fun `suggestion feedback accepts valid decisions`() {
        val validDecisions = listOf("accepted", "modified", "declined", "snoozed")
        validDecisions.forEach { decision ->
            val feedback = SuggestionFeedback(
                suggestionId = "sug-1",
                decision = decision,
                modified = false,
                helpfulness = null,
                nextDayEnergy = null,
                userComment = null,
                createdAt = now,
            )
            assertEquals(decision, feedback.decision)
        }
    }

    @Test
    fun `intervention preference has safe defaults`() {
        val pref = InterventionPreference()
        assertEquals(LocalTime.of(23, 0), pref.nightModeStart)
        assertEquals(LocalTime.of(6, 0), pref.nightModeEnd)
        assertTrue(pref.nightModeEnabled)
        assertTrue(pref.loadAnalysisEnabled)
        assertTrue(pref.safetyExpressionAnalysisEnabled)
        assertEquals("normal", pref.suggestionFrequency)
        assertEquals(0, pref.consecutiveDeclines)
    }

    @Test
    fun `intervention preference night mode detection works across midnight`() {
        val pref = InterventionPreference()
        assertTrue(pref.isNight(LocalTime.of(23, 30)), "23:30 应为深夜")
        assertTrue(pref.isNight(LocalTime.of(2, 0)), "02:00 应为深夜")
        assertFalse(pref.isNight(LocalTime.of(10, 0)), "10:00 不应为深夜")
        assertFalse(pref.isNight(LocalTime.of(18, 0)), "18:00 不应为深夜")
    }
}
