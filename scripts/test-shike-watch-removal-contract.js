const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

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

// [1] No watch nav button in HTML
section('No watch nav button in HTML');
check('No data-page="watch" nav item', !/data-page="watch"/.test(html));

// [2] No page-watch div
section('No page-watch div');
check('No id="page-watch" element', !/id="page-watch"/.test(html));
check('No class containing page-watch', !/class="[^"]*page-watch/.test(html));

// [3] No 'watch' in KNOWN_PAGES router set
section('No watch in KNOWN_PAGES router set');
const routerSrc = fs.readFileSync(path.join(root, 'src/core/router.js'), 'utf8');
const knownPagesMatch = routerSrc.match(/KNOWN_PAGES[^;]+;/);
check('KNOWN_PAGES declaration exists', !!knownPagesMatch);
if (knownPagesMatch) {
  check('KNOWN_PAGES does not contain watch', !/['"]watch['"]/.test(knownPagesMatch[0]));
}

// [4] No watch module script tags in HTML
section('No watch module script tags in HTML');
check('No src/watch/ script references in HTML', !/src=["'][^"']*\/watch\//.test(html));
check('No watch-center script reference', !/watch-center/i.test(html));

// [5] SW PRECACHE_URLS does not include watch files
section('SW PRECACHE_URLS does not include watch files');
const precacheMatch = sw.match(/PRECACHE_URLS\s*=\s*\[([\s\S]*?)\]/);
check('PRECACHE_URLS found in SW', !!precacheMatch);
if (precacheMatch) {
  check('No watch path in SW precache', !/watch/i.test(precacheMatch[1]));
}

// [6] src/watch/ directory does not exist
section('src/watch/ directory does not exist');
check('src/watch/ directory absent', !fs.existsSync(path.join(root, 'src/watch')));

// [7] No ShikeWatchCenter reference in legacy-app.js or agent JS
section('No ShikeWatchCenter reference in legacy-app.js or agent JS');
const legacyApp = fs.readFileSync(path.join(root, 'src/legacy-app.js'), 'utf8');
const agentCore = fs.readFileSync(path.join(root, 'src/agent/agent-core.js'), 'utf8');
const toolDefs = fs.readFileSync(path.join(root, 'src/agent/tools/tool-definitions.js'), 'utf8');
check('No ShikeWatchCenter in legacy-app.js', !/ShikeWatchCenter/i.test(legacyApp));
check('No ShikeWatchCenter in agent-core.js', !/ShikeWatchCenter/i.test(agentCore));
const openPageValidate = toolDefs.match(/open_page[\s\S]*?validate[^}]*\}/);
check('open_page tool validation found', !!openPageValidate);
if (openPageValidate) {
  check('No watch page in open_page tool', !/'watch'/.test(openPageValidate[0]));
}

// [8] No dead watch routes in switchPage
section('No dead watch routes in switchPage');
const switchPageMatch = legacyApp.match(/function switchPage\(page\)\{([\s\S]*?)\n\}/);
check('switchPage function exists', !!switchPageMatch);
if (switchPageMatch) {
  const switchBody = switchPageMatch[1];
  check('No page===\'watch\' branch', !/page===\s*['"]watch['"]/.test(switchBody));
  check('No renderWatch call', !/renderWatch/i.test(switchBody));
}

// [9] Agent knowledge search/public retrieval still works
section('Agent knowledge search/public retrieval still works');
const retrievalFiles = [
  'src/retrieval/retrieval-engine.js',
  'src/retrieval/query-classifier.js',
  'src/retrieval/provider-registry.js',
  'src/retrieval/result-normalizer.js',
  'src/retrieval/result-ranker.js',
  'src/retrieval/providers/wikipedia.js',
  'src/retrieval/providers/wikidata.js'
];
retrievalFiles.forEach(f => {
  check(`${f} exists on disk`, fs.existsSync(path.join(root, f)));
});
check('retrieval-engine.js loaded in HTML script tags', /src\/retrieval\/retrieval-engine\.js/.test(html));
check('provider-registry.js loaded in HTML script tags', /src\/retrieval\/provider-registry\.js/.test(html));

// [10] No init error from missing watch module
section('No init error from missing watch module');
check('init() does not reference ShikeWatchCenter', !/ShikeWatchCenter/.test(legacyApp));
check('No initWatch or loadWatch function calls', !/initWatch|loadWatch/i.test(legacyApp));
check('No watch-related require/import in concatenated classic scripts', !/require\(['"][^'"]*watch[^'"]*['"]\)/.test(script));

// Summary
console.log(`\n========================================`);
console.log(`Watch removal contract: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) {
  console.log(`Failures:`);
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`All checks passed.`);
}
