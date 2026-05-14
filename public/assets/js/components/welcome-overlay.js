/**
 * Welcome Overlay
 *
 * Shows on first visit. After dismiss — hidden for 7 days.
 * Uses localStorage to track dismiss time.
 */

import { i18n } from '../core/i18n.js';

const STORAGE_KEY = 'mapal-welcome-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function shouldShow() {
  const dismissed = localStorage.getItem(STORAGE_KEY);
  if (!dismissed) return true;

  const dismissedAt = parseInt(dismissed, 10);
  if (isNaN(dismissedAt)) return true;

  return Date.now() - dismissedAt > DISMISS_DURATION_MS;
}

function dismiss() {
  localStorage.setItem(STORAGE_KEY, String(Date.now()));
  const overlay = document.getElementById('welcome-overlay');
  if (!overlay) return;

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
      <div class="welcome__icon" aria-hidden="true">&#127756;</div>
      <h1 class="welcome__title" data-i18n="welcome.title">${i18n.t('welcome.title')}</h1>
      <p class="welcome__text" data-i18n="welcome.line1">${i18n.t('welcome.line1')}</p>
      <p class="welcome__text" data-i18n="welcome.line2">${i18n.t('welcome.line2')}</p>
      <p class="welcome__dates" data-i18n="welcome.dates">${i18n.t('welcome.dates')}</p>
      <button class="welcome__enter" type="button" data-i18n="welcome.enter">${i18n.t('welcome.enter')}</button>
    </div>
  `;

  document.body.prepend(overlay);

  // Trigger entrance animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('welcome--visible');
    });
  });

  // Dismiss on button click
  overlay.querySelector('.welcome__enter').addEventListener('click', dismiss);

  // Dismiss on Escape
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      dismiss();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Focus the enter button for accessibility
  overlay.querySelector('.welcome__enter').focus();
}
