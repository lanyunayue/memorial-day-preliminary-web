'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const checks = [];

function check(name, condition) {
  if (!condition) throw new Error(name);
  checks.push(name);
}

global.tf = (key) => ({
  reviewToday: 'Today',
  reviewMustHandle: 'Due today',
  reviewOverdue: 'Overdue',
  reviewWaiting: 'Waiting',
  reviewTomorrow: 'Tomorrow',
  reviewNextAction: 'Suggested next step',
  reviewOpen: 'Open',
  reviewComplete: 'Complete',
  reviewLater: 'Later',
  reviewWeekly: 'Weekly review',
  reviewCompleted: 'Completed',
  reviewOpenCommitments: 'Open promises',
  reviewPostponed: 'Postponed again',
  reviewNextWeek: 'Next week',
  reviewDataTools: 'Review data',
  reviewExportDaily: 'Export daily brief',
  reviewExportWeekly: 'Export weekly review',
  reviewExportCorrections: 'Export corrections',
  reviewClearCorrections: 'Clear corrections',
  reviewLocalOnly: 'local corrections',
  reviewLoadHigh: 'Heavy load',
}[key] || key);

const reviewPanel = require('../src/intelligence/ui/review-panel.js');
const container = {
  innerHTML: '',
  querySelectorAll() { return []; },
};

reviewPanel.render(container, {
  daily: {
    dateKey: '2026-07-19',
    mustHandle: [{ id: 'today' }],
    overdue: [{ id: 'late' }],
    waitingOn: [{ id: 'waiting' }],
    tomorrow: [{ id: 'tomorrow' }],
    nextAction: {
      sourceRecordId: 'record-1',
      action: '<script>unsafe</script>',
      reason: 'Because it is due today.',
    },
    load: { band: 'high' },
  },
  weekly: {
    range: { from: '2026-07-13', to: '2026-07-19' },
    completed: [{ id: 'done' }],
    openCommitments: [{ id: 'promise' }],
    repeatedlyPostponed: [{ id: 'again' }],
    nextWeek: [{ id: 'next' }],
  },
  corrections: [{ id: 'correction' }],
}, { action() {} });

check('renders consumer review root', container.innerHTML.includes('class="temporal-review"'));
check('renders translated daily labels', container.innerHTML.includes('Due today'));
check('renders all daily and weekly metrics', (container.innerHTML.match(/class="temporal-review-metric"/g) || []).length === 8);
check('renders explainable next step', container.innerHTML.includes('Suggested next step'));
check('renders actionable record id', container.innerHTML.includes('data-record-id="record-1"'));
check('renders complete action', container.innerHTML.includes('data-review="complete"'));
check('renders weekly review', container.innerHTML.includes('Weekly review'));
check('renders review data disclosure', container.innerHTML.includes('Review data'));
check('escapes dynamic action text', !container.innerHTML.includes('<script>unsafe</script>'));
check('retains safe escaped action text', container.innerHTML.includes('&lt;script&gt;unsafe&lt;/script&gt;'));

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const legacy = fs.readFileSync(path.join(root, 'src', 'legacy-app.js'), 'utf8');
const sectionStart = html.indexOf('id="temporalReviewSection"');
check('review is a first-class setting section', sectionStart > 0);
check('review is outside data backup', sectionStart < html.indexOf('id="dataBackupSection"'));
check('review appears before feature hub', sectionStart < html.indexOf('id="featureHubSection"'));
check('review container is unique', (html.match(/id="temporalReviewBlock"/g) || []).length === 1);
check('all four locales define review title', (legacy.match(/temporalReviewTitle:/g) || []).length === 4);
check('all four locales define next-step copy', (legacy.match(/reviewNextAction:/g) || []).length === 4);

console.log(`Consumer review regression passed: ${checks.length}/${checks.length}`);
