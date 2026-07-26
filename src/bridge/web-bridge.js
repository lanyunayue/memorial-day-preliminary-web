/**
 * Web Bridge - C0 Competition Integration
 *
 * Generates handoff for Chronos Valley game, and reads return payload.
 * Uses localStorage for same-origin communication.
 */

export const BRIDGE_VERSION = 1;
const HANDOFF_KEY = 'chronos_game_handoff_v1';
const RETURN_KEY = 'chronos_game_return_v1';
const BRIDGE_STATE_KEY = 'chronos_game_bridge_state_v1';

// Wait-for keywords for type detection
const WAITING_KEYWORDS = ['等待', '等回复', '等消息', '等结果', '等通知', '等快递', '等审批'];
const COMMITMENT_KEYWORDS = ['答应', '承诺', '必须', '保证', '一定', '约定'];

/**
 * Detect game type from a record.
 * @param {Object} record - Web端 record
 * @returns {string} 'TASK' | 'COMMITMENT' | 'WAITING_FOR'
 */
export function detectGameType(record) {
  const title = (record.title || record.text || '').toLowerCase();

  // Check waiting keywords first
  for (const kw of WAITING_KEYWORDS) {
    if (title.includes(kw.toLowerCase())) return 'WAITING_FOR';
  }

  // Check commitment keywords
  for (const kw of COMMITMENT_KEYWORDS) {
    if (title.includes(kw.toLowerCase())) return 'COMMITMENT';
  }

  // Map by sourceKind
  if (record.type === 'habit' || record.sourceKind === 'habit') return 'COMMITMENT';
  if (record.type === 'anniversary' || record.sourceKind === 'anniversary') return 'COMMITMENT';

  // Default: TASK
  return 'TASK';
}

/**
 * Generate handoff payload for game.
 * Takes up to 3 records and maps them to game types.
 *
 * @param {Array} records - Web端 records
 * @param {Object} [opts] - options
 * @param {string} [opts.returnUrl] - URL to return to (default: '../')
 * @returns {Object} handoff payload
 */
export function generateHandoff(records, opts = {}) {
  const selected = records.slice(0, 3);

  return {
    version: BRIDGE_VERSION,
    transferId: 'handoff_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: Date.now(),
    source: 'shike-web',
    returnUrl: opts.returnUrl || '../',
    records: selected.map(r => ({
      sourceRecordId: String(r.id || ''),
      title: String(r.title || r.text || '').slice(0, 200),
      sourceKind: String(r.type || r.kind || ''),
      gameType: detectGameType(r),
      dateKey: String(r.dateKey || r.date || ''),
      timeText: String(r.timeText || r.time || '')
    }))
  };
}

/**
 * Write handoff to localStorage.
 * @param {Object} handoff
 */
export function writeHandoff(handoff) {
  try {
    localStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff));
    return true;
  } catch (e) {
    console.error('[WebBridge] Failed to write handoff:', e.message);
    return false;
  }
}

/**
 * Read return payload from game.
 * @returns {Object|null} return payload or null
 */
export function readReturnPayload() {
  try {
    const raw = localStorage.getItem(RETURN_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== BRIDGE_VERSION) return null;
    if (!data.transferId) return null;
    return data;
  } catch (e) {
    console.warn('[WebBridge] Failed to read return:', e.message);
    return null;
  }
}

/**
 * Check if return payload has been applied.
 * @param {string} transferId
 * @returns {boolean}
 */
export function isReturnApplied(transferId) {
  try {
    const raw = localStorage.getItem(BRIDGE_STATE_KEY);
    if (!raw) return false;
    const state = JSON.parse(raw);
    return state.appliedReturns && state.appliedReturns.includes(transferId);
  } catch {
    return false;
  }
}

/**
 * Mark return payload as applied.
 * @param {string} transferId
 */
export function markReturnApplied(transferId) {
  try {
    const raw = localStorage.getItem(BRIDGE_STATE_KEY);
    const state = raw ? JSON.parse(raw) : { appliedReturns: [] };
    if (!state.appliedReturns) state.appliedReturns = [];
    if (!state.appliedReturns.includes(transferId)) {
      state.appliedReturns.push(transferId);
    }
    localStorage.setItem(BRIDGE_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[WebBridge] Failed to mark applied:', e.message);
  }
}

/**
 * Clear return payload after applying.
 */
export function clearReturnPayload() {
  try {
    localStorage.removeItem(RETURN_KEY);
  } catch {
    // ignore
  }
}

/**
 * Navigate to the game.
 * @param {string} valleyPath - path to valley/index.html (default: 'valley/')
 */
export function goToGame(valleyPath = 'valley/') {
  window.location.href = valleyPath;
}

/**
 * Generate competition demo records.
 * @returns {Array} 3 demo records
 */
export function getDemoRecords() {
  return [
    {
      id: 'demo_task_1',
      title: '完成比赛演示视频',
      type: 'reminder',
      dateKey: '',
      timeText: ''
    },
    {
      id: 'demo_commit_1',
      title: '答应团队今晚完成最终检查',
      type: 'note',
      dateKey: '',
      timeText: ''
    },
    {
      id: 'demo_wait_1',
      title: '等待比赛材料审核结果',
      type: 'note',
      dateKey: '',
      timeText: ''
    }
  ];
}
