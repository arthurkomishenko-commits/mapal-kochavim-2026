/**
 * מפל כוכבים 2026 — Main entry point
 */

import { i18n } from './core/i18n.js';
import { initCountdown } from './components/countdown.js';

async function boot() {
  await i18n.init();
  initCountdown();

  // Language toggle button
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => i18n.toggle());
    window.addEventListener('langchange', () => {
      langBtn.textContent = i18n.t('lang.switchTo');
    });
  }
}

boot().catch(err => console.error('Boot failed:', err));
