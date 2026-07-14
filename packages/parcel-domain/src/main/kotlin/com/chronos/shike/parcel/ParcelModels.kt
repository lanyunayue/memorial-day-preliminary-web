package com.chronos.shike.parcel

import com.chronos.shike.contract.ConfidenceBand
import com.chronos.shike.temporal.DynamicTimeWindow
import java.time.Instant
import java.util.UUID

enum class ParcelStatus {
    DISCOVERED,
    AWAITING_SHIPMENT,
    SHIPPED,
    IN_TRANSIT,
    ARRIVED_LOCAL_STATION,
    OUT_FOR_DELIVERY,
    READY_FOR_PICKUP,
    DELIVERED,
    PICKED_UP,
    EXCEPTION,
    RETURNED,
    ARCHIVED,
}

data class Parcel(
    val id: String = UUID.randomUUID().toString(),
    val carrier: String = "unknown",
    val trackingNumber: String? = null,
    val maskedTrackingNumber: String? = trackingNumber?.let(::maskTrackingNumber),
    val merchant: String? = null,
    val orderReference: String? = null,
    val currentStatus: ParcelStatus = ParcelStatus.DISCOVERED,
    val eta: DynamicTimeWindow? = null,
    val pickupLocation: String? = null,
    val pickupCode: String? = null,
    val sourcePackages: Set<String>,
    val firstSeenAt: Instant,
    val lastUpdatedAt: Instant,
    val completedAt: Instant? = null,
    val deduplicationKeys: Set<String>,
    val confidenceBand: ConfidenceBand,
    val schemaVersion: Int = 1,
)

data class ParcelEvent(
    val id: String = UUID.randomUUID().toString(),
    val parcelId: String,
    val type: ParcelStatus,
    val occurredAt: Instant,
    val location: String?,
    val description: String,
    val sourceEnvelopeId: String,
    val confidenceBand: ConfidenceBand,
    val schemaVersion: Int = 1,
)

data class ParsedParcelEvent(
    val carrier: String,
    val trackingNumber: String?,
    val orderReference: String?,
    val status: ParcelStatus,
    val pickupCode: String?,
    val pickupLocation: String?,
    val eta: DynamicTimeWindow?,
    val confidenceBand: ConfidenceBand,
    val parcelLikely: Boolean,
    val fingerprint: String,
)

fun maskTrackingNumber(value: String): String = when {
    value.length <= 4 -> "****"
    else -> value.take(2) + "*".repeat(value.length - 4) + value.takeLast(2)
}

fun maskPickupCode(value: String): String {
    val parts = value.split('-')
    return if (parts.size > 1) parts.dropLast(1).joinToString("-") + "-****" else "****"
}
