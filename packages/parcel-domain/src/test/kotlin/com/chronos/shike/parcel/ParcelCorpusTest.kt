package com.chronos.shike.parcel

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ParcelCorpusTest {
    private val parser = ParcelParser()

    @Test
    fun `synthetic and sanitized corpus meets alpha gates`() {
        val cases = javaClass.getResourceAsStream("/parcel-corpus.tsv")!!.bufferedReader(Charsets.UTF_8).useLines { lines ->
            lines.drop(1).filter(String::isNotBlank).map(::parseCase).toList()
        }
        assertTrue(cases.size >= 30)
        assertTrue(cases.all { it.classification in setOf("synthetic-template", "sanitized-example") })

        var truePositive = 0
        var falsePositive = 0
        var pickupExpected = 0
        var pickupCorrect = 0
        cases.forEach { sample ->
            val parsed = parser.parse(sample.text)
            if (sample.parcel) {
                if (parsed != null) truePositive++
                if (sample.carrier != "-" && sample.carrier != "unknown") assertEquals(sample.carrier, parsed?.carrier, sample.id)
                if (sample.status != "-") assertEquals(sample.status, parsed?.status?.name, sample.id)
                if (sample.pickupCode != "-") {
                    pickupExpected++
                    if (parsed?.pickupCode == sample.pickupCode) pickupCorrect++
                }
            } else if (parsed != null) {
                falsePositive++
            }
        }

        val positives = cases.count { it.parcel }
        val negatives = cases.size - positives
        val precision = truePositive.toDouble() / positives
        val falsePositiveRate = falsePositive.toDouble() / negatives
        val pickupAccuracy = pickupCorrect.toDouble() / pickupExpected
        println("CORPUS=${cases.size} PRECISION=$precision FALSE_POSITIVE_RATE=$falsePositiveRate PICKUP_ACCURACY=$pickupAccuracy")
        assertTrue(precision >= 0.90)
        assertTrue(falsePositiveRate <= 0.05)
        assertTrue(pickupAccuracy >= 0.95)
    }

    private fun parseCase(line: String): CorpusCase {
        val fields = line.split('\t', limit = 7)
        require(fields.size == 7) { "Invalid corpus row: $line" }
        return CorpusCase(fields[0], fields[1], fields[2].toBoolean(), fields[3], fields[4], fields[5], fields[6])
    }
}

private data class CorpusCase(
    val id: String,
    val classification: String,
    val parcel: Boolean,
    val carrier: String,
    val status: String,
    val pickupCode: String,
    val text: String,
)
