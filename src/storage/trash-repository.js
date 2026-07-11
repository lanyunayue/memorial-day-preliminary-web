/**
 * Shike Trash Repository
 * =====================
 *
 * Tombstone-based trash system for the "时刻 Shike" web project.
 * When records are "deleted", they go to trash instead of being permanently removed.
 *
 * Uses IndexedDB store named 'shike_trash'.
 *
 * Tombstone fields:
 *   - id:              unique identifier for the trash entry
 *   - originalRecord:  full copy of the original record
 *   - deletedAt:       ISO timestamp of deletion
 *   - deletedReason:   human-readable reason for deletion
 *   - deletedFrom:     page or source where the deletion originated
 *
 * @module ShikeTrashRepository
 * @version 2.0.0-rc3
 */

(function (global) {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Constants
     * ------------------------------------------------------------------ */

    var DB_NAME = 'shike_db';
    var DB_VERSION = 1;
    var TRASH_STORE = 'shike_trash';
    var DEFAULT_MAIN_STORE = 'shike_records';
    var DEFAULT_MAX_AGE_DAYS = 30;

    /* ------------------------------------------------------------------ *
     * BusinessError - domain-level error wrapper
     * ------------------------------------------------------------------ */

    /**
     * BusinessError wraps any operational failure with a stable `code`
     * so callers can branch on known error types.
     *
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

    /** @type {string} */
    var _mainStore = DEFAULT_MAIN_STORE;

    /* ------------------------------------------------------------------ *
     * Utilities
     * ------------------------------------------------------------------ */

    /**
     * Generate a unique identifier.
     * Falls back to a timestamp+random composition when
     * `crypto.randomUUID` is unavailable.
     *
     * @private
     * @returns {string}
     */
    function _generateId() {
        if (global.crypto && typeof global.crypto.randomUUID === 'function') {
            return global.crypto.randomUUID();
        }
        return 'trash_' + Date.now().toString(36) + '_' +
            Math.random().toString(36).slice(2, 10);
    }

    /**
     * Open (or create) the IndexedDB database.
     *
     * The trash object store uses `'id'` as its key path. We also
     * create an index on `deletedAt` for efficient expiry queries.
     *
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
                    'TRASH_DB_OPEN_FAILED',
                    'Failed to open IndexedDB database.',
                    err
                ));
                return;
            }

            request.onerror = function () {
                reject(new BusinessError(
                    'TRASH_DB_OPEN_FAILED',
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

                // Trash store - created if it does not yet exist
                if (!db.objectStoreNames.contains(TRASH_STORE)) {
                    var store = db.createObjectStore(TRASH_STORE, {
                        keyPath: 'id'
                    });
                    store.createIndex('deletedAt', 'deletedAt', {
                        unique: false
                    });
                }

                // Main store - created so softDelete can remove from it
                if (!db.objectStoreNames.contains(_mainStore)) {
                    db.createObjectStore(_mainStore, { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Execute a transactional operation on the trash store.
     *
     * @private
     * @param {'readonly'|'readwrite'} mode
     * @param {function(IDBObjectStore): IDBRequest} fn
     * @returns {Promise<*>}
     */
    function _txTrash(mode, fn) {
        return _openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(TRASH_STORE, mode);
                var store = tx.objectStore(TRASH_STORE);
                var request = fn(store);

                request.onsuccess = function () {
                    resolve(request.result);
                };
                request.onerror = function () {
                    reject(new BusinessError(
                        'TRASH_TX_FAILED',
                        'Trash store transaction failed.',
                        request.error
                    ));
                };
            });
        });
    }

    /**
     * Remove a record from the main store by id.
     * Resolves silently if the record is not found.
     *
     * @private
     * @param {string} id
     * @returns {Promise<void>}
     */
    function _removeFromMainStore(id) {
        return _openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(_mainStore, 'readwrite');
                var store = tx.objectStore(_mainStore);
                var request = store.delete(id);

                request.onsuccess = function () {
                    resolve();
                };
                request.onerror = function () {
                    // If the main store or record does not exist we still
                    // consider the removal successful - the record may have
                    // already been removed by the caller.
                    resolve();
                };
            });
        });
    }

    /**
     * Compute the cutoff timestamp for `maxAgeDays`.
     *
     * @private
     * @param {number} maxAgeDays
     * @returns {number} epoch milliseconds
     */
    function _cutoffTimestamp(maxAgeDays) {
        return Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
    }

    /* ------------------------------------------------------------------ *
     * Public API
     * ------------------------------------------------------------------ */

    var ShikeTrashRepository = {};

    /**
     * Configure the main store name used by `softDelete`.
     * Call this before any other operation if you need a non-default
     * main store. Has no effect after the DB has been opened.
     *
     * @param {string} storeName
     */
    ShikeTrashRepository.setMainStore = function (storeName) {
        if (_db) {
            throw new BusinessError(
                'TRASH_ALREADY_INITIALISED',
                'Cannot change main store after the database is open.'
            );
        }
        _mainStore = storeName || DEFAULT_MAIN_STORE;
    };

    /**
     * Soft-delete a record.
     *
     * Creates a tombstone entry in the trash store containing a full
     * copy of the original record, then removes the record from the
     * main store.
     *
     * @param {Object} record - the record to soft-delete (must have an `id`)
     * @param {string} [reason=''] - reason for deletion
     * @param {string} [from='unknown'] - page or source identifier
     * @returns {Promise<Object>} the created tombstone entry
     * @throws {BusinessError} when `record` is missing or has no `id`
     */
    ShikeTrashRepository.softDelete = function (record, reason, from) {
        try {
            if (!record || typeof record !== 'object') {
                throw new BusinessError(
                    'TRASH_INVALID_RECORD',
                    'softDelete requires a record object.'
                );
            }
            if (!record.id) {
                throw new BusinessError(
                    'TRASH_MISSING_ID',
                    'Record must have an `id` property.'
                );
            }

            var tombstone = {
                id: _generateId(),
                originalRecord: JSON.parse(JSON.stringify(record)),
                deletedAt: new Date().toISOString(),
                deletedReason: reason || '',
                deletedFrom: from || 'unknown'
            };

            return _txTrash('readwrite', function (store) {
                return store.add(tombstone);
            }).then(function () {
                // Remove from main store - fire and continue even on failure
                return _removeFromMainStore(record.id).catch(function () {
                    /* main-store removal is best-effort */
                });
            }).then(function () {
                return tombstone;
            });
        } catch (err) {
            return Promise.reject(err instanceof BusinessError
                ? err
                : new BusinessError(
                    'TRASH_SOFT_DELETE_FAILED',
                    'Unexpected error during soft delete.',
                    err
                ));
        }
    };

    /**
     * Retrieve all tombstones currently in the trash.
     *
     * @returns {Promise<Array<Object>>}
     */
    ShikeTrashRepository.getAll = function () {
        try {
            return _txTrash('readonly', function (store) {
                return store.getAll();
            }).then(function (results) {
                return results || [];
            });
        } catch (err) {
            return Promise.reject(new BusinessError(
                'TRASH_GET_ALL_FAILED',
                'Failed to retrieve trash entries.',
                err
            ));
        }
    };

    /**
     * Restore a record from trash.
     *
     * Removes the tombstone from the trash store and returns the
     * original record to the caller. The caller is responsible for
     * inserting the record back into the main store.
     *
     * @param {string} id - tombstone id
     * @returns {Promise<Object>} the restored original record
     * @throws {BusinessError} when the tombstone is not found
     */
    ShikeTrashRepository.restore = function (id) {
        try {
            if (!id) {
                throw new BusinessError(
                    'TRASH_MISSING_ID',
                    'restore requires a tombstone id.'
                );
            }

            return _txTrash('readwrite', function (store) {
                return store.get(id);
            }).then(function (tombstone) {
                if (!tombstone) {
                    throw new BusinessError(
                        'TRASH_NOT_FOUND',
                        'No trash entry found for id: ' + id
                    );
                }
                // Remove from trash now that it is being restored
                return _txTrash('readwrite', function (store) {
                    return store.delete(id);
                }).then(function () {
                    return tombstone.originalRecord;
                });
            });
        } catch (err) {
            return Promise.reject(err instanceof BusinessError
                ? err
                : new BusinessError(
                    'TRASH_RESTORE_FAILED',
                    'Unexpected error during restore.',
                    err
                ));
        }
    };

    /**
     * Permanently delete a tombstone from the trash store.
     * This operation is irreversible.
     *
     * @param {string} id - tombstone id
     * @returns {Promise<void>}
     * @throws {BusinessError} when the tombstone is not found
     */
    ShikeTrashRepository.permanentlyDelete = function (id) {
        try {
            if (!id) {
                throw new BusinessError(
                    'TRASH_MISSING_ID',
                    'permanentlyDelete requires a tombstone id.'
                );
            }

            return _txTrash('readonly', function (store) {
                return store.get(id);
            }).then(function (tombstone) {
                if (!tombstone) {
                    throw new BusinessError(
                        'TRASH_NOT_FOUND',
                        'No trash entry found for id: ' + id
                    );
                }
                return _txTrash('readwrite', function (store) {
                    return store.delete(id);
                });
            });
        } catch (err) {
            return Promise.reject(err instanceof BusinessError
                ? err
                : new BusinessError(
                    'TRASH_PERMANENT_DELETE_FAILED',
                    'Unexpected error during permanent delete.',
                    err
                ));
        }
    };

    /**
     * Clear the entire trash store.
     *
     * @returns {Promise<void>}
     */
    ShikeTrashRepository.clearAll = function () {
        try {
            return _txTrash('readwrite', function (store) {
                return store.clear();
            });
        } catch (err) {
            return Promise.reject(new BusinessError(
                'TRASH_CLEAR_ALL_FAILED',
                'Failed to clear trash store.',
                err
            ));
        }
    };

    /**
     * Get all tombstones that are older than `maxAgeDays`.
     *
     * @param {number} [maxAgeDays=30] - maximum age in days
     * @returns {Promise<Array<Object>>}
     */
    ShikeTrashRepository.getExpired = function (maxAgeDays) {
        var maxAge = (typeof maxAgeDays === 'number' && maxAgeDays > 0)
            ? maxAgeDays
            : DEFAULT_MAX_AGE_DAYS;
        var cutoff = _cutoffTimestamp(maxAge);

        try {
            return _openDB().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var tx = db.transaction(TRASH_STORE, 'readonly');
                    var store = tx.objectStore(TRASH_STORE);
                    var index = store.index('deletedAt');
                    var range = IDBKeyRange.upperBound(new Date(cutoff).toISOString());
                    var results = [];
                    var request = index.openCursor(range);

                    request.onsuccess = function (event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            results.push(cursor.value);
                            cursor.continue();
                        } else {
                            resolve(results);
                        }
                    };
                    request.onerror = function () {
                        reject(new BusinessError(
                            'TRASH_GET_EXPIRED_FAILED',
                            'Failed to query expired trash entries.',
                            request.error
                        ));
                    };
                });
            });
        } catch (err) {
            return Promise.reject(new BusinessError(
                'TRASH_GET_EXPIRED_FAILED',
                'Unexpected error querying expired entries.',
                err
            ));
        }
    };

    /**
     * Delete all tombstones older than `maxAgeDays`.
     *
     * @param {number} [maxAgeDays=30] - maximum age in days
     * @returns {Promise<number>} count of removed tombstones
     */
    ShikeTrashRepository.cleanupExpired = function (maxAgeDays) {
        return ShikeTrashRepository.getExpired(maxAgeDays)
            .then(function (expired) {
                if (!expired.length) {
                    return 0;
                }

                return _openDB().then(function (db) {
                    return new Promise(function (resolve, reject) {
                        var tx = db.transaction(TRASH_STORE, 'readwrite');
                        var store = tx.objectStore(TRASH_STORE);

                        expired.forEach(function (tombstone) {
                            store.delete(tombstone.id);
                        });

                        tx.oncomplete = function () {
                            resolve(expired.length);
                        };
                        tx.onerror = function () {
                            reject(new BusinessError(
                                'TRASH_CLEANUP_FAILED',
                                'Failed to delete expired trash entries.',
                                tx.error
                            ));
                        };
                    });
                });
            });
    };

    /* ------------------------------------------------------------------ *
     * Export
     * ------------------------------------------------------------------ */

    // Expose BusinessError for consumers that need to check error codes
    ShikeTrashRepository.BusinessError = BusinessError;

    global.ShikeTrashRepository = ShikeTrashRepository;

})(typeof window !== 'undefined' ? window : this);
