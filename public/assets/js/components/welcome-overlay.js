/**
 * Welcome Overlay
 *
 * Shows on first visit. After dismiss — hidden for 7 days.
 * Uses localStorage to track dismiss time.
 * Staggered entrance animation for premium feel.
 */

import { i18n } from '../core/i18n.js';

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
  overlay.addEventListener('transitionend', () => {
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
    <div class="welcome__content">
      <div class="welcome__wrap">

        <div class="welcome__star" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="2" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
          </svg>
        </div>

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

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('welcome--visible');
    });
  });

  overlay.querySelector('.welcome__enter').addEventListener('click', dismiss);
  document.addEventListener('keydown', handleEsc);

  overlay.querySelector('.welcome__enter').focus();
}
