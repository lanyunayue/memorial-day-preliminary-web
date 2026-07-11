/**
 * @fileoverview 时刻 Shike - Reminder Repository
 *
 * Persistence layer for reminders backed by IndexedDB. All public methods
 * return Promises and use a structured BusinessError pattern so that callers
 * can distinguish operational failures from logical errors.
 *
 * IndexedDB store name: 'shike_reminder_store'
 * Database name: 'shike_reminders_db'
 *
 * @version 2.0.0-rc4
 * @module ShikeReminderRepository
 */
(function (global) {
  'use strict';

  /**
   * IndexedDB database name.
   * @type {string}
   * @constant
   */
  var DB_NAME = 'shike_reminders_db';

  /**
   * IndexedDB store name.
   * @type {string}
   * @constant
   */
  var STORE_NAME = 'shike_reminder_store';

  /**
   * Database version. Bumped when the schema changes.
   * @type {number}
   * @constant
   */
  var DB_VERSION = 1;

  /**
   * Cached database connection so we only open it once.
   * @type {IDBDatabase|null}
   * @private
   */
  var dbConnection = null;

  /**
   * Creates a structured BusinessError object so callers can distinguish
   * operational failures (e.g. IndexedDB unavailable) from logical errors
   * (e.g. invalid arguments).
   *
   * @param {string} code - A short machine-readable error code.
   * @param {string} message - A human-readable description.
   * @param {*} [context] - Optional additional context.
   * @returns {Object} A BusinessError-shaped object.
   * @private
   */
  function makeBusinessError(code, message, context) {
    var err = {
      isBusinessError: true,
      code: code,
      message: message
    };
    if (context !== undefined) {
      err.context = context;
    }
    return err;
  }

  /**
   * Rejects a Promise with a BusinessError and logs it.
   * @param {Object} reject - The reject function of a Promise.
   * @param {string} code - Error code.
   * @param {string} message - Error message.
   * @param {*} [context] - Optional context.
   * @private
   */
  function rejectBusiness(reject, code, message, context) {
    var be = makeBusinessError(code, message, context);
    console.error('[ShikeReminderRepository] ' + code + ': ' + message);
    reject(be);
  }

  /**
   * Opens (and upgrades if necessary) the IndexedDB database. The
   * connection is cached for subsequent calls.
   * @returns {Promise<IDBDatabase>} Resolves with the database connection.
   * @private
   */
  function openDatabase() {
    return new Promise(function (resolve, reject) {
      try {
        if (typeof global.indexedDB === 'undefined') {
          rejectBusiness(reject, 'IDB_UNAVAILABLE',
            'IndexedDB is not available in this environment');
          return;
        }

        if (dbConnection) {
          resolve(dbConnection);
          return;
        }

        var request = global.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function (event) {
          try {
            var db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              var store = db.createObjectStore(STORE_NAME, {
                keyPath: 'id'
              });
              store.createIndex('recordId', 'recordId', { unique: false });
              store.createIndex('status', 'status', { unique: false });
              store.createIndex('dueTime', 'dueTime', { unique: false });
            }
          } catch (upgradeErr) {
            console.error('[ShikeReminderRepository] Upgrade failed:',
              upgradeErr);
          }
        };

        request.onsuccess = function (event) {
          dbConnection = event.target.result;
          // If the connection is closed unexpectedly, clear the cache.
          dbConnection.onclose = function () {
            dbConnection = null;
          };
          dbConnection.onerror = function (event) {
            console.error('[ShikeReminderRepository] DB error:',
              event.target.error);
          };
          resolve(dbConnection);
        };

        request.onerror = function () {
          rejectBusiness(reject, 'DB_OPEN_FAILED',
            'Failed to open the reminder database',
            request.error && request.error.message);
        };
      } catch (err) {
        rejectBusiness(reject, 'DB_OPEN_EXCEPTION',
          'Exception while opening database',
          err && err.message);
      }
    });
  }

  /**
   * Obtains a transaction and object store for the given mode.
   * @param {string} mode - 'readonly' or 'readwrite'.
   * @returns {Promise<IDBObjectStore>} Resolves with the object store.
   * @private
   */
  function getStore(mode) {
    return openDatabase().then(function (db) {
      var tx = db.transaction(STORE_NAME, mode);
      return tx.objectStore(STORE_NAME);
    });
  }

  /**
   * Wraps an IDBRequest in a Promise.
   * @param {IDBRequest} request - The request to await.
   * @returns {Promise<*>} Resolves with request.result.
   * @private
   */
  function awaitRequest(request) {
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function () {
        rejectBusiness(reject, 'REQUEST_FAILED',
          'An IndexedDB request failed',
          request.error && request.error.message);
      };
    });
  }

  /**
   * Wraps an IDBTransaction in a Promise that resolves on complete.
   * @param {IDBTransaction} tx - The transaction.
   * @returns {Promise<void>} Resolves when the transaction completes.
   * @private
   */
  function awaitTransaction(tx) {
    return new Promise(function (resolve, reject) {
      tx.oncomplete = function () {
        resolve();
      };
      tx.onerror = function () {
        rejectBusiness(reject, 'TX_FAILED',
          'An IndexedDB transaction failed',
          tx.error && tx.error.message);
      };
      tx.onabort = function () {
        rejectBusiness(reject, 'TX_ABORTED',
          'An IndexedDB transaction was aborted',
          tx.error && tx.error.message);
      };
    });
  }

  /**
   * Validates that a value is a non-empty string.
   * @param {*} value - The value to test.
   * @returns {boolean} True if the value is a non-empty string.
   * @private
   */
  function isNonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
  }

  /**
   * The reminder repository public API.
   * @namespace ShikeReminderRepository
   */
  var ShikeReminderRepository = {};

  /**
   * Persists (inserts or updates) a reminder in the store.
   * @param {Object} reminder - The reminder to save. Must contain an `id`.
   * @returns {Promise<Object>} Resolves with the saved reminder.
   * @throws {BusinessError} If the reminder is invalid or storage fails.
   */
  ShikeReminderRepository.save = function (reminder) {
    return new Promise(function (resolve, reject) {
      try {
        if (!reminder || typeof reminder !== 'object') {
          rejectBusiness(reject, 'INVALID_ARGUMENT',
            'save: reminder must be a non-null object');
          return;
        }
        if (!isNonEmptyString(reminder.id)) {
          rejectBusiness(reject, 'INVALID_ARGUMENT',
            'save: reminder.id is required');
          return;
        }

        getStore('readwrite').then(function (store) {
          var putRequest = store.put(reminder);
          return awaitRequest(putRequest).then(function () {
            return awaitTransaction(store.transaction);
          });
        }).then(function () {
          resolve(reminder);
        })['catch'](function (err) {
          if (err && err.isBusinessError) {
            reject(err);
          } else {
            rejectBusiness(reject, 'SAVE_FAILED',
              'Failed to save reminder', err && err.message);
          }
        });
      } catch (err) {
        rejectBusiness(reject, 'SAVE_EXCEPTION',
          'Exception while saving reminder', err && err.message);
      }
    });
  };

  /**
   * Retrieves a single reminder by its id.
   * @param {string} id - The reminder id.
   * @returns {Promise<Object|null>} Resolves with the reminder or null.
   * @throws {BusinessError} If the id is invalid or storage fails.
   */
  ShikeReminderRepository.getById = function (id) {
    return new Promise(function (resolve, reject) {
      try {
        if (!isNonEmptyString(id)) {
          rejectBusiness(reject, 'INVALID_ARGUMENT',
            'getById: id is required');
          return;
        }
        getStore('readonly').then(function (store) {
          return awaitRequest(store.get(id));
        }).then(function (result) {
          resolve(result || null);
        })['catch'](function (err) {
          if (err && err.isBusinessError) {
            reject(err);
          } else {
            rejectBusiness(reject, 'GET_FAILED',
              'Failed to retrieve reminder', err && err.message);
          }
        });
      } catch (err) {
        rejectBusiness(reject, 'GET_EXCEPTION',
          'Exception while retrieving reminder', err && err.message);
      }
    });
  };

  /**
   * Retrieves all reminders from the store.
   * @returns {Promise<Array<Object>>} Resolves with an array of reminders.
   * @throws {BusinessError} If storage fails.
   */
  ShikeReminderRepository.getAll = function () {
    return new Promise(function (resolve, reject) {
      try {
        getStore('readonly').then(function (store) {
          return awaitRequest(store.getAll());
        }).then(function (results) {
          resolve(Array.isArray(results) ? results : []);
        })['catch'](function (err) {
          if (err && err.isBusinessError) {
            reject(err);
          } else {
            rejectBusiness(reject, 'GET_ALL_FAILED',
              'Failed to retrieve all reminders', err && err.message);
          }
        });
      } catch (err) {
        rejectBusiness(reject, 'GET_ALL_EXCEPTION',
          'Exception while retrieving all reminders', err && err.message);
      }
    });
  };

  /**
   * Retrieves all reminders matching a given status.
   * @param {string} status - The status to filter by.
   * @returns {Promise<Array<Object>>} Resolves with matching reminders.
   * @throws {BusinessError} If storage fails.
   */
  ShikeReminderRepository.getByStatus = function (status) {
    return new Promise(function (resolve, reject) {
      try {
        if (!isNonEmptyString(status)) {
          rejectBusiness(reject, 'INVALID_ARGUMENT',
            'getByStatus: status is required');
          return;
        }
        getStore('readonly').then(function (store) {
          var index = store.index('status');
          return awaitRequest(index.getAll(status));
        }).then(function (results) {
          resolve(Array.isArray(results) ? results : []);
        })['catch'](function (err) {
          if (err && err.isBusinessError) {
            reject(err);
          } else {
            rejectBusiness(reject, 'GET_BY_STATUS_FAILED',
              'Failed to retrieve reminders by status', err && err.message);
          }
        });
      } catch (err) {
        rejectBusiness(reject, 'GET_BY_STATUS_EXCEPTION',
          'Exception while retrieving reminders by status',
          err && err.message);
      }
    });
  };

  /**
   * Deletes a reminder by its id.
   * @param {string} id - The reminder id.
   * @returns {Promise<boolean>} Resolves with true if a record was deleted.
   * @throws {BusinessError} If the id is invalid or storage fails.
   */
  ShikeReminderRepository.deleteById = function (id) {
    return new Promise(function (resolve, reject) {
      try {
        if (!isNonEmptyString(id)) {
          rejectBusiness(reject, 'INVALID_ARGUMENT',
            'deleteById: id is required');
          return;
        }
        getStore('readwrite').then(function (store) {
          return awaitRequest(store.get(id)).then(function (existing) {
            if (!existing) {
              return false;
            }
            return awaitRequest(store['delete'](id)).then(function () {
              return awaitTransaction(store.transaction).then(function () {
                return true;
              });
            });
          });
        }).then(function (deleted) {
          resolve(deleted);
        })['catch'](function (err) {
          if (err && err.isBusinessError) {
            reject(err);
          } else {
            rejectBusiness(reject, 'DELETE_FAILED',
              'Failed to delete reminder', err && err.message);
          }
        });
      } catch (err) {
        rejectBusiness(reject, 'DELETE_EXCEPTION',
          'Exception while deleting reminder', err && err.message);
      }
    });
  };

  /**
   * Removes every reminder from the store.
   * @returns {Promise<void>} Resolves when the store has been cleared.
   * @throws {BusinessError} If storage fails.
   */
  ShikeReminderRepository.clearAll = function () {
    return new Promise(function (resolve, reject) {
      try {
        getStore('readwrite').then(function (store) {
          return awaitRequest(store.clear()).then(function () {
            return awaitTransaction(store.transaction);
          });
        }).then(function () {
          resolve();
        })['catch'](function (err) {
          if (err && err.isBusinessError) {
            reject(err);
          } else {
            rejectBusiness(reject, 'CLEAR_FAILED',
              'Failed to clear the reminder store', err && err.message);
          }
        });
      } catch (err) {
        rejectBusiness(reject, 'CLEAR_EXCEPTION',
          'Exception while clearing the reminder store', err && err.message);
      }
    });
  };

  /**
   * Closes the cached database connection, if any. Useful when a page is
   * being torn down or for forcing a fresh connection.
   * @returns {void}
   */
  ShikeReminderRepository.close = function () {
    try {
      if (dbConnection) {
        dbConnection.close();
        dbConnection = null;
      }
    } catch (err) {
      console.error('[ShikeReminderRepository] close failed:', err);
    }
  };

  // Expose on the global object.
  global.ShikeReminderRepository = ShikeReminderRepository;
})(typeof window !== 'undefined' ? window : this);
