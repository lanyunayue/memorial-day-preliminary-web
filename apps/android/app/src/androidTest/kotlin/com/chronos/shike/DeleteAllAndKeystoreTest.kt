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
import java.security.KeyStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class DeleteAllAndKeystoreTest {
    private lateinit var context: Context
    private lateinit var database: ChronosDatabase
    private lateinit var repository: ParcelRepository
    private lateinit var crypto: PickupCodeCrypto

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        PickupCodeCrypto().deleteKey()
        crypto = PickupCodeCrypto()
        database = Room.inMemoryDatabaseBuilder(context, ChronosDatabase::class.java).build()
        repository = ParcelRepository(database, crypto)
    }

    @After
    fun tearDown() {
        database.close()
        PickupCodeCrypto().deleteKey()
    }

    private suspend fun createParcel(text: String, sourcePackage: String = "test.source"): String {
        val adapter = UserProvidedSourceAdapter(EventSourceType.MANUAL, sourcePackage)
        val envelope = adapter.capture(UserProvidedInput(text))!!
        return repository.captureConfirmed(envelope, text)!!
    }

    @Test
    fun clearAllDeletesAllParcelsAndEvents() = runBlocking {
        createParcel("圆通快递 运单号 YT11111111 已到达南苑驿站，取件码 1-1-1111", "delete.test1")
        createParcel("中通快递 运单号 ZT22222222 已到达北苑驿站，取件码 2-2-2222", "delete.test2")

        assertTrue("Parcels should exist before clearAll", repository.observeParcels().first().isNotEmpty())
        assertTrue("Parcel entities should exist in database", database.parcelDao().all().isNotEmpty())

        repository.clearAll()

        assertTrue("Parcels should be empty after clearAll", repository.observeParcels().first().isEmpty())
        assertTrue("Parcel entities should be deleted from database", database.parcelDao().all().isEmpty())
    }

    @Test
    fun clearAllDeletesDrafts() = runBlocking {
        // Create a draft by using the capture method with autoOrganize = false
        val adapter = UserProvidedSourceAdapter(EventSourceType.MANUAL, "draft.test")
        val text = "圆通快递 运单号 YT33333333 已到达南苑驿站，取件码 3-3-3333"
        val envelope = adapter.capture(UserProvidedInput(text))!!
        repository.capture(envelope, text, autoOrganize = false)

        assertTrue("Drafts should exist before clearAll", repository.observeDrafts().first().isNotEmpty())

        repository.clearAll()

        assertTrue("Drafts should be empty after clearAll", repository.observeDrafts().first().isEmpty())
    }

    @Test
    fun clearAllDeletesCryptoKey() = runBlocking {
        createParcel("圆通快递 运单号 YT44444444 已到达南苑驿站，取件码 4-4-4444", "crypto.test")

        // Verify the key exists before clearAll
        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        assertTrue(
            "Android KeyStore should contain the pickup code key before clearAll",
            keyStore.containsAlias("chronos_pickup_code_v1"),
        )

        repository.clearAll()

        // Verify the key is deleted after clearAll
        assertFalse(
            "Android KeyStore should not contain the pickup code key after clearAll",
            keyStore.containsAlias("chronos_pickup_code_v1"),
        )
    }

    @Test
    fun oldEncryptedDataCannotBeDecryptedAfterClearAll() = runBlocking {
        createParcel("圆通快递 运单号 YT55555555 已到达南苑驿站，取件码 5-5-5555", "decrypt.test")

        // Save the encrypted pickup code bytes before clearAll
        val entity = database.parcelDao().all().first()
        val encryptedBytes = entity.pickupCodeEncrypted
            ?: error("Pickup code should be encrypted in the entity")

        // Verify the original crypto can decrypt it
        assertEquals("5-5-5555", crypto.decrypt(encryptedBytes))

        // clearAll deletes the crypto key along with all data
        repository.clearAll()

        // A new PickupCodeCrypto instance will generate a new key since the old one was deleted.
        // The new key cannot decrypt data encrypted with the old key.
        val newCrypto = PickupCodeCrypto()
        try {
            newCrypto.decrypt(encryptedBytes)
            fail("Decryption should fail after the original key is deleted")
        } catch (e: Exception) {
            // Expected: AEADBadTagException (GCM authentication tag mismatch)
            // The new key cannot authenticate/decrypt data encrypted with the old key.
        }
    }

    @Test
    fun exportMaskedDoesNotContainPickupCodes() = runBlocking {
        createParcel("圆通快递 运单号 YT66666666 已到达南苑驿站，取件码 6-6-6666", "export.test1")
        createParcel("中通快递 运单号 ZT77777777 已到达北苑驿站，取件码 8-8-8888", "export.test2")

        val exported = repository.exportMasked()

        // The export should contain the masked placeholder for pickup codes
        assertTrue(
            "Export should contain masked pickup code placeholder",
            exported.contains("\"pickupCode\":\"masked\""),
        )

        // The actual pickup codes should not appear anywhere in the export
        assertFalse(
            "Export should not contain pickup code 6-6-6666",
            exported.contains("6-6-6666"),
        )
        assertFalse(
            "Export should not contain pickup code 8-8-8888",
            exported.contains("8-8-8888"),
        )
    }

    @Test
    fun exportMaskedDoesNotContainFullTrackingNumbers() = runBlocking {
        createParcel("圆通快递 运单号 YT88888888 已到达南苑驿站，取件码 9-9-9999", "tracking.test")

        val exported = repository.exportMasked()

        // The full tracking number should not appear in the export (only the masked version)
        assertFalse(
            "Export should not contain full tracking number",
            exported.contains("YT88888888"),
        )
    }

    @Test
    fun clearAllIsIdempotentSafe() = runBlocking {
        createParcel("圆通快递 运单号 YT99999999 已到达南苑驿站，取件码 1-2-1234", "idempotent.test")

        repository.clearAll()
        assertTrue(repository.observeParcels().first().isEmpty())

        // Calling clearAll again should not throw even though there is nothing to clear
        repository.clearAll()
        assertTrue(repository.observeParcels().first().isEmpty())
    }
}
