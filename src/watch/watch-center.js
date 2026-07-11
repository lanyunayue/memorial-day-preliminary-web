/* v1.5 Watch Center: real public APIs + direct-CORS RSS. No proxy, no fabricated feed. */
(function(global){
  var storage=global.ShikeWatchStorage;if(!storage)throw new Error('ShikeWatchStorage not loaded');
  var BUILTIN_SOURCES=[
    {id:'wikipedia',name:'中文维基百科',icon:'W',note:'百科条目与公开摘要'},
    {id:'wikidata',name:'Wikidata',icon:'D',note:'结构化实体资料'},
    {id:'github',name:'GitHub',icon:'G',note:'公共开源仓库'},
    {id:'stackexchange',name:'Stack Overflow',icon:'S',note:'公开技术问答'}
  ];
  var DEFAULT_TOPICS=['本地优先软件','渐进式 Web 应用'];
  var callbacks=[],refreshing=false,sourceStatus={},activeFilters={source:'all',keyword:'all',freshness:'all',read:'all'};
  function esc(value){return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function safeUrl(value,base){try{var parsed=new URL(value,base);return /^https?:$/.test(parsed.protocol)?parsed.href:'';}catch(error){return'';}}
  function hash(value){var h=2166136261,s=String(value);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);}
  function textFromHtml(value){if(global.ShikeResultNormalizer)return global.ShikeResultNormalizer.text(value,900);var div=document.createElement('div');div.innerHTML=String(value||'');return(div.textContent||'').replace(/\s+/g,' ').trim().slice(0,900);}
  function onRefresh(fn){if(typeof fn==='function')callbacks.push(fn);}
  function fire(){callbacks.slice().forEach(function(fn){try{fn();}catch(error){}});}
  function getWatchItems(){return storage.getWatchItems();}
  function getFeed(){var items=storage.getCachedFeed().items||[];return items.map(function(item){return Object.assign({},item,{read:storage.isRead(item.id)});}).sort(function(a,b){return Number(b.publishedAt||b.fetchedAt||0)-Number(a.publishedAt||a.fetchedAt||0);});}
  function getSources(){return BUILTIN_SOURCES.slice();}
  function getLastRefreshTime(){return storage.getLastRefresh()||0;}
  function getFreshnessLabel(timestamp){var time=Number(timestamp)||Date.parse(timestamp);if(!time)return'未知时间';var diff=Math.max(0,Date.now()-time),mins=Math.floor(diff/60000);if(mins<1)return'刚刚';if(mins<60)return mins+'分钟前';var hours=Math.floor(mins/60);if(hours<24)return hours+'小时前';var days=Math.floor(hours/24);return days<7?days+'天前':new Date(time).toLocaleDateString();}
  function formatTime(timestamp){var time=Number(timestamp)||Date.parse(timestamp);return time?new Date(time).toLocaleString([], {month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'时间未提供';}
  function addWatchKeyword(keyword){var result=storage.addWatchItem(keyword);fire();return result;}
  function removeWatchKeyword(id){var result=storage.removeWatchItem(id);fire();return result;}
  function markItemRead(id){storage.markAsRead(id);fire();}
  function markAllRead(){storage.markAllAsRead(getFeed().map(function(item){return item.id;}));fire();}
  function getUnreadCount(){return storage.getUnreadCount(getFeed().map(function(item){return item.id;}));}
  function validateFeedUrl(value){
    var url=safeUrl(String(value||'').trim());if(!url)throw new Error('请输入有效的 http 或 https 地址');var parsed=new URL(url);
    if(parsed.protocol!=='http:'&&parsed.protocol!=='https:')throw new Error('只支持 http 或 https RSS 地址');
    if(global.location&&global.location.protocol==='https:'&&parsed.protocol==='http:')throw new Error('HTTPS 页面不能直接加载 HTTP RSS，请使用 HTTPS 地址');
    return url;
  }
  function parseFeed(xml,feed){
    var doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.querySelector('parsererror'))throw new Error('RSS/Atom 格式无法解析');
    var entries=Array.prototype.slice.call(doc.querySelectorAll('item, entry')).slice(0,30),now=Date.now();
    return entries.map(function(entry){
      var title=(entry.querySelector('title')||{}).textContent||'未命名内容';var linkNode=entry.querySelector('link');var link=linkNode&&(linkNode.getAttribute('href')||linkNode.textContent)||'';link=safeUrl(link,feed.url);if(!link)return null;
      var summaryNode=entry.querySelector('description, summary, content');var dateNode=entry.querySelector('pubDate, published, updated');var published=Date.parse(dateNode&&dateNode.textContent||'')||now;
      return{id:'rss:'+hash(link),title:textFromHtml(title),url:link,summary:textFromHtml(summaryNode&&summaryNode.textContent||''),sourceId:feed.id,sourceName:feed.name,sourceType:'rss',publishedAt:published,fetchedAt:now,matchedKeywords:matchKeywords(title+' '+(summaryNode&&summaryNode.textContent||'')),isLive:true};
    }).filter(Boolean);
  }
  function matchKeywords(value){var lower=String(value||'').toLowerCase();return getWatchItems().filter(function(item){return lower.indexOf(String(item.keyword).toLowerCase())>=0;}).map(function(item){return item.keyword;});}
  async function withTimeout(run,ms){var controller=new AbortController(),timer=global.setTimeout(function(){controller.abort();},ms);try{return await run(controller.signal);}finally{global.clearTimeout(timer);}}
  async function fetchProvider(source,query){
    var provider=global.ShikeRetrievalProviders&&global.ShikeRetrievalProviders.list().find(function(item){return item.id===source.id;});if(!provider)throw new Error('来源模块未加载');
    var raw=await withTimeout(function(signal){return provider.search(query,{signal:signal,backoff:0});},6500),now=Date.now();
    return(raw||[]).map(function(item){var normalized=global.ShikeResultNormalizer.normalize(item,query);if(!normalized)return null;var published=Date.parse(normalized.publishedAt||'')||now;return{id:'watch:'+hash(normalized.url),title:normalized.title,url:normalized.url,summary:normalized.snippet,sourceId:source.id,sourceName:normalized.source,sourceType:normalized.sourceType,publishedAt:published,fetchedAt:now,matchedKeywords:matchKeywords(normalized.title+' '+normalized.snippet),isLive:true};}).filter(Boolean);
  }
  async function fetchRss(feed){
    return withTimeout(async function(signal){var response=await fetch(feed.url,{signal:signal,headers:{Accept:'application/rss+xml, application/atom+xml, application/xml, text/xml'}});if(!response.ok)throw new Error('HTTP '+response.status);return parseFeed(await response.text(),feed);},6500);
  }
  function dedupe(items){var seen={};return items.filter(function(item){var key=item.url.replace(/[#?].*$/,'');if(seen[key])return false;seen[key]=true;return true;});}
  async function refresh(options){
    options=options||{};if(refreshing)return getFeed();refreshing=true;sourceStatus={};renderWatchPage();
    var enabled=storage.getEnabledSources(),topics=getWatchItems().map(function(item){return item.keyword;});if(!topics.length)topics=DEFAULT_TOPICS.slice();topics=topics.slice(0,4);
    var jobs=[];
    BUILTIN_SOURCES.filter(function(source){return enabled.indexOf(source.id)>=0;}).forEach(function(source){
      var query=topics[0]||DEFAULT_TOPICS[0];if(source.id==='github')query=topics.join(' ')+' in:name,description';if(source.id==='stackexchange'&&!/(代码|编程|开发|JavaScript|Python|CSS|HTML|API)/i.test(topics.join(' ')))return;
      jobs.push(fetchProvider(source,query).then(function(items){sourceStatus[source.id]={ok:true,count:items.length};return items;}).catch(function(error){sourceStatus[source.id]={ok:false,error:error.name==='AbortError'?'请求超时':String(error.message||error)};return[];}));
    });
    storage.getFeeds().forEach(function(feed){jobs.push(fetchRss(feed).then(function(items){sourceStatus[feed.id]={ok:true,count:items.length};return items;}).catch(function(error){var reason=error.name==='TypeError'?'浏览器因 CORS 或网络策略阻止了直接访问':(error.name==='AbortError'?'请求超时':String(error.message||error));sourceStatus[feed.id]={ok:false,error:reason};return[];}));});
    var groups=await Promise.all(jobs),items=dedupe([].concat.apply([],groups)).slice(0,120),errors=Object.keys(sourceStatus).filter(function(id){return!sourceStatus[id].ok;}).map(function(id){return id+': '+sourceStatus[id].error;});
    storage.setCachedFeed(items,errors);storage.setLastRefresh(Date.now());refreshing=false;fire();renderWatchPage();return getFeed();
  }
  function filteredItems(){var now=Date.now();return getFeed().filter(function(item){if(activeFilters.source!=='all'&&item.sourceId!==activeFilters.source)return false;if(activeFilters.keyword!=='all'&&(item.matchedKeywords||[]).indexOf(activeFilters.keyword)<0)return false;if(activeFilters.read==='unread'&&item.read)return false;if(activeFilters.read==='read'&&!item.read)return false;if(activeFilters.freshness==='day'&&now-Number(item.publishedAt)>86400000)return false;if(activeFilters.freshness==='week'&&now-Number(item.publishedAt)>604800000)return false;return true;});}
  function renderSource(source,enabled){var status=sourceStatus[source.id];return'<label class="watch-source-card"><input type="checkbox" data-watch-source="'+esc(source.id)+'" '+(enabled?'checked':'')+'><span class="watch-source-icon">'+esc(source.icon)+'</span><span><strong>'+esc(source.name)+'</strong><small>'+esc(status?(status.ok?'已获取 '+status.count+' 条':'不可用：'+status.error):source.note)+'</small></span></label>';}
  function renderItem(item){return'<article class="watch-feed-item '+(item.read?'':'unread')+'" data-feed-id="'+esc(item.id)+'" data-source="'+esc(item.sourceId)+'"><span class="watch-item-dot"></span><div class="watch-item-body"><a class="watch-item-title" href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">'+esc(item.title)+'</a><p class="watch-item-summary">'+esc(item.summary||'原来源未提供摘要。')+'</p><div class="watch-item-keywords">'+(item.matchedKeywords||[]).map(function(keyword){return'<span>'+esc(keyword)+'</span>';}).join('')+'</div><div class="watch-item-meta"><span class="watch-item-source">'+esc(item.sourceName)+'</span><span class="watch-item-time">'+esc(formatTime(item.publishedAt))+' · '+esc(getFreshnessLabel(item.publishedAt))+'</span></div></div></article>';}
  function renderWatchPage(){
    var container=document.getElementById('watchContent');if(!container)return;var enabled=storage.getEnabledSources(),watchItems=getWatchItems(),feeds=storage.getFeeds(),cache=storage.getCachedFeed(),items=filteredItems(),unread=getUnreadCount();
    var html='<div class="watch-header"><div><div class="watch-header-title">关注中心</div><div class="watch-freshness"><span class="freshness-dot '+(unread?'has-unread':'')+'"></span>'+(refreshing?'正在更新公开来源':(getLastRefreshTime()?'上次刷新：'+getFreshnessLabel(getLastRefreshTime())+' · '+unread+' 条未读':'尚未获取公开内容'))+'</div></div><div class="watch-header-actions"><button class="watch-refresh-btn" id="watchRefreshBtn" '+(refreshing?'disabled':'')+'>刷新</button><button class="watch-mark-read-btn" id="watchMarkAllBtn">全部已读</button></div></div>';
    html+='<section class="watch-panel"><div class="watch-section-title">推荐来源</div><div class="watch-source-directory">'+BUILTIN_SOURCES.map(function(source){return renderSource(source,enabled.indexOf(source.id)>=0);}).join('')+'</div><p class="watch-terms-note">公开接口可能受配额、CORS 和服务可用性影响；失败时不会生成虚假内容。</p></section>';
    html+='<section class="watch-panel"><div class="watch-section-title">关注关键词</div><div class="watch-add-row"><input class="watch-add-input" id="watchAddInput" maxlength="30" placeholder="如：PWA、本地优先、JavaScript"><button class="watch-add-btn" id="watchAddBtn">添加</button></div><div class="watch-keywords-list">'+(watchItems.length?watchItems.map(function(item){return'<span class="watch-keyword-chip">'+esc(item.keyword)+'<button class="watch-keyword-remove" data-watch-remove="'+esc(item.id)+'" aria-label="移除 '+esc(item.keyword)+'">×</button></span>';}).join(''):'<span class="watch-empty-hint">未添加时显示真实的推荐主题资料。</span>')+'</div></section>';
    html+='<section class="watch-panel"><div class="watch-section-title">自定义 RSS / Atom</div><div class="watch-add-row"><input class="watch-add-input" id="watchFeedInput" inputmode="url" placeholder="https://example.com/feed.xml"><button class="watch-add-btn" id="watchFeedAddBtn">添加</button></div><div class="watch-feed-directory">'+(feeds.length?feeds.map(function(feed){var status=sourceStatus[feed.id];return'<div><a href="'+esc(feed.url)+'" target="_blank" rel="noopener noreferrer">'+esc(feed.name)+'</a><small>'+(status?(status.ok?'已获取 '+status.count+' 条':'失败：'+esc(status.error)):'等待刷新')+'</small><button data-feed-remove="'+esc(feed.id)+'" aria-label="移除 RSS">×</button></div>';}).join(''):'<span class="watch-empty-hint">仅直接访问允许 CORS 的订阅源，不使用代理绕过限制。</span>')+'</div></section>';
    html+='<div class="watch-filter-row"><select id="watchSourceFilter" aria-label="来源筛选"><option value="all">全部来源</option>'+BUILTIN_SOURCES.concat(feeds.map(function(feed){return{id:feed.id,name:feed.name};})).map(function(source){return'<option value="'+esc(source.id)+'" '+(activeFilters.source===source.id?'selected':'')+'>'+esc(source.name)+'</option>';}).join('')+'</select><select id="watchKeywordFilter" aria-label="关键词筛选"><option value="all">全部关键词</option>'+watchItems.map(function(item){return'<option value="'+esc(item.keyword)+'" '+(activeFilters.keyword===item.keyword?'selected':'')+'>'+esc(item.keyword)+'</option>';}).join('')+'</select><select id="watchFreshnessFilter" aria-label="新鲜度筛选"><option value="all">全部时间</option><option value="day" '+(activeFilters.freshness==='day'?'selected':'')+'>24 小时</option><option value="week" '+(activeFilters.freshness==='week'?'selected':'')+'>7 天</option></select><select id="watchReadFilter" aria-label="已读筛选"><option value="all">全部状态</option><option value="unread" '+(activeFilters.read==='unread'?'selected':'')+'>未读</option><option value="read" '+(activeFilters.read==='read'?'selected':'')+'>已读</option></select></div>';
    if(cache.errors&&cache.errors.length)html+='<div class="watch-error-summary">部分来源未更新：'+esc(cache.errors.join('；'))+'</div>';
    html+='<div class="watch-feed-list" id="watchFeedList">'+(items.length?items.map(renderItem).join(''):'<div class="watch-feed-empty">没有符合当前筛选的可靠公开内容。请刷新、修改关键词或打开原网站搜索。</div>')+'</div><div class="watch-disclaimer">内容来自标明的公开来源，时间以来源提供为准；不构成医疗、法律、财务或投资建议。关键词、RSS 地址和已读状态仅保存在本地。</div>';
    container.innerHTML=html;bindEvents();if(!refreshing&&Date.now()-getLastRefreshTime()>15*60*1000)refresh({reason:'page-open'});
  }
  function bindEvents(){
    var button=document.getElementById('watchRefreshBtn');if(button)button.onclick=function(){refresh({reason:'manual'});};button=document.getElementById('watchMarkAllBtn');if(button)button.onclick=function(){markAllRead();renderWatchPage();};
    var input=document.getElementById('watchAddInput'),add=document.getElementById('watchAddBtn');function addKeyword(){var value=input&&input.value.trim();if(!value)return showToast('请输入关注关键词','error');var result=addWatchKeyword(value);showToast(result.duplicate?'已关注此关键词':'已添加关注：'+value,result.duplicate?'info':'success');renderWatchPage();}if(add)add.onclick=addKeyword;if(input)input.onkeydown=function(event){if(event.key==='Enter')addKeyword();};
    document.querySelectorAll('[data-watch-remove]').forEach(function(item){item.onclick=function(){removeWatchKeyword(item.getAttribute('data-watch-remove'));renderWatchPage();};});
    document.querySelectorAll('[data-watch-source]').forEach(function(item){item.onchange=function(){var sources=storage.getEnabledSources(),id=item.getAttribute('data-watch-source');sources=item.checked?sources.concat(id):sources.filter(function(value){return value!==id;});storage.setEnabledSources(sources);refresh({reason:'source-change'});};});
    var feedInput=document.getElementById('watchFeedInput'),feedAdd=document.getElementById('watchFeedAddBtn');if(feedAdd)feedAdd.onclick=function(){try{var url=validateFeedUrl(feedInput.value),host=new URL(url).hostname,result=storage.addFeed(url,host);showToast(result.duplicate?'此 RSS 已存在':'已添加 RSS，正在尝试获取',result.duplicate?'info':'success');refresh({reason:'rss-add'});}catch(error){showToast(error.message,'error');}};
    document.querySelectorAll('[data-feed-remove]').forEach(function(item){item.onclick=function(){storage.removeFeed(item.getAttribute('data-feed-remove'));renderWatchPage();};});
    document.querySelectorAll('.watch-feed-item').forEach(function(item){item.onclick=function(){markItemRead(item.getAttribute('data-feed-id'));item.classList.remove('unread');};});
    [['watchSourceFilter','source'],['watchKeywordFilter','keyword'],['watchFreshnessFilter','freshness'],['watchReadFilter','read']].forEach(function(pair){var select=document.getElementById(pair[0]);if(select)select.onchange=function(){activeFilters[pair[1]]=select.value;renderWatchPage();};});
  }
  function showToast(message,type){if(typeof global.showToast==='function')global.showToast(message,type||'info');}
  function init(){if(!storage.getCachedFeed().items.length)sourceStatus={};}
  global.ShikeWatchCenter=Object.freeze({init:init,render:renderWatchPage,refresh:refresh,getFeed:getFeed,getSources:getSources,getWatchItems:getWatchItems,addWatchKeyword:addWatchKeyword,removeWatchKeyword:removeWatchKeyword,markItemRead:markItemRead,markAllRead:markAllRead,getUnreadCount:getUnreadCount,getLastRefreshTime:getLastRefreshTime,getFreshnessLabel:getFreshnessLabel,formatTime:formatTime,onRefresh:onRefresh,validateFeedUrl:validateFeedUrl,isRefreshing:function(){return refreshing;},_internal:{getStorage:function(){return storage;},parseFeed:parseFeed,getSourceStatus:function(){return Object.assign({},sourceStatus);}}});
})(window);
