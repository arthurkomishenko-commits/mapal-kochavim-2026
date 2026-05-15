/**
 * Pack page — what to bring checklist
 */

import { i18n } from '../core/i18n.js';

export function renderPack(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="pack-title">
      <div class="page-section__inner">
        <h1 id="pack-title" class="page-section__title" data-i18n="pack.title">
          ${i18n.t('pack.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="pack.subtitle">
          ${i18n.t('pack.subtitle')}
        </p>

        <div class="checklist">
          <div class="checklist__group">
            <h2 class="checklist__group-title" data-i18n="pack.essentialsTitle">${i18n.t('pack.essentialsTitle')}</h2>
            <ul class="checklist__items" data-group="essentials">
              ${renderItems('pack.essentials')}
            </ul>
          </div>

          <div class="checklist__group">
            <h2 class="checklist__group-title" data-i18n="pack.campTitle">${i18n.t('pack.campTitle')}</h2>
            <ul class="checklist__items" data-group="camp">
              ${renderItems('pack.camp')}
            </ul>
          </div>

          <div class="checklist__group">
            <h2 class="checklist__group-title" data-i18n="pack.foodTitle">${i18n.t('pack.foodTitle')}</h2>
            <ul class="checklist__items" data-group="food">
              ${renderItems('pack.food')}
            </ul>
          </div>

        </div>
      </div>
    </section>
  `;

  // Interactive checkboxes — persist in localStorage
  container.querySelectorAll('.checklist__check').forEach(cb => {
    const key = cb.dataset.checkKey;
    cb.checked = localStorage.getItem(`pack-${key}`) === '1';

    cb.addEventListener('change', () => {
      localStorage.setItem(`pack-${key}`, cb.checked ? '1' : '0');
    });
  });
}

function renderItems(i18nPrefix) {
  const items = i18n.t(i18nPrefix);
  if (!Array.isArray(items)) return '';

  return items.map((item, idx) => `
    <li class="checklist__item">
      <label class="checklist__label">
        <input type="checkbox" class="checklist__check" data-check-key="${i18nPrefix}_${idx}">
        <span class="checklist__checkmark" aria-hidden="true"></span>
        <span>${item}</span>
      </label>
    </li>
  `).join('');
}
