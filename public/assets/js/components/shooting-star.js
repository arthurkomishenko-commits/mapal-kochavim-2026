/**
 * Shooting Star
 *
 * Creates a single CSS-animated meteor across the hero.
 * Fires once every 30-60 seconds at random position/angle.
 * Respects prefers-reduced-motion.
 */

const MIN_INTERVAL_MS = 30_000;
const MAX_INTERVAL_MS = 60_000;

let container = null;
let timeoutId = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createMeteor() {
  if (!container || prefersReducedMotion()) return;

  const meteor = document.createElement('div');
  meteor.className = 'shooting-star';
  meteor.setAttribute('aria-hidden', 'true');

  // Random start position in the upper 60% of the screen
  const startX = randomBetween(10, 90);
  const startY = randomBetween(5, 40);
  // Travel distance
  const travelX = randomBetween(15, 30);
  const travelY = randomBetween(10, 25);
  // Duration 600-1200ms
  const duration = randomBetween(600, 1200);

  meteor.style.setProperty('--start-x', `${startX}%`);
  meteor.style.setProperty('--start-y', `${startY}%`);
  meteor.style.setProperty('--travel-x', `${travelX}vw`);
  meteor.style.setProperty('--travel-y', `${travelY}vh`);
  meteor.style.setProperty('--duration', `${duration}ms`);

  container.appendChild(meteor);

  // Clean up after animation
  meteor.addEventListener('animationend', () => meteor.remove(), { once: true });

  scheduleNext();
}

function scheduleNext() {
  const delay = randomBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
  timeoutId = setTimeout(createMeteor, delay);
}

export function initShootingStar(containerEl) {
  container = containerEl;
  if (!container || prefersReducedMotion()) return;

  // First one after a shorter wait (5-15s)
  timeoutId = setTimeout(createMeteor, randomBetween(5_000, 15_000));

  // Listen for motion preference changes
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches && timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    } else if (!e.matches && !timeoutId) {
      scheduleNext();
    }
  });
}
