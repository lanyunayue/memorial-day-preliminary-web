const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const checks = [];
const failures = [];
function add(name, run) { checks.push({ name, run }); }

add('version and cache are v1.4.0', () => {
  assert(script.includes("APP_VERSION='v1.4.0'"), 'APP_VERSION should be v1.4.0');
  assert(sw.includes("shike-v140-v52"), 'sw cache should be shike-v140-v52');
});

add('release center section exists', () => {
  assert(html.includes('id="releaseCenterSection"'), 'release center missing');
  assert(html.includes('id="releaseCenterDetails"'), 'release center details missing');
  assert(html.includes('data-i18n="releaseCenterTitle"'), 'release center i18n missing');
});

add('recent version list is visible', () => {
  ['v1.3.0', 'v1.2.0', 'v1.1.0', 'v1.0.0', 'v0.9.8', 'v0.9.7', 'v0.9.6', 'v0.9.5', 'v0.9.4', 'v0.9.3'].forEach((version) => {
    assert(html.includes(version), `${version} missing from release center`);
  });
});

add('release center content labels exist', () => {
  ['releaseCenterV130', 'releaseCenterV120', 'releaseCenterV100rc', 'releaseCenterV098', 'releaseCenterV097', 'releaseCenterV096', 'releaseCenterV095', 'releaseCenterV094', 'releaseCenterV093'].forEach((key) => {
    assert(script.includes(`${key}:`), `${key} i18n missing`);
  });
});

add('current release can be opened from center', () => {
  assert(html.includes('id="viewCurrentReleaseBtn"'), 'view current release button missing');
  assert(script.includes("b('viewCurrentReleaseBtn','click',function(){showReleaseNotes(true);});"), 'view current release binding missing');
});

add('feature hub update opens release center', () => {
  assert(html.includes('id="featureHubUpdateBtn"'), 'feature hub update entry missing');
  assert(script.includes("jumpToMySection('releaseCenterSection')"), 'feature hub should jump to release center');
  assert(script.includes("if(detail)detail.open=true"), 'release center details should open');
});

add('feedback email and mailto exist', () => {
  assert(html.includes('308138249@qq.com'), 'feedback email missing');
  assert(html.includes('href="mailto:308138249@qq.com"'), 'mailto missing');
  assert(html.includes('id="feedbackMailLink"'), 'feedback mail link missing');
});

add('copy email remains available', () => {
  assert(html.includes('id="copyFeedbackMailBtn"'), 'copy email button missing');
  assert(script.includes('function copyFeedbackEmail()'), 'copyFeedbackEmail missing');
  assert(script.includes('navigator.clipboard.writeText(email)'), 'email clipboard copy missing');
});

add('feedback template is available', () => {
  assert(html.includes('id="feedbackTemplateText"'), 'feedback template text missing');
  assert(html.includes('id="copyFeedbackTemplateBtn"'), 'copy feedback template button missing');
  assert(script.includes('function copyFeedbackTemplate()'), 'copyFeedbackTemplate missing');
  ['遇到的问题', '使用场景', '浏览器/设备', '希望改进'].forEach((text) => {
    assert(html.includes(text) || script.includes(text), `${text} missing`);
  });
});

add('feedback template copy has toast', () => {
  assert(script.includes("showToast(t('feedbackTemplateCopied'),'success')"), 'template copy toast missing');
  assert(script.includes("b('copyFeedbackTemplateBtn','click',copyFeedbackTemplate)"), 'template copy binding missing');
});

add('feedback section has no backend form', () => {
  const section = html.slice(html.indexOf('id="feedbackSection"'), html.indexOf('id="futurePlanSection"'));
  ['<form', '<textarea', 'input type="text"', 'fetch(', 'XMLHttpRequest'].forEach((token) => {
    assert(!section.includes(token), `feedback section should not use backend form token: ${token}`);
  });
  assert(html.includes('不会上传你的本地数据') || script.includes('not uploaded'), 'no-upload copy missing');
});

add('future plan section has five items', () => {
  assert(html.includes('class="future-plan-list"'), 'future plan list missing');
  ['futurePlan1', 'futurePlan2', 'futurePlan3', 'futurePlan4', 'futurePlan5'].forEach((key) => {
    assert(html.includes(`data-i18n="${key}"`), `${key} markup missing`);
    assert(script.includes(`${key}:`), `${key} i18n missing`);
  });
});

add('future plan copy stays non-committal', () => {
  ['正在规划', '探索', 'being planned', 'exploration'].forEach((token) => {
    assert(html.includes(token) || script.includes(token), `planning token missing: ${token}`);
  });
});

add('forbidden launched capability claims are absent', () => {
  [
    '已实现云同步',
    '自动股票监控',
    '已支持股票监控',
    '已实现大模型自动分析',
    '后台持续提醒',
    '自动买卖建议',
    '智能交易建议'
  ].forEach((token) => {
    assert(!html.includes(token) && !script.includes(token), `forbidden claim present: ${token}`);
  });
});

add('release notes describe v1.3.0', () => {
  ['Agent', 'tool', 'double confirmation', 'local-rule', 'v1.3.0'].forEach((token) => {
    assert(script.includes(token), `release note token missing: ${token}`);
  });
});

add('i18n keys exist in four languages', () => {
  ['releaseCenterTitle', 'viewCurrentRelease', 'copyFeedbackTemplate', 'feedbackTemplateText', 'feedbackNoUpload', 'futurePlan1'].forEach((key) => {
    const count = (script.match(new RegExp(`${key}:`, 'g')) || []).length;
    assert(count >= 4, `${key} should exist for four languages`);
  });
});

add('no undefined null or mojibake markers', () => {
  ['>undefined<', '>null<', '�'].forEach((token) => {
    assert(!html.includes(token), `${token} should not appear in html`);
  });
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push(`[${check.name}] ${error.message}`); }
}

if (failures.length) {
  console.error(`Release feedback center regression failed: ${checks.length - failures.length}/${checks.length} passed`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Release feedback center regression passed: ${checks.length}/${checks.length}`);
