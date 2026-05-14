/**
 * Shooting Stars
 *
 * Spawns 1-2 meteors every 3-7 seconds at random positions.
 * Each has random angle, speed, and tail length.
 * Respects prefers-reduced-motion.
 */

const MIN_INTERVAL_MS = 3_000;
const MAX_INTERVAL_MS = 7_000;

let container = null;
let timeoutId = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function spawnMeteor() {
  if (!container || !container.isConnected) return;

  const meteor = document.createElement('div');
  meteor.className = 'shooting-star';
  meteor.setAttribute('aria-hidden', 'true');

  const startX = randomBetween(5, 95);
  const startY = randomBetween(2, 50);
  const travelX = randomBetween(12, 35);
  const travelY = randomBetween(8, 28);
  const duration = randomBetween(500, 1100);

  meteor.style.setProperty('--start-x', `${startX}%`);
  meteor.style.setProperty('--start-y', `${startY}%`);
  meteor.style.setProperty('--travel-x', `${travelX}vw`);
  meteor.style.setProperty('--travel-y', `${travelY}vh`);
  meteor.style.setProperty('--duration', `${duration}ms`);

  container.appendChild(meteor);
  meteor.addEventListener('animationend', () => meteor.remove(), { once: true });
}

function tick() {
  if (!container || !container.isConnected || prefersReducedMotion()) return;

  // 1 or 2 meteors per tick
  const count = Math.random() < 0.4 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    // Stagger the second one slightly
    if (i === 0) {
      spawnMeteor();
    } else {
      setTimeout(spawnMeteor, randomBetween(200, 800));
    }
  }

  scheduleNext();
}

function scheduleNext() {
  const delay = randomBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
  timeoutId = setTimeout(tick, delay);
}

export function initShootingStar(containerEl) {
  // Clean up previous instance
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  container = containerEl;
  if (!container || prefersReducedMotion()) return;

  // First meteor fast — within 1-2 seconds
  timeoutId = setTimeout(tick, randomBetween(1_000, 2_000));

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches && timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    } else if (!e.matches && !timeoutId) {
      scheduleNext();
    }
  });
}
