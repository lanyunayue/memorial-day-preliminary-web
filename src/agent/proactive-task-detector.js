(function(){
  var ns=window.ShikeAgentModules;
  if(!ns)return;
  function trim(s){return String(s||'').replace(/^[\s?？!！。.，,]+|[\s?？!！。.，,]+$/g,'').trim();}
  function pad2(n){return n<10?'0'+n:''+n;}
  var cnNum={'零':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'半':30};
  function parseCnNum(s){
    if(!s)return null;
    if(/^\d+$/.test(s))return parseInt(s,10);
    if(cnNum[s]!==undefined)return cnNum[s];
    if(s.length===2&&s[0]==='十')return 10+(cnNum[s[1]]||0);
    if(s.length===2&&s[1]==='十')return (cnNum[s[0]]||0)*10;
    if(s.length===3&&s[1]==='十')return (cnNum[s[0]]||0)*10+(cnNum[s[2]]||0);
    return null;
  }
  var FUTURE_WORDS=['待会','呆会','等下','等一会','一会儿','一会','马上','很快','稍后','今天','今晚','今夜','今天晚上','今天下午','今天上午','今天中午','明天','明早','明天早上','明天上午','明天下午','明天晚上','明晚','后天','大后天','周一','周二','周三','周四','周五','周六','周日','星期一','星期二','星期三','星期四','星期五','星期六','星期日','星期天','这周','本周','下周','下星期','这个星期','下个星期','月底','月初','月中','下个月','下月','今年','明年','上午','下午','晚上','中午','早上','凌晨','傍晚','夜里'];
  var NEGATIVE_WORDS=/已经(写|做|交|完成|写完|做完|交完|复习|复习完|考完|结束了|好了|搞定了)|不(用|需要|想|要|必|去|写|做)|不需要|不用了|没有要|没什么要|算了|取消|不记了|不是(要|我)|(我)?(喜欢|爱|讨厌)(写|做|交|复习|考)/;
  var QUESTION_WORDS=/\?|？|吗|呢|什么|怎么|为什么|哪|谁|多少|几|是不是|对不对|有没有|可不可以|能不能|会不会/;
  var CHITCHAT=/你好|哈喽|hello|hi|嗨|在吗|在不在|谢谢|感谢|好的|ok|OK|嗯|哦|哈哈|嘿|早|晚安|早安|晚上好|下午好|早上好|随便说|讲个|说个|笑话|故事|你是谁|你会|介绍一下/;
  var CONDITIONAL=/如果|要是|假如|假设|万一|的话/;
  var PAST_WORDS=/昨天|昨晚|前天|上周|上星期|上个月|去年|曾经|之前|以前|过去|刚|刚刚/;
  var IMPLICIT_TASKS=[
    {re:/作业(还)?(没|未)(写|做|交|完成)?/,title:'写作业',kind:'reminder'},
    {re:/报告(还)?(没|未)(写|做|交|完成)?/,title:'写报告',kind:'reminder'},
    {re:/快递(还)?(没|未)?(拿|取)/,title:'拿快递',kind:'reminder'},
    {re:/(信用卡|花呗|房贷|车贷|钱)(还)?(没|未)?还/,title:'还款',kind:'reminder'},
    {re:/房租(还)?(没|未)?(交|付)/,title:'交房租',kind:'reminder'},
    {re:/(电费|水费|网费|话费)(还)?(没|未)?(交|付)/,title:'交费用',kind:'reminder'},
    {re:/衣服(还)?(没|未)?洗/,title:'洗衣服',kind:'reminder'},
    {re:/电话(还)?(没|未)?(打|给)/,title:'打电话',kind:'reminder'},
    {re:/考试(要|快|就|即将|临近)/,title:'准备考试',kind:'reminder'}
  ];
  var TASK_PATTERNS=[
    {re:/我?(?:待会|等下|一会儿|一会|马上|今晚|明天|后天|明早|晚上)?(?:还|要|得|去|准备)?(写作业|做作业|交作业|写报告|交报告|拿快递|取快递|打电话|复习英语|复习数学|复习语文|复习考试|洗衣服|买牛奶|买东西|还信用卡|交房租|去图书馆|去学校|去公司|开会|早起|起床|改代码|整理|收拾|看医生|去医院|理发|买菜|做饭|接孩子|送孩子|跑步|锻炼|健身|洗澡)/,extract:function(m){return m[1];}},
    {re:/(?:今晚|明天|今天|后天|早上|下午|晚上|凌晨)(?:还|要|得|去)?([\u4e00-\u9fa5]{2,6})/,extract:function(m){return m[1];}},
    {re:/(?:待会|等下|一会儿|一会|马上)(?:还|要|得|去)?([\u4e00-\u9fa5]{2,6})/,extract:function(m){return m[1];}}
  ];
  function hasFutureAnchor(text){
    for(var i=0;i<FUTURE_WORDS.length;i++){if(text.indexOf(FUTURE_WORDS[i])>=0)return FUTURE_WORDS[i];}
    return null;
  }
  function isNegative(text){
    if(NEGATIVE_WORDS.test(text))return true;
    if(text.indexOf('已经')>=0&&/了/.test(text)&&!/还没|还没有|还未/.test(text))return true;
    return false;
  }
  function isQuestion(text){return QUESTION_WORDS.test(text);}
  function isChitchat(text){return CHITCHAT.test(text);}
  function isConditional(text){return CONDITIONAL.test(text);}
  function isPast(text){
    if(PAST_WORDS.test(text)){if(/还没|还没有|还未|还得|还要/.test(text))return false;return true;}
    return false;
  }
  function extractTitle(text){
    var also=text.match(/我?(?:待会|等下|一会儿|一会|马上)?还?有([\u4e00-\u9fa5]{1,6})(?:要|需要|得|去)([\u4e00-\u9fa5]{1,4})/);
    if(also)return also[2]+also[1];
    var xuyao=text.match(/([\u4e00-\u9fa5]{1,6})(?:要|需要|得|应该)([\u4e00-\u9fa5]{1,4})$/);
    if(xuyao&&!/(已经|了|吗|呢|什么|怎么|为什么)/.test(text))return xuyao[2]+xuyao[1];
    for(var i=0;i<TASK_PATTERNS.length;i++){
      var m=text.match(TASK_PATTERNS[i].re);
      if(m){var t=TASK_PATTERNS[i].extract(m);if(t&&t.length>=2)return t;}
    }
    for(var j=0;j<IMPLICIT_TASKS.length;j++){
      var mm=text.match(IMPLICIT_TASKS[j].re);
      if(mm){
        var idx=text.indexOf(mm[0])+mm[0].length;
        var after=text.slice(idx,idx+1);
        if(after==='要'||after==='得')continue;
        return IMPLICIT_TASKS[j].title;
      }
    }
    return null;
  }
  function extractTime(text){
    var res={dateKey:null,timeText:null,temporalPhrase:null};
    var today=new Date();
    function dk(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
    var tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);
    var dayAfter=new Date(today);dayAfter.setDate(today.getDate()+2);
    if(/明天|明早|明晚/.test(text)){res.dateKey=dk(tomorrow);res.temporalPhrase='明天';}
    else if(/后天/.test(text)){res.dateKey=dk(dayAfter);res.temporalPhrase='后天';}
    else if(/今天|今晚|待会|等下|一会儿|一会|马上/.test(text)){
      res.dateKey=dk(today);
      if(/待会|等下|一会儿|一会|马上/.test(text))res.temporalPhrase='待会';
      else if(/今晚|今天晚上/.test(text))res.temporalPhrase='今晚';
      else res.temporalPhrase='今天';
    }else{
      var weekDays={'周一':1,'周二':2,'周三':3,'周四':4,'周五':5,'周六':6,'周日':0,'星期一':1,'星期二':2,'星期三':3,'星期四':4,'星期五':5,'星期六':6,'星期日':0,'星期天':0};
      for(var wd in weekDays){
        if(text.indexOf(wd)>=0){
          var td=weekDays[wd],cd=today.getDay(),df=(td-cd+7)%7;
          if(df===0)df=7;
          var d=new Date(today);d.setDate(today.getDate()+df);
          res.dateKey=dk(d);res.temporalPhrase=wd;break;
        }
      }
    }
    if(/月底/.test(text)){var eom=new Date(today.getFullYear(),today.getMonth()+1,0);res.dateKey=dk(eom);res.temporalPhrase=res.temporalPhrase||'月底';}
    var timeRegex=/(上午|下午|晚上|中午|早上|凌晨|傍晚)?([\d一二两三四五六七八九十]+)[点:：]([\d一二三四五六七八九十半]{0,2})/;
    var tm=text.match(timeRegex);
    if(tm){
      var h=parseCnNum(tm[2]);if(h===null)h=parseInt(tm[2],10)||0;
      var mi=tm[3]?parseCnNum(tm[3]):0;if(mi===null)mi=0;
      var p=tm[1]||'';
      if(/下午|晚上|傍晚/.test(p)&&h<12)h+=12;
      if(/凌晨/.test(p)&&h===12)h=0;
      if(!p&&/晚/.test(text)&&h<12)h+=12;
      res.timeText=pad2(h)+':'+pad2(mi);
      if(!res.temporalPhrase)res.temporalPhrase=tm[0];
    }
    return res;
  }
  ns.proactiveTaskDetector={
    detect:function(inputText,context){
      var text=trim(inputText);
      if(!text)return{isTask:false,confidence:0};
      context=context||{};
      var result={isTask:false,confidence:0,title:null,dateKey:null,timeText:null,temporalPhrase:null,needClarification:false,reason:''};
      if(isQuestion(text)){result.reason='question';return result;}
      if(isChitchat(text)){result.reason='chitchat';return result;}
      if(isConditional(text)&&!/(要|必须|得|需要)/.test(text)){result.reason='conditional';return result;}
      if(isPast(text)&&!/(还没|还没有|还未)/.test(text)){result.reason='past_tense';return result;}
      if(isNegative(text)&&!/(还没|还没有|还未|还有)/.test(text)){result.reason='negative';return result;}
      if(/^(今天|明天|这周|本周|现在)(有什么|怎么样|啥|有啥|什么事|什么安排|什么计划|的事|的安排|的计划)/.test(text)){result.reason='query';return result;}
      if(/^(查|搜索|找|看|打开|浏览)/.test(text)&&!/(记|登记|写|做|交)/.test(text)){result.reason='navigation';return result;}
      if(/已经(写|做|交|完成|复习|考完|结束|搞定|好了)/.test(text)){result.reason='completed';return result;}
      var futureAnchor=hasFutureAnchor(text);
      var title=extractTitle(text);
      var alsoPattern=text.match(/^还有([\u4e00-\u9fa5]{1,6})(?:要|需要|得)([\u4e00-\u9fa5]{1,4})/);
      if(title){
        var time=extractTime(text);
        result.isTask=true;
        result.title=title;
        result.dateKey=time.dateKey;
        result.timeText=time.timeText;
        result.temporalPhrase=time.temporalPhrase;
        if(futureAnchor&&/[\u4e00-\u9fa5]/.test(title)){result.confidence=0.9;}
        else if(/还没|还没有|还未/.test(text)){result.confidence=0.8;}
        else if(futureAnchor){result.confidence=0.7;}
        else{result.confidence=0.5;result.needClarification=true;}
        if(/待会|等下|一会儿|一会|马上/.test(text)&&!result.timeText){
          result.timeText=null;result.temporalPhrase='待会';
          result.dateKey=time.dateKey||(function(){var d=new Date();return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());})();
        }
        if(alsoPattern){result.confidence=Math.max(result.confidence,0.8);result.isAdditional=true;}
      }
      return result;
    },
    detectModifyDraft:function(text,draft){
      text=trim(text);
      if(!draft)return null;
      if(/^(取消|算了|不记了|不用了|删掉|删掉草稿|不要了)$/.test(text))return{cancel:true};
      if(/^(好|是|确认|对|登记吧|记下来|保存|可以|就这样|行|ok|OK|好的|嗯|是的)$/.test(text)||/^(确认|登记|记下来|保存|好的|可以)$/.test(text))return{confirm:true};
      var dateKeywords=/明天吧|明天再说|今天吧|今晚|后天|明早|明晚|下午|上午|早上|晚上|凌晨|中午/;
      var timeRegex=/(上午|下午|晚上|中午|早上|凌晨|傍晚)?([\d一二两三四五六七八九十]+)[点:：]([\d一二三四五六七八九十半]{0,2})/;
      var startsModify=/^(改成|换成|改为|改到|调到|时间改成|时间改为|标题改成)/.test(text);
      var isTime=timeRegex.test(text)||/明天|后天|大后天|今天|今晚|周[一二三四五六日天]|星期[一二三四五六日天]|下个月|下周|周末/.test(text)||dateKeywords.test(text);
      if(startsModify||isTime){
        var mod={modified:false,patch:{}};
        var time=extractTime(text);
        if(time.dateKey){mod.patch.dateKey=time.dateKey;mod.modified=true;}
        if(time.timeText){mod.patch.timeText=time.timeText;mod.modified=true;}
        if(time.temporalPhrase){mod.patch.temporalPhrase=time.temporalPhrase;mod.modified=true;}
        if(/明天吧/.test(text)&&!mod.patch.dateKey){
          var d=new Date();d.setDate(d.getDate()+1);
          mod.patch.dateKey=d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
          mod.patch.temporalPhrase='明天';mod.modified=true;
        }
        var tm=text.match(timeRegex);
        if(tm){
          var h=parseCnNum(tm[2]);if(h===null)h=parseInt(tm[2],10)||0;
          var mi=tm[3]?parseCnNum(tm[3]):0;if(mi===null)mi=0;
          var p=tm[1]||'';
          if(/下午|晚上|傍晚/.test(p)&&h<12)h+=12;
          if(/凌晨/.test(p)&&h===12)h=0;
          if(!p&&/晚/.test(text)&&h<12)h+=12;
          mod.patch.timeText=pad2(h)+':'+pad2(mi);
          if(!mod.patch.temporalPhrase)mod.patch.temporalPhrase=tm[0];
          mod.modified=true;
        }
        var titleMatch=text.match(/^(?:改成|换成|标题改成|改为|叫)(.+)$/);
        if(titleMatch){
          var newTitle=titleMatch[1].replace(/吧$|呢$|啊$/,'').trim();
          if(newTitle.length>=2){mod.patch.title=newTitle;mod.modified=true;}
        }
        return mod.modified?mod:null;
      }
      var alsoMatch=text.match(/^还有([\u4e00-\u9fa5]{1,6})(?:要|需要|得)([\u4e00-\u9fa5]{1,4})/);
      if(alsoMatch)return{additional:true,title:alsoMatch[2]+alsoMatch[1]};
      return null;
    }
  };
})();
