/**
 * Shike Snapshot Service
 * ======================
 *
 * Automatic snapshot service for data safety in the "时刻 Shike"
 * web project.
 *
 * Snapshot metadata (id, label, timestamps, checksum, etc.) is kept in
 * localStorage under the key `'shike_snapshots'`. The actual snapshot
 * data is stored in IndexedDB under the object store `'shike_snapshots'`
 * to avoid exceeding localStorage size limits.
 *
 * Each snapshot contains:
 *   - id:          unique identifier
 *   - label:       human-readable label
 *   - createdAt:   ISO timestamp
 *   - recordCount: number of records in the snapshot
 *   - checksum:    SHA-256 hex digest of the serialized data
 *   - compressed:  boolean (always false for now - placeholder)
 *   - data:        the full records array
 *
 * @module ShikeSnapshotService
 * @version 2.0.0-rc3
 */

(function (global) {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Constants
     * ------------------------------------------------------------------ */

    var DB_NAME = 'shike_db';
    var DB_VERSION = 1;
    var SNAPSHOT_STORE = 'shike_snapshots';
    var META_KEY = 'shike_snapshots';
    var MAX_SNAPSHOTS = 20;

    /* ------------------------------------------------------------------ *
     * BusinessError - domain-level error wrapper
     * ------------------------------------------------------------------ */

    /**
     * @class
     * @extends Error
     * @param {string} code    - machine-readable error code
     * @param {string} message - human-readable message
     * @param {*}      [cause]  - underlying cause
     */
    function BusinessError(code, message, cause) {
        var err = Error.call(this, message);
        this.name = 'BusinessError';
        this.code = code;
        this.message = message;
        if (cause !== undefined) {
            this.cause = cause;
        }
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BusinessError);
        }
    }
    BusinessError.prototype = Object.create(Error.prototype);
    BusinessError.prototype.constructor = BusinessError;

    /* ------------------------------------------------------------------ *
     * Internal state
     * ------------------------------------------------------------------ */

    /** @type {IDBDatabase|null} */
    var _db = null;

    /* ------------------------------------------------------------------ *
     * Utilities
     * ------------------------------------------------------------------ */

    /**
     * Generate a unique identifier.
     * @private
     * @returns {string}
     */
    function _generateId() {
        if (global.crypto && typeof global.crypto.randomUUID === 'function') {
            return global.crypto.randomUUID();
        }
        return 'snap_' + Date.now().toString(36) + '_' +
            Math.random().toString(36).slice(2, 10);
    }

    /**
     * Compute a SHA-256 checksum (hex) for the given string.
     *
     * Uses the Web Crypto SubtleCrypto API. Falls back to a simple
     * hash when `crypto.subtle` is unavailable (e.g. non-secure
     * context).
     *
     * @private
     * @param {string} data - the string to hash
     * @returns {Promise<string>} hex digest
     */
    function _computeChecksum(data) {
        if (global.crypto && global.crypto.subtle &&
            typeof global.crypto.subtle.digest === 'function') {

            var encoder;
            try {
                encoder = new TextEncoder();
            } catch (e) {
                encoder = null;
            }

            if (encoder) {
                var buffer = encoder.encode(data);
                return global.crypto.subtle.digest('SHA-256', buffer)
                    .then(function (hashBuffer) {
                        var hexCodes = [];
                        var view = new Uint8Array(hashBuffer);
                        for (var i = 0; i < view.length; i++) {
                            var byte = view[i].toString(16);
                            if (byte.length < 2) {
                                byte = '0' + byte;
                            }
                            hexCodes.push(byte);
                        }
                        return hexCodes.join('');
                    })
                    .catch(function (err) {
                        throw new BusinessError(
                            'SNAPSHOT_CHECKSUM_FAILED',
                            'SHA-256 digest computation failed.',
                            err
                        );
                    });
            }
        }

        // Fallback - non-cryptographic but deterministic
        return Promise.resolve(_fallbackHash(data));
    }

    /**
     * Simple non-cryptographic string hash used as a last resort.
     * @private
     * @param {string} str
     * @returns {string}
     */
    function _fallbackHash(str) {
        var hash1 = 0x811c9dc5;
        var hash2 = 0x1000193;
        for (var i = 0; i < str.length; i++) {
            var ch = str.charCodeAt(i);
            hash1 = ((hash1 ^ ch) * 0x01000193) >>> 0;
            hash2 = ((hash2 + ch) * 0x100000001b3) >>> 0;
        }
        var h1 = hash1.toString(16).padStart(8, '0');
        var h2 = hash2.toString(16).padStart(8, '0');
        // Pad to 64 hex chars to mimic SHA-256 length
        return (h1 + h2 + '0'.repeat(48)).slice(0, 64);
    }

    /* ------------------------------------------------------------------ *
     * localStorage metadata helpers
     * ------------------------------------------------------------------ */

    /**
     * Read the metadata array from localStorage.
     * @private
     * @returns {Array<Object>}
     */
    function _readMeta() {
        try {
            var raw = global.localStorage.getItem(META_KEY);
            if (!raw) return [];
            var parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            throw new BusinessError(
                'SNAPSHOT_META_READ_FAILED',
                'Failed to read snapshot metadata from localStorage.',
                err
            );
        }
    }

    /**
     * Write the metadata array to localStorage.
     * @private
     * @param {Array<Object>} meta
     */
    function _writeMeta(meta) {
        try {
            global.localStorage.setItem(META_KEY, JSON.stringify(meta));
        } catch (err) {
            throw new BusinessError(
                'SNAPSHOT_META_WRITE_FAILED',
                'Failed to write snapshot metadata to localStorage.',
                err
            );
        }
    }

    /**
     * Add or update a metadata entry. Enforces MAX_SNAPSHOTS.
     * @private
     * @param {Object} entry - metadata entry (without `data`)
     */
    function _upsertMeta(entry) {
        var meta = _readMeta();

        // Replace if exists, otherwise push
        var idx = -1;
        for (var i = 0; i < meta.length; i++) {
            if (meta[i].id === entry.id) {
                idx = i;
                break;
            }
        }
        if (idx >= 0) {
            meta[idx] = entry;
        } else {
            meta.push(entry);
        }

        // Enforce max snapshots - oldest first (by createdAt)
        if (meta.length > MAX_SNAPSHOTS) {
            meta.sort(function (a, b) {
                return new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime();
            });
            var toRemove = meta.splice(0, meta.length - MAX_SNAPSHOTS);
            // Remove their data from IndexedDB as well
            toRemove.forEach(function (old) {
                _deleteSnapshotData(old.id);
            });
        }

        _writeMeta(meta);
    }

    /**
     * Remove a metadata entry by id.
     * @private
     * @param {string} id
     * @returns {Object|null} the removed entry or null
     */
    function _removeMeta(id) {
        var meta = _readMeta();
        var removed = null;
        var filtered = meta.filter(function (entry) {
            if (entry.id === id) {
                removed = entry;
                return false;
            }
            return true;
        });
        if (removed) {
            _writeMeta(filtered);
        }
        return removed;
    }

    /* ------------------------------------------------------------------ *
     * IndexedDB helpers
     * ------------------------------------------------------------------ */

    /**
     * Open (or create) the IndexedDB database with the snapshot store.
     * @private
     * @returns {Promise<IDBDatabase>}
     */
    function _openDB() {
        if (_db) {
            return Promise.resolve(_db);
        }

        return new Promise(function (resolve, reject) {
            var request;
            try {
                request = global.indexedDB.open(DB_NAME, DB_VERSION);
            } catch (err) {
                reject(new BusinessError(
                    'SNAPSHOT_DB_OPEN_FAILED',
                    'Failed to open IndexedDB database.',
                    err
                ));
                return;
            }

            request.onerror = function () {
                reject(new BusinessError(
                    'SNAPSHOT_DB_OPEN_FAILED',
                    'IndexedDB open request failed.',
                    request.error
                ));
            };

            request.onsuccess = function () {
                _db = request.result;
                _db.onversionchange = function () {
                    if (_db) {
                        _db.close();
                        _db = null;
                    }
                };
                resolve(_db);
            };

            request.onupgradeneeded = function (event) {
                var db = event.target.result;
                if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
                    db.createObjectStore(SNAPSHOT_STORE, { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Store snapshot data in IndexedDB.
     * @private
     * @param {string} id
     * @param {Object} snapshot - full snapshot object including `data`
     * @returns {Promise<void>}
     */
    function _storeSnapshotData(id, snapshot) {
        return _openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(SNAPSHOT_STORE, 'readwrite');
                var store = tx.objectStore(SNAPSHOT_STORE);
                store.put(snapshot);

                tx.oncomplete = function () {
                    resolve();
                };
                tx.onerror = function () {
                    reject(new BusinessError(
                        'SNAPSHOT_STORE_FAILED',
                        'Failed to store snapshot data in IndexedDB.',
                        tx.error
                    ));
                };
            });
        });
    }

    /**
     * Retrieve a full snapshot (including data) from IndexedDB.
     * @private
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    function _getSnapshotData(id) {
        return _openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(SNAPSHOT_STORE, 'readonly');
                var store = tx.objectStore(SNAPSHOT_STORE);
                var request = store.get(id);

                request.onsuccess = function () {
                    resolve(request.result || null);
                };
                request.onerror = function () {
                    reject(new BusinessError(
                        'SNAPSHOT_GET_FAILED',
                        'Failed to retrieve snapshot from IndexedDB.',
                        request.error
                    ));
                };
            });
        });
    }

    /**
     * Delete a snapshot's data from IndexedDB.
     * @private
     * @param {string} id
     * @returns {Promise<void>}
     */
    function _deleteSnapshotData(id) {
        return _openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(SNAPSHOT_STORE, 'readwrite');
                var store = tx.objectStore(SNAPSHOT_STORE);
                store.delete(id);

                tx.oncomplete = function () {
                    resolve();
                };
                tx.onerror = function () {
                    reject(new BusinessError(
                        'SNAPSHOT_DELETE_DATA_FAILED',
                        'Failed to delete snapshot data from IndexedDB.',
                        tx.error
                    ));
                };
            });
        });
    }

    /* ------------------------------------------------------------------ *
     * Public API
     * ------------------------------------------------------------------ */

    var ShikeSnapshotService = {};

    /**
     * Create a new snapshot.
     *
     * Serializes the records, computes a SHA-256 checksum, stores the
     * full data in IndexedDB, and writes metadata to localStorage.
     * When the number of snapshots exceeds the maximum (20) the oldest
     * are automatically deleted.
     *
     * @param {string} label    - human-readable label
     * @param {Array}  records  - array of records to snapshot
     * @returns {Promise<Object>} the created snapshot metadata
     * @throws {BusinessError} on invalid input or storage failure
     */
    ShikeSnapshotService.createSnapshot = function (label, records) {
        try {
            if (typeof label !== 'string' || !label.trim()) {
                throw new BusinessError(
                    'SNAPSHOT_INVALID_LABEL',
                    'createSnapshot requires a non-empty label string.'
                );
            }
            if (!Array.isArray(records)) {
                throw new BusinessError(
                    'SNAPSHOT_INVALID_RECORDS',
                    'createSnapshot requires a records array.'
                );
            }

            var id = _generateId();
            var createdAt = new Date().toISOString();
            var recordCount = records.length;

            // Serialize for checksum (deep copy via stringify)
            var serialized;
            try {
                serialized = JSON.stringify(records);
            } catch (err) {
                throw new BusinessError(
                    'SNAPSHOT_SERIALIZE_FAILED',
                    'Failed to serialize records for snapshot.',
                    err
                );
            }

            return _computeChecksum(serialized)
                .then(function (checksum) {
                    var snapshot = {
                        id: id,
                        label: label,
                        createdAt: createdAt,
                        recordCount: recordCount,
                        checksum: checksum,
                        compressed: false,
                        data: records
                    };

                    return _storeSnapshotData(id, snapshot).then(function () {
                        // Write metadata (without the bulky `data` field)
                        var meta = {
                            id: id,
                            label: label,
                            createdAt: createdAt,
                            recordCount: recordCount,
                            checksum: checksum,
                            compressed: false
                        };
                        _upsertMeta(meta);
                        return meta;
                    });
                });
        } catch (err) {
            return Promise.reject(err instanceof BusinessError
                ? err
                : new BusinessError(
                    'SNAPSHOT_CREATE_FAILED',
                    'Unexpected error creating snapshot.',
                    err
                ));
        }
    };

    /**
     * Get all snapshot metadata entries.
     *
     * Returns metadata only (no `data` field). Use `getSnapshot(id)`
     * to retrieve the full snapshot including data.
     *
     * @returns {Promise<Array<Object>>}
     */
    ShikeSnapshotService.getAll = function () {
        try {
            var meta = _readMeta();
            // Sort newest first
            meta.sort(function (a, b) {
                return new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime();
            });
            return Promise.resolve(meta);
        } catch (err) {
            return Promise.reject(err instanceof BusinessError
                ? err
                : new BusinessError(
                    'SNAPSHOT_GET_ALL_FAILED',
                    'Unexpected error retrieving snapshots.',
                    err
                ));
        }
    };

    /**
     * Get a full snapshot by id (including data).
     *
     * @param {string} id
     * @returns {Promise<Object|null>} the full snapshot or null
     * @throws {BusinessError} on retrieval failure
     */
    ShikeSnapshotService.getSnapshot = function (id) {
        try {
            if (!id) {
                throw new BusinessError(
                    'SNAPSHOT_MISSING_ID',
                    'getSnapshot requires an id.'
                );
            }
            return _getSnapshotData(id);
        } catch (err) {
            return Promise.reject(err instanceof BusinessError
                ? err
                : new BusinessError(
                    'SNAPSHOT_GET_FAILED',
                    'Unexpected error retrieving snapshot.',
                    err
                ));
        }
    };

    /**
     * Delete a snapshot by id.
     *
     * Removes both the metadata entry and the IndexedDB data.
     *
     * @param {string} id
     * @returns {Promise<void>}
     * @throws {BusinessError} when the snapshot is not found
     */
    ShikeSnapshotService.deleteSnapshot = function (id) {
        try {
            if (!id) {
                throw new BusinessError(
                    'SNAPSHOT_MISSING_ID',
                    'deleteSnapshot requires an id.'
                );
            }

            var removed = _removeMeta(id);
            if (!removed) {
                return Promise.reject(new BusinessError(
                    'SNAPSHOT_NOT_FOUND',
                    'No snapshot found for id: ' + id
                ));
            }

            return _deleteSnapshotData(id);
        } catch (err) {
            return Promise.reject(err instanceof BusinessError
                ? err
                : new BusinessError(
                    'SNAPSHOT_DELETE_FAILED',
                    'Unexpected error deleting snapshot.',
                    err
                ));
        }
    };

    /**
     * Restore a snapshot by returning its data to the caller.
     *
     * This does NOT overwrite the current data - the caller is
     * responsible for applying the returned records.
     *
     * @param {string} id
     * @returns {Promise<Object>} the full snapshot including `data`
     * @throws {BusinessError} when the snapshot is not found
     */
    ShikeSnapshotService.restoreSnapshot = function (id) {
        try {
            if (!id) {
                throw new BusinessError(
                    'SNAPSHOT_MISSING_ID',
                    'restoreSnapshot requires an id.'
                );
            }

            return _getSnapshotData(id).then(function (snapshot) {
                if (!snapshot) {
                    throw new BusinessError(
                        'SNAPSHOT_NOT_FOUND',
                        'No snapshot found for id: ' + id
                    );
                }
                return snapshot;
            });
        } catch (err) {
            return Promise.reject(err instanceof BusinessError
                ? err
                : new BusinessError(
                    'SNAPSHOT_RESTORE_FAILED',
                    'Unexpected error restoring snapshot.',
                    err
                ));
        }
    };

    /**
     * Verify the checksum of a stored snapshot.
     *
     * Recomputes the SHA-256 of the stored data and compares it
     * against the stored checksum. Returns true if they match.
     *
     * @param {string} id
     * @returns {Promise<boolean>}
     * @throws {BusinessError} when the snapshot is not found
     */
    ShikeSnapshotService.verifyChecksum = function (id) {
        try {
            if (!id) {
                throw new BusinessError(
                    'SNAPSHOT_MISSING_ID',
                    'verifyChecksum requires an id.'
                );
            }

            return _getSnapshotData(id).then(function (snapshot) {
                if (!snapshot) {
                    throw new BusinessError(
                        'SNAPSHOT_NOT_FOUND',
                        'No snapshot found for id: ' + id
                    );
                }

                var serialized;
                try {
                    serialized = JSON.stringify(snapshot.data);
                } catch (err) {
                    throw new BusinessError(
                        'SNAPSHOT_SERIALIZE_FAILED',
                        'Failed to serialize snapshot data for verification.',
                        err
                    );
                }

                return _computeChecksum(serialized).then(function (computed) {
                    return computed === snapshot.checksum;
                });
            });
        } catch (err) {
            return Promise.reject(err instanceof BusinessError
                ? err
                : new BusinessError(
                    'SNAPSHOT_VERIFY_FAILED',
                    'Unexpected error verifying checksum.',
                    err
                ));
        }
    };

    /**
     * Get the maximum number of snapshots allowed.
     *
     * @returns {number}
     */
    ShikeSnapshotService.getMaxSnapshots = function () {
        return MAX_SNAPSHOTS;
    };

    /* ------------------------------------------------------------------ *
     * Export
     * ------------------------------------------------------------------ */

    ShikeSnapshotService.BusinessError = BusinessError;

    global.ShikeSnapshotService = ShikeSnapshotService;

})(typeof window !== 'undefined' ? window : this);
