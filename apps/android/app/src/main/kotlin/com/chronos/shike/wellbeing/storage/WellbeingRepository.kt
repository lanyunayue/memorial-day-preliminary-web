package com.chronos.shike.wellbeing.storage

import android.util.Log
import androidx.room.withTransaction
import com.chronos.shike.load.LoadItem
import com.chronos.shike.load.LoadSnapshot
import com.chronos.shike.load.LoadSourceType
import com.chronos.shike.load.LoadStatus
import com.chronos.shike.load.Negotiability
import com.chronos.shike.load.ResponsibilityType
import com.chronos.shike.recovery.DeLoadPlan
import com.chronos.shike.storage.RecoveryReport
import com.chronos.shike.util.CryptoUtils
import com.chronos.shike.util.safeEnumValueOf
import com.chronos.shike.wellbeing.BodyTag
import com.chronos.shike.wellbeing.DailyCheckIn
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.InterventionPreference
import com.chronos.shike.wellbeing.PressureLevel
import com.chronos.shike.wellbeing.SleepLog
import com.chronos.shike.wellbeing.SuggestionFeedback
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.UUID
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

class WellbeingRepository(
    private val database: WellbeingDatabase,
) {

    // ------------------------------------------------------------------ observers

    fun observeCheckIns(): Flow<List<DailyCheckIn>> =
        database.dailyCheckInDao().observeAll().map { rows -> rows.map(::toCheckInDomain) }

    fun observeSleepLogs(): Flow<List<SleepLog>> =
        database.sleepLogDao().observeAll().map { rows -> rows.map(::toSleepLogDomain) }

    fun observeLoadItems(): Flow<List<LoadItem>> =
        database.loadItemDao().observeAll().map { rows -> rows.map(::toLoadItemDomain) }

    fun observeLatestSnapshot(): Flow<LoadSnapshot?> =
        database.loadSnapshotDao().observeLatest().map { it?.let(::toSnapshotDomain) }

    fun observeLatestDeLoadPlan(): Flow<DeLoadPlan?> =
        database.deLoadPlanDao().observeLatest().map { it?.let(::toDeLoadPlanDomain) }

    fun observeSuggestionFeedback(): Flow<List<SuggestionFeedbackEntity>> =
        database.suggestionFeedbackDao().observeAll()

    fun observeOperations(): Flow<List<WellbeingOperationEntity>> =
        database.wellbeingOperationDao().observeRecent()

    // ------------------------------------------------------------------ writes

    suspend fun addCheckIn(checkIn: DailyCheckIn) {
        journaled("ADD_CHECKIN", checkIn.id, "checkin:${checkIn.id}:${checkIn.localDate}") {
            database.dailyCheckInDao().insert(toCheckInEntity(checkIn))
        }
    }

    suspend fun addSleepLog(sleepLog: SleepLog) {
        journaled("ADD_SLEEP_LOG", sleepLog.id, "sleep:${sleepLog.id}:${sleepLog.sleepDate}") {
            database.sleepLogDao().insert(toSleepLogEntity(sleepLog))
        }
    }

    suspend fun addLoadItem(item: LoadItem) {
        journaled("ADD_LOAD_ITEM", item.id, "loaditem:${item.id}") {
            database.loadItemDao().insert(toLoadItemEntity(item))
        }
    }

    suspend fun addSnapshot(snapshot: LoadSnapshot) {
        journaled("ADD_SNAPSHOT", snapshot.id, "snapshot:${snapshot.id}:${snapshot.localDate}") {
            database.loadSnapshotDao().insert(toSnapshotEntity(snapshot))
        }
    }

    suspend fun addSuggestionFeedback(feedback: SuggestionFeedback) {
        journaled("ADD_FEEDBACK", feedback.suggestionId, "feedback:${feedback.suggestionId}") {
            database.suggestionFeedbackDao().insert(toFeedbackEntity(feedback))
        }
    }

    suspend fun saveInterventionPreference(preference: InterventionPreference) {
        journaled("SAVE_PREFERENCE", null, "preference:1") {
            database.interventionPreferenceDao().upsert(toPreferenceEntity(preference))
        }
    }

    suspend fun getInterventionPreference(): InterventionPreference {
        val entity = database.interventionPreferenceDao().find()
        return if (entity != null) toPreferenceDomain(entity) else InterventionPreference()
    }

    // ------------------------------------------------------------------ de-load plans

    suspend fun createDeLoadPlan(plan: DeLoadPlan) {
        journaled("CREATE_DELOAD", plan.id, "deload:${plan.id}") {
            database.deLoadPlanDao().insert(toDeLoadPlanEntity(plan))
        }
    }

    suspend fun confirmDeLoadPlan(planId: String): Boolean {
        val plan = database.deLoadPlanDao().findLatest() ?: return false
        if (plan.id != planId) return false
        val now = System.currentTimeMillis()
        val undoWindowMs = 30L * 60 * 1000 // 30 minutes
        val updated = plan.copy(
            userConfirmed = true,
            appliedAtEpochMs = now,
            undoUntilEpochMs = now + undoWindowMs,
        )
        journaled("CONFIRM_DELOAD", planId, "deload-confirm:$planId") {
            database.deLoadPlanDao().insert(updated)
        }
        return true
    }

    suspend fun undoDeLoadPlan(planId: String): Boolean {
        val plan = database.deLoadPlanDao().findLatest() ?: return false
        if (plan.id != planId) return false
        val now = System.currentTimeMillis()
        if (plan.undoUntilEpochMs == null) return false
        if (now > plan.undoUntilEpochMs) return false
        journaled("UNDO_DELOAD", planId, "deload-undo:$planId") {
            database.deLoadPlanDao().clear()
        }
        return true
    }

    // ------------------------------------------------------------------ recovery

    suspend fun recoverPendingOperations(): RecoveryReport {
        val pending = database.wellbeingOperationDao().pendingOperations()
        if (pending.isEmpty()) return RecoveryReport(0, 0, 0)
        var recovered = 0
        var quarantined = 0
        for (op in pending) {
            database.wellbeingOperationDao().incrementRetry(op.id)
            val canRecover = when (op.type) {
                "ADD_CHECKIN", "ADD_SLEEP_LOG", "ADD_LOAD_ITEM", "ADD_SNAPSHOT",
                "ADD_FEEDBACK", "SAVE_PREFERENCE", "CREATE_DELOAD",
                "CONFIRM_DELOAD", "UNDO_DELOAD", "CLEAR_ALL" -> true
                else -> false
            }
            if (canRecover) {
                database.wellbeingOperationDao().complete(op.id, "COMPLETED", System.currentTimeMillis())
                recovered++
            } else {
                database.wellbeingOperationDao().complete(op.id, "QUARANTINED", System.currentTimeMillis())
                quarantined++
            }
        }
        return RecoveryReport(pending.size, recovered, quarantined)
    }

    // ------------------------------------------------------------------ maintenance

    suspend fun clearAllWellbeingData() {
        journaled("CLEAR_ALL", null, "clear:" + System.currentTimeMillis()) {
            database.withTransaction {
                database.dailyCheckInDao().clear()
                database.sleepLogDao().clear()
                database.loadItemDao().clear()
                database.loadSnapshotDao().clear()
                database.suggestionFeedbackDao().clear()
                database.deLoadPlanDao().clear()
                database.wellbeingOperationDao().clear()
            }
        }
    }

    suspend fun exportMasked(): String {
        val checkIns = database.dailyCheckInDao().observeAll().first()
        val sleepLogs = database.sleepLogDao().observeAll().first()
        val loadItems = database.loadItemDao().findAll()
        val snapshot = database.loadSnapshotDao().observeLatest().first()
        val feedback = database.suggestionFeedbackDao().observeAll().first()
        val deLoadPlan = database.deLoadPlanDao().observeLatest().first()

        return buildString {
            append("{\"schemaVersion\":1,\"dailyCheckIns\":[")
            checkIns.joinTo(this) { row ->
                "{\"id\":\"${escape(row.id)}\",\"date\":\"${row.localDate}\",\"energy\":${jsonString(row.energyLevel)},\"pressure\":${jsonString(row.pressureLevel)},\"bodyTags\":\"${escape(row.bodyTags)}\",\"burdenText\":\"masked\"}"
            }
            append("],\"sleepLogs\":[")
            sleepLogs.joinTo(this) { row ->
                "{\"id\":\"${escape(row.id)}\",\"date\":\"${row.sleepDate}\",\"durationMinutes\":${row.estimatedDurationMinutes},\"restored\":${row.feltRestored ?: "null"}}"
            }
            append("],\"loadItems\":[")
            loadItems.joinTo(this) { row ->
                "{\"id\":\"${escape(row.id)}\",\"type\":\"${row.sourceType}\",\"title\":\"masked\",\"status\":\"${row.status}\",\"effortMinutes\":${row.estimatedEffortMinutes}}"
            }
            append("],\"snapshot\":")
            if (snapshot != null) {
                append("{\"date\":\"${snapshot.localDate}\",\"activeTaskCount\":${snapshot.activeTaskCount},\"overdueCount\":${snapshot.overdueCount}}")
            } else {
                append("null")
            }
            append(",\"feedback\":[")
            feedback.joinTo(this) { row ->
                "{\"suggestionId\":\"${escape(row.suggestionId)}\",\"decision\":\"${row.decision}\",\"helpfulness\":${row.helpfulness ?: "null"},\"comment\":\"masked\"}"
            }
            append("],\"deLoadPlan\":")
            if (deLoadPlan != null) {
                append("{\"id\":\"${escape(deLoadPlan.id)}\",\"date\":\"${deLoadPlan.localDate}\",\"confirmed\":${deLoadPlan.userConfirmed}}")
            } else {
                append("null")
            }
            append("}")
        }
    }

    // ------------------------------------------------------------------ journaled operation

    private suspend fun journaled(type: String, itemId: String?, idempotencyKey: String, block: suspend () -> Unit) {
        val id = UUID.randomUUID().toString()
        val safePayload = listOfNotNull(type, itemId).joinToString(":")
        val inserted = database.wellbeingOperationDao().insert(
            WellbeingOperationEntity(
                id = id,
                type = type,
                itemId = itemId,
                idempotencyKey = idempotencyKey,
                safePayloadHash = CryptoUtils.sha256(safePayload),
                state = "PENDING",
                safePayload = safePayload,
                createdAt = System.currentTimeMillis(),
                completedAt = null,
                retryCount = 0,
            ),
        )
        if (inserted == -1L) return
        runCatching { block() }
            .onSuccess { database.wellbeingOperationDao().complete(id, "COMPLETED", System.currentTimeMillis()) }
            .onFailure {
                Log.e("WellbeingRepository", "Operation $type ($idempotencyKey) failed", it)
                database.wellbeingOperationDao().complete(id, "QUARANTINED", System.currentTimeMillis())
            }
            .getOrThrow()
    }

    // ------------------------------------------------------------------ entity <-> domain mappers

    private fun toCheckInEntity(checkIn: DailyCheckIn) = DailyCheckInEntity(
        id = checkIn.id,
        localDate = checkIn.localDate.toString(),
        energyLevel = checkIn.energyLevel?.name,
        pressureLevel = checkIn.pressureLevel?.name,
        bodyTags = checkIn.bodyTags.joinToString("|") { it.name },
        optionalBurdenText = checkIn.optionalBurdenText,
        createdAt = checkIn.createdAt.toEpochMilli(),
        updatedAt = checkIn.updatedAt.toEpochMilli(),
        source = checkIn.source,
        schemaVersion = checkIn.schemaVersion,
    )

    private fun toCheckInDomain(row: DailyCheckInEntity) = DailyCheckIn(
        id = row.id,
        localDate = LocalDate.parse(row.localDate),
        energyLevel = row.energyLevel?.let { name -> safeEnumValueOf(name, EnergyLevel.VERY_LOW) },
        pressureLevel = row.pressureLevel?.let { name -> safeEnumValueOf(name, PressureLevel.LOW) },
        bodyTags = row.bodyTags.split('|').filter(String::isNotBlank).map { safeEnumValueOf(it, BodyTag.OK) }.toSet(),
        optionalBurdenText = row.optionalBurdenText,
        createdAt = Instant.ofEpochMilli(row.createdAt),
        updatedAt = Instant.ofEpochMilli(row.updatedAt),
        source = row.source,
        schemaVersion = row.schemaVersion,
    )

    private fun toSleepLogEntity(sleepLog: SleepLog) = SleepLogEntity(
        id = sleepLog.id,
        sleepDate = sleepLog.sleepDate.toString(),
        approximateSleepStart = sleepLog.approximateSleepStart.toString(),
        approximateWakeTime = sleepLog.approximateWakeTime.toString(),
        estimatedDurationMinutes = sleepLog.estimatedDuration.toMinutes(),
        longAwakening = sleepLog.longAwakening,
        feltRestored = sleepLog.feltRestored,
        source = sleepLog.source,
        confidence = sleepLog.confidence,
        createdAt = sleepLog.createdAt.toEpochMilli(),
        updatedAt = sleepLog.updatedAt.toEpochMilli(),
        schemaVersion = sleepLog.schemaVersion,
    )

    private fun toSleepLogDomain(row: SleepLogEntity) = SleepLog(
        id = row.id,
        sleepDate = LocalDate.parse(row.sleepDate),
        approximateSleepStart = LocalTime.parse(row.approximateSleepStart),
        approximateWakeTime = LocalTime.parse(row.approximateWakeTime),
        estimatedDuration = Duration.ofMinutes(row.estimatedDurationMinutes),
        longAwakening = row.longAwakening,
        feltRestored = row.feltRestored,
        source = row.source,
        confidence = row.confidence,
        createdAt = Instant.ofEpochMilli(row.createdAt),
        updatedAt = Instant.ofEpochMilli(row.updatedAt),
        schemaVersion = row.schemaVersion,
    )

    private fun toLoadItemEntity(item: LoadItem) = LoadItemEntity(
        id = item.id,
        sourceType = item.sourceType.name,
        title = item.title,
        dueAtEpochMs = item.dueAt?.toEpochMilli(),
        estimatedEffortMinutes = item.estimatedEffortMinutes,
        importance = item.importance,
        negotiability = item.negotiability.name,
        responsibilityType = item.responsibilityType.name,
        waitingSinceEpochMs = item.waitingSince?.toEpochMilli(),
        status = item.status.name,
        createdAt = item.createdAt.toEpochMilli(),
        schemaVersion = item.schemaVersion,
    )

    private fun toLoadItemDomain(row: LoadItemEntity) = LoadItem(
        id = row.id,
        sourceType = safeEnumValueOf(row.sourceType, LoadSourceType.TASK),
        title = row.title,
        dueAt = row.dueAtEpochMs?.let(Instant::ofEpochMilli),
        estimatedEffortMinutes = row.estimatedEffortMinutes,
        importance = row.importance,
        negotiability = safeEnumValueOf(row.negotiability, Negotiability.FIXED),
        responsibilityType = safeEnumValueOf(row.responsibilityType, ResponsibilityType.SELF_CHOSEN),
        waitingSince = row.waitingSinceEpochMs?.let(Instant::ofEpochMilli),
        status = safeEnumValueOf(row.status, LoadStatus.ACTIVE),
        createdAt = Instant.ofEpochMilli(row.createdAt),
        schemaVersion = row.schemaVersion,
    )

    private fun toSnapshotEntity(snapshot: LoadSnapshot) = LoadSnapshotEntity(
        id = snapshot.id,
        localDate = snapshot.localDate.toString(),
        activeTaskCount = snapshot.activeTaskCount,
        dueSoonCount = snapshot.dueSoonCount,
        overdueCount = snapshot.overdueCount,
        commitmentCount = snapshot.commitmentCount,
        waitingCount = snapshot.waitingCount,
        estimatedEffortMinutes = snapshot.estimatedEffortMinutes,
        availableTimeMinutes = snapshot.availableTimeMinutes,
        recoveryWindowMinutes = snapshot.recoveryWindowMinutes,
        baselineComparison = snapshot.baselineComparison,
        evidenceCompleteness = snapshot.evidenceCompleteness,
        createdAt = snapshot.createdAt.toEpochMilli(),
        schemaVersion = snapshot.schemaVersion,
    )

    private fun toSnapshotDomain(row: LoadSnapshotEntity) = LoadSnapshot(
        id = row.id,
        localDate = LocalDate.parse(row.localDate),
        activeTaskCount = row.activeTaskCount,
        dueSoonCount = row.dueSoonCount,
        overdueCount = row.overdueCount,
        commitmentCount = row.commitmentCount,
        waitingCount = row.waitingCount,
        estimatedEffortMinutes = row.estimatedEffortMinutes,
        availableTimeMinutes = row.availableTimeMinutes,
        recoveryWindowMinutes = row.recoveryWindowMinutes,
        baselineComparison = row.baselineComparison,
        evidenceCompleteness = row.evidenceCompleteness,
        createdAt = Instant.ofEpochMilli(row.createdAt),
        schemaVersion = row.schemaVersion,
    )

    private fun toFeedbackEntity(feedback: SuggestionFeedback) = SuggestionFeedbackEntity(
        suggestionId = feedback.suggestionId,
        decision = feedback.decision,
        modified = feedback.modified,
        helpfulness = feedback.helpfulness,
        nextDayEnergy = feedback.nextDayEnergy?.name,
        userComment = feedback.userComment,
        createdAt = feedback.createdAt.toEpochMilli(),
    )

    private fun toFeedbackDomain(row: SuggestionFeedbackEntity) = SuggestionFeedback(
        suggestionId = row.suggestionId,
        decision = row.decision,
        modified = row.modified,
        helpfulness = row.helpfulness,
        nextDayEnergy = row.nextDayEnergy?.let { name -> safeEnumValueOf(name, EnergyLevel.STEADY) },
        userComment = row.userComment,
        createdAt = Instant.ofEpochMilli(row.createdAt),
    )

    private fun toDeLoadPlanEntity(plan: DeLoadPlan) = DeLoadPlanEntity(
        id = plan.id,
        localDate = plan.localDate.toString(),
        keepItemIds = plan.keepItemIds.joinToString("|"),
        deferItemIds = plan.deferItemIds.joinToString("|"),
        lowerStandardItemIds = plan.lowerStandardItemIds.joinToString("|"),
        renegotiateItemIds = plan.renegotiateItemIds.joinToString("|"),
        cancelItemIds = plan.cancelItemIds.joinToString("|"),
        saveAndStop = plan.saveAndStop,
        userConfirmed = plan.userConfirmed,
        appliedAtEpochMs = plan.appliedAt?.toEpochMilli(),
        undoUntilEpochMs = plan.undoUntil?.toEpochMilli(),
    )

    private fun toDeLoadPlanDomain(row: DeLoadPlanEntity) = DeLoadPlan(
        id = row.id,
        localDate = LocalDate.parse(row.localDate),
        keepItemIds = row.keepItemIds.split('|').filter(String::isNotBlank),
        deferItemIds = row.deferItemIds.split('|').filter(String::isNotBlank),
        lowerStandardItemIds = row.lowerStandardItemIds.split('|').filter(String::isNotBlank),
        renegotiateItemIds = row.renegotiateItemIds.split('|').filter(String::isNotBlank),
        cancelItemIds = row.cancelItemIds.split('|').filter(String::isNotBlank),
        saveAndStop = row.saveAndStop,
        userConfirmed = row.userConfirmed,
        appliedAt = row.appliedAtEpochMs?.let(Instant::ofEpochMilli),
        undoUntil = row.undoUntilEpochMs?.let(Instant::ofEpochMilli),
    )

    private fun toPreferenceEntity(pref: InterventionPreference) = InterventionPreferenceEntity(
        id = 1,
        nightModeStart = pref.nightModeStart.toString(),
        nightModeEnd = pref.nightModeEnd.toString(),
        nightModeEnabled = pref.nightModeEnabled,
        loadAnalysisEnabled = pref.loadAnalysisEnabled,
        safetyExpressionAnalysisEnabled = pref.safetyExpressionAnalysisEnabled,
        suggestionFrequency = pref.suggestionFrequency,
        consecutiveDeclines = pref.consecutiveDeclines,
        snoozedUntilEpochMs = pref.snoozedUntil?.toEpochMilli(),
        disabledSuggestionTypes = pref.disabledSuggestionTypes.joinToString("|"),
    )

    private fun toPreferenceDomain(row: InterventionPreferenceEntity) = InterventionPreference(
        nightModeStart = LocalTime.parse(row.nightModeStart),
        nightModeEnd = LocalTime.parse(row.nightModeEnd),
        nightModeEnabled = row.nightModeEnabled,
        loadAnalysisEnabled = row.loadAnalysisEnabled,
        safetyExpressionAnalysisEnabled = row.safetyExpressionAnalysisEnabled,
        suggestionFrequency = row.suggestionFrequency,
        consecutiveDeclines = row.consecutiveDeclines,
        snoozedUntil = row.snoozedUntilEpochMs?.let(Instant::ofEpochMilli),
        disabledSuggestionTypes = row.disabledSuggestionTypes.split('|').filter(String::isNotBlank).toSet(),
    )

    // ------------------------------------------------------------------ json helpers

    private fun escape(value: String): String = buildString {
        for (c in value) {
            when (c) {
                '\\' -> append("\\\\")
                '"' -> append("\\\"")
                '\n' -> append("\\n")
                '\r' -> append("\\r")
                '\t' -> append("\\t")
                '\b' -> append("\\b")
                '\u000C' -> append("\\f")
                '/' -> append("\\/")
                else -> if (c.code < 0x20) {
                    append("\\u%04x".format(c.code))
                } else {
                    append(c)
                }
            }
        }
    }

    private fun jsonString(value: String?): String = value?.let { "\"${escape(it)}\"" } ?: "null"
}
