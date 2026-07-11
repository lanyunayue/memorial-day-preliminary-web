const fs=require('fs');
const path=require('path');
const vm=require('vm');
const crypto=require('crypto');

const root=path.resolve(__dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('index.html');
const css=read('assets/styles/app.css');
const sw=read('sw.js');
const legacy=read('src/legacy-app.js');
const files={
  state:read('src/assistant/bear-state-machine.js'),custom:read('src/assistant/sprite-customization.js'),renderer2d:read('src/assistant/sprite-renderer-2d.js'),renderer3d:read('src/assistant/sprite-renderer-3d.js'),audio:read('src/assistant/sprite-audio.js'),
  classifier:read('src/retrieval/query-classifier.js'),registry:read('src/retrieval/provider-registry.js'),engine:read('src/retrieval/retrieval-engine.js'),browserAI:read('src/retrieval/browser-ai.js'),watch:read('src/watch/watch-center.js'),watchStorage:read('src/watch/watch-storage.js')
};
const checks=[];
function add(name,condition){checks.push({name,condition});}
function sha(value){return crypto.createHash('sha256').update(String(value).replace(/\r\n/g,'\n')).digest('hex');}
function extractFunction(source,name){source=String(source).replace(/\r\n/g,'\n');const start=source.indexOf(`function ${name}(`);if(start<0)throw new Error(`missing ${name}`);const open=source.indexOf('{',start);let depth=0,quote=null,escaped=false;for(let i=open;i<source.length;i++){const c=source[i];if(quote){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote=null;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='{')depth++;if(c==='}'&&--depth===0)return source.slice(start,i+1);}throw new Error(`unclosed ${name}`);}

add('version v2.0.0-rc1',read('src/config/version.js').includes("APP_VERSION='v2.0.0-rc1'"));
add('cache v54',sw.includes("CACHE_NAME = 'shike-v200rc1-v55'"));
add('release notes module',html.includes('./src/config/release-notes.js')&&sw.includes('./src/config/release-notes.js'));
['idle','blink','wave','listening','thinking','searching','planning','waiting-confirmation','working','speaking','success','warning','error','sleeping','dragging'].forEach((state)=>add(`state ${state}`,files.state.includes(`${state}:`)||files.state.includes(`'${state}':`)));
add('explicit enter and exit phases',files.state.includes("emit('exit'")&&files.state.includes("emit('enter'"));
add('success auto idle',files.state.includes("success:{label:")&&files.state.includes('idleAfter:1800'));
add('page visibility sleeping',files.state.includes('visibilitychange')&&files.state.includes("transition('sleeping'"));
add('reduced motion state',files.state.includes('prefers-reduced-motion')&&css.includes('@media (prefers-reduced-motion:reduce)'));
add('state has aria labels',files.state.includes("setAttribute('aria-label'"));
add('state failure isolation',files.state.includes('try{fn(payload);}catch'));
add('18 customization fields',Object.keys({name:1,primary:1,secondary:1,eyes:1,expression:1,ears:1,hat:1,glasses:1,scarf:1,badge:1,aura:1,animationIntensity:1,renderer:1,sounds:1,speech:1,voiceURI:1,rate:1,volume:1}).every((key)=>files.custom.includes(`${key}:`)));
add('customization local only',files.custom.includes('localStorage')&&!files.custom.includes('fetch('));
add('2d renderer applies CSS variables',files.renderer2d.includes('--sprite-primary')&&files.renderer2d.includes('--sprite-secondary'));
add('3d is WebGL and delayed',files.renderer3d.includes("getContext('webgl'")&&files.renderer3d.includes("preferences.renderer==='3d'")&&files.renderer3d.includes('setTimeout(start'));
add('3d fallback to 2d',files.renderer3d.includes("update({renderer:'2d'})"));
add('no remote 3d model',!files.renderer3d.includes('fetch(')&&!files.renderer3d.includes('.gltf'));
add('speech defaults opt in',files.custom.includes('speech:false')&&files.audio.includes('SpeechSynthesisUtterance'));
add('audio unlocks after interaction',files.audio.includes("addEventListener('pointerdown',unlock,{once:true"));
['success','reminder','warning','error','confirmation'].forEach((tone)=>add(`tone ${tone}`,files.audio.includes(`${tone}:`)));
add('workbench tabs',html.includes('agentTabChat')&&html.includes('agentTabOverview')&&html.includes('agentTabSettings'));
add('answer source region',html.includes('agentSourceList')&&html.includes('agentAnswerText'));
add('clear conversation and context',html.includes('agentClearBtn')&&html.includes('agentClearContextBtn'));
add('desktop main and rail sizing',css.includes('--desktop-workbench:clamp(320px,26vw,380px)')&&css.includes('max-width:920px'));
add('desktop breakpoint',css.includes('@media (min-width:1100px)'));
add('tablet breakpoint',css.includes('@media (min-width:768px) and (max-width:1099px)'));
add('mobile bottom drawer',css.includes('@media (max-width:767px)')&&css.includes('border-radius:16px 16px 0 0'));
add('pointer capability queries',css.includes('@media (hover:hover) and (pointer:fine)')&&css.includes('@media (hover:none) and (pointer:coarse)'));
add('retrieval classifier separates local',files.classifier.includes("kind:'local'")&&files.classifier.includes("kind:'network'"));
add('retrieval uses timeout and abort',files.engine.includes('AbortController')&&files.engine.includes("error.name==='AbortError'"));
add('retrieval normalizes ranks summarizes caches',files.engine.includes('ShikeResultNormalizer')&&files.engine.includes('ShikeResultRanker')&&files.engine.includes('ShikeExtractiveSummarizer')&&files.engine.includes('ShikeRetrievalCache'));
add('browser AI is opt in',files.browserAI.includes("getItem(KEY)==='true'")&&html.includes('agentAiToggle'));
add('browser AI uses current LanguageModel API',files.browserAI.includes('LanguageModel.availability')&&files.browserAI.includes('LanguageModel.create'));
add('browser AI receives public summaries only',files.browserAI.includes('公开来源摘要')&&!files.browserAI.includes('window.records')&&!files.browserAI.includes('ShikeLocalFirst'));
add('browser AI has rule fallback',files.browserAI.includes('enhanced:false')&&files.engine.includes('ShikeBrowserAI.enhance'));
add('fallback search links',read('src/retrieval/search-fallback.js').includes('bing.com/search')&&read('src/retrieval/search-fallback.js').includes('baidu.com/s')&&read('src/retrieval/search-fallback.js').includes('google.com/search'));
['wikipedia','wikidata','github','stackexchange','open-meteo'].forEach((provider)=>add(`provider ${provider}`,fs.existsSync(path.join(root,'src/retrieval/providers',`${provider}.js`))));
add('wikimedia CORS origin',read('src/retrieval/providers/wikipedia.js').includes('origin=*')&&read('src/retrieval/providers/wikidata.js').includes('origin=*'));
add('Open-Meteo attribution',read('src/retrieval/providers/open-meteo.js').includes('CC BY 4.0'));
add('watch uses live fetch',files.watch.includes('fetch(')&&files.watch.includes('isLive:true'));
add('watch has no simulated seed',!files.watch.includes('FEED_SEED')&&!files.watch.includes('_simulateFetch'));
add('watch RSS protocol validation',files.watch.includes("parsed.protocol!=='http:'")&&files.watch.includes("parsed.protocol!=='https:'"));
add('watch RSS CORS error is honest',files.watch.includes('CORS 或网络策略阻止了直接访问'));
add('watch has no proxy bypass',files.watch.includes('No proxy')&&!files.watch.includes('allorigins'));
add('watch local read and RSS storage',files.watchStorage.includes('WATCH_READ_KEY')&&files.watchStorage.includes('WATCH_FEEDS_KEY'));
add('new modules are precached',['bear-state-machine.js','sprite-customization.js','sprite-renderer-2d.js','sprite-renderer-3d.js','sprite-audio.js','browser-ai.js','retrieval-engine.js'].every((name)=>sw.includes(name)));
add('parser-adapter baseline hash',sha(read('src/parser/parser-adapter.js'))==='efbff968efd518e26970bac24ad35396df8482a32ba56011c6670167d58c4b58');
add('parseReminderText baseline hash',sha(extractFunction(legacy,'parseReminderText'))==='4a628925b331cf3f56e13440cf5af51b49efe4ca24db1e1f8794e03aba394d69');
add('record normalizer baseline hash',sha(read('src/records/record-normalizer.js'))==='5f6bad0d5cc87e36520e39317c338ee819afd9f6c0df641fa4ac66c8f0bd3a8f');
add('storage migration baseline hash',sha(read('src/storage/migrations.js'))==='7d01a2297770f762ac10e3e4a5d8e69a2b4bceaef6156ade829401d054498fec');

const storage={};
const customContext={window:null,localStorage:{getItem:(key)=>storage[key]||null,setItem:(key,value)=>{storage[key]=value;},removeItem:(key)=>{delete storage[key];}}};customContext.window=customContext;
vm.runInNewContext(files.custom,customContext);
const defaults=customContext.ShikeSpriteCustomization.get();
add('custom defaults are safe',defaults.renderer==='2d'&&defaults.speech===false&&defaults.sounds===true&&defaults.volume<=.3);
customContext.ShikeSpriteCustomization.update({name:'测试精灵',renderer:'3d',volume:5});
const changed=customContext.ShikeSpriteCustomization.get();
add('custom preferences persist and clamp',changed.name==='测试精灵'&&changed.renderer==='3d'&&changed.volume===1&&storage.shike_sprite_preferences_v1);

const classifierContext={window:null};classifierContext.window=classifierContext;vm.runInNewContext(files.classifier,classifierContext);
add('classifier local runtime',classifierContext.ShikeQueryClassifier.classify('打开日历').kind==='local');
add('classifier knowledge runtime',classifierContext.ShikeQueryClassifier.classify('什么是 PWA？').kind==='network');
add('classifier weather runtime',classifierContext.ShikeQueryClassifier.classify('北京天气怎么样').domain==='weather');

const failures=checks.filter((check)=>!check.condition);
if(failures.length){console.error(`v1.5 bear workbench regression failed: ${checks.length-failures.length}/${checks.length}`);failures.forEach((failure)=>console.error(`- ${failure.name}`));process.exit(1);}
console.log(`v1.5 bear workbench regression passed: ${checks.length}/${checks.length}`);
