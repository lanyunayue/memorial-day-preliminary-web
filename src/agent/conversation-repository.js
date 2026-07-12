(function(ns){
  var fallbackKey='shike_agent_conversations_v1';
  function fallback(){return ShikeLegacyStorage.getJson(fallbackKey,[]);}
  async function list(){
    try{
      return (await ShikeIndexedDb.getAll('conversations')).sort(function(a,b){
        return a.createdAt-b.createdAt;
      });
    }catch(error){
      return fallback();
    }
  }
  async function add(role,text,meta){
    var item={
      id:'msg_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),
      role:role,
      text:String(text||'').slice(0,1000),
      meta:meta||{},
      createdAt:Date.now()
    };
    try{
      await ShikeIndexedDb.put('conversations',item);
    }catch(error){
      var items=fallback();
      items.push(item);
      ShikeLegacyStorage.setJson(fallbackKey,items);
    }
    return item;
  }
  async function clear(){
    try{
      var items=await ShikeIndexedDb.getAll('conversations');
      await Promise.all(items.map(function(item){
        return ShikeIndexedDb.remove('conversations',item.id);
      }));
    }catch(error){
      ShikeLegacyStorage.remove(fallbackKey);
    }
  }
  ns.conversationRepository=Object.freeze({list:list,add:add,clear:clear});
})(window.ShikeAgentModules);
