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

// Extract My page and dataBackupSection
const myStart = html.indexOf('id="page-my"');
const myEnd = html.indexOf('<!-- Drawer -->', myStart);
const mySection = html.slice(myStart, myEnd);
const dbStart = mySection.indexOf('id="dataBackupSection"');
const expStart = mySection.indexOf('id="experienceExampleSection"');
const dataBackupSection = mySection.slice(dbStart, expStart > dbStart ? expStart : undefined);

// [1] dataBackupSection contains trashList container
section('dataBackupSection contains trashList container');
check('trashList container exists in dataBackupSection', dataBackupSection.includes('id="trashList"'));
check('trashList is inside a details/summary for 回收站', dataBackupSection.includes('data-i18n="trashTitle"'));

// [2] dataBackupSection contains snapshotList container
section('dataBackupSection contains snapshotList container');
check('snapshotList container exists in dataBackupSection', dataBackupSection.includes('id="snapshotList"'));
check('snapshotList is inside a details/summary for 数据快照', dataBackupSection.includes('data-i18n="snapshotTitle"'));

// [3] dataBackupSection contains createSnapshotBtn
section('dataBackupSection contains createSnapshotBtn');
check('createSnapshotBtn exists in dataBackupSection', dataBackupSection.includes('id="createSnapshotBtn"'));
check('createSnapshotBtn has createSnapshot label', dataBackupSection.includes('data-i18n="createSnapshot"'));

// [4] dataBackupSection contains emptyTrashBtn
section('dataBackupSection contains emptyTrashBtn');
check('emptyTrashBtn exists in dataBackupSection', dataBackupSection.includes('id="emptyTrashBtn"'));
check('emptyTrashBtn has emptyTrash label', dataBackupSection.includes('data-i18n="emptyTrash"'));

// [5] dataBackupSection contains export/import buttons
section('dataBackupSection contains export/import buttons');
check('exportBackupBtnMy exists in dataBackupSection', dataBackupSection.includes('id="exportBackupBtnMy"'));
check('exportBackupBtnMy has exportJsonBackup label', dataBackupSection.includes('data-i18n="exportJsonBackup"'));
check('restoreFileInputMy exists in dataBackupSection', dataBackupSection.includes('id="restoreFileInputMy"'));
check('restoreFileInputMy accepts .json files', dataBackupSection.includes('accept=".json"'));

// [6] Trash module script tag exists in HTML
section('Trash module script tag exists in HTML');
check('trash-repository.js script tag in HTML', html.includes('src/storage/trash-repository.js'));
check('trash-repository.js file exists on disk', fs.existsSync(path.join(root, 'src/storage/trash-repository.js')));
check('Trash repository initialized in JS', /ShikeTrashRepository/.test(legacyApp));

// [7] Snapshot module script tag exists
section('Snapshot module script tag exists');
check('snapshot-service.js script tag in HTML', html.includes('src/storage/snapshot-service.js'));
check('snapshot-service.js file exists on disk', fs.existsSync(path.join(root, 'src/storage/snapshot-service.js')));

// [8] Backup/restore functionality buttons present
section('Backup/restore functionality buttons present');
check('exportQuarantineBtn exists in dataBackupSection', dataBackupSection.includes('id="exportQuarantineBtn"'));
check('safetyRecordCount exists', dataBackupSection.includes('id="safetyRecordCount"'));
check('safetyLastBackup exists', dataBackupSection.includes('id="safetyLastBackup"'));
check('exportBackupFile function exists in JS', /function exportBackupFile/.test(legacyApp));
check('Backup module (backup.js) exists on disk', fs.existsSync(path.join(root, 'src/storage/backup.js')));
check('Encrypted backup module loaded', html.includes('src/storage/encrypted-backup.js'));

// [9] Storage engine status display present (storageEngineStatus)
section('Storage engine status display present');
check('storageEngineStatus exists in dataBackupSection', dataBackupSection.includes('id="storageEngineStatus"'));
check('storageEngineStatus has storageEngineLabel', dataBackupSection.includes('data-i18n="storageEngineLabel"'));
check('quarantineCount exists in dataBackupSection', dataBackupSection.includes('id="quarantineCount"'));
check('Data safety hint present', dataBackupSection.includes('id="dataSafetyHint"') || dataBackupSection.includes('重要记录建议定期导出备份'));

// Summary
console.log(`\n========================================`);
console.log(`Data tools in My page: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) {
  console.log(`Failures:`);
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`All checks passed.`);
}
