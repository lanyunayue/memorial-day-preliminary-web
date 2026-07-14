'use strict';

const analyzer=require('../tools/product-validation/session-analyzer.js');
const report=require('../tools/product-validation/metrics-report.js');
const coder=require('../tools/product-validation/qualitative-coder.js');
const studyExporter=require('../tools/product-validation/session-exporter.js');
const validationMetrics=require('../src/research/validation-metrics.js');
const fs=require('fs');
const path=require('path');
function assert(condition,message){if(!condition)throw new Error(message);}
function testExport(){const payload={schema:'shike-product-validation-export',schemaVersion:1,exportedAt:'2026-07-08T00:00:01.000Z',containsRawUserText:false,remoteAnalytics:false,sessions:[{sessionId:'rs_test_1',participantCode:'TEST-001',startedAt:'2026-07-01T00:00:00.000Z',persisted:true,validationMode:true,revisit:false},{sessionId:'rs_test_2',participantCode:'TEST-001',startedAt:'2026-07-08T00:00:00.000Z',persisted:true,validationMode:true,revisit:true}],events:[{id:'re_test_1',eventType:'first_input',participantCode:'TEST-001',sessionId:'rs_test_1',timestamp:'2026-07-01T00:00:01.000Z',properties:{elapsedMs:1000}}]};payload.metrics=validationMetrics.summarize(payload.events,payload.sessions);return payload;}
function clone(value){return JSON.parse(JSON.stringify(value));}

let checks=0;const fixture=testExport();assert(analyzer.assertExport(fixture)===fixture,'valid automated fixture was rejected');checks++;
const metrics=analyzer.analyze([fixture,fixture]);assert(metrics.participantCount===1&&metrics.sessionCount===2&&metrics.eventCount===1,'study exports were not deduplicated');checks++;
assert(metrics.day2ReturnCount===1&&metrics.day7ReturnCount===1,'real session date return calculation failed');checks++;
assert(metrics.usableDraftRate===null&&report.markdown(metrics).includes('HUMAN PARTICIPANTS REQUIRED'),'unmeasured human outcome was not blocked');checks++;
let rejected=false;try{const unsafe=testExport();unsafe.events[0].properties.rawText='not allowed';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'forbidden raw text field was accepted');checks++;
rejected=false;try{const unsafe=testExport();unsafe.sessions[0].phone='TEST_VALUE';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'forbidden session PII was accepted');checks++;
rejected=false;try{const unsafe=testExport();unsafe.sessions[0].note='complete private life text';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'unknown session field smuggled private text into evidence');checks++;
rejected=false;try{const unsafe=testExport();unsafe.events[0].note='complete private life text';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'unknown event field smuggled private text into evidence');checks++;
rejected=false;try{const unsafe=testExport();unsafe.studyNote='complete private life text';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'unknown export field smuggled private text into evidence');checks++;
rejected=false;try{const unsafe=testExport();unsafe.remoteAnalytics=true;analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'remote analytics export was accepted');checks++;
rejected=false;try{const unsafe=testExport();unsafe.events[0].sessionId='rs_missing';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'orphan event was accepted');checks++;
rejected=false;try{const unsafe=testExport();unsafe.events[0].participantCode='TEST-002';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'cross-participant event was accepted');checks++;
rejected=false;try{const unsafe=testExport();unsafe.events[0].eventType='unapproved_event';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'unapproved event type was accepted');checks++;
rejected=false;try{const unsafe=testExport();unsafe.events[0].timestamp='2026-06-30T23:59:59.000Z';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'event before session start was accepted');checks++;
rejected=false;try{const unsafe=testExport();unsafe.events[0].timestamp='2026-07-08T00:00:02.000Z';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'event after export time was accepted');checks++;
rejected=false;try{const unsafe=testExport();unsafe.sessions[1].startedAt='2026-07-08T00:00:02.000Z';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'session after export time was accepted');checks++;
rejected=false;try{const unsafe=testExport();unsafe.metrics.eventCount=999;analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'forged export metrics were accepted');checks++;
rejected=false;try{const unsafe=testExport();unsafe.events[0].eventType='feedback_submitted';unsafe.events[0].properties={understandingScore:99,frictionCode:'none'};unsafe.metrics=validationMetrics.summarize(unsafe.events,unsafe.sessions);analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'out-of-range understanding score was accepted');checks++;
rejected=false;try{const changed=clone(fixture);changed.events[0].properties.elapsedMs=2000;analyzer.combine([fixture,changed]);}catch(error){rejected=true;}assert(rejected,'conflicting duplicate event was silently deduplicated');checks++;
const coded=coder.code({participantCode:'TEST-001',sessionId:'rs_test_1',issueCode:'copy_confusion',severity:'high'});assert(coded.humanCoded&&coded.issueCode==='copy_confusion','manual coding contract failed');checks++;
const study=studyExporter.build([fixture],[coded]);assert(study.qualitativeCodes.length===1&&study.sessions.length===2,'valid qualitative evidence was not exported');checks++;
rejected=false;try{const orphan=Object.assign({},coded,{sessionId:'rs_missing'});studyExporter.build([fixture],[orphan]);}catch(error){rejected=true;}assert(rejected,'orphan qualitative evidence was accepted');checks++;
rejected=false;try{coder.code({participantCode:'TEST-001',sessionId:'bad',issueCode:'invented'});}catch(error){rejected=true;}assert(rejected,'invalid qualitative evidence reference was accepted');checks++;
const ignore=fs.readFileSync(path.resolve(__dirname,'..','.gitignore'),'utf8');assert(ignore.includes('shike-research-*.json')&&ignore.includes('participant-exports/'),'participant research files are not ignored by Git');checks++;
console.log(`Product validation tool tests passed: ${checks}/${checks}`);
