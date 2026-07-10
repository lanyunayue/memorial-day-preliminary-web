const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];

function add(name, run) {
  checks.push({ name, run });
}

add('anniversary records expose image export entry', () => {
  assert(script.includes("if(r.recordKind==='anniversary')acts+="), 'anniversary hero action gate missing');
  assert(script.includes('exportAnniversaryCardPng'), 'exportAnniversaryCardPng entry missing');
  assert(script.includes('saveCardImage'), 'save card i18n key missing');
});

add('ordinary reminders do not force image export entry', () => {
  assert(!script.includes("if(r.recordKind==='reminder')acts+='<button class=\"hero-act\" onclick=\"exportAnniversaryCardPng"), 'reminder action block should not export card images');
  assert(script.includes("if(r.recordKind==='anniversary')acts+='<button class=\"hero-act\" onclick=\"exportAnniversaryCardPng"), 'card image export should be gated to anniversary records');
});

add('PNG export function exists', () => {
  assert(script.includes('function exportAnniversaryCardPng(id)'), 'export function missing');
  assert(script.includes("canvas.toBlob") || script.includes("canvas.toDataURL('image/png')"), 'PNG canvas export missing');
});

add('download filename contains shike-card', () => {
  assert(script.includes("'shike-card-'+safeFilePart(r.title)+'.png'"), 'download filename should contain shike-card');
});

add('unsupported browser fallback exists', () => {
  assert(script.includes('cardExportUnsupported'), 'unsupported fallback i18n key missing');
  assert(script.includes("showToast(t('cardExportUnsupported')"), 'unsupported fallback toast missing');
});

add('export content includes title', () => {
  assert(script.includes("r.title||t('appName')"), 'card export should draw title');
});

add('export content includes date', () => {
  assert(script.includes('dateText') && script.includes("ctx.fillText(dateText"), 'card export should draw date');
});

add('export content includes Shike brand', () => {
  assert(script.includes("ctx.fillText(t('appName')"), 'card export should draw Shike brand');
});

add('export does not upload user data', () => {
  const exportCode = script.slice(script.indexOf('function exportAnniversaryCardPng'), script.indexOf('function exportIcsFile'));
  assert(!/\bfetch\s*\(/.test(exportCode), 'card export must not fetch/upload');
  assert(!/XMLHttpRequest|sendBeacon|FormData/.test(exportCode), 'card export must not upload data');
});

add('no large external dependency is introduced', () => {
  assert(!/html2canvas|dom-to-image|canvg|fabric\.js/i.test(html), 'large card export dependency found');
});

for (const check of checks) {
  try {
    check.run();
  } catch (error) {
    failures.push(`[${check.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`Card export regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Card export regression passed: ${checks.length}/${checks.length}`);
