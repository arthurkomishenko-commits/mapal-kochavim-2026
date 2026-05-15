/**
 * Campfire — rare ember spawner
 *
 * Only spawns 1 tiny ember every 10-20 seconds.
 * Each ember drifts upward with slight horizontal wander.
 * CSS handles the animation (transform + opacity only).
 * Respects prefers-reduced-motion.
 */

let fireEl = null;
let emberTimeout = null;

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function spawnEmber() {
  if (!fireEl || !fireEl.isConnected) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ember = document.createElement('div');
  ember.className = 'campfire__ember';

  // Random start position near fire
  const startX = rand(12, 28);
  ember.style.left = startX + 'px';
  ember.style.bottom = rand(20, 35) + 'px';

  // Random drift direction
  ember.style.setProperty('--ember-dx', rand(-15, 15) + 'px');
  ember.style.setProperty('--ember-dy', rand(-40, -80) + 'px');

  // Random duration
  ember.style.animationDuration = rand(2.5, 4.5) + 's';

  fireEl.appendChild(ember);

  // Remove after animation
  setTimeout(() => ember.remove(), 5000);

  // Schedule next
  emberTimeout = setTimeout(spawnEmber, rand(10000, 20000));
}

export function initCampfire(container) {
  if (!container) return;

  fireEl = container.querySelector('.campfire__fire');
  if (!fireEl) return;

  // First ember after 5-10 seconds
  emberTimeout = setTimeout(spawnEmber, rand(5000, 10000));
}

export function destroyCampfire() {
  if (emberTimeout) {
    clearTimeout(emberTimeout);
    emberTimeout = null;
  }
  fireEl = null;
}
