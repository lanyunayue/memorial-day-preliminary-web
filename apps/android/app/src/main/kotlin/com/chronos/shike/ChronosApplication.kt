package com.chronos.shike

import android.app.Application
import com.chronos.shike.capture.NotificationSourceAdapter
import com.chronos.shike.security.PickupCodeCrypto
import com.chronos.shike.storage.ChronosDatabase
import com.chronos.shike.storage.ParcelRepository

class ChronosApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        val database = ChronosDatabase.create(this)
        val repository = ParcelRepository(database, PickupCodeCrypto())
        container = AppContainer(
            repository = repository,
            notificationSource = NotificationSourceAdapter(this, repository),
            preferences = ChronosPreferences(this),
        )
    }
}

data class AppContainer(
    val repository: ParcelRepository,
    val notificationSource: NotificationSourceAdapter,
    val preferences: ChronosPreferences,
)
