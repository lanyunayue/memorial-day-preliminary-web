# C1 Untracked File Audit

Generated: 2026-07-27
Web branch: competition/c0-game-entry-pilot
Baseline HEAD: abb55dcfe497e083750848c388b5d7aeda6b9f0e

## Audit Result

After cleanup of main-branch contamination (src/, scripts/, package.json, assets/, backlog/, corpus/, e2e/, tools/, docs/investment/, docs/program/, docs/research/, docs/visual-craftsmanship/, docs/web-audit/, node_modules/, .github/, eslint/prettier configs, vitest/playwright configs), the remaining untracked files are classified below.

## File Classification

| File | Classification | Action |
|------|---------------|--------|
| clear-storage.html | MUST_COMMIT | Browser storage clearing utility for new-user testing |
| recording-helper.html | SAFE_LOCAL_ONLY | Local recording helper; not deployed |
| docs/competition/c0-runtime-closure/recording/C0_FULL_FLOW_RAW.webm | MUST_COMMIT | C0 full flow raw recording (109s, 1920x1080) |
| docs/competition/c0-runtime-closure/screenshots/01_competition_entry.png | MUST_COMMIT | C0 evidence screenshot |
| docs/competition/c0-runtime-closure/screenshots/03_handoff_generation.png | MUST_COMMIT | C0 evidence screenshot |
| docs/competition/c0-runtime-closure/screenshots/06_task_wood_sign.png | MUST_COMMIT | C0 evidence screenshot |
| docs/competition/c0-runtime-closure/screenshots/07_commitment_lantern.png | MUST_COMMIT | C0 evidence screenshot |
| docs/competition/c0-runtime-closure/screenshots/08_waiting_for_paper_boat.png | MUST_COMMIT | C0 evidence screenshot |
| docs/competition/c0-runtime-closure/screenshots/10_deload_before.png | MUST_COMMIT | C0 evidence screenshot |
| docs/competition/c0-runtime-closure/screenshots/11_deload_after_split.png | MUST_COMMIT | C0 evidence screenshot |
| docs/competition/c0-runtime-closure/screenshots/13_world_fog_change.png | MUST_COMMIT | C0 evidence screenshot |
| docs/competition/c0-runtime-closure/screenshots/15_applied_cleared.png | MUST_COMMIT | C0 evidence screenshot |

## Deleted Contamination (DELETE_BEFORE_DEPLOY)

The following categories of files were present as untracked contamination from the main lifetime-web product branch and have been removed from the working directory:

- src/ (entire main product source tree)
- scripts/ (additional test scripts not in baseline)
- package.json, package-lock.json (npm config for main product)
- assets/ (main product CSS)
- backlog/, corpus/, e2e/, tools/
- docs/investment/, docs/program/, docs/research/, docs/visual-craftsmanship/, docs/web-audit/
- .eslintignore, .prettierignore, eslint.config.js, vitest.config.js, playwright.config.js
- .github/ (CI workflows)
- THIRD_PARTY_NOTICES.md
- artifacts/ (test output artifacts)

## Forbidden Items Check

- [x] No browser User Data
- [x] No Cookies
- [x] No IndexedDB Profile
- [x] No API Keys
- [x] No .env files
- [x] No user real data
- [x] No temporary patches
- [x] No test outputs (artifacts/ deleted)
- [x] No Playwright cache
- [x] No node_modules
- [x] No large unconfirmed video caches

## Final Status

After committing MUST_COMMIT items and removing SAFE_LOCAL_ONLY items, `git status --short` will show no unknown items.
