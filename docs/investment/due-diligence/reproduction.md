# Reproduction

Prerequisites: Node 22 or newer and Edge/Chromium for browser evidence.

```powershell
npm run chronos:verify
```

Core-only evidence:

```powershell
node scripts/chronos-verify.js --core-only
```

Real IndexedDB stress only:

```powershell
npm run test:chronos:stress
```

Without a browser, `chronos:verify` records browser checks as `SKIPPED`; it does not label them PASS. A machine-readable report is written to `artifacts/chronos-alpha2/chronos-verify.json`.
