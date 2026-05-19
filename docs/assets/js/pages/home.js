/**
 * Home page renderer
 */

import { i18n } from '../core/i18n.js';
import { initCountdown } from '../components/countdown.js';
import { initShootingStar } from '../components/shooting-star.js';
import SkyRenderer from '../components/sky-renderer.js';
// db loaded lazily — not imported statically to avoid blocking page load
let db = null;
async function getDb() {
  if (!db) {
    const mod = await import('../core/db.js');
    db = mod.db;
  }
  return db;
}

// Item ID → i18n key map (same as rsvp.js categories)
const ITEM_LABELS = {
  tarp:'rsvp.bTarp', chairs:'rsvp.bChairs', tables:'rsvp.bTables',
  grill:'rsvp.bGrill', coal:'rsvp.bCoal', firewood:'rsvp.bFirewood',
  cooler:'rsvp.bCooler', kettle:'rsvp.bKettle', pot:'rsvp.bPot',
  stove:'rsvp.bStove', dispDishes:'rsvp.bDispDishes',
  generator:'rsvp.bGenerator', extension:'rsvp.bExtension',
  speakers:'rsvp.bSpeakers', projector:'rsvp.bProjector',
  drone:'rsvp.bDrone', camera:'rsvp.bCamera',
  telescope:'rsvp.bTelescope', redFlash:'rsvp.bRedFlash',
  guitar:'rsvp.bGuitar', games:'rsvp.bGames', ball:'rsvp.bBall',
  firstAid:'rsvp.bFirstAid', tools:'rsvp.bTools',
};

function renderHomeBringing() {
  // Guard: skip if home page is no longer mounted
  if (!homeContainerRef || !homeContainerRef.isConnected) return;
  const section = document.getElementById('home-bringing-section');
  const grid = document.getElementById('home-bringing-grid');
  if (!section || !grid) return;

  // Aggregate from all registrations (Firestore or localStorage)
  const participants = getAllParticipants();
  const totals = {};
  let totalPeople = 0;
  let totalCars = 0;
  let totalMaybe = 0;

  participants.forEach(data => {
    const isConfirmed = data.confirmed !== false;
    if (isConfirmed) {
      totalPeople++;
    } else {
      totalMaybe++;
    }
    if (data.companions) {
      data.companions.forEach(c => {
        if (c.confirmed !== false) totalPeople++;
        else totalMaybe++;
      });
    }
    if (data.kids) totalPeople += data.kids;
    if (data.isDriving) totalCars++;
    if (!data.bringing) return;
    for (const [id, val] of Object.entries(data.bringing)) {
      if (!val) continue;
      const n = (typeof val === 'number') ? val : 1;
      totals[id] = (totals[id] || 0) + n;
    }
  });

  // Render count section (participants + cars)
  const countSection = document.getElementById('home-count-section');
  const countGrid = document.getElementById('home-count-grid');
  if (countSection && countGrid) {
    if (totalPeople > 0 || totalMaybe > 0) {
      countSection.style.display = '';
      countGrid.innerHTML = `
        <div class="home-bring-item home-bring-item--highlight">
          <span class="home-bring-item__count">${totalPeople}</span>
          <span class="home-bring-item__label">${i18n.t('people.confirmed')}</span>
        </div>
        <div class="home-bring-item home-bring-item--highlight">
          <span class="home-bring-item__count">${totalCars}</span>
          <span class="home-bring-item__label">${i18n.t('people.cars')}</span>
        </div>
        ${totalMaybe > 0 ? `
        <div class="home-bring-item home-bring-item--maybe">
          <span class="home-bring-item__count">${totalMaybe}</span>
          <span class="home-bring-item__label">${i18n.t('people.maybe')}</span>
        </div>
        ` : ''}
      `;
    } else {
      countSection.style.display = 'none';
    }
  }

  // Render bringing section (items only)
  const entries = Object.entries(totals).filter(([, v]) => v > 0);
  if (entries.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  let html = entries.map(([id, count]) => {
    const labelKey = ITEM_LABELS[id];
    if (!labelKey) return ''; // skip unknown items
    const label = i18n.t(labelKey);
    return `<div class="home-bring-item">
      <span class="home-bring-item__count">${count}</span>
      <span class="home-bring-item__label">${label}</span>
    </div>`;
  }).join('');

  grid.innerHTML = html;
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

let cachedParticipants = null;
let homeContainerRef = null; // track if home page still mounted

function getAllParticipantsLocal() {
  const list = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith('mapal-rsvp-')) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data && !data.cancelled) list.push(data);
    } catch {}
  }
  return list;
}

async function loadParticipants() {
  try {
    const d = await getDb();
    cachedParticipants = await d.getAllParticipants();
  } catch {
    cachedParticipants = getAllParticipantsLocal();
  }
  return cachedParticipants;
}

function getAllParticipants() {
  return cachedParticipants || getAllParticipantsLocal();
}

function initWhoButton() {
  const btn = document.getElementById('home-who-btn');
  const table = document.getElementById('home-who-table');
  if (!btn || !table) return;

  btn.addEventListener('click', () => {
    const isOpen = table.style.display !== 'none';
    if (isOpen) {
      table.style.display = 'none';
      btn.textContent = i18n.t('home.whoBtn');
    } else {
      renderWhoTable(table);
      table.style.display = '';
      btn.textContent = i18n.t('home.whoBtnClose');
    }
  });
}

function renderWhoTable(container) {
  const participants = getAllParticipants();

  if (participants.length === 0) {
    container.innerHTML = `<p class="home-who-empty">${i18n.t('common.empty')}</p>`;
    return;
  }

  let html = '';
  participants.forEach(p => {
    // What they're bringing (non-zero items)
    let itemsHtml = '';
    if (p.bringing) {
      const active = Object.entries(p.bringing).filter(([, v]) => v);
      if (active.length > 0) {
        itemsHtml = active.map(([k, v]) => {
          const labelKey = ITEM_LABELS[k];
          if (!labelKey) return '';
          const label = i18n.t(labelKey);
          const qty = typeof v === 'number' && v > 1 ? `\u00D7${v}` : '';
          return `<span class="who-chip">${label}${qty ? ' ' + qty : ''}</span>`;
        }).join('');
      }
    }

    // Companions
    let compHtml = '';
    if (p.companions && p.companions.length > 0) {
      compHtml = p.companions.map(c => {
        const compMaybe = c.confirmed === false;
        return `<span class="who-companion${compMaybe ? ' who-companion--maybe' : ''}">${esc(c.name)}</span>`;
      }).join('');
    }

    // Kids
    let kidsHtml = '';
    if (p.kids > 0) {
      kidsHtml = `<span class="who-companion">${p.kids} ${i18n.t('rsvp.kidsLabel')}</span>`;
    }

    const car = p.isDriving ? '<svg class="who-car-icon" viewBox="0 0 32 18" fill="none"><path d="M5 13h22c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-3l-2-4H10L8 6H5C3.9 6 3 6.9 3 8v3c0 1.1.9 2 2 2z" fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="1.2"/><circle cx="8.5" cy="13.5" r="2.5" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="1"/><circle cx="23.5" cy="13.5" r="2.5" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="1"/><path d="M12 6l1.5-3h5L20 6" stroke="currentColor" stroke-width="1" opacity="0.5"/></svg>' : '';

    const isMaybe = p.confirmed === false;
    html += `
      <div class="who-row${isMaybe ? ' who-row--maybe' : ''}">
        <div class="who-row__header">
          <span class="who-row__name${isMaybe ? ' who-row__name--maybe' : ''}">${esc(p.name)}${car}</span>
          ${p.city ? `<span class="who-row__city">${esc(p.city)}</span>` : ''}
        </div>
        ${compHtml || kidsHtml ? `<div class="who-row__companions">${compHtml}${kidsHtml}</div>` : ''}
        ${itemsHtml ? `<div class="who-row__items">${itemsHtml}</div>` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

export function renderHome(container) {
  cachedParticipants = null; // fresh load each time
  homeContainerRef = container;
  container.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <canvas class="sky-canvas" aria-hidden="true"></canvas>
      <div class="hero__stars" aria-hidden="true"></div>
      <div class="hero__content">
        <h1 id="hero-title" class="hero__title" data-i18n="home.heroTitle">
          ${i18n.t('home.heroTitle')}
        </h1>
        <p class="hero__subtitle" data-i18n="home.heroSubtitle">
          ${i18n.t('home.heroSubtitle')}
        </p>
        <span class="hero__private-badge" data-i18n="home.privateBadge">${i18n.t('home.privateBadge')}</span>
        <div class="cd" aria-label="Countdown to event" dir="ltr">
          <div class="cd__unit">
            <div class="cd__digits" id="cd-days">
              <div class="cd-digit"><span class="cd-digit__current">-</span></div>
              <div class="cd-digit"><span class="cd-digit__current">-</span></div>
            </div>
            <span class="cd__label" data-i18n="home.countdown.days">${i18n.t('home.countdown.days')}</span>
          </div>
          <div class="cd__sep" aria-hidden="true">:</div>
          <div class="cd__unit">
            <div class="cd__digits" id="cd-hours">
              <div class="cd-digit"><span class="cd-digit__current">-</span></div>
              <div class="cd-digit"><span class="cd-digit__current">-</span></div>
            </div>
            <span class="cd__label" data-i18n="home.countdown.hours">${i18n.t('home.countdown.hours')}</span>
          </div>
          <div class="cd__sep" aria-hidden="true">:</div>
          <div class="cd__unit">
            <div class="cd__digits" id="cd-minutes">
              <div class="cd-digit"><span class="cd-digit__current">-</span></div>
              <div class="cd-digit"><span class="cd-digit__current">-</span></div>
            </div>
            <span class="cd__label" data-i18n="home.countdown.minutes">${i18n.t('home.countdown.minutes')}</span>
          </div>
          <div class="cd__sep" aria-hidden="true">:</div>
          <div class="cd__unit">
            <div class="cd__digits" id="cd-seconds">
              <div class="cd-digit"><span class="cd-digit__current">-</span></div>
              <div class="cd-digit"><span class="cd-digit__current">-</span></div>
            </div>
            <span class="cd__label" data-i18n="home.countdown.seconds">${i18n.t('home.countdown.seconds')}</span>
          </div>
        </div>
        <a href="#rsvp" class="hero__cta" data-i18n="home.cta">${i18n.t('home.cta')}</a>
        <div class="home-map-btns" style="margin-block-start:32px;">
          <a href="https://waze.com/ul/hsv2tedc1p" target="_blank" rel="noopener" class="home-map-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Waze
          </a>
          <a href="https://maps.app.goo.gl/EaoofpuTeQ2TyPkZ7?g_st=ic" target="_blank" rel="noopener" class="home-map-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Google Maps
          </a>
        </div>
      </div>
      <div class="hero__scroll-hint" aria-hidden="true">
        <div class="hero__scroll-arrow"></div>
      </div>
    </section>

    <!-- ═══ How many of us ═══ -->
    <section class="home-section" id="home-count-section" style="display:none;">
      <div class="home-section__inner home-section__inner--center">
        <h2 class="home-section__title" data-i18n="home.countTitle">${i18n.t('home.countTitle')}</h2>
        <div id="home-count-grid" class="home-bringing-grid"></div>
        <div class="home-action-btns" style="margin-block-start:var(--space-5);">
          <button type="button" class="home-who-btn" id="home-who-btn" data-i18n="home.whoBtn">${i18n.t('home.whoBtn')}</button>
          <a href="#pack" class="home-who-btn" data-i18n="nav.pack">${i18n.t('nav.pack')}</a>
        </div>
        <div id="home-who-table" class="home-who-table" style="display:none;"></div>
      </div>
    </section>

    <!-- ═══ Quick info ═══ -->
    <section class="home-section" aria-labelledby="home-details">
      <div class="home-section__inner">
        <h2 id="home-details" class="home-section__title" data-i18n="home.detailsTitle">
          ${i18n.t('home.detailsTitle')}
        </h2>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-item__label" data-i18n="home.detailWhen">${i18n.t('home.detailWhen')}</span>
            <span class="detail-item__value" data-i18n="home.detailWhenVal">${i18n.t('home.detailWhenVal')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label" data-i18n="home.detailWhere">${i18n.t('home.detailWhere')}</span>
            <span class="detail-item__value" data-i18n="home.detailWhereVal">${i18n.t('home.detailWhereVal')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label" data-i18n="home.detailWho">${i18n.t('home.detailWho')}</span>
            <span class="detail-item__value" data-i18n="home.detailWhoVal">${i18n.t('home.detailWhoVal')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label" data-i18n="home.detailHighlight">${i18n.t('home.detailHighlight')}</span>
            <span class="detail-item__value" data-i18n="home.detailHighlightVal">${i18n.t('home.detailHighlightVal')}</span>
          </div>
        </div>

      </div>
    </section>

    <!-- ═══ What awaits ═══ -->
    <section class="home-section" aria-labelledby="home-highlights">
      <div class="home-section__inner">
        <h2 id="home-highlights" class="home-section__title" data-i18n="home.highlightsTitle">
          ${i18n.t('home.highlightsTitle')}
        </h2>
        <div class="highlight-cards">
          <a href="#sky" class="highlight-card">
            <div class="highlight-card__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3 data-i18n="home.card1Title">${i18n.t('home.card1Title')}</h3>
            <p data-i18n="home.card1Text">${i18n.t('home.card1Text')}</p>
          </a>
          <a href="#place" class="highlight-card">
            <div class="highlight-card__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3 data-i18n="home.card2Title">${i18n.t('home.card2Title')}</h3>
            <p data-i18n="home.card2Text">${i18n.t('home.card2Text')}</p>
          </a>
          <a href="#pack" class="highlight-card">
            <div class="highlight-card__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 data-i18n="home.card3Title">${i18n.t('home.card3Title')}</h3>
            <p data-i18n="home.card3Text">${i18n.t('home.card3Text')}</p>
          </a>
        </div>
      </div>
    </section>

    <!-- ═══ What we're bringing (live) ═══ -->
    <section class="home-section" id="home-bringing-section" style="display:none;">
      <div class="home-section__inner">
        <h2 class="home-section__title" data-i18n="home.bringingTitle">${i18n.t('home.bringingTitle')}</h2>
        <div id="home-bringing-grid" class="home-bringing-grid"></div>
      </div>
    </section>

    <!-- ═══ WhatsApp + Gallery ═══ -->
    <section class="home-section">
      <div class="home-section__inner home-section__inner--center">
        <a href="https://chat.whatsapp.com/LdDC7EBT1vC7HMhaRjPchc?mode=gi_t" target="_blank" rel="noopener" class="home-group-chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.12 1.523 5.855L0 24l6.335-1.652A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.875 0-3.615-.525-5.107-1.432l-.366-.217-3.795.99.999-3.648-.238-.378A9.69 9.69 0 0 1 2.25 12 9.75 9.75 0 1 1 12 21.75z"/></svg>
          <span data-i18n="home.groupChat">${i18n.t('home.groupChat')}</span>
        </a>
        <a href="#gallery" class="home-gallery-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <span data-i18n="nav.gallery">${i18n.t('nav.gallery')}</span>
        </a>
      </div>
    </section>

    <!-- ═══ Final CTA ═══ -->
    <section class="home-section home-section--cta">
      <div class="home-section__inner home-section__inner--center">
        <p class="home-cta__text" data-i18n="home.ctaBottomText">${i18n.t('home.ctaBottomText')}</p>
        <a href="#rsvp" class="hero__cta" data-i18n="home.cta">${i18n.t('home.cta')}</a>
      </div>
    </section>
  `;

  // Sky renderer — Canvas 2D, 35K stars
  const skyCanvas = container.querySelector('.sky-canvas');
  const starsContainer = container.querySelector('.hero__stars');

  // Full star catalog
  const CATALOG = [
    {n:"Vega",mag:0.03,cl:"A",az:282.4,alt:73.1},
    {n:"Arcturus",mag:-0.05,cl:"K",az:281.5,alt:18.2},
    {n:"Altair",mag:0.77,cl:"A",az:226.8,alt:66.5},
    {n:"Capella",mag:0.08,cl:"G",az:34.5,alt:3.2},
    {n:"Antares",mag:1.06,cl:"M",az:228.4,alt:15.4},
    {n:"Deneb",mag:1.25,cl:"A",az:320.1,alt:81.2},
    {n:"Fomalhaut",mag:1.16,cl:"A",az:142.1,alt:28.5},
    {n:"Polaris",mag:1.97,cl:"F",az:0,alt:30.6},
    {n:"Shaula",mag:1.62,cl:"B",az:206.1,alt:12.8},
    {n:"Sargas",mag:1.86,cl:"F",az:198.4,alt:8.1},
    {n:"Kaus Australis",mag:1.85,cl:"B",az:188.4,alt:25.2},
    {n:"Nunki",mag:2.05,cl:"B",az:172.1,alt:33.5},
    {n:"Hamal",mag:2.01,cl:"K",az:58.3,alt:12.4},
    {n:"Diphda",mag:2.04,cl:"K",az:112.5,alt:25.1},
    {n:"Alpheratz",mag:2.06,cl:"B",az:68.4,alt:48.2},
    {n:"Mirach",mag:2.07,cl:"M",az:56.1,alt:35.5},
    {n:"Almach",mag:2.1,cl:"K",az:48.2,alt:42.1},
    {n:"Dubhe",mag:1.81,cl:"K",az:328.5,alt:21},
    {n:"Merak",mag:2.34,cl:"A",az:333.1,alt:18.2},
    {n:"Phecda",mag:2.41,cl:"A",az:335.5,alt:25.4},
    {n:"Alioth",mag:1.76,cl:"A",az:334.2,alt:32.5},
    {n:"Mizar",mag:2.23,cl:"A",az:328.6,alt:35.8},
    {n:"Alkaid",mag:1.85,cl:"B",az:320.4,alt:38.1},
    {n:"Kochab",mag:2.07,cl:"K",az:352.4,alt:45.8},
    {n:"Eltanin",mag:2.24,cl:"K",az:322.1,alt:55.4},
    {n:"Schedar",mag:2.24,cl:"K",az:32.4,alt:52.1},
    {n:"Caph",mag:2.28,cl:"F",az:20.1,alt:55.4},
    {n:"Gamma Cas",mag:2.15,cl:"B",az:35.2,alt:58.1},
    {n:"Mirfak",mag:1.79,cl:"F",az:45.2,alt:31.4},
    {n:"Algol",mag:2.1,cl:"B",az:52.4,alt:25.1},
    {n:"Enif",mag:2.38,cl:"K",az:148.2,alt:68.3},
    {n:"Scheat",mag:2.42,cl:"M",az:85.4,alt:68.1},
    {n:"Markab",mag:2.49,cl:"B",az:105.2,alt:58.4},
    {n:"Sadr",mag:2.23,cl:"F",az:345.2,alt:78.4},
    {n:"Gienah Cyg",mag:2.48,cl:"K",az:325.5,alt:65.2},
    {n:"Albireo",mag:3.05,cl:"K",az:296.8,alt:81.3},
    {n:"Tarazed",mag:2.72,cl:"K",az:220.4,alt:68.2},
    {n:"Rasalhague",mag:2.08,cl:"A",az:255.4,alt:48.1},
    {n:"Sabik",mag:2.43,cl:"A",az:235.2,alt:32.4},
    {n:"Kornephoros",mag:2.78,cl:"G",az:278.4,alt:55.2},
    {n:"Gemma",mag:2.22,cl:"A",az:273.1,alt:38.4},
    {n:"Unukalhai",mag:2.63,cl:"K",az:265.4,alt:35.2},
    {n:"Kaus Media",mag:2.72,cl:"K",az:182.1,alt:30.2},
    {n:"Ascella",mag:2.6,cl:"A",az:165.2,alt:28.4},
    {n:"Alderamin",mag:2.45,cl:"A",az:24.1,alt:68.2},
    {n:"Izar",mag:2.35,cl:"K",az:288.4,alt:25.2},
    {n:"Yed Prior",mag:2.73,cl:"M",az:258.4,alt:28.2},
    {n:"Sadalsuud",mag:2.9,cl:"G",az:125.2,alt:50.4},
    {n:"Alnair",mag:1.73,cl:"B",az:162.5,alt:12.4},
    {n:"Saturn",mag:0.6,cl:"G",az:115.2,alt:42.1},
  ];

  if (skyCanvas && window.innerWidth >= 768) {
    // Desktop: Canvas 2D galaxy
    if (window._skyRenderer) window._skyRenderer.destroy();
    window._skyRenderer = new SkyRenderer(skyCanvas, CATALOG);
    window._skyRenderer.render();
  } else if (window._skyRenderer) {
    window._skyRenderer.destroy();
    window._skyRenderer = null;
  }

  initCountdown();

  // Load from Firestore then render
  loadParticipants().then(() => {
    renderHomeBringing();
    initWhoButton();
  }).catch(() => {
    cachedParticipants = getAllParticipantsLocal();
    renderHomeBringing();
    initWhoButton();
  });

  // Start meteors only after welcome overlay is dismissed
  if (document.getElementById('welcome-overlay')) {
    const obs = new MutationObserver(() => {
      if (!document.getElementById('welcome-overlay')) {
        initShootingStar(starsContainer);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true });
  } else {
    initShootingStar(starsContainer);
  }

  // Hide scroll hint after first scroll
  const scrollHint = container.querySelector('.hero__scroll-hint');
  if (scrollHint) {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        scrollHint.style.opacity = '0';
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Tap sky to dim/show content (immersive star viewing mode)
  const heroContent = container.querySelector('.hero__content');
  const heroSection = container.querySelector('.hero');
  if (heroSection && heroContent) {
    let dimmed = false;
    heroSection.addEventListener('click', (e) => {
      // Don't trigger on buttons/links
      if (e.target.closest('a, button')) return;
      dimmed = !dimmed;
      heroContent.style.transition = 'opacity 0.6s ease';
      heroContent.style.opacity = dimmed ? '0.15' : '1';
      if (scrollHint) scrollHint.style.opacity = dimmed ? '0' : '';
    });
  }
}
