/**
 * Shike Command Bus
 * =================
 *
 * A unified command bus that wraps all mutating operations with undo
 * support for the "时刻 Shike" web project.
 *
 * Each mutating operation is wrapped as a Command object with:
 *   - execute():  perform the operation
 *   - undo():     reverse the operation
 *   - description: human-readable description
 *   - timestamp:  execution time
 *
 * The bus maintains a bounded history (default 50 entries) and
 * supports undo of the most recently executed command.
 *
 * @module ShikeCommandBus
 * @version 2.0.0-rc3
 */

(function (global) {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Constants
     * ------------------------------------------------------------------ */

    /** Maximum number of commands retained in history. */
    var HISTORY_LIMIT = 50;

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
     * Utilities
     * ------------------------------------------------------------------ */

    /**
     * Generate a unique command identifier.
     *
     * @private
     * @returns {string}
     */
    function _generateId() {
        if (global.crypto && typeof global.crypto.randomUUID === 'function') {
            return global.crypto.randomUUID();
        }
        return 'cmd_' + Date.now().toString(36) + '_' +
            Math.random().toString(36).slice(2, 10);
    }

    /**
     * Validate that `command` has the required shape.
     *
     * @private
     * @param {*} command
     * @throws {BusinessError} when validation fails
     */
    function _validateCommand(command) {
        if (!command || typeof command !== 'object') {
            throw new BusinessError(
                'CMD_INVALID_COMMAND',
                'Command must be an object.'
            );
        }
        if (typeof command.execute !== 'function') {
            throw new BusinessError(
                'CMD_MISSING_EXECUTE',
                'Command must implement an execute() method.'
            );
        }
        if (typeof command.undo !== 'function') {
            throw new BusinessError(
                'CMD_MISSING_UNDO',
                'Command must implement an undo() method.'
            );
        }
    }

    /* ------------------------------------------------------------------ *
     * Internal state
     * ------------------------------------------------------------------ */

    /**
     * Ordered command history.  The last element is the most recent.
     * @type {Array<Object>}
     */
    var _history = [];

    /* ------------------------------------------------------------------ *
     * Public API
     * ------------------------------------------------------------------ */

    var ShikeCommandBus = {};

    /**
     * Register a command without executing it.
     *
     * This is useful when a command has already been performed (e.g.
     * by an external system) and you only need it to appear in history
     * so it can be undone later. The command's `timestamp` is set
     * automatically and a unique `id` is assigned.
     *
     * @param {Object} command - command object (must have execute & undo)
     * @returns {Object} the command, enriched with id and timestamp
     * @throws {BusinessError} when the command is invalid or the
     *                         execute/undo methods are missing
     */
    ShikeCommandBus.register = function (command) {
        try {
            _validateCommand(command);

            command.id = command.id || _generateId();
            command.timestamp = command.timestamp || new Date().toISOString();
            command.description = command.description || 'Unnamed command';

            _history.push(command);

            // Enforce history limit - oldest entries are discarded first
            if (_history.length > HISTORY_LIMIT) {
                _history.splice(0, _history.length - HISTORY_LIMIT);
            }

            return command;
        } catch (err) {
            throw err instanceof BusinessError
                ? err
                : new BusinessError(
                    'CMD_REGISTER_FAILED',
                    'Unexpected error during command registration.',
                    err
                );
        }
    };

    /**
     * Execute a command and add it to the history.
     *
     * @param {Object} command - command object (must have execute & undo)
     * @returns {Promise<*>|*} the return value of `command.execute()`
     * @throws {BusinessError} when the command is invalid or execution fails
     */
    ShikeCommandBus.execute = function (command) {
        try {
            _validateCommand(command);

            command.id = command.id || _generateId();
            command.timestamp = new Date().toISOString();
            command.description = command.description || 'Unnamed command';

            var result = command.execute();

            // Support both synchronous and asynchronous execute()
            var finalize = function (res) {
                _history.push(command);
                if (_history.length > HISTORY_LIMIT) {
                    _history.splice(0, _history.length - HISTORY_LIMIT);
                }
                return res;
            };

            if (result && typeof result.then === 'function') {
                return result.then(finalize, function (err) {
                    throw new BusinessError(
                        'CMD_EXECUTE_FAILED',
                        'Command execute() rejected.',
                        err
                    );
                });
            }

            return finalize(result);
        } catch (err) {
            throw err instanceof BusinessError
                ? err
                : new BusinessError(
                    'CMD_EXECUTE_FAILED',
                    'Unexpected error during command execution.',
                    err
                );
        }
    };

    /**
     * Undo the most recently executed command.
     *
     * Removes the command from history after a successful undo.
     *
     * @returns {Promise<*>|*} the return value of `command.undo()`
     * @throws {BusinessError} when there is nothing to undo or the
     *                         undo fails
     */
    ShikeCommandBus.undoLast = function () {
        try {
            if (_history.length === 0) {
                throw new BusinessError(
                    'CMD_NOTHING_TO_UNDO',
                    'No commands available to undo.'
                );
            }

            var command = _history[_history.length - 1];
            var result = command.undo();

            var finalize = function (res) {
                _history.pop();
                return res;
            };

            if (result && typeof result.then === 'function') {
                return result.then(finalize, function (err) {
                    throw new BusinessError(
                        'CMD_UNDO_FAILED',
                        'Command undo() rejected.',
                        err
                    );
                });
            }

            return finalize(result);
        } catch (err) {
            throw err instanceof BusinessError
                ? err
                : new BusinessError(
                    'CMD_UNDO_FAILED',
                    'Unexpected error during undo.',
                    err
                );
        }
    };

    /**
     * Return a shallow copy of the command history.
     *
     * The most recent command is the last element.
     *
     * @returns {Array<Object>}
     */
    ShikeCommandBus.getHistory = function () {
        return _history.slice();
    };

    /**
     * Check whether at least one command can be undone.
     *
     * @returns {boolean}
     */
    ShikeCommandBus.canUndo = function () {
        return _history.length > 0;
    };

    /**
     * Remove all commands from history.
     * Undo will no longer be possible for any previously executed command.
     */
    ShikeCommandBus.clearHistory = function () {
        _history = [];
    };

    /**
     * Get the current history limit.
     *
     * @returns {number}
     */
    ShikeCommandBus.getHistoryLimit = function () {
        return HISTORY_LIMIT;
    };

    /**
     * Set a new history limit. Existing history is truncated to the
     * new limit if it is smaller than the current number of entries.
     *
     * @param {number} limit - new maximum (must be a positive integer)
     * @throws {BusinessError} when `limit` is invalid
     */
    ShikeCommandBus.setHistoryLimit = function (limit) {
        if (typeof limit !== 'number' || limit < 1 ||
            Math.floor(limit) !== limit) {
            throw new BusinessError(
                'CMD_INVALID_HISTORY_LIMIT',
                'History limit must be a positive integer.'
            );
        }
        HISTORY_LIMIT = limit;
        if (_history.length > HISTORY_LIMIT) {
            _history.splice(0, _history.length - HISTORY_LIMIT);
        }
    };

    /* ------------------------------------------------------------------ *
     * Export
     * ------------------------------------------------------------------ */

    ShikeCommandBus.BusinessError = BusinessError;

    global.ShikeCommandBus = ShikeCommandBus;

})(typeof window !== 'undefined' ? window : this);
