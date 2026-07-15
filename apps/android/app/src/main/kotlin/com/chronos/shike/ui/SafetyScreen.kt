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
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.LocalHospital
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Psychology
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.chronos.shike.safety.SafetyResponse
import com.chronos.shike.safety.SafetyRoute

@Composable
fun SafetyScreen(
    response: SafetyResponse,
    onDismiss: () -> Unit,
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("安全") },
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
                val (icon, title) = routeDisplay(response.route)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = when (response.route) {
                            SafetyRoute.IMMEDIATE_SAFETY -> MaterialTheme.colorScheme.primaryContainer
                            SafetyRoute.PHYSICAL_DISCOMFORT -> MaterialTheme.colorScheme.tertiaryContainer
                            SafetyRoute.DISTRESS_SUPPORT -> MaterialTheme.colorScheme.secondaryContainer
                            SafetyRoute.ORDINARY_OVERLOAD -> MaterialTheme.colorScheme.surfaceVariant
                        },
                    ),
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = icon,
                                contentDescription = title,
                                tint = MaterialTheme.colorScheme.primary,
                            )
                            Spacer(Modifier.width(10.dp))
                            Text(
                                text = title,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                            )
                        }
                        Text(
                            text = response.message,
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
            }

            when (response.route) {
                SafetyRoute.IMMEDIATE_SAFETY -> {
                    item {
                        OverloadCard {
                            SectionTitle(text = "紧急联系")
                            Text(
                                text = "如果你无法保证自己的安全，请立即拨打：",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text(
                                text = "110（报警）",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                            )
                            Text(
                                text = "120（急救）",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                            )
                            Text(
                                text = "并前往安全、有人陪伴的环境。",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                        }
                    }
                    item {
                        OverloadCard {
                            SectionTitle(text = "心理危机干预")
                            Text(
                                text = "全国心理援助热线：400-161-9995",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text(
                                text = "北京心理危机研究与干预中心：010-82951332",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text(
                                text = "以上号码仅供参考，请以当地实际公布的号码为准。",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
                SafetyRoute.PHYSICAL_DISCOMFORT -> {
                    item {
                        OverloadCard {
                            SectionTitle(text = "紧急症状提示")
                            Text(
                                text = "如果你出现以下症状，请立即联系当地紧急医疗服务（120）：",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text("持续或剧烈的胸痛")
                            Text("严重呼吸困难")
                            Text("突然的严重头痛")
                            Text("意识模糊或晕厥")
                            Text(
                                text = "其他让你感到无法承受的身体不适，也建议及时就医。",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                    item {
                        OverloadCard {
                            SectionTitle(text = "就医建议")
                            Text(
                                text = "可以前往附近医疗机构的门诊或急诊就诊。如果不确定是否紧急，也可以先拨打当地医疗咨询热线。",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                        }
                    }
                }
                SafetyRoute.DISTRESS_SUPPORT -> {
                    item {
                        OverloadCard {
                            SectionTitle(text = "专业支持入口")
                            Text(
                                text = "全国心理援助热线：400-161-9995",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text(
                                text = "北京心理危机研究与干预中心：010-82951332",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text(
                                text = "以上号码仅供参考，请以当地实际公布的号码为准。",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                    item {
                        OverloadCard {
                            SectionTitle(text = "联系可信任的人")
                            Text(
                                text = "如果你身边有可信任的家人或朋友，可以告诉他们你现在的状态。你不需要独自承受。",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                        }
                    }
                }
                SafetyRoute.ORDINARY_OVERLOAD -> {
                    item {
                        OverloadCard {
                            SectionTitle(text = "安全资源")
                            Text(
                                text = "如果你感到身体不适或情绪困扰持续、加重，以下资源可以提供帮助：",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text(
                                text = "全国心理援助热线：400-161-9995",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text(
                                text = "紧急情况请拨打 120 或 110。",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text(
                                text = "以上号码仅供参考，请以当地实际公布的号码为准。",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }

            item {
                OverloadCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Outlined.Lock,
                            contentDescription = "隐私说明",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Spacer(Modifier.width(10.dp))
                        SectionTitle(text = "隐私说明")
                    }
                    Text(
                        text = "本次记录仅在本地保存，不会自动上传，也不会静默通知任何人。",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text(
                        text = "应用不会在后台监控你的输入，所有安全表达分析仅在你主动签到时进行。",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            item {
                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("我了解了")
                }
            }
        }
    }
}

private fun routeDisplay(route: SafetyRoute): Pair<ImageVector, String> = when (route) {
    SafetyRoute.ORDINARY_OVERLOAD -> Icons.Outlined.Info to "普通负荷"
    SafetyRoute.PHYSICAL_DISCOMFORT -> Icons.Outlined.HealthAndSafety to "身体不适"
    SafetyRoute.DISTRESS_SUPPORT -> Icons.Outlined.Psychology to "情绪困扰"
    SafetyRoute.IMMEDIATE_SAFETY -> Icons.Outlined.LocalHospital to "紧急安全"
}
