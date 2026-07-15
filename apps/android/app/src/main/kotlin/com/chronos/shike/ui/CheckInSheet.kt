@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class, androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.chronos.shike.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.chronos.shike.wellbeing.BodyTag
import com.chronos.shike.wellbeing.EnergyLevel
import com.chronos.shike.wellbeing.PressureLevel

private val ENERGY_OPTIONS = listOf(
    EnergyLevel.VERY_LOW to "很低",
    EnergyLevel.LOW to "偏低",
    EnergyLevel.STEADY to "一般",
    EnergyLevel.ENOUGH to "充足",
)

private val PRESSURE_OPTIONS = listOf(
    PressureLevel.LOW to "较低",
    PressureLevel.MEDIUM to "中等",
    PressureLevel.HIGH to "偏高",
    PressureLevel.VERY_HIGH to "很高",
)

private val BODY_TAG_OPTIONS = listOf(
    BodyTag.OK to "正常",
    BodyTag.TIRED to "疲惫",
    BodyTag.HEADACHE to "头痛",
    BodyTag.PALPITATIONS to "心慌",
    BodyTag.CHEST_DISCOMFORT to "胸部不适",
    BodyTag.STOMACH_DISCOMFORT to "胃部不适",
    BodyTag.BODY_PAIN to "身体疼痛",
    BodyTag.BREATHING_DISCOMFORT to "呼吸不适",
    BodyTag.OTHER to "其他",
)

@Composable
fun CheckInSheet(
    onDismiss: () -> Unit,
    onSave: (EnergyLevel?, PressureLevel?, Set<BodyTag>, String?) -> Unit,
) {
    val sheetState = rememberModalBottomSheetState()
    var energy by remember { mutableStateOf<EnergyLevel?>(null) }
    var pressure by remember { mutableStateOf<PressureLevel?>(null) }
    var bodyTags by remember { mutableStateOf<Set<BodyTag>>(emptySet()) }
    var burdenText by remember { mutableStateOf("") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            Text(
                text = "十秒签到",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = "所有字段都可以跳过，只记录你想记录的。",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            SectionTitle(text = "精力")
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ENERGY_OPTIONS.forEach { (level, label) ->
                    FilterChip(
                        selected = energy == level,
                        onClick = { energy = if (energy == level) null else level },
                        label = { Text(label) },
                        leadingIcon = if (energy == level) {
                            { Icon(Icons.Outlined.Check, contentDescription = "已选择$label") }
                        } else null,
                        modifier = Modifier.semantics { contentDescription = "精力$label" },
                    )
                }
            }

            SectionTitle(text = "压力")
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                PRESSURE_OPTIONS.forEach { (level, label) ->
                    FilterChip(
                        selected = pressure == level,
                        onClick = { pressure = if (pressure == level) null else level },
                        label = { Text(label) },
                        leadingIcon = if (pressure == level) {
                            { Icon(Icons.Outlined.Check, contentDescription = "已选择$label") }
                        } else null,
                        modifier = Modifier.semantics { contentDescription = "压力$label" },
                    )
                }
            }

            SectionTitle(text = "身体标签")
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                BODY_TAG_OPTIONS.forEach { (tag, label) ->
                    val selected = tag in bodyTags
                    FilterChip(
                        selected = selected,
                        onClick = {
                            bodyTags = if (selected) bodyTags - tag else bodyTags + tag
                        },
                        label = { Text(label) },
                        leadingIcon = if (selected) {
                            { Icon(Icons.Outlined.Check, contentDescription = "已选择$label") }
                        } else null,
                        modifier = Modifier.semantics { contentDescription = "身体标签$label" },
                    )
                }
            }

            SectionTitle(text = "一句话负担（可选）")
            OutlinedTextField(
                value = burdenText,
                onValueChange = { if (it.length <= 240) burdenText = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 56.dp),
                placeholder = { Text("今天最让你觉得吃力的是什么") },
                supportingText = { Text("${burdenText.length}/240") },
            )

            Spacer(Modifier.height(4.dp))
            Button(
                onClick = {
                    onSave(energy, pressure, bodyTags, burdenText.ifBlank { null })
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(text = "保存")
            }
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(text = "跳过签到")
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}
