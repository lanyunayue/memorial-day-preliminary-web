# C0 Console Log Extracts

## Competition Handoff Path (Scenario D: Returning User + Handoff)

```
[info] BJS - [01:24:22]: Babylon.js v7.54.3 - WebGL2 - Parallel shader compilation
[info] [SceneBuilder] Real tree instances loaded: 0 / 0
[info] [SceneBuilder] Thin instance rocks created: 0
[info] [C0-BOOT] profile loaded, existingSave: true existingChronos: true handoff: true
[info] [C0-BOOT] handoff detected, importing...
[info] [C0-BOOT] imported: 3 skipped: 0
[info] [C0-BOOT] expected initial state: COMPETITION_INTRO -> FREE_PLAY
[info] [C0-BOOT] transition requested: isReturningUser=true isCompetitionEntry=true
[info] [C0-BOOT] transition executing...
[info] [C0-BOOT] -> COMPETITION_INTRO
[info] [PSM] BOOT -> COMPETITION_INTRO
[info] [C0-BOOT] transition completed, state: COMPETITION_INTRO
[info] [PSM] COMPETITION_INTRO -> FREE_PLAY
```

After FREE_PLAY:
```
[info] [C0] Imported: 3 Skipped: 0
```

## No-Handoff Path (Scenario C: Direct Valley Access)

```
[info] BJS - [01:31:13]: Babylon.js v7.54.3 - WebGL2 - Parallel shader compilation
[info] [SceneBuilder] Real tree instances loaded: 0 / 0
[info] [SceneBuilder] Thin instance rocks created: 0
[info] [C0-BOOT] profile loaded, existingSave: true existingChronos: true handoff: false
[info] [C0-BOOT] transition requested: isReturningUser=true isCompetitionEntry=false
[info] [C0-BOOT] transition executing...
[info] [C0-BOOT] -> RETURNING_USER
[info] [PSM] BOOT -> RETURNING_USER
[info] [C0-BOOT] transition completed, state: RETURNING_USER
[info] [PSM] RETURNING_USER -> FREE_PLAY
```

## Return Button Click (Game → Web)

When "返回时刻" is clicked:
```
[GameBridge] Return payload written: 3 actions, transferId: <correlated_id>
[C0] Navigating to: ../competition.html
```

## Web Side After Return

competition.html detects return payload and displays:
- "归时谷带回了一次反馈" heading
- List items with action labels ("已见到", "已安放")
- "应用并清除" button

After clicking "应用并清除":
- Return card disappears
- Payload marked as applied (does not reappear on refresh)

## Errors Observed

1. **WrongDocumentError** (pointer lock, non-blocking):
   ```
   [error] WrongDocumentError: The root document of this element is not valid for pointer lock.
   ```
   Occurs once before first user gesture. After click/keydown, pointer lock is requested correctly. Suppressed with try/catch.

2. **ERR_CONNECTION_REFUSED** (non-blocking):
   ```
   [error] net::ERR_CONNECTION_REFUSED http://localhost:8095/index.html
   ```
   Stray navigation in codebase; does not affect gameplay.

No other errors in the C0 flow.
