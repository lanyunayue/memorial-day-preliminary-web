'use strict';

const analyzer=require('../tools/product-validation/session-analyzer.js');
const report=require('../tools/product-validation/metrics-report.js');
const coder=require('../tools/product-validation/qualitative-coder.js');
function assert(condition,message){if(!condition)throw new Error(message);}
function testExport(){return {schema:'shike-product-validation-export',schemaVersion:1,containsRawUserText:false,remoteAnalytics:false,sessions:[{sessionId:'rs_test_1',participantCode:'TEST-001',startedAt:'2026-07-01T00:00:00.000Z'},{sessionId:'rs_test_2',participantCode:'TEST-001',startedAt:'2026-07-08T00:00:00.000Z'}],events:[{id:'re_test_1',eventType:'first_input',participantCode:'TEST-001',sessionId:'rs_test_1',timestamp:'2026-07-01T00:00:01.000Z',properties:{elapsedMs:1000}}]};}

let checks=0;const fixture=testExport();assert(analyzer.assertExport(fixture)===fixture,'valid automated fixture was rejected');checks++;
const metrics=analyzer.analyze([fixture,fixture]);assert(metrics.participantCount===1&&metrics.sessionCount===2&&metrics.eventCount===1,'study exports were not deduplicated');checks++;
assert(metrics.day2ReturnCount===1&&metrics.day7ReturnCount===1,'real session date return calculation failed');checks++;
assert(metrics.usableDraftRate===null&&report.markdown(metrics).includes('HUMAN PARTICIPANTS REQUIRED'),'unmeasured human outcome was not blocked');checks++;
let rejected=false;try{const unsafe=testExport();unsafe.events[0].properties.rawText='not allowed';analyzer.assertExport(unsafe);}catch(error){rejected=true;}assert(rejected,'forbidden raw text field was accepted');checks++;
const coded=coder.code({participantCode:'TEST-001',sessionId:'rs_test_1',issueCode:'copy_confusion',severity:'high'});assert(coded.humanCoded&&coded.issueCode==='copy_confusion','manual coding contract failed');checks++;
rejected=false;try{coder.code({participantCode:'TEST-001',sessionId:'bad',issueCode:'invented'});}catch(error){rejected=true;}assert(rejected,'invalid qualitative evidence reference was accepted');checks++;
console.log(`Product validation tool tests passed: ${checks}/${checks}`);
