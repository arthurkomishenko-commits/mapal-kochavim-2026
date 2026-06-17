/**
 * Sky page — astronomy, Perseids info, telescope, real photos
 */

import { i18n } from '../core/i18n.js';
import { moonSvg } from '../components/moon-svg.js';

const DATA_URL = './assets/data/moon-2026.json?v=42';

export function renderSky(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="sky-title">
      <div class="page-section__inner">
        <h1 id="sky-title" class="page-section__title" data-i18n="sky.title">
          ${i18n.t('sky.title')}
        </h1>

        <div class="sky-card sky-card--featured">
          <h2 data-i18n="sky.perseidsTitle">${i18n.t('sky.perseidsTitle')}</h2>
          <p class="text-secondary" data-i18n="sky.perseidsText">${i18n.t('sky.perseidsText')}</p>
          <div class="sky-card__stat">
            <span class="sky-card__stat-number tabular-nums" data-i18n="sky.meteorsUpTo">${i18n.t('sky.meteorsUpTo')}</span>
            <span class="sky-card__stat-label" data-i18n="sky.meteorsPerHour">${i18n.t('sky.meteorsPerHour')}</span>
          </div>
        </div>

        <div class="sky-photo sky-photo--hero">
          <img src="images/moon-telescope.jpg" alt="Moon through Robert's Skywatcher telescope" loading="eager" class="sky-photo__img">
        </div>

        <div class="place-photos-grid">
          <div class="place-photo">
            <img src="images/milkyway-purple.jpg" alt="Milky Way — real photo from Borot Lotz" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/milkyway-real.jpg" alt="Night sky with Milky Way" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/stars-shelter.jpg" alt="Stars above the camp shelter" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/person-milkyway.jpg" alt="Person under Milky Way" loading="lazy" class="place-photo__img">
          </div>
        </div>

        <div class="sky-card" style="margin-block-start:var(--space-6);">
          <h2 data-i18n="sky.tonightTitle">${i18n.t('sky.tonightTitle')}</h2>
          <div class="sky-tonight">
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightSunset">${i18n.t('sky.tonightSunset')}</span>
              <span class="sky-tonight__value">19:25</span>
            </div>
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightTwilightEnd">${i18n.t('sky.tonightTwilightEnd')}</span>
              <span class="sky-tonight__value">20:52</span>
            </div>
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightTwilightStart">${i18n.t('sky.tonightTwilightStart')}</span>
              <span class="sky-tonight__value">04:39</span>
            </div>
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightSunrise">${i18n.t('sky.tonightSunrise')}</span>
              <span class="sky-tonight__value">06:06</span>
            </div>
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightPeak">${i18n.t('sky.tonightPeak')}</span>
              <span class="sky-tonight__value">01:00–04:30</span>
            </div>
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightBest">${i18n.t('sky.tonightBest')}</span>
              <span class="sky-tonight__value">02:30–04:00</span>
            </div>
          </div>

          <div class="sky-strip" id="sky-cal-strip" aria-label="${i18n.t('sky.calStripLabel') || 'Calendar preview'}">
            <!-- async-populated -->
          </div>
        </div>

        <div class="sky-info-grid">
          <div class="sky-card sky-card--compact sky-card--center">
            <h3 data-i18n="sky.sunTitle">${i18n.t('sky.sunTitle')}</h3>
            <p class="text-secondary" data-i18n="sky.sunText">${i18n.t('sky.sunText')}</p>
          </div>
          <div class="sky-card sky-card--compact sky-card--center">
            <h3 data-i18n="sky.moonTitle">${i18n.t('sky.moonTitle')}</h3>
            <p class="text-secondary" data-i18n="sky.moonText">${i18n.t('sky.moonText')}</p>
          </div>
          <div class="sky-card sky-card--compact sky-card--center">
            <h3 data-i18n="sky.planetsTitle">${i18n.t('sky.planetsTitle')}</h3>
            <p class="text-secondary" data-i18n="sky.planetsText">${i18n.t('sky.planetsText')}</p>
          </div>
        </div>

        <div class="sky-card sky-card--featured" style="margin-block-start:var(--space-6);">
          <h2 data-i18n="sky.tipsTitle">${i18n.t('sky.tipsTitle')}</h2>
          <ul class="sky-tips">
            <li>
              <strong class="sky-tip__title" data-i18n="sky.tip1Title">${i18n.t('sky.tip1Title')}</strong>
              <p class="sky-tip__body" data-i18n="sky.tip1Body">${i18n.t('sky.tip1Body')}</p>
            </li>
            <li>
              <strong class="sky-tip__title" data-i18n="sky.tip2Title">${i18n.t('sky.tip2Title')}</strong>
              <p class="sky-tip__body" data-i18n="sky.tip2Body">${i18n.t('sky.tip2Body')}</p>
            </li>
            <li>
              <strong class="sky-tip__title" data-i18n="sky.tip3Title">${i18n.t('sky.tip3Title')}</strong>
              <p class="sky-tip__body" data-i18n="sky.tip3Body">${i18n.t('sky.tip3Body')}</p>
            </li>
            <li>
              <strong class="sky-tip__title" data-i18n="sky.tip4Title">${i18n.t('sky.tip4Title')}</strong>
              <p class="sky-tip__body" data-i18n="sky.tip4Body">${i18n.t('sky.tip4Body')}</p>
            </li>
          </ul>
        </div>

        <div class="sky-card" style="margin-block-start:var(--space-6);">
          <h2 data-i18n="sky.telescopeTitle">${i18n.t('sky.telescopeTitle')}</h2>
          <p class="text-secondary" data-i18n="sky.telescopeText">${i18n.t('sky.telescopeText')}</p>
        </div>

        <div class="video-featured">
          <video controls preload="metadata" playsinline poster="images/posters/telescope-tour.jpg">
            <source src="videos/telescope-tour.mp4" type="video/mp4">
          </video>
        </div>
      </div>
    </section>
  `;

  // Async-load the calendar strip — preloaded JSON should be cache-hit.
  loadStripAsync(container).catch(err => console.warn('sky strip load failed', err));
}

// ─── Strip ───────────────────────────────────────────────────────────

async function loadStripAsync(container) {
  const res = await fetch(DATA_URL, { cache: 'force-cache' });
  if (!res.ok) return;
  const data = await res.json();
  const strip = container.querySelector('#sky-cal-strip');
  if (!strip) return;

  const lang = i18n.lang || document.documentElement.lang || 'he';
  const today = todayIDT();

  // Show next 7 days starting today (rolling preview).
  const cells = [];
  for (let i = 0; i < 7; i++) {
    const iso = addDays(today, i);
    const d = data.days.find(x => x.date === iso);
    if (!d) {
      cells.push(`<div class="sky-strip__cell sky-strip__cell--empty" aria-hidden="true"></div>`);
      continue;
    }
    const isToday = iso === today;
    const isEvent = d.isEvent;
    const isPerseids = d.isPerseidsPeak;
    const classes = ['sky-strip__cell'];
    if (isToday) classes.push('sky-strip__cell--today');
    if (isEvent) classes.push('sky-strip__cell--event');
    if (isPerseids) classes.push('sky-strip__cell--perseids');

    const wd = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'ru-RU', {
      timeZone: 'Asia/Jerusalem', weekday: 'short',
    }).format(new Date(`${iso}T12:00:00+03:00`));

    cells.push(`
      <a href="#calendar" class="${classes.join(' ')}" aria-label="${wd} ${parseInt(iso.slice(-2), 10)}">
        <div class="sky-strip__wd">${wd}</div>
        <div class="sky-strip__num">${parseInt(iso.slice(-2), 10)}</div>
        <div class="sky-strip__moon">${moonSvg(d.illumination, d.waxing)}</div>
      </a>
    `);
  }
  strip.innerHTML = cells.join('');
}

const todayIDT = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());

function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00+03:00`);
  d.setUTCDate(d.getUTCDate() + n);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}
