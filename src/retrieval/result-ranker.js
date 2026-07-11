(function(global){
  var TRUST={wikipedia:1,wikidata:.95,stackoverflow:.86,github:.82,'open-meteo':.94,rss:.68};
  function terms(query){return String(query||'').toLowerCase().replace(/[是什么为什么怎么如何请帮我查一下了解介绍资料？?，,。.!！]/g,' ').split(/\s+/).filter(function(term){return term.length>1;}).slice(0,12);}
  function score(item,query){var hay=((item.title||'')+' '+(item.snippet||'')).toLowerCase(),tokens=terms(query),match=0;tokens.forEach(function(term){if((item.title||'').toLowerCase().indexOf(term)>=0)match+=2;if(hay.indexOf(term)>=0)match+=1;});var relevance=tokens.length?Math.min(1,match/(tokens.length*2.4)):.35;var trust=TRUST[item.sourceType]||.62;return Math.min(1,.58*relevance+.42*trust);}
  function rank(items,query){return(items||[]).map(function(item){return Object.assign({},item,{confidence:score(item,query)});}).sort(function(a,b){return b.confidence-a.confidence;});}
  global.ShikeResultRanker=Object.freeze({rank:rank,score:score});
})(window);
