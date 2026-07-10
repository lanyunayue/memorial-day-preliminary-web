const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);
const markup = html.replace(/<script>[\s\S]*?<\/script>/, '');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function matches(re, text) {
  return [...text.matchAll(re)];
}

function attrs(tag) {
  const out = {};
  matches(/\s([:\w-]+)(?:=(["'])(.*?)\2)?/g, tag).forEach((m) => {
    out[m[1]] = m[3] === undefined ? true : m[3];
  });
  return out;
}

function stripTags(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#10;/g, ' ')
    .trim();
}

function hasAccessibleText(tag, body) {
  const a = attrs(tag);
  if (a['aria-label'] && a['aria-label'].trim()) return true;
  if (a['data-i18n'] && a['data-i18n'].trim()) return true;
  if (a.title && a.title.trim()) return true;
  return stripTags(body).length > 0;
}

function isHidden(attrsMap) {
  return attrsMap.type === 'hidden' || /display\s*:\s*none/i.test(attrsMap.style || '');
}

const checks = [];
const failures = [];

function add(name, run) {
  checks.push({ name, run });
}

add('document metadata is screen-reader and mobile friendly', () => {
  assert(/<html\s+lang=["']zh-CN["']/.test(html), 'html lang should be zh-CN');
  assert(/<meta\s+charset=["']UTF-8["']>/i.test(html), 'charset should be UTF-8');
  assert(/<meta\s+name=["']viewport["'][^>]+width=device-width/.test(html), 'viewport should include width=device-width');
  assert(/<title>时刻 - 你的贴心记事助手<\/title>/.test(html), 'title should be readable Chinese');
  assert(/<meta\s+name=["']theme-color["']\s+content=["']#[0-9a-fA-F]{6}["']/.test(html), 'theme-color meta should exist');
});

add('static buttons have accessible names', () => {
  const allowEmpty = new Set(['confirmCancelBtn', 'confirmOkBtn']);
  const missing = [];
  matches(/<button\b([^>]*)>([\s\S]*?)<\/button>/g, markup).forEach((m) => {
    const tag = `<button${m[1]}>`;
    const a = attrs(tag);
    if (allowEmpty.has(a.id)) return;
    if (!hasAccessibleText(tag, m[2])) missing.push(a.id || tag);
  });
  assert(missing.length === 0, `buttons without accessible names: ${missing.join(', ')}`);
});

add('form fields have placeholders or labels', () => {
  const missing = [];
  matches(/<(input|textarea)\b([^>]*)>/g, markup).forEach((m) => {
    const tag = `<${m[1]}${m[2]}>`;
    const a = attrs(tag);
    if (isHidden(a)) return;
    if (a.type === 'file') return;
    const hasName = Boolean(a.placeholder || a['data-i18n-ph'] || a['aria-label'] || a.title);
    if (!hasName) missing.push(a.id || tag);
  });
  assert(missing.length === 0, `form fields without labels/placeholders: ${missing.join(', ')}`);
});

add('icon and symbol controls expose aria labels', () => {
  ['voiceButton', 'calPrev', 'calNext', 'replayBtn'].forEach((id) => {
    const re = new RegExp(`<button\\b[^>]*id=["']${id}["'][^>]*>`);
    const tag = (html.match(re) || [])[0];
    assert(tag, `${id} button should exist`);
    assert(/\saria-label=["'][^"']+["']/.test(tag), `${id} should have aria-label`);
  });
});

add('dynamic icon-only buttons include aria labels', () => {
  assert(script.includes('class="rc-icon-btn rc-pin" aria-label="\'+t(\'unpin\')+\'"'), 'pinned dynamic button should use unpin aria-label');
  assert(script.includes('class="rc-icon-btn rc-pin not-pinned" aria-label="\'+t(\'setPin\')+\'"'), 'unpinned dynamic button should use setPin aria-label');
});

add('bottom navigation exposes visible text labels', () => {
  const nav = markup.match(/<nav class="nav">([\s\S]*?)<\/nav>/);
  assert(nav, 'bottom nav should exist');
  const missing = [];
  matches(/<button\b([^>]*)>([\s\S]*?)<\/button>/g, nav[1]).forEach((m) => {
    const a = attrs(`<button${m[1]}>`);
    if (!/class=["'][^"']*nav-label/.test(m[2])) missing.push(a['data-page'] || 'unknown');
  });
  assert(missing.length === 0, `nav items without labels: ${missing.join(', ')}`);
});

for (const check of checks) {
  try {
    check.run();
  } catch (error) {
    failures.push(`[${check.name}] ${error.message}`);
  }
}

if (failures.length) {
  console.error(`A11y static regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`A11y static regression passed: ${checks.length}/${checks.length}`);
