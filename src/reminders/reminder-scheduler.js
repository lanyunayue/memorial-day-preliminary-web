/**
 * @fileoverview 时刻 Shike - Reminder Scheduler
 *
 * Runs periodic checks against the reminder engine. On each tick it calls
 * ShikeReminderEngine.checkReminders() and, if any reminders are due, fires
 * a browser Notification (when permission has been granted). The scheduler
 * also listens for `visibilitychange` so that it can compensate for periods
 * when the browser tab was hidden or the device was asleep.
 *
 * Default check interval: 60 seconds (60000 ms).
 *
 * @version 2.0.0-rc4
 * @module ShikeReminderScheduler
 */
(function (global) {
  'use strict';

  /**
   * Default interval between reminder checks, in milliseconds.
   * @type {number}
   * @constant
   */
  var DEFAULT_INTERVAL = 60000;

  /**
   * Key used to persist the last-check timestamp.
   * @type {string}
   * @constant
   */
  var LAST_CHECK_KEY = 'shike_last_reminder_check';

  /**
   * Current check interval in milliseconds.
   * @type {number}
   * @private
   */
  var currentInterval = DEFAULT_INTERVAL;

  /**
   * The handle returned by setInterval, or null when stopped.
   * @type {number|null}
   * @private
   */
  var timerHandle = null;

  /**
   * Whether a check is currently in progress (prevents re-entrancy).
   * @type {boolean}
   * @private
   */
  var checkInProgress = false;

  /**
   * Bound reference to the visibilitychange handler so it can be removed.
   * @type {Function|null}
   * @private
   */
  var visibilityHandler = null;

  /**
   * Validates that a value is a positive number.
   * @param {*} value - The value to test.
   * @returns {boolean} True if the value is a positive finite number.
   * @private
   */
  function isPositiveNumber(value) {
    return typeof value === 'number' && isFinite(value) && value > 0;
  }

  /**
   * Returns the current time as an ISO 8601 string.
   * @returns {string} ISO timestamp.
   * @private
   */
  function now() {
    return new Date().toISOString();
  }

  /**
   * Records the timestamp of the most recent check to localStorage so that
   * the status module (and other consumers) can report it.
   * @private
   */
  function recordLastCheck() {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(LAST_CHECK_KEY, now());
      }
    } catch (err) {
      console.error('[ShikeReminderScheduler] Failed to record last check:', err);
    }
  }

  /**
   * Fires a browser Notification for the given due reminders, provided the
   * Notification API is available and permission has been granted.
   * @param {Array<Object>} dueReminders - The reminders that are due.
   * @private
   */
  function fireNotifications(dueReminders) {
    try {
      if (typeof global.Notification === 'undefined') {
        return;
      }
      if (global.Notification.permission !== 'granted') {
        return;
      }
      for (var i = 0; i < dueReminders.length; i++) {
        var r = dueReminders[i];
        try {
          var n = new global.Notification('时刻提醒 / Shike Reminder', {
            body: r.title || 'You have a reminder due.',
            tag: r.id,
            requireInteraction: true
          });
          // Close automatically after 30 seconds if not interacted with.
          setTimeout(function (notification) {
            try {
              notification.close();
            } catch (e) {
              /* ignore */
            }
          }, 30000, n);
        } catch (notifErr) {
          console.error('[ShikeReminderScheduler] Notification failed:',
            notifErr);
        }
      }
    } catch (err) {
      console.error('[ShikeReminderScheduler] fireNotifications failed:', err);
    }
  }

  /**
   * Requests notification permission from the user. Safe to call even if
   * the Notification API is unavailable.
   * @returns {Promise<string>} Resolves with the permission state.
   * @private
   */
  function requestPermission() {
    return new Promise(function (resolve) {
      try {
        if (typeof global.Notification === 'undefined') {
          resolve('unsupported');
          return;
        }
        if (global.Notification.permission === 'granted') {
          resolve('granted');
          return;
        }
        if (global.Notification.permission === 'denied') {
          resolve('denied');
          return;
        }
        global.Notification.requestPermission().then(function (perm) {
          resolve(perm);
        })['catch'](function () {
          resolve('default');
        });
      } catch (err) {
        console.error('[ShikeReminderScheduler] requestPermission failed:', err);
        resolve('error');
      }
    });
  }

  /**
   * Performs a single check cycle. Calls the reminder engine, records the
   * last-check timestamp and fires notifications for any due reminders.
   * @private
   */
  function performCheck() {
    if (checkInProgress) {
      return;
    }
    checkInProgress = true;
    try {
      var engine = global.ShikeReminderEngine;
      if (!engine || typeof engine.checkReminders !== 'function') {
        console.warn('[ShikeReminderScheduler] ShikeReminderEngine not found');
        return;
      }
      var dueReminders = engine.checkReminders();
      recordLastCheck();
      if (dueReminders && dueReminders.length > 0) {
        fireNotifications(dueReminders);
      }
    } catch (err) {
      console.error('[ShikeReminderScheduler] performCheck failed:', err);
    } finally {
      checkInProgress = false;
    }
  }

  /**
   * The reminder scheduler public API.
   * @namespace ShikeReminderScheduler
   */
  var ShikeReminderScheduler = {};

  /**
   * Starts the periodic check cycle.
   *
   * @param {number} [interval] - Optional interval in milliseconds. If
   *   omitted the current interval (or the default of 60s) is used.
   * @returns {boolean} True if the scheduler was started.
   */
  ShikeReminderScheduler.start = function (interval) {
    try {
      if (timerHandle !== null) {
        // Already running; restart with the new interval if provided.
        global.clearInterval(timerHandle);
      }
      if (isPositiveNumber(interval)) {
        currentInterval = interval;
      }
      timerHandle = global.setInterval(performCheck, currentInterval);

      // Attach the visibilitychange listener once.
      if (!visibilityHandler && typeof document !== 'undefined') {
        visibilityHandler = function () {
          try {
            if (document.visibilityState === 'visible') {
              // Tab became visible again - compensate for sleep by
              // running an immediate check.
              performCheck();
            }
          } catch (err) {
            console.error('[ShikeReminderScheduler] visibility handler failed:',
              err);
          }
        };
        document.addEventListener('visibilitychange', visibilityHandler);
      }

      // Run an immediate check so newly started schedules are honoured.
      performCheck();
      return true;
    } catch (err) {
      console.error('[ShikeReminderScheduler] start failed:', err);
      return false;
    }
  };

  /**
   * Stops the periodic check cycle.
   * @returns {boolean} True if the scheduler was stopped.
   */
  ShikeReminderScheduler.stop = function () {
    try {
      if (timerHandle !== null) {
        global.clearInterval(timerHandle);
        timerHandle = null;
      }
      if (visibilityHandler && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', visibilityHandler);
        visibilityHandler = null;
      }
      return true;
    } catch (err) {
      console.error('[ShikeReminderScheduler] stop failed:', err);
      return false;
    }
  };

  /**
   * Reports whether the scheduler is currently running.
   * @returns {boolean} True if a timer is active.
   */
  ShikeReminderScheduler.isRunning = function () {
    return timerHandle !== null;
  };

  /**
   * Changes the check interval. If the scheduler is running it is
   * restarted with the new interval.
   * @param {number} ms - The new interval in milliseconds.
   * @returns {boolean} True if the interval was changed.
   */
  ShikeReminderScheduler.setInterval = function (ms) {
    try {
      if (!isPositiveNumber(ms)) {
        throw new Error('setInterval: ms must be a positive number');
      }
      currentInterval = ms;
      if (timerHandle !== null) {
        global.clearInterval(timerHandle);
        timerHandle = global.setInterval(performCheck, currentInterval);
      }
      return true;
    } catch (err) {
      console.error('[ShikeReminderScheduler] setInterval failed:', err);
      return false;
    }
  };

  /**
   * Immediately runs a single check cycle without waiting for the timer.
   * @returns {Array<Object>} The reminders that are currently due.
   */
  ShikeReminderScheduler.checkNow = function () {
    try {
      var engine = global.ShikeReminderEngine;
      if (!engine || typeof engine.checkReminders !== 'function') {
        return [];
      }
      var dueReminders = engine.checkReminders();
      recordLastCheck();
      if (dueReminders && dueReminders.length > 0) {
        fireNotifications(dueReminders);
      }
      return dueReminders;
    } catch (err) {
      console.error('[ShikeReminderScheduler] checkNow failed:', err);
      return [];
    }
  };

  /**
   * Returns the current interval in milliseconds.
   * @returns {number} The current interval.
   */
  ShikeReminderScheduler.getInterval = function () {
    return currentInterval;
  };

  /**
   * Ensures notification permission is requested. Exposed so callers can
   * trigger the permission prompt from a user gesture.
   * @returns {Promise<string>} Resolves with the permission state.
   */
  ShikeReminderScheduler.ensurePermission = function () {
    return requestPermission();
  };

  // Expose on the global object.
  global.ShikeReminderScheduler = ShikeReminderScheduler;
})(typeof window !== 'undefined' ? window : this);
