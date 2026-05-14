/**
 * Shooting Stars — realistic Perseid meteors
 *
 * Simple correct physics:
 * - All meteors fly TOP-LEFT → BOTTOM-RIGHT (or slight variations)
 * - Flight angle: 25°–65° from horizontal (always downward-right)
 * - Start in upper portion of sky (top 35%)
 * - The CSS `rotate` property aligns the entire element (head + tail)
 *   with the flight direction. translateX moves along that axis.
 *   Tail is behind the head via `right: 100%`.
 *
 * 5 visual types. 1-2 meteors every 3-7 seconds.
 */

const MIN_INTERVAL_MS = 3_000;
const MAX_INTERVAL_MS = 7_000;

const METEOR_TYPES = [
  { cls: 'shooting-star--classic',  weight: 35, durationRange: [1200, 2000],  distRange: [18, 32] },
  { cls: 'shooting-star--fireball', weight: 10, durationRange: [1800, 2800],  distRange: [25, 42] },
  { cls: 'shooting-star--swift',    weight: 25, durationRange: [700, 1200],   distRange: [10, 20] },
  { cls: 'shooting-star--fragment', weight: 15, durationRange: [1400, 2200],  distRange: [18, 30] },
  { cls: 'shooting-star--glider',   weight: 15, durationRange: [2200, 3500],  distRange: [22, 40] },
];

let container = null;
let timeoutId = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pickType() {
  const totalWeight = METEOR_TYPES.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const type of METEOR_TYPES) {
    roll -= type.weight;
    if (roll <= 0) return type;
  }
  return METEOR_TYPES[0];
}

function spawnMeteor() {
  if (!container || !container.isConnected) return;

  const type = pickType();
  const meteor = document.createElement('div');
  meteor.className = `shooting-star ${type.cls}`;
  meteor.setAttribute('aria-hidden', 'true');

  // Start position: upper part of sky, spread across width
  const startX = rand(5, 85);
  const startY = rand(2, 35);

  // Flight angle: 25°–65° from horizontal = always going DOWN and to the RIGHT
  // This is the CSS `rotate` value. 0° = horizontal right, 90° = straight down.
  const flightAngle = rand(25, 65);

  // Travel distance
  const dist = rand(type.distRange[0], type.distRange[1]);

  // Duration
  const duration = rand(type.durationRange[0], type.durationRange[1]);

  meteor.style.setProperty('--start-x', `${startX}%`);
  meteor.style.setProperty('--start-y', `${startY}%`);
  meteor.style.setProperty('--travel-dist', `${dist}vw`);
  meteor.style.setProperty('--duration', `${duration}ms`);
  meteor.style.setProperty('--flight-angle', `${flightAngle}deg`);

  container.appendChild(meteor);
  meteor.addEventListener('animationend', () => meteor.remove(), { once: true });
}

function tick() {
  if (!container || !container.isConnected || prefersReducedMotion()) return;

  const count = Math.random() < 0.4 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      spawnMeteor();
    } else {
      setTimeout(spawnMeteor, rand(100, 500));
    }
  }

  scheduleNext();
}

function scheduleNext() {
  const delay = rand(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
  timeoutId = setTimeout(tick, delay);
}

export function initShootingStar(containerEl) {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  container = containerEl;
  if (!container || prefersReducedMotion()) return;

  timeoutId = setTimeout(tick, rand(800, 1500));

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches && timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    } else if (!e.matches && !timeoutId) {
      scheduleNext();
    }
  });
}
