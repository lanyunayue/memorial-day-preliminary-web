(function(global,factory){
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.ShikeMultiIntentSegmenter=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  var MAJOR=/[。！？!?；;\n]/;
  var CONDITIONAL=/^(如果|要是|假如|若是|除非)/;
  function pushSegment(out,source,start,end){
    while(start<end&&/\s/.test(source[start]))start++;
    while(end>start&&/[\s，,。！？!?；;]/.test(source[end-1]))end--;
    if(end<=start)return;
    out.push({text:source.slice(start,end),sourceSpan:{start:start,end:end}});
  }
  function splitCommaPiece(source,start,end,out){
    var text=source.slice(start,end).trim();
    if(CONDITIONAL.test(text)||/(?:毕业后|毕业以后|未来|以后).*[，,]也可能/.test(text)){pushSegment(out,source,start,end);return;}
    var cursor=start;
    for(var index=start;index<end;index++){
      if(source[index]!==','&&source[index]!=='，')continue;
      pushSegment(out,source,cursor,index);
      cursor=index+1;
    }
    pushSegment(out,source,cursor,end);
  }
  function segment(source){
    source=String(source||'').slice(0,10000);
    var out=[];
    var cursor=0;
    for(var index=0;index<source.length;index++){
      if(!MAJOR.test(source[index]))continue;
      splitCommaPiece(source,cursor,index,out);
      cursor=index+1;
    }
    splitCommaPiece(source,cursor,source.length,out);
    return out.filter(function(item){return item.text.length>0;});
  }

  return Object.freeze({segment:segment});
});
