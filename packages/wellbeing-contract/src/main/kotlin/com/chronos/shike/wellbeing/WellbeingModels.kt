package com.chronos.shike.wellbeing

import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime

enum class EnergyLevel { VERY_LOW, LOW, STEADY, ENOUGH }
enum class PressureLevel { LOW, MEDIUM, HIGH, VERY_HIGH }
enum class BodyTag { OK, TIRED, HEADACHE, PALPITATIONS, CHEST_DISCOMFORT, STOMACH_DISCOMFORT, BODY_PAIN, BREATHING_DISCOMFORT, OTHER }

data class DailyCheckIn(
    val id: String,
    val localDate: LocalDate,
    val energyLevel: EnergyLevel?,
    val pressureLevel: PressureLevel?,
    val bodyTags: Set<BodyTag> = emptySet(),
    val optionalBurdenText: String? = null,
    val createdAt: Instant,
    val updatedAt: Instant,
    val source: String = "manual",
    val schemaVersion: Int = 1,
) {
    init {
        require(optionalBurdenText == null || optionalBurdenText.length <= 240)
        require(schemaVersion > 0)
    }
}

data class SleepLog(
    val id: String,
    val sleepDate: LocalDate,
    val approximateSleepStart: LocalTime,
    val approximateWakeTime: LocalTime,
    val estimatedDuration: Duration,
    val longAwakening: Boolean? = null,
    val feltRestored: Boolean? = null,
    val source: String = "manual",
    val confidence: String = "user_estimate",
    val createdAt: Instant,
    val updatedAt: Instant,
    val schemaVersion: Int = 1,
) {
    init {
        require(!estimatedDuration.isNegative && estimatedDuration <= Duration.ofHours(24))
        require(source == "manual")
        require(confidence == "user_estimate")
    }

    companion object {
        fun estimatedDuration(start: LocalTime, wake: LocalTime): Duration {
            val startMinutes = start.toSecondOfDay() / 60
            var wakeMinutes = wake.toSecondOfDay() / 60
            if (wakeMinutes < startMinutes) wakeMinutes += 24 * 60
            return Duration.ofMinutes((wakeMinutes - startMinutes).toLong())
        }
    }
}

data class SuggestionFeedback(
    val suggestionId: String,
    val decision: String,
    val modified: Boolean,
    val helpfulness: Int?,
    val nextDayEnergy: EnergyLevel?,
    val userComment: String?,
    val createdAt: Instant,
) {
    init {
        require(decision in setOf("accepted", "modified", "declined", "snoozed"))
        require(helpfulness == null || helpfulness in 1..5)
        require(userComment == null || userComment.length <= 240)
    }
}

data class InterventionPreference(
    val nightModeStart: LocalTime = LocalTime.of(23, 0),
    val nightModeEnd: LocalTime = LocalTime.of(6, 0),
    val nightModeEnabled: Boolean = true,
    val loadAnalysisEnabled: Boolean = true,
    val safetyExpressionAnalysisEnabled: Boolean = true,
    val suggestionFrequency: String = "normal",
    val consecutiveDeclines: Int = 0,
    val snoozedUntil: Instant? = null,
    val disabledSuggestionTypes: Set<String> = emptySet(),
) {
    init { require(consecutiveDeclines >= 0) }

    fun recordDecline(): InterventionPreference = copy(
        consecutiveDeclines = consecutiveDeclines + 1,
        suggestionFrequency = if (consecutiveDeclines + 1 >= 2) "reduced" else suggestionFrequency,
    )

    fun isNight(at: LocalTime): Boolean = nightModeEnabled && if (nightModeStart <= nightModeEnd) {
        at >= nightModeStart && at < nightModeEnd
    } else {
        at >= nightModeStart || at < nightModeEnd
    }
}
