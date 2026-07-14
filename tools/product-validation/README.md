# Product Validation Tools

Open `participant-manager.html` locally and import JSON files exported by consenting participants from `?validation=1`.

The manager validates the export schema, rejects forbidden sensitive fields, deduplicates session and event IDs, calculates only metrics supported by imported events, and keeps unavailable human outcomes explicit. It contains no sample participants or generated feedback.

CLI analysis is also available:

```powershell
node tools/product-validation/analyze-files.js <export-1.json> <export-2.json>
```

Do not commit participant exports or browser profiles. Store research files in an access-controlled location outside this repository.
