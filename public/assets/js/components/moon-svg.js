/**
 * Parametric moon-phase SVG generator.
 *
 * Returns a self-contained inline SVG string showing any phase 0..1.
 *
 * Geometry:
 *   - dark disc = full circle
 *   - lit area  = outer half-circle arc + inner ellipse arc whose
 *                 rx = 48 * |1 - 2*illumination|
 *   - outer arc sweep flag : waxing=1, waning=0  (lit side: right vs left)
 *   - inner arc sweep flag : matches outer when gibbous (illum>0.5),
 *                            opposite when crescent
 *
 * No images, no CSS transforms — geometry is mirrored by the path itself,
 * so the icon renders identically in LTR and RTL contexts.
 *
 * @param {number} illumination — 0..1
 * @param {boolean} waxing
 * @param {Object} [opts]
 * @param {string} [opts.litColor]  — default '#F0E6C9'
 * @param {string} [opts.darkColor] — default '#0a0e2a'
 * @param {string} [opts.ringColor] — outline for new-moon, default '#2A3470'
 * @param {string} [opts.aria]      — aria-label; default aria-hidden
 * @returns {string} svg markup
 */
export function moonSvg(illumination, waxing, opts = {}) {
  const lit  = opts.litColor  || '#F0E6C9';
  const dark = opts.darkColor || '#0a0e2a';
  const ring = opts.ringColor || '#2A3470';
  const aria = opts.aria
    ? ` role="img" aria-label="${opts.aria.replace(/"/g, '&quot;')}"`
    : ' aria-hidden="true"';

  if (illumination <= 0.005) {
    return `<svg viewBox="0 0 100 100"${aria}>` +
      `<circle cx="50" cy="50" r="48" fill="${dark}" stroke="${ring}" stroke-width="0.8"/>` +
      `</svg>`;
  }
  if (illumination >= 0.995) {
    return `<svg viewBox="0 0 100 100"${aria}>` +
      `<circle cx="50" cy="50" r="48" fill="${lit}"/>` +
      `</svg>`;
  }

  const rx = 48 * Math.abs(1 - 2 * illumination);
  const isGibbous = illumination > 0.5;
  const outerSweep = waxing ? 1 : 0;
  const innerSweep = isGibbous ? outerSweep : (1 - outerSweep);

  return `<svg viewBox="0 0 100 100"${aria}>` +
    `<circle cx="50" cy="50" r="48" fill="${dark}"/>` +
    `<path d="M50,2 A48,48 0 0,${outerSweep} 50,98 A${rx.toFixed(2)},48 0 0,${innerSweep} 50,2 Z" fill="${lit}"/>` +
    `</svg>`;
}
