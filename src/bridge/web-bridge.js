import {
  BridgeKeys,
  BridgeVersion,
  ItemType,
  normalizeBridgeState,
  validateReturnPayload
} from '../contracts/chronos-contracts.js';

const WAITING_KEYWORDS = ['等待', '等回复', '等消息', '等结果', '等通知', '等快递', '等审批'];
const COMMITMENT_KEYWORDS = ['答应', '承诺', '必须', '保证', '一定', '约定'];

function parse(raw) {
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function detectGameType(record) {
  const title = String(record?.title || record?.text || '').toLowerCase();
  if (WAITING_KEYWORDS.some(keyword => title.includes(keyword))) return ItemType.WAITING_FOR;
  if (COMMITMENT_KEYWORDS.some(keyword => title.includes(keyword))) return ItemType.COMMITMENT;
  if (['habit', 'anniversary'].includes(record?.type) || ['habit', 'anniversary'].includes(record?.sourceKind)) {
    return ItemType.COMMITMENT;
  }
  return ItemType.TASK;
}

export function generateHandoff(records, options = {}) {
  const now = Date.now();
  return {
    version: BridgeVersion,
    transferId: `handoff_${now}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    source: 'shike-web',
    returnUrl: options.returnUrl || '../competition.html',
    records: (records || []).slice(0, 3).map(record => ({
      sourceRecordId: String(record.id || record.sourceRecordId || ''),
      title: String(record.title || record.text || '').slice(0, 200),
      sourceKind: String(record.type || record.kind || ''),
      gameType: detectGameType(record),
      dateKey: String(record.dateKey || record.date || ''),
      timeText: String(record.timeText || record.time || '')
    }))
  };
}

export function writeHandoff(handoff, storage = localStorage) {
  try { storage.setItem(BridgeKeys.HANDOFF, JSON.stringify(handoff)); return true; }
  catch (error) { console.error('[WebBridge] Failed to write handoff:', error.message); return false; }
}

export function readReturnPayload(storage = localStorage) {
  const result = validateReturnPayload(parse(storage.getItem(BridgeKeys.RETURN)));
  return result.success ? result.data : null;
}

export function readBridgeState(storage = localStorage) {
  return normalizeBridgeState(parse(storage.getItem(BridgeKeys.STATE)));
}

export function updateBridgeState(mutator, storage = localStorage, now = Date.now()) {
  const current = readBridgeState(storage);
  const next = normalizeBridgeState(mutator({ ...current }) || current, now);
  next.updatedAt = now;
  storage.setItem(BridgeKeys.STATE, JSON.stringify(next));
  return next;
}

export function isReturnApplied(transferId, storage = localStorage) {
  return readBridgeState(storage).appliedReturns.includes(transferId);
}

export function markReturnApplied(transferId, storage = localStorage) {
  return updateBridgeState(state => ({
    ...state,
    appliedReturns: [...state.appliedReturns, transferId]
  }), storage);
}

export function clearReturnPayload(storage = localStorage) {
  try { storage.removeItem(BridgeKeys.RETURN); } catch { /* storage is best effort */ }
}

export function goToGame(path = 'valley/') {
  window.location.href = path;
}

export function getDemoRecords(round = '') {
  const suffix = round ? ` ${round}` : '';
  return [
    { id: `demo_task_1${suffix}`, title: `完成比赛演示视频${suffix}`, type: 'reminder' },
    { id: `demo_commit_1${suffix}`, title: `答应团队今晚完成最终检查${suffix}`, type: 'note' },
    { id: `demo_wait_1${suffix}`, title: `等待比赛材料审核结果${suffix}`, type: 'note' }
  ];
}
