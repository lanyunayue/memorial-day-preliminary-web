export const REPEAT_VALUES=Object.freeze(['none','daily','weekly','monthly','yearly']);
export function isRepeatValue(value){return REPEAT_VALUES.includes(value);}
