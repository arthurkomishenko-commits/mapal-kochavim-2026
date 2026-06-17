/**
 * Gallery page — photos + videos with lightbox viewer.
 *
 * Pre-event: static archive of past trips (videos + photo previews).
 * Past-event: live user-uploaded gallery (Firestore + Storage), with
 * infinite scroll and lightbox that swipes through every photo.
 */

import { i18n } from '../core/i18n.js';
import { siteMode } from '../core/site-mode.js';
import { auth } from '../core/auth.js';

const GOOGLE_PHOTOS_URL = '#';

// ═══════════════════════════════════════════════════
// LIGHTBOX
// ═══════════════════════════════════════════════════

let lightboxEl = null;
let lightboxImg = null;
let lightboxCounter = null;
let allImages = [];
let currentIndex = 0;
let keydownHandler = null;
let lightboxRemoveTimer = null;            // tracked so rapid reopen can cancel it

function openLightbox(index) {
  if (lightboxRemoveTimer) { clearTimeout(lightboxRemoveTimer); lightboxRemoveTimer = null; }
  currentIndex = index;
  if (!lightboxEl) createLightbox();
  lightboxImg.src = allImages[currentIndex];
  lightboxCounter.textContent = `${currentIndex + 1} / ${allImages.length}`;
  document.body.appendChild(lightboxEl);
  document.documentElement.style.overflow = 'hidden';
  requestAnimationFrame(() => lightboxEl.classList.add('lightbox--visible'));
  // De-duplicate the routechange handler so rapid re-opens don't stack listeners.
  window.removeEventListener('routechange', closeLightbox);
  window.addEventListener('routechange', closeLightbox);
}

function closeLightbox() {
  if (!lightboxEl) return;
  document.documentElement.style.overflow = '';
  lightboxEl.classList.remove('lightbox--visible');
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
  }
  window.removeEventListener('routechange', closeLightbox);
  if (lightboxRemoveTimer) clearTimeout(lightboxRemoveTimer);
  lightboxRemoveTimer = setTimeout(() => {
    // Only finalize removal if the lightbox is still hidden — a rapid reopen
    // within 300ms cancels this timer in openLightbox.
    if (lightboxEl && !lightboxEl.classList.contains('lightbox--visible')) {
      if (lightboxEl.parentElement) lightboxEl.remove();
      lightboxEl = null;
    }
    lightboxRemoveTimer = null;
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

  // Keyboard (stored ref for cleanup)
  keydownHandler = (e) => {
    if (!lightboxEl || !lightboxEl.parentElement) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  };
  document.addEventListener('keydown', keydownHandler);

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
  if (siteMode.is('past')) return renderGalleryPast(container);

  container.innerHTML = `
    <section class="page-section" aria-labelledby="gallery-title">
      <div class="page-section__inner gallery">
        <h1 id="gallery-title" class="page-section__title" data-i18n="gallery.title">
          ${i18n.t('gallery.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="gallery.subtitle">
          ${i18n.t('gallery.subtitle')}
        </p>
        <p class="page-section__subtitle gallery__notice" data-i18n="gallery.afterEvent">
          ${i18n.t('gallery.afterEvent')}
        </p>

        <div class="video-grid">
          <div class="video-card">
            <video controls preload="metadata" playsinline poster="images/posters/drone-camp-close.jpg">
              <source src="videos/drone-camp-close.mp4" type="video/mp4">
            </video>
          </div>
          <div class="video-card">
            <video controls preload="metadata" playsinline poster="images/posters/drone-camp-wide.jpg">
              <source src="videos/drone-camp-wide.mp4" type="video/mp4">
            </video>
          </div>
          <div class="video-card">
            <video controls preload="metadata" playsinline poster="images/posters/camp-daytime.jpg">
              <source src="videos/camp-daytime.mp4" type="video/mp4">
            </video>
          </div>
          <div class="video-card">
            <video controls preload="metadata" playsinline poster="images/posters/camp-night-arrival.jpg">
              <source src="videos/camp-night-arrival.mp4" type="video/mp4">
            </video>
          </div>
          <div class="video-card">
            <video controls preload="metadata" playsinline poster="images/posters/cooking-pilaf.jpg">
              <source src="videos/cooking-pilaf.mp4" type="video/mp4">
            </video>
          </div>
          <div class="video-card">
            <video controls preload="metadata" playsinline poster="images/posters/telescope-tour.jpg">
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

// ═══════════════════════════════════════════════════
// PAST MODE — user-uploaded gallery (Step 2 + 3 + 4)
// ═══════════════════════════════════════════════════

function renderGalleryPast(container) {
  const user = auth.getUser?.() || null;

  container.innerHTML = `
    <section class="page-section" aria-labelledby="gallery-title-past">
      <div class="page-section__inner">
        <h1 id="gallery-title-past" class="page-section__title" data-i18n="past.gallery.title">
          ${i18n.t('past.gallery.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="past.gallery.subtitle">
          ${i18n.t('past.gallery.subtitle')}
        </p>

        ${user ? `
          <div class="gp-upload">
            <button type="button" class="gp-upload__btn" id="gp-pick">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span data-i18n="past.gallery.uploadBtn">${i18n.t('past.gallery.uploadBtn')}</span>
            </button>
            <input type="file" id="gp-input" accept="image/*,video/*" multiple hidden>
            <p class="gp-upload__hint" data-i18n="past.gallery.uploadHint">${i18n.t('past.gallery.uploadHint')}</p>
            <div class="gp-queue" id="gp-queue"></div>
          </div>
        ` : `
          <div class="gp-loginCta">
            <p data-i18n="past.gallery.loginText">${i18n.t('past.gallery.loginText')}</p>
            <a class="hero__cta" href="#rsvp" data-i18n="past.gallery.loginBtn">${i18n.t('past.gallery.loginBtn')}</a>
          </div>
        `}

        <div class="gp-counter" id="gp-counter" hidden></div>

        <div class="gp-grid" id="gp-grid">
          <p class="gp-grid__empty" id="gp-empty" data-i18n="past.gallery.empty">${i18n.t('past.gallery.empty')}</p>
        </div>

        <div class="gp-loadMore" id="gp-loadMore" hidden>
          <div class="gp-loadMore__spinner" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  `;

  if (user) initUploadUI(container, user);
  initGridView(container);                  // Step 3 — view + infinite scroll
}

// ─── Upload UI ────────────────────────────────────────────────────────

function initUploadUI(container, user) {
  const pickBtn = container.querySelector('#gp-pick');
  const input   = container.querySelector('#gp-input');
  const queue   = container.querySelector('#gp-queue');

  pickBtn.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const files = [...input.files];
    input.value = '';                       // reset so same file can be picked again
    queueWithThrottle(files, user, queue, container, 3);
  });
}

// Concurrency-limited upload pool — phones OOM with 20+ parallel canvas encodes.
function queueWithThrottle(files, user, queueEl, container, maxConcurrent = 3) {
  let i = 0;
  let active = 0;
  return new Promise(resolve => {
    const next = () => {
      while (active < maxConcurrent && i < files.length) {
        const f = files[i++];
        active++;
        enqueueUpload(f, user, queueEl, container).finally(() => {
          active--;
          if (i >= files.length && active === 0) resolve();
          else next();
        });
      }
    };
    next();
  });
}

async function enqueueUpload(file, user, queueEl, container) {
  const row = document.createElement('div');
  row.className = 'gp-row';
  row.dataset.status = 'pending';
  const thumbUrl = URL.createObjectURL(file);
  const isVideo = file.type.startsWith('video/');
  row.innerHTML = `
    ${isVideo
      ? `<div class="gp-row__thumb gp-row__thumb--video" aria-hidden="true">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 4 20 12 6 20 6 4"/></svg>
         </div>`
      : `<img class="gp-row__thumb" src="${thumbUrl}" alt="">`}
    <div class="gp-row__body">
      <div class="gp-row__name">${escapeText(file.name)}</div>
      <div class="gp-row__progress"><div class="gp-row__bar" style="width:0"></div></div>
    </div>
    <span class="gp-row__status">0%</span>
  `;
  queueEl.appendChild(row);
  const bar    = row.querySelector('.gp-row__bar');
  const status = row.querySelector('.gp-row__status');

  // HEIC isn't decodable in many browsers — fail early with a clear message.
  if (/\.(heic|heif)$/i.test(file.name) || /heic|heif/.test(file.type)) {
    row.dataset.status = 'error';
    status.textContent = i18n.t('past.gallery.heicError') || 'HEIC →JPG';
    row.classList.add('gp-row--error');
    URL.revokeObjectURL(thumbUrl);                       // would leak otherwise
    return;
  }

  try {
    // 1. Process (resize + strip EXIF for images; passthrough for videos).
    const { processMedia } = await import('../core/image-processing.js');
    row.dataset.status = 'processing';
    status.textContent = i18n.t('past.gallery.processing') || '…';
    const processed = await processMedia(file);

    // 2. Upload to Firebase Storage + create Firestore doc with capturedAt.
    const { db } = await import('../core/db.js');
    row.dataset.status = 'uploading';
    const record = await db.addPhoto({
      blob:          processed.blob,
      capturedAt:    processed.capturedAt,
      kind:          processed.kind,
      width:         processed.width,
      height:        processed.height,
      uploaderPhone: user.phone,
      uploaderName:  user.name || '',
      onProgress: p => {
        const pct = Math.round(p * 100);
        bar.style.width = pct + '%';
        status.textContent = pct + '%';
      },
    });

    row.dataset.status = 'done';
    bar.style.width = '100%';
    status.textContent = '✓';
    row.classList.add('gp-row--done');
    setTimeout(() => {
      row.remove();
      URL.revokeObjectURL(thumbUrl);          // revoke AFTER thumb leaves DOM
    }, 1800);

    // Insert into grid immediately for instant feedback.
    insertRecordIntoGrid(container, record);
  } catch (err) {
    console.error('upload failed', err);
    row.dataset.status = 'error';
    status.textContent = '!';
    status.title = err?.message || 'Upload failed';
    row.title = err?.message || 'Upload failed';
    row.classList.add('gp-row--error');
    URL.revokeObjectURL(thumbUrl);            // ok to revoke now — error row stays
  }
}

// ─── Grid view + infinite scroll ────────────────────────────────────

let gridState = null;       // { items, cursor, done, loading, observer }

function initGridView(container) {
  // Hard reset — module-level state must not leak between mounts.
  if (gridState?.observer) { try { gridState.observer.disconnect(); } catch {} }
  gridState = { items: [], cursor: null, done: false, loading: false, observer: null, seen: new Set() };
  loadNextPage(container);
  setupInfiniteScroll(container);
}

async function loadNextPage(container) {
  if (gridState.loading || gridState.done) return;
  gridState.loading = true;
  const more = container.querySelector('#gp-loadMore');
  if (more) more.hidden = false;
  try {
    const { db } = await import('../core/db.js');
    const page = await db.getPhotos({ limit: 10, cursor: gridState.cursor });
    page.items.forEach(it => gridState.items.push(it));
    gridState.cursor = page.cursor;
    gridState.done = page.done;
    renderGridDelta(container, page.items);
    updateCounter(container);
  } catch (err) {
    console.error('gallery load failed', err);
  } finally {
    gridState.loading = false;
    if (more) more.hidden = !!gridState.done;
  }
}

function renderGridDelta(container, items) {
  const grid = container.querySelector('#gp-grid');
  const empty = container.querySelector('#gp-empty');
  const fresh = items.filter(it => it && it.id && !gridState.seen.has(it.id));
  if (fresh.length > 0 && empty) empty.remove();
  fresh.forEach(it => {
    gridState.seen.add(it.id);
    grid.appendChild(buildTile(it));
  });
}

function insertRecordIntoGrid(container, record) {
  if (!record || !record.id || gridState.seen.has(record.id)) return;
  const grid = container.querySelector('#gp-grid');
  const empty = container.querySelector('#gp-empty');
  if (empty) empty.remove();
  gridState.seen.add(record.id);

  // Insert at the correct chronological position so the optimistic preview
  // matches what pagination will eventually fetch — otherwise the new photo
  // sticks to the end forever even when its capturedAt belongs elsewhere.
  const idx = gridState.items.findIndex(x => x.capturedAt > record.capturedAt);
  if (idx === -1) {
    gridState.items.push(record);
    grid.appendChild(buildTile(record));
  } else {
    gridState.items.splice(idx, 0, record);
    const refNode = grid.querySelector(`.gp-tile[data-id="${gridState.items[idx + 1]?.id}"]`);
    grid.insertBefore(buildTile(record), refNode || null);
  }
  updateCounter(container);
}

function buildTile(rec) {
  // Use <button> for keyboard + screen-reader access.
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'gp-tile';
  tile.dataset.id = rec.id;
  tile.setAttribute('aria-label',
    rec.kind === 'video' ? (i18n.t('past.gallery.openVideo') || 'Open video')
                         : (i18n.t('past.gallery.openPhoto') || 'Open photo'));
  if (rec.kind === 'video') {
    tile.innerHTML = `
      <video preload="none" muted playsinline></video>
      <span class="gp-tile__play" aria-hidden="true">▶</span>
    `;
    const v = tile.querySelector('video');
    v.src = rec.url;
  } else {
    tile.innerHTML = `<img loading="lazy" alt="">`;
    tile.querySelector('img').src = rec.url;
  }
  const me = auth.getUser?.()?.phone;
  const isOwn = !!(me && rec.uploaderPhone === me);
  const asAdmin = !isOwn && auth.isAdmin?.();
  if (isOwn || asAdmin) {
    const del = document.createElement('span');                  // span inside button to avoid nested-button DOM
    del.className = 'gp-tile__del' + (asAdmin ? ' gp-tile__del--admin' : '');
    del.setAttribute('role', 'button');
    del.setAttribute('tabindex', '0');
    del.setAttribute('aria-label', i18n.t(asAdmin ? 'past.gallery.deleteAsAdmin' : 'past.gallery.deleteMine') || 'Delete');
    del.textContent = '×';
    const doDelete = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const confirmKey = asAdmin ? 'past.gallery.deleteAdminConfirm' : 'past.gallery.deleteConfirm';
      const fallback = asAdmin
        ? `Удалить фото от «${rec.uploaderName || rec.uploaderPhone}»?`
        : 'Удалить это фото?';
      const confirmMsg = (() => {
        const v = i18n.t(confirmKey);
        if (!v || v === confirmKey) return fallback;
        return asAdmin
          ? v.replace('{name}', rec.uploaderName || rec.uploaderPhone || '')
          : v;
      })();
      if (!confirm(confirmMsg)) return;
      try {
        const { db } = await import('../core/db.js');
        await db.deletePhoto(rec.id);
        tile.remove();
        gridState.items = gridState.items.filter(x => x.id !== rec.id);
        gridState.seen.delete(rec.id);
        const root = document.querySelector('.page-section__inner');
        if (root) {
          updateCounter(root);
          maybeRestoreEmptyState(root);                     // grid empty? restore placeholder
        }
        // If the lightbox happens to be open on this photo, close it — the URL
        // is gone and stale navigation would 404.
        if (lightboxEl && lightboxEl.classList.contains('lightbox--visible')) closeLightbox();
      } catch (err) { console.error('delete failed', err); }
    };
    del.addEventListener('click', doDelete);
    del.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') doDelete(e);
    });
    tile.appendChild(del);
  }
  tile.addEventListener('click', () => openGalleryTile(rec));
  return tile;
}

// Restore the empty-state placeholder when the grid becomes empty (e.g. user
// deletes the only photo).
function maybeRestoreEmptyState(container) {
  const grid = container.querySelector('#gp-grid');
  if (!grid) return;
  if (grid.children.length === 0) {
    const p = document.createElement('p');
    p.className = 'gp-grid__empty';
    p.id = 'gp-empty';
    p.setAttribute('data-i18n', 'past.gallery.empty');
    p.textContent = i18n.t('past.gallery.empty');
    grid.appendChild(p);
  }
}

function updateCounter(container) {
  const el = container.querySelector('#gp-counter');
  if (!el) return;
  const n = gridState.items.length;
  if (n === 0) { el.hidden = true; return; }
  const authors = new Set(gridState.items.map(i => i.uploaderPhone)).size;
  el.hidden = false;
  el.textContent = (i18n.t('past.gallery.counter') || '{n} фото от {a} участников')
    .replace('{n}', n).replace('{a}', authors);
}

function setupInfiniteScroll(container) {
  const sentinel = container.querySelector('#gp-loadMore');
  if (!sentinel || !('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) loadNextPage(container);
  }, { rootMargin: '600px 0px' });
  obs.observe(sentinel);
  gridState.observer = obs;
  const cleanup = () => {
    try { obs.disconnect(); } catch {}
    window.removeEventListener('routechange', cleanup);
  };
  window.addEventListener('routechange', cleanup);
}

// ─── Lightbox (Step 4 — placeholder for now, reuses existing module) ──

function openGalleryTile(rec) {
  if (rec.kind === 'video') return openVideoModal(rec);
  const photos = gridState.items.filter(i => i.kind !== 'video');
  allImages = photos.map(i => i.url);
  const idx = photos.findIndex(i => i.id === rec.id);
  if (idx === -1) return;
  openLightbox(idx);
}

let videoModalEl = null;
function openVideoModal(rec) {
  if (videoModalEl) closeVideoModal();                      // clean prior state
  videoModalEl = document.createElement('div');
  videoModalEl.className = 'lightbox lightbox--visible';
  videoModalEl.innerHTML = `
    <button class="lightbox__close" aria-label="Close">×</button>
    <video class="lightbox__img" src="${rec.url}" controls autoplay playsinline></video>
  `;
  videoModalEl.querySelector('.lightbox__close').addEventListener('click', closeVideoModal);
  videoModalEl.addEventListener('click', (e) => { if (e.target === videoModalEl) closeVideoModal(); });
  document.addEventListener('keydown', videoEsc);
  // Auto-close on route navigation so the modal + keydown listener don't leak.
  window.removeEventListener('routechange', closeVideoModal);
  window.addEventListener('routechange', closeVideoModal);
  document.body.appendChild(videoModalEl);
  document.documentElement.style.overflow = 'hidden';
}
function closeVideoModal() {
  if (!videoModalEl) return;
  // Stop video playback before removing — avoids audio leak if browser keeps the element alive briefly.
  try { videoModalEl.querySelector('video')?.pause(); } catch {}
  videoModalEl.remove();
  videoModalEl = null;
  document.removeEventListener('keydown', videoEsc);
  window.removeEventListener('routechange', closeVideoModal);
  document.documentElement.style.overflow = '';
}
function videoEsc(e) { if (e.key === 'Escape') closeVideoModal(); }

function escapeText(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
