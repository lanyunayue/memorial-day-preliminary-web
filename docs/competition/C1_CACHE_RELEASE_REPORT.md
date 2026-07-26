# C1 Cache Release Report

Generated: 2026-07-27
Deployment: C1 Production Freeze

## Cache Version Change

| Item | Value |
|------|-------|
| Old CACHE_NAME | shike-c0-v41 |
| New CACHE_NAME | shike-c1-v42 |
| Old bundle hash (index) | index-CxyTTDck.js |
| New bundle hash (index) | index-CxyTTDck.js (unchanged) |
| Old bundle hash (babylon) | babylon-Ciwi-Ey_.js |
| New bundle hash (babylon) | babylon-Ciwi-Ey_.js (unchanged) |

## Service Worker Policy

The updated sw.js implements the following caching strategy:

1. **HTML pages and navigation requests (network-first)**:
   - competition.html
   - valley/index.html
   - All navigate-mode requests
   - sw.js itself
   - Strategy: fetch with cache:'no-store', fallback to cache, then fallback to index.html
   - This ensures users always get the latest HTML

2. **Hashed static assets (cache-first)**:
   - valley/assets/index-*.js
   - valley/assets/babylon-*.js
   - valley/assets/flowGraphGLTFDataProvider-*.js
   - valley/assets/processed/**/* (GLB, OBJ, MTL models)
   - Strategy: serve from cache if available, otherwise fetch and cache
   - Since these have content hashes in filenames, they can be safely cached indefinitely

3. **No precaching of large bundles**:
   - Babylon.js bundle (~5.2MB) is NOT precached
   - Assets are cached on first use (runtime cache)
   - This avoids excessive storage usage on first load

4. **Cache cleanup on activate**:
   - Old caches (shike-c0-v41 and earlier) are deleted when new SW activates
   - self.clients.claim() ensures new SW takes control immediately
   - No infinite refresh loops (no location.reload() in fetch handler)

## No-Infinite-Refresh Guarantee

The service worker does NOT call location.reload() or trigger page reloads in the fetch handler. The network-first strategy for HTML uses fetch with cache:'no-store' which always goes to network first; only on network failure does it fall back to cache. This prevents the "always refresh" loop that can occur with cache-first HTML.

## Post-Deployment Cache Validation

After deployment, verify:
1. First visit: sw.js installs, cache shike-c1-v42 is created
2. Second visit: HTML is fetched from network (not served stale)
3. Hard refresh: all assets load correctly
4. Offline: cached pages still work
