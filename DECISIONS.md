# Architecture Decisions

## ADR-001: Vanilla JS instead of framework (2026-05-14)

**Context:** 13-page mobile-first site for 45 users, performance budget <100KB JS.
**Options considered:**
1. React + Vite — familiar ecosystem, but 40KB+ baseline, overkill for scope
2. Vue 3 / Alpine.js — lighter, but still adds abstraction layer
3. Vanilla JS + ES modules — zero framework overhead

**Decision:** Vanilla JS with ES modules.
**Reasoning:**
- Performance budget is tight, every KB matters in desert with poor connectivity
- No complex client-side state — Firestore is the source of truth
- 45 users, not 45,000 — simplicity wins over scalability
- Full control over DOM for custom animations and RTL handling

**Consequences:**
- Manual DOM updates (mitigate with clean component patterns)
- No JSX (template literals)
- Custom hash-based routing needed
- More discipline required to avoid spaghetti

---

## ADR-002: Custom CSS over Tailwind (2026-05-14)

**Context:** Design spec calls for unique visual identity ("тихая величественность пустыни ночью"), not generic UI.
**Decision:** Custom CSS with CSS variables and BEM-like naming.
**Reasoning:**
- Tailwind produces recognizable "Tailwind look" — contradicts design goals
- CSS variables give us a proper design token system
- BEM prevents specificity wars without build tools
- Total CSS budget <50KB gz is achievable with custom CSS

**Consequences:**
- More upfront work on base components
- No utility classes — need disciplined component styles
- Must maintain tokens.css as single source of truth for design values

---

## ADR-003: Bilingual RTL/LTR from day one (2026-05-14)

**Context:** Hebrew (RTL) is primary language, Russian (LTR) is secondary.
**Decision:** Build every component RTL-aware from the start using CSS logical properties and `dir` attribute.
**Reasoning:**
- Retrofitting RTL is 5x harder than building it in
- CSS logical properties (`inline-start/end` vs `left/right`) handle most cases
- `[dir="rtl"]` selectors for edge cases

**Consequences:**
- Every component needs RTL testing from Sprint 1
- Margin/padding use logical properties exclusively
- Icon arrows and directional elements need flipping logic
