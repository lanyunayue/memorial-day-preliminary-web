package com.chronos.shike

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.view.WindowManager
import android.widget.Toast
import androidx.fragment.app.FragmentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.chronos.shike.BuildConfig
import java.io.IOException
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : FragmentActivity() {
    private lateinit var viewModel: ShikeViewModel
    private var pendingExport: String? = null
    private var notificationAccessGranted by mutableStateOf(false)

    private val coroutineExceptionHandler = CoroutineExceptionHandler { _, throwable ->
        Log.e("MainActivity", "Coroutine exception", throwable)
    }

    private val exportLauncher = registerForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        val payload = pendingExport
        pendingExport = null
        if (uri != null && payload != null) {
            lifecycleScope.launch(Dispatchers.IO + coroutineExceptionHandler) {
                try {
                    contentResolver.openOutputStream(uri)?.use { it.write(payload.toByteArray()) }
                } catch (e: IOException) {
                    Log.e("MainActivity", "Failed to write export file", e)
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@MainActivity, "导出失败：${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
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
        if (BuildConfig.PARCEL_CONNECTOR_ENABLED) {
            notificationAccessGranted = (application as ChronosApplication).container.notificationSource?.permissionStatus() ==
                com.chronos.shike.contract.PermissionStatus.GRANTED
        } else {
            notificationAccessGranted = false
        }
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

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    Log.w("MainActivity", "Biometric authentication failed")
                    Toast.makeText(this@MainActivity, "验证未通过，请重试", Toast.LENGTH_SHORT).show()
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    Log.w("MainActivity", "Biometric authentication error: code=$errorCode, msg=$errString")
                    Toast.makeText(this@MainActivity, "验证错误：$errString", Toast.LENGTH_SHORT).show()
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
        lifecycleScope.launch(coroutineExceptionHandler) {
            pendingExport = viewModel.exportMasked()
            exportLauncher.launch("shike-parcels-${BuildConfig.VERSION_NAME}.json")
        }
    }

    private fun applyScreenProtection(enabled: Boolean) {
        (application as? ChronosApplication)?.container?.preferences?.protectScreens = enabled
        if (enabled) window.addFlags(WindowManager.LayoutParams.FLAG_SECURE) else window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }
}
