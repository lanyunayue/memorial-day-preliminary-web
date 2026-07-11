(function(global){
  global.ShikeRetrievalProviders.register({
    id:'wikidata',name:'Wikidata',supports:function(c){return c.kind==='network'&&(c.domain==='entity'||c.domain==='general');},
    search:async function(query,context){
      var endpoint='https://www.wikidata.org/w/api.php?action=wbsearchentities&search='+encodeURIComponent(query)+'&language=zh&uselang=zh&limit=6&format=json&origin=*';
      var response=await fetch(endpoint,{signal:context.signal,headers:{Accept:'application/json'}});if(!response.ok)throw new Error('wikidata_http_'+response.status);var data=await response.json();
      return(data.search||[]).map(function(item){return{id:'wikidata:'+item.id,title:item.label||item.id,url:item.concepturi||('https://www.wikidata.org/wiki/'+item.id),snippet:[item.description,item.match&&item.match.text].filter(Boolean).join('。'),source:'Wikidata',sourceType:'wikidata'};});
    }
  });
})(window);
