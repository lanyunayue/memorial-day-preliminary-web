const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';

function assert(condition, message) { if (!condition) throw new Error(message); }

const checks = [];
function add(name, run) { checks.push({ name, run }); }

add('data safety section exists', () => {
  assert(html.includes('data-i18n="dataSafety"'), 'data safety title should exist');
});

add('current record count copy exists', () => {
  assert(html.includes('id="safetyRecordCount"'), 'record count value should exist');
  assert(script.includes('recordCountLabel'), 'record count i18n key should exist');
});

add('exportable and undated count values exist', () => {
  assert(html.includes('id="safetyExportableCount"'), 'exportable count value should exist');
  assert(html.includes('id="safetyUndatedCount"'), 'undated count value should exist');
  assert(script.includes('countExportableRecords'), 'exportable counter function should exist');
  assert(script.includes('countUndatedRecords'), 'undated counter function should exist');
});

add('last backup time copy exists', () => {
  assert(html.includes('id="safetyLastBackup"'), 'last backup value should exist');
  assert(script.includes('LAST_BACKUP_KEY'), 'last backup key constant should exist');
  assert(script.includes('shike_last_backup_at'), 'localStorage backup key should be used');
});

add('JSON backup and import buttons exist', () => {
  assert(html.includes('id="exportBackupBtnMy"'), 'JSON backup button should exist');
  assert(html.includes('id="restoreFileInputMy"'), 'JSON import input should exist');
});

add('JSON and ICS difference is explained', () => {
  assert(script.includes('backupVsCalendarHint'), 'backup vs calendar hint key should exist');
  assert(html.includes('data-i18n="backupVsCalendarHint"'), 'backup vs calendar hint should be rendered');
});

add('local browser data risk is explained honestly', () => {
  assert(script.includes('时刻的数据保存在当前浏览器'), 'local browser storage copy should exist');
  assert(script.includes('重要记录建议定期导出备份'), 'backup advice should exist');
});

add('backup export writes last backup timestamp', () => {
  assert(script.includes('markBackupExported'), 'markBackupExported function should exist');
  assert(script.includes('localStorage.setItem(LAST_BACKUP_KEY'), 'last backup timestamp should be written');
});

add('backup status avoids scary absolute-loss wording', () => {
  assert(!/数据必定丢失|必然丢失|马上丢失|无法恢复/.test(html + script), 'should avoid scary absolute-loss copy');
});

const failures = [];
for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Data safety center regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Data safety center regression passed: ${checks.length}/${checks.length}`);
