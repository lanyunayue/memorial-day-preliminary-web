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

add('feedback section exists on My page', () => {
  assert(html.includes('id="feedbackSection"'), 'feedback section missing');
  assert(html.includes('data-i18n="feedbackTitle"'), 'feedback title i18n missing');
  assert(html.includes('data-i18n="feedbackText"'), 'feedback text i18n missing');
});

add('email is visible and mailto is available', () => {
  assert(html.includes('308138249@qq.com'), 'feedback email missing');
  assert(html.includes('href="mailto:308138249@qq.com"'), 'mailto link missing');
});

add('copy button and feedback function exist', () => {
  assert(html.includes('id="copyFeedbackMailBtn"'), 'copy button missing');
  assert(script.includes('function copyFeedbackEmail()'), 'copyFeedbackEmail missing');
  assert(script.includes("navigator.clipboard.writeText(email)"), 'clipboard copy missing');
});

add('copy interaction has feedback and fallback', () => {
  assert(script.includes("showToast(t('feedbackCopied'),'success')"), 'success toast missing');
  assert(script.includes("window.location.href='mailto:'+email"), 'mailto fallback missing');
});

add('feedback i18n keys exist in all languages', () => {
  ['feedbackTitle', 'feedbackText', 'copyEmail', 'feedbackCopied'].forEach((key) => {
    const count = (script.match(new RegExp(`${key}:`, 'g')) || []).length;
    assert(count >= 4, `${key} should exist for four languages`);
  });
});

add('feedback entry stays simple without a form', () => {
  const section = html.slice(html.indexOf('id="feedbackSection"'), html.indexOf('id="futurePlanSection"'));
  ['<form', '<textarea', 'input type="text"'].forEach((token) => {
    assert(!section.includes(token), `feedback should not add complex form: ${token}`);
  });
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Feedback entry regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Feedback entry regression passed: ${checks.length}/${checks.length}`);
