/**
 * Shike Dangerous Actions Module
 * v2.0.0-rc3 - Data Safety Phase
 *
 * Classifies risky operations for "时刻 Shike" and enforces a graduated
 * confirmation strategy before they are allowed to run:
 *
 *   LOW          - single window.confirm()
 *   MEDIUM       - window.confirm() with an impact description
 *   HIGH         - double window.confirm() (or a typed confirmation word)
 *   IRREVERSIBLE - double confirm + automatic snapshot via
 *                  ShikeSnapshotService.createSnapshot() + 5s cooldown before
 *                  the same irreversible action may be approved again
 *
 * Pre-registered actions cover the common destructive operations of the app.
 * Additional actions can be registered at runtime via register().
 *
 * Prototype-pollution protection: the internal registries use null-prototype
 * objects and every action name / options object is validated before use.
 *
 * Note on IRREVERSIBLE snapshots: by default an irreversible action is refused
 * if a snapshot cannot be created (service missing or it throws/rejects), so a
 * recovery point always exists before any irreversible change. Callers may pass
 * { requireSnapshot: false } to override this in environments without a
 * snapshot service.
 *
 * Global: window.ShikeDangerousActions
 */
(function (global) {
  'use strict';

  /** @enum {string} Risk level constants. */
  var LEVELS = Object.freeze({
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    IRREVERSIBLE: 'IRREVERSIBLE'
  });

  /** @private {number} Cooldown applied after an irreversible action is approved. */
  var IRREVERSIBLE_COOLDOWN_MS = 5000;

  /** @private {number} Max accepted action-name length. */
  var MAX_NAME_LENGTH = 128;

  /*
   * Internal registries use Object.create(null) so that assigning a key named
   * "__proto__" can never mutate the registry's prototype (prototype pollution).
   */
  /** @private {Object<string, {name,level,description,requiresSnapshot}>} */
  var registry = Object.create(null);
  /** @private {Object<string, number>} timestamp of last irreversible approval. */
  var lastConfirmedAt = Object.create(null);
  /** @private {Object<string, boolean>} in-flight snapshot guard per action. */
  var snapshotInFlight = Object.create(null);

  /* ----------------------------------------------------------------------- */
  /* Validation helpers                                                      */
  /* ----------------------------------------------------------------------- */

  /**
   * Names that must never be used as registry keys (prototype pollution).
   * @private
   * @param {string} name
   * @returns {boolean}
   */
  function isReservedName(name) {
    return name === '__proto__' || name === 'constructor' || name === 'prototype';
  }

  /**
   * @private
   * @param {string} level
   * @returns {boolean}
   */
  function isValidLevel(level) {
    return level === LEVELS.LOW ||
      level === LEVELS.MEDIUM ||
      level === LEVELS.HIGH ||
      level === LEVELS.IRREVERSIBLE;
  }

  /**
   * Validate and shallow-copy a caller-supplied options object, stripping any
   * forbidden (prototype-pollution) keys and rejecting non-plain inputs.
   * @private
   * @param {*} options
   * @returns {Object} a clean options object (never the caller's reference).
   */
  function sanitizeOptions(options) {
    if (options === null || typeof options !== 'object') {
      return {};
    }
    var proto = Object.getPrototypeOf(options);
    if (proto !== Object.prototype && proto !== null) {
      return {};
    }
    var keys = Object.keys(options);
    var out = {};
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (isReservedName(key)) {
        continue; // drop pollution payloads silently
      }
      out[key] = options[key];
    }
    return out;
  }

  /**
   * Resolve an action reference (string or {name}) to its name.
   * @private
   * @param {string|{name:string}} action
   * @returns {string|null}
   */
  function resolveName(action) {
    if (typeof action === 'string') {
      return action;
    }
    if (action && typeof action === 'object' && typeof action.name === 'string') {
      return action.name;
    }
    return null;
  }

  /**
   * Look up a registered action entry safely.
   * @private
   * @param {string} name
   * @returns {Object|null}
   */
  function getEntry(name) {
    if (typeof name !== 'string' || name.length === 0 || isReservedName(name)) {
      return null;
    }
    var entry = registry[name];
    return entry || null;
  }

  /* ----------------------------------------------------------------------- */
  /* Dialog helpers                                                          */
  /* ----------------------------------------------------------------------- */

  /**
   * Wrap window.confirm so a broken/missing implementation never throws.
   * @private
   * @param {string} message
   * @returns {boolean}
   */
  function safeConfirm(message) {
    if (typeof global.confirm === 'function') {
      try {
        return !!global.confirm(message);
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  /**
   * Wrap window.prompt the same way.
   * @private
   * @param {string} message
   * @returns {string|null}
   */
  function safePrompt(message) {
    if (typeof global.prompt === 'function') {
      try {
        return global.prompt(message);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /* ----------------------------------------------------------------------- */
  /* Snapshot helper                                                         */
  /* ----------------------------------------------------------------------- */

  /**
   * Attempt to create an automatic recovery snapshot via the global
   * ShikeSnapshotService. Supports both sync and promise-returning services.
   * @private
   * @returns {Promise<{ok: boolean, reason: string}>}
   */
  async function createSnapshotSafe() {
    var svc = global.ShikeSnapshotService;
    if (!svc || typeof svc.createSnapshot !== 'function') {
      return { ok: false, reason: 'NO_SERVICE' };
    }
    var result;
    try {
      result = svc.createSnapshot();
    } catch (e) {
      return { ok: false, reason: 'THREW' };
    }
    if (result && typeof result.then === 'function') {
      try {
        await result;
      } catch (e) {
        return { ok: false, reason: 'REJECTED' };
      }
    }
    return { ok: true };
  }

  /* ----------------------------------------------------------------------- */
  /* Public API                                                              */
  /* ----------------------------------------------------------------------- */

  /**
   * Register (or replace) a dangerous action and its risk profile.
   *
   * @param {string} actionName - unique key for the action.
   * @param {string} level - one of LEVELS.LOW|MEDIUM|HIGH|IRREVERSIBLE.
   * @param {string} [description] - human-readable description / impact text.
   * @param {boolean} [requiresSnapshot=false] - hint that a snapshot is desired
   *   (IRREVERSIBLE actions always snapshot regardless of this flag).
   * @returns {{name:string,level:string,description:string,requiresSnapshot:boolean}}
   *   the stored entry (a copy of it).
   * @throws {Error} INVALID_ACTION_NAME | RESERVED_ACTION_NAME | INVALID_RISK_LEVEL
   */
  function register(actionName, level, description, requiresSnapshot) {
    if (typeof actionName !== 'string' || actionName.length === 0 ||
        actionName.length > MAX_NAME_LENGTH) {
      throw new Error('INVALID_ACTION_NAME');
    }
    if (isReservedName(actionName)) {
      throw new Error('RESERVED_ACTION_NAME');
    }
    if (!isValidLevel(level)) {
      throw new Error('INVALID_RISK_LEVEL');
    }
    var desc = typeof description === 'string' ? description : '';
    var snap = requiresSnapshot === true;
    registry[actionName] = {
      name: actionName,
      level: level,
      description: desc,
      requiresSnapshot: snap
    };
    return {
      name: actionName,
      level: level,
      description: desc,
      requiresSnapshot: snap
    };
  }

  /**
   * Classify a registered action.
   *
   * @param {string|{name:string}} action - action name or descriptor.
   * @returns {{level:string, requiresSnapshot:boolean, cooldownMs:number}}
   * @throws {Error} INVALID_ACTION | UNKNOWN_ACTION
   */
  function classify(action) {
    var name = resolveName(action);
    if (!name) {
      throw new Error('INVALID_ACTION');
    }
    var entry = getEntry(name);
    if (!entry) {
      throw new Error('UNKNOWN_ACTION');
    }
    var requiresSnapshot = entry.requiresSnapshot ||
      entry.level === LEVELS.IRREVERSIBLE;
    var cooldownMs = entry.level === LEVELS.IRREVERSIBLE
      ? IRREVERSIBLE_COOLDOWN_MS
      : 0;
    return {
      level: entry.level,
      requiresSnapshot: requiresSnapshot,
      cooldownMs: cooldownMs
    };
  }

  /**
   * Return a shallow copy of every registered action.
   * @returns {Array<{name:string,level:string,description:string,requiresSnapshot:boolean}>}
   */
  function getActionList() {
    var list = [];
    var names = Object.keys(registry); // own keys only (null proto safe)
    for (var i = 0; i < names.length; i++) {
      var e = registry[names[i]];
      list.push({
        name: e.name,
        level: e.level,
        description: e.description,
        requiresSnapshot: e.requiresSnapshot
      });
    }
    return list;
  }

  /**
   * Prompt the user to confirm a dangerous action according to its level.
   *
   * Options (all optional):
   *   - message {string}        override the primary confirm message.
   *   - impact {string}         MEDIUM impact text appended to the prompt.
   *   - confirmationWord {string} HIGH typed-word confirmation (alternative to
   *                              the second confirm dialog).
   *   - secondMessage {string}  override the second (HIGH / IRREVERSIBLE) prompt.
   *   - requireSnapshot {boolean} for IRREVERSIBLE, default true; set false to
   *                              allow approval when no snapshot service exists.
   *
   * @param {string|{name:string}} action
   * @param {Object} [options]
   * @returns {Promise<boolean>} true only if the user completed every required
   *   confirmation step (and, for IRREVERSIBLE, a snapshot was created).
   */
  async function confirm(action, options) {
    var name = resolveName(action);
    if (!name) {
      return false;
    }

    var opts = sanitizeOptions(options);
    var entry = getEntry(name);

    // Unknown action: fall back to a conservative single confirm.
    if (!entry) {
      var fallbackMsg = opts.message ||
        'Are you sure you want to perform this action?';
      return safeConfirm(fallbackMsg);
    }

    var level = entry.level;
    var message = (typeof opts.message === 'string' && opts.message.length > 0)
      ? opts.message
      : (entry.description || ('Confirm action: ' + name));

    /* ----- IRREVERSIBLE cooldown gate (checked before any dialog) ------ */
    if (level === LEVELS.IRREVERSIBLE) {
      var now = Date.now();
      var last = lastConfirmedAt[name] || 0;
      if (last && (now - last) < IRREVERSIBLE_COOLDOWN_MS) {
        // Still cooling down from a previous approval.
        return false;
      }
      if (snapshotInFlight[name]) {
        // A snapshot for this action is already being created.
        return false;
      }
    }

    /* ----- LOW: single confirm ---------------------------------------- */
    if (level === LEVELS.LOW) {
      return safeConfirm(message);
    }

    /* ----- MEDIUM: confirm with impact description -------------------- */
    if (level === LEVELS.MEDIUM) {
      var impact = (typeof opts.impact === 'string' && opts.impact.length > 0)
        ? opts.impact
        : entry.description;
      var mediumMsg = (impact && impact !== message)
        ? (message + '\n\nImpact: ' + impact)
        : message;
      return safeConfirm(mediumMsg);
    }

    /* ----- HIGH: double confirm OR typed confirmation word ------------ */
    if (level === LEVELS.HIGH) {
      if (!safeConfirm(message)) {
        return false;
      }
      var word = (typeof opts.confirmationWord === 'string' &&
                  opts.confirmationWord.length > 0)
        ? opts.confirmationWord
        : null;
      if (word) {
        var typed = safePrompt('To confirm, please type: ' + word);
        return typed === word;
      }
      var highSecond = (typeof opts.secondMessage === 'string' &&
                        opts.secondMessage.length > 0)
        ? opts.secondMessage
        : 'This is a high-risk action. Please confirm again to proceed.';
      return safeConfirm(highSecond);
    }

    /* ----- IRREVERSIBLE: double confirm + auto snapshot + cooldown ---- */
    if (level === LEVELS.IRREVERSIBLE) {
      if (!safeConfirm(message)) {
        return false;
      }
      var irrSecond = (typeof opts.secondMessage === 'string' &&
                       opts.secondMessage.length > 0)
        ? opts.secondMessage
        : 'WARNING: this action is IRREVERSIBLE. An automatic snapshot will ' +
          'be created before proceeding. Continue?';
      if (!safeConfirm(irrSecond)) {
        return false;
      }

      var requireSnapshot = opts.requireSnapshot !== false; // default true
      if (requireSnapshot) {
        snapshotInFlight[name] = true;
        var snap = await createSnapshotSafe();
        snapshotInFlight[name] = false;
        if (!snap.ok) {
          // No recovery point available -> refuse the irreversible action.
          return false;
        }
      }

      lastConfirmedAt[name] = Date.now();
      return true;
    }

    // Unreachable: level is validated at registration time.
    return false;
  }

  /* ----------------------------------------------------------------------- */
  /* Pre-registered actions                                                  */
  /* ----------------------------------------------------------------------- */

  register('delete_record', LEVELS.MEDIUM, 'Delete the selected record', false);
  register('batch_delete', LEVELS.HIGH, 'Delete multiple records at once', false);
  register('clear_all_data', LEVELS.IRREVERSIBLE, 'Permanently delete all data', true);
  register('empty_trash', LEVELS.HIGH, 'Permanently empty the trash', false);
  register('overwrite_import', LEVELS.HIGH, 'Overwrite current data with imported data', false);
  register('reset_app', LEVELS.IRREVERSIBLE, 'Reset the application to its initial state', true);
  register('delete_rss', LEVELS.LOW, 'Delete an RSS subscription', false);
  register('clear_conversation', LEVELS.LOW, 'Clear the current conversation', false);
  register('clear_context', LEVELS.LOW, 'Clear the current context', false);
  register('clear_search_cache', LEVELS.LOW, 'Clear the search cache', false);
  register('reset_sprite', LEVELS.MEDIUM, 'Reset the sprite to its default state', false);
  register('clear_all_settings', LEVELS.HIGH, 'Clear all application settings', false);

  /* ----------------------------------------------------------------------- */
  /* Export                                                                  */
  /* ----------------------------------------------------------------------- */

  /**
   * @namespace ShikeDangerousActions
   * @property {Object} LEVELS - risk-level constants.
   * @property {function(string|object):Object} classify
   * @property {function(string|object, object=):Promise<boolean>} confirm
   * @property {function():Array} getActionList
   * @property {function(string, string, string=, boolean=):Object} register
   */
  var api = Object.freeze({
    LEVELS: LEVELS,
    classify: classify,
    confirm: confirm,
    getActionList: getActionList,
    register: register
  });

  global.ShikeDangerousActions = api;
})(typeof window !== 'undefined' ? window : this);
