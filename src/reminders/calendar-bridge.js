/**
 * @fileoverview 时刻 Shike - Calendar Bridge
 *
 * Generates RFC 5545 compliant ICS (iCalendar) strings for Shike records and
 * provides helpers to download or share them. Supports timed and all-day
 * events, recurring records (RRULE), timezone handling, and per-event
 * VALARM reminders that fire 15 minutes before the start.
 *
 * @version 2.0.0-rc4
 * @module ShikeCalendarBridge
 */
(function (global) {
  'use strict';

  /**
   * Product identifier embedded in every generated calendar.
   * @type {string}
   * @constant
   */
  var PROD_ID = '-//Shike//时刻 Web//2.0.0-rc4//ZH';

  /**
   * Number of minutes before the event start at which the VALARM fires.
   * @type {number}
   * @constant
   */
  var ALARM_TRIGGER_MINUTES = 15;

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
   * Escapes special characters in a text value per RFC 5545 rules so the
   * value is safe to embed inside an ICS property.
   * @param {string} text - The raw text.
   * @returns {string} The escaped text.
   * @private
   */
  function escapeICS(text) {
    if (text === undefined || text === null) {
      return '';
    }
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  /**
   * Pads a number to two digits with a leading zero.
   * @param {number} n - The number to pad.
   * @returns {string} The padded string.
   * @private
   */
  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  /**
   * Formats a Date as an ICS UTC timestamp: YYYYMMDDTHHMMSSZ.
   * @param {Date} date - The date to format.
   * @returns {string} The formatted timestamp.
   * @private
   */
  function formatUTC(date) {
    return date.getUTCFullYear().toString() +
      pad2(date.getUTCMonth() + 1) +
      pad2(date.getUTCDate()) + 'T' +
      pad2(date.getUTCHours()) +
      pad2(date.getUTCMinutes()) +
      pad2(date.getUTCSeconds()) + 'Z';
  }

  /**
   * Formats a Date as an ICS local "floating" timestamp:
   * YYYYMMDDTHHMMSS (no Z suffix).
   * @param {Date} date - The date to format.
   * @returns {string} The formatted timestamp.
   * @private
   */
  function formatLocal(date) {
    return date.getFullYear().toString() +
      pad2(date.getMonth() + 1) +
      pad2(date.getDate()) + 'T' +
      pad2(date.getHours()) +
      pad2(date.getMinutes()) +
      pad2(date.getSeconds());
  }

  /**
   * Formats a Date as an ICS date-only value: YYYYMMDD.
   * @param {Date} date - The date to format.
   * @returns {string} The formatted date.
   * @private
   */
  function formatDateOnly(date) {
    return date.getFullYear().toString() +
      pad2(date.getMonth() + 1) +
      pad2(date.getDate());
  }

  /**
   * Returns the local timezone offset as an ICS UTC-OFFSET string, e.g.
   * +0800 or -0500. Used for TZID-based timezone handling.
   * @param {Date} date - The date whose offset to use.
   * @returns {string} The offset string.
   * @private
   */
  function getUTCOffset(date) {
    var offsetMin = -date.getTimezoneOffset();
    var sign = offsetMin >= 0 ? '+' : '-';
    var abs = Math.abs(offsetMin);
    return sign + pad2(Math.floor(abs / 60)) + pad2(abs % 60);
  }

  /**
   * Builds the standard VTIMEZONE block for the local timezone. This is
   * a simplified single-rule block that embeds the current offset, which
   * is sufficient for the majority of use cases.
   * @param {Date} date - A reference date for the offset.
   * @returns {string} The VTIMEZONE block.
   * @private
   */
  function buildVTimezone(date) {
    var offset = getUTCOffset(date);
    return [
      'BEGIN:VTIMEZONE',
      'TZID:Local',
      'BEGIN:STANDARD',
      'DTSTART:19700101T000000',
      'TZOFFSETFROM:' + offset,
      'TZOFFSETTO:' + offset,
      'END:STANDARD',
      'END:VTIMEZONE'
    ].join('\r\n');
  }

  /**
   * Coerces a record's due time into a Date object.
   * @param {string|Date} value - The due time.
   * @returns {Date} A Date instance.
   * @private
   */
  function toDate(value) {
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    return new Date(value);
  }

  /**
   * Builds the RRULE line for a recurring record, if the record specifies
   * repeat rules.
   * @param {Object} record - The source record.
   * @returns {string|null} The RRULE line, or null if not recurring.
   * @private
   */
  function buildRRule(record) {
    try {
      var freq = record.repeatFrequency || record.frequency;
      if (!isNonEmptyString(freq)) {
        return null;
      }
      var f = freq.toUpperCase();
      var validFreq = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
      if (validFreq.indexOf(f) === -1) {
        return null;
      }
      var parts = ['RRULE:FREQ=' + f];
      if (record.repeatInterval && record.repeatInterval > 1) {
        parts.push('INTERVAL=' + record.repeatInterval);
      }
      if (record.repeatCount && record.repeatCount > 0) {
        parts.push('COUNT=' + record.repeatCount);
      } else if (isNonEmptyString(record.repeatUntil)) {
        var until = toDate(record.repeatUntil);
        if (!isNaN(until.getTime())) {
          parts.push('UNTIL=' + formatUTC(until));
        }
      }
      return parts.join(';');
    } catch (err) {
      console.error('[ShikeCalendarBridge] buildRRule failed:', err);
      return null;
    }
  }

  /**
   * Builds the VALARM block for a single event.
   * @returns {string} The VALARM block.
   * @private
   */
  function buildValarm() {
    return [
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'TRIGGER:-PT' + ALARM_TRIGGER_MINUTES + 'M',
      'END:VALARM'
    ].join('\r\n');
  }

  /**
   * Returns the canonical UID for a record.
   * @param {string} recordId - The record id.
   * @returns {string} The UID.
   * @private
   */
  function buildUid(recordId) {
    return 'shike-' + recordId + '@shike.app';
  }

  /**
   * The calendar bridge public API.
   * @namespace ShikeCalendarBridge
   */
  var ShikeCalendarBridge = {};

  /**
   * Generates an ICS string for a single record event.
   *
   * @param {Object} record - The source record.
   * @param {string} record.recordId - Unique record id.
   * @param {string} record.title - Event summary.
   * @param {string|Date} record.dueTime - Event start time.
   * @param {number} [record.durationMinutes=60] - Event duration in minutes.
   * @param {string} [record.description] - Event description.
   * @param {string} [record.location] - Event location.
   * @param {boolean} [record.allDay=false] - Whether this is an all-day event.
   * @param {string} [record.repeatFrequency] - 'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'.
   * @param {number} [record.repeatInterval] - Repeat interval.
   * @param {number} [record.repeatCount] - Number of occurrences.
   * @param {string|Date} [record.repeatUntil] - Repeat end date.
   * @returns {string} A complete VCALENDAR ICS string.
   */
  ShikeCalendarBridge.generateICS = function (record) {
    try {
      if (!record || typeof record !== 'object') {
        throw new Error('generateICS: record must be a non-null object');
      }
      if (!isNonEmptyString(record.recordId)) {
        throw new Error('generateICS: record.recordId is required');
      }

      var start = toDate(record.dueTime);
      if (isNaN(start.getTime())) {
        throw new Error('generateICS: record.dueTime must be a valid date');
      }

      var allDay = record.allDay === true;
      var durationMin = (typeof record.durationMinutes === 'number' &&
        record.durationMinutes > 0) ? record.durationMinutes : 60;
      var end = new Date(start.getTime() + durationMin * 60000);
      var uid = buildUid(record.recordId);
      var nowStamp = formatUTC(new Date());

      var lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:' + PROD_ID,
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];

      // Include the local VTIMEZONE so TZID references resolve correctly.
      lines.push(buildVTimezone(start));

      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + uid);
      lines.push('DTSTAMP:' + nowStamp);

      if (allDay) {
        lines.push('DTSTART;VALUE=DATE:' + formatDateOnly(start));
        // All-day events end on the following day by convention.
        var dayAfter = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        lines.push('DTEND;VALUE=DATE:' + formatDateOnly(dayAfter));
      } else {
        lines.push('DTSTART;TZID=Local:' + formatLocal(start));
        lines.push('DTEND;TZID=Local:' + formatLocal(end));
      }

      lines.push('SUMMARY:' + escapeICS(record.title || '时刻提醒'));
      if (isNonEmptyString(record.description)) {
        lines.push('DESCRIPTION:' + escapeICS(record.description));
      }
      if (isNonEmptyString(record.location)) {
        lines.push('LOCATION:' + escapeICS(record.location));
      }

      var rrule = buildRRule(record);
      if (rrule) {
        lines.push(rrule);
      }

      lines.push('STATUS:CONFIRMED');
      lines.push(buildValarm());
      lines.push('END:VEVENT');
      lines.push('END:VCALENDAR');

      return lines.join('\r\n');
    } catch (err) {
      console.error('[ShikeCalendarBridge] generateICS failed:', err);
      return '';
    }
  };

  /**
   * Generates a single ICS string containing VEVENTs for all future
   * records. Records whose due time has already passed are skipped.
   *
   * @param {Array<Object>} records - The records to include.
   * @returns {string} A complete VCALENDAR ICS string with all events.
   */
  ShikeCalendarBridge.generateAllICS = function (records) {
    try {
      if (!Array.isArray(records)) {
        throw new Error('generateAllICS: records must be an array');
      }

      var nowMs = Date.now();
      var lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:' + PROD_ID,
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];

      // Emit one VTIMEZONE block (all events share the local zone).
      if (records.length > 0) {
        lines.push(buildVTimezone(new Date()));
      }

      for (var i = 0; i < records.length; i++) {
        var record = records[i];
        try {
          if (!record || !isNonEmptyString(record.recordId)) {
            continue;
          }
          var start = toDate(record.dueTime);
          if (isNaN(start.getTime())) {
            continue;
          }
          // Skip past events unless they are recurring.
          var isRecurring = isNonEmptyString(record.repeatFrequency) ||
            isNonEmptyString(record.frequency);
          if (start.getTime() < nowMs && !isRecurring) {
            continue;
          }

          var allDay = record.allDay === true;
          var durationMin = (typeof record.durationMinutes === 'number' &&
            record.durationMinutes > 0) ? record.durationMinutes : 60;
          var end = new Date(start.getTime() + durationMin * 60000);
          var uid = buildUid(record.recordId);

          lines.push('BEGIN:VEVENT');
          lines.push('UID:' + uid);
          lines.push('DTSTAMP:' + formatUTC(new Date()));

          if (allDay) {
            lines.push('DTSTART;VALUE=DATE:' + formatDateOnly(start));
            var dayAfter = new Date(start.getTime() + 24 * 60 * 60 * 1000);
            lines.push('DTEND;VALUE=DATE:' + formatDateOnly(dayAfter));
          } else {
            lines.push('DTSTART;TZID=Local:' + formatLocal(start));
            lines.push('DTEND;TZID=Local:' + formatLocal(end));
          }

          lines.push('SUMMARY:' + escapeICS(record.title || '时刻提醒'));
          if (isNonEmptyString(record.description)) {
            lines.push('DESCRIPTION:' + escapeICS(record.description));
          }
          if (isNonEmptyString(record.location)) {
            lines.push('LOCATION:' + escapeICS(record.location));
          }

          var rrule = buildRRule(record);
          if (rrule) {
            lines.push(rrule);
          }

          lines.push('STATUS:CONFIRMED');
          lines.push(buildValarm());
          lines.push('END:VEVENT');
        } catch (eventErr) {
          console.error('[ShikeCalendarBridge] Skipped record in generateAllICS:',
            eventErr);
        }
      }

      lines.push('END:VCALENDAR');
      return lines.join('\r\n');
    } catch (err) {
      console.error('[ShikeCalendarBridge] generateAllICS failed:', err);
      return '';
    }
  };

  /**
   * Generates a CANCEL ICS string for a deleted record so that calendar
   * clients can remove the corresponding event.
   *
   * @param {Object} record - The deleted record.
   * @param {string} record.recordId - The record id.
   * @param {string} [record.title] - The event summary.
   * @param {string|Date} [record.dueTime] - The original start time.
   * @returns {string} A complete VCALENDAR ICS string with METHOD:CANCEL.
   */
  ShikeCalendarBridge.generateCancelICS = function (record) {
    try {
      if (!record || typeof record !== 'object') {
        throw new Error('generateCancelICS: record must be a non-null object');
      }
      if (!isNonEmptyString(record.recordId)) {
        throw new Error('generateCancelICS: record.recordId is required');
      }

      var uid = buildUid(record.recordId);
      var nowStamp = formatUTC(new Date());

      var lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:' + PROD_ID,
        'CALSCALE:GREGORIAN',
        'METHOD:CANCEL'
      ];

      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + uid);
      lines.push('DTSTAMP:' + nowStamp);

      if (record.dueTime) {
        var start = toDate(record.dueTime);
        if (!isNaN(start.getTime())) {
          if (record.allDay === true) {
            lines.push('DTSTART;VALUE=DATE:' + formatDateOnly(start));
          } else {
            lines.push('DTSTART;TZID=Local:' + formatLocal(start));
          }
        }
      }

      lines.push('SUMMARY:' + escapeICS(record.title || '时刻提醒'));
      lines.push('STATUS:CANCELLED');
      lines.push('END:VEVENT');
      lines.push('END:VCALENDAR');

      return lines.join('\r\n');
    } catch (err) {
      console.error('[ShikeCalendarBridge] generateCancelICS failed:', err);
      return '';
    }
  };

  /**
   * Triggers a file download of the given ICS string by creating a Blob
   * and using URL.createObjectURL.
   *
   * @param {string} icsString - The ICS content.
   * @param {string} [filename='shike-export.ics'] - The download file name.
   * @returns {boolean} True if the download was triggered.
   */
  ShikeCalendarBridge.downloadICS = function (icsString, filename) {
    try {
      if (!isNonEmptyString(icsString)) {
        throw new Error('downloadICS: icsString is required');
      }
      var name = isNonEmptyString(filename) ? filename : 'shike-export.ics';
      if (name.slice(-4).toLowerCase() !== '.ics') {
        name = name + '.ics';
      }

      var blob = new global.Blob([icsString], {
        type: 'text/calendar;charset=utf-8'
      });
      var url = global.URL.createObjectURL(blob);

      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Revoke the object URL after a short delay to allow the download
      // to begin.
      setTimeout(function () {
        try {
          global.URL.revokeObjectURL(url);
        } catch (e) {
          /* ignore */
        }
      }, 1000);

      return true;
    } catch (err) {
      console.error('[ShikeCalendarBridge] downloadICS failed:', err);
      return false;
    }
  };

  /**
   * Shares the ICS string using the Web Share API if available, falling
   * back to a regular download when sharing is not supported.
   *
   * @param {string} icsString - The ICS content.
   * @param {string} [filename='shike-export.ics'] - Fallback download name.
   * @returns {Promise<boolean>} Resolves true if shared or downloaded.
   */
  ShikeCalendarBridge.shareICS = function (icsString, filename) {
    return new Promise(function (resolve) {
      try {
        if (!isNonEmptyString(icsString)) {
          throw new Error('shareICS: icsString is required');
        }
        var name = isNonEmptyString(filename) ? filename : 'shike-export.ics';
        if (name.slice(-4).toLowerCase() !== '.ics') {
          name = name + '.ics';
        }

        var navigator = global.navigator || {};
        if (typeof navigator.share === 'function') {
          var blob = new global.Blob([icsString], {
            type: 'text/calendar;charset=utf-8'
          });
          var file;
          try {
            file = new global.File([blob], name, {
              type: 'text/calendar;charset=utf-8'
            });
          } catch (fileErr) {
            // Some browsers don't support the File constructor with a Blob;
            // fall back to text sharing.
          }

          var shareData = file
            ? { files: [file], title: '时刻提醒', text: icsString }
            : { title: '时刻提醒', text: icsString };

          navigator.share(shareData).then(function () {
            resolve(true);
          })['catch'](function (shareErr) {
            // If sharing was cancelled or failed, fall back to download.
            var downloaded = ShikeCalendarBridge.downloadICS(icsString, name);
            resolve(downloaded);
          });
        } else {
          // Web Share API unavailable - download instead.
          var downloaded = ShikeCalendarBridge.downloadICS(icsString, name);
          resolve(downloaded);
        }
      } catch (err) {
        console.error('[ShikeCalendarBridge] shareICS failed:', err);
        // Last-resort fallback to download.
        try {
          var downloaded = ShikeCalendarBridge.downloadICS(
            icsString, filename);
          resolve(downloaded);
        } catch (e) {
          resolve(false);
        }
      }
    });
  };

  // Expose on the global object.
  global.ShikeCalendarBridge = ShikeCalendarBridge;
})(typeof window !== 'undefined' ? window : this);
