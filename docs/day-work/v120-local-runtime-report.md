# Shike v1.2.0 Local Runtime Report

- Static URL: `http://127.0.0.1:8090/index.html`.
- Browser: isolated Microsoft Edge headless profiles.
- Fresh old-user profile was preloaded before document execution with two `shike_records_v1` records.
- Startup migrated both records to `shike_local_db`, wrote the marker and pre-migration snapshot, and rendered two records.
- A third record saved through the existing UI path appeared in IndexedDB and localStorage mirror.
- A malformed record was excluded from primary records and retained in quarantine.
- Standard views/viewports passed `11/11`; offline restart passed `3/3`.
