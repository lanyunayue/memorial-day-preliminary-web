package com.chronos.shike.wellbeing.storage

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "wellbeing_daily_checkins",
    indices = [Index("localDate"), Index("createdAt")],
)
data class DailyCheckInEntity(
    @PrimaryKey val id: String,
    val localDate: String,
    val energyLevel: String?,
    val pressureLevel: String?,
    val bodyTags: String,
    val optionalBurdenText: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val source: String,
    val schemaVersion: Int,
)

@Entity(
    tableName = "wellbeing_sleep_logs",
    indices = [Index("sleepDate")],
)
data class SleepLogEntity(
    @PrimaryKey val id: String,
    val sleepDate: String,
    val approximateSleepStart: String,
    val approximateWakeTime: String,
    val estimatedDurationMinutes: Long,
    val longAwakening: Boolean?,
    val feltRestored: Boolean?,
    val source: String,
    val confidence: String,
    val createdAt: Long,
    val updatedAt: Long,
    val schemaVersion: Int,
)

@Entity(
    tableName = "wellbeing_load_items",
    indices = [Index("status"), Index("dueAtEpochMs")],
)
data class LoadItemEntity(
    @PrimaryKey val id: String,
    val sourceType: String,
    val title: String,
    val dueAtEpochMs: Long?,
    val estimatedEffortMinutes: Int,
    val importance: Int,
    val negotiability: String,
    val responsibilityType: String,
    val waitingSinceEpochMs: Long?,
    val status: String,
    val createdAt: Long,
    val schemaVersion: Int,
)

@Entity(
    tableName = "wellbeing_load_snapshots",
    indices = [Index("localDate")],
)
data class LoadSnapshotEntity(
    @PrimaryKey val id: String,
    val localDate: String,
    val activeTaskCount: Int,
    val dueSoonCount: Int,
    val overdueCount: Int,
    val commitmentCount: Int,
    val waitingCount: Int,
    val estimatedEffortMinutes: Int,
    val availableTimeMinutes: Int,
    val recoveryWindowMinutes: Int,
    val baselineComparison: String?,
    val evidenceCompleteness: String,
    val createdAt: Long,
    val schemaVersion: Int,
)

@Entity(
    tableName = "wellbeing_operation_journal",
    indices = [Index(value = ["idempotencyKey"], unique = true)],
)
data class WellbeingOperationEntity(
    @PrimaryKey val id: String,
    val type: String,
    val itemId: String?,
    val idempotencyKey: String,
    val safePayloadHash: String,
    val state: String,
    val safePayload: String,
    val createdAt: Long,
    val completedAt: Long?,
    val retryCount: Int,
)

@Entity(
    tableName = "wellbeing_suggestion_feedback",
    indices = [Index("createdAt")],
)
data class SuggestionFeedbackEntity(
    @PrimaryKey val suggestionId: String,
    val decision: String,
    val modified: Boolean,
    val helpfulness: Int?,
    val nextDayEnergy: String?,
    val userComment: String?,
    val createdAt: Long,
)

@Entity(
    tableName = "wellbeing_deload_plans",
    indices = [Index("localDate")],
)
data class DeLoadPlanEntity(
    @PrimaryKey val id: String,
    val localDate: String,
    val keepItemIds: String,
    val deferItemIds: String,
    val lowerStandardItemIds: String,
    val renegotiateItemIds: String,
    val cancelItemIds: String,
    val saveAndStop: Boolean,
    val userConfirmed: Boolean,
    val appliedAtEpochMs: Long?,
    val undoUntilEpochMs: Long?,
)

@Entity(tableName = "wellbeing_intervention_preferences")
data class InterventionPreferenceEntity(
    @PrimaryKey val id: Int = 1,
    val nightModeStart: String,
    val nightModeEnd: String,
    val nightModeEnabled: Boolean,
    val loadAnalysisEnabled: Boolean,
    val safetyExpressionAnalysisEnabled: Boolean,
    val suggestionFrequency: String,
    val consecutiveDeclines: Int,
    val snoozedUntilEpochMs: Long?,
    val disabledSuggestionTypes: String,
)
