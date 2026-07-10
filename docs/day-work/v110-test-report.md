# Shike v1.1.0 Test Report

## Automated Results

- `test-shike-module-boundaries.js`: `18/18` passed.
- `test-shike-import-graph.js`: `12/12` passed.
- `test-shike-offline-assets.js`: `10/10` passed.
- `test-shike-regression-suite.js`: `43/43` scripts passed.
- `test-shike-runtime-cdp.js`: `11/11` passed.
- `test-shike-offline-runtime-cdp.js`: `3/3` passed in a clean Edge profile.

## Parser Compatibility

The `parseReminderText` source section from v1.0.0 and v1.1.0 has equal normalized length (`10,320` characters) and identical content. Parser behavior was also exercised by existing parse preview, reminder, batch, `.ics`, and VM regressions. There is no standalone NLP parser suite in this repository, so no NLP numeric result is claimed.
