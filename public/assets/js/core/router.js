/**
 * Router — lightweight hash-based SPA routing
 *
 * Usage:
 *   import { router } from './router.js';
 *   router.register('home', renderHome);
 *   router.register('place', renderPlace);
 *   router.init(); // starts listening to hashchange
 */

import { siteMode } from './site-mode.js';
import { i18n } from './i18n.js';
import { auth } from './auth.js';

const routes = new Map();
let currentRoute = null;
let containerEl = null;

const DEFAULT_ROUTE = 'home';

// Routes that don't make sense after the event. They redirect to gallery
// in past mode (still reachable directly via ?archive=1 for the curious).
const PAST_REDIRECT_TO_GALLERY = new Set([
  'calendar', 'pack', 'safety', 'rides',
]);

function getRouteFromHash() {
  const hash = window.location.hash.slice(1); // remove #
  return hash || DEFAULT_ROUTE;
}

/**
 * Handle recovery links: #recover/phone/token
 * Restores session from token and redirects to #me
 */
function checkRecoveryLink() {
  const hash = window.location.hash;
  if (!hash.startsWith('#recover/')) return false;
  const parts = hash.slice(9).split('/'); // remove #recover/
  if (parts.length < 2) return false;

  // Normalise phone so the resulting localStorage key matches the canonical
  // form everything else uses. Without this, a recovery link with the phone
  // typed as "+972 50 ..." would store an unnormalised key like
  // "mapal-rsvp-+97250..." that no other code path can find, and the user
  // would appear logged out from /me's perspective until they re-entered
  // the phone manually. We also gate on minimum length to refuse junk
  // recovery URLs that no real flow would emit.
  const phone = auth.normalizePhone(parts[0]);
  const token = parts[1];
  if (phone.length < 9 || !token) return false;

  localStorage.setItem('mapal-user', JSON.stringify({ phone, name: '', token }));
  window.location.hash = 'me';
  return true;
}

async function navigate(routeName) {
  // Past-mode redirects: hide obsolete pages unless explicitly archived.
  if (siteMode.is('past') && PAST_REDIRECT_TO_GALLERY.has(routeName)) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('archive') !== '1') {
      window.location.hash = 'gallery';
      return;
    }
  }

  const handler = routes.get(routeName);
  if (!handler) {
    // Try 404 handler or fall back to home
    const notFound = routes.get('404');
    if (notFound && routeName !== '404') {
      return navigate('404');
    }
    return navigate(DEFAULT_ROUTE);
  }

  if (currentRoute === routeName) return;

  // Fade out current content
  if (containerEl.children.length > 0) {
    containerEl.classList.add('page--leaving');
    await new Promise(r => setTimeout(r, 200));
  }

  currentRoute = routeName;
  containerEl.innerHTML = '';
  containerEl.classList.remove('page--leaving');

  await handler(containerEl);

  addBackButton(routeName);

  // Fade in
  containerEl.classList.add('page--entering');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      containerEl.classList.remove('page--entering');
    });
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Dispatch for nav active state, analytics, etc.
  window.dispatchEvent(new CustomEvent('routechange', {
    detail: { route: routeName }
  }));
}

function handleHashChange() {
  if (checkRecoveryLink()) return;
  const route = getRouteFromHash();
  navigate(route);
}

// Inject the back arrow into the first .page-section__inner of an inner page.
// Idempotent: removes any existing .back-btn first, so re-renders after a
// language switch don't accumulate or skip the button.
function addBackButton(routeName) {
  if (routeName === DEFAULT_ROUTE) return;
  const firstSection = containerEl.querySelector('.page-section__inner');
  if (!firstSection) return;
  firstSection.querySelector(':scope > .back-btn')?.remove();
  const backBtn = document.createElement('a');
  backBtn.href = '#home';
  backBtn.className = 'back-btn';
  backBtn.setAttribute('aria-label', i18n.tf('common.back', 'Back'));
  backBtn.setAttribute('data-i18n-aria', 'common.back');
  backBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  firstSection.prepend(backBtn);
}

export const router = {
  /**
   * @param {string} name — route name (matches #name in URL)
   * @param {(container: HTMLElement) => void|Promise<void>} handler
   */
  register(name, handler) {
    routes.set(name, handler);
  },

  /**
   * Start the router. Must be called after all routes are registered.
   * @param {HTMLElement} container — element to render pages into
   */
  init(container) {
    containerEl = container;
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
  },

  /**
   * Programmatic navigation.
   * @param {string} routeName
   */
  go(routeName) {
    window.location.hash = routeName;
  },

  /**
   * Re-render current route (e.g. after language change).
   */
  async refresh() {
    if (!currentRoute || !containerEl) return;
    const handler = routes.get(currentRoute);
    if (!handler) return;
    containerEl.innerHTML = '';
    await handler(containerEl);
    addBackButton(currentRoute);
  },

  get current() {
    return currentRoute;
  }
};
