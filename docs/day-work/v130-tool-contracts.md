# Shike v1.3.0 Agent Tool Contracts

| Tool | Risk | Main arguments | Effect |
| --- | --- | --- | --- |
| `create_record` | confirm | `text` | Parse and create one record |
| `edit_record` | confirm | `id`, `patch` | Update one existing record |
| `delete_record` | double | `query` resolving to exactly one record | Delete one record |
| `pin_record` | confirm | `query` resolving to exactly one record | Pin one record |
| `search_records` | none | `query` | Return local matches |
| `summarize_today` | none | none | Return local Today summary |
| `open_page` | none | allowed page name | Navigate within the app |
| `batch_parse` | confirm | `text` | Create batch drafts |
| `export_calendar` | confirm | none | Start `.ics` export |
| `export_backup` | confirm | none | Start JSON backup export |
| `change_theme` | none | `paper` or `night` | Change local theme |
| `show_release_notes` | none | none | Open update notes |
| `manage_subscription` | confirm | `keyword` | Returns honest unavailable status until v1.4.0 |

Every tool has a validator. Record queries that resolve to zero or multiple destructive targets fail without mutation.
