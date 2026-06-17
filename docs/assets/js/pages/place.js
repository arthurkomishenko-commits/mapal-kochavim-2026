/**
 * Place + Program page — combined location info and event timeline
 */

import { i18n } from '../core/i18n.js';

const BOROT_LOTZ_COORDS = { lat: 30.6167, lng: 34.7833 };
const WAZE_LINK = 'https://waze.com/ul/hsv2tedc1p';
const GMAPS_LINK = 'https://maps.app.goo.gl/EaoofpuTeQ2TyPkZ7?g_st=ic';

export function renderPlace(container) {
  container.innerHTML = `
    <!-- ═══ Place ═══ -->
    <section class="page-section" aria-labelledby="place-title">
      <div class="page-section__inner">
        <h1 id="place-title" class="page-section__title" data-i18n="place.title">
          ${i18n.t('place.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="place.subtitle">
          ${i18n.t('place.subtitle')}
        </p>

        <div class="place-photo place-photo--hero">
          <img src="images/camp-day-tents.jpg" alt="Camp at Borot Lotz — tents and cars" loading="eager" class="place-photo__img">
        </div>

        <div class="place-card">
          <h2 class="place-card__name">Borot Lotz (KKL)</h2>
          <p class="place-card__coords text-secondary">
            ${BOROT_LOTZ_COORDS.lat}°N, ${BOROT_LOTZ_COORDS.lng}°E
          </p>

          <div class="place-card__nav-buttons">
            <a href="${WAZE_LINK}" target="_blank" rel="noopener" class="btn btn--outline">
              <span data-i18n="place.openWaze">${i18n.t('place.openWaze')}</span>
            </a>
            <a href="${GMAPS_LINK}" target="_blank" rel="noopener" class="btn btn--outline">
              <span data-i18n="place.openGmaps">${i18n.t('place.openGmaps')}</span>
            </a>
          </div>
        </div>

        <div class="place-photos-grid">
          <div class="place-photo">
            <img src="images/camp-sunset-wide.jpg" alt="Camp at sunset" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/rocks-sunset.jpg" alt="Desert rocks at sunset" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/negev-panorama-wide.jpg" alt="Negev desert panorama" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/camp-cliff.jpg" alt="Car and tent at cliff" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/road-negev.jpg" alt="Road to Negev" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/camp-sunset-vertical.jpg" alt="Camp at sunset — vertical" loading="lazy" class="place-photo__img">
          </div>
        </div>

        <div class="place-info">
          <div class="place-info__item">
            <h3 data-i18n="place.accessTitle">${i18n.t('place.accessTitle')}</h3>
            <p class="text-secondary" data-i18n="place.accessText">${i18n.t('place.accessText')}</p>
          </div>
          <div class="place-info__item">
            <h3 data-i18n="place.facilitiesTitle">${i18n.t('place.facilitiesTitle')}</h3>
            <p class="text-secondary" data-i18n="place.facilitiesText">${i18n.t('place.facilitiesText')}</p>
          </div>
          <div class="place-info__item">
            <h3 data-i18n="place.whyTitle">${i18n.t('place.whyTitle')}</h3>
            <p class="text-secondary" data-i18n="place.whyText">${i18n.t('place.whyText')}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Program ═══ -->
    <section class="page-section" aria-labelledby="program-title">
      <div class="page-section__inner">
        <h2 id="program-title" class="page-section__title" data-i18n="program.title">
          ${i18n.t('program.title')}
        </h2>

        <div class="program-photo">
          <img src="images/sunset-negev.webp" alt="Sunset over the Negev desert" loading="lazy" class="program-photo__img">
        </div>

        <div class="timeline">
          <div class="timeline__day">
            <h3 class="timeline__day-title" data-i18n="program.day13title">${i18n.t('program.day13title')}</h3>
            <div class="timeline__events">
              <div class="timeline__event" data-date="2026-08-13" data-start="16:00" data-end="19:00">
                <span class="timeline__time">16:00–19:00</span>
                <div class="timeline__detail"><p data-i18n="program.day13_arrival">${i18n.t('program.day13_arrival')}</p></div>
              </div>
              <div class="timeline__event" data-date="2026-08-13" data-start="19:00" data-end="20:30">
                <span class="timeline__time">19:00–20:30</span>
                <div class="timeline__detail"><p data-i18n="program.day13_dinner">${i18n.t('program.day13_dinner')}</p></div>
              </div>
              <div class="timeline__event" data-date="2026-08-13" data-start="21:00" data-end="02:00">
                <span class="timeline__time">21:00–02:00</span>
                <div class="timeline__detail"><p data-i18n="program.day13_stars">${i18n.t('program.day13_stars')}</p></div>
              </div>
              <div class="timeline__event" data-date="2026-08-13" data-start="22:00" data-end="00:00">
                <span class="timeline__time">22:00–00:00</span>
                <div class="timeline__detail"><p data-i18n="program.day13_telescope">${i18n.t('program.day13_telescope')}</p></div>
              </div>
            </div>
          </div>

          <div class="timeline__day">
            <h3 class="timeline__day-title" data-i18n="program.day14title">${i18n.t('program.day14title')}</h3>
            <div class="timeline__events">
              <div class="timeline__event" data-date="2026-08-14" data-start="05:30">
                <span class="timeline__time">05:30</span>
                <div class="timeline__detail"><p data-i18n="program.day14_sunrise">${i18n.t('program.day14_sunrise')}</p></div>
              </div>
              <div class="timeline__event" data-date="2026-08-14" data-start="08:00" data-end="11:00">
                <span class="timeline__time">08:00–11:00</span>
                <div class="timeline__detail"><p data-i18n="program.day14_morning">${i18n.t('program.day14_morning')}</p></div>
              </div>
              <div class="timeline__event" data-date="2026-08-14" data-start="17:00" data-end="19:00">
                <span class="timeline__time">17:00–19:00</span>
                <div class="timeline__detail"><p data-i18n="program.day14_hike">${i18n.t('program.day14_hike')}</p></div>
              </div>
              <div class="timeline__event" data-date="2026-08-14" data-start="20:00">
                <span class="timeline__time">20:00</span>
                <div class="timeline__detail"><p data-i18n="program.day14_bonfire">${i18n.t('program.day14_bonfire')}</p></div>
              </div>
            </div>
          </div>

          <div class="timeline__day">
            <h3 class="timeline__day-title" data-i18n="program.day15title">${i18n.t('program.day15title')}</h3>
            <div class="timeline__events">
              <div class="timeline__event" data-date="2026-08-15" data-start="07:00" data-end="10:00">
                <span class="timeline__time">07:00–10:00</span>
                <div class="timeline__detail"><p data-i18n="program.day15_pack">${i18n.t('program.day15_pack')}</p></div>
              </div>
              <div class="timeline__event" data-date="2026-08-15" data-start="10:00">
                <span class="timeline__time">10:00</span>
                <div class="timeline__detail"><p data-i18n="program.day15_leave">${i18n.t('program.day15_leave')}</p></div>
              </div>
            </div>
          </div>
        </div>

        <div id="timeline-achievement" class="timeline-achievement" hidden></div>
      </div>
    </section>
  `;

  initTimelineLive(container);
}

// ─── Live timeline state ───────────────────────────────────────────────

let timelineTick = null;

function initTimelineLive(container) {
  if (timelineTick) { clearInterval(timelineTick); timelineTick = null; }
  const update = () => updateTimelineState(container);
  update();
  // In past mode every event is already done — no need to re-tick.
  import('../core/site-mode.js').then(({ siteMode }) => {
    if (siteMode.is('past')) return;
    // Self-clean if the container left the DOM between dynamic-import resolve
    // and now (user navigated away while siteMode was loading).
    if (!container.isConnected) return;
    timelineTick = setInterval(() => {
      if (!container.isConnected) {
        if (timelineTick) { clearInterval(timelineTick); timelineTick = null; }
        return;
      }
      update();
    }, 30 * 1000);
    const cleanup = () => {
      if (timelineTick) { clearInterval(timelineTick); timelineTick = null; }
      window.removeEventListener('routechange', cleanup);
    };
    window.addEventListener('routechange', cleanup);
  });
}

function nowIDT() {
  return new Date();
}

function eventBounds(dateISO, startHHMM, endHHMM) {
  const start = new Date(`${dateISO}T${startHHMM}:00+03:00`);
  let end;
  if (endHHMM) {
    end = new Date(`${dateISO}T${endHHMM}:00+03:00`);
    if (end <= start) end = new Date(end.getTime() + 24 * 3600 * 1000); // crosses midnight
  } else {
    // point event — keep active for 30 minutes
    end = new Date(start.getTime() + 30 * 60 * 1000);
  }
  return { start, end };
}

function updateTimelineState(container) {
  const now = nowIDT();
  const events = container.querySelectorAll('.timeline__event[data-date][data-start]');
  events.forEach(el => {
    const { start, end } = eventBounds(
      el.dataset.date, el.dataset.start, el.dataset.end || null
    );
    el.classList.remove('timeline__event--past', 'timeline__event--active', 'timeline__event--highlight');
    if (now >= end)       el.classList.add('timeline__event--past');
    else if (now >= start) el.classList.add('timeline__event--active');
  });

  // Achievement card — after 2026-08-15 10:00 IDT, for logged-in users only.
  const achievementBox = container.querySelector('#timeline-achievement');
  if (!achievementBox) return;
  const eventEnd = new Date('2026-08-15T10:00:00+03:00');
  if (now < eventEnd) { achievementBox.hidden = true; return; }

  // Lazy-load auth to avoid circular imports / make this self-contained.
  import('../core/auth.js').then(({ auth }) => {
    const user = auth.getUser ? auth.getUser() : null;
    if (!user) { achievementBox.hidden = true; return; }
    if (achievementBox.dataset.rendered) return;
    achievementBox.dataset.rendered = '1';
    const name = (user.name || '').trim().split(/\s+/)[0] || '';
    achievementBox.innerHTML = renderAchievement(name);
    achievementBox.hidden = false;
  }).catch(() => {});
}

function renderAchievement(name) {
  const greeting = name ? `${i18n.t('program.achievementHello').replace('{name}', name)} ` : '';
  return `
    <div class="timeline-achievement__inner">
      <div class="timeline-achievement__check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12.5 11 15.5 16 9.5"/>
        </svg>
      </div>
      <div class="timeline-achievement__body">
        <h3 class="timeline-achievement__title" data-i18n="program.achievementTitle">${i18n.t('program.achievementTitle')}</h3>
        <p class="timeline-achievement__text">${greeting}${i18n.t('program.achievementText')}</p>
      </div>
    </div>
  `;
}
