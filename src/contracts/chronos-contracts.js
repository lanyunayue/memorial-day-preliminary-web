export const BridgeVersion = 1;

export const BridgeKeys = Object.freeze({
  HANDOFF: 'chronos_game_handoff_v1',
  RETURN: 'chronos_game_return_v1',
  STATE: 'chronos_game_bridge_state_v1'
});

export const ItemType = Object.freeze({
  TASK: 'TASK',
  COMMITMENT: 'COMMITMENT',
  WAITING_FOR: 'WAITING_FOR'
});

export const ItemStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  WAITING: 'WAITING',
  DEFERRED: 'DEFERRED',
  COMPLETED: 'COMPLETED',
  RELEASED: 'RELEASED',
  SPLIT_PARENT: 'SPLIT_PARENT'
});

export const ReturnAction = Object.freeze({
  SPLIT: 'split',
  COMPLETED: 'completed',
  RELEASED: 'released',
  DEFERRED: 'deferred',
  DROP_TODAY: 'dropToday',
  ACKNOWLEDGED: 'acknowledged',
  SEEN: 'seen'
});

export const HandoffSchema = Object.freeze({
  version: BridgeVersion,
  required: ['transferId', 'records'],
  maxRecords: 3
});

export const ReturnPayloadSchema = Object.freeze({
  version: BridgeVersion,
  required: ['transferId', 'actions']
});

export const BridgeStateSchema = Object.freeze({
  version: BridgeVersion,
  historyLimit: 50
});

const itemTypes = new Set(Object.values(ItemType));
const returnActions = new Set(Object.values(ReturnAction));
const HISTORY_LIMIT = BridgeStateSchema.historyLimit;

function strings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(v => typeof v === 'string' && v.length > 0))].slice(-HISTORY_LIMIT);
}

export function normalizeBridgeState(input, now = Date.now()) {
  const value = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return {
    version: BridgeVersion,
    activeTransferId: typeof value.activeTransferId === 'string' && value.activeTransferId
      ? value.activeTransferId
      : null,
    consumedTransfers: strings(value.consumedTransfers),
    appliedReturns: strings(value.appliedReturns),
    updatedAt: Number.isFinite(value.updatedAt) ? value.updatedAt : now
  };
}

export function validateHandoff(input) {
  if (!input || typeof input !== 'object') return { success: false, error: 'handoff must be an object' };
  if (input.version !== BridgeVersion) return { success: false, error: 'unsupported handoff version' };
  if (typeof input.transferId !== 'string' || !input.transferId) return { success: false, error: 'missing transferId' };
  if (!Array.isArray(input.records) || input.records.length < 1 || input.records.length > 3) {
    return { success: false, error: 'records must contain 1..3 items' };
  }
  const records = input.records.map(record => ({
    sourceRecordId: String(record?.sourceRecordId || ''),
    title: String(record?.title || '').slice(0, 200),
    sourceKind: String(record?.sourceKind || ''),
    gameType: itemTypes.has(record?.gameType) ? record.gameType : ItemType.TASK,
    dateKey: String(record?.dateKey || ''),
    timeText: String(record?.timeText || '')
  }));
  if (records.some(record => !record.sourceRecordId || !record.title)) {
    return { success: false, error: 'record identity and title are required' };
  }
  return {
    success: true,
    data: {
      version: BridgeVersion,
      transferId: input.transferId,
      createdAt: Number.isFinite(input.createdAt) ? input.createdAt : 0,
      source: String(input.source || ''),
      returnUrl: String(input.returnUrl || '../competition.html'),
      records
    }
  };
}

export function validateReturnPayload(input) {
  if (!input || typeof input !== 'object') return { success: false, error: 'return payload must be an object' };
  if (input.version !== BridgeVersion) return { success: false, error: 'unsupported return version' };
  if (typeof input.transferId !== 'string' || !input.transferId) return { success: false, error: 'missing transferId' };
  if (!Array.isArray(input.actions)) return { success: false, error: 'actions must be an array' };
  const actions = input.actions.filter(action =>
    action &&
    action.bridgeTransferId === input.transferId &&
    typeof action.sourceRecordId === 'string' &&
    returnActions.has(action.action)
  );
  return { success: true, data: { ...input, version: BridgeVersion, actions: dedupeReturnActions(actions, input.transferId) } };
}

const priority = Object.freeze({
  split: 5,
  completed: 5,
  released: 5,
  deferred: 4,
  dropToday: 4,
  acknowledged: 3,
  seen: 1
});

export function dedupeReturnActions(actions, activeTransferId = null) {
  const selected = new Map();
  for (const action of Array.isArray(actions) ? actions : []) {
    if (!action || !returnActions.has(action.action) || !action.sourceRecordId) continue;
    if (activeTransferId && action.bridgeTransferId !== activeTransferId) continue;
    const previous = selected.get(action.sourceRecordId);
    if (!previous || priority[action.action] > priority[previous.action]) selected.set(action.sourceRecordId, action);
  }
  return [...selected.values()];
}
