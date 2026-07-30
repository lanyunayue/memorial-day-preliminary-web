const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'bridge', 'chronos-return-adapter.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const competitionHtml = fs.readFileSync(path.join(root, 'competition.html'), 'utf8');
const swSource = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

function createStorage(seed) {
  const values = new Map(Object.entries(seed || {}));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    dump() { return Object.fromEntries(values); }
  };
}

async function main() {
  const payload = {
    version: 1,
    transferId: 'handoff_test_001',
    actions: [
      { sourceRecordId: 'r1', action: 'completed', summary: '已经完成' },
      { sourceRecordId: 'r2', action: 'deferred', summary: '延后一天' },
      { sourceRecordId: 'r3', action: 'split', children: ['写提纲', '完成初稿'] }
    ]
  };
  const storage = createStorage({
    chronos_game_return_v1: JSON.stringify(payload),
    chronos_game_bridge_state_v1: JSON.stringify({ appliedReturns: [] })
  });
  let durableRecords = null;
  let mirrorRecords = null;
  const window = {
    localStorage: storage,
    ShikeLocalFirst: {
      async persist(records) {
        durableRecords = JSON.parse(JSON.stringify(records));
        return { count: records.length };
      }
    },
    ShikeLegacyStorage: {
      setJson(key, records) {
        assert.strictEqual(key, 'shike_records_v1');
        mirrorRecords = JSON.parse(JSON.stringify(records));
        storage.setItem(key, JSON.stringify(records));
        return true;
      }
    }
  };
  vm.runInNewContext(source, { window, console, Date, Math, JSON, Number, String, Array, Object, Promise });

  const records = [
    { id: 'r1', title: '提交材料', type: 'reminder', recordKind: 'reminder', createdAt: 1 },
    { id: 'r2', title: '预约体检', dateKey: '2026-07-30', type: 'reminder', createdAt: 2 },
    { id: 'r3', title: '完成作品', type: 'reminder', createdAt: 3 }
  ];
  const outcome = await window.ShikeChronosReturn.consume(records);
  assert.strictEqual(outcome.applied, true);
  assert.strictEqual(outcome.changedCount, 3);
  assert.strictEqual(outcome.createdCount, 2);
  assert.strictEqual(durableRecords.length, 5);
  assert.deepStrictEqual(mirrorRecords, durableRecords);
  assert.strictEqual(durableRecords.find(r => r.id === 'r1').archived, true);
  assert.strictEqual(durableRecords.find(r => r.id === 'r2').dateKey, '2026-07-31');
  assert.strictEqual(durableRecords.filter(r => r.parentRecordId === 'r3').length, 2);
  assert.strictEqual(storage.getItem('chronos_game_return_v1'), null);
  assert.ok(JSON.parse(storage.getItem('chronos_game_bridge_state_v1')).appliedReturns.includes(payload.transferId));

  assert.ok(indexHtml.indexOf('src/bridge/chronos-return-adapter.js') < indexHtml.indexOf('src/legacy-app.js'));
  assert.ok(indexHtml.includes('id="chronosValleyEntry"'));
  assert.ok(swSource.includes('./src/bridge/chronos-return-adapter.js'));
  assert.ok(competitionHtml.includes("location.href = 'index.html?chronosReturn=1'"));
  assert.ok(!competitionHtml.includes("localStorage.setItem('shike_records_v1'"));

  console.log('Chronos return adapter tests passed: 14/14');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
