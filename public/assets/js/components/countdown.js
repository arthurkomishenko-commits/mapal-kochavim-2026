/**
 * Cinematic Countdown — observatory-style digit transitions
 *
 * Motion philosophy:
 * Each digit change is a calm, restrained slide. The old digit
 * drifts upward and fades; the new one emerges from below.
 * The feeling is "soft mechanical astronomy instrument" —
 * not a sports scoreboard.
 *
 * Performance: only transform + opacity animated.
 * Reduced motion: simple instant update, no sliding.
 */

const EVENT_START = new Date('2026-08-13T18:00:00+03:00');

let intervalId = null;
let prevValues = { days: '', hours: '', minutes: '', seconds: '' };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Animate a single digit cell: old slides up + fades, new enters from below.
 */
function transitionDigit(cell, newChar, delay) {
  const current = cell.querySelector('.cd-digit__current');
  if (!current) return;

  if (current.textContent === newChar) return;

  if (reducedMotion) {
    current.textContent = newChar;
    return;
  }

  // Create incoming digit
  const next = document.createElement('span');
  next.className = 'cd-digit__next';
  next.textContent = newChar;
  cell.appendChild(next);

  // Stagger
  setTimeout(() => {
    current.classList.add('cd-digit__current--exit');
    next.classList.add('cd-digit__next--enter');

    // After transition, swap
    setTimeout(() => {
      current.textContent = newChar;
      current.classList.remove('cd-digit__current--exit');
      next.remove();
    }, 450);
  }, delay);
}

/**
 * Update all units. Each digit animated independently.
 */
function update() {
  const now = new Date();
  const diff = EVENT_START - now;

  if (diff <= 0) {
    setDisplay('days', '0');
    setDisplay('hours', '00');
    setDisplay('minutes', '00');
    setDisplay('seconds', '00');
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    return;
  }

  const total = Math.floor(diff / 1000);
  const d = String(Math.floor(total / 86400));
  const h = pad(Math.floor((total % 86400) / 3600));
  const m = pad(Math.floor((total % 3600) / 60));
  const s = pad(total % 60);

  animateUnit('days', d, 0);
  animateUnit('hours', h, 20);
  animateUnit('minutes', m, 40);
  animateUnit('seconds', s, 0); // seconds — no stagger, instant feel
}

/**
 * Animate a unit (days/hours/etc). Compares each character.
 */
function animateUnit(id, value, baseDelay) {
  if (prevValues[id] === value) return;
  prevValues[id] = value;

  const container = document.getElementById('cd-' + id);
  if (!container) return;

  const cells = container.querySelectorAll('.cd-digit');

  // Pad value to match cell count
  const chars = value.padStart(cells.length, ' ');

  cells.forEach((cell, i) => {
    transitionDigit(cell, chars[i] === ' ' ? '' : chars[i], baseDelay + i * 25);
  });
}

/**
 * Set display without animation (initial render).
 */
function setDisplay(id, value) {
  const container = document.getElementById('cd-' + id);
  if (!container) return;
  const cells = container.querySelectorAll('.cd-digit');
  const chars = value.padStart(cells.length, ' ');
  cells.forEach((cell, i) => {
    const current = cell.querySelector('.cd-digit__current');
    if (current) current.textContent = chars[i] === ' ' ? '' : chars[i];
  });
  prevValues[id] = value;
}

export function initCountdown() {
  const el = document.getElementById('cd-days');
  if (!el) return;

  // Initial render without animation
  update();
  // Then animate every second
  intervalId = setInterval(update, 1000);
}
