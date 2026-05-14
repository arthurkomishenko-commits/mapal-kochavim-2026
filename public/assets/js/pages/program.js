/**
 * Program page — event timeline
 */

import { i18n } from '../core/i18n.js';

export function renderProgram(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="program-title">
      <div class="page-section__inner">
        <h1 id="program-title" class="page-section__title" data-i18n="program.title">
          ${i18n.t('program.title')}
        </h1>

        <div class="timeline">
          <div class="timeline__day">
            <h2 class="timeline__day-title" data-i18n="program.day13title">${i18n.t('program.day13title')}</h2>
            <div class="timeline__events">
              <div class="timeline__event">
                <span class="timeline__time">16:00–19:00</span>
                <div class="timeline__detail">
                  <p data-i18n="program.day13_arrival">${i18n.t('program.day13_arrival')}</p>
                </div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">19:00–20:30</span>
                <div class="timeline__detail">
                  <p data-i18n="program.day13_dinner">${i18n.t('program.day13_dinner')}</p>
                </div>
              </div>
              <div class="timeline__event timeline__event--highlight">
                <span class="timeline__time">21:00–02:00</span>
                <div class="timeline__detail">
                  <p data-i18n="program.day13_stars">${i18n.t('program.day13_stars')}</p>
                </div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">22:00–00:00</span>
                <div class="timeline__detail">
                  <p data-i18n="program.day13_telescope">${i18n.t('program.day13_telescope')}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="timeline__day">
            <h2 class="timeline__day-title" data-i18n="program.day14title">${i18n.t('program.day14title')}</h2>
            <div class="timeline__events">
              <div class="timeline__event">
                <span class="timeline__time">05:30</span>
                <div class="timeline__detail">
                  <p data-i18n="program.day14_sunrise">${i18n.t('program.day14_sunrise')}</p>
                </div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">08:00–11:00</span>
                <div class="timeline__detail">
                  <p data-i18n="program.day14_morning">${i18n.t('program.day14_morning')}</p>
                </div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">17:00–19:00</span>
                <div class="timeline__detail">
                  <p data-i18n="program.day14_hike">${i18n.t('program.day14_hike')}</p>
                </div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">20:00</span>
                <div class="timeline__detail">
                  <p data-i18n="program.day14_bonfire">${i18n.t('program.day14_bonfire')}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="timeline__day">
            <h2 class="timeline__day-title" data-i18n="program.day15title">${i18n.t('program.day15title')}</h2>
            <div class="timeline__events">
              <div class="timeline__event">
                <span class="timeline__time">07:00–10:00</span>
                <div class="timeline__detail">
                  <p data-i18n="program.day15_pack">${i18n.t('program.day15_pack')}</p>
                </div>
              </div>
              <div class="timeline__event">
                <span class="timeline__time">10:00</span>
                <div class="timeline__detail">
                  <p data-i18n="program.day15_leave">${i18n.t('program.day15_leave')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
