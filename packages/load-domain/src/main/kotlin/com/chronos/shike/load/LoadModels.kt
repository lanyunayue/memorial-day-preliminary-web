package com.chronos.shike.load

import java.time.Instant
import java.time.LocalDate

enum class LoadSourceType { TASK, COMMITMENT, WAITING_FOR, GOAL_STEP }
enum class ResponsibilityType { SELF_CHOSEN, PROMISED_TO_OTHERS, ASSIGNED_BY_OTHERS, WAITING_ON_OTHERS }
enum class Negotiability { FIXED, DISCUSSABLE, FLEXIBLE }
enum class LoadStatus { ACTIVE, DEFERRED, LOWERED_STANDARD, CANCELLED, DONE }

data class LoadItem(
    val id: String,
    val sourceType: LoadSourceType,
    val title: String,
    val dueAt: Instant?,
    val estimatedEffortMinutes: Int,
    val importance: Int,
    val negotiability: Negotiability,
    val responsibilityType: ResponsibilityType,
    val waitingSince: Instant?,
    val status: LoadStatus,
    val createdAt: Instant,
    val schemaVersion: Int = 1,
) {
    init {
        require(title.isNotBlank() && title.length <= 160)
        require(estimatedEffortMinutes in 0..1440)
        require(importance in 1..3)
        require(sourceType == LoadSourceType.WAITING_FOR || waitingSince == null)
    }
}

data class LoadSnapshot(
    val id: String,
    val localDate: LocalDate,
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
    val createdAt: Instant,
    val schemaVersion: Int = 1,
)

data class OverloadExplanation(
    val id: String,
    val snapshotId: String,
    val reasons: List<String>,
    val evidence: List<String>,
    val missingData: List<String>,
    val confidenceBand: String,
    val userVisibleText: String,
    val createdAt: Instant,
)
