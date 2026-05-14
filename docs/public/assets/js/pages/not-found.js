/**
 * 404 page
 */

import { i18n } from '../core/i18n.js';

export function renderNotFound(container) {
  container.innerHTML = `
    <section class="page-section not-found" aria-labelledby="notfound-title">
      <div class="page-section__inner not-found__inner">
        <span class="not-found__code" aria-hidden="true">404</span>
        <h1 id="notfound-title" class="not-found__title" data-i18n="common.notFound">
          ${i18n.t('common.notFound')}
        </h1>
        <a href="#home" class="btn btn--outline not-found__btn">
          <span data-i18n="nav.home">${i18n.t('nav.home')}</span>
        </a>
      </div>
    </section>
  `;
}
