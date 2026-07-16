(function(global){
  function searchQuery(value){
    var query=String(value||'').replace(/github/ig,' ').replace(/(上有|有哪些|有什么|哪些|请|帮我|查找|搜索|推荐|介绍|开源项目|项目|仓库|代码库|[？?！!。])/g,' ').replace(/\s+/g,' ').trim();
    if(!query)query='PWA';
    if(!/\bin:/i.test(query))query+=' in:name,description';
    return query.slice(0,240);
  }
  global.ShikeRetrievalProviders.register({
    id:'github',name:'GitHub',supports:function(c){return c.kind==='network'&&(c.domain==='github'||c.domain==='technical');},
    search:async function(query,context){
      var endpoint='https://api.github.com/search/repositories?q='+encodeURIComponent(searchQuery(query))+'&sort=stars&order=desc&per_page=5';
      var response=await fetch(endpoint,{signal:context.signal,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}});if(!response.ok){var error=new Error('github_http_'+response.status);error.rateLimit=response.headers.get('x-ratelimit-remaining');throw error;}var data=await response.json();
      return(data.items||[]).map(function(item){return{id:'github:'+item.id,title:item.full_name,url:item.html_url,snippet:(item.description||'')+'。主要语言：'+(item.language||'未标注')+'；Stars：'+item.stargazers_count,source:'GitHub',sourceType:'github',publishedAt:item.updated_at};});
    }
  });
})(window);
