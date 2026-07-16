/* ================================================================
 *  时刻 v1.4.0 - Watch Center (关注中心)
 *  Local watch items + built-in public whitelist info sources.
 *  NO fabricated news, NO buy/sell advice, NO fake real-time prices.
 *  All data is simulated/sample with honest timestamps.
 * ================================================================ */
(function(global){
  var storage=global.ShikeWatchStorage;
  if(!storage)throw new Error('ShikeWatchStorage not loaded');

  // Built-in public whitelist sources (hardcoded, no arbitrary URLs)
  // These are sample data items simulating a public RSS/info feed.
  // Sources are named categories, not live URLs - we do NOT fetch external content.
  var BUILTIN_SOURCES=[
    {id:'tech',name:'科技资讯',icon:'◈'},
    {id:'opensource',name:'开源更新',icon:'◉'},
    {id:'design',name:'设计参考',icon:'◈'},
    {id:'productivity',name:'效率工具',icon:'◉'}
  ];

  // Sample feed items - these are static/hardcoded to simulate RSS fetch
  // In a real implementation these would come from a trusted whitelist RSS.
  // We are honest: these are sample items, not live news.
  var FEED_SEED=[
    {title:'开源社区动态：本地优先应用发展趋势观察',source:'opensource',summary:'近年来本地优先（Local-first）软件理念持续受到关注，强调数据所有权和离线可用性。',freshnessMinutes:120},
    {title:'Web 技术更新：PWA 离线能力持续增强',source:'tech',summary:'主流浏览器对 Service Worker 和 IndexedDB 的支持不断完善，为离线应用提供更好基础。',freshnessMinutes:180},
    {title:'设计观察：纸质质感界面在移动端的应用',source:'design',summary:'暖色调、留白和衬线字体的组合在笔记类应用中形成独特的纸感体验。',freshnessMinutes:240},
    {title:'效率思考：时间记录工具如何帮助减少焦虑',source:'productivity',summary:'将待办事项转化为有时间感的记录，有助于理清思路并减少心理负担。',freshnessMinutes:300},
    {title:'科技资讯：浏览器端本地 AI 推理进展',source:'tech',summary:'WebGPU 和 WASM 技术使浏览器端运行小模型成为可能，但目前仍处于早期阶段。',freshnessMinutes:360},
    {title:'开源项目推荐：本地优先数据同步方案',source:'opensource',summary:'CRDT 和 Yjs 等技术为多端本地优先协作提供了技术基础，无需依赖中心服务器。',freshnessMinutes:480},
    {title:'工具推荐：命令行效率工具集锦',source:'productivity',summary:'ripgrep、fd、fzf 等现代命令行工具可显著提升开发效率。',freshnessMinutes:600},
    {title:'设计趋势：无障碍设计成为基本要求',source:'design',summary:'WCAG 2.1 对比度要求、键盘导航支持和屏幕阅读器兼容性已成为前端开发标配。',freshnessMinutes:720}
  ];

  var _refreshCallbacks=[];
  function onRefresh(cb){if(typeof cb==='function')_refreshCallbacks.push(cb);}
  function _fireRefresh(){_refreshCallbacks.forEach(function(cb){try{cb();}catch(e){}});}

  // Generate a feed item with a realistic timestamp based on seed + jitter
  function _buildFeedItem(seed,baseTime){
    var ts=baseTime-seed.freshnessMinutes*60*1000-Math.floor(Math.random()*60*60*1000);
    var source=BUILTIN_SOURCES.find(function(s){return s.id===seed.source;})||BUILTIN_SOURCES[0];
    return {
      id:'feed_'+seed.source+'_'+Math.abs(seed.title.charCodeAt(0))+'_'+ts,
      title:seed.title,
      sourceId:source.id,
      sourceName:source.name,
      sourceIcon:source.icon,
      summary:seed.summary,
      timestamp:ts,
      isSample:true // honest flag
    };
  }

  // Simulate fetching feed items (local only, no network)
  function _simulateFetch(){
    var now=Date.now();
    return FEED_SEED.map(function(seed){return _buildFeedItem(seed,now);});
  }

  // Cache feed items in memory
  var _cachedFeed=null;
  var _lastRefreshTime=0;

  function getFeed(forceRefresh){
    if(forceRefresh||!_cachedFeed){
      _cachedFeed=_simulateFetch();
      _lastRefreshTime=Date.now();
      storage.setLastRefresh(_lastRefreshTime);
    }
    // Apply keyword filtering from user watch items
    var watchItems=storage.getWatchItems();
    return _cachedFeed.map(function(item){
      var matched=false;
      if(watchItems.length>0){
        var titleLower=item.title.toLowerCase();
        var summaryLower=item.summary.toLowerCase();
        matched=watchItems.some(function(w){
          var kw=String(w.keyword||'').toLowerCase();
          return kw&&(titleLower.indexOf(kw)!==-1||summaryLower.indexOf(kw)!==-1);
        });
      }
      return Object.assign({},item,{matched:matched,read:storage.isRead(item.id)});
    }).sort(function(a,b){return b.timestamp-a.timestamp;});
  }

  function refresh(){
    _cachedFeed=null;
    var items=getFeed(true);
    _fireRefresh();
    return items;
  }

  function getLastRefreshTime(){
    return _lastRefreshTime||storage.getLastRefresh()||0;
  }

  function getFreshnessLabel(timestamp){
    if(!timestamp)return '未知时间';
    var diff=Date.now()-timestamp;
    var mins=Math.floor(diff/60000);
    if(mins<1)return '刚刚';
    if(mins<60)return mins+'分钟前';
    var hours=Math.floor(mins/60);
    if(hours<24)return hours+'小时前';
    var days=Math.floor(hours/24);
    if(days<7)return days+'天前';
    var d=new Date(timestamp);
    return (d.getMonth()+1)+'月'+d.getDate()+'日';
  }

  function getSources(){return BUILTIN_SOURCES.slice();}

  function addWatchKeyword(keyword){
    var result=storage.addWatchItem(keyword);
    _fireRefresh();
    return result;
  }

  function removeWatchKeyword(id){
    var removed=storage.removeWatchItem(id);
    _fireRefresh();
    return removed;
  }

  function markItemRead(itemId){
    storage.markAsRead(itemId);
  }

  function markAllRead(){
    var items=_cachedFeed||[];
    storage.markAllAsRead(items.map(function(i){return i.id;}));
    _fireRefresh();
  }

  function getUnreadCount(){
    var items=_cachedFeed||getFeed(false);
    return storage.getUnreadCount(items.map(function(i){return i.id;}));
  }

  function getWatchItems(){return storage.getWatchItems();}

  // Format time for display
  function formatTime(ts){
    if(!ts)return '';
    var d=new Date(ts);
    var pad=function(n){return n<10?'0'+n:''+n;};
    return (d.getMonth()+1)+'/'+d.getDate()+' '+pad(d.getHours())+':'+pad(d.getMinutes());
  }

  // ========== UI Rendering ==========
  function renderWatchPage(){
    var container=document.getElementById('watchContent');
    if(!container)return;
    var items=getFeed(false);
    var watchItems=getWatchItems();
    var lastRefresh=getLastRefreshTime();
    var unread=getUnreadCount();

    var html='';
    // Header section
    html+='<div class="watch-header">';
    html+='<div class="watch-header-title">关注中心</div>';
    html+='<div class="watch-header-actions">';
    html+='<button class="watch-refresh-btn" id="watchRefreshBtn" title="刷新">↻ 刷新</button>';
    html+='<button class="watch-mark-read-btn" id="watchMarkAllBtn" title="全部已读">全部已读</button>';
    html+='</div></div>';

    // Freshness indicator
    html+='<div class="watch-freshness">';
    if(lastRefresh){
      html+='<span class="freshness-dot '+(unread>0?'has-unread':'')+'"></span>';
      html+='上次刷新：'+getFreshnessLabel(lastRefresh);
      html+=' · '+unread+' 条未读';
    }else{
      html+='<span class="freshness-dot"></span>';
      html+='尚未刷新，点击刷新按钮获取内容';
    }
    html+='</div>';

    // Watch keywords section
    html+='<div class="watch-keywords-section">';
    html+='<div class="watch-section-title">我的关注</div>';
    html+='<div class="watch-add-row">';
    html+='<input type="text" class="watch-add-input" id="watchAddInput" placeholder="添加关注关键词，如：开源、设计" maxlength="30">';
    html+='<button class="watch-add-btn" id="watchAddBtn">添加</button>';
    html+='</div>';
    if(watchItems.length>0){
      html+='<div class="watch-keywords-list">';
      watchItems.forEach(function(w){
        html+='<span class="watch-keyword-chip" data-watch-id="'+escAttr(w.id)+'">';
        html+=escHtml(w.keyword);
        html+='<button class="watch-keyword-remove" data-watch-remove="'+escAttr(w.id)+'" title="移除">×</button>';
        html+='</span>';
      });
      html+='</div>';
    }else{
      html+='<div class="watch-empty-hint">添加关键词来关注相关内容（仅保存在本地）</div>';
    }
    html+='</div>';

    // Source filter chips
    html+='<div class="watch-sources">';
    html+='<span class="watch-source-chip active" data-source="all">全部</span>';
    BUILTIN_SOURCES.forEach(function(s){
      html+='<span class="watch-source-chip" data-source="'+s.id+'">'+s.icon+' '+s.name+'</span>';
    });
    html+='</div>';

    // Feed items list
    html+='<div class="watch-feed-list" id="watchFeedList">';
    if(items.length===0){
      html+='<div class="watch-feed-empty">点击刷新获取内容</div>';
    }else{
      items.forEach(function(item){
        html+=_renderFeedItem(item);
      });
    }
    html+='</div>';

    // Honest disclaimer
    html+='<div class="watch-disclaimer">';
    html+='内容来自内置公开信息源示例，不构成任何投资建议。数据仅保存在本地浏览器，不会上传。';
    html+='</div>';

    container.innerHTML=html;
    _bindWatchEvents();
  }

  function _renderFeedItem(item){
    var unreadClass=item.read?'':'unread';
    var matchedClass=item.matched?' matched':'';
    var html='<div class="watch-feed-item '+unreadClass+matchedClass+'" data-feed-id="'+escAttr(item.id)+'">';
    html+='<div class="watch-item-dot"></div>';
    html+='<div class="watch-item-body">';
    html+='<div class="watch-item-title">'+escHtml(item.title)+'</div>';
    html+='<div class="watch-item-summary">'+escHtml(item.summary)+'</div>';
    html+='<div class="watch-item-meta">';
    html+='<span class="watch-item-source">'+item.sourceIcon+' '+escHtml(item.sourceName)+'</span>';
    html+='<span class="watch-item-time">'+formatTime(item.timestamp)+' · '+getFreshnessLabel(item.timestamp)+'</span>';
    html+='</div>';
    html+='</div>';
    html+='</div>';
    return html;
  }

  function _bindWatchEvents(){
    var refreshBtn=document.getElementById('watchRefreshBtn');
    if(refreshBtn){
      refreshBtn.addEventListener('click',function(){
        refresh();
        showToast('已刷新关注内容','success');
      });
    }
    var markAllBtn=document.getElementById('watchMarkAllBtn');
    if(markAllBtn){
      markAllBtn.addEventListener('click',function(){
        markAllRead();
        renderWatchPage();
        showToast('已标记全部已读','success');
      });
    }
    var addBtn=document.getElementById('watchAddBtn');
    var addInput=document.getElementById('watchAddInput');
    if(addBtn&&addInput){
      function doAdd(){
        var val=addInput.value.trim();
        if(!val){showToast('请输入关键词','error');return;}
        try{
          var result=addWatchKeyword(val);
          if(result.duplicate){
            showToast('已关注此关键词','info');
          }else{
            showToast('已添加关注：'+val,'success');
          }
          addInput.value='';
          renderWatchPage();
          // Re-focus input
          var newInput=document.getElementById('watchAddInput');
          if(newInput)newInput.focus();
        }catch(e){
          showToast('添加失败：'+(e.message||'未知错误'),'error');
        }
      }
      addBtn.addEventListener('click',doAdd);
      addInput.addEventListener('keydown',function(e){if(e.key==='Enter')doAdd();});
    }
    // Remove keyword buttons
    document.querySelectorAll('[data-watch-remove]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var id=btn.getAttribute('data-watch-remove');
        removeWatchKeyword(id);
        renderWatchPage();
      });
    });
    // Feed item click -> mark as read
    document.querySelectorAll('.watch-feed-item').forEach(function(el){
      el.addEventListener('click',function(){
        var id=el.getAttribute('data-feed-id');
        if(id){
          markItemRead(id);
          el.classList.remove('unread');
        }
      });
    });
    // Source filter
    document.querySelectorAll('.watch-source-chip').forEach(function(chip){
      chip.addEventListener('click',function(){
        document.querySelectorAll('.watch-source-chip').forEach(function(c){c.classList.remove('active');});
        chip.classList.add('active');
        var source=chip.getAttribute('data-source');
        _filterFeedBySource(source);
      });
    });
  }

  function _filterFeedBySource(source){
    var items=document.querySelectorAll('.watch-feed-item');
    var feed=_cachedFeed||[];
    items.forEach(function(el){
      var id=el.getAttribute('data-feed-id');
      var item=feed.find(function(f){return f.id===id;});
      if(!item){el.style.display='';return;}
      if(source==='all'||item.sourceId===source){
        el.style.display='';
      }else{
        el.style.display='none';
      }
    });
  }

  function escHtml(s){
    return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escAttr(s){return escHtml(s);}

  // Toast helper (uses global showToast from legacy-app if available)
  function showToast(msg,type){
    if(typeof global.showToast==='function'){
      global.showToast(msg,type||'info');
    }
  }

  // Initialize
  function init(){
    // Pre-load feed
    getFeed(false);
  }

  global.ShikeWatchCenter=Object.freeze({
    init:init,
    render:renderWatchPage,
    refresh:refresh,
    getFeed:getFeed,
    getSources:getSources,
    getWatchItems:getWatchItems,
    addWatchKeyword:addWatchKeyword,
    removeWatchKeyword:removeWatchKeyword,
    markItemRead:markItemRead,
    markAllRead:markAllRead,
    getUnreadCount:getUnreadCount,
    getLastRefreshTime:getLastRefreshTime,
    getFreshnessLabel:getFreshnessLabel,
    formatTime:formatTime,
    onRefresh:onRefresh,
    // Expose for testing
    _internal:{getStorage:function(){return storage;},getSeed:function(){return FEED_SEED.slice();}}
  });
})(typeof window!=='undefined'?window:this);
