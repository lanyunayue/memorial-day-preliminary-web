# Human Corpus And Blind Set Protocol

No fixture in this directory is currently certified as human-reviewed. The existing 700-fixture corpus is generated or adversarial and is classified in `../temporal-corpus-manifest.json`.

Human intake uses two files that are frozen before evaluation:

- `blind-input.jsonl`: `id`, untouched `text`, scenario, provenance, `reviewRounds`, and dispute status. It contains no expected answer.
- `blind-labels.jsonl`: `id` and the accepted `expected` annotation. Development must not read this file before the candidate parser is frozen.

An item may use `provenance: "human-reviewed"` only after two named review rounds. Reviewer identities should be pseudonymous IDs; raw personal data, account identifiers, and private conversations must not be committed. Disputed items remain disputed and may provide accepted alternatives instead of a forced unique label.

Run the frozen evaluation with:

```powershell
node scripts/evaluate-chronos-human-corpus.js --input <blind-input.jsonl> --labels <blind-labels.jsonl> --output <result.json>
```

The evaluator refuses items with fewer than two review rounds and reports precision, recall, F1, type confusion, negation false positives, completed-fact false positives, goal-to-task errors, Waiting For precision, multi-intent exact match, and missing-field honesty.
