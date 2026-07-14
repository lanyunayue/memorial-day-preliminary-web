package com.chronos.shike.contract

import java.time.Instant
import java.util.UUID

enum class EventSourceType { NOTIFICATION, SHARE, MANUAL }
enum class Sensitivity { PUBLIC, PERSONAL, SENSITIVE, HIGHLY_SENSITIVE }
enum class ConfidenceBand { LOW, MEDIUM, HIGH }

data class ConsentScope(
    val sourcePackage: String,
    val explicitlyAllowed: Boolean,
    val grantedAt: Instant?,
)

data class EventEnvelope(
    val id: String = UUID.randomUUID().toString(),
    val sourceType: EventSourceType,
    val sourcePackage: String,
    val sourceLabel: String,
    val occurredAt: Instant,
    val receivedAt: Instant,
    val eventType: String,
    val entities: Map<String, String>,
    val sensitivity: Sensitivity,
    val confidenceBand: ConfidenceBand,
    val consentScope: ConsentScope,
    val deduplicationKey: String,
    val rawContentRetained: Boolean = false,
    val schemaVersion: Int = 1,
) {
    init {
        require(id.isNotBlank())
        require(sourcePackage.isNotBlank())
        require(receivedAt >= occurredAt.minusSeconds(MAX_CLOCK_SKEW_SECONDS))
        require(schemaVersion == 1)
        require(!rawContentRetained) { "Raw notification content must not be retained" }
        require(consentScope.explicitlyAllowed || sourceType != EventSourceType.NOTIFICATION)
    }

    companion object {
        private const val MAX_CLOCK_SKEW_SECONDS = 300L
    }
}

interface EventSourceAdapter<T> {
    fun start()
    fun stop()
    fun permissionStatus(): PermissionStatus
    fun capture(input: T): EventEnvelope?
    fun normalize(input: T): String
    fun redact(input: T): String
    fun health(): SourceHealth
    fun revoke()
}

enum class PermissionStatus { NOT_REQUIRED, NOT_GRANTED, GRANTED, REVOKED }
data class SourceHealth(val available: Boolean, val detail: String)

enum class ConnectorImplementationStatus { IMPLEMENTED, NOT_IMPLEMENTED }

object ConnectorRoadmap {
    val status = mapOf(
        "notification" to ConnectorImplementationStatus.IMPLEMENTED,
        "share" to ConnectorImplementationStatus.IMPLEMENTED,
        "manual" to ConnectorImplementationStatus.IMPLEMENTED,
        "email" to ConnectorImplementationStatus.NOT_IMPLEMENTED,
        "calendar" to ConnectorImplementationStatus.NOT_IMPLEMENTED,
        "voice" to ConnectorImplementationStatus.NOT_IMPLEMENTED,
        "file" to ConnectorImplementationStatus.NOT_IMPLEMENTED,
    )
}
