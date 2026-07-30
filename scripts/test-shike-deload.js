const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const DeLoad = require(path.join(root, 'src', 'load', 'deload-controller.js'));
let passed = 0;
function check(value, message) { assert.ok(value, message); passed += 1; }

const now = new Date('2026-07-19T12:00:00+08:00');
const records = [
  { id: 'overdue', title: 'private overdue title', dateKey: '2026-07-18', recordState: 'active', createdAt: 1 },
  { id: 'today', title: 'private today title', dateKey: '2026-07-19', recordState: 'active', createdAt: 2 },
  { id: 'future', title: 'future', dateKey: '2026-07-20', recordState: 'active', createdAt: 3 },
  { id: 'done', title: 'done', dateKey: '2026-07-19', recordState: 'completed', createdAt: 4 }
];

const preview = DeLoad.preview(records, now);
check(preview.count === 2 && preview.overdue === 1, 'preview counts due and overdue open records only');
check(preview.candidates.map((item) => item.id).join(',') === 'overdue,today', 'candidates use stable due-date ordering');

const deferred = DeLoad.apply(records, 'DEFER', 'overdue', now);
const deferredRecord = deferred.records.find((item) => item.id === 'overdue');
check(deferredRecord.recordState === 'deferred' && deferredRecord.dateKey === '2026-07-20', 'defer is explicit and moves the selected record to tomorrow');
check(records[0].recordState === 'active' && records[0].dateKey === '2026-07-18', 'apply does not mutate caller records');
check(deferred.recordsToPersist.length === 1, 'defer persists only the changed business record');

const lower = DeLoad.apply(records, 'LOWER_STANDARD', 'today', now);
check(lower.records.find((item) => item.id === 'today').completionStandard === 'good_enough', 'lower standard does not complete the record');

const renegotiate = DeLoad.apply(records, 'RENEGOTIATE', 'today', now);
check(renegotiate.records.find((item) => item.id === 'today').renegotiationNeeded === true, 'renegotiate records an explicit request');

const focus = DeLoad.apply(records, 'KEEP_ONLY_ONE', 'today', now);
check(focus.records.find((item) => item.id === 'today').tonightFocus === true, 'keep-only-one selects tonight focus');
check(focus.records.find((item) => item.id === 'overdue').notTonight === true && focus.records.find((item) => item.id === 'overdue').recordState === 'active', 'not tonight is not cancellation');
check(focus.portableRecords.some((item) => item.type === 'tonight-focus'), 'focus creates a portable TonightFocus record');

const ended = DeLoad.apply(records, 'SAVE_AND_END_DAY', null, now);
check(ended.records.every((item, index) => item.recordState === records[index].recordState), 'end day does not complete all records');
check(ended.portableRecords.some((item) => item.type === 'day-end-record'), 'end day creates a portable DayEndRecord');

const serialized = JSON.stringify(focus.portableRecords);
check(!serialized.includes('private overdue title') && !serialized.includes('private today title'), 'operation sidecars do not store raw private titles');
check(focus.portableRecords.some((item) => item.type === 'deload-plan') && focus.portableRecords.some((item) => item.type === 'operation-journal'), 'every action creates plan and journal records');

assert.throws(() => DeLoad.apply(records, 'DEFER', 'future', now), /deload_target_not_eligible/);
passed += 1;

const storage = fs.readFileSync(path.join(root, 'src', 'storage', 'indexeddb-storage.js'), 'utf8');
check(/function applyDeLoad\(payload\)/.test(storage) && /\['records','portable_records','audit_log'\],'readwrite'/.test(storage), 'IndexedDB commit spans records, portable sidecars, and audit log in one transaction');

console.log(`DeLoad regression passed: ${passed}/${passed}`);
