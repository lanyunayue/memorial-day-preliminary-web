(function(global,factory){
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.ShikeTemporalNormalizer=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  var WEEKDAYS={'日':0,'天':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6};
  function pad(value){return String(value).padStart(2,'0');}
  function dateKey(date){return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate());}
  function startOfDay(value){var date=new Date(value);date.setHours(0,0,0,0);return date;}
  function plusDays(value,days){var date=startOfDay(value);date.setDate(date.getDate()+days);return date;}
  function nextWeekday(reference,weekday,forceNextWeek){
    var current=startOfDay(reference);
    var delta=(weekday-current.getDay()+7)%7;
    if(delta===0)delta=7;
    if(forceNextWeek&&delta<7)delta+=7;
    return plusDays(current,delta);
  }
  function findTime(text){
    var explicit=String(text).match(/([01]?\d|2[0-3])[:：]([0-5]\d)/);
    if(explicit)return pad(Number(explicit[1]))+':'+explicit[2];
    var cn=String(text).match(/(?:上午|早上|下午|晚上|今晚)?([一二两三四五六七八九十\d]{1,3})点(?:半|([一二三四五六七八九十\d]{1,2})分?)?/);
    if(!cn)return '';
    var numbers={'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
    var hour=/^\d+$/.test(cn[1])?Number(cn[1]):numbers[cn[1]];
    if(!Number.isFinite(hour))return '';
    if(/下午|晚上|今晚/.test(cn[0])&&hour<12)hour+=12;
    var minute=cn[0].includes('半')?30:0;
    if(cn[2])minute=/^\d+$/.test(cn[2])?Number(cn[2]):numbers[cn[2]]||0;
    return pad(hour)+':'+pad(minute);
  }
  function normalizeTime(text,options){
    text=String(text||'').trim();
    var reference=startOfDay(options&&options.referenceDate||new Date());
    var timeText=findTime(text);
    var result={source:text,dateKey:'',timeText:timeText,precision:'none',explicit:false};
    if(/今天/.test(text)){result.dateKey=dateKey(reference);result.precision='day';result.explicit=true;return result;}
    if(/明天/.test(text)){result.dateKey=dateKey(plusDays(reference,1));result.precision='day';result.explicit=true;return result;}
    if(/后天/.test(text)){result.dateKey=dateKey(plusDays(reference,2));result.precision='day';result.explicit=true;return result;}
    var weekday=text.match(/(下周|下星期|本周|这周)?(?:周|星期)([一二三四五六日天])/);
    if(weekday){
      result.dateKey=dateKey(nextWeekday(reference,WEEKDAYS[weekday[2]],/^下/.test(weekday[1]||'')));
      result.precision='day';result.explicit=true;return result;
    }
    if(/下个月/.test(text)){
      var month=new Date(reference.getFullYear(),reference.getMonth()+1,1);
      result.year=month.getFullYear();result.month=month.getMonth()+1;result.precision='month';result.explicit=true;
      return result;
    }
    if(/毕业后|以后|将来|未来/.test(text)){result.precision='milestone';result.milestone=(text.match(/毕业后|以后|将来|未来/)||[''])[0];return result;}
    return result;
  }

  return Object.freeze({dateKey:dateKey,findTime:findTime,normalizeTime:normalizeTime});
});
