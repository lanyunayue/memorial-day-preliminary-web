/**
 * @fileoverview 时刻 Shike - Reminder Engine
 *
 * Core reminder engine that manages the full reminder lifecycle. Handles
 * scheduling, due detection, snoozing, acknowledgement and missed detection.
 * Reminders are persisted to localStorage under the key 'shike_reminders'.
 *
 * @version 2.0.0-rc4
 * @module ShikeReminderEngine
 */
(function (global) {
  'use strict';

  /**
   * localStorage key used to persist reminders.
   * @type {string}
   * @constant
   */
  var STORAGE_KEY = 'shike_reminders';

  /**
   * The set of valid reminder lifecycle states.
   * @type {string[]}
   * @constant
   */
  var REMINDER_STATES = [
    'scheduled',
    'due',
    'shown',
    'acknowledged',
    'snoozed',
    'missed',
    'failed'
  ];

  /**
   * Amount of time past the due time after which a reminder is considered
   * missed rather than merely due. One hour, expressed in milliseconds.
   * @type {number}
   * @constant
   */
  var MISSED_THRESHOLD_MS = 60 * 60 * 1000;

  /**
   * Generates a reasonably unique identifier for a reminder.
   * @returns {string} A unique reminder id.
   * @private
   */
  function generateId() {
    return 'rem_' + Date.now().toString(36) + '_' +
      Math.random().toString(36).slice(2, 11);
  }

  /**
   * Reads all persisted reminders from localStorage.
   * @returns {Array<Object>} Array of reminder objects (empty if none/unreadable).
   * @private
   */
  function loadReminders() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('[ShikeReminderEngine] Failed to load reminders:', err);
      return [];
    }
  }

  /**
   * Persists the reminders array to localStorage.
   * @param {Array<Object>} reminders - The reminders to persist.
   * @returns {boolean} True if persisted successfully, false otherwise.
   * @private
   */
  function saveReminders(reminders) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
      return true;
    } catch (err) {
      console.error('[ShikeReminderEngine] Failed to save reminders:', err);
      return false;
    }
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
   * Returns the current time as an ISO 8601 string.
   * @returns {string} ISO timestamp.
   * @private
   */
  function now() {
    return new Date().toISOString();
  }

  /**
   * Safely parses an ISO date string into a timestamp.
   * @param {string} iso - ISO date string.
   * @returns {number} Epoch milliseconds, or NaN if invalid.
   * @private
   */
  function parseTime(iso) {
    if (!iso) {
      return NaN;
    }
    return new Date(iso).getTime();
  }

  /**
   * The reminder engine public API.
   * @namespace ShikeReminderEngine
   */
  var ShikeReminderEngine = {};

  /**
   * Creates and schedules a reminder from a record object.
   *
   * A record is expected to provide at least an id and a due time. The
   * engine will create a new reminder with status 'scheduled' and persist
   * it immediately.
   *
   * @param {Object} record - The source record.
   * @param {string} record.recordId - Unique id of the originating record.
   * @param {string} record.title - Human-readable reminder title.
   * @param {string|Date} record.dueTime - When the reminder is due (ISO or Date).
   * @returns {Object|null} The created reminder object, or null on failure.
   *
   * @example
   * var reminder = ShikeReminderEngine.scheduleReminder({
   *   recordId: 'rec_1',
   *   title: 'Take medicine',
   *   dueTime: '2026-07-12T08:00:00'
   * });
   */
  ShikeReminderEngine.scheduleReminder = function (record) {
    try {
      if (!record || typeof record !== 'object') {
        throw new Error('scheduleReminder: record must be a non-null object');
      }
      if (!isNonEmptyString(record.recordId)) {
        throw new Error('scheduleReminder: record.recordId is required');
      }
      if (!isNonEmptyString(record.title)) {
        throw new Error('scheduleReminder: record.title is required');
      }

      var dueTime = record.dueTime instanceof Date
        ? record.dueTime.toISOString()
        : record.dueTime;
      if (!isNonEmptyString(dueTime) || isNaN(parseTime(dueTime))) {
        throw new Error('scheduleReminder: record.dueTime must be a valid date');
      }

      var reminder = {
        id: generateId(),
        recordId: record.recordId,
        title: record.title,
        dueTime: dueTime,
        status: 'scheduled',
        snoozedUntil: null,
        createdAt: now(),
        shownAt: null,
        acknowledgedAt: null
      };

      var reminders = loadReminders();
      reminders.push(reminder);
      saveReminders(reminders);
      return reminder;
    } catch (err) {
      console.error('[ShikeReminderEngine] scheduleReminder failed:', err);
      return null;
    }
  };

  /**
   * Inspects every reminder in storage. Any 'scheduled' or 'snoozed'
   * reminder whose due time (or snooze end) has passed is transitioned to
   * 'due'. Reminders past due by more than one hour that have never been
   * shown are marked 'missed'.
   *
   * @returns {Array<Object>} The list of reminders that are currently due.
   */
  ShikeReminderEngine.checkReminders = function () {
    var dueReminders = [];
    try {
      var reminders = loadReminders();
      var currentTime = Date.now();
      var changed = false;

      for (var i = 0; i < reminders.length; i++) {
        var r = reminders[i];

        // Skip reminders in terminal states.
        if (r.status === 'acknowledged' || r.status === 'failed') {
          continue;
        }

        var referenceTime = (r.status === 'snoozed' && r.snoozedUntil)
          ? parseTime(r.snoozedUntil)
          : parseTime(r.dueTime);

        if (isNaN(referenceTime)) {
          continue;
        }

        var elapsed = currentTime - referenceTime;

        // Snoozed reminders only become due once the snooze period ends.
        if (r.status === 'snoozed') {
          if (elapsed >= 0) {
            r.status = 'due';
            r.snoozedUntil = null;
            changed = true;
            dueReminders.push(r);
          }
          continue;
        }

        if (r.status === 'scheduled') {
          if (elapsed >= MISSED_THRESHOLD_MS && !r.shownAt) {
            // More than an hour overdue and never shown -> missed.
            r.status = 'missed';
            changed = true;
          } else if (elapsed >= 0) {
            r.status = 'due';
            changed = true;
            dueReminders.push(r);
          }
        } else if (r.status === 'due') {
          // Already due from a previous check; re-evaluate for missed.
          if (elapsed >= MISSED_THRESHOLD_MS && !r.shownAt) {
            r.status = 'missed';
            changed = true;
          } else {
            dueReminders.push(r);
          }
        }
      }

      if (changed) {
        saveReminders(reminders);
      }
    } catch (err) {
      console.error('[ShikeReminderEngine] checkReminders failed:', err);
    }
    return dueReminders;
  };

  /**
   * Marks a reminder as having been shown to the user.
   * @param {string} reminderId - The id of the reminder.
   * @returns {boolean} True if the reminder was found and updated.
   */
  ShikeReminderEngine.markShown = function (reminderId) {
    try {
      if (!isNonEmptyString(reminderId)) {
        throw new Error('markShown: reminderId is required');
      }
      var reminders = loadReminders();
      for (var i = 0; i < reminders.length; i++) {
        if (reminders[i].id === reminderId) {
          reminders[i].status = 'shown';
          reminders[i].shownAt = now();
          saveReminders(reminders);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('[ShikeReminderEngine] markShown failed:', err);
      return false;
    }
  };

  /**
   * Marks a reminder as acknowledged (dismissed) by the user.
   * @param {string} reminderId - The id of the reminder.
   * @returns {boolean} True if the reminder was found and updated.
   */
  ShikeReminderEngine.acknowledge = function (reminderId) {
    try {
      if (!isNonEmptyString(reminderId)) {
        throw new Error('acknowledge: reminderId is required');
      }
      var reminders = loadReminders();
      for (var i = 0; i < reminders.length; i++) {
        if (reminders[i].id === reminderId) {
          reminders[i].status = 'acknowledged';
          reminders[i].acknowledgedAt = now();
          saveReminders(reminders);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('[ShikeReminderEngine] acknowledge failed:', err);
      return false;
    }
  };

  /**
   * Snoozes a reminder for a given number of minutes. The reminder's
   * status becomes 'snoozed' and snoozedUntil is set to now + minutes.
   * @param {string} reminderId - The id of the reminder.
   * @param {number} minutes - Number of minutes to snooze.
   * @returns {boolean} True if the reminder was found and snoozed.
   */
  ShikeReminderEngine.snooze = function (reminderId, minutes) {
    try {
      if (!isNonEmptyString(reminderId)) {
        throw new Error('snooze: reminderId is required');
      }
      if (typeof minutes !== 'number' || minutes <= 0) {
        throw new Error('snooze: minutes must be a positive number');
      }
      var reminders = loadReminders();
      for (var i = 0; i < reminders.length; i++) {
        if (reminders[i].id === reminderId) {
          reminders[i].status = 'snoozed';
          reminders[i].snoozedUntil =
            new Date(Date.now() + minutes * 60000).toISOString();
          saveReminders(reminders);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('[ShikeReminderEngine] snooze failed:', err);
      return false;
    }
  };

  /**
   * Marks a reminder as missed. Typically called when a reminder was
   * never shown and is well past its due time.
   * @param {string} reminderId - The id of the reminder.
   * @returns {boolean} True if the reminder was found and updated.
   */
  ShikeReminderEngine.markMissed = function (reminderId) {
    try {
      if (!isNonEmptyString(reminderId)) {
        throw new Error('markMissed: reminderId is required');
      }
      var reminders = loadReminders();
      for (var i = 0; i < reminders.length; i++) {
        if (reminders[i].id === reminderId) {
          reminders[i].status = 'missed';
          saveReminders(reminders);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('[ShikeReminderEngine] markMissed failed:', err);
      return false;
    }
  };

  /**
   * Returns all reminders currently in storage.
   * @returns {Array<Object>} A shallow copy of all reminders.
   */
  ShikeReminderEngine.getAllReminders = function () {
    try {
      return loadReminders().slice();
    } catch (err) {
      console.error('[ShikeReminderEngine] getAllReminders failed:', err);
      return [];
    }
  };

  /**
   * Retrieves a single reminder by id.
   * @param {string} id - The reminder id.
   * @returns {Object|null} The reminder or null if not found.
   */
  ShikeReminderEngine.getReminder = function (id) {
    try {
      if (!isNonEmptyString(id)) {
        throw new Error('getReminder: id is required');
      }
      var reminders = loadReminders();
      for (var i = 0; i < reminders.length; i++) {
        if (reminders[i].id === id) {
          return reminders[i];
        }
      }
      return null;
    } catch (err) {
      console.error('[ShikeReminderEngine] getReminder failed:', err);
      return null;
    }
  };

  /**
   * Removes a reminder from storage.
   * @param {string} id - The reminder id.
   * @returns {boolean} True if a reminder was removed.
   */
  ShikeReminderEngine.removeReminder = function (id) {
    try {
      if (!isNonEmptyString(id)) {
        throw new Error('removeReminder: id is required');
      }
      var reminders = loadReminders();
      var initialLength = reminders.length;
      reminders = reminders.filter(function (r) {
        return r.id !== id;
      });
      if (reminders.length !== initialLength) {
        saveReminders(reminders);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[ShikeReminderEngine] removeReminder failed:', err);
      return false;
    }
  };

  /**
   * Removes duplicate reminders that reference the same record. When
   * multiple reminders share the same recordId, only the most recently
   * created one is kept (the others are discarded).
   *
   * @param {Array<Object>} [reminders] - Optional array to deduplicate.
   *   If omitted, the full persisted set is used and the result is saved.
   * @returns {Array<Object>} The deduplicated array.
   */
  ShikeReminderEngine.deduplicate = function (reminders) {
    try {
      var operatingOnPersisted = !Array.isArray(reminders);
      var source = operatingOnPersisted ? loadReminders() : reminders;
      var seen = {};
      var result = [];

      // Sort newest-first by createdAt so the latest survives dedup.
      var sorted = source.slice().sort(function (a, b) {
        var ta = parseTime(a.createdAt) || 0;
        var tb = parseTime(b.createdAt) || 0;
        return tb - ta;
      });

      for (var i = 0; i < sorted.length; i++) {
        var key = sorted[i].recordId;
        if (seen[key]) {
          continue;
        }
        seen[key] = true;
        result.push(sorted[i]);
      }

      if (operatingOnPersisted) {
        saveReminders(result);
      }
      return result;
    } catch (err) {
      console.error('[ShikeReminderEngine] deduplicate failed:', err);
      return Array.isArray(reminders) ? reminders : [];
    }
  };

  /**
   * Exposes the list of valid lifecycle states for external consumers.
   * @returns {string[]} Copy of the valid states array.
   */
  ShikeReminderEngine.getStates = function () {
    return REMINDER_STATES.slice();
  };

  // Expose on the global object.
  global.ShikeReminderEngine = ShikeReminderEngine;
})(typeof window !== 'undefined' ? window : this);
