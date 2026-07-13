// Unit test runner - runs vitest-style tests
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const V = path.resolve(__dirname, '..');

// Run existing node-based tests that are not in the regression suite
const unitTests = [
  'test-shike-agent-core.js',
  'test-shike-agent-tools.js',
  'test-shike-agent-confirmation.js',
  'test-shike-agent-conversation.js',
  'test-shike-agent-security.js',
  'test-shike-agent-context-proactive.js',
  'test-shike-indexeddb-repository.js',
  'test-shike-storage-migration.js',
  'test-shike-data-integrity.js',
  'test-shike-temporal-domain.js',
  'test-shike-life-inbox.js',
  'test-shike-temporal-graph.js',
  'test-shike-action-intelligence.js',
  'test-shike-chronos-vertical.js',
  'test-shike-temporal-review-memory.js',
  'test-shike-temporal-corpus.js',
  'test-shike-temporal-property.js',
  'test-chronos-fault-recovery.js',
  'test-chronos-multi-tab-contract.js',
  'test-chronos-conflict-engine.js',
];

let passed = 0, failed = 0;
for (const t of unitTests) {
  const fp = path.join(V, 'scripts', t);
  if (!fs.existsSync(fp)) continue;
  try {
    execSync('node "' + fp + '"', { stdio: 'pipe', timeout: 30000 });
    passed++;
  } catch(e) {
    failed++;
    console.log('FAIL:', t);
  }
}
console.log(`Unit tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
