/**
 * Star Field — realistic Negev night sky
 *
 * Data: Gemini (real star positions for 2026-08-13 00:00 IDT, Borot Lotz)
 * Architecture: GPT consultation
 *
 * Projection: cylindrical az→x, sine-compressed alt→y
 * Animation: opacity-only (GPU-safe for iPhone SE)
 * Layers: milky way → faint stars → named stars
 */

// ═══════════════════════════════════════════════════════
// STAR CATALOG — real positions for Borot Lotz, Aug 13 2026 00:00
// ═══════════════════════════════════════════════════════

const BRIGHT_STARS = [
  {n:"Vega",mag:0.03,cl:"A",az:282.4,alt:73.1},
  {n:"Arcturus",mag:-0.05,cl:"K",az:281.5,alt:18.2},
  {n:"Altair",mag:0.77,cl:"A",az:226.8,alt:66.5},
  {n:"Capella",mag:0.08,cl:"G",az:34.5,alt:3.2},
  {n:"Antares",mag:1.06,cl:"M",az:228.4,alt:15.4},
  {n:"Deneb",mag:1.25,cl:"A",az:320.1,alt:81.2},
  {n:"Fomalhaut",mag:1.16,cl:"A",az:142.1,alt:28.5},
  {n:"Polaris",mag:1.97,cl:"F",az:0.0,alt:30.6},
  {n:"Shaula",mag:1.62,cl:"B",az:206.1,alt:12.8},
  {n:"Sargas",mag:1.86,cl:"F",az:198.4,alt:8.1},
  {n:"Kaus Australis",mag:1.85,cl:"B",az:188.4,alt:25.2},
  {n:"Nunki",mag:2.05,cl:"B",az:172.1,alt:33.5},
  {n:"Hamal",mag:2.01,cl:"K",az:58.3,alt:12.4},
  {n:"Diphda",mag:2.04,cl:"K",az:112.5,alt:25.1},
  {n:"Alpheratz",mag:2.06,cl:"B",az:68.4,alt:48.2},
  {n:"Mirach",mag:2.07,cl:"M",az:56.1,alt:35.5},
  {n:"Almach",mag:2.1,cl:"K",az:48.2,alt:42.1},
  {n:"Dubhe",mag:1.81,cl:"K",az:328.5,alt:21.0},
  {n:"Merak",mag:2.34,cl:"A",az:333.1,alt:18.2},
  {n:"Phecda",mag:2.41,cl:"A",az:335.5,alt:25.4},
  {n:"Alioth",mag:1.76,cl:"A",az:334.2,alt:32.5},
  {n:"Mizar",mag:2.23,cl:"A",az:328.6,alt:35.8},
  {n:"Alkaid",mag:1.85,cl:"B",az:320.4,alt:38.1},
  {n:"Kochab",mag:2.07,cl:"K",az:352.4,alt:45.8},
  {n:"Pherkad",mag:3.0,cl:"A",az:348.5,alt:48.2},
  {n:"Eltanin",mag:2.24,cl:"K",az:322.1,alt:55.4},
  {n:"Rastaban",mag:2.79,cl:"G",az:315.4,alt:53.2},
  {n:"Schedar",mag:2.24,cl:"K",az:32.4,alt:52.1},
  {n:"Caph",mag:2.28,cl:"F",az:20.1,alt:55.4},
  {n:"Gamma Cas",mag:2.15,cl:"B",az:35.2,alt:58.1},
  {n:"Ruchbah",mag:2.66,cl:"A",az:42.5,alt:56.4},
  {n:"Segin",mag:3.35,cl:"B",az:48.1,alt:59.2},
  {n:"Mirfak",mag:1.79,cl:"F",az:45.2,alt:31.4},
  {n:"Algol",mag:2.1,cl:"B",az:52.4,alt:25.1},
  {n:"Enif",mag:2.38,cl:"K",az:148.2,alt:68.3},
  {n:"Scheat",mag:2.42,cl:"M",az:85.4,alt:68.1},
  {n:"Markab",mag:2.49,cl:"B",az:105.2,alt:58.4},
  {n:"Algenib",mag:2.83,cl:"B",az:88.4,alt:45.2},
  {n:"Matar",mag:2.93,cl:"G",az:115.4,alt:72.1},
  {n:"Sadr",mag:2.23,cl:"F",az:345.2,alt:78.4},
  {n:"Gienah Cyg",mag:2.48,cl:"K",az:325.5,alt:65.2},
  {n:"Delta Cyg",mag:2.86,cl:"B",az:332.1,alt:85.4},
  {n:"Albireo",mag:3.05,cl:"K",az:296.8,alt:81.3},
  {n:"Tarazed",mag:2.72,cl:"K",az:220.4,alt:68.2},
  {n:"Sulafat",mag:3.25,cl:"B",az:278.4,alt:68.2},
  {n:"Sheliak",mag:3.45,cl:"B",az:275.2,alt:70.1},
  {n:"Rasalhague",mag:2.08,cl:"A",az:255.4,alt:48.1},
  {n:"Cebalrai",mag:2.76,cl:"K",az:250.2,alt:52.4},
  {n:"Sabik",mag:2.43,cl:"A",az:235.2,alt:32.4},
  {n:"Kornephoros",mag:2.78,cl:"G",az:278.4,alt:55.2},
  {n:"Zeta Her",mag:2.81,cl:"G",az:290.4,alt:58.1},
  {n:"Gemma",mag:2.22,cl:"A",az:273.1,alt:38.4},
  {n:"Unukalhai",mag:2.63,cl:"K",az:265.4,alt:35.2},
  {n:"Kaus Media",mag:2.72,cl:"K",az:182.1,alt:30.2},
  {n:"Kaus Borealis",mag:2.82,cl:"K",az:185.4,alt:35.1},
  {n:"Ascella",mag:2.6,cl:"A",az:165.2,alt:28.4},
  {n:"Albaldah",mag:2.88,cl:"A",az:170.1,alt:38.2},
  {n:"Deneb Algedi",mag:2.85,cl:"A",az:145.4,alt:48.2},
  {n:"Sadalmelik",mag:2.95,cl:"G",az:110.4,alt:45.2},
  {n:"Sadalsuud",mag:2.9,cl:"G",az:125.2,alt:50.4},
  {n:"Alderamin",mag:2.45,cl:"A",az:24.1,alt:68.2},
  {n:"Alfirk",mag:3.23,cl:"B",az:12.4,alt:72.1},
  {n:"Alrai",mag:3.21,cl:"K",az:355.2,alt:68.4},
  {n:"Izar",mag:2.35,cl:"K",az:288.4,alt:25.2},
  {n:"Muphrid",mag:2.68,cl:"G",az:280.2,alt:20.4},
  {n:"Seginus",mag:3.04,cl:"A",az:298.2,alt:28.1},
  {n:"Yed Prior",mag:2.73,cl:"M",az:258.4,alt:28.2},
  {n:"Rasalgethi",mag:3.31,cl:"M",az:265.2,alt:48.4},
  {n:"Rotanev",mag:3.63,cl:"F",az:200.4,alt:75.1},
  {n:"Sualocin",mag:3.77,cl:"B",az:198.2,alt:76.4},
  {n:"Sheratan",mag:2.64,cl:"A",az:55.2,alt:10.4},
  {n:"Alnair",mag:1.73,cl:"B",az:162.5,alt:12.4},
];

const SATURN = {n:"Saturn",mag:0.6,cl:"G",az:115.2,alt:42.1,planet:true};

const DEEP_SKY = [
  {n:"M31",az:62.4,alt:48.1,size:3.0,mag:3.4,type:"galaxy"},
  {n:"Double Cluster",az:38.5,alt:35.2,size:1.0,mag:3.7,type:"cluster"},
  {n:"Pleiades",az:68.2,alt:4.5,size:1.8,mag:1.6,type:"cluster"},
  {n:"M7",az:210.2,alt:10.5,size:1.3,mag:3.3,type:"cluster"},
];

// Milky Way center line (7 points with width and brightness)
const MILKY_WAY = [
  {az:200,alt:10,w:30,b:0.85},
  {az:218,alt:25,w:38,b:1.0},
  {az:235,alt:50,w:22,b:0.7},
  {az:310,alt:85,w:16,b:0.8},
  {az:35,alt:60,w:14,b:0.5},
  {az:50,alt:35,w:12,b:0.4},
  {az:65,alt:5,w:10,b:0.3},
];

// ═══════════════════════════════════════════════════════
// PROJECTION
// ═══════════════════════════════════════════════════════

const SPECTRAL_COLORS = {
  O: '#9BB0FF', B: '#AABFFF', A: '#F0F0FF',
  F: '#FFFAE4', G: '#FFE8A0', K: '#FFD2A0', M: '#FFB56B',
};

/**
 * Azimuth/Altitude → screen x%/y%.
 * South (180°) = center. East = left. West = right.
 * Y uses sine compression (natural dome feel).
 */
function azAltToXY(az, alt) {
  // South (180°) = center (50%). East (90°) = left (25%). West (270°) = right (75%).
  const x = ((az - 180 + 540) % 360) / 360 * 100;
  // Sine compression: zenith tight, horizon spread
  const y = 95 - Math.sin((alt * Math.PI) / 180) * 90;
  return { x, y };
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

// ═══════════════════════════════════════════════════════
// STAR CREATION
// ═══════════════════════════════════════════════════════

// Core pixel size — the actual bright point. TINY.
// Glow comes from box-shadow, not element size.
function magToSize(mag) {
  if (mag < 0) return 2.2;
  if (mag < 1) return 1.8;
  if (mag < 2) return 1.5;
  if (mag < 3) return 1.2;
  if (mag < 4) return 0.9;
  return rand(0.5, 0.8);
}

function twinkleClass(mag, alt) {
  if (alt < 15) return 'star--horizon';
  if (mag < 0.5) return 'star--brilliant';
  if (mag < 1.5) return 'star--bright';
  if (mag < 2.5) return 'star--medium';
  if (mag < 3.5) return 'star--dim';
  return 'star--faint';
}

function createStarElement(x, y, size, color, twinkCls, baseOpacity) {
  const el = document.createElement('div');
  el.className = `star ${twinkCls}`;
  el.setAttribute('aria-hidden', 'true');

  const delay = -rand(0, 12);

  // Glow radius scales with brightness — light emanates from point
  const glowR1 = (size * 2).toFixed(1);
  const glowR2 = (size * 5).toFixed(1);
  const glowR3 = (size * 10).toFixed(1);

  // Brighter stars get more glow layers
  let shadow;
  if (size >= 1.8) {
    // Bright: 3-layer glow — tight white + medium color + wide faint
    shadow = `0 0 ${glowR1}px rgba(255,255,255,0.6), 0 0 ${glowR2}px ${color}44, 0 0 ${glowR3}px ${color}15`;
  } else if (size >= 1.2) {
    // Medium: 2-layer
    shadow = `0 0 ${glowR1}px rgba(255,255,255,0.4), 0 0 ${glowR2}px ${color}22`;
  } else {
    // Dim: just a tiny halo
    shadow = `0 0 ${glowR1}px rgba(255,255,255,0.25)`;
  }

  el.style.cssText = `
    left:${x.toFixed(2)}%;
    top:${y.toFixed(2)}%;
    width:${size.toFixed(1)}px;
    height:${size.toFixed(1)}px;
    background:${color};
    box-shadow:${shadow};
    opacity:${baseOpacity.toFixed(2)};
    animation-delay:${delay.toFixed(1)}s;
  `;

  return el;
}

function createHorizonStar(x, y, size, color, baseOpacity) {
  const el = document.createElement('div');
  el.className = 'star star--horizon';
  el.setAttribute('aria-hidden', 'true');

  const delay = -rand(0, 6);

  const glowR = (size * 4).toFixed(1);

  el.style.cssText = `
    left:${x.toFixed(2)}%;
    top:${y.toFixed(2)}%;
    width:${size.toFixed(1)}px;
    height:${size.toFixed(1)}px;
    background:${color};
    opacity:${baseOpacity.toFixed(2)};
    animation-delay:${delay.toFixed(1)}s;
    box-shadow:
      0 0 ${glowR}px rgba(255,255,255,0.3),
      -1px 0 2px rgba(255,120,120,0.18),
       1px 0 2px rgba(120,170,255,0.18);
  `;

  return el;
}

// ═══════════════════════════════════════════════════════
// MILKY WAY
// ═══════════════════════════════════════════════════════

/**
 * Milky Way — as seen with naked eye from dark desert:
 * A broad, milky, CLOUDY band of unresolved starlight.
 * NOT individual dots. It's a luminous haze with darker patches
 * (dust lanes) breaking up the glow. Brightest near Sagittarius.
 *
 * Implementation: multiple overlapping gradient divs along the path,
 * plus "dark lane" gradients that cut through.
 */
function createMilkyWay(container) {
  // Main glow — each path point gets its own gradient div
  MILKY_WAY.forEach((pt, i) => {
    const pos = azAltToXY(pt.az, pt.alt);
    const el = document.createElement('div');
    el.className = 'milky-way';
    el.setAttribute('aria-hidden', 'true');

    const w = pt.w * 3;
    const h = pt.w * 4;
    const opacity = pt.b * 0.14;
    const isCenter = pt.b >= 0.95;

    // Galactic center: warmer and brighter
    const c = isCenter
      ? `rgba(220,210,190,${opacity})`
      : `rgba(200,210,230,${opacity})`;

    // Each patch slightly different angle for organic look
    const rotation = rand(-15, 15);

    el.style.cssText = `
      position:absolute;
      left:${(pos.x - w / 2).toFixed(1)}%;
      top:${(pos.y - h / 2).toFixed(1)}%;
      width:${w}%;
      height:${h}%;
      background:radial-gradient(ellipse 50% 50% at 50% 50%, ${c}, transparent 70%);
      transform:rotate(${rotation}deg);
      pointer-events:none;
    `;
    container.appendChild(el);
  });

  // Dark lanes — negative patches that break up the uniformity
  const darkLanes = [
    { x: 47, y: 42, w: 8, h: 14, rot: -20 },
    { x: 52, y: 55, w: 5, h: 10, rot: 10 },
    { x: 44, y: 30, w: 6, h: 8, rot: -5 },
    { x: 55, y: 48, w: 4, h: 12, rot: 15 },
  ];

  darkLanes.forEach(lane => {
    const el = document.createElement('div');
    el.className = 'mw-dust-lane';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = `
      position:absolute;
      left:${lane.x}%;top:${lane.y}%;
      width:${lane.w}%;height:${lane.h}%;
      background:radial-gradient(ellipse at center, rgba(7,11,31,0.5) 0%, transparent 70%);
      transform:rotate(${lane.rot}deg);
      pointer-events:none;
    `;
    container.appendChild(el);
  });

  // Star dust — small bright dots concentrated in the band
  // These are the resolved stars ON TOP of the glow
  const dustCount = window.innerWidth < 768 ? 400 : 900;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < dustCount; i++) {
    const segIdx = Math.floor(rand(0, MILKY_WAY.length - 1));
    const seg = MILKY_WAY[segIdx];
    const nextSeg = MILKY_WAY[segIdx + 1] || seg;

    const t = Math.random();
    const az = seg.az + (nextSeg.az - seg.az) * t;
    const alt = seg.alt + (nextSeg.alt - seg.alt) * t;
    const width = seg.w + (nextSeg.w - seg.w) * t;
    const brightness = seg.b + (nextSeg.b - seg.b) * t;

    // Scatter within band width
    const scatter = (Math.random() - 0.5) * width * 0.6;
    const perpAngle = Math.atan2(nextSeg.alt - seg.alt, nextSeg.az - seg.az) + Math.PI / 2;
    const finalAz = az + scatter * Math.cos(perpAngle) * 0.3;
    const finalAlt = alt + scatter * Math.sin(perpAngle) * 0.15;

    if (finalAlt < 0 || finalAlt > 90) continue;

    const pos = azAltToXY(finalAz, finalAlt);
    const size = rand(0.3, 0.9);
    const opacity = rand(0.2, 0.6) * brightness;

    const dot = document.createElement('div');
    dot.className = 'mw-dust';
    dot.setAttribute('aria-hidden', 'true');
    dot.style.cssText = `
      left:${pos.x.toFixed(1)}%;top:${pos.y.toFixed(1)}%;
      width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;
      opacity:${opacity.toFixed(2)};
    `;
    fragment.appendChild(dot);
  }

  container.appendChild(fragment);
}

// ═══════════════════════════════════════════════════════
// DEEP SKY OBJECTS
// ═══════════════════════════════════════════════════════

function createDeepSkyObjects(container) {
  DEEP_SKY.forEach(obj => {
    if (obj.alt < 2) return; // Too low

    const pos = azAltToXY(obj.az, obj.alt);

    if (obj.type === 'galaxy') {
      // M31: subtle elliptical smudge
      const el = document.createElement('div');
      el.className = 'dso dso--galaxy';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = `left:${pos.x}%;top:${pos.y}%;`;
      container.appendChild(el);
    } else if (obj.type === 'cluster') {
      // Cluster: 4-6 tiny dots grouped together
      const count = obj.n === 'Pleiades' ? 6 : 4;
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'star star--faint';
        el.setAttribute('aria-hidden', 'true');
        const ox = pos.x + rand(-0.4, 0.4);
        const oy = pos.y + rand(-0.4, 0.4);
        const s = rand(0.6, 1.1);
        el.style.cssText = `
          left:${ox.toFixed(2)}%;top:${oy.toFixed(2)}%;
          width:${s}px;height:${s}px;
          background:#F0F0FF;opacity:${rand(0.3, 0.6).toFixed(2)};
          animation-delay:${-rand(0, 8).toFixed(1)}s;
        `;
        container.appendChild(el);
      }
    }
  });
}

// ═══════════════════════════════════════════════════════
// BACKGROUND STARS
// ═══════════════════════════════════════════════════════

/**
 * Check if a point is near the Milky Way center line.
 * Returns 0-1 (0 = far, 1 = on the line).
 */
function milkyWayProximity(x, y) {
  let minDist = Infinity;
  for (const pt of MILKY_WAY) {
    const pos = azAltToXY(pt.az, pt.alt);
    const dx = x - pos.x;
    const dy = y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const threshold = pt.w * 1.5;
    if (dist < threshold) return 1 - (dist / threshold);
    if (dist < minDist) minDist = dist;
  }
  return 0;
}

const BG_COLORS = ['#F0F0FF','#F0F0FF','#F0F0FF','#FFFAE4','#FFE8A0','#AABFFF','#AABFFF','#FFD2A0','#FFB56B'];

function createBackgroundStars(container, count) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    let x, y, attempts = 0;

    // 60% of stars biased toward Milky Way band
    const wantMilkyWay = Math.random() < 0.6;

    do {
      x = rand(0, 100);
      // Bias toward zenith (upper part): use squared random
      const yRand = Math.random();
      y = 5 + yRand * yRand * 85; // quadratic bias toward top
      attempts++;
    } while (
      wantMilkyWay &&
      milkyWayProximity(x, y) < 0.1 &&
      attempts < 8
    );

    // Skip if too close to horizon
    if (y > 92) continue;

    // Stars along Milky Way are slightly brighter and denser
    const mwProx = milkyWayProximity(x, y);
    const size = mwProx > 0.3 ? rand(0.5, 1.4) : rand(0.4, 1.0);
    const color = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
    const opacity = mwProx > 0.3 ? rand(0.3, 0.65) : rand(0.15, 0.45);

    const el = document.createElement('div');
    el.className = 'star star--faint';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = `
      left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;
      width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;
      background:${color};
      box-shadow:0 0 ${(size * 2).toFixed(1)}px rgba(255,255,255,0.2);
      opacity:${opacity.toFixed(2)};
      animation-delay:${-rand(0, 10).toFixed(1)}s;
    `;
    fragment.appendChild(el);
  }

  container.appendChild(fragment);
}

// ═══════════════════════════════════════════════════════
// MAIN INIT
// ═══════════════════════════════════════════════════════

export function initStarField(container) {
  if (!container) return;

  // Clear previous
  container.querySelectorAll('.star, .milky-way, .mw-dust, .mw-dust-lane, .dso').forEach(el => el.remove());

  const isMobile = window.innerWidth < 768;
  const maxMag = isMobile ? 3.2 : 4.5;
  const bgCount = isMobile ? 80 : 250;

  // Layer 1: Milky Way (haze + dust lanes + star dust)
  createMilkyWay(container);

  // Layer 2: Background faint stars
  createBackgroundStars(container, bgCount);

  // Layer 3: Deep sky objects
  if (!isMobile) {
    createDeepSkyObjects(container);
  }

  // Layer 4: Named stars + Saturn
  const allStars = [...BRIGHT_STARS, SATURN];
  const fragment = document.createDocumentFragment();

  for (const star of allStars) {
    if (star.alt < 0) continue; // Below horizon
    if (star.mag > maxMag) continue;

    const pos = azAltToXY(star.az, star.alt);
    const size = magToSize(star.mag);
    const color = SPECTRAL_COLORS[star.cl] || '#F0F0FF';
    const baseOpacity = rand(0.7, 1.0); // Perceptual variation

    let el;
    if (star.alt < 15) {
      el = createHorizonStar(pos.x, pos.y, size, color, baseOpacity);
    } else {
      const cls = twinkleClass(star.mag, star.alt);
      el = createStarElement(pos.x, pos.y, size, color, cls, baseOpacity);
    }

    // Saturn: slightly larger glow
    if (star.planet) {
      el.style.boxShadow = `0 0 6px ${color}66, 0 0 12px ${color}22`;
    }

    fragment.appendChild(el);
  }

  container.appendChild(fragment);
}
