package com.chronos.shike.storage

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "parcels", indices = [Index("trackingNumber"), Index("currentStatus")])
data class ParcelEntity(
    @PrimaryKey val id: String,
    val carrier: String,
    val trackingNumber: String?,
    val maskedTrackingNumber: String?,
    val merchant: String?,
    val orderReference: String?,
    val currentStatus: String,
    val etaStartEpochMs: Long?,
    val etaEndEpochMs: Long?,
    val etaConfidence: String?,
    val pickupLocation: String?,
    val pickupCodeEncrypted: ByteArray?,
    val sourcePackages: String,
    val firstSeenAtEpochMs: Long,
    val lastUpdatedAtEpochMs: Long,
    val completedAtEpochMs: Long?,
    val deduplicationKeys: String,
    val confidenceBand: String,
    val schemaVersion: Int,
)

@Entity(
    tableName = "parcel_events",
    foreignKeys = [ForeignKey(
        entity = ParcelEntity::class,
        parentColumns = ["id"],
        childColumns = ["parcelId"],
        onDelete = ForeignKey.CASCADE,
    )],
    indices = [Index("parcelId"), Index(value = ["sourceEnvelopeId"], unique = true)],
)
data class ParcelEventEntity(
    @PrimaryKey val id: String,
    val parcelId: String,
    val type: String,
    val occurredAtEpochMs: Long,
    val location: String?,
    val safeDescription: String,
    val sourceEnvelopeId: String,
    val confidenceBand: String,
    val schemaVersion: Int,
)

@Entity(tableName = "parcel_drafts", indices = [Index(value = ["deduplicationKey"], unique = true)])
data class ParcelDraftEntity(
    @PrimaryKey val id: String,
    val sourcePackage: String,
    val sourceLabel: String,
    val carrier: String,
    val trackingNumber: String?,
    val status: String,
    val pickupLocation: String?,
    val pickupCodeEncrypted: ByteArray?,
    val confidenceBand: String,
    val deduplicationKey: String,
    val occurredAtEpochMs: Long,
    val createdAtEpochMs: Long,
)

@Entity(tableName = "parcel_operation_journal", indices = [Index(value = ["idempotencyKey"], unique = true)])
data class OperationEntity(
    @PrimaryKey val id: String,
    val type: String,
    val parcelId: String?,
    val idempotencyKey: String,
    val checksum: String,
    val state: String,
    val safePayload: String,
    val createdAtEpochMs: Long,
    val completedAtEpochMs: Long?,
    val retryCount: Int,
)
