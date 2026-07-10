(function(global){
  function escapeHtml(value){
    return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escapeAttribute(value){return escapeHtml(value).replace(/'/g,'&#39;');}
  global.ShikeSanitize=Object.freeze({escapeHtml:escapeHtml,escapeAttribute:escapeAttribute});
})(window);
