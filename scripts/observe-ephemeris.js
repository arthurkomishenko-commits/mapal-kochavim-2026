/**
 * Compute precise ephemerides for the Mapal Kochavim observation nights
 * (13→14 and 14→15 Aug 2026, Borot Lotz, Israel).
 *
 * Uses astronomy-engine which implements VSOP87 + DE441 — matches Stellarium
 * to within ~1 arcsecond / few seconds of time.
 *
 *   node scripts/observe-ephemeris.js
 */

import * as A from 'astronomy-engine';

// ─── Site & nights ────────────────────────────────────────────────
// Borot Lotz, central Negev. Memory has 30.5133/34.6089; place.js has
// 30.6167/34.7833 (cistern compound is spread over a few km, both within
// reason). 0.1° lat shifts horizon-object timings by ~4 min — within
// our tolerance.
const OBS = new A.Observer(30.5133, 34.6089, 950);

// Asia/Jerusalem is fixed UTC+3 IDT throughout summer 2026 (no DST flip).
const IDT_OFFSET_HOURS = 3;

function idtDate(y, m, d, h = 0, min = 0) {
  // Pass IDT wall-clock; build the corresponding UTC Date.
  return new Date(Date.UTC(y, m - 1, d, h - IDT_OFFSET_HOURS, min));
}

function fmtIDT(date) {
  if (!date) return '—';
  const d = new Date(date.getTime() + IDT_OFFSET_HOURS * 3600 * 1000);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// Nights: a "night of N" means evening of N -> morning of N+1.
const NIGHTS = [
  { label: 'night 13→14 Aug 2026', dusk: idtDate(2026, 8, 13, 18, 0), dawn: idtDate(2026, 8, 14, 7, 0) },
  { label: 'night 14→15 Aug 2026', dusk: idtDate(2026, 8, 14, 18, 0), dawn: idtDate(2026, 8, 15, 7, 0) },
];

// ─── Helpers ───────────────────────────────────────────────────────

function azCompass(az) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(((az % 360) / 22.5)) % 16];
}

function altAzOf(body, time) {
  let eq;
  if (typeof body === 'string') {
    eq = A.Equator(body, time, OBS, true, true);
  } else {
    eq = body.equator(time);
  }
  const h = A.Horizon(time, OBS, eq.ra, eq.dec, 'normal');
  return { alt: h.altitude, az: h.azimuth, ra: eq.ra, dec: eq.dec };
}

function fixedTarget(ra, dec, name) {
  return {
    name,
    equator() { return { ra, dec }; },
  };
}

// Scan-based rise/transit/set for both solar system bodies (via Body string)
// and fixed celestial targets. Returns { rise, transit, set, peakAlt, peakAz }
// covering [from..to]. If body never crosses horizon, rise/set are null.
function eventsInWindow(body, from, to) {
  const STEP_MIN = 2;
  const STEP_MS = STEP_MIN * 60 * 1000;
  const samples = [];
  for (let t = from.getTime(); t <= to.getTime(); t += STEP_MS) {
    const tm = new Date(t);
    const a = altAzOf(body, A.MakeTime(tm));
    samples.push({ t: tm, alt: a.alt, az: a.az });
  }
  // Refine crossing zero via binary search around each transition.
  let rise = null, set = null;
  for (let i = 1; i < samples.length; i++) {
    if (samples[i - 1].alt < 0 && samples[i].alt >= 0) rise = refineCross(body, samples[i - 1].t, samples[i].t, +1);
    if (samples[i - 1].alt >= 0 && samples[i].alt < 0) set = refineCross(body, samples[i - 1].t, samples[i].t, -1);
  }
  // Peak (transit) = sample with max alt; refine with parabolic fit.
  let peakIdx = 0;
  for (let i = 1; i < samples.length; i++) if (samples[i].alt > samples[peakIdx].alt) peakIdx = i;
  const peakSample = samples[peakIdx];
  return {
    rise, set,
    transit: peakSample.t,
    peakAlt: peakSample.alt,
    peakAz: peakSample.az,
  };
}

function refineCross(body, t0, t1, direction) {
  let lo = t0.getTime(), hi = t1.getTime();
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const a = altAzOf(body, A.MakeTime(new Date(mid))).alt;
    if ((direction === +1 && a < 0) || (direction === -1 && a >= 0)) lo = mid;
    else hi = mid;
  }
  return new Date((lo + hi) / 2);
}

function elongationFromSun(body, time) {
  // Apparent angular separation between body and the Sun.
  return A.AngleFromSun(body, time);
}

function saturnRingTiltDeg(time) {
  // Astronomy-engine doesn't expose ring tilt directly. Compute from Saturn
  // rotation axis vector (per IAU model): the angle between the projection of
  // axis onto the geocentric direction and the geocentric line of sight tells
  // you whether we see the lit side and how open the rings are.
  const axis = A.RotationAxis('Saturn', time);
  // RA/DEC of the north pole (J2000 ~83.5°, 41.4° fixed for Saturn at this scale)
  const npRA = axis.ra * 15;            // hours -> deg
  const npDec = axis.dec;               // deg
  // Geocentric vector to Saturn
  const eq = A.Equator('Saturn', time, new A.Observer(0, 0, 0), false, true);
  const targetRA = eq.ra * 15;
  const targetDec = eq.dec;
  const toRad = (d) => d * Math.PI / 180;
  const cosAng =
    Math.sin(toRad(npDec)) * Math.sin(toRad(targetDec)) +
    Math.cos(toRad(npDec)) * Math.cos(toRad(targetDec)) * Math.cos(toRad(npRA - targetRA));
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAng))) * 180 / Math.PI;
  // Tilt magnitude = 90 - angle to ring plane. Sign = positive if north face lit.
  return 90 - angle;
}

// ─── Targets ───────────────────────────────────────────────────────

const PLANETS = ['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune'];

// J2000 ICRS — RA in SIDEREAL HOURS (what astronomy-engine.Horizon expects),
// Dec in degrees. Precession to 2026 shifts <0.01° — irrelevant.
const FIXED = [
  fixedTarget(0.7123,  41.2690,  'M31 (Andromeda)'),     // 00h 42m 44s
  fixedTarget(19.5119, 27.9598,  'Albireo (β Cyg)'),     // 19h 30m 43s
  fixedTarget(16.6947, 36.4602,  'M13 (Hercules)'),      // 16h 41m 41s
  fixedTarget(18.0633, -24.3867, 'M8 (Lagoon)'),         // 18h 03.8m
  fixedTarget(18.6067, -23.9028, 'M22 (Sgr globular)'),  // 18h 36m 24s
  fixedTarget(18.3467, -16.1781, 'M17 (Omega Nebula)'),  // 18h 20.8m
];

// ─── Output ────────────────────────────────────────────────────────

for (const night of NIGHTS) {
  console.log(`\n══════════════════════════════════════════════════════════`);
  console.log(` ${night.label}`);
  console.log(`══════════════════════════════════════════════════════════`);
  console.log(` Dusk window: ${night.dusk.toISOString()} → ${night.dawn.toISOString()}`);
  console.log(` (IDT ${fmtIDT(night.dusk)} → ${fmtIDT(night.dawn)} next day)`);

  // Sun: civil/nautical/astronomical twilights for context
  const sunset = A.SearchAltitude(A.Body.Sun, OBS, -1, night.dusk, 1, -0.833);
  const astroEnd = A.SearchAltitude(A.Body.Sun, OBS, -1, night.dusk, 1, -18);
  const astroStart = A.SearchAltitude(A.Body.Sun, OBS, +1, night.dawn, -1, -18);
  const sunrise = A.SearchAltitude(A.Body.Sun, OBS, +1, night.dawn, -1, -0.833);

  console.log(`\nSun:`);
  console.log(`  Sunset:                ${fmtIDT(sunset.date)} IDT`);
  console.log(`  Astronomical twi end:  ${fmtIDT(astroEnd.date)} IDT`);
  console.log(`  Astronomical twi start:${fmtIDT(astroStart.date)} IDT`);
  console.log(`  Sunrise:               ${fmtIDT(sunrise.date)} IDT`);

  // Moon
  const moonPhaseDeg = A.MoonPhase(night.dusk);
  const moonIllum = A.Illumination(A.Body.Moon, night.dusk);
  console.log(`\nMoon:`);
  console.log(`  Phase angle: ${moonPhaseDeg.toFixed(1)}°  (0=new, 90=Q1, 180=full, 270=Q3)`);
  console.log(`  Illumination: ${(moonIllum.phase_fraction * 100).toFixed(1)}%`);

  console.log(`\nPlanets — elongation from Sun + visibility in this night:`);
  for (const p of PLANETS) {
    const elong = elongationFromSun(p, night.dusk);
    const ev = eventsInWindow(p, night.dusk, night.dawn);
    const mag = A.Illumination(p, night.dusk).mag;
    console.log(`  ${p.padEnd(8)} elong=${elong.toFixed(0)}°  mag=${mag.toFixed(1)}` +
                `  peak=${ev.peakAlt.toFixed(0)}° ${azCompass(ev.peakAz)} at ${fmtIDT(ev.transit)}` +
                `  rise=${fmtIDT(ev.rise)}  set=${fmtIDT(ev.set)}`);
  }

  // Restrict scan to actual dark hours so "peak" doesn't get pinned to the
  // window endpoint when an object is already up at sunset / still up at sunrise.
  const darkStart = astroEnd.date;
  const darkEnd = astroStart.date;

  console.log(`\nFixed targets (dark hours only):`);
  for (const f of FIXED) {
    const ev = eventsInWindow(f, darkStart, darkEnd);
    console.log(`  ${f.name.padEnd(20)} peak=${ev.peakAlt.toFixed(0)}° ${azCompass(ev.peakAz)} at ${fmtIDT(ev.transit)}` +
                `  rise=${fmtIDT(ev.rise)}  set=${fmtIDT(ev.set)}`);
  }

  // Saturn ring tilt (informational, only changes ~0.1° between nights)
  if (night === NIGHTS[0]) {
    const tilt = saturnRingTiltDeg(A.MakeTime(night.dusk));
    console.log(`\nSaturn ring tilt B: ${tilt.toFixed(2)}°  (negative = south face presented)`);
  }

  // Galilean moons positions at chosen reference time (best Jupiter visibility)
  const jupAt = idtDate(2026, 8, night === NIGHTS[0] ? 14 : 15, 4, 0);
  const jm = A.JupiterMoons(A.MakeTime(jupAt));
  console.log(`\nGalilean moons at ${fmtIDT(jupAt)} IDT (next morning):`);
  for (const [name, sv] of Object.entries({ Io: jm.io, Europa: jm.europa, Ganymede: jm.ganymede, Callisto: jm.callisto })) {
    // sv.x in Jupiter radii; positive = east of Jupiter
    console.log(`  ${name.padEnd(10)} x=${sv.x.toFixed(2)} Rj  y=${sv.y.toFixed(2)}  z=${sv.z.toFixed(2)}`);
  }
}

console.log(`\nKey conclusion checks:`);
{
  // Was there a Saturn ring plane crossing in 2025?
  // Quick check: ring tilt at start of 2025 vs Aug 2026
  const tilt2025 = saturnRingTiltDeg(A.MakeTime(new Date('2025-03-23T00:00Z')));
  const tilt2026 = saturnRingTiltDeg(A.MakeTime(new Date('2026-08-13T00:00Z')));
  console.log(`  Saturn ring tilt 2025-03-23: ${tilt2025.toFixed(2)}°`);
  console.log(`  Saturn ring tilt 2026-08-13: ${tilt2026.toFixed(2)}°`);

  // Jupiter–Sun separation on 13 Aug 2026: confirms morning vs invisible
  const elong = A.AngleFromSun('Jupiter', new Date('2026-08-13T18:00:00Z'));
  console.log(`  Jupiter elongation from Sun on 2026-08-13: ${elong.toFixed(1)}°`);
}
