@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.chronos.shike.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Insights
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Today
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.chronos.shike.OverloadViewModel
import com.chronos.shike.safety.SafetyResponse

private enum class OverloadTab(val title: String, val icon: ImageVector) {
    TODAY("今天", Icons.Outlined.Today),
    DELOAD("降载", Icons.Outlined.Tune),
    REVIEW("回顾", Icons.Outlined.Insights),
    MINE("我的", Icons.Outlined.Person),
}

@Composable
fun OverloadApp(
    viewModel: OverloadViewModel,
    onExport: () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val message by viewModel.message.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }

    val onboardingComplete = state.onboardingComplete
    val safetyResponse: SafetyResponse? = state.safetyResponse

    OverloadTheme(isNightMode = state.isNightMode) {
        Surface(modifier = Modifier.fillMaxSize()) {
            when {
                !onboardingComplete -> {
                    OnboardingScreen(onComplete = viewModel::completeOnboarding)
                }
                safetyResponse != null -> {
                    SafetyScreen(
                        response = safetyResponse,
                        onDismiss = viewModel::dismissSafetyResponse,
                    )
                }
                else -> {
                    var tab by rememberSaveable { mutableStateOf(OverloadTab.TODAY) }

                    LaunchedEffect(message) {
                        message?.let {
                            snackbar.showSnackbar(it)
                            viewModel.clearMessage()
                        }
                    }

                    Scaffold(
                        topBar = {
                            TopAppBar(
                                title = { Text(tab.title) },
                            )
                        },
                        bottomBar = {
                            NavigationBar {
                                OverloadTab.entries.forEach { item ->
                                    NavigationBarItem(
                                        selected = tab == item,
                                        onClick = { tab = item },
                                        icon = {
                                            Icon(
                                                imageVector = item.icon,
                                                contentDescription = item.title,
                                            )
                                        },
                                        label = { Text(item.title) },
                                    )
                                }
                            }
                        },
                        snackbarHost = { SnackbarHost(snackbar) },
                    ) { padding ->
                        Box(
                            modifier = Modifier
                                .padding(padding)
                                .fillMaxSize(),
                        ) {
                            when (tab) {
                                OverloadTab.TODAY -> TodayScreen(
                                    viewModel = viewModel,
                                    state = state,
                                    onNavigateToDeLoad = { tab = OverloadTab.DELOAD },
                                )
                                OverloadTab.DELOAD -> DeLoadScreen(
                                    viewModel = viewModel,
                                    state = state,
                                )
                                OverloadTab.REVIEW -> ReviewScreen(
                                    viewModel = viewModel,
                                    state = state,
                                )
                                OverloadTab.MINE -> MineScreen(
                                    viewModel = viewModel,
                                    state = state,
                                    onExport = onExport,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
