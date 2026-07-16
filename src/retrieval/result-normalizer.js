(function(global){
  function text(value,limit){var holder=document.createElement('textarea');holder.innerHTML=String(value||'').replace(/<[^>]*>/g,' ');return holder.value.replace(/\s+/g,' ').trim().slice(0,limit||1200);}
  function url(value){try{var parsed=new URL(value);return /^https?:$/.test(parsed.protocol)?parsed.href:'';}catch(error){return'';}}
  function normalize(item,query){
    if(!item)return null;var cleanUrl=url(item.url);if(!cleanUrl)return null;
    return{id:String(item.id||cleanUrl),title:text(item.title,180)||'公开资料',url:cleanUrl,snippet:text(item.snippet,1400),source:text(item.source,80)||'公开来源',sourceType:text(item.sourceType,40)||'reference',publishedAt:item.publishedAt||null,fetchedAt:item.fetchedAt||new Date().toISOString(),confidence:Number(item.confidence)||0,query:String(query||item.query||'').slice(0,300)};
  }
  global.ShikeResultNormalizer=Object.freeze({normalize:normalize,text:text,safeUrl:url});
})(window);
