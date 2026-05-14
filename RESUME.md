# Journal of Progress

## Sprint 0 — Foundation ✅ (2026-05-14)

- ✅ Project directory structure created
- ✅ Working documents (PROJECT, RESUME, BUGS, QA, DECISIONS)
- ✅ Git repo initialized
- ✅ Design tokens (tokens.css)
- ✅ CSS reset, typography base
- ✅ i18n module (he/ru, RTL/LTR, localStorage, browser detect)
- ✅ Base index.html

## Sprint 1 — Design System + Static Content 🔨 (started 2026-05-14)

### Day 1 (2026-05-14)
- ✅ Hash-based SPA router with page transitions
- ✅ Welcome overlay (dismiss → 7 days localStorage, Escape key, fade animation)
- ✅ Shooting star animation (CSS, 30-60s interval, prefers-reduced-motion)
- ✅ Navigation: hamburger → mobile drawer → all 12 page links
- ✅ Footer component
- ✅ Fonts: Rubik (headings, he+ru) + Inter (body) via Google Fonts
- ✅ Content pages with full ru/he translations:
  - Home (hero, countdown, star field, CTA)
  - Place (coords, Waze/GMaps links, access/facilities/why info)
  - Program (3-day timeline, Perseids night highlighted)
  - Pack (interactive checklist, localStorage persistence)
  - Sky (Perseids stats, telescope, sun/moon/planets info)
  - Safety (emergency numbers tap-to-call, GPS copy, rules)
  - Gallery (Google Photos album placeholder)
  - Contacts (organizer cards)
- ✅ Stub pages (auth required):
  - RSVP (login gate)
  - People (stats counters + empty state)
  - Rides (empty state)
  - Me (login gate)
- ✅ 404 page
- ✅ Component CSS: buttons (primary/outline/ghost), cards, auth-gate, empty-state
- ✅ Placeholder images with CSS gradients (TODO-PHOTOS.md)
- ✅ Language switch re-renders current page

### Decisions
- ADR-001: Vanilla JS (see DECISIONS.md)
- ADR-002: Custom CSS over Tailwind
- ADR-003: RTL/LTR from day one
- Font pair: Rubik + Inter (geometric, Hebrew+Cyrillic support)

### TODO Sprint 1
- 📋 Replace placeholder images with real photos
- 📋 Lighthouse audit + fixes
- 📋 Screen reader test on home page
- 📋 Test on iPhone SE, iPhone 14, Galaxy S, iPad
- 📋 Verify all touch targets 44×44px

### Blockers
- Firebase project not yet created (local only for now)
- Telegram bot token pending
- Real photos pending (see TODO-PHOTOS.md)
