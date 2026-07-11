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

add('sprite visual is character-based', () => {
  ['time-sprite-bear', 'bear-ear', 'bear-face', 'bear-eye', 'bear-nose'].forEach((token) => {
    assert(html.includes(token) || style.includes(token), `${token} missing`);
  });
});

add('sprite defaults to subtle CSS 2.5D with opt-in isolated WebGL', () => {
  assert(style.includes('@keyframes spriteFloat'), 'float animation missing');
  assert(style.includes('@keyframes spriteBlink'), 'blink animation missing');
  assert(script.includes("renderer:'2d'"), '2.5D should be the default renderer');
  assert(html.includes('id="sprite3dCanvas"'), 'optional 3D canvas missing');
  assert(style.includes('.sprite-3d-canvas{display:none'), '3D canvas must be hidden by default');
  assert(script.includes("preferences.renderer==='3d'"), 'WebGL must start only after explicit 3D selection');
  assert(!html.includes('three.min.js') && !html.includes('.gltf'), 'no remote 3D engine or model should load by default');
});

add('sprite assistant actions exist', () => {
  ['timeSpriteInputBtn', 'timeSpriteTodayBtn', 'timeSpriteBatchBtn', 'timeSpriteCalendarBtn', 'timeSpriteBackupBtn', 'timeSpriteUpdateBtn'].forEach((id) => {
    assert(html.includes(`id="${id}"`), `${id} missing`);
  });
});

add('sprite actions call existing product flows', () => {
  assert(script.includes("b('timeSpriteTodayBtn','click',function(){switchPage('home')"), 'today action missing');
  assert(script.includes("b('timeSpriteBatchBtn','click',function(){switchPage('import')"), 'batch action missing');
  assert(script.includes("b('timeSpriteCalendarBtn','click',function(){switchPage('calendar')"), 'calendar action missing');
  assert(script.includes("b('timeSpriteBackupBtn','click',function(){jumpToMySection('dataSafetySection')"), 'backup action missing');
  assert(script.includes("b('timeSpriteUpdateBtn','click',function(){showReleaseNotes(true)"), 'update action missing');
});

add('sprite does not promise real agent capabilities', () => {
  ['大模型', '自动同步', '股票', '新闻', '全能 Agent', '真实 Agent'].forEach((text) => {
    assert(!html.includes(text), `forbidden promise text present: ${text}`);
  });
});

add('example action is no longer a duplicate visible entry', () => {
  assert(html.includes('id="timeSpriteDemoBtn"'), 'sprite demo shortcut should exist');
  assert(script.includes("jumpToMySection('experienceExampleSection')"), 'sprite demo shortcut should jump to My example section');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Sprite upgrade regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Sprite upgrade regression passed: ${checks.length}/${checks.length}`);
