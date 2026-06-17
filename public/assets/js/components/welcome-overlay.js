/**
 * Welcome Overlay
 *
 * Shows on first visit. After dismiss — hidden for 7 days.
 * Uses localStorage to track dismiss time.
 * Staggered entrance animation for premium feel.
 */

import { i18n } from '../core/i18n.js';
import { initStarsBg } from './stars-bg.js';

const STORAGE_KEY = 'mapal-welcome-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

let savedScrollY = 0;

function lockScroll() {
  savedScrollY = window.scrollY;
  document.documentElement.style.position = 'fixed';
  document.documentElement.style.top = `-${savedScrollY}px`;
  document.documentElement.style.left = '0';
  document.documentElement.style.right = '0';
  document.documentElement.style.overflow = 'hidden';
}

function unlockScroll() {
  document.documentElement.style.position = '';
  document.documentElement.style.top = '';
  document.documentElement.style.left = '';
  document.documentElement.style.right = '';
  document.documentElement.style.overflow = '';
  window.scrollTo(0, savedScrollY);
}

function shouldShow() {
  const dismissed = localStorage.getItem(STORAGE_KEY);
  if (!dismissed) return true;
  const dismissedAt = parseInt(dismissed, 10);
  if (isNaN(dismissedAt)) return true;
  return Date.now() - dismissedAt > DISMISS_DURATION_MS;
}

function handleEsc(e) {
  if (e.key === 'Escape') dismiss();
}

function dismiss() {
  localStorage.setItem(STORAGE_KEY, String(Date.now()));
  document.removeEventListener('keydown', handleEsc);
  const overlay = document.getElementById('welcome-overlay');
  if (!overlay) return;

  unlockScroll();
  overlay.classList.add('welcome--leaving');
  // transitionend may never fire under prefers-reduced-motion (no transition).
  // Safety timeout guarantees the overlay leaves the DOM.
  const safetyTimer = setTimeout(() => { overlay.remove(); }, 800);
  overlay.addEventListener('transitionend', () => {
    clearTimeout(safetyTimer);
    overlay.remove();
  }, { once: true });
}

export function initWelcomeOverlay() {
  if (!shouldShow()) return;

  const overlay = document.createElement('div');
  overlay.id = 'welcome-overlay';
  overlay.className = 'welcome';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', i18n.t('welcome.title'));

  overlay.innerHTML = `
    <div class="welcome__bg" aria-hidden="true">
      <div class="stars-bg__layer stars-bg__faint"></div>
      <div class="stars-bg__layer stars-bg__medium"></div>
      <div class="stars-bg__layer stars-bg__bright"></div>
    </div>
    <div class="welcome__lang" role="group" aria-label="Language">
      <button type="button" class="welcome__lang-btn" data-lang="ru">RU</button>
      <button type="button" class="welcome__lang-btn" data-lang="he">עב</button>
    </div>
    <div class="welcome__content">
      <div class="welcome__wrap">

        <h1 class="welcome__title" data-i18n="welcome.title">${i18n.t('welcome.title')}</h1>

        <div class="welcome__divider" aria-hidden="true"></div>

        <p class="welcome__text" data-i18n="welcome.line1">${i18n.t('welcome.line1')}</p>
        <p class="welcome__text" data-i18n="welcome.line2">${i18n.t('welcome.line2')}</p>

        <p class="welcome__private" data-i18n="welcome.private">${i18n.t('welcome.private')}</p>

        <p class="welcome__dates" data-i18n="welcome.dates">${i18n.t('welcome.dates')}</p>

        <button class="welcome__enter" type="button" data-i18n="welcome.enter">${i18n.t('welcome.enter')}</button>

      </div>
    </div>
  `;

  lockScroll();
  document.body.prepend(overlay);

  // Generate box-shadow stars on the welcome's own layers — the global
  // #stars-bg is z-index:0 underneath the welcome's solid background, so
  // we paint the same look directly inside the overlay.
  initStarsBg(overlay.querySelector('.welcome__bg'));

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('welcome--visible');
    });
  });

  overlay.querySelector('.welcome__enter').addEventListener('click', dismiss);
  document.addEventListener('keydown', handleEsc);

  // Language switcher inside the overlay — single in-flight switch only,
  // so a fast double-click can't race two parallel `switchTo` calls.
  const langBtns = overlay.querySelectorAll('.welcome__lang-btn');
  const markActive = () => {
    langBtns.forEach(b => {
      b.classList.toggle('welcome__lang-btn--active', b.dataset.lang === i18n.lang);
    });
  };
  markActive();
  let switching = false;
  langBtns.forEach(btn => btn.addEventListener('click', async () => {
    if (switching || btn.dataset.lang === i18n.lang) return;
    switching = true;
    langBtns.forEach(b => b.disabled = true);
    try {
      await i18n.switchTo(btn.dataset.lang);
      markActive();
    } finally {
      switching = false;
      langBtns.forEach(b => b.disabled = false);
    }
  }));

  overlay.querySelector('.welcome__enter').focus();
}
