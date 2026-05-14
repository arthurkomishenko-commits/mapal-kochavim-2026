/**
 * Home page renderer
 */

import { i18n } from '../core/i18n.js';
import { initCountdown } from '../components/countdown.js';
import { initShootingStar } from '../components/shooting-star.js';

export function renderHome(container) {
  container.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__stars" aria-hidden="true"></div>
      <div class="hero__content">
        <h1 id="hero-title" class="hero__title" data-i18n="home.heroTitle">
          ${i18n.t('home.heroTitle')}
        </h1>
        <p class="hero__subtitle" data-i18n="home.heroSubtitle">
          ${i18n.t('home.heroSubtitle')}
        </p>
        <div class="hero__countdown" aria-label="Countdown to event">
          <div class="countdown__unit">
            <span class="countdown__number tabular-nums" id="countdown-days">--</span>
            <span class="countdown__label" data-i18n="home.countdown.days">${i18n.t('home.countdown.days')}</span>
          </div>
          <div class="countdown__separator" aria-hidden="true">:</div>
          <div class="countdown__unit">
            <span class="countdown__number tabular-nums" id="countdown-hours">--</span>
            <span class="countdown__label" data-i18n="home.countdown.hours">${i18n.t('home.countdown.hours')}</span>
          </div>
          <div class="countdown__separator" aria-hidden="true">:</div>
          <div class="countdown__unit">
            <span class="countdown__number tabular-nums" id="countdown-minutes">--</span>
            <span class="countdown__label" data-i18n="home.countdown.minutes">${i18n.t('home.countdown.minutes')}</span>
          </div>
          <div class="countdown__separator" aria-hidden="true">:</div>
          <div class="countdown__unit">
            <span class="countdown__number tabular-nums" id="countdown-seconds">--</span>
            <span class="countdown__label" data-i18n="home.countdown.seconds">${i18n.t('home.countdown.seconds')}</span>
          </div>
        </div>
        <a href="#rsvp" class="hero__cta" data-i18n="home.cta">${i18n.t('home.cta')}</a>
      </div>
    </section>
  `;

  initCountdown();
  initShootingStar(container.querySelector('.hero__stars'));
}
