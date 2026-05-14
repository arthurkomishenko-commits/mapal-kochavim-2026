/**
 * Sky page — astronomy program, Perseids info
 */

import { i18n } from '../core/i18n.js';

export function renderSky(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="sky-title">
      <div class="page-section__inner">
        <h1 id="sky-title" class="page-section__title" data-i18n="sky.title">
          ${i18n.t('sky.title')}
        </h1>

        <div class="sky-photo sky-photo--hero">
          <img src="images/person-milkyway.jpg" alt="Person with flashlight under the Milky Way in Negev" loading="eager" class="sky-photo__img">
        </div>

        <div class="sky-card sky-card--featured">
          <h2 data-i18n="sky.perseidsTitle">${i18n.t('sky.perseidsTitle')}</h2>
          <p class="text-secondary" data-i18n="sky.perseidsText">${i18n.t('sky.perseidsText')}</p>
          <div class="sky-card__stat">
            <span class="sky-card__stat-number tabular-nums">100+</span>
            <span class="sky-card__stat-label" data-i18n="sky.meteorsPerHour">${i18n.t('sky.meteorsPerHour')}</span>
          </div>
        </div>

        <div class="sky-photo">
          <img src="images/milkyway-closeup.jpg" alt="Milky Way galactic center — close-up astrophoto" loading="lazy" class="sky-photo__img">
        </div>

        <div class="sky-card">
          <h2 data-i18n="sky.telescopeTitle">${i18n.t('sky.telescopeTitle')}</h2>
          <p class="text-secondary" data-i18n="sky.telescopeText">${i18n.t('sky.telescopeText')}</p>
        </div>

        <div class="sky-info-grid">
          <div class="sky-card sky-card--compact">
            <h3 data-i18n="sky.sunTitle">${i18n.t('sky.sunTitle')}</h3>
            <p class="text-secondary" data-i18n="sky.sunText">${i18n.t('sky.sunText')}</p>
          </div>
          <div class="sky-card sky-card--compact">
            <h3 data-i18n="sky.moonTitle">${i18n.t('sky.moonTitle')}</h3>
            <p class="text-secondary" data-i18n="sky.moonText">${i18n.t('sky.moonText')}</p>
          </div>
          <div class="sky-card sky-card--compact">
            <h3 data-i18n="sky.planetsTitle">${i18n.t('sky.planetsTitle')}</h3>
            <p class="text-secondary" data-i18n="sky.planetsText">${i18n.t('sky.planetsText')}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
