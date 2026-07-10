# Shike v1.3.0 Agent Architecture

The Agent is a transparent local-rule pipeline:

`input -> safety policy -> intent router -> context builder -> planner -> confirmation policy -> executor -> tool -> result formatter -> local conversation repository`

- `namespace.js` owns the single `ShikeAgentModules` namespace.
- `agent-core.js` coordinates plans, pending state, confirmation tokens, execution, cancellation, and history.
- `intent-router.js` recognizes explicit local commands; unknown text is not guessed into an action.
- `planner.js` maps intents to one registered tool and produces a visible plan.
- `confirmation-policy.js` assigns `none`, `confirm`, or `double`.
- `executor.js` validates tool existence and arguments before calling it.
- `conversation-repository.js` stores messages in IndexedDB `conversations`, with localStorage fallback.
- `ui.js` renders with `textContent`; it never injects Agent text as HTML.

The Agent does not call a model API, upload conversations, execute arbitrary code, or claim live network capabilities.
