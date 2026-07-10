(function(global){
  // Sprite create intent normalization layer
  // Identifies creation requests, strips command shells, preserves date/time info

  var CREATE_VERBS = [
    '帮我记一下', '帮我登记一下', '帮我记录一下', '帮我添加一下',
    '帮我添加一个', '帮我加一个', '帮我加一条', '帮我记一个',
    '帮我记住', '帮我记着', '帮我记得', '帮我记', '帮我登记', '帮我记录', '帮我加', '帮我添加',
    '帮我写上', '帮我建', '帮我创建', '帮我存', '帮我保存',
    '记一下', '登记一下', '记录一下', '添加一下', '加一下',
    '添加一个', '加一个', '加一条', '记一笔', '记一条',
    '新建', '创建', '记住', '记着', '记得', '提醒我', '安排一下',
    '加到时刻', '存一下', '保存一下',
    '写上', '写一下', '加个', '记个'
  ];

  var FILLERS = [
    '请', '麻烦', '可以', '能不能', '可不可以',
    '帮忙', '让你', '一件事', '一个事', '这个事', '这个事情', '这件事',
    '还有', '要做', '需要做', '得做', '还没做', '要交', '要还',
    '我想', '我要', '我还有', '一下', '要记得',
    '我', '要', '去', '把', '给', '为', '帮'
  ];

  var TIME_KEYWORDS = [
    '今天', '明天', '后天', '大后天',
    '周一', '周二', '周三', '周四', '周五', '周六', '周日',
    '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日', '星期天',
    '本周', '这周', '下周', '下下周', '上周',
    '上午', '下午', '晚上', '中午', '早上', '凌晨', '今晚', '明晚', '今早',
    '每天', '每周', '每月', '每年', '每星期', '每天早上', '每天晚上',
    '月底', '月初', '周末',
    '下周一', '下周二', '下周三', '下周四', '下周五', '下周六', '下周日',
    '点半', '点钟'
  ];

  var SORTED_VERBS = CREATE_VERBS.slice().sort(function(a,b){return b.length-a.length;});

  function containsAny(str, arr){
    for(var i=0;i<arr.length;i++){if(str.indexOf(arr[i])!==-1)return true;}
    return false;
  }

  function hasDatePattern(str){
    // Check for numeric date patterns: X月X日, X号, X月X号
    return /\d{1,2}月\d{1,2}[日号]/.test(str) || /\d{1,2}[日号]/.test(str);
  }

  function stripFillers(str){
    var s = str;
    for(var i=0;i<FILLERS.length;i++){
      s = s.split(FILLERS[i]).join('');
    }
    return s;
  }

  function normalizeSpriteCreateRequest(text){
    if(!text)return {isCreate:false,cleaned:'',hasTime:false};
    var s = String(text).trim();

    var verbFound = null;
    var verbIndex = -1;
    for(var i=0;i<SORTED_VERBS.length;i++){
      var v = SORTED_VERBS[i];
      var idx = s.indexOf(v);
      if(idx !== -1){verbFound = v; verbIndex = idx; break;}
    }

    var hasTimeKeyword = containsAny(s, TIME_KEYWORDS) || hasDatePattern(s);
    var isCreate = !!verbFound;
    var cleaned = s;
    var sourceText = s;

    if(verbFound){
      var afterVerb = s.substring(verbIndex + verbFound.length);
      afterVerb = afterVerb.replace(/^[，,。.；;:：!！?？\s]+/, '');
      var beforeVerb = s.substring(0, verbIndex);
      beforeVerb = stripFillers(beforeVerb);
      beforeVerb = beforeVerb.replace(/^[，,。.；;:：\s]+|[，,。.；;:：\s]+$/g,'').trim();
      var beforeHasTime = containsAny(beforeVerb, TIME_KEYWORDS) || hasDatePattern(beforeVerb);

      // Determine how to combine before/after content:
      // - If verb is at end (afterVerb empty), keep beforeVerb (it has the content)
      // - If verb is at start (beforeVerb empty), keep afterVerb
      // - If verb is in middle, combine both
      // - If beforeVerb exists and has time or is substantial content, include it
      if(beforeVerb && afterVerb){
        // Verb in middle: combine both
        cleaned = beforeVerb + ' ' + afterVerb;
      }else if(beforeVerb && !afterVerb){
        // Verb at end: content is before the verb
        cleaned = beforeVerb;
      }else if(!beforeVerb && afterVerb){
        // Verb at start: content is after the verb
        cleaned = afterVerb;
      }else{
        // Both empty (just a verb with no content)
        cleaned = '';
      }
    } else if(hasTimeKeyword){
      // Time keyword fallback: only treat as create if remaining content (after stripping time) is substantial
      var timeStripped = s;
      for(var ti=0;ti<TIME_KEYWORDS.length;ti++){timeStripped=timeStripped.split(TIME_KEYWORDS[ti]).join('');}
      timeStripped = stripFillers(timeStripped);
      timeStripped = timeStripped.replace(/[，,。.；;:：!！?？\s]+/g,'').trim();
      // Must have at least 1 meaningful non-question character left
      var isQuestion = /[?？呢吗呀吧嘛]/.test(s) || /(什么|怎么|为什么|如何|哪|谁|多少|几|是不是|对不对|有没有)/.test(s);
      if(timeStripped.length >= 1 && !isQuestion){
        cleaned = s;
        isCreate = true;
      }
    } else {
      // No-date memo fallback: VERY conservative, only accept clear item-like inputs
      // Must have explicit action/noun that looks like something to remember
      if(s.length > 0 && s.length <= 15){
        var isQuestion2 = /[?？呢吗呀吧嘛哦啊嗯]/.test(s) || /(什么|怎么|为什么|如何|哪|谁|多少|几|是不是|对不对|有没有|随便|说说|讲|聊|说点|说个)/.test(s);
        var isCommand = /^(打开|查看|看|切换|导出|备份|搜索|找|删除|置顶|关注|帮我找|查一下|你|我|他|她|它|您|请问|帮你)/.test(s);
        var isChat = /(你|我|他|她|它|您|你们|我们|他们|她们|它们|认识|知道|明白|懂|了解|以为|觉得|感觉|认为|是不是|能不能|可不可以|可以吗|在吗|你好|您好|谢谢|再见|拜拜|哈哈|呵呵|嘿嘿|命令|试试|测试|test|hello|hi|hey)/i.test(s);
        // Must be short, look like an action/task/item, not a sentence or chat
        // Action verbs at start are good indicators: 买 写 做 交 带 取 还 去 来 给 送 买 吃 喝 拿 放 记 涂 刷 洗 整理 打扫 完成 复习 预习 准备
        var startsWithAction = /^(买|写|做|交|带|取|还|去|来|给|送|吃|喝|拿|放|记|涂|刷|洗|整理|打扫|完成|复习|预习|准备|买|拿|带|取|寄|修|换|买|卖|打印|复印|充电|带|穿|戴)/.test(s);
        var isSimpleNoun = /^[一-龥]{2,8}$/.test(s) && !isChat;
        var looksLikeItem = !isQuestion2 && !isCommand && !isChat && (startsWithAction || isSimpleNoun);
        if(looksLikeItem){isCreate = true; cleaned = s;}
      }
    }

    cleaned = stripFillers(cleaned);
    cleaned = cleaned.replace(/\s+/g,' ').trim();
    cleaned = cleaned.replace(/^[，,。.；;:：!！?？\s]+|[，,。.；;:：!！?？\s]+$/g,'');
    hasTimeKeyword = containsAny(cleaned, TIME_KEYWORDS) || hasDatePattern(cleaned);

    return {
      isCreate: isCreate && cleaned.length > 0,
      cleaned: cleaned,
      sourceText: sourceText,
      hasTime: hasTimeKeyword,
      verbFound: verbFound
    };
  }

  function extractSpriteCreateIntent(text){
    var norm = normalizeSpriteCreateRequest(text);
    if(!norm.isCreate || !norm.cleaned)return null;
    var parsed = null;
    try{
      if(typeof global.parseReminderText === 'function'){
        parsed = global.parseReminderText(norm.cleaned);
      }
    }catch(e){parsed=null;}

    if(!parsed && norm.cleaned.length > 0){
      parsed = {
        title: cleanSpriteCreateTitle(norm.cleaned),
        recordKind: 'note',
        dateKey: null,
        timeText: '',
        dateText: '',
        isAllDay: true,
        sourceText: norm.sourceText
      };
    }
    if(parsed){
      if(!norm.hasTime){
        parsed.dateKey = null;
        parsed.dateText = '';
        parsed.timeText = '';
        parsed.repeat = 'none';
        parsed.repeatText = '';
        parsed.recordKind = 'note';
        parsed.isAllDay = true;
      }
      parsed.sourceText = norm.sourceText;
      parsed.cleanedInput = norm.cleaned;
    }
    return parsed;
  }

  function cleanSpriteCreateTitle(text){
    if(!text)return '';
    var t = String(text).trim();
    t = t.replace(/(今天|明天|后天|大后天)/g,'');
    t = t.replace(/(周[一二三四五六日天]|星期[一二三四五六日天])/g,'');
    t = t.replace(/(下下周|下周|本周|这周|上周)[一二三四五六日天]?/g,'');
    t = t.replace(/(每天|每周|每月|每年|每星期)/g,'');
    t = t.replace(/(上午|下午|晚上|中午|早上|凌晨|今晚|明晚|今早)/g,'');
    t = t.replace(/(月底|月初|周末)/g,'');
    t = t.replace(/\d{1,2}月\d{1,2}[日号]/g,'');
    t = t.replace(/\d{1,2}[日号]/g,'');
    t = t.replace(/[零〇一二两三四五六七八九十\d]{1,3}\s*[点时]\s*(钟|半|一刻|三刻|(?:[零〇一二两三四五六七八九十\d]{1,3})\s*分?)?/g,'');
    t = stripFillers(t);
    t = t.replace(/[，,。.；;:：!！?？\s]+/g,' ').trim();
    t = t.replace(/^(要|去|把|给|为|帮|写|做|完成|去做)/g,'').trim();
    return t || String(text).trim().substring(0,20);
  }

  global.ShikeSpriteCreateIntent = Object.freeze({
    normalize: normalizeSpriteCreateRequest,
    extract: extractSpriteCreateIntent,
    cleanTitle: cleanSpriteCreateTitle
  });
})(window);
