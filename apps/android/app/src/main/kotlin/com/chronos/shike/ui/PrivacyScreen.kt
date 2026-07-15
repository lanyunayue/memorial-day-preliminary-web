@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.chronos.shike.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
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
import com.chronos.shike.wellbeing.BodyTag
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.PressureLevel

@Composable
fun PrivacyScreen(
    viewModel: OverloadViewModel,
    state: OverloadUiState,
    onExport: () -> Unit,
    onDismiss: () -> Unit,
) {
    var confirmClear by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("隐私中心") },
                navigationIcon = {
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Outlined.ArrowBack,
                            contentDescription = "返回",
                        )
                    }
                },
            )
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                OverloadCard {
                    SectionTitle(text = "签到记录")
                    Text(
                        text = "如需修改，可以删除后重新签到。",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    if (state.checkIns.isEmpty()) {
                        Text(
                            text = "暂无签到记录。",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }

            items(state.checkIns, key = { it.id }) { checkIn ->
                OverloadCard {
                    Text(
                        text = checkIn.localDate.toString(),
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Medium,
                    )
                    checkIn.energyLevel?.let {
                        Text("精力：${energyTextPriv(it)}", style = MaterialTheme.typography.bodySmall)
                    }
                    checkIn.pressureLevel?.let {
                        Text("压力：${pressureTextPriv(it)}", style = MaterialTheme.typography.bodySmall)
                    }
                    if (checkIn.bodyTags.isNotEmpty()) {
                        Text(
                            text = "身体：" + checkIn.bodyTags.joinToString("、") { bodyTagTextPriv(it) },
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                    checkIn.optionalBurdenText?.let {
                        Text("一句话：$it", style = MaterialTheme.typography.bodySmall)
                    }
                    OutlinedButton(
                        onClick = { viewModel.deleteCheckIn(checkIn.id) },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Icon(Icons.Outlined.Delete, contentDescription = "删除")
                        Spacer(Modifier.width(8.dp))
                        Text("删除这条签到")
                    }
                }
            }

            item {
                OverloadCard {
                    SectionTitle(text = "睡眠记录")
                    if (state.sleepLogs.isEmpty()) {
                        Text(
                            text = "暂无睡眠记录。",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }

            items(state.sleepLogs, key = { it.id }) { log ->
                OverloadCard {
                    Text(
                        text = log.sleepDate.toString(),
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Medium,
                    )
                    Text(
                        text = "${log.approximateSleepStart} - ${log.approximateWakeTime}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Text(
                        text = "时长约 ${log.estimatedDuration.toMinutes() / 60} 小时 ${log.estimatedDuration.toMinutes() % 60} 分钟",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    log.longAwakening?.let {
                        Text("中途清醒：${if (it) "是" else "否"}", style = MaterialTheme.typography.bodySmall)
                    }
                    log.feltRestored?.let {
                        Text("感觉恢复：${if (it) "是" else "否"}", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            item {
                OverloadCard {
                    SectionTitle(text = "建议历史")
                    if (state.suggestionFeedback.isEmpty()) {
                        Text(
                            text = "暂无建议反馈记录。",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }

            items(state.suggestionFeedback, key = { it.suggestionId + it.createdAt.toString() }) { feedback ->
                OverloadCard {
                    Text(
                        text = decisionText(feedback.decision),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                    )
                    feedback.helpfulness?.let {
                        Text("帮助度：$it/5", style = MaterialTheme.typography.bodySmall)
                    }
                    feedback.userComment?.let {
                        Text("备注：$it", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            item {
                OverloadCard {
                    SectionTitle(text = "数据操作")
                    OutlinedButton(
                        onClick = onExport,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Icon(Icons.Outlined.Download, contentDescription = "导出")
                        Spacer(Modifier.width(8.dp))
                        Text("导出全部数据（脱敏）")
                    }
                    Spacer(Modifier.height(8.dp))
                    Button(
                        onClick = { confirmClear = true },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Icon(Icons.Outlined.Delete, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("一键清空全部数据")
                    }
                }
            }

            item {
                OverloadCard {
                    SectionTitle(text = "功能开关")
                    SwitchRowPriv(
                        label = "深夜关怀",
                        description = "深夜时段使用低刺激色彩和关怀文案",
                        checked = state.preference.nightModeEnabled,
                        onChange = { viewModel.setNightModeEnabled(it) },
                    )
                    SwitchRowPriv(
                        label = "负荷分析",
                        description = "根据任务、签到和作息生成负荷摘要",
                        checked = state.preference.loadAnalysisEnabled,
                        onChange = { viewModel.setLoadAnalysisEnabled(it) },
                    )
                    SwitchRowPriv(
                        label = "安全表达分析",
                        description = "签到时分析身体标签和文字，提供安全分流",
                        checked = state.preference.safetyExpressionAnalysisEnabled,
                        onChange = { viewModel.setSafetyAnalysisEnabled(it) },
                    )
                }
            }
        }
    }

    if (confirmClear) {
        AlertDialog(
            onDismissRequest = { confirmClear = false },
            title = { Text("清空全部数据") },
            text = {
                Text("这将删除所有签到、睡眠、负荷、建议和偏好记录，无法撤销。")
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.clearAllData()
                    confirmClear = false
                }) { Text("确认清空") }
            },
            dismissButton = {
                TextButton(onClick = { confirmClear = false }) { Text("取消") }
            },
        )
    }
}

@Composable
private fun SwitchRowPriv(
    label: String,
    description: String,
    checked: Boolean,
    onChange: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Column(modifier = Modifier.padding(end = 16.dp)) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Medium,
            )
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Switch(checked = checked, onCheckedChange = onChange)
    }
}

private fun decisionText(decision: String): String = when (decision) {
    "accepted" -> "已采纳"
    "modified" -> "已调整"
    "declined" -> "已忽略"
    "snoozed" -> "已推迟"
    else -> decision
}

private fun energyTextPriv(level: EnergyLevel): String = when (level) {
    EnergyLevel.VERY_LOW -> "很低"
    EnergyLevel.LOW -> "偏低"
    EnergyLevel.STEADY -> "一般"
    EnergyLevel.ENOUGH -> "充足"
}

private fun pressureTextPriv(level: PressureLevel): String = when (level) {
    PressureLevel.LOW -> "较低"
    PressureLevel.MEDIUM -> "中等"
    PressureLevel.HIGH -> "偏高"
    PressureLevel.VERY_HIGH -> "很高"
}

private fun bodyTagTextPriv(tag: BodyTag): String = when (tag) {
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
