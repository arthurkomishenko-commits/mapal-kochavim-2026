/**
 * Star Field — generates a realistic star sky
 *
 * Creates ~120 stars on desktop, ~60 on mobile.
 * Each star has random position, size, brightness, and twinkle timing.
 * Respects prefers-reduced-motion.
 */

const STAR_COUNT_DESKTOP = 120;
const STAR_COUNT_MOBILE = 60;
const MOBILE_BREAKPOINT = 768;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createStar() {
  const star = document.createElement('div');

  // Size: most stars tiny (1-1.5px), few larger (2-3px)
  const sizeRoll = Math.random();
  let size;
  if (sizeRoll < 0.6) size = randomBetween(0.8, 1.2);
  else if (sizeRoll < 0.85) size = randomBetween(1.3, 1.8);
  else if (sizeRoll < 0.95) size = randomBetween(2, 2.5);
  else size = randomBetween(2.5, 3);

  // Position
  const x = randomBetween(1, 99);
  const y = randomBetween(1, 95);

  // Twinkle timing — each star is unique
  const duration = randomBetween(3, 8);
  const delay = randomBetween(0, 5);
  const minOpacity = randomBetween(0.15, 0.5);
  const maxOpacity = randomBetween(0.6, 1);

  // Color: most white/cream, ~15% warm (gold)
  const isWarm = Math.random() < 0.15;
  const isBright = size > 2;

  // Build class list
  let className = 'star';
  if (isWarm) className += ' star--warm';
  if (isBright) className += ' star--bright';
  star.className = className;

  // Apply styles via CSS custom properties
  star.style.cssText = `
    left: ${x}%;
    top: ${y}%;
    width: ${size}px;
    height: ${size}px;
    --star-duration: ${duration}s;
    --star-delay: ${delay}s;
    --star-min-opacity: ${minOpacity};
    --star-max-opacity: ${maxOpacity};
  `;

  star.setAttribute('aria-hidden', 'true');

  return star;
}

export function initStarField(container) {
  if (!container) return;

  // Clear any existing stars
  container.querySelectorAll('.star').forEach(s => s.remove());

  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  const count = isMobile ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    fragment.appendChild(createStar());
  }
  container.appendChild(fragment);
}
