const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

function assert(condition, message) { if (!condition) throw new Error(message); }

const productText = html.replace(/<script>[\s\S]*?<\/script>/, '') + '\n' + script;
const checks = [];
function add(name, run) { checks.push({ name, run }); }

add('reminder notice copy exists', () => {
  assert(html.includes('data-i18n="reminderSettingsHint"'), 'reminder settings hint should exist');
  assert(script.includes('reminderNoticeText'), 'reminder notice copy should exist');
});

add('page-close limitation is stated honestly', () => {
  assert(script.includes('页面关闭后，长期提醒不一定可靠'), 'Chinese page-close limitation should exist');
  assert(script.includes('long-term reminders are not guaranteed'), 'English page-close limitation should exist');
});

add('important schedules are directed to system calendar via ics', () => {
  assert(script.includes('重要日程建议导出 .ics 到系统日历'), 'system calendar .ics advice should exist');
});

add('notification permission button or fallback copy exists', () => {
  assert(html.includes('id="reqNotifyBtn"') || script.includes('notifyUnsupported'), 'notification button or fallback should exist');
});

add('PWA install prompt or manual fallback exists', () => {
  assert(html.includes('id="installPwaBtn"'), 'install button should exist');
  assert(script.includes('beforeinstallprompt'), 'beforeinstallprompt should be handled');
  assert(script.includes('pwaInstallHint'), 'manual install fallback should exist');
});

add('copy does not overpromise background or permanent reminders', () => {
  ['后台稳定提醒', '永久提醒', '关闭网页后也能稳定提醒', '自动同步', '系统级提醒'].forEach((bad) => {
    assert(!productText.includes(bad), `overpromising copy should not appear: ${bad}`);
  });
});

const failures = [];
for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`PWA notice regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`PWA notice regression passed: ${checks.length}/${checks.length}`);
