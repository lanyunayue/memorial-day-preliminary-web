(function(global){
  var STATES={
    idle:{label:'时刻精灵已就绪'},blink:{label:'时刻精灵眨了眨眼',idleAfter:240},wave:{label:'时刻精灵正在向你打招呼',idleAfter:1500},
    listening:{label:'时刻精灵正在听你说'},thinking:{label:'时刻精灵正在理解'},searching:{label:'时刻精灵正在查询公开资料'},
    planning:{label:'时刻精灵正在整理执行步骤'},'waiting-confirmation':{label:'时刻精灵正在等待确认'},working:{label:'时刻精灵正在执行'},
    speaking:{label:'时刻精灵正在朗读'},success:{label:'操作已完成',idleAfter:1800},warning:{label:'结果可能不完整',idleAfter:2800},
    error:{label:'操作没有完成',idleAfter:3400},sleeping:{label:'时刻精灵正在休息'},dragging:{label:'正在移动时刻精灵'}
  };
  var current='idle';
  var previous='idle';
  var listeners=[];
  var idleTimer=0;
  var blinkTimer=0;
  var schedulingBlink=false;
  var root=null;
  var hiddenBefore='idle';
  var reduced=!!(global.matchMedia&&global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function cancelTimer(id){if(id&&typeof global.clearTimeout==='function')global.clearTimeout(id);}
  function delay(fn,ms){return typeof global.setTimeout==='function'?global.setTimeout(fn,ms):0;}

  function safeCall(fn,payload){try{fn(payload);}catch(error){if(global.console&&console.warn)console.warn('[ShikeBearState]',error);}}
  function emit(phase,state,from,meta){
    var payload={phase:phase,state:state,previous:from,meta:meta||{},label:STATES[state].label,reducedMotion:reduced,at:Date.now()};
    listeners.slice().forEach(function(fn){safeCall(fn,payload);});
    try{global.dispatchEvent(new CustomEvent('shike:bear-state',{detail:payload}));}catch(error){}
  }
  function clearTimers(){cancelTimer(idleTimer);cancelTimer(blinkTimer);idleTimer=0;blinkTimer=0;}
  function scheduleBlink(){
    cancelTimer(blinkTimer);
    if(reduced||current!=='idle'||document.hidden||schedulingBlink)return;
    schedulingBlink=true;
    blinkTimer=delay(function(){transition('blink',{reason:'ambient'});},6200+Math.floor(Math.random()*3600));
    schedulingBlink=false;
  }
  function applyDom(){
    if(!root)root=document.getElementById('timeSprite');
    if(!root||typeof root.setAttribute!=='function')return;
    root.setAttribute('data-bear-state',current);
    var toggle=document.getElementById('timeSpriteToggle');
    var status=document.getElementById('spriteStateLabel');
    if(toggle&&typeof toggle.setAttribute==='function')toggle.setAttribute('aria-label',STATES[current].label);
    if(status)status.textContent=STATES[current].label;
  }
  function transition(next,meta){
    if(!STATES[next])return false;
    if(next===current&&!(meta&&meta.force))return true;
    clearTimers();
    var from=current;
    emit('exit',from,from,meta);
    previous=from;
    current=next;
    applyDom();
    emit('enter',next,from,meta);
    if(STATES[next].idleAfter){idleTimer=delay(function(){transition('idle',{reason:'automatic'});},STATES[next].idleAfter);}
    else if(next==='idle')scheduleBlink();
    return true;
  }
  function subscribe(fn){
    if(typeof fn!=='function')return function(){};
    listeners.push(fn);
    safeCall(fn,{phase:'enter',state:current,previous:previous,meta:{reason:'subscribe'},label:STATES[current].label,reducedMotion:reduced,at:Date.now()});
    return function(){listeners=listeners.filter(function(item){return item!==fn;});};
  }
  function attach(element){root=element||document.getElementById('timeSprite');applyDom();scheduleBlink();return !!root;}
  function onVisibility(){
    if(document.hidden){hiddenBefore=current;transition('sleeping',{reason:'page-hidden'});}
    else transition(hiddenBefore==='sleeping'?'idle':hiddenBefore,{reason:'page-visible'});
  }
  function onMotionChange(event){reduced=!!event.matches;applyDom();if(reduced)cancelTimer(blinkTimer);else scheduleBlink();}
  function init(){
    attach();
    document.addEventListener('visibilitychange',onVisibility);
    var mq=global.matchMedia&&global.matchMedia('(prefers-reduced-motion: reduce)');
    if(mq){if(mq.addEventListener)mq.addEventListener('change',onMotionChange);else if(mq.addListener)mq.addListener(onMotionChange);}
    var toggle=document.getElementById('timeSpriteToggle');
    if(toggle&&typeof toggle.addEventListener==='function'){
      toggle.addEventListener('pointerdown',function(){transition('dragging',{reason:'pointer'});},{passive:true});
      ['pointerup','pointercancel'].forEach(function(type){toggle.addEventListener(type,function(){transition('idle',{reason:'pointer-end'});},{passive:true});});
    }
  }
  global.ShikeBearState=Object.freeze({
    states:Object.freeze(Object.keys(STATES)),transition:transition,subscribe:subscribe,attach:attach,
    current:function(){return current;},label:function(state){return STATES[state||current]&&STATES[state||current].label;},
    reducedMotion:function(){return reduced;}
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window);
