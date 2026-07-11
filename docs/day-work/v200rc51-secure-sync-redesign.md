# v2.0.0-rc5.1 Secure Sync Redesign Document

## Status
NOT IMPLEMENTED - This is a design document only. Sync remains quarantined.

## Threat Model

### Adversaries
1. **Server operator**: Honest-but-curious cloud provider; can see all stored data
2. **Network attacker**: MITM on HTTP (despite HTTPS, endpoint misconfiguration possible)
3. **Compromised device**: Malicious browser extension/XSS on one device
4. **Stolen device**: Offline access to browser storage
5. **Revoked device**: Previously authorized device should lose access

### Assets to protect
- User record content (titles, text, times, dates)
- Device identity keys
- Backup recovery keys
- Operation logs (metadata may reveal activity patterns)

### Not protected against
- Compromised endpoint while sync is actively enabled (client can still be tricked)
- Server serving malicious client code (must be mitigated by SW integrity)
- User-chosen weak passwords for recovery packages

---

## Architecture

### Key Hierarchy
```
User Password (for recovery only)
    |
    v
PBKDF2-SHA512 / Argon2id (600,000+ iterations)
    |
    v
Recovery Key Encryption Key (RKEK) - 256-bit, derived per export
    
Device Identity Key Pair (ED25519 for signing, ECDH P-256 for key exchange)
    - Stored as NON-EXTRACTABLE CryptoKey in IndexedDB
    - Never leaves device as raw material
    - Public key exported as JWK for device pairing
    
Data Encryption Key (DEK) - AES-256-GCM, random per sync group
    - Encrypts all record operations
    - Wrapped individually for each authorized device (KEK wrapping)
    
Device KEK - per device, derived via ECDH + HKDF-SHA256
    - Used to wrap/unwarp the DEK for that device
```

### Storage
1. **Private keys**: IndexedDB, stored as non-extractable `CryptoKey` objects
2. **Wrapped DEKs**: localStorage (can be public, encrypted)
3. **Record ciphertexts**: Outbox/inbox in IndexedDB
4. **Recovery package**: Only generated on explicit user export, encrypted with password-derived key

### Protocols

#### 1. Device Pairing
- Device A displays its public key fingerprint (SHA-256 truncated, 6 words/8 chars)
- Device B scans/enters A's public key
- B performs ECDH with A's public key and B's private key
- Shared secret derived via HKDF-SHA-256(ikm=ECDH_secret, salt="shike-pairing-v1", info=pairing_context)
- B sends its own public key + wrapped DEK to A
- User verifies fingerprint match (TOFU)

#### 2. Operation Encryption
```
AAD = protocol_version || sender_device_id || sequence_number || DEK_id
IV  = crypto.getRandomValues(12 bytes)  // NEVER reuse
ciphertext = AES-GCM-SEAL(DEK, IV, plaintext_operation, AAD)
signature = ED25519-SIGN(sender_signing_key, ciphertext || IV || AAD)
```
- Every operation signed by sending device
- AAD binds ciphertext to context (prevents cross-protocol replay)
- Monotonic sequence number prevents replay within a device stream

#### 3. DEK Rotation on Revocation
- When a device is revoked, remaining devices generate new DEK
- New DEK is wrapped only for remaining authorized devices
- Old ciphertexts remain readable but new DEK encrypts new operations
- Server is instructed to delete the revoked device's wrapped DEK

#### 4. Recovery Package
- Generated ONLY when user explicitly clicks "Export Encrypted Backup"
- Contains: DEK wrapped with RKEK, all wrapped DEKs, device public keys
- Public key in recovery package is VERIFIED to match the stored private key (sign a challenge)
- Uses Argon2id (preferred) or PBKDF2-SHA512 with 600,000+ iterations
- Wrong password → authentication failure (HMAC verification), no decryption

#### 5. Transport Security
- Endpoint MUST use HTTPS (enforced client-side, reject http:// endpoints)
- Client validates endpoint protocol before storing
- Certificate validation relies on browser/WebView PKI

### Migration from Quarantine
1. First launch after sync is re-enabled: show opt-in UI
2. Old quarantined identity (public key only) is discarded
3. New non-extractable identity generated in IndexedDB
4. User must explicitly pair devices (no automatic pairing)
5. No automatic background sync until user enables it

---

## Anti-Patterns to Avoid (from rc5)
1. ❌ Private key stored as extractable JWK in localStorage
2. ❌ Encrypting to self (no multi-device support)
3. ❌ Storing plaintext operations in offline queue
4. ❌ ECDH secret used directly as AES key (no KDF)
5. ❌ No sender authentication (no signatures)
6. ❌ No AAD in AES-GCM
7. ❌ No replay protection
8. ❌ PBKDF2 iterations too low (100K)
9. ❌ Recovery package public key unverified
10. ❌ Endpoint allowed HTTP

## Implementation Checklist (for future development)
- [ ] Non-extractable CryptoKey storage in IndexedDB
- [ ] ED25519 signing key pair
- [ ] ECDH P-256 key exchange key pair
- [ ] HKDF-SHA256 shared secret derivation
- [ ] Random DEK generation
- [ ] AES-GCM with AAD (protocol version + device ID + seq)
- [ ] Per-device DEK wrapping
- [ ] Device pairing flow with fingerprint verification
- [ ] Monotonic sequence numbers per device
- [ ] Replay window (reject operations with seq <= last seen)
- [ ] DEK rotation on device revocation
- [ ] Recovery package generation on explicit export only
- [ ] Argon2id or PBKDF2-SHA512 with 600K+ iterations
- [ ] Public key verification in recovery
- [ ] HTTPS-only endpoint enforcement
- [ ] Offline queue encrypted to self (using temp key)
- [ ] Contract tests with two real devices
- [ ] Independent cryptography review
- [ ] Threat model document signed off

## Service-Side Requirements
- Store only ciphertexts, wrapped DEKs, and device public keys
- Never see DEK or plaintext
- Cannot modify messages without detection (signature verification)
- Cannot forge operations (no signing key)
- Rate-limited to prevent brute-force on PIN/password
