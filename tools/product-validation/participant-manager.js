(function(global){
  'use strict';
  var exports=[];var codes=[];
  function byId(id){return document.getElementById(id);}
  function render(){
    var metrics=global.ShikeSessionAnalyzer.analyze(exports);byId('metrics').textContent=global.ShikeMetricsReport.markdown(metrics);byId('exportStudy').disabled=!exports.length;
    byId('sourceCount').textContent=exports.length+' 个真实导出文件';byId('codeCount').textContent=codes.length+' 条人工编码';
  }
  async function loadFiles(event){
    var loaded=[];for(var file of Array.from(event.target.files||[])){var payload=JSON.parse(await file.text());global.ShikeSessionAnalyzer.assertExport(payload);loaded.push(payload);}
    exports=exports.concat(loaded);render();
  }
  function addCode(){
    try{codes.push(global.ShikeQualitativeCoder.code({participantCode:byId('codeParticipant').value,sessionId:byId('codeSession').value,issueCode:byId('issueCode').value,severity:byId('severity').value}));byId('message').textContent='人工编码已加入当前本地工作区。';render();}catch(error){byId('message').textContent=error.message;}
  }
  function exportStudy(){global.ShikeStudyExporter.download(global.ShikeStudyExporter.build(exports,codes));}
  byId('files').addEventListener('change',loadFiles);byId('addCode').addEventListener('click',addCode);byId('exportStudy').addEventListener('click',exportStudy);render();
})(window);
