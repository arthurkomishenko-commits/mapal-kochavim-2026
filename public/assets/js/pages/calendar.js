/**
 * Sky Calendar — moon-phase calendar for the run-up to Aug 13-15 2026.
 *
 * Hero (Darkness Progress) → Moon Trend → Calendar grid → Perseids → Glossary → Meta.
 * Data is pre-computed at build time (scripts/build-moon-data.js), so this page
 * does no astronomy in the browser — only fetch + render.
 */

import { i18n } from '../core/i18n.js';
import { moonSvg } from '../components/moon-svg.js';

const DATA_URL = './assets/data/moon-2026.json?v=44';

let DATA = null;
let dialog = null;
let currentWeekStart = null; // ISO date YYYY-MM-DD of Sunday

// ─── Date helpers (string-based, IDT-stable) ──────────────────────────

const todayISO = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());

const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00+03:00`);
  d.setUTCDate(d.getUTCDate() + n);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
};

const dayOfWeek = (iso) => {
  // 0=Sun..6=Sat in IDT
  return new Date(`${iso}T12:00:00+03:00`).getUTCDay();
};

const weekStartOf = (iso) => addDays(iso, -dayOfWeek(iso));

const daysBetween = (a, b) => {
  const da = new Date(`${a}T12:00:00+03:00`);
  const db = new Date(`${b}T12:00:00+03:00`);
  return Math.round((db - da) / 86400000);
};

const fmtDateShort = (iso, lang) => {
  const d = new Date(`${iso}T12:00:00+03:00`);
  return new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'ru-RU', {
    timeZone: 'Asia/Jerusalem',
    day: 'numeric',
    month: 'short',
  }).format(d);
};

const fmtDateLong = (iso, lang) => {
  const d = new Date(`${iso}T12:00:00+03:00`);
  return new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'ru-RU', {
    timeZone: 'Asia/Jerusalem',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
};

// Russian plurals: "1 неделя / 2 недели / 5 недель"
const pluralRu = (n, one, few, many) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
};

// ─── Data fetch ───────────────────────────────────────────────────────

async function fetchData() {
  if (DATA) return DATA;
  const res = await fetch(DATA_URL, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  DATA = await res.json();
  return DATA;
}

const dayOf = (iso) => DATA?.days.find(d => d.date === iso) || null;

// ─── Page render ──────────────────────────────────────────────────────

export async function renderCalendar(container) {
  const lang = i18n.lang || document.documentElement.lang || 'he';

  let data;
  try {
    data = await fetchData();
  } catch (err) {
    container.innerHTML = renderError(lang);
    container.querySelector('.cal-error__retry')?.addEventListener('click', () => renderCalendar(container));
    return;
  }

  const today = todayISO();
  const eventEnd = data.meta.eventDates[data.meta.eventDates.length - 1];

  // After event ended → minimal hero only.
  if (today > eventEnd) {
    container.innerHTML = renderEventEnded(lang);
    return;
  }

  // Start week = current week (Sunday-anchored), clamped to data start.
  if (!currentWeekStart) {
    currentWeekStart = weekStartOf(today);
    if (currentWeekStart < data.meta.rangeStart) {
      currentWeekStart = weekStartOf(data.meta.rangeStart);
    }
  }

  container.innerHTML = `
    <section class="page-section" aria-labelledby="cal-title">
      <div class="page-section__inner">
        ${renderHero(data, today, lang)}
        ${renderWeekNav(lang)}
        ${renderWeekdayHeader(lang)}
        <div class="cal-grid" role="grid" aria-label="${i18n.t('calendar.gridLabel') || 'Moon calendar'}" id="cal-grid"></div>
        ${renderPerseids(data, lang)}
        ${renderGlossary(lang)}
        ${renderMeta(data, lang)}
      </div>
    </section>
  `;

  attachListeners(container, data, today, lang);
  renderGrid(container, data, today, lang);
}

// ─── Hero ─────────────────────────────────────────────────────────────

function renderHero(data, today, lang) {
  const t = dayOf(today) || data.days[0];
  const lastEvent = data.meta.eventDates[data.meta.eventDates.length - 1];
  const nightsToCamp = Math.max(0, daysBetween(today, data.meta.eventDates[0]));
  const weeksToCamp = Math.floor(nightsToCamp / 7);
  const remainNights = nightsToCamp - weeksToCamp * 7;

  // Darkness Progress: today's starScore vs best in range
  const bestScore = Math.max(...data.days.map(d => d.starScore));
  const progress = Math.round((t.starScore / bestScore) * 100);

  const weeksLabel = lang === 'ru'
    ? pluralRu(weeksToCamp, 'неделя', 'недели', 'недель')
    : (lang === 'he' ? (weeksToCamp === 1 ? 'שבוע' : 'שבועות') : 'weeks');
  const nightsLabel = lang === 'ru'
    ? pluralRu(remainNights, 'ночь', 'ночи', 'ночей')
    : (lang === 'he' ? (remainNights === 1 ? 'לילה' : 'לילות') : 'nights');

  return `
    <header class="cal-hero">
      <h1 id="cal-title" class="page-section__title" data-i18n="calendar.title">${i18n.t('calendar.title')}</h1>
      <p class="cal-hero__sub" data-i18n="calendar.subtitle">${i18n.t('calendar.subtitle')}</p>
      <div class="cal-hero__moon">${moonSvg(t.illumination, t.waxing, { aria: i18n.t('calendar.phase.' + t.phase) })}</div>
      <div class="cal-hero__countdown" aria-live="polite">
        <span class="cal-hero__num">${weeksToCamp}</span>
        <span class="cal-hero__num-label">${weeksLabel}</span>
        <span class="cal-hero__num">${remainNights}</span>
        <span class="cal-hero__num-label">${nightsLabel}</span>
      </div>
      <div class="cal-hero__progress">
        <div class="cal-hero__progress-label">
          <span data-i18n="calendar.darknessProgress">${i18n.t('calendar.darknessProgress')}</span>
          <span class="tabular-nums">${progress}%</span>
        </div>
        <div class="cal-hero__progress-track">
          <div class="cal-hero__progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
    </header>
  `;
}

// ─── Week nav ─────────────────────────────────────────────────────────

function renderWeekNav(lang) {
  return `
    <div class="cal-nav">
      <button class="cal-nav__btn" id="cal-prev" aria-label="${i18n.t('calendar.prevWeek') || 'Previous week'}">‹</button>
      <span class="cal-nav__label" id="cal-week-label"></span>
      <button class="cal-nav__btn" id="cal-next" aria-label="${i18n.t('calendar.nextWeek') || 'Next week'}">›</button>
    </div>
  `;
}

function renderWeekdayHeader(lang) {
  // Sun..Sat short names in current language
  const refSunday = '2026-06-14'; // a known Sunday
  const names = [];
  for (let i = 0; i < 7; i++) {
    const iso = addDays(refSunday, i);
    const d = new Date(`${iso}T12:00:00+03:00`);
    const name = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'ru-RU', {
      timeZone: 'Asia/Jerusalem', weekday: 'short',
    }).format(d);
    names.push(`<div class="cal-weekday">${name}</div>`);
  }
  return `<div class="cal-weekdays">${names.join('')}</div>`;
}

// ─── Grid render ──────────────────────────────────────────────────────

function renderGrid(container, data, today, lang) {
  const grid = container.querySelector('#cal-grid');
  const label = container.querySelector('#cal-week-label');
  const prevBtn = container.querySelector('#cal-prev');
  const nextBtn = container.querySelector('#cal-next');
  if (!grid) return;

  // Week label
  const weekEnd = addDays(currentWeekStart, 6);
  label.textContent = `${fmtDateShort(currentWeekStart, lang)} — ${fmtDateShort(weekEnd, lang)}`;

  // Nav bounds: don't go before current week containing today; cap at last event week.
  const firstAllowedWeek = weekStartOf(today < data.meta.rangeStart ? data.meta.rangeStart : today);
  const lastAllowedWeek = weekStartOf(data.meta.eventDates[data.meta.eventDates.length - 1]);
  prevBtn.disabled = currentWeekStart <= firstAllowedWeek;
  nextBtn.disabled = currentWeekStart >= lastAllowedWeek;

  // Cells
  const html = [];
  for (let i = 0; i < 7; i++) {
    const iso = addDays(currentWeekStart, i);
    const d = dayOf(iso);
    const isPast = iso < today;
    const isToday = iso === today;
    const isEvent = d?.isEvent;
    const isPerseids = d?.isPerseidsPeak;
    const isTop = d && d.starScore >= 8 && !isPast;

    if (!d || iso < data.meta.rangeStart || iso > data.meta.rangeEnd) {
      html.push(`<div class="cal-day cal-day--past" aria-hidden="true">
        <div class="cal-day__num">${dateDay(iso)}</div>
      </div>`);
      continue;
    }

    const classes = ['cal-day'];
    if (isPast) classes.push('cal-day--past');
    if (isToday) classes.push('cal-day--today');
    if (isEvent) classes.push('cal-day--event');
    if (isPerseids) classes.push('cal-day--perseids');
    if (isTop && !isEvent) classes.push('cal-day--top');

    const label = isEvent
      ? i18n.t('calendar.eventDay')
      : (d.phase === 'new' ? i18n.t('calendar.phase.new')
        : d.phase === 'full' ? i18n.t('calendar.phase.full') : '');

    const ariaLabel = buildAriaLabel(d, iso, lang);

    html.push(`
      <button class="${classes.join(' ')}" role="gridcell" data-date="${iso}"
        aria-label="${ariaLabel}" ${isPast ? 'aria-disabled="true" tabindex="-1"' : ''}>
        <div class="cal-day__num">${dateDay(iso)}</div>
        <div class="cal-day__moon">${moonSvg(d.illumination, d.waxing)}</div>
        <div class="cal-day__label">${label}</div>
      </button>
    `);
  }
  grid.innerHTML = html.join('');
}

const dateDay = (iso) => parseInt(iso.slice(-2), 10);

function buildAriaLabel(d, iso, lang) {
  const dateStr = fmtDateLong(iso, lang);
  const phase = i18n.t('calendar.phase.' + d.phase) || d.phase;
  const score = `${i18n.t('calendar.starScore') || 'score'} ${d.starScore.toFixed(1)}`;
  return `${dateStr}. ${phase}. ${score}.`.replace(/"/g, '');
}

// ─── Listeners ────────────────────────────────────────────────────────

function attachListeners(container, data, today, lang) {
  const grid = container.querySelector('#cal-grid');
  const prevBtn = container.querySelector('#cal-prev');
  const nextBtn = container.querySelector('#cal-next');

  prevBtn?.addEventListener('click', () => {
    currentWeekStart = addDays(currentWeekStart, -7);
    renderGrid(container, data, today, lang);
  });

  nextBtn?.addEventListener('click', () => {
    currentWeekStart = addDays(currentWeekStart, 7);
    renderGrid(container, data, today, lang);
  });

  // Day click → dialog
  grid?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cal-day');
    if (!btn || btn.classList.contains('cal-day--past')) return;
    const iso = btn.dataset.date;
    if (!iso) return;
    openDialog(iso, lang);
  });

  // Keyboard navigation: RTL-aware (visual direction = chronological direction in RTL)
  grid?.addEventListener('keydown', (e) => {
    const focused = document.activeElement;
    if (!focused?.classList.contains('cal-day')) return;
    const iso = focused.dataset.date;
    if (!iso) return;
    const rtl = document.documentElement.dir === 'rtl';
    let delta = 0;
    switch (e.key) {
      case 'ArrowLeft':  delta = rtl ? 1 : -1; break;
      case 'ArrowRight': delta = rtl ? -1 : 1; break;
      case 'ArrowDown':  delta = 7; break;
      case 'ArrowUp':    delta = -7; break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        openDialog(iso, lang);
        return;
      default: return;
    }
    e.preventDefault();
    const target = addDays(iso, delta);
    if (target < today || target > data.meta.eventDates[data.meta.eventDates.length - 1]) return;
    const targetWeek = weekStartOf(target);
    if (targetWeek !== currentWeekStart) {
      currentWeekStart = targetWeek;
      renderGrid(container, data, today, lang);
    }
    requestAnimationFrame(() => {
      container.querySelector(`.cal-day[data-date="${target}"]`)?.focus();
    });
  });
}

// ─── Dialog ───────────────────────────────────────────────────────────

function getDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'cal-dialog';
  dialog.setAttribute('aria-modal', 'true');
  dialog.innerHTML = `<div class="cal-dialog__inner">
    <div class="cal-dialog__body"></div>
  </div>`;
  document.body.appendChild(dialog);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  return dialog;
}

function openDialog(iso, lang) {
  const d = dayOf(iso);
  if (!d) return;
  const dlg = getDialog();
  const body = dlg.querySelector('.cal-dialog__body');
  body.innerHTML = renderDialogBody(d, iso, lang);
  if (!dlg.open) dlg.showModal();
}

function renderDialogBody(d, iso, lang) {
  const phaseName = i18n.t('calendar.phase.' + d.phase);
  const dateStr = fmtDateLong(iso, lang);
  const illumPct = Math.round(d.illumination * 100);
  const scoreBand =
    d.starScore >= 9 ? 'top' :
    d.starScore >= 7 ? 'good' :
    d.starScore >= 4 ? 'mid' : 'low';
  const scoreText = i18n.t('calendar.scoreBand.' + scoreBand);

  let note = '';
  if (d.isPerseidsPeak) {
    note = `<div class="cal-dialog__note" data-i18n="calendar.perseidsNote">${i18n.t('calendar.perseidsNote')}</div>`;
  } else if (d.isEvent) {
    note = `<div class="cal-dialog__note">${i18n.t('calendar.eventNote')} <a href="#program" style="color:inherit;text-decoration:underline">${i18n.t('calendar.programLink')}</a></div>`;
  }

  // Darkness Bar: position the moon-overlay between moonrise..moonset
  // mapped onto the sunset..sunrise night strip.
  const moonOverlay = computeMoonOverlay(d);

  return `
    <div class="cal-dialog__header">
      <div class="cal-dialog__moon">${moonSvg(d.illumination, d.waxing, { aria: phaseName })}</div>
      <div>
        <h3 class="cal-dialog__title">${dateStr}</h3>
        <div class="cal-dialog__phase">${phaseName}</div>
        <div class="cal-dialog__illum">${i18n.t('calendar.illumination')}: <strong>${illumPct}%</strong></div>
      </div>
    </div>

    <div class="cal-dialog__grid">
      ${dialogRow('calendar.sunset',       d.sunset)}
      ${dialogRow('calendar.sunrise',      d.sunrise)}
      ${dialogRow('calendar.twilightEnd',  d.twilightEnd)}
      ${dialogRow('calendar.twilightStart',d.twilightStart)}
      ${dialogRow('calendar.moonrise',     d.moonrise)}
      ${dialogRow('calendar.moonset',      d.moonset)}
    </div>

    <div class="cal-dialog__bar">
      <div class="cal-dialog__bar-label">
        <span data-i18n="calendar.darkWindow">${i18n.t('calendar.darkWindow')}</span>
        <span class="tabular-nums">${formatDuration(d.darkMin, lang)}</span>
      </div>
      <div class="cal-dialog__bar-track">
        ${moonOverlay ? `<div class="cal-dialog__bar-moon" style="inset-inline-start:${moonOverlay.start}%;width:${moonOverlay.width}%"></div>` : ''}
      </div>
    </div>

    <div class="cal-dialog__score">
      <span class="cal-dialog__score-num ${scoreBand === 'top' ? 'cal-dialog__score-num--top' : ''}">${d.starScore.toFixed(1)}</span>
      <span class="cal-dialog__score-text">${scoreText}</span>
    </div>

    ${note}
  `;
}

function dialogRow(key, value) {
  if (!value) return '';
  return `<div class="cal-dialog__row">
    <span class="cal-dialog__row-label" data-i18n="${key}">${i18n.t(key)}</span>
    <span class="cal-dialog__row-value">${value}</span>
  </div>`;
}

function computeMoonOverlay(d) {
  // Map moonrise/moonset onto the night strip (sunset → next sunrise).
  // Returns { start, width } in %.
  if (!d.moonrise || !d.moonset || !d.sunset || !d.sunrise) return null;
  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  let sunsetMin = toMin(d.sunset);
  let sunriseMin = toMin(d.sunrise) + 24 * 60; // wraps to next day
  let mrMin = toMin(d.moonrise);
  let msMin = toMin(d.moonset);
  // shift into [sunset..sunrise+24h] window
  if (mrMin < sunsetMin) mrMin += 24 * 60;
  if (msMin < sunsetMin) msMin += 24 * 60;
  const nightLen = sunriseMin - sunsetMin;
  // clip to night
  const start = Math.max(0, mrMin - sunsetMin);
  const end = Math.min(nightLen, msMin - sunsetMin);
  if (end <= start) return null;
  return {
    start: (start / nightLen) * 100,
    width: ((end - start) / nightLen) * 100,
  };
}

function formatDuration(minutes, lang) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return lang === 'he' ? `${h}ש׳ ${m}ד׳` : `${h}ч ${m}м`;
}

// ─── Perseids block ───────────────────────────────────────────────────

function renderPerseids(data, lang) {
  return `
    <article class="cal-perseids">
      <h2 data-i18n="calendar.perseidsTitle">${i18n.t('calendar.perseidsTitle')}</h2>

      <p class="cal-perseids__lead" data-i18n="calendar.perseidsLead">${i18n.t('calendar.perseidsLead')}</p>

      <div class="cal-perseids__facts">
        <div class="cal-perseids__fact">
          <div class="cal-perseids__fact-num">60–80</div>
          <div class="cal-perseids__fact-label" data-i18n="calendar.factMeteors">${i18n.t('calendar.factMeteors')}</div>
        </div>
        <div class="cal-perseids__fact">
          <div class="cal-perseids__fact-num">0%</div>
          <div class="cal-perseids__fact-label" data-i18n="calendar.factMoon">${i18n.t('calendar.factMoon')}</div>
        </div>
        <div class="cal-perseids__fact">
          <div class="cal-perseids__fact-num">01–04</div>
          <div class="cal-perseids__fact-label" data-i18n="calendar.factWindow">${i18n.t('calendar.factWindow')}</div>
        </div>
      </div>

      ${perseidsSection('persH1', 'persP1')}
      ${perseidsSection('persH2', 'persP2')}
      ${perseidsSection('persH3', 'persP3')}
      ${perseidsSection('persH4', 'persP4')}
    </article>
  `;
}

function perseidsSection(hKey, pKey) {
  const heading = i18n.t('calendar.' + hKey);
  const body = (i18n.t('calendar.' + pKey) || '').split(/\n{2,}/).map(p => `<p>${p}</p>`).join('');
  return `<section class="cal-perseids__section">
    <h3 data-i18n="calendar.${hKey}">${heading}</h3>
    ${body}
  </section>`;
}

// ─── Glossary ─────────────────────────────────────────────────────────

function renderGlossary(lang) {
  const phases = ['new','waxingCrescent','firstQuarter','waxingGibbous','full','waningGibbous','lastQuarter','waningCrescent'];
  const samples = {
    new: [0, true], waxingCrescent: [0.25, true], firstQuarter: [0.5, true],
    waxingGibbous: [0.75, true], full: [1, true],
    waningGibbous: [0.75, false], lastQuarter: [0.5, false], waningCrescent: [0.25, false],
  };
  const phaseCells = phases.map(p => `
    <div class="cal-glossary__phase">
      ${moonSvg(samples[p][0], samples[p][1])}
      <div class="cal-glossary__phase-name" data-i18n="calendar.phase.${p}">${i18n.t('calendar.phase.' + p)}</div>
    </div>
  `).join('');

  return `
    <details class="cal-glossary">
      <summary data-i18n="calendar.glossaryTitle">${i18n.t('calendar.glossaryTitle')}</summary>
      <div class="cal-glossary__content">
        <h3 data-i18n="calendar.phasesTitle">${i18n.t('calendar.phasesTitle')}</h3>
        <div class="cal-glossary__phases">${phaseCells}</div>
        <h3 data-i18n="calendar.twilightTitle">${i18n.t('calendar.twilightTitle')}</h3>
        <div class="cal-glossary__twi">
          <div class="cal-glossary__twi-row">
            <strong data-i18n="calendar.twi.civil.name">${i18n.t('calendar.twi.civil.name')}</strong>
            <span data-i18n="calendar.twi.civil.desc">${i18n.t('calendar.twi.civil.desc')}</span>
          </div>
          <div class="cal-glossary__twi-row">
            <strong data-i18n="calendar.twi.nautical.name">${i18n.t('calendar.twi.nautical.name')}</strong>
            <span data-i18n="calendar.twi.nautical.desc">${i18n.t('calendar.twi.nautical.desc')}</span>
          </div>
          <div class="cal-glossary__twi-row">
            <strong data-i18n="calendar.twi.astro.name">${i18n.t('calendar.twi.astro.name')}</strong>
            <span data-i18n="calendar.twi.astro.desc">${i18n.t('calendar.twi.astro.desc')}</span>
          </div>
        </div>
      </div>
    </details>
  `;
}

// ─── Meta ─────────────────────────────────────────────────────────────

function renderMeta(data, lang) {
  return `
    <p class="cal-meta">
      Borot Lotz · ${data.meta.coords.lat.toFixed(4)}°N, ${data.meta.coords.lon.toFixed(4)}°E · IDT (UTC+3)
      · <a href="#sky" data-i18n="calendar.skyLink">${i18n.t('calendar.skyLink')}</a>
    </p>
  `;
}

// ─── Error / ended states ─────────────────────────────────────────────

function renderError(lang) {
  return `
    <section class="page-section">
      <div class="page-section__inner">
        <div class="cal-error">
          <h2 class="cal-error__title" data-i18n="calendar.errorTitle">${i18n.t('calendar.errorTitle')}</h2>
          <p data-i18n="calendar.errorText">${i18n.t('calendar.errorText')}</p>
          <div class="cal-error__actions">
            <button class="cal-error__btn cal-error__retry" data-i18n="calendar.retry">${i18n.t('calendar.retry')}</button>
            <a class="cal-error__btn" href="#sky" data-i18n="calendar.skyLink">${i18n.t('calendar.skyLink')}</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderEventEnded(lang) {
  return `
    <section class="page-section">
      <div class="page-section__inner">
        <div class="cal-error">
          <h2 class="cal-error__title" data-i18n="calendar.endedTitle">${i18n.t('calendar.endedTitle')}</h2>
          <p data-i18n="calendar.endedText">${i18n.t('calendar.endedText')}</p>
          <div class="cal-error__actions">
            <a class="cal-error__btn" href="#gallery" data-i18n="nav.gallery">${i18n.t('nav.gallery')}</a>
          </div>
        </div>
      </div>
    </section>
  `;
}
