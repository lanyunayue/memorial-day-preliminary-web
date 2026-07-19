/**
 * Composer Controller - Unified submission entry point
 *
 * Responsibilities:
 *   - Provide a single entry point: ShikeComposerController.submit(text)
 *   - Call the classifier to determine input category
 *   - Route to the appropriate handler based on category:
 *       A → parser adapter → create record
 *       B → search tool → query local records
 *       C → agent tool → apply app operation
 *       D → retrieval engine → online Q&A
 *       E → normal reply
 *       F → "cannot understand" message
 *   - Reject empty input with an error
 *   - Show processing state during execution
 *   - Prevent duplicate submission (debounce via ShikeComposerState)
 *
 * Global: window.ShikeComposerController
 */
(function(global){
  'use strict';

  /* ---------- Helpers ---------- */

  /** Safely call a function, returning undefined on error. */
  function safeCall(fn){
    if(typeof fn !== 'function') return undefined;
    var args = Array.prototype.slice.call(arguments, 1);
    try{ return fn.apply(global, args); }catch(e){ return undefined; }
  }

  /** Safely call an async function, returning {ok:false} on error. */
  async function safeCallAsync(fn){
    if(typeof fn !== 'function') return { ok: false, error: 'function_unavailable' };
    var args = Array.prototype.slice.call(arguments, 1);
    try{ return await fn.apply(global, args); }catch(e){ return { ok: false, error: e.message || String(e) }; }
  }

  /** Show a toast message if the global showToast is available. */
  function toast(msg, type){
    if(typeof global.showToast === 'function'){
      safeCall(global.showToast, msg, type);
    }
  }

  /* ---------- Category A: Create / modify record ---------- */
  /**
   * Calls the parser adapter (parseReminderText) to parse the input,
   * then saves the record via saveParsedRecord.
   */
  async function handleCreate(text, classification){
    var cleaned = (classification && classification.cleaned) || text;
    var sourceText = text;

    // --- Parse using parser adapter ---
    // ShikeSpriteCreateIntent.extract internally calls parseReminderText
    var parsed = null;

    if(global.ShikeSpriteCreateIntent && typeof global.ShikeSpriteCreateIntent.extract === 'function'){
      try{
        parsed = global.ShikeSpriteCreateIntent.extract(sourceText);
      }catch(e){ parsed = null; }
    }

    // Fall back to calling parseReminderText directly
    if(!parsed && typeof global.parseReminderText === 'function'){
      try{
        parsed = global.parseReminderText(cleaned);
      }catch(e){ parsed = null; }
    }

    // If parsing failed, create a minimal note record
    if(!parsed){
      parsed = {
        title: String(cleaned).trim().substring(0, 30),
        recordKind: 'note',
        dateKey: null,
        timeText: '',
        dateText: '',
        isAllDay: true,
        sourceText: sourceText
      };
    }

    // Ensure sourceText is set
    parsed.sourceText = sourceText;
    parsed.cleanedInput = cleaned;

    // --- Save the record ---
    if(typeof global.saveParsedRecord === 'function'){
      var saved = safeCall(global.saveParsedRecord, parsed, sourceText);
      if(saved){
        try{
          if(global.ShikeLocalFirst && typeof global.persistRecordsDurably !== 'function'){
            throw new Error('durable_persistence_unavailable');
          }
          if(typeof global.persistRecordsDurably === 'function'){
            await global.persistRecordsDurably();
          }
        }catch(error){
          if(Array.isArray(global.records)){
            var savedIndex = global.records.findIndex(function(record){ return record && record.id === saved.id; });
            if(savedIndex >= 0) global.records.splice(savedIndex, 1);
          }
          safeCall(global.saveRecords);
          return {
            ok: false,
            category: 'A',
            message: '记录没有安全保存，请稍后重试。',
            error: error && error.message || 'durable_persistence_failed'
          };
        }
        // Trigger UI re-render
        if(typeof global.renderCurrent === 'function'){
          safeCall(global.renderCurrent);
        }
        return {
          ok: true,
          category: 'A',
          message: '已帮你记住：' + (parsed.title || cleaned),
          record: saved
        };
      }
      return {
        ok: false,
        category: 'A',
        message: '记录保存失败，请稍后重试。'
      };
    }

    // Fall back to ShikeAgent.handle
    if(global.ShikeAgent && typeof global.ShikeAgent.handle === 'function'){
      var response = await safeCallAsync(global.ShikeAgent.handle, sourceText);
      if(response){
        return {
          ok: response.ok !== false,
          category: 'A',
          message: response.message || '记录已创建。',
          result: response
        };
      }
    }

    return {
      ok: false,
      category: 'A',
      message: '记录创建功能暂不可用。'
    };
  }

  /* ---------- Category B: Query local records ---------- */
  /**
   * Calls the search tool to find local records matching the query.
   */
  async function handleQueryLocal(text, classification){
    var route = (classification && classification.route) || {};
    var query = (route.args && (route.args.query || route.args.text)) || '';

    // If no specific query extracted, use the full text minus command words
    if(!query){
      query = String(text).replace(/^(查一下|搜索|找一下|帮我找|查一查|搜一下|找|看看今天|今日概览|今天有什么|今天怎么样|今天有啥|今天的事)/, '').trim() || text;
    }

    // Try ShikeAgent.handle for structured query (uses search_records or summarize_today tool)
    if(global.ShikeAgent && typeof global.ShikeAgent.handle === 'function'){
      var response = await safeCallAsync(global.ShikeAgent.handle, text);
      if(response && response.ok !== undefined){
        return {
          ok: response.ok !== false,
          category: 'B',
          message: response.message || '查询完成。',
          result: response
        };
      }
    }

    // Fall back to direct record search
    var records = Array.isArray(global.records) ? global.records : [];
    var q = String(query).toLowerCase();
    var matches = records.filter(function(r){
      return String(r.title || '').toLowerCase().indexOf(q) >= 0;
    });

    if(matches.length > 0){
      return {
        ok: true,
        category: 'B',
        message: '找到 ' + matches.length + ' 条记录',
        records: matches.map(function(r){
          return { id: r.id, title: r.title, dateKey: r.dateKey || '' };
        })
      };
    }

    return {
      ok: true,
      category: 'B',
      message: '没有找到匹配的记录。',
      records: []
    };
  }

  /* ---------- Category C: App action ---------- */
  /**
   * Calls the corresponding agent tool to execute the app operation.
   */
  async function handleAppAction(text, classification){
    if(global.ShikeAgent && typeof global.ShikeAgent.handle === 'function'){
      var response = await safeCallAsync(global.ShikeAgent.handle, text);
      if(response){
        return {
          ok: response.ok !== false,
          category: 'C',
          message: response.message || '操作已完成。',
          result: response
        };
      }
    }

    return {
      ok: false,
      category: 'C',
      message: '应用操作暂不可用。'
    };
  }

  /* ---------- Category D: Online Q&A ---------- */
  /**
   * Calls the retrieval engine to search public sources for an answer.
   */
  async function handleNetworkQA(text, classification){
    if(global.ShikeRetrievalEngine && typeof global.ShikeRetrievalEngine.search === 'function'){
      var options = { timeout: 7000 };
      if(classification && classification.classification){
        options.classification = classification.classification;
      }

      var response = await safeCallAsync(global.ShikeRetrievalEngine.search, text, options);
      if(response){
        return {
          ok: response.ok !== false,
          category: 'D',
          message: response.answer || response.message || '暂时没有找到足够可靠的公开资料。',
          result: response
        };
      }
    }

    return {
      ok: false,
      category: 'D',
      message: '联网问答功能暂不可用。'
    };
  }

  /* ---------- Category E: Normal conversation ---------- */
  /**
   * Returns a conversational reply based on simple pattern matching.
   */
  function handleChat(text, classification){
    var input = String(text || '').trim().toLowerCase();
    var message = '我在听，请继续说。';

    if(/你好|您好|hi|hello|hey/i.test(input)){
      message = '你好！有什么我可以帮你的吗？你可以试着写下需要记住的事情。';
    }else if(/谢谢|感谢/i.test(input)){
      message = '不客气，随时需要随时说。';
    }else if(/再见|拜拜/i.test(input)){
      message = '再见！有需要随时回来。';
    }else if(/晚安/i.test(input)){
      message = '晚安，好梦。';
    }else if(/早安|早上好/i.test(input)){
      message = '早上好，今天也要加油。';
    }else if(/下午好|晚上好/i.test(input)){
      message = '你好，有什么我可以帮你的吗？';
    }else if(/好的|知道了|明白了|懂了|ok/i.test(input)){
      message = '好的，还有什么需要我帮忙的吗？';
    }else if(/在吗|帮帮我/i.test(input)){
      message = '我在，有什么可以帮你的？';
    }else if(/哈哈|呵呵|嘿嘿/i.test(input)){
      message = '希望能帮到你，还有什么需要吗？';
    }else if(/是的|对的/i.test(input)){
      message = '好的，还有什么我可以做的吗？';
    }else if(/不是|没有/i.test(input)){
      message = '明白了，如果需要什么随时告诉我。';
    }

    return {
      ok: true,
      category: 'E',
      message: message
    };
  }

  /* ---------- Category F: Unrecognizable ---------- */
  /**
   * Returns a message indicating the input could not be understood.
   */
  function handleUnknown(text, classification){
    return {
      ok: false,
      category: 'F',
      message: '我还没理解这句话。你可以试试：\n'
        + '· "帮我记明天下午三点交作业"\n'
        + '· "今天有什么安排"\n'
        + '· "帮我找一下体检"\n'
        + '· 或者直接问一个问题'
    };
  }

  /* ---------- Main submit entry point ---------- */

  /**
   * Unified submission entry point.
   *
   * @param {string} text - raw user input
   * @returns {Promise<object>} result with { ok, category, message, ... }
   */
  async function submit(text){
    // --- Get state module ---
    var state = global.ShikeComposerState;
    if(!state){
      return { ok: false, message: 'Composer状态模块未加载。', code: 'state_unavailable' };
    }

    // --- Empty input check ---
    var trimmed = String(text || '').trim();
    if(!trimmed){
      return { ok: false, message: '请输入内容后再发送。', code: 'empty_input' };
    }

    // --- Length check ---
    if(trimmed.length > 500){
      return { ok: false, message: '内容过长，请缩短后再试。', code: 'input_too_long' };
    }

    // --- Debounce / duplicate submit check ---
    if(!state.canSubmit(trimmed)){
      return { ok: false, message: '正在处理中，请稍候。', code: 'processing' };
    }

    // --- Mark as submitting (sets processing state, starts debounce timer) ---
    state.markSubmitting(trimmed);

    // --- Clear draft (it is being submitted) ---
    state.clearDraft();

    // --- Classify ---
    var classifier = global.ShikeComposerClassifier;
    if(!classifier || typeof classifier.classify !== 'function'){
      state.setLastResult({ ok: false, message: '分类器未加载。' });
      return state.getLastResult();
    }

    var classification = classifier.classify(trimmed);
    var result;

    // --- Route to handler based on category ---
    try{
      switch(classification.category){
        case 'A':
          result = await handleCreate(trimmed, classification);
          break;
        case 'B':
          result = await handleQueryLocal(trimmed, classification);
          break;
        case 'C':
          result = await handleAppAction(trimmed, classification);
          break;
        case 'D':
          result = await handleNetworkQA(trimmed, classification);
          break;
        case 'E':
          result = handleChat(trimmed, classification);
          break;
        case 'F':
        default:
          result = handleUnknown(trimmed, classification);
          break;
      }
    }catch(e){
      result = {
        ok: false,
        message: '处理出错，请稍后重试。',
        error: e.message || String(e)
      };
    }

    // --- Ensure category is set ---
    if(!result.category){
      result.category = classification.category;
    }

    // --- Set last result (updates processing state to done/idle) ---
    state.setLastResult(result);

    // --- Toast for quick feedback ---
    if(result && result.message){
      toast(result.message, result.ok === false ? 'warn' : 'success');
    }

    return result;
  }

  /* ---------- Accessors ---------- */

  function getProcessingState(){
    var state = global.ShikeComposerState;
    return state ? state.getProcessingState() : 'idle';
  }

  function canSubmit(){
    var state = global.ShikeComposerState;
    return state ? state.canSubmit() : true;
  }

  /* ---------- Export ---------- */

  global.ShikeComposerController = Object.freeze({
    submit: submit,
    getProcessingState: getProcessingState,
    canSubmit: canSubmit,

    // Expose individual handlers for testing / external use
    handleCreate: handleCreate,
    handleQueryLocal: handleQueryLocal,
    handleAppAction: handleAppAction,
    handleNetworkQA: handleNetworkQA,
    handleChat: handleChat,
    handleUnknown: handleUnknown
  });

})(typeof window !== 'undefined' ? window : this);
