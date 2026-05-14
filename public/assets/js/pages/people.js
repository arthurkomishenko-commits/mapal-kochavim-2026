/**
 * People page — who's coming + aggregates
 * TODO: Live data in Sprint 4
 */

import { i18n } from '../core/i18n.js';

export function renderPeople(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="people-title">
      <div class="page-section__inner">
        <h1 id="people-title" class="page-section__title" data-i18n="people.title">
          ${i18n.t('people.title')}
        </h1>

        <div class="people-stats">
          <div class="people-stat">
            <span class="people-stat__number tabular-nums">0</span>
            <span class="people-stat__label" data-i18n="people.participants">${i18n.t('people.participants')}</span>
          </div>
          <div class="people-stat">
            <span class="people-stat__number tabular-nums">0</span>
            <span class="people-stat__label" data-i18n="people.cars">${i18n.t('people.cars')}</span>
          </div>
          <div class="people-stat">
            <span class="people-stat__number tabular-nums">0</span>
            <span class="people-stat__label" data-i18n="people.tents">${i18n.t('people.tents')}</span>
          </div>
        </div>

        <div class="empty-state">
          <p data-i18n="common.empty">${i18n.t('common.empty')}</p>
        </div>
      </div>
    </section>
  `;
}
