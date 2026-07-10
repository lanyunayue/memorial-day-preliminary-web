export function createMigrationRegistry(){
  const migrations=new Map();
  return Object.freeze({
    register(version,migrate){if(migrations.has(version))throw new Error(`duplicate migration ${version}`);migrations.set(version,migrate);},
    versions(){return [...migrations.keys()].sort((a,b)=>a-b);},
    run(value,fromVersion,toVersion){let current=value;for(const version of [...migrations.keys()].sort((a,b)=>a-b)){if(version>fromVersion&&version<=toVersion)current=migrations.get(version)(current);}return current;}
  });
}
