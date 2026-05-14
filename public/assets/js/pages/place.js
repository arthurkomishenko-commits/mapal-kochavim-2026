/**
 * Place page — about the camping location
 */

import { i18n } from '../core/i18n.js';

const BOROT_LOTZ_COORDS = { lat: 30.6167, lng: 34.7833 };
const WAZE_LINK = `https://waze.com/ul?ll=${BOROT_LOTZ_COORDS.lat},${BOROT_LOTZ_COORDS.lng}&navigate=yes`;
const GMAPS_LINK = `https://www.google.com/maps/dir/?api=1&destination=${BOROT_LOTZ_COORDS.lat},${BOROT_LOTZ_COORDS.lng}`;

export function renderPlace(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="place-title">
      <div class="page-section__inner">
        <h1 id="place-title" class="page-section__title" data-i18n="place.title">
          ${i18n.t('place.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="place.subtitle">
          ${i18n.t('place.subtitle')}
        </p>

        <!-- TODO: Replace with real photo (see TODO-PHOTOS.md #2) -->
        <div class="placeholder-img placeholder-img--desert" role="img" aria-label="Negev desert landscape"></div>

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

        <!-- TODO: Replace with real photo (see TODO-PHOTOS.md #3) -->
        <div class="placeholder-img placeholder-img--camping" role="img" aria-label="Camping area"></div>

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
  `;
}
