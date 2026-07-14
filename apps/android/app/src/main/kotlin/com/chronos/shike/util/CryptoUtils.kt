package com.chronos.shike.util

import java.nio.charset.StandardCharsets
import java.security.MessageDigest

object CryptoUtils {
    fun sha256(value: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(value.toByteArray(StandardCharsets.UTF_8))
            .joinToString("") { "%02x".format(it) }
    }
}

inline fun <reified T : Enum<T>> safeEnumValueOf(name: String?, default: T): T {
    if (name == null) return default
    return try {
        enumValueOf<T>(name)
    } catch (_: IllegalArgumentException) {
        default
    }
}