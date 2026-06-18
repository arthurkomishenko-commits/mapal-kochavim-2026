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
import { siteMode } from '../core/site-mode.js';
let db = null;
async function getDb() {
  if (!db) {
    const mod = await import('../core/db.js');
    db = mod.db;
  }
  return db;
}

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════

// Items with qty: value is a number (0 = not bringing)
// Items without qty: value is boolean
const BRINGING_CATEGORIES = [
  {
    key: 'camp',
    i18n: 'rsvp.bringCatCamp',
    items: [
      { id: 'tarp',       i18n: 'rsvp.bTarp',       qty: true },
      { id: 'chairs',     i18n: 'rsvp.bChairs',     qty: true },
      { id: 'tables',     i18n: 'rsvp.bTables',     qty: true },
    ],
  },
  {
    key: 'cooking',
    i18n: 'rsvp.bringCatCooking',
    items: [
      { id: 'grill',      i18n: 'rsvp.bGrill' },
      { id: 'coal',       i18n: 'rsvp.bCoal' },
      { id: 'firewood',   i18n: 'rsvp.bFirewood' },
      { id: 'cooler',     i18n: 'rsvp.bCooler' },
      { id: 'kettle',     i18n: 'rsvp.bKettle' },
      { id: 'pot',        i18n: 'rsvp.bPot' },
      { id: 'stove',      i18n: 'rsvp.bStove' },
      { id: 'dispDishes', i18n: 'rsvp.bDispDishes' },
    ],
  },
  {
    key: 'tech',
    i18n: 'rsvp.bringCatTech',
    items: [
      { id: 'generator',  i18n: 'rsvp.bGenerator' },
      { id: 'extension',  i18n: 'rsvp.bExtension' },
      { id: 'speakers',   i18n: 'rsvp.bSpeakers' },
      { id: 'projector',  i18n: 'rsvp.bProjector' },
      { id: 'drone',      i18n: 'rsvp.bDrone' },
      { id: 'camera',     i18n: 'rsvp.bCamera' },
    ],
  },
  {
    key: 'stargazing',
    i18n: 'rsvp.bringCatStars',
    items: [
      { id: 'telescope',  i18n: 'rsvp.bTelescope' },
      { id: 'redFlash',   i18n: 'rsvp.bRedFlash',   qty: true },
    ],
  },
  {
    key: 'fun',
    i18n: 'rsvp.bringCatFun',
    items: [
      { id: 'guitar',     i18n: 'rsvp.bGuitar' },
      { id: 'games',      i18n: 'rsvp.bGames' },
      { id: 'ball',       i18n: 'rsvp.bBall' },
    ],
  },
  {
    key: 'safety',
    i18n: 'rsvp.bringCatSafety',
    items: [
      { id: 'firstAid',   i18n: 'rsvp.bFirstAid' },
    ],
  },
  {
    key: 'tools',
    i18n: 'rsvp.bringCatTools',
    items: [
      { id: 'tools',      i18n: 'rsvp.bTools' },
    ],
  },
];

// ═══════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════

let formData = {
  phone: '',
  name: '',
  city: '',
  isDriving: false,
  confirmed: true,
  arrivalDay: '13',
  departureDay: '15',
  kids: 0,
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
    phone: '', name: '', city: '', isDriving: false, confirmed: true, kids: 0, arrivalDay: '13', departureDay: '15',
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

async function handlePhoneSubmit() {
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

  const btn = document.getElementById('rsvp-phone-btn');
  if (btn) { btn.disabled = true; btn.textContent = '...'; }

  // Check localStorage first (instant, works offline)
  const saved = localStorage.getItem('mapal-rsvp-' + phone);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      auth.login(phone, parsed.name);
      window.location.hash = 'me';
      return;
    } catch {}
  }

  // Try Firestore with timeout
  try {
    const d = await Promise.race([
      getDb(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
    ]);
    const existing = await d.getParticipant(phone);
    if (existing) {
      auth.login(phone, existing.name);
      localStorage.setItem('mapal-rsvp-' + phone, JSON.stringify(existing));
      window.location.hash = 'me';
      return;
    }

    // Check if listed as companion
    const link = await d.findCompanionLink(phone);
    if (link) {
      formData.addedByPhone = link.addedByPhone;
      formData.addedByName = link.addedByName;
      formData.name = link.name || '';
    }
  } catch (err) {
    console.warn('Firestore unavailable, continuing offline:', err);
  }

  if (btn) { btn.disabled = false; btn.textContent = i18n.t('rsvp.continue'); }
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

  // ── Confirmed toggle ──
  const confirmSection = document.createElement('div');
  confirmSection.className = 'form-section';
  const confirmToggle = document.createElement('label');
  confirmToggle.id = 'rsvp-confirmed-toggle';
  confirmToggle.className = `form-toggle ${formData.confirmed !== false ? 'form-toggle--active' : ''}`;
  confirmToggle.innerHTML = `
    <span class="form-toggle__track"><span class="form-toggle__thumb"></span></span>
    <span class="form-toggle__label" data-i18n="rsvp.confirmedLabel">${i18n.t('rsvp.confirmedLabel')}</span>
  `;
  confirmToggle.addEventListener('click', (e) => {
    e.preventDefault();
    confirmToggle.classList.toggle('form-toggle--active');
  });
  confirmSection.appendChild(confirmToggle);
  const confirmHint = document.createElement('div');
  confirmHint.className = 'form-section__hint';
  confirmHint.textContent = i18n.t('rsvp.confirmedHint');
  confirmHint.setAttribute('data-i18n', 'rsvp.confirmedHint');
  confirmSection.appendChild(confirmHint);
  inner.appendChild(confirmSection);

  // ── Arrival / Departure days ──
  const daysSection = document.createElement('div');
  daysSection.className = 'form-section';

  const daysTitle = document.createElement('div');
  daysTitle.className = 'form-section__title';
  daysTitle.textContent = i18n.t('rsvp.daysTitle');
  daysTitle.setAttribute('data-i18n', 'rsvp.daysTitle');
  daysSection.appendChild(daysTitle);

  // Arrival
  const arrLabel = document.createElement('div');
  arrLabel.className = 'form-label';
  arrLabel.textContent = i18n.t('rsvp.arrivalLabel');
  arrLabel.setAttribute('data-i18n', 'rsvp.arrivalLabel');
  daysSection.appendChild(arrLabel);

  const arrChips = document.createElement('div');
  arrChips.className = 'chips-grid';
  arrChips.id = 'rsvp-arrival';
  ['13', '14'].forEach(day => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `chip ${formData.arrivalDay === day ? 'chip--active' : ''}`;
    chip.dataset.day = day;
    chip.textContent = `${day} ${i18n.t('rsvp.aug')}`;
    chip.addEventListener('click', () => {
      arrChips.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
      chip.classList.add('chip--active');
    });
    arrChips.appendChild(chip);
  });
  // Default to 13 if nothing selected
  if (!formData.arrivalDay) {
    const first = arrChips.querySelector('.chip');
    if (first) first.classList.add('chip--active');
  }
  daysSection.appendChild(arrChips);

  // Departure
  const depLabel = document.createElement('div');
  depLabel.className = 'form-label';
  depLabel.style.marginBlockStart = '12px';
  depLabel.textContent = i18n.t('rsvp.departureLabel');
  depLabel.setAttribute('data-i18n', 'rsvp.departureLabel');
  daysSection.appendChild(depLabel);

  const depChips = document.createElement('div');
  depChips.className = 'chips-grid';
  depChips.id = 'rsvp-departure';
  ['14', '15'].forEach(day => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `chip ${formData.departureDay === day ? 'chip--active' : ''}`;
    chip.dataset.day = day;
    chip.textContent = `${day} ${i18n.t('rsvp.aug')}`;
    chip.addEventListener('click', () => {
      depChips.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
      chip.classList.add('chip--active');
    });
    depChips.appendChild(chip);
  });
  // Default to 15 if nothing selected
  if (!formData.departureDay) {
    const last = depChips.querySelectorAll('.chip')[1];
    if (last) last.classList.add('chip--active');
  }
  daysSection.appendChild(depChips);

  inner.appendChild(daysSection);

  // ── Driving toggle ──
  const drivingSection = document.createElement('div');
  drivingSection.className = 'form-section';

  const toggle = document.createElement('label');
  toggle.id = 'rsvp-driving-toggle';
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

  // Children counter
  const kidsWrap = document.createElement('div');
  kidsWrap.className = 'chip-qty chip-qty--standalone' + (formData.kids > 0 ? ' chip-qty--active' : '');
  kidsWrap.id = 'rsvp-kids';
  kidsWrap.style.marginBlockStart = '16px';
  kidsWrap.innerHTML = `
    <span class="chip-qty__label" data-i18n="rsvp.kidsLabel">${i18n.t('rsvp.kidsLabel')}</span>
    <span class="chip-qty__controls">
      <button type="button" class="chip-qty__btn" data-dir="-1" aria-label="Remove">\u2212</button>
      <span class="chip-qty__count">${formData.kids || 0}</span>
      <button type="button" class="chip-qty__btn" data-dir="1" aria-label="Add">+</button>
    </span>
  `;
  kidsWrap.querySelectorAll('.chip-qty__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const count = kidsWrap.querySelector('.chip-qty__count');
      let n = parseInt(count.textContent) || 0;
      n = Math.max(0, n + parseInt(btn.dataset.dir));
      count.textContent = n;
      kidsWrap.classList.toggle('chip-qty--active', n > 0);
    });
  });
  compSection.appendChild(kidsWrap);

  inner.appendChild(compSection);

  // ── Bringing (categorized, subtle) ──
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

  BRINGING_CATEGORIES.forEach(cat => {
    const catLabel = document.createElement('div');
    catLabel.className = 'bring-cat-label';
    catLabel.textContent = i18n.t(cat.i18n);
    catLabel.setAttribute('data-i18n', cat.i18n);
    bringSection.appendChild(catLabel);

    const chipsGrid = document.createElement('div');
    chipsGrid.className = 'chips-grid';

    cat.items.forEach(item => {
      const val = formData.bringing[item.id];

      if (item.qty) {
        // Quantity chip with +/-
        const wrap = document.createElement('div');
        wrap.className = `chip-qty ${val ? 'chip-qty--active' : ''}`;
        wrap.dataset.item = item.id;

        const label = document.createElement('span');
        label.className = 'chip-qty__label';
        label.textContent = i18n.t(item.i18n);

        const controls = document.createElement('span');
        controls.className = 'chip-qty__controls';

        const minus = document.createElement('button');
        minus.type = 'button';
        minus.className = 'chip-qty__btn';
        minus.textContent = '\u2212';
        minus.setAttribute('aria-label', 'Remove');

        const count = document.createElement('span');
        count.className = 'chip-qty__count';
        count.textContent = val || 0;

        const plus = document.createElement('button');
        plus.type = 'button';
        plus.className = 'chip-qty__btn';
        plus.textContent = '+';
        plus.setAttribute('aria-label', 'Add');

        minus.addEventListener('click', (e) => {
          e.stopPropagation();
          let n = parseInt(count.textContent) || 0;
          if (n > 0) n--;
          count.textContent = n;
          wrap.classList.toggle('chip-qty--active', n > 0);
        });

        plus.addEventListener('click', (e) => {
          e.stopPropagation();
          let n = parseInt(count.textContent) || 0;
          n++;
          count.textContent = n;
          wrap.classList.add('chip-qty--active');
        });

        controls.appendChild(minus);
        controls.appendChild(count);
        controls.appendChild(plus);

        wrap.appendChild(label);
        wrap.appendChild(controls);
        chipsGrid.appendChild(wrap);
      } else {
        // Simple toggle chip
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `chip ${val ? 'chip--active' : ''}`;
        chip.textContent = i18n.t(item.i18n);
        chip.dataset.item = item.id;
        chip.addEventListener('click', () => chip.classList.toggle('chip--active'));
        chipsGrid.appendChild(chip);
      }
    });

    bringSection.appendChild(chipsGrid);
  });

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
    formData.companions.forEach(c => addCompanionRow(compList, c.name, c.phone, c.confirmed !== false));
  }
}

// ═══════════════════════════════════════════════════
// LIVE STATS — what everyone is bringing (aggregated)
// ═══════════════════════════════════════════════════

// Build a flat id→i18nKey map from categories
const ITEM_I18N = {};
BRINGING_CATEGORIES.forEach(cat => {
  cat.items.forEach(item => { ITEM_I18N[item.id] = item.i18n; });
});

function aggregateBringing() {
  const totals = {};
  // Scan all registrations in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith('mapal-rsvp-')) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data.bringing || data.cancelled) continue;
      for (const [id, val] of Object.entries(data.bringing)) {
        if (!val) continue;
        const n = (typeof val === 'number') ? val : 1;
        totals[id] = (totals[id] || 0) + n;
      }
    } catch {}
  }
  return totals;
}

function renderBringStats(container) {
  const totals = aggregateBringing();
  const entries = Object.entries(totals).filter(([, v]) => v > 0);

  if (entries.length === 0) {
    container.innerHTML = '';
    return;
  }

  const title = document.createElement('div');
  title.className = 'form-section__title';
  title.textContent = i18n.t('rsvp.statsTitle');
  title.setAttribute('data-i18n', 'rsvp.statsTitle');

  const grid = document.createElement('div');
  grid.className = 'bring-stats-grid';

  entries.forEach(([id, count]) => {
    const cell = document.createElement('div');
    cell.className = 'bring-stat';

    const num = document.createElement('span');
    num.className = 'bring-stat__count';
    num.textContent = count;

    const label = document.createElement('span');
    label.className = 'bring-stat__label';
    label.textContent = i18n.t(ITEM_I18N[id] || id);

    cell.appendChild(num);
    cell.appendChild(label);
    grid.appendChild(cell);
  });

  container.innerHTML = '';
  container.appendChild(title);
  container.appendChild(grid);
}

// ═══════════════════════════════════════════════════
// COMPANION ROW
// ═══════════════════════════════════════════════════

function addCompanionRow(list, name = '', phone = '', confirmed = true) {
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

  // Confirmed chip
  const confirmChip = document.createElement('button');
  confirmChip.type = 'button';
  confirmChip.className = `chip companion-confirmed ${confirmed ? 'chip--active' : ''}`;
  confirmChip.textContent = confirmed ? i18n.t('rsvp.confirmedYes') : '?';
  confirmChip.addEventListener('click', () => {
    confirmChip.classList.toggle('chip--active');
    confirmChip.textContent = confirmChip.classList.contains('chip--active')
      ? i18n.t('rsvp.confirmedYes') : '?';
  });
  row.appendChild(confirmChip);

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

async function handleSave() {
  const nameInput = document.getElementById('rsvp-name');
  const cityInput = document.getElementById('rsvp-city');
  const name = nameInput?.value.trim() || '';
  const city = cityInput?.value.trim() || '';
  const isDriving = document.getElementById('rsvp-driving-toggle')?.classList.contains('form-toggle--active') || false;
  const confirmed = document.getElementById('rsvp-confirmed-toggle')?.classList.contains('form-toggle--active') ?? true;
  const arrivalDay = document.querySelector('#rsvp-arrival .chip--active')?.dataset.day || '13';
  const departureDay = document.querySelector('#rsvp-departure .chip--active')?.dataset.day || '15';
  const kids = parseInt(document.querySelector('#rsvp-kids .chip-qty__count')?.textContent) || 0;

  // Validate name
  if (!name) {
    nameInput.classList.add('form-input--error');
    nameInput.focus();
    return;
  }

  // Companions — same gate as primary phone (rsvp.js handlePhoneSubmit +
  // past-mode click handler): normalize, require >=9 digits. A 3-digit
  // junk phone here used to push a malformed entry into companions[] and
  // companionPhones[] that no sweep could reach (companions live inside
  // primary docs, not as top-level mapal-rsvp-* keys). Partial rows
  // (name without phone or vice versa) get an inline error and abort the
  // save so the user can fix the row instead of silently losing it.
  const companions = [];
  const companionPhones = [];
  let companionsValid = true;
  let firstBadCompanionEl = null;
  document.querySelectorAll('.companion-row').forEach(row => {
    const nEl = row.querySelector('.companion-name');
    const pEl = row.querySelector('.companion-phone');
    const n = nEl?.value.trim() || '';
    const p = pEl?.value.trim() || '';
    const conf = row.querySelector('.companion-confirmed')?.classList.contains('chip--active') ?? true;
    // Clear prior error markers on each pass so fixed rows clean up.
    nEl?.classList.remove('form-input--error');
    pEl?.classList.remove('form-input--error');

    if (!n && !p) return;                            // genuinely empty row, ignore
    if (!n || !p) {                                  // half-filled — flag both fields
      if (!n) { nEl?.classList.add('form-input--error'); firstBadCompanionEl ||= nEl; }
      if (!p) { pEl?.classList.add('form-input--error'); firstBadCompanionEl ||= pEl; }
      companionsValid = false;
      return;
    }
    const normalizedP = auth.normalizePhone(p);
    if (normalizedP.length < 9) {
      pEl?.classList.add('form-input--error');
      firstBadCompanionEl ||= pEl;
      companionsValid = false;
      return;
    }
    companions.push({ name: n, phone: normalizedP, confirmed: conf });
    companionPhones.push(normalizedP);
  });
  if (!companionsValid) {
    showToast(i18n.tf('rsvp.companionPhoneInvalid', 'Телефон спутника слишком короткий — проверь номер'), true);
    firstBadCompanionEl?.focus();
    return;
  }

  // Bringing — toggles + quantities
  const bringing = {};
  document.querySelectorAll('.chip').forEach(chip => {
    bringing[chip.dataset.item] = chip.classList.contains('chip--active');
  });
  document.querySelectorAll('.chip-qty').forEach(wrap => {
    const n = parseInt(wrap.querySelector('.chip-qty__count')?.textContent) || 0;
    if (n > 0) bringing[wrap.dataset.item] = n;
  });

  const data = {
    phone: formData.phone,
    name,
    city,
    isDriving,
    confirmed,
    arrivalDay,
    departureDay,
    kids,
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
    data.token = auth.generateToken();
  } else {
    // Preserve existing token
    data.token = auth.getToken() || formData.token || '';
  }

  const saveBtn = document.getElementById('rsvp-save');
  saveBtn.disabled = true;
  saveBtn.textContent = i18n.t('rsvp.saving');

  // Always save to localStorage first (works offline)
  localStorage.setItem('mapal-rsvp-' + data.phone, JSON.stringify(data));
  auth.login(data.phone, data.name, data.token);

  // Firestore sync — non-blocking but no longer silent. If the remote write
  // fails (rules, offline, transient outage) the user sees a soft warning
  // toast so they know to come back later when there's a connection; the
  // localStorage copy keeps the form-flow usable in the meantime.
  getDb()
    .then(d => d.saveParticipant(data))
    .catch(err => {
      console.warn('Firestore saveParticipant failed', err);
      showToast(i18n.tf('rsvp.saveOfflineWarn',
        'Сохранено локально — связь с сервером не прошла. Открой страницу позже, когда будет интернет.'), true);
    });

  // Copy recovery link to clipboard (silent)
  const recoveryUrl = `${location.origin}${location.pathname}#recover/${data.phone}/${data.token}`;
  try { await navigator.clipboard.writeText(recoveryUrl); } catch {}

  // Tell home + any other listeners to invalidate participant caches so
  // a second tab sees this fresh record without a full reload.
  window.dispatchEvent(new CustomEvent('participantschange', { detail: { record: data } }));

  showToast(i18n.t('rsvp.saved'));

  setTimeout(() => {
    window.location.hash = 'me';
  }, 1200);
}

// ═══════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════

export function renderRsvp(container) {
  if (siteMode.is('past')) return renderRsvpPast(container);

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

// ─── Past-mode RSVP: short form for late comers (attendance archive) ──

// Render-time fallback: if i18n.t echoes the key (= missing translation),
// pick the localized fallback so we never show "PAST.RSVP.NAMELABEL" to users.
function pickLabel(key, ru, he) {
  const v = i18n.t(key);
  if (v && v !== key) return v;
  return (i18n.lang === 'he') ? he : ru;
}

function renderRsvpPast(container) {
  container.innerHTML = `
    <section class="page-section">
      <div class="page-section__inner">
        <div class="rsvp-past">
          <div class="rsvp-past__card">
            <h1 class="rsvp-past__title" data-i18n="past.rsvp.title">${i18n.t('past.rsvp.title')}</h1>
            <p class="rsvp-past__sub" data-i18n="past.rsvp.subtitle">${i18n.t('past.rsvp.subtitle')}</p>

            <form class="rsvp-past__form" id="rsvp-past-form" autocomplete="off">
              <div class="rsvp-past__field">
                <label for="rp-name" data-i18n="past.rsvp.nameLabel">${pickLabel('past.rsvp.nameLabel', 'Имя', 'שם')}</label>
                <input id="rp-name" type="text" required maxlength="60" autocomplete="given-name">
              </div>
              <div class="rsvp-past__field">
                <label for="rp-phone" data-i18n="past.rsvp.phoneLabel">${pickLabel('past.rsvp.phoneLabel', 'Телефон', 'טלפון')}</label>
                <input id="rp-phone" type="tel" inputmode="tel" required maxlength="20" pattern="[\\+0-9\\-\\s]+" autocomplete="tel" dir="ltr">
              </div>

              <div class="rsvp-past__choices">
                <button type="button" class="rsvp-past__choice rsvp-past__choice--primary" data-attended="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12.5 11 15.5 16 9.5"/>
                  </svg>
                  <span data-i18n="past.rsvp.wasThere">${i18n.t('past.rsvp.wasThere')}</span>
                </button>
                <button type="button" class="rsvp-past__choice" data-attended="false">
                  <span data-i18n="past.rsvp.wasntThere">${i18n.t('past.rsvp.wasntThere')}</span>
                </button>
              </div>

              <p class="rsvp-past__hint" data-i18n="past.rsvp.simpleHint">${i18n.t('past.rsvp.simpleHint')}</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;

  const form = container.querySelector('#rsvp-past-form');
  form.addEventListener('submit', e => e.preventDefault());
  const choices = [...container.querySelectorAll('.rsvp-past__choice')];
  choices.forEach(btn => {
    btn.addEventListener('click', async () => {
      const nameEl  = container.querySelector('#rp-name');
      const phoneEl = container.querySelector('#rp-phone');
      const name    = nameEl.value.trim();
      const phoneRaw = phoneEl.value.trim();

      // Clear any prior error state from a previous attempt.
      nameEl.classList.remove('form-input--error');
      phoneEl.classList.remove('form-input--error');

      // Name — non-empty (already required, but trim catches whitespace-only).
      if (!name) {
        nameEl.classList.add('form-input--error');
        nameEl.focus();
        return;
      }

      // Phone — normalize and require an Israeli-mobile-ish length. Same gate
      // as pre-event handlePhoneSubmit (rsvp.js:208) and as me.js phone
      // lookup. Without this, a 3-digit "121" used to slip through to
      // localStorage and live forever as a ghost on the home list (the
      // "1212" incident on 2026-06-19).
      const phone = auth.normalizePhone(phoneRaw);
      if (phone.length < 9) {
        phoneEl.classList.add('form-input--error');
        phoneEl.focus();
        return;
      }

      const attended = btn.dataset.attended === 'true';

      // Disable all buttons while we save — prevents double-clicks and shows progress.
      choices.forEach(b => b.disabled = true);
      btn.classList.add('rsvp-past__choice--busy');
      const label = btn.querySelector('span');
      const savedLabel = label ? label.textContent : '';
      if (label) label.textContent = i18n.tf('past.rsvp.saving', 'Сохраняю…');

      try {
        await saveLateRegistration({ name, phone, attended });
        btn.classList.remove('rsvp-past__choice--busy');
        btn.classList.add('rsvp-past__choice--done');
        if (label) label.textContent = i18n.tf('past.rsvp.saved', 'Готово ✓');
        // Short success pause, then redirect.
        setTimeout(() => { window.location.hash = 'gallery'; }, 600);
      } catch (err) {
        console.error('late RSVP save failed', err);
        btn.classList.remove('rsvp-past__choice--busy');
        choices.forEach(b => b.disabled = false);
        if (label) label.textContent = savedLabel;
        showToast(i18n.tf('past.rsvp.saveError',
          'Сохранить не удалось. Попробуй ещё раз или обнови страницу.'), true);
      }
    });
  });
}

async function saveLateRegistration({ name, phone, attended }) {
  // Defensive normalize at function boundary — the click handler in
  // renderRsvpPast already validates and normalizes, but any future caller
  // (programmatic, console, refactor) that passes a raw phone here would
  // otherwise create a duplicate-keyed localStorage entry under a non-
  // canonical key. This guarantees a single canonical key per identity.
  phone = auth.normalizePhone(phone);
  if (!name || !name.trim() || phone.length < 9) {
    throw new Error('saveLateRegistration: invalid name/phone');
  }
  name = name.trim();

  // Read any prior record for this phone — pre-event RSVP may have stored
  // companions / bringing / kids / driving info that we MUST NOT wipe.
  let prior = {};
  try {
    const raw = localStorage.getItem('mapal-rsvp-' + phone);
    if (raw) prior = JSON.parse(raw) || {};
  } catch {}

  // Use the crypto token generator (same as the main flow) — not Math.random.
  // Keep the existing token if any so the user can still log in cleanly.
  const token = prior.token || (auth.generateToken
    ? auth.generateToken()
    : [...crypto.getRandomValues(new Uint8Array(24))]
        .map(b => b.toString(36)).join('').slice(0, 32));

  // Merge: keep all pre-existing fields, overwrite ONLY what late RSVP knows.
  const record = {
    ...prior,
    name,
    phone,
    token,
    confirmed:        attended,    // attended → goes into "Кто был"
    cancelled:        false,
    lateRegistration: true,
    createdAt:        prior.createdAt || new Date().toISOString(),
    updatedAt:        new Date().toISOString(),
  };

  try {
    localStorage.setItem('mapal-rsvp-' + phone, JSON.stringify(record));
    // Only log in attendees — "Жаль не смог" stays anonymous (no gallery upload right).
    if (attended) auth.login(phone, name, token);
  } catch {}
  // Tell the rest of the UI to refresh participant-derived widgets.
  window.dispatchEvent(new CustomEvent('participantschange', { detail: { record } }));
  try {
    const mod = await import('../core/db.js');
    await mod.db.saveParticipant(record);
  } catch (err) {
    console.warn('Firestore save failed, local-only', err);
  }
}
