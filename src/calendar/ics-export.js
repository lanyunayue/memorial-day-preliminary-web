export function buildCalendarWithLegacy(records){
  if(typeof window.buildIcsCalendar!=='function')throw new Error('legacy ICS exporter unavailable');
  return window.buildIcsCalendar(records);
}
