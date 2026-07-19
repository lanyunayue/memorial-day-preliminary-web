# Open Source Adoption Record

## v2.3.0-alpha2

This document records how each open-source project's patterns were adapted
into the 时刻 web application.

## 1. Super Productivity — Today Information Priority
- **Repository:** johannesjo/super-productivity (MIT)
- **Adopted Pattern:** Next Action highlighted above full task list; load
  indicators serve actionable decisions; Today page does not stack all history.
- **Landing Path:** `src/legacy-app.js` → `updatePlayfulHeader()`,
  `renderHome()` now prioritizes Next Best Action above Load Board metrics.
- **Status:** ✅ LANDED

## 2. Memos — Quick Capture and Review Timeline
- **Repository:** usememos/memos (MIT)
- **Adopted Pattern:** Input is the most natural first interaction; type
  chips are lightweight hints not blocking input; Review uses timeline flow.
- **Landing Path:** `index.html` Quick Capture section;
  `src/legacy-app.js` → `wireUpPlayfulCapture()`, `renderReview()`.
- **Status:** ✅ LANDED

## 3. Dayflow — Day/Week Review Structure
- **Repository:** JerryZLiu/Dayflow (MIT)
- **Adopted Pattern:** Today overview, overdue, waiting, tomorrow load,
  completion status, and natural language summary card structure.
- **Landing Path:** `src/legacy-app.js` → `renderReview()`.
- **Status:** ✅ LANDED

## 4. Tududi — All Page and Desktop Hierarchy
- **Repository:** chrisvel/tududi (ISC)
- **Adopted Pattern:** Task/Note/Memorial/Habit distinction; desktop
  two-column layout with filter sidebar.
- **Landing Path:** `index.html` All page; CSS desktop layout
  `@media (min-width: 900px)`.
- **Status:** ✅ LANDED

## 5. Neo-Brutalism UI Library — Core Component Craft
- **Repository:** marieooq/neo-brutalism-ui-library (MIT)
- **Adopted Pattern:** Hard shadow press state on buttons; 2px border;
  candy button hover/active transform.
- **Landing Path:** `assets/styles/playful-geometric.css` → `.candy-btn`,
  `.sticker-card`, `.deload-entry`.
- **Status:** ✅ LANDED

## 6. WeUI — Mobile Dialog and Action Sheet Behavior
- **Repository:** Tencent/weui (MIT)
- **Adopted Pattern:** Action Sheet slide-up with overlay; safe-area-inset
  bottom padding; touch target ≥44px; dismiss on overlay tap.
- **Landing Path:** `index.html` DeLoad Action Sheet;
  `assets/styles/playful-geometric.css` → `.action-sheet`, `.dialog-*`.
- **Status:** ✅ LANDED

## 7. Base UI / Radix — Focus Management and ARIA
- **Repository:** mui/base-ui (MIT), radix-ui/primitives (MIT)
- **Adopted Pattern:** Focus-visible outlines; Dialog focus trap; Escape
  to close; Tab cycling within dialog.
- **Landing Path:** `assets/styles/playful-geometric.css` → `:focus-visible`;
  `src/legacy-app.js` → Action Sheet keyboard handlers.
- **Status:** ✅ LANDED

## 8. Uiverse / Magic UI — Micro-animation and Empty State
- **Repository:** uiverse-io/galaxy (MIT), magicuidesign/magicui (MIT)
- **Adopted Pattern:** Staggered entrance animation with delay; Toast
  slide-in; empty state with dashed border icon container.
- **Landing Path:** `assets/styles/playful-geometric.css` →
  `@keyframes slide-up`, `.toast`, `.empty-state`.
- **Status:** ✅ LANDED

## License Compliance Summary
- All directly adapted code is from MIT or ISC licensed projects.
- MPL-2.0 project (ActivityWatch) is reference only, no code copied.
- GPL/AGPL projects were not used as source for any code.
- All attributions retained in `THIRD_PARTY_NOTICES.md`.
