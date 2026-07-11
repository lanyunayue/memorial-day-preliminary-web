/**
 * sync-conflict.js
 * 时刻 Shike — v2.0.0-rc5 Optional Sync Beta
 *
 * Conflict detection and resolution for sync operations.
 *
 * Design principles:
 *   - Never silently overwrite user data.
 *   - `last-write-wins` is only permitted for a curated set of "safe"
 *     fields (title, notes, tags).  For all other fields an explicit
 *     strategy must be chosen.
 *   - Delete-edit conflicts always require explicit resolution — a
 *     deleted item that was concurrently edited is never silently
 *     dropped or resurrected.
 *
 * @module  ShikeSyncConflict
 * @global  window.ShikeSyncConflict
 */

(function (global) {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Constants
     * ------------------------------------------------------------------ */

    /** Fields where `last-write-wins` is considered safe. */
    var SAFE_FIELDS = ['title', 'notes', 'tags'];

    /* ------------------------------------------------------------------ *
     * Internal helpers
     * ------------------------------------------------------------------ */

    /**
     * Checks whether a field is in the safe-fields whitelist.
     *
     * @param {string} fieldName - The field name to check.
     * @returns {boolean} `true` when the field is safe for LWW.
     */
    function isSafeField(fieldName) {
        return SAFE_FIELDS.indexOf(fieldName) !== -1;
    }

    /**
     * Shallow-copies an object (used to avoid mutating input operations).
     *
     * @param {Object} obj - The object to copy.
     * @returns {Object} A new object with the same own-properties.
     */
    function shallowCopy(obj) {
        var copy = {};
        var key;
        for (key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copy[key] = obj[key];
            }
        }
        return copy;
    }

    /**
     * Collects all unique keys from two objects.
     *
     * @param {Object} a - First object.
     * @param {Object} b - Second object.
     * @returns {Object} An object whose keys are the union of `a` and `b` keys.
     */
    function collectKeys(a, b) {
        var keys = {};
        var k;
        for (k in a) {
            if (Object.prototype.hasOwnProperty.call(a, k)) {
                keys[k] = true;
            }
        }
        for (k in b) {
            if (Object.prototype.hasOwnProperty.call(b, k)) {
                keys[k] = true;
            }
        }
        return keys;
    }

    /**
     * Performs a deep equality check via JSON serialisation.
     *
     * @param {*} a - First value.
     * @param {*} b - Second value.
     * @returns {boolean} `true` when the values are structurally equal.
     */
    function deepEqual(a, b) {
        try {
            return JSON.stringify(a) === JSON.stringify(b);
        } catch (e) {
            return false;
        }
    }

    /* ------------------------------------------------------------------ *
     * Public API
     * ------------------------------------------------------------------ */

    /**
     * Returns the list of available conflict-resolution strategies.
     *
     * @returns {Array<string>} `['last-write-wins', 'keep-both', 'prefer-local', 'prefer-remote']`
     */
    function getStrategies() {
        return ['last-write-wins', 'keep-both', 'prefer-local', 'prefer-remote'];
    }

    /**
     * Detects conflicts between a set of local operations and a set of
     * remote operations.
     *
     * Conflict types:
     *   - `'field-conflict'`     — both sides modified the same item; at
     *                               least one field differs.
     *   - `'delete-edit'`         — one side deleted the item while the
     *                               other side edited it.
     *   - `'concurrent-modify'`  — both sides modified the same item with
     *                               different operation types (e.g. one
     *                               moved, the other archived).
     *
     * @param {Array<Object>} localOps - Local operations since last sync.
     * @param {Array<Object>} remoteOps - Remote operations since last sync.
     * @returns {Array<Object>} Array of conflict descriptors.
     */
    function detectConflicts(localOps, remoteOps) {
        try {
            var conflicts = [];
            var localMap = {};
            var remoteMap = {};
            var i;

            /* Index operations by target id */
            for (i = 0; i < localOps.length; i++) {
                var lOp = localOps[i];
                var lId = lOp.targetId || lOp.id;
                if (lId) {
                    if (!localMap[lId]) {
                        localMap[lId] = [];
                    }
                    localMap[lId].push(lOp);
                }
            }

            for (i = 0; i < remoteOps.length; i++) {
                var rOp = remoteOps[i];
                var rId = rOp.targetId || rOp.id;
                if (rId) {
                    if (!remoteMap[rId]) {
                        remoteMap[rId] = [];
                    }
                    remoteMap[rId].push(rOp);
                }
            }

            /* Build the union of all target ids */
            var allIds = collectKeys(localMap, remoteMap);

            var id;
            for (id in allIds) {
                if (!Object.prototype.hasOwnProperty.call(allIds, id)) {
                    continue;
                }

                var localForId = localMap[id] || [];
                var remoteForId = remoteMap[id] || [];

                /* No conflict if only one side touched the item */
                if (!localForId.length || !remoteForId.length) {
                    continue;
                }

                var lastLocal = localForId[localForId.length - 1];
                var lastRemote = remoteForId[remoteForId.length - 1];

                var localIsDelete = lastLocal.type === 'delete';
                var remoteIsDelete = lastRemote.type === 'delete';

                /* --- delete-edit conflict --- */
                if (localIsDelete && !remoteIsDelete) {
                    conflicts.push({
                        type: 'delete-edit',
                        targetId: id,
                        localOp: lastLocal,
                        remoteOp: lastRemote,
                        message: 'Local deleted but remote modified'
                    });
                    continue;
                }

                if (remoteIsDelete && !localIsDelete) {
                    conflicts.push({
                        type: 'delete-edit',
                        targetId: id,
                        localOp: lastLocal,
                        remoteOp: lastRemote,
                        message: 'Remote deleted but local modified'
                    });
                    continue;
                }

                /* --- both deletes -> no conflict (idempotent) --- */
                if (localIsDelete && remoteIsDelete) {
                    continue;
                }

                /* --- field conflict (both updates) --- */
                if (lastLocal.type === 'update' && lastRemote.type === 'update') {
                    var localData = lastLocal.data || lastLocal.fields || {};
                    var remoteData = lastRemote.data || lastRemote.fields || {};

                    var allFields = collectKeys(localData, remoteData);
                    var fieldConflicts = [];

                    var fName;
                    for (fName in allFields) {
                        if (!Object.prototype.hasOwnProperty.call(allFields, fName)) {
                            continue;
                        }
                        var lv = localData[fName];
                        var rv = remoteData[fName];

                        if (lv !== undefined && rv !== undefined && !deepEqual(lv, rv)) {
                            fieldConflicts.push({
                                field: fName,
                                localValue: lv,
                                remoteValue: rv
                            });
                        }
                    }

                    if (fieldConflicts.length > 0) {
                        conflicts.push({
                            type: 'field-conflict',
                            targetId: id,
                            localOp: lastLocal,
                            remoteOp: lastRemote,
                            fields: fieldConflicts,
                            message: 'Concurrent field modifications detected'
                        });
                    }
                    /* If no field conflicts -> same modification, no conflict */
                    continue;
                }

                /* --- concurrent-modify (different op types) --- */
                conflicts.push({
                    type: 'concurrent-modify',
                    targetId: id,
                    localOp: lastLocal,
                    remoteOp: lastRemote,
                    message: 'Concurrent modifications with different operation types'
                });
            }

            return conflicts;
        } catch (e) {
            return [];
        }
    }

    /**
     * Resolves a single conflict using the specified strategy.
     *
     * Strategies:
     *   - `'last-write-wins'` — only for safe fields (title, notes, tags).
     *     Throws for unsafe fields or non-field conflicts.
     *   - `'keep-both'`        — preserves both versions in a structured
     *     `{ local, remote }` wrapper.
     *   - `'prefer-local'`     — uses the local operation.
     *   - `'prefer-remote'`    — uses the remote operation.
     *
     * @param {Object} conflict - A conflict object from {@link detectConflicts}.
     * @param {string} strategy - One of {@link getStrategies}.
     * @returns {Object} The resolved operation.
     * @throws {Error} When the strategy is invalid or not applicable.
     */
    function resolveConflict(conflict, strategy) {
        try {
            var resolved;

            switch (strategy) {
                case 'last-write-wins':
                    if (conflict.type !== 'field-conflict') {
                        throw new Error(
                            'last-write-wins is only applicable to field conflicts.'
                        );
                    }

                    var safeCount = 0;
                    var unsafeNames = [];
                    var i;
                    for (i = 0; i < conflict.fields.length; i++) {
                        if (isSafeField(conflict.fields[i].field)) {
                            safeCount++;
                        } else {
                            unsafeNames.push(conflict.fields[i].field);
                        }
                    }

                    if (unsafeNames.length > 0) {
                        throw new Error(
                            'last-write-wins is not safe for fields: ' +
                            unsafeNames.join(', ')
                        );
                    }

                    /* Use the remote (assumed latest) value for each safe field */
                    var mergedData = {};
                    var localData = conflict.localOp.data || conflict.localOp.fields || {};
                    var remoteData = conflict.remoteOp.data || conflict.remoteOp.fields || {};

                    for (i = 0; i < conflict.fields.length; i++) {
                        var fName = conflict.fields[i].field;
                        mergedData[fName] = remoteData[fName];
                    }

                    resolved = {
                        type: 'update',
                        targetId: conflict.targetId,
                        data: mergedData,
                        resolvedBy: 'last-write-wins',
                        resolvedAt: Date.now()
                    };
                    break;

                case 'keep-both':
                    resolved = {
                        type: 'update',
                        targetId: conflict.targetId,
                        data: {
                            local: conflict.localOp.data || conflict.localOp.fields || {},
                            remote: conflict.remoteOp.data || conflict.remoteOp.fields || {}
                        },
                        resolvedBy: 'keep-both',
                        resolvedAt: Date.now(),
                        originalConflictType: conflict.type
                    };
                    break;

                case 'prefer-local':
                    resolved = shallowCopy(conflict.localOp);
                    resolved.resolvedBy = 'prefer-local';
                    resolved.resolvedAt = Date.now();
                    break;

                case 'prefer-remote':
                    resolved = shallowCopy(conflict.remoteOp);
                    resolved.resolvedBy = 'prefer-remote';
                    resolved.resolvedAt = Date.now();
                    break;

                default:
                    throw new Error('Unknown strategy: ' + strategy);
            }

            return resolved;
        } catch (e) {
            throw new Error('Failed to resolve conflict: ' + e.message);
        }
    }

    /**
     * Merges a single field value from local and remote sources.
     *
     * Merge rules (in order of precedence):
     *   1. If both values are structurally equal -> no conflict.
     *   2. If one value is `null`/`undefined` -> use the other.
     *   3. If the field is a safe field -> use the remote (latest) value.
     *   4. If both values are arrays -> union with de-duplication.
     *   5. If both values are plain objects -> merge key-by-key; if any
     *      sub-key conflicts, mark the whole field as conflicting.
     *   6. Otherwise -> conflict (caller must resolve explicitly).
     *
     * @param {*} localField - The local field value.
     * @param {*} remoteField - The remote field value.
     * @param {string} fieldName - The name of the field being merged.
     * @returns {Object} `{ value, conflict, ... }` where `conflict` is
     *   `true` when the field could not be auto-merged.
     */
    function mergeField(localField, remoteField, fieldName) {
        try {
            /* Rule 1 — equal values */
            if (deepEqual(localField, remoteField)) {
                return { value: localField, conflict: false };
            }

            /* Rule 2 — one side absent */
            if (localField === undefined || localField === null) {
                return { value: remoteField, conflict: false };
            }
            if (remoteField === undefined || remoteField === null) {
                return { value: localField, conflict: false };
            }

            /* Rule 3 — safe field -> LWW (prefer remote) */
            if (isSafeField(fieldName)) {
                return {
                    value: remoteField,
                    conflict: false,
                    resolvedBy: 'last-write-wins'
                };
            }

            /* Rule 4 — array union */
            if (Array.isArray(localField) && Array.isArray(remoteField)) {
                var mergedArr = [];
                var seen = {};
                var i;

                for (i = 0; i < localField.length; i++) {
                    var lKey = JSON.stringify(localField[i]);
                    if (!seen[lKey]) {
                        mergedArr.push(localField[i]);
                        seen[lKey] = true;
                    }
                }
                for (i = 0; i < remoteField.length; i++) {
                    var rKey = JSON.stringify(remoteField[i]);
                    if (!seen[rKey]) {
                        mergedArr.push(remoteField[i]);
                        seen[rKey] = true;
                    }
                }
                return {
                    value: mergedArr,
                    conflict: false,
                    resolvedBy: 'merge'
                };
            }

            /* Rule 5 — plain object merge */
            if (typeof localField === 'object' && typeof remoteField === 'object' &&
                !Array.isArray(localField) && !Array.isArray(remoteField)) {

                var mergedObj = {};
                var allKeys = collectKeys(localField, remoteField);
                var hasSubConflict = false;
                var k;

                for (k in allKeys) {
                    if (!Object.prototype.hasOwnProperty.call(allKeys, k)) {
                        continue;
                    }
                    var lv = localField[k];
                    var rv = remoteField[k];

                    if (lv !== undefined && rv !== undefined && !deepEqual(lv, rv)) {
                        hasSubConflict = true;
                        mergedObj[k] = { local: lv, remote: rv };
                    } else {
                        mergedObj[k] = lv !== undefined ? lv : rv;
                    }
                }

                if (hasSubConflict) {
                    return {
                        value: mergedObj,
                        conflict: true,
                        fieldName: fieldName
                    };
                }
                return {
                    value: mergedObj,
                    conflict: false,
                    resolvedBy: 'merge'
                };
            }

            /* Rule 6 — cannot auto-merge */
            return {
                value: null,
                conflict: true,
                fieldName: fieldName,
                localValue: localField,
                remoteValue: remoteField
            };
        } catch (e) {
            return {
                value: null,
                conflict: true,
                fieldName: fieldName,
                error: e.message
            };
        }
    }

    /**
     * Serialises an array of conflict objects into a plain, storable
     * format suitable for localStorage or JSON transport.
     *
     * @param {Array<Object>} conflicts - Array of conflict objects.
     * @returns {Object} A versioned, self-describing serialised container.
     */
    function serializeConflicts(conflicts) {
        try {
            return {
                version: 1,
                serializedAt: Date.now(),
                count: conflicts.length,
                conflicts: conflicts.map(function (conflict) {
                    return {
                        type: conflict.type,
                        targetId: conflict.targetId,
                        message: conflict.message,
                        localOp: conflict.localOp,
                        remoteOp: conflict.remoteOp,
                        fields: conflict.fields || [],
                        resolvedBy: conflict.resolvedBy || null,
                        resolvedAt: conflict.resolvedAt || null
                    };
                })
            };
        } catch (e) {
            return {
                version: 1,
                serializedAt: Date.now(),
                count: 0,
                conflicts: [],
                error: e.message
            };
        }
    }

    /* ------------------------------------------------------------------ *
     * Export
     * ------------------------------------------------------------------ */

    global.ShikeSyncConflict = {
        detectConflicts: detectConflicts,
        resolveConflict: resolveConflict,
        getStrategies: getStrategies,
        mergeField: mergeField,
        serializeConflicts: serializeConflicts
    };
})(typeof window !== 'undefined' ? window : this);
