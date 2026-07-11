(function(global){
  global.ShikeRetrievalProviders.register({
    id:'wikipedia',name:'Wikipedia',supports:function(c){return c.kind==='network'&&c.domain!=='weather';},
    search:async function(query,context){
      var endpoint='https://zh.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(query)+'&gsrlimit=6&prop=extracts%7Cinfo&exintro=1&explaintext=1&exsentences=4&inprop=url&format=json&formatversion=2&origin=*';
      var response=await fetch(endpoint,{signal:context.signal,headers:{Accept:'application/json'}});if(!response.ok)throw new Error('wikipedia_http_'+response.status);var data=await response.json();
      return((data.query&&data.query.pages)||[]).map(function(page){return{id:'wikipedia:'+page.pageid,title:page.title,url:page.fullurl||('https://zh.wikipedia.org/?curid='+page.pageid),snippet:page.extract||'',source:'中文维基百科',sourceType:'wikipedia'};});
    }
  });
})(window);
