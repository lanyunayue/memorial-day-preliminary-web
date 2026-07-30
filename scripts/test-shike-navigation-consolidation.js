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

// [1] Exactly 5 primary nav items from the product contract
section('Exactly 5 primary nav items (home, all, agent, review, my)');
const navItems = [...html.matchAll(/<button[^>]*class="nav-item[^"]*"[^>]*data-page="([^"]+)"[^>]*>/g)];
check('Nav item count is exactly 5', navItems.length === 5);
const navPages = navItems.map(m => m[1]);
check('Nav items match contract order', JSON.stringify(navPages) === JSON.stringify(['home','all','agent','review','my']));
check('First nav item is home/today (active by default)', navPages[0] === 'home');

// [2] All primary nav items have corresponding page divs
section('All primary nav items have corresponding page divs');
const pageDivs = [...html.matchAll(/<div[^>]*class="page[^"]*"[^>]*id="page-([^"]+)"[^>]*>/g)];
const pageIds = pageDivs.map(m => m[1]);
['home','all','agent','review','my'].forEach(p => {
  check(`page-${p} div exists`, pageIds.includes(p));
});
check('No extra page divs for removed pages', !['watch','permissions','data-safety','reminder-diagnostics'].some(p => pageIds.includes(p)));

// [3] Import page exists (accessed from My page / sprite, not nav)
section('Import page exists (accessed from My page / sprite, not nav)');
check('page-import div exists', pageIds.includes('import'));
check('page-calendar div exists as a secondary route', pageIds.includes('calendar'));
check('No nav button for import (not in bottom nav)', !navItems.some(m => m[1] === 'import'));
check('No nav button for calendar (secondary route)', !navItems.some(m => m[1] === 'calendar'));
check('Import accessible from sprite agent panel', html.includes('data-agent-page="import"'));

// [4] No dead routes in switchPage
section('No dead routes in switchPage');
const switchPageMatch = legacyApp.match(/function switchPage\(page\)\{([\s\S]*?)\n\}/);
check('switchPage function exists', !!switchPageMatch);
if (switchPageMatch) {
  const switchBody = switchPageMatch[1];
  const validBranches = ['home','calendar','all','agent','review','my','import'];
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
  const expected = ['agent','all','calendar','home','import','my','review'];
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

// [8] Click handlers for all primary navs exist
section('Click handlers for all primary navs exist');
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
