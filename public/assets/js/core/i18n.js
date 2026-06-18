/**
 * i18n — Internationalization module
 *
 * Handles Hebrew (RTL) / Russian (LTR) switching.
 * Persists language choice in localStorage.
 * Detects browser language on first visit.
 *
 * Usage:
 *   import { i18n } from './i18n.js';
 *   await i18n.init();
 *   i18n.t('welcome.title'); // => "Звездопад 2026"
 *   i18n.switchTo('he');
 */

const STORAGE_KEY = 'mapal-lang';
const SUPPORTED_LANGS = ['he', 'ru'];
const DEFAULT_LANG = 'he';

let currentLang = DEFAULT_LANG;
let translations = {};

/**
 * Detect preferred language from browser settings.
 * Returns 'he' or 'ru', falling back to 'he'.
 */
function detectBrowserLang() {
  const browserLangs = navigator.languages || [navigator.language];
  for (const lang of browserLangs) {
    const code = lang.toLowerCase().slice(0, 2);
    if (SUPPORTED_LANGS.includes(code)) return code;
  }
  return DEFAULT_LANG;
}

/**
 * Load translation file for a given language.
 * @param {string} lang — 'he' or 'ru'
 * @returns {Promise<Object>}
 */
async function loadTranslations(lang) {
  const basePath = document.documentElement.dataset.basePath || '.';
  const response = await fetch(`${basePath}/assets/locales/${lang}.json?v=48`);
  if (!response.ok) {
    console.error(`Failed to load translations for "${lang}"`);
    return {};
  }
  return response.json();
}

/**
 * Apply language to the document: dir, lang, and re-render all [data-i18n] elements.
 */
function applyToDOM() {
  const meta = translations.meta || {};
  document.documentElement.lang = meta.lang || currentLang;
  document.documentElement.dir = meta.dir || (currentLang === 'he' ? 'rtl' : 'ltr');
  document.title = meta.title || '';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (value) {
      el.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const value = t(key);
    if (value) {
      el.placeholder = value;
    }
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const value = t(key);
    if (value) {
      el.setAttribute('aria-label', value);
    }
  });
}

/**
 * Get a translated string by dot-notation key.
 * @param {string} key — e.g. 'welcome.title'
 * @returns {string}
 */
function t(key) {
  const parts = key.split('.');
  let result = translations;
  for (const part of parts) {
    if (result == null || typeof result !== 'object') return key;
    result = result[part];
  }
  return (result !== undefined && result !== null) ? result : key;
}

/**
 * Switch language and re-render.
 * @param {string} lang — 'he' or 'ru'
 */
async function switchTo(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  translations = await loadTranslations(lang);
  applyToDOM();
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

/**
 * Toggle between languages.
 */
function toggle() {
  const next = currentLang === 'he' ? 'ru' : 'he';
  return switchTo(next);
}

/**
 * Initialize i18n.
 */
async function init() {
  const stored = localStorage.getItem(STORAGE_KEY);
  currentLang = stored && SUPPORTED_LANGS.includes(stored)
    ? stored
    : detectBrowserLang();

  translations = await loadTranslations(currentLang);
  applyToDOM();
}

export const i18n = {
  init,
  t,
  switchTo,
  toggle,
  get lang() { return currentLang; },
  get dir() { return currentLang === 'he' ? 'rtl' : 'ltr'; },
};
