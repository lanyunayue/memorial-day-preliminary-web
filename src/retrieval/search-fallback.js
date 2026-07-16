(function(global){
  function links(query){var q=encodeURIComponent(String(query||'').trim());return[
    {id:'bing',title:'在必应搜索',url:'https://www.bing.com/search?q='+q},
    {id:'baidu',title:'在百度搜索',url:'https://www.baidu.com/s?wd='+q},
    {id:'google',title:'在 Google 搜索',url:'https://www.google.com/search?q='+q}
  ];}
  global.ShikeSearchFallback=Object.freeze({links:links});
})(window);
