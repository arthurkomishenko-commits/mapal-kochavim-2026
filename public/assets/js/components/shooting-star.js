/**
 * Shooting Stars — 5 visually distinct meteor types
 *
 * Types:
 *   classic   — standard Perseid, bright head, warm→cool fade
 *   fireball  — large, slow, intense orange glow, long trail
 *   swift     — tiny, fast, barely-there, blink and miss
 *   fragment  — mid-flight brightness burst (breaking apart)
 *   glider    — long, graceful, cool blue-white, slow fade
 *
 * Spawns 1-2 meteors every 3-7 seconds.
 * Tail angle matches travel direction via CSS rotation.
 */

const MIN_INTERVAL_MS = 3_000;
const MAX_INTERVAL_MS = 7_000;

const METEOR_TYPES = [
  { cls: 'shooting-star--classic',  weight: 35, durationRange: [600, 1000],  travelXRange: [15, 30], travelYRange: [10, 22] },
  { cls: 'shooting-star--fireball', weight: 10, durationRange: [900, 1500],  travelXRange: [18, 35], travelYRange: [12, 25] },
  { cls: 'shooting-star--swift',    weight: 25, durationRange: [350, 650],   travelXRange: [12, 25], travelYRange: [6, 15] },
  { cls: 'shooting-star--fragment', weight: 15, durationRange: [700, 1200],  travelXRange: [15, 28], travelYRange: [10, 20] },
  { cls: 'shooting-star--glider',   weight: 15, durationRange: [1000, 1800], travelXRange: [20, 40], travelYRange: [8, 18] },
];

let container = null;
let timeoutId = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Weighted random selection of meteor type.
 */
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

  // Position: upper 55% of sky, full width
  const startX = rand(3, 97);
  const startY = rand(2, 55);

  // Travel
  const travelX = rand(type.travelXRange[0], type.travelXRange[1]);
  const travelY = rand(type.travelYRange[0], type.travelYRange[1]);

  // Direction: some go left, some right
  const goesLeft = Math.random() < 0.3;
  const finalTravelX = goesLeft ? -travelX : travelX;

  // Duration
  const duration = rand(type.durationRange[0], type.durationRange[1]);

  // Calculate tail angle to match travel direction
  // atan2 gives angle in radians, convert to degrees
  // Tail points OPPOSITE to travel direction
  const angleRad = Math.atan2(travelY, Math.abs(travelX));
  const angleDeg = (angleRad * 180) / Math.PI;
  const tailAngle = goesLeft ? -angleDeg : angleDeg;

  meteor.style.setProperty('--start-x', `${startX}%`);
  meteor.style.setProperty('--start-y', `${startY}%`);
  meteor.style.setProperty('--travel-x', `${finalTravelX}vw`);
  meteor.style.setProperty('--travel-y', `${travelY}vh`);
  meteor.style.setProperty('--duration', `${duration}ms`);
  meteor.style.setProperty('--tail-angle', `${tailAngle}deg`);

  container.appendChild(meteor);
  meteor.addEventListener('animationend', () => meteor.remove(), { once: true });
}

function tick() {
  if (!container || !container.isConnected || prefersReducedMotion()) return;

  // 1 or 2 meteors (40% chance of 2)
  const count = Math.random() < 0.4 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      spawnMeteor();
    } else {
      setTimeout(spawnMeteor, rand(150, 600));
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

  // First burst fast
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
