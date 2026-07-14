package com.chronos.shike.capture

import android.content.ComponentName
import android.content.Context
import android.provider.Settings
import com.chronos.shike.AutomationMode
import com.chronos.shike.ChronosPreferences
import com.chronos.shike.contract.ConfidenceBand
import com.chronos.shike.contract.ConsentScope
import com.chronos.shike.contract.EventEnvelope
import com.chronos.shike.contract.EventSourceAdapter
import com.chronos.shike.contract.EventSourceType
import com.chronos.shike.contract.PermissionStatus
import com.chronos.shike.contract.Sensitivity
import com.chronos.shike.contract.SourceHealth
import com.chronos.shike.parcel.ParcelParser
import com.chronos.shike.parcel.ParcelAutomationPolicy
import com.chronos.shike.storage.CaptureResult
import com.chronos.shike.storage.ParcelRepository
import com.chronos.shike.util.CryptoUtils
import java.time.Instant

data class NotificationInput(
    val sourcePackage: String,
    val sourceLabel: String,
    val title: String?,
    val text: String?,
    val occurredAt: Instant,
)

class NotificationSourceAdapter(
    private val context: Context,
    private val repository: ParcelRepository,
    private val preferences: ChronosPreferences,
    private val parser: ParcelParser = ParcelParser(),
) : EventSourceAdapter<NotificationInput> {
    private val automationPolicy = ParcelAutomationPolicy()
    @Volatile private var active = false

    override fun start() { active = true }
    override fun stop() { active = false }

    override fun permissionStatus(): PermissionStatus {
        val enabled = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners").orEmpty()
            .split(':')
            .mapNotNull(ComponentName::unflattenFromString)
            .any { it.packageName == context.packageName }
        return if (enabled) PermissionStatus.GRANTED else PermissionStatus.NOT_GRANTED
    }

    fun isAllowed(packageName: String): Boolean =
        preferences.automationMode != AutomationMode.MANUAL && packageName in preferences.allowedPackages()

    override fun capture(input: NotificationInput): EventEnvelope? {
        if (!active || !isAllowed(input.sourcePackage)) return null
        val normalized = normalize(listOfNotNull(input.title, input.text).joinToString("。"))
        val parsed = parser.parse(normalized) ?: return null
        if (!parsed.parcelLikely) return null
        val now = Instant.now()
        return EventEnvelope(
            sourceType = EventSourceType.NOTIFICATION,
            sourcePackage = input.sourcePackage,
            sourceLabel = input.sourceLabel,
            occurredAt = input.occurredAt,
            receivedAt = now,
            eventType = "parcel.${parsed.status.name.lowercase()}",
            entities = buildMap {
                put("carrier", parsed.carrier)
                put("status", parsed.status.name)
                parsed.trackingNumber?.let { put("trackingNumberMasked", com.chronos.shike.parcel.maskTrackingNumber(it)) }
            },
            sensitivity = if (parsed.pickupCode == null) Sensitivity.PERSONAL else Sensitivity.HIGHLY_SENSITIVE,
            confidenceBand = parsed.confidenceBand,
            consentScope = ConsentScope(input.sourcePackage, true, now),
            deduplicationKey = CryptoUtils.sha256("${input.sourcePackage}:${parsed.fingerprint}:${parsed.status}"),
            rawContentRetained = false,
        )
    }

    suspend fun process(input: NotificationInput): CaptureResult {
        val envelope = capture(input) ?: return CaptureResult.Ignored
        val inMemoryText = listOfNotNull(input.title, input.text).joinToString("。")
        val parsed = parser.parse(inMemoryText) ?: return CaptureResult.Ignored
        val autoOrganize = preferences.automationMode == AutomationMode.AUTO_ORGANIZE &&
            automationPolicy.canApplyWithoutConfirmation(parsed)
        return repository.capture(envelope, inMemoryText, autoOrganize)
    }

    override fun normalize(input: NotificationInput): String = normalize(listOfNotNull(input.title, input.text).joinToString("。"))
    fun normalize(input: String): String = parser.normalize(input)
    override fun redact(input: NotificationInput): String = parser.redact(normalize(input))
    override fun health() = SourceHealth(active && permissionStatus() == PermissionStatus.GRANTED, "notification-listener")
    override fun revoke() { stop() }
}

data class UserProvidedInput(val text: String, val occurredAt: Instant = Instant.now())

class UserProvidedSourceAdapter(
    private val sourceType: EventSourceType,
    private val sourcePackage: String,
    private val parser: ParcelParser = ParcelParser(),
) : EventSourceAdapter<UserProvidedInput> {
    private var active = true
    override fun start() { active = true }
    override fun stop() { active = false }
    override fun permissionStatus() = PermissionStatus.NOT_REQUIRED
    override fun capture(input: UserProvidedInput): EventEnvelope? {
        if (!active) return null
        val parsed = parser.parse(input.text) ?: return null
        val now = Instant.now()
        return EventEnvelope(
            sourceType = sourceType,
            sourcePackage = sourcePackage,
            sourceLabel = if (sourceType == EventSourceType.SHARE) "系统分享" else "手动记录",
            occurredAt = input.occurredAt,
            receivedAt = now,
            eventType = "parcel.${parsed.status.name.lowercase()}",
            entities = mapOf("carrier" to parsed.carrier, "status" to parsed.status.name),
            sensitivity = if (parsed.pickupCode == null) Sensitivity.PERSONAL else Sensitivity.HIGHLY_SENSITIVE,
            confidenceBand = parsed.confidenceBand,
            consentScope = ConsentScope(sourcePackage, true, now),
            deduplicationKey = CryptoUtils.sha256("$sourceType:${parsed.fingerprint}"),
        )
    }
    override fun normalize(input: UserProvidedInput) = parser.normalize(input.text)
    override fun redact(input: UserProvidedInput) = parser.redact(input.text)
    override fun health() = SourceHealth(active, sourceType.name.lowercase())
    override fun revoke() { stop() }
}

class ShareSourceAdapter(parser: ParcelParser = ParcelParser()) : EventSourceAdapter<UserProvidedInput> by
    UserProvidedSourceAdapter(EventSourceType.SHARE, "user.share", parser)

class ManualSourceAdapter(parser: ParcelParser = ParcelParser()) : EventSourceAdapter<UserProvidedInput> by
    UserProvidedSourceAdapter(EventSourceType.MANUAL, "user.manual", parser)
