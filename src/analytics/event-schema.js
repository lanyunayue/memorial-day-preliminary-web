/**
 * Shike Event Schema
 * Event schema definitions and validation for the 时刻 (Shike) web project.
 *
 * Version: 2.0.0-rc5
 * Phase: Optional Sync Beta
 *
 * Defines schemas for all analytics event types, validates incoming events
 * against those schemas, and rejects any properties that may contain
 * personally identifiable information (PII).
 *
 * PII-sensitive keywords that are always rejected in property keys or values:
 *   password, token, secret, key
 *
 * @module analytics/event-schema
 * @version 2.0.0-rc5
 * @copyright 时刻 Shike Project
 */
(function (global) {
    'use strict';

    /**
     * Schemas for each predefined event type.
     * Each schema has:
     *   - description {string} - human-readable description
     *   - fields {Object} - map of field name to { type, required }
     *
     * @type {Object.<string, Object>}
     * @private
     */
    var schemas = {
        'page_view': {
            description: 'User viewed a page.',
            fields: {
                page: { type: 'string', required: true },
                referrer: { type: 'string', required: false }
            }
        },
        'feature_click': {
            description: 'User clicked a feature.',
            fields: {
                feature: { type: 'string', required: true },
                context: { type: 'string', required: false }
            }
        },
        'record_create': {
            description: 'User created a record. Does NOT track title or content.',
            fields: {
                type: { type: 'string', required: true },
                hasReminder: { type: 'boolean', required: false }
            }
        },
        'record_edit': {
            description: 'User edited a record. Does NOT track title or content.',
            fields: {
                type: { type: 'string', required: true }
            }
        },
        'record_delete': {
            description: 'User deleted a record. Does NOT track title or content.',
            fields: {
                type: { type: 'string', required: true }
            }
        },
        'reminder_triggered': {
            description: 'A reminder was triggered.',
            fields: {
                status: { type: 'string', required: true }
            }
        },
        'sync_operation': {
            description: 'A sync operation was performed.',
            fields: {
                operation: { type: 'string', required: true },
                result: { type: 'string', required: true }
            }
        },
        'error': {
            description: 'An error occurred. Does NOT track stack traces.',
            fields: {
                type: { type: 'string', required: true },
                message: { type: 'string', required: true }
            }
        },
        'permission_request': {
            description: 'A permission was requested.',
            fields: {
                permission: { type: 'string', required: true },
                result: { type: 'string', required: true }
            }
        },
        'export_data': {
            description: 'User exported data.',
            fields: {
                format: { type: 'string', required: true }
            }
        },
        'import_data': {
            description: 'User imported data.',
            fields: {
                format: { type: 'string', required: true },
                count: { type: 'number', required: false }
            }
        }
    };

    /**
     * PII-sensitive keywords that must never appear in event property keys
     * or string values. Matching is case-insensitive and checks for
     * substring presence.
     *
     * @type {string[]}
     * @private
     * @const
     */
    var PII_KEYWORDS = ['password', 'token', 'secret', 'key'];

    /**
     * Checks whether a string contains any PII-sensitive keyword.
     * The check is case-insensitive and matches substrings.
     *
     * @private
     * @param {string} str - The string to check.
     * @returns {string|null} The matched keyword, or null if no match is found.
     */
    function findPIIKeyword(str) {
        try {
            if (typeof str !== 'string') {
                return null;
            }
            var lower = str.toLowerCase();
            for (var i = 0; i < PII_KEYWORDS.length; i++) {
                if (lower.indexOf(PII_KEYWORDS[i]) !== -1) {
                    return PII_KEYWORDS[i];
                }
            }
            return null;
        } catch (err) {
            return null;
        }
    }

    /**
     * Recursively inspects an object for PII-sensitive keywords in its
     * keys or string values. Nested objects are traversed; arrays of
     * strings are checked element by element.
     *
     * @private
     * @param {*} obj - The value to inspect.
     * @returns {string|null} The first PII keyword found, or null if none.
     */
    function checkForPII(obj) {
        try {
            if (obj === null || obj === undefined) {
                return null;
            }
            if (typeof obj === 'string') {
                return findPIIKeyword(obj);
            }
            if (typeof obj !== 'object') {
                return null;
            }

            if (Array.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    var found = checkForPII(obj[i]);
                    if (found) {
                        return found;
                    }
                }
                return null;
            }

            // Plain object: check keys and values
            for (var key in obj) {
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }
                // Check the key name itself
                var keyMatch = findPIIKeyword(key);
                if (keyMatch) {
                    return keyMatch;
                }
                // Check the value recursively
                var value = obj[key];
                var valueMatch = checkForPII(value);
                if (valueMatch) {
                    return valueMatch;
                }
            }
            return null;
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeEventSchema] checkForPII error:', err);
            }
            return null;
        }
    }

    /**
     * Validates an event and its properties against the registered schema.
     *
     * Validation checks performed:
     *   1. Event name is a non-empty string
     *   2. Event type is registered
     *   3. Properties is a plain object
     *   4. No PII-sensitive keywords in keys or values
     *   5. All required fields are present
     *   6. All present fields have the correct type
     *
     * @param {string} event - The event name to validate.
     * @param {Object} [properties] - The properties to validate.
     * @returns {Object} An object: { valid: boolean, errors: string[] }.
     */
    function validate(event, properties) {
        try {
            var errors = [];
            properties = properties || {};

            // Check event name
            if (!event || typeof event !== 'string') {
                return {
                    valid: false,
                    errors: ['Event name must be a non-empty string.']
                };
            }

            // Check event is registered
            var schema = schemas[event];
            if (!schema) {
                return {
                    valid: false,
                    errors: ['Unknown event type: "' + event + '". Use register() to add new event types.']
                };
            }

            // Check properties is a plain object
            if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
                return {
                    valid: false,
                    errors: ['Properties must be a plain object.']
                };
            }

            // PII check: scan all keys and values
            var piiFound = checkForPII(properties);
            if (piiFound) {
                errors.push('PII-sensitive keyword "' + piiFound + '" detected in properties. ' +
                    'Events containing passwords, tokens, secrets, or keys are rejected.');
                return { valid: false, errors: errors };
            }

            // Validate each field defined in the schema
            var fields = schema.fields;
            for (var fieldName in fields) {
                if (!fields.hasOwnProperty(fieldName)) {
                    continue;
                }

                var fieldSpec = fields[fieldName];
                var hasField = properties.hasOwnProperty(fieldName);
                var value = properties[fieldName];

                // Check required fields
                if (fieldSpec.required && !hasField) {
                    errors.push('Missing required field: "' + fieldName + '".');
                    continue;
                }

                // If the field is present, validate its type
                if (hasField) {
                    // Allow null/undefined for non-required fields
                    if (value === null || value === undefined) {
                        if (fieldSpec.required) {
                            errors.push('Required field "' + fieldName + '" is null or undefined.');
                        }
                        continue;
                    }

                    var actualType = typeof value;
                    if (actualType !== fieldSpec.type) {
                        errors.push('Field "' + fieldName + '" must be of type "' +
                            fieldSpec.type + '", but received "' + actualType + '".');
                    }
                }
            }

            return {
                valid: errors.length === 0,
                errors: errors
            };
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeEventSchema] validate error:', err);
            }
            return {
                valid: false,
                errors: ['Validation failed due to an internal error: ' + (err.message || String(err))]
            };
        }
    }

    /**
     * Returns the schema definition for a specific event type.
     * The returned object is a deep copy to prevent accidental modification
     * of the internal schema registry.
     *
     * @param {string} event - The event name to look up.
     * @returns {Object|null} A copy of the schema, or null if the event type is not registered.
     */
    function getSchema(event) {
        try {
            if (!event || typeof event !== 'string') {
                return null;
            }
            var schema = schemas[event];
            if (!schema) {
                return null;
            }
            // Return a deep copy
            return JSON.parse(JSON.stringify(schema));
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeEventSchema] getSchema error:', err);
            }
            return null;
        }
    }

    /**
     * Lists all registered event type names.
     *
     * @returns {string[]} An array of event type names.
     */
    function listEvents() {
        try {
            return Object.keys(schemas);
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeEventSchema] listEvents error:', err);
            }
            return [];
        }
    }

    /**
     * Registers a new event type with its schema, or replaces an existing one.
     *
     * The schema must have a "fields" object where each key is a field name
     * and each value is an object with:
     *   - type {string} - one of 'string', 'boolean', 'number'
     *   - required {boolean} - whether the field is required
     *
     * @param {string} event - The event name to register.
     * @param {Object} schema - The schema definition.
     * @param {string} [schema.description] - Optional human-readable description.
     * @param {Object} schema.fields - Map of field definitions.
     * @returns {boolean} True if registered successfully, false otherwise.
     */
    function register(event, schema) {
        try {
            if (!event || typeof event !== 'string') {
                if (global.console && global.console.warn) {
                    global.console.warn('[ShikeEventSchema] register: event name must be a non-empty string.');
                }
                return false;
            }
            if (!schema || typeof schema !== 'object') {
                if (global.console && global.console.warn) {
                    global.console.warn('[ShikeEventSchema] register: schema must be an object.');
                }
                return false;
            }
            if (!schema.fields || typeof schema.fields !== 'object') {
                if (global.console && global.console.warn) {
                    global.console.warn('[ShikeEventSchema] register: schema must have a "fields" object.');
                }
                return false;
            }

            // Validate each field specification
            for (var fieldName in schema.fields) {
                if (!schema.fields.hasOwnProperty(fieldName)) {
                    continue;
                }
                var fieldSpec = schema.fields[fieldName];
                if (!fieldSpec || typeof fieldSpec !== 'object') {
                    if (global.console && global.console.warn) {
                        global.console.warn('[ShikeEventSchema] register: field "' + fieldName + '" must be an object.');
                    }
                    return false;
                }
                if (!fieldSpec.type || typeof fieldSpec.type !== 'string') {
                    if (global.console && global.console.warn) {
                        global.console.warn('[ShikeEventSchema] register: field "' + fieldName + '" must have a "type" string.');
                    }
                    return false;
                }
                var validTypes = ['string', 'boolean', 'number'];
                if (validTypes.indexOf(fieldSpec.type) === -1) {
                    if (global.console && global.console.warn) {
                        global.console.warn('[ShikeEventSchema] register: field "' + fieldName +
                            '" has unsupported type "' + fieldSpec.type + '". Valid types: ' +
                            validTypes.join(', ') + '.');
                    }
                    return false;
                }
            }

            // Register the schema (store a deep copy)
            schemas[event] = {
                description: schema.description || '',
                fields: JSON.parse(JSON.stringify(schema.fields))
            };
            return true;
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeEventSchema] register error:', err);
            }
            return false;
        }
    }

    // Expose public API
    global.ShikeEventSchema = {
        validate: validate,
        getSchema: getSchema,
        listEvents: listEvents,
        register: register,
        PII_KEYWORDS: PII_KEYWORDS
    };

})(typeof window !== 'undefined' ? window : this);
