package com.chronos.shike.contract

import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse

class EventEnvelopeTest {
    @Test
    fun `raw content retention is rejected`() {
        assertFailsWith<IllegalArgumentException> {
            envelope(rawContentRetained = true)
        }
    }

    @Test
    fun `notification requires explicit source consent`() {
        assertFailsWith<IllegalArgumentException> {
            envelope(consent = false)
        }
    }

    @Test
    fun `valid envelope contains no raw body`() {
        assertFalse(envelope().rawContentRetained)
    }

    private fun envelope(rawContentRetained: Boolean = false, consent: Boolean = true): EventEnvelope {
        val now = Instant.parse("2026-07-14T08:00:00Z")
        return EventEnvelope(
            sourceType = EventSourceType.NOTIFICATION,
            sourcePackage = "com.example.delivery",
            sourceLabel = "Delivery",
            occurredAt = now,
            receivedAt = now,
            eventType = "parcel.status",
            entities = emptyMap(),
            sensitivity = Sensitivity.PERSONAL,
            confidenceBand = ConfidenceBand.HIGH,
            consentScope = ConsentScope("com.example.delivery", consent, now),
            deduplicationKey = "safe-key",
            rawContentRetained = rawContentRetained,
        )
    }
}
