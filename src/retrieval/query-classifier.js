(function(global){
  var LOCAL=/^(打开|切换|导出|备份|删除|删掉|置顶|取消置顶|添加|新建|记录|提醒我|帮我记|看今天|今天有什么|关注)(?!.*(是什么|为什么|怎么|如何|谁|资料|新闻|最新))/;
  var QUESTION=/(是什么|为什么|怎么|如何|谁是|哪些|区别|原理|介绍|资料|百科|新闻|最新|进展|趋势|天气|气温|开源项目|代码|报错|教程|搜索|查一下|了解一下|值得吗|安全吗|何时|多少)/;
  function classify(input){
    var query=String(input||'').replace(/\s+/g,' ').trim().slice(0,300);
    if(!query)return{kind:'unreliable',domain:'none',query:query,reason:'empty'};
    if(LOCAL.test(query))return{kind:'local',domain:'app',query:query,reason:'local-command'};
    var domain='general';
    if(/天气|气温|温度|降雨|下雨|风速/.test(query))domain='weather';
    else if(/GitHub|仓库|repo|repository|开源项目/i.test(query))domain='github';
    else if(/报错|异常|代码|编程|JavaScript|Python|CSS|HTML|API|函数|数据库|算法|框架/i.test(query))domain='technical';
    else if(/是谁|人物|公司|组织|地点|国家|城市/.test(query))domain='entity';
    var sensitive=/诊断|药物|剂量|法律意见|诉讼|股票|买入|卖出|投资建议/.test(query);
    if(QUESTION.test(query)||/[?？]$/.test(query))return{kind:'network',domain:domain,query:query,sensitive:sensitive,reason:'knowledge-question'};
    return{kind:'unreliable',domain:domain,query:query,sensitive:sensitive,reason:'not-enough-signal'};
  }
  global.ShikeQueryClassifier=Object.freeze({classify:classify});
})(window);
