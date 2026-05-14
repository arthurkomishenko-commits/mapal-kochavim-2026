/**
 * Navigation — mobile drawer with page links
 */

import { i18n } from '../core/i18n.js';

const NAV_ITEMS = [
  { route: 'home',     icon: '\u2302', i18nKey: 'nav.home' },
  { route: 'place',    icon: '\u25CB', i18nKey: 'nav.place' },
  { route: 'program',  icon: '\u25F7', i18nKey: 'nav.program' },
  { route: 'pack',     icon: '\u2610', i18nKey: 'nav.pack' },
  { route: 'rsvp',     icon: '\u270D', i18nKey: 'nav.rsvp' },
  { route: 'people',   icon: '\u2603', i18nKey: 'nav.people' },
  { route: 'rides',    icon: '\u2708', i18nKey: 'nav.rides' },
  { route: 'sky',      icon: '\u2605', i18nKey: 'nav.sky' },
  { route: 'safety',   icon: '\u2691', i18nKey: 'nav.safety' },
  { route: 'gallery',  icon: '\u25A3', i18nKey: 'nav.gallery' },
  { route: 'contacts', icon: '\u260E', i18nKey: 'nav.contacts' },
  { route: 'me',       icon: '\u2609', i18nKey: 'nav.me' },
];

let drawerEl = null;
let menuBtn = null;
let isOpen = false;

function toggleDrawer() {
  isOpen = !isOpen;
  drawerEl.classList.toggle('nav__drawer--open', isOpen);
  menuBtn.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function closeDrawer() {
  if (!isOpen) return;
  isOpen = false;
  drawerEl.classList.remove('nav__drawer--open');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function updateActiveLink(route) {
  if (!drawerEl) return;
  drawerEl.querySelectorAll('.nav__link').forEach(link => {
    const linkRoute = link.getAttribute('href').slice(1); // remove #
    link.classList.toggle('nav__link--active', linkRoute === route);
  });
}

export function initNav() {
  const header = document.querySelector('.nav');
  if (!header) return;

  // Build controls (lang + hamburger)
  const navInner = header.querySelector('.nav__inner');

  // Replace the existing lang button with controls wrapper
  const existingLangBtn = header.querySelector('.nav__lang-btn');
  const controls = document.createElement('div');
  controls.className = 'nav__controls';

  // Language button
  const langBtn = document.createElement('button');
  langBtn.id = 'lang-toggle';
  langBtn.className = 'nav__lang-btn';
  langBtn.type = 'button';
  langBtn.setAttribute('aria-label', 'Switch language');
  langBtn.textContent = i18n.t('lang.switchTo');
  controls.appendChild(langBtn);

  // Hamburger
  menuBtn = document.createElement('button');
  menuBtn.className = 'nav__menu-btn';
  menuBtn.type = 'button';
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-controls', 'nav-drawer');
  menuBtn.setAttribute('aria-label', 'Menu');
  menuBtn.innerHTML = '<span class="nav__menu-icon"></span>';
  controls.appendChild(menuBtn);

  if (existingLangBtn) existingLangBtn.remove();
  navInner.appendChild(controls);

  // Build drawer
  drawerEl = document.createElement('nav');
  drawerEl.id = 'nav-drawer';
  drawerEl.className = 'nav__drawer';
  drawerEl.setAttribute('aria-label', 'Page navigation');

  const linksContainer = document.createElement('div');
  linksContainer.className = 'nav__links';

  NAV_ITEMS.forEach(item => {
    const link = document.createElement('a');
    link.className = 'nav__link';
    link.href = `#${item.route}`;
    link.innerHTML = `
      <span class="nav__link-icon" aria-hidden="true">${item.icon}</span>
      <span data-i18n="${item.i18nKey}">${i18n.t(item.i18nKey)}</span>
    `;
    link.addEventListener('click', () => closeDrawer());
    linksContainer.appendChild(link);
  });

  drawerEl.appendChild(linksContainer);
  header.after(drawerEl);

  // Events
  menuBtn.addEventListener('click', toggleDrawer);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Update active link on route change
  window.addEventListener('routechange', (e) => {
    updateActiveLink(e.detail.route);
  });

  // Language toggle
  langBtn.addEventListener('click', () => i18n.toggle());
  window.addEventListener('langchange', () => {
    langBtn.textContent = i18n.t('lang.switchTo');
    // Re-render link labels
    drawerEl.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = i18n.t(el.getAttribute('data-i18n'));
    });
  });

  return langBtn;
}
