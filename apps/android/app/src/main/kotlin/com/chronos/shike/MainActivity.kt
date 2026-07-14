package com.chronos.shike

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.WindowManager
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : FragmentActivity() {
    private lateinit var viewModel: ShikeViewModel
    private var pendingExport: String? = null
    private var notificationAccessGranted by mutableStateOf(false)

    private val exportLauncher = registerForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        val payload = pendingExport
        pendingExport = null
        if (uri != null && payload != null) contentResolver.openOutputStream(uri)?.use { it.write(payload.toByteArray()) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val application = application as ChronosApplication
        viewModel = ViewModelProvider(this, ShikeViewModel.Factory(application, application.container))[ShikeViewModel::class.java]
        applyScreenProtection(application.container.preferences.protectScreens)
        handleShareIntent(intent)
        refreshPermission()
        setContent {
            ChronosApp(
                viewModel = viewModel,
                notificationAccessGranted = notificationAccessGranted,
                onOpenNotificationAccess = ::openNotificationAccess,
                onRevealSensitive = ::authenticate,
                onExport = ::exportData,
                onApplyScreenProtection = ::applyScreenProtection,
            )
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleShareIntent(intent)
    }

    override fun onResume() {
        super.onResume()
        refreshPermission()
    }

    private fun handleShareIntent(intent: Intent?) {
        if (intent?.action == Intent.ACTION_SEND && intent.type == "text/plain") {
            intent.getStringExtra(Intent.EXTRA_TEXT)?.takeIf(String::isNotBlank)?.let(viewModel::prepareShare)
        }
    }

    private fun refreshPermission() {
        notificationAccessGranted = (application as ChronosApplication).container.notificationSource.permissionStatus() ==
            com.chronos.shike.contract.PermissionStatus.GRANTED
    }

    private fun openNotificationAccess() {
        startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
    }

    private fun authenticate(onSuccess: () -> Unit) {
        val manager = BiometricManager.from(this)
        if (manager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.DEVICE_CREDENTIAL) != BiometricManager.BIOMETRIC_SUCCESS) return
        val prompt = BiometricPrompt(
            this,
            ContextCompat.getMainExecutor(this),
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    onSuccess()
                }
            },
        )
        prompt.authenticate(
            BiometricPrompt.PromptInfo.Builder()
                .setTitle("查看完整取件码")
                .setSubtitle("验证设备身份后临时显示")
                .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.DEVICE_CREDENTIAL)
                .build(),
        )
    }

    private fun exportData() {
        lifecycleScope.launch {
            pendingExport = viewModel.exportMasked()
            exportLauncher.launch("shike-parcels-masked.json")
        }
    }

    private fun applyScreenProtection(enabled: Boolean) {
        (application as? ChronosApplication)?.container?.preferences?.protectScreens = enabled
        if (enabled) window.addFlags(WindowManager.LayoutParams.FLAG_SECURE) else window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }
}
