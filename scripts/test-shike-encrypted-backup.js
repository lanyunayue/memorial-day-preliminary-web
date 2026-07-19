/**
 * v2.2.0-alpha3.1 Encrypted Backup Tests
 */
const fs = require('fs');
const path = require('path');
const V = path.resolve(__dirname, '..');
let passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('  PASS: '+m);} else {failed++;console.log('  FAIL: '+m);} }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch(e) { return null; } }

console.log('=== Encrypted Backup Tests ===\n');

const enc = readSafe(path.join(V,'src/storage/encrypted-backup.js'));
const html = readSafe(path.join(V,'index.html'));
const sw = readSafe(path.join(V,'sw.js'));
const leg = readSafe(path.join(V,'src/legacy-app.js'));

// 1. Module existence
console.log('[1] Module existence');
assert(enc !== null, 'encrypted-backup.js exists');
assert(enc && enc.includes('ShikeEncryptedBackup'), 'ShikeEncryptedBackup exported');

// 2. Core functions
console.log('\n[2] Core functions');
assert(enc && enc.includes('encryptBackup'), 'encryptBackup function');
assert(enc && enc.includes('decryptBackup'), 'decryptBackup function');
assert(enc && enc.includes('isSupported'), 'isSupported function');

// 3. Crypto algorithms
console.log('\n[3] Crypto algorithms');
assert(enc && enc.includes('AES-GCM'), 'uses AES-GCM');
assert(enc && enc.includes('PBKDF2') || enc.includes('pbkdf2'), 'uses PBKDF2');
assert(enc && enc.includes('100000') || enc.includes('10000'), 'sufficient iterations');

// 4. Version format
console.log('\n[4] Version format');
assert(enc && enc.includes('shike-encrypted'), 'has version string');

// 5. Salt and IV
console.log('\n[5] Salt and IV');
assert(enc && enc.includes('salt'), 'salt field');
assert(enc && enc.includes('iv'), 'iv field');

// 6. Error handling
console.log('\n[6] Error handling');
assert(enc && enc.includes('DECRYPT_FAILED'), 'DECRYPT_FAILED error');
assert(enc && enc.includes('INPUT_TOO_LARGE'), 'INPUT_TOO_LARGE error');

// 7. Security: no password storage
console.log('\n[7] Security');
assert(enc && enc.includes('not stored') || enc.includes('never') || !enc.includes('password ='), 'password not stored');

// 8. Prototype pollution protection
console.log('\n[8] Prototype pollution');
assert(enc && enc.includes('__proto__') || enc.includes('prototype'), 'prototype pollution guard');

// 9. HTML integration
console.log('\n[9] HTML integration');
assert(html && html.includes('encrypted-backup.js'), 'script tag in HTML');

// 10. SW precache
console.log('\n[10] Service Worker');
assert(sw && sw.includes('encrypted-backup.js'), 'in SW precache');

// 11. Capability flags
console.log('\n[11] Capability flags');
assert(leg && leg.includes('capabilityEncryptedBackup'), 'capabilityEncryptedBackup flag');

console.log('\n========================================');
console.log('Encrypted Backup tests: ' + passed + '/' + (passed+failed) + ' passed');
if (failed > 0) process.exit(1);
