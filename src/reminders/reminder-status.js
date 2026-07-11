/**
 * @fileoverview 时刻 Shike - Reminder Status
 *
 * Provides status tracking and reporting for reminders. Aggregates counts
 * by lifecycle state, surfaces upcoming and overdue items, and exposes
 * human-readable (Chinese) status labels.
 *
 * @version 2.0.0-rc4
 * @module ShikeReminderStatus
 */
(function (global) {
  'use strict';

  /**
   * localStorage key for the last reminder-check timestamp.
   * @type {string}
   * @constant
   */
  var LAST_CHECK_KEY = 'shike_last_reminder_check';

  /**
   * The set of tracked statuses, in canonical order.
   * @type {string[]}
   * @constant
   */
  var STATUSES = [
    'scheduled',
    'due',
    'shown',
    'acknowledged',
    'snoozed',
    'missed',
    'failed'
  ];

  /**
   * Human-readable (Chinese) labels for each status.
   * @type {Object<string, string>}
   * @constant
   */
  var STATUS_LABELS = {
    scheduled: '已安排',
    due: '已到期',
    shown: '已显示',
    acknowledged: '已确认',
    snoozed: '已稍后',
    missed: '已错过',
    failed: '失败'
  };

  /**
   * Returns all reminders from the engine. Falls back to an empty array
   * if the engine is not available.
   * @returns {Array<Object>} All reminders.
   * @private
   */
  function getReminders() {
    try {
      var engine = global.ShikeReminderEngine;
      if (engine && typeof engine.getAllReminders === 'function') {
        return engine.getAllReminders();
      }
      return [];
    } catch (err) {
      console.error('[ShikeReminderStatus] getReminders failed:', err);
      return [];
    }
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
   * The reminder status public API.
   * @namespace ShikeReminderStatus
   */
  var ShikeReminderStatus = {};

  /**
   * Builds a summary object containing the total count plus the count of
   * reminders in each lifecycle state.
   *
   * @returns {Object} A summary object:
   *   {total, scheduled, due, shown, acknowledged, snoozed, missed, failed}
   */
  ShikeReminderStatus.getStatusSummary = function () {
    var summary = {
      total: 0,
      scheduled: 0,
      due: 0,
      shown: 0,
      acknowledged: 0,
      snoozed: 0,
      missed: 0,
      failed: 0
    };
    try {
      var reminders = getReminders();
      summary.total = reminders.length;
      for (var i = 0; i < reminders.length; i++) {
        var s = reminders[i].status;
        if (summary.hasOwnProperty(s) && typeof summary[s] === 'number') {
          summary[s]++;
        }
      }
    } catch (err) {
      console.error('[ShikeReminderStatus] getStatusSummary failed:', err);
    }
    return summary;
  };

  /**
   * Returns the next N upcoming reminders - those still scheduled and not
   * yet due - sorted by ascending due time.
   *
   * @param {number} [limit=5] - Maximum number of upcoming reminders.
   * @returns {Array<Object>} Upcoming reminders.
   */
  ShikeReminderStatus.getUpcoming = function (limit) {
    try {
      var max = (typeof limit === 'number' && limit > 0) ? limit : 5;
      var reminders = getReminders();
      var upcoming = reminders.filter(function (r) {
        return r.status === 'scheduled';
      });
      upcoming.sort(function (a, b) {
        var ta = parseTime(a.dueTime) || 0;
        var tb = parseTime(b.dueTime) || 0;
        return ta - tb;
      });
      return upcoming.slice(0, max);
    } catch (err) {
      console.error('[ShikeReminderStatus] getUpcoming failed:', err);
      return [];
    }
  };

  /**
   * Returns all overdue or missed reminders. A reminder is considered
   * overdue if its status is 'due' or 'missed', or if it is 'scheduled'
   * but past its due time.
   *
   * @returns {Array<Object>} Overdue/missed reminders.
   */
  ShikeReminderStatus.getOverdue = function () {
    try {
      var reminders = getReminders();
      var nowMs = Date.now();
      var overdue = reminders.filter(function (r) {
        if (r.status === 'missed' || r.status === 'due') {
          return true;
        }
        if (r.status === 'scheduled') {
          var t = parseTime(r.dueTime);
          return !isNaN(t) && t < nowMs;
        }
        return false;
      });
      overdue.sort(function (a, b) {
        var ta = parseTime(a.dueTime) || 0;
        var tb = parseTime(b.dueTime) || 0;
        return ta - tb;
      });
      return overdue;
    } catch (err) {
      console.error('[ShikeReminderStatus] getOverdue failed:', err);
      return [];
    }
  };

  /**
   * Returns the timestamp of the last reminder check, if recorded.
   * @returns {string|null} ISO timestamp or null.
   */
  ShikeReminderStatus.getLastCheck = function () {
    try {
      if (global.localStorage) {
        return global.localStorage.getItem(LAST_CHECK_KEY);
      }
      return null;
    } catch (err) {
      console.error('[ShikeReminderStatus] getLastCheck failed:', err);
      return null;
    }
  };

  /**
   * Records the last-check timestamp.
   * @param {string|number|Date} timestamp - The timestamp to store.
   * @returns {boolean} True if stored successfully.
   */
  ShikeReminderStatus.setLastCheck = function (timestamp) {
    try {
      if (timestamp === undefined || timestamp === null) {
        throw new Error('setLastCheck: timestamp is required');
      }
      var iso;
      if (timestamp instanceof Date) {
        iso = timestamp.toISOString();
      } else if (typeof timestamp === 'number') {
        iso = new Date(timestamp).toISOString();
      } else {
        iso = String(timestamp);
      }
      if (global.localStorage) {
        global.localStorage.setItem(LAST_CHECK_KEY, iso);
      }
      return true;
    } catch (err) {
      console.error('[ShikeReminderStatus] setLastCheck failed:', err);
      return false;
    }
  };

  /**
   * Converts a machine status code into a human-readable label.
   * @param {string} status - The status code.
   * @returns {string} The Chinese label, or the raw status if unknown.
   */
  ShikeReminderStatus.formatStatus = function (status) {
    try {
      if (STATUS_LABELS.hasOwnProperty(status)) {
        return STATUS_LABELS[status];
      }
      return (status !== undefined && status !== null) ? String(status) : '';
    } catch (err) {
      console.error('[ShikeReminderStatus] formatStatus failed:', err);
      return '';
    }
  };

  /**
   * Returns the full status-to-label mapping for external consumers.
   * @returns {Object<string, string>} A copy of the labels map.
   */
  ShikeReminderStatus.getLabels = function () {
    var copy = {};
    var keys = Object.keys(STATUS_LABELS);
    for (var i = 0; i < keys.length; i++) {
      copy[keys[i]] = STATUS_LABELS[keys[i]];
    }
    return copy;
  };

  /**
   * Returns the canonical list of statuses.
   * @returns {string[]} Copy of the statuses array.
   */
  ShikeReminderStatus.getStatuses = function () {
    return STATUSES.slice();
  };

  // Expose on the global object.
  global.ShikeReminderStatus = ShikeReminderStatus;
})(typeof window !== 'undefined' ? window : this);
