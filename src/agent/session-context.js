(function(){
  var ns=window.ShikeAgentModules;
  if(!ns)return;
  var SESSION_KEY='shike_agent_session_v1';
  var TTL_MS=30*60*1000;
  function now(){return Date.now();}
  function pad2(n){return n<10?'0'+n:''+n;}
  function defaultState(){
    return{
      recentTurns:[],
      pendingDraft:null,
      lastCreatedRecordId:null,
      lastCreatedRecordTitle:'',
      lastCreatedAt:0,
      lastReferencedRecordId:null,
      lastReferencedTitle:'',
      inheritedDateKey:null,
      inheritedTime:null,
      inheritedTimePhrase:'',
      currentPage:'home',
      currentDate:'',
      lastActionResult:null,
      updatedAt:now()
    };
  }
  function safeLoad(){
    try{
      var raw=localStorage.getItem(SESSION_KEY);
      if(!raw)return defaultState();
      var s=JSON.parse(raw);
      if(!s||typeof s!=='object')return defaultState();
      if(now()-(s.updatedAt||0)>TTL_MS){return defaultState();}
      s.recentTurns=Array.isArray(s.recentTurns)?s.recentTurns.slice(-12):[];
      if(s.pendingDraft&&now()-(s.pendingDraft.createdAt||0)>TTL_MS)s.pendingDraft=null;
      return Object.assign(defaultState(),s);
    }catch(e){return defaultState();}
  }
  function safeSave(state){
    try{
      state.updatedAt=now();
      localStorage.setItem(SESSION_KEY,JSON.stringify(state));
    }catch(e){}
  }
  ns.sessionContext={
    getState:function(){return safeLoad();},
    addTurn:function(role,text,meta){
      var s=safeLoad();
      s.recentTurns.push({role:role,text:String(text||'').slice(0,500),meta:meta||{},at:now()});
      if(s.recentTurns.length>12)s.recentTurns=s.recentTurns.slice(-12);
      s.currentPage=window.currentPage||'home';
      var d=new Date();
      s.currentDate=d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
      safeSave(s);
      return s;
    },
    setPendingDraft:function(draft){
      var s=safeLoad();
      if(draft){
        s.pendingDraft=Object.assign({id:'draft_'+now().toString(36),createdAt:now()},draft);
      }else{
        s.pendingDraft=null;
      }
      safeSave(s);
      return s.pendingDraft;
    },
    updatePendingDraft:function(patch){
      var s=safeLoad();
      if(!s.pendingDraft)return null;
      s.pendingDraft=Object.assign(s.pendingDraft,patch,{updatedAt:now()});
      safeSave(s);
      return s.pendingDraft;
    },
    clearPendingDraft:function(){
      var s=safeLoad();
      s.pendingDraft=null;
      safeSave(s);
    },
    setLastCreated:function(record){
      var s=safeLoad();
      if(record){
        s.lastCreatedRecordId=record.id;
        s.lastCreatedRecordTitle=record.title||'';
        s.lastCreatedAt=now();
        s.lastReferencedRecordId=record.id;
        s.lastReferencedTitle=record.title||'';
        s.pendingDraft=null;
      }
      safeSave(s);
    },
    setLastReferenced:function(record){
      var s=safeLoad();
      if(record){
        s.lastReferencedRecordId=record.id;
        s.lastReferencedTitle=record.title||'';
      }
      safeSave(s);
    },
    setInheritedTime:function(dateKey,time,phrase){
      var s=safeLoad();
      s.inheritedDateKey=dateKey||null;
      s.inheritedTime=time||null;
      s.inheritedTimePhrase=phrase||'';
      safeSave(s);
    },
    setActionResult:function(result){
      var s=safeLoad();
      s.lastActionResult=result?{ok:!!result.ok,message:result.message||'',at:now()}:null;
      safeSave(s);
    },
    clear:function(){safeSave(defaultState());},
    expireCheck:function(){
      var s=safeLoad();
      if(s.pendingDraft&&now()-(s.pendingDraft.createdAt||0)>TTL_MS){
        s.pendingDraft=null;safeSave(s);
      }
      return s;
    }
  };
})();
