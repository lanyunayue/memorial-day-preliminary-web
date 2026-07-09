const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];
function add(name, run) { checks.push({ name, run }); }

const myPageStart = html.indexOf('id="page-my"');
const myPageEnd = html.indexOf('<!-- Drawer -->', myPageStart);
const mySection = html.slice(myPageStart, myPageEnd);

function posInMy(id) { return mySection.indexOf(`id="${id}"`); }

add('My page exists', () => { assert(myPageStart > 0, 'page-my not found'); assert(mySection.length > 500, 'page-my too short'); });
add('Personalize section exists', () => { assert(mySection.includes('id="personalizeSection"'), 'personalizeSection missing'); assert(mySection.includes('data-i18n="personalize"'), 'personalize title missing'); });
add('Personalize before dataSafety', () => { const p=posInMy('personalizeSection'),d=posInMy('dataSafetySection'); assert(p>0&&d>0,'not found'); assert(p<d,'personalize must be before dataSafety'); });
add('Personalize before feedback', () => { const p=posInMy('personalizeSection'),f=posInMy('feedbackSection'); assert(p>0&&f>0,'not found'); assert(p<f,'personalize must be before feedback'); });
add('Personalize is first setting-group after settings-list', () => { const sl=mySection.indexOf('class="settings-list"'); const fg=mySection.indexOf('class="setting-group',sl); assert(fg>0,'no setting-group found'); const near=mySection.substring(fg,fg+120); assert(near.includes('personalizeSection'),'first setting-group must be personalizeSection'); });
add('Theme dots still exist', () => { assert(mySection.includes('data-i18n="theme"'),'theme label missing'); assert(mySection.includes('class="theme-dots"'),'theme-dots missing'); assert(mySection.includes('data-theme="night"'),'night theme missing'); });
add('Language options still exist', () => { assert(mySection.includes('data-i18n="language"'),'language label missing'); assert(mySection.includes('id="langGroup"'),'langGroup missing'); assert(mySection.includes('data-lang="en"'),'EN missing'); });
add('Calendar mode still exists', () => { assert(mySection.includes('data-i18n="calendarMode"'),'calendarMode missing'); assert(mySection.includes('id="calModeGroup"'),'calModeGroup missing'); });
add('Weather switch still exists', () => { assert(mySection.includes('data-i18n="weather"'),'weather label missing'); assert(mySection.includes('id="weatherSwitch"'),'weatherSwitch missing'); });
add('Username input still exists', () => { assert(mySection.includes('id="usernameInput"'),'usernameInput missing'); });
add('Experience example on My page still exists', () => { assert(mySection.includes('id="experienceExampleSection"'),'experienceExampleSection missing'); assert(mySection.includes('id="demoBtnMy"'),'demoBtnMy missing'); });
add('Feedback email 308138249@qq.com still visible', () => { assert(mySection.includes('308138249@qq.com'),'email missing'); assert(mySection.includes('href="mailto:308138249@qq.com"'),'mailto missing'); });
add('Data safety/backup still exists', () => { assert(mySection.includes('id="dataSafetySection"'),'dataSafetySection missing'); assert(mySection.includes('id="exportBackupBtnMy"'),'exportBackupBtnMy missing'); assert(mySection.includes('id="restoreFileInputMy"'),'restoreFileInputMy missing'); });
add('Calendar export still exists', () => { assert(mySection.includes('id="calendarExportSection"'),'calendarExportSection missing'); assert(mySection.includes('id="exportIcsBtn"'),'exportIcsBtn missing'); });
add('No duplicate demoBtnMy', () => { const c=(mySection.match(/id="demoBtnMy"/g)||[]).length; assert(c===1,`expected 1 demoBtnMy, got ${c}`); });
add('No duplicate feedbackSection', () => { const c=(mySection.match(/id="feedbackSection"/g)||[]).length; assert(c===1,`expected 1 feedbackSection, got ${c}`); });
add('No duplicate dataSafetySection', () => { const c=(mySection.match(/id="dataSafetySection"/g)||[]).length; assert(c===1,`expected 1 dataSafetySection, got ${c}`); });
add('No undefined visible', () => { assert(!mySection.includes('>undefined<'),'undefined visible'); assert(!mySection.includes('>null<'),'null visible'); });
add('No garbled chars', () => { assert(!mySection.includes('\uFFFD'),'replacement char found'); });
add('APP_VERSION = v1.0.0-rc', () => { assert(html.includes("APP_VERSION='v1.0.0-rc'"),'APP_VERSION not v1.0.0-rc'); });
add('SW cache = shike-v100rc-v45', () => { assert(sw.includes('shike-v100rc-v45'),'cache not v097'); assert(!sw.includes('shike-v096-v42'),'old cache v096 still present'); });
add('Featured CSS classes exist', () => { assert(html.includes('setting-group-featured'),'setting-group-featured missing'); assert(html.includes('feature-chips'),'feature-chips missing'); assert(html.includes('feature-chip'),'feature-chip missing'); });
add('Personalize description exists', () => { assert(mySection.includes('data-i18n="personalizeDesc"'),'personalizeDesc missing'); assert(mySection.includes('让时刻更像你的助手'),'desc text missing'); });
add('Feature chips cover 4 areas', () => { assert(mySection.includes('data-i18n="chipTheme"'),'chipTheme missing'); assert(mySection.includes('data-i18n="chipLanguage"'),'chipLanguage missing'); assert(mySection.includes('data-i18n="chipSprite"'),'chipSprite missing'); assert(mySection.includes('data-i18n="chipDisplay"'),'chipDisplay missing'); });

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`My page priority regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}
console.log(`My page priority regression passed: ${checks.length}/${checks.length}`);
