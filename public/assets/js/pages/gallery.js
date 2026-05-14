/**
 * Gallery page — link to shared Google Photos album
 */

import { i18n } from '../core/i18n.js';

// TODO: Replace with actual Google Photos album link
const GOOGLE_PHOTOS_URL = '#';

export function renderGallery(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="gallery-title">
      <div class="page-section__inner gallery">
        <h1 id="gallery-title" class="page-section__title" data-i18n="gallery.title">
          ${i18n.t('gallery.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="gallery.subtitle">
          ${i18n.t('gallery.subtitle')}
        </p>

        <div class="gallery__preview">
          <div class="gallery__preview-item">
            <img src="images/person-milkyway.jpg" alt="" loading="lazy">
          </div>
          <div class="gallery__preview-item">
            <img src="images/milkyway-campfire.jpg" alt="" loading="lazy">
          </div>
          <div class="gallery__preview-item">
            <img src="images/night-camp.jpg" alt="" loading="lazy">
          </div>
          <div class="gallery__preview-item">
            <img src="images/sunset-negev.webp" alt="" loading="lazy">
          </div>
          <div class="gallery__preview-item">
            <img src="images/campsite-day.jpg" alt="" loading="lazy">
          </div>
          <div class="gallery__preview-item">
            <img src="images/negev-panorama.jpg" alt="" loading="lazy">
          </div>
        </div>

        <div class="gallery__cta-card">
          <div class="gallery__icon" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <p class="gallery__text" data-i18n="gallery.text">${i18n.t('gallery.text')}</p>
          <a href="${GOOGLE_PHOTOS_URL}" target="_blank" rel="noopener" class="btn btn--primary gallery__link">
            <span data-i18n="gallery.openAlbum">${i18n.t('gallery.openAlbum')}</span>
          </a>
          <p class="gallery__hint text-tertiary" data-i18n="gallery.hint">${i18n.t('gallery.hint')}</p>
        </div>
      </div>
    </section>
  `;
}
