package com.chronos.shike.parcel

import com.chronos.shike.contract.ConfidenceBand
import java.time.Instant

class ParcelLifecycle {
    fun apply(current: Parcel?, update: ParsedParcelEvent, sourcePackage: String, now: Instant): Parcel {
        val existing = current ?: Parcel(
            carrier = update.carrier,
            trackingNumber = update.trackingNumber,
            orderReference = update.orderReference,
            currentStatus = update.status,
            eta = update.eta,
            pickupLocation = update.pickupLocation,
            pickupCode = update.pickupCode,
            sourcePackages = setOf(sourcePackage),
            firstSeenAt = now,
            lastUpdatedAt = now,
            deduplicationKeys = buildKeys(update, sourcePackage),
            confidenceBand = update.confidenceBand,
        )
        if (current == null) return existing

        val nextStatus = if (isAllowed(current.currentStatus, update.status)) update.status else current.currentStatus
        val nextTrackingNumber = current.trackingNumber ?: update.trackingNumber
        return current.copy(
            carrier = preferKnown(current.carrier, update.carrier),
            trackingNumber = nextTrackingNumber,
            maskedTrackingNumber = nextTrackingNumber?.let(::maskTrackingNumber),
            orderReference = current.orderReference ?: update.orderReference,
            currentStatus = nextStatus,
            eta = update.eta ?: current.eta,
            pickupLocation = update.pickupLocation ?: current.pickupLocation,
            pickupCode = update.pickupCode ?: current.pickupCode,
            sourcePackages = current.sourcePackages + sourcePackage,
            lastUpdatedAt = now,
            completedAt = if (nextStatus in TERMINAL) current.completedAt ?: now else null,
            deduplicationKeys = current.deduplicationKeys + buildKeys(update, sourcePackage),
            confidenceBand = maxConfidence(current.confidenceBand, update.confidenceBand),
        )
    }

    fun isAllowed(from: ParcelStatus, to: ParcelStatus): Boolean {
        if (from == to) return true
        if (from == ParcelStatus.EXCEPTION && to in setOf(ParcelStatus.IN_TRANSIT, ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.READY_FOR_PICKUP)) return true
        if (from in TERMINAL) return to == ParcelStatus.ARCHIVED
        if (to == ParcelStatus.EXCEPTION || to == ParcelStatus.RETURNED || to == ParcelStatus.ARCHIVED) return true
        return RANK.getValue(to) >= RANK.getValue(from)
    }

    fun buildKeys(update: ParsedParcelEvent, sourcePackage: String): Set<String> = buildSet {
        update.trackingNumber?.let { add("tracking:${it.uppercase()}") }
        update.orderReference?.let { add("order:${it.uppercase()}") }
        if (update.pickupLocation != null && update.carrier != "unknown") add("location:${update.carrier}:${update.pickupLocation}")
        add("source:$sourcePackage:${update.fingerprint}")
    }

    private fun preferKnown(existing: String, update: String) = if (existing == "unknown") update else existing
    private fun maxConfidence(a: ConfidenceBand, b: ConfidenceBand) = if (a.ordinal >= b.ordinal) a else b

    companion object {
        private val TERMINAL = setOf(ParcelStatus.PICKED_UP, ParcelStatus.RETURNED, ParcelStatus.ARCHIVED)
        private val RANK = mapOf(
            ParcelStatus.DISCOVERED to 0,
            ParcelStatus.AWAITING_SHIPMENT to 1,
            ParcelStatus.SHIPPED to 2,
            ParcelStatus.IN_TRANSIT to 3,
            ParcelStatus.ARRIVED_LOCAL_STATION to 4,
            ParcelStatus.OUT_FOR_DELIVERY to 5,
            ParcelStatus.READY_FOR_PICKUP to 6,
            ParcelStatus.DELIVERED to 7,
            ParcelStatus.PICKED_UP to 8,
            ParcelStatus.EXCEPTION to 9,
            ParcelStatus.RETURNED to 10,
            ParcelStatus.ARCHIVED to 11,
        )
    }
}

class ParcelDeduplicator {
    fun findMatch(update: ParsedParcelEvent, parcels: Collection<Parcel>, sourcePackage: String): Parcel? {
        val keys = ParcelLifecycle().buildKeys(update, sourcePackage)
        return parcels.maxByOrNull { parcel ->
            var score = parcel.deduplicationKeys.intersect(keys).size * 10
            if (update.trackingNumber != null && update.trackingNumber == parcel.trackingNumber) score += 100
            if (update.orderReference != null && update.orderReference == parcel.orderReference) score += 50
            if (update.pickupLocation != null && update.pickupLocation == parcel.pickupLocation) score += 5
            score
        }?.takeIf { candidate ->
            candidate.deduplicationKeys.intersect(keys).isNotEmpty() ||
                (update.trackingNumber != null && update.trackingNumber == candidate.trackingNumber)
        }
    }
}
