export function createLegacyComponents(){
  return Object.freeze({
    toast(message,type){return window.showToast(message,type);},
    confirm(...args){return window.showConfirm(...args);},
    releaseNotes(force){return window.showReleaseNotes(force);},
    renderRecord(record){return window.renderRecordCard(record);},
    renderSprite(){return window.renderTimeSprite();}
  });
}
