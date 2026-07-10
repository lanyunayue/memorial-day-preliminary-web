export function createLegacyRepository(storage=window.ShikeLegacyStorage){
  return Object.freeze({
    read(key,fallback){return storage.getJson(key,fallback);},
    write(key,value){return storage.setJson(key,value);},
    remove(key){return storage.remove(key);}
  });
}
