(function(global){
  var context=null,unlocked=false,currentUtterance=null,lastText='';
  var TONES={success:[[660,.06],[880,.09]],reminder:[[520,.08],[660,.08]],warning:[[440,.08],[370,.12]],error:[[260,.12],[210,.16]],confirmation:[[560,.06],[700,.07]]};
  function preferences(){return global.ShikeSpriteCustomization?global.ShikeSpriteCustomization.get():{sounds:true,speech:false,volume:.28,rate:1,voiceURI:''};}
  function unlock(){
    if(unlocked)return true;
    try{context=context||new (global.AudioContext||global.webkitAudioContext)();if(context.state==='suspended')context.resume();unlocked=true;return true;}catch(error){return false;}
  }
  function play(name){
    var pref=preferences();if(!pref.sounds||!unlocked||!context||!TONES[name])return false;
    var at=context.currentTime,volume=Math.min(.12,Math.max(.015,pref.volume*.12));
    TONES[name].forEach(function(note,index){var oscillator=context.createOscillator(),gain=context.createGain(),start=at+index*.075;oscillator.type='sine';oscillator.frequency.value=note[0];gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.012);gain.gain.exponentialRampToValueAtTime(.001,start+note[1]+.08);oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+note[1]+.1);});
    return true;
  }
  function voices(){return global.speechSynthesis?global.speechSynthesis.getVoices().map(function(v){return{name:v.name,lang:v.lang,voiceURI:v.voiceURI,default:v.default};}):[];}
  function stop(){if(global.speechSynthesis)global.speechSynthesis.cancel();currentUtterance=null;if(global.ShikeBearState&&global.ShikeBearState.current()==='speaking')global.ShikeBearState.transition('idle',{reason:'speech-stop'});}
  function pause(){if(global.speechSynthesis&&global.speechSynthesis.speaking)global.speechSynthesis.pause();}
  function resume(){if(global.speechSynthesis&&global.speechSynthesis.paused)global.speechSynthesis.resume();}
  function speak(text,force){
    var pref=preferences();text=String(text||'').trim();if(!text||!global.speechSynthesis||(!pref.speech&&!force))return false;
    stop();lastText=text;var utterance=new SpeechSynthesisUtterance(text.slice(0,1800));
    utterance.rate=pref.rate;utterance.volume=pref.volume;utterance.lang='zh-CN';
    var selected=global.speechSynthesis.getVoices().find(function(v){return v.voiceURI===pref.voiceURI;});if(selected)utterance.voice=selected;
    utterance.onstart=function(){if(global.ShikeBearState)global.ShikeBearState.transition('speaking',{reason:'speech'});};
    utterance.onend=utterance.onerror=function(){currentUtterance=null;if(global.ShikeBearState&&global.ShikeBearState.current()==='speaking')global.ShikeBearState.transition('idle',{reason:'speech-end'});};
    currentUtterance=utterance;global.speechSynthesis.speak(utterance);return true;
  }
  function replay(){return speak(lastText,true);}
  function init(){document.addEventListener('pointerdown',unlock,{once:true,passive:true});document.addEventListener('keydown',unlock,{once:true});}
  global.ShikeSpriteAudio=Object.freeze({unlock:unlock,play:play,speak:speak,stop:stop,pause:pause,resume:resume,replay:replay,voices:voices,lastText:function(){return lastText;}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window);
