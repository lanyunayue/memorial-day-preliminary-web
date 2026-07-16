(function(global){
  var KEY='shike_browser_ai_enabled_v1';
  function language(){var value=String(global.LANG||document.documentElement.lang||'zh').toLowerCase();return value.indexOf('ja')===0?'ja':(value.indexOf('en')===0?'en':'zh');}
  var SUPPORTED_LANGUAGES=['de','en','es','fr','ja'];
  function languageSupported(lang){return SUPPORTED_LANGUAGES.indexOf(lang)>=0;}
  function modelOptions(){var lang=language();return{expectedInputs:[{type:'text',languages:[lang]}],expectedOutputs:[{type:'text',languages:[lang]}]};}
  function enabled(){try{return global.localStorage.getItem(KEY)==='true';}catch(error){return false;}}
  function setEnabled(value){try{global.localStorage.setItem(KEY,value?'true':'false');}catch(error){}return enabled();}
  async function availability(){
    if(!global.LanguageModel||typeof global.LanguageModel.availability!=='function')return'unavailable';
    var lang=language();if(!languageSupported(lang))return'unavailable';
    try{return await global.LanguageModel.availability(modelOptions());}catch(error){return'unavailable';}
  }
  async function createSession(){
    var initial=[{role:'system',content:'只根据用户提供的公开资料摘要整理简洁答案，不补充未提供的事实；资料不足时明确说明。'}];
    var options=modelOptions();options.initialPrompts=initial;return global.LanguageModel.create(options);
  }
  async function enhance(payload){
    if(!enabled())return{enhanced:false,text:payload.answer,reason:'disabled'};
    var state=await availability();if(state!=='available')return{enhanced:false,text:payload.answer,reason:state};
    var session=null,controller=new AbortController(),timer=global.setTimeout(function(){controller.abort();},12000);
    try{
      session=await createSession();var sources=(payload.sources||[]).slice(0,6).map(function(source,index){return(index+1)+'. '+source.title+'：'+String(source.snippet||'').slice(0,500);}).join('\n');
      var prompt='问题：'+payload.query+'\n\n规则提取摘要：'+payload.answer+'\n\n公开来源摘要：\n'+sources+'\n\n请用简洁中文整理，并保留不确定性。';
      var text=await session.prompt(prompt,{signal:controller.signal});text=String(text||'').trim();return text?{enhanced:true,text:text,reason:'browser-language-model'}:{enhanced:false,text:payload.answer,reason:'empty'};
    }catch(error){return{enhanced:false,text:payload.answer,reason:error.name==='AbortError'?'timeout':'failed'};}
    finally{global.clearTimeout(timer);if(session&&typeof session.destroy==='function')session.destroy();}
  }
  async function bindControls(toggle,hint){
    if(!toggle)return;var state=await availability();toggle.checked=enabled();toggle.disabled=state==='unavailable';if(hint)hint.textContent=state==='available'?'浏览器本地模型可用，仅处理公开摘要':(state==='downloadable'||state==='downloading'?'浏览器模型尚未就绪，开启后可能需要下载':'当前浏览器不支持，继续使用规则总结');
    if(typeof toggle.addEventListener==='function')toggle.addEventListener('change',function(){setEnabled(toggle.checked);});
  }
  global.ShikeBrowserAI=Object.freeze({availability:availability,enabled:enabled,setEnabled:setEnabled,enhance:enhance,bindControls:bindControls});
})(window);
