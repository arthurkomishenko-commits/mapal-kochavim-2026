/**
 * Contacts page — organizer call buttons
 */

import { i18n } from '../core/i18n.js';

const ORGANIZERS = [
  { nameKey: 'contacts.arthur', role: 'contacts.arthurRole' },
  { nameKey: 'contacts.robert', role: 'contacts.robertRole' },
  { nameKey: 'contacts.vladimir', role: 'contacts.vladimirRole' },
  { nameKey: 'contacts.andrey', role: 'contacts.andreyRole' },
];

export function renderContacts(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="contacts-title">
      <div class="page-section__inner">
        <h1 id="contacts-title" class="page-section__title" data-i18n="contacts.title">
          ${i18n.t('contacts.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="contacts.subtitle">
          ${i18n.t('contacts.subtitle')}
        </p>

        <div class="contacts-grid">
          ${ORGANIZERS.map(org => `
            <div class="contact-card">
              <h3 class="contact-card__name" data-i18n="${org.nameKey}">${i18n.t(org.nameKey)}</h3>
              <p class="contact-card__role text-secondary" data-i18n="${org.role}">${i18n.t(org.role)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
