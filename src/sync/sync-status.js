/**
 * sync-status.js
 * 时刻 Shike — v2.0.0-rc5 Optional Sync Beta
 *
 * Sync status UI and tracking.
 *
 * Responsibilities:
 *   - Track and report the current sync mode (`'local'` or `'encrypted-sync'`).
 *   - Maintain a list of known devices with revoke support.
 *   - Render a read-only status panel into any container element.
 *   - Render an interactive settings panel for mode / endpoint / device management.
 *
 * Honesty principle:
 *   - In local mode the UI clearly states: "本地模式：数据仅保存在此设备".
 *   - No sync is ever implied or claimed when the user has not opted in.
 *
 * @module  ShikeSyncStatus
 * @global  window.ShikeSyncStatus
 */

(function (global) {
    'use strict';

    /* ------------------------------------------------------------------ *
     * Constants
     * ------------------------------------------------------------------ */

    /** localStorage key for the sync mode preference. */
    var MODE_KEY = 'shike_sync_mode';

    /** localStorage key for the known-devices list. */
    var DEVICES_KEY = 'shike_known_devices';

    /** localStorage key that holds the configured endpoint (shared with sync-client). */
    var ENDPOINT_KEY = 'shike_sync_endpoint';

    /** Default sync mode when nothing has been stored yet. */
    var DEFAULT_MODE = 'local';

    /* ------------------------------------------------------------------ *
     * DOM helpers
     * ------------------------------------------------------------------ */

    /**
     * Creates a DOM element with optional text content and class name.
     *
     * @param {string} tagName - The HTML tag name.
     * @param {string} [text] - Text content to set.
     * @param {string} [className] - CSS class name.
     * @returns {HTMLElement} The created element.
     */
    function el(tagName, text, className) {
        var node = document.createElement(tagName);
        if (text !== undefined && text !== null) {
            node.textContent = text;
        }
        if (className) {
            node.className = className;
        }
        return node;
    }

    /**
     * Removes all child nodes from a container.
     *
     * @param {HTMLElement} container - The element to clear.
     */
    function clearContainer(container) {
        while (container && container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    /* ------------------------------------------------------------------ *
     * Storage helpers
     * ------------------------------------------------------------------ */

    /**
     * Reads the sync mode from localStorage.
     *
     * @returns {string} `'local'` or `'encrypted-sync'`.
     */
    function getSyncMode() {
        try {
            var mode = localStorage.getItem(MODE_KEY);
            if (mode === 'local' || mode === 'encrypted-sync') {
                return mode;
            }
            return DEFAULT_MODE;
        } catch (e) {
            return DEFAULT_MODE;
        }
    }

    /**
     * Persists the sync mode to localStorage.
     *
     * @param {string} mode - `'local'` or `'encrypted-sync'`.
     * @throws {Error} When `mode` is not a valid value.
     */
    function setSyncMode(mode) {
        try {
            if (mode !== 'local' && mode !== 'encrypted-sync') {
                throw new Error('Invalid sync mode: ' + mode + '. Expected "local" or "encrypted-sync".');
            }
            localStorage.setItem(MODE_KEY, mode);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Reads the known-devices list from localStorage.
     *
     * @returns {Array<Object>} Array of device objects.
     */
    function getDeviceList() {
        try {
            var raw = localStorage.getItem(DEVICES_KEY);
            if (!raw) {
                return [];
            }
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }

    /**
     * Persists the known-devices list to localStorage.
     *
     * @param {Array<Object>} devices - The devices to save.
     */
    function saveDeviceList(devices) {
        try {
            localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
        } catch (e) {
            /* storage full or unavailable */
        }
    }

    /**
     * Reads the configured endpoint from localStorage.
     *
     * @returns {string} The endpoint URL or `''`.
     */
    function getEndpoint() {
        try {
            return localStorage.getItem(ENDPOINT_KEY) || '';
        } catch (e) {
            return '';
        }
    }

    /**
     * Returns the current device identity (or `null`).
     *
     * @returns {Object|null}
     */
    function getIdentity() {
        try {
            if (global.ShikeDeviceIdentity) {
                return global.ShikeDeviceIdentity.getIdentity();
            }
        } catch (e) {
            /* module not available */
        }
        return null;
    }

    /* ------------------------------------------------------------------ *
     * Public API
     * ------------------------------------------------------------------ */

    /**
     * Returns a comprehensive snapshot of the sync system's status.
     *
     * @returns {Object} Status object:
     *   ```js
     *   {
     *     enabled:     boolean,
     *     endpoint:    string,
     *     lastSync:    number | null,
     *     pending:     number,
     *     deviceCount: number,
     *     conflicts:   number
     *   }
     *   ```
     */
    function getStatus() {
        try {
            var mode = getSyncMode();
            var clientStatus = { lastSync: null, pending: 0, status: 'idle' };

            if (global.ShikeSyncClient) {
                clientStatus = global.ShikeSyncClient.getStatus();
            }

            var devices = getDeviceList();

            return {
                enabled: mode === 'encrypted-sync',
                endpoint: getEndpoint(),
                lastSync: clientStatus.lastSync,
                pending: clientStatus.pending,
                deviceCount: devices.length,
                conflicts: 0
            };
        } catch (e) {
            return {
                enabled: false,
                endpoint: '',
                lastSync: null,
                pending: 0,
                deviceCount: 0,
                conflicts: 0
            };
        }
    }

    /**
     * Marks a device as revoked in the known-devices list.
     *
     * Revoked devices are retained in the list (for audit) but flagged
     * so the sync layer can refuse future operations from them.
     *
     * @param {string} deviceId - The device id to revoke.
     * @returns {boolean} `true` when the device was found and revoked.
     */
    function revokeDevice(deviceId) {
        try {
            var devices = getDeviceList();
            var found = false;
            var i;

            for (i = 0; i < devices.length; i++) {
                if (devices[i].deviceId === deviceId) {
                    devices[i].revoked = true;
                    devices[i].revokedAt = Date.now();
                    found = true;
                    break;
                }
            }

            if (found) {
                saveDeviceList(devices);
            }
            return found;
        } catch (e) {
            return false;
        }
    }

    /**
     * Renders a read-only sync status panel into the given container.
     *
     * The panel shows:
     *   - Current sync mode (with honest messaging for local mode).
     *   - Endpoint URL (or "未配置" when empty).
     *   - Last sync time (or "从未同步").
     *   - Pending operation count.
     *   - Known device list (with revoke buttons for non-current devices).
     *
     * @param {HTMLElement} container - The DOM element to render into.
     */
    function render(container) {
        try {
            if (!container) {
                throw new Error('Container element is required.');
            }

            clearContainer(container);

            var status = getStatus();
            var mode = getSyncMode();
            var identity = getIdentity();
            var currentDeviceId = identity ? identity.deviceId : null;
            var devices = getDeviceList();

            /* --- Panel wrapper --- */
            var panel = el('div', null, 'shike-sync-status');
            panel.style.fontFamily = 'system-ui, -apple-system, sans-serif';
            panel.style.padding = '16px';
            panel.style.border = '1px solid #e0e0e0';
            panel.style.borderRadius = '8px';
            panel.style.maxWidth = '480px';

            /* --- Title --- */
            panel.appendChild(el('h3', '同步状态', 'shike-sync-title'));
            panel.appendChild(el('p', 'v2.0.0-rc5 Optional Sync Beta'));

            /* --- Mode --- */
            var modeText = mode === 'encrypted-sync'
                ? '加密同步模式'
                : '本地模式';
            panel.appendChild(el('div', '模式: ' + modeText, 'shike-sync-mode'));

            /* --- Honest messaging for local mode --- */
            if (mode === 'local') {
                var notice = el('div', '本地模式：数据仅保存在此设备', 'shike-sync-notice');
                notice.style.color = '#666';
                notice.style.fontStyle = 'italic';
                notice.style.marginTop = '4px';
                panel.appendChild(notice);
            }

            /* --- Endpoint --- */
            var endpointText = status.endpoint
                ? status.endpoint
                : '未配置';
            panel.appendChild(el('div', '服务器: ' + endpointText, 'shike-sync-endpoint'));

            /* --- Last sync --- */
            var lastSyncText = status.lastSync
                ? new Date(status.lastSync).toLocaleString()
                : '从未同步';
            panel.appendChild(el('div', '上次同步: ' + lastSyncText, 'shike-sync-last'));

            /* --- Pending --- */
            panel.appendChild(el('div', '待同步: ' + status.pending + ' 条操作', 'shike-sync-pending'));

            /* --- Device list --- */
            panel.appendChild(el('h4', '已知设备 (' + devices.length + ')', 'shike-sync-devices-title'));

            if (devices.length === 0) {
                panel.appendChild(el('p', '暂无其他设备', 'shike-sync-no-devices'));
            } else {
                var list = el('ul', null, 'shike-device-list');
                var i;
                for (i = 0; i < devices.length; i++) {
                    var device = devices[i];
                    var isCurrent = device.deviceId === currentDeviceId;
                    var isRevoked = device.revoked;

                    var item = el('li', null, 'shike-device-item');
                    item.style.marginBottom = '8px';

                    var label = device.deviceId;
                    if (isCurrent) {
                        label += ' (本设备)';
                    }
                    if (isRevoked) {
                        label += ' [已撤销]';
                    }
                    if (device.name) {
                        label = device.name + ' — ' + label;
                    }

                    item.appendChild(el('span', label, 'shike-device-label'));

                    /* Revoke button (only for non-current, non-revoked devices) */
                    if (!isCurrent && !isRevoked) {
                        var btn = el('button', '撤销', 'shike-revoke-btn');
                        btn.style.marginLeft = '8px';
                        btn.style.padding = '2px 8px';
                        btn.style.fontSize = '12px';
                        btn.style.cursor = 'pointer';

                        (function (deviceId) {
                            btn.addEventListener('click', function () {
                                revokeDevice(deviceId);
                                render(container);
                            });
                        })(device.deviceId);

                        item.appendChild(btn);
                    }

                    list.appendChild(item);
                }
                panel.appendChild(list);
            }

            container.appendChild(panel);
        } catch (e) {
            /* If rendering fails, show an error message in the container */
            clearContainer(container);
            container.appendChild(el('div', '状态面板渲染失败: ' + e.message));
        }
    }

    /**
     * Renders an interactive sync settings panel into the given container.
     *
     * The panel includes:
     *   - A mode toggle between "本地模式" and "加密同步模式".
     *   - An endpoint input field (visible only in encrypted-sync mode).
     *   - A save button that persists the mode and endpoint.
     *   - Honest messaging explaining the implications of each mode.
     *
     * @param {HTMLElement} container - The DOM element to render into.
     */
    function showSyncSettings(container) {
        try {
            if (!container) {
                throw new Error('Container element is required.');
            }

            clearContainer(container);

            var currentMode = getSyncMode();
            var currentEndpoint = getEndpoint();

            /* --- Panel wrapper --- */
            var panel = el('div', null, 'shike-sync-settings');
            panel.style.fontFamily = 'system-ui, -apple-system, sans-serif';
            panel.style.padding = '16px';
            panel.style.border = '1px solid #e0e0e0';
            panel.style.borderRadius = '8px';
            panel.style.maxWidth = '480px';

            /* --- Title --- */
            panel.appendChild(el('h3', '同步设置', 'shike-settings-title'));

            /* --- Mode selector --- */
            panel.appendChild(el('label', '同步模式', 'shike-settings-mode-label'));

            var modeSelect = document.createElement('select');
            modeSelect.className = 'shike-settings-mode-select';
            modeSelect.style.display = 'block';
            modeSelect.style.margin = '8px 0';
            modeSelect.style.padding = '4px';
            modeSelect.style.width = '100%';

            var localOption = el('option', '本地模式（不同步）', 'shike-mode-local');
            localOption.value = 'local';
            if (currentMode === 'local') {
                localOption.selected = true;
            }
            modeSelect.appendChild(localOption);

            var syncOption = el('option', '加密同步模式', 'shike-mode-sync');
            syncOption.value = 'encrypted-sync';
            if (currentMode === 'encrypted-sync') {
                syncOption.selected = true;
            }
            modeSelect.appendChild(syncOption);

            panel.appendChild(modeSelect);

            /* --- Honest messaging --- */
            var notice = el('div', null, 'shike-settings-notice');
            notice.style.fontSize = '13px';
            notice.style.color = '#666';
            notice.style.margin = '8px 0';
            notice.style.fontStyle = 'italic';

            function updateNotice() {
                if (modeSelect.value === 'local') {
                    notice.textContent = '本地模式：数据仅保存在此设备。不会上传任何数据到服务器。';
                } else {
                    notice.textContent = '加密同步模式：数据在本地加密后上传。服务器无法读取明文内容。';
                }
            }
            updateNotice();
            modeSelect.addEventListener('change', updateNotice);

            panel.appendChild(notice);

            /* --- Endpoint input --- */
            var endpointWrapper = el('div', null, 'shike-settings-endpoint-wrapper');
            endpointWrapper.style.marginTop = '12px';

            endpointWrapper.appendChild(el('label', '同步服务器地址', 'shike-settings-endpoint-label'));

            var endpointInput = document.createElement('input');
            endpointInput.type = 'url';
            endpointInput.className = 'shike-settings-endpoint-input';
            endpointInput.placeholder = 'https://sync.example.com';
            endpointInput.value = currentEndpoint;
            endpointInput.style.display = 'block';
            endpointInput.style.margin = '8px 0';
            endpointInput.style.padding = '6px';
            endpointInput.style.width = '100%';
            endpointInput.style.boxSizing = 'border-box';

            endpointWrapper.appendChild(endpointInput);
            endpointWrapper.appendChild(el('div', '留空则所有操作暂存在本地离线队列中。', 'shike-settings-endpoint-hint'));

            panel.appendChild(endpointWrapper);

            /* --- Save button --- */
            var saveBtn = el('button', '保存设置', 'shike-settings-save-btn');
            saveBtn.style.marginTop = '16px';
            saveBtn.style.padding = '8px 20px';
            saveBtn.style.cursor = 'pointer';
            saveBtn.style.backgroundColor = '#2563eb';
            saveBtn.style.color = '#fff';
            saveBtn.style.border = 'none';
            saveBtn.style.borderRadius = '4px';

            saveBtn.addEventListener('click', function () {
                try {
                    var newMode = modeSelect.value;
                    var newEndpoint = endpointInput.value.trim();

                    setSyncMode(newMode);

                    /* Persist endpoint */
                    try {
                        localStorage.setItem(ENDPOINT_KEY, newEndpoint);
                    } catch (e) {
                        /* ignore */
                    }

                    /* Propagate to sync client */
                    if (global.ShikeSyncClient) {
                        global.ShikeSyncClient.setEndpoint(newEndpoint);
                        if (newMode === 'encrypted-sync') {
                            global.ShikeSyncClient.enable();
                        } else {
                            global.ShikeSyncClient.disable();
                        }
                    }

                    /* Show confirmation */
                    var confirmMsg = el('div', '设置已保存', 'shike-settings-saved');
                    confirmMsg.style.color = '#16a34a';
                    confirmMsg.style.marginTop = '8px';
                    panel.appendChild(confirmMsg);

                    setTimeout(function () {
                        if (confirmMsg.parentNode) {
                            confirmMsg.parentNode.removeChild(confirmMsg);
                        }
                    }, 3000);
                } catch (e) {
                    var errMsg = el('div', '保存失败: ' + e.message, 'shike-settings-error');
                    errMsg.style.color = '#dc2626';
                    errMsg.style.marginTop = '8px';
                    panel.appendChild(errMsg);

                    setTimeout(function () {
                        if (errMsg.parentNode) {
                            errMsg.parentNode.removeChild(errMsg);
                        }
                    }, 5000);
                }
            });

            panel.appendChild(saveBtn);

            container.appendChild(panel);
        } catch (e) {
            clearContainer(container);
            container.appendChild(el('div', '设置面板渲染失败: ' + e.message));
        }
    }

    /* ------------------------------------------------------------------ *
     * Export
     * ------------------------------------------------------------------ */

    global.ShikeSyncStatus = {
        getStatus: getStatus,
        render: render,
        getDeviceList: getDeviceList,
        revokeDevice: revokeDevice,
        showSyncSettings: showSyncSettings,
        getSyncMode: getSyncMode,
        setSyncMode: setSyncMode
    };
})(typeof window !== 'undefined' ? window : this);
