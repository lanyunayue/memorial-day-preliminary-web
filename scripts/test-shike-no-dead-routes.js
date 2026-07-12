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
const css = fs.readFileSync(path.join(root, 'assets/styles/app.css'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const toolDefs = fs.readFileSync(path.join(root, 'src/agent/tools/tool-definitions.js'), 'utf8');
const routerSrc = fs.readFileSync(path.join(root, 'src/core/router.js'), 'utf8');

// Extract My page sections
const myStart = html.indexOf('id="page-my"');
const myEnd = html.indexOf('<!-- Drawer -->', myStart);
const mySection = html.slice(myStart, myEnd);

// Collect all section IDs in My page (valid jumpToMySection targets)
const mySectionIds = [...mySection.matchAll(/id="([^"]*Section)"/g)].map(m => m[1]);

// Collect all page div IDs
const pageDivIds = [...html.matchAll(/id="(page-[^"]+)"/g)].map(m => m[1]);

// [1] switchPage function has no branches for watch/permissions/data-safety/reminder-diagnostics
section('switchPage has no branches for removed pages');
const removedPages = ['watch','permissions','data-safety','dataSafety','reminder-diagnostics','reminderDiagnostics','settings'];
const switchPageMatch = legacyApp.match(/function switchPage\(page\)\{([\s\S]*?)\n\}/);
check('switchPage function found', !!switchPageMatch);
if (switchPageMatch) {
  const switchBody = switchPageMatch[1];
  removedPages.forEach(p => {
    check(`No branch for '${p}' in switchPage`, !new RegExp(`page===\\s*['"]${p}['"]|case\\s+['"]${p}['"]`).test(switchBody));
  });
}

// [2] All jumpToMySection calls reference existing section IDs in HTML
section('All jumpToMySection calls reference existing section IDs');
const jumpCalls = [...legacyApp.matchAll(/jumpToMySection\('([^']+)'\)/g)];
const jumpTargets = [...new Set(jumpCalls.map(m => m[1]))];
jumpTargets.forEach(target => {
  check(`jumpToMySection target '${target}' exists as section ID in HTML`, mySectionIds.includes(target));
});
check('jumpToMySection function exists', legacyApp.includes('function jumpToMySection'));

// [3] All data-feature-action handlers map to existing behavior (no dead actions)
section('All data-feature-action handlers map to existing behavior');
const featureActions = [...html.matchAll(/data-feature-action="([^"]+)"/g)].map(m => m[1]);
const uniqueActions = [...new Set(featureActions)];
uniqueActions.forEach(action => {
  check(`Feature action "${action}" has handler in openFeatureHubAction`, new RegExp(`action===\\s*['"]${action}['"]`).test(legacyApp));
});
check('openFeatureHubAction function exists', legacyApp.includes('function openFeatureHubAction'));
// Verify each action handler does not reference removed pages
uniqueActions.forEach(action => {
  const actionRegex = new RegExp(`action===\\s*['"]${action}['"]([\\s\\S]*?)(?=if\\(action===|return;|\\})`, 'g');
  const match = actionRegex.exec(legacyApp);
  if (match) {
    const handlerBody = match[1];
    removedPages.forEach(p => {
      check(`Action "${action}" handler does not reference removed page '${p}'`, !new RegExp(`switchPage\\(['"]${p}['"]|page-${p}`).test(handlerBody));
    });
  }
});

// [4] Agent open_page tool doesn't list removed pages
section('Agent open_page tool does not list removed pages');
const openPageMatch = toolDefs.match(/open_page[\s\S]*?validate\s*:\s*function\(a\)\s*{\s*return\s*\[([^\]]+)\]\.includes/);
check('open_page validate array found', !!openPageMatch);
if (openPageMatch) {
  const validPages = [...openPageMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
  removedPages.forEach(p => {
    check(`open_page does not list '${p}'`, !validPages.includes(p));
  });
  ['home','calendar','all','my','import'].forEach(p => {
    check(`open_page lists valid page '${p}'`, validPages.includes(p));
  });
}

// [5] No references to removed page IDs in HTML
section('No references to removed page IDs in HTML');
const removedPageIds = ['page-watch','page-permissions','page-data-safety','page-reminder-diagnostics'];
removedPageIds.forEach(id => {
  check(`No id="${id}" in HTML`, !html.includes(`id="${id}"`));
  check(`No href/link to "#${id}" in HTML`, !html.includes(`#${id}"`) && !html.includes(`#${id}'`));
  check(`No data-page targeting "${id.replace('page-','')}" in HTML`, !html.includes(`data-page="${id.replace('page-','')}"`));
});

// [6] No orphan CSS selectors for removed pages
section('No orphan CSS selectors for removed pages');
const removedCssSelectors = [
  '#page-watch','#page-permissions','#page-data-safety','#page-reminder-diagnostics',
  '.page-watch','.page-permissions','#watchCenter','#permissionCenter',
  '#dataSafetyCenter','#reminderDiagnostics','.watch-center','.permission-center',
  '.data-safety-center','.reminder-diagnostics'
];
removedCssSelectors.forEach(sel => {
  check(`CSS selector "${sel}" not present`, !css.includes(sel));
});

// [7] All drawer/intent routes resolve to valid pages or sections
section('All drawer/intent routes resolve to valid pages or sections');
// Check all switchPage calls in legacyApp
const allSwitchCalls = [...legacyApp.matchAll(/switchPage\('([^']+)'\)/g)];
const allSwitchTargets = [...new Set(allSwitchCalls.map(m => m[1]))];
const validPages = ['home','calendar','all','my','import'];
allSwitchTargets.forEach(target => {
  check(`switchPage target '${target}' is a valid page`, validPages.includes(target));
  check(`switchPage target '${target}' has corresponding page div`, pageDivIds.includes(`page-${target}`));
});
// Check that time sprite agent pages are valid
const agentPages = [...html.matchAll(/data-agent-page="([^"]+)"/g)].map(m => m[1]);
const uniqueAgentPages = [...new Set(agentPages)];
uniqueAgentPages.forEach(p => {
  check(`Agent data-agent-page="${p}" resolves to valid page`, validPages.includes(p));
});
// Check jumpDemoRoute* functions don't reference removed pages
check('jumpDemoRouteCalendarExport jumps to calendarExportSection', /jumpDemoRouteCalendarExport\(\)\{jumpToMySection\('calendarExportSection'\)/.test(legacyApp));
check('jumpDemoRouteDataSafety jumps to dataBackupSection', /jumpDemoRouteDataSafety\(\)\{jumpToMySection\('dataBackupSection'\)/.test(legacyApp));
// openDemoRouteBatch goes to import page
check('openDemoRouteBatch goes to import page', /openDemoRouteBatch\([\s\S]*?switchPage\('import'\)/.test(legacyApp));

// Summary
console.log(`\n========================================`);
console.log(`No dead routes: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) {
  console.log(`Failures:`);
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`All checks passed.`);
}
