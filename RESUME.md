# Journal of Progress

## Sprint 0 — Foundation (2026-05-14)

- Git repo, working docs (PROJECT, RESUME, BUGS, QA, DECISIONS)
- Design tokens (tokens.css), CSS reset, typography
- i18n module (he/ru, RTL/LTR, localStorage, browser detect)
- Base index.html

## Sprint 1 — Design System + Static Content (2026-05-14)

### Day 1
- Hash-based SPA router with page transitions
- Welcome overlay (dismiss, Escape key, fade animation)
- Shooting star animation (CSS, 30-60s interval, prefers-reduced-motion)
- Navigation: hamburger, mobile drawer, 12 page links, lang toggle
- Footer component
- Fonts: Rubik (headings) + Inter (body) via Google Fonts
- Content pages with full ru/he translations:
  - Home (hero, countdown, star field canvas, CTA)
  - Place (coords, Waze/GMaps links, access/facilities/why)
  - Program (3-day timeline, Perseids night highlighted)
  - Pack (interactive checklist, localStorage persistence)
  - Sky (Perseids stats, telescope, sun/moon/planets)
  - Safety (emergency numbers tap-to-call, GPS copy, rules)
  - Gallery (Google Photos album placeholder)
  - Contacts (organizer cards)
- Stub pages (auth required): RSVP, People, Rides, Me
- 404 page
- Component CSS: buttons, cards, auth-gate, empty-state

### Day 1 Evening — Photos + Polish
- Real photos added (10 photos from Borot Lotz):
  - Place page: panorama hero + 4-photo grid (campsite day/dusk, tree, hills)
  - Sky page: person under MW (hero) + MW close-up
  - Program page: sunset photo above timeline
  - Gallery page: 6-photo preview grid with hover zoom
- Mobile hero: background photo instead of canvas (saves GPU)
- SkyRenderer (Canvas 2D): 35K stars, MW from density, named stars, twinkling
- Meteor animation: removed filter (brightness/saturate) — GPU-only transform+opacity
- Welcome overlay redesigned:
  - Premium staggered entrance animation (7 elements, sequential)
  - Decorative rotating 8-point star
  - Gradient divider
  - Amber glow button
  - Scroll lock on body (iOS-safe: position fixed + scrollY restore)
  - Safe vertical centering (margin auto, no flex clipping)
- "Private event" messaging:
  - Welcome overlay: pill badge "Closed event. Friends & their guests only."
  - Home hero: private badge between subtitle and countdown
  - Home bottom CTA: updated text
  - Detail grid: "Format: up to 45 friends"
  - Both ru/he translations
- SEO/meta: noindex/nofollow, OpenGraph tags, description updated
- Lighthouse fixes: CSS fallbacks, responsive image heights for small screens
- Service worker removed (development mode), no-cache server headers
- Cache-busting on all assets (?v=N)

### Decisions
- ADR-001: Vanilla JS
- ADR-002: Custom CSS over Tailwind
- ADR-003: RTL/LTR from day one
- Font pair: Rubik + Inter

### TODO Sprint 2 — Firebase + Auth
- [ ] Create Firebase project
- [ ] Google Auth (sign in / sign out)
- [ ] RSVP form (name, car seats, tent, dietary, +1)
- [ ] People page — live participant list from Firestore
- [ ] Rides / carpool matching
- [ ] Me page — edit own RSVP
- [ ] Telegram bot integration
- [ ] Restore welcome overlay localStorage (show once per 7 days)
- [ ] Re-enable service worker with proper caching strategy
