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

/**
 * Zenithal (looking UP) projection.
 * Center of screen = zenith. Edges = horizon.
 * South is at the bottom, North at top.
 * MW appears as a near-vertical band through center.
 */
/**
 * Zenithal projection — visually tuned so MW core lands near screen center.
 * Projection center offset left+up so the bright Sagittarius region
 * (az≈218, alt≈18) appears at roughly (45%, 40%) of screen.
 */
function azAltToXY(az, alt, W, H) {
  const r = 1 - alt / 90;
  // Rotate: az=220 (MW core direction) points toward bottom-center
  const theta = (az - 220) * PI / 180;
  const scale = min(W, H) * 0.5;
  // Center offset: push left and up so MW core moves to screen center
  const cx = W * 0.32;
  const cy = H * 0.12;
  const x = cx + sin(theta) * r * scale;
  const y = cy + cos(theta) * r * scale;
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

// MW path with unwrapped azimuths (continuous, no 0/360 jump)
// Path goes 212→215→...→340→365(=5)→...→435(=75)
const MW_U = MW_PATH.map(pt => {
  let uaz = pt.az;
  if (uaz < 180) uaz += 360; // unwrap across 0° boundary
  return { ...pt, uaz };
});

// Distance from a point to MW center line (returns 0-1, 1=on center)
function mwProximity(az, alt) {
  // Unwrap query azimuth same way
  let uaz = az;
  if (uaz < 180) uaz += 360;

  let best = 0;
  for (let i = 0; i < MW_U.length - 1; i++) {
    const a = MW_U[i], b = MW_U[i + 1];

    const dAz = b.uaz - a.uaz;
    const dAlt = b.alt - a.alt;
    const len2 = dAz * dAz + dAlt * dAlt + 0.001;
    const t = max(0, min(1, ((uaz - a.uaz) * dAz + (alt - a.alt) * dAlt) / len2));

    const pAz = a.uaz + t * dAz;
    const pAlt = a.alt + t * dAlt;
    const pW = a.w + t * (b.w - a.w);
    const pB = a.b + t * (b.b - a.b);

    const dist = sqrt((uaz - pAz) ** 2 + (alt - pAlt) ** 2);

    const sigma = pW * 0.4;
    if (dist < pW * 1.5) {
      const factor = Math.exp(-(dist * dist) / (2 * sigma * sigma));
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
    // Full sky hemisphere
    const az = rand(0, 360);
    const alt = rand(0, 90);
    if (alt < 0) continue;

    // Probability density
    const sb = skyBrightness(alt);
    const mw = mwProximity(az, alt);
    const cloud = cloudMultiplier(az, alt);
    const dark = darkNebulaFactor(az, alt);

    // Base probability ensures EVERY part of sky has stars.
    // MW multiplier adds density on top, doesn't create empty zones.
    const baseDensity = 0.25; // base sky
    const mwBoost = mw * 8;  // up to 9x denser in MW center
    let prob = (baseDensity + mwBoost) * sb * cloud * (1 - dark * 0.6);

    // Normalize
    prob = min(prob / 3, 0.95);

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

    // Alpha — MW brighter than surroundings, but not white blobs
    let a;
    if (mw > 0.5) {
      a = rand(0.25, 0.75);  // MW core
    } else if (mw > 0.2) {
      a = rand(0.15, 0.55);  // MW band
    } else if (mw > 0.05) {
      a = rand(0.08, 0.35);  // MW fringe
    } else {
      a = rand(0.04, 0.22);  // general sky
    }
    // Sky brightness (horizon dimmer)
    a *= (0.4 + sb * 0.6); // floor at 40% so horizon isn't empty
    // Dark nebula dims
    a *= (1 - dark * 0.6);

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

    // Parallax — smooth lerp toward target
    this.parallaxX = 0;
    this.parallaxY = 0;
    this._targetPX = 0;
    this._targetPY = 0;

    this._isMobile = window.innerWidth < 768;

    if (!this._isMobile) {
      // Desktop only — subtle mouse parallax
      this._onMouse = (e) => {
        this._targetPX = (e.clientX / window.innerWidth - 0.5) * 16;
        this._targetPY = (e.clientY / window.innerHeight - 0.5) * 10;
      };
      window.addEventListener('mousemove', this._onMouse, { passive: true });
    }
    // No gyro parallax on mobile — saves battery and avoids jank

    // Bind
    this._onResize = this._debounce(() => this.render(), 200);
    window.addEventListener('resize', this._onResize);
  }


  render() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    this.W = W;
    this.H = H;

    // Size main canvas (slightly oversized for parallax headroom)
    this.canvas.width = W + 50;
    this.canvas.height = H + 40;
    this.canvas.style.marginLeft = '-25px';
    this.canvas.style.marginTop = '-20px';

    // Static buffer = same as canvas
    const CW = this.canvas.width;
    const CH = this.canvas.height;
    this.staticCanvas = document.createElement('canvas');
    this.staticCanvas.width = CW;
    this.staticCanvas.height = CH;
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
    const grad = sCtx.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, '#060A1A');
    grad.addColorStop(0.7, '#080D22');
    grad.addColorStop(1, '#0E1230');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, CW, CH);

    // ── Layer 2: 35K background stars via ImageData ──
    const isMobile = W < 768;
    const starCount = isMobile ? 8000 : 35000;

    this.bgStars = generateStars(starCount, CW, CH);
    const s = this.bgStars;

    const imgData = sCtx.getImageData(0, 0, CW, CH);
    const data = imgData.data;

    for (let i = 0; i < s.count; i++) {
      const px = floor(s.x[i]);
      const py = floor(s.y[i]);
      const sz = s.size[i];
      const al = s.alpha[i];

      const wr = floor(s.r[i] * al);
      const wg = floor(s.g[i] * al);
      const wb = floor(s.b[i] * al);

      if (sz === 1) {
        const idx = (py * CW + px) * 4;
        if (idx >= 0 && idx < data.length - 3) {
          data[idx]     = max(data[idx], wr);
          data[idx + 1] = max(data[idx + 1], wg);
          data[idx + 2] = max(data[idx + 2], wb);
        }
      } else {
        const half = floor(sz / 2);
        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            const nx = px + dx;
            const ny = py + dy;
            if (nx < 0 || nx >= CW || ny < 0 || ny >= CH) continue;
            const idx = (ny * CW + nx) * 4;
            const fade = (dx === 0 && dy === 0) ? 1 : 0.55;
            data[idx]     = max(data[idx], floor(wr * fade));
            data[idx + 1] = max(data[idx + 1], floor(wg * fade));
            data[idx + 2] = max(data[idx + 2], floor(wb * fade));
          }
        }
      }
    }

    sCtx.putImageData(imgData, 0, 0);

    // ── Layer 3: MW glow (offscreen blur) ──
    this._renderMWGlow(sCtx, CW, CH);

    // ── Layer 4: Named stars with glow ──
    this._renderNamedStars(sCtx, CW, CH);

    // ── Composite static buffer to main canvas (centered, with parallax room) ──
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
      // Many smaller circles along the path for smooth blending
      const radius = max(pt.w * max(gW, gH) / 180 * 0.55, 8);
      const alpha = pt.b * 0.025;
      const isCenter = pt.b >= 0.95;
      const color = isCenter ? '215,210,200' : '205,210,220';

      // 5 scattered circles per point for smooth coverage
      for (let j = 0; j < 5; j++) {
        const ox = px + (Math.random() - 0.5) * radius * 0.8;
        const oy = py + (Math.random() - 0.5) * radius * 0.6;
        const r = radius * (0.6 + Math.random() * 0.5);
        gCtx.beginPath();
        gCtx.arc(ox, oy, r, 0, PI * 2);
        gCtx.fillStyle = `rgba(${color},${(alpha * (0.7 + Math.random() * 0.3)).toFixed(3)})`;
        gCtx.fill();
      }
    }

    // Star clouds — subtle brighter patches
    for (const c of STAR_CLOUDS) {
      const [px, py] = azAltToXY(c.az, c.alt, gW, gH);
      const rx = max(c.w * max(gW,gH) / 180 * 0.5, 4);
      const ry = max(c.h * max(gW,gH) / 180 * 0.5, 3);
      gCtx.beginPath();
      gCtx.ellipse(px, py, rx, ry, 0, 0, PI * 2);
      gCtx.fillStyle = `rgba(220,215,205,${(c.b * 0.025).toFixed(3)})`;
      gCtx.fill();
    }

    // Multi-pass blur: 4 downscale steps for maximum smoothness
    let blurSrc = gCanvas;
    for (let pass = 0; pass < 4; pass++) {
      const nextW = max(floor(blurSrc.width / 2), 4);
      const nextH = max(floor(blurSrc.height / 2), 4);
      const step = document.createElement('canvas');
      step.width = nextW;
      step.height = nextH;
      step.getContext('2d').drawImage(blurSrc, 0, 0, nextW, nextH);
      blurSrc = step;
    }

    // Composite — gentle glow, not bright patches
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.drawImage(blurSrc, 0, 0, W, H);
    ctx.restore();
  }

  _renderNamedStars(ctx, W, H) {
    for (const star of this.namedStars) {
      if (star.alt < 0) continue;
      const [px, py] = azAltToXY(star.az, star.alt, W, H);
      if (px < 0 || px > W || py < 0 || py > H) continue;

      const color = SPECTRAL[star.cl] || '#F0F0FF';
      const [cr, cg, cb] = hexToRGB(color);

      // Glow radius — scales with brightness but not too big for dim stars
      let glowR;
      if (star.mag < 0) glowR = 14;       // Arcturus, Vega — biggest
      else if (star.mag < 0.5) glowR = 11;
      else if (star.mag < 1) glowR = 8;
      else if (star.mag < 1.5) glowR = 6;
      else if (star.mag < 2) glowR = 4.5;
      else if (star.mag < 2.5) glowR = 3.5;
      else glowR = 2.5; // dim named stars — small glow

      // Outer glow
      const outerGrad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
      outerGrad.addColorStop(0, `rgba(${cr},${cg},${cb},0.85)`);
      outerGrad.addColorStop(0.15, `rgba(${cr},${cg},${cb},0.5)`);
      outerGrad.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.15)`);
      outerGrad.addColorStop(0.7, `rgba(${cr},${cg},${cb},0.03)`);
      outerGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(px, py, glowR, 0, PI * 2);
      ctx.fillStyle = outerGrad;
      ctx.fill();

      // White core — proportional to glow
      const coreR = max(0.6, glowR * 0.15);
      ctx.beginPath();
      ctx.arc(px, py, coreR, 0, PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fill();

      // Diffraction spikes for brightest (mag < 0.8)
      if (star.mag < 0.8) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.6)`;
        ctx.lineWidth = 0.6;
        const spikeLen = glowR * 2;
        ctx.beginPath();
        ctx.moveTo(px - spikeLen, py); ctx.lineTo(px + spikeLen, py);
        ctx.moveTo(px, py - spikeLen); ctx.lineTo(px, py + spikeLen);
        ctx.stroke();
        ctx.restore();
      }

      // Horizon chromatic dispersion
      if (star.alt < 15) {
        ctx.fillStyle = 'rgba(255,100,100,0.12)';
        ctx.fillRect(px - 2, py, 1, 1);
        ctx.fillStyle = 'rgba(100,160,255,0.12)';
        ctx.fillRect(px + 2, py, 1, 1);
      }
    }
  }

  // ── Twinkling ──

  _prepareTwinkle(W, H) {
    this.twinkleStars = [];

    for (const star of this.namedStars) {
      if (star.alt < 0 || star.mag > 2.5) continue; // only ~30 brightest
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

    let frameCount = 0;

    function frame(ts) {
      // ── Desktop parallax only ──
      if (!self._isMobile) {
        self.parallaxX += (self._targetPX - self.parallaxX) * 0.06;
        self.parallaxY += (self._targetPY - self.parallaxY) * 0.06;
        const tx = `translate3d(${self.parallaxX.toFixed(1)}px,${self.parallaxY.toFixed(1)}px,0)`;
        self.canvas.style.transform = tx;
        if (self.overlayCanvas) self.overlayCanvas.style.transform = tx;
      }

      // ── Twinkle: throttled (desktop 15fps, mobile 10fps) ──
      frameCount++;
      const throttle = self._isMobile ? 6 : 4;
      if (frameCount % throttle === 0) {
        const ctx = self.overlayCtx;
        const W = self.overlayCanvas.width;
        const H = self.overlayCanvas.height;
        ctx.clearRect(0, 0, W, H);

        const t = ts / 1000;
        for (const s of self.twinkleStars) {
          const flicker =
            0.55 +
            0.25 * sin(t * s.f1 + s.p1) +
            0.15 * sin(t * s.f2 + s.p2) +
            0.08 * sin(t * s.f3 + s.p3);

          const alpha = s.minFlicker + flicker * (1 - s.minFlicker);

          ctx.beginPath();
          ctx.arc(s.px, s.py, s.glowR * 0.4, 0, PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${(alpha * 0.7).toFixed(2)})`;
          ctx.fill();
        }
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
    window.removeEventListener('mousemove', this._onMouse);
    if (this.overlayCanvas && this.overlayCanvas.parentElement) {
      this.overlayCanvas.remove();
    }
  }

  _debounce(fn, ms) {
    let timer;
    return () => { clearTimeout(timer); timer = setTimeout(fn, ms); };
  }
}
