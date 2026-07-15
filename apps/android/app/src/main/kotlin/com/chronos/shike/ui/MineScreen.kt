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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.Nightlight
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.PrivacyTip
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Switch
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
import com.chronos.shike.BuildConfig
import com.chronos.shike.OverloadUiState
import com.chronos.shike.OverloadViewModel
import com.chronos.shike.safety.SafetyResponse
import com.chronos.shike.safety.SafetyRoute

@Composable
fun MineScreen(
    viewModel: OverloadViewModel,
    state: OverloadUiState,
    onExport: () -> Unit,
) {
    var showPrivacy by remember { mutableStateOf(false) }
    var showSafety by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    var showAbout by remember { mutableStateOf(false) }

    if (showPrivacy) {
        PrivacyScreen(
            viewModel = viewModel,
            state = state,
            onExport = onExport,
            onDismiss = { showPrivacy = false },
        )
        return
    }

    if (showSafety) {
        SafetyScreen(
            response = SafetyResponse(
                route = SafetyRoute.ORDINARY_OVERLOAD,
                message = "这里是一些安全资源和专业支持入口。如果你感到身体不适或情绪困扰，请查看下方信息。",
            ),
            onDismiss = { showSafety = false },
        )
        return
    }

    if (showAbout) {
        AboutProductBoundaries(onDismiss = { showAbout = false })
        return
    }

    LazyColumn(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            OverloadCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Outlined.Notifications,
                        contentDescription = "提醒偏好",
                        tint = MaterialTheme.colorScheme.primary,
                    )
                    Spacer(Modifier.width(10.dp))
                    SectionTitle(text = "提醒偏好")
                }
                SwitchRowMine(
                    label = "深夜关怀",
                    description = "深夜时段使用低刺激色彩和关怀文案",
                    checked = state.preference.nightModeEnabled,
                    onChange = { viewModel.setNightModeEnabled(it) },
                )
                SwitchRowMine(
                    label = "减少提醒频率",
                    description = "如果你觉得建议太多，可以减少提醒",
                    checked = state.preference.suggestionFrequency == "reduced",
                    onChange = { reduced ->
                        viewModel.updatePreference(
                            state.preference.copy(
                                suggestionFrequency = if (reduced) "reduced" else "normal"
                            )
                        )
                    },
                )
            }
        }

        item {
            OverloadCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Outlined.Nightlight,
                        contentDescription = "深夜时间",
                        tint = MaterialTheme.colorScheme.primary,
                    )
                    Spacer(Modifier.width(10.dp))
                    SectionTitle(text = "深夜时间设置")
                }
                InfoLine(
                    label = "开始时间",
                    value = state.preference.nightModeStart.toString(),
                )
                InfoLine(
                    label = "结束时间",
                    value = state.preference.nightModeEnd.toString(),
                )
                Text(
                    text = "在此时段内，界面会切换为暖灰色低刺激主题，并显示深夜关怀内容。",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        item {
            Card(
                onClick = { showPrivacy = true },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
            ) {
                ListItem(
                    headlineContent = { Text("隐私中心") },
                    supportingContent = { Text("查看、修改、删除记录，管理功能开关") },
                    leadingContent = {
                        Icon(Icons.Outlined.PrivacyTip, contentDescription = "隐私中心")
                    },
                )
            }
        }

        item {
            Card(
                onClick = onExport,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
            ) {
                ListItem(
                    headlineContent = { Text("导出数据") },
                    supportingContent = { Text("导出脱敏后的全部数据") },
                    leadingContent = {
                        Icon(Icons.Outlined.Download, contentDescription = "导出")
                    },
                )
            }
        }

        item {
            Card(
                onClick = { confirmDelete = true },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
            ) {
                ListItem(
                    headlineContent = { Text("删除全部数据") },
                    supportingContent = { Text("清空所有签到、睡眠、负荷和偏好记录") },
                    leadingContent = {
                        Icon(Icons.Outlined.Delete, contentDescription = "删除")
                    },
                )
            }
        }

        item {
            Card(
                onClick = { showSafety = true },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
            ) {
                ListItem(
                    headlineContent = { Text("安全资源") },
                    supportingContent = { Text("专业支持入口和紧急症状提示") },
                    leadingContent = {
                        Icon(Icons.Outlined.HealthAndSafety, contentDescription = "安全资源")
                    },
                )
            }
        }

        item {
            Card(
                onClick = { showAbout = true },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
            ) {
                ListItem(
                    headlineContent = { Text("关于产品边界") },
                    supportingContent = { Text("产品承诺和非临床声明") },
                    leadingContent = {
                        Icon(Icons.Outlined.Info, contentDescription = "关于")
                    },
                )
            }
        }

        if (state.parcelConnectorEnabled) {
            item {
                OverloadCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Outlined.Inventory2,
                            contentDescription = "快递连接器",
                            tint = MaterialTheme.colorScheme.primary,
                        )
                        Spacer(Modifier.width(10.dp))
                        SectionTitle(text = "快递连接器")
                    }
                    Text(
                        text = "快递连接器已启用。应用可以在本机解析白名单来源的快递通知，并整理取件信息。所有快递数据仅保存在本地。",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }

        item {
            Text(
                text = "版本 ${BuildConfig.VERSION_NAME}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 8.dp),
            )
        }
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("清空全部数据") },
            text = {
                Text("这将删除所有签到、睡眠、负荷、建议和偏好记录，无法撤销。")
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.clearAllData()
                    confirmDelete = false
                }) { Text("确认清空") }
            },
            dismissButton = {
                TextButton(onClick = { confirmDelete = false }) { Text("取消") }
            },
        )
    }
}

@Composable
private fun AboutProductBoundaries(onDismiss: () -> Unit) {
    LazyColumn(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            Text(
                text = "产品边界",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold,
            )
        }
        item {
            OverloadCard {
                SectionTitle(text = "产品承诺")
                Text("不诊断：不会对状态做出医学诊断或心理评估。")
                Text("不说教：不会用评判性语言要求你\"应该\"怎么做。")
                Text("不强迫：所有签到和记录都是可选的。")
                Text("不排名：没有完成率、连续打卡或与他人比较。")
                Text("不让休息变成任务：休息是你的基本需要，不是待办。")
            }
        }
        item {
            OverloadCard {
                SectionTitle(text = "非临床声明")
                Text(
                    text = "本应用不是医疗器械，不能替代专业医疗或心理服务。如果你感到身体不适或情绪困扰持续、加重，请及时寻求专业帮助。紧急情况请直接联系当地紧急医疗服务。",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        item {
            OutlinedButton(
                onClick = onDismiss,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("返回")
            }
        }
    }
}

@Composable
private fun SwitchRowMine(
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
