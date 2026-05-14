# מפל כוכבים 2026 / Звездопад 2026 — Project Specification

## Overview

Camping event web app for 45 people in the Negev desert, August 13-15, 2026.
Peak Perseids meteor shower night of Aug 12-13. Site: Borot Lotz (KKL).

**Admin:** Arthur (Arthur.komishenko@gmail.com)
**Stack:** Vanilla JS, Firebase (Auth/Firestore/Hosting/Functions), Telegram Bot
**Languages:** Hebrew (RTL, primary) + Russian
**Hosting:** mapal-kochavim.web.app

## Architecture Decisions

See DECISIONS.md for full ADR log.

## Current Sprint

Sprint 0 — Foundation (started 2026-05-14)

## Key Constraints

- Mobile-first, works in desert with poor connectivity
- Performance budget: FCP <1.5s, JS <100KB gz, CSS <50KB gz
- Lighthouse: Performance 95+, Accessibility 100
- No frameworks (Vanilla JS + ES modules)
- No Tailwind (custom CSS with CSS variables)
- RTL/LTR bilingual from day one
- PWA with offline support
- All user inputs sanitized (textContent, not innerHTML)

## Organizers

| Name | Role |
|---|---|
| Arthur (admin) | Coordination, site development |
| Robert (brother) | Skywatcher telescope, astronomy program |
| Vladimir (Vova) | Tarp, base camping |
| Andrey | Tools |
| Evgeny | TBD |

## Pages

| # | Page | Access | Primary goal |
|---|---|---|---|
| 0 | Welcome overlay | first visit | set the mood, show date |
| 1 | Home | all | inspire to RSVP |
| 2 | Place | all | show location, navigation |
| 3 | Program | all | timeline Aug 13/14/15 |
| 4 | Pack | all | personal checklist |
| 5 | RSVP | login | collect participant data |
| 6 | People | all | show community, aggregates |
| 7 | Rides | login (requests) | connect cars and passengers |
| 8 | Sky | all | telescope program, Perseids |
| 9 | Safety | all | emergency contacts, GPS |
| 10 | Gallery | all | link → Google Photos |
| 11 | Contacts | all | organizer call buttons |
| 12 | Me | login | my RSVP, history, requests |
| 13 | Admin | admin only | full data, CSV export |
