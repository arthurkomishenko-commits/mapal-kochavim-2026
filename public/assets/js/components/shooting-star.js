/**
 * Shooting Stars — realistic Perseid meteor physics
 *
 * Based on GPT consultation + CodePen best practices.
 *
 * Key principles:
 * - Tiny core (1.5–3px), long trail (90–220px)
 * - cubic-bezier easing, NOT linear
 * - Peak brightness in the MIDDLE of flight, not at start
 * - Color: blue→warm white→pure white (trail gradient)
 * - Rare "bolide" super-bright events every 40-90s
 * - Natural spawning: 3-8s gaps with occasional 0.4-0.9s bursts
 */

let meteorLayer = null;
let loopTimeout = null;
let bolideTimeout = null;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function spawnMeteor(isBolide = false) {
  if (!meteorLayer || !meteorLayer.isConnected || prefersReducedMotion()) return;

  const meteor = document.createElement('div');
  meteor.className = isBolide ? 'meteor meteor--bolide' : 'meteor';

  const trail = document.createElement('div');
  trail.className = 'meteor__trail';
  meteor.appendChild(trail);

  // Start position: upper sky, spread across width
  const startX = rand(-10, 80);
  const startY = rand(-15, 25);

  // Always downward: 28–62° from horizontal
  const angle = rand(28, 62);

  // Duration: bolides are slower, regular vary
  const duration = isBolide
    ? rand(2200, 3200)
    : rand(1400, 2600);

  // Core size: tiny
  const size = isBolide
    ? rand(3, 4.5)
    : rand(1.5, 3);

  // Trail: long is key to realism
  const trailLength = isBolide
    ? rand(180, 300)
    : rand(90, 200);

  // Travel distance along the rotated axis
  const travel = isBolide
    ? rand(50, 75)
    : rand(30, 60);

  meteor.style.left = `${startX}vw`;
  meteor.style.top = `${startY}vh`;
  meteor.style.setProperty('--angle', `${angle}deg`);
  meteor.style.setProperty('--duration', `${duration}ms`);
  meteor.style.setProperty('--size', `${size}px`);
  meteor.style.setProperty('--trail-length', `${trailLength}px`);
  meteor.style.setProperty('--travel', `${travel}vw`);

  meteorLayer.appendChild(meteor);

  setTimeout(() => meteor.remove(), duration + 300);
}

function meteorLoop() {
  if (!meteorLayer || !meteorLayer.isConnected || prefersReducedMotion()) return;

  spawnMeteor();

  // 18% chance of quick burst (second meteor within 0.4-0.9s)
  const next = Math.random() < 0.18
    ? rand(400, 900)
    : rand(3500, 8000);

  loopTimeout = setTimeout(meteorLoop, next);
}

function bolideLoop() {
  if (!meteorLayer || !meteorLayer.isConnected || prefersReducedMotion()) return;

  spawnMeteor(true);

  // Next bolide in 40-90 seconds
  bolideTimeout = setTimeout(bolideLoop, rand(40_000, 90_000));
}

export function initShootingStar(containerEl) {
  // Cleanup previous
  if (loopTimeout) { clearTimeout(loopTimeout); loopTimeout = null; }
  if (bolideTimeout) { clearTimeout(bolideTimeout); bolideTimeout = null; }

  // Create or find meteor layer
  meteorLayer = containerEl?.querySelector('.meteor-layer');
  if (!meteorLayer && containerEl) {
    meteorLayer = document.createElement('div');
    meteorLayer.className = 'meteor-layer';
    meteorLayer.setAttribute('aria-hidden', 'true');
    containerEl.appendChild(meteorLayer);
  }

  if (!meteorLayer || prefersReducedMotion()) return;

  // Start regular loop
  loopTimeout = setTimeout(meteorLoop, rand(800, 1500));

  // Start bolide loop (first one in 15-30s)
  bolideTimeout = setTimeout(bolideLoop, rand(15_000, 30_000));

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches) {
      if (loopTimeout) { clearTimeout(loopTimeout); loopTimeout = null; }
      if (bolideTimeout) { clearTimeout(bolideTimeout); bolideTimeout = null; }
    } else {
      meteorLoop();
      bolideTimeout = setTimeout(bolideLoop, rand(15_000, 30_000));
    }
  });
}
