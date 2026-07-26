# C0 Known Issues

## Blocking Issues (Preventing READY_FOR_ONLINE_DEPLOYMENT_REVIEW)
None. The core Web→Game→Web flow works end-to-end.

## Non-Blocking Issues

### 1. Pointer Lock WrongDocumentError (Low)
- **Severity**: Low (cosmetic console error)
- **Frequency**: Once per page load, before first user interaction
- **Impact**: None on gameplay; pointer lock works after first click/keydown
- **Root cause**: canvas.requestPointerLock() called before document has focus
- **Mitigation**: Already wrapped in try/catch; only requested after user gesture listener fires
- **Fix status**: Partially mitigated; residual error from initial boot is harmless

### 2. Real Tree Instances = 0 (Medium, Pre-existing)
- **Severity**: Medium (visual quality)
- **Frequency**: Always
- **Impact**: Trees may not render as real GLTF instances; thin instances used instead
- **Root cause**: GLB loading path or instance creation in SceneBuilder
- **Fix status**: Pre-existing G1 issue, not C0-related; does not block C0 delivery

### 3. Screenshot Coverage Incomplete (Medium)
- **Severity**: Medium (documentation gap)
- **Missing**: 6 of 12 required screenshots (木牌、誓约灯、纸舟 closeups, DeLoad before/after, handoff写入 toast)
- **Root cause**: Browser automation cannot reliably perform 3D gameplay interactions (WASD movement, E-key interaction with 3D objects)
- **Fix status**: Can be captured during manual recording session

### 4. Screen Recording Not Generated (Medium)
- **Severity**: Medium (delivery asset missing)
- **Status**: NOT_GENERATED_TOOL_LIMITATION
- **Root cause**: No screen recording capability in current toolchain
- **Impact**: Raw footage for video editing phase not available from this session
- **Fix status**: Must be recorded manually

### 5. Trailing Whitespace in Build Output (Low)
- **Severity**: Very low (code quality)
- **Location**: valley/index.html (vite build output) and 2 source files
- **Impact**: None; git diff --check warns but builds work correctly
- **Fix status**: Source files are mostly clean; build output trailing whitespace is from vite

### 6. New User Scenario (Scenario A) Validated via Code Path, Not Fresh Profile
- **Severity**: Low
- **Description**: Fresh-profile new-user path was verified via code inspection and tests; browser validation used existing profile (which tests Scenario D instead)
- **Root cause**: Browser automation cannot clear IndexedDB due to security restrictions
- **Evidence**: Tests C0-PSM-01 and C0-PSM-07 verify BOOT→OPENING→SPIRIT_GREETING path; console log pattern is correct
- **Fix status**: Can be verified manually with incognito mode

## Resolved Issues
- PSM stuck in BOOT: FIXED
- Return button not appearing: FIXED
- Return button duplicated: FIXED
- Loading screen blocking interaction: FIXED
- Return payload not written on button click: FIXED
- Web feedback not showing return actions: FIXED
- Async transition handlers throwing uncaught errors: FIXED
- Invalid BOOT→SPIRIT_GREETING transition: FIXED
- Handoff re-import on refresh: FIXED (consumed flag + sourceRecordId dedup)
- Return URL defaulting to '../': FIXED (now '../competition.html')
