/**
 * Home page renderer
 */

import { i18n } from '../core/i18n.js';
import { initCountdown } from '../components/countdown.js';
import { initShootingStar } from '../components/shooting-star.js';
import { initStarField } from '../components/star-field.js';

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
      <div class="hero__scroll-hint" aria-hidden="true">
        <div class="hero__scroll-arrow"></div>
      </div>
    </section>

    <!-- ═══ What awaits ═══ -->
    <section class="home-section" aria-labelledby="home-highlights">
      <div class="home-section__inner">
        <h2 id="home-highlights" class="home-section__title" data-i18n="home.highlightsTitle">
          ${i18n.t('home.highlightsTitle')}
        </h2>
        <div class="highlight-cards">
          <a href="#sky" class="highlight-card">
            <div class="highlight-card__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3 data-i18n="home.card1Title">${i18n.t('home.card1Title')}</h3>
            <p data-i18n="home.card1Text">${i18n.t('home.card1Text')}</p>
          </a>
          <a href="#place" class="highlight-card">
            <div class="highlight-card__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3 data-i18n="home.card2Title">${i18n.t('home.card2Title')}</h3>
            <p data-i18n="home.card2Text">${i18n.t('home.card2Text')}</p>
          </a>
          <a href="#program" class="highlight-card">
            <div class="highlight-card__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 data-i18n="home.card3Title">${i18n.t('home.card3Title')}</h3>
            <p data-i18n="home.card3Text">${i18n.t('home.card3Text')}</p>
          </a>
        </div>
      </div>
    </section>

    <!-- ═══ Quick info ═══ -->
    <section class="home-section home-section--dark" aria-labelledby="home-details">
      <div class="home-section__inner">
        <h2 id="home-details" class="home-section__title" data-i18n="home.detailsTitle">
          ${i18n.t('home.detailsTitle')}
        </h2>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-item__label" data-i18n="home.detailWhen">${i18n.t('home.detailWhen')}</span>
            <span class="detail-item__value" data-i18n="home.detailWhenVal">${i18n.t('home.detailWhenVal')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label" data-i18n="home.detailWhere">${i18n.t('home.detailWhere')}</span>
            <span class="detail-item__value" data-i18n="home.detailWhereVal">${i18n.t('home.detailWhereVal')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label" data-i18n="home.detailWho">${i18n.t('home.detailWho')}</span>
            <span class="detail-item__value" data-i18n="home.detailWhoVal">${i18n.t('home.detailWhoVal')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label" data-i18n="home.detailHighlight">${i18n.t('home.detailHighlight')}</span>
            <span class="detail-item__value" data-i18n="home.detailHighlightVal">${i18n.t('home.detailHighlightVal')}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Final CTA ═══ -->
    <section class="home-section home-section--cta">
      <div class="home-section__inner home-section__inner--center">
        <p class="home-cta__text" data-i18n="home.ctaBottomText">${i18n.t('home.ctaBottomText')}</p>
        <a href="#rsvp" class="hero__cta" data-i18n="home.cta">${i18n.t('home.cta')}</a>
      </div>
    </section>
  `;

  const starsContainer = container.querySelector('.hero__stars');
  initStarField(starsContainer);
  initCountdown();
  initShootingStar(starsContainer);

  // Hide scroll hint after first scroll
  const scrollHint = container.querySelector('.hero__scroll-hint');
  if (scrollHint) {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        scrollHint.style.opacity = '0';
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
}
