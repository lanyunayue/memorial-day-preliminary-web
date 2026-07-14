'use strict';

const path=require('path');
const root=path.resolve(__dirname,'..');
function assert(condition,message){if(!condition)throw new Error(message);}
function storageMock(){const data=new Map();return {getItem:(key)=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:(key)=>data.delete(key),clear:()=>data.clear(),size:()=>data.size};}

global.localStorage=storageMock();
global.location={search:'?validation=1'};
const consent=require(path.join(root,'src/research/participant-consent.js'));
const sessions=require(path.join(root,'src/research/research-session.js'));
const eventLog=require(path.join(root,'src/research/local-event-log.js'));
const metrics=require(path.join(root,'src/research/validation-metrics.js'));
const exporter=require(path.join(root,'src/research/feedback-exporter.js'));
const cleaner=require(path.join(root,'src/research/research-data-cleaner.js'));

let checks=0;
assert(sessions.isValidationMode(),'validation mode query was not detected');checks++;
assert(eventLog.track('first_input',{elapsedMs:10})===null,'event was written without consent');checks++;
assert(eventLog.list().length===0,'no-consent log is not empty');checks++;
let rejected=false;try{consent.grant({participantCode:'PT-001',explicitConsent:false});}catch(error){rejected=true;}assert(rejected,'implicit consent was accepted');checks++;
const granted=consent.grant({participantCode:'pt-001',explicitConsent:true});assert(granted.active&&granted.participantCode==='PT-001','explicit consent was not persisted');checks++;
sessions.reset();const first=sessions.start();assert(first.persisted&&!first.revisit,'first consented session is invalid');checks++;
eventLog.track('session_opened',{revisit:false});eventLog.track('first_input',{elapsedMs:1250});eventLog.track('draft_generated',{draftCount:3,rejectedCount:0});eventLog.track('draft_confirmed',{draftType:'commitment'});
assert(eventLog.list().length===4,'allowlisted events were not stored');checks++;
rejected=false;try{eventLog.track('draft_generated',{sourceText:'真实生活原文'});}catch(error){rejected=true;}assert(rejected,'source text property was accepted');checks++;
rejected=false;try{eventLog.track('error',{category:'runtime',code:'包含 私密内容'});}catch(error){rejected=true;}assert(rejected,'unsafe free text was accepted');checks++;
rejected=false;try{eventLog.track('feedback_submitted',{understandingScore:6,frictionCode:'none'});}catch(error){rejected=true;}assert(rejected&&eventLog.list().length===4,'out-of-range feedback score entered the local event log');checks++;
const report=metrics.summarize(eventLog.list(),sessions.list());assert(report.participantCount===1&&report.draftCount===3&&report.confirmedDraftCount===1,'metrics did not aggregate real events');checks++;
assert(report.usableDraftRate===null&&report.day7ReturnCount===null,'human outcome was fabricated');checks++;
const payload=exporter.build();assert(payload.schema==='shike-product-validation-export'&&payload.containsRawUserText===false&&payload.events.length===4,'participant export schema is invalid');checks++;
eventLog.track('consent_withdrawn',{});cleaner.optOut();assert(!consent.status().active,'research opt-out failed');checks++;
assert(eventLog.track('first_input',{elapsedMs:1})===null&&eventLog.list().length===5,'logging continued after opt-out');checks++;
cleaner.clearResearchData({includeConsent:true});assert(eventLog.list().length===0&&sessions.list().length===0&&consent.status().status==='not_granted','research deletion was incomplete');checks++;
console.log(`Product validation research tests passed: ${checks}/${checks}`);
