/* 权限中心主模块：统一管理所有权限状态，提供检查与渲染能力。挂载为 window.ShikePermissionCenter */
(function(global){
  'use strict';

  /* 权限状态枚举 */
  var STATE={
    NOT_REQUESTED:'not-requested',   /* 未申请 */
    REQUESTING:'requesting',          /* 申请中 */
    GRANTED:'granted',                /* 已允许 */
    DENIED:'denied',                  /* 已拒绝 */
    UNSUPPORTED:'unsupported',        /* 浏览器不支持 */
    SYSTEM_BLOCKED:'system-blocked',  /* 系统设置阻止 */
    NEEDS_GESTURE:'needs-gesture'     /* 需要用户手势 */
  };

  var STATE_LABELS={};
  STATE_LABELS[STATE.NOT_REQUESTED]='未申请';
  STATE_LABELS[STATE.REQUESTING]='申请中';
  STATE_LABELS[STATE.GRANTED]='已允许';
  STATE_LABELS[STATE.DENIED]='已拒绝';
  STATE_LABELS[STATE.UNSUPPORTED]='浏览器不支持';
  STATE_LABELS[STATE.SYSTEM_BLOCKED]='系统设置阻止';
  STATE_LABELS[STATE.NEEDS_GESTURE]='需要用户手势';

  /* 注册表：每个权限项的描述信息 */
  var registry=[];
  /* 缓存的最新状态 */
  var statusCache={};
  /* 渲染状态 */
  var lastContainer=null;

  function now(){return Date.now();}

  function esc(value){
    return String(value==null?'':value)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  /* 注册一个权限模块描述符 */
  function register(descriptor){
    if(!descriptor||!descriptor.key)throw new Error('permission_descriptor_missing_key');
    /* 去重：相同 key 覆盖 */
    for(var i=0;i<registry.length;i++){
      if(registry[i].key===descriptor.key){registry[i]=descriptor;return;}
    }
    registry.push(descriptor);
  }

  /* 获取注册表 */
  function getRegistry(){return registry.slice();}

  /* 根据 key 获取描述符 */
  function findDescriptor(key){
    for(var i=0;i<registry.length;i++){
      if(registry[i].key===key)return registry[i];
    }
    return null;
  }

  /* 查找全局挂载的实际权限模块对象 */
  function resolveModule(descriptor){
    if(!descriptor)return null;
    if(descriptor.module)return descriptor.module;
    if(descriptor.globalName&&global[descriptor.globalName])return global[descriptor.globalName];
    return null;
  }

  /* 单个权限的检查：调用模块的 check（异步）或 getStatus（同步） */
  function checkOne(descriptor){
    var mod=resolveModule(descriptor);
    if(!mod){
      statusCache[descriptor.key]={state:STATE.UNSUPPORTED,detail:'权限模块未加载',lastCheckTime:now()};
      return Promise.resolve(statusCache[descriptor.key]);
    }
    if(typeof mod.isSupported==='function'&&!mod.isSupported()){
      statusCache[descriptor.key]={state:STATE.UNSUPPORTED,detail:'当前浏览器不支持此权限',lastCheckTime:now()};
      return Promise.resolve(statusCache[descriptor.key]);
    }
    if(typeof mod.check==='function'){
      return Promise.resolve().then(function(){return mod.check();}).then(function(result){
        statusCache[descriptor.key]=normalizeStatus(result);
        return statusCache[descriptor.key];
      }).catch(function(error){
        statusCache[descriptor.key]={state:STATE.SYSTEM_BLOCKED,detail:String(error&&error.message||error),lastCheckTime:now()};
        return statusCache[descriptor.key];
      });
    }
    if(typeof mod.getStatus==='function'){
      var result=mod.getStatus();
      statusCache[descriptor.key]=normalizeStatus(result);
      return Promise.resolve(statusCache[descriptor.key]);
    }
    statusCache[descriptor.key]={state:STATE.NOT_REQUESTED,detail:'',lastCheckTime:now()};
    return Promise.resolve(statusCache[descriptor.key]);
  }

  /* 将模块返回的状态对象标准化 */
  function normalizeStatus(result){
    if(!result||typeof result!=='object'){
      return {state:STATE.NOT_REQUESTED,detail:'',lastCheckTime:now()};
    }
    var state=result.state||result.status||STATE.NOT_REQUESTED;
    if(typeof state==='string'&&STATE_LABELS[state]===undefined){
      var map={'default':STATE.NOT_REQUESTED,'prompt':STATE.NOT_REQUESTED,'granted':STATE.GRANTED,'denied':STATE.DENIED};
      state=map[state]||STATE.NOT_REQUESTED;
    }
    return {
      state:state,
      detail:String(result.detail||result.message||''),
      lastCheckTime:Number(result.lastCheckTime)||now()
    };
  }

  /* 检查所有权限 */
  function checkAll(){
    var tasks=registry.map(function(descriptor){return checkOne(descriptor);});
    return Promise.all(tasks).then(function(){
      if(lastContainer)render(lastContainer);
      return getAllStatus();
    });
  }

  /* 获取单个权限的缓存状态 */
  function getStatus(key){
    return statusCache[key]||null;
  }

  /* 获取所有权限状态 */
  function getAllStatus(){
    var result={};
    registry.forEach(function(descriptor){
      result[descriptor.key]=statusCache[descriptor.key]||{state:STATE.NOT_REQUESTED,detail:'',lastCheckTime:0};
    });
    return result;
  }

  /* 发起权限申请 */
  function requestPermission(key){
    var descriptor=findDescriptor(key);
    if(!descriptor)return Promise.reject(new Error('unknown_permission:'+key));
    var mod=resolveModule(descriptor);
    if(!mod)return Promise.reject(new Error('module_not_loaded:'+key));
    if(typeof mod.isSupported==='function'&&!mod.isSupported()){
      statusCache[key]={state:STATE.UNSUPPORTED,detail:'当前浏览器不支持此权限',lastCheckTime:now()};
      if(lastContainer)render(lastContainer);
      return Promise.resolve(statusCache[key]);
    }
    if(typeof mod.request!=='function'){
      return Promise.reject(new Error('module_no_request_method:'+key));
    }
    statusCache[key]={state:STATE.REQUESTING,detail:'',lastCheckTime:now()};
    if(lastContainer)render(lastContainer);
    return Promise.resolve().then(function(){return mod.request();}).then(function(result){
      statusCache[key]=normalizeStatus(result);
      if(lastContainer)render(lastContainer);
      return statusCache[key];
    }).catch(function(error){
      statusCache[key]={state:STATE.SYSTEM_BLOCKED,detail:String(error&&error.message||error),lastCheckTime:now()};
      if(lastContainer)render(lastContainer);
      return statusCache[key];
    });
  }

  function stateClass(state){
    switch(state){
      case STATE.GRANTED:return 'perm-granted';
      case STATE.DENIED:return 'perm-denied';
      case STATE.UNSUPPORTED:return 'perm-unsupported';
      case STATE.SYSTEM_BLOCKED:return 'perm-blocked';
      case STATE.NEEDS_GESTURE:return 'perm-gesture';
      case STATE.REQUESTING:return 'perm-requesting';
      default:return 'perm-idle';
    }
  }

  function buttonInfo(status,supported){
    if(!supported)return{label:'不支持',disabled:true,action:''};
    var st=status?status.state:STATE.NOT_REQUESTED;
    switch(st){
      case STATE.GRANTED:return{label:'已允许',disabled:true,action:''};
      case STATE.UNSUPPORTED:return{label:'不支持',disabled:true,action:''};
      case STATE.REQUESTING:return{label:'申请中…',disabled:true,action:''};
      case STATE.DENIED:return{label:'去设置恢复',disabled:false,action:'settings'};
      case STATE.SYSTEM_BLOCKED:return{label:'去设置检查',disabled:false,action:'settings'};
      case STATE.NEEDS_GESTURE:return{label:'点击允许',disabled:false,action:'request'};
      default:return{label:'申请权限',disabled:false,action:'request'};
    }
  }

  function formatCheckTime(ts){
    if(!ts)return '从未检查';
    var diff=Date.now()-ts,mins=Math.floor(diff/60000);
    if(mins<1)return '刚刚检查';
    if(mins<60)return mins+'分钟前检查';
    var hours=Math.floor(mins/60);
    if(hours<24)return hours+'小时前检查';
    return new Date(ts).toLocaleDateString();
  }

  function renderCard(descriptor){
    var mod=resolveModule(descriptor);
    var supported=mod&&typeof mod.isSupported==='function'?mod.isSupported():true;
    var status=statusCache[descriptor.key]||{state:STATE.NOT_REQUESTED,detail:'',lastCheckTime:0};
    var stateLbl=STATE_LABELS[status.state]||status.state;
    var btn=buttonInfo(status,supported);
    var icon=descriptor.icon||'&#9881;';
    var html='';
    html+='<article class="perm-card" data-perm-key="'+esc(descriptor.key)+'">';
    html+='<div class="perm-card-header">';
    html+='<span class="perm-icon">'+icon+'</span>';
    html+='<div class="perm-card-title"><strong>'+esc(descriptor.name)+'</strong>';
    html+='<small>'+esc(descriptor.description||'')+'</small></div>';
    html+='<span class="perm-state-badge '+stateClass(status.state)+'">'+esc(stateLbl)+'</span>';
    html+='</div>';
    if(status.detail){
      html+='<p class="perm-detail">'+esc(status.detail)+'</p>';
    }
    html+='<div class="perm-card-footer">';
    html+='<span class="perm-check-time">'+esc(formatCheckTime(status.lastCheckTime))+'</span>';
    html+='<button class="perm-action-btn" data-perm-action="'+esc(btn.action)+'" data-perm-key="'+esc(descriptor.key)+'"'+(btn.disabled?' disabled':'')+'>'+esc(btn.label)+'</button>';
    html+='</div>';
    html+='</article>';
    return html;
  }

  function render(container){
    if(!container)return;
    if(typeof container==='string')container=document.getElementById(container);
    if(!container)return;
    lastContainer=container;
    var hasRegistry=registry.length>0;
    var html='';
    html+='<div class="perm-center">';
    html+='<div class="perm-center-header">';
    html+='<div class="perm-center-title">权限中心</div>';
    html+='<div class="perm-center-subtitle">统一管理通知、麦克风、存储等浏览器权限</div>';
    html+='<button class="perm-refresh-btn" id="permRefreshBtn">检查全部</button>';
    html+='</div>';
    if(!hasRegistry){
      html+='<div class="perm-empty">暂无已注册的权限项。</div>';
    }else{
      html+='<div class="perm-list">';
      registry.forEach(function(descriptor){
        html+=renderCard(descriptor);
      });
      html+='</div>';
      html+='<p class="perm-footnote">权限状态由浏览器控制，应用无法强制更改已拒绝的权限。如需恢复，请在浏览器站点设置中手动允许。</p>';
    }
    html+='</div>';
    container.innerHTML=html;
    bindEvents(container);
  }

  function bindEvents(container){
    var refreshBtn=container.querySelector('#permRefreshBtn');
    if(refreshBtn){
      refreshBtn.onclick=function(){
        var self=this;
        self.disabled=true;self.textContent='检查中…';
        checkAll().then(function(){
          self.disabled=false;self.textContent='检查全部';
        }).catch(function(){
          self.disabled=false;self.textContent='检查全部';
        });
      };
    }
    var buttons=container.querySelectorAll('.perm-action-btn[data-perm-action]');
    for(var i=0;i<buttons.length;i++){
      (function(btn){
        var action=btn.getAttribute('data-perm-action');
        var key=btn.getAttribute('data-perm-key');
        if(!action||btn.disabled)return;
        btn.onclick=function(){
          if(action==='request'){
            requestPermission(key);
          }else if(action==='settings'){
            showSettingsHelp(key);
          }
        };
      })(buttons[i]);
    }
  }

  function showSettingsHelp(key){
    var descriptor=findDescriptor(key);
    var name=descriptor?descriptor.name:key;
    var msg='「'+name+'」权限已被拒绝或被系统阻止。\n请在浏览器地址栏点击锁/信息图标，找到站点设置，将对应权限改为"允许"后刷新页面。';
    if(typeof global.showToast==='function'){
      global.showToast(msg,'info');
    }else if(typeof global.alert==='function'){
      global.alert(msg);
    }
  }

  function init(){
    if(global.ShikeNotificationPermission){
      register({key:'notification',name:'通知权限',description:'允许应用发送桌面通知提醒',globalName:'ShikeNotificationPermission',icon:'&#128276;'});
    }
    if(global.ShikeMicrophonePermission){
      register({key:'microphone',name:'麦克风权限',description:'允许语音录入和录音功能',globalName:'ShikeMicrophonePermission',icon:'&#127908;'});
    }
    if(global.ShikeStoragePermission){
      register({key:'storage',name:'持久存储',description:'申请持久化存储，防止数据被浏览器自动清理',globalName:'ShikeStoragePermission',icon:'&#128190;'});
    }
  }

  global.ShikePermissionCenter=Object.freeze({
    STATE:STATE,
    STATE_LABELS:Object.freeze(STATE_LABELS),
    register:register,
    getRegistry:getRegistry,
    checkAll:checkAll,
    checkOne:function(key){var d=findDescriptor(key);return d?checkOne(d):Promise.reject(new Error('unknown_permission:'+key));},
    requestPermission:requestPermission,
    getStatus:getStatus,
    getAllStatus:getAllStatus,
    render:render,
    init:init
  });

  init();
})(typeof window!=='undefined'?window:this);