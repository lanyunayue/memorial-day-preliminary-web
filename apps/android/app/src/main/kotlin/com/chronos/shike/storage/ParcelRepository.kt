package com.chronos.shike.storage

import androidx.room.withTransaction
import com.chronos.shike.contract.ConfidenceBand
import com.chronos.shike.contract.EventEnvelope
import com.chronos.shike.parcel.Parcel
import com.chronos.shike.parcel.ParcelDeduplicator
import com.chronos.shike.parcel.ParcelEvent
import com.chronos.shike.parcel.ParcelLifecycle
import com.chronos.shike.parcel.ParcelParser
import com.chronos.shike.parcel.ParcelStatus
import com.chronos.shike.security.PickupCodeCipher
import com.chronos.shike.temporal.DynamicTimeWindow
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.time.Instant
import java.util.UUID
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class ParcelRepository(
    private val database: ChronosDatabase,
    private val crypto: PickupCodeCipher,
    private val parser: ParcelParser = ParcelParser(),
) {
    private val lifecycle = ParcelLifecycle()
    private val deduplicator = ParcelDeduplicator()

    fun observeParcels(): Flow<List<Parcel>> = database.parcelDao().observeAll().map { rows -> rows.map(::toDomain) }
    fun observeDrafts(): Flow<List<ParcelDraftEntity>> = database.draftDao().observeAll()
    fun observeOperations(): Flow<List<OperationEntity>> = database.operationDao().observeRecent()
    fun observeEvents(parcelId: String): Flow<List<ParcelEventEntity>> = database.parcelDao().observeEvents(parcelId)

    suspend fun capture(envelope: EventEnvelope, safeText: String, autoOrganize: Boolean): CaptureResult {
        val parsed = parser.parse(safeText) ?: return CaptureResult.Ignored
        if (!parsed.parcelLikely) return CaptureResult.Ignored
        return if (!autoOrganize || parsed.confidenceBand != ConfidenceBand.HIGH || parsed.pickupCode != null) {
            val draft = ParcelDraftEntity(
                id = UUID.randomUUID().toString(),
                sourcePackage = envelope.sourcePackage,
                sourceLabel = envelope.sourceLabel,
                carrier = parsed.carrier,
                trackingNumber = parsed.trackingNumber,
                status = parsed.status.name,
                pickupLocation = parsed.pickupLocation,
                pickupCodeEncrypted = parsed.pickupCode?.let(crypto::encrypt),
                confidenceBand = parsed.confidenceBand.name,
                deduplicationKey = envelope.deduplicationKey,
                occurredAtEpochMs = envelope.occurredAt.toEpochMilli(),
                createdAtEpochMs = System.currentTimeMillis(),
            )
            if (database.draftDao().insert(draft) == -1L) CaptureResult.Duplicate else CaptureResult.Draft(draft.id)
        } else {
            CaptureResult.Saved(upsert(envelope, parsed))
        }
    }

    suspend fun confirmDraft(id: String): String? {
        val draft = database.draftDao().find(id) ?: return null
        val safeText = buildString {
            append(draft.carrier).append(" 快递 ").append(draft.status)
            draft.trackingNumber?.let { append(" 运单号 ").append(it) }
            draft.pickupLocation?.let { append(" 到 ").append(it) }
        }
        val parsed = parser.parse(safeText)?.copy(
            carrier = draft.carrier,
            trackingNumber = draft.trackingNumber,
            status = ParcelStatus.valueOf(draft.status),
            pickupLocation = draft.pickupLocation,
            pickupCode = draft.pickupCodeEncrypted?.let(crypto::decrypt),
            confidenceBand = ConfidenceBand.valueOf(draft.confidenceBand),
            fingerprint = draft.deduplicationKey,
            parcelLikely = true,
        ) ?: return null
        val envelope = syntheticEnvelopeForDraft(draft)
        val parcelId = upsert(envelope, parsed)
        database.draftDao().delete(id)
        return parcelId
    }

    suspend fun dismissDraft(id: String) = database.draftDao().delete(id)

    suspend fun captureConfirmed(envelope: EventEnvelope, inMemoryText: String): String? {
        val parsed = parser.parse(inMemoryText) ?: return null
        if (!parsed.parcelLikely) return null
        return upsert(envelope, parsed)
    }

    suspend fun markPickedUp(id: String) {
        val current = database.parcelDao().find(id) ?: return
        val now = System.currentTimeMillis()
        val updated = current.copy(currentStatus = ParcelStatus.PICKED_UP.name, completedAtEpochMs = now, lastUpdatedAtEpochMs = now)
        journaled("MARK_PICKED_UP", id, id + ":picked-up") { database.parcelDao().update(updated) }
    }

    suspend fun deleteParcel(id: String) = journaled("DELETE", id, id + ":delete") { database.parcelDao().delete(id) }

    suspend fun clearAll() {
        journaled("CLEAR_ALL", null, "clear:" + System.currentTimeMillis()) {
            database.withTransaction {
                database.draftDao().clear()
                database.parcelDao().clearAll()
            }
            crypto.deleteKey()
        }
    }

    suspend fun exportMasked(): String {
        val rows = database.parcelDao().all()
        return rows.joinToString(prefix = "{\"schemaVersion\":1,\"parcels\":[", postfix = "]}") { row ->
            "{\"id\":\"${escape(row.id)}\",\"carrier\":\"${escape(row.carrier)}\",\"tracking\":${jsonString(row.maskedTrackingNumber)},\"status\":\"${row.currentStatus}\",\"pickupLocation\":${jsonString(row.pickupLocation)},\"pickupCode\":\"masked\"}"
        }
    }

    fun revealPickupCode(parcel: Parcel): String? = parcel.pickupCode

    private suspend fun upsert(envelope: EventEnvelope, parsed: com.chronos.shike.parcel.ParsedParcelEvent): String {
        val all = database.parcelDao().all().map(::toDomain)
        val match = deduplicator.findMatch(parsed, all, envelope.sourcePackage)
        val parcel = lifecycle.apply(match, parsed, envelope.sourcePackage, envelope.occurredAt)
        val operationKey = "capture:${envelope.deduplicationKey}"
        journaled("UPSERT", parcel.id, operationKey) {
            database.withTransaction {
                if (match == null) database.parcelDao().insert(toEntity(parcel)) else database.parcelDao().update(toEntity(parcel))
                database.parcelDao().insertEvent(
                    ParcelEventEntity(
                        id = UUID.randomUUID().toString(),
                        parcelId = parcel.id,
                        type = parcel.currentStatus.name,
                        occurredAtEpochMs = envelope.occurredAt.toEpochMilli(),
                        location = parcel.pickupLocation,
                        safeDescription = "${parcel.carrier}:${parcel.currentStatus.name}",
                        sourceEnvelopeId = envelope.id,
                        confidenceBand = parcel.confidenceBand.name,
                        schemaVersion = 1,
                    ),
                )
            }
        }
        return parcel.id
    }

    private suspend fun journaled(type: String, parcelId: String?, idempotencyKey: String, block: suspend () -> Unit) {
        val id = UUID.randomUUID().toString()
        val safePayload = listOfNotNull(type, parcelId).joinToString(":")
        val inserted = database.operationDao().insert(
            OperationEntity(id, type, parcelId, idempotencyKey, sha256(safePayload), "PENDING", safePayload, System.currentTimeMillis(), null, 0),
        )
        if (inserted == -1L) return
        runCatching { block() }
            .onSuccess { database.operationDao().complete(id, "COMPLETED", System.currentTimeMillis()) }
            .onFailure { database.operationDao().complete(id, "QUARANTINED", System.currentTimeMillis()) }
            .getOrThrow()
    }

    private fun toEntity(parcel: Parcel) = ParcelEntity(
        id = parcel.id,
        carrier = parcel.carrier,
        trackingNumber = parcel.trackingNumber,
        maskedTrackingNumber = parcel.maskedTrackingNumber,
        merchant = parcel.merchant,
        orderReference = parcel.orderReference,
        currentStatus = parcel.currentStatus.name,
        etaStartEpochMs = parcel.eta?.start?.toEpochMilli(),
        etaEndEpochMs = parcel.eta?.end?.toEpochMilli(),
        etaConfidence = parcel.eta?.confidenceBand?.name,
        pickupLocation = parcel.pickupLocation,
        pickupCodeEncrypted = parcel.pickupCode?.let(crypto::encrypt),
        sourcePackages = parcel.sourcePackages.sorted().joinToString("|"),
        firstSeenAtEpochMs = parcel.firstSeenAt.toEpochMilli(),
        lastUpdatedAtEpochMs = parcel.lastUpdatedAt.toEpochMilli(),
        completedAtEpochMs = parcel.completedAt?.toEpochMilli(),
        deduplicationKeys = parcel.deduplicationKeys.sorted().joinToString("|"),
        confidenceBand = parcel.confidenceBand.name,
        schemaVersion = parcel.schemaVersion,
    )

    private fun toDomain(row: ParcelEntity) = Parcel(
        id = row.id,
        carrier = row.carrier,
        trackingNumber = row.trackingNumber,
        maskedTrackingNumber = row.maskedTrackingNumber,
        merchant = row.merchant,
        orderReference = row.orderReference,
        currentStatus = ParcelStatus.valueOf(row.currentStatus),
        eta = if (row.etaStartEpochMs != null && row.etaEndEpochMs != null && row.etaConfidence != null) DynamicTimeWindow(
            Instant.ofEpochMilli(row.etaStartEpochMs), Instant.ofEpochMilli(row.etaEndEpochMs),
            ConfidenceBand.valueOf(row.etaConfidence), "local-storage", Instant.ofEpochMilli(row.lastUpdatedAtEpochMs), true,
        ) else null,
        pickupLocation = row.pickupLocation,
        pickupCode = row.pickupCodeEncrypted?.let(crypto::decrypt),
        sourcePackages = row.sourcePackages.split('|').filter(String::isNotBlank).toSet(),
        firstSeenAt = Instant.ofEpochMilli(row.firstSeenAtEpochMs),
        lastUpdatedAt = Instant.ofEpochMilli(row.lastUpdatedAtEpochMs),
        completedAt = row.completedAtEpochMs?.let(Instant::ofEpochMilli),
        deduplicationKeys = row.deduplicationKeys.split('|').filter(String::isNotBlank).toSet(),
        confidenceBand = ConfidenceBand.valueOf(row.confidenceBand),
        schemaVersion = row.schemaVersion,
    )

    private fun syntheticEnvelopeForDraft(draft: ParcelDraftEntity): EventEnvelope {
        val occurred = Instant.ofEpochMilli(draft.occurredAtEpochMs)
        return EventEnvelope(
            id = "draft:${draft.id}",
            sourceType = com.chronos.shike.contract.EventSourceType.MANUAL,
            sourcePackage = draft.sourcePackage,
            sourceLabel = draft.sourceLabel,
            occurredAt = occurred,
            receivedAt = occurred,
            eventType = "parcel.confirmed",
            entities = emptyMap(),
            sensitivity = com.chronos.shike.contract.Sensitivity.SENSITIVE,
            confidenceBand = ConfidenceBand.valueOf(draft.confidenceBand),
            consentScope = com.chronos.shike.contract.ConsentScope(draft.sourcePackage, true, occurred),
            deduplicationKey = draft.deduplicationKey,
        )
    }

    private fun sha256(value: String) = MessageDigest.getInstance("SHA-256")
        .digest(value.toByteArray(StandardCharsets.UTF_8)).joinToString("") { "%02x".format(it) }
    private fun escape(value: String) = value.replace("\\", "\\\\").replace("\"", "\\\"")
    private fun jsonString(value: String?) = value?.let { "\"${escape(it)}\"" } ?: "null"
}

sealed interface CaptureResult {
    data object Ignored : CaptureResult
    data object Duplicate : CaptureResult
    data class Draft(val id: String) : CaptureResult
    data class Saved(val parcelId: String) : CaptureResult
}
