(function(global){
  function getRaw(key){try{return localStorage.getItem(key);}catch(error){return null;}}
  function getJson(key,fallback){
    var raw=getRaw(key);if(!raw)return fallback;
    try{return JSON.parse(raw);}catch(error){return fallback;}
  }
  function setJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(error){return false;}}
  function remove(key){try{localStorage.removeItem(key);return true;}catch(error){return false;}}
  global.ShikeLegacyStorage=Object.freeze({getRaw:getRaw,getJson:getJson,setJson:setJson,remove:remove});
})(window);
