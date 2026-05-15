/**
 * Me page — personal dashboard
 * Shows registration data, allows editing, cancel registration.
 */

import { i18n } from '../core/i18n.js';
import { auth } from '../core/auth.js';
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

  let data = null;
  try {
    const d1 = await getDb(); data = await d1.getParticipant(phone);
  } catch {
    // Fallback to localStorage
    const saved = localStorage.getItem('mapal-rsvp-' + phone);
    if (saved) data = JSON.parse(saved);
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
            <span class="me-field__value">${data.arrivalDay || '13'} – ${data.departureDay || '15'} ${i18n.t('rsvp.aug')}</span>
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
    try {
      const d = await getDb();
      const data = await d.getParticipant(user.phone);
      if (data) {
        localStorage.setItem('mapal-rsvp-' + user.phone, JSON.stringify(data));
        renderProfile(data);
        return;
      }
    } catch {
      // Fallback to localStorage
      const saved = localStorage.getItem('mapal-rsvp-' + user.phone);
      if (saved) {
        try {
          renderProfile(JSON.parse(saved));
          return;
        } catch {}
      }
    }
  }

  renderPhoneEntry();
}
