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

add('APP_VERSION is v1.0.0', () => assert(script.includes("APP_VERSION='v1.0.0'"), 'version mismatch'));
add('service worker cache is v46', () => assert(sw.includes("shike-v100-v46"), 'cache mismatch'));
add('visible rc version marker is removed', () => assert(!html.includes('v1.0.0-rc'), 'rc version remains'));
add('product positioning exists', () => assert(html.includes('id="productPositionSection"'), 'positioning missing'));
add('capability checklist exists', () => assert(html.includes('id="capabilityChecklistSection"'), 'capabilities missing'));
add('bear assistant exists', () => assert(html.includes('id="timeSprite"'), 'bear assistant missing'));
add('feature hub exists', () => assert(html.includes('id="featureHubSection"'), 'feature hub missing'));
add('batch organizer exists', () => assert(html.includes('id="parseImportBtn"'), 'batch organizer missing'));
add('JSON backup exists', () => assert(html.includes('id="exportBackupBtnMy"'), 'backup missing'));
add('ICS export exists', () => assert(html.includes('id="exportIcsBtn"'), 'ICS export missing'));
add('feedback email exists', () => assert(html.includes('mailto:308138249@qq.com'), 'feedback email missing'));
add('record card quick actions exist', () => assert(script.includes('copyRecordText') && script.includes('togglePin'), 'quick actions missing'));
add('dedupe remains available', () => assert(script.includes('dedupe'), 'dedupe missing'));
add('demo examples remain available', () => assert(html.includes('id="demoBtnMy"'), 'demo examples missing'));
add('calendar dot remains available', () => assert(html.includes('cal-dot'), 'calendar dot missing'));
add('release center identifies stable release', () => assert(html.includes('<strong>v1.0.0</strong>') && script.includes('正式稳定版'), 'stable release entry missing'));
add('does not claim cloud sync', () => assert(!/云同步已上线|已实现云同步/.test(html), 'cloud claim found'));
add('does not claim persistent background reminders', () => assert(!/后台持续提醒|网页关闭后还能主动提醒/.test(html), 'background reminder claim found'));
add('does not claim trading advice', () => assert(!/智能交易建议|自动买卖建议|稳赚/.test(html), 'trading claim found'));
add('no undefined text marker', () => assert(!html.includes('>undefined<'), 'undefined marker'));
add('no null text marker', () => assert(!html.includes('>null<'), 'null marker'));
add('no replacement-character mojibake', () => assert(!html.includes('\uFFFD'), 'replacement character found'));
add('mobile responsive guard remains', () => assert(html.includes('@media (max-width:767px)'), 'mobile guard missing'));
add('desktop responsive guard remains', () => assert(html.includes('@media (min-width:1024px)'), 'desktop guard missing'));

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`v1.0.0 stable regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`v1.0.0 stable regression passed: ${checks.length}/${checks.length}`);
