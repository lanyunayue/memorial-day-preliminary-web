# Shike v1.0.0 Stable Deploy Plan

## Preconditions

- Candidate branch: `release-v100-stable`.
- Version: `v1.0.0`.
- Service worker cache: `shike-v100-v46`.
- Stable test `24/24`, full regression `40/40`, and local Edge CDP `11/11` are green.

## Procedure

1. Commit the candidate on `release-v100-stable`.
2. Create rollback tag `shike-web-stable-before-v100-stable` at the current stable `main`.
3. Fast-forward `main` to the candidate.
4. Push `main` and the rollback tag without force.
5. Verify the official root and `sw.js` return HTTP 200 with the expected version/cache.
6. Run Edge CDP against the official URL.
7. Write and commit the deployment report.

## Rollback

If the online gate fails, redeploy the commit referenced by `shike-web-stable-before-v100-stable` and stop the Omega program before v1.1.0.
