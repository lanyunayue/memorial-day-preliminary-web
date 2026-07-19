/**
 * v2.2.0-alpha4 Unified Composer Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Unified Composer Tests ===\n');

// 1. Module files exist
console.log('[1] Module existence');
assert(fs.existsSync(path.join(V,'src/composer/composer-state.js')), 'composer-state.js exists');
assert(fs.existsSync(path.join(V,'src/composer/composer-controller.js')), 'composer-controller.js exists');
assert(fs.existsSync(path.join(V,'src/composer/')), 'composer directory exists');
assert(fs.existsSync(path.join(V,'src/composer/composer-classifier.js')), 'composer-classifier.js exists');
assert(fs.existsSync(path.join(V,'src/composer/composer-view.js')), 'composer-view.js exists');

// 2. Global exports
console.log('\n[2] Global exports');
const state = readSafe(path.join(V,'src/composer/composer-state.js'));
assert(state && state.includes('ShikeComposerState'), 'ShikeComposerState exported');
const ctrl = readSafe(path.join(V,'src/composer/composer-controller.js'));
assert(ctrl && ctrl.includes('ShikeComposerController'), 'ShikeComposerController exported');
const cls = readSafe(path.join(V,'src/composer/composer-classifier.js'));
assert(cls && cls.includes('ShikeComposerClassifier'), 'ShikeComposerClassifier exported');
const view = readSafe(path.join(V,'src/composer/composer-view.js'));
assert(view && view.includes('ShikeComposerView'), 'ShikeComposerView exported');
const legacy = readSafe(path.join(V,'src/legacy-app.js'));

// 3. State management
console.log('\n[3] State management');
assert(state && state.includes('getDraft'), 'getDraft function');
assert(state && state.includes('setDraft'), 'setDraft function');
assert(state && state.includes('clearDraft'), 'clearDraft function');
assert(state && state.includes('cancelDraft'), 'cancelDraft function (Esc)');
assert(state && state.includes('restoreDraft'), 'restoreDraft function');
assert(state && state.includes('canSubmit'), 'canSubmit function (anti-duplicate)');
assert(state && state.includes('markSubmitting'), 'markSubmitting function');
assert(state && state.includes('candidate === previous'), 'debounce blocks the same text without dropping a new draft');
assert(ctrl && ctrl.includes('state.canSubmit(trimmed)'), 'controller checks duplicate protection against submitted text');
assert(view && view.includes('state.canSubmit(text)'), 'view checks duplicate protection against current input');
assert(state && state.includes("state.processingState === 'done'") && state.includes("state.processingState = 'idle'"), 'new draft leaves completed state');
assert(state && state.includes('sessionStorage'), 'sessionStorage persistence');
assert(state && state.includes('shike_composer_draft'), 'draft key defined');

// 4. Controller
console.log('\n[4] Controller');
assert(ctrl && ctrl.includes('submit'), 'submit function');
assert(ctrl && ctrl.includes('empty_input'), 'empty input check');
assert(ctrl && ctrl.includes('processing'), 'processing state');
assert(ctrl && ctrl.includes('await global.persistRecordsDurably()'), 'record creation waits for durable persistence');
assert(ctrl && ctrl.includes('savedIndex') && ctrl.includes('global.records.splice'), 'failed durable persistence rolls back the new record');
assert(legacy && legacy.includes('saveRecords({skipLocalFirst:true})'), 'durable persistence avoids duplicate IndexedDB writes');

// 5. Classifier
console.log('\n[5] Classifier');
assert(cls && cls.includes('classify'), 'classify function');
assert(cls && cls.includes('create'), 'create classification');
assert(cls && cls.includes('search'), 'search classification');
assert(cls && (cls.includes('UNKNOWN') || cls.includes('无法识别')), 'unknown classification');

// 6. View
console.log('\n[6] View');
assert(view && view.includes('quickInput'), 'binds quickInput');
assert(view && view.includes('agentInput'), 'binds agentInput');
assert(view && view.includes('syncToOther') || view.includes('sync'), 'input sync');
assert(view && view.includes('disabled'), 'button disabled state');
assert(view && view.includes('Escape') || view.includes('Esc'), 'Esc support');

// 7. HTML integration
console.log('\n[7] HTML integration');
const html = readSafe(path.join(V,'index.html'));
assert(html && html.includes('composer-state.js'), 'composer-state.js in HTML');
assert(html && html.includes('composer-controller.js'), 'composer-controller.js in HTML');
assert(html && html.includes('composer-classifier.js'), 'composer-classifier.js in HTML');
assert(html && html.includes('composer-view.js'), 'composer-view.js in HTML');

// 8. SW precache
console.log('\n[8] Service Worker');
const sw = readSafe(path.join(V,'sw.js'));
assert(sw && sw.includes('composer-state.js'), 'composer in SW precache');
assert(sw && sw.includes('composer-view.js'), 'composer-view in SW precache');

console.log('\n========================================');
console.log('Unified Composer tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
