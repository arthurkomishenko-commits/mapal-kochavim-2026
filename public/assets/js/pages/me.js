/**
 * Me page — personal dashboard
 * Shows registration data, allows editing, cancel registration.
 */

import { i18n } from '../core/i18n.js';
import { auth } from '../core/auth.js';
import { siteMode } from '../core/site-mode.js';
let db = null;
async function getDb() {
  if (!db) {
    const mod = await import('../core/db.js');
    db = mod.db;
  }
  return db;
}

let containerEl = null;

function showToast(msg, isError = false) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast--error' : ''}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast--visible'));
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function renderPhoneEntry() {
  containerEl.innerHTML = `
    <section class="page-section" aria-labelledby="me-title">
      <div class="page-section__inner">
        <h1 id="me-title" class="page-section__title" data-i18n="me.title">
          ${i18n.t('me.title')}
        </h1>

        <div class="phone-entry">
          <p class="phone-entry__hint" data-i18n="me.phonePrompt">
            ${i18n.t('me.phonePrompt')}
          </p>
          <div class="form-group">
            <input type="tel" class="form-input" id="me-phone"
              placeholder="${i18n.t('rsvp.phonePlaceholder')}"
              autocomplete="tel" inputmode="tel">
          </div>
          <button type="button" class="form-submit" id="me-phone-btn" data-i18n="rsvp.continue">
            ${i18n.t('rsvp.continue')}
          </button>
        </div>
      </div>
    </section>
  `;

  document.getElementById('me-phone-btn').addEventListener('click', handlePhoneLookup);
  document.getElementById('me-phone').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handlePhoneLookup();
  });
}

async function handlePhoneLookup() {
  const input = document.getElementById('me-phone');
  const raw = input.value.trim();
  if (!raw) { input.classList.add('form-input--error'); return; }

  const phone = auth.normalizePhone(raw);
  if (phone.length < 9) { input.classList.add('form-input--error'); return; }

  // Check localStorage first (instant, works offline)
  let data = null;
  const saved = localStorage.getItem('mapal-rsvp-' + phone);
  if (saved) {
    try { data = JSON.parse(saved); } catch {}
  }

  // Try Firestore with timeout if no local data
  if (!data) {
    try {
      const d1 = await Promise.race([
        getDb(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
      ]);
      data = await d1.getParticipant(phone);
    } catch {}
  }

  if (!data) {
    renderNotFound();
    return;
  }

  try {
    auth.login(phone, data.name);
    localStorage.setItem('mapal-rsvp-' + phone, JSON.stringify(data));
    renderProfile(data);
  } catch {
    renderNotFound();
  }
}

function renderNotFound() {
  containerEl.innerHTML = `
    <section class="page-section" aria-labelledby="me-title">
      <div class="page-section__inner" style="text-align:center;">
        <h1 id="me-title" class="page-section__title" data-i18n="me.title">
          ${i18n.t('me.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="me.notFound">
          ${i18n.t('me.notFound')}
        </p>
        <a href="#rsvp" class="form-submit" style="display:inline-block;max-width:280px;text-align:center;margin-top:24px;" data-i18n="me.goToRsvp">
          ${i18n.t('me.goToRsvp')}
        </a>
      </div>
    </section>
  `;
}

function renderProfile(data) {
  if (siteMode.is('past')) return renderProfilePast(data);
  const isCancelled = data.cancelled === true;

  let companionsHtml = '';
  if (data.companions && data.companions.length > 0) {
    companionsHtml = `
      <div class="me-section">
        <div class="form-section__title" data-i18n="rsvp.companionsTitle">${i18n.t('rsvp.companionsTitle')}</div>
        <ul class="me-companions">
          ${data.companions.map(c => `<li>${esc(c.name)} &middot; ${esc(c.phone)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let bringingHtml = '';
  if (data.bringing) {
    const active = Object.entries(data.bringing).filter(([, v]) => v);
    if (active.length > 0) {
      bringingHtml = `
        <div class="me-section">
          <div class="form-section__title" data-i18n="rsvp.bringingTitle">${i18n.t('rsvp.bringingTitle')}</div>
          <div class="chips-grid">
            ${active.map(([k, v]) => {
              const key = 'rsvp.b' + k.charAt(0).toUpperCase() + k.slice(1);
              const label = i18n.t(key);
              const qty = typeof v === 'number' && v > 1 ? ` x${v}` : '';
              return `<span class="chip chip--active">${label}${qty}</span>`;
            }).join('')}
          </div>
        </div>
      `;
    }
  }

  containerEl.innerHTML = `
    <section class="page-section" aria-labelledby="me-title">
      <div class="page-section__inner">
        <h1 id="me-title" class="page-section__title" data-i18n="me.title">
          ${i18n.t('me.title')}
        </h1>

        <div class="me-status">
          <span class="status-badge ${isCancelled ? 'status-badge--cancelled' : 'status-badge--active'}">
            ${isCancelled ? i18n.t('me.statusCancelled') : i18n.t('me.statusActive')}
          </span>
        </div>

        <div class="me-card">
          <div class="me-field">
            <span class="me-field__label" data-i18n="rsvp.nameLabel">${i18n.t('rsvp.nameLabel')}</span>
            <span class="me-field__value">${esc(data.name)}</span>
          </div>
          <div class="me-field">
            <span class="me-field__label" data-i18n="rsvp.phoneLabel">${i18n.t('rsvp.phoneLabel')}</span>
            <span class="me-field__value" style="direction:ltr;display:inline-block;">${esc(data.phone)}</span>
          </div>
          ${data.city ? `
          <div class="me-field">
            <span class="me-field__label" data-i18n="rsvp.cityLabel">${i18n.t('rsvp.cityLabel')}</span>
            <span class="me-field__value">${esc(data.city)}</span>
          </div>
          ` : ''}
          <div class="me-field">
            <span class="me-field__label" data-i18n="rsvp.daysTitle">${i18n.t('rsvp.daysTitle')}</span>
            <span class="me-field__value">${data.arrivalDay || '13'} – ${data.departureDay || '15'} ${i18n.tf('rsvp.aug', 'авг')}</span>
          </div>
          <div class="me-field">
            <span class="me-field__label" data-i18n="rsvp.drivingLabel">${i18n.t('rsvp.drivingLabel')}</span>
            <span class="me-field__value">${data.isDriving ? i18n.t('rsvp.drivingYes') : i18n.t('rsvp.drivingNo')}</span>
          </div>
        </div>

        ${companionsHtml}
        ${bringingHtml}

        <a href="#rsvp" class="form-submit" style="display:block;text-align:center;text-decoration:none;margin-top:24px;" data-i18n="me.edit">
          ${i18n.t('me.edit')}
        </a>

        ${auth.isAdmin() ? `
        <div class="admin-panel">
          <div class="admin-panel__title">${i18n.t('me.adminTitle')}</div>
          <div class="admin-panel__stats" id="admin-stats"></div>
          <div class="admin-panel__actions">
            <button type="button" class="home-who-btn" id="admin-export">${i18n.t('me.adminExport')}</button>
            <button type="button" class="home-who-btn" id="admin-clear-all" style="border-color:rgba(220,80,80,0.2);color:rgba(220,80,80,0.6);">${i18n.t('me.adminClearAll')}</button>
          </div>
          <div id="admin-list" class="admin-list"></div>
        </div>
        ` : ''}

        ${!isCancelled ? `
        <button type="button" class="form-cancel-link" id="me-cancel">
          ${i18n.t('me.cancelRegistration')}
        </button>
        ` : ''}

        <button type="button" class="form-cancel-link" id="me-recovery" style="color:rgba(165,160,154,0.5);">
          ${i18n.t('me.copyRecoveryLink')}
        </button>

        <button type="button" class="form-cancel-link" id="me-logout" style="color:rgba(165,160,154,0.3);">
          ${i18n.t('common.logout')}
        </button>
      </div>
    </section>
  `;

  // Cancel handler
  const cancelBtn = document.getElementById('me-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', async () => {
      data.cancelled = true;
      data.updatedAt = new Date().toISOString();
      try { const d2 = await getDb(); await d2.saveParticipant(data); } catch {}
      localStorage.setItem('mapal-rsvp-' + data.phone, JSON.stringify(data));
      showToast(i18n.t('me.cancelled'));
      renderProfile(data);
    });
  }

  // Recovery link
  const recoveryBtn = document.getElementById('me-recovery');
  if (recoveryBtn) {
    recoveryBtn.addEventListener('click', () => {
      const user = auth.getUser();
      if (!user) return;
      const url = `${location.origin}${location.pathname}#recover/${user.phone}/${user.token}`;
      navigator.clipboard.writeText(url).then(() => {
        showToast(i18n.t('me.recoveryLinkCopied'));
      }).catch(() => {
        prompt(i18n.t('me.copyRecoveryLink'), url);
      });
    });
  }

  // Logout
  const logoutBtn = document.getElementById('me-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.logout();
      renderPhoneEntry();
    });
  }

  // Admin panel
  if (auth.isAdmin()) {
    renderAdminPanel().catch(() => {});
  }
}

// ═══════════════════════════════════════════════════
// PAST MODE — archive cabinet
//
// Pre-event "cabinet" is about *intent*: are you going, what are you
// bringing, which day are you arriving. None of that survives the camp.
// Past mode keeps only what's still true after Aug 15: who you are,
// who came with you, and a quick path to the gallery.
// ═══════════════════════════════════════════════════

function renderProfilePast(data) {
  const attended = data.confirmed !== false && !data.cancelled;
  // If THE primary didn't come, listing "companions who came with you" is
  // visually contradictory ("вы не были, но вот ваши спутники"). Hide.
  const goingCompanions = attended
    ? (data.companions || []).filter(c => c && c.name && c.cancelled !== true)
    : [];
  const isAdmin = auth.isAdmin();

  containerEl.innerHTML = `
    <section class="page-section" aria-labelledby="me-title">
      <div class="page-section__inner me-past">
        <h1 id="me-title" class="page-section__title" data-i18n="me.title">${i18n.t('me.title')}</h1>

        <div class="me-past__status ${attended ? 'me-past__status--ok' : 'me-past__status--soft'}">
          ${attended ? `
            <svg class="me-past__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12.5 11 15.5 16 9.5"/>
            </svg>
          ` : ''}
          <div class="me-past__status-text">
            <div class="me-past__status-title">${i18n.t(attended ? 'past.me.attendedTitle' : 'past.me.notAttendedTitle')}</div>
            <div class="me-past__status-sub">${i18n.t(attended ? 'past.me.attendedText' : 'past.me.notAttendedText')}</div>
          </div>
        </div>

        <div class="me-past__card">
          <div class="me-past__field">
            <span class="me-past__field-label" data-i18n="rsvp.name">${i18n.t('rsvp.name') !== 'rsvp.name' ? i18n.t('rsvp.name') : (i18n.lang === 'he' ? 'שם' : 'Имя')}</span>
            <span class="me-past__field-value">${esc(data.name)}</span>
          </div>
          <div class="me-past__field">
            <span class="me-past__field-label" data-i18n="rsvp.phone">${i18n.t('rsvp.phone') !== 'rsvp.phone' ? i18n.t('rsvp.phone') : (i18n.lang === 'he' ? 'טלפון' : 'Телефон')}</span>
            <span class="me-past__field-value" dir="ltr">${esc(data.phone)}</span>
          </div>
        </div>

        ${goingCompanions.length > 0 ? `
          <div class="me-past__companions">
            <h3 class="me-past__section-title" data-i18n="past.me.companionsWere">${i18n.t('past.me.companionsWere')}</h3>
            <ul class="me-past__companions-list">
              ${goingCompanions.map(c => `<li><span class="me-past__comp-name">${esc(c.name)}</span></li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="me-past__actions">
          <a href="#gallery" class="me-past__cta">
            <span>${i18n.t(attended ? 'past.me.uploadCta' : 'past.me.viewCta')}</span>
            <span class="me-past__cta-arrow" aria-hidden="true"></span>
          </a>
        </div>

        ${isAdmin ? `
          <div class="admin-panel admin-panel--past">
            <div class="admin-panel__title">${i18n.t('me.adminTitle')}</div>
            <div class="admin-panel__stats" id="admin-stats-past"></div>
            <div class="admin-panel__actions">
              <button type="button" class="home-who-btn" id="admin-export-past">${i18n.t('past.me.adminExport')}</button>
            </div>
            <div id="admin-list-past" class="admin-list"></div>
          </div>
        ` : ''}

        <div class="me-past__footer">
          <button type="button" class="me-past__link" id="me-recovery">
            ${i18n.t('me.copyRecoveryLink')}
          </button>
          <button type="button" class="me-past__link me-past__link--dim" id="me-logout">
            ${i18n.t('common.logout')}
          </button>
        </div>
      </div>
    </section>
  `;

  // Recovery link
  const recoveryBtn = document.getElementById('me-recovery');
  recoveryBtn?.addEventListener('click', () => {
    const user = auth.getUser();
    if (!user) return;
    const url = `${location.origin}${location.pathname}#recover/${user.phone}/${user.token}`;
    navigator.clipboard.writeText(url)
      .then(() => showToast(i18n.t('me.recoveryLinkCopied')))
      .catch(() => prompt(i18n.t('me.copyRecoveryLink'), url));
  });

  // Logout
  document.getElementById('me-logout')?.addEventListener('click', () => {
    auth.logout();
    renderPhoneEntry();
  });

  if (isAdmin) renderAdminPanelPast().catch(err => console.warn('admin past panel failed', err));
}

// ─── Admin panel — past mode variant ──────────────────────────────────
//
// Different stats and no "Clear all" — in past mode the dataset IS the
// archive, wiping it would destroy event history. Export remains useful;
// it copies the attendee list to clipboard for offline reference.

async function renderAdminPanelPast() {
  const statsEl  = document.getElementById('admin-stats-past');
  const listEl   = document.getElementById('admin-list-past');
  const exportBtn = document.getElementById('admin-export-past');
  if (!statsEl && !listEl) return;

  let all = [];
  try {
    const d3 = await getDb();
    all = await d3.getAllParticipants();
  } catch {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('mapal-rsvp-')) continue;
      try { all.push(JSON.parse(localStorage.getItem(key))); } catch {}
    }
  }

  // Classify each record:
  //   attended    — confirmed !== false && !cancelled (went to camp)
  //   notArrived  — confirmed === false || cancelled  (was registered but didn't make it)
  const attended   = all.filter(p => p && p.confirmed !== false && !p.cancelled);
  const notArrived = all.filter(p => p && (p.confirmed === false || p.cancelled));

  // Headcount: primary + companions who weren't cancelled + kids.
  let totalBodies = 0;
  let totalKids   = 0;
  let totalLate   = 0;
  attended.forEach(p => {
    totalBodies += 1;
    totalBodies += (p.companions || []).filter(c => c && c.cancelled !== true).length;
    totalKids   += Number(p.kids) || 0;
    if (p.lateRegistration) totalLate += 1;
  });
  totalBodies += totalKids;

  if (statsEl) {
    statsEl.innerHTML = `
      <span class="admin-stat">${attended.length} ${i18n.t('past.me.adminAttended')}</span>
      <span class="admin-stat">${totalBodies} ${i18n.t('past.me.adminTotalBodies')}</span>
      ${totalKids > 0 ? `<span class="admin-stat">${totalKids} ${i18n.t('past.me.adminKids')}</span>` : ''}
      ${notArrived.length > 0 ? `<span class="admin-stat admin-stat--warn">${notArrived.length} ${i18n.t('past.me.adminNotArrived')}</span>` : ''}
      ${totalLate > 0 ? `<span class="admin-stat admin-stat--warn">${totalLate} ${i18n.t('past.me.adminLate')}</span>` : ''}
    `;
  }

  if (listEl) {
    listEl.innerHTML = attended
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map(p => {
        const comps = (p.companions || [])
          .filter(c => c && c.cancelled !== true)
          .map(c => `<span class="admin-row__comp">${esc(c.name)} ${esc(c.phone || '')}</span>`)
          .join('');
        const kids = Number(p.kids) > 0 ? `<span class="admin-row__kids">+${p.kids}</span>` : '';
        const late = p.lateRegistration ? `<span class="admin-row__late">${i18n.t('past.me.adminLateMark')}</span>` : '';
        return `
          <div class="admin-row">
            <span class="admin-row__name">${esc(p.name)}</span>
            <span class="admin-row__phone" dir="ltr">${esc(p.phone)}</span>
            ${kids}${late}${comps}
          </div>
        `;
      }).join('');
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const lines = attended.map(p => {
        let line = `${p.name} | ${p.phone}`;
        if (p.kids)             line += ` | kids:${p.kids}`;
        if (p.lateRegistration) line += ' | late';
        if (p.companions && p.companions.length) {
          line += ' | +' + p.companions
            .filter(c => c && c.cancelled !== true)
            .map(c => `${c.name}(${c.phone || ''})`)
            .join(', ');
        }
        return line;
      });
      const text = lines.join('\n');
      navigator.clipboard.writeText(text)
        .then(() => showToast(i18n.t('common.saved')))
        .catch(() => prompt('Copy:', text));
    });
  }
}

async function renderAdminPanel() {
  const statsEl = document.getElementById('admin-stats');
  const listEl = document.getElementById('admin-list');
  const exportBtn = document.getElementById('admin-export');
  const clearBtn = document.getElementById('admin-clear-all');

  // Gather all participants from Firestore
  let all = [];
  try {
    const d3 = await getDb(); all = await d3.getAllParticipants();
  } catch {
    // Fallback localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key.startsWith('mapal-rsvp-')) continue;
      try { all.push(JSON.parse(localStorage.getItem(key))); } catch {}
    }
  }

  const active = all.filter(p => !p.cancelled);
  const cancelled = all.filter(p => p.cancelled);
  let totalPeople = 0;
  let totalCars = 0;
  active.forEach(p => {
    totalPeople++;
    if (p.companions) totalPeople += p.companions.length;
    if (p.kids) totalPeople += p.kids;
    if (p.isDriving) totalCars++;
  });

  if (statsEl) {
    statsEl.innerHTML = `
      <span class="admin-stat">${active.length} ${i18n.t('me.adminRegistered')}</span>
      <span class="admin-stat">${totalPeople} ${i18n.t('people.participants')}</span>
      <span class="admin-stat">${totalCars} ${i18n.t('people.cars')}</span>
      ${cancelled.length ? `<span class="admin-stat admin-stat--warn">${cancelled.length} ${i18n.t('me.adminCancelled')}</span>` : ''}
    `;
  }

  // List all with phone numbers (admin only)
  if (listEl) {
    listEl.innerHTML = active.map(p => `
      <div class="admin-row">
        <span class="admin-row__name">${esc(p.name)}</span>
        <span class="admin-row__phone" dir="ltr">${p.phone}</span>
        ${p.companions ? p.companions.map(c => `<span class="admin-row__comp">${esc(c.name)} ${c.phone}</span>`).join('') : ''}
      </div>
    `).join('');
  }

  // Export to clipboard
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const lines = active.map(p => {
        let line = `${p.name} | ${p.phone}`;
        if (p.city) line += ` | ${p.city}`;
        if (p.isDriving) line += ' | car';
        if (p.companions && p.companions.length) {
          line += ' | +' + p.companions.map(c => `${c.name}(${c.phone})`).join(', ');
        }
        return line;
      });
      const text = lines.join('\n');
      navigator.clipboard.writeText(text).then(() => {
        showToast(i18n.t('common.saved'));
      }).catch(() => {
        prompt('Copy:', text);
      });
    });
  }

  // Clear all (dangerous — triple confirmation)
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const typed = prompt(i18n.t('me.adminClearConfirm'));
      if (typed !== 'DELETE') {
        if (typed !== null) showToast('Type DELETE to confirm', true);
        return;
      }
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith('mapal-rsvp-')) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
      showToast('Cleared ' + keys.length + ' entries');
      renderAdminPanel();
    });
  }
}

// Escape HTML for safe rendering
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

export async function renderMe(container) {
  containerEl = container;

  const user = auth.getUser();
  if (user && user.phone) {
    // Show from localStorage immediately (works offline)
    const saved = localStorage.getItem('mapal-rsvp-' + user.phone);
    if (saved) {
      try {
        renderProfile(JSON.parse(saved));
      } catch {
        renderPhoneEntry();
        return;
      }

      // Try to refresh from Firestore in background (non-blocking)
      getDb().then(d => d.getParticipant(user.phone)).then(data => {
        if (data) {
          localStorage.setItem('mapal-rsvp-' + user.phone, JSON.stringify(data));
          renderProfile(data);
        }
      }).catch(() => {});
      return;
    }

    // No localStorage — try Firestore with timeout
    try {
      const d = await Promise.race([
        getDb(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
      ]);
      const data = await d.getParticipant(user.phone);
      if (data) {
        localStorage.setItem('mapal-rsvp-' + user.phone, JSON.stringify(data));
        renderProfile(data);
        return;
      }
    } catch {}
  }

  renderPhoneEntry();
}
