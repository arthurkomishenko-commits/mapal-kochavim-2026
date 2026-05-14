/**
 * Countdown to event start.
 * Target: August 13, 2026 18:00 Asia/Jerusalem (evening arrival)
 */

const EVENT_START = new Date('2026-08-13T18:00:00+03:00');

const ELEMENTS = {
  days: null,
  hours: null,
  minutes: null,
  seconds: null,
};

let intervalId = null;

function pad(n) {
  return String(n).padStart(2, '0');
}

function update() {
  const now = new Date();
  const diff = EVENT_START - now;

  if (diff <= 0) {
    // Event has started or passed
    Object.values(ELEMENTS).forEach(el => {
      if (el) el.textContent = '00';
    });
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (ELEMENTS.days) ELEMENTS.days.textContent = String(days);
  if (ELEMENTS.hours) ELEMENTS.hours.textContent = pad(hours);
  if (ELEMENTS.minutes) ELEMENTS.minutes.textContent = pad(minutes);
  if (ELEMENTS.seconds) ELEMENTS.seconds.textContent = pad(seconds);
}

export function initCountdown() {
  ELEMENTS.days = document.getElementById('countdown-days');
  ELEMENTS.hours = document.getElementById('countdown-hours');
  ELEMENTS.minutes = document.getElementById('countdown-minutes');
  ELEMENTS.seconds = document.getElementById('countdown-seconds');

  // Bail if elements don't exist (not on home page)
  if (!ELEMENTS.days) return;

  update();
  intervalId = setInterval(update, 1000);
}
