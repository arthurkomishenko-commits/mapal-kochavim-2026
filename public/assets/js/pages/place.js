/**
 * Place + Program page — combined location info and event timeline
 */

import { i18n } from '../core/i18n.js';

const BOROT_LOTZ_COORDS = { lat: 30.6167, lng: 34.7833 };
const WAZE_LINK = `https://waze.com/ul?ll=${BOROT_LOTZ_COORDS.lat},${BOROT_LOTZ_COORDS.lng}&navigate=yes`;
const GMAPS_LINK = `https://www.google.com/maps/dir/?api=1&destination=${BOROT_LOTZ_COORDS.lat},${BOROT_LOTZ_COORDS.lng}`;

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
          <img src="images/negev-panorama.jpg" alt="Negev desert panorama — Borot Lotz area" loading="eager" class="place-photo__img">
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
            <img src="images/campsite-day.jpg" alt="Borot Lotz campsite — daytime view" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/campsite-dusk.webp" alt="Borot Lotz campsite at dusk" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/negev-tree.jpg" alt="Lone tree in the Negev desert" loading="lazy" class="place-photo__img">
          </div>
          <div class="place-photo">
            <img src="images/negev-hills.webp" alt="Negev hills and valleys" loading="lazy" class="place-photo__img">
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
              <div class="timeline__event">
                <span class="timeline__time">16:00–19:00</span>
                <div class="timeline__detail"><p data-i18n="program.day13_arrival">${i18n.t('program.day13_arrival')}</p></div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">19:00–20:30</span>
                <div class="timeline__detail"><p data-i18n="program.day13_dinner">${i18n.t('program.day13_dinner')}</p></div>
              </div>
              <div class="timeline__event timeline__event--highlight">
                <span class="timeline__time">21:00–02:00</span>
                <div class="timeline__detail"><p data-i18n="program.day13_stars">${i18n.t('program.day13_stars')}</p></div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">22:00–00:00</span>
                <div class="timeline__detail"><p data-i18n="program.day13_telescope">${i18n.t('program.day13_telescope')}</p></div>
              </div>
            </div>
          </div>

          <div class="timeline__day">
            <h3 class="timeline__day-title" data-i18n="program.day14title">${i18n.t('program.day14title')}</h3>
            <div class="timeline__events">
              <div class="timeline__event">
                <span class="timeline__time">05:30</span>
                <div class="timeline__detail"><p data-i18n="program.day14_sunrise">${i18n.t('program.day14_sunrise')}</p></div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">08:00–11:00</span>
                <div class="timeline__detail"><p data-i18n="program.day14_morning">${i18n.t('program.day14_morning')}</p></div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">17:00–19:00</span>
                <div class="timeline__detail"><p data-i18n="program.day14_hike">${i18n.t('program.day14_hike')}</p></div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">20:00</span>
                <div class="timeline__detail"><p data-i18n="program.day14_bonfire">${i18n.t('program.day14_bonfire')}</p></div>
              </div>
            </div>
          </div>

          <div class="timeline__day">
            <h3 class="timeline__day-title" data-i18n="program.day15title">${i18n.t('program.day15title')}</h3>
            <div class="timeline__events">
              <div class="timeline__event">
                <span class="timeline__time">07:00–10:00</span>
                <div class="timeline__detail"><p data-i18n="program.day15_pack">${i18n.t('program.day15_pack')}</p></div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">10:00</span>
                <div class="timeline__detail"><p data-i18n="program.day15_leave">${i18n.t('program.day15_leave')}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
