export async function writeClipboard(text){if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error('clipboard unavailable');await navigator.clipboard.writeText(String(text));}
