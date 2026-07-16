(function(global){
  var KEY='shike_sprite_preferences_v1';
  var DEFAULTS={
    name:'时刻精灵',primary:'#fffaf2',secondary:'#f0e0d3',eyes:'dot',expression:'calm',ears:'round',hat:'none',glasses:'none',
    scarf:'none',badge:'clock',aura:'soft',animationIntensity:'gentle',renderer:'2d',sounds:true,speech:false,voiceURI:'',rate:1,volume:.28
  };
  var ENUMS={
    eyes:['dot','smile','sleepy'],expression:['calm','cheerful','focused'],ears:['round','small'],hat:['none','cap','leaf'],
    glasses:['none','round'],scarf:['none','paper','forest'],badge:['none','clock','star'],aura:['none','soft','warm'],
    animationIntensity:['off','gentle','lively'],renderer:['2d','3d']
  };
  var current=load();
  var listeners=[];
  function clamp(value,min,max,fallback){value=Number(value);return Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;}
  function color(value,fallback){return /^#[0-9a-f]{6}$/i.test(String(value||''))?String(value):fallback;}
  function sanitize(input){
    var out=Object.assign({},DEFAULTS);input=input&&typeof input==='object'?input:{};
    out.name=String(input.name||DEFAULTS.name).trim().slice(0,12)||DEFAULTS.name;
    out.primary=color(input.primary,DEFAULTS.primary);out.secondary=color(input.secondary,DEFAULTS.secondary);
    Object.keys(ENUMS).forEach(function(key){out[key]=ENUMS[key].indexOf(input[key])>=0?input[key]:DEFAULTS[key];});
    out.sounds=input.sounds!==false;out.speech=input.speech===true;out.voiceURI=String(input.voiceURI||'').slice(0,220);
    out.rate=clamp(input.rate,.6,1.6,DEFAULTS.rate);out.volume=clamp(input.volume,0,1,DEFAULTS.volume);
    return out;
  }
  function load(){try{return sanitize(JSON.parse(global.localStorage.getItem(KEY)||'{}'));}catch(error){return sanitize({});}}
  function persist(){try{global.localStorage.setItem(KEY,JSON.stringify(current));return true;}catch(error){return false;}}
  function notify(){listeners.slice().forEach(function(fn){try{fn(Object.assign({},current));}catch(error){}});}
  function update(patch){current=sanitize(Object.assign({},current,patch||{}));persist();notify();return get();}
  function reset(){current=sanitize({});persist();notify();return get();}
  function get(){return Object.assign({},current);}
  function subscribe(fn){if(typeof fn!=='function')return function(){};listeners.push(fn);try{fn(get());}catch(error){}return function(){listeners=listeners.filter(function(item){return item!==fn;});};}
  global.ShikeSpriteCustomization=Object.freeze({get:get,update:update,reset:reset,subscribe:subscribe,defaults:Object.freeze(Object.assign({},DEFAULTS)),options:Object.freeze(ENUMS)});
})(window);
