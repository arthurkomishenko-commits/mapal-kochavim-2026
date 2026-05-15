/**
 * Gallery page — photos + videos with lightbox viewer
 */

import { i18n } from '../core/i18n.js';

const GOOGLE_PHOTOS_URL = '#';

// ═══════════════════════════════════════════════════
// LIGHTBOX
// ═══════════════════════════════════════════════════

let lightboxEl = null;
let lightboxImg = null;
let lightboxCounter = null;
let allImages = [];
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  if (!lightboxEl) createLightbox();
  lightboxImg.src = allImages[currentIndex];
  lightboxCounter.textContent = `${currentIndex + 1} / ${allImages.length}`;
  document.body.appendChild(lightboxEl);
  document.documentElement.style.overflow = 'hidden';
  requestAnimationFrame(() => lightboxEl.classList.add('lightbox--visible'));
}

function closeLightbox() {
  if (!lightboxEl) return;
  document.documentElement.style.overflow = '';
  lightboxEl.classList.remove('lightbox--visible');
  setTimeout(() => {
    if (lightboxEl.parentElement) lightboxEl.remove();
  }, 300);
}

function navigate(dir) {
  currentIndex = (currentIndex + dir + allImages.length) % allImages.length;
  lightboxImg.src = allImages[currentIndex];
  lightboxCounter.textContent = `${currentIndex + 1} / ${allImages.length}`;
}

function createLightbox() {
  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox__close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', closeLightbox);
  lightboxEl.appendChild(closeBtn);

  // Prev
  const prevBtn = document.createElement('button');
  prevBtn.className = 'lightbox__nav lightbox__nav--prev';
  prevBtn.innerHTML = '&#8249;';
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  lightboxEl.appendChild(prevBtn);

  // Image
  lightboxImg = document.createElement('img');
  lightboxImg.className = 'lightbox__img';
  lightboxEl.appendChild(lightboxImg);

  // Next
  const nextBtn = document.createElement('button');
  nextBtn.className = 'lightbox__nav lightbox__nav--next';
  nextBtn.innerHTML = '&#8250;';
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });
  lightboxEl.appendChild(nextBtn);

  // Counter
  lightboxCounter = document.createElement('div');
  lightboxCounter.className = 'lightbox__counter';
  lightboxEl.appendChild(lightboxCounter);

  // Click backdrop to close
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) closeLightbox();
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!lightboxEl || !lightboxEl.parentElement) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Swipe support
  let startX = 0;
  lightboxEl.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });
  lightboxEl.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) {
      navigate(dx > 0 ? -1 : 1);
    }
  }, { passive: true });
}

// ═══════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════

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

        <div class="video-featured">
          <video controls preload="metadata" playsinline poster="images/milkyway-campfire.jpg">
            <source src="videos/campfire-real.mp4" type="video/mp4">
          </video>
        </div>

        <div class="video-grid">
          <div class="video-card">
            <video controls preload="metadata" playsinline>
              <source src="videos/drone-camp-close.mp4" type="video/mp4">
            </video>
          </div>
          <div class="video-card">
            <video controls preload="metadata" playsinline>
              <source src="videos/drone-camp-wide.mp4" type="video/mp4">
            </video>
          </div>
          <div class="video-card">
            <video controls preload="metadata" playsinline>
              <source src="videos/camp-daytime.mp4" type="video/mp4">
            </video>
          </div>
          <div class="video-card">
            <video controls preload="metadata" playsinline>
              <source src="videos/camp-night-arrival.mp4" type="video/mp4">
            </video>
          </div>
          <div class="video-card">
            <video controls preload="metadata" playsinline>
              <source src="videos/cooking-pilaf.mp4" type="video/mp4">
            </video>
          </div>
          <div class="video-card">
            <video controls preload="metadata" playsinline>
              <source src="videos/telescope-tour.mp4" type="video/mp4">
            </video>
          </div>
        </div>

        <div class="gallery__preview" id="gallery-photos">
          <div class="gallery__preview-item"><img src="images/moon-telescope.jpg" alt="Moon through telescope" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/milkyway-purple.jpg" alt="Milky Way" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/camp-sunset-wide.jpg" alt="Camp at sunset" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/grilling-night.jpg" alt="Night BBQ" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/person-car-night.jpg" alt="Night vibes" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/rocks-sunset.jpg" alt="Desert sunset" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/telescope-real.jpg" alt="Skywatcher telescope" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/bbq-grill.jpg" alt="BBQ grill" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/pilaf-pot.jpg" alt="Pilaf" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/stars-shelter.jpg" alt="Stars over shelter" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/chopping-wood.jpg" alt="Chopping wood" loading="lazy"></div>
          <div class="gallery__preview-item"><img src="images/camp-day-tents.jpg" alt="Camp daytime" loading="lazy"></div>
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

  // Init lightbox on photo clicks
  const photoGrid = document.getElementById('gallery-photos');
  if (photoGrid) {
    const imgs = photoGrid.querySelectorAll('img');
    allImages = Array.from(imgs).map(img => img.src);
    imgs.forEach((img, i) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openLightbox(i));
    });
  }
}
