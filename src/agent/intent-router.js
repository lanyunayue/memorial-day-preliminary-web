(function(ns){
  function route(text){
    var t=String(text).replace(/[?？!！。.，,\s]+$/g,'').trim();
    var match;
    if(/^(今天有什么|看看今天|今日概览|今天怎么样|今天有啥|今天的事)/.test(t))return {intent:'summarize_today',args:{}};
    if((match=t.match(/^(?:查一下|搜索|找一下|帮我找|查一查|搜一下|找)\s*(.+)$/)))return {intent:'search_records',args:{query:match[1]}};
    if(/^(置顶)$/.test(t)||/^置顶(它|那个|这个|刚才那个)$/.test(t))return {intent:'pin_record',args:{},fromContext:true};
    if((match=t.match(/^把(.+?)置顶$/)))return {intent:'pin_record',args:{query:match[1]}};
    if(/^(删掉|删除|删了)(它|那个|这个|刚才那个)?$/.test(t))return {intent:'delete_record',args:{},fromContext:true};
    if((match=t.match(/^删除(.+)$/)))return {intent:'delete_record',args:{query:match[1]}};
    if(/打开批量整理|批量整理/.test(t))return {intent:'open_page',args:{page:'import'}};
    if(/打开日历|看日历|日历/.test(t))return {intent:'open_page',args:{page:'calendar'}};
    if(/打开关注中心|关注中心|打开关注/.test(t))return {intent:'open_page',args:{page:'watch'}};
    if(/导出日历/.test(t))return {intent:'export_calendar',args:{}};
    if(/备份数据|导出备份/.test(t))return {intent:'export_backup',args:{}};
    if(/切换深色主题|深色主题/.test(t))return {intent:'change_theme',args:{theme:'night'}};
    if(/切换浅色主题|浅色主题|纸张主题/.test(t))return {intent:'change_theme',args:{theme:'paper'}};
    if(/查看更新|更新说明/.test(t))return {intent:'show_release_notes',args:{}};
    if((match=t.match(/^关注(.+)$/)))return {intent:'manage_subscription',args:{keyword:match[1]}};
    if(window.ShikeSpriteCreateIntent){
      var norm=window.ShikeSpriteCreateIntent.normalize(text);
      if(norm.isCreate && norm.cleaned){
        return {intent:'create_record',args:{text:norm.cleaned,sourceText:norm.sourceText,hasTime:norm.hasTime},explicitCreate:true};
      }
    }
    return {intent:'unknown',args:{text:text}};
  }
  ns.intentRouter=Object.freeze({route:route});
})(window.ShikeAgentModules);
