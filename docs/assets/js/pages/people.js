/**
 * People page — live stats + participant list from localStorage
 * (Firestore when connected)
 */

import { i18n } from '../core/i18n.js';

function getAllParticipants() {
  const list = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith('mapal-rsvp-')) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data && !data.cancelled) list.push(data);
    } catch {}
  }
  return list;
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

export function renderPeople(container) {
  const participants = getAllParticipants();

  // Aggregate stats
  let totalPeople = 0;
  let totalCars = 0;
  let totalKids = 0;

  participants.forEach(p => {
    totalPeople++; // the person themselves
    if (p.companions) totalPeople += p.companions.length;
    if (p.kids) totalKids += p.kids;
    if (p.isDriving) totalCars++;
  });

  // Build participant list HTML
  let listHtml = '';
  if (participants.length > 0) {
    listHtml = '<div class="people-list">';
    participants.forEach(p => {
      const companions = (p.companions && p.companions.length > 0)
        ? `<span class="people-item__extra">+${p.companions.length}</span>`
        : '';
      const car = p.isDriving ? '<span class="people-item__badge people-item__badge--car">&#x1F697;</span>' : '';
      const kids = p.kids ? `<span class="people-item__extra">${p.kids} ${i18n.t('rsvp.kidsLabel')}</span>` : '';

      listHtml += `
        <div class="people-item">
          <div class="people-item__main">
            <span class="people-item__name">${esc(p.name)}</span>
            ${car}
            ${companions}
            ${kids}
          </div>
          ${p.city ? `<span class="people-item__city">${esc(p.city)}</span>` : ''}
        </div>
      `;
    });
    listHtml += '</div>';
  } else {
    listHtml = `<div class="empty-state"><p data-i18n="common.empty">${i18n.t('common.empty')}</p></div>`;
  }

  container.innerHTML = `
    <section class="page-section" aria-labelledby="people-title">
      <div class="page-section__inner">
        <h1 id="people-title" class="page-section__title" data-i18n="people.title">
          ${i18n.t('people.title')}
        </h1>

        <div class="people-stats">
          <div class="people-stat">
            <span class="people-stat__number tabular-nums">${totalPeople}</span>
            <span class="people-stat__label" data-i18n="people.participants">${i18n.t('people.participants')}</span>
          </div>
          <div class="people-stat">
            <span class="people-stat__number tabular-nums">${totalCars}</span>
            <span class="people-stat__label" data-i18n="people.cars">${i18n.t('people.cars')}</span>
          </div>
          ${totalKids > 0 ? `
          <div class="people-stat">
            <span class="people-stat__number tabular-nums">${totalKids}</span>
            <span class="people-stat__label" data-i18n="rsvp.kidsLabel">${i18n.t('rsvp.kidsLabel')}</span>
          </div>
          ` : ''}
        </div>

        ${listHtml}
      </div>
    </section>
  `;
}
