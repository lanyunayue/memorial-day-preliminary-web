/* ================================================================
 *  时刻 v1.4.0 - Watch Center Storage
 *  Local-first persistence for watch items and read status.
 *  All data stays in localStorage, NEVER uploaded.
 * ================================================================ */
(function(global){
  var WATCH_ITEMS_KEY='shike_watch_items_v1';
  var WATCH_READ_KEY='shike_watch_read_v1';
  var WATCH_LAST_REFRESH_KEY='shike_watch_last_refresh_v1';

  function safeGet(key){
    try{
      var raw=global.localStorage?global.localStorage.getItem(key):null;
      if(!raw)return null;
      return JSON.parse(raw);
    }catch(e){return null;}
  }
  function safeSet(key,value){
    try{
      if(global.localStorage)global.localStorage.setItem(key,JSON.stringify(value));
      return true;
    }catch(e){return false;}
  }

  // Watch items: array of {id, keyword, createdAt}
  function getWatchItems(){
    var items=safeGet(WATCH_ITEMS_KEY);
    if(!Array.isArray(items))return [];
    return items.filter(function(it){return it&&it.keyword;});
  }
  function addWatchItem(keyword){
    var kw=String(keyword||'').trim();
    if(!kw)throw new Error('empty_keyword');
    if(kw.length>50)throw new Error('keyword_too_long');
    var items=getWatchItems();
    // Check for duplicates (case-insensitive)
    var lower=kw.toLowerCase();
    var exists=items.some(function(it){return String(it.keyword||'').toLowerCase()===lower;});
    if(exists)return {duplicate:true,item:items.find(function(it){return String(it.keyword||'').toLowerCase()===lower;})};
    var item={id:'w_'+Date.now()+'_'+Math.random().toString(36).substr(2,6),keyword:kw,createdAt:Date.now()};
    items.push(item);
    safeSet(WATCH_ITEMS_KEY,items);
    return {duplicate:false,item:item};
  }
  function removeWatchItem(id){
    var items=getWatchItems();
    var filtered=items.filter(function(it){return it.id!==id;});
    safeSet(WATCH_ITEMS_KEY,filtered);
    return filtered.length!==items.length;
  }
  function clearWatchItems(){
    safeSet(WATCH_ITEMS_KEY,[]);
    return true;
  }

  // Read status: Set of item IDs that have been read
  function getReadIds(){
    var ids=safeGet(WATCH_READ_KEY);
    if(!Array.isArray(ids))return {};
    var map={};
    ids.forEach(function(id){if(id)map[id]=true;});
    return map;
  }
  function markAsRead(itemId){
    if(!itemId)return false;
    var ids=safeGet(WATCH_READ_KEY);
    if(!Array.isArray(ids))ids=[];
    if(ids.indexOf(itemId)===-1){ids.push(itemId);safeSet(WATCH_READ_KEY,ids);}
    return true;
  }
  function markAllAsRead(itemIds){
    var ids=safeGet(WATCH_READ_KEY);
    if(!Array.isArray(ids))ids=[];
    (itemIds||[]).forEach(function(id){
      if(id&&ids.indexOf(id)===-1)ids.push(id);
    });
    safeSet(WATCH_READ_KEY,ids);
    return true;
  }
  function isRead(itemId){
    var map=getReadIds();
    return !!map[itemId];
  }
  function getUnreadCount(itemIds){
    var map=getReadIds();
    return (itemIds||[]).filter(function(id){return id&&!map[id];}).length;
  }

  // Last refresh timestamp
  function getLastRefresh(){
    var v=safeGet(WATCH_LAST_REFRESH_KEY);
    return typeof v==='number'?v:0;
  }
  function setLastRefresh(ts){
    safeSet(WATCH_LAST_REFRESH_KEY,ts||Date.now());
  }

  global.ShikeWatchStorage=Object.freeze({
    getWatchItems:getWatchItems,
    addWatchItem:addWatchItem,
    removeWatchItem:removeWatchItem,
    clearWatchItems:clearWatchItems,
    getReadIds:getReadIds,
    markAsRead:markAsRead,
    markAllAsRead:markAllAsRead,
    isRead:isRead,
    getUnreadCount:getUnreadCount,
    getLastRefresh:getLastRefresh,
    setLastRefresh:setLastRefresh
  });
})(typeof window!=='undefined'?window:this);
