# Shike v1.1.0 Migration Ledger

| Area | Previous owner | v1.1.0 owner | Runtime status | Rollback |
| --- | --- | --- | --- | --- |
| CSS | Inline `index.html` style block | `assets/styles/app.css` | Active | Restore inline block |
| Version metadata | Inline script | `src/config/version.js` | Active | Restore declarations |
| Stable keys | Inline script | `src/config/constants.js` | Active | Restore declarations |
| Escaping and IDs | Inline utility functions | Classic utility adapters with safe fallback | Active | Fallback remains in compatibility functions |
| Settings/record JSON access | Direct localStorage calls | `ShikeLegacyStorage` adapter | Active | Revert four call sites |
| Existing app runtime | Inline script | `src/legacy-app.js` | Active compatibility layer | Restore external file inline |
| Core/state/router | None | `src/core/*` | Registered foundation | Remove module entry without affecting legacy runtime |
| Repository/migrations | Ad hoc localStorage | `src/storage/*` contracts | Registered foundation | Legacy adapter remains primary |
| Records/parser/calendar | Monolith | Service and adapter boundaries | Registered foundation | Legacy implementations remain authoritative |
| Offline startup | Runtime cache only | Atomic module precache | Active | Roll back service worker cache/tag |

No user data migration occurs in v1.1.0. This release establishes boundaries for the v1.2.0 data migration while preserving every v1.0 storage key and payload.
