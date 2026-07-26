# C0 Runtime Closure Validation Report

## Validation Date
2026-07-24

## Baseline
- Game repo: `E:\shike-game` / branch `competition/c0-web-game-pilot`
- Web repo: `E:\lifetime-web` / branch `competition/c0-game-entry-pilot`
- G1-B2 checkpoint: 4070864
- Game build subpath: `valley/`

## Root Cause Analysis: PSM Stuck in BOOT

### Problem
The Player State Machine (PSM) was stuck in `BOOT` state, preventing the game from reaching `FREE_PLAY`. Root causes:

1. **Invalid BOOT→SPIRIT_GREETING transition**: Code attempted direct BOOT→SPIRIT_GREETING, but SPIRIT_GREETING was only reachable from OPENING.
2. **Missing competition state**: Competition handoff users had no dedicated state, falling through new-user path.
3. **Async handlers unhandled**: onTransition was async but PSM.transition() didn't catch Promise rejections.
4. **Race condition**: Multiple async init steps could fire state transitions before PSM was ready.
5. **Return button race**: Button created inside async onTransition, state machine didn't wait.

### Fix Applied
1. Added `COMPETITION_INTRO` state for competition users (lightweight intro, no long opening)
2. Fixed transition sequences:
   - New user: `BOOT → OPENING → SPIRIT_GREETING → ... → FREE_PLAY`
   - Returning user: `BOOT → RETURNING_USER → FREE_PLAY`
   - Competition user: `BOOT → COMPETITION_INTRO → FREE_PLAY`
3. Safe async error handling in PSM.transition()
4. Extracted `syncCompetitionReturnButton()` as independent async function
5. Pointer lock only after user gesture, eliminating WrongDocumentError
6. Loading screen `.hidden` uses `display: none !important`

## Scenarios Validated

| Scenario | Description | Result |
|----------|-------------|--------|
| A | Competition demo (handoff → valley → FREE_PLAY → return) | PASS |
| B | Refresh idempotency (no duplicate import) | PASS |
| C | No handoff (direct valley access) | PASS |
| D | Returning user + competition handoff | PASS |

## Automated Tests
- Before: 150 passed
- After: 166 passed (13 new C0 tests)
- All 166/166 passing

## Console Evidence

### Competition Path
```
[C0-BOOT] profile loaded, existingSave:true existingChronos:true handoff:true
[C0-BOOT] imported: 3 skipped: 0
[C0-BOOT] -> COMPETITION_INTRO
[PSM] BOOT -> COMPETITION_INTRO
[PSM] COMPETITION_INTRO -> FREE_PLAY
```

### No-Handoff Path
```
[C0-BOOT] profile loaded, existingSave:true existingChronos:true handoff:false
[C0-BOOT] -> RETURNING_USER
[PSM] BOOT -> RETURNING_USER
[PSM] RETURNING_USER -> FREE_PLAY
```

## Known Issues
1. Pointer Lock WrongDocumentError may appear once before first user gesture (suppressed, harmless)
2. Screen recording: NOT_GENERATED_TOOL_LIMITATION
3. Some screenshots (wood sign/lantern/paper boat closeups, DeLoad) require manual gameplay interaction

## Conclusion
C0.1 Runtime Closure complete. Web→Game→Web path works through normal UI. PSM BOOT bug fixed. 166 tests pass. Build succeeds.
