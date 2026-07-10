export function translate(key,vars){
  if(typeof window.tf==='function')return window.tf(key,vars);
  if(typeof window.t==='function')return window.t(key);
  return key;
}
