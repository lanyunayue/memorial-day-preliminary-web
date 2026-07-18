(function(ns){
  function find(query){return (window.records||[]).filter(function(record){return String(record.title||'').toLowerCase().includes(String(query||'').toLowerCase());});}
  function findById(id){return (window.records||[]).find(function(r){return r.id===id;});}
  function requireText(args,key){var value=String(args&&args[key]||'').trim();if(!value)throw new Error('invalid_arguments');return value;}
  function resolveRecord(args){
    if(args&&args.recordId){var r=findById(args.recordId);if(r)return r;}
    var q=args&&(args.query||args.text||'');
    if(q){
      // Try exact title match first
      var all=window.records||[];
      var exact=all.find(function(r){return r.title===q;});
      if(exact)return exact;
      var matches=find(q);
      if(matches.length===1)return matches[0];
      if(matches.length>1)throw new Error('multiple_records');
    }
    // Fall back to session context last referenced/created
    var ctx=ns.contextBuilder.build();
    if(ctx.lastReferencedRecordId){var ref=findById(ctx.lastReferencedRecordId);if(ref)return ref;}
    if(ctx.lastCreatedRecordId){var cr=findById(ctx.lastCreatedRecordId);if(cr)return cr;}
    throw new Error('record_not_found');
  }
  ns.createTools=function(){return [
    {name:'create_record',describe:'创建记录',validate:function(a){return !!String(a&&a.text||a&&a.title||'').trim();},execute:async function(a,ctx){
      var text=a.text||a.title||'';var sourceText=a.sourceText||text;var parsed=null;
      if(window.ShikeSpriteCreateIntent){
        parsed=window.ShikeSpriteCreateIntent.extract(sourceText);
      }
      if(!parsed){
        try{parsed=parseReminderText(text);}catch(e){parsed=null;}
      }
      if(!parsed){
        parsed={title:String(text).trim().substring(0,30),recordKind:a.recordKind||'note',dateKey:a.dateKey||null,timeText:a.timeText||null,isAllDay:a.isAllDay!==false,sourceText:sourceText};
      }
      if(a.dateKey)parsed.dateKey=a.dateKey;
      if(a.timeText)parsed.timeText=a.timeText;
      if(a.temporalPhrase)parsed.temporalPhrase=a.temporalPhrase;
      if(a.title)parsed.title=a.title;
      var saved=saveParsedRecord(parsed,sourceText);
      if(!saved)throw new Error('records_write_failed');
      if(window.ShikeLocalFirst){
        try{await window.ShikeLocalFirst.persist(records);}
        catch(error){
          records=records.filter(function(record){return record.id!==saved.id;});
          saveRecords();
          throw new Error('records_write_failed');
        }
      }
      if(ns.sessionContext)ns.sessionContext.setLastCreated(saved);
      renderCurrent();
      return {message:'已帮你记住：'+(parsed.title||text),record:saved};
    }},
    {name:'edit_record',describe:'编辑记录',validate:function(a){return !!(a&&a.id&&a.patch);},execute:function(a){var record=findById(a.id);if(!record)throw new Error('record_not_found');Object.assign(record,a.patch,{updatedAt:Date.now()});saveRecords();renderCurrent();return {message:'记录已更新'};}},
    {name:'delete_record',describe:'删除记录',validate:function(a){return !!(a&&(a.recordId||a.query));},execute:function(a){
      var record=resolveRecord(a);
      if(!record)throw new Error('record_not_found');
      records=records.filter(function(item){return item.id!==record.id;});
      saveRecords();renderCurrent();
      if(ns.sessionContext)ns.sessionContext.setLastReferenced(null);
      return {message:'记录已删除',title:record.title};
    }},
    {name:'pin_record',describe:'置顶记录',validate:function(a){return true;},execute:function(a){
      var record=resolveRecord(a||{});
      if(!record)throw new Error('record_not_found');
      record.pinned=!record.pinned;
      saveRecords();renderCurrent();
      if(ns.sessionContext)ns.sessionContext.setLastReferenced(record);
      return {message:record.pinned?'记录已置顶':'已取消置顶',title:record.title,pinned:record.pinned};
    }},
    {name:'search_records',describe:'搜索记录',validate:function(a){return !!String(a&&a.query||'').trim();},execute:function(a){var matches=find(a.query);if(ns.sessionContext&&matches.length>0)ns.sessionContext.setLastReferenced(matches[0]);return {message:'找到 '+matches.length+' 条记录',records:matches.map(function(r){return {id:r.id,title:r.title,dateKey:r.dateKey||''};})};}},
    {name:'summarize_today',describe:'查看今天',validate:function(){return true;},execute:function(){var data=getTodayOverviewData();return {message:'今天有 '+((data&&data.today&&data.today.length)||0)+' 条记录',data:data};}},
    {name:'open_page',describe:'打开页面',validate:function(a){return ['home','all','calendar','import','my'].includes(a&&a.page);},execute:function(a){switchPage(a.page);return {message:'已打开'+a.page};}},
    {name:'batch_parse',describe:'批量整理',validate:function(a){return !!String(a&&a.text||'').trim();},execute:function(a){captureBatchFromInput(a.text);return {message:'已生成批量草稿'};}},
    {name:'export_calendar',describe:'导出日历',validate:function(){return true;},execute:function(){exportIcsFile();return {message:'已开始导出日历'};}},
    {name:'export_backup',describe:'备份数据',validate:function(){return true;},execute:function(){exportBackupFile();return {message:'已开始导出备份'};}},
    {name:'change_theme',describe:'切换主题',validate:function(a){return ['paper','night'].includes(a&&a.theme);},execute:function(a){settings.theme=a.theme;saveSettings(settings);applyTheme(a.theme);return {message:'主题已切换'};}},
    {name:'show_release_notes',describe:'查看更新',validate:function(){return true;},execute:function(){showReleaseNotes(true);return {message:'已打开更新说明'};}}
  ];};
})(window.ShikeAgentModules);
