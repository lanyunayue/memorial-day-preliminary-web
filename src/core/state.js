export function createState(initialState={}){
  let value=Object.freeze({...initialState});
  const subscribers=new Set();
  return Object.freeze({
    get(){return value;},
    patch(next){value=Object.freeze({...value,...next});subscribers.forEach((fn)=>fn(value));return value;},
    subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn);}
  });
}
