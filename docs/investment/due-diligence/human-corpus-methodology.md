# Human Corpus Methodology

Current status: **NOT AVAILABLE**. Human-reviewed fixtures added in alpha2: **0**.

The existing 700 fixtures are classified as 600 generated and 100 adversarial in `corpus/temporal-corpus-manifest.json`. They are not evidence of production-language accuracy.

The frozen blind protocol is documented in `corpus/human/README.md`. Input text and expected labels are separated. Each item requires two review rounds, keeps the untouched expression, records disputes, and may accept ambiguity rather than force a unique answer. The evaluator refuses generated or singly reviewed fixtures.

At least 300 genuinely reviewed items remain a release gate for human-language claims.
