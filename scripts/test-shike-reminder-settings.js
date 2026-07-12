const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

let pass = 0;
let fail = 0;
const failures = [];
let secNum = 0;

function section(name) {
  secNum++;
  console.log(`\n[${secNum}] ${name}`);
}

function check(name, condition) {
  if (condition) {
    pass++;
    console.log(`  PASS: ${name}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  FAIL: ${name}`);
  }
}

const legacyApp = fs.readFileSync(path.join(root, 'src/legacy-app.js'), 'utf8');

// Extract My page and reminderSection
const myStart = html.indexOf('id="page-my"');
const myEnd = html.indexOf('<!-- Drawer -->', myStart);
const mySection = html.slice(myStart, myEnd);
const remStart = mySection.indexOf('id="reminderSection"');
const permStart = mySection.indexOf('id="permissionSection"');
const reminderSection = mySection.slice(remStart, permStart > remStart ? permStart : undefined);

// [1] reminderSection contains notifyStatus element
section('reminderSection contains notifyStatus element');
check('notifyStatus exists in reminderSection', reminderSection.includes('id="notifyStatus"'));

// [2] reminderSection contains reqNotifyBtn
section('reminderSection contains reqNotifyBtn');
check('reqNotifyBtn exists in reminderSection', reminderSection.includes('id="reqNotifyBtn"'));
check('reqNotifyBtn has enableNotify label', reminderSection.includes('data-i18n="enableNotify"'));

// [3] reminderSection contains testNotifyBtn
section('reminderSection contains testNotifyBtn');
check('testNotifyBtn exists in reminderSection', reminderSection.includes('id="testNotifyBtn"'));
check('testNotifyBtn has testNotification label', reminderSection.includes('data-i18n="testNotification"'));

// [4] reminderSection contains defaultLeadTimeSelect
section('reminderSection contains defaultLeadTimeSelect');
check('defaultLeadTimeSelect exists in reminderSection', reminderSection.includes('id="defaultLeadTimeSelect"'));
check('defaultLeadTimeSelect has options including 15 minutes', reminderSection.includes('value="15"') && reminderSection.includes('selected'));
check('defaultLeadTimeSelect has at least 4 options', (reminderSection.match(/<option/g) || []).length >= 4);

// [5] reminderSection contains exportIcsBtnReminder
section('reminderSection contains exportIcsBtnReminder');
check('exportIcsBtnReminder exists in reminderSection', reminderSection.includes('id="exportIcsBtnReminder"'));
check('exportIcsBtnReminder has exportIcs label', reminderSection.includes('data-i18n="exportIcs"'));

// [6] Reminder engine module still loaded (script tag exists)
section('Reminder engine module still loaded (script tag exists)');
check('reminder-engine.js script tag in HTML', html.includes('src/reminders/reminder-engine.js'));
check('reminder-repository.js script tag in HTML', html.includes('src/reminders/reminder-repository.js'));
check('reminder-scheduler.js script tag in HTML', html.includes('src/reminders/reminder-scheduler.js'));
check('reminder-status.js script tag in HTML', html.includes('src/reminders/reminder-status.js'));
check('Reminder scheduler starts in init()', /ShikeReminderScheduler.*?\.start\(/.test(legacyApp));
check('reminder-engine.js file exists on disk', fs.existsSync(path.join(root, 'src/reminders/reminder-engine.js')));

// [7] ICS export capability preserved
section('ICS export capability preserved');
check('exportIcsBtnReminder button present', reminderSection.includes('id="exportIcsBtnReminder"'));
check('ICS export module loaded (ics-export.js exists)', fs.existsSync(path.join(root, 'src/calendar/ics-export.js')));
check('Calendar bridge loaded (calendar-bridge.js)', html.includes('src/reminders/calendar-bridge.js'));
check('export_calendar agent tool exists', legacyApp.includes("name:'export_calendar'") || fs.readFileSync(path.join(root, 'src/agent/tools/tool-definitions.js'), 'utf8').includes('export_calendar'));
check('exportIcsFile function exists in JS', /function exportIcsFile/.test(legacyApp));

// [8] Calendar export section still exists independently (calendarExportSection)
section('Calendar export section still exists independently');
check('calendarExportSection exists in My page (outside reminderSection)', mySection.includes('id="calendarExportSection"'));
check('calendarExportSection is separate from reminderSection', mySection.indexOf('id="calendarExportSection"') !== mySection.indexOf('id="reminderSection"'));
check('calendarExportSection contains exportIcsBtn', mySection.includes('id="exportIcsBtn"'));
check('calendarExportSection has ics export hint text', mySection.includes('data-i18n="calendarExportHint"'));

// [9] Honest reminder limitation text present
section('Honest reminder limitation text present');
check('Reminder limitation text about browser dependency present', reminderSection.includes('页面关闭后提醒不一定可靠') || reminderSection.includes('网页版提醒依赖浏览器'));
check('Reminder settings hint exists', reminderSection.includes('data-i18n="reminderSettingsHint"'));
check('Important schedules recommendation to export .ics present', reminderSection.includes('重要日程建议导出') || reminderSection.includes('.ics'));

// Summary
console.log(`\n========================================`);
console.log(`Reminder settings: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) {
  console.log(`Failures:`);
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`All checks passed.`);
}
