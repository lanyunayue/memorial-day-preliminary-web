(function(global){
  global.ShikeRetrievalProviders.register({
    id:'stackexchange',name:'Stack Overflow',supports:function(c){return c.kind==='network'&&c.domain==='technical';},
    search:async function(query,context){
      var endpoint='https://api.stackexchange.com/2.3/search/advanced?site=stackoverflow&order=desc&sort=relevance&pagesize=5&filter=withbody&q='+encodeURIComponent(query);
      var response=await fetch(endpoint,{signal:context.signal,headers:{Accept:'application/json'}});if(!response.ok)throw new Error('stackexchange_http_'+response.status);var data=await response.json();if(data.backoff)context.backoff=data.backoff;
      return(data.items||[]).map(function(item){return{id:'stackoverflow:'+item.question_id,title:item.title,url:item.link,snippet:item.body||'',source:'Stack Overflow',sourceType:'stackoverflow',publishedAt:item.last_activity_date?new Date(item.last_activity_date*1000).toISOString():null};});
    }
  });
})(window);
