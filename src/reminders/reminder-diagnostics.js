/**
 * @file reminder-diagnostics.js
 * @module ShikeReminderDiagnostics
 * @description
 * PWA reminder diagnostics page module for the 时刻 (Shike) web project.
 *
 * Version: 2.0.0-rc4
 * Phase: Reminder Reliability
 *
 * Provides runtime diagnostics for the local reminder subsystem, including
 * PWA install state, notification permission, Service Worker registration,
 * page visibility, background restriction explanations, and the Push Beta
 * status (which is local-only in this release).
 *
 * Exposed globally as `window.ShikeReminderDiagnostics`.
 *
 * @copyright 时刻 Shike
 * @license MIT
 */

(function (global) {
    'use strict';

    /**
     * localStorage keys used for tracking the last reminder activity.
     *
     * @constant {Object}
     */
    var STORAGE_KEYS = {
        LAST_NOTIFICATION: 'shike_last_notification',
        LAST_REMINDER_CHECK: 'shike_last_reminder_check'
    };

    /**
     * Background restriction explanation shown to the user. Local web pages
     * cannot guarantee on-time reminders after the browser is fully closed.
     *
     * @constant {string}
     */
    var BACKGROUND_RESTRICTION_EXPLANATION =
        '仅依靠本地网页无法保证浏览器完全关闭后准时提醒。';

    /**
     * Reminder check behavior note. The page checks reminders while open;
     * system-level reminders for a closed browser are planned for later.
     *
     * @constant {string}
     */
    var REMINDER_CHECK_NOTE =
        '页面打开时会检查提醒；浏览器关闭后的后台提醒后续完善。';

    /**
     * Push Beta status descriptor. Cloud push is not deployed in this release.
     *
     * @constant {string}
     */
    var PUSH_BETA_STATUS = 'LOCAL_ONLY - 云推送服务未部署';

    /**
     * Safely reads a string value from localStorage.
     *
     * @param {string} key - The localStorage key to read.
     * @returns {string|null} The stored value, or null if unavailable/error.
     * @private
     */
    function readStorage(key) {
        try {
            if (typeof global.localStorage === 'undefined') {
                return null;
            }
            return global.localStorage.getItem(key);
        } catch (err) {
            // localStorage may throw in private mode or sandboxed contexts.
            return null;
        }
    }

    /**
     * Formats a raw timestamp (ms or ISO string) into a human-readable label.
     *
     * @param {string|null} raw - The raw stored value.
     * @returns {string} A formatted timestamp, or '—' when unavailable.
     * @private
     */
    function formatTimestamp(raw) {
        if (!raw) {
            return '—';
        }
        try {
            var ms = typeof raw === 'string' && /^\d+$/.test(raw)
                ? parseInt(raw, 10)
                : Date.parse(raw);
            if (isNaN(ms)) {
                return String(raw);
            }
            return new Date(ms).toLocaleString();
        } catch (err) {
            return String(raw);
        }
    }

    /**
     * Attempts to retrieve the PWA install state from the global
     * `ShikePwaInstallState` helper when it is available.
     *
     * @returns {string} The install state label, or 'unknown'.
     * @private
     */
    function getPwaInstallState() {
        try {
            if (global.ShikePwaInstallState &&
                typeof global.ShikePwaInstallState.getState === 'function') {
                return global.ShikePwaInstallState.getState() || 'unknown';
            }
            if (global.ShikePwaInstallState &&
                typeof global.ShikePwaInstallState === 'object') {
                // Some builds expose the state directly on the object.
                return global.ShikePwaInstallState.state ||
                    global.ShikePwaInstallState.installed ||
                    'unknown';
            }
            return 'unknown';
        } catch (err) {
            return 'error';
        }
    }

    /**
     * Reads the current Notification permission status.
     *
     * @returns {string} 'granted', 'denied', 'default', or 'unsupported'.
     * @private
     */
    function getNotificationPermission() {
        try {
            if (typeof global.Notification === 'undefined') {
                return 'unsupported';
            }
            return global.Notification.permission;
        } catch (err) {
            return 'unsupported';
        }
    }

    /**
     * Queries the current Service Worker registration status.
     *
     * @returns {Promise<string>} A label describing the SW state.
     * @private
     */
    function getServiceWorkerStatus() {
        try {
            if (typeof global.navigator === 'undefined' ||
                typeof global.navigator.serviceWorker === 'undefined' ||
                typeof global.navigator.serviceWorker.getRegistration !== 'function') {
                return Promise.resolve('unsupported');
            }
            return global.navigator.serviceWorker.getRegistration()
                .then(function (reg) {
                    return reg ? 'registered' : 'none';
                })
                .catch(function () {
                    return 'error';
                });
        } catch (err) {
            return Promise.resolve('error');
        }
    }

    /**
     * Returns the current document visibility state.
     *
     * @returns {string} 'visible', 'hidden', or 'unknown'.
     * @private
     */
    function getVisibilityState() {
        try {
            if (typeof global.document === 'undefined') {
                return 'unknown';
            }
            return global.document.visibilityState || 'unknown';
        } catch (err) {
            return 'unknown';
        }
    }

    /**
     * Retrieves a reminder count summary from the global
     * `ShikeReminderStatus` helper when available.
     *
     * @returns {Object|string} A summary object, or a status string.
     * @private
     */
    function getReminderCountSummary() {
        try {
            if (global.ShikeReminderStatus &&
                typeof global.ShikeReminderStatus.getSummary === 'function') {
                return global.ShikeReminderStatus.getSummary();
            }
            if (global.ShikeReminderStatus &&
                typeof global.ShikeReminderStatus === 'object') {
                return global.ShikeReminderStatus;
            }
            return 'unavailable';
        } catch (err) {
            return 'error';
        }
    }

    /**
     * Returns the Push Beta status for this release.
     *
     * Cloud push notifications are not deployed; reminders are local-only.
     *
     * @returns {string} The constant 'not_configured'.
     */
    function getPushBetaStatus() {
        return 'not_configured';
    }

    /**
     * Collects all diagnostic information into a single object.
     *
     * Because Service Worker status is queried asynchronously, this function
     * returns a Promise that resolves with the full diagnostic snapshot.
     *
     * @returns {Promise<Object>} A promise resolving to the diagnostic info.
     */
    function runDiagnostics() {
        try {
            return getServiceWorkerStatus().then(function (swStatus) {
                return {
                    timestamp: new Date().toISOString(),
                    version: '2.0.0-rc4',
                    phase: 'Reminder Reliability',
                    pwaInstallState: getPwaInstallState(),
                    notificationPermission: getNotificationPermission(),
                    serviceWorkerStatus: swStatus,
                    pageVisibility: getVisibilityState(),
                    backgroundRestrictions: BACKGROUND_RESTRICTION_EXPLANATION,
                    reminderCheckNote: REMINDER_CHECK_NOTE,
                    lastNotificationTime: readStorage(STORAGE_KEYS.LAST_NOTIFICATION),
                    lastReminderCheckTime: readStorage(STORAGE_KEYS.LAST_REMINDER_CHECK),
                    reminderCountSummary: getReminderCountSummary(),
                    pushBeta: {
                        status: getPushBetaStatus(),
                        descriptor: PUSH_BETA_STATUS
                    }
                };
            });
        } catch (err) {
            return Promise.resolve({
                timestamp: new Date().toISOString(),
                error: 'Diagnostics failed: ' + (err && err.message ? err.message : String(err))
            });
        }
    }

    /**
     * Sends a test notification to verify the local notification subsystem.
     *
     * Requests permission if needed, then displays a notification titled
     * "时刻 测试提醒" with a descriptive body.
     *
     * @returns {Promise<boolean>} Resolves true if the notification was shown.
     */
    function testNotification() {
        try {
            if (typeof global.Notification === 'undefined') {
                return Promise.resolve(false);
            }

            var showNotification = function () {
                try {
                    var n = new global.Notification('时刻 测试提醒', {
                        body: '这是一条来自 Shike 诊断页的测试提醒。',
                        tag: 'shike-test-notification'
                    });
                    // Record the test notification time.
                    try {
                        global.localStorage.setItem(
                            STORAGE_KEYS.LAST_NOTIFICATION,
                            String(Date.now())
                        );
                    } catch (storageErr) {
                        // Ignore storage write failures.
                    }
                    return true;
                } catch (notifErr) {
                    return false;
                }
            };

            if (global.Notification.permission === 'granted') {
                return Promise.resolve(showNotification());
            }

            if (global.Notification.permission === 'denied') {
                return Promise.resolve(false);
            }

            return global.Notification.requestPermission()
                .then(function (perm) {
                    if (perm === 'granted') {
                        return showNotification();
                    }
                    return false;
                })
                .catch(function () {
                    return false;
                });
        } catch (err) {
            return Promise.resolve(false);
        }
    }

    /**
     * Schedules a test reminder to fire after the given number of minutes.
     *
     * Uses a timeout-based schedule while the page is open. If the global
     * `ShikeReminderScheduler` is available, it will be used; otherwise a
     * fallback `setTimeout` is used and a test notification is shown.
     *
     * @param {number} [minutes=1] - Minutes until the test reminder fires.
     * @returns {Promise<boolean>} Resolves true when the reminder is scheduled.
     */
    function testDelayedReminder(minutes) {
        try {
            var delayMinutes = typeof minutes === 'number' && minutes > 0
                ? minutes
                : 1;
            var delayMs = delayMinutes * 60 * 1000;

            // Prefer the project's scheduler if available.
            if (global.ShikeReminderScheduler &&
                typeof global.ShikeReminderScheduler.schedule === 'function') {
                global.ShikeReminderScheduler.schedule({
                    delay: delayMs,
                    title: '时刻 延时测试提醒',
                    body: '这是 ' + delayMinutes + ' 分钟后触发的测试提醒。'
                });
            } else {
                // Fallback: schedule locally while the page is open.
                global.setTimeout(function () {
                    try {
                        testNotification();
                    } catch (fireErr) {
                        // Swallow; diagnostics should not throw to the page.
                    }
                }, delayMs);
            }

            return Promise.resolve(true);
        } catch (err) {
            return Promise.resolve(false);
        }
    }

    /**
     * Triggers an ICS calendar export via the `ShikeCalendarBridge` global.
     *
     * @returns {Promise<boolean>} Resolves true if the export was initiated.
     */
    function exportCalendar() {
        try {
            if (global.ShikeCalendarBridge &&
                typeof global.ShikeCalendarBridge.exportICS === 'function') {
                return Promise.resolve(global.ShikeCalendarBridge.exportICS());
            }
            if (global.ShikeCalendarBridge &&
                typeof global.ShikeCalendarBridge.export === 'function') {
                return Promise.resolve(global.ShikeCalendarBridge.export());
            }
            return Promise.resolve(false);
        } catch (err) {
            return Promise.resolve(false);
        }
    }

    /**
     * Builds a single diagnostic status row element.
     *
     * @param {string} label - The row label.
     * @param {string} value - The row value.
     * @returns {HTMLElement} A <div> element styled as a diagnostic row.
     * @private
     */
    function buildStatusRow(label, value) {
        try {
            var row = global.document.createElement('div');
            row.className = 'shike-diag-row';

            var labelEl = global.document.createElement('span');
            labelEl.className = 'shike-diag-label';
            labelEl.textContent = label;

            var valueEl = global.document.createElement('span');
            valueEl.className = 'shike-diag-value';
            valueEl.textContent = String(value);

            row.appendChild(labelEl);
            row.appendChild(valueEl);
            return row;
        } catch (err) {
            return null;
        }
    }

    /**
     * Builds an action button element.
     *
     * @param {string} text - The button label.
     * @param {Function} handler - The click handler.
     * @returns {HTMLElement} A <button> element.
     * @private
     */
    function buildButton(text, handler) {
        try {
            var btn = global.document.createElement('button');
            btn.type = 'button';
            btn.className = 'shike-diag-btn';
            btn.textContent = text;
            btn.addEventListener('click', function () {
                try {
                    var result = handler();
                    if (result && typeof result.then === 'function') {
                        result.then(function () {}, function () {});
                    }
                } catch (clickErr) {
                    // Suppress handler errors to keep the page stable.
                }
            });
            return btn;
        } catch (err) {
            return null;
        }
    }

    /**
     * Renders the full diagnostics panel into the provided container element.
     *
     * Runs the diagnostics asynchronously and populates the container with
     * status rows, action buttons, the push beta status section, and the
     * background-restriction advisory text.
     *
     * @param {HTMLElement} container - The element to render diagnostics into.
     * @returns {Promise<void>} Resolves when rendering is complete.
     */
    function render(container) {
        try {
            if (!container || typeof container.appendChild !== 'function') {
                return Promise.resolve();
            }

            // Clear previous content.
            container.innerHTML = '';

            var wrapper = global.document.createElement('div');
            wrapper.className = 'shike-reminder-diagnostics';

            // Header.
            var header = global.document.createElement('h2');
            header.className = 'shike-diag-title';
            header.textContent = '时刻 提醒诊断 (v2.0.0-rc5)';
            wrapper.appendChild(header);

            // Advisory: background restriction.
            var advisory = global.document.createElement('p');
            advisory.className = 'shike-diag-advisory';
            advisory.textContent = BACKGROUND_RESTRICTION_EXPLANATION;
            wrapper.appendChild(advisory);

            // Advisory: reminder check behavior.
            var note = global.document.createElement('p');
            note.className = 'shike-diag-note';
            note.textContent = REMINDER_CHECK_NOTE;
            wrapper.appendChild(note);

            // Status section.
            var statusSection = global.document.createElement('section');
            statusSection.className = 'shike-diag-status';
            var statusTitle = global.document.createElement('h3');
            statusTitle.textContent = '诊断状态';
            statusSection.appendChild(statusTitle);

            var loading = global.document.createElement('p');
            loading.textContent = '正在收集诊断信息…';
            statusSection.appendChild(loading);

            wrapper.appendChild(statusSection);

            // Actions section.
            var actionsSection = global.document.createElement('section');
            actionsSection.className = 'shike-diag-actions';
            var actionsTitle = global.document.createElement('h3');
            actionsTitle.textContent = '操作';
            actionsSection.appendChild(actionsTitle);

            var btnContainer = global.document.createElement('div');
            btnContainer.className = 'shike-diag-btn-group';
            btnContainer.appendChild(
                buildButton('测试通知', testNotification)
            );
            btnContainer.appendChild(
                buildButton('测试 1 分钟提醒', function () {
                    return testDelayedReminder(1);
                })
            );
            btnContainer.appendChild(
                buildButton('导出日历 (ICS)', exportCalendar)
            );
            actionsSection.appendChild(btnContainer);

            wrapper.appendChild(actionsSection);

            // Push beta section.
            var pushSection = global.document.createElement('section');
            pushSection.className = 'shike-diag-push';
            var pushTitle = global.document.createElement('h3');
            pushTitle.textContent = 'Push Beta 状态';
            pushSection.appendChild(pushTitle);

            var pushStatus = global.document.createElement('p');
            pushStatus.className = 'shike-diag-push-status';
            pushStatus.textContent = PUSH_BETA_STATUS;
            pushSection.appendChild(pushStatus);

            var pushDetail = global.document.createElement('p');
            pushDetail.className = 'shike-diag-push-detail';
            pushDetail.textContent =
                'getPushBetaStatus() = ' + getPushBetaStatus();
            pushSection.appendChild(pushDetail);

            wrapper.appendChild(pushSection);

            container.appendChild(wrapper);

            // Populate status rows once diagnostics resolve.
            return runDiagnostics().then(function (info) {
                try {
                    statusSection.removeChild(loading);
                } catch (removeErr) {
                    // Ignore if already removed.
                }

                statusSection.appendChild(
                    buildStatusRow('版本', info.version || '—')
                );
                statusSection.appendChild(
                    buildStatusRow('阶段', info.phase || '—')
                );
                statusSection.appendChild(
                    buildStatusRow('PWA 安装状态',
                        info.pwaInstallState || '—')
                );
                statusSection.appendChild(
                    buildStatusRow('通知权限',
                        info.notificationPermission || '—')
                );
                statusSection.appendChild(
                    buildStatusRow('Service Worker',
                        info.serviceWorkerStatus || '—')
                );
                statusSection.appendChild(
                    buildStatusRow('页面可见性',
                        info.pageVisibility || '—')
                );
                statusSection.appendChild(
                    buildStatusRow('最近通知时间',
                        formatTimestamp(info.lastNotificationTime))
                );
                statusSection.appendChild(
                    buildStatusRow('最近提醒检查时间',
                        formatTimestamp(info.lastReminderCheckTime))
                );

                var summary = info.reminderCountSummary;
                var summaryText = typeof summary === 'object'
                    ? JSON.stringify(summary)
                    : String(summary);
                statusSection.appendChild(
                    buildStatusRow('提醒计数摘要', summaryText)
                );
            }).catch(function (renderErr) {
                try {
                    statusSection.removeChild(loading);
                } catch (removeErr) {
                    // Ignore.
                }
                statusSection.appendChild(
                    buildStatusRow('错误',
                        '渲染失败: ' + (renderErr && renderErr.message
                            ? renderErr.message
                            : String(renderErr)))
                );
            });
        } catch (err) {
            return Promise.resolve();
        }
    }

    /**
     * Public API for the reminder diagnostics module.
     *
     * @namespace ShikeReminderDiagnostics
     */
    var api = {
        runDiagnostics: runDiagnostics,
        render: render,
        testNotification: testNotification,
        testDelayedReminder: testDelayedReminder,
        exportCalendar: exportCalendar,
        getPushBetaStatus: getPushBetaStatus
    };

    // Export to the global scope.
    global.ShikeReminderDiagnostics = api;

})(typeof window !== 'undefined' ? window : this);
