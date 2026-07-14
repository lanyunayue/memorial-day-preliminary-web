package com.chronos.shike.temporal

import com.chronos.shike.contract.ConfidenceBand
import java.time.Instant

data class DynamicTimeWindow(
    val start: Instant,
    val end: Instant,
    val confidenceBand: ConfidenceBand,
    val source: String,
    val lastUpdatedAt: Instant,
    val dynamic: Boolean = true,
) {
    init {
        require(end >= start)
        require(source.isNotBlank())
        require(lastUpdatedAt >= start.minusSeconds(MAX_EARLY_UPDATE_SECONDS))
    }

    companion object {
        private const val MAX_EARLY_UPDATE_SECONDS = 31_536_000L
    }
}
