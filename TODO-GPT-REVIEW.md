# TODO — Status (2026-05-15)

## DONE ✅

- [x] Auth token system (generate, store, verify)
- [x] Firestore Security Rules (token-protected writes)
- [x] Admin panel hardening (type DELETE to clear)
- [x] Public data limits (no phones in public table)
- [x] Astronomy tips (red light, 20 min adaptation, after midnight)
- [x] Cleanup (removed legacy files)
- [x] Session recovery (recovery URL with token, copy button in Me)
- [x] Tonight's Sky section (sunset, moonrise, peak times)
- [x] Cinematic countdown timer (digit slide animation)
- [x] Global star background (3 layers, page-specific density)
- [x] Premium visual refine (desaturated colors, softer borders, cinematic transitions)
- [x] Hero visual hierarchy (vignette, content zone, readable UI)
- [x] 17 real photos distributed across all pages
- [x] 7 real videos with native controls in Gallery + Sky
- [x] Campfire removed (was too aggressive)
- [x] Confirmed/maybe status for participants
- [x] Companion linking (added-by system)
- [x] Phone-based registration with Firestore
- [x] WhatsApp group chat + individual contacts
- [x] Welcome overlay (staggered animation, 7-day dismiss)
- [x] Mobile bottom bar (Chat + RSVP, hidden after login)
- [x] Bilingual RTL/LTR (Hebrew + Russian)
- [x] Domain registered (mapal-kochavim-2026.is-a.dev — pending approval)

## REMAINING

### Before sending to people:
- [x] **Deploy Firestore rules** — done via `firebase deploy --only firestore:rules,firestore:indexes` (2026-06-17)
- [x] **Migrate uploads off Firebase Storage** — done, moved to Cloudinary (Blaze plan avoided). cloud_name `dqznby5hm`, preset `mapal_unsigned`.
- [ ] **Test full flow** on mobile: register → edit → me → who's coming
- [ ] **Test on Hebrew** — verify all i18n renders correctly
- [ ] **Clear test data** from Firestore before launch
- [ ] **Cloudinary smoke test** — local browser test of past-mode upload from real phone (?mode=past#gallery)

### Nice to have (not blocking):
- [ ] Service worker: remove or make network-first before event
- [ ] Admin: check-in mode for arrival night
- [ ] Admin: server-side token validation (currently client-side phone check)
- [ ] Tonight's Sky: auto-calculate times instead of hardcoded
- [ ] Cloudinary "Return delete token" — enable on preset for 10-min undo-upload window
- [ ] Cloudinary periodic orphan cleanup — soft-deleted blobs accumulate; admin script could compare Cloudinary public_ids vs Firestore docs
