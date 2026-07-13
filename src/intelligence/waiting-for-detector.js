(function(global,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;global.ShikeWaitingForDetector=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function detect(text){
    text=String(text||'').trim();
    var direct=text.match(/等(?:待)?([\u4e00-\u9fa5]{1,5}?)(?:回复|答复|回信|结果|确认)(.*)/);
    var reported=text.match(/^([\u4e00-\u9fa5]{1,5}?)(?:说|表示|答应)(.*?)(?:回复|答复|给我结果|通知我)/);
    var overdue=/(?:还没|仍未|没有)(?:回复|答复|回信|结果)|(?:还不|仍不)(?:回我|回复|答复)/.test(text);
    if(!direct&&!reported&&!overdue)return null;
    var conditionalPerson=(text.match(/(?:如果|要是|假如|若是)(?:.*?)(小[\u4e00-\u9fa5]|老[\u4e00-\u9fa5]|老师|客户)/)||[])[1]||'';
    var person=direct&&direct[1]||reported&&reported[1]||conditionalPerson;
    var subject=(direct&&direct[2]||reported&&reported[2]||text).trim();
    return {type:'waiting_for',action:'等待'+(person||'对方')+'回复'+subject,subject:'我',object:subject||text,personRefs:person?[person]:[],signal:overdue?'waiting_overdue':'waiting_expected'};
  }
  return Object.freeze({detect:detect});
});
