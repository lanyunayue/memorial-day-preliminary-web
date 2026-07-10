# Shike v1.2.0 Local Data Schema

## Database

- Name: `shike_local_db`.
- IndexedDB version: `2`.
- Record schema version: `2`.

## Object Stores

All stores use `id` as the key path.

| Store | Current use |
| --- | --- |
| `records` | Primary normalized record repository |
| `settings` | Reserved for durable settings; localStorage remains the active settings cache in v1.2.0 |
| `conversations` | Reserved for local Agent conversations |
| `subscriptions` | Reserved for local watch subscriptions |
| `feed_items` | Reserved for cached public feed items |
| `migrations` | Completed migration markers |
| `audit_log` | Migration and record replacement audit entries |
| `quarantined_records` | Invalid records retained for inspection/export |

## Record Shape

Normalized records retain existing fields and add/normalize:

- `id`, `title`, `type`, `recordKind`, `dateKey`, `time`, `timeText`, `repeat`, `note`, `sourceText`, `rawText`, `pinned`.
- `createdAt`, `updatedAt`, `schemaVersion`, `contentFingerprint`, `deletedAt`, `metadata`.
- Existing presentation fields survive because normalization starts from the original record and overlays validated core fields.

`contentFingerprint` and backup `checksum` use deterministic FNV-1a style hashes for accidental-corruption/dedupe signals. They are not cryptographic signatures.
