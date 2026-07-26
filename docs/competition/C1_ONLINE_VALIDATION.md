# C1 Online Validation Report

## Deployment Information
- **Deployment Commit**: b755719 (main branch)
- **Deployment Time**: 2026-07-27
- **Public Base URL**: https://lanyunayue.github.io/memorial-day-preliminary-web/

## Validation Environment
- **Browser**: Chromium (Playwright incognito)
- **Resolution**: 1920x1080
- **Loading Duration**: 156.2s
- **Cache Version**: shike-c1-v42
- **Bundle Hash**: CxyTTDck

## Test Results
| Step | Result |
|------|--------|
| Entry page loaded | PASS |
| Demo button clicked | PASS |
| Valley navigation | PARTIAL |
| Game to FREE_PLAY | not_ready |
| DeLoad open | SKIP |
| Action performed | False |
| Return to web | PARTIAL |
| Feedback visible | True |

## URL Status Check
- `/`: ERROR
- `/competition.html`: 200 (15289 bytes)
- `/competition.html?demo=competition`: 200 (15289 bytes)
- `/valley/`: ERROR
- `/valley/index.html`: ERROR
- `/sw.js`: ERROR

## Console Errors/Warnings
```
error: Failed to load resource: the server responded with a status of 404 ()
```

## Network Errors
```
GET https://lanyunayue.github.io/memorial-day-preliminary-web/src/bridge/web-bridge.js - net::ERR_ABORTED
```

## Screenshots
- ONLINE_01_ENTRY.png - Competition entry page
- ONLINE_01b_DEMO_STARTED.png - After clicking demo experience
- ONLINE_02_GAME.png - Game in FREE_PLAY
- ONLINE_03_DELOAD_OPEN.png - DeLoad panel open
- ONLINE_04_SPLIT.png - Action performed
- ONLINE_05_RETURN.png - Return feedback page
