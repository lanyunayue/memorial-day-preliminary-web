/* 麦克风权限模块：管理 getUserMedia 麦克风权限申请与状态。挂载为 window.ShikeMicrophonePermission */
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
    lastCheckTime:0
  };

  /* 保持的 MediaStream 引用（申请成功后可释放或保留供录音使用） */
  var activeStream=null;

  function now(){return Date.now();}

  /* 是否支持 getUserMedia */
  function isSupported(){
    return !!(global.navigator&&navigator.mediaDevices&&typeof navigator.mediaDevices.getUserMedia==='function');
  }

  /* 是否需要 HTTPS 环境（非 localhost） */
  function needsSecureContext(){
    if(typeof global.isSecureContext==='boolean'){
      return !global.isSecureContext;
    }
    if(global.location){
      return global.location.protocol!=='https:'&&global.location.hostname!=='localhost'&&global.location.hostname!=='127.0.0.1';
    }
    return false;
  }

  /* 构建状态详情说明 */
  function buildDetail(state){
    switch(state){
      case STATE.GRANTED:return '已获得麦克风权限，可以使用语音录入和录音。';
      case STATE.DENIED:
        return '麦克风权限已被拒绝。请在浏览器地址栏点击锁/信息图标，' +
               '找到"麦克风"设置，改为"允许"后刷新页面。';
      case STATE.UNSUPPORTED:return '当前浏览器不支持麦克风采集（getUserMedia）API。';
      case STATE.SYSTEM_BLOCKED:
        return needsSecureContext()?
          '当前页面非 HTTPS 环境，浏览器可能阻止麦克风访问。请使用 HTTPS 或 localhost。' :
          '系统或浏览器策略阻止了麦克风访问。';
      case STATE.NEEDS_GESTURE:return '需要点击页面按钮才能申请麦克风权限。';
      case STATE.REQUESTING:return '正在申请麦克风权限…';
      default:return '尚未申请麦克风权限。';
    }
  }

  function updateStatus(state,detail){
    currentStatus={
      state:state,
      detail:detail||buildDetail(state),
      lastCheckTime:now()
    };
    return currentStatus;
  }

  /* 释放已获取的 MediaStream */
  function stopStream(){
    if(activeStream){
      try{
        activeStream.getTracks().forEach(function(track){
          if(typeof track.stop==='function')track.stop();
        });
      }catch(error){/* 静默 */}
      activeStream=null;
    }
  }

  /* 检查当前权限状态（不触发申请弹窗，使用 Permissions API） */
  function check(){
    if(!isSupported()){
      return Promise.resolve(updateStatus(STATE.UNSUPPORTED));
    }
    if(needsSecureContext()){
      return Promise.resolve(updateStatus(STATE.SYSTEM_BLOCKED));
    }
    /* 尝试使用 Permissions API 异步查询（不弹窗） */
    if(navigator.permissions&&typeof navigator.permissions.query==='function'){
      return navigator.permissions.query({name:'microphone'}).then(function(result){
        var state=result.state||'prompt';
        var mapped;
        switch(state){
          case 'granted':mapped=STATE.GRANTED;break;
          case 'denied':mapped=STATE.DENIED;break;
          case 'prompt':mapped=STATE.NOT_REQUESTED;break;
          default:mapped=STATE.NOT_REQUESTED;
        }
        return updateStatus(mapped);
      }).catch(function(){
        return updateStatus(STATE.NOT_REQUESTED);
      });
    }
    return Promise.resolve(updateStatus(STATE.NOT_REQUESTED));
  }

  /* 申请麦克风权限 */
  function request(){
    if(!isSupported()){
      return Promise.resolve(updateStatus(STATE.UNSUPPORTED));
    }
    if(needsSecureContext()){
      return Promise.resolve(updateStatus(STATE.SYSTEM_BLOCKED));
    }
    /* 已拒绝时不重复申请 */
    if(currentStatus.state===STATE.DENIED){
      return Promise.resolve(currentStatus);
    }
    /* 已允许则直接返回 */
    if(currentStatus.state===STATE.GRANTED){
      return Promise.resolve(currentStatus);
    }
    /* 正在申请中 */
    if(currentStatus.state===STATE.REQUESTING){
      return Promise.resolve(currentStatus);
    }

    updateStatus(STATE.REQUESTING);

    return navigator.mediaDevices.getUserMedia({audio:true,video:false}).then(function(stream){
      /* 申请成功，保存引用并释放（仅做权限检测，实际录音由业务模块自行获取） */
      activeStream=stream;
      stopStream();
      return updateStatus(STATE.GRANTED);
    }).catch(function(error){
      var name=error&&error.name||'';
      var msg=error&&error.message||String(error);
      if(name==='NotAllowedError'||name==='PermissionDeniedError'){
        return updateStatus(STATE.DENIED);
      }
      if(name==='NotFoundError'||name==='DevicesNotFoundError'){
        return updateStatus(STATE.UNSUPPORTED,'未检测到麦克风设备。');
      }
      if(name==='NotReadableError'||name==='TrackStartError'){
        return updateStatus(STATE.SYSTEM_BLOCKED,'麦克风被其他程序占用或硬件故障：'+msg);
      }
      if(name==='OverconstrainedError'||name==='ConstraintNotSatisfiedError'){
        return updateStatus(STATE.UNSUPPORTED,'麦克风不满足约束条件：'+msg);
      }
      if(name==='SecurityError'){
        return updateStatus(STATE.SYSTEM_BLOCKED,'浏览器安全策略阻止：'+msg);
      }
      if(name==='AbortError'){
        return updateStatus(STATE.NEEDS_GESTURE);
      }
      /* 未知错误 */
      return updateStatus(STATE.SYSTEM_BLOCKED,'麦克风访问失败：'+msg);
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

  /* 获取恢复设置指引 */
  function getRestoreHint(){
    if(currentStatus.state===STATE.DENIED){
      return '麦克风权限已被拒绝。恢复方法：\n' +
             '1. 点击地址栏左侧的锁/信息图标\n' +
             '2. 找到"麦克风"权限设置\n' +
             '3. 改为"允许"\n' +
             '4. 刷新页面';
    }
    return '';
  }

  /* 当不支持时，隐藏录音入口或禁用录音按钮的工具方法 */
  function applyToElement(el){
    if(!el)return;
    if(typeof el==='string')el=document.getElementById(el);
    if(!el)return;
    if(!isSupported()){
      el.setAttribute('disabled','disabled');
      el.classList.add('perm-unsupported');
      el.style.opacity='0.5';
      el.style.pointerEvents='none';
      el.title='当前浏览器不支持录音功能';
    }else if(currentStatus.state===STATE.UNSUPPORTED){
      el.setAttribute('disabled','disabled');
      el.style.opacity='0.5';
      el.title=currentStatus.detail||'麦克风不可用';
    }
  }

  global.ShikeMicrophonePermission=Object.freeze({
    STATE:STATE,
    isSupported:isSupported,
    needsSecureContext:needsSecureContext,
    check:check,
    request:request,
    getStatus:getStatus,
    getRestoreHint:getRestoreHint,
    stopStream:stopStream,
    applyToElement:applyToElement
  });

  /* 初始检查一次状态 */
  check().catch(function(){/* 静默失败 */});
})(typeof window!=='undefined'?window:this);