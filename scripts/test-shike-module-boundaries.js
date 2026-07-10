const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const legacy=fs.readFileSync(path.join(root,'src','legacy-app.js'),'utf8');
const version=fs.readFileSync(path.join(root,'src','config','version.js'),'utf8');
const constants=fs.readFileSync(path.join(root,'src','config','constants.js'),'utf8');
const app=fs.readFileSync(path.join(root,'src','app.js'),'utf8');
const checks=[];const failures=[];
const add=(name,condition,detail)=>checks.push({name,condition,detail});
const exists=(file)=>fs.existsSync(path.join(root,file));

add('inline style removed',!/<style>[\s\S]*?<\/style>/.test(html));
add('inline app script removed',!/<script>([\s\S]*?)<\/script>/.test(html));
add('external stylesheet linked',html.includes('./assets/styles/app.css'));
add('classic compatibility scripts ordered',html.indexOf('./src/config/version.js')<html.indexOf('./src/legacy-app.js'));
add('module entry linked',html.includes('type="module" src="./src/app.js"'));
add('legacy runtime exists',exists('src/legacy-app.js'));
add('config modules exist',exists('src/config/version.js')&&exists('src/config/constants.js'));
add('core modules exist',exists('src/core/event-bus.js')&&exists('src/core/state.js')&&exists('src/core/router.js'));
add('storage modules exist',exists('src/storage/legacy-storage.js')&&exists('src/storage/repository.js')&&exists('src/storage/migrations.js'));
add('record modules exist',exists('src/records/record-service.js')&&exists('src/records/record-normalizer.js')&&exists('src/records/dedupe.js'));
add('parser adapter exists',exists('src/parser/parser-adapter.js'));
add('calendar modules exist',exists('src/calendar/calendar-service.js')&&exists('src/calendar/ics-export.js'));
add('view and component modules exist',exists('src/views/view-registry.js')&&exists('src/components/legacy-components.js'));
add('version has one owner',(version.match(/var APP_VERSION=/g)||[]).length===1&&!legacy.includes('var APP_VERSION='));
add('storage keys have one owner',constants.includes("STORAGE_KEY='shike_records_v1'")&&!legacy.includes("var STORAGE_KEY="));
add('legacy runtime uses adapters',legacy.includes('ShikeLegacyStorage')&&legacy.includes('ShikeSanitize')&&legacy.includes('ShikeIds'));
add('parser implementation remains in compatibility layer',legacy.includes('function parseReminderText(rawText)'));
add('module entry does not import legacy runtime',!app.includes("import './legacy-app.js'"));

for(const check of checks){if(!check.condition)failures.push(check.name+(check.detail?`: ${check.detail}`:''));}
if(failures.length){console.error(`Module boundary regression failed: ${checks.length-failures.length}/${checks.length} passed`);failures.forEach((failure)=>console.error(`- ${failure}`));process.exit(1);}
console.log(`Module boundary regression passed: ${checks.length}/${checks.length}`);
