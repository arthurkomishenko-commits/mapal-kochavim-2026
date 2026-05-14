/**
 * מפל כוכבים 2026 — Main entry point
 */

import { i18n } from './core/i18n.js';
import { router } from './core/router.js';
import { initNav } from './components/nav.js';
import { initWelcomeOverlay } from './components/welcome-overlay.js';

import { renderHome } from './pages/home.js';
import { renderPlace } from './pages/place.js';
import { renderProgram } from './pages/program.js';
import { renderPack } from './pages/pack.js';
import { renderSky } from './pages/sky.js';
import { renderSafety } from './pages/safety.js';
import { renderContacts } from './pages/contacts.js';
import { renderGallery } from './pages/gallery.js';
import { renderNotFound } from './pages/not-found.js';

async function boot() {
  await i18n.init();
  initNav();
  initWelcomeOverlay();

  // Register all routes
  router.register('home', renderHome);
  router.register('place', renderPlace);
  router.register('program', renderProgram);
  router.register('pack', renderPack);
  router.register('sky', renderSky);
  router.register('safety', renderSafety);
  router.register('contacts', renderContacts);
  router.register('gallery', renderGallery);
  router.register('404', renderNotFound);

  // Re-render on language switch
  window.addEventListener('langchange', () => router.refresh());

  // Start
  router.init(document.getElementById('page-container'));
}

boot().catch(err => console.error('Boot failed:', err));
