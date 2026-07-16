const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

const tests = [
  {
    name: 'PWA assets',
    script: 'test-shike-pwa-assets.js',
    expected: 'PWA asset regression passed: 8/8'
  },
  {
    name: 'HTML integrity',
    script: 'test-shike-html-integrity.js',
    expected: 'HTML integrity regression passed: 7/7'
  },
  {
    name: 'A11y static',
    script: 'test-shike-a11y-static.js',
    expected: 'A11y static regression passed: 6/6'
  },
  {
    name: 'Demo examples',
    script: 'test-shike-demo-examples.js',
    expected: 'Demo examples regression passed: 6/6'
  },
  {
    name: 'Demo route',
    script: 'test-shike-demo-route.js',
    expected: 'Demo route regression passed: 18/18'
  },
  {
    name: 'Time sprite',
    script: 'test-shike-time-sprite.js',
    expected: 'Time sprite regression passed: 8/8'
  },
  {
    name: 'Responsive CSS',
    script: 'test-shike-responsive-css.js',
    expected: 'Responsive CSS regression passed: 9/9'
  },
  {
    name: 'I18N placeholders',
    script: 'test-shike-i18n-placeholders.js',
    expected: 'I18N placeholder regression passed: 6/6'
  },
  {
    name: 'ICS export',
    script: 'test-shike-ics-export.js',
    expected: 'ICS export regression passed: 11/11'
  },
  {
    name: 'Backup hardening',
    script: 'test-shike-backup-hardening.js',
    expected: 'Backup hardening regression passed: 11/11'
  },
  {
    name: 'ICS deep',
    script: 'test-shike-ics-deep.js',
    expected: 'ICS deep regression passed: 14/14'
  },
  {
    name: 'Data safety center',
    script: 'test-shike-data-safety-center.js',
    expected: 'Data safety center regression passed: 9/9'
  },
  {
    name: 'Import preview',
    script: 'test-shike-import-preview.js',
    expected: 'Import preview regression passed: 10/10'
  },
  {
    name: 'PWA notice',
    script: 'test-shike-pwa-notice.js',
    expected: 'PWA notice regression passed: 6/6'
  },
  {
    name: 'Timeline',
    script: 'test-shike-timeline.js',
    expected: 'Timeline regression passed: 10/10'
  },
  {
    name: 'Card export',
    script: 'test-shike-card-export.js',
    expected: 'Card export regression passed: 10/10'
  },
  {
    name: 'Today overview',
    script: 'test-shike-today-overview.js',
    expected: 'Today overview regression passed: 8/8'
  },
  {
    name: 'Parse preview',
    script: 'test-shike-parse-preview.js',
    expected: 'Parse preview regression passed: 10/10'
  },
  {
    name: 'Correction chips',
    script: 'test-shike-correction-chips.js',
    expected: 'Correction chips regression passed: 10/10'
  },
  {
    name: 'Later inbox',
    script: 'test-shike-later-inbox.js',
    expected: 'Later inbox regression passed: 10/10'
  },
  {
    name: 'Example chips',
    script: 'test-shike-example-chips.js',
    expected: 'Example chips regression passed: 7/7'
  },
  {
    name: 'Keyboard capture',
    script: 'test-shike-keyboard-capture.js',
    expected: 'Keyboard capture regression passed: 7/7'
  },
  {
    name: 'Batch capture inbox',
    script: 'test-shike-batch-capture-inbox.js',
    expected: 'Batch capture inbox regression passed: 8/8'
  },
  {
    name: 'Draft edit handoff',
    script: 'test-shike-draft-edit-handoff.js',
    expected: 'Draft edit handoff regression passed: 6/6'
  },
  {
    name: 'Batch dedupe',
    script: 'test-shike-batch-dedupe.js',
    expected: 'Batch dedupe regression passed: 6/6'
  },
  {
    name: 'Draft existing dedupe',
    script: 'test-shike-draft-existing-dedupe.js',
    expected: 'Draft existing dedupe regression passed: 6/6'
  },
  {
    name: 'Batch save feedback',
    script: 'test-shike-batch-save-feedback.js',
    expected: 'Batch save feedback regression passed: 6/6'
  },
  {
    name: 'Unsaved work guard',
    script: 'test-shike-unsaved-work-guard.js',
    expected: 'Unsaved work guard regression passed: 6/6'
  },
  {
    name: 'Home simplification',
    script: 'test-shike-home-simplification.js',
    expected: 'Home simplification regression passed: 6/6'
  },
  {
    name: 'Release notes',
    script: 'test-shike-release-notes.js',
    expected: 'Release notes regression passed: 6/6'
  },
  {
    name: 'Feedback entry',
    script: 'test-shike-feedback-entry.js',
    expected: 'Feedback entry regression passed: 6/6'
  },
  {
    name: 'Swipe actions',
    script: 'test-shike-swipe-actions.js',
    expected: 'Swipe actions regression passed: 6/6'
  },
  {
    name: 'Sprite upgrade',
    script: 'test-shike-sprite-upgrade.js',
    expected: 'Sprite upgrade regression passed: 6/6'
  },
  {
    name: 'My page priority',
    script: 'test-shike-my-page-priority.js',
    expected: 'My page priority regression passed: 24/24'
  },
  {
    name: 'Sprite assistant 2',
    script: 'test-shike-sprite-assistant-2.js',
    expected: 'Sprite assistant 2 regression passed: 34/34'
  },
  {
    name: 'Feature hub cleanup',
    script: 'test-shike-feature-hub-cleanup.js',
    expected: 'Feature hub cleanup regression passed: 22/22'
  },
  {
    name: 'Record actions polish',
    script: 'test-shike-record-actions-polish.js',
    expected: 'Record actions polish regression passed: 35/35'
  },
  {
    name: 'Release feedback center',
    script: 'test-shike-release-feedback-center.js',
    expected: 'Release feedback center regression passed: 17/17'
  },
  {
    name: 'v1.0.0-rc release',
    script: 'test-shike-v100rc-release.js',
    expected: 'v1.0.0-rc release regression passed: 40/40'
  },
  {
    name: 'v1.0.0 stable release',
    script: 'test-shike-v100-stable.js',
    expected: 'v1.0.0 stable regression passed: 24/24'
  },
  {
    name: 'Module boundaries',
    script: 'test-shike-module-boundaries.js',
    expected: 'Module boundary regression passed: 18/18'
  },
  {
    name: 'Import graph',
    script: 'test-shike-import-graph.js',
    expected: 'Import graph regression passed: 12/12'
  },
  {
    name: 'Offline assets',
    script: 'test-shike-offline-assets.js',
    expected: 'Offline asset regression passed: 10/10'
  },
  {
    name: 'IndexedDB repository',
    script: 'test-shike-indexeddb-repository.js',
    expected: 'IndexedDB repository regression passed: 13/13'
  },
  {
    name: 'Storage migration',
    script: 'test-shike-storage-migration.js',
    expected: 'Storage migration regression passed: 14/14'
  },
  {
    name: 'Data integrity',
    script: 'test-shike-data-integrity.js',
    expected: 'Data integrity regression passed: 16/16'
  },
  {
    name: 'Corruption quarantine',
    script: 'test-shike-corruption-quarantine.js',
    expected: 'Corruption quarantine regression passed: 10/10'
  },
  {
    name: 'V2 backup',
    script: 'test-shike-v2-backup.js',
    expected: 'V2 backup regression passed: 13/13'
  },
  {
    name: 'Agent core',
    script: 'test-shike-agent-core.js',
    expected: 'Agent core regression passed: 15/15'
  },
  {
    name: 'Agent tools',
    script: 'test-shike-agent-tools.js',
    expected: 'Agent tools regression passed: 19/19'
  },
  {
    name: 'Agent confirmation',
    script: 'test-shike-agent-confirmation.js',
    expected: 'Agent confirmation regression passed: 10/10'
  },
  {
    name: 'Agent conversation',
    script: 'test-shike-agent-conversation.js',
    expected: 'Agent conversation regression passed: 8/8'
  },
  {
    name: 'Agent security',
    script: 'test-shike-agent-security.js',
<<<<<<< HEAD
    expected: 'Agent security regression passed: 12/12'
=======
    expected: 'Agent security regression passed: 11/11'
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  },
  {
    name: 'Home initial layout',
    script: 'test-shike-home-initial-layout.js',
    expected: 'Home initial layout regression passed'
  },
  {
    name: 'Sprite create intent',
    script: 'test-shike-sprite-create-intent.js',
<<<<<<< HEAD
    expected: 'Sprite create intent tests passed'
=======
    expected: 'Sprite create intent tests passed: 102/102'
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  },
  {
    name: 'Record actions responsive',
    script: 'test-shike-record-actions-responsive.js',
    expected: 'Responsive actions tests passed: 45/45'
  },
  {
    name: 'Agent context proactive',
    script: 'test-shike-agent-context-proactive.js',
    expected: 'Agent context tests passed: 65/65'
  },
  {
<<<<<<< HEAD
    name: 'Watch center',
    script: 'test-shike-watch-center.js',
    expected: 'Watch center regression passed: 37/37'
=======
    name: 'v1.5 bear workbench',
    script: 'test-shike-v150-bear-workbench.js',
    expected: 'v1.5 bear workbench regression passed'
  },
  {
    name: 'Watch removal contract',
    script: 'test-shike-watch-removal-contract.js',
    expected: 'All checks passed.'
  },
  {
    name: 'Navigation consolidation',
    script: 'test-shike-navigation-consolidation.js',
    expected: 'All checks passed.'
  },
  {
    name: 'Settings consolidation',
    script: 'test-shike-settings-consolidation.js',
    expected: 'All checks passed.'
  },
  {
    name: 'Permission settings',
    script: 'test-shike-permission-settings.js',
    expected: 'All checks passed.'
  },
  {
    name: 'Reminder settings',
    script: 'test-shike-reminder-settings.js',
    expected: 'All checks passed.'
  },
  {
    name: 'Data tools in My',
    script: 'test-shike-data-tools-in-my.js',
    expected: 'All checks passed.'
  },
  {
    name: 'No dead routes',
    script: 'test-shike-no-dead-routes.js',
    expected: 'All checks passed.'
  },
  {
    name: 'Test integrity',
    script: 'test-shike-test-integrity.js',
    expectedPattern: /Test Integrity: (\d+) checks, \1 passed, 0 failed/
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  },
];

[
  {
    name: 'NLP parser',
    script: 'test-shike-nlp-parser.js',
    expected: 'NLP parser regression passed'
  },
  {
    name: 'Record id uniqueness',
    script: 'test-shike-record-id-uniqueness.js',
    expected: 'Record id uniqueness regression passed'
  }
].forEach((optionalTest) => {
  const scriptPath = path.join(__dirname, optionalTest.script);
  if (require('fs').existsSync(scriptPath)) tests.push(optionalTest);
});

const startedAt = Date.now();
const results = [];

for (const test of tests) {
  const scriptPath = path.join(__dirname, test.script);
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const stdout = (result.stdout || '').trim();
  const stderr = (result.stderr || '').trim();
  const output = [stdout, stderr].filter(Boolean).join('\n');
  const outputMatched = test.expectedPattern
    ? test.expectedPattern.test(output)
    : output.includes(test.expected);
  const passed = result.status === 0 && outputMatched;

  results.push({
    name: test.name,
    script: test.script,
    status: result.status,
    passed,
    output
  });

  const mark = passed ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${test.name}`);
  if (output) {
    output.split(/\r?\n/).forEach((line) => console.log(`  ${line}`));
  }
}

const failed = results.filter((result) => !result.passed);
const elapsedMs = Date.now() - startedAt;

console.log('');
console.log(`Shike clean candidate suite: ${results.length - failed.length}/${results.length} passed in ${elapsedMs}ms`);

if (failed.length) {
  console.error('');
  console.error('Failed checks:');
  failed.forEach((result) => {
    console.error(`- ${result.name} (${result.script}) exit=${result.status}`);
  });
  process.exit(1);
}
