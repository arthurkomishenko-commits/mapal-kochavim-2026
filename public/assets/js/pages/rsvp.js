/**
 * RSVP page — registration form (requires auth)
 * TODO: Full form implementation in Sprint 3
 */

import { i18n } from '../core/i18n.js';

export function renderRsvp(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="rsvp-title">
      <div class="page-section__inner">
        <h1 id="rsvp-title" class="page-section__title" data-i18n="rsvp.title">
          ${i18n.t('rsvp.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="rsvp.subtitle">
          ${i18n.t('rsvp.subtitle')}
        </p>

        <div class="auth-gate">
          <div class="auth-gate__icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <p class="auth-gate__text" data-i18n="rsvp.loginRequired">
            ${i18n.t('rsvp.loginRequired')}
          </p>
          <button class="btn btn--primary auth-gate__btn" type="button" data-i18n="common.login">
            ${i18n.t('common.login')}
          </button>
        </div>
      </div>
    </section>
  `;
}
