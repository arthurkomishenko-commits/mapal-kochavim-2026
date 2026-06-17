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

// The album (user-uploaded gallery) opens early so participants can drop
// arrival/setup photos before the camp itself. Strictly the day before
// DURING_START. Asia/Jerusalem stays on IDT (UTC+3) all summer 2026, no DST flip.
const ALBUM_UNLOCK   = new Date('2026-08-11T00:00:00+03:00').getTime();
const ALBUM_STORAGE  = 'mapal-album-override';
const ALBUM_VALID    = ['open', 'lock'];

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

function readAlbumOverride() {
  try {
    const url = new URLSearchParams(window.location.search);
    const fromUrl = url.get('album');
    if (fromUrl && ALBUM_VALID.includes(fromUrl)) {
      localStorage.setItem(ALBUM_STORAGE, fromUrl);
      return fromUrl;
    }
    const stored = localStorage.getItem(ALBUM_STORAGE);
    if (stored && ALBUM_VALID.includes(stored)) return stored;
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
  /**
   * Album (user-uploaded gallery) unlocks 2026-08-11 00:00 IDT — one day
   * before the camp itself, so people can start uploading arrival photos.
   * Past mode also implies unlocked. Override via `?album=open` / `?album=lock`
   * or window.localStorage[mapal-album-override].
   */
  isAlbumUnlocked() {
    const ov = readAlbumOverride();
    if (ov === 'open') return true;
    if (ov === 'lock') return false;
    if (current === 'past' || current === 'during') return true;
    return Date.now() >= ALBUM_UNLOCK;
  },
  /** Absolute ms timestamp when the album unlocks — for "opens in X" displays. */
  get albumUnlockAt() { return ALBUM_UNLOCK; },
  /** Clear the override (back to real clock). For dev console. */
  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ALBUM_STORAGE);
    } catch {}
    const mode = this.init();
    // Hard refresh so every page renderer picks up the new mode cleanly.
    window.location.reload();
    return mode;
  },
};
