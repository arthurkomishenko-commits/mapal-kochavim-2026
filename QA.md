# Quality Assurance

## Per-sprint checklists

### Sprint 0: Foundation
- [ ] Project structure matches spec
- [ ] Git repo initialized with .gitignore
- [ ] Design tokens defined in tokens.css
- [ ] Base index.html loads without errors
- [ ] Language switcher toggles he/ru
- [ ] RTL direction applies on Hebrew
- [ ] Dark background renders correctly
- [ ] No console errors/warnings

### Sprint 1: Design System + Static Content
- [ ] Lighthouse Performance 95+
- [ ] Lighthouse Accessibility 100
- [ ] Works on iPhone SE (375px)
- [ ] Works on iPhone 14 Pro Max (430px)
- [ ] Works on Galaxy S22 (360px)
- [ ] Works on iPad (768px)
- [ ] Hebrew RTL renders correctly on all pages
- [ ] Language switcher persists choice in localStorage
- [ ] All interactive elements min 44×44px touch targets
- [ ] All text contrast: AAA for body (7:1), AA for large (4.5:1)
- [ ] No console errors/warnings
- [ ] Star animation respects prefers-reduced-motion
- [ ] Welcome overlay dismiss persists 7 days
- [ ] All strings from locale files (no hardcoded UI text)

## Regression checklist (run before every deploy)
- [ ] Homepage loads under 1.5s on 4G throttle
- [ ] Language switch works
- [ ] RTL layout correct
- [ ] No console errors
- [ ] All links/buttons functional
