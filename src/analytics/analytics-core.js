/**
 * Shike Analytics Core
 * Core analytics adapter with pluggable backends for the 时刻 (Shike) web project.
 *
 * Version: 2.0.0-rc5
 * Phase: Optional Sync Beta
 *
 * Provides a unified API for tracking events across multiple backends.
 * The default backend is 'local' (ShikeLocalAnalytics) which stores data
 * on-device. Remote backends require explicit user opt-in via consent.
 *
 * Backend interface:
 *   { track(event, properties), flush(), clear() }
 *
 * @module analytics/analytics-core
 * @version 2.0.0-rc5
 * @copyright 时刻 Shike Project
 */
(function (global) {
    'use strict';

    /**
     * Registry of available backends.
     * Each backend must implement: track(event, properties), flush(), clear().
     *
     * @type {Object.<string, Object>}
     * @private
     */
    var backends = {};

    /**
     * The name of the currently active backend.
     * Defaults to 'local'.
     *
     * @type {string}
     * @private
     */
    var activeBackendName = 'local';

    /**
     * Global enabled flag. When false, all tracking is suppressed.
     * Defaults to true; remote analytics is gated by the consent module.
     *
     * @type {boolean}
     * @private
     */
    var enabled = true;

    /**
     * Whether the default local backend has been registered.
     *
     * @type {boolean}
     * @private
     */
    var defaultBackendInitialized = false;

    /**
     * Attempts to register the default 'local' backend using the global
     * ShikeLocalAnalytics object if it is available. This is called lazily
     * so that load order does not matter.
     *
     * @private
     * @returns {void}
     */
    function ensureDefaultBackend() {
        try {
            if (backends['local']) {
                defaultBackendInitialized = true;
                return;
            }
            if (global.ShikeLocalAnalytics &&
                typeof global.ShikeLocalAnalytics.track === 'function') {
                backends['local'] = {
                    track: function (event, properties) {
                        global.ShikeLocalAnalytics.track(event, properties);
                    },
                    flush: function () {
                        if (typeof global.ShikeLocalAnalytics.flush === 'function') {
                            global.ShikeLocalAnalytics.flush();
                        }
                    },
                    clear: function () {
                        if (typeof global.ShikeLocalAnalytics.clear === 'function') {
                            global.ShikeLocalAnalytics.clear();
                        }
                    }
                };
                defaultBackendInitialized = true;
            }
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsCore] Failed to initialize default backend:', err);
            }
        }
    }

    /**
     * Registers a backend under the given name.
     * The backend must implement track(event, properties), flush(), and clear().
     *
     * @param {string} name - A unique name for this backend.
     * @param {Object} backend - The backend object implementing the backend interface.
     * @returns {boolean} True if the backend was registered successfully, false otherwise.
     */
    function setBackend(name, backend) {
        try {
            if (!name || typeof name !== 'string') {
                if (global.console && global.console.warn) {
                    global.console.warn('[ShikeAnalyticsCore] setBackend: name must be a non-empty string.');
                }
                return false;
            }
            if (!backend || typeof backend !== 'object') {
                if (global.console && global.console.warn) {
                    global.console.warn('[ShikeAnalyticsCore] setBackend: backend must be an object.');
                }
                return false;
            }
            if (typeof backend.track !== 'function' ||
                typeof backend.flush !== 'function' ||
                typeof backend.clear !== 'function') {
                if (global.console && global.console.warn) {
                    global.console.warn('[ShikeAnalyticsCore] setBackend: backend must implement track(), flush(), and clear().');
                }
                return false;
            }
            backends[name] = backend;
            return true;
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsCore] setBackend error:', err);
            }
            return false;
        }
    }

    /**
     * Sets the active backend by name. The backend must have been previously
     * registered via setBackend().
     *
     * @param {string} name - The name of the backend to activate.
     * @returns {boolean} True if the backend was found and activated, false otherwise.
     */
    function setActive(name) {
        try {
            if (!name || typeof name !== 'string') {
                return false;
            }
            // Lazily initialize the default backend if needed
            if (name === 'local' && !backends['local']) {
                ensureDefaultBackend();
            }
            if (backends.hasOwnProperty(name)) {
                activeBackendName = name;
                return true;
            }
            if (global.console && global.console.warn) {
                global.console.warn('[ShikeAnalyticsCore] setActive: backend "' + name + '" is not registered.');
            }
            return false;
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsCore] setActive error:', err);
            }
            return false;
        }
    }

    /**
     * Returns the name of the currently active backend.
     *
     * @returns {string} The active backend name (defaults to 'local').
     */
    function getActive() {
        return activeBackendName;
    }

    /**
     * Tracks an event by sending it to the active backend.
     * If analytics is disabled, this is a no-op.
     *
     * @param {string} event - The event name to track.
     * @param {Object} [properties] - Optional properties associated with the event.
     * @returns {boolean} True if the event was dispatched to the backend, false otherwise.
     */
    function track(event, properties) {
        try {
            if (!enabled) {
                return false;
            }
            if (!event || typeof event !== 'string') {
                return false;
            }
            // Ensure the default backend is available
            ensureDefaultBackend();

            var backend = backends[activeBackendName];
            if (!backend) {
                return false;
            }
            backend.track(event, properties || {});
            return true;
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsCore] track error:', err);
            }
            return false;
        }
    }

    /**
     * Enables analytics tracking globally. After calling this, track()
     * will dispatch events to the active backend.
     *
     * @returns {void}
     */
    function enable() {
        enabled = true;
    }

    /**
     * Disables analytics tracking globally. After calling this, track()
     * becomes a no-op until enable() is called again.
     *
     * @returns {void}
     */
    function disable() {
        enabled = false;
    }

    /**
     * Checks whether analytics tracking is currently enabled.
     *
     * @returns {boolean} True if tracking is enabled, false otherwise.
     */
    function isEnabled() {
        return enabled;
    }

    /**
     * Flushes any pending events in the active backend. This is a no-op
     * for synchronous backends like the local backend.
     *
     * @returns {void}
     */
    function flush() {
        try {
            ensureDefaultBackend();
            var backend = backends[activeBackendName];
            if (backend && typeof backend.flush === 'function') {
                backend.flush();
            }
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsCore] flush error:', err);
            }
        }
    }

    /**
     * Clears all stored data in the active backend.
     *
     * @returns {void}
     */
    function clear() {
        try {
            ensureDefaultBackend();
            var backend = backends[activeBackendName];
            if (backend && typeof backend.clear === 'function') {
                backend.clear();
            }
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsCore] clear error:', err);
            }
        }
    }

    /**
     * Returns whether the default local backend has been initialized.
     *
     * @returns {boolean} True if the local backend is registered.
     */
    function isDefaultBackendReady() {
        try {
            return backends['local'] !== undefined;
        } catch (err) {
            return false;
        }
    }

    // Expose public API
    global.ShikeAnalyticsCore = {
        setBackend: setBackend,
        setActive: setActive,
        getActive: getActive,
        track: track,
        enable: enable,
        disable: disable,
        isEnabled: isEnabled,
        flush: flush,
        clear: clear,
        isDefaultBackendReady: isDefaultBackendReady
    };

    // Attempt to initialize the default backend on load.
    // If ShikeLocalAnalytics is not yet available, it will be initialized
    // lazily when track() or setActive('local') is called.
    ensureDefaultBackend();

})(typeof window !== 'undefined' ? window : this);
