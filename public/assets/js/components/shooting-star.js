/**
 * Shooting Stars — realistic Perseid meteor shower
 *
 * Real meteor physics:
 * - All meteors radiate FROM a single point (radiant) in the upper sky
 * - They travel OUTWARD and DOWNWARD from that radiant
 * - Steep angles (mostly 50-80° from horizontal)
 * - Never go upward
 * - Speed varies but direction is consistent
 * - Short streaks are more common than long ones
 *
 * 5 visual types with different brightness/tail characteristics.
 * Spawns 1-2 every 3-7 seconds.
 */

const MIN_INTERVAL_MS = 3_000;
const MAX_INTERVAL_MS = 7_000;

// Radiant point: upper-right area of sky (Perseus rises NE from Israel)
const RADIANT_X = 75; // % from left
const RADIANT_Y = 8;  // % from top

const METEOR_TYPES = [
  { cls: 'shooting-star--classic',  weight: 35, durationRange: [500, 900],   distRange: [18, 32] },
  { cls: 'shooting-star--fireball', weight: 10, durationRange: [800, 1400],  distRange: [25, 42] },
  { cls: 'shooting-star--swift',    weight: 25, durationRange: [250, 500],   distRange: [10, 20] },
  { cls: 'shooting-star--fragment', weight: 15, durationRange: [600, 1100],  distRange: [18, 30] },
  { cls: 'shooting-star--glider',   weight: 15, durationRange: [900, 1600],  distRange: [22, 40] },
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

  // ── Radiant-based direction ──
  // Meteor starts somewhere in upper sky, direction points AWAY from radiant
  // Scatter the start position around the radiant with some spread
  const startX = RADIANT_X + rand(-35, 25);
  const startY = RADIANT_Y + rand(-5, 20);

  // Direction angle: vector from radiant to start point, then continue outward
  // This gives the "radiating from a point" effect
  const dx = startX - RADIANT_X;
  const dy = startY - RADIANT_Y;

  // Base angle from radiant to this point (in degrees)
  // Add some randomness but keep it "outward"
  let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  angleDeg += rand(-15, 15); // slight scatter

  // Ensure meteor always goes DOWNWARD: angle between 20° and 160° (below horizontal)
  // 90° = straight down, 0° = right, 180° = left
  if (angleDeg < 20) angleDeg = rand(25, 60);
  if (angleDeg > 160) angleDeg = rand(120, 155);
  // Never go upward
  if (angleDeg < 0) angleDeg = Math.abs(angleDeg);
  if (angleDeg > 180) angleDeg = 360 - angleDeg;

  // Convert angle to travel vector
  const angleRad = (angleDeg * Math.PI) / 180;
  const dist = rand(type.distRange[0], type.distRange[1]);
  const travelX = Math.cos(angleRad) * dist;
  const travelY = Math.sin(angleRad) * dist; // always positive = downward

  // Duration
  const duration = rand(type.durationRange[0], type.durationRange[1]);

  // Tail angle: points opposite to travel direction
  const tailAngle = angleDeg + 180;

  // Clamp start position to visible area
  const clampedX = Math.max(2, Math.min(98, startX));
  const clampedY = Math.max(1, Math.min(45, startY));

  meteor.style.setProperty('--start-x', `${clampedX}%`);
  meteor.style.setProperty('--start-y', `${clampedY}%`);
  meteor.style.setProperty('--travel-x', `${travelX}vw`);
  meteor.style.setProperty('--travel-y', `${travelY}vh`);
  meteor.style.setProperty('--duration', `${duration}ms`);
  meteor.style.setProperty('--tail-angle', `${tailAngle}deg`);

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
