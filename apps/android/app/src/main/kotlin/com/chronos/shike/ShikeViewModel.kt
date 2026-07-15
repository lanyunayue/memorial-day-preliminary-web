package com.chronos.shike

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.chronos.shike.capture.UserProvidedInput
import com.chronos.shike.capture.ManualSourceAdapter
import com.chronos.shike.capture.ShareSourceAdapter
import com.chronos.shike.parcel.AssistantParcelResult
import com.chronos.shike.parcel.AssistantQueryEngine
import com.chronos.shike.parcel.Parcel
import com.chronos.shike.parcel.ParcelParser
import com.chronos.shike.storage.OperationEntity
import com.chronos.shike.storage.ParcelDraftEntity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class ShikeUiState(
    val parcels: List<Parcel> = emptyList(),
    val drafts: List<ParcelDraftEntity> = emptyList(),
    val operations: List<OperationEntity> = emptyList(),
)

data class SharePreview(
    val originalText: String,
    val carrier: String,
    val status: String,
    val location: String?,
    val hasPickupCode: Boolean,
    val confidence: String,
)

class ShikeViewModel(
    application: Application,
    val container: AppContainer,
) : AndroidViewModel(application) {
    private val assistant = AssistantQueryEngine()
    private val parser = ParcelParser()
    private val shareAdapter = ShareSourceAdapter()
    private val manualAdapter = ManualSourceAdapter()
    private val _assistantResult = MutableStateFlow<AssistantParcelResult?>(null)
    val assistantResult: StateFlow<AssistantParcelResult?> = _assistantResult
    private val _sharePreview = MutableStateFlow<SharePreview?>(null)
    val sharePreview: StateFlow<SharePreview?> = _sharePreview
    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message

    val uiState: StateFlow<ShikeUiState> = combine(
        container.repository.observeParcels(),
        container.repository.observeDrafts(),
        container.repository.observeOperations(),
    ) { parcels, drafts, operations -> ShikeUiState(parcels, drafts, operations) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ShikeUiState())

    fun completeOnboarding(mode: AutomationMode) {
        container.preferences.automationMode = mode
        container.preferences.onboardingComplete = true
    }

    fun setMode(mode: AutomationMode) { container.preferences.automationMode = mode }
    fun setPackageAllowed(packageName: String, allowed: Boolean) = container.preferences.setPackageAllowed(packageName, allowed)

    fun ask(command: String) {
        _assistantResult.value = assistant.query(command, uiState.value.parcels)
    }

    fun prepareShare(text: String) {
        val parsed = parser.parse(text)
        _sharePreview.value = parsed?.let {
            SharePreview(text, it.carrier, it.status.name, it.pickupLocation, it.pickupCode != null, it.confidenceBand.name)
        }
        if (parsed == null) _message.value = "未识别到可信快递信息，原文不会保存"
    }

    fun confirmShare() {
        val preview = _sharePreview.value ?: return
        viewModelScope.launch {
            val input = UserProvidedInput(preview.originalText)
            val envelope = shareAdapter.capture(input)
            val saved = envelope?.let { container.repository.captureConfirmed(it, preview.originalText) }
            _message.value = if (saved == null) "未保存：内容不足以形成快递记录" else "快递记录已保存"
            _sharePreview.value = null
        }
    }

    fun addManual(text: String) {
        viewModelScope.launch {
            val input = UserProvidedInput(text)
            val envelope = manualAdapter.capture(input)
            val saved = envelope?.let { container.repository.captureConfirmed(it, text) }
            _message.value = if (saved == null) "没有识别到可保存的快递信息" else "已添加快递记录"
        }
    }

    fun confirmDraft(id: String) = viewModelScope.launch {
        _message.value = if (container.repository.confirmDraft(id) == null) "草稿已失效" else "草稿已确认"
    }
    fun dismissDraft(id: String) = viewModelScope.launch { container.repository.dismissDraft(id) }
    fun markPickedUp(id: String) = viewModelScope.launch { container.repository.markPickedUp(id) }
    fun deleteParcel(id: String) = viewModelScope.launch { container.repository.deleteParcel(id) }

    fun clearAll(after: (() -> Unit)? = null) = viewModelScope.launch {
        container.repository.clearAll()
        _message.value = "本地快递、草稿与敏感密钥已清除"
        after?.invoke()
    }

    fun revokeAndClear(after: () -> Unit) {
        container.notificationSource?.revoke()
        container.preferences.clearCaptureSettings()
        clearAll(after)
    }

    suspend fun exportMasked(): String = container.repository.exportMasked()
    fun clearMessage() { _message.value = null }
    fun dismissShare() { _sharePreview.value = null }

    class Factory(
        private val application: Application,
        private val container: AppContainer,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T = ShikeViewModel(application, container) as T
    }
}
