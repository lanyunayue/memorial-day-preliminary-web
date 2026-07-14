'use strict';

const domain=require('../src/intelligence/temporal-domain.js');
const validator=require('../src/intelligence/temporal-validator.js');
const normalizer=require('../src/intelligence/temporal-normalizer.js');
const repositoryModule=require('../src/intelligence/temporal-repository.js');

const checks=[];
function check(name,condition){if(!condition)throw new Error(name);checks.push(name);}

const source='明天把实习材料交给老师';
const draft=domain.createDraft({
  id:'draft_1',type:'commitment',sourceText:source,sourceSpan:{start:0,end:source.length},
  action:'提交实习材料',subject:'我',object:'实习材料',personRefs:['老师'],timeExpression:'明天',
  normalizedTime:normalizer.normalizeTime('明天',{referenceDate:new Date('2026-07-13T08:00:00+08:00')}),
  confidenceBand:'high',explanation:'检测到面向老师的提交承诺',missingFields:[],status:'draft',createdAt:1
});
const validation=validator.validateDraft(draft);
check('draft schema is valid',validation.valid);
check('record schema is not embedded in temporal draft',!Object.prototype.hasOwnProperty.call(draft,'recordKind'));
check('source span is traceable',source.slice(draft.sourceSpan.start,draft.sourceSpan.end)===source);
check('tomorrow normalizes deterministically',draft.normalizedTime.dateKey==='2026-07-14');
check('confidence uses a band',domain.CONFIDENCE_BANDS.includes(draft.confidenceBand));

const nextMonth=normalizer.normalizeTime('下个月妈妈生日',{referenceDate:new Date('2026-07-13T08:00:00+08:00')});
check('month-only expression does not invent a day',nextMonth.precision==='month'&&nextMonth.dateKey==='');
const milestone=normalizer.normalizeTime('毕业后想买车',{referenceDate:new Date('2026-07-13T08:00:00+08:00')});
check('milestone does not invent a deadline',milestone.precision==='milestone'&&milestone.dateKey==='');
const invalid={...draft,confidenceBand:'97%'};
check('fake percentage confidence is rejected',!validator.validateDraft(invalid).valid);

const stores={temporal_drafts:new Map(),temporal_meta:new Map()};
const driver={
  async get(store,id){return stores[store].get(id);},
  async getAll(store){return [...stores[store].values()];},
  async put(store,value){stores[store].set(value.id,JSON.parse(JSON.stringify(value)));return value;},
  async remove(store,id){stores[store].delete(id);return true;}
};

(async()=>{
  const repository=repositoryModule.create(driver);
  await repository.saveDrafts([draft]);
  check('draft persists in sidecar repository',(await repository.listDrafts()).length===1);
  await repository.setStatus(draft.id,'confirmed');
  check('draft status transition persists',(await repository.listDrafts())[0].status==='confirmed');
  await repository.removeDraft(draft.id);
  check('draft removal persists',(await repository.listDrafts()).length===0);
  console.log(`Temporal domain regression passed: ${checks.length}/${checks.length}`);
})().catch((error)=>{console.error(error.stack||error.message);process.exit(1);});
