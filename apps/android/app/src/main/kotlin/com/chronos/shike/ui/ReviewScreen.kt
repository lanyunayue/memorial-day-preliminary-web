package com.chronos.shike.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Bedtime
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.chronos.shike.OverloadUiState
import com.chronos.shike.OverloadViewModel
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.PressureLevel

@Composable
fun ReviewScreen(
    viewModel: OverloadViewModel,
    state: OverloadUiState,
) {
    val checkIns = state.checkIns
    val sleepLogs = state.sleepLogs
    val hasInsufficientData = checkIns.size < 7 || sleepLogs.size < 7

    LazyColumn(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            OverloadCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Outlined.TrendingUp,
                        contentDescription = "回顾",
                        tint = MaterialTheme.colorScheme.primary,
                    )
                    Spacer(Modifier.width(10.dp))
                    SectionTitle(text = "次日反馈")
                }
                val recentSuggestion = state.recoverySuggestion
                if (recentSuggestion != null) {
                    Text(
                        text = "昨天的建议是：" + recentSuggestion.rationale,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Text(
                        text = "今天感觉怎么样？",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                    )
                    Spacer(Modifier.height(4.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        EnergyLevel.entries.forEach { level ->
                            OutlinedButton(
                                onClick = {
                                    viewModel.recordSuggestionFeedback(
                                        suggestionId = recentSuggestion.id,
                                        decision = "accepted",
                                        helpfulness = null,
                                    )
                                },
                            ) {
                                Text(energyTextShort(level))
                            }
                        }
                    }
                } else {
                    Text(
                        text = "还没有建议记录。签到或添加事项后，这里会显示次日反馈。",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        item {
            OverloadCard {
                SectionTitle(text = "周度负荷变化")
                val snapshot = state.loadAnalysis?.snapshot
                if (snapshot != null) {
                    InfoLine("任务数", snapshot.activeTaskCount.toString())
                    InfoLine("承诺数", snapshot.commitmentCount.toString())
                    InfoLine("等待数", snapshot.waitingCount.toString())
                    InfoLine("预计耗时", "${snapshot.estimatedEffortMinutes / 60} 小时 ${snapshot.estimatedEffortMinutes % 60} 分钟")
                } else {
                    Text(
                        text = "添加任务和签到后，这里会显示负荷变化。",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        item {
            OverloadCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Outlined.Bedtime,
                        contentDescription = "作息",
                        tint = MaterialTheme.colorScheme.primary,
                    )
                    Spacer(Modifier.width(10.dp))
                    SectionTitle(text = "作息变化")
                }
                if (sleepLogs.isEmpty()) {
                    Text(
                        text = "还没有作息记录。",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                } else {
                    sleepLogs.take(7).forEach { log ->
                        InfoLine(
                            label = log.sleepDate.toString(),
                            value = "${log.approximateSleepStart}-${log.approximateWakeTime} " +
                                "(${log.estimatedDuration.toMinutes() / 60}h${log.estimatedDuration.toMinutes() % 60}m)",
                        )
                    }
                }
            }
        }

        item {
            OverloadCard {
                SectionTitle(text = "精力和压力趋势")
                if (checkIns.isEmpty()) {
                    Text(
                        text = "还没有签到记录。",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                } else {
                    checkIns.take(7).forEach { ci ->
                        InfoLine(
                            label = ci.localDate.toString(),
                            value = listOfNotNull(
                                ci.energyLevel?.let { "精力:${energyTextShort(it)}" },
                                ci.pressureLevel?.let { "压力:${pressureTextShort(it)}" },
                            ).joinToString("  "),
                        )
                    }
                }
            }
        }

        item {
            OverloadCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Outlined.Info,
                        contentDescription = "关联说明",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(Modifier.width(10.dp))
                    SectionTitle(text = "观察到的关联")
                }
                if (checkIns.size >= 3 && sleepLogs.size >= 3) {
                    val lowEnergyDays = checkIns.filter {
                        it.energyLevel == EnergyLevel.VERY_LOW || it.energyLevel == EnergyLevel.LOW
                    }
                    val shortSleepDays = sleepLogs.filter { it.estimatedDuration.toMinutes() < 360 }
                    if (lowEnergyDays.isNotEmpty() && shortSleepDays.isNotEmpty()) {
                        Text(
                            text = "在记录中，睡眠时间较短的日子，精力签到也偏低。",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    } else {
                        Text(
                            text = "目前没有明显的关联模式。",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Text(
                        text = "以上仅为观察到的关联，不代表因果关系。",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                } else {
                    Text(
                        text = "记录不足三天，暂无法观察关联。",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        if (hasInsufficientData) {
            item {
                OverloadCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Outlined.Info,
                            contentDescription = "数据说明",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Spacer(Modifier.width(10.dp))
                        SectionTitle(text = "数据不足说明")
                    }
                    Text(
                        text = "目前记录不足七天，趋势和关联仅供参考。持续记录后，回顾会更准确。",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

private fun energyTextShort(level: EnergyLevel): String = when (level) {
    EnergyLevel.VERY_LOW -> "很低"
    EnergyLevel.LOW -> "偏低"
    EnergyLevel.STEADY -> "一般"
    EnergyLevel.ENOUGH -> "充足"
}

private fun pressureTextShort(level: PressureLevel): String = when (level) {
    PressureLevel.LOW -> "较低"
    PressureLevel.MEDIUM -> "中等"
    PressureLevel.HIGH -> "偏高"
    PressureLevel.VERY_HIGH -> "很高"
}
