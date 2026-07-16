/**
 * Composer State - Unified Composer state management (singleton)
 *
 * Responsibilities:
 *   - Maintain a single Composer state across the entire site (singleton)
 *   - Track current draft text
 *   - Track processing state: idle | processing | done
 *   - Track last submission result
 *   - Persist draft to sessionStorage (not into the formal record store)
 *   - Debounce to prevent duplicate execution from multiple clicks
 *   - Support Esc to cancel the current draft
 *   - Restore unsubmitted draft on page reload
 *
 * Global: window.ShikeComposerState
 */
(function(global){
  'use strict';

  /* ---------- Constants ---------- */

  var STORAGE_KEY = 'shike_composer_draft';
  var DEBOUNCE_MS = 800;

  /* ---------- Singleton state (not exported directly) ---------- */

  var state = {
    draft: '',                // current draft text
    processingState: 'idle',  // idle | processing | done
    lastResult: null,          // last submission result object
    lastSubmitTime: 0,        // timestamp of last submit (for debounce)
    lastSubmitText: ''        // text of last submit (for duplicate detection)
  };

  var listeners = [];   // state-change subscribers
  var escHandlers = []; // Esc-cancel subscribers

  /* ---------- sessionStorage draft persistence ---------- */

  function loadDraftFromStorage(){
    try{
      var saved = global.sessionStorage.getItem(STORAGE_KEY);
      if(saved !== null){
        state.draft = saved;
      }
    }catch(e){ /* sessionStorage may be unavailable */ }
  }

  function saveDraftToStorage(){
    try{
      global.sessionStorage.setItem(STORAGE_KEY, state.draft);
    }catch(e){ /* ignore quota or access errors */ }
  }

  function removeDraftFromStorage(){
    try{
      global.sessionStorage.removeItem(STORAGE_KEY);
    }catch(e){ /* ignore */ }
  }

  /* ---------- Notification ---------- */

  function getSnapshot(){
    return {
      draft: state.draft,
      processingState: state.processingState,
      lastResult: state.lastResult,
      canSubmit: canSubmit()
    };
  }

  function notify(){
    var snapshot = getSnapshot();
    for(var i = 0; i < listeners.length; i++){
      try{ listeners[i](snapshot); }catch(e){ /* ignore listener errors */ }
    }
    // Also dispatch a DOM event for non-subscribers
    try{
      global.dispatchEvent(new CustomEvent('shike:composer-state', { detail: snapshot }));
    }catch(e){ /* CustomEvent may be unavailable */ }
  }

  /* ---------- Draft management ---------- */

  function getDraft(){
    return state.draft;
  }

  function setDraft(text){
    state.draft = String(text || '');
    saveDraftToStorage();
    notify();
  }

  function clearDraft(){
    state.draft = '';
    removeDraftFromStorage();
    notify();
  }

  /**
   * Cancel the current draft completely.
   * Clears draft, resets processing state, and fires Esc handlers.
   */
  function cancelDraft(){
    state.draft = '';
    state.processingState = 'idle';
    state.lastResult = null;
    removeDraftFromStorage();
    notify();
    // Fire esc handlers
    for(var i = 0; i < escHandlers.length; i++){
      try{ escHandlers[i](); }catch(e){ /* ignore */ }
    }
  }

  /**
   * Restore unsubmitted draft from sessionStorage.
   * Called on init or explicitly to recover draft after a page reload.
   * @returns {string} the restored draft text
   */
  function restoreDraft(){
    loadDraftFromStorage();
    notify();
    return state.draft;
  }

  /* ---------- Processing state ---------- */

  function getProcessingState(){
    return state.processingState;
  }

  function setProcessingState(ps){
    state.processingState = ps;
    notify();
  }

  /* ---------- Last result ---------- */

  function getLastResult(){
    return state.lastResult;
  }

  function setLastResult(result){
    state.lastResult = result;
    // Transition to done on success, back to idle on failure
    if(result && result.ok === false){
      state.processingState = 'idle';
    }else{
      state.processingState = 'done';
    }
    notify();
  }

  /* ---------- Submit control (debounce) ---------- */

  /**
   * Check whether a new submit is allowed right now.
   * Returns false when:
   *   - Currently processing
   *   - Within the debounce window after the last submit
   *   - Same text submitted again within the debounce window
   * @returns {boolean}
   */
  function canSubmit(){
    if(state.processingState === 'processing') return false;
    var now = Date.now();
    if(now - state.lastSubmitTime < DEBOUNCE_MS) return false;
    return true;
  }

  /**
   * Mark that a submit is in progress.
   * Records the timestamp and text for debounce / duplicate detection.
   * @param {string} text - the text being submitted
   */
  function markSubmitting(text){
    state.lastSubmitTime = Date.now();
    state.lastSubmitText = text || '';
    state.processingState = 'processing';
    notify();
  }

  /* ---------- Reset ---------- */

  function reset(){
    state.draft = '';
    state.processingState = 'idle';
    state.lastResult = null;
    state.lastSubmitTime = 0;
    state.lastSubmitText = '';
    removeDraftFromStorage();
    notify();
  }

  /* ---------- Subscription ---------- */

  /**
   * Subscribe to state changes.
   * @param {function} fn - callback receiving a state snapshot
   * @returns {function} unsubscribe function
   */
  function subscribe(fn){
    if(typeof fn === 'function'){
      listeners.push(fn);
    }
    return function unsubscribe(){
      var idx = listeners.indexOf(fn);
      if(idx >= 0) listeners.splice(idx, 1);
    };
  }

  /**
   * Register a handler to be called when Esc cancels the draft.
   * @param {function} fn - callback
   * @returns {function} off function
   */
  function onEsc(fn){
    if(typeof fn === 'function'){
      escHandlers.push(fn);
    }
    return function off(){
      var idx = escHandlers.indexOf(fn);
      if(idx >= 0) escHandlers.splice(idx, 1);
    };
  }

  /* ---------- Initialize: restore draft from sessionStorage ---------- */

  loadDraftFromStorage();

  /* ---------- Export ---------- */

  global.ShikeComposerState = Object.freeze({
    // Draft management
    getDraft: getDraft,
    setDraft: setDraft,
    clearDraft: clearDraft,
    cancelDraft: cancelDraft,
    restoreDraft: restoreDraft,

    // Processing state
    getProcessingState: getProcessingState,
    setProcessingState: setProcessingState,

    // Result
    getLastResult: getLastResult,
    setLastResult: setLastResult,

    // Submit control (debounce)
    canSubmit: canSubmit,
    markSubmitting: markSubmitting,

    // Subscription
    subscribe: subscribe,
    onEsc: onEsc,
    getSnapshot: getSnapshot,

    // Reset
    reset: reset
  });

})(typeof window !== 'undefined' ? window : this);
