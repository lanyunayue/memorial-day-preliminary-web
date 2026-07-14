const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

const checks = [];
function add(name, condition) { checks.push({ name, passed: !!condition }); }
function count(pattern) { return (html.match(pattern) || []).length; }

const myStart = html.indexOf('id="page-my"');
const myEnd = html.indexOf('<!-- Drawer -->', myStart);
const my = html.slice(myStart, myEnd);
function pos(id) { return my.indexOf(`id="${id}"`); }

add('feature hub exists', my.includes('id="featureHubSection"') && my.includes('data-i18n="featureHubTitle"'));
add('example entry exists', my.includes('id="featureHubDemoBtn"') && my.includes('data-feature-action="demo"'));
add('demo route entry exists', my.includes('id="featureHubRouteBtn"') && my.includes('data-feature-action="route"'));
add('release update entry exists', my.includes('id="featureHubUpdateBtn"') && my.includes('data-feature-action="updates"'));
add('data safety entry exists', my.includes('id="featureHubSafetyBtn"') && my.includes('data-feature-action="safety"'));
add('calendar export entry exists', my.includes('id="featureHubCalendarBtn"') && my.includes('data-feature-action="calendar"'));
add('feedback entry exists', my.includes('id="featureHubFeedbackBtn"') && my.includes('data-feature-action="feedback"'));
add('future plan entry exists', my.includes('id="featureHubFutureBtn"') && my.includes('data-feature-action="future"'));
add('home main input still exists', html.includes('id="quickInput"') && html.includes('id="todayOverviewBlock"'));
add('home examples remain muted', /id="exampleChips"[^>]*home-muted-entry|home-muted-entry[^>]*id="exampleChips"/.test(html) && html.includes('id="demoRouteBlock" class="home-muted-entry"'));
add('personalization remains first my setting group', pos('personalizeSection') > 0 && pos('featureHubSection') > pos('personalizeSection'));
add('feature hub is visible in my page before data safety', pos('featureHubSection') > 0 && pos('featureHubSection') < pos('dataBackupSection'));
add('sprite quick actions still exist', ['timeSpriteInputBtn', 'timeSpriteBatchBtn', 'timeSpriteCalendarBtn', 'timeSpriteExportBtn', 'timeSpriteBackupBtn', 'timeSpriteUpdateBtn'].every((id) => html.includes(`id="${id}"`)));
add('example entries are not over duplicated', count(/id="demoBtnMy"/g) === 1 && count(/data-feature-action="demo"/g) === 1);
add('feature hub uses existing jump logic', script.includes('function openFeatureHubAction') && script.includes("jumpToMySection('dataBackupSection')") && script.includes('showReleaseNotes(true)'));
add('no undefined null or mojibake in hub', !my.includes('>undefined<') && !my.includes('>null<') && !my.includes('\uFFFD'));
add('feature hub css exists', style.includes('.feature-hub-grid') && style.includes('.feature-hub-item'));
add('mobile compact grid exists', style.includes('grid-template-columns:repeat(2'));
add('desktop grid exists', style.includes('@media (min-width:900px)') && style.includes('grid-template-columns:repeat(3'));
add('version is v2.2.0-alpha3', script.includes("APP_VERSION='v2.2.0-alpha3'"));
add('updated timestamp has release format', /APP_UPDATED_AT='\d{4}-\d{2}-\d{2} \d{2}:\d{2}'/.test(script));
add('service worker cache is shike-v220alpha3-v63', sw.includes("CACHE_NAME = 'shike-v220alpha3-v63'"));

const failed = checks.filter((check) => !check.passed);
if (failed.length) {
  console.error(`Feature hub cleanup regression failed: ${checks.length - failed.length}/${checks.length} passed`);
  failed.forEach((check) => console.error(`- ${check.name}`));
  process.exit(1);
}

console.log(`Feature hub cleanup regression passed: ${checks.length}/${checks.length}`);
