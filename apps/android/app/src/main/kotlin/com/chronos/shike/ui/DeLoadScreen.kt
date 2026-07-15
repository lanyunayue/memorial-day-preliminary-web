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
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Undo
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.chronos.shike.OverloadUiState
import com.chronos.shike.OverloadViewModel
import com.chronos.shike.load.LoadItem
import com.chronos.shike.load.LoadStatus

@Composable
fun DeLoadScreen(
    viewModel: OverloadViewModel,
    state: OverloadUiState,
) {
    val plan = state.deLoadPlan
    val itemsById = state.loadItems.associateBy { it.id }
    val activeItems = state.loadItems.filter { it.status == LoadStatus.ACTIVE }

    LazyColumn(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            OverloadCard {
                SectionTitle(text = "降载")
                Text(
                    text = "把今天的负荷降到可承受的范围。所有操作都可以撤销，不会删除任何数据。",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        if (plan == null) {
            item {
                if (activeItems.isEmpty()) {
                    OverloadCard {
                        Text(
                            text = "目前没有进行中的事项需要降载。",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                } else {
                    OverloadCard {
                        Text(
                            text = "你有 ${activeItems.size} 项进行中的事项。预览降载方案后，可以确认或撤销。",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                        Button(
                            onClick = { viewModel.previewDeLoadPlan() },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("预览降载方案")
                        }
                    }
                }
            }
        } else {
            val keepItem = plan.keepItemIds.firstOrNull()?.let { itemsById[it] }

            item {
                HighlightCard {
                    Text(
                        text = "今晚只留一件",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                    )
                    keepItem?.let {
                        Text(
                            text = it.title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                        )
                        Text(
                            text = "其他事项可以先放下，明天再看。",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                        )
                    } ?: Text(
                        text = "没有需要保留的事项。",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }

            if (plan.deferItemIds.isNotEmpty()) {
                item { SectionTitle(text = "可延期事项") }
                items(plan.deferItemIds.mapNotNull { itemsById[it] }, key = { it.id }) { item ->
                    DeLoadItemCard(
                        item = item,
                        explanation = "这项可以推迟到明天再做，不会影响今天的状态。",
                    )
                }
            }

            if (plan.lowerStandardItemIds.isNotEmpty()) {
                item { SectionTitle(text = "可降低标准事项") }
                items(plan.lowerStandardItemIds.mapNotNull { itemsById[it] }, key = { it.id }) { item ->
                    DeLoadItemCard(
                        item = item,
                        explanation = "这项可以降低完成标准，做到能做的就好。",
                    )
                }
            }

            if (plan.renegotiateItemIds.isNotEmpty()) {
                item { SectionTitle(text = "可重新协商承诺") }
                items(plan.renegotiateItemIds.mapNotNull { itemsById[it] }, key = { it.id }) { item ->
                    DeLoadItemCard(
                        item = item,
                        explanation = "这项承诺可以和对方沟通调整时间或范围。",
                    )
                }
            }

            item {
                OverloadCard {
                    SectionTitle(text = "操作")
                    if (!plan.userConfirmed) {
                        Text(
                            text = "确认后，方案将在三十分钟内可以撤销。",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Spacer(Modifier.height(8.dp))
                        Button(
                            onClick = { viewModel.confirmDeLoadPlan() },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Icon(Icons.Outlined.Check, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("确认降载方案")
                        }
                        OutlinedButton(
                            onClick = { viewModel.undoDeLoadPlan() },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("撤销预览")
                        }
                    } else {
                        Text(
                            text = "方案已应用。" +
                                if (plan.undoUntil != null) "三十分钟内可以撤销。" else "",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                        Spacer(Modifier.height(8.dp))
                        OutlinedButton(
                            onClick = { viewModel.undoDeLoadPlan() },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Icon(Icons.Outlined.Undo, contentDescription = "撤销")
                            Spacer(Modifier.width(8.dp))
                            Text("撤销降载")
                        }
                    }
                }
            }

            item {
                Button(
                    onClick = { viewModel.saveAndStopToday() },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("保存并结束今天")
                }
            }
        }
    }
}

@Composable
private fun DeLoadItemCard(
    item: LoadItem,
    explanation: String,
) {
    OverloadCard {
        Text(
            text = item.title,
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.Medium,
        )
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Outlined.Info,
                contentDescription = "说明",
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.width(8.dp))
            Text(
                text = explanation,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
