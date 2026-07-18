const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { webcrypto } = require('crypto');
const { TextEncoder } = require('util');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'storage', 'portable-export-v1.js'), 'utf8');
const legacySource = fs.readFileSync(path.join(root, 'src', 'legacy-app.js'), 'utf8');
const sandbox = { window: null, crypto: webcrypto, TextEncoder, Date, Intl, JSON, Map, Set, Array, Number, String, Math };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'portable-export-v1.js' });
const portable = sandbox.ShikePortableExportV1;

function assert(condition, message) { if (!condition) throw new Error(message); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function entity(record, materializedId = '') { return portable.entityFromRecord(record, materializedId); }

async function main() {
  const fixtureDir = path.join(root, 'test', 'fixtures', 'portable-export-v1');
  const files = fs.readdirSync(fixtureDir).filter((name) => name.endsWith('.json')).sort();
  assert(files.length === 36, `expected 36 fixtures, got ${files.length}`);
  const fixtures = files.map((name) => JSON.parse(fs.readFileSync(path.join(fixtureDir, name), 'utf8')));

  for (let index = 0; index < fixtures.length; index++) {
    const errors = await portable.validateBundle(fixtures[index]);
    assert(errors.length === 0, `${files[index]} failed validation: ${errors.join(',')}`);
    assert(await portable.checksum(fixtures[index]) === fixtures[index].checksum, `${files[index]} checksum mismatch`);
  }

  const numeric = fixtures[35];
  assert(portable.canonicalize(numeric).includes('1e-7'), 'small exponent canonicalization');
  assert(portable.canonicalize(numeric).includes('1e+21'), 'large exponent canonicalization');
  assert(portable.canonicalize(numeric).includes('0.000001'), 'fixed small canonicalization');
  assert(portable.canonicalize(numeric).includes('100000000000000000000'), 'fixed large canonicalization');

  const uuidA = await portable.deterministicPortableId('legacy-record-1');
  const uuidB = await portable.deterministicPortableId('legacy-record-1');
  assert(uuidA === uuidB, 'deterministic IDs must remain stable');
  assert(/^[0-9a-f-]{36}$/.test(uuidA) && uuidA[14] === '5', 'deterministic ID must be a version 5 UUID');

  const legacyBundle = await portable.buildBundle({
    appVersion: 'v2.2.0-alpha3',
    timezone: 'Asia/Shanghai',
    exportedAt: '2026-07-18T08:00:00.000Z',
    settings: { theme: 'paper', language: 'zh-CN' },
    records: [{ id: 'legacy-1', title: '下午三点开会', recordKind: 'reminder', dateKey: '2026-07-19', timeText: '15:00', createdAt: 1784361600000, updatedAt: 1784361600000 }]
  });
  assert((await portable.validateBundle(legacyBundle)).length === 0, 'legacy Web export must validate');
  assert(legacyBundle.records[0].data.legacyRecord.id === 'legacy-1', 'legacy shape must round-trip inside data');
  assert(legacySource.includes("el.querySelector('input[type=\"file\"]')"), 'language switching must preserve nested file inputs');

  for (let index = 0; index < fixtures.length; index++) {
    const prepared = await portable.prepareImport(JSON.stringify(fixtures[index]), []);
    assert(prepared.preview.canImport, `${files[index]} should be importable`);
    assert(prepared.preview.total === fixtures[index].records.length, `${files[index]} total mismatch`);
  }

  const original = fixtures[0].records[0];
  const originalPrepared = await portable.prepareImport(JSON.stringify(fixtures[0]), []);
  const originalPlan = portable.buildImportPlan(originalPrepared, [], []);
  originalPlan.businessRecords[0].cardStyle = 'normal';
  originalPlan.businessRecords[0].coverPreset = 0;
  const idempotent = await portable.buildBundle({
    appVersion: 'v2.2.0-alpha3',
    timezone: 'Asia/Shanghai',
    exportedAt: '2026-07-20T00:00:00.000Z',
    settings: {},
    records: originalPlan.businessRecords,
    portableEntities: originalPlan.portableEntities,
    envelope: originalPlan.envelope
  });
  assert(portable.canonicalize(idempotent.records[0]) === portable.canonicalize(original), 'unmodified materialized record must re-export idempotently');
  const changed = clone(fixtures[0]);
  changed.records[0].data.title = 'same timestamp, different content';
  const changedBundle = await portable.finalizeBundle(changed);
  const conflict = await portable.prepareImport(JSON.stringify(changedBundle), [entity(original, 'legacy-1')]);
  assert(conflict.preview.conflict === 1 && !conflict.preview.canImport, 'equal timestamp difference must block as conflict');

  const newer = clone(changedBundle);
  newer.records[0].updatedAt = '2026-07-20T01:01:00.000Z';
  const newerBundle = await portable.finalizeBundle(newer);
  const update = await portable.prepareImport(JSON.stringify(newerBundle), [entity(original, 'legacy-1')]);
  assert(update.preview.update === 1 && update.preview.canImport, 'newer record must preview as update');

  const unsupported = fixtures.find((bundle) => bundle.records[0].type === 'daily-check-in');
  const unsupportedPrepared = await portable.prepareImport(JSON.stringify(unsupported), []);
  const unsupportedPlan = portable.buildImportPlan(unsupportedPrepared, [], []);
  assert(unsupportedPlan.businessRecords.length === 0, 'unsupported domain records must not be invented as legacy records');
  assert(unsupportedPlan.portableEntities[0].canonicalRecord.futureRecordField, 'unknown record fields must be preserved');
  const preservedBundle = await portable.buildBundle({
    appVersion: 'v2.2.0-alpha3',
    timezone: 'UTC',
    exportedAt: '2026-07-20T00:00:00.000Z',
    settings: {},
    records: [],
    portableEntities: unsupportedPlan.portableEntities,
    envelope: unsupportedPlan.envelope
  });
  assert(preservedBundle.records[0].futureRecordField === unsupported.records[0].futureRecordField, 'future record field must survive re-export');
  assert(preservedBundle.fixtureMetadata.sequence === unsupported.fixtureMetadata.sequence, 'future top-level field must survive re-export');
  assert(preservedBundle.settings.futureSetting === unsupported.settings.futureSetting, 'future setting must survive re-export');

  const tombstoneBase = clone(fixtures[0]);
  tombstoneBase.records[0].state = 'DELETED';
  tombstoneBase.records[0].updatedAt = '2026-07-21T01:01:00.000Z';
  tombstoneBase.records[0].data = { privateText: 'must be purged' };
  const tombstoneBundle = await portable.finalizeBundle(tombstoneBase);
  const tombstonePrepared = await portable.prepareImport(JSON.stringify(tombstoneBundle), [entity(original, 'legacy-1')]);
  assert(tombstonePrepared.preview.update === 1, 'newer tombstone should update');
  const tombstonePlan = portable.buildImportPlan(tombstonePrepared, [{ id: 'legacy-1', portableId: original.portableId, title: 'private' }], [entity(original, 'legacy-1')]);
  assert(tombstonePlan.businessRecords.length === 0, 'tombstone must remove materialized record');
  assert(Object.keys(tombstonePlan.portableEntities[0].canonicalRecord.data).length === 0, 'tombstone private data must be purged');

  const oversized = await portable.prepareImport('x'.repeat(portable.MAX_INPUT_BYTES + 1), []);
  assert(oversized.preview.errors[0] === 'input_too_large', 'oversized input must be rejected before parsing');

  const journalText = JSON.stringify(unsupportedPlan.journal);
  assert(!journalText.includes(unsupported.records[0].data.title), 'operation journal must not contain private record text');
  console.log(`Portable Export v1 regression passed: ${files.length}/36 fixtures plus protocol edges`);
}

main().catch((error) => { console.error(error.stack || error); process.exit(1); });
