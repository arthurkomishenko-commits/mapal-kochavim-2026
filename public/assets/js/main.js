/**
 * מפל כוכבים 2026 — Main entry point
 */

import { i18n } from './core/i18n.js';
import { router } from './core/router.js';
import { auth } from './core/auth.js';
import { initNav } from './components/nav.js';
import { initWelcomeOverlay } from './components/welcome-overlay.js';
import { initStarsBg, setSkySensity, SKY_LEVELS } from './components/stars-bg.js';

import { renderHome } from './pages/home.js';
import { renderPlace } from './pages/place.js';
import { renderProgram } from './pages/program.js';
import { renderPack } from './pages/pack.js';
import { renderSky } from './pages/sky.js';
import { renderSafety } from './pages/safety.js';
import { renderContacts } from './pages/contacts.js';
import { renderGallery } from './pages/gallery.js';
import { renderRsvp } from './pages/rsvp.js';
import { renderPeople } from './pages/people.js';
import { renderRides } from './pages/rides.js';
import { renderMe } from './pages/me.js';
import { renderNotFound } from './pages/not-found.js';

async function boot() {
  await i18n.init();
  auth.initAuth();
  initNav();
  initWelcomeOverlay();

  // Register all routes
  router.register('home', renderHome);
  router.register('place', renderPlace);
  router.register('program', renderProgram);
  router.register('pack', renderPack);
  router.register('rsvp', renderRsvp);
  router.register('people', renderPeople);
  router.register('rides', renderRides);
  router.register('sky', renderSky);
  router.register('safety', renderSafety);
  router.register('contacts', renderContacts);
  router.register('gallery', renderGallery);
  router.register('me', renderMe);
  router.register('404', renderNotFound);

  // Re-render on language switch
  window.addEventListener('langchange', () => router.refresh());

  // Bottom bar — hide after login
  function updateBottomBar() {
    const bar = document.getElementById('bottom-bar');
    if (!bar) return;
    const user = JSON.parse(localStorage.getItem('mapal-user') || 'null');
    bar.classList.toggle('bottom-bar--hidden', !!user);
  }
  updateBottomBar();
  window.addEventListener('authchange', updateBottomBar);

  // Global star background
  initStarsBg();
  setSkySensity('rich'); // default for home
  window.addEventListener('routechange', (e) => {
    setSkySensity(SKY_LEVELS[e.detail.route] || 'normal');
  });


  // Start
  router.init(document.getElementById('page-container'));
}

boot().catch(err => console.error('Boot failed:', err));
