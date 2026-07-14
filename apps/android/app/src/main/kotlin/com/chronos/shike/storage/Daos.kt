package com.chronos.shike.storage

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ParcelDao {
    @Query("SELECT * FROM parcels ORDER BY lastUpdatedAtEpochMs DESC")
    fun observeAll(): Flow<List<ParcelEntity>>

    @Query("SELECT * FROM parcels")
    suspend fun all(): List<ParcelEntity>

    @Query("SELECT * FROM parcels WHERE id = :id LIMIT 1")
    suspend fun find(id: String): ParcelEntity?

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(parcel: ParcelEntity)

    @Update
    suspend fun update(parcel: ParcelEntity)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertEvent(event: ParcelEventEntity): Long

    @Query("SELECT * FROM parcel_events WHERE parcelId = :parcelId ORDER BY occurredAtEpochMs DESC")
    fun observeEvents(parcelId: String): Flow<List<ParcelEventEntity>>

    @Query("DELETE FROM parcels WHERE id = :id")
    suspend fun delete(id: String)

    @Query("SELECT * FROM parcel_events WHERE parcelId = :parcelId ORDER BY occurredAtEpochMs ASC")
    suspend fun eventsForParcel(parcelId: String): List<ParcelEventEntity>

    @Query("UPDATE parcel_events SET parcelId = :newParcelId WHERE parcelId = :oldParcelId")
    suspend fun reassignEvents(oldParcelId: String, newParcelId: String)

    @Query("SELECT * FROM parcels WHERE id IN (:ids)")
    suspend fun findByIds(ids: List<String>): List<ParcelEntity>

    @Query("DELETE FROM parcels")
    suspend fun clearParcels()

    @Query("DELETE FROM parcel_events")
    suspend fun clearEvents()

    @Transaction
    suspend fun clearAll() {
        clearEvents()
        clearParcels()
    }
}

@Dao
interface ParcelDraftDao {
    @Query("SELECT * FROM parcel_drafts ORDER BY createdAtEpochMs DESC")
    fun observeAll(): Flow<List<ParcelDraftEntity>>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(draft: ParcelDraftEntity): Long

    @Query("SELECT * FROM parcel_drafts WHERE id = :id LIMIT 1")
    suspend fun find(id: String): ParcelDraftEntity?

    @Query("DELETE FROM parcel_drafts WHERE id = :id")
    suspend fun delete(id: String)

    @Query("DELETE FROM parcel_drafts")
    suspend fun clear()
}

@Dao
interface OperationDao {
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(operation: OperationEntity): Long

    @Query("UPDATE parcel_operation_journal SET state = :state, completedAtEpochMs = :completedAt WHERE id = :id")
    suspend fun complete(id: String, state: String, completedAt: Long)

    @Query("SELECT * FROM parcel_operation_journal ORDER BY createdAtEpochMs DESC LIMIT :limit")
    fun observeRecent(limit: Int = 100): Flow<List<OperationEntity>>

    @Query("SELECT * FROM parcel_operation_journal WHERE state = 'PENDING' ORDER BY createdAtEpochMs ASC")
    suspend fun pendingOperations(): List<OperationEntity>

    @Query("UPDATE parcel_operation_journal SET retryCount = retryCount + 1 WHERE id = :id")
    suspend fun incrementRetry(id: String)

    @Query("SELECT * FROM parcel_operation_journal WHERE idempotencyKey = :key LIMIT 1")
    suspend fun findByIdempotencyKey(key: String): OperationEntity?

    @Query("DELETE FROM parcel_operation_journal")
    suspend fun clear()
}
