# TODO — GPT Review Findings (2026-05-15)

## DONE

### 1. Auth token system ✅
- [x] Generate random token on first registration
- [x] Save token in Firestore participant doc + localStorage
- [x] Edit/delete only if token matches (Firestore rules)

### 2. Firestore Security Rules ✅
- [x] Create requires token
- [x] Update requires matching token
- [x] Cannot change phone/token/createdAt
- [x] No hard deletes

### 3. Admin panel hardening ✅
- [x] "Clear all" requires typing DELETE

### 4. Public data limits ✅
- [x] "Who is coming" table: names only, no phones

### 5. Astronomy tips ✅
- [x] Red flashlight warning
- [x] Eyes adapt in 20 minutes
- [x] Best viewing after midnight

### 6. Cleanup ✅
- [x] Removed star-field.js (legacy)
- [x] Removed placeholder-img.css (unused)

## REMAINING

### 7. Session recovery
- [ ] "Edit link" with token URL copied on registration
- [ ] Fallback if user clears browser data

### 8. Service worker
- [ ] Before event: remove or make network-first only

### 9. "Tonight's Sky" live section
- [ ] Sunset/moonrise times for event date
- [ ] Peak Perseids viewing hour

### 10. Firestore rules deployment
- [ ] Deploy firestore.rules to Firebase Console (Rules tab → Publish)

### 11. Admin improvements
- [ ] Admin token in Firestore (not client-side phone check)
- [ ] Check-in mode for arrival night
