package com.chronos.shike.wellbeing.storage

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface DailyCheckInDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(checkIn: DailyCheckInEntity)

    @Query("SELECT * FROM wellbeing_daily_checkins WHERE id = :id LIMIT 1")
    suspend fun find(id: String): DailyCheckInEntity?

    @Query("SELECT * FROM wellbeing_daily_checkins WHERE localDate = :date LIMIT 1")
    suspend fun findByDate(date: String): DailyCheckInEntity?

    @Query("SELECT * FROM wellbeing_daily_checkins ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<DailyCheckInEntity>>

    @Query("SELECT * FROM wellbeing_daily_checkins WHERE localDate = :date")
    fun observeByDate(date: String): Flow<List<DailyCheckInEntity>>

    @Query("DELETE FROM wellbeing_daily_checkins WHERE id = :id")
    suspend fun delete(id: String)

    @Query("DELETE FROM wellbeing_daily_checkins")
    suspend fun clear()
}

@Dao
interface SleepLogDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(sleepLog: SleepLogEntity)

    @Query("SELECT * FROM wellbeing_sleep_logs WHERE id = :id LIMIT 1")
    suspend fun find(id: String): SleepLogEntity?

    @Query("SELECT * FROM wellbeing_sleep_logs WHERE sleepDate = :date LIMIT 1")
    suspend fun findByDate(date: String): SleepLogEntity?

    @Query("SELECT * FROM wellbeing_sleep_logs ORDER BY sleepDate DESC")
    fun observeAll(): Flow<List<SleepLogEntity>>

    @Query("SELECT * FROM wellbeing_sleep_logs ORDER BY createdAt DESC LIMIT 1")
    fun observeLatest(): Flow<SleepLogEntity?>

    @Query("DELETE FROM wellbeing_sleep_logs WHERE id = :id")
    suspend fun delete(id: String)

    @Query("DELETE FROM wellbeing_sleep_logs")
    suspend fun clear()
}

@Dao
interface LoadItemDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(loadItem: LoadItemEntity)

    @Query("SELECT * FROM wellbeing_load_items WHERE id = :id LIMIT 1")
    suspend fun find(id: String): LoadItemEntity?

    @Query("SELECT * FROM wellbeing_load_items ORDER BY createdAt DESC")
    suspend fun findAll(): List<LoadItemEntity>

    @Query("SELECT * FROM wellbeing_load_items ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<LoadItemEntity>>

    @Update
    suspend fun update(loadItem: LoadItemEntity)

    @Query("DELETE FROM wellbeing_load_items WHERE id = :id")
    suspend fun delete(id: String)

    @Query("DELETE FROM wellbeing_load_items")
    suspend fun clear()
}

@Dao
interface LoadSnapshotDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(snapshot: LoadSnapshotEntity)

    @Query("SELECT * FROM wellbeing_load_snapshots ORDER BY createdAt DESC LIMIT 1")
    suspend fun findLatest(): LoadSnapshotEntity?

    @Query("SELECT * FROM wellbeing_load_snapshots ORDER BY createdAt DESC LIMIT 1")
    fun observeLatest(): Flow<LoadSnapshotEntity?>

    @Query("DELETE FROM wellbeing_load_snapshots")
    suspend fun clear()
}

@Dao
interface WellbeingOperationDao {
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(operation: WellbeingOperationEntity): Long

    @Query("SELECT * FROM wellbeing_operation_journal WHERE idempotencyKey = :key LIMIT 1")
    suspend fun findByIdempotencyKey(key: String): WellbeingOperationEntity?

    @Query("SELECT * FROM wellbeing_operation_journal WHERE state = 'PENDING' ORDER BY createdAt ASC")
    suspend fun pendingOperations(): List<WellbeingOperationEntity>

    @Query("UPDATE wellbeing_operation_journal SET state = :state, completedAt = :completedAt WHERE id = :id")
    suspend fun complete(id: String, state: String, completedAt: Long)

    @Query("UPDATE wellbeing_operation_journal SET retryCount = retryCount + 1 WHERE id = :id")
    suspend fun incrementRetry(id: String)

    @Query("SELECT * FROM wellbeing_operation_journal ORDER BY createdAt DESC LIMIT :limit")
    fun observeRecent(limit: Int = 100): Flow<List<WellbeingOperationEntity>>

    @Query("DELETE FROM wellbeing_operation_journal")
    suspend fun clear()
}

@Dao
interface SuggestionFeedbackDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(feedback: SuggestionFeedbackEntity)

    @Query("SELECT * FROM wellbeing_suggestion_feedback ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<SuggestionFeedbackEntity>>

    @Query("DELETE FROM wellbeing_suggestion_feedback")
    suspend fun clear()
}

@Dao
interface DeLoadPlanDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(plan: DeLoadPlanEntity)

    @Query("SELECT * FROM wellbeing_deload_plans ORDER BY localDate DESC LIMIT 1")
    suspend fun findLatest(): DeLoadPlanEntity?

    @Query("SELECT * FROM wellbeing_deload_plans ORDER BY localDate DESC LIMIT 1")
    fun observeLatest(): Flow<DeLoadPlanEntity?>

    @Query("DELETE FROM wellbeing_deload_plans")
    suspend fun clear()
}

@Dao
interface InterventionPreferenceDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(preference: InterventionPreferenceEntity)

    @Query("SELECT * FROM wellbeing_intervention_preferences WHERE id = 1 LIMIT 1")
    suspend fun find(): InterventionPreferenceEntity?
}
