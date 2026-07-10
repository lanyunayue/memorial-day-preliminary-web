export function createTextDownload(filename,content,type='text/plain;charset=utf-8'){
  const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);return Object.freeze({filename,url,revoke(){URL.revokeObjectURL(url);}});
}
