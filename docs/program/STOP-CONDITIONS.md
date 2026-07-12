# STOP CONDITIONS

Stop immediately if any condition appears:

1. A command would require `git reset --hard`, `git clean`, or force push.
2. A change would modify `E:\lifetime-web` or `E:\lifetime-web-v210a1-core-truth` dirty files.
3. Browser tests are skipped but a report would call them passed.
4. Static checks are described as browser E2E.
5. A product deployment is requested before browser/SW/offline evidence.
6. Diff contains unrelated product changes.
7. P0 is found.
8. `APP_VERSION` or `CACHE_NAME` changes without release intent.
9. Program documents are being used to claim completed engineering.
