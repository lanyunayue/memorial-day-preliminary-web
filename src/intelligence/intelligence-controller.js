(function(global,factory){
  var dependencies={
    domain:global.ShikeTemporalDomain,validator:global.ShikeTemporalValidator,normalizer:global.ShikeTemporalNormalizer,
    segmenter:global.ShikeMultiIntentSegmenter,negation:global.ShikeNegationDetector,condition:global.ShikeConditionDetector,
    commitment:global.ShikeCommitmentDetector,waiting:global.ShikeWaitingForDetector,goal:global.ShikeGoalDetector,
    anniversary:global.ShikeAnniversaryDetector,habit:global.ShikeHabitDetector,confidence:global.ShikeConfidenceModel,
    explanation:global.ShikeExplanationBuilder
  };
  if(typeof module!=='undefined'&&module.exports){
    dependencies={
      domain:require('./temporal-domain.js'),
      validator:require('./temporal-validator.js'),
      normalizer:require('./temporal-normalizer.js'),
      segmenter:require('./multi-intent-segmenter.js'),
      negation:require('./negation-detector.js'),
      condition:require('./condition-detector.js'),
      commitment:require('./commitment-detector.js'),
      waiting:require('./waiting-for-detector.js'),
      goal:require('./goal-detector.js'),
      anniversary:require('./anniversary-detector.js'),
      habit:require('./habit-detector.js'),
      confidence:require('./confidence-model.js'),
      explanation:require('./explanation-builder.js')
    };
  }
  var api=factory(dependencies);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.ShikeTemporalIntelligence=api;
})(typeof window!=='undefined'?window:globalThis,function(modules){
  'use strict';

  var INJECTION=/(?:忽略|无视).{0,12}(?:规则|指令|限制)|(?:删除|导出|上传).{0,8}(?:所有|全部).{0,8}(?:记录|数据)|system\s*prompt|developer\s*message/i;
  var CHITCHAT=/^(?:你好|您好|谢谢|在吗|早上好|晚上好)[！!。.？?]*$/;
  var UNCERTAIN=/(?:可能|也许|看情况|再决定|要不要|不确定)/;
  function timeExpression(text){return (String(text).match(/(?:今天|明天|后天|下个月|毕业后|未来|以后|本周|这周|下周|周[一二三四五六日天](?:前|之前)?|星期[一二三四五六日天]|上午|下午|晚上|今晚|\d{1,2}[:：]\d{2}|[一二两三四五六七八九十\d]+点(?:半)?)/g)||[]).join(' ');}
  function fallback(text){
    if(UNCERTAIN.test(text))return {type:'thought',action:text,subject:'我',object:text,personRefs:[],signal:'uncertain_thought'};
    if(timeExpression(text))return {type:'task',action:text,subject:'我',object:text,personRefs:[],signal:'timed_action'};
    return {type:'note',action:text,subject:'我',object:text,personRefs:[],signal:'plain_note'};
  }
  function detect(text){return modules.waiting.detect(text)||modules.commitment.detect(text)||modules.anniversary.detect(text)||modules.goal.detect(text)||modules.habit.detect(text)||fallback(text);}
  function analyze(source,options){
    source=String(source||'').trim();
    var result={sourceText:source,drafts:[],rejected:[]};
    if(!source)return result;
    if(INJECTION.test(source)){result.rejected.push({sourceText:source,reason:'prompt_injection'});return result;}
    if(CHITCHAT.test(source)){result.rejected.push({sourceText:source,reason:'chitchat'});return result;}
    var seen=new Set();
    modules.segmenter.segment(source).forEach(function(segment){
      var safety=modules.negation.detect(segment.text);
      if(safety.blocked){result.rejected.push({sourceText:segment.text,sourceSpan:segment.sourceSpan,reason:safety.completedFact?'completed_fact':'negated'});return;}
      var condition=modules.condition.detect(segment.text);
      var detected=detect(segment.text);
      var normalized=modules.normalizer.normalizeTime(segment.text,options);
      var missing=[];
      if(detected.type==='anniversary'&&normalized.precision!=='day')missing.push('具体日期');
      if(detected.type==='waiting_for'&&!detected.personRefs.length)missing.push('等待对象');
      if(condition.conditional&&!normalized.dateKey)missing.push('跟进时间');
      var uncertain=UNCERTAIN.test(segment.text);
      if(uncertain&&detected.type!=='goal')detected.type='thought';
      var signature=detected.type+'|'+detected.action+'|'+normalized.dateKey;
      if(seen.has(signature)){result.rejected.push({sourceText:segment.text,sourceSpan:segment.sourceSpan,reason:'duplicate'});return;}
      seen.add(signature);
      var draft=modules.domain.createDraft({
        type:detected.type,sourceText:source,sourceSpan:segment.sourceSpan,action:detected.action,
        subject:detected.subject,object:detected.object,personRefs:detected.personRefs,timeExpression:timeExpression(segment.text),
        normalizedTime:normalized,recurrence:detected.recurrence||null,
        confidenceBand:modules.confidence.band({type:detected.type,signal:detected.signal,action:detected.action,missingFields:missing,uncertain:uncertain}),
        explanation:modules.explanation.build(detected.type,{conditional:condition.conditional,missingFields:missing}),
        missingFields:missing,condition:condition.condition,status:'draft'
      });
      modules.validator.requireValidDraft(draft);
      result.drafts.push(draft);
    });
    return result;
  }
  function updateDraft(draft,changes){
    var next=modules.domain.createDraft(Object.assign({},draft,changes,{id:draft.id,sourceText:draft.sourceText,sourceSpan:draft.sourceSpan,createdAt:draft.createdAt}));
    modules.validator.requireValidDraft(next);return next;
  }
  function toRecord(draft,idFactory){
    modules.validator.requireValidDraft(draft);
    var kind={anniversary:'anniversary',habit:'habit',goal:'note',thought:'note',note:'note'}[draft.type]||'reminder';
    var now=Date.now();
    return {
      id:typeof idFactory==='function'?idFactory():modules.domain.makeId('record',now),
      title:draft.action||draft.object||draft.sourceText.slice(draft.sourceSpan.start,draft.sourceSpan.end),
      dateText:draft.timeExpression||'',dateKey:draft.normalizedTime&&draft.normalizedTime.dateKey||'',
      timeText:draft.normalizedTime&&draft.normalizedTime.timeText||'',locationText:'',note:'',
      repeat:draft.recurrence&&draft.recurrence.frequency||'none',repeatText:'',rawText:draft.sourceText,
      archived:false,createdAt:now,updatedAt:now,ts:now,recordKind:kind,recordState:'active',
      notifyMode:'none',notifiedAt:null,coverImage:null,coverPreset:0,subtitle:'',pinned:false,
      cardStyle:kind==='anniversary'?'large':'normal',accentColor:'',displayMode:'auto'
    };
  }

  return Object.freeze({analyze:analyze,updateDraft:updateDraft,toRecord:toRecord});
});
