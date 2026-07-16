(function(global){
  function cleanSentence(value){return String(value||'').replace(/\s+/g,' ').trim();}
  function terms(query){var chars=String(query||'').replace(/[\s，。！？?！：:、的了是在和与及请帮我查一下什么为什么怎么如何]/g,'');var out=[];for(var i=0;i<chars.length-1&&out.length<16;i++){var term=chars.slice(i,i+2);if(out.indexOf(term)<0)out.push(term);}return out;}
  function summarize(results,query,options){
    options=options||{};var tokens=terms(query),sentences=[];
    (results||[]).slice(0,8).forEach(function(result,resultIndex){String(result.snippet||'').split(/(?<=[。！？.!?])\s*/).forEach(function(value,index){var sentence=cleanSentence(value);if(sentence.length<12||sentence.length>240)return;var score=(result.confidence||0)*3+(index===0?1:0)+(resultIndex===0?.6:0);tokens.forEach(function(term){if(sentence.indexOf(term)>=0)score+=.45;});sentences.push({text:sentence,score:score});});});
    var selected=[];sentences.sort(function(a,b){return b.score-a.score;}).forEach(function(item){if(selected.length>=3)return;if(!selected.some(function(value){return value.indexOf(item.text.slice(0,18))>=0||item.text.indexOf(value.slice(0,18))>=0;}))selected.push(item.text);});
    if(!selected.length)return'暂时没有找到足够可靠的公开资料。';
    var answer=selected.join('\n');
    if(options.sensitive)answer+='\n\n以上仅为公开资料摘录，不能替代专业医疗、法律或财务意见。';
    if(results[0]&&results[0].confidence<.45)answer+='\n\n当前资料与问题的匹配度有限，建议打开原文核对。';
    return answer;
  }
  global.ShikeExtractiveSummarizer=Object.freeze({summarize:summarize});
})(window);
