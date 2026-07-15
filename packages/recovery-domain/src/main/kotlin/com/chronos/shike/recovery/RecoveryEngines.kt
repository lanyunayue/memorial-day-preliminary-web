package com.chronos.shike.recovery

import com.chronos.shike.load.LoadAnalysis
import com.chronos.shike.load.LoadItem
import com.chronos.shike.load.Negotiability
import com.chronos.shike.wellbeing.BodyTag
import com.chronos.shike.wellbeing.DailyCheckIn
import com.chronos.shike.wellbeing.EnergyLevel
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class DeLoadPlanner {
    fun preview(items: List<LoadItem>, date: LocalDate, now: Instant): DeLoadPlan {
        val ordered = items.filter { it.status.name !in setOf("DONE", "CANCELLED") }
            .sortedWith(compareByDescending<LoadItem> { it.importance }.thenBy { it.dueAt })
        val keep = ordered.firstOrNull()?.let { listOf(it.id) }.orEmpty()
        val flexible = ordered.drop(1).filter { it.negotiability == Negotiability.FLEXIBLE }.map { it.id }
        val discussable = ordered.drop(1).filter { it.negotiability == Negotiability.DISCUSSABLE }.map { it.id }
        val lower = ordered.drop(1).filter { it.id !in flexible && it.id !in discussable }.take(2).map { it.id }
        return DeLoadPlan(UUID.randomUUID().toString(), date, keep, flexible, lower, discussable, emptyList(), true, false, null, null)
    }

    fun confirm(plan: DeLoadPlan, now: Instant): DeLoadPlan = plan.copy(
        userConfirmed = true, appliedAt = now, undoUntil = now.plus(Duration.ofMinutes(30)),
    )
}

class RecoveryRecommendationEngine {
    fun recommend(analysis: LoadAnalysis, checkIn: DailyCheckIn?, date: LocalDate, now: Instant): RecoverySuggestion {
        val urgentBodyTag = checkIn?.bodyTags?.any { it in setOf(BodyTag.CHEST_DISCOMFORT, BodyTag.BREATHING_DISCOMFORT, BodyTag.PALPITATIONS) } == true
        val action = when {
            urgentBodyTag -> RecoveryActionType.SEEK_MEDICAL_HELP
            checkIn?.energyLevel == EnergyLevel.VERY_LOW -> RecoveryActionType.SAVE_AND_STOP
            analysis.snapshot.estimatedEffortMinutes > analysis.snapshot.availableTimeMinutes -> RecoveryActionType.DEFER
            else -> RecoveryActionType.FIFTEEN_MINUTE_START
        }
        val rationale = when (action) {
            RecoveryActionType.SEEK_MEDICAL_HELP -> "你主动记录了明显身体不适；先暂停普通效率建议，症状持续、反复或严重时及时寻求医疗评估。"
            RecoveryActionType.SAVE_AND_STOP -> "你记录的精力很低，保存进度并结束今天是可撤销的低风险选择。"
            RecoveryActionType.DEFER -> "记录的预计耗时超过剩余可用时间，先预览可延期事项。"
            else -> "现有记录尚未显示需要整体降载，可以只选择一个十五分钟启动动作。"
        }
        return RecoverySuggestion(UUID.randomUUID().toString(), date, action, emptyList(), rationale, action != RecoveryActionType.SEEK_MEDICAL_HELP, analysis.explanation.confidenceBand, true, now, now.plus(Duration.ofHours(12)))
    }
}
