(function(global){
  var providers=[];
  function register(provider){
    if(!provider||!provider.id||typeof provider.search!=='function'||typeof provider.supports!=='function')throw new Error('invalid_retrieval_provider');
    if(providers.some(function(item){return item.id===provider.id;}))return false;
    providers.push(Object.freeze(provider));return true;
  }
  function list(){return providers.slice();}
  function select(classification){return providers.filter(function(provider){try{return provider.supports(classification);}catch(error){return false;}});}
  global.ShikeRetrievalProviders=Object.freeze({register:register,list:list,select:select});
})(window);
