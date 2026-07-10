import {normalizeRecordShape} from './record-normalizer.js';
export function createRecordService(repository){
  return Object.freeze({normalize:normalizeRecordShape,readAll(){return repository.read('shike_records_v1',[]);},saveAll(records){return repository.write('shike_records_v1',records.map(normalizeRecordShape));}});
}
