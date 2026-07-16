/**
 * crypto-envelope.js
 * 时刻 Shike — v2.0.0-rc5 Optional Sync Beta
 *
 * Crypto envelope for client-side encryption before upload.
 *
 * Design:
 *   - Uses ECDH (P-256) key agreement to derive a shared secret.
 *   - Encrypts the payload with AES-GCM (256-bit) using that shared secret.
 *   - A fresh ephemeral ECDH key pair is generated for every `encrypt()`
 *     call so that ciphertexts are never deterministic.
 *   - The server only ever sees the ciphertext, the IV, and the ephemeral
 *     public key — it can never recover the plaintext.
 *
 * @module  ShikeCryptoEnvelope
 * @global  window.ShikeCryptoEnvelope
 */

(function (global) {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Constants
     * ------------------------------------------------------------------ */

    /** ECDH named curve — must match the curve used by device-identity.js. */
    var KEY_CURVE = 'P-256';

    /* ------------------------------------------------------------------ *
     * Internal helpers
     * ------------------------------------------------------------------ */

    /**
     * Generates a fresh ephemeral ECDH key pair.
     *
     * The pair is extractable so the public key can be serialised into
     * the envelope.
     *
     * @returns {Promise<CryptoKeyPair>} Resolves to `{ publicKey, privateKey }`.
     */
    async function generateEphemeralKeyPair() {
        return await global.crypto.subtle.generateKey(
            { name: 'ECDH', namedCurve: KEY_CURVE },
            true,
            ['deriveKey', 'deriveBits']
        );
    }

    /**
     * Derives a shared AES-GCM key from an ECDH key-agreement.
     *
     * @param {CryptoKey} privateKey - The ECDH private key (either ephemeral or device key).
     * @param {CryptoKey} publicKey - The ECDH public key of the other party.
     * @returns {Promise<CryptoKey>} A non-extractable AES-GCM (256-bit) key.
     */
    async function deriveSharedKey(privateKey, publicKey) {
        return await global.crypto.subtle.deriveKey(
            { name: 'ECDH', public: publicKey },
            privateKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encodes arbitrary data to a Uint8Array suitable for encryption.
     *
     * Strings are encoded as UTF-8; objects are JSON-serialised first.
     *
     * @param {string|Object} data - The data to encode.
     * @returns {Uint8Array} The encoded bytes.
     */
    function encodeData(data) {
        var enc = new TextEncoder();
        var payload = typeof data === 'string' ? data : JSON.stringify(data);
        return enc.encode(payload);
    }

    /**
     * Decodes a decrypted Uint8Array back to its original type.
     *
     * Attempts JSON parsing first; falls back to a raw string.
     *
     * @param {Uint8Array} bytes - The decrypted bytes.
     * @returns {string|Object} The decoded data.
     */
    function decodeData(bytes) {
        var dec = new TextDecoder();
        var text = dec.decode(bytes);
        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    }

    /* ------------------------------------------------------------------ *
     * Public API
     * ------------------------------------------------------------------ */

    /**
     * Checks whether the Web Crypto API and all required primitives
     * are available in the current environment.
     *
     * @returns {boolean} `true` when encryption is supported.
     */
    function isSupported() {
        try {
            return !!(
                global.crypto &&
                global.crypto.subtle &&
                typeof global.crypto.subtle.generateKey === 'function' &&
                typeof global.crypto.subtle.deriveKey === 'function' &&
                typeof global.crypto.subtle.encrypt === 'function' &&
                typeof global.crypto.subtle.decrypt === 'function' &&
                typeof global.TextEncoder === 'function' &&
                typeof global.TextDecoder === 'function'
            );
        } catch (e) {
            return false;
        }
    }

    /**
     * Encrypts data for a recipient identified by their ECDH public key.
     *
     * Process:
     *   1. Import the recipient's public key (JWK).
     *   2. Generate a fresh ephemeral ECDH key pair.
     *   3. Perform ECDH key agreement to derive a shared AES-GCM key.
     *   4. Encrypt the data with AES-GCM using a random 12-byte IV.
     *
     * The returned payload is self-contained — the recipient needs only
     * their private key to decrypt.
     *
     * @param {string|Object} data - The data to encrypt.
     * @param {JsonWebKey} publicKey - The recipient's ECDH public key (JWK).
     * @returns {Promise<Object>} Encrypted payload:
     *   ```js
     *   {
     *     ciphertext:    number[],      // AES-GCM ciphertext
     *     iv:            number[],      // 12-byte IV
     *     ephemeralKey:  <JsonWebKey>  // ephemeral public key
     *   }
     *   ```
     * @throws {Error} When encryption fails.
     */
    async function encrypt(data, publicKey) {
        try {
            var importedPubKey = await global.crypto.subtle.importKey(
                'jwk',
                publicKey,
                { name: 'ECDH', namedCurve: KEY_CURVE },
                true,
                []
            );

            var ephemeralKeyPair = await generateEphemeralKeyPair();
            var ephemeralPubJwk = await global.crypto.subtle.exportKey(
                'jwk',
                ephemeralKeyPair.publicKey
            );

            var sharedKey = await deriveSharedKey(
                ephemeralKeyPair.privateKey,
                importedPubKey
            );

            var iv = global.crypto.getRandomValues(new Uint8Array(12));
            var encoded = encodeData(data);

            var ciphertext = await global.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                sharedKey,
                encoded
            );

            return {
                ciphertext: Array.from(new Uint8Array(ciphertext)),
                iv: Array.from(iv),
                ephemeralKey: ephemeralPubJwk
            };
        } catch (e) {
            throw new Error('Encryption failed: ' + e.message);
        }
    }

    /**
     * Decrypts an envelope that was encrypted with {@link encrypt}.
     *
     * Process:
     *   1. Import the recipient's private key (JWK).
     *   2. Import the ephemeral public key from the envelope.
     *   3. Perform ECDH key agreement to re-derive the shared AES-GCM key.
     *   4. Decrypt the ciphertext with AES-GCM.
     *
     * @param {Object} encryptedPayload - The payload from {@link encrypt}.
     * @param {JsonWebKey} privateKey - The recipient's ECDH private key (JWK).
     * @returns {Promise<string|Object>} The original data.
     * @throws {Error} When decryption fails (wrong key or corrupt data).
     */
    async function decrypt(encryptedPayload, privateKey) {
        try {
            var importedPrivKey = await global.crypto.subtle.importKey(
                'jwk',
                privateKey,
                { name: 'ECDH', namedCurve: KEY_CURVE },
                true,
                ['deriveKey', 'deriveBits']
            );

            var importedEphemeralPubKey = await global.crypto.subtle.importKey(
                'jwk',
                encryptedPayload.ephemeralKey,
                { name: 'ECDH', namedCurve: KEY_CURVE },
                true,
                []
            );

            var sharedKey = await deriveSharedKey(
                importedPrivKey,
                importedEphemeralPubKey
            );

            var iv = new Uint8Array(encryptedPayload.iv);
            var ciphertext = new Uint8Array(encryptedPayload.ciphertext);

            var decrypted = await global.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                sharedKey,
                ciphertext
            );

            return decodeData(new Uint8Array(decrypted));
        } catch (e) {
            throw new Error('Decryption failed: ' + e.message);
        }
    }

    /**
     * Encrypts multiple items in a single batch.
     *
     * Each item gets its own ephemeral key pair and IV so that ciphertexts
     * remain independent.
     *
     * @param {Array} items - Array of items to encrypt.
     * @param {JsonWebKey} publicKey - The recipient's ECDH public key (JWK).
     * @returns {Promise<Array<Object>>} Array of encrypted payloads.
     * @throws {Error} When any item fails to encrypt.
     */
    async function encryptBatch(items, publicKey) {
        try {
            var results = [];
            var i;
            for (i = 0; i < items.length; i++) {
                var encrypted = await encrypt(items[i], publicKey);
                results.push(encrypted);
            }
            return results;
        } catch (e) {
            throw new Error('Batch encryption failed: ' + e.message);
        }
    }

    /**
     * Decrypts multiple envelopes in a single batch.
     *
     * @param {Array<Object>} encryptedItems - Array of encrypted payloads.
     * @param {JsonWebKey} privateKey - The recipient's ECDH private key (JWK).
     * @returns {Promise<Array>} Array of decrypted items.
     * @throws {Error} When any item fails to decrypt.
     */
    async function decryptBatch(encryptedItems, privateKey) {
        try {
            var results = [];
            var i;
            for (i = 0; i < encryptedItems.length; i++) {
                var decrypted = await decrypt(encryptedItems[i], privateKey);
                results.push(decrypted);
            }
            return results;
        } catch (e) {
            throw new Error('Batch decryption failed: ' + e.message);
        }
    }

    /* ------------------------------------------------------------------ *
     * Export
     * ------------------------------------------------------------------ */

    global.ShikeCryptoEnvelope = {
        encrypt: encrypt,
        decrypt: decrypt,
        encryptBatch: encryptBatch,
        decryptBatch: decryptBatch,
        isSupported: isSupported
    };
})(typeof window !== 'undefined' ? window : this);
