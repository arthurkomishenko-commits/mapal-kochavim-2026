/**
 * RSVP page — phone-based registration
 *
 * Flow:
 * 1. Phone entry → check if exists
 * 2. If exists → load data, show form pre-filled
 * 3. If not → check if listed as companion → show form
 * 4. Single-page form: name, city, driving?, companions, bringing
 * 5. Save → localStorage (+ Firestore when connected) → redirect to #me
 */

import { i18n } from '../core/i18n.js';
import { auth } from '../core/auth.js';

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════

const BRINGING_ITEMS = [
  'tent', 'firewood', 'coal', 'grill',
  'cooler', 'telescope', 'guitar', 'speakers', 'firstAid'
];

const BRINGING_KEYS = {
  tent: 'rsvp.bringingTent',
  firewood: 'rsvp.bringingFirewood',
  coal: 'rsvp.bringingCoal',
  grill: 'rsvp.bringingGrill',
  cooler: 'rsvp.bringingCooler',
  telescope: 'rsvp.bringingTelescope',
  guitar: 'rsvp.bringingGuitar',
  speakers: 'rsvp.bringSpeakers',
  firstAid: 'rsvp.bringingFirstAid',
};

// ═══════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════

let formData = {
  phone: '',
  name: '',
  city: '',
  isDriving: false,
  companions: [],
  bringing: {},
  addedByPhone: null,
  addedByName: null,
};

let isEditing = false;
let containerEl = null;

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function resetState() {
  formData = {
    phone: '', name: '', city: '', isDriving: false,
    companions: [], bringing: {},
    addedByPhone: null, addedByName: null,
  };
  isEditing = false;
}

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

// ═══════════════════════════════════════════════════
// PHONE ENTRY SCREEN
// ═══════════════════════════════════════════════════

function renderPhoneEntry() {
  containerEl.innerHTML = `
    <section class="page-section" aria-labelledby="rsvp-title">
      <div class="page-section__inner">
        <h1 id="rsvp-title" class="page-section__title" data-i18n="rsvp.title">
          ${i18n.t('rsvp.title')}
        </h1>
        <p class="page-section__subtitle" data-i18n="rsvp.subtitle">
          ${i18n.t('rsvp.subtitle')}
        </p>

        <div class="phone-entry">
          <div class="form-group">
            <label class="form-label" for="rsvp-phone" data-i18n="rsvp.phoneLabel">
              ${i18n.t('rsvp.phoneLabel')}
            </label>
            <input
              type="tel"
              class="form-input"
              id="rsvp-phone"
              placeholder="${i18n.t('rsvp.phonePlaceholder')}"
              autocomplete="tel"
              inputmode="tel"
            >
            <p class="form-hint" data-i18n="rsvp.phoneHelp">${i18n.t('rsvp.phoneHelp')}</p>
          </div>
          <button type="button" class="form-submit" id="rsvp-phone-btn" data-i18n="rsvp.continue">
            ${i18n.t('rsvp.continue')}
          </button>
        </div>
      </div>
    </section>
  `;

  const user = auth.getUser();
  if (user && user.phone) {
    document.getElementById('rsvp-phone').value = user.phone;
  }

  document.getElementById('rsvp-phone-btn').addEventListener('click', handlePhoneSubmit);
  document.getElementById('rsvp-phone').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handlePhoneSubmit();
  });
}

function handlePhoneSubmit() {
  const input = document.getElementById('rsvp-phone');
  const raw = input.value.trim();

  if (!raw) {
    input.classList.add('form-input--error');
    return;
  }

  const phone = auth.normalizePhone(raw);
  if (phone.length < 9) {
    input.classList.add('form-input--error');
    return;
  }

  input.classList.remove('form-input--error');
  formData.phone = phone;

  // Check localStorage for existing registration
  const saved = localStorage.getItem('mapal-rsvp-' + phone);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      formData = { ...formData, ...parsed, phone };
      isEditing = true;
    } catch {}
  }

  // TODO: When Firebase connected — check Firestore + companion links

  renderForm();
}

// ═══════════════════════════════════════════════════
// MAIN FORM
// ═══════════════════════════════════════════════════

function renderForm() {
  containerEl.innerHTML = '';

  const section = document.createElement('section');
  section.className = 'page-section';
  section.setAttribute('aria-labelledby', 'rsvp-title');

  const inner = document.createElement('div');
  inner.className = 'page-section__inner';

  // Title
  const title = document.createElement('h1');
  title.id = 'rsvp-title';
  title.className = 'page-section__title';
  title.textContent = i18n.t('rsvp.title');
  title.setAttribute('data-i18n', 'rsvp.title');
  inner.appendChild(title);

  // Added-by banner
  if (formData.addedByName) {
    const banner = document.createElement('div');
    banner.className = 'added-by-banner';
    banner.textContent = `${formData.addedByName} ${i18n.t('rsvp.addedBy')}`;
    inner.appendChild(banner);
  }

  // ── Name ──
  const nameGroup = document.createElement('div');
  nameGroup.className = 'form-group';
  nameGroup.innerHTML = `
    <label class="form-label" for="rsvp-name" data-i18n="rsvp.nameLabel">${i18n.t('rsvp.nameLabel')}</label>
    <input type="text" class="form-input" id="rsvp-name"
      placeholder="${i18n.t('rsvp.namePlaceholder')}" required>
  `;
  inner.appendChild(nameGroup);

  // ── City ──
  const cityGroup = document.createElement('div');
  cityGroup.className = 'form-group';
  cityGroup.innerHTML = `
    <label class="form-label" for="rsvp-city" data-i18n="rsvp.cityLabel">${i18n.t('rsvp.cityLabel')}</label>
    <input type="text" class="form-input" id="rsvp-city"
      placeholder="${i18n.t('rsvp.cityPlaceholder')}">
  `;
  inner.appendChild(cityGroup);

  // ── Driving toggle ──
  const drivingSection = document.createElement('div');
  drivingSection.className = 'form-section';

  const toggle = document.createElement('label');
  toggle.className = `form-toggle ${formData.isDriving ? 'form-toggle--active' : ''}`;
  toggle.innerHTML = `
    <span class="form-toggle__track"><span class="form-toggle__thumb"></span></span>
    <span class="form-toggle__label" data-i18n="rsvp.drivingLabel">${i18n.t('rsvp.drivingLabel')}</span>
  `;
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    toggle.classList.toggle('form-toggle--active');
  });
  drivingSection.appendChild(toggle);
  inner.appendChild(drivingSection);

  // ── Companions ──
  const compSection = document.createElement('div');
  compSection.className = 'form-section';

  const compTitle = document.createElement('div');
  compTitle.className = 'form-section__title';
  compTitle.textContent = i18n.t('rsvp.companionsTitle');
  compTitle.setAttribute('data-i18n', 'rsvp.companionsTitle');
  compSection.appendChild(compTitle);

  const compHint = document.createElement('div');
  compHint.className = 'form-section__hint';
  compHint.textContent = i18n.t('rsvp.companionsHelp');
  compHint.setAttribute('data-i18n', 'rsvp.companionsHelp');
  compSection.appendChild(compHint);

  const compList = document.createElement('div');
  compList.id = 'companions-list';
  compSection.appendChild(compList);

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'form-add-btn';
  addBtn.textContent = '+ ' + i18n.t('rsvp.addCompanion');
  addBtn.addEventListener('click', () => addCompanionRow(compList));
  compSection.appendChild(addBtn);

  inner.appendChild(compSection);

  // ── Bringing (subtle) ──
  const bringSection = document.createElement('div');
  bringSection.className = 'form-section';

  const bringTitle = document.createElement('div');
  bringTitle.className = 'form-section__title';
  bringTitle.textContent = i18n.t('rsvp.bringingTitle');
  bringTitle.setAttribute('data-i18n', 'rsvp.bringingTitle');
  bringSection.appendChild(bringTitle);

  const bringHint = document.createElement('div');
  bringHint.className = 'form-section__hint';
  bringHint.textContent = i18n.t('rsvp.bringingHelp');
  bringHint.setAttribute('data-i18n', 'rsvp.bringingHelp');
  bringSection.appendChild(bringHint);

  const chipsGrid = document.createElement('div');
  chipsGrid.className = 'chips-grid';
  BRINGING_ITEMS.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `chip ${formData.bringing[item] ? 'chip--active' : ''}`;
    chip.textContent = i18n.t(BRINGING_KEYS[item]);
    chip.dataset.item = item;
    chip.addEventListener('click', () => chip.classList.toggle('chip--active'));
    chipsGrid.appendChild(chip);
  });
  bringSection.appendChild(chipsGrid);
  inner.appendChild(bringSection);

  // ── Save ──
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'form-submit';
  saveBtn.id = 'rsvp-save';
  saveBtn.textContent = i18n.t('rsvp.save');
  saveBtn.setAttribute('data-i18n', 'rsvp.save');
  saveBtn.addEventListener('click', handleSave);
  inner.appendChild(saveBtn);

  section.appendChild(inner);
  containerEl.appendChild(section);

  // Fill values
  const nameInput = document.getElementById('rsvp-name');
  const cityInput = document.getElementById('rsvp-city');
  if (nameInput && formData.name) nameInput.value = formData.name;
  if (cityInput && formData.city) cityInput.value = formData.city;

  // Populate companions
  if (formData.companions && formData.companions.length > 0) {
    formData.companions.forEach(c => addCompanionRow(compList, c.name, c.phone));
  }
}

// ═══════════════════════════════════════════════════
// COMPANION ROW
// ═══════════════════════════════════════════════════

function addCompanionRow(list, name = '', phone = '') {
  const row = document.createElement('div');
  row.className = 'companion-row';

  const nameGroup = document.createElement('div');
  nameGroup.className = 'form-group';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'form-input companion-name';
  nameInput.placeholder = i18n.t('rsvp.companionName');
  nameInput.value = name;
  nameGroup.appendChild(nameInput);
  row.appendChild(nameGroup);

  const phoneGroup = document.createElement('div');
  phoneGroup.className = 'form-group';
  const phoneInput = document.createElement('input');
  phoneInput.type = 'tel';
  phoneInput.inputMode = 'tel';
  phoneInput.className = 'form-input companion-phone';
  phoneInput.placeholder = i18n.t('rsvp.companionPhone');
  phoneInput.value = phone;
  phoneInput.style.direction = 'ltr';
  phoneGroup.appendChild(phoneInput);
  row.appendChild(phoneGroup);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'companion-remove';
  removeBtn.innerHTML = '&times;';
  removeBtn.setAttribute('aria-label', i18n.t('rsvp.removeCompanion'));
  removeBtn.addEventListener('click', () => row.remove());
  row.appendChild(removeBtn);

  list.appendChild(row);
}

// ═══════════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════════

function handleSave() {
  const nameInput = document.getElementById('rsvp-name');
  const cityInput = document.getElementById('rsvp-city');
  const name = nameInput?.value.trim() || '';
  const city = cityInput?.value.trim() || '';
  const isDriving = document.querySelector('.form-toggle')?.classList.contains('form-toggle--active') || false;

  // Validate name
  if (!name) {
    nameInput.classList.add('form-input--error');
    nameInput.focus();
    return;
  }

  // Companions
  const companions = [];
  const companionPhones = [];
  document.querySelectorAll('.companion-row').forEach(row => {
    const n = row.querySelector('.companion-name')?.value.trim() || '';
    const p = row.querySelector('.companion-phone')?.value.trim() || '';
    if (n && p) {
      const normalizedP = auth.normalizePhone(p);
      companions.push({ name: n, phone: normalizedP });
      companionPhones.push(normalizedP);
    }
  });

  // Bringing
  const bringing = {};
  document.querySelectorAll('.chip').forEach(chip => {
    bringing[chip.dataset.item] = chip.classList.contains('chip--active');
  });

  const data = {
    phone: formData.phone,
    name,
    city,
    isDriving,
    companions,
    companionPhones,
    bringing,
    addedByPhone: formData.addedByPhone,
    addedByName: formData.addedByName,
    updatedAt: new Date().toISOString(),
    cancelled: false,
  };

  if (!isEditing) {
    data.createdAt = new Date().toISOString();
  }

  const saveBtn = document.getElementById('rsvp-save');
  saveBtn.disabled = true;
  saveBtn.textContent = i18n.t('rsvp.saving');

  try {
    // TODO: Save to Firestore when Firebase is connected
    // await db.saveParticipant(data);

    // Save to localStorage
    localStorage.setItem('mapal-rsvp-' + data.phone, JSON.stringify(data));

    // Login
    auth.login(data.phone, data.name);

    showToast(i18n.t('rsvp.saved'));

    setTimeout(() => {
      window.location.hash = 'me';
    }, 1200);

  } catch (err) {
    console.error('Save failed:', err);
    saveBtn.disabled = false;
    saveBtn.textContent = i18n.t('rsvp.save');
    showToast(i18n.t('common.error'), true);
  }
}

// ═══════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════

export function renderRsvp(container) {
  containerEl = container;
  resetState();

  const user = auth.getUser();
  if (user && user.phone) {
    formData.phone = user.phone;
    const saved = localStorage.getItem('mapal-rsvp-' + user.phone);
    if (saved) {
      try {
        formData = { ...formData, ...JSON.parse(saved), phone: user.phone };
        isEditing = true;
      } catch {}
    }
    renderForm();
  } else {
    renderPhoneEntry();
  }
}
