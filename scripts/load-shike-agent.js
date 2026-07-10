const fs=require('fs');const path=require('path');const vm=require('vm');
const files=[
  {path:'../assistant/sprite-create-intent.js',dir:''},
  {path:'namespace.js',dir:'agent'},
  {path:'safety-policy.js',dir:'agent'},
  {path:'confirmation-policy.js',dir:'agent'},
  {path:'session-context.js',dir:'agent'},
  {path:'proactive-task-detector.js',dir:'agent'},
  {path:'intent-router.js',dir:'agent'},
  {path:'context-builder.js',dir:'agent'},
  {path:'tool-registry.js',dir:'agent'},
  {path:'tools/tool-definitions.js',dir:'agent'},
  {path:'planner.js',dir:'agent'},
  {path:'executor.js',dir:'agent'},
  {path:'conversation-repository.js',dir:'agent'},
  {path:'result-formatter.js',dir:'agent'},
  {path:'agent-core.js',dir:'agent'}
];
function createAgentSandbox(){const conversations=[];const _store={conversations:conversations};const _localStore={};const calls=[];const sandbox={window:null,console,Date,Math,Map,Set,Promise,records:[],currentPage:'home',LANG:'zh-CN',settings:{theme:'paper'},localStorage:{getItem(k){return Object.prototype.hasOwnProperty.call(_localStore,k)?_localStore[k]:null;},setItem(k,v){_localStore[k]=String(v);},removeItem(k){delete _localStore[k];}},ShikeLegacyStorage:{getJson(){return[];},setJson(){return true;},remove(){return true;}},ShikeIndexedDb:{put(store,item){if(store==='conversations')conversations.push(item);return item;},getAll(store){return store==='conversations'?conversations.slice():[];},remove(store,id){const index=conversations.findIndex((item)=>item.id===id);if(index>=0)conversations.splice(index,1);return true;}},parseReminderText(text){return {id:'parsed_'+Date.now(),title:text,recordKind:'reminder',createdAt:Date.now()};},saveParsedRecord(parsed){sandbox.records.push(parsed);calls.push('create');return parsed;},saveRecords(){calls.push('save');return true;},renderCurrent(){calls.push('render');},getTodayOverviewData(){return {today:sandbox.records.filter((item)=>item.dateKey==='today')};},switchPage(page){sandbox.currentPage=page;calls.push('page:'+page);},captureBatchFromInput(){calls.push('batch');},exportIcsFile(){calls.push('ics');},exportBackupFile(){calls.push('backup');},saveSettings(){calls.push('settings');},applyTheme(theme){sandbox.settings.theme=theme;calls.push('theme');},showReleaseNotes(){calls.push('release');}};sandbox.window=sandbox;const context=vm.createContext(sandbox);const srcRoot=path.resolve(__dirname,'..','src');for(const f of files){const baseDir=f.dir?path.join(srcRoot,f.dir):srcRoot;const filePath=path.resolve(baseDir,f.path.replace(/^\.\.\//g,''));vm.runInContext(fs.readFileSync(filePath,'utf8'),context,{filename:f.path});}return {sandbox,calls,conversations};}
module.exports={createAgentSandbox};
