(function(global){
  function createRecordId(){return 'r_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);}
  global.ShikeIds=Object.freeze({createRecordId:createRecordId});
})(window);
