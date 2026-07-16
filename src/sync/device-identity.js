/**
 * device-identity.js
 * 时刻 Shike — v2.0.0-rc5 Optional Sync Beta
 *
 * Encrypted device identity management using the Web Crypto API.
 *
 * Responsibilities:
 *   - Create or retrieve a per-device ECDH key pair stored in localStorage.
 *   - Rotate keys while preserving the stable device identifier.
 *   - Export / import an encrypted recovery package (AES-GCM + PBKDF2).
 *
 * Security notes:
 *   - The private key is stored ONLY in localStorage and is never uploaded.
 *   - The recovery package encrypts the private key with a user-supplied
 *     password before it leaves the device.
 *
 * @module  ShikeDeviceIdentity
 * @global  window.ShikeDeviceIdentity
 */

(function (global) {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Constants
     * ------------------------------------------------------------------ */

    /** localStorage key that holds the serialised identity object. */
    var STORAGE_KEY = 'shike_device_identity';

    /** PBKDF2 iteration count used when deriving the recovery AES key. */
    var PBKDF2_ITERATIONS = 100000;

    /** Recovery-package format version (bumped on breaking format changes). */
    var RECOVERY_VERSION = 1;

    /** ECDH named curve used for key-pair generation. */
    var KEY_CURVE = 'P-256';

    /* ------------------------------------------------------------------ *
     * Internal helpers
     * ------------------------------------------------------------------ */

    /**
     * Generates a RFC-4122 v4 UUID string.
     *
     * Uses `crypto.randomUUID` when available and falls back to a
     * manual implementation based on `Math.random`.
     *
     * @returns {string} A UUID v4 string in the canonical 8-4-4-4-12 form.
     */
    function generateUUID() {
        try {
            if (global.crypto && typeof global.crypto.randomUUID === 'function') {
                return global.crypto.randomUUID();
            }
        } catch (e) {
            /* fall through to manual generation */
        }

        var chars = '0123456789abcdef';
        var uuid = '';
        var i, rnd;

        for (i = 0; i < 36; i++) {
            if (i === 8 || i === 13 || i === 18 || i === 23) {
                uuid += '-';
            } else if (i === 14) {
                uuid += '4'; /* version 4 */
            } else if (i === 19) {
                uuid += chars[(Math.random() * 4) | 8]; /* variant */
            } else {
                rnd = (Math.random() * 16) | 0;
                uuid += chars[rnd];
            }
        }
        return uuid;
    }

    /**
     * Generates a device identifier with the `dev_` prefix.
     *
     * @returns {string} Device id in the form `dev_<uuid>`.
     */
    function generateDeviceId() {
        return 'dev_' + generateUUID();
    }

    /**
     * Generates a fresh ECDH key pair via the Web Crypto API.
     *
     * The keys are extractable so they can be serialised to JWK for
     * localStorage persistence and recovery-package export.
     *
     * @returns {Promise<CryptoKeyPair>} Resolves to `{ publicKey, privateKey }`.
     */
    async function generateKeyPair() {
        return await global.crypto.subtle.generateKey(
            { name: 'ECDH', namedCurve: KEY_CURVE },
            true,
            ['deriveKey', 'deriveBits']
        );
    }

    /**
     * Exports a CryptoKey to its JWK representation.
     *
     * @param {CryptoKey} key - The key to export.
     * @returns {Promise<JsonWebKey>} JWK object.
     */
    async function exportKeyJwk(key) {
        return await global.crypto.subtle.exportKey('jwk', key);
    }

    /**
     * Persists the identity object to localStorage.
     *
     * @param {Object} identity - Identity to store.
     */
    function saveIdentity(identity) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    }

    /**
     * Loads and parses the identity from localStorage.
     *
     * @returns {Object|null} The identity object, or `null` when absent / corrupt.
     */
    function loadIdentity() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return null;
            }
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    /**
     * Derives a 256-bit AES-GCM key from a user password using PBKDF2.
     *
     * @param {string} password - The user-supplied password.
     * @param {Uint8Array} salt - Cryptographically random salt (>= 16 bytes).
     * @returns {Promise<CryptoKey>} A non-extractable AES-GCM key.
     */
    async function deriveKeyFromPassword(password, salt) {
        var enc = new TextEncoder();

        var keyMaterial = await global.crypto.subtle.importKey(
            'raw',
            enc.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return await global.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: PBKDF2_ITERATIONS,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /* ------------------------------------------------------------------ *
     * Public API
     * ------------------------------------------------------------------ */

    /**
     * Creates a new device identity if none exists, or returns the
     * existing one from localStorage.
     *
     * The identity object has the shape:
     * ```js
     * {
     *   deviceId:   'dev_<uuid>',
     *   publicKey:  <JsonWebKey>,
     *   privateKey: <JsonWebKey>,   // stored ONLY in localStorage
     *   createdAt:  <number>
     * }
     * ```
     *
     * @returns {Promise<Object>} Resolves to the identity object.
     * @throws  {Error} When key generation or storage fails.
     */
    async function getOrCreateIdentity() {
        try {
            var existing = loadIdentity();
            if (existing) {
                return existing;
            }

            var keyPair = await generateKeyPair();
            var pubJwk = await exportKeyJwk(keyPair.publicKey);
            var privJwk = await exportKeyJwk(keyPair.privateKey);

            var identity = {
                deviceId: generateDeviceId(),
                publicKey: pubJwk,
                privateKey: privJwk,
                createdAt: Date.now()
            };

            saveIdentity(identity);
            return identity;
        } catch (e) {
            throw new Error('Failed to create device identity: ' + e.message);
        }
    }

    /**
     * Returns the current identity from localStorage without creating one.
     *
     * @returns {Object|null} The identity object, or `null`.
     */
    function getIdentity() {
        return loadIdentity();
    }

    /**
     * Returns just the device-id string.
     *
     * @returns {string|null} The device id, or `null` when no identity exists.
     */
    function getDeviceId() {
        var identity = loadIdentity();
        return identity ? identity.deviceId : null;
    }

    /**
     * Generates a new ECDH key pair and replaces the existing keys while
     * preserving the stable `deviceId`.
     *
     * This is useful after a suspected key compromise or as part of a
     * periodic security hygiene routine.
     *
     * @returns {Promise<Object>} The updated identity object.
     * @throws  {Error} When no identity exists or key generation fails.
     */
    async function rotateKeys() {
        try {
            var existing = loadIdentity();
            if (!existing) {
                throw new Error('No identity found. Call getOrCreateIdentity() first.');
            }

            var keyPair = await generateKeyPair();
            var pubJwk = await exportKeyJwk(keyPair.publicKey);
            var privJwk = await exportKeyJwk(keyPair.privateKey);

            existing.publicKey = pubJwk;
            existing.privateKey = privJwk;
            existing.rotatedAt = Date.now();

            saveIdentity(existing);
            return existing;
        } catch (e) {
            throw new Error('Failed to rotate keys: ' + e.message);
        }
    }

    /**
     * Exports an encrypted recovery package containing the private key.
     *
     * The private key JWK is serialised to JSON, then encrypted with
     * AES-GCM using a key derived from `password` via PBKDF2
     * (100 000 iterations).
     *
     * The returned object has the shape:
     * ```js
     * {
     *   version:              1,
     *   salt:                 number[],   // 16 random bytes
     *   iv:                   number[],   // 12 random bytes
     *   encryptedPrivateKey:  number[],   // AES-GCM ciphertext
     *   deviceId:             'dev_<uuid>',
     *   publicKey:            <JsonWebKey>
     * }
     * ```
     *
     * @param {string} password - The password to protect the private key.
     * @returns {Promise<Object>} The recovery package.
     * @throws  {Error} When no identity exists or encryption fails.
     */
    async function exportRecoveryPackage(password) {
        try {
            var identity = loadIdentity();
            if (!identity) {
                throw new Error('No identity found. Call getOrCreateIdentity() first.');
            }

            var salt = global.crypto.getRandomValues(new Uint8Array(16));
            var iv = global.crypto.getRandomValues(new Uint8Array(12));
            var aesKey = await deriveKeyFromPassword(password, salt);

            var enc = new TextEncoder();
            var privKeyData = enc.encode(JSON.stringify(identity.privateKey));

            var encrypted = await global.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                aesKey,
                privKeyData
            );

            return {
                version: RECOVERY_VERSION,
                salt: Array.from(salt),
                iv: Array.from(iv),
                encryptedPrivateKey: Array.from(new Uint8Array(encrypted)),
                deviceId: identity.deviceId,
                publicKey: identity.publicKey
            };
        } catch (e) {
            throw new Error('Failed to export recovery package: ' + e.message);
        }
    }

    /**
     * Restores an identity from a previously exported recovery package.
     *
     * Derives the AES key from `password`, decrypts the private key,
     * reconstructs the identity, and persists it to localStorage.
     *
     * @param {Object} encryptedBlob - The recovery package (see {@link exportRecoveryPackage}).
     * @param {string} password - The password used during export.
     * @returns {Promise<Object>} The restored identity object.
     * @throws  {Error} When decryption fails (wrong password or corrupt data).
     */
    async function importRecoveryPackage(encryptedBlob, password) {
        try {
            var salt = new Uint8Array(encryptedBlob.salt);
            var iv = new Uint8Array(encryptedBlob.iv);
            var aesKey = await deriveKeyFromPassword(password, salt);

            var encryptedData = new Uint8Array(encryptedBlob.encryptedPrivateKey);
            var decrypted = await global.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                aesKey,
                encryptedData
            );

            var dec = new TextDecoder();
            var privateKey = JSON.parse(dec.decode(decrypted));

            var identity = {
                deviceId: encryptedBlob.deviceId,
                publicKey: encryptedBlob.publicKey,
                privateKey: privateKey,
                createdAt: Date.now(),
                restoredAt: Date.now()
            };

            saveIdentity(identity);
            return identity;
        } catch (e) {
            throw new Error('Failed to import recovery package: ' + e.message);
        }
    }

    /**
     * Removes all identity data from localStorage.
     *
     * After calling this, `getOrCreateIdentity()` will generate a brand-new
     * identity on the next invocation.
     */
    function clearIdentity() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            /* localStorage may be unavailable; silently ignore */
        }
    }

    /* ------------------------------------------------------------------ *
     * Export
     * ------------------------------------------------------------------ */

    global.ShikeDeviceIdentity = {
        getOrCreateIdentity: getOrCreateIdentity,
        getIdentity: getIdentity,
        rotateKeys: rotateKeys,
        exportRecoveryPackage: exportRecoveryPackage,
        importRecoveryPackage: importRecoveryPackage,
        clearIdentity: clearIdentity,
        getDeviceId: getDeviceId
    };
})(typeof window !== 'undefined' ? window : this);
