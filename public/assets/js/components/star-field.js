/**
 * Star Field — realistic Negev night sky
 *
 * Architecture:
 * - Named stars: individual DOM elements (72 stars + Saturn)
 * - Background stars: THREE divs with massive box-shadow lists
 *   (800 small + 400 medium + 100 large = 1300 stars, 3 DOM elements)
 * - Milky Way: gradient overlays (monochrome grey, NOT colored)
 *   + dense box-shadow star layer along the band
 * - Total DOM: ~90 elements (not thousands)
 *
 * Projection: cylindrical azimuth→x, sine-compressed altitude→y
 * Animation: opacity-only (GPU-safe)
 */

// ═══════════════════════════════════════════════════════
// STAR CATALOG
// ═══════════════════════════════════════════════════════

const CATALOG = [
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
  {n:"Saturn",mag:0.6,cl:"G",az:115.2,alt:42.1,planet:true},
];

// MW is ~30° wide in real sky. Width values are in DEGREES.
// In August from Israel it goes nearly vertical through zenith.
const MILKY_WAY = [
  {az:200,alt:10,w:35,b:0.8},   // Scorpius tail — wide, bright
  {az:215,alt:22,w:45,b:1.0},   // Galactic center (Sagittarius) — WIDEST, BRIGHTEST
  {az:230,alt:42,w:35,b:0.85},  // Scutum star cloud
  {az:260,alt:60,w:28,b:0.65},  // Aquila / Scutum
  {az:310,alt:82,w:22,b:0.7},   // Cygnus — near zenith, Great Rift
  {az:350,alt:68,w:18,b:0.5},   // Cepheus
  {az:25,alt:55,w:18,b:0.45},   // Cassiopeia
  {az:45,alt:35,w:15,b:0.35},   // Perseus
  {az:60,alt:10,w:12,b:0.2},    // Auriga — horizon, faint
];

const COLORS = {
  O:'#9BB0FF', B:'#AABFFF', A:'#F0F0FF',
  F:'#FFFAE4', G:'#FFE8A0', K:'#FFD2A0', M:'#FFB56B',
};

// ═══════════════════════════════════════════════════════
// PROJECTION
// ═══════════════════════════════════════════════════════

function azAltToXY(az, alt) {
  const x = ((az - 180 + 540) % 360) / 360 * 100;
  const y = 95 - Math.sin((alt * Math.PI) / 180) * 90;
  return { x, y };
}

function rand(a, b) { return a + Math.random() * (b - a); }

// ═══════════════════════════════════════════════════════
// BACKGROUND STARS via box-shadow (1300 stars = 3 DOM elements)
// ═══════════════════════════════════════════════════════

function generateBoxShadowStars(count, maxW, maxH) {
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(rand(0, maxW));
    const y = Math.round(rand(0, maxH));
    const alpha = rand(0.15, 0.7);
    shadows.push(`${x}px ${y}px 0 rgba(255,255,255,${alpha.toFixed(2)})`);
  }
  return shadows.join(',');
}

function generateMWStars(count, maxW, maxH) {
  // Stars concentrated along the Milky Way band
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const segIdx = Math.floor(rand(0, MILKY_WAY.length - 0.01));
    const seg = MILKY_WAY[segIdx];
    const next = MILKY_WAY[Math.min(segIdx + 1, MILKY_WAY.length - 1)];

    const t = Math.random();
    const az = seg.az + (next.az - seg.az) * t;
    const alt = seg.alt + (next.alt - seg.alt) * t;
    const w = seg.w + (next.w - seg.w) * t;
    const b = seg.b + (next.b - seg.b) * t;

    // Scatter perpendicular to band — use FULL width in degrees
    // Gaussian-like distribution: most stars near center, fewer at edges
    const gaussian = (Math.random() + Math.random() + Math.random()) / 3; // 0-1, center-biased
    const scatter = (gaussian - 0.5) * w; // degrees, full width
    const pos = azAltToXY(az + scatter, Math.max(0, Math.min(90, alt + scatter * 0.3)));

    const x = Math.round(pos.x / 100 * maxW);
    const y = Math.round(pos.y / 100 * maxH);
    const alpha = rand(0.1, 0.5) * b;

    shadows.push(`${x}px ${y}px 0 rgba(230,235,245,${alpha.toFixed(2)})`);
  }
  return shadows.join(',');
}

function createBackgroundLayers(container) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobile = w < 768;

  // Layer 1: small faint stars (1px)
  const layer1 = document.createElement('div');
  layer1.className = 'bg-stars bg-stars--sm';
  layer1.setAttribute('aria-hidden', 'true');
  layer1.style.boxShadow = generateBoxShadowStars(isMobile ? 400 : 900, w, h);
  container.appendChild(layer1);

  // Layer 2: medium stars (1.5px) — fewer
  const layer2 = document.createElement('div');
  layer2.className = 'bg-stars bg-stars--md';
  layer2.setAttribute('aria-hidden', 'true');
  layer2.style.boxShadow = generateBoxShadowStars(isMobile ? 120 : 300, w, h);
  container.appendChild(layer2);

  // Layer 3: Milky Way concentrated stars — dense band
  const layer3 = document.createElement('div');
  layer3.className = 'bg-stars bg-stars--mw';
  layer3.setAttribute('aria-hidden', 'true');
  layer3.style.boxShadow = generateMWStars(isMobile ? 600 : 1500, w, h);
  container.appendChild(layer3);

  // Layer 4: Extra-dense MW core (Sagittarius/Scutum — segments 1-3)
  const layer4 = document.createElement('div');
  layer4.className = 'bg-stars bg-stars--mw';
  layer4.setAttribute('aria-hidden', 'true');
  const coreShadows = [];
  for (let i = 0; i < (isMobile ? 400 : 900); i++) {
    const segIdx = Math.floor(rand(0.5, 3.5)); // segments 1-3 (brightest)
    const seg = MILKY_WAY[segIdx];
    const next = MILKY_WAY[Math.min(segIdx + 1, MILKY_WAY.length - 1)];
    const t = Math.random();
    const az = seg.az + (next.az - seg.az) * t;
    const alt = seg.alt + (next.alt - seg.alt) * t;
    // Tighter scatter for dense core
    const gaussian = (Math.random() + Math.random()) / 2;
    const scatter = (gaussian - 0.5) * seg.w * 0.7;
    const pos = azAltToXY(az + scatter, Math.max(0, Math.min(90, alt + scatter * 0.2)));
    const px = Math.round(pos.x / 100 * w);
    const py = Math.round(pos.y / 100 * h);
    const alpha = rand(0.2, 0.65);
    coreShadows.push(`${px}px ${py}px 0 rgba(240,235,225,${alpha.toFixed(2)})`);
  }
  layer4.style.boxShadow = coreShadows.join(',');
  container.appendChild(layer4);
}

// ═══════════════════════════════════════════════════════
// MILKY WAY GLOW — monochrome grey (real naked-eye appearance)
// ═══════════════════════════════════════════════════════

function createMilkyWayGlow(container) {
  const el = document.createElement('div');
  el.className = 'milky-way-glow';
  el.setAttribute('aria-hidden', 'true');

  // Multiple radial gradients — GREY, not blue/colored
  // Real MW is monochrome to dark-adapted eyes
  const gradients = MILKY_WAY.map(pt => {
    const pos = azAltToXY(pt.az, pt.alt);
    const spreadX = pt.w * 4;
    const spreadY = pt.w * 5;
    const opacity = pt.b * 0.14;
    const c = pt.b >= 0.95
      ? `rgba(200,195,185,${opacity})` // galactic center: slightly warm grey
      : `rgba(210,215,220,${opacity})`; // rest: cool grey
    return `radial-gradient(ellipse ${spreadX}% ${spreadY}% at ${pos.x}% ${pos.y}%, ${c}, transparent 70%)`;
  });

  // Dark dust lanes
  const lanes = [
    { x: 48, y: 40, sx: 6, sy: 18 },
    { x: 52, y: 52, sx: 4, sy: 12 },
    { x: 45, y: 28, sx: 5, sy: 10 },
  ];
  lanes.forEach(l => {
    gradients.push(
      `radial-gradient(ellipse ${l.sx}% ${l.sy}% at ${l.x}% ${l.y}%, rgba(7,11,31,0.4), transparent 65%)`
    );
  });

  el.style.background = gradients.join(',');
  container.appendChild(el);
}

// ═══════════════════════════════════════════════════════
// NAMED STARS (individual DOM elements)
// ═══════════════════════════════════════════════════════

function magToSize(mag) {
  if (mag < 0) return 2.2;
  if (mag < 1) return 1.8;
  if (mag < 2) return 1.4;
  if (mag < 3) return 1.1;
  return 0.8;
}

function twinkClass(mag, alt) {
  if (alt < 15) return 'star--horizon';
  if (mag < 0.5) return 'star--brilliant';
  if (mag < 1.5) return 'star--bright';
  if (mag < 2.5) return 'star--medium';
  return 'star--dim';
}

function createNamedStars(container, maxMag) {
  const fragment = document.createDocumentFragment();

  for (const s of CATALOG) {
    if (s.alt < 0 || s.mag > maxMag) continue;

    const pos = azAltToXY(s.az, s.alt);
    const size = magToSize(s.mag);
    const color = COLORS[s.cl] || '#F0F0FF';
    const cls = twinkClass(s.mag, s.alt);
    const delay = -rand(0, 12);
    const opacity = rand(0.75, 1.0);

    const el = document.createElement('div');
    el.className = `star ${cls}`;
    el.setAttribute('aria-hidden', 'true');

    // Glow layers: tiny core + light emanation via box-shadow
    const g1 = (size * 2).toFixed(1);
    const g2 = (size * 5).toFixed(1);

    let shadow;
    if (s.planet) {
      shadow = `0 0 ${g1}px ${color}88, 0 0 ${g2}px ${color}33, 0 0 ${(size*8).toFixed(1)}px ${color}11`;
    } else if (size >= 1.8) {
      shadow = `0 0 ${g1}px #ffffff88, 0 0 ${g2}px ${color}33`;
    } else if (size >= 1.2) {
      shadow = `0 0 ${g1}px #ffffff55, 0 0 ${g2}px ${color}1A`;
    } else {
      shadow = `0 0 ${g1}px #ffffff33`;
    }

    // Horizon stars: chromatic dispersion
    if (s.alt < 15) {
      shadow += `, -1px 0 2px rgba(255,110,110,0.15), 1px 0 2px rgba(110,160,255,0.15)`;
    }

    el.style.cssText = `
      left:${pos.x.toFixed(2)}%;top:${pos.y.toFixed(2)}%;
      width:${size}px;height:${size}px;
      background:${color};
      box-shadow:${shadow};
      opacity:${opacity.toFixed(2)};
      animation-delay:${delay.toFixed(1)}s;
    `;

    fragment.appendChild(el);
  }

  container.appendChild(fragment);
}

// ═══════════════════════════════════════════════════════
// DEEP SKY OBJECTS
// ═══════════════════════════════════════════════════════

function createDSOs(container) {
  // M31 Andromeda — faint smudge
  const m31pos = azAltToXY(62.4, 48.1);
  const m31 = document.createElement('div');
  m31.className = 'dso dso--galaxy';
  m31.setAttribute('aria-hidden', 'true');
  m31.style.cssText = `left:${m31pos.x}%;top:${m31pos.y}%;`;
  container.appendChild(m31);
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════

export function initStarField(container) {
  if (!container) return;

  // Cleanup
  container.querySelectorAll('.star,.bg-stars,.milky-way-glow,.dso').forEach(e => e.remove());

  const isMobile = window.innerWidth < 768;

  // 1. Background star layers (3 DOM elements = 1300-1900 stars)
  createBackgroundLayers(container);

  // 2. Milky Way glow
  createMilkyWayGlow(container);

  // 3. Deep sky objects
  if (!isMobile) createDSOs(container);

  // 4. Named catalog stars
  createNamedStars(container, isMobile ? 3.0 : 4.0);
}
