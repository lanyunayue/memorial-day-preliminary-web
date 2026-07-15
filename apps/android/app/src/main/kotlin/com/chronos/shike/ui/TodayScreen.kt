@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)

package com.chronos.shike.ui

import com.chronos.shike.load.LoadItem

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Bedtime
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.DoNotDisturb
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Mood
import androidx.compose.material.icons.outlined.Nightlight
import androidx.compose.material.icons.outlined.Save
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material.icons.outlined.SentimentSatisfied
import androidx.compose.material.icons.outlined.TipsAndUpdates
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.chronos.shike.OverloadUiState
import com.chronos.shike.OverloadViewModel
import com.chronos.shike.load.LoadSourceType
import com.chronos.shike.load.LoadStatus
import com.chronos.shike.recovery.RecoveryActionType
import com.chronos.shike.wellbeing.BodyTag
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.PressureLevel

@Composable
fun TodayScreen(
    viewModel: OverloadViewModel,
    state: OverloadUiState,
    onNavigateToDeLoad: () -> Unit,
) {
    var showCheckInSheet by remember { mutableStateOf(false) }
    var showSleepLogSheet by remember { mutableStateOf(false) }

    LazyColumn(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        if (state.isNightMode) {
            item {
                NightModeBanner(viewModel, state, onNavigateToDeLoad)
            }
        }

        item {
            LoadSummaryCard(state)
        }

        state.loadItems
            .filter { it.status == LoadStatus.ACTIVE }
            .sortedWith(compareByDescending<LoadItem> { it.importance }.thenBy { it.dueAt?.toEpochMilli() ?: Long.MAX_VALUE })
            .firstOrNull()
            ?.let { important ->
                item {
                    HighlightCard {
                        Text(
                            text = "今晚最重要的一项",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                        )
                        Text(
                            text = important.title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                        )
                        Text(
                            text = sourceTypeText(important.sourceType) +
                                if (important.dueAt != null) " . 有截止时间" else "",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                        )
                    }
                }
            }

        item {
            OverloadCard {
                SectionTitle(text = "十秒签到")
                val checkIn = state.todayCheckIn
                if (checkIn != null) {
                    Text(
                        text = "今天已签到",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    checkIn.energyLevel?.let {
                        Text("精力：${energyText(it)}", style = MaterialTheme.typography.bodySmall)
                    }
                    checkIn.pressureLevel?.let {
                        Text("压力：${pressureText(it)}", style = MaterialTheme.typography.bodySmall)
                    }
                    if (checkIn.bodyTags.isNotEmpty()) {
                        Text(
                            text = "身体：" + checkIn.bodyTags.joinToString("、") { bodyTagText(it) },
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                    checkIn.optionalBurdenText?.let {
                        Text("一句话：$it", style = MaterialTheme.typography.bodySmall)
                    }
                } else {
                    Text(
                        text = "花十秒记录一下现在的状态，所有字段都可以跳过。",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.height(4.dp))
                OutlinedButton(
                    onClick = { showCheckInSheet = true },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Icon(Icons.Outlined.Edit, contentDescription = "签到")
                    Spacer(Modifier.width(8.dp))
                    Text(if (checkIn != null) "更新签到" else "去签到")
                }
            }
        }

        item {
            OverloadCard {
                SectionTitle(text = "作息记录")
                val sleep = state.recentSleepLog
                if (sleep != null) {
                    Text(
                        text = "昨晚 ${sleep.approximateSleepStart} 到今早 ${sleep.approximateWakeTime}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Text(
                        text = "时长约 ${sleep.estimatedDuration.toMinutes() / 60} 小时 ${sleep.estimatedDuration.toMinutes() % 60} 分钟",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                } else {
                    Text(
                        text = "还没有记录作息。填大概的时间就好。",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.height(4.dp))
                OutlinedButton(
                    onClick = { showSleepLogSheet = true },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Icon(Icons.Outlined.Bedtime, contentDescription = "作息记录")
                    Spacer(Modifier.width(8.dp))
                    Text("记录作息")
                }
            }
        }

        state.recoverySuggestion?.let { suggestion ->
            item {
                OverloadCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Outlined.TipsAndUpdates,
                            contentDescription = "恢复建议",
                            tint = MaterialTheme.colorScheme.primary,
                        )
                        Spacer(Modifier.width(10.dp))
                        SectionTitle(text = "下一步恢复建议")
                    }
                    Text(
                        text = suggestion.rationale,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Spacer(Modifier.height(4.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = {
                            viewModel.recordSuggestionFeedback(
                                suggestionId = suggestion.id,
                                decision = "accepted",
                            )
                        }) {
                            Icon(Icons.Outlined.Check, contentDescription = null)
                            Spacer(Modifier.width(6.dp))
                            Text("有帮助")
                        }
                        OutlinedButton(onClick = {
                            viewModel.recordSuggestionFeedback(
                                suggestionId = suggestion.id,
                                decision = "declined",
                            )
                        }) {
                            Text("暂时不需要")
                        }
                    }
                }
            }
        }

        state.loadAnalysis?.explanation?.let { explanation ->
            if (explanation.missingData.isNotEmpty()) {
                item {
                    OverloadCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Outlined.Info,
                                contentDescription = "数据说明",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            Spacer(Modifier.width(10.dp))
                            SectionTitle(text = "数据说明")
                        }
                        Text(
                            text = "目前还缺少：" +
                                explanation.missingData.joinToString("、"),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Text(
                            text = "记录越多，建议越有参考价值。但不强制补全。",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }
    }

    if (showCheckInSheet) {
        CheckInSheet(
            onDismiss = { showCheckInSheet = false },
            onSave = { energy, pressure, bodyTags, burden ->
                viewModel.submitCheckIn(energy, pressure, bodyTags, burden)
                showCheckInSheet = false
            },
        )
    }

    if (showSleepLogSheet) {
        SleepLogSheet(
            onDismiss = { showSleepLogSheet = false },
            onSave = { start, wake, longAwake, restored ->
                viewModel.submitSleepLog(start, wake, longAwake, restored)
                showSleepLogSheet = false
            },
        )
    }
}

@Composable
private fun NightModeBanner(
    viewModel: OverloadViewModel,
    state: OverloadUiState,
    onNavigateToDeLoad: () -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
        ),
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Outlined.Nightlight,
                    contentDescription = "深夜模式",
                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    text = "现在已经很晚",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            }

            state.loadItems
                .filter { it.status == LoadStatus.ACTIVE }
                .sortedWith(compareByDescending<LoadItem> { it.importance }.thenBy { it.dueAt?.toEpochMilli() ?: Long.MAX_VALUE })
                .firstOrNull()
                ?.let { item ->
                    Text(
                        text = "今晚最重要的一项：${item.title}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                    )
                }

            Button(
                onClick = {
                    viewModel.previewDeLoadPlan()
                    onNavigateToDeLoad()
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(Icons.Outlined.Tune, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("一键降载")
            }

            Button(
                onClick = { viewModel.saveAndStopToday() },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(Icons.Outlined.Save, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("保存并结束今天")
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = {
                        val sid = state.recoverySuggestion?.id ?: ""
                        viewModel.recordSuggestionFeedback(sid, "snoozed")
                    },
                    modifier = Modifier.weight(1f),
                ) {
                    Icon(Icons.Outlined.Schedule, contentDescription = null)
                    Spacer(Modifier.width(6.dp))
                    Text("继续二十分钟")
                }
                OutlinedButton(
                    onClick = {
                        val sid = state.recoverySuggestion?.id ?: ""
                        viewModel.recordSuggestionFeedback(sid, "declined")
                    },
                    modifier = Modifier.weight(1f),
                ) {
                    Icon(Icons.Outlined.SentimentSatisfied, contentDescription = null)
                    Spacer(Modifier.width(6.dp))
                    Text("状态还好")
                }
            }

            TextButton(
                onClick = { viewModel.setNightModeEnabled(false) },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(Icons.Outlined.DoNotDisturb, contentDescription = null)
                Spacer(Modifier.width(6.dp))
                Text("不再提醒")
            }
        }
    }
}

@Composable
private fun LoadSummaryCard(state: OverloadUiState) {
    val snapshot = state.loadAnalysis?.snapshot
    OverloadCard {
        SectionTitle(text = "当前负荷摘要")
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            MetricBox(
                value = (snapshot?.activeTaskCount ?: state.loadItems.count { it.status == LoadStatus.ACTIVE }).toString(),
                label = "任务",
                modifier = Modifier.weight(1f),
            )
            MetricBox(
                value = (snapshot?.commitmentCount
                    ?: state.loadItems.count { it.sourceType == LoadSourceType.COMMITMENT && it.status == LoadStatus.ACTIVE }).toString(),
                label = "承诺",
                modifier = Modifier.weight(1f),
            )
            MetricBox(
                value = (snapshot?.waitingCount
                    ?: state.loadItems.count { it.sourceType == LoadSourceType.WAITING_FOR }).toString(),
                label = "等待",
                modifier = Modifier.weight(1f),
            )
        }
        if (snapshot == null) {
            Text(
                text = "添加任务或签到后，这里会显示负荷摘要。",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun MetricBox(
    value: String,
    label: String,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

private fun energyText(level: EnergyLevel): String = when (level) {
    EnergyLevel.VERY_LOW -> "很低"
    EnergyLevel.LOW -> "偏低"
    EnergyLevel.STEADY -> "一般"
    EnergyLevel.ENOUGH -> "充足"
}

private fun pressureText(level: PressureLevel): String = when (level) {
    PressureLevel.LOW -> "较低"
    PressureLevel.MEDIUM -> "中等"
    PressureLevel.HIGH -> "偏高"
    PressureLevel.VERY_HIGH -> "很高"
}

private fun bodyTagText(tag: BodyTag): String = when (tag) {
    BodyTag.OK -> "正常"
    BodyTag.TIRED -> "疲惫"
    BodyTag.HEADACHE -> "头痛"
    BodyTag.PALPITATIONS -> "心慌"
    BodyTag.CHEST_DISCOMFORT -> "胸部不适"
    BodyTag.STOMACH_DISCOMFORT -> "胃部不适"
    BodyTag.BODY_PAIN -> "身体疼痛"
    BodyTag.BREATHING_DISCOMFORT -> "呼吸不适"
    BodyTag.OTHER -> "其他"
}

private fun sourceTypeText(type: LoadSourceType): String = when (type) {
    LoadSourceType.TASK -> "任务"
    LoadSourceType.COMMITMENT -> "承诺"
    LoadSourceType.WAITING_FOR -> "等待"
    LoadSourceType.GOAL_STEP -> "目标步骤"
}
