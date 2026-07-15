package com.chronos.shike.load

import com.chronos.shike.wellbeing.DailyCheckIn
import com.chronos.shike.wellbeing.SleepLog
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

data class LoadAnalysis(val snapshot: LoadSnapshot, val explanation: OverloadExplanation)

class LoadExplanationEngine {
    fun analyze(
        items: List<LoadItem>,
        checkIn: DailyCheckIn?,
        sleepLog: SleepLog?,
        availableTimeMinutes: Int,
        personalHistoryDays: Int,
        now: Instant,
        localDate: LocalDate,
    ): LoadAnalysis {
        val active = items.filter { it.status in setOf(LoadStatus.ACTIVE, LoadStatus.DEFERRED, LoadStatus.LOWERED_STANDARD) }
        val overdue = active.count { it.dueAt?.isBefore(now) == true }
        val dueSoon = active.count { due -> due.dueAt?.let { !it.isBefore(now) && Duration.between(now, it).toHours() <= 24 } == true }
        val effort = active.sumOf(LoadItem::estimatedEffortMinutes)
        val missing = buildList {
            if (active.none { it.estimatedEffortMinutes > 0 }) add("任务预计耗时")
            if (checkIn == null) add("今日状态签到")
            if (sleepLog == null) add("最近手动作息")
            if (personalHistoryDays < 7) add("至少七天个人历史")
        }
        val reasons = buildList {
            if (overdue > 0) add("有 $overdue 项已超过自己记录的截止时间")
            if (dueSoon > 0) add("未来二十四小时有 $dueSoon 项临近截止")
            if (effort > availableTimeMinutes) add("记录的预计耗时超过今天剩余可用时间")
            active.count { it.sourceType == LoadSourceType.COMMITMENT }.
                takeIf { it > 0 }?.let { add("有 $it 项对外承诺仍在进行") }
            active.count { it.sourceType == LoadSourceType.WAITING_FOR }.
                takeIf { it > 0 }?.let { add("有 $it 项长期等待占用注意力") }
        }
        val snapshot = LoadSnapshot(
            id = UUID.randomUUID().toString(), localDate = localDate,
            activeTaskCount = active.size, dueSoonCount = dueSoon, overdueCount = overdue,
            commitmentCount = active.count { it.sourceType == LoadSourceType.COMMITMENT },
            waitingCount = active.count { it.sourceType == LoadSourceType.WAITING_FOR },
            estimatedEffortMinutes = effort, availableTimeMinutes = availableTimeMinutes.coerceAtLeast(0),
            recoveryWindowMinutes = (24 * 60 - availableTimeMinutes.coerceIn(0, 24 * 60)).coerceAtLeast(0),
            baselineComparison = if (personalHistoryDays >= 7) "今天的记录可与个人常态进行初步比较" else null,
            evidenceCompleteness = if (missing.isEmpty()) "sufficient" else "partial",
            createdAt = now,
        )
        val visible = when {
            reasons.isEmpty() -> "现有记录没有显示需要立即压缩的事项。"
            else -> reasons.joinToString("；", postfix = "。")
        } + if (personalHistoryDays < 7) "目前记录不足，无法与个人常态比较。" else ""
        return LoadAnalysis(snapshot, OverloadExplanation(
            id = UUID.randomUUID().toString(), snapshotId = snapshot.id, reasons = reasons,
            evidence = active.map { "${it.sourceType.name.lowercase()}:${it.id}" }, missingData = missing,
            confidenceBand = if (missing.size <= 1) "moderate" else "limited",
            userVisibleText = visible, createdAt = now,
        ))
    }
}
