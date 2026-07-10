# Shike v1.3.0 Agent Safety Model

- Empty input, text over 500 characters, script-like input, JavaScript URLs, and trading-advice language are rejected before routing.
- Agent output is inserted with `textContent` only.
- Tool names come only from the fixed registry; user text cannot select arbitrary JavaScript.
- Tool arguments are validated before execution.
- Confirmation tools require the exact pending plan ID as token.
- Delete requires the pending plan ID plus `:double`; a single confirmation token is rejected.
- Cancelling removes the pending plan.
- Conversations remain local in IndexedDB and can be cleared/exported.
- The current implementation explicitly states it uses local rules and does not pretend to be a connected general AI.
- `manage_subscription` is registered for contract continuity but fails honestly until the watch center exists.
