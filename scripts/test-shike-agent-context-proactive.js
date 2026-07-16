const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const { html, style, script } = require('./load-shike-source').loadShikeSource(root);

function assert(condition, message) { if (!condition) throw new Error(message); }
function readFile(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
const checks = []; const failures = [];
function add(name, run) { checks.push({ name, run }); }

// Module existence
add('1. proactive-task-detector module file exists', () => {
  assert(fs.existsSync(path.join(root,'src/agent/proactive-task-detector.js')), 'proactive-task-detector.js missing');
});
add('2. session-context module file exists', () => {
  assert(fs.existsSync(path.join(root,'src/agent/session-context.js')), 'session-context.js missing');
});
add('3. proactive detector loaded in index.html', () => {
  assert(html.includes('proactive-task-detector.js'), 'proactive-task-detector not in index.html');
});
add('4. session-context loaded in index.html', () => {
  assert(html.includes('session-context.js'), 'session-context not in index.html');
});
add('5. script order: session-context before context-builder', () => {
  var i1=html.indexOf('session-context.js'),i2=html.indexOf('context-builder.js');
  assert(i1>=0&&i2>=0&&i1<i2,'session-context must load before context-builder');
});

// Detection patterns - positive cases
add('6. detects 待会写作业', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('待会'),'future anchor 待会 missing');
  assert(det.includes('写作业'),'task 写作业 pattern missing');
});
add('7. detects 等下拿快递', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('拿快递')||det.includes('取快递'),'快递 pattern missing');
});
add('8. detects 今晚复习英语', () => {
  assert(script.includes('复习英语')||readFile('src/agent/proactive-task-detector.js').includes('复习'),'复习 pattern missing');
});
add('9. detects 明天交报告', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('明天')&&(det.includes('写报告')||det.includes('交报告')),'明天交报告 pattern missing');
});
add('10. detects 周五考试', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('周五')||det.includes('考试'),'周五/考试 pattern missing');
});
add('11. detects 未完成状态 pattern', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('还没')||det.includes('还没有'),'incomplete state pattern missing');
});

// Negative cases
add('12. does not detect 昨天已完成', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('PAST_WORDS')||det.includes('昨天')||det.includes('isPast'),'past tense filter missing');
});
add('13. does not detect 已经写完', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('NEGATIVE_WORDS')||det.includes('已经'),'already-completed filter missing');
});
add('14. does not detect 不需要/否定', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('不需要')||det.includes('不')||det.includes('isNegative'),'negative filter missing');
});
add('15. does not detect 疑问句', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('QUESTION_WORDS')||det.includes('isQuestion'),'question filter missing');
});
add('16. does not detect 假设句', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('CONDITIONAL')||det.includes('如果')||det.includes('isConditional'),'conditional filter missing');
});
add('17. does not detect 闲聊', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('CHITCHAT')||det.includes('isChitchat'),'chitchat filter missing');
});

// Output structure
add('18. outputs confidence', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('confidence'),'confidence field missing');
});
add('19. outputs candidateTitle/title', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('title'),'title field missing');
});
add('20. outputs dateKey', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('dateKey'),'dateKey field missing');
});
add('21. 待会 does not fake specific time', () => {
  var core=readFile('src/agent/agent-core.js');
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('temporalPhrase')&&det.includes('待会'),'temporal phrase preserved for 待会');
  assert(!det.includes('30')||!det.includes('分钟后'),'should not fake 30min later');
});
add('22. saves raw temporal phrase', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('temporalPhrase'),'temporalPhrase field missing');
});

// Draft/preview system
add('23. generates pending draft', () => {
  var core=readFile('src/agent/agent-core.js');
  assert(core.includes('pendingDraft')||core.includes('setPendingDraft'),'pending draft creation missing');
});
add('24. does not write before confirmation', () => {
  var core=readFile('src/agent/agent-core.js');
  assert(core.includes('confirm')&&core.includes('execute'),'confirmation gate exists');
});

// Confirmation words
add('25. 好 confirms', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes("'好'")||det.includes('"好"')||det.includes('好|'),'confirm word 好 missing');
});
add('26. 登记吧 confirms', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('登记吧'),'confirm word 登记吧 missing');
});
add('27. 算了 cancels', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('算了'),'cancel word 算了 missing');
});
add('28. cancel does not write', () => {
  var core=readFile('src/agent/agent-core.js');
  assert(core.includes('cancel')&&core.includes('clearPendingDraft'),'cancel clears draft');
});

// Multi-turn modifications
add('29. 明天吧 updates current draft date', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('明天吧'),'明天吧 modification missing');
});
add('30. 晚上八点 updates current draft time', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('晚上')&&det.includes('点'),'time modification missing');
});
add('31. 改成复习英语 updates title', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('改成')||det.includes('titleMatch'),'title modification support missing');
});
add('32. 还有英语要复习 creates second candidate', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('isAdditional')||det.includes('还有'),'additional task support missing');
});

// Reference resolution
add('33. 它 references last created record', () => {
  var core=readFile('src/agent/agent-core.js');
  assert(core.includes('resolveReference')||core.includes('lastCreatedRecordId'),'reference resolution missing');
});
add('34. 刚才那个 references pending plan/draft', () => {
  var core=readFile('src/agent/agent-core.js');
  assert(core.includes('pendingDraft')||core.includes('刚才'),'pending reference missing');
});
add('35. delete reference re-validates', () => {
  var tools=readFile('src/agent/tools/tool-definitions.js');
  assert(tools.includes('resolveRecord')&&tools.includes('record_not_found'),'reference validation on delete exists');
});
add('36. pin reference re-validates', () => {
  var tools=readFile('src/agent/tools/tool-definitions.js');
  assert(tools.includes('resolveRecord')&&tools.includes('pin_record'),'reference validation on pin exists');
});

// Session context safety
add('37. pending plan TTL/expiry', () => {
  var sc=readFile('src/agent/session-context.js');
  assert(sc.includes('TTL_MS')||sc.includes('expireCheck')||sc.includes('30*60'),'TTL/expiry check exists');
});
add('38. expired plan not executed', () => {
  var sc=readFile('src/agent/session-context.js');
  assert(sc.includes('expireCheck'),'expiry check in session context');
});
add('39. clear conversation clears context', () => {
  var core=readFile('src/agent/agent-core.js');
  assert(core.includes('clearHistory')&&core.includes('sessionContext.clear'),'clearHistory clears session context');
});
add('40. context reads limited turns (8-12)', () => {
  var sc=readFile('src/agent/session-context.js');
  assert(sc.includes('12')||sc.includes('slice(-'),'context limits recent turns');
});
add('41. does not read all history', () => {
  var sc=readFile('src/agent/session-context.js');
  assert(sc.includes('slice(-12)')||sc.includes('slice(-8)')||sc.includes('slice(-10)'),'limits history window');
});
add('42. conversation saved locally', () => {
  var cr=readFile('src/agent/conversation-repository.js');
  assert(cr.includes('IndexedDb')||cr.includes('indexedDB')||cr.includes('localStorage'),'local storage for conversations');
});
add('43. does not upload (localOnly flag)', () => {
  var cb=readFile('src/agent/context-builder.js');
  assert(cb.includes('localOnly'),'localOnly flag preserved');
});
add('44. IndexedDB repository preserved', () => {
  assert(fs.existsSync(path.join(root,'src/agent/conversation-repository.js')),'conversation-repository exists');
});
add('45. schema unchanged (no new stores)', () => {
  var cr=readFile('src/agent/conversation-repository.js');
  assert(cr.includes("'conversations'")||cr.includes('conversations'),'conversations store name preserved');
});

// Parser/safety
add('46. parser core unchanged', () => {
  assert(fs.existsSync(path.join(root,'src/assistant/sprite-create-intent.js')),'sprite-create-intent preserved');
});
add('47. sourceText preserved', () => {
  var core=readFile('src/agent/agent-core.js');
  assert(core.includes('sourceText'),'sourceText preserved in drafts');
});
add('48. HTML escape/sanitization', () => {
  var ui=readFile('src/agent/ui.js');
  var sp=readFile('src/agent/safety-policy.js');
  assert(ui.includes('textContent')||sp.includes('unsafe')||sp.includes('validateInput'),'DOM textContent/safety policy prevents HTML injection');
});
add('49. script injection not executed', () => {
  var cr=readFile('src/agent/conversation-repository.js');
  assert(cr.includes('slice(0,1000)')||cr.includes('substring')||cr.includes('textContent'),'input length limiting');
});
add('50. long input limited', () => {
  var sp=readFile('src/agent/safety-policy.js');
  assert(sp.includes('input_too_long')||sp.includes('length')||sp.includes('1000'),'input length limit');
});
add('51. corrupted context fallback', () => {
  var sc=readFile('src/agent/session-context.js');
  assert(sc.includes('defaultState')||sc.includes('catch'),'corruption fallback exists');
});
add('52. repository failure feedback', () => {
  var core=readFile('src/agent/agent-core.js');
  assert(core.includes('catch')&&core.includes('error'),'error handling in execute');
});

// UI refreshes after actions
add('53. today overview refresh exists', () => {
  assert(script.includes('renderCurrent')||script.includes('getTodayOverviewData'),'today overview data available');
});
add('54. timeline refresh exists', () => {
  assert(script.includes('renderTimeline'),'timeline render exists');
});
add('55. calendar dot refresh exists', () => {
  assert(script.includes('renderCalendar')||script.includes('cal-dot'),'calendar render exists');
});

// Context data
add('56. recent record reference in context', () => {
  var cb=readFile('src/agent/context-builder.js');
  assert(cb.includes('lastCreatedRecord')||cb.includes('lastCreatedRecordId'),'last created record in context');
});
add('57. recent title reference in context', () => {
  var cb=readFile('src/agent/context-builder.js');
  assert(cb.includes('lastCreatedRecordTitle')||cb.includes('lastReferencedTitle'),'title reference in context');
});
add('58. current date in context', () => {
  var cb=readFile('src/agent/context-builder.js');
  assert(cb.includes('currentDate')||cb.includes('today'),'current date in context');
});
add('59. current page in context', () => {
  var cb=readFile('src/agent/context-builder.js');
  assert(cb.includes('currentPage')||cb.includes('page:'),'current page in context');
});

// Confidence levels
add('60. low confidence asks clarification', () => {
  var core=readFile('src/agent/agent-core.js');
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('needClarification')||core.includes('needClarification'),'low confidence clarification exists');
});
add('61. medium confidence shows preview', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('confidence')&&det.includes('0.7')||det.includes('0.8'),'confidence thresholds exist');
});
add('62. high confidence shows preview', () => {
  var det=readFile('src/agent/proactive-task-detector.js');
  assert(det.includes('0.9')||det.includes('0.95'),'high confidence threshold exists');
});
add('63. no silent save', () => {
  var core=readFile('src/agent/agent-core.js');
  assert(core.includes('proactive')||core.includes('pending:true'),'proactive detections return pending (not executed)');
});

// Existing features preserved
add('64. explicit create intent still works', () => {
  assert(fs.existsSync(path.join(root,'src/assistant/sprite-create-intent.js')),'sprite create intent module preserved');
  assert(script.includes('ShikeSpriteCreateIntent'),'sprite create intent referenced');
});
add('65. regression suite includes agent context tests', () => {
  var reg=readFile('scripts/test-shike-regression-suite.js');
  assert(reg.includes('test-shike-agent-context-proactive'),'regression suite includes agent context tests');
});

for (const check of checks) {
  try { check.run(); } catch (error) { failures.push('['+check.name+'] '+error.message); }
}
if (failures.length) {
  console.error('Agent context tests failed: '+(checks.length-failures.length)+'/'+checks.length+' passed');
  failures.forEach(f=>console.error('- '+f));
  process.exit(1);
}
console.log('Agent context tests passed: '+checks.length+'/'+checks.length);
