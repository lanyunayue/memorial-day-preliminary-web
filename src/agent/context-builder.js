(function(ns){
  ns.contextBuilder=Object.freeze({
    build:function(){
      var records=window.records||[];
      var lastCreated=records.filter(function(r){return r.createdAt;}).sort(function(a,b){return(b.createdAt||0)-(a.createdAt||0);})[0];
      var state=ns.sessionContext?ns.sessionContext.expireCheck():{};
      var d=new Date();
      var today=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
      return {
        page:window.currentPage||'home',
        recordCount:records.length,
        language:window.LANG||'zh-CN',
        localOnly:true,
        today:today,
        lastCreatedRecord:lastCreated?{id:lastCreated.id,title:lastCreated.title,dateKey:lastCreated.dateKey}:null,
        pendingDraft:state.pendingDraft||null,
        lastCreatedRecordId:state.lastCreatedRecordId||null,
        lastCreatedRecordTitle:state.lastCreatedRecordTitle||'',
        lastReferencedRecordId:state.lastReferencedRecordId||null,
        lastReferencedTitle:state.lastReferencedTitle||'',
        recentTurns:state.recentTurns||[],
        currentDate:state.currentDate||today
      };
    }
  });
  function pad(n){return n<10?'0'+n:''+n;}
})(window.ShikeAgentModules);
