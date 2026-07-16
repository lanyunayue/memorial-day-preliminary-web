/**
 * Composer Classifier - Input classification for the Composer
 *
 * Classifies user input into one of six categories:
 *   A. 创建/修改记录   (Create / modify record)
 *   B. 查询本地记录     (Query local records)
 *   C. 应用操作         (Apply app operation)
 *   D. 联网问答         (Online Q&A)
 *   E. 普通对话         (Normal conversation)
 *   F. 无法识别         (Unrecognizable)
 *
 * Integration points:
 *   - ShikeSpriteCreateIntent.normalize()  → detect create intent (A)
 *   - ShikeAgentModules.intentRouter.route() → detect query (B) or app action (C)
 *   - ShikeQueryClassifier.classify()        → detect network Q&A (D)
 *   - Chat pattern matching                  → normal conversation (E)
 *   - Fallback                               → unrecognizable (F)
 *
 * Global: window.ShikeComposerClassifier
 */
(function(global){
  'use strict';

  /* ---------- Category constants ---------- */

  var CATEGORY = Object.freeze({
    CREATE:      'A',  // 创建/修改记录
    QUERY_LOCAL: 'B',  // 查询本地记录
    APP_ACTION:  'C',  // 应用操作
    NETWORK_QA:  'D',   // 联网问答
    CHAT:        'E',   // 普通对话
    UNKNOWN:     'F'    // 无法识别
  });

  var CATEGORY_LABELS = Object.freeze({
    A: '创建/修改记录',
    B: '查询本地记录',
    C: '应用操作',
    D: '联网问答',
    E: '普通对话',
    F: '无法识别'
  });

  /* ---------- Intent classification tables ---------- */

  // Intents that query local records (read-only)
  var QUERY_INTENTS = ['search_records', 'summarize_today'];

  // Intents that perform app operations (mutate state or navigate)
  var ACTION_INTENTS = [
    'pin_record', 'delete_record', 'open_page',
    'export_calendar', 'export_backup', 'change_theme',
    'show_release_notes'
  ];

  /* ---------- Pattern matching ---------- */

  // Chat / conversational patterns (greetings, acknowledgments, etc.)
  var CHAT_PATTERNS = /你好|您好|hi|hello|hey|谢谢|感谢|再见|拜拜|辛苦了|晚安|早安|早上好|下午好|晚上好|哈哈|呵呵|嘿嘿|嗯嗯|好的|OK|ok|知道了|明白了|懂了|是的|对的|不是|没有|在吗|帮帮我/i;

  // Question indicator patterns
  var QUESTION_PATTERNS = /[?？]|什么|怎么|为什么|如何|谁|哪|多少|几|是不是|对不对|有没有|何时|哪里|哪个/i;

  /* ---------- Classification logic ---------- */

  /**
   * Classify user input into one of the six categories.
   *
   * @param {string} text - raw user input
   * @returns {object} classification result:
   *   {
   *     category: string,     // A-F
   *     label: string,        // human-readable label
   *     reason: string,       // why this category was chosen
   *     text: string,         // trimmed input
   *     cleaned?: string,     // cleaned text (for create)
   *     hasTime?: boolean,    // has time info (for create)
   *     route?: object,       // intent-router result (for B/C)
   *     classification?: object // query-classifier result (for D)
   *   }
   */
  function classify(text){
    // --- Empty input ---
    if(!text || !String(text).trim()){
      return {
        category: CATEGORY.UNKNOWN,
        reason: 'empty',
        label: CATEGORY_LABELS[CATEGORY.UNKNOWN],
        text: String(text || '')
      };
    }

    var input = String(text).trim();

    // --- Step 1: Check for create/modify intent via ShikeSpriteCreateIntent.normalize() ---
    if(global.ShikeSpriteCreateIntent && typeof global.ShikeSpriteCreateIntent.normalize === 'function'){
      try{
        var norm = global.ShikeSpriteCreateIntent.normalize(input);
        if(norm && norm.isCreate && norm.cleaned){
          return {
            category: CATEGORY.CREATE,
            reason: 'sprite-create-intent',
            label: CATEGORY_LABELS[CATEGORY.CREATE],
            text: input,
            cleaned: norm.cleaned,
            hasTime: norm.hasTime,
            verbFound: norm.verbFound
          };
        }
      }catch(e){ /* continue to next check */ }
    }

    // --- Step 2: Check intent-router for app operations or queries ---
    var router = global.ShikeAgentModules && global.ShikeAgentModules.intentRouter;
    if(router && typeof router.route === 'function'){
      try{
        var route = router.route(input);

        // Create record (explicit create from router)
        if(route.intent === 'create_record'){
          return {
            category: CATEGORY.CREATE,
            reason: 'intent-router-create',
            label: CATEGORY_LABELS[CATEGORY.CREATE],
            text: input,
            route: route
          };
        }

        // Query local records
        if(QUERY_INTENTS.indexOf(route.intent) >= 0){
          return {
            category: CATEGORY.QUERY_LOCAL,
            reason: 'intent-router-query',
            label: CATEGORY_LABELS[CATEGORY.QUERY_LOCAL],
            text: input,
            route: route
          };
        }

        // App actions
        if(ACTION_INTENTS.indexOf(route.intent) >= 0){
          return {
            category: CATEGORY.APP_ACTION,
            reason: 'intent-router-action',
            label: CATEGORY_LABELS[CATEGORY.APP_ACTION],
            text: input,
            route: route
          };
        }
      }catch(e){ /* continue to next check */ }
    }

    // --- Step 3: Check query classifier for network questions ---
    if(global.ShikeQueryClassifier && typeof global.ShikeQueryClassifier.classify === 'function'){
      try{
        var qc = global.ShikeQueryClassifier.classify(input);

        // Network question → D (online Q&A)
        if(qc.kind === 'network'){
          return {
            category: CATEGORY.NETWORK_QA,
            reason: 'query-classifier-network',
            label: CATEGORY_LABELS[CATEGORY.NETWORK_QA],
            text: input,
            classification: qc
          };
        }

        // Local command → C (app action)
        if(qc.kind === 'local'){
          return {
            category: CATEGORY.APP_ACTION,
            reason: 'query-classifier-local',
            label: CATEGORY_LABELS[CATEGORY.APP_ACTION],
            text: input,
            classification: qc
          };
        }
      }catch(e){ /* continue to next check */ }
    }

    // --- Step 4: Normal question → D (online Q&A) ---
    // "普通问题判定为联网问答"
    if(QUESTION_PATTERNS.test(input)){
      return {
        category: CATEGORY.NETWORK_QA,
        reason: 'question-pattern',
        label: CATEGORY_LABELS[CATEGORY.NETWORK_QA],
        text: input
      };
    }

    // --- Step 5: Chat / conversational → E (normal conversation) ---
    if(CHAT_PATTERNS.test(input)){
      return {
        category: CATEGORY.CHAT,
        reason: 'chat-pattern',
        label: CATEGORY_LABELS[CATEGORY.CHAT],
        text: input
      };
    }

    // --- Step 6: Cannot determine → F (unrecognizable) ---
    // "无法判定时为F"
    return {
      category: CATEGORY.UNKNOWN,
      reason: 'no-match',
      label: CATEGORY_LABELS[CATEGORY.UNKNOWN],
      text: input
    };
  }

  /* ---------- Export ---------- */

  global.ShikeComposerClassifier = Object.freeze({
    classify: classify,
    CATEGORY: CATEGORY,
    CATEGORY_LABELS: CATEGORY_LABELS
  });

})(typeof window !== 'undefined' ? window : this);
