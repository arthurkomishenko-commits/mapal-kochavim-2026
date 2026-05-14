/**
 * Me page — personal dashboard
 * Shows registration data, allows editing, cancel registration.
 */

import { i18n } from '../core/i18n.js';
import { auth } from '../core/auth.js';

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

function handlePhoneLookup() {
  const input = document.getElementById('me-phone');
  const raw = input.value.trim();
  if (!raw) { input.classList.add('form-input--error'); return; }

  const phone = auth.normalizePhone(raw);
  if (phone.length < 9) { input.classList.add('form-input--error'); return; }

  const saved = localStorage.getItem('mapal-rsvp-' + phone);
  if (!saved) {
    renderNotFound();
    return;
  }

  try {
    const data = JSON.parse(saved);
    auth.login(phone, data.name);
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
            <span class="me-field__label" data-i18n="rsvp.drivingLabel">${i18n.t('rsvp.drivingLabel')}</span>
            <span class="me-field__value">${data.isDriving ? i18n.t('rsvp.drivingYes') : i18n.t('rsvp.drivingNo')}</span>
          </div>
        </div>

        ${companionsHtml}
        ${bringingHtml}

        <a href="#rsvp" class="form-submit" style="display:block;text-align:center;text-decoration:none;margin-top:24px;">
          ${i18n.t('rsvp.save').replace(i18n.t('rsvp.save'), isEditing())}
        </a>

        ${!isCancelled ? `
        <button type="button" class="form-cancel-link" id="me-cancel">
          ${i18n.t('me.cancelRegistration')}
        </button>
        ` : ''}

        <button type="button" class="form-cancel-link" id="me-logout" style="color:rgba(165,160,154,0.3);">
          ${i18n.t('common.logout')}
        </button>
      </div>
    </section>
  `;

  // Cancel handler
  const cancelBtn = document.getElementById('me-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      data.cancelled = true;
      data.updatedAt = new Date().toISOString();
      localStorage.setItem('mapal-rsvp-' + data.phone, JSON.stringify(data));
      showToast(i18n.t('me.cancelled'));
      renderProfile(data);
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
}

// Escape HTML for safe rendering
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

// Helper to determine edit button text
function isEditing() {
  return i18n.t('rsvp.save');
}

export function renderMe(container) {
  containerEl = container;

  const user = auth.getUser();
  if (user && user.phone) {
    const saved = localStorage.getItem('mapal-rsvp-' + user.phone);
    if (saved) {
      try {
        renderProfile(JSON.parse(saved));
        return;
      } catch {}
    }
  }

  renderPhoneEntry();
}
