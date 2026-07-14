package com.chronos.shike

import android.app.Application
import android.util.Log
import com.chronos.shike.capture.NotificationSourceAdapter
import com.chronos.shike.security.PickupCodeCrypto
import com.chronos.shike.storage.ChronosDatabase
import com.chronos.shike.storage.ParcelRepository
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class ChronosApplication : Application() {
    lateinit var container: AppContainer
        private set

    private val applicationScope = CoroutineScope(
        SupervisorJob() + Dispatchers.Default + CoroutineExceptionHandler { _, throwable ->
            Log.e("ChronosApplication", "Application coroutine exception", throwable)
        }
    )

    override fun onCreate() {
        super.onCreate()
        val database = ChronosDatabase.create(this)
        val preferences = ChronosPreferences(this)
        val repository = ParcelRepository(database, PickupCodeCrypto())
        container = AppContainer(
            repository = repository,
            notificationSource = NotificationSourceAdapter(this, repository, preferences),
            preferences = preferences,
        )

        applicationScope.launch {
            try {
                val report = repository.recoverPendingOperations()
                Log.i("ChronosApplication", "Recovered pending operations: total=${report.totalPending}, recovered=${report.recovered}, quarantined=${report.quarantined}")
            } catch (e: Exception) {
                Log.e("ChronosApplication", "Failed to recover pending operations", e)
            }
        }
    }
}

data class AppContainer(
    val repository: ParcelRepository,
    val notificationSource: NotificationSourceAdapter,
    val preferences: ChronosPreferences,
)
