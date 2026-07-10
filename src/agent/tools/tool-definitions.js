(function(ns){
  function find(query){return (window.records||[]).filter(function(record){return String(record.title||'').toLowerCase().includes(String(query||'').toLowerCase());});}
  function requireText(args,key){var value=String(args&&args[key]||'').trim();if(!value)throw new Error('invalid_arguments');return value;}
  ns.createTools=function(){return [
    {name:'create_record',describe:'创建记录',validate:function(a){return !!String(a&&a.text||'').trim();},execute:function(a){var text=requireText(a,'text');var parsed=parseReminderText(text);saveParsedRecord(parsed,text);return {message:'已创建记录',record:parsed};}},
    {name:'edit_record',describe:'编辑记录',validate:function(a){return !!(a&&a.id&&a.patch);},execute:function(a){var record=(records||[]).find(function(item){return item.id===a.id;});if(!record)throw new Error('record_not_found');Object.assign(record,a.patch,{updatedAt:Date.now()});saveRecords();renderCurrent();return {message:'记录已更新'};}},
    {name:'delete_record',describe:'删除记录',validate:function(a){return !!String(a&&a.query||'').trim();},execute:function(a){var matches=find(a.query);if(matches.length!==1)throw new Error(matches.length?'multiple_records':'record_not_found');records=records.filter(function(item){return item.id!==matches[0].id;});saveRecords();renderCurrent();return {message:'记录已删除',title:matches[0].title};}},
    {name:'pin_record',describe:'置顶记录',validate:function(a){return !!String(a&&a.query||'').trim();},execute:function(a){var matches=find(a.query);if(matches.length!==1)throw new Error(matches.length?'multiple_records':'record_not_found');matches[0].pinned=true;saveRecords();renderCurrent();return {message:'记录已置顶',title:matches[0].title};}},
    {name:'search_records',describe:'搜索记录',validate:function(a){return !!String(a&&a.query||'').trim();},execute:function(a){var matches=find(a.query);return {message:'找到 '+matches.length+' 条记录',records:matches.map(function(r){return {id:r.id,title:r.title,dateKey:r.dateKey||''};})};}},
    {name:'summarize_today',describe:'查看今天',validate:function(){return true;},execute:function(){var data=getTodayOverviewData();return {message:'今天有 '+((data&&data.today&&data.today.length)||0)+' 条记录',data:data};}},
    {name:'open_page',describe:'打开页面',validate:function(a){return ['home','all','calendar','import','my'].includes(a&&a.page);},execute:function(a){switchPage(a.page);return {message:'已打开'+a.page};}},
    {name:'batch_parse',describe:'批量整理',validate:function(a){return !!String(a&&a.text||'').trim();},execute:function(a){captureBatchFromInput(a.text);return {message:'已生成批量草稿'};}},
    {name:'export_calendar',describe:'导出日历',validate:function(){return true;},execute:function(){exportIcsFile();return {message:'已开始导出日历'};}},
    {name:'export_backup',describe:'备份数据',validate:function(){return true;},execute:function(){exportBackupFile();return {message:'已开始导出备份'};}},
    {name:'change_theme',describe:'切换主题',validate:function(a){return ['paper','night'].includes(a&&a.theme);},execute:function(a){settings.theme=a.theme;saveSettings(settings);applyTheme(a.theme);return {message:'主题已切换'};}},
    {name:'show_release_notes',describe:'查看更新',validate:function(){return true;},execute:function(){showReleaseNotes(true);return {message:'已打开更新说明'};}},
    {name:'manage_subscription',describe:'新增关注',validate:function(a){return !!String(a&&a.keyword||'').trim();},execute:function(){throw new Error('watch_center_not_available');}}
  ];};
})(window.ShikeAgentModules);
