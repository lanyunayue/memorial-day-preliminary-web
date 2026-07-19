/**
 * v2.2.0-alpha3.1 Device Identity Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Device Identity Tests ===\n');

const di = readSafe(path.join(V,'src/sync/device-identity.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

console.log('[1] Module existence');
assert(di !== null, 'device-identity.js exists');
assert(di && di.includes('ShikeDeviceIdentity'), 'ShikeDeviceIdentity exported');

console.log('\n[2] Core functions');
assert(di && di.includes('getOrCreateIdentity'), 'getOrCreateIdentity');
assert(di && di.includes('getIdentity'), 'getIdentity');
assert(di && di.includes('rotateKeys'), 'rotateKeys');
assert(di && di.includes('exportRecoveryPackage'), 'exportRecoveryPackage');
assert(di && di.includes('importRecoveryPackage'), 'importRecoveryPackage');
assert(di && di.includes('clearIdentity'), 'clearIdentity');
assert(di && di.includes('getDeviceId'), 'getDeviceId');

console.log('\n[3] Device ID format');
assert(di && di.includes('dev_'), 'dev_ prefix');

console.log('\n[4] Key management');
assert(di && di.includes('publicKey'), 'publicKey field');
assert(di && di.includes('privateKey'), 'privateKey field');
assert(di && di.includes('createdAt'), 'createdAt field');

console.log('\n[5] Crypto');
assert(di && di.includes('AES-GCM') || di.includes('AES_GCM'), 'AES-GCM encryption');
assert(di && di.includes('PBKDF2') || di.includes('pbkdf2'), 'PBKDF2 key derivation');
assert(di && di.includes('100000') || di.includes('10000'), 'sufficient iterations');

console.log('\n[6] Storage');
assert(di && di.includes('shike_device_identity'), 'localStorage key');
assert(di && di.includes('ECDH') || di.includes('RSA'), 'uses asymmetric crypto');

console.log('\n[7] Integration');
assert(html && html.includes('device-identity.js'), 'script tag in HTML');
assert(sw && sw.includes('device-identity.js'), 'in SW precache');
assert(leg && leg.includes('capabilityDeviceIdentity'), 'capability flag');
assert(leg && leg.includes('capabilityV200rc5'), 'rc5 capability flag');

console.log('\n========================================');
console.log('Device Identity tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
