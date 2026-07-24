# C0.1 Operation Log

## Timeline (2026-07-24)

### Phase 1: Baseline Verification
- Confirmed Game repo: `competition/c0-web-game-pilot` at 6538874
- Confirmed Web repo: `competition/c0-game-entry-pilot` at f674cbb
- Both working directories clean initially

### Phase 2: PSM BOOT Root Cause Diagnosis
- Identified BOOT→SPIRIT_GREETING invalid transition in main.js
- Found that competition users had no dedicated state
- Discovered async onTransition handlers not properly caught
- Traced initialization race conditions in boot sequence

### Phase 3: PSM State Machine Fix
- Added `COMPETITION_INTRO` state to PlayerState enum
- Updated allowedTransitions for all states
- Made transition() safely handle async listeners with .catch()
- Fixed new user path: BOOT→OPENING first, then OPENING→SPIRIT_GREETING
- Fixed competition path: BOOT→COMPETITION_INTRO→FREE_PLAY
- Fixed returning user path: BOOT→RETURNING_USER→FREE_PLAY

### Phase 4: Boot Sequence Rewrite
- Added structured [C0-BOOT] logging at every decision point
- Profile loading logs existingSave/existingChronos/handoff flags
- Handoff detection and import with counts (imported/skipped)
- Expected initial state logged before transition
- Transition request logged with isReturningUser/isCompetitionEntry flags
- setTimeout(800ms) for DOM readiness, then single decision point for state transition

### Phase 5: Return Button Stabilization
- Created `syncCompetitionReturnButton()` independent async function
- Checks: isCompetitionEntry || isCompetitionMode() || await hasWebItems()
- Called from onTransition when entering FREE_PLAY with void...catch pattern
- createReturnButton() now idempotent (checks this._returnBtn)
- Button click: disables, writes return payload, navigates safely
- Fallback to ../competition.html if no returnUrl
- Error recovery: still navigates on failure
- Return payload includes ALL web items (not just acted ones) for feedback
- Payload correlation: uses handoff transferId when available

### Phase 6: Loading Screen & Pointer Lock
- Fixed `#loadingScreen.hidden` CSS: added `display: none !important`
- Pointer lock: only requested after user gesture (click/keydown)
- One-time listener removes itself after first gesture
- try/catch around requestPointerLock() to suppress WrongDocumentError

### Phase 7: Web-Side Fixes
- Updated ACTION_LABELS to include 'seen', 'acknowledged', 'dropToday'
- Changed return card title from "归时谷的回响" to "归时谷带回了一次反馈"
- Rebuilt game and copied to valley/

### Phase 8: Testing
- Fixed C0.154 test expectation (../competition.html default URL)
- Added 13 new C0 tests covering PSM transitions and E2E flows
- Total: 166 tests, all passing (was 150)
- Build verified: npm run build succeeds in ~18s
- git diff --check passes on source files

### Phase 9: Browser Validation
- Started http-server on port 8095
- Validated Scenario D (returning user + competition): full Web→Game→Web loop works
- Validated Scenario C (no handoff): BOOT→RETURNING_USER→FREE_PLAY, no errors
- Confirmed return button appears only when competition mode or web items exist
- Confirmed return payload written and web displays feedback
- Confirmed "应用并清除" removes feedback card
- Captured runtime screenshots

### Phase 10: Documentation
- Created C0_RUNTIME_VALIDATION.md
- Created C0_OPERATION_LOG.md (this file)
- Created C0_SCREENSHOT_MANIFEST.md
- Created C0_CONSOLE_LOG.md
- Created C0_KNOWN_ISSUES.md
- Copied 6 key screenshots to docs/competition/c0-runtime-closure/screenshots/

## Key Commands Executed
```powershell
# Game repo
npm test                    # 166 passed
npm run build               # built in 17.81s
git diff --check            # passes on source files

# Web repo
npx http-server -p 8095 -c-1 --cors   # local server for validation
```

## Build Output
- `dist/valley/index.html`: 15.61 kB
- `dist/valley/assets/index-uIHY2S5y.js`: 340.67 kB (game code)
- `dist/valley/assets/babylon-Ciwi-Ey_.js`: 5,241.71 kB (engine)
- Total: ~5.6 MB
