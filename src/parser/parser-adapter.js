export function parseWithLegacyParser(text){
  if(typeof window.parseReminderText!=='function')throw new Error('legacy parser unavailable');
  return window.parseReminderText(text);
}
