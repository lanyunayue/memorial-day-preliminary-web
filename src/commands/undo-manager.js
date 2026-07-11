/**
 * Shike Undo Manager
 * ==================
 *
 * Manages undo windows and toast notifications for the "时刻 Shike"
 * web project.
 *
 * When a destructive or mutating action occurs the caller can show an
 * undo toast.  The user has a limited window (default 10 seconds) to
 * click "撤销" (Undo) or press Ctrl+Z / Cmd+Z.  If the window expires
 * without an undo the `onCancel` callback is invoked instead.
 *
 * Only one undo toast is active at a time.  Showing a new toast
 * dismisses the previous one (calling its `onCancel`).
 *
 * @module ShikeUndoManager
 * @version 2.0.0-rc3
 */

(function (global) {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Constants
     * ------------------------------------------------------------------ */

    /** Default undo window in milliseconds. */
    var DEFAULT_UNDO_WINDOW = 10000;

    /** DOM element id for the toast container. */
    var TOAST_ID = 'undoToast';

    /** DOM element id for the undo button. */
    var UNDO_BTN_ID = 'undoBtn';

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

    /**
     * @typedef {Object} ActiveToast
     * @property {HTMLElement} element
     * @property {function}    onUndo
     * @property {function}    onCancel
     * @property {number}      startTime
     * @property {number}      duration
     * @property {number}      timeoutId
     * @property {number}      tickId
     * @property {boolean}     dismissed
     */

    /** @type {ActiveToast|null} */
    var _active = null;

    /** @type {function|null} */
    var _keydownHandler = null;

    /* ------------------------------------------------------------------ *
     * DOM helpers
     * ------------------------------------------------------------------ */

    /**
     * Inject toast CSS once.
     * @private
     */
    var _stylesInjected = false;
    function _injectStyles() {
        if (_stylesInjected) return;
        if (typeof document === 'undefined') return;

        _stylesInjected = true;

        var style = document.createElement('style');
        style.setAttribute('data-shike-undo-manager', 'true');
        style.textContent = [
            '#' + TOAST_ID + ' {',
            '  position: fixed;',
            '  bottom: 24px;',
            '  left: 50%;',
            '  transform: translateX(-50%);',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 16px;',
            '  padding: 12px 20px;',
            '  background: #1e1e2e;',
            '  color: #f5f5f5;',
            '  border-radius: 10px;',
            '  box-shadow: 0 8px 32px rgba(0,0,0,0.3);',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
            '  font-size: 14px;',
            '  z-index: 999999;',
            '  animation: shikeUndoSlideUp 0.25s ease-out;',
            '  max-width: 90vw;',
            '}',
            '#' + TOAST_ID + ' .undo-toast__message {',
            '  flex: 1;',
            '  white-space: nowrap;',
            '  overflow: hidden;',
            '  text-overflow: ellipsis;',
            '}',
            '#' + TOAST_ID + ' #' + UNDO_BTN_ID + ' {',
            '  background: #6366f1;',
            '  color: #fff;',
            '  border: none;',
            '  border-radius: 6px;',
            '  padding: 6px 16px;',
            '  font-size: 13px;',
            '  font-weight: 600;',
            '  cursor: pointer;',
            '  transition: background 0.15s;',
            '  white-space: nowrap;',
            '}',
            '#' + TOAST_ID + ' #' + UNDO_BTN_ID + ':hover {',
            '  background: #4f46e5;',
            '}',
            '#' + TOAST_ID + ' .undo-toast__cancel {',
            '  background: transparent;',
            '  color: #9ca3af;',
            '  border: none;',
            '  cursor: pointer;',
            '  font-size: 18px;',
            '  line-height: 1;',
            '  padding: 0 4px;',
            '}',
            '#' + TOAST_ID + ' .undo-toast__cancel:hover {',
            '  color: #f5f5f5;',
            '}',
            '#' + TOAST_ID + ' .undo-toast__progress {',
            '  position: absolute;',
            '  bottom: 0;',
            '  left: 0;',
            '  height: 3px;',
            '  background: #6366f1;',
            '  border-radius: 0 0 10px 10px;',
            '  transition: width 0.1s linear;',
            '}',
            '#' + TOAST_ID + '.undo-toast--leaving {',
            '  animation: shikeUndoSlideDown 0.2s ease-in forwards;',
            '}',
            '@keyframes shikeUndoSlideUp {',
            '  from { opacity: 0; transform: translateX(-50%) translateY(20px); }',
            '  to   { opacity: 1; transform: translateX(-50%) translateY(0); }',
            '}',
            '@keyframes shikeUndoSlideDown {',
            '  from { opacity: 1; transform: translateX(-50%) translateY(0); }',
            '  to   { opacity: 0; transform: translateX(-50%) translateY(20px); }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    /**
     * Build the toast DOM element.
     *
     * @private
     * @param {string} message
     * @returns {HTMLElement}
     */
    function _createToastElement(message) {
        _injectStyles();

        var toast = document.createElement('div');
        toast.id = TOAST_ID;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');

        var msg = document.createElement('span');
        msg.className = 'undo-toast__message';
        msg.textContent = message;

        var undoBtn = document.createElement('button');
        undoBtn.id = UNDO_BTN_ID;
        undoBtn.type = 'button';
        undoBtn.textContent = '\u64A4\u9500';

        var cancelBtn = document.createElement('button');
        cancelBtn.className = 'undo-toast__cancel';
        cancelBtn.type = 'button';
        cancelBtn.setAttribute('aria-label', '\u53D6\u6D88');
        cancelBtn.textContent = '\u00d7';

        var progress = document.createElement('div');
        progress.className = 'undo-toast__progress';
        progress.style.width = '100%';

        toast.appendChild(msg);
        toast.appendChild(undoBtn);
        toast.appendChild(cancelBtn);
        toast.appendChild(progress);

        return toast;
    }

    /* ------------------------------------------------------------------ *
     * Keyboard handling
     * ------------------------------------------------------------------ */

    /**
     * Global keydown listener for Ctrl+Z / Cmd+Z.
     * @private
     * @param {KeyboardEvent} e
     */
    function _onKeydown(e) {
        if (!_active || _active.dismissed) return;

        var isCtrl = e.ctrlKey || e.metaKey;
        if (isCtrl && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
            e.preventDefault();
            _triggerUndo();
        }
    }

    /**
     * Attach the keyboard listener if not already attached.
     * @private
     */
    function _attachKeyboard() {
        if (_keydownHandler) return;
        _keydownHandler = _onKeydown;
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', _keydownHandler, false);
        }
    }

    /**
     * Detach the keyboard listener.
     * @private
     */
    function _detachKeyboard() {
        if (!_keydownHandler) return;
        if (typeof document !== 'undefined') {
            document.removeEventListener('keydown', _keydownHandler, false);
        }
        _keydownHandler = null;
    }

    /* ------------------------------------------------------------------ *
     * Toast lifecycle
     * ------------------------------------------------------------------ */

    /**
     * Remove the toast element from the DOM with an optional leave animation.
     *
     * @private
     * @param {HTMLElement} element
     */
    function _removeElement(element) {
        if (!element || !element.parentNode) return;

        element.classList.add('undo-toast--leaving');
        var cleanup = function () {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        };

        // Prefer animationend, but add a safety timeout
        var onEnd = function () {
            element.removeEventListener('animationend', onEnd);
            cleanup();
        };
        element.addEventListener('animationend', onEnd);
        setTimeout(cleanup, 300);
    }

    /**
     * Perform the undo action and dismiss the toast.
     * @private
     */
    function _triggerUndo() {
        if (!_active || _active.dismissed) return;

        var cb = _active.onUndo;
        _cleanup();
        _safeCall(cb);
    }

    /**
     * Perform the cancel action and dismiss the toast.
     * @private
     */
    function _triggerCancel() {
        if (!_active || _active.dismissed) return;

        var cb = _active.onCancel;
        _cleanup();
        _safeCall(cb);
    }

    /**
     * Safely invoke a callback, catching any errors.
     * @private
     * @param {*} fn
     */
    function _safeCall(fn) {
        if (typeof fn === 'function') {
            try {
                fn();
            } catch (err) {
                // Swallow callback errors - the manager itself must stay stable
                if (global.console && console.error) {
                    console.error('[ShikeUndoManager] callback error:', err);
                }
            }
        }
    }

    /**
     * Clear timers, listeners, and DOM for the active toast.
     * @private
     */
    function _cleanup() {
        if (!_active) return;

        _active.dismissed = true;

        clearTimeout(_active.timeoutId);
        clearInterval(_active.tickId);

        _removeElement(_active.element);

        _detachKeyboard();

        _active = null;
    }

    /* ------------------------------------------------------------------ *
     * Public API
     * ------------------------------------------------------------------ */

    var ShikeUndoManager = {};

    /**
     * Show an undo toast.
     *
     * If a toast is already active it is dismissed first (its
     * `onCancel` callback is called).
     *
     * @param {string}   message           - text displayed in the toast
     * @param {function} [onUndo]           - called when the user undoes
     * @param {function} [onCancel]         - called on timeout or cancel
     * @param {number}   [duration=10000]   - undo window in milliseconds
     * @throws {BusinessError} when called in a non-DOM environment
     */
    ShikeUndoManager.showUndoToast = function (message, onUndo, onCancel, duration) {
        try {
            if (typeof document === 'undefined') {
                throw new BusinessError(
                    'UNDO_NO_DOM',
                    'showUndoToast requires a DOM environment.'
                );
            }

            // Dismiss any existing toast first
            if (_active) {
                _triggerCancel();
            }

            var windowMs = (typeof duration === 'number' && duration > 0)
                ? duration
                : DEFAULT_UNDO_WINDOW;

            var element = _createToastElement(message);
            document.body.appendChild(element);

            var progress = element.querySelector('.undo-toast__progress');

            _active = {
                element: element,
                onUndo: onUndo,
                onCancel: onCancel,
                startTime: Date.now(),
                duration: windowMs,
                timeoutId: 0,
                tickId: 0,
                dismissed: false
            };

            // Bind button events
            var undoBtn = element.querySelector('#' + UNDO_BTN_ID);
            var cancelBtn = element.querySelector('.undo-toast__cancel');

            if (undoBtn) {
                undoBtn.addEventListener('click', function () {
                    _triggerUndo();
                }, false);
            }
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function () {
                    _triggerCancel();
                }, false);
            }

            // Progress bar animation
            if (progress) {
                _active.tickId = setInterval(function () {
                    if (!_active || _active.dismissed) return;
                    var elapsed = Date.now() - _active.startTime;
                    var remaining = Math.max(0, _active.duration - elapsed);
                    var pct = (remaining / _active.duration) * 100;
                    progress.style.width = pct + '%';
                }, 50);
            }

            // Auto-dismiss timeout
            _active.timeoutId = setTimeout(function () {
                _triggerCancel();
            }, windowMs);

            // Keyboard shortcut
            _attachKeyboard();

        } catch (err) {
            throw err instanceof BusinessError
                ? err
                : new BusinessError(
                    'UNDO_SHOW_FAILED',
                    'Unexpected error showing undo toast.',
                    err
                );
        }
    };

    /**
     * Manually dismiss the current toast.
     * Calls `onCancel`.
     */
    ShikeUndoManager.dismissToast = function () {
        _triggerCancel();
    };

    /**
     * Check whether an undo toast is currently active.
     *
     * @returns {boolean}
     */
    ShikeUndoManager.isActive = function () {
        return _active !== null && !_active.dismissed;
    };

    /**
     * Get the remaining milliseconds in the current undo window.
     * Returns 0 when no toast is active.
     *
     * @returns {number}
     */
    ShikeUndoManager.getRemainingTime = function () {
        if (!_active || _active.dismissed) {
            return 0;
        }
        var elapsed = Date.now() - _active.startTime;
        return Math.max(0, _active.duration - elapsed);
    };

    /**
     * Get the default undo window duration.
     *
     * @returns {number} milliseconds
     */
    ShikeUndoManager.getDefaultWindow = function () {
        return DEFAULT_UNDO_WINDOW;
    };

    /* ------------------------------------------------------------------ *
     * Export
     * ------------------------------------------------------------------ */

    ShikeUndoManager.BusinessError = BusinessError;

    global.ShikeUndoManager = ShikeUndoManager;

})(typeof window !== 'undefined' ? window : this);
