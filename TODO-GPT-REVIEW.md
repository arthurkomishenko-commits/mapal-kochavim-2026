# TODO — GPT Review Findings (2026-05-15)

## CRITICAL — Security

### 1. Auth token system (replace plain phone login)
- [ ] Generate random token on first registration
- [ ] Save token in Firestore participant doc + localStorage
- [ ] Edit/delete only if token matches
- [ ] Fallback recovery: copy edit-link / unique token URL
- ~30 lines of code, massively improves safety

### 2. Firestore Security Rules (currently test mode = game over)
- [ ] Public read: aggregate counts, public names, city, bringing items
- [ ] Private: phones, edit, delete — rules-protected
- [ ] No one can write to another person's doc without matching token
- [ ] Admin operations protected by Firestore rules, not client JS

### 3. Admin panel hardening
- [ ] Remove `adminPhones.includes()` client-side check (not real security)
- [ ] Move admin logic to Firestore rules (admin token or separate admin collection)
- [ ] "Clear all" button: triple confirmation (type DELETE or hold 3 sec)
- [ ] Don't expose full phone list in client — keep in Firestore only

## HIGH — Privacy

### 4. Public data limits
- [ ] Public: name, city, bringing items — OK
- [ ] NOT public: phone numbers, kids count, exact companions
- [ ] "Who is coming" table: show names only, not phones/kids/companions
- [ ] Admin panel: only visible with valid admin token from Firestore

## HIGH — Reliability

### 5. Session recovery
- [ ] If user clears browser data / switches device — lost identity
- [ ] Solution: "Edit link" with token copied to clipboard on registration
- [ ] Or: unique token URL that restores session
- [ ] Show token once on registration success: "Save this link to edit later"

### 6. Service worker caution
- [ ] Currently disabled (good for dev)
- [ ] Before event: either remove completely OR make VERY simple (network-first only)
- [ ] People in desert with cached broken version = disaster

## MEDIUM — Features to Add

### 7. "Tonight's Sky" live section
- [ ] Sunset time
- [ ] Moonrise time
- [ ] Peak Perseids viewing hour
- [ ] Best viewing window
- [ ] Jupiter/Saturn visibility
- [ ] Increases immersion hugely

### 8. Astronomy tips (add to sky page or safety)
- [ ] "Red flashlight warning: don't use white light near telescope"
- [ ] "Your eyes adapt to darkness in 20 minutes — be patient"
- [ ] People love these tips

## LOW — Cleanup

### 9. Remove unused files
- [ ] star-field.js (legacy, unused)
- [ ] contacts.css, program.css (pages redirect, CSS unused)
- [ ] placeholder-img.css (no more placeholders)

### 10. Code quality
- [ ] Remove duplicate code between home.js and people.js (getAllParticipants)
- [ ] Centralize participant aggregation logic
