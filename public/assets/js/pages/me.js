/**
 * Me page — personal dashboard (requires auth)
 * TODO: Full implementation in Sprint 3
 */

import { i18n } from '../core/i18n.js';

export function renderMe(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="me-title">
      <div class="page-section__inner">
        <h1 id="me-title" class="page-section__title" data-i18n="me.title">
          ${i18n.t('me.title')}
        </h1>

        <div class="auth-gate">
          <div class="auth-gate__icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <p class="auth-gate__text" data-i18n="me.loginRequired">
            ${i18n.t('me.loginRequired')}
          </p>
          <button class="btn btn--primary auth-gate__btn" type="button" data-i18n="common.login">
            ${i18n.t('common.login')}
          </button>
        </div>
      </div>
    </section>
  `;
}
