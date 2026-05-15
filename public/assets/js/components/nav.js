/**
 * Navigation — simple top bar
 * [Logo]  [My Cabinet]  [Lang]
 *
 * No hamburger, no drawer — everything accessible from home page.
 * "My Cabinet" appears after login (person icon + text on desktop).
 */

import { i18n } from '../core/i18n.js';

export function initNav() {
  const header = document.querySelector('.nav');
  if (!header) return;

  const navInner = header.querySelector('.nav__inner');

  // Clean up any existing controls
  header.querySelectorAll('.nav__lang-btn, .nav__menu-btn, .nav__me-btn').forEach(el => el.remove());

  // My cabinet link (left side, hidden until logged in)
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

  // Show/hide me button on auth change
  function updateMeBtn() {
    const user = JSON.parse(localStorage.getItem('mapal-user') || 'null');
    meBtn.style.display = user ? '' : 'none';
  }
  updateMeBtn();
  window.addEventListener('authchange', updateMeBtn);

  // Language toggle
  langBtn.addEventListener('click', () => i18n.toggle());
  window.addEventListener('langchange', () => {
    langBtn.textContent = i18n.t('lang.switchTo');
    const meLabel = meBtn.querySelector('[data-i18n]');
    if (meLabel) meLabel.textContent = i18n.t('nav.me');
  });

  return langBtn;
}
