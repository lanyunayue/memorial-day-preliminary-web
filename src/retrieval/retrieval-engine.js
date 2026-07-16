(function(global){
  function emit(stage,detail){try{global.dispatchEvent(new CustomEvent('shike:retrieval-progress',{detail:Object.assign({stage:stage},detail||{})}));}catch(error){}}
  function dedupe(items){var urls={},titles={};return items.filter(function(item){var u=item.url.replace(/[#?].*$/,''),t=item.title.toLowerCase();if(urls[u]||titles[t])return false;urls[u]=true;titles[t]=true;return true;});}
  async function runProvider(provider,query,timeout){
    var controller=new AbortController(),timer=global.setTimeout(function(){controller.abort();},timeout),context={signal:controller.signal,backoff:0};
    try{emit('provider-start',{provider:provider.name});var items=await provider.search(query,context);emit('provider-done',{provider:provider.name,count:(items||[]).length});return{provider:provider.name,items:items||[],backoff:context.backoff};}
    catch(error){emit('provider-failed',{provider:provider.name,reason:error.name==='AbortError'?'timeout':String(error.message||error)});return{provider:provider.name,items:[],error:error.name==='AbortError'?'timeout':String(error.message||error)};}
    finally{global.clearTimeout(timer);}
  }
  async function search(input,options){
    options=options||{};var classification=options.classification||global.ShikeQueryClassifier.classify(input),query=classification.query;
    if(classification.kind!=='network')return{ok:false,retrieval:true,query:query,answer:'这个问题目前无法可靠地通过公开资料回答。',sources:[],attempted:[],failures:['query_not_network'],fallbackLinks:global.ShikeSearchFallback.links(query),fetchedAt:new Date().toISOString()};
    var cached=global.ShikeRetrievalCache.get(query,classification.domain);if(cached){cached.cached=true;emit('complete',{cached:true,count:cached.sources.length});return cached;}
    var providers=global.ShikeRetrievalProviders.select(classification);emit('start',{query:query,providers:providers.map(function(p){return p.name;})});
    var settled=await Promise.all(providers.map(function(provider){return runProvider(provider,query,options.timeout||7000);}));var normalized=[];
    settled.forEach(function(group){group.items.forEach(function(item){var value=global.ShikeResultNormalizer.normalize(item,query);if(value)normalized.push(value);});});
    var ranked=global.ShikeResultRanker.rank(dedupe(normalized),query).slice(0,12);var answer=global.ShikeExtractiveSummarizer.summarize(ranked,query,{sensitive:classification.sensitive});
    var enhancement=global.ShikeBrowserAI?await global.ShikeBrowserAI.enhance({query:query,answer:answer,sources:ranked}):{enhanced:false,text:answer,reason:'not-loaded'};answer=enhancement.text;
    var result={ok:ranked.length>0,retrieval:true,query:query,answer:answer,message:answer,sources:ranked,fetchedAt:new Date().toISOString(),attempted:settled.map(function(item){return item.provider;}),failures:settled.filter(function(item){return item.error;}).map(function(item){return item.provider+': '+item.error;}),fallbackLinks:global.ShikeSearchFallback.links(query),classification:classification,enhanced:enhancement.enhanced,enhancementReason:enhancement.reason};
    if(ranked.length)global.ShikeRetrievalCache.set(query,classification.domain,result);emit('complete',{cached:false,count:ranked.length});return result;
  }
  global.ShikeRetrievalEngine=Object.freeze({search:search,classify:function(input){return global.ShikeQueryClassifier.classify(input);},providers:function(){return global.ShikeRetrievalProviders.list().map(function(item){return item.id;});}});
})(window);
