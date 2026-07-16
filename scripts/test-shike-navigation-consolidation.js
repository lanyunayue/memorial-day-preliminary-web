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
const routerSrc = fs.readFileSync(path.join(root, 'src/core/router.js'), 'utf8');

// [1] Exactly 4 bottom nav items (home, calendar, all, my)
section('Exactly 4 bottom nav items (home, calendar, all, my)');
const navItems = [...html.matchAll(/<button[^>]*class="nav-item[^"]*"[^>]*data-page="([^"]+)"[^>]*>/g)];
check('Nav item count is exactly 4', navItems.length === 4);
const navPages = navItems.map(m => m[1]).sort();
check('Nav items are home/calendar/all/my', JSON.stringify(navPages) === JSON.stringify(['all','calendar','home','my']));
check('First nav item is home (active by default)', html.indexOf('data-page="home"') < html.indexOf('data-page="calendar"'));

// [2] All 4 nav items have corresponding page divs
section('All 4 nav items have corresponding page divs');
const pageDivs = [...html.matchAll(/<div[^>]*class="page[^"]*"[^>]*id="page-([^"]+)"[^>]*>/g)];
const pageIds = pageDivs.map(m => m[1]);
['home','calendar','all','my'].forEach(p => {
  check(`page-${p} div exists`, pageIds.includes(p));
});
check('No extra page divs for removed pages', !['watch','permissions','data-safety','reminder-diagnostics'].some(p => pageIds.includes(p)));

// [3] Import page exists (accessed from My page / sprite, not nav)
section('Import page exists (accessed from My page / sprite, not nav)');
check('page-import div exists', pageIds.includes('import'));
check('No nav button for import (not in bottom nav)', !navItems.some(m => m[1] === 'import'));
check('Import accessible from sprite agent panel', html.includes('data-agent-page="import"'));

// [4] No dead routes in switchPage (only home/calendar/all/my/import)
section('No dead routes in switchPage (only home/calendar/all/my/import)');
const switchPageMatch = legacyApp.match(/function switchPage\(page\)\{([\s\S]*?)\n\}/);
check('switchPage function exists', !!switchPageMatch);
if (switchPageMatch) {
  const switchBody = switchPageMatch[1];
  const validBranches = ['home','calendar','all','my','import'];
  const removedPages = ['watch','permissions','data-safety','reminder-diagnostics','settings','dataSafety'];
  removedPages.forEach(p => {
    check(`No branch for removed page '${p}' in switchPage`, !new RegExp(`page===\\s*['"]${p}['"]`).test(switchBody) && !new RegExp(`case\\s+['"]${p}['"]`).test(switchBody));
  });
  validBranches.forEach(p => {
    check(`Branch for '${p}' exists in switchPage`, new RegExp(`page===\\s*['"]${p}['"]`).test(switchBody));
  });
}

// [5] KNOWN_PAGES in router.js matches expected set
section('KNOWN_PAGES in router.js matches expected set');
const knownMatch = routerSrc.match(/KNOWN_PAGES\s*=\s*new Set\(\[([^\]]+)\]\)/);
check('KNOWN_PAGES Set declaration found', !!knownMatch);
if (knownMatch) {
  const pages = [...knownMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]).sort();
  const expected = ['all','calendar','home','import','my'];
  check(`KNOWN_PAGES contains exactly ${expected.join(',')}`, JSON.stringify(pages) === JSON.stringify(expected));
}
check('normalizePage returns home for unknown pages', /normalizePage\(page\)\{return KNOWN_PAGES\.has\(page\)\?page:'home';\}/.test(routerSrc));

// [6] All data-page attributes have matching page-* divs
section('All data-page attributes have matching page-* divs');
const dataPageRefs = [...html.matchAll(/data-page="([^"]+)"/g)].map(m => m[1]);
const uniqueDataPages = [...new Set(dataPageRefs)];
uniqueDataPages.forEach(p => {
  check(`data-page="${p}" has matching page-${p} div`, pageIds.includes(p));
});

// [7] Nav buttons have correct active/default classes
section('Nav buttons have correct active/default classes');
const homeNav = html.match(/<button[^>]*class="nav-item[^"]*active[^"]*"[^>]*data-page="home"/);
check('Home nav item has active class by default', !!homeNav);
const nonHomeNavs = html.match(/<button[^>]*class="nav-item(?!\s+active)[^"]*"[^>]*data-page="(?!home)[^"]*"/g);
check('Non-home nav items do not have active class by default', (nonHomeNavs || []).length >= 3);

// [8] Click handlers for all 4 navs exist
section('Click handlers for all 4 navs exist');
check('Nav click delegation exists in JS', /document\.querySelectorAll\('\.nav-item'\)\.forEach\(function\(n\)\{[\s\S]*?n\.addEventListener\('click'/.test(legacyApp));
check('Click calls switchPage(n.dataset.page)', /switchPage\(n\.dataset\.page\)/.test(legacyApp));

// Summary
console.log(`\n========================================`);
console.log(`Navigation consolidation: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) {
  console.log(`Failures:`);
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`All checks passed.`);
}
