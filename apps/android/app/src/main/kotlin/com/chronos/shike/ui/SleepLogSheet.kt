@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.chronos.shike.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AccessTime
import androidx.compose.material.icons.outlined.Bedtime
import androidx.compose.material.icons.outlined.WbSunny
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.TimePickerDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import java.time.LocalTime

@Composable
fun SleepLogSheet(
    onDismiss: () -> Unit,
    onSave: (LocalTime, LocalTime, Boolean?, Boolean?) -> Unit,
) {
    val sheetState = rememberModalBottomSheetState()
    var sleepTime by remember { mutableStateOf(LocalTime.of(23, 0)) }
    var wakeTime by remember { mutableStateOf(LocalTime.of(7, 0)) }
    var editingSleep by remember { mutableStateOf(false) }
    var editingWake by remember { mutableStateOf(false) }
    var longAwakening by remember { mutableStateOf<Boolean?>(null) }
    var feltRestored by remember { mutableStateOf<Boolean?>(null) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text(
                text = "手动作息记录",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = "填大概的时间就好，不需要精确到分钟。",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            OutlinedButton(
                onClick = { editingSleep = true },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(
                    imageVector = Icons.Outlined.Bedtime,
                    contentDescription = "入睡时间",
                    tint = MaterialTheme.colorScheme.primary,
                )
                Spacer(Modifier.width(12.dp))
                Column {
                    Text(
                        text = "大概几点睡",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text(
                        text = formatTime(sleepTime),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium,
                    )
                }
            }

            OutlinedButton(
                onClick = { editingWake = true },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(
                    imageVector = Icons.Outlined.WbSunny,
                    contentDescription = "起床时间",
                    tint = MaterialTheme.colorScheme.primary,
                )
                Spacer(Modifier.width(12.dp))
                Column {
                    Text(
                        text = "大概几点起",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text(
                        text = formatTime(wakeTime),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium,
                    )
                }
            }

            OptionalSwitchRow(
                label = "中途是否长时间清醒",
                checked = longAwakening,
                onChange = { longAwakening = it },
            )

            OptionalSwitchRow(
                label = "主观感觉是否恢复",
                checked = feltRestored,
                onChange = { feltRestored = it },
            )

            Spacer(Modifier.height(4.dp))
            Button(
                onClick = { onSave(sleepTime, wakeTime, longAwakening, feltRestored) },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(Icons.Outlined.AccessTime, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text(text = "保存")
            }
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(text = "取消")
            }
            Spacer(Modifier.height(8.dp))
        }
    }

    if (editingSleep) {
        TimePickerDialog(
            title = "大概几点睡",
            initialHour = sleepTime.hour,
            initialMinute = sleepTime.minute,
            onConfirm = { hour, minute ->
                sleepTime = LocalTime.of(hour, minute)
                editingSleep = false
            },
            onDismiss = { editingSleep = false },
        )
    }

    if (editingWake) {
        TimePickerDialog(
            title = "大概几点起",
            initialHour = wakeTime.hour,
            initialMinute = wakeTime.minute,
            onConfirm = { hour, minute ->
                wakeTime = LocalTime.of(hour, minute)
                editingWake = false
            },
            onDismiss = { editingWake = false },
        )
    }
}

@Composable
private fun TimePickerDialog(
    title: String,
    initialHour: Int,
    initialMinute: Int,
    onConfirm: (Int, Int) -> Unit,
    onDismiss: () -> Unit,
) {
    val state = rememberTimePickerState(
        initialHour = initialHour,
        initialMinute = initialMinute,
        is24Hour = true,
    )
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            TimePicker(
                state = state,
                colors = TimePickerDefaults.colors(
                    clockDialColor = MaterialTheme.colorScheme.surfaceVariant,
                    selectorColor = MaterialTheme.colorScheme.primary,
                ),
            )
        },
        confirmButton = {
            TextButton(onClick = { onConfirm(state.hour, state.minute) }) { Text("确定") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("取消") }
        },
    )
}

@Composable
private fun OptionalSwitchRow(
    label: String,
    checked: Boolean?,
    onChange: (Boolean?) -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column {
                Text(
                    text = label,
                    style = MaterialTheme.typography.bodyLarge,
                )
                Text(
                    text = when (checked) {
                        true -> "是"
                        false -> "否"
                        null -> "未选择"
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                TextButton(onClick = { onChange(if (checked == true) null else true) }) {
                    Text("是")
                }
                TextButton(onClick = { onChange(if (checked == false) null else false) }) {
                    Text("否")
                }
            }
        }
    }
}

private fun formatTime(time: LocalTime): String {
    return "%02d:%02d".format(time.hour, time.minute)
}
