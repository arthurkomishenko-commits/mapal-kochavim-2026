/**
 * Build moon-2026.json — precomputed astronomical data for the Sky Calendar page.
 *
 * Run: npm run build:moon
 *
 * Computes for each day from rangeStart to rangeEnd at Borot Lotz coordinates:
 *   phase, illumination, sunrise, sunset, astro twilight end/start,
 *   moonrise, moonset, fraction of astro-night with moon above horizon,
 *   moonless dark minutes, and starScore (0..10).
 *
 * starScore formula (Gemini-derived, deep-research-tuned):
 *   S = 10 * [ 0.6 * (1 - I * F_moon) + 0.4 * (H_dark / H_max) ]
 *   where I = illumination, F_moon = fraction of astro-night moon is up,
 *   H_dark = minutes of moonless astro-night, H_max = 506 (summer seasonal max).
 *
 * Source coords verified against Wikipedia + Wikidata + OSM + BibleWalks.
 */

import SunCalc from 'suncalc';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Constants (verified) ────────────────────────────────────────────────

const COORDS = { lat: 30.5133, lon: 34.6089 };
const TZ = 'Asia/Jerusalem';
const H_MAX_MIN = 506;

const RANGE_START = '2026-06-16';
const RANGE_END   = '2026-08-15';
const EVENT_DATES = ['2026-08-13', '2026-08-14', '2026-08-15'];
const PERSEIDS_PEAK_DATE = '2026-08-13';

// ─── Helpers ─────────────────────────────────────────────────────────────

const fmtTime = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const fmtDate = (date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);

const localNoon = (isoDate) => new Date(`${isoDate}T12:00:00+03:00`);

const parseRange = (startISO, endISO) => {
  const out = [];
  let d = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${endISO}T00:00:00Z`);
  while (d <= end) {
    out.push(fmtDate(d));
    d = new Date(d.getTime() + 24 * 3600 * 1000);
  }
  return out;
};

const phaseName = (illumination, waxing) => {
  if (illumination < 0.02) return 'new';
  if (illumination > 0.98) return 'full';
  if (illumination < 0.47) return waxing ? 'waxingCrescent' : 'waningCrescent';
  if (illumination < 0.53) return waxing ? 'firstQuarter'   : 'lastQuarter';
  return waxing ? 'waxingGibbous' : 'waningGibbous';
};

// ─── Per-day computation ─────────────────────────────────────────────────

function computeDay(dateISO) {
  const noon = localNoon(dateISO);
  const times = SunCalc.getTimes(noon, COORDS.lat, COORDS.lon);
  const illum = SunCalc.getMoonIllumination(noon);
  const moon  = SunCalc.getMoonTimes(noon, COORDS.lat, COORDS.lon, true);

  // SunCalc.phase: 0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter.
  // Waxing = phase < 0.5.
  const waxing = illum.phase < 0.5;
  const illumination = illum.fraction;

  // Astro night: from `night` (dusk, sun -18° down) to tomorrow's `nightEnd` (dawn).
  const tomorrow = new Date(noon.getTime() + 24 * 3600 * 1000);
  const tomorrowTimes = SunCalc.getTimes(tomorrow, COORDS.lat, COORDS.lon);
  const astroDuskEnd  = times.night;        // sun reaches -18° going down
  const astroDawnStart = tomorrowTimes.nightEnd; // sun returns to -18° going up

  let moonUpMin = 0;
  let nightMin = 0;
  if (astroDuskEnd && astroDawnStart && !isNaN(astroDuskEnd) && !isNaN(astroDawnStart)) {
    const stepMs = 5 * 60 * 1000;
    for (let t = astroDuskEnd.getTime(); t < astroDawnStart.getTime(); t += stepMs) {
      nightMin += 5;
      const pos = SunCalc.getMoonPosition(new Date(t), COORDS.lat, COORDS.lon);
      if (pos.altitude > 0) moonUpMin += 5;
    }
  }

  const F_moon = nightMin > 0 ? moonUpMin / nightMin : 0;
  const H_dark = Math.max(0, nightMin - moonUpMin);

  // Gemini-derived scoring formula.
  const rawScore = 10 * (
    0.6 * (1 - illumination * F_moon) +
    0.4 * (H_dark / H_MAX_MIN)
  );
  const starScore = Math.round(Math.min(10, Math.max(0, rawScore)) * 10) / 10;

  return {
    date: dateISO,
    phase: phaseName(illumination, waxing),
    illumination: Math.round(illumination * 1000) / 1000,
    waxing,
    sunrise:       fmtTime(times.sunrise),
    sunset:        fmtTime(times.sunset),
    twilightEnd:   fmtTime(astroDuskEnd),
    twilightStart: fmtTime(astroDawnStart),
    moonrise:      fmtTime(moon.rise),
    moonset:       fmtTime(moon.set),
    moonFraction:  Math.round(F_moon * 1000) / 1000,
    darkMin:       Math.round(H_dark),
    nightMin:      Math.round(nightMin),
    starScore,
    isEvent:       EVENT_DATES.includes(dateISO),
    isPerseidsPeak: dateISO === PERSEIDS_PEAK_DATE,
  };
}

// ─── Build ───────────────────────────────────────────────────────────────

const dates = parseRange(RANGE_START, RANGE_END);
const days = dates.map(computeDay);

const data = {
  meta: {
    generatedAt: new Date('2026-06-16T12:00:00Z').toISOString(),
    coords: COORDS,
    timezone: TZ,
    hMaxMinutes: H_MAX_MIN,
    rangeStart: RANGE_START,
    rangeEnd: RANGE_END,
    perseidsPeak: PERSEIDS_PEAK_DATE,
    eventDates: EVENT_DATES,
    source: 'SunCalc 1.9 (Vladimir Agafonkin), MIT. Coords verified Wikipedia+Wikidata+OSM+BibleWalks. starScore formula Gemini-derived, H_max=506min summer max at 30.5N.',
  },
  days,
};

// Write to both public/ (source of truth) and docs/ (deploy copy).
const __dirname = dirname(fileURLToPath(import.meta.url));
const out = ['public', 'docs'].map(d => `${__dirname}/../${d}/assets/data/moon-2026.json`);

for (const path of out) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ wrote ${path}`);
}

// Sanity-check headline numbers against deep-research verified values.
const aug12 = days.find(d => d.date === '2026-08-12');
const aug13 = days.find(d => d.date === '2026-08-13');
console.log('\n─── sanity check vs deep-research ───');
console.log(`Aug 12 illumination:  ${aug12.illumination}  (expected ≈ 0.002)`);
console.log(`Aug 12 dark window:   ${aug12.darkMin}min  (expected ≈ 466)`);
console.log(`Aug 12 starScore:     ${aug12.starScore}  (expected ≈ 9.2)`);
console.log(`Aug 13 illumination:  ${aug13.illumination}  (expected ≈ 0.006)`);
console.log(`Aug 13 starScore:     ${aug13.starScore}  (expected ≈ 9.2)`);
console.log(`\nTotal days: ${days.length}`);
console.log(`Best night:  score ${Math.max(...days.map(d => d.starScore))} on ${days.reduce((b, d) => d.starScore > b.starScore ? d : b).date}`);
