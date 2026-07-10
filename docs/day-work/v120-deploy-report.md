# Shike v1.2.0 Local-First Data Deploy Report

## Identity

- Candidate commit: `3096180270f5aedb32274e0dc096db8021cf1b6d`.
- Branch: `rematch-v120-local-first-data`.
- Rollback tag: `shike-web-stable-before-v120-local-first-data`.
- Version: `v1.2.0`.
- Cache: `shike-v120-v48`.

## Online Gates

- Version, service worker, data integrity, IndexedDB repository, and local-first bridge files returned HTTP `200`.
- Online standard Edge runtime passed `11/11`.
- Online clean-profile old-localStorage migration passed `10/10`.
- Online service-worker offline restart passed `3/3`.

## Automated Summary

- Full regression: `48/48` scripts.
- IndexedDB repository `12/12`; migration `14/14`; integrity `16/16`; quarantine `10/10`; v2 backup `13/13`.
- Parser source remained identical (`10,320` normalized characters); no parser change was made.
- No standalone NLP script exists, so no NLP numeric result is claimed.

## Safety

- Existing localStorage data was retained and mirrored.
- Migration snapshot and marker were verified online.
- Invalid records were excluded from the primary store and retained in quarantine.
- `main` was fast-forwarded without force.
- `gh-pages` was not manually modified.
- `E:\lifetime` was not modified.
- No rollback was required.

v1.2.0 passed the deployment gate. v1.3.0 Agent Core may begin from this deployed main.
