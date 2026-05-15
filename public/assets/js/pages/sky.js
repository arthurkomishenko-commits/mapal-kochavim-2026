/**
 * Sky page — astronomy, Perseids info, telescope, real photos
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
          <img src="images/moon-telescope.jpg" alt="Moon through Robert's Skywatcher telescope" loading="eager" class="sky-photo__img">
        </div>

        <div class="sky-card sky-card--featured">
          <h2 data-i18n="sky.perseidsTitle">${i18n.t('sky.perseidsTitle')}</h2>
          <p class="text-secondary" data-i18n="sky.perseidsText">${i18n.t('sky.perseidsText')}</p>
          <div class="sky-card__stat">
            <span class="sky-card__stat-number tabular-nums">100+</span>
            <span class="sky-card__stat-label" data-i18n="sky.meteorsPerHour">${i18n.t('sky.meteorsPerHour')}</span>
          </div>
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

        <div class="sky-card">
          <h2 data-i18n="sky.telescopeTitle">${i18n.t('sky.telescopeTitle')}</h2>
          <p class="text-secondary" data-i18n="sky.telescopeText">${i18n.t('sky.telescopeText')}</p>
        </div>

        <div class="sky-photo">
          <img src="images/telescope-real.jpg" alt="Robert's Skywatcher telescope at camp" loading="lazy" class="sky-photo__img">
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

        <div class="sky-card" style="margin-block-start:var(--space-6);">
          <h2 data-i18n="sky.tonightTitle">${i18n.t('sky.tonightTitle')}</h2>
          <div class="sky-tonight">
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightSunset">${i18n.t('sky.tonightSunset')}</span>
              <span class="sky-tonight__value">19:22</span>
            </div>
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightSunrise">${i18n.t('sky.tonightSunrise')}</span>
              <span class="sky-tonight__value">05:38</span>
            </div>
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightMoonrise">${i18n.t('sky.tonightMoonrise')}</span>
              <span class="sky-tonight__value">00:30</span>
            </div>
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightPeak">${i18n.t('sky.tonightPeak')}</span>
              <span class="sky-tonight__value">01:00–04:00</span>
            </div>
            <div class="sky-tonight__item">
              <span class="sky-tonight__label" data-i18n="sky.tonightBest">${i18n.t('sky.tonightBest')}</span>
              <span class="sky-tonight__value">02:00–03:30</span>
            </div>
          </div>
        </div>

        <div class="sky-card sky-card--featured" style="margin-block-start:var(--space-6);">
          <h2 data-i18n="sky.tipsTitle">${i18n.t('sky.tipsTitle')}</h2>
          <ul class="sky-tips">
            <li data-i18n="sky.tip1">${i18n.t('sky.tip1')}</li>
            <li data-i18n="sky.tip2">${i18n.t('sky.tip2')}</li>
            <li data-i18n="sky.tip3">${i18n.t('sky.tip3')}</li>
          </ul>
        </div>
      </div>
    </section>
  `;
}
