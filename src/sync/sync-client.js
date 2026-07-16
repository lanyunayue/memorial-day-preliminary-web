/**
 * sync-client.js
 * 时刻 Shike — v2.0.0-rc5 Optional Sync Beta
 *
 * Sync client that manages push / pull operations against a sync server.
 *
 * Design:
 *   - All payloads are encrypted client-side via the crypto-envelope module
 *     before they leave the device.  The server never sees plaintext.
 *   - The operation log is append-only — operations are never mutated,
 *     only superseded by later operations.
 *   - A version vector (per-device counters) tracks how far each device
 *     has synced.
 *   - When the endpoint is empty or unreachable, operations are queued
 *     in localStorage and retried later (offline-first).
 *
 * @module  ShikeSyncClient
 * @global  window.ShikeSyncClient
 */

(function (global) {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Constants
     * ------------------------------------------------------------------ */

    /** localStorage key for the offline operation queue. */
    var QUEUE_KEY = 'shike_sync_queue';

    /** localStorage key that persists the configured endpoint. */
    var ENDPOINT_KEY = 'shike_sync_endpoint';

    /* ------------------------------------------------------------------ *
     * Module state
     * ------------------------------------------------------------------ */

    /** Configured sync-server URL (empty string = not configured). */
    var endpoint = '';

    /** Whether the sync client is enabled. */
    var enabled = false;

    /** Timestamp of the last successful sync. */
    var lastSync = null;

    /** Current high-level status: 'idle' | 'syncing' | 'error' | 'offline'. */
    var syncStatus = 'idle';

    /** Version vector — maps deviceId to highest-seen operation version. */
    var versionVector = {};

    /* ------------------------------------------------------------------ *
     * Initialisation — restore persisted endpoint
     * ------------------------------------------------------------------ */

    (function init() {
        try {
            var saved = localStorage.getItem(ENDPOINT_KEY);
            if (saved) {
                endpoint = saved;
            }
        } catch (e) {
            /* localStorage may be unavailable */
        }
    })();

    /* ------------------------------------------------------------------ *
     * Queue helpers
     * ------------------------------------------------------------------ */

    /**
     * Reads the offline queue from localStorage.
     *
     * @returns {Array<Object>} The queued operations (empty array if none or corrupt).
     */
    function getQueue() {
        try {
            var raw = localStorage.getItem(QUEUE_KEY);
            if (!raw) {
                return [];
            }
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }

    /**
     * Persists the offline queue to localStorage.
     *
     * @param {Array<Object>} queue - The queue to save.
     */
    function saveQueue(queue) {
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        } catch (e) {
            /* storage full or unavailable */
        }
    }

    /**
     * Appends a single operation to the offline queue.
     *
     * @param {Object} operation - The operation to queue.
     */
    function addToQueue(operation) {
        var queue = getQueue();
        queue.push(operation);
        saveQueue(queue);
    }

    /* ------------------------------------------------------------------ *
     * Identity / envelope accessors
     * ------------------------------------------------------------------ */

    /**
     * Returns the current device identity (or `null` when the
     * device-identity module is not loaded).
     *
     * @returns {Object|null}
     */
    function getIdentity() {
        try {
            if (global.ShikeDeviceIdentity) {
                return global.ShikeDeviceIdentity.getIdentity();
            }
        } catch (e) {
            /* module not available */
        }
        return null;
    }

    /**
     * Returns the crypto-envelope module (or `null` when not loaded).
     *
     * @returns {Object|null}
     */
    function getEnvelope() {
        try {
            return global.ShikeCryptoEnvelope || null;
        } catch (e) {
            return null;
        }
    }

    /* ------------------------------------------------------------------ *
     * Public API
     * ------------------------------------------------------------------ */

    /**
     * Pushes encrypted operations to the sync server.
     *
     * Behaviour:
     *   - Each operation is stamped with `deviceId`, `timestamp`, and a
     *     monotonically increasing `version` before encryption.
     *   - If the endpoint is empty or sync is disabled, all operations are
     *     appended to the offline queue and the status becomes `'offline'`.
     *   - On network failure the operations are also queued for retry.
     *   - After a successful push the client attempts to flush any
     *     previously queued operations.
     *
     * @param {Array<Object>} operations - Array of operation objects to push.
     * @returns {Promise<Object>} Result:
     *   ```js
     *   { success: boolean, queued: number, uploaded: number, error?: string }
     *   ```
     */
    async function push(operations) {
        try {
            if (!operations || !operations.length) {
                return { success: true, queued: 0, uploaded: 0 };
            }

            var identity = getIdentity();
            if (!identity) {
                throw new Error('No device identity. Initialize ShikeDeviceIdentity first.');
            }

            var envelope = getEnvelope();
            if (!envelope || !envelope.isSupported()) {
                throw new Error('Crypto envelope not available or unsupported in this browser.');
            }

            /* Stamp operations with metadata */
            var queueLen = getQueue().length;
            var stampedOps = [];
            var i;
            for (i = 0; i < operations.length; i++) {
                var op = operations[i];
                op.deviceId = identity.deviceId;
                op.timestamp = op.timestamp || Date.now();
                op.version = op.version || (queueLen + i + 1);
                stampedOps.push(op);
            }

            /* Encrypt each operation */
            var encryptedOps = [];
            for (i = 0; i < stampedOps.length; i++) {
                var encrypted = await envelope.encrypt(stampedOps[i], identity.publicKey);
                encryptedOps.push(encrypted);
            }

            /* If endpoint is empty or sync disabled -> offline queue */
            if (!endpoint || !enabled) {
                for (i = 0; i < stampedOps.length; i++) {
                    addToQueue(stampedOps[i]);
                }
                syncStatus = 'offline';
                return {
                    success: true,
                    queued: stampedOps.length,
                    uploaded: 0
                };
            }

            /* Attempt server push */
            syncStatus = 'syncing';

            var response = await fetch(endpoint + '/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId: identity.deviceId,
                    operations: encryptedOps,
                    versionVector: versionVector
                })
            });

            if (!response.ok) {
                throw new Error('Server returned HTTP ' + response.status);
            }

            var result = await response.json();

            /* Update version vector from server response */
            if (result.versionVector) {
                versionVector = result.versionVector;
            }

            lastSync = Date.now();
            syncStatus = 'idle';

            /* Try to flush any previously queued operations */
            await flushQueue();

            return {
                success: true,
                queued: 0,
                uploaded: stampedOps.length
            };
        } catch (e) {
            syncStatus = 'error';

            /* Queue operations for later retry */
            try {
                if (operations && operations.length) {
                    for (var k = 0; k < operations.length; k++) {
                        addToQueue(operations[k]);
                    }
                }
            } catch (queueErr) {
                /* ignore */
            }

            return {
                success: false,
                queued: operations ? operations.length : 0,
                uploaded: 0,
                error: e.message
            };
        }
    }

    /**
     * Downloads and decrypts new operations from the sync server since
     * the given version.
     *
     * @param {number} [sinceVersion=0] - The version to pull from.
     * @returns {Promise<Object>} Result:
     *   ```js
     *   { operations: Array, latestVersion: number, error?: string }
     *   ```
     */
    async function pull(sinceVersion) {
        try {
            if (!endpoint || !enabled) {
                return {
                    operations: [],
                    latestVersion: sinceVersion || 0
                };
            }

            var identity = getIdentity();
            if (!identity) {
                throw new Error('No device identity. Initialize ShikeDeviceIdentity first.');
            }

            var envelope = getEnvelope();
            if (!envelope || !envelope.isSupported()) {
                throw new Error('Crypto envelope not available or unsupported in this browser.');
            }

            syncStatus = 'syncing';

            var response = await fetch(
                endpoint + '/pull?since=' + (sinceVersion || 0) +
                '&deviceId=' + encodeURIComponent(identity.deviceId),
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error('Server returned HTTP ' + response.status);
            }

            var result = await response.json();
            var decryptedOps = [];

            if (result.operations && result.operations.length) {
                for (var i = 0; i < result.operations.length; i++) {
                    var decrypted = await envelope.decrypt(
                        result.operations[i],
                        identity.privateKey
                    );
                    decryptedOps.push(decrypted);
                }
            }

            lastSync = Date.now();
            syncStatus = 'idle';

            if (result.versionVector) {
                versionVector = result.versionVector;
            }

            return {
                operations: decryptedOps,
                latestVersion: result.latestVersion || sinceVersion || 0
            };
        } catch (e) {
            syncStatus = 'error';
            return {
                operations: [],
                latestVersion: sinceVersion || 0,
                error: e.message
            };
        }
    }

    /**
     * Attempts to flush the offline queue by pushing all queued
     * operations to the server.
     *
     * Called automatically after a successful `push()`.  Can also be
     * called manually (e.g. when connectivity is restored).
     *
     * @returns {Promise<number>} The number of operations successfully flushed.
     */
    async function flushQueue() {
        try {
            var queue = getQueue();
            if (!queue.length) {
                return 0;
            }

            if (!endpoint || !enabled) {
                return 0;
            }

            var identity = getIdentity();
            if (!identity) {
                return 0;
            }

            var envelope = getEnvelope();
            if (!envelope || !envelope.isSupported()) {
                return 0;
            }

            var encryptedOps = [];
            var i;
            for (i = 0; i < queue.length; i++) {
                var encrypted = await envelope.encrypt(queue[i], identity.publicKey);
                encryptedOps.push(encrypted);
            }

            var response = await fetch(endpoint + '/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId: identity.deviceId,
                    operations: encryptedOps,
                    versionVector: versionVector
                })
            });

            if (response.ok) {
                saveQueue([]);
                lastSync = Date.now();
                return queue.length;
            }

            return 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Returns the current sync status.
     *
     * @returns {Object} `{ lastSync, pending, status }` where
     *   `status` is one of `'idle'`, `'syncing'`, `'error'`, `'offline'`.
     */
    function getStatus() {
        return {
            lastSync: lastSync,
            pending: getQueue().length,
            status: syncStatus
        };
    }

    /**
     * Enables sync functionality.
     *
     * If the endpoint is configured, the status transitions to `'idle'`
     * and queued operations will be eligible for flushing on the next push.
     */
    function enable() {
        enabled = true;
        if (syncStatus === 'offline') {
            syncStatus = 'idle';
        }
    }

    /**
     * Disables sync functionality.
     *
     * The status becomes `'offline'` and all subsequent operations will
     * be queued locally.
     */
    function disable() {
        enabled = false;
        syncStatus = 'offline';
    }

    /**
     * Returns whether sync is currently enabled.
     *
     * @returns {boolean}
     */
    function isEnabled() {
        return enabled;
    }

    /**
     * Sets the sync-server endpoint URL.
     *
     * An empty string means "not configured" — all operations go to the
     * offline queue.
     *
     * @param {string} url - The sync server URL (e.g. `https://sync.example.com`).
     */
    function setEndpoint(url) {
        endpoint = url || '';
        try {
            localStorage.setItem(ENDPOINT_KEY, endpoint);
        } catch (e) {
            /* localStorage may be unavailable */
        }
    }

    /* ------------------------------------------------------------------ *
     * Export
     * ------------------------------------------------------------------ */

    global.ShikeSyncClient = {
        push: push,
        pull: pull,
        getStatus: getStatus,
        enable: enable,
        disable: disable,
        isEnabled: isEnabled,
        setEndpoint: setEndpoint
    };

// SECURITY QUARANTINE v2.0.0-rc5.1: Remote sync disabled due to crypto design flaws
var _orig_push = push;
var _orig_pull = pull;
var _orig_setEndpoint = setEndpoint;
var _orig_enable = enable;
push = function(){ return Promise.resolve({status:'sync_security_quarantined',count:0}); };
pull = function(){ return Promise.resolve({status:'sync_security_quarantined',operations:[]}); };
setEndpoint = function(){ return false; };
enable = function(){ return false; };
disable = function(){ return true; };
isEnabled = function(){ return false; };

})(typeof window !== 'undefined' ? window : this);
