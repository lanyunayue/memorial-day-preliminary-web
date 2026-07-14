package com.chronos.shike

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.chronos.shike.capture.UserProvidedInput
import com.chronos.shike.capture.UserProvidedSourceAdapter
import com.chronos.shike.contract.EventSourceType
import com.chronos.shike.security.PickupCodeCrypto
import com.chronos.shike.storage.ChronosDatabase
import com.chronos.shike.storage.MergeResult
import com.chronos.shike.storage.OperationEntity
import com.chronos.shike.storage.ParcelRepository
import com.chronos.shike.storage.SplitResult
import java.util.UUID
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class MergeSplitInstrumentedTest {
    private lateinit var context: Context
    private lateinit var database: ChronosDatabase
    private lateinit var repository: ParcelRepository

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        PickupCodeCrypto().deleteKey()
        database = Room.inMemoryDatabaseBuilder(context, ChronosDatabase::class.java).build()
        repository = ParcelRepository(database, PickupCodeCrypto())
    }

    @After
    fun tearDown() {
        database.close()
        PickupCodeCrypto().deleteKey()
    }

    private suspend fun createParcel(text: String, sourcePackage: String = "test.source"): String {
        val adapter = UserProvidedSourceAdapter(EventSourceType.MANUAL, sourcePackage)
        val envelope = adapter.capture(UserProvidedInput(text))!!
        return repository.captureConfirmed(envelope, text)!!
    }

    @Test
    fun mergeMovesEventsAndDeletesSource() = runBlocking {
        val sourceId = createParcel(
            "圆通快递 运单号 YT12345678 已到达南苑驿站，取件码 4-2-6187",
            "merge.source",
        )
        val targetId = createParcel(
            "中通快递 运单号 ZT87654321 已到达北苑驿站，取件码 5-3-9999",
            "merge.target",
        )

        val sourceEvents = database.parcelDao().eventsForParcel(sourceId)
        val targetEvents = database.parcelDao().eventsForParcel(targetId)
        assertTrue("Source parcel should have events", sourceEvents.isNotEmpty())
        assertTrue("Target parcel should have events", targetEvents.isNotEmpty())

        val result = repository.mergeParcels(sourceId, targetId)

        assertTrue("Merge should return Done", result is MergeResult.Done)
        assertEquals(targetId, (result as MergeResult.Done).targetId)

        assertNull("Source parcel should be deleted after merge", database.parcelDao().find(sourceId))
        assertNotNull("Target parcel should still exist after merge", database.parcelDao().find(targetId))

        val mergedEvents = database.parcelDao().eventsForParcel(targetId)
        assertEquals(
            "All events should be moved to target",
            sourceEvents.size + targetEvents.size,
            mergedEvents.size,
        )
    }

    @Test
    fun splitCreatesNewParcelWithEvents() = runBlocking {
        val parcelId = createParcel(
            "圆通快递 运单号 YT99990001 已到达南苑驿站，取件码 3-3-3333",
            "split.first",
        )
        // Add a second event to the same parcel via deduplication on tracking number
        val secondAdapter = UserProvidedSourceAdapter(EventSourceType.MANUAL, "split.second")
        val secondText = "圆通快递 运单号 YT99990001 派送中"
        val secondEnvelope = secondAdapter.capture(UserProvidedInput(secondText))!!
        repository.captureConfirmed(secondEnvelope, secondText)

        val events = database.parcelDao().eventsForParcel(parcelId)
        assertTrue("Expected at least 2 events for split, got ${events.size}", events.size >= 2)

        val eventIdsToSplit = setOf(events.first().id)
        val result = repository.splitParcel(parcelId, eventIdsToSplit)

        assertTrue("Split should return Done", result is SplitResult.Done)
        val newParcelId = (result as SplitResult.Done).newParcelId

        assertNotNull("New parcel should exist after split", database.parcelDao().find(newParcelId))
        val newParcelEvents = database.parcelDao().eventsForParcel(newParcelId)
        assertTrue("New parcel should have events after split", newParcelEvents.isNotEmpty())
        assertNotNull("Source parcel should still exist after split", database.parcelDao().find(parcelId))
    }

    @Test
    fun mergeIsIdempotentWhenAlreadyCompleted() = runBlocking {
        val sourceId = createParcel(
            "圆通快递 运单号 YT11111111 已到达东苑驿站，取件码 1-1-1111",
            "idempotent.source",
        )
        val targetId = createParcel(
            "中通快递 运单号 ZT22222222 已到达西苑驿站，取件码 2-2-2222",
            "idempotent.target",
        )

        // Pre-insert a completed MERGE operation to simulate a prior successful merge.
        // This exercises the idempotency check path: both parcels still exist,
        // but the operation journal already records a completed merge.
        database.operationDao().insert(
            OperationEntity(
                id = UUID.randomUUID().toString(),
                type = "MERGE",
                parcelId = targetId,
                idempotencyKey = "merge:$sourceId:$targetId",
                checksum = "pre-inserted-checksum",
                state = "COMPLETED",
                safePayload = "MERGE:$sourceId:$targetId",
                createdAtEpochMs = System.currentTimeMillis(),
                completedAtEpochMs = System.currentTimeMillis(),
                retryCount = 0,
            ),
        )

        val result = repository.mergeParcels(sourceId, targetId)

        assertTrue("Merge should return AlreadyDone", result is MergeResult.AlreadyDone)
        assertEquals(targetId, (result as MergeResult.AlreadyDone).targetId)

        // Both parcels should still exist (the merge was not actually performed)
        assertNotNull(database.parcelDao().find(sourceId))
        assertNotNull(database.parcelDao().find(targetId))
    }

    @Test
    fun mergeReturnsNotFoundForMissingSource() = runBlocking {
        val targetId = createParcel(
            "圆通快递 运单号 YT55555555 已到达南苑驿站，取件码 5-5-5555",
            "notfound.target",
        )

        val result = repository.mergeParcels("non-existent-source", targetId)

        assertTrue("Merge should return NotFound for missing source", result is MergeResult.NotFound)
        assertEquals("non-existent-source", (result as MergeResult.NotFound).id)
    }

    @Test
    fun mergeReturnsInvalidArgumentForSameParcel() = runBlocking {
        val parcelId = createParcel(
            "圆通快递 运单号 YT66666666 已到达南苑驿站，取件码 6-6-6666",
            "invalid.source",
        )

        val result = repository.mergeParcels(parcelId, parcelId)

        assertTrue("Merge should return InvalidArgument for same source and target", result is MergeResult.InvalidArgument)
    }

    @Test
    fun recoverPendingOperationsCompletesStuckDelete() = runBlocking {
        database.operationDao().insert(
            OperationEntity(
                id = UUID.randomUUID().toString(),
                type = "DELETE",
                parcelId = null,
                idempotencyKey = "delete:test:${UUID.randomUUID()}",
                checksum = "test-checksum",
                state = "PENDING",
                safePayload = "DELETE",
                createdAtEpochMs = System.currentTimeMillis(),
                completedAtEpochMs = null,
                retryCount = 0,
            ),
        )

        val pendingBefore = database.operationDao().pendingOperations()
        assertTrue("Should have pending operations before recovery", pendingBefore.isNotEmpty())

        val report = repository.recoverPendingOperations()

        assertEquals("Total pending should be 1", 1, report.totalPending)
        assertEquals("Recovered should be 1", 1, report.recovered)
        assertEquals("Quarantined should be 0", 0, report.quarantined)

        val pendingAfter = database.operationDao().pendingOperations()
        assertTrue("Should have no pending operations after recovery", pendingAfter.isEmpty())
    }

    @Test
    fun recoverPendingOperationsQuarantinesUnrecoverableMerge() = runBlocking {
        val sourceId = createParcel(
            "圆通快递 运单号 YT77777777 已到达南苑驿站，取件码 7-7-7777",
            "quarantine.source",
        )
        val targetId = createParcel(
            "中通快递 运单号 ZT88888888 已到达北苑驿站，取件码 8-8-8888",
            "quarantine.target",
        )

        // Insert a pending MERGE where both source and target still exist.
        // The recovery logic for MERGE requires the source to be deleted and target to exist.
        // Since both exist, this operation cannot be recovered and should be quarantined.
        database.operationDao().insert(
            OperationEntity(
                id = UUID.randomUUID().toString(),
                type = "MERGE",
                parcelId = targetId,
                idempotencyKey = "merge:${UUID.randomUUID()}",
                checksum = "test-checksum",
                state = "PENDING",
                safePayload = "MERGE:$sourceId:$targetId",
                createdAtEpochMs = System.currentTimeMillis(),
                completedAtEpochMs = null,
                retryCount = 0,
            ),
        )

        val report = repository.recoverPendingOperations()

        assertEquals("Total pending should be 1", 1, report.totalPending)
        assertEquals("Recovered should be 0", 0, report.recovered)
        assertEquals("Quarantined should be 1", 1, report.quarantined)
    }

    @Test
    fun mergePreservesEncryptedPickupCode() = runBlocking {
        val sourceId = createParcel(
            "圆通快递 运单号 YT33333333 已到达南苑驿站，取件码 7-7-7777",
            "crypto.source",
        )
        val targetId = createParcel(
            "中通快递 运单号 ZT44444444 已到达北苑驿站",
            "crypto.target",
        )

        // Source has a pickup code, target does not
        val parcels = repository.observeParcels().first()
        val sourceParcel = parcels.find { it.id == sourceId }!!
        assertEquals("7-7-7777", sourceParcel.pickupCode)
        val targetParcel = parcels.find { it.id == targetId }!!
        assertNull("Target should not have a pickup code before merge", targetParcel.pickupCode)

        repository.mergeParcels(sourceId, targetId)

        // After merge, target should have the source's pickup code (decrypted correctly)
        val mergedParcels = repository.observeParcels().first()
        val mergedTarget = mergedParcels.find { it.id == targetId }!!
        assertEquals(
            "Target should have source's pickup code after merge",
            "7-7-7777",
            mergedTarget.pickupCode,
        )
    }

    @Test
    fun splitWithNoMatchingEventsReturnsNoEventsMatched() = runBlocking {
        val parcelId = createParcel(
            "圆通快递 运单号 YT12121212 已到达南苑驿站，取件码 1-2-1212",
            "nomatch.source",
        )

        val result = repository.splitParcel(parcelId, setOf("non-existent-event-id"))

        assertTrue("Split should return NoEventsMatched", result is SplitResult.NoEventsMatched)
    }

    @Test
    fun splitReturnsNotFoundForMissingParcel() = runBlocking {
        val result = repository.splitParcel("non-existent-parcel", setOf("event-1"))

        assertTrue("Split should return NotFound for missing parcel", result is SplitResult.NotFound)
        assertEquals("non-existent-parcel", (result as SplitResult.NotFound).id)
    }

    @Test
    fun recoverPendingOperationsReturnsZeroReportWhenNothingPending() = runBlocking {
        val report = repository.recoverPendingOperations()

        assertEquals(0, report.totalPending)
        assertEquals(0, report.recovered)
        assertEquals(0, report.quarantined)
    }
}
