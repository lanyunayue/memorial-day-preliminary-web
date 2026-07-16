(function(global){
  var KEY='shike_retrieval_cache_v1',TTL=15*60*1000,MAX=20;
  function read(){try{var value=JSON.parse(global.localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[];}catch(error){return[];}}
  function write(items){try{global.localStorage.setItem(KEY,JSON.stringify(items.slice(0,MAX)));return true;}catch(error){return false;}}
  function key(query,domain){return String(domain||'general')+'|'+String(query||'').trim().toLowerCase();}
  function get(query,domain){var target=key(query,domain),now=Date.now(),items=read().filter(function(item){return now-item.savedAt<TTL;});write(items);var hit=items.find(function(item){return item.key===target;});return hit?hit.value:null;}
  function set(query,domain,value){var target=key(query,domain),items=read().filter(function(item){return item.key!==target;});items.unshift({key:target,savedAt:Date.now(),value:value});return write(items);}
  function clear(){try{global.localStorage.removeItem(KEY);}catch(error){}}
  global.ShikeRetrievalCache=Object.freeze({get:get,set:set,clear:clear,ttl:TTL});
})(window);
