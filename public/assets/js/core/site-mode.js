/**
 * Site mode — single source of truth for "is the event past/during/before?".
 *
 * `siteMode.current` is one of: 'before' | 'during' | 'past'.
 *
 * The mode is computed once at boot from the current IDT time vs the camp
 * window (Aug 12-13 transition to "during", Aug 15 10:00 to "past"). Tests
 * and admins can override via `?mode=past` URL param or localStorage.
 *
 * The mode is applied to `<html data-mode="...">` so CSS can branch
 * declaratively. Pages read `siteMode.current` directly to switch renderers.
 *
 * Usage:
 *   import { siteMode } from './core/site-mode.js';
 *   siteMode.init();          // call once during boot, BEFORE anything renders
 *   if (siteMode.is('past')) { ... }
 */

const STORAGE_KEY = 'mapal-mode-override';
const VALID = ['before', 'during', 'past'];

// Event window (Asia/Jerusalem IDT, UTC+3 throughout summer 2026).
const DURING_START = new Date('2026-08-12T17:00:00+03:00').getTime();
const PAST_START   = new Date('2026-08-15T10:00:00+03:00').getTime();

function computeFromClock() {
  const now = Date.now();
  if (now >= PAST_START)   return 'past';
  if (now >= DURING_START) return 'during';
  return 'before';
}

function readOverride() {
  // URL has priority and is persisted to localStorage for the session.
  try {
    const url = new URLSearchParams(window.location.search);
    const fromUrl = url.get('mode');
    if (fromUrl && VALID.includes(fromUrl)) {
      localStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID.includes(stored)) return stored;
  } catch {}
  return null;
}

let current = 'before';

export const siteMode = {
  init() {
    current = readOverride() || computeFromClock();
    document.documentElement.dataset.mode = current;
    return current;
  },
  get current() { return current; },
  is(mode) { return current === mode; },
  /** Clear the override (back to real clock). For dev console. */
  reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    const mode = this.init();
    // Hard refresh so every page renderer picks up the new mode cleanly.
    window.location.reload();
    return mode;
  },
};
