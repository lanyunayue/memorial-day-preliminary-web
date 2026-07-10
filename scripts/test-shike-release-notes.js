const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];
function add(name, run) { checks.push({ name, run }); }

add('release note modal markup exists', () => {
  ['releaseMask', 'releaseBox', 'releaseTitle', 'releaseMeta', 'releaseList', 'releaseOkBtn'].forEach((id) => {
    assert(html.includes(`id="${id}"`), `${id} missing`);
  });
  assert(html.includes('role="dialog"'), 'release dialog role missing');
});

add('release note persistence key is stable', () => {
  assert(script.includes("shike_seen_release_note_version"), 'release note localStorage key missing');
  assert(script.includes('RELEASE_NOTE_SEEN_KEY'), 'release note key constant missing');
});

add('release note lifecycle functions exist', () => {
  ['releaseNotesSeen', 'markReleaseNotesSeen', 'getReleaseNotes', 'showReleaseNotes', 'closeReleaseNotes', 'maybeShowReleaseNotes'].forEach((fn) => {
    assert(script.includes(`function ${fn}`), `${fn} missing`);
  });
});

add('release notes include current version and updated time', () => {
  assert(script.includes("APP_VERSION='v1.1.0'"), 'APP_VERSION should be v1.1.0');
  assert(/APP_UPDATED_AT='\d{4}-\d{2}-\d{2} \d{2}:\d{2}'/.test(script), 'APP_UPDATED_AT should use release timestamp format');
  assert(script.includes("tf('releaseMeta',{version:APP_VERSION,time:APP_UPDATED_AT})"), 'release meta should use version and time');
});

add('release notes have five concise bullets', () => {
  ['releaseNote1', 'releaseNote2', 'releaseNote3', 'releaseNote4', 'releaseNote5'].forEach((key) => {
    assert(script.includes(key), `${key} missing`);
  });
  assert(script.includes('getReleaseNotes().map'), 'release list should render from notes');
});

add('release notes show after opening and close once', () => {
  assert(script.includes('maybeShowReleaseNotes();'), 'opening flow should schedule release notes');
  assert(script.includes("b('releaseOkBtn','click',closeReleaseNotes)"), 'OK button should close release notes');
  assert(script.includes('markReleaseNotesSeen();'), 'close should persist seen version');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Release notes regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Release notes regression passed: ${checks.length}/${checks.length}`);
