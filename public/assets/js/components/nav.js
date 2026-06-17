/**
 * Navigation — simple top bar
 * Not logged in: [RSVP btn]  [Logo]  [Lang]
 * Logged in:     [My Cabinet] [Logo]  [Lang]
 */

import { i18n } from '../core/i18n.js';
import { siteMode } from '../core/site-mode.js';

export function initNav() {
  const header = document.querySelector('.nav');
  if (!header) return;

  const navInner = header.querySelector('.nav__inner');

  // Past-mode badge under the logo
  if (siteMode.is('past')) {
    const existing = header.querySelector('.nav__archive');
    if (!existing) {
      const badge = document.createElement('span');
      badge.className = 'nav__archive';
      badge.setAttribute('data-i18n', 'past.archiveBadge');
      badge.textContent = i18n.t('past.archiveBadge') || 'Archive · 2026';
      navInner.appendChild(badge);
    }
  }

  // Clean up any existing controls
  header.querySelectorAll('.nav__lang-btn, .nav__menu-btn, .nav__me-btn, .nav__rsvp-btn').forEach(el => el.remove());

  // RSVP button (left side, shown when NOT logged in)
  const rsvpBtn = document.createElement('a');
  rsvpBtn.href = '#rsvp';
  rsvpBtn.id = 'nav-rsvp-btn';
  rsvpBtn.className = 'nav__rsvp-btn';
  rsvpBtn.textContent = i18n.t('home.cta');
  rsvpBtn.setAttribute('data-i18n', 'home.cta');
  navInner.prepend(rsvpBtn);

  // My cabinet link (left side, shown when logged in)
  const meBtn = document.createElement('a');
  meBtn.href = '#me';
  meBtn.id = 'nav-me-btn';
  meBtn.className = 'nav__me-btn';
  meBtn.style.display = 'none';
  meBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
    <span class="nav__me-label" data-i18n="nav.me">${i18n.t('nav.me')}</span>
  `;
  navInner.prepend(meBtn);

  // Language button (right side)
  const langBtn = document.createElement('button');
  langBtn.id = 'lang-toggle';
  langBtn.className = 'nav__lang-btn';
  langBtn.type = 'button';
  langBtn.setAttribute('aria-label', 'Switch language');
  langBtn.textContent = i18n.t('lang.switchTo');
  navInner.appendChild(langBtn);

  // Show/hide buttons based on auth state + current route
  let currentRoute = '';
  function updateNav() {
    const user = JSON.parse(localStorage.getItem('mapal-user') || 'null');
    const loggedIn = !!user;
    const onRsvp = currentRoute === 'rsvp';
    meBtn.style.display = loggedIn ? '' : 'none';
    rsvpBtn.style.display = (loggedIn || onRsvp) ? 'none' : '';

    // Past mode: relabel RSVP CTA and hide the WhatsApp/RSVP bottom bar.
    const bar = document.getElementById('bottom-bar');
    const past = siteMode.is('past');
    if (past) {
      rsvpBtn.textContent = i18n.t('past.rsvpCta') || rsvpBtn.textContent;
      if (bar) bar.classList.add('bottom-bar--hidden');
    } else if (bar) {
      bar.classList.toggle('bottom-bar--hidden', loggedIn || onRsvp);
    }
  }
  updateNav();
  window.addEventListener('authchange', updateNav);
  window.addEventListener('routechange', (e) => {
    currentRoute = e.detail.route;
    updateNav();
  });

  // Language toggle
  langBtn.addEventListener('click', () => i18n.toggle());
  window.addEventListener('langchange', () => {
    langBtn.textContent = i18n.t('lang.switchTo');
    const meLabel = meBtn.querySelector('[data-i18n]');
    if (meLabel) meLabel.textContent = i18n.t('nav.me');
    // Past-mode CTA label has priority over home.cta — re-derive via updateNav.
    rsvpBtn.textContent = i18n.t('home.cta');
    const badge = header.querySelector('.nav__archive');
    if (badge) badge.textContent = i18n.t('past.archiveBadge') || badge.textContent;
    updateNav();
  });

  return langBtn;
}
