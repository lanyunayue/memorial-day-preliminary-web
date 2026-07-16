/* 存储权限模块：检测持久化存储状态与空间估算。挂载为 window.ShikeStoragePermission */
(function(global){
  'use strict';

  var STATE={
    NOT_REQUESTED:'not-requested',
    REQUESTING:'requesting',
    GRANTED:'granted',
    DENIED:'denied',
    UNSUPPORTED:'unsupported',
    SYSTEM_BLOCKED:'system-blocked',
    NEEDS_GESTURE:'needs-gesture'
  };

  /* 当前缓存状态 */
  var currentStatus={
    state:STATE.NOT_REQUESTED,
    detail:'',
    lastCheckTime:0,
    persisted:false,
    usage:0,
    quota:0
  };

  function now(){return Date.now();}

  /* 是否支持 Storage API */
  function isSupported(){
    return !!(global.navigator&&navigator.storage&&typeof navigator.storage.persist==='function');
  }

  /* 是否支持 estimate */
  function supportsEstimate(){
    return !!(global.navigator&&navigator.storage&&typeof navigator.storage.estimate==='function');
  }

  /* 是否支持 persisted 查询 */
  function supportsPersisted(){
    return !!(global.navigator&&navigator.storage&&typeof navigator.storage.persisted==='function');
  }

  /* 格式化字节数为可读字符串 */
  function formatBytes(bytes){
    var b=Number(bytes)||0;
    if(b<1024)return b+' B';
    if(b<1048576)return (b/1024).toFixed(1)+' KB';
    if(b<1073741824)return (b/1048576).toFixed(1)+' MB';
    return (b/1073741824).toFixed(2)+' GB';
  }

  /* 计算使用率百分比 */
  function usagePercent(usage,quota){
    if(!quota)return 0;
    var pct=Math.round((Number(usage)||0)/quota*100);
    return Math.min(100,Math.max(0,pct));
  }

  /* 构建状态详情说明 */
  function buildDetail(state,persisted,usage,quota){
    var parts=[];
    switch(state){
      case STATE.GRANTED:
        parts.push(persisted?'存储已持久化，数据不会被浏览器自动清理。':'存储权限已获得但尚未持久化。');
        break;
      case STATE.DENIED:
        parts.push('持久存储申请被拒绝。浏览器可能在存储空间不足时清理数据。');
        break;
      case STATE.UNSUPPORTED:
        parts.push('当前浏览器不支持 Storage API（persist/estimate）。');
        break;
      case STATE.SYSTEM_BLOCKED:
        parts.push('系统或浏览器策略阻止了持久化存储。');
        break;
      case STATE.REQUESTING:
        parts.push('正在申请持久化存储…');
        break;
      case STATE.NEEDS_GESTURE:
        parts.push('需要点击页面按钮才能申请持久存储。');
        break;
      default:
        parts.push('尚未申请持久化存储。');
    }
    if(supportsEstimate()&&quota>0){
      parts.push('已使用 '+formatBytes(usage)+' / '+formatBytes(quota)+'（'+usagePercent(usage,quota)+'%）');
    }
    return parts.join(' ');
  }

  function updateStatus(state,extra){
    var persisted=extra&&typeof extra.persisted==='boolean'?extra.persisted:currentStatus.persisted;
    var usage=extra&&typeof extra.usage==='number'?extra.usage:currentStatus.usage;
    var quota=extra&&typeof extra.quota==='number'?extra.quota:currentStatus.quota;
    currentStatus={
      state:state,
      detail:buildDetail(state,persisted,usage,quota),
      lastCheckTime:now(),
      persisted:persisted,
      usage:usage,
      quota:quota
    };
    return currentStatus;
  }

  /* 获取空间估算 */
  function fetchEstimate(){
    if(!supportsEstimate())return Promise.resolve(null);
    return navigator.storage.estimate().then(function(est){
      return {
        usage:Number(est&&est.usage)||0,
        quota:Number(est&&est.quota)||0
      };
    }).catch(function(){return null;});
  }

  /* 获取当前持久化状态 */
  function fetchPersisted(){
    if(!supportsPersisted())return Promise.resolve(false);
    return navigator.storage.persisted().then(function(persisted){
      return !!persisted;
    }).catch(function(){return false;});
  }

  /* 检查当前存储状态（不触发申请） */
  function check(){
    if(!isSupported()){
      return Promise.resolve(updateStatus(STATE.UNSUPPORTED));
    }
    return Promise.all([fetchPersisted(),fetchEstimate()]).then(function(results){
      var persisted=results[0];
      var est=results[1]||{usage:0,quota:0};
      var state=persisted?STATE.GRANTED:STATE.NOT_REQUESTED;
      return updateStatus(state,{
        persisted:persisted,
        usage:est.usage,
        quota:est.quota
      });
    }).catch(function(){
      return updateStatus(STATE.NOT_REQUESTED);
    });
  }

  /* 申请持久化存储 */
  function request(){
    if(!isSupported()){
      return Promise.resolve(updateStatus(STATE.UNSUPPORTED));
    }
    /* 已持久化则无需再申请 */
    if(currentStatus.persisted){
      return Promise.resolve(updateStatus(STATE.GRANTED));
    }
    /* 正在申请中 */
    if(currentStatus.state===STATE.REQUESTING){
      return Promise.resolve(currentStatus);
    }

    updateStatus(STATE.REQUESTING);

    return navigator.storage.persist().then(function(persisted){
      /* 申请完成后刷新空间估算 */
      return fetchEstimate().then(function(est){
        var extra={
          persisted:!!persisted,
          usage:est?est.usage:currentStatus.usage,
          quota:est?est.quota:currentStatus.quota
        };
        if(persisted){
          return updateStatus(STATE.GRANTED,extra);
        }
        return updateStatus(STATE.DENIED,extra);
      });
    }).catch(function(error){
      var msg=error&&error.message||String(error);
      return updateStatus(STATE.SYSTEM_BLOCKED,'持久化存储申请失败：'+msg);
    });
  }

  /* 获取缓存状态 */
  function getStatus(){
    return {
      state:currentStatus.state,
      detail:currentStatus.detail,
      lastCheckTime:currentStatus.lastCheckTime,
      persisted:currentStatus.persisted,
      usage:currentStatus.usage,
      quota:currentStatus.quota,
      usageFormatted:formatBytes(currentStatus.usage),
      quotaFormatted:formatBytes(currentStatus.quota),
      usagePercent:usagePercent(currentStatus.usage,currentStatus.quota)
    };
  }

  /* 获取空间估算（独立调用，每次实时获取） */
  function getEstimate(){
    if(!supportsEstimate())return Promise.resolve({usage:0,quota:0,usageFormatted:'0 B',quotaFormatted:'0 B',usagePercent:0});
    return navigator.storage.estimate().then(function(est){
      var usage=Number(est&&est.usage)||0;
      var quota=Number(est&&est.quota)||0;
      return {
        usage:usage,
        quota:quota,
        usageFormatted:formatBytes(usage),
        quotaFormatted:formatBytes(quota),
        usagePercent:usagePercent(usage,quota)
      };
    }).catch(function(){
      return {usage:0,quota:0,usageFormatted:'0 B',quotaFormatted:'0 B',usagePercent:0};
    });
  }

  /* 获取当前持久化状态（独立调用） */
  function getPersisted(){
    if(!supportsPersisted())return Promise.resolve(false);
    return navigator.storage.persisted().then(function(persisted){
      return !!persisted;
    }).catch(function(){return false;});
  }

  global.ShikeStoragePermission=Object.freeze({
    STATE:STATE,
    isSupported:isSupported,
    supportsEstimate:supportsEstimate,
    supportsPersisted:supportsPersisted,
    check:check,
    request:request,
    getStatus:getStatus,
    getEstimate:getEstimate,
    getPersisted:getPersisted,
    formatBytes:formatBytes
  });

  /* 初始检查一次状态 */
  check().catch(function(){/* 静默失败 */});
})(typeof window!=='undefined'?window:this);