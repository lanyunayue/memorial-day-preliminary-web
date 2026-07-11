/**
 * Shike Analytics Consent
 * Consent management module for analytics in the 时刻 (Shike) web project.
 *
 * Version: 2.0.0-rc5
 * Phase: Optional Sync Beta
 *
 * Manages user consent for two tiers of analytics:
 *   - Local: On-device storage only (default: granted)
 *   - Remote: Sends data to servers (default: denied; requires explicit opt-in)
 *
 * The consent status is persisted in localStorage and can be queried,
 * modified, or reset at any time. A consent dialog can be rendered to
 * allow users to review and change their preferences.
 *
 * @module analytics/consent
 * @version 2.0.0-rc5
 * @copyright 时刻 Shike Project
 */
(function (global) {
    'use strict';

    /**
     * The localStorage key under which consent status is persisted.
     *
     * @type {string}
     * @private
     * @const
     */
    var STORAGE_KEY = 'shike_analytics_consent';

    /**
     * Default consent values. Local analytics is on by default;
     * remote analytics requires explicit user opt-in.
     *
     * @type {Object}
     * @private
     * @const
     */
    var DEFAULT_CONSENT = {
        local: true,
        remote: false,
        updatedAt: null
    };

    /**
     * Reads the current consent status from localStorage.
     * Falls back to defaults if no stored value exists or parsing fails.
     *
     * @private
     * @returns {Object} Consent object: { local: boolean, remote: boolean, updatedAt: string|null }.
     */
    function readConsent() {
        try {
            if (!global.localStorage) {
                return {
                    local: DEFAULT_CONSENT.local,
                    remote: DEFAULT_CONSENT.remote,
                    updatedAt: null
                };
            }
            var raw = global.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return {
                    local: DEFAULT_CONSENT.local,
                    remote: DEFAULT_CONSENT.remote,
                    updatedAt: null
                };
            }
            var data = JSON.parse(raw);
            return {
                local: data.local !== undefined ? !!data.local : DEFAULT_CONSENT.local,
                remote: data.remote !== undefined ? !!data.remote : DEFAULT_CONSENT.remote,
                updatedAt: data.updatedAt || null
            };
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsConsent] readConsent error:', err);
            }
            return {
                local: DEFAULT_CONSENT.local,
                remote: DEFAULT_CONSENT.remote,
                updatedAt: null
            };
        }
    }

    /**
     * Writes the consent status to localStorage with an updated timestamp.
     *
     * @private
     * @param {Object} consent - The consent object to persist.
     * @returns {void}
     */
    function writeConsent(consent) {
        try {
            if (!global.localStorage) {
                return;
            }
            consent.updatedAt = new Date().toISOString();
            global.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsConsent] writeConsent error:', err);
            }
        }
    }

    /**
     * Returns the current consent status.
     *
     * @returns {Object} An object with:
     *   - local {boolean} - whether local analytics consent is granted
     *   - remote {boolean} - whether remote analytics consent is granted
     *   - updatedAt {string|null} - ISO timestamp of the last consent change
     */
    function getStatus() {
        try {
            return readConsent();
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsConsent] getStatus error:', err);
            }
            return {
                local: DEFAULT_CONSENT.local,
                remote: DEFAULT_CONSENT.remote,
                updatedAt: null
            };
        }
    }

    /**
     * Sets local analytics consent. When consent is withdrawn, the
     * analytics core is disabled and local data is cleared.
     *
     * @param {boolean} granted - Whether local analytics consent is granted.
     * @returns {void}
     */
    function setLocalConsent(granted) {
        try {
            var consent = readConsent();
            consent.local = !!granted;
            writeConsent(consent);

            // Integrate with the analytics core
            if (global.ShikeAnalyticsCore) {
                if (granted) {
                    global.ShikeAnalyticsCore.enable();
                } else {
                    global.ShikeAnalyticsCore.disable();
                    // Clear local data when consent is revoked
                    if (global.ShikeAnalyticsCore.clear) {
                        global.ShikeAnalyticsCore.clear();
                    }
                }
            }
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsConsent] setLocalConsent error:', err);
            }
        }
    }

    /**
     * Sets remote analytics consent. Remote consent requires explicit
     * user action; it cannot be granted silently by default.
     *
     * @param {boolean} granted - Whether remote analytics consent is granted.
     * @returns {void}
     */
    function setRemoteConsent(granted) {
        try {
            var consent = readConsent();
            consent.remote = !!granted;
            writeConsent(consent);
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsConsent] setRemoteConsent error:', err);
            }
        }
    }

    /**
     * Checks whether local analytics consent is currently granted.
     *
     * @returns {boolean} True if local consent is granted, false otherwise.
     */
    function hasLocalConsent() {
        try {
            return readConsent().local;
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsConsent] hasLocalConsent error:', err);
            }
            return false;
        }
    }

    /**
     * Checks whether remote analytics consent is currently granted.
     *
     * @returns {boolean} True if remote consent is granted, false otherwise.
     */
    function hasRemoteConsent() {
        try {
            return readConsent().remote;
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsConsent] hasRemoteConsent error:', err);
            }
            return false;
        }
    }

    /**
     * Creates a consent toggle section with label, description, and checkbox.
     *
     * @private
     * @param {string} label - The section label.
     * @param {string} description - The descriptive text for the section.
     * @param {boolean} checked - The initial checked state of the toggle.
     * @param {Function} onChange - Callback invoked with the new boolean state.
     * @returns {Object} A DOM element representing the consent section.
     */
    function createConsentSection(label, description, checked, onChange) {
        try {
            var doc = global.document;
            var section = doc.createElement('div');
            section.className = 'shike-consent-section';
            section.style.cssText = 'margin-bottom:16px;padding:12px;border:1px solid #e0e0e0;border-radius:6px;background:#fafafa;';

            var header = doc.createElement('div');
            header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';

            var labelText = doc.createElement('span');
            labelText.textContent = label;
            labelText.style.cssText = 'font-weight:600;font-size:14px;color:#333;';
            header.appendChild(labelText);

            var toggle = doc.createElement('input');
            toggle.type = 'checkbox';
            toggle.checked = checked;
            toggle.style.cssText = 'width:18px;height:18px;cursor:pointer;accent-color:#4CAF50;';
            toggle.onchange = function () {
                try {
                    onChange(toggle.checked);
                } catch (e) {
                    if (global.console && global.console.error) {
                        global.console.error('[ShikeAnalyticsConsent] toggle onChange error:', e);
                    }
                }
            };
            header.appendChild(toggle);

            section.appendChild(header);

            var descText = doc.createElement('p');
            descText.textContent = description;
            descText.style.cssText = 'margin:0;color:#666;font-size:12px;line-height:1.5;';
            section.appendChild(descText);

            return section;
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsConsent] createConsentSection error:', err);
            }
            return null;
        }
    }

    /**
     * Renders a consent dialog in the specified container element.
     *
     * The dialog explains:
     *   - What data is collected (anonymous usage events)
     *   - Where data goes (local-only vs. remote sync)
     *   - How to disable analytics at any time
     *
     * Users can toggle local and remote consent independently,
     * clear all stored data, or reset to defaults.
     *
     * @param {HTMLElement|string} container - A DOM element or element ID where the dialog will be rendered.
     * @returns {void}
     */
    function showConsentDialog(container) {
        try {
            if (!global.document) {
                if (global.console && global.console.warn) {
                    global.console.warn('[ShikeAnalyticsConsent] showConsentDialog: document is not available.');
                }
                return;
            }

            var el = container;
            if (typeof container === 'string') {
                el = global.document.getElementById(container);
            }
            if (!el) {
                if (global.console && global.console.warn) {
                    global.console.warn('[ShikeAnalyticsConsent] showConsentDialog: container not found.');
                }
                return;
            }

            var doc = global.document;
            var consent = readConsent();

            // Clear container
            el.innerHTML = '';

            // Overlay
            var overlay = doc.createElement('div');
            overlay.className = 'shike-consent-overlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
                'background:rgba(0,0,0,0.5);z-index:99998;display:flex;' +
                'align-items:center;justify-content:center;';

            // Dialog
            var dialog = doc.createElement('div');
            dialog.className = 'shike-consent-dialog';
            dialog.style.cssText = 'background:#fff;border-radius:10px;padding:28px;' +
                'max-width:520px;width:90%;max-height:85vh;overflow-y:auto;' +
                'box-shadow:0 8px 32px rgba(0,0,0,0.18);z-index:99999;' +
                'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;';

            // Title
            var title = doc.createElement('h2');
            title.textContent = '时刻 Shike — Analytics Consent';
            title.style.cssText = 'margin:0 0 12px 0;font-size:20px;color:#1a1a1a;';
            dialog.appendChild(title);

            // Introduction
            var intro = doc.createElement('p');
            intro.textContent = 'Shike collects anonymous usage analytics to understand which features are used and to improve your experience. You have full control over what data is collected and where it is stored.';
            intro.style.cssText = 'margin:0 0 20px 0;color:#555;font-size:14px;line-height:1.6;';
            dialog.appendChild(intro);

            // Local analytics section
            var localSection = createConsentSection(
                'Local Analytics (On-Device)',
                'Stores anonymous usage events on this device only. Includes page views, feature clicks, record operations (type only), errors, and sync results. No data ever leaves your browser.',
                consent.local,
                function (checked) {
                    setLocalConsent(checked);
                }
            );
            if (localSection) {
                dialog.appendChild(localSection);
            }

            // Remote analytics section
            var remoteSection = createConsentSection(
                'Remote Analytics (Sync to Server)',
                'Sends anonymous usage events to our servers for aggregation across all users. Data is anonymized and cannot be traced back to you. Requires explicit opt-in — this is off by default.',
                consent.remote,
                function (checked) {
                    setRemoteConsent(checked);
                }
            );
            if (remoteSection) {
                dialog.appendChild(remoteSection);
            }

            // What we collect heading
            var collectHeading = doc.createElement('h3');
            collectHeading.textContent = 'What We Collect';
            collectHeading.style.cssText = 'margin:20px 0 8px 0;font-size:15px;color:#333;';
            dialog.appendChild(collectHeading);

            // What we collect list
            var collectList = doc.createElement('ul');
            collectList.style.cssText = 'margin:0 0 16px 0;padding-left:20px;color:#666;font-size:13px;line-height:1.9;';
            var collectItems = [
                'Page views — which pages you visit',
                'Feature clicks — which features you use',
                'Record create — type and whether it has a reminder (never title or content)',
                'Record edit/delete — type only (never title or content)',
                'Error events — error type and message (never stack traces)',
                'Sync operations — operation type and result',
                'Permission requests — permission name and result'
            ];
            for (var i = 0; i < collectItems.length; i++) {
                var li = doc.createElement('li');
                li.textContent = collectItems[i];
                collectList.appendChild(li);
            }
            dialog.appendChild(collectList);

            // What we never collect heading
            var neverHeading = doc.createElement('h3');
            neverHeading.textContent = 'What We Never Collect';
            neverHeading.style.cssText = 'margin:16px 0 8px 0;font-size:15px;color:#333;';
            dialog.appendChild(neverHeading);

            var neverList = doc.createElement('ul');
            neverList.style.cssText = 'margin:0 0 16px 0;padding-left:20px;color:#e53935;font-size:13px;line-height:1.9;';
            var neverItems = [
                'Passwords, tokens, secrets, or API keys',
                'Record titles or content',
                'Error stack traces',
                'Personally identifiable information (PII)',
                'Device identifiers or fingerprints'
            ];
            for (var j = 0; j < neverItems.length; j++) {
                var neverLi = doc.createElement('li');
                neverLi.textContent = neverItems[j];
                neverList.appendChild(neverLi);
            }
            dialog.appendChild(neverList);

            // Disable note
            var disableNote = doc.createElement('p');
            disableNote.textContent = 'You can disable analytics at any time by toggling the options above or by resetting your consent. Disabling local analytics will clear all locally stored data.';
            disableNote.style.cssText = 'margin:0 0 20px 0;color:#888;font-size:12px;line-height:1.6;font-style:italic;';
            dialog.appendChild(disableNote);

            // Button row
            var btnContainer = doc.createElement('div');
            btnContainer.style.cssText = 'display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap;';

            // Clear data button
            var clearBtn = doc.createElement('button');
            clearBtn.textContent = 'Clear All Data';
            clearBtn.style.cssText = 'padding:8px 16px;border:1px solid #ccc;background:#fff;color:#666;' +
                'border-radius:6px;cursor:pointer;font-size:13px;transition:background 0.2s;';
            clearBtn.onmouseover = function () {
                clearBtn.style.background = '#f5f5f5';
            };
            clearBtn.onmouseout = function () {
                clearBtn.style.background = '#fff';
            };
            clearBtn.onclick = function () {
                try {
                    if (global.ShikeLocalAnalytics && typeof global.ShikeLocalAnalytics.clear === 'function') {
                        global.ShikeLocalAnalytics.clear();
                    }
                    if (global.ShikeAnalyticsCore && typeof global.ShikeAnalyticsCore.clear === 'function') {
                        global.ShikeAnalyticsCore.clear();
                    }
                } catch (e) {
                    if (global.console && global.console.error) {
                        global.console.error('[ShikeAnalyticsConsent] clear data error:', e);
                    }
                }
            };
            btnContainer.appendChild(clearBtn);

            // Reset button
            var resetBtn = doc.createElement('button');
            resetBtn.textContent = 'Reset to Defaults';
            resetBtn.style.cssText = 'padding:8px 16px;border:1px solid #ccc;background:#fff;color:#666;' +
                'border-radius:6px;cursor:pointer;font-size:13px;transition:background 0.2s;';
            resetBtn.onmouseover = function () {
                resetBtn.style.background = '#f5f5f5';
            };
            resetBtn.onmouseout = function () {
                resetBtn.style.background = '#fff';
            };
            resetBtn.onclick = function () {
                try {
                    reset();
                    // Refresh dialog state
                    showConsentDialog(el);
                } catch (e) {
                    if (global.console && global.console.error) {
                        global.console.error('[ShikeAnalyticsConsent] reset error:', e);
                    }
                }
            };
            btnContainer.appendChild(resetBtn);

            // Done button
            var doneBtn = doc.createElement('button');
            doneBtn.textContent = 'Done';
            doneBtn.style.cssText = 'padding:8px 24px;border:none;background:#4CAF50;color:#fff;' +
                'border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;transition:background 0.2s;';
            doneBtn.onmouseover = function () {
                doneBtn.style.background = '#43A047';
            };
            doneBtn.onmouseout = function () {
                doneBtn.style.background = '#4CAF50';
            };
            doneBtn.onclick = function () {
                try {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                    if (el) {
                        el.innerHTML = '';
                    }
                } catch (e) {
                    if (global.console && global.console.error) {
                        global.console.error('[ShikeAnalyticsConsent] close dialog error:', e);
                    }
                }
            };
            btnContainer.appendChild(doneBtn);

            dialog.appendChild(btnContainer);
            overlay.appendChild(dialog);
            el.appendChild(overlay);

        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsConsent] showConsentDialog error:', err);
            }
        }
    }

    /**
     * Resets all consent to default values (local=true, remote=false).
     *
     * @returns {void}
     */
    function reset() {
        try {
            if (!global.localStorage) {
                return;
            }
            var consent = {
                local: DEFAULT_CONSENT.local,
                remote: DEFAULT_CONSENT.remote,
                updatedAt: new Date().toISOString()
            };
            global.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));

            // Sync with analytics core
            if (global.ShikeAnalyticsCore) {
                global.ShikeAnalyticsCore.enable();
            }
        } catch (err) {
            if (global.console && global.console.error) {
                global.console.error('[ShikeAnalyticsConsent] reset error:', err);
            }
        }
    }

    // Expose public API
    global.ShikeAnalyticsConsent = {
        getStatus: getStatus,
        setLocalConsent: setLocalConsent,
        setRemoteConsent: setRemoteConsent,
        hasLocalConsent: hasLocalConsent,
        hasRemoteConsent: hasRemoteConsent,
        showConsentDialog: showConsentDialog,
        reset: reset,
        STORAGE_KEY: STORAGE_KEY
    };

    // Initialize with default consent on first load if no stored value exists
    try {
        if (global.localStorage && !global.localStorage.getItem(STORAGE_KEY)) {
            reset();
        }
    } catch (e) {
        // Silently ignore initialization errors
    }

})(typeof window !== 'undefined' ? window : this);
