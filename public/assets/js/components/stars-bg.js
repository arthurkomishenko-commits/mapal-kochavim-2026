/**
 * Global Star Background — generates box-shadow star layers
 *
 * Creates 3 layers of stars via box-shadow on fixed elements.
 * Each layer: different count, size, color palette.
 * Box-shadow is computed once and never changes — zero animation cost.
 * Only the bright layer has a subtle CSS opacity animation.
 *
 * Star distribution avoids center (readability zone)
 * and concentrates toward edges for natural depth.
 */

// Realistic star color palette
const COLORS_FAINT = [
  'rgba(243,238,223,', // warm white
  'rgba(202,216,255,', // cool blue
  'rgba(243,238,223,', // warm white (weighted)
  'rgba(255,248,240,', // pale warm
];

const COLORS_BRIGHT = [
  'rgba(243,238,223,', // warm white
  'rgba(255,232,160,', // amber
  'rgba(202,216,255,', // blue
  'rgba(255,210,160,', // orange
];

function rand(a, b) { return a + Math.random() * (b - a); }

/**
 * Generate box-shadow string for a star layer.
 * Stars avoid the center readability zone.
 */
function generateStars(count, maxW, maxH, colors, alphaRange) {
  const shadows = [];
  for (let i = 0; i < count; i++) {
    let x = Math.round(rand(0, maxW));
    let y = Math.round(rand(0, maxH));

    // Reduce density in center (readability zone)
    const cx = maxW / 2, cy = maxH * 0.4;
    const dx = (x - cx) / cx, dy = (y - cy) / cy;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
    if (distFromCenter < 0.4 && Math.random() > 0.3) continue; // skip 70% of center stars

    const color = colors[Math.floor(rand(0, colors.length))];
    const alpha = rand(alphaRange[0], alphaRange[1]).toFixed(2);

    shadows.push(`${x}px ${y}px 0 ${color}${alpha})`);
  }
  return shadows.join(',');
}

/**
 * Initialize star background.
 * Call once on page load — stars are static after generation.
 */
export function initStarsBg() {
  const container = document.getElementById('stars-bg');
  if (!container) return;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobile = w < 768;

  // Layer 1: faint (many, tiny, dim)
  const faint = container.querySelector('.stars-bg__faint');
  if (faint) {
    faint.style.boxShadow = generateStars(
      isMobile ? 150 : 400, w, h, COLORS_FAINT, [0.08, 0.25]
    );
  }

  // Layer 2: medium (fewer, slightly brighter)
  const medium = container.querySelector('.stars-bg__medium');
  if (medium) {
    medium.style.boxShadow = generateStars(
      isMobile ? 40 : 120, w, h, COLORS_FAINT, [0.2, 0.45]
    );
  }

  // Layer 3: bright (rare, warm colors)
  const bright = container.querySelector('.stars-bg__bright');
  if (bright) {
    bright.style.boxShadow = generateStars(
      isMobile ? 12 : 35, w, h, COLORS_BRIGHT, [0.4, 0.7]
    );
  }
}

/**
 * Set page sky density.
 */
export function setSkySensity(level) {
  document.documentElement.setAttribute('data-sky', level);
}

// Page → density mapping
export const SKY_LEVELS = {
  home: 'rich',
  sky: 'astronomy',
  place: 'normal',
  pack: 'quiet',
  rsvp: 'quiet',
  me: 'quiet',
  safety: 'minimal',
  gallery: 'normal',
  '404': 'normal',
};
