package com.chronos.shike.security

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

interface PickupCodeCipher {
    fun encrypt(plainText: String): ByteArray
    fun decrypt(payload: ByteArray): String
    fun deleteKey()
}

class PickupCodeCrypto : PickupCodeCipher {
    override fun encrypt(plainText: String): ByteArray {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, key())
        return cipher.iv + cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))
    }

    override fun decrypt(payload: ByteArray): String {
        require(payload.size > IV_BYTES)
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, payload.copyOfRange(0, IV_BYTES)))
        return cipher.doFinal(payload.copyOfRange(IV_BYTES, payload.size)).toString(Charsets.UTF_8)
    }

    override fun deleteKey() {
        val keyStore = KeyStore.getInstance(KEYSTORE).apply { load(null) }
        if (keyStore.containsAlias(KEY_ALIAS)) keyStore.deleteEntry(KEY_ALIAS)
    }

    private fun key(): SecretKey {
        val keyStore = KeyStore.getInstance(KEYSTORE).apply { load(null) }
        (keyStore.getKey(KEY_ALIAS, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE)
        generator.init(
            KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
            ).setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build(),
        )
        return generator.generateKey()
    }

    companion object {
        private const val KEYSTORE = "AndroidKeyStore"
        private const val KEY_ALIAS = "chronos_pickup_code_v1"
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val IV_BYTES = 12
    }
}
