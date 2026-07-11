/**
 * Composer View - View binding and synchronization
 *
 * Responsibilities:
 *   - Bind the home page input (#quickInput) and workbench input (#agentInput)
 *   - Sync: input in one location immediately updates the other
 *   - Disable submit buttons when input is empty
 *   - Show a clear prompt when submitting with empty input
 *   - Show loading state during processing
 *   - Support Esc to clear the current draft
 *
 * Global: window.ShikeComposerView
 */
(function(global){
  'use strict';

  /* ---------- DOM element IDs ---------- */

  var HOME_INPUT_ID = 'quickInput';
  var HOME_BTN_ID = 'saveBtn';
  var WORKBENCH_INPUT_ID = 'agentInput';
  var WORKBENCH_BTN_ID = 'agentSendBtn';

  /* ---------- State ---------- */

  var initialized = false;
  var syncing = false; // flag to prevent recursive sync

  /* ---------- Helpers ---------- */

  function $(id){
    return document.getElementById(id);
  }

  function getHomeInput(){ return $(HOME_INPUT_ID); }
  function getHomeBtn(){ return $(HOME_BTN_ID); }
  function getWorkbenchInput(){ return $(WORKBENCH_INPUT_ID); }
  function getWorkbenchBtn(){ return $(WORKBENCH_BTN_ID); }

  function getState(){
    return global.ShikeComposerState;
  }

  function getController(){
    return global.ShikeComposerController;
  }

  /** Show a toast message if available. */
  function toast(msg, type){
    if(typeof global.showToast === 'function'){
      try{ global.showToast(msg, type); }catch(e){ /* ignore */ }
    }
  }

  /* ---------- Input synchronization ---------- */

  /**
   * Copy the value from the source input to the target input.
   * Uses the syncing flag to prevent recursive updates.
   */
  function syncToOther(source, target){
    if(!source || !target || syncing) return;
    syncing = true;
    try{
      target.value = source.value;
    }catch(e){ /* ignore */ }
    syncing = false;
  }

  /* ---------- Button state management ---------- */

  /**
   * Update the disabled state of submit buttons based on:
   *   - Whether the current input is empty
   *   - Whether processing is in progress
   */
  function updateButtonStates(){
    var state = getState();
    var homeInput = getHomeInput();
    var workbenchInput = getWorkbenchInput();
    var homeBtn = getHomeBtn();
    var workbenchBtn = getWorkbenchBtn();

    // Determine if input is empty
    var isEmpty = true;
    if(homeInput){
      isEmpty = !String(homeInput.value || '').trim();
    }else if(workbenchInput){
      isEmpty = !String(workbenchInput.value || '').trim();
    }

    // Determine if processing
    var isProcessing = state && state.getProcessingState() === 'processing';

    var shouldDisable = isEmpty || isProcessing;

    if(homeBtn){ homeBtn.disabled = shouldDisable; }
    if(workbenchBtn){ workbenchBtn.disabled = shouldDisable; }
  }

  /* ---------- Loading state ---------- */

  /**
   * Show or hide loading state on submit buttons.
   * When loading, button text changes to "处理中..." and is disabled.
   * When not loading, original text is restored and disabled state is recalculated.
   */
  function showLoading(loading){
    var homeBtn = getHomeBtn();
    var workbenchBtn = getWorkbenchBtn();

    if(loading){
      if(homeBtn){
        if(!homeBtn.dataset.originalText){
          homeBtn.dataset.originalText = homeBtn.textContent;
        }
        homeBtn.textContent = '处理中...';
        homeBtn.disabled = true;
      }
      if(workbenchBtn){
        if(!workbenchBtn.dataset.originalText){
          workbenchBtn.dataset.originalText = workbenchBtn.textContent;
        }
        workbenchBtn.textContent = '处理中...';
        workbenchBtn.disabled = true;
      }
    }else{
      if(homeBtn && homeBtn.dataset.originalText){
        homeBtn.textContent = homeBtn.dataset.originalText;
        delete homeBtn.dataset.originalText;
      }
      if(workbenchBtn && workbenchBtn.dataset.originalText){
        workbenchBtn.textContent = workbenchBtn.dataset.originalText;
        delete workbenchBtn.dataset.originalText;
      }
      updateButtonStates();
    }
  }

  /* ---------- Empty input prompt ---------- */

  function showEmptyPrompt(){
    toast('请输入内容后再发送', 'warn');
  }

  /* ---------- Esc handling ---------- */

  /**
   * Check whether the home input has a pending parse preview.
   * When pendingParsePreview exists, the existing Esc handler takes care of it,
   * so the composer should NOT clear the input.
   */
  function hasPendingPreview(){
    try{
      return !!global.pendingParsePreview;
    }catch(e){
      return false;
    }
  }

  /**
   * Clear both inputs and cancel the draft in state.
   */
  function clearBothInputs(){
    var home = getHomeInput();
    var workbench = getWorkbenchInput();
    if(home){ home.value = ''; }
    if(workbench){ workbench.value = ''; }

    var state = getState();
    if(state){
      state.cancelDraft();
    }

    updateButtonStates();
  }

  /* ---------- Event handlers ---------- */

  /** Home input 'input' event: sync to workbench + update state + update buttons */
  function onHomeInput(){
    var input = getHomeInput();
    if(!input) return;

    syncToOther(input, getWorkbenchInput());

    var state = getState();
    if(state){
      state.setDraft(input.value);
    }

    updateButtonStates();
  }

  /** Workbench input 'input' event: sync to home + update state + update buttons */
  function onWorkbenchInput(){
    var input = getWorkbenchInput();
    if(!input) return;

    syncToOther(input, getHomeInput());

    var state = getState();
    if(state){
      state.setDraft(input.value);
    }

    updateButtonStates();
  }

  /** Home input keydown: Esc to clear */
  function onHomeKeydown(e){
    if(e.key === 'Escape'){
      // Let existing handler deal with pending parse preview first
      if(hasPendingPreview()) return;
      e.preventDefault();
      clearBothInputs();
      var input = getHomeInput();
      if(input){ input.focus(); }
    }
  }

  /** Workbench input keydown: Esc to clear */
  function onWorkbenchKeydown(e){
    if(e.key === 'Escape'){
      e.preventDefault();
      clearBothInputs();
      var input = getWorkbenchInput();
      if(input){ input.focus(); }
    }
  }

  /** Home input Enter keydown: submit or show empty prompt */
  function onHomeEnter(e){
    if(e.key === 'Enter' && !e.shiftKey && !(e.ctrlKey || e.metaKey)){
      var input = getHomeInput();
      var text = input ? String(input.value || '').trim() : '';
      if(!text){
        e.preventDefault();
        showEmptyPrompt();
        return;
      }
      // If a controller is available, intercept the submit
      var controller = getController();
      if(controller && typeof controller.submit === 'function'){
        e.preventDefault();
        e.stopImmediatePropagation();
        controller.submit(text);
      }
      // Otherwise, let the existing handler proceed
    }
  }

  /** Workbench input Enter keydown: submit or show empty prompt */
  function onWorkbenchEnter(e){
    if(e.key === 'Enter'){
      var input = getWorkbenchInput();
      var text = input ? String(input.value || '').trim() : '';
      if(!text){
        e.preventDefault();
        showEmptyPrompt();
        return;
      }
      // If a controller is available, intercept the submit
      var controller = getController();
      if(controller && typeof controller.submit === 'function'){
        e.preventDefault();
        e.stopImmediatePropagation();
        controller.submit(text);
      }
      // Otherwise, let the existing handler proceed
    }
  }

  /**
   * Submit button click handler (capturing phase).
   * Intercepts the click before existing bubbling-phase handlers.
   */
  function onSubmitClick(e){
    // Determine which input this button belongs to
    var btn = e.currentTarget;
    var isHome = btn && btn.id === HOME_BTN_ID;
    var input = isHome ? getHomeInput() : getWorkbenchInput();
    var text = input ? String(input.value || '').trim() : '';

    // Empty input: show prompt and stop
    if(!text){
      e.preventDefault();
      e.stopImmediatePropagation();
      showEmptyPrompt();
      return;
    }

    // Check debounce / processing
    var state = getState();
    if(state && !state.canSubmit()){
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    // If controller is available, intercept the submit
    var controller = getController();
    if(controller && typeof controller.submit === 'function'){
      e.preventDefault();
      e.stopImmediatePropagation();
      controller.submit(text);
    }
    // Otherwise, let the existing handler proceed
  }

  /* ---------- State change listener ---------- */

  function onStateChange(snapshot){
    if(!snapshot) return;

    // Show / hide loading
    showLoading(snapshot.processingState === 'processing');

    // On successful completion, clear inputs
    if(snapshot.processingState === 'done' && snapshot.lastResult && snapshot.lastResult.ok){
      var home = getHomeInput();
      var workbench = getWorkbenchInput();
      if(home){ home.value = ''; }
      if(workbench){ workbench.value = ''; }
      var state = getState();
      if(state){ state.clearDraft(); }
      updateButtonStates();
    }
  }

  /* ---------- Draft restoration ---------- */

  /**
   * Restore draft text from state to both input fields.
   */
  function restoreDraftToInputs(){
    var state = getState();
    if(!state) return;

    var draft = state.getDraft();
    if(draft){
      var home = getHomeInput();
      var workbench = getWorkbenchInput();
      if(home){ home.value = draft; }
      if(workbench){ workbench.value = draft; }
    }
    updateButtonStates();
  }

  /* ---------- Initialization ---------- */

  function init(){
    if(initialized) return;
    initialized = true;

    var homeInput = getHomeInput();
    var workbenchInput = getWorkbenchInput();
    var homeBtn = getHomeBtn();
    var workbenchBtn = getWorkbenchBtn();

    // --- Bind input events for sync ---
    if(homeInput){
      homeInput.addEventListener('input', onHomeInput);
      homeInput.addEventListener('keydown', onHomeKeydown);
      homeInput.addEventListener('keydown', onHomeEnter);
    }

    if(workbenchInput){
      workbenchInput.addEventListener('input', onWorkbenchInput);
      workbenchInput.addEventListener('keydown', onWorkbenchKeydown);
      workbenchInput.addEventListener('keydown', onWorkbenchEnter);
    }

    // --- Bind submit buttons (capturing phase to intercept before existing handlers) ---
    if(homeBtn){
      homeBtn.addEventListener('click', onSubmitClick, true);
    }
    if(workbenchBtn){
      workbenchBtn.addEventListener('click', onSubmitClick, true);
    }

    // --- Subscribe to state changes ---
    var state = getState();
    if(state && typeof state.subscribe === 'function'){
      state.subscribe(onStateChange);
    }

    // --- Restore draft from sessionStorage ---
    if(state){
      state.restoreDraft();
      restoreDraftToInputs();
    }

    // --- Initial button state ---
    updateButtonStates();
  }

  /* ---------- Auto-initialize ---------- */

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }

  /* ---------- Export ---------- */

  global.ShikeComposerView = Object.freeze({
    init: init,
    syncToOther: syncToOther,
    updateButtonStates: updateButtonStates,
    showLoading: showLoading,
    showEmptyPrompt: showEmptyPrompt,
    restoreDraftToInputs: restoreDraftToInputs,
    clearBothInputs: clearBothInputs
  });

})(typeof window !== 'undefined' ? window : this);
