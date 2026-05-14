/**
 * Rides page — carpool (requires auth for requests)
 * TODO: Full carpool flow in Sprint 5
 */

import { i18n } from '../core/i18n.js';

export function renderRides(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="rides-title">
      <div class="page-section__inner">
        <h1 id="rides-title" class="page-section__title" data-i18n="rides.title">
          ${i18n.t('rides.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="rides.subtitle">
          ${i18n.t('rides.subtitle')}
        </p>

        <div class="empty-state">
          <div class="empty-state__icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 17h14M5 17a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2M5 17l-1 3M19 17l1 3"/>
              <circle cx="7.5" cy="10.5" r="1.5"/>
              <circle cx="16.5" cy="10.5" r="1.5"/>
            </svg>
          </div>
          <p data-i18n="rides.emptyText">${i18n.t('rides.emptyText')}</p>
        </div>
      </div>
    </section>
  `;
}
