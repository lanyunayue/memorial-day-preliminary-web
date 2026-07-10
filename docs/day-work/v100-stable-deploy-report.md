# Shike v1.0.0 Stable Deploy Report

Deployed: 2026-07-10 +08:00

## Release Identity

- Candidate commit: `b33694e4c3a005dda225a4a5bb5317085c035824`.
- Branch: `release-v100-stable`.
- Rollback tag: `shike-web-stable-before-v100-stable`.
- Version: `v1.0.0`.
- Service worker cache: `shike-v100-v46`.

## Verification

- Stable test: `24/24` passed.
- Full regression suite: `40/40` test scripts passed.
- Local Edge CDP: `11/11` passed.
- Official root returned HTTP `200` and declared `v1.0.0`.
- Official `sw.js` returned HTTP `200` and declared `shike-v100-v46`.
- Online Edge CDP: `11/11` passed in a clean browser session.

## Safety

- `main` was fast-forwarded without force.
- `gh-pages` was not manually modified.
- `E:\lifetime` was not modified.
- Record schema and parser were not modified.
- No rollback was required.
- No NLP numeric result is claimed because the repository does not contain a usable `test-shike-nlp-parser.js`.

v1.0.0 passed the deployment gate. The next permitted stage is v1.1.0 modular architecture.
