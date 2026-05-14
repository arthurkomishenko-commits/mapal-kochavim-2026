/**
 * Safety page — emergency contacts, GPS, guidelines
 */

import { i18n } from '../core/i18n.js';

const BOROT_LOTZ_COORDS = { lat: 30.6167, lng: 34.7833 };

export function renderSafety(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="safety-title">
      <div class="page-section__inner">
        <h1 id="safety-title" class="page-section__title" data-i18n="safety.title">
          ${i18n.t('safety.title')}
        </h1>

        <div class="safety-card safety-card--emergency">
          <h2 data-i18n="safety.emergencyTitle">${i18n.t('safety.emergencyTitle')}</h2>
          <div class="safety-contacts">
            <a href="tel:100" class="safety-contact">
              <span class="safety-contact__label" data-i18n="safety.police">${i18n.t('safety.police')}</span>
              <span class="safety-contact__number">100</span>
            </a>
            <a href="tel:101" class="safety-contact">
              <span class="safety-contact__label" data-i18n="safety.mda">${i18n.t('safety.mda')}</span>
              <span class="safety-contact__number">101</span>
            </a>
            <a href="tel:102" class="safety-contact">
              <span class="safety-contact__label" data-i18n="safety.fire">${i18n.t('safety.fire')}</span>
              <span class="safety-contact__number">102</span>
            </a>
          </div>
        </div>

        <div class="safety-card">
          <h2 data-i18n="safety.gpsTitle">${i18n.t('safety.gpsTitle')}</h2>
          <p class="safety-card__coords tabular-nums">
            ${BOROT_LOTZ_COORDS.lat}°N, ${BOROT_LOTZ_COORDS.lng}°E
          </p>
          <button class="btn btn--outline" id="copy-coords" type="button">
            <span data-i18n="safety.copyCoords">${i18n.t('safety.copyCoords')}</span>
          </button>
        </div>

        <div class="safety-card">
          <h2 data-i18n="safety.rulesTitle">${i18n.t('safety.rulesTitle')}</h2>
          <ul class="safety-rules">
            <li data-i18n="safety.rule1">${i18n.t('safety.rule1')}</li>
            <li data-i18n="safety.rule2">${i18n.t('safety.rule2')}</li>
            <li data-i18n="safety.rule3">${i18n.t('safety.rule3')}</li>
            <li data-i18n="safety.rule4">${i18n.t('safety.rule4')}</li>
            <li data-i18n="safety.rule5">${i18n.t('safety.rule5')}</li>
          </ul>
        </div>
      </div>
    </section>
  `;

  // Copy coordinates
  const copyBtn = container.querySelector('#copy-coords');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = `${BOROT_LOTZ_COORDS.lat}, ${BOROT_LOTZ_COORDS.lng}`;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.querySelector('span').textContent = i18n.t('safety.copied');
        setTimeout(() => {
          copyBtn.querySelector('span').textContent = i18n.t('safety.copyCoords');
        }, 2000);
      } catch {
        // Fallback for older browsers
        prompt(i18n.t('safety.copyCoords'), text);
      }
    });
  }
}
