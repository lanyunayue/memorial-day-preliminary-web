/* 通知权限模块：管理 Notification 权限申请与状态。挂载为 window.ShikeNotificationPermission */
(function(global){
  'use strict';

  /* 与权限中心保持一致的状态枚举 */
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
    lastCheckTime:0
  };

  /* 记录是否已尝试申请过（避免对已拒绝权限重复申请） */
  var hasAttempted=false;

  function now(){return Date.now();}

  /* 是否支持 Notification API */
  function isSupported(){
    return typeof global.Notification!=='undefined';
  }

  /* 获取浏览器当前权限值（不触发申请） */
  function rawPermission(){
    if(!isSupported())return 'unsupported';
    /* 标准 Notification.permission 返回 'default' / 'granted' / 'denied' */
    try{
      if(typeof global.Notification.permission==='string'){
        return global.Notification.permission;
      }
    }catch(error){/* 某些浏览器可能抛异常 */}
    /* 回退到 Permissions API */
    if(global.navigator&&navigator.permissions&&navigator.permissions.query){
      /* 异步查询会在 check() 中处理 */
      return 'unknown';
    }
    return 'default';
  }

  /* 将浏览器权限值映射为内部状态 */
  function mapState(raw){
    switch(raw){
      case 'granted':return STATE.GRANTED;
      case 'denied':return STATE.DENIED;
      case 'default':return STATE.NOT_REQUESTED;
      case 'prompt':return STATE.NOT_REQUESTED;
      case 'unsupported':return STATE.UNSUPPORTED;
      default:return STATE.NOT_REQUESTED;
    }
  }

  /* 构建状态详情说明 */
  function buildDetail(state){
    switch(state){
      case STATE.GRANTED:return '已获得通知权限，可以发送桌面通知。';
      case STATE.DENIED:
        return '通知权限已被拒绝。请在浏览器地址栏点击锁/信息图标，' +
               '找到"通知"设置，改为"允许"后刷新页面即可恢复。';
      case STATE.UNSUPPORTED:return '当前浏览器不支持桌面通知 API。';
      case STATE.SYSTEM_BLOCKED:return '系统或浏览器策略阻止了通知权限。';
      case STATE.NEEDS_GESTURE:return '需要点击页面按钮才能申请通知权限。';
      case STATE.REQUESTING:return '正在申请通知权限…';
      default:return '尚未申请通知权限。';
    }
  }

  /* 更新缓存状态 */
  function updateStatus(state,detail){
    currentStatus={
      state:state,
      detail:detail||buildDetail(state),
      lastCheckTime:now()
    };
    return currentStatus;
  }

  /* 检查当前权限状态（不触发申请） */
  function check(){
    if(!isSupported()){
      return Promise.resolve(updateStatus(STATE.UNSUPPORTED));
    }
    /* 优先尝试 Permissions API 异步查询 */
    if(global.navigator&&navigator.permissions&&typeof navigator.permissions.query==='function'){
      return navigator.permissions.query({name:'notifications'}).then(function(result){
        var mapped=mapState(result.state||rawPermission());
        return updateStatus(mapped);
      }).catch(function(){
        var mapped=mapState(rawPermission());
        return updateStatus(mapped);
      });
    }
    var mapped=mapState(rawPermission());
    return Promise.resolve(updateStatus(mapped));
  }

  /* 申请通知权限 */
  function request(){
    if(!isSupported()){
      return Promise.resolve(updateStatus(STATE.UNSUPPORTED));
    }

    /* 如果已经拒绝，不重复无意义申请 */
    if(currentStatus.state===STATE.DENIED){
      return Promise.resolve(currentStatus);
    }
    /* 如果已允许，无需再申请 */
    if(currentStatus.state===STATE.GRANTED){
      return Promise.resolve(currentStatus);
    }
    /* 如果正在申请中，等待结果 */
    if(currentStatus.state===STATE.REQUESTING){
      return Promise.resolve(currentStatus);
    }

    hasAttempted=true;
    updateStatus(STATE.REQUESTING);

    /* 处理 requestPermission 返回 Promise 或回调两种形式 */
    return new Promise(function(resolve){
      var permissionPromise;
      try{
        permissionPromise=global.Notification.requestPermission();
      }catch(error){
        /* 某些浏览器在无用户手势时直接抛异常 */
        resolve(updateStatus(STATE.NEEDS_GESTURE));
        return;
      }
      if(permissionPromise&&typeof permissionPromise.then==='function'){
        permissionPromise.then(function(result){
          var mapped=mapState(result);
          resolve(updateStatus(mapped));
        }).catch(function(error){
          resolve(updateStatus(STATE.SYSTEM_BLOCKED,String(error&&error.message||error)));
        });
      }else{
        /* 回调形式（旧版 Safari 等） */
        global.Notification.requestPermission(function(result){
          var mapped=mapState(result);
          resolve(updateStatus(mapped));
        });
      }
    });
  }

  /* 获取缓存状态 */
  function getStatus(){
    return {
      state:currentStatus.state,
      detail:currentStatus.detail,
      lastCheckTime:currentStatus.lastCheckTime
    };
  }

  /* 获取恢复设置指引文案 */
  function getRestoreHint(){
    if(currentStatus.state===STATE.DENIED){
      return '通知权限已被拒绝。恢复方法：\n' +
             '1. 点击地址栏左侧的锁/信息图标\n' +
             '2. 找到"通知"权限设置\n' +
             '3. 改为"允许"\n' +
             '4. 刷新页面';
    }
    return '';
  }

  global.ShikeNotificationPermission=Object.freeze({
    STATE:STATE,
    isSupported:isSupported,
    check:check,
    request:request,
    getStatus:getStatus,
    getRestoreHint:getRestoreHint,
    hasAttempted:function(){return hasAttempted;}
  });

  /* 初始检查一次状态 */
  check().catch(function(){/* 静默失败 */});
})(typeof window!=='undefined'?window:this);