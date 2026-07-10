export function createEventBus(){
  const listeners=new Map();
  return Object.freeze({
    on(type,listener){const set=listeners.get(type)||new Set();set.add(listener);listeners.set(type,set);return()=>set.delete(listener);},
    emit(type,payload){(listeners.get(type)||[]).forEach((listener)=>listener(payload));},
    clear(type){if(type)listeners.delete(type);else listeners.clear();}
  });
}
