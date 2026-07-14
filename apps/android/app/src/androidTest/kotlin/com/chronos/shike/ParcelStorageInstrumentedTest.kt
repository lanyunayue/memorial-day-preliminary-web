package com.chronos.shike

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.chronos.shike.capture.UserProvidedInput
import com.chronos.shike.capture.UserProvidedSourceAdapter
import com.chronos.shike.contract.EventSourceType
import com.chronos.shike.security.PickupCodeCrypto
import com.chronos.shike.storage.ChronosDatabase
import com.chronos.shike.storage.ParcelRepository
import java.io.File
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class ParcelStorageInstrumentedTest {
    private lateinit var context: Context
    private lateinit var database: ChronosDatabase
    private lateinit var repository: ParcelRepository

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        database = Room.databaseBuilder(context, ChronosDatabase::class.java, "instrumented-parcel.db").build()
        repository = ParcelRepository(database, PickupCodeCrypto())
    }

    @After
    fun tearDown() {
        database.close()
        context.deleteDatabase("instrumented-parcel.db")
    }

    @Test
    fun roomRoundTripEncryptsPickupCodeAndClearRemovesSensitiveData() = runBlocking {
        val text = "圆通快递已到达南苑驿站，取件码 4-2-6187"
        val adapter = UserProvidedSourceAdapter(EventSourceType.MANUAL, "instrumented.test")
        val envelope = adapter.capture(UserProvidedInput(text))!!
        repository.captureConfirmed(envelope, text)

        val parcels = repository.observeParcels().first()
        assertEquals("4-2-6187", parcels.single().pickupCode)
        database.close()
        val bytes = File(context.getDatabasePath("instrumented-parcel.db").absolutePath).readBytes().toString(Charsets.ISO_8859_1)
        assertFalse(bytes.contains("4-2-6187"))

        database = Room.databaseBuilder(context, ChronosDatabase::class.java, "instrumented-parcel.db").build()
        repository = ParcelRepository(database, PickupCodeCrypto())
        repository.clearAll()
        assertTrue(repository.observeParcels().first().isEmpty())
    }
}
