# Performance Results

Real Edge 150, local IndexedDB, synthetic stress provenance, 2026-07-13. Restored counts: 10,000 Records, 50,000 nodes, 100,000 edges, 10,000 corrections, 5,000 operations.

| Operation | p50 | p95 | p99 |
| --- | ---: | ---: | ---: |
| 10k Record write batch | 154.5 ms | 243.4 ms | 243.4 ms |
| Graph rebuild | 1335.6 ms | 1344.1 ms | 1344.1 ms |
| Next Action, 10k Records | 28.4 ms | 44.0 ms | 44.0 ms |
| Weekly Review | 9.6 ms | 11.9 ms | 11.9 ms |
| Backup export | 1534.5 ms | 1542.5 ms | 1542.5 ms |
| Backup restore batch | 127.2 ms | 192.8 ms | 349.9 ms |
| Point read | 0.2 ms | 1318.5 ms | 1397.3 ms |
| Page startup, 10k Records | 1292 ms | 1292 ms | 1292 ms |

The point-read tail is a known contention spike and is not hidden by the median. Peak measured JS heap use was about 162 MB. IndexedDB usage after write was about 24.2 MB, below the reported 10.7 GB quota. Source: `artifacts/chronos-alpha2/stress/chronos-indexeddb-stress.json`.
