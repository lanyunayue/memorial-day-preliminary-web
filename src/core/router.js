const KNOWN_PAGES=new Set(['home','all','calendar','import','my','review','spirit']);
export function normalizePage(page){return KNOWN_PAGES.has(page)?page:'home';}
export function listPages(){return [...KNOWN_PAGES];}
