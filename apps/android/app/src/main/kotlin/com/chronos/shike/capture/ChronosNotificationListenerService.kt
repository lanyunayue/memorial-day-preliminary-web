package com.chronos.shike.capture

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.chronos.shike.ChronosApplication
import java.time.Instant
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class ChronosNotificationListenerService : NotificationListenerService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val adapter by lazy { (application as ChronosApplication).container.notificationSource }

    override fun onListenerConnected() {
        super.onListenerConnected()
        adapter.start()
    }

    override fun onListenerDisconnected() {
        adapter.stop()
        super.onListenerDisconnected()
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        // Check consent before reading any notification fields.
        if (!adapter.isAllowed(sbn.packageName)) return
        val extras = sbn.notification.extras
        val input = NotificationInput(
            sourcePackage = sbn.packageName,
            sourceLabel = runCatching {
                packageManager.getApplicationLabel(packageManager.getApplicationInfo(sbn.packageName, 0)).toString()
            }.getOrElse { sbn.packageName },
            title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString(),
            text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString(),
            occurredAt = Instant.ofEpochMilli(sbn.postTime),
        )
        scope.launch { adapter.process(input) }
    }

    override fun onDestroy() {
        adapter.stop()
        scope.cancel()
        super.onDestroy()
    }
}
