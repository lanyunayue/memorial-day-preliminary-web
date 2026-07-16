# Browser E2E Results

Real headless Edge 150 local result on 2026-07-13:

- Runtime acceptance: `11/11`
- Chronos vertical workflow: `21/21`
- Two-tab runtime: `10/10`
- Offline runtime: `3/3`
- CDP runner: `4 passed, 0 failed`
- Console errors: `0`
- Network errors: `0`

The vertical path confirms five intent types, delete/restore, Graph and Waiting restoration, backup round trip, cited memory, and no horizontal overflow. The stress runner separately passed one real IndexedDB profile.
