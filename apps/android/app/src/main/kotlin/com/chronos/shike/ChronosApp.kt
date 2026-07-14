@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)

package com.chronos.shike

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.PrivacyTip
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.chronos.shike.parcel.AssistantParcelResult
import com.chronos.shike.parcel.Parcel
import com.chronos.shike.parcel.ParcelStatus
import com.chronos.shike.parcel.maskPickupCode
import com.chronos.shike.storage.OperationEntity
import com.chronos.shike.storage.ParcelDraftEntity
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private val Green = Color(0xFF236C55)
private val Ink = Color(0xFF1D2522)
private val Canvas = Color(0xFFFAFAF8)

private enum class Route(val title: String, val icon: ImageVector) {
    HOME("首页", Icons.Outlined.Home),
    PARCELS("快递", Icons.Outlined.Inventory2),
    ASSISTANT("询问", Icons.Outlined.Search),
    PRIVACY("隐私", Icons.Outlined.PrivacyTip),
    SOURCES("来源应用", Icons.Outlined.Notifications),
    SETTINGS("设置", Icons.Outlined.Settings),
    DIAGNOSTICS("本地诊断", Icons.Outlined.CheckCircle),
    DETAIL("快递详情", Icons.Outlined.Inventory2),
}

@Composable
fun ChronosApp(
    viewModel: ShikeViewModel,
    notificationAccessGranted: Boolean,
    onOpenNotificationAccess: () -> Unit,
    onRevealSensitive: (() -> Unit) -> Unit,
    onExport: () -> Unit,
    onApplyScreenProtection: (Boolean) -> Unit,
) {
    val preferences = viewModel.container.preferences
    var onboardingComplete by remember { mutableStateOf(preferences.onboardingComplete) }
    MaterialTheme(
        colorScheme = androidx.compose.material3.lightColorScheme(
            primary = Green,
            onPrimary = Color.White,
            surface = Canvas,
            background = Canvas,
            onSurface = Ink,
            error = Color(0xFF9B2C2C),
        ),
    ) {
        Surface(Modifier.fillMaxSize()) {
            if (!onboardingComplete) {
                OnboardingScreen(
                    notificationAccessGranted = notificationAccessGranted,
                    onOpenNotificationAccess = onOpenNotificationAccess,
                    onComplete = { mode ->
                        viewModel.completeOnboarding(mode)
                        onboardingComplete = true
                    },
                )
            } else {
                MainExperience(
                    viewModel, notificationAccessGranted, onOpenNotificationAccess,
                    onRevealSensitive, onExport, onApplyScreenProtection,
                )
            }
        }
    }
}

@Composable
private fun OnboardingScreen(
    notificationAccessGranted: Boolean,
    onOpenNotificationAccess: () -> Unit,
    onComplete: (AutomationMode) -> Unit,
) {
    var mode by rememberSaveable { mutableStateOf(AutomationMode.SUGGEST) }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 32.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp),
    ) {
        item {
            Text("时刻", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.SemiBold)
            Text("个人事件助手", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(12.dp))
            Text("每一刻沉淀，都是未来伏笔。", style = MaterialTheme.typography.bodyLarge)
        }
        item {
            SectionTitle("先说明隐私边界")
            Text("只有你明确允许的来源通知才会在本机解析。未在白名单中的通知不会读取标题或正文；原始通知正文不会保存或上传。")
        }
        item {
            SectionTitle("选择整理方式")
            ModeSelector(mode, onSelected = { mode = it })
        }
        item {
            SectionTitle("通知访问")
            StatusLine(notificationAccessGranted, if (notificationAccessGranted) "系统通知访问已开启" else "尚未开启系统通知访问")
            Spacer(Modifier.height(10.dp))
            OutlinedButton(onClick = onOpenNotificationAccess) {
                Icon(Icons.Outlined.Notifications, null)
                Spacer(Modifier.width(8.dp))
                Text("打开系统授权页")
            }
            Text("可以暂时跳过。手动记录和系统分享始终可用。", style = MaterialTheme.typography.bodySmall)
        }
        item {
            Button(onClick = { onComplete(mode) }, modifier = Modifier.fillMaxWidth()) { Text("进入时刻") }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainExperience(
    viewModel: ShikeViewModel,
    notificationAccessGranted: Boolean,
    onOpenNotificationAccess: () -> Unit,
    onRevealSensitive: (() -> Unit) -> Unit,
    onExport: () -> Unit,
    onApplyScreenProtection: (Boolean) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val sharePreview by viewModel.sharePreview.collectAsStateWithLifecycle()
    val message by viewModel.message.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    var route by rememberSaveable { mutableStateOf(Route.HOME) }
    var selectedParcelId by rememberSaveable { mutableStateOf<String?>(null) }

    LaunchedEffect(message) {
        message?.let {
            snackbar.showSnackbar(it)
            viewModel.clearMessage()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(route.title) },
                navigationIcon = {
                    if (route !in PRIMARY_ROUTES) IconButton(onClick = { route = Route.PARCELS }) {
                        Icon(Icons.AutoMirrored.Outlined.ArrowBack, "返回")
                    }
                },
                actions = {
                    if (route == Route.HOME) IconButton(onClick = { route = Route.SETTINGS }) {
                        Icon(Icons.Outlined.Settings, "设置")
                    }
                },
            )
        },
        bottomBar = {
            if (route in PRIMARY_ROUTES) NavigationBar {
                PRIMARY_ROUTES.forEach { item ->
                    NavigationBarItem(
                        selected = route == item,
                        onClick = { route = item },
                        icon = { Icon(item.icon, item.title) },
                        label = { Text(item.title) },
                    )
                }
            }
        },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        Box(Modifier.padding(padding).fillMaxSize()) {
            when (route) {
                Route.HOME -> HomeScreen(state.parcels, state.drafts, notificationAccessGranted, onOpenNotificationAccess,
                    onSources = { route = Route.SOURCES }, onAssistant = { route = Route.ASSISTANT },
                    onParcel = { selectedParcelId = it; route = Route.DETAIL },
                    onConfirmDraft = viewModel::confirmDraft, onDismissDraft = viewModel::dismissDraft)
                Route.PARCELS -> ParcelListScreen(state.parcels, onParcel = { selectedParcelId = it; route = Route.DETAIL }, onAdd = { route = Route.ASSISTANT })
                Route.ASSISTANT -> AssistantScreen(viewModel, state.parcels, onRevealSensitive)
                Route.PRIVACY -> PrivacyScreen(
                    viewModel, notificationAccessGranted, onOpenNotificationAccess, onExport,
                    onSources = { route = Route.SOURCES }, onDiagnostics = { route = Route.DIAGNOSTICS },
                )
                Route.SOURCES -> SourcesScreen(viewModel, notificationAccessGranted, onOpenNotificationAccess)
                Route.SETTINGS -> SettingsScreen(viewModel, onApplyScreenProtection)
                Route.DIAGNOSTICS -> DiagnosticsScreen(state.operations, notificationAccessGranted, state.parcels.size, state.drafts.size)
                Route.DETAIL -> state.parcels.firstOrNull { it.id == selectedParcelId }?.let {
                    ParcelDetailScreen(viewModel, it, onRevealSensitive, onDeleted = { route = Route.PARCELS })
                } ?: EmptyState("这条快递记录已不存在")
            }
        }
    }

    sharePreview?.let { preview ->
        AlertDialog(
            onDismissRequest = viewModel::dismissShare,
            icon = { Icon(Icons.Outlined.Share, null) },
            title = { Text("分享到时刻") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("物流公司：${carrierName(preview.carrier)}")
                    Text("状态：${statusName(preview.status)}")
                    preview.location?.let { Text("地点：$it") }
                    Text(if (preview.hasPickupCode) "包含取件码，将加密保存" else "未识别到取件码")
                    Text("置信度：${confidenceName(preview.confidence)}", style = MaterialTheme.typography.bodySmall)
                }
            },
            confirmButton = { TextButton(onClick = viewModel::confirmShare) { Text("确认保存") } },
            dismissButton = { TextButton(onClick = viewModel::dismissShare) { Text("取消") } },
        )
    }
}

@Composable
private fun HomeScreen(
    parcels: List<Parcel>, drafts: List<ParcelDraftEntity>, notificationAccessGranted: Boolean,
    onOpenNotificationAccess: () -> Unit, onSources: () -> Unit, onAssistant: () -> Unit,
    onParcel: (String) -> Unit, onConfirmDraft: (String) -> Unit, onDismissDraft: (String) -> Unit,
) {
    val pending = parcels.filter { it.currentStatus in setOf(ParcelStatus.READY_FOR_PICKUP, ParcelStatus.ARRIVED_LOCAL_STATION) }
    val delivering = parcels.count { it.currentStatus == ParcelStatus.OUT_FOR_DELIVERY }
    val today = java.time.LocalDate.now()
    val arrivingToday = parcels.count { it.eta?.start?.atZone(ZoneId.systemDefault())?.toLocalDate() == today }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (!notificationAccessGranted) item {
            InfoBand("通知访问未开启", "手动记录和系统分享仍可用。开启后还需要选择允许的来源应用。", "去开启", onOpenNotificationAccess)
        }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Metric("待取", pending.size.toString(), Modifier.weight(1f))
                Metric("派送中", delivering.toString(), Modifier.weight(1f))
                Metric("今日预计", arrivingToday.toString(), Modifier.weight(1f))
            }
        }
        item {
            Button(onClick = onAssistant, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Outlined.Search, null)
                Spacer(Modifier.width(8.dp))
                Text("我要拿快递了")
            }
        }
        if (drafts.isNotEmpty()) {
            item { SectionTitle("等待你确认 · ${drafts.size}") }
            items(drafts, key = { it.id }) { DraftRow(it, { onConfirmDraft(it.id) }, { onDismissDraft(it.id) }) }
        }
        item { SectionTitle("待取快递") }
        if (pending.isEmpty()) item { EmptyState("目前没有待取快递") }
        items(pending, key = { it.id }) { ParcelRow(it, onParcel) }
        item {
            OutlinedButton(onClick = onSources, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Outlined.Notifications, null)
                Spacer(Modifier.width(8.dp))
                Text("管理来源应用")
            }
        }
    }
}

@Composable
private fun ParcelListScreen(parcels: List<Parcel>, onParcel: (String) -> Unit, onAdd: () -> Unit) {
    var filter by rememberSaveable { mutableStateOf("active") }
    val visible = when (filter) {
        "pickup" -> parcels.filter { it.currentStatus == ParcelStatus.READY_FOR_PICKUP }
        "archived" -> parcels.filter { it.currentStatus in setOf(ParcelStatus.PICKED_UP, ParcelStatus.ARCHIVED, ParcelStatus.RETURNED) }
        else -> parcels.filter { it.currentStatus !in setOf(ParcelStatus.PICKED_UP, ParcelStatus.ARCHIVED, ParcelStatus.RETURNED) }
    }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(filter == "active", { filter = "active" }, label = { Text("进行中") })
                FilterChip(filter == "pickup", { filter = "pickup" }, label = { Text("待取") })
                FilterChip(filter == "archived", { filter = "archived" }, label = { Text("已完成") })
            }
        }
        if (visible.isEmpty()) item { EmptyState("这里还没有快递记录") }
        items(visible, key = { it.id }) { ParcelRow(it, onParcel) }
        item {
            OutlinedButton(onClick = onAdd, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Outlined.Add, null)
                Spacer(Modifier.width(8.dp))
                Text("手动添加")
            }
        }
    }
}

@Composable
private fun AssistantScreen(
    viewModel: ShikeViewModel,
    parcels: List<Parcel>,
    onRevealSensitive: (() -> Unit) -> Unit,
) {
    var input by rememberSaveable { mutableStateOf("") }
    var manualMode by rememberSaveable { mutableStateOf(false) }
    val result by viewModel.assistantResult.collectAsStateWithLifecycle()
    var confirmClear by remember { mutableStateOf(false) }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            OutlinedTextField(
                value = input,
                onValueChange = { input = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text(if (manualMode) "输入快递通知内容" else "询问本地快递") },
                placeholder = { Text(if (manualMode) "例如：圆通快递已到南苑驿站" else "例如：我要拿快递了") },
                minLines = 2,
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = {
                    if (manualMode) viewModel.addManual(input) else viewModel.ask(input)
                    input = ""
                }, enabled = input.isNotBlank(), modifier = Modifier.weight(1f)) {
                    Text(if (manualMode) "解析并保存" else "查询")
                }
                OutlinedButton(onClick = { manualMode = !manualMode }) { Text(if (manualMode) "返回询问" else "手动记录") }
            }
        }
        if (!manualMode) item {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("我要拿快递了", "我还有几个快递没拿？", "今天有哪些快递到？", "把取件码给我").forEach { command ->
                    AssistChip(onClick = { viewModel.ask(command) }, label = { Text(command) })
                }
            }
        }
        result?.let { assistantResult ->
            item {
                AssistantResultCard(
                    assistantResult,
                    onRevealSensitive,
                    onMarkPickedUp = { id -> viewModel.markPickedUp(id) },
                    onClearAll = { confirmClear = true },
                )
            }
        }
        if (parcels.isEmpty()) item { Text("查询只使用本机已保存数据，不会生成不存在的快递。", style = MaterialTheme.typography.bodySmall) }
    }
    if (confirmClear) ConfirmDialog("清除全部快递数据", "该命令会删除快递、草稿、时间线和取件码密钥。", { confirmClear = false }) {
        viewModel.clearAll(); confirmClear = false
    }
}

@Composable
private fun AssistantResultCard(
    result: AssistantParcelResult,
    onRevealSensitive: (() -> Unit) -> Unit,
    onMarkPickedUp: (String) -> Unit,
    onClearAll: () -> Unit,
) {
    var reveal by remember(result) { mutableStateOf(false) }
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(result.message, fontWeight = FontWeight.SemiBold)
            result.parcels.forEachIndexed { index, parcel ->
                if (index > 0) HorizontalDivider()
                Text(carrierName(parcel.carrier))
                parcel.pickupLocation?.let { Text("地点：$it") }
                parcel.pickupCode?.let { code -> Text("取件码：${if (reveal) code else maskPickupCode(code)}") }
                Text("状态：${statusName(parcel.currentStatus.name)}")
            }
            if (result.requiresSensitiveReveal && result.parcels.any { it.pickupCode != null } && !reveal) {
                OutlinedButton(onClick = { onRevealSensitive { reveal = true } }) {
                    Icon(Icons.Outlined.Visibility, null)
                    Spacer(Modifier.width(8.dp))
                    Text("验证后临时显示")
                }
            }
            if (result.intent == com.chronos.shike.parcel.AssistantIntent.MARK_PICKED_UP && result.parcels.size == 1) {
                Button(onClick = { onMarkPickedUp(result.parcels.single().id) }) { Text("确认已取件") }
            }
            if (result.intent == com.chronos.shike.parcel.AssistantIntent.CLEAR_ALL) {
                Button(onClick = onClearAll) { Text("继续清除") }
            }
        }
    }
}

@Composable
private fun ParcelDetailScreen(
    viewModel: ShikeViewModel,
    parcel: Parcel,
    onRevealSensitive: (() -> Unit) -> Unit,
    onDeleted: () -> Unit,
) {
    val events by viewModel.container.repository.observeEvents(parcel.id).collectAsStateWithLifecycle(initialValue = emptyList())
    var reveal by rememberSaveable(parcel.id) { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Text(carrierName(parcel.carrier), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.SemiBold)
            Text(statusName(parcel.currentStatus.name), color = Green)
        }
        item {
            DetailBlock("取件信息") {
                DetailLine("地点", parcel.pickupLocation ?: "未识别")
                DetailLine("运单号", parcel.maskedTrackingNumber ?: "未提供")
                parcel.pickupCode?.let { code ->
                    DetailLine("取件码", if (reveal) code else maskPickupCode(code))
                    if (!reveal) TextButton(onClick = { onRevealSensitive { reveal = true } }) { Text("验证后显示完整取件码") }
                }
            }
        }
        parcel.eta?.let { eta -> item {
            DetailBlock("动态预计时间") {
                DetailLine("开始", formatInstant(eta.start))
                DetailLine("结束", formatInstant(eta.end))
                Text("预计时间会随物流更新，不是确定日程。", style = MaterialTheme.typography.bodySmall)
            }
        } }
        item { SectionTitle("快递时间线") }
        items(events, key = { it.id }) { event ->
            ListItem(
                headlineContent = { Text(statusName(event.type)) },
                supportingContent = { Text(formatEpoch(event.occurredAtEpochMs)) },
                leadingContent = { Icon(Icons.Outlined.CheckCircle, null, tint = Green) },
            )
        }
        if (parcel.currentStatus !in setOf(ParcelStatus.PICKED_UP, ParcelStatus.ARCHIVED)) item {
            Button(onClick = { viewModel.markPickedUp(parcel.id) }, modifier = Modifier.fillMaxWidth()) { Text("标记为已取件") }
        }
        item {
            OutlinedButton(onClick = { confirmDelete = true }, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Outlined.Delete, null)
                Spacer(Modifier.width(8.dp))
                Text("删除这条快递")
            }
        }
    }
    if (confirmDelete) ConfirmDialog("删除快递", "这会删除该快递及其本地时间线。", onDismiss = { confirmDelete = false }) {
        viewModel.deleteParcel(parcel.id); confirmDelete = false; onDeleted()
    }
}

@Composable
private fun SourcesScreen(viewModel: ShikeViewModel, notificationAccessGranted: Boolean, onOpenNotificationAccess: () -> Unit) {
    var allowed by remember { mutableStateOf(viewModel.container.preferences.allowedPackages()) }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item {
            StatusLine(notificationAccessGranted, if (notificationAccessGranted) "系统通知访问已开启" else "系统通知访问未开启")
            if (!notificationAccessGranted) TextButton(onClick = onOpenNotificationAccess) { Text("打开系统授权页") }
            Text("默认全部关闭。只有下面主动开启的来源会在本机解析。", style = MaterialTheme.typography.bodySmall)
        }
        items(KNOWN_SOURCES, key = { it.first }) { (packageName, label) ->
            ListItem(
                headlineContent = { Text(label) },
                supportingContent = { Text(packageName, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                trailingContent = {
                    Switch(
                        checked = packageName in allowed,
                        onCheckedChange = { checked ->
                            viewModel.setPackageAllowed(packageName, checked)
                            allowed = viewModel.container.preferences.allowedPackages()
                        },
                    )
                },
            )
        }
    }
}

@Composable
private fun PrivacyScreen(
    viewModel: ShikeViewModel,
    notificationAccessGranted: Boolean,
    onOpenNotificationAccess: () -> Unit,
    onExport: () -> Unit,
    onSources: () -> Unit,
    onDiagnostics: () -> Unit,
) {
    var confirmClear by remember { mutableStateOf(false) }
    var confirmRevoke by remember { mutableStateOf(false) }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item {
            SectionTitle("通知访问")
            StatusLine(notificationAccessGranted, if (notificationAccessGranted) "已授权" else "未授权")
        }
        item { ActionRow(Icons.Outlined.Notifications, "打开系统通知访问页", onOpenNotificationAccess) }
        item { ActionRow(Icons.Outlined.Settings, "管理来源白名单", onSources) }
        item { ActionRow(Icons.Outlined.CheckCircle, "查看本地诊断", onDiagnostics) }
        item { ActionRow(Icons.Outlined.Share, "导出遮挡后的本地数据", onExport) }
        item { HorizontalDivider(Modifier.padding(vertical = 8.dp)) }
        item {
            Text("数据保留", fontWeight = FontWeight.SemiBold)
            Text("快递记录保留到你删除；原始通知正文不落盘；诊断只保存结构化操作状态，不包含通知正文或完整取件码。")
        }
        item {
            OutlinedButton(onClick = { confirmClear = true }, modifier = Modifier.fillMaxWidth()) { Text("清除全部快递数据") }
        }
        item {
            Button(onClick = { confirmRevoke = true }, modifier = Modifier.fillMaxWidth()) {
                Text("撤销通知访问并清除捕获数据")
            }
            Text("应用会立即停止处理、清空白名单与本地数据，并打开系统页面供你关闭通知访问开关。Android 不允许应用自行关闭该系统授权。", style = MaterialTheme.typography.bodySmall)
        }
    }
    if (confirmClear) ConfirmDialog("清除全部数据", "快递、草稿、时间线和取件码密钥都会删除，无法撤销。", { confirmClear = false }) {
        viewModel.clearAll(); confirmClear = false
    }
    if (confirmRevoke) ConfirmDialog("撤销并清除", "先立即停止捕获并清除本地数据，然后前往系统页面完成权限关闭。", { confirmRevoke = false }) {
        viewModel.revokeAndClear(onOpenNotificationAccess); confirmRevoke = false
    }
}

@Composable
private fun SettingsScreen(viewModel: ShikeViewModel, onApplyScreenProtection: (Boolean) -> Unit) {
    val preferences = viewModel.container.preferences
    var mode by remember { mutableStateOf(preferences.automationMode) }
    var protect by remember { mutableStateOf(preferences.protectScreens) }
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item { SectionTitle("整理方式") }
        item { ModeSelector(mode) { mode = it; viewModel.setMode(it) } }
        item { HorizontalDivider() }
        item {
            ListItem(
                headlineContent = { Text("保护截图和最近任务预览") },
                supportingContent = { Text("防止完整取件码出现在系统预览中") },
                leadingContent = { Icon(Icons.Outlined.Lock, null) },
                trailingContent = { Switch(protect, { protect = it; onApplyScreenProtection(it) }) },
            )
        }
        item {
            Text("版本 ${BuildConfig.VERSION_NAME}", style = MaterialTheme.typography.bodySmall)
            Text("核心能力离线可用，不申请网络权限。", style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun DiagnosticsScreen(operations: List<OperationEntity>, permission: Boolean, parcelCount: Int, draftCount: Int) {
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item {
            DetailBlock("本机状态") {
                DetailLine("通知访问", if (permission) "已开启" else "未开启")
                DetailLine("快递记录", parcelCount.toString())
                DetailLine("待确认草稿", draftCount.toString())
                DetailLine("原始通知上传", "0")
            }
        }
        item { SectionTitle("最近操作") }
        if (operations.isEmpty()) item { EmptyState("暂无操作记录") }
        items(operations, key = { it.id }) { operation ->
            ListItem(
                headlineContent = { Text(operation.type) },
                supportingContent = { Text("${operation.state} · ${formatEpoch(operation.createdAtEpochMs)}") },
                trailingContent = { Text(operation.checksum.take(8), style = MaterialTheme.typography.labelSmall) },
            )
        }
        item { Text("诊断不包含原始通知正文、完整取件码、手机号或详细地址。", style = MaterialTheme.typography.bodySmall) }
    }
}

@Composable
private fun ModeSelector(selected: AutomationMode, onSelected: (AutomationMode) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        ModeRow(AutomationMode.MANUAL, "手动记录", "不读取通知，只使用手动输入和系统分享", selected, onSelected)
        ModeRow(AutomationMode.SUGGEST, "发现后让我确认", "白名单通知生成草稿，确认后保存", selected, onSelected)
        ModeRow(AutomationMode.AUTO_ORGANIZE, "自动整理可信状态", "仅自动更新高置信度低风险状态，敏感变化仍需确认", selected, onSelected)
    }
}

@Composable
private fun ModeRow(mode: AutomationMode, title: String, detail: String, selected: AutomationMode, onSelected: (AutomationMode) -> Unit) {
    Card(onClick = { onSelected(mode) }, colors = CardDefaults.cardColors(containerColor = if (selected == mode) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant)) {
        Row(Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Checkbox(selected == mode, onCheckedChange = { onSelected(mode) })
            Column(Modifier.padding(start = 8.dp)) {
                Text(title, fontWeight = FontWeight.Medium)
                Text(detail, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

@Composable private fun Metric(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(Modifier.padding(12.dp)) { Text(value, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.SemiBold); Text(label, style = MaterialTheme.typography.bodySmall) }
    }
}

@Composable private fun ParcelRow(parcel: Parcel, onClick: (String) -> Unit) {
    Card(onClick = { onClick(parcel.id) }, modifier = Modifier.fillMaxWidth()) {
        ListItem(
            headlineContent = { Text(carrierName(parcel.carrier), fontWeight = FontWeight.Medium) },
            supportingContent = { Text(listOfNotNull(parcel.pickupLocation, statusName(parcel.currentStatus.name)).joinToString(" · ")) },
            trailingContent = { parcel.pickupCode?.let { Text(maskPickupCode(it), color = Green) } },
        )
    }
}

@Composable private fun DraftRow(draft: ParcelDraftEntity, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("${carrierName(draft.carrier)} · ${statusName(draft.status)}", fontWeight = FontWeight.Medium)
            draft.pickupLocation?.let { Text(it) }
            Text("${confidenceName(draft.confidenceBand)}置信度 · 原始通知未保存", style = MaterialTheme.typography.bodySmall)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = onConfirm) { Text("确认") }
                TextButton(onClick = onDismiss) { Text("忽略") }
            }
        }
    }
}

@Composable private fun InfoBand(title: String, detail: String, action: String, onClick: () -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)) {
        Column(Modifier.padding(14.dp)) { Text(title, fontWeight = FontWeight.Medium); Text(detail); TextButton(onClick = onClick) { Text(action) } }
    }
}

@Composable private fun StatusLine(ok: Boolean, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) { Icon(if (ok) Icons.Outlined.CheckCircle else Icons.Outlined.Notifications, null, tint = if (ok) Green else MaterialTheme.colorScheme.onSurfaceVariant); Spacer(Modifier.width(8.dp)); Text(text) }
}

@Composable private fun ActionRow(icon: ImageVector, label: String, onClick: () -> Unit) {
    Card(onClick = onClick, modifier = Modifier.fillMaxWidth()) { ListItem(headlineContent = { Text(label) }, leadingContent = { Icon(icon, null) }) }
}

@Composable private fun SectionTitle(text: String) = Text(text, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
@Composable private fun EmptyState(text: String) = Box(Modifier.fillMaxWidth().padding(vertical = 28.dp), contentAlignment = Alignment.Center) { Text(text, color = MaterialTheme.colorScheme.onSurfaceVariant) }
@Composable private fun DetailBlock(title: String, content: @Composable () -> Unit) { Card(Modifier.fillMaxWidth()) { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) { SectionTitle(title); content() } } }
@Composable private fun DetailLine(label: String, value: String) { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant); Text(value, fontWeight = FontWeight.Medium) } }

@Composable private fun ConfirmDialog(title: String, text: String, onDismiss: () -> Unit, onConfirm: () -> Unit) {
    AlertDialog(onDismissRequest = onDismiss, title = { Text(title) }, text = { Text(text) }, confirmButton = { TextButton(onClick = onConfirm) { Text("确认") } }, dismissButton = { TextButton(onClick = onDismiss) { Text("取消") } })
}

private val PRIMARY_ROUTES = listOf(Route.HOME, Route.PARCELS, Route.ASSISTANT, Route.PRIVACY)
private val KNOWN_SOURCES = listOf(
    "com.cainiao.wireless" to "菜鸟",
    "com.fcbox.hiveconsumer" to "丰巢",
    "com.sf.activity" to "顺丰速运",
    "com.jingdong.app.mall" to "京东",
    "com.taobao.taobao" to "淘宝",
    "com.xunmeng.pinduoduo" to "拼多多",
)

private fun carrierName(value: String) = mapOf("cainiao" to "菜鸟", "fengchao" to "丰巢", "sf" to "顺丰", "jd" to "京东物流", "yto" to "圆通", "zto" to "中通", "sto" to "申通", "yunda" to "韵达", "jnt" to "极兔", "ems" to "EMS", "unknown" to "未知物流")[value] ?: value
private fun statusName(value: String) = mapOf("DISCOVERED" to "已发现", "AWAITING_SHIPMENT" to "待发货", "SHIPPED" to "已发货", "IN_TRANSIT" to "运输中", "ARRIVED_LOCAL_STATION" to "已到站", "OUT_FOR_DELIVERY" to "派送中", "READY_FOR_PICKUP" to "待取件", "DELIVERED" to "已签收", "PICKED_UP" to "已取件", "EXCEPTION" to "物流异常", "RETURNED" to "已退回", "ARCHIVED" to "已归档")[value] ?: value
private fun confidenceName(value: String) = mapOf("HIGH" to "高", "MEDIUM" to "中", "LOW" to "低")[value] ?: value
private fun formatInstant(value: java.time.Instant): String = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneId.systemDefault()).format(value)
private fun formatEpoch(value: Long): String = formatInstant(java.time.Instant.ofEpochMilli(value))
