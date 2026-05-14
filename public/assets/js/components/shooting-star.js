/**
 * Shooting Stars — Perseid meteor shower
 *
 * Architecture (from best CodePen/Gist implementations):
 * - Each meteor is a .meteor element with a .meteor__trail child
 * - The .meteor gets a rotate + translate animation (movement)
 * - The .meteor__trail gets a scaleX animation (trail appears/disappears)
 * - Two separate @keyframes = independent control of speed vs trail
 * - Meteor is visible only ~5% of its animation cycle (rest is delay)
 *
 * All fly top→bottom at 25-65° angles. 1-2 every 3-7 seconds.
 */

const MIN_INTERVAL_MS = 3_000;
const MAX_INTERVAL_MS = 7_000;

// 5 visual variants with different trail widths, speeds, colors
const VARIANTS = [
  { cls: '',            weight: 40, speedRange: [1.2, 2.0], travelRange: [25, 40], trailScale: [1.5, 2.5] },
  { cls: 'meteor--bright', weight: 12, speedRange: [1.6, 2.8], travelRange: [30, 50], trailScale: [2.5, 4]   },
  { cls: 'meteor--faint',  weight: 25, speedRange: [0.8, 1.4], travelRange: [15, 28], trailScale: [1, 1.8]   },
  { cls: 'meteor--flash',  weight: 13, speedRange: [1.0, 1.8], travelRange: [20, 35], trailScale: [1.8, 3]   },
  { cls: 'meteor--cold',   weight: 10, speedRange: [1.8, 3.2], travelRange: [28, 45], trailScale: [2, 3.5]   },
];

let container = null;
let timeoutId = null;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function pickVariant() {
  const total = VARIANTS.reduce((s, v) => s + v.weight, 0);
  let roll = Math.random() * total;
  for (const v of VARIANTS) {
    roll -= v.weight;
    if (roll <= 0) return v;
  }
  return VARIANTS[0];
}

function spawnMeteor() {
  if (!container || !container.isConnected) return;

  const v = pickVariant();

  const el = document.createElement('div');
  el.className = `meteor ${v.cls}`.trim();
  el.setAttribute('aria-hidden', 'true');

  const trail = document.createElement('div');
  trail.className = 'meteor__trail';
  el.appendChild(trail);

  // Position: upper sky
  const x = rand(5, 90);
  const y = rand(2, 35);

  // Angle: always down-right, 25-65°
  const angle = rand(25, 65);

  // Speed & travel distance
  const speed = rand(v.speedRange[0], v.speedRange[1]);
  const travel = rand(v.travelRange[0], v.travelRange[1]);
  const trailScale = rand(v.trailScale[0], v.trailScale[1]);

  el.style.setProperty('--x', x);
  el.style.setProperty('--y', y);
  el.style.setProperty('--angle', angle);
  el.style.setProperty('--speed', speed);
  el.style.setProperty('--travel', travel);
  el.style.setProperty('--trail', trailScale);

  container.appendChild(el);

  // Remove after one cycle
  const durationMs = speed * 1000;
  setTimeout(() => el.remove(), durationMs + 100);
}

function tick() {
  if (!container || !container.isConnected || prefersReducedMotion()) return;

  const count = Math.random() < 0.35 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    if (i === 0) spawnMeteor();
    else setTimeout(spawnMeteor, rand(100, 500));
  }
  scheduleNext();
}

function scheduleNext() {
  timeoutId = setTimeout(tick, rand(MIN_INTERVAL_MS, MAX_INTERVAL_MS));
}

export function initShootingStar(containerEl) {
  if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
  container = containerEl;
  if (!container || prefersReducedMotion()) return;
  timeoutId = setTimeout(tick, rand(600, 1200));

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches && timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
    else if (!e.matches && !timeoutId) scheduleNext();
  });
}
