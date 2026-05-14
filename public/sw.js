/**
 * Service Worker — offline support
 *
 * Strategy:
 * - Static assets: cache-first (CSS, JS, fonts, images)
 * - HTML: network-first with cache fallback
 * - API/Firestore: network-only (Firestore handles its own offline)
 */

const CACHE_NAME = 'mapal-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/tokens.css',
  '/assets/css/reset.css',
  '/assets/css/typography.css',
  '/assets/css/components/nav.css',
  '/assets/css/components/welcome.css',
  '/assets/css/components/page-section.css',
  '/assets/css/components/footer.css',
  '/assets/css/components/placeholder-img.css',
  '/assets/css/pages/home.css',
  '/assets/css/pages/place.css',
  '/assets/css/pages/program.css',
  '/assets/css/pages/pack.css',
  '/assets/css/pages/sky.css',
  '/assets/css/pages/safety.css',
  '/assets/css/pages/contacts.css',
  '/assets/css/pages/gallery.css',
  '/assets/css/pages/people.css',
  '/assets/js/main.js',
  '/assets/js/core/i18n.js',
  '/assets/js/core/router.js',
  '/assets/js/core/auth.js',
  '/assets/js/core/firebase-config.js',
  '/assets/js/components/countdown.js',
  '/assets/js/components/nav.js',
  '/assets/js/components/shooting-star.js',
  '/assets/js/components/star-field.js',
  '/assets/js/components/welcome-overlay.js',
  '/assets/js/pages/home.js',
  '/assets/js/pages/place.js',
  '/assets/js/pages/program.js',
  '/assets/js/pages/pack.js',
  '/assets/js/pages/sky.js',
  '/assets/js/pages/safety.js',
  '/assets/js/pages/contacts.js',
  '/assets/js/pages/gallery.js',
  '/assets/js/pages/rsvp.js',
  '/assets/js/pages/people.js',
  '/assets/js/pages/rides.js',
  '/assets/js/pages/me.js',
  '/assets/js/pages/not-found.js',
  '/assets/locales/ru.json',
  '/assets/locales/he.json',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache-first for static, network-first for HTML
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Google Fonts — cache first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // HTML — network first
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // JS/CSS — network first (always get fresh code), fallback to cache
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else (images, etc.) — cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request);
    })
  );
});
