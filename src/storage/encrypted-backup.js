/**
 * Shike Encrypted Backup Module
 * v2.0.0-rc3 - Data Safety Phase
 *
 * Portable, password-protected backup export/import for "时刻 Shike" records,
 * built entirely on the Web Crypto API (no third-party crypto dependencies).
 *
 * Cryptography:
 *   - Key derivation: PBKDF2 (HMAC-SHA-256, 100,000 iterations) over a random
 *     128-bit salt, producing a 256-bit AES key. extractable = false.
 *   - Symmetric encryption: AES-GCM 256-bit with a random 96-bit IV.
 *   - The password is NEVER persisted or returned by any function. It is held
 *     only in memory long enough to derive the key, then discarded.
 *
 * Container format (version "shike-encrypted-1"):
 *   {
 *     version: 'shike-encrypted-1',
 *     salt:    <base64>,   // 128-bit PBKDF2 salt
 *     iv:      <base64>,   // 96-bit AES-GCM IV
 *     data:    <base64>    // AES-GCM ciphertext of UTF-8 JSON records
 *   }
 *
 * Safety guarantees:
 *   - Wrong-password decryption fails AES-GCM authentication and throws
 *     'DECRYPT_FAILED'. A failed attempt operates only on copies and never
 *     mutates the caller's existing encrypted payload or stored records.
 *   - All input objects are validated and deep-copied (records are never
 *     mutated in place) and prototype-pollution payloads are rejected.
 *   - Inputs are capped at 10 MB to mitigate resource exhaustion.
 *
 * Global: window.ShikeEncryptedBackup
 */
(function (global) {
  'use strict';

  /** @private {string} Container/version tag for encrypted payloads. */
  var VERSION = 'shike-encrypted-1';

  /** @private {number} PBKDF2 iteration count. */
  var PBKDF2_ITERATIONS = 100000;

  /** @private {number} PBKDF2 salt length in bytes (128 bits). */
  var SALT_BYTES = 16;

  /** @private {number} AES-GCM IV length in bytes (96 bits). */
  var IV_BYTES = 12;

  /** @private {number} AES-GCM key length in bits (256). */
  var KEY_BITS = 256;

  /** @private {number} Maximum accepted input size in bytes (10 MB). */
  var MAX_INPUT_BYTES = 10 * 1024 * 1024;

  /** @private {number} Maximum sanitized object nesting depth (cycle guard). */
  var MAX_DEPTH = 64;

  /* ----------------------------------------------------------------------- */
  /* Feature detection                                                       */
  /* ----------------------------------------------------------------------- */

  /**
   * Determine whether the runtime exposes the Web Crypto primitives this
   * module depends on. Returns false in insecure (non-HTTPS / non-localhost)
   * contexts where `crypto.subtle` is unavailable.
   *
   * @returns {boolean} true if all required primitives are present.
   */
  function isSupported() {
    return typeof global.crypto !== 'undefined' &&
      global.crypto !== null &&
      typeof global.crypto.subtle !== 'undefined' &&
      global.crypto.subtle !== null &&
      typeof global.crypto.subtle.importKey === 'function' &&
      typeof global.crypto.subtle.deriveKey === 'function' &&
      typeof global.crypto.subtle.encrypt === 'function' &&
      typeof global.crypto.subtle.decrypt === 'function' &&
      typeof global.crypto.getRandomValues === 'function' &&
      typeof global.TextEncoder === 'function' &&
      typeof global.TextDecoder === 'function' &&
      typeof global.btoa === 'function' &&
      typeof global.atob === 'function';
  }

  /* ----------------------------------------------------------------------- */
  /* Base64 helpers                                                           */
  /* ----------------------------------------------------------------------- */

  /**
   * Encode a byte array to a base64 string. Processes in 32 KiB chunks to
   * avoid quadratic string-concatenation cost on large payloads.
   * @private
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  function bytesToBase64(bytes) {
    var binary = '';
    var len = bytes.length;
    var CHUNK = 0x8000; // 32768
    for (var i = 0; i < len; i += CHUNK) {
      var end = (i + CHUNK < len) ? (i + CHUNK) : len;
      var chunk = '';
      for (var j = i; j < end; j++) {
        chunk += String.fromCharCode(bytes[j]);
      }
      binary += chunk;
    }
    return global.btoa(binary);
  }

  /**
   * Decode a base64 string to a fresh byte array.
   * @private
   * @param {string} b64
   * @returns {Uint8Array}
   */
  function base64ToBytes(b64) {
    var binary = global.atob(b64);
    var len = binary.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /* ----------------------------------------------------------------------- */
  /* Input sanitization (prototype-pollution guard + deep copy)              */
  /* ----------------------------------------------------------------------- */

  /**
   * Property names that must never appear as own keys on objects we accept.
   * Rejecting these prevents prototype-pollution payloads from propagating.
   * @private
   * @param {string} key
   * @returns {boolean}
   */
  function isForbiddenKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
  }

  /**
   * Recursively validate and deep-copy a JSON-serializable value.
   *
   * Only plain objects (proto === Object.prototype or null) and arrays pass
   * through. Forbidden keys and non-plain objects are rejected with a thrown
   * error. The returned value is an entirely independent copy, so callers'
   * original data is never mutated and downstream consumers cannot be polluted.
   *
   * @private
   * @param {*} value - value to sanitize.
   * @param {number} depth - current recursion depth (cycle/depth guard).
   * @returns {*} a clean, independent deep copy.
   * @throws {Error} FORBIDDEN_KEY | INVALID_OBJECT_TYPE | MAX_DEPTH_EXCEEDED
   */
  function sanitize(value, depth) {
    if (depth > MAX_DEPTH) {
      throw new Error('MAX_DEPTH_EXCEEDED');
    }
    if (value === null || typeof value !== 'object') {
      return value; // primitives pass through untouched
    }
    if (Array.isArray(value)) {
      var arr = new Array(value.length);
      for (var i = 0; i < value.length; i++) {
        arr[i] = sanitize(value[i], depth + 1);
      }
      return arr;
    }
    // Only plain objects are accepted (reject Date, Map, class instances...).
    var proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
      throw new Error('INVALID_OBJECT_TYPE');
    }
    var keys = Object.keys(value); // own enumerable string keys only
    var out = {};
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      if (isForbiddenKey(key)) {
        throw new Error('FORBIDDEN_KEY');
      }
      out[key] = sanitize(value[key], depth + 1);
    }
    return out;
  }

  /* ----------------------------------------------------------------------- */
  /* Key derivation                                                           */
  /* ----------------------------------------------------------------------- */

  /**
   * Derive a non-extractable 256-bit AES-GCM key from a password and salt.
   * @private
   * @param {string} password
   * @param {Uint8Array} salt
   * @param {TextEncoder} encoder
   * @returns {Promise<CryptoKey>}
   * @throws {Error} KEY_DERIVATION_FAILED if any crypto primitive rejects.
   */
  async function deriveKey(password, salt, encoder) {
    var baseKey;
    try {
      baseKey = await global.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
    } catch (e) {
      throw new Error('KEY_DERIVATION_FAILED');
    }
    try {
      return await global.crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: KEY_BITS },
        false, // non-extractable: the raw key can never leave the runtime
        ['encrypt', 'decrypt']
      );
    } catch (e) {
      throw new Error('KEY_DERIVATION_FAILED');
    }
  }

  /* ----------------------------------------------------------------------- */
  /* Public API                                                              */
  /* ----------------------------------------------------------------------- */

  /**
   * Encrypt an array of records into a portable, password-protected backup.
   *
   * The supplied `records` array is deep-copied and sanitized before being
   * serialized, so the caller's original objects are never mutated.
   *
   * @param {Array} records - array of JSON-serializable record objects.
   * @param {string} password - user-supplied passphrase (never stored).
   * @returns {Promise<{data: string, salt: string, iv: string, version: string}>}
   *   Encrypted payload whose `data`/`salt`/`iv` fields are base64-encoded.
   * @throws {Error} WEB_CRYPTO_NOT_SUPPORTED | INVALID_PASSWORD | INVALID_RECORDS
   *   | FORBIDDEN_KEY | INVALID_OBJECT_TYPE | MAX_DEPTH_EXCEEDED
   *   | SERIALIZE_FAILED | INPUT_TOO_LARGE | KEY_DERIVATION_FAILED | ENCRYPT_FAILED
   */
  async function encryptBackup(records, password) {
    if (!isSupported()) {
      throw new Error('WEB_CRYPTO_NOT_SUPPORTED');
    }
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('INVALID_PASSWORD');
    }
    if (!Array.isArray(records)) {
      throw new Error('INVALID_RECORDS');
    }

    // Deep-copy + sanitize so the caller's records are never mutated and no
    // prototype-pollution payload can sneak through.
    var safeRecords = sanitize(records, 0);

    var jsonString;
    try {
      jsonString = JSON.stringify(safeRecords);
    } catch (e) {
      throw new Error('SERIALIZE_FAILED');
    }
    if (typeof jsonString !== 'string' || jsonString.length === 0) {
      throw new Error('SERIALIZE_FAILED');
    }

    var encoder = new global.TextEncoder();
    var plaintextBytes = encoder.encode(jsonString);
    if (plaintextBytes.length > MAX_INPUT_BYTES) {
      throw new Error('INPUT_TOO_LARGE');
    }

    var random = global.crypto.getRandomValues.bind(global.crypto);
    var salt = random(new Uint8Array(SALT_BYTES));
    var iv = random(new Uint8Array(IV_BYTES));

    var aesKey = await deriveKey(password, salt, encoder);

    var ciphertext;
    try {
      ciphertext = await global.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        plaintextBytes
      );
    } catch (e) {
      throw new Error('ENCRYPT_FAILED');
    }

    return {
      version: VERSION,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      data: bytesToBase64(new Uint8Array(ciphertext))
    };
  }

  /**
   * Decrypt an encrypted backup payload back into its records array.
   *
   * This function only reads from (never writes to) the supplied
   * `encryptedData` object, and returns a sanitized deep copy of the
   * recovered records. A wrong password or any tampering fails AES-GCM
   * authentication and throws 'DECRYPT_FAILED' without corrupting anything.
   *
   * @param {{version: string, salt: string, iv: string, data: string}} encryptedData
   *   Payload produced by {@link encryptBackup}.
   * @param {string} password - the passphrase used at encryption time.
   * @returns {Promise<Array>} the recovered records (independent deep copy).
   * @throws {Error} WEB_CRYPTO_NOT_SUPPORTED | INVALID_PASSWORD
   *   | INVALID_ENCRYPTED_DATA | UNSUPPORTED_VERSION | INPUT_TOO_LARGE
   *   | KEY_DERIVATION_FAILED | DECRYPT_FAILED | FORBIDDEN_KEY
   *   | INVALID_OBJECT_TYPE | MAX_DEPTH_EXCEEDED
   */
  async function decryptBackup(encryptedData, password) {
    if (!isSupported()) {
      throw new Error('WEB_CRYPTO_NOT_SUPPORTED');
    }
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('INVALID_PASSWORD');
    }
    if (encryptedData === null || typeof encryptedData !== 'object') {
      throw new Error('INVALID_ENCRYPTED_DATA');
    }

    // Read defensively from a copy of the field references. The caller's
    // object is never mutated, so a failed attempt cannot damage stored data.
    var version = encryptedData.version;
    var saltField = encryptedData.salt;
    var ivField = encryptedData.iv;
    var dataField = encryptedData.data;

    if (version !== VERSION) {
      throw new Error('UNSUPPORTED_VERSION');
    }
    if (typeof saltField !== 'string' || saltField.length === 0 ||
        typeof ivField !== 'string' || ivField.length === 0 ||
        typeof dataField !== 'string' || dataField.length === 0) {
      throw new Error('INVALID_ENCRYPTED_DATA');
    }

    var salt, iv, ciphertext;
    try {
      salt = base64ToBytes(saltField);
      iv = base64ToBytes(ivField);
      ciphertext = base64ToBytes(dataField);
    } catch (e) {
      throw new Error('INVALID_ENCRYPTED_DATA');
    }

    if (salt.length !== SALT_BYTES) {
      throw new Error('INVALID_ENCRYPTED_DATA');
    }
    if (iv.length !== IV_BYTES) {
      throw new Error('INVALID_ENCRYPTED_DATA');
    }
    if (ciphertext.length > MAX_INPUT_BYTES) {
      throw new Error('INPUT_TOO_LARGE');
    }

    var encoder = new global.TextEncoder();
    var aesKey = await deriveKey(password, salt, encoder);

    var plaintextBuffer;
    try {
      plaintextBuffer = await global.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        ciphertext
      );
    } catch (e) {
      // AES-GCM authentication-tag mismatch => wrong password or tampering.
      throw new Error('DECRYPT_FAILED');
    }

    var jsonString;
    try {
      jsonString = new global.TextDecoder().decode(plaintextBuffer);
    } catch (e) {
      throw new Error('DECRYPT_FAILED');
    }

    var parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      throw new Error('DECRYPT_FAILED');
    }
    if (!Array.isArray(parsed)) {
      throw new Error('DECRYPT_FAILED');
    }

    // Return a sanitized deep copy so callers receive clean, plain data and
    // cannot be polluted by anything embedded in the recovered payload.
    return sanitize(parsed, 0);
  }

  /* ----------------------------------------------------------------------- */
  /* Export                                                                  */
  /* ----------------------------------------------------------------------- */

  /**
   * @namespace ShikeEncryptedBackup
   * @property {string} VERSION - the container version tag ("shike-encrypted-1").
   * @property {function():boolean} isSupported
   * @property {function(Array, string):Promise} encryptBackup
   * @property {function(object, string):Promise<Array>} decryptBackup
   */
  var api = Object.freeze({
    VERSION: VERSION,
    isSupported: isSupported,
    encryptBackup: encryptBackup,
    decryptBackup: decryptBackup
  });

  global.ShikeEncryptedBackup = api;
})(typeof window !== 'undefined' ? window : this);
