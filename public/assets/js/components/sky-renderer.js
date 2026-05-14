/**
 * SkyRenderer — Canvas 2D night sky engine
 *
 * 35,000 stars via ImageData pixel writes
 * Milky Way from density + subtle glow overlay
 * 72 named stars with radialGradient glow
 * Twinkling via overlay canvas, multi-frequency sine
 *
 * Architecture consultations: Gemini (data) + GPT (rendering)
 */

// ═══════════════════════════════════════════════════════
// ASTRONOMICAL DATA
// ═══════════════════════════════════════════════════════

const MW_PATH = [
  {az:212,alt:3,w:20,b:.60},{az:215,alt:10,w:28,b:.80},
  {az:218,alt:18,w:35,b:1.0},{az:222,alt:26,w:32,b:.90},
  {az:228,alt:38,w:28,b:.95},{az:235,alt:48,w:22,b:.70},
  {az:245,alt:58,w:18,b:.60},{az:260,alt:68,w:16,b:.65},
  {az:285,alt:76,w:22,b:.75},{az:340,alt:82,w:26,b:.85},
  {az:5,alt:78,w:24,b:.80},{az:18,alt:70,w:18,b:.50},
  {az:28,alt:60,w:16,b:.45},{az:38,alt:50,w:20,b:.60},
  {az:45,alt:40,w:18,b:.55},{az:50,alt:32,w:15,b:.50},
  {az:56,alt:22,w:14,b:.40},{az:62,alt:14,w:12,b:.35},
  {az:68,alt:6,w:10,b:.25},{az:75,alt:1,w:8,b:.15},
];

const STAR_CLOUDS = [
  {az:219,alt:20,w:4.5,h:3,b:1.0},
  {az:217,alt:14,w:3.5,h:2.5,b:.9},
  {az:225,alt:39,w:5,h:4,b:.95},
  {az:340,alt:81,w:12,h:8,b:.85},
  {az:50,alt:32,w:6,h:4,b:.5},
];

const DARK_NEBULAE = [
  {az:320,alt:80,w:8,h:20,d:.85},
  {az:240,alt:55,w:6,h:18,d:.80},
  {az:222,alt:35,w:5,h:12,d:.75},
  {az:210,alt:18,w:7,h:4,d:.90},
  {az:208,alt:22,w:10,h:8,d:.80},
  {az:345,alt:78,w:3,h:4,d:.70},
];

const SKY_BRIGHT = [
  {alt:0,v:.15},{alt:10,v:.40},{alt:20,v:.60},{alt:30,v:.75},
  {alt:45,v:.88},{alt:60,v:.95},{alt:75,v:.98},{alt:90,v:1.0},
];

const DENSITY_REGIONS = [
  {az:295,alt:15,w:5,h:5,m:2.5},
  {az:56,alt:22,w:3,h:3,m:3.0},
  {az:75,alt:5,w:2,h:2,m:5.0},
  {az:240,alt:35,w:1.5,h:1.5,m:2.0},
];

const SPECTRAL = {
  O:'#9BB0FF',B:'#AABFFF',A:'#F0F0FF',
  F:'#FFFAE4',G:'#FFE8A0',K:'#FFD2A0',M:'#FFB56B',
};

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

const PI = Math.PI;
const sin = Math.sin;
const cos = Math.cos;
const sqrt = Math.sqrt;
const abs = Math.abs;
const floor = Math.floor;
const max = Math.max;
const min = Math.min;

function rand(a, b) { return a + Math.random() * (b - a); }

function hexToRGB(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function azAltToXY(az, alt, W, H) {
  const x = ((az - 180 + 540) % 360) / 360 * W;
  const y = (1 - sin(alt * PI / 180)) * H * 0.95;
  return [x, y];
}

// Interpolate sky brightness for given altitude
function skyBrightness(alt) {
  if (alt <= 0) return 0.15;
  if (alt >= 90) return 1.0;
  for (let i = 0; i < SKY_BRIGHT.length - 1; i++) {
    const a = SKY_BRIGHT[i], b = SKY_BRIGHT[i + 1];
    if (alt >= a.alt && alt <= b.alt) {
      const t = (alt - a.alt) / (b.alt - a.alt);
      return a.v + t * (b.v - a.v);
    }
  }
  return 1.0;
}

// Distance from a point to MW center line (returns 0-1, 1=on the line)
function mwProximity(az, alt) {
  let best = 0;
  for (let i = 0; i < MW_PATH.length - 1; i++) {
    const a = MW_PATH[i], b = MW_PATH[i + 1];
    // Project point onto segment
    const t = max(0, min(1,
      ((az - a.az) * (b.az - a.az) + (alt - a.alt) * (b.alt - a.alt)) /
      ((b.az - a.az) ** 2 + (b.alt - a.alt) ** 2 + 0.001)
    ));
    const pAz = a.az + t * (b.az - a.az);
    const pAlt = a.alt + t * (b.alt - a.alt);
    const pW = a.w + t * (b.w - a.w);
    const pB = a.b + t * (b.b - a.b);

    const dist = sqrt((az - pAz) ** 2 + (alt - pAlt) ** 2);
    const halfW = pW / 2;

    if (dist < halfW) {
      // Gaussian falloff from center
      const factor = Math.exp(-(dist * dist) / (2 * (halfW * 0.5) ** 2));
      const val = factor * pB;
      if (val > best) best = val;
    }
  }
  return best;
}

// Check if point is inside a dark nebula (returns darkening factor 0-1)
function darkNebulaFactor(az, alt) {
  let darkest = 0;
  for (const n of DARK_NEBULAE) {
    const dAz = abs(az - n.az);
    const dAlt = abs(alt - n.alt);
    const rAz = n.w / 2;
    const rAlt = n.h / 2;
    if (dAz < rAz * 1.5 && dAlt < rAlt * 1.5) {
      // Gaussian falloff — not binary
      const distNorm = sqrt((dAz / rAz) ** 2 + (dAlt / rAlt) ** 2);
      if (distNorm < 1.5) {
        const factor = Math.exp(-distNorm * distNorm * 1.5) * n.d;
        if (factor > darkest) darkest = factor;
      }
    }
  }
  return darkest;
}

// Star cloud density multiplier
function cloudMultiplier(az, alt) {
  let mult = 1;
  for (const c of STAR_CLOUDS) {
    const dAz = abs(az - c.az);
    const dAlt = abs(alt - c.alt);
    if (dAz < c.w && dAlt < c.h) {
      const distNorm = sqrt((dAz / c.w) ** 2 + (dAlt / c.h) ** 2);
      const factor = Math.exp(-distNorm * distNorm * 2) * c.b;
      mult += factor * 3;
    }
  }
  // Additional density regions
  for (const r of DENSITY_REGIONS) {
    const dAz = abs(az - r.az);
    const dAlt = abs(alt - r.alt);
    if (dAz < r.w && dAlt < r.h) {
      mult += (r.m - 1) * Math.exp(-((dAz / r.w) ** 2 + (dAlt / r.h) ** 2) * 2);
    }
  }
  return mult;
}

// ═══════════════════════════════════════════════════════
// STAR GENERATION — Typed Arrays
// ═══════════════════════════════════════════════════════

// Star color presets (RGB)
const STAR_COLORS = [
  [255, 252, 248], [255, 252, 248], [255, 252, 248], [255, 252, 248], // white 50%
  [255, 252, 248], [255, 248, 240], [255, 245, 230],
  [255, 240, 210], [255, 240, 210],  // warm 15%
  [200, 215, 255], [200, 215, 255],  // cool 12%
  [255, 235, 180],  // yellow 5%
  [255, 210, 160],  // orange 3%
];

function generateStars(count, W, H) {
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const alpha = new Float32Array(count);
  const r = new Uint8Array(count);
  const g = new Uint8Array(count);
  const b = new Uint8Array(count);
  const size = new Uint8Array(count); // 1, 2, or 3 (pixel diameter)

  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 8;

  while (placed < count && attempts < maxAttempts) {
    attempts++;

    // Random sky position in az/alt
    const az = rand(0, 360);
    const alt = rand(-2, 90);
    if (alt < 0) continue;

    // Probability density
    const sb = skyBrightness(alt);
    const mw = mwProximity(az, alt);
    const cloud = cloudMultiplier(az, alt);
    const dark = darkNebulaFactor(az, alt);

    let prob = sb * (1 + mw * 8) * cloud * (1 - dark * 0.7);

    // Normalize — max theoretical is ~1 * 9 * 5 * 1 = 45
    prob = prob / 12; // target acceptance ~30-50%

    if (Math.random() > prob) continue;

    // Project to canvas
    const [px, py] = azAltToXY(az, alt, W, H);
    if (px < 0 || px >= W || py < 0 || py >= H) continue;

    // Color — near horizon: shift warm (atmospheric extinction)
    const colorIdx = floor(rand(0, STAR_COLORS.length));
    let [cr, cg, cb] = STAR_COLORS[colorIdx];
    if (alt < 12) {
      cr = min(255, cr + 10);
      cg = max(0, cg - 5);
      cb = max(0, cb - 15);
    }

    // Alpha — brighter in MW, dimmer at horizon
    let a;
    if (mw > 0.5) {
      a = rand(0.08, 0.45) * sb;
    } else if (mw > 0.1) {
      a = rand(0.05, 0.35) * sb;
    } else {
      a = rand(0.03, 0.25) * sb;
    }
    // Dark nebula dims further
    a *= (1 - dark * 0.5);

    // Size — mostly 1px
    const sizeRoll = Math.random();
    let sz = 1;
    if (sizeRoll > 0.98) sz = 3;
    else if (sizeRoll > 0.90) sz = 2;

    x[placed] = px;
    y[placed] = py;
    alpha[placed] = a;
    r[placed] = cr;
    g[placed] = cg;
    b[placed] = cb;
    size[placed] = sz;
    placed++;
  }

  return { x, y, alpha, r, g, b, size, count: placed };
}

// ═══════════════════════════════════════════════════════
// SKY RENDERER CLASS
// ═══════════════════════════════════════════════════════

export default class SkyRenderer {
  constructor(canvas, namedStars = []) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.namedStars = namedStars;

    // Offscreen buffers
    this.staticCanvas = null;
    this.staticCtx = null;
    this.overlayCanvas = null;
    this.overlayCtx = null;

    // Star data
    this.bgStars = null;
    this.twinkleStars = [];

    // Animation
    this.rafId = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Bind
    this._onResize = this._debounce(() => this.render(), 200);
    window.addEventListener('resize', this._onResize);
  }

  render() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Size all canvases
    this.canvas.width = W;
    this.canvas.height = H;

    // Static buffer
    this.staticCanvas = document.createElement('canvas');
    this.staticCanvas.width = W;
    this.staticCanvas.height = H;
    this.staticCtx = this.staticCanvas.getContext('2d');

    // Overlay for twinkling
    if (!this.overlayCanvas) {
      this.overlayCanvas = document.createElement('canvas');
      this.overlayCanvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
      this.canvas.parentElement.appendChild(this.overlayCanvas);
    }
    this.overlayCanvas.width = W;
    this.overlayCanvas.height = H;
    this.overlayCtx = this.overlayCanvas.getContext('2d');

    const sCtx = this.staticCtx;

    // ── Layer 1: Sky gradient ──
    const grad = sCtx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#060A1A');    // zenith — near black
    grad.addColorStop(0.7, '#080D22');
    grad.addColorStop(1, '#0E1230');    // horizon — slightly lighter
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, W, H);

    // ── Layer 2: 35K background stars via ImageData ──
    const isMobile = W < 768;
    const starCount = isMobile ? 12000 : 35000;

    this.bgStars = generateStars(starCount, W, H);
    const s = this.bgStars;

    const imgData = sCtx.getImageData(0, 0, W, H);
    const data = imgData.data;

    for (let i = 0; i < s.count; i++) {
      const px = floor(s.x[i]);
      const py = floor(s.y[i]);
      const sz = s.size[i];
      const a = floor(s.alpha[i] * 255);

      if (sz === 1) {
        // Single pixel
        const idx = (py * W + px) * 4;
        if (idx >= 0 && idx < data.length - 3) {
          // Additive blending onto dark background
          data[idx] = min(255, data[idx] + floor(s.r[i] * s.alpha[i]));
          data[idx + 1] = min(255, data[idx + 1] + floor(s.g[i] * s.alpha[i]));
          data[idx + 2] = min(255, data[idx + 2] + floor(s.b[i] * s.alpha[i]));
          data[idx + 3] = 255;
        }
      } else {
        // 2x2 or 3x3
        const half = floor(sz / 2);
        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            const nx = px + dx;
            const ny = py + dy;
            if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
            const idx = (ny * W + nx) * 4;
            // Center pixel brighter, edges dimmer
            const edgeFade = (dx === 0 && dy === 0) ? 1 : 0.5;
            data[idx] = min(255, data[idx] + floor(s.r[i] * s.alpha[i] * edgeFade));
            data[idx + 1] = min(255, data[idx + 1] + floor(s.g[i] * s.alpha[i] * edgeFade));
            data[idx + 2] = min(255, data[idx + 2] + floor(s.b[i] * s.alpha[i] * edgeFade));
            data[idx + 3] = 255;
          }
        }
      }
    }

    sCtx.putImageData(imgData, 0, 0);

    // ── Layer 3: MW glow (offscreen blur) ──
    this._renderMWGlow(sCtx, W, H);

    // ── Layer 4: Named stars with glow ──
    this._renderNamedStars(sCtx, W, H);

    // ── Composite static buffer to main canvas ──
    this.ctx.drawImage(this.staticCanvas, 0, 0);

    // ── Start twinkling ──
    if (!this.reducedMotion) {
      this._prepareTwinkle(W, H);
      this.startTwinkling();
    }
  }

  _renderMWGlow(ctx, W, H) {
    // Offscreen at 1/4 resolution
    const gW = floor(W / 4);
    const gH = floor(H / 4);
    const gCanvas = document.createElement('canvas');
    gCanvas.width = gW;
    gCanvas.height = gH;
    const gCtx = gCanvas.getContext('2d');

    // Draw soft circles along MW path
    for (const pt of MW_PATH) {
      const [px, py] = azAltToXY(pt.az, pt.alt, gW, gH);
      const radius = pt.w * gW / 360 * 2.5;
      const alpha = pt.b * 0.04; // very subtle

      gCtx.beginPath();
      gCtx.arc(px, py, max(radius, 5), 0, PI * 2);
      // Grey — MW is monochrome to naked eye
      const isCenter = pt.b >= 0.95;
      gCtx.fillStyle = isCenter
        ? `rgba(210,205,195,${alpha})`
        : `rgba(200,205,215,${alpha})`;
      gCtx.fill();
    }

    // Star clouds — brighter patches
    for (const c of STAR_CLOUDS) {
      const [px, py] = azAltToXY(c.az, c.alt, gW, gH);
      const rx = c.w * gW / 360 * 1.5;
      const ry = c.h * gH / 90 * 1.5;
      gCtx.beginPath();
      gCtx.ellipse(px, py, max(rx, 3), max(ry, 2), 0, 0, PI * 2);
      gCtx.fillStyle = `rgba(215,210,200,${c.b * 0.06})`;
      gCtx.fill();
    }

    // Apply blur via CSS on offscreen (draw to temp)
    // Since we can't CSS-blur a canvas in code, use manual blur via multiple passes
    // Simple box blur approximation: draw scaled down then up
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = floor(gW / 3);
    blurCanvas.height = floor(gH / 3);
    const blurCtx = blurCanvas.getContext('2d');
    blurCtx.drawImage(gCanvas, 0, 0, blurCanvas.width, blurCanvas.height);

    // Composite onto main
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.drawImage(blurCanvas, 0, 0, W, H);
    ctx.restore();
  }

  _renderNamedStars(ctx, W, H) {
    for (const star of this.namedStars) {
      if (star.alt < 0) continue;
      const [px, py] = azAltToXY(star.az, star.alt, W, H);
      if (px < 0 || px > W || py < 0 || py > H) continue;

      const color = SPECTRAL[star.cl] || '#F0F0FF';
      const [cr, cg, cb] = hexToRGB(color);
      const glowR = max(2, (3 - star.mag) * 3);

      // Radial gradient glow
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowR);
      gradient.addColorStop(0, `rgba(${cr},${cg},${cb},0.9)`);
      gradient.addColorStop(0.3, `rgba(${cr},${cg},${cb},0.4)`);
      gradient.addColorStop(0.7, `rgba(${cr},${cg},${cb},0.08)`);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(px, py, glowR, 0, PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core dot
      const coreR = max(0.8, (2 - star.mag) * 0.7);
      ctx.beginPath();
      ctx.arc(px, py, coreR, 0, PI * 2);
      ctx.fillStyle = `rgba(255,255,255,0.95)`;
      ctx.fill();

      // Diffraction spikes for brightest (mag < 0.5)
      if (star.mag < 0.5) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        const spikeLen = glowR * 2.5;
        ctx.beginPath();
        ctx.moveTo(px - spikeLen, py);
        ctx.lineTo(px + spikeLen, py);
        ctx.moveTo(px, py - spikeLen);
        ctx.lineTo(px, py + spikeLen);
        ctx.stroke();
        ctx.restore();
      }

      // Horizon chromatic dispersion
      if (star.alt < 15) {
        ctx.fillStyle = 'rgba(255,120,120,0.1)';
        ctx.fillRect(px - 2, py, 1, 1);
        ctx.fillStyle = 'rgba(120,170,255,0.1)';
        ctx.fillRect(px + 2, py, 1, 1);
      }
    }
  }

  // ── Twinkling ──

  _prepareTwinkle(W, H) {
    this.twinkleStars = [];

    for (const star of this.namedStars) {
      if (star.alt < 0) continue;
      const [px, py] = azAltToXY(star.az, star.alt, W, H);
      if (px < 0 || px > W || py < 0 || py > H) continue;

      const color = SPECTRAL[star.cl] || '#F0F0FF';
      const glowR = max(2, (3 - star.mag) * 3);

      // Twinkle params by magnitude
      let period, minFlicker;
      if (star.mag < 0.5)      { period = rand(8000, 12000); minFlicker = 0.92; }
      else if (star.mag < 1.5) { period = rand(5000, 8000);  minFlicker = 0.80; }
      else if (star.mag < 2.5) { period = rand(3500, 6000);  minFlicker = 0.65; }
      else if (star.mag < 3.5) { period = rand(2000, 4000);  minFlicker = 0.45; }
      else                     { period = rand(1500, 3000);  minFlicker = 0.30; }

      if (star.alt < 15) { period *= 0.5; minFlicker *= 0.7; }

      this.twinkleStars.push({
        px, py, color, glowR, mag: star.mag, alt: star.alt, cl: star.cl,
        // 3 frequencies for multi-sine flicker
        f1: 1000 / period,
        f2: 1000 / (period * 0.73),
        f3: 1000 / (period * 0.37),
        p1: rand(0, PI * 2),
        p2: rand(0, PI * 2),
        p3: rand(0, PI * 2),
        minFlicker,
      });
    }
  }

  startTwinkling() {
    if (this.rafId || this.reducedMotion) return;
    const self = this;

    function frame(ts) {
      const ctx = self.overlayCtx;
      const W = self.overlayCanvas.width;
      const H = self.overlayCanvas.height;

      // Clear overlay efficiently
      ctx.clearRect(0, 0, W, H);

      for (const s of self.twinkleStars) {
        // Multi-frequency sine — no obvious periodicity
        const t = ts / 1000;
        const flicker =
          0.55 +
          0.25 * sin(t * s.f1 + s.p1) +
          0.15 * sin(t * s.f2 + s.p2) +
          0.08 * sin(t * s.f3 + s.p3);

        const alpha = s.minFlicker + flicker * (1 - s.minFlicker);

        const [cr, cg, cb] = hexToRGB(s.color);
        const grad = ctx.createRadialGradient(s.px, s.py, 0, s.px, s.py, s.glowR);
        grad.addColorStop(0, `rgba(255,255,255,${(alpha * 0.9).toFixed(2)})`);
        grad.addColorStop(0.3, `rgba(${cr},${cg},${cb},${(alpha * 0.35).toFixed(2)})`);
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(s.px, s.py, s.glowR, 0, PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      self.rafId = requestAnimationFrame(frame);
    }

    this.rafId = requestAnimationFrame(frame);
  }

  stopTwinkling() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy() {
    this.stopTwinkling();
    window.removeEventListener('resize', this._onResize);
    if (this.overlayCanvas && this.overlayCanvas.parentElement) {
      this.overlayCanvas.remove();
    }
  }

  _debounce(fn, ms) {
    let timer;
    return () => { clearTimeout(timer); timer = setTimeout(fn, ms); };
  }
}
