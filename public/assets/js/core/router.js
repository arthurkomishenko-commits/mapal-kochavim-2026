/**
 * Router — lightweight hash-based SPA routing
 *
 * Usage:
 *   import { router } from './router.js';
 *   router.register('home', renderHome);
 *   router.register('place', renderPlace);
 *   router.init(); // starts listening to hashchange
 */

const routes = new Map();
let currentRoute = null;
let containerEl = null;

const DEFAULT_ROUTE = 'home';

function getRouteFromHash() {
  const hash = window.location.hash.slice(1); // remove #
  return hash || DEFAULT_ROUTE;
}

async function navigate(routeName) {
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

  // Add back button on inner pages
  if (routeName !== DEFAULT_ROUTE) {
    const firstSection = containerEl.querySelector('.page-section__inner');
    if (firstSection) {
      const backBtn = document.createElement('a');
      backBtn.href = '#home';
      backBtn.className = 'back-btn';
      backBtn.setAttribute('aria-label', 'Back');
      backBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
      firstSection.prepend(backBtn);
    }
  }

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
  const route = getRouteFromHash();
  navigate(route);
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
  },

  get current() {
    return currentRoute;
  }
};
