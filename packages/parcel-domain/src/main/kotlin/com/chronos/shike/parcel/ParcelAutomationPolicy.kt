package com.chronos.shike.parcel

import com.chronos.shike.contract.ConfidenceBand

class ParcelAutomationPolicy {
    fun canApplyWithoutConfirmation(update: ParsedParcelEvent): Boolean {
        if (update.confidenceBand != ConfidenceBand.HIGH) return false
        if (update.pickupCode != null || update.pickupLocation != null) return false
        return update.status in SAFE_AUTOMATIC_STATUSES
    }

    companion object {
        private val SAFE_AUTOMATIC_STATUSES = setOf(
            ParcelStatus.SHIPPED,
            ParcelStatus.IN_TRANSIT,
            ParcelStatus.OUT_FOR_DELIVERY,
            ParcelStatus.ARRIVED_LOCAL_STATION,
            ParcelStatus.PICKED_UP,
        )
    }
}
