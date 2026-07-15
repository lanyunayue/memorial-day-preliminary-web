package com.chronos.shike.recovery

import java.time.Instant
import java.time.LocalDate

enum class RecoveryActionType { SAVE_AND_STOP, FIFTEEN_MINUTE_START, DEFER, LOWER_STANDARD, RENEGOTIATE, BASIC_NEED, CONTACT_TRUSTED_PERSON, SEEK_MEDICAL_HELP, REVIEW_TOMORROW }

data class RecoverySuggestion(
    val id: String,
    val localDate: LocalDate,
    val actionType: RecoveryActionType,
    val affectedItemIds: List<String>,
    val rationale: String,
    val reversible: Boolean,
    val confidenceBand: String,
    val requiresConfirmation: Boolean,
    val createdAt: Instant,
    val expiresAt: Instant,
)

data class DeLoadPlan(
    val id: String,
    val localDate: LocalDate,
    val keepItemIds: List<String>,
    val deferItemIds: List<String>,
    val lowerStandardItemIds: List<String>,
    val renegotiateItemIds: List<String>,
    val cancelItemIds: List<String>,
    val saveAndStop: Boolean,
    val userConfirmed: Boolean,
    val appliedAt: Instant?,
    val undoUntil: Instant?,
)
