package com.chronos.shike.parcel

import java.time.Clock
import java.time.LocalDate
import java.time.ZoneId

data class AssistantParcelResult(
    val intent: AssistantIntent,
    val parcels: List<Parcel>,
    val message: String,
    val requiresSensitiveReveal: Boolean = false,
)

enum class AssistantIntent { PICKUP_LIST, PENDING_COUNT, ARRIVING_TODAY, PICKUP_CODE, LOCATION, MARK_PICKED_UP, HIDE_CODE, CLEAR_ALL, UNKNOWN }

class AssistantQueryEngine(
    private val clock: Clock = Clock.systemDefaultZone(),
    private val zoneId: ZoneId = ZoneId.systemDefault(),
) {
    fun query(command: String, parcels: Collection<Parcel>): AssistantParcelResult {
        val normalized = command.trim().replace(Regex("[。？！?！]"), "")
        val active = parcels.filter { it.currentStatus !in setOf(ParcelStatus.PICKED_UP, ParcelStatus.RETURNED, ParcelStatus.ARCHIVED) }
        val pending = active.filter { it.currentStatus in setOf(ParcelStatus.READY_FOR_PICKUP, ParcelStatus.ARRIVED_LOCAL_STATION) }
        return when {
            normalized.contains("清除所有") -> AssistantParcelResult(AssistantIntent.CLEAR_ALL, emptyList(), "清除全部数据需要再次确认")
            normalized.contains("隐藏取件码") -> AssistantParcelResult(AssistantIntent.HIDE_CODE, emptyList(), "取件码已保持遮挡")
            normalized.contains("已经拿") || normalized.contains("已取件") -> AssistantParcelResult(AssistantIntent.MARK_PICKED_UP, pending.take(1), if (pending.isEmpty()) "没有可标记的待取快递" else "请确认标记为已取件")
            normalized.contains("取件码") -> AssistantParcelResult(AssistantIntent.PICKUP_CODE, pending, pendingMessage(pending), true)
            normalized.contains("几个") || normalized.contains("多少") -> AssistantParcelResult(AssistantIntent.PENDING_COUNT, pending, "目前有 ${pending.size} 个待取快递")
            normalized.contains("今天") && normalized.contains("到") -> {
                val today = LocalDate.now(clock)
                val matches = active.filter { parcel -> parcel.eta?.start?.atZone(zoneId)?.toLocalDate() == today }
                AssistantParcelResult(AssistantIntent.ARRIVING_TODAY, matches, if (matches.isEmpty()) "今天没有已识别的预计到达快递" else "今天预计到达 ${matches.size} 个快递")
            }
            normalized.contains("在哪") || normalized.contains("哪个快递在") || normalized.contains("驿站") -> {
                val locationTerm = normalized.substringAfter("在", "").takeIf { it.isNotBlank() }
                val matches = if (locationTerm == null) pending else active.filter { it.pickupLocation?.contains(locationTerm) == true }
                AssistantParcelResult(AssistantIntent.LOCATION, matches, pendingMessage(matches))
            }
            normalized.contains("拿快递") || normalized.contains("待取") -> AssistantParcelResult(AssistantIntent.PICKUP_LIST, pending, pendingMessage(pending))
            else -> AssistantParcelResult(AssistantIntent.UNKNOWN, emptyList(), "我只能查询本机保存的快递状态、地点和待取信息")
        }
    }

    private fun pendingMessage(items: List<Parcel>) = if (items.isEmpty()) "目前没有待取快递" else "目前有 ${items.size} 个待取快递"
}
