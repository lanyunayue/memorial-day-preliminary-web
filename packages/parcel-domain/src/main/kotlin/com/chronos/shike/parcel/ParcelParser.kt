package com.chronos.shike.parcel

import com.chronos.shike.contract.ConfidenceBand
import com.chronos.shike.temporal.DynamicTimeWindow
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.time.Clock
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId

class ParcelParser(
    private val clock: Clock = Clock.systemDefaultZone(),
    private val zoneId: ZoneId = ZoneId.systemDefault(),
) {
    fun parse(text: String): ParsedParcelEvent? {
        val normalized = normalize(text)
        if (normalized.isBlank() || isExplicitNoise(normalized) || !hasParcelSignal(normalized)) return null

        val status = detectStatus(normalized)
        val trackingMatches = TRACKING_PATTERNS.flatMap { pattern -> pattern.findAll(normalized).map { it.groupValues[1] }.toList() }.distinct()
        val tracking = trackingMatches.firstOrNull()
        val pickupCode = detectPickupCode(normalized)
        val location = LOCATION_PATTERNS.firstNotNullOfOrNull { pattern ->
            pattern.find(normalized)?.groupValues?.get(1)?.trim()?.takeIf { it.length in 2..40 }
        }
        val carrier = CARRIERS.entries.firstOrNull { (_, aliases) -> aliases.any(normalized::contains) }?.key ?: "unknown"
        val eta = detectEta(normalized)
        val signalCount = listOf(tracking, pickupCode, location, eta).count { it != null } +
            (if (carrier != "unknown") 1 else 0) +
            (if (status != ParcelStatus.DISCOVERED) 1 else 0)
        val confidence = when {
            trackingMatches.size > 1 -> ConfidenceBand.LOW
            signalCount >= 3 -> ConfidenceBand.HIGH
            signalCount >= 2 -> ConfidenceBand.MEDIUM
            else -> ConfidenceBand.LOW
        }

        return ParsedParcelEvent(
            carrier = carrier,
            trackingNumber = tracking,
            orderReference = ORDER_PATTERN.find(normalized)?.groupValues?.get(1),
            status = status,
            pickupCode = pickupCode,
            pickupLocation = location,
            eta = eta,
            confidenceBand = confidence,
            parcelLikely = confidence != ConfidenceBand.LOW || status != ParcelStatus.DISCOVERED,
            fingerprint = sha256(redact(normalized)),
        )
    }

    fun normalize(text: String): String = text
        .replace('\u00A0', ' ')
        .replace(Regex("[\\r\\n\\t]+"), " ")
        .replace(Regex("\\s+"), " ")
        .trim()

    fun redact(text: String): String = normalize(text)
        .replace(PHONE_PATTERN, "[phone]")
        .replace(PICKUP_CODE_CONTEXT_PATTERN) { "${it.groupValues[1]}[pickup-code]" }
        .replace(TRACKING_CONTEXT_PATTERN) { "${it.groupValues[1]}[tracking-number]" }
        .replace(ADDRESS_PATTERN, "[address]")

    private fun detectPickupCode(text: String): String? {
        val match = PICKUP_CODE_CONTEXT_PATTERN.find(text) ?: return null
        val candidate = match.groupValues[2].replace(Regex("\\s+"), "")
        if (!candidate.contains('-') || candidate.length !in 5..14) return null
        if (text.contains("验证码") || text.contains("校验码") || text.contains("登录码")) return null
        return candidate
    }

    private fun detectStatus(text: String): ParcelStatus {
        val pickupPlaceReached = listOf("驿站", "快递柜", "号柜").any(text::contains) &&
            listOf("已到达", "己到", "已存入", "已放入", "可领取", "取件地点").any(text::contains)
        if (pickupPlaceReached) return ParcelStatus.READY_FOR_PICKUP
        return STATUS_RULES.firstOrNull { (_, terms) -> terms.any(text::contains) }
            ?.first ?: ParcelStatus.DISCOVERED
    }

    private fun detectEta(text: String): DynamicTimeWindow? {
        val today = LocalDate.now(clock)
        val date = when {
            text.contains("明天") || text.contains("明日") -> today.plusDays(1)
            text.contains("今天") || text.contains("今日") -> today
            else -> return null
        }
        val hour = HOUR_PATTERN.find(text)?.groupValues?.get(1)?.toIntOrNull()?.coerceIn(0, 23)
        val before = text.contains("前")
        val startTime = if (hour == null || before) LocalTime.MIN else LocalTime.of(hour, 0)
        val endTime = if (hour == null) LocalTime.MAX else LocalTime.of(hour, if (before) 0 else 59)
        val now = clock.instant()
        return DynamicTimeWindow(
            start = date.atTime(startTime).atZone(zoneId).toInstant(),
            end = date.atTime(endTime).atZone(zoneId).toInstant(),
            confidenceBand = ConfidenceBand.MEDIUM,
            source = "notification-estimate",
            lastUpdatedAt = now,
        )
    }

    private fun hasParcelSignal(text: String): Boolean = PARCEL_TERMS.any(text::contains) ||
        CARRIERS.values.flatten().any(text::contains)

    private fun isExplicitNoise(text: String): Boolean = NOISE_TERMS.any(text::contains) &&
        PARCEL_TERMS.none(text::contains)

    companion object {
        // Explicit carriers win over aggregator and pickup-station brands when both occur.
        private val CARRIERS = linkedMapOf(
            "sf" to listOf("顺丰", "SF速运"),
            "jd" to listOf("京东物流", "京东快递"),
            "yto" to listOf("圆通"),
            "zto" to listOf("中通"),
            "sto" to listOf("申通"),
            "yunda" to listOf("韵达"),
            "jnt" to listOf("极兔"),
            "ems" to listOf("EMS", "邮政快递"),
            "cainiao" to listOf("菜鸟"),
            "fengchao" to listOf("丰巢"),
        )
        private val PARCEL_TERMS = listOf("快递", "快件", "包裹", "取件", "驿站", "快递柜", "运单", "物流", "派送")
        private val NOISE_TERMS = listOf("验证码", "银行", "余额", "转账", "登录", "好友", "聊天", "营销")
        private val STATUS_RULES = listOf(
            ParcelStatus.PICKED_UP to listOf("已取件", "已领取"),
            ParcelStatus.RETURNED to listOf("已退回", "退回中", "退货"),
            ParcelStatus.EXCEPTION to listOf("异常", "延迟", "延误", "无法派送"),
            ParcelStatus.READY_FOR_PICKUP to listOf("待取", "凭取件码", "到驿站领取", "请到", "已存入"),
            ParcelStatus.DELIVERED to listOf("已签收", "签收成功"),
            ParcelStatus.OUT_FOR_DELIVERY to listOf("派送中", "正在派送", "配送中"),
            ParcelStatus.ARRIVED_LOCAL_STATION to listOf("到达驿站", "到达站点", "到达营业点"),
            ParcelStatus.IN_TRANSIT to listOf("运输中", "转运中", "运输途中"),
            ParcelStatus.SHIPPED to listOf("已发货", "已揽收"),
            ParcelStatus.AWAITING_SHIPMENT to listOf("等待发货", "待发货"),
        )
        private val TRACKING_PATTERNS = listOf(
            Regex("(?:运单号|快递单号|物流单号|单号)[：: ]*([A-Z0-9]{8,24})", RegexOption.IGNORE_CASE),
            Regex("\\b((?:SF|YT|ZT|STO|JT|EMS)[A-Z0-9]{7,20})\\b", RegexOption.IGNORE_CASE),
        )
        private val TRACKING_CONTEXT_PATTERN = Regex("((?:运单号|快递单号|物流单号|单号)[：: ]*)([A-Z0-9]{8,24})", RegexOption.IGNORE_CASE)
        private val PICKUP_CODE_CONTEXT_PATTERN = Regex("((?:取件码|提货码|凭)[：: ]*)([0-9]{1,3}(?:\\s*-\\s*[0-9]{1,5}){1,3})")
        private val LOCATION_PATTERNS = listOf(
            Regex("(?:(?:已)?到达|送至|前往|至|到)([^，。；;]{2,30}(?:驿站|快递柜|服务点|营业点|号柜))"),
            Regex("([^，。；;]{2,30}(?:菜鸟驿站|丰巢(?:快递柜)?|快递柜|驿站|号柜))"),
        )
        private val ORDER_PATTERN = Regex("(?:订单号|订单)[：: ]*([A-Z0-9-]{6,30})", RegexOption.IGNORE_CASE)
        private val PHONE_PATTERN = Regex("(?<!\\d)1[3-9]\\d{9}(?!\\d)")
        private val ADDRESS_PATTERN = Regex("[\\u4e00-\\u9fa5]{2,}(?:省|市|区|县|街道|路|巷|弄)\\S{0,40}")
        private val HOUR_PATTERN = Regex("(\\d{1,2})\\s*(?:点|:00)")

        private fun sha256(value: String): String = MessageDigest.getInstance("SHA-256")
            .digest(value.toByteArray(StandardCharsets.UTF_8))
            .joinToString("") { "%02x".format(it) }
    }
}
