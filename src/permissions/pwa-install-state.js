/* PWA 安装状态模块：检测 PWA 安装状态与安装提示事件。挂载为 window.ShikePwaInstallState */
(function(global){
  'use strict';

  /* 安装状态枚举 */
  var INSTALL_STATE={
    INSTALLED:'installed',
    NOT_INSTALLED:'not-installed',
    PROMPT_AVAILABLE:'prompt-available'
  };

  var INSTALL_STATE_LABELS={};
  INSTALL_STATE_LABELS[INSTALL_STATE.INSTALLED]='已安装';
  INSTALL_STATE_LABELS[INSTALL_STATE.NOT_INSTALLED]='未安装';
  INSTALL_STATE_LABELS[INSTALL_STATE.PROMPT_AVAILABLE]='可安装';

  /* 缓存的安装提示事件（beforeinstallprompt） */
  var deferredPrompt=null;
  /* 当前安装状态 */
  var currentInstallState=INSTALL_STATE.NOT_INSTALLED;
  /* 事件回调列表 */
  var callbacks=[];
  /* 是否已初始化监听 */
  var initialized=false;

  function now(){return Date.now();}

  /* 检测当前是否以 standalone / fullscreen 模式运行（即已安装为 PWA） */
  function detectDisplayMode(){
    try{
      /* 方式1: CSS media query display-mode */
      if(global.matchMedia){
        var standalone=global.matchMedia('(display-mode: standalone)');
        var fullscreen=global.matchMedia('(display-mode: fullscreen)');
        if(standalone.matches||fullscreen.matches)return true;
      }
    }catch(error){/* 部分浏览器可能不支持 */}
    /* 方式2: iOS Safari standalone 属性 */
    try{
      if(global.navigator&&navigator.standalone===true)return true;
    }catch(error){}
    return false;
  }

  /* 触发状态变更通知 */
  function fire(newState){
    var oldState=currentInstallState;
    currentInstallState=newState;
    callbacks.slice().forEach(function(fn){
      try{fn(newState,oldState);}catch(error){/* 静默 */}});
  }

  /* 注册状态变更回调 */
  function onChange(fn){
    if(typeof fn==='function')callbacks.push(fn);
    return function(){
      var idx=callbacks.indexOf(fn);
      if(idx>=0)callbacks.splice(idx,1);
    };
  }

  /* 判断当前安装状态 */
  function detect(){
    if(detectDisplayMode()){
      return INSTALL_STATE.INSTALLED;
    }
    if(deferredPrompt){
      return INSTALL_STATE.PROMPT_AVAILABLE;
    }
    return INSTALL_STATE.NOT_INSTALLED;
  }

  /* 刷新当前状态并触发回调（仅当状态变化时） */
  function refresh(){
    var newState=detect();
    if(newState!==currentInstallState){
      fire(newState);
    }
    return currentInstallState;
  }

  /* 获取当前安装状态 */
  function getState(){
    return currentInstallState;
  }

  /* 获取状态标签 */
  function getStateLabel(){
    return INSTALL_STATE_LABELS[currentInstallState]||currentInstallState;
  }

  /* 是否已安装 */
  function isInstalled(){
    return currentInstallState===INSTALL_STATE.INSTALLED;
  }

  /* 是否有可用的安装提示 */
  function isPromptAvailable(){
    return currentInstallState===INSTALL_STATE.PROMPT_AVAILABLE;
  }

  /* 触发安装提示（调用 beforeinstallprompt.prompt()） */
  function promptInstall(){
    if(!deferredPrompt){
      return Promise.resolve({ok:false,reason:'no_prompt_available'});
    }
    return deferredPrompt.prompt().then(function(){
      return deferredPrompt.userChoice.then(function(choice){
        var accepted=choice&&choice.outcome==='accepted';
        /* 无论接受与否，安装提示已消费，清除缓存 */
        deferredPrompt=null;
        refresh();
        return {ok:accepted,choice:choice};
      });
    }).catch(function(error){
      deferredPrompt=null;
      refresh();
      return {ok:false,reason:'prompt_failed',error:String(error&&error.message||error)};
    });
  }

  /* 是否支持 PWA 安装（基本能力检测） */
  function isSupported(){
    /* beforeinstallprompt 仅在 Chromium 系浏览器触发；Safari/Firefox 不支持 */
    /* 但即使不触发该事件，仍可通过 display-mode 检测已安装状态 */
    return typeof global.BeforeInstallPromptEvent!=='undefined'||
           (global.navigator&&/Chrome|Chromium|Edge|SamsungBrowser/i.test(navigator.userAgent||''))||
           true; /* 始终允许检测已安装状态 */
  }

  /* 初始化：注册事件监听 */
  function init(){
    if(initialized)return;
    initialized=true;

    /* 监听 beforeinstallprompt：浏览器即将显示安装提示时触发 */
    global.addEventListener('beforeinstallprompt',function(event){
      /* 阻止浏览器默认的小型安装横幅，改由应用自定义 UI 引导 */
      event.preventDefault();
      deferredPrompt=event;
      fire(INSTALL_STATE.PROMPT_AVAILABLE);
    });

    /* 监听 appinstalled：应用成功安装后触发 */
    global.addEventListener('appinstalled',function(){
      deferredPrompt=null;
      fire(INSTALL_STATE.INSTALLED);
    });

    /* 监听 display-mode 变化（如用户从浏览器标签切换到 PWA 窗口） */
    try{
      if(global.matchMedia){
        var mql=global.matchMedia('(display-mode: standalone)');
        if(typeof mql.addEventListener==='function'){
          mql.addEventListener('change',function(e){
            if(e.matches){
              deferredPrompt=null;
              fire(INSTALL_STATE.INSTALLED);
            }else{
              refresh();
            }
          });
        }else if(typeof mql.addListener==='function'){
          mql.addListener(function(e){
            if(e.matches){
              deferredPrompt=null;
              fire(INSTALL_STATE.INSTALLED);
            }else{
              refresh();
            }
          });
        }
      }
    }catch(error){/* 部分浏览器不支持 */}

    /* 初始检测 */
    refresh();
  }

  /* 获取缓存的安装提示事件（供外部判断使用，不应直接调用 prompt） */
  function getDeferredPrompt(){
    return deferredPrompt;
  }

  global.ShikePwaInstallState=Object.freeze({
    INSTALL_STATE:INSTALL_STATE,
    INSTALL_STATE_LABELS:Object.freeze(INSTALL_STATE_LABELS),
    init:init,
    getState:getState,
    getStateLabel:getStateLabel,
    isInstalled:isInstalled,
    isPromptAvailable:isPromptAvailable,
    isSupported:isSupported,
    detectDisplayMode:detectDisplayMode,
    refresh:refresh,
    promptInstall:promptInstall,
    onChange:onChange,
    getDeferredPrompt:getDeferredPrompt
  });

  /* 自动初始化 */
  init();
})(typeof window!=='undefined'?window:this);