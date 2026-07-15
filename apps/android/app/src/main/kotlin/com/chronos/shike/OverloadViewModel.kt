package com.chronos.shike

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.chronos.shike.load.LoadAnalysis
import com.chronos.shike.load.LoadExplanationEngine
import com.chronos.shike.load.LoadItem
import com.chronos.shike.load.LoadSourceType
import com.chronos.shike.load.LoadStatus
import com.chronos.shike.load.Negotiability
import com.chronos.shike.load.ResponsibilityType
import com.chronos.shike.recovery.DeLoadPlan
import com.chronos.shike.recovery.DeLoadPlanner
import com.chronos.shike.recovery.RecoveryRecommendationEngine
import com.chronos.shike.recovery.RecoverySuggestion
import com.chronos.shike.safety.SafetyResponse
import com.chronos.shike.safety.SafetyRouter
import com.chronos.shike.wellbeing.BodyTag
import com.chronos.shike.wellbeing.DailyCheckIn
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.InterventionPreference
import com.chronos.shike.wellbeing.PressureLevel
import com.chronos.shike.wellbeing.SleepLog
import com.chronos.shike.wellbeing.SuggestionFeedback
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.util.UUID
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class OverloadUiState(
    val onboardingComplete: Boolean = false,
    val todayCheckIn: DailyCheckIn? = null,
    val recentSleepLog: SleepLog? = null,
    val loadItems: List<LoadItem> = emptyList(),
    val loadAnalysis: LoadAnalysis? = null,
    val deLoadPlan: DeLoadPlan? = null,
    val recoverySuggestion: RecoverySuggestion? = null,
    val preference: InterventionPreference = InterventionPreference(),
    val isNightMode: Boolean = false,
    val safetyResponse: SafetyResponse? = null,
    val checkIns: List<DailyCheckIn> = emptyList(),
    val sleepLogs: List<SleepLog> = emptyList(),
    val suggestionFeedback: List<SuggestionFeedback> = emptyList(),
    val parcelConnectorEnabled: Boolean = false,
)

class OverloadViewModel(
    application: Application,
    val container: AppContainer,
) : AndroidViewModel(application) {

    private val loadEngine = LoadExplanationEngine()
    private val deLoadPlanner = DeLoadPlanner()
    private val recoveryEngine = RecoveryRecommendationEngine()
    private val safetyRouter = SafetyRouter()

    private val _uiState = MutableStateFlow(
        OverloadUiState(
            onboardingComplete = container.preferences.onboardingComplete,
            parcelConnectorEnabled = (application as ChronosApplication).parcelConnectorEnabled,
        )
    )
    val uiState: StateFlow<OverloadUiState> = _uiState.asStateFlow()

    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()

    init {
        refreshNightMode()
    }

    fun completeOnboarding() {
        container.preferences.onboardingComplete = true
        _uiState.update { it.copy(onboardingComplete = true) }
    }

    fun refreshNightMode() {
        val now = LocalTime.now()
        _uiState.update { it.copy(isNightMode = it.preference.isNight(now)) }
    }

    fun submitCheckIn(
        energyLevel: EnergyLevel?,
        pressureLevel: PressureLevel?,
        bodyTags: Set<BodyTag>,
        burdenText: String?,
    ) {
        val now = Instant.now()
        val today = LocalDate.now()
        val checkIn = DailyCheckIn(
            id = UUID.randomUUID().toString(),
            localDate = today,
            energyLevel = energyLevel,
            pressureLevel = pressureLevel,
            bodyTags = bodyTags,
            optionalBurdenText = burdenText?.takeIf(String::isNotBlank)?.take(240),
            createdAt = now,
            updatedAt = now,
        )
        _uiState.update { state ->
            state.copy(
                todayCheckIn = checkIn,
                checkIns = (state.checkIns.filterNot { it.localDate == today } + checkIn)
                    .sortedByDescending { it.createdAt },
            )
        }
        refreshAnalysis()
        refreshSafety(burdenText, bodyTags)
        _message.value = "已记录今天的签到"
    }

    fun submitSleepLog(
        sleepStart: LocalTime,
        wakeTime: LocalTime,
        longAwakening: Boolean?,
        feltRestored: Boolean?,
    ) {
        val now = Instant.now()
        val today = LocalDate.now()
        val duration = SleepLog.estimatedDuration(sleepStart, wakeTime)
        val log = SleepLog(
            id = UUID.randomUUID().toString(),
            sleepDate = today,
            approximateSleepStart = sleepStart,
            approximateWakeTime = wakeTime,
            estimatedDuration = duration,
            longAwakening = longAwakening,
            feltRestored = feltRestored,
            createdAt = now,
            updatedAt = now,
        )
        _uiState.update { state ->
            state.copy(
                recentSleepLog = log,
                sleepLogs = (state.sleepLogs.filterNot { it.sleepDate == today } + log)
                    .sortedByDescending { it.createdAt },
            )
        }
        refreshAnalysis()
        _message.value = "已记录作息"
    }

    fun addLoadItem(
        title: String,
        sourceType: LoadSourceType,
        dueAt: Instant?,
        estimatedEffortMinutes: Int,
        importance: Int,
        negotiability: Negotiability,
        responsibilityType: ResponsibilityType,
    ) {
        val now = Instant.now()
        val item = LoadItem(
            id = UUID.randomUUID().toString(),
            sourceType = sourceType,
            title = title.trim().take(160),
            dueAt = dueAt,
            estimatedEffortMinutes = estimatedEffortMinutes.coerceIn(0, 1440),
            importance = importance.coerceIn(1, 3),
            negotiability = negotiability,
            responsibilityType = responsibilityType,
            waitingSince = if (sourceType == LoadSourceType.WAITING_FOR) now else null,
            status = LoadStatus.ACTIVE,
            createdAt = now,
        )
        _uiState.update { it.copy(loadItems = it.loadItems + item) }
        refreshAnalysis()
        _message.value = "已添加：${item.title}"
    }

    fun deleteLoadItem(id: String) {
        _uiState.update { state ->
            state.copy(loadItems = state.loadItems.filterNot { it.id == id })
        }
        refreshAnalysis()
    }

    fun previewDeLoadPlan() {
        val state = _uiState.value
        val now = Instant.now()
        val plan = deLoadPlanner.preview(state.loadItems, LocalDate.now(), now)
        _uiState.update { it.copy(deLoadPlan = plan) }
    }

    fun confirmDeLoadPlan() {
        val state = _uiState.value
        val plan = state.deLoadPlan ?: return
        val now = Instant.now()
        val confirmed = deLoadPlanner.confirm(plan, now)
        val updatedItems = state.loadItems.map { item ->
            when (item.id) {
                in confirmed.deferItemIds -> item.copy(status = LoadStatus.DEFERRED)
                in confirmed.lowerStandardItemIds -> item.copy(status = LoadStatus.LOWERED_STANDARD)
                in confirmed.cancelItemIds -> item.copy(status = LoadStatus.CANCELLED)
                else -> item
            }
        }
        _uiState.update {
            it.copy(
                deLoadPlan = confirmed,
                loadItems = updatedItems,
            )
        }
        _message.value = "降载计划已应用，三十分钟内可撤销"
    }

    fun undoDeLoadPlan() {
        val state = _uiState.value
        val plan = state.deLoadPlan ?: return
        val restoredItems = state.loadItems.map { item ->
            if (item.id in plan.deferItemIds || item.id in plan.lowerStandardItemIds || item.id in plan.cancelItemIds) {
                item.copy(status = LoadStatus.ACTIVE)
            } else {
                item
            }
        }
        _uiState.update {
            it.copy(
                deLoadPlan = null,
                loadItems = restoredItems,
            )
        }
        _message.value = "降载计划已撤销，恢复原有状态"
    }

    fun saveAndStopToday() {
        _uiState.update { state ->
            val updatedItems = state.loadItems.map { item ->
                if (item.status == LoadStatus.ACTIVE) item.copy(status = LoadStatus.DEFERRED) else item
            }
            state.copy(loadItems = updatedItems)
        }
        _message.value = "今天的进度已保存，可以安心休息了"
    }

    fun recordSuggestionFeedback(
        suggestionId: String,
        decision: String,
        modified: Boolean = false,
        helpfulness: Int? = null,
        userComment: String? = null,
    ) {
        val feedback = SuggestionFeedback(
            suggestionId = suggestionId,
            decision = decision,
            modified = modified,
            helpfulness = helpfulness?.coerceIn(1, 5),
            nextDayEnergy = null,
            userComment = userComment?.takeIf(String::isNotBlank)?.take(240),
            createdAt = Instant.now(),
        )
        _uiState.update { state ->
            val newPreference = if (decision == "declined") state.preference.recordDecline() else state.preference
            state.copy(
                suggestionFeedback = state.suggestionFeedback + feedback,
                preference = newPreference,
            )
        }
        _message.value = when (decision) {
            "accepted" -> "已采纳建议"
            "modified" -> "已记录调整后的方案"
            "declined" -> "已忽略建议，不会频繁提醒"
            else -> "已记录反馈"
        }
    }

    fun updatePreference(preference: InterventionPreference) {
        _uiState.update { it.copy(preference = preference) }
        refreshNightMode()
    }

    fun setNightModeEnabled(enabled: Boolean) {
        _uiState.update { it.copy(preference = it.preference.copy(nightModeEnabled = enabled)) }
        refreshNightMode()
    }

    fun setNightModeTime(start: LocalTime, end: LocalTime) {
        _uiState.update { it.copy(preference = it.preference.copy(nightModeStart = start, nightModeEnd = end)) }
        refreshNightMode()
    }

    fun setLoadAnalysisEnabled(enabled: Boolean) {
        _uiState.update { it.copy(preference = it.preference.copy(loadAnalysisEnabled = enabled)) }
        if (!enabled) {
            _uiState.update { it.copy(loadAnalysis = null, recoverySuggestion = null) }
        }
    }

    fun setSafetyAnalysisEnabled(enabled: Boolean) {
        _uiState.update { it.copy(preference = it.preference.copy(safetyExpressionAnalysisEnabled = enabled)) }
        if (!enabled) {
            _uiState.update { it.copy(safetyResponse = null) }
        }
    }

    fun routeSafety(userText: String?, bodyTags: Set<BodyTag>) {
        refreshSafety(userText, bodyTags)
    }

    fun dismissSafetyResponse() {
        _uiState.update { it.copy(safetyResponse = null) }
    }

    fun clearAllData() {
        _uiState.update {
            it.copy(
                todayCheckIn = null,
                recentSleepLog = null,
                loadItems = emptyList(),
                loadAnalysis = null,
                deLoadPlan = null,
                recoverySuggestion = null,
                safetyResponse = null,
                checkIns = emptyList(),
                sleepLogs = emptyList(),
                suggestionFeedback = emptyList(),
            )
        }
        _message.value = "全部数据已清除"
    }

    fun deleteCheckIn(id: String) {
        _uiState.update { state ->
            val updated = state.checkIns.filterNot { it.id == id }
            state.copy(
                checkIns = updated,
                todayCheckIn = if (state.todayCheckIn?.id == id) null else state.todayCheckIn,
            )
        }
        refreshAnalysis()
    }

    fun exportMaskedData(): String {
        val state = _uiState.value
        val sb = StringBuilder()
        sb.append("{\"schemaVersion\":1,\"exportedAt\":\"")
        sb.append(Instant.now().toString())
        sb.append("\",\"checkIns\":[")
        state.checkIns.forEachIndexed { index, ci ->
            if (index > 0) sb.append(",")
            sb.append("{\"date\":\"")
            sb.append(ci.localDate.toString())
            sb.append("\",\"energy\":\"")
            sb.append(ci.energyLevel?.name ?: "unknown")
            sb.append("\",\"pressure\":\"")
            sb.append(ci.pressureLevel?.name ?: "unknown")
            sb.append("\",\"bodyTags\":[")
            ci.bodyTags.forEachIndexed { i, tag ->
                if (i > 0) sb.append(",")
                sb.append("\"").append(tag.name.lowercase()).append("\"")
            }
            sb.append("]}")
        }
        sb.append("],\"sleepLogs\":[")
        state.sleepLogs.forEachIndexed { index, sl ->
            if (index > 0) sb.append(",")
            sb.append("{\"date\":\"")
            sb.append(sl.sleepDate.toString())
            sb.append("\",\"start\":\"")
            sb.append(sl.approximateSleepStart.toString())
            sb.append("\",\"wake\":\"")
            sb.append(sl.approximateWakeTime.toString())
            sb.append("\",\"durationMinutes\":")
            sb.append(sl.estimatedDuration.toMinutes())
            sb.append(",\"restored\":")
            sb.append(sl.feltRestored?.toString() ?: "null")
            sb.append("}")
        }
        sb.append("],\"loadItems\":[")
        state.loadItems.forEachIndexed { index, li ->
            if (index > 0) sb.append(",")
            sb.append("{\"title\":\"")
            sb.append(escapeJson(li.title))
            sb.append("\",\"type\":\"")
            sb.append(li.sourceType.name.lowercase())
            sb.append("\",\"status\":\"")
            sb.append(li.status.name.lowercase())
            sb.append("\",\"effortMinutes\":")
            sb.append(li.estimatedEffortMinutes)
            sb.append("}")
        }
        sb.append("]}")
        return sb.toString()
    }

    fun clearMessage() {
        _message.value = null
    }

    private fun refreshSafety(userText: String?, bodyTags: Set<BodyTag>) {
        val state = _uiState.value
        if (!state.preference.safetyExpressionAnalysisEnabled) return
        val response = safetyRouter.route(userText, bodyTags)
        _uiState.update { it.copy(safetyResponse = response) }
    }

    private fun refreshAnalysis() {
        val state = _uiState.value
        if (!state.preference.loadAnalysisEnabled) return
        val now = Instant.now()
        val today = LocalDate.now()
        val availableTimeMinutes = 480
        val personalHistoryDays = maxOf(state.checkIns.size, state.sleepLogs.size)
        val analysis = loadEngine.analyze(
            items = state.loadItems,
            checkIn = state.todayCheckIn,
            sleepLog = state.recentSleepLog,
            availableTimeMinutes = availableTimeMinutes,
            personalHistoryDays = personalHistoryDays,
            now = now,
            localDate = today,
        )
        val suggestion = recoveryEngine.recommend(analysis, state.todayCheckIn, today, now)
        _uiState.update {
            it.copy(
                loadAnalysis = analysis,
                recoverySuggestion = suggestion,
            )
        }
    }

    private fun escapeJson(value: String): String =
        value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r")

    class Factory(
        private val application: Application,
        private val container: AppContainer,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T = OverloadViewModel(application, container) as T
    }
}
