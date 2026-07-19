# Third Party Notices

This file contains license information for third-party projects whose
patterns, designs, or code have been adapted into the 时刻 (Shike) web
application.

## MIT License

### marieooq/neo-brutalism-ui-library
- **Repository:** https://github.com/marieooq/neo-brutalism-ui-library
- **License:** MIT
- **Usage:** REIMPLEMENT_PATTERN — Hard shadow, press state, and candy button
  interaction patterns adapted from the original component design. No source
  code directly copied; CSS variables and DOM structure rewritten for vanilla
  HTML/CSS/JS.
- **Modifications:** Converted from React/Tailwind to vanilla CSS with
  Playful Geometric design tokens. Added `prefers-reduced-motion` support.
- **Destination:** `assets/styles/playful-geometric.css`

### uiverse-io/galaxy
- **Repository:** https://github.com/uiverse-io/galaxy
- **License:** MIT
- **Usage:** MIT_COMPONENT_PORT — Empty state and loading spinner visual
  patterns adapted. Individual components stripped of unrelated code.
- **Modifications:** Reduced to Design Token system; added keyboard focus
  and ARIA states.
- **Destination:** `assets/styles/playful-geometric.css` (.empty-state, .toast)

### magicuidesign/magicui
- **Repository:** https://github.com/magicuidesign/magicui
- **License:** MIT
- **Usage:** MOTION_REFERENCE — Entrance animation timing and easing curves
  referenced. No source code copied.
- **Modifications:** All animations reimplemented in vanilla CSS keyframes.
- **Destination:** `assets/styles/playful-geometric.css` (@keyframes)

## MIT Behavior and Layout Port

### Tencent/weui
- **Repository:** https://github.com/Tencent/weui
- **License:** MIT
- **Usage:** MIT_BEHAVIOR_AND_LAYOUT_PORT — Action Sheet and Dialog behavior
  patterns (overlay, slide-up animation, safe-area-inset handling) adapted.
  Visual design remains Playful Geometric, not WeUI style.
- **Modifications:** Complete visual redesign with Playful Geometric tokens.
  All CSS rewritten. Only behavioral patterns (touch target sizes,
  safe-area-inset, dismiss on overlay tap) retained.
- **Destination:** `assets/styles/playful-geometric.css` (.action-sheet, .dialog-*)

## Reimplement Pattern (Reference Only, No Code Copied)

### superboum/super-productivity (johannesjo/super-productivity)
- **Repository:** https://github.com/johannesjo/super-productivity
- **License:** MIT
- **Usage:** REIMPLEMENT_PATTERN — Today page information priority (Next Action
  above full task list, focus task highlighting, load indicators serving action
  not just display). No Angular architecture ported.
- **Modifications:** Complete vanilla JS reimplementation.
- **Destination:** `src/legacy-app.js` (renderHome, updatePlayfulHeader)

### usememos/memos
- **Repository:** https://github.com/usememos/memos
- **License:** MIT
- **Usage:** REIMPLEMENT_PATTERN — Quick Capture low-friction input pattern
  and Review timeline information flow. No source code copied.
- **Modifications:** Adapted to existing IndexedDB storage and Playful
  Geometric design system.
- **Destination:** `src/legacy-app.js` (wireUpPlayfulCapture, renderReview)

### JerryZLiu/Dayflow
- **Repository:** https://github.com/JerryZLiu/Dayflow
- **License:** MIT
- **Usage:** REIMPLEMENT_PATTERN — Day/week review information architecture
  (today overview, yesterday highlights, overdue, waiting, tomorrow load,
  completion status). No automatic tracking or monitoring features adopted.
- **Modifications:** Only information architecture patterns adapted.
- **Destination:** `src/legacy-app.js` (renderReview)

### chrisvel/tududi
- **Repository:** https://github.com/chrisvel/tududi
- **License:** ISC
- **Usage:** REIMPLEMENT_PATTERN — All page hierarchy (Task, Project, Note,
  Area relationships) and desktop two-column layout patterns. No source code
  copied.
- **Modifications:** Adapted to existing record types and Playful Geometric
  design.
- **Destination:** `src/legacy-app.js` (renderAll)

## Accessibility Pattern (Reference Only)

### mui/base-ui
- **Repository:** https://github.com/mui/base-ui
- **License:** MIT
- **Usage:** ACCESSIBILITY_PATTERN — Focus management, Dialog keyboard
  navigation, and ARIA state patterns. No React components imported.
- **Modifications:** Focus trap and keyboard navigation implemented in
  vanilla JS.
- **Destination:** `src/legacy-app.js` (dialog/ActionSheet handlers)

### radix-ui/primitives
- **Repository:** https://github.com/radix-ui/primitives
- **License:** MIT
- **Usage:** ACCESSIBILITY_PATTERN — Focus restoration, Dialog close on
  Escape, and Tab cycling patterns. No React components imported.
- **Modifications:** Implemented in vanilla JS with focus-visible CSS.
- **Destination:** `assets/styles/playful-geometric.css` (:focus-visible)

## Reference Only (No Code Copied)

### ActivityWatch/activitywatch
- **Repository:** https://github.com/ActivityWatch/activitywatch
- **License:** MPL-2.0
- **Usage:** REFERENCE_ONLY — Time distribution and trend visualization patterns
  referenced for Review page design. No source code copied.
- **Destination:** N/A (design reference only)

## Lucide Icons
- **Repository:** https://github.com/lucide-icons/lucide
- **License:** ISC
- **Usage:** Icon style reference (2.25px stroke, rounded caps, 24x24 viewBox).
  Icons hand-coded as inline SVG following Lucide style guidelines.
- **Destination:** `index.html` (inline SVG icons)
