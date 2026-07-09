# Shike v1.0.0-rc Final Release Summary

Generated: 2026-07-10 03:58 +08:00

## 1. Version Route

- `v0.9.4`: My page personalization moved forward.
- `v0.9.5`: Time sprite 2.0, white bear assistant, light interaction, quick actions.
- `v0.9.6`: Home cleanup and feature hub.
- `v0.9.7`: Record card action polish.
- `v0.9.8`: Update center and feedback loop.
- `v1.0.0-rc`: Rematch release candidate polish, product positioning, capability checklist, final copy audit.

## 2. Commits And Tags

| Version | Main / deploy commit | Product or candidate commit | Rollback tag |
| --- | --- | --- | --- |
| v0.9.5 | `f8e103292b2d73e085071b640b05b10dd0033619` | `387f64862dca5ab3247119d2dbe661282625fd03` | `shike-web-stable-before-v095-sprite-assistant-2` |
| v0.9.6 | `d8c94d7c232ce1e806165211fc8d11e76c34a849` | `70af39180959b813386d1fe36235edc40e061c99` | `shike-web-stable-before-v096-feature-hub-cleanup` |
| v0.9.7 | `a65f5d77ead4f0ca62fb010f9dc428e334bea45c` | `a2efa719581b98db04b7e623c71c20471b1d76f9` | `shike-web-stable-before-v097-record-actions-polish` |
| v0.9.8 | `db1d4c8234544213a6f66078246230678cd5bc6f` | `d538ce8dfa182555c80f969cb1b3087b02bbae7d` | `shike-web-stable-before-v098-release-feedback-center` |
| v1.0.0-rc | `b908049d9750ba6f8daa8882fb2b05009350541e` | `536c6c45678c702bcb04cba1018381adf6a4b4e1` | `shike-web-stable-before-v100rc-rematch-release` |

## 3. Test Results

- `v0.9.5`: new sprite assistant test `34/34`; regression `35/35`; local and online CDP `11/11`.
- `v0.9.6`: new feature hub cleanup test `22/22`; regression `36/36`; local and online CDP `11/11`.
- `v0.9.7`: new record actions polish test `35/35`; regression `37/37`; local and online CDP `11/11`.
- `v0.9.8`: new release feedback center test `17/17`; regression `38/38`; local and online CDP `11/11`.
- `v1.0.0-rc`: new release candidate test `40/40`; regression `39/39`; local and online CDP `11/11`.

Across the final gates, the scripted sweep had `failed=0` and the same two missing historical script paths:

- `scripts/test-shike-existing-dedupe.js`
- `scripts/test-shike-batch-capture.js`

NLP note: 本轮未改 parser；当前仓库未发现可用 `test-shike-nlp-parser.js`，未声明 NLP 数字结果。

## 4. Online Verification

Current official URL:

```text
https://lanyunayue.github.io/memorial-day-preliminary-web/
```

Current online version:

```text
v1.0.0-rc
```

Current online service worker cache:

```text
shike-v100rc-v45
```

Online Edge CDP passed after the v1.0.0-rc deploy.

## 5. Current State

- Current deployed product commit: `b908049d9750ba6f8daa8882fb2b05009350541e`.
- `E:\lifetime` was not modified.
- `gh-pages` was not manually modified.
- Parser was not changed during this release-candidate line.
- No rollback occurred.
- No v1.0.1 work was started.

## 6. Rollback Path

Preferred rollback target:

```text
shike-web-stable-before-v100rc-rematch-release
```

Rollback command:

```text
git switch main
git reset --hard shike-web-stable-before-v100rc-rematch-release
git push origin main --force-with-lease
```

Earlier rollback tags remain available for each version gate.

## 7. Current Maximum Risk

The product is still a single-page local-first Web app. Browser storage, notification behavior, and PWA cache behavior vary by device and browser, so the most important manual checks before a live demo are: hard refresh, open on the target phone, verify examples, export backup, and confirm the current version in My page.

## 8. Rematch Demo Recommendation

Use this path:

1. Open Home and create one record from a sentence.
2. Use Try examples to populate representative data.
3. Show Today overview and timeline.
4. Show Batch organize and dedupe protection.
5. Show Calendar dot and `.ics` export.
6. Show JSON backup and local data note.
7. Show bear assistant quick actions.
8. Show record card quick actions.
9. Show update center, product positioning, capability checklist, and feedback entry.

## 9. Next Step

Stop at `v1.0.0-rc`. Do not continue automatic development to `v1.0.1` unless the user explicitly starts a new task.
