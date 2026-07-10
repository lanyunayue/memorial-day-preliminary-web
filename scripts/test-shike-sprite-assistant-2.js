const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

const checks = [];
function add(name, condition) {
  checks.push({ name, passed: !!condition });
}
function countMatches(pattern) {
  return (html.match(pattern) || []).length;
}

add('bear container exists', html.includes('id="timeSprite"') && html.includes('time-sprite-bear'));
add('bear is not a plain dot', html.includes('bear-body') && html.includes('bear-highlight'));
add('bear face structure exists', html.includes('bear-face'));
add('bear ears structure exists', html.includes('bear-ear left') && html.includes('bear-ear right'));
add('bear body structure exists', html.includes('bear-body'));
add('bear shadow exists', html.includes('time-sprite-shadow'));
add('expand toggle exists', html.includes('id="timeSpriteToggle"') && html.includes('aria-expanded'));
add('collapse button exists', html.includes('id="timeSpriteClose"'));
add('greeting tip pool exists', ['spriteTip1', 'spriteTip2', 'spriteTip3', 'spriteTip4', 'spriteTip5'].every((key) => script.includes(key)));
add('at least six quick actions exist', countMatches(/class="time-sprite-action/g) >= 8);
add('remember-one action exists', html.includes('id="timeSpriteInputBtn"'));
add('batch organize action exists', html.includes('id="timeSpriteBatchBtn"'));
add('calendar action exists', html.includes('id="timeSpriteCalendarBtn"'));
add('calendar export action exists', html.includes('id="timeSpriteExportBtn"'));
add('data backup action exists', html.includes('id="timeSpriteBackupBtn"'));
add('update action exists', html.includes('id="timeSpriteUpdateBtn"'));
add('example action exists', html.includes('id="timeSpriteDemoBtn"'));
add('sprite position storage key is used', script.includes("SPRITE_POS_KEY='shike_sprite_pos'") && script.includes('localStorage.setItem(SPRITE_POS_KEY'));
add('sprite collapsed storage key is used', script.includes("SPRITE_COLLAPSED_KEY='shike_sprite_collapsed'") && script.includes('localStorage.setItem(SPRITE_COLLAPSED_KEY'));
add('last tip storage key is used', script.includes("SPRITE_LAST_TIP_KEY='shike_sprite_last_tip'"));
add('drag pointer events exist', ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].every((event) => script.includes(event)));
add('reset position button exists', html.includes('id="timeSpriteResetBtn"') && script.includes('resetTimeSpritePosition'));
add('future assistant wording is restrained', script.includes('spriteFutureHint') && !html.includes('已支持股票监控') && !html.includes('已支持实时新闻'));
add('no automatic trading claim', !html.includes('自动买卖建议') && !html.includes('智能交易建议'));
add('no background agent claim', !html.includes('真实 Agent 已上线') && !html.includes('后台常驻监控'));
add('no cloud sync claim', !html.includes('已支持云端同步') && !html.includes('云同步已上线'));
add('dark theme sprite style exists', style.includes('body.theme-night .time-sprite-orb') && style.includes('body.theme-night .time-sprite-panel'));
add('mobile constrained style exists', style.includes('@media (max-width:767px)') && style.includes('.time-sprite-panel{width:min(280px'));
add('z-index stays below bottom nav', /\.time-sprite\{[\s\S]*z-index:58/.test(style) && /\.nav\{[\s\S]*z-index:60/.test(style));
add('quick actions call existing navigation', ["switchPage('home')", "switchPage('import')", "switchPage('calendar')", "jumpToMySection('calendarExportSection')", "jumpToMySection('dataSafetySection')", 'showReleaseNotes(true)'].every((snippet) => script.includes(snippet)));
add('no heavy 3d library is introduced', !/three(\.min)?\.js|babylon|model-viewer|webgl/i.test(html));
add('version is v1.1.0', script.includes("APP_VERSION='v1.1.0'"));
add('updated timestamp has release format', /APP_UPDATED_AT='\d{4}-\d{2}-\d{2} \d{2}:\d{2}'/.test(script));
add('service worker cache is v098', sw.includes("CACHE_NAME = 'shike-v110-v47'"));

const failed = checks.filter((check) => !check.passed);
if (failed.length) {
  console.error(`Sprite assistant 2 regression failed: ${checks.length - failed.length}/${checks.length} passed`);
  failed.forEach((check) => console.error(`- ${check.name}`));
  process.exit(1);
}

console.log(`Sprite assistant 2 regression passed: ${checks.length}/${checks.length}`);
