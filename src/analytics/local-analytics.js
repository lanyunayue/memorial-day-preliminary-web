/**
 * Shike Local Analytics
 * Local-only analytics that stores events in the browser's localStorage.
 *
 * Version: 2.0.0-rc5
 * Phase: Optional Sync Beta
 *
 * All analytics data is stored on-device. No data ever leaves the user's
 * browser. The storage is capped at 500 events; when the limit is exceeded,
 * the oldest events are automatically removed.
 *
 * Each stored event has the shape:
 *   { id, event, properties, timestamp }
 *
 * @module analytics/local-analytics
 * @version 2.0.0-rc5
 * @copyright 时刻 Shike Project
 */
(function (global) {
    'use strict';

    /**
     * The localStorage key under which all local analytics data is stored.
     *
     * @type {string}
     * @private
     * @const
     */
    var STORAGE_KEY = 'shike_local_analytics';

    /**
     * Maximum number of events to retain. When this limit is exceeded,
     * the oldest events are removed (FIFO eviction).
     *
     * @type {number}
     * @private
     * @const
     */
    var MAX_EVENTS = 500;

    /**
     * Reads all stored events from localStorage.
     *
     * @private
     * @returns {Array<Object>} An array of event objects, or an empty array on failure.
     */
    function readEvents() {
        try {
            if (!global.localStorage) {
                return [];
            }
            var raw = global.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return [];
            }
            var data = JSON.parse(raw);
            if (Array.isArray(data)) {
                return data;
            }
            if (data && Array.isArray(data.events)) {
                return data.events;
            }
            return [];
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeLocalAnalytics] readEvents error:', err);
            }
            return [];
        }
    }

    /**
     * Writes the given events array to localStorage.
     *
     * @private
     * @param {Array<Object>} events - The events array to persist.
     * @returns {void}
     */
    function writeEvents(events) {
        try {
            if (!global.localStorage) {
                return;
            }
            var data = {
                version: '2.0.0-rc5',
                events: events
            };
            global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeLocalAnalytics] writeEvents error:', err);
            }
        }
    }

    /**
     * Generates a unique identifier for an event.
     *
     * @private
     * @returns {string} A unique event ID.
     */
    function generateId() {
        try {
            return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        } catch (err) {
            return 'evt_' + Date.now();
        }
    }

    /**
     * Tracks an event by storing it in local storage.
     * No data leaves the device.
     *
     * @param {string} event - The event name (e.g. 'page_view', 'feature_click').
     * @param {Object} [properties] - Optional properties associated with the event.
     * @returns {Object|null} The stored event object, or null on failure.
     */
    function track(event, properties) {
        try {
            if (!event || typeof event !== 'string') {
                return null;
            }
            var events = readEvents();
            var evt = {
                id: generateId(),
                event: event,
                properties: properties || {},
                timestamp: new Date().toISOString()
            };
            events.push(evt);

            // Enforce max events limit: remove oldest entries
            while (events.length > MAX_EVENTS) {
                events.shift();
            }

            writeEvents(events);
            return evt;
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeLocalAnalytics] track error:', err);
            }
            return null;
        }
    }

    /**
     * Returns all stored events.
     *
     * @returns {Array<Object>} An array of all stored event objects.
     */
    function getAll() {
        try {
            return readEvents();
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeLocalAnalytics] getAll error:', err);
            }
            return [];
        }
    }

    /**
     * Returns events of a specific type.
     *
     * @param {string} eventType - The event type to filter by (e.g. 'page_view').
     * @returns {Array<Object>} Filtered events matching the given type.
     */
    function getByType(eventType) {
        try {
            if (!eventType || typeof eventType !== 'string') {
                return [];
            }
            var events = readEvents();
            return events.filter(function (evt) {
                return evt.event === eventType;
            });
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeLocalAnalytics] getByType error:', err);
            }
            return [];
        }
    }

    /**
     * Returns counts of common event types.
     *
     * @returns {Object} An object with counts: { pageViews, featureClicks, errors }.
     */
    function getCounts() {
        try {
            var events = readEvents();
            var counts = {
                pageViews: 0,
                featureClicks: 0,
                errors: 0
            };
            for (var i = 0; i < events.length; i++) {
                switch (events[i].event) {
                    case 'page_view':
                        counts.pageViews++;
                        break;
                    case 'feature_click':
                        counts.featureClicks++;
                        break;
                    case 'error':
                        counts.errors++;
                        break;
                    default:
                        break;
                }
            }
            return counts;
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeLocalAnalytics] getCounts error:', err);
            }
            return {
                pageViews: 0,
                featureClicks: 0,
                errors: 0
            };
        }
    }

    /**
     * Clears all locally stored analytics data.
     *
     * @returns {void}
     */
    function clear() {
        try {
            if (global.localStorage) {
                global.localStorage.removeItem(STORAGE_KEY);
            }
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeLocalAnalytics] clear error:', err);
            }
        }
    }

    /**
     * Exports all local analytics data as a JSON string.
     * The exported object includes version, export timestamp, total event count,
     * and the full events array.
     *
     * @returns {string} A JSON string of all analytics data.
     */
    function exportData() {
        try {
            var events = readEvents();
            var data = {
                version: '2.0.0-rc5',
                exportedAt: new Date().toISOString(),
                totalEvents: events.length,
                events: events
            };
            return JSON.stringify(data, null, 2);
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeLocalAnalytics] export error:', err);
            }
            return JSON.stringify({
                error: 'Export failed',
                message: err.message || String(err)
            });
        }
    }

    /**
     * Returns a summary of the local analytics data.
     *
     * @returns {Object} An object with:
     *   - totalEvents {number} - total number of stored events
     *   - pageViews {number} - count of page_view events
     *   - topFeatures {Array<{feature: string, count: number}>} - features sorted by usage (descending)
     *   - errorCount {number} - count of error events
     */
    function getSummary() {
        try {
            var events = readEvents();
            var pageViews = 0;
            var errorCount = 0;
            var featureCounts = {};

            for (var i = 0; i < events.length; i++) {
                var evt = events[i];
                switch (evt.event) {
                    case 'page_view':
                        pageViews++;
                        break;
                    case 'error':
                        errorCount++;
                        break;
                    case 'feature_click':
                        var featureName = 'unknown';
                        if (evt.properties && evt.properties.feature) {
                            featureName = String(evt.properties.feature);
                        }
                        featureCounts[featureName] = (featureCounts[featureName] || 0) + 1;
                        break;
                    default:
                        break;
                }
            }

            // Build sorted array of top features
            var topFeatures = Object.keys(featureCounts)
                .map(function (name) {
                    return { feature: name, count: featureCounts[name] };
                })
                .sort(function (a, b) {
                    return b.count - a.count;
                });

            return {
                totalEvents: events.length,
                pageViews: pageViews,
                topFeatures: topFeatures,
                errorCount: errorCount
            };
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeLocalAnalytics] getSummary error:', err);
            }
            return {
                totalEvents: 0,
                pageViews: 0,
                topFeatures: [],
                errorCount: 0
            };
        }
    }

    // Expose public API
    global.ShikeLocalAnalytics = {
        track: track,
        getAll: getAll,
        getByType: getByType,
        getCounts: getCounts,
        clear: clear,
        export: exportData,
        getSummary: getSummary,
        STORAGE_KEY: STORAGE_KEY,
        MAX_EVENTS: MAX_EVENTS
    };

})(typeof window !== 'undefined' ? window : this);
