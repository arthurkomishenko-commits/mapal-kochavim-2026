/**
 * Observe page — what to look at through an amateur telescope during the camp.
 *
 * Curated to 4 objects that are confidently visible from Borot Lotz on the
 * night of 12→13 Aug 2026 (new moon, Bortle 1-2):
 *   - Saturn (rings, near opposition)
 *   - Jupiter (Galilean moons, morning sky)
 *   - M31 Andromeda (naked-eye galaxy, near zenith after midnight)
 *   - Albireo (high-contrast colour double, summer zenith)
 *
 * Photo hosts are Wikimedia Commons thumbnails (stable, CC-licensed). If a
 * photo fails to load we fall back to a styled placeholder.
 *
 * Translation keys live under `observe.*` in ru/he locales.
 */

import { i18n } from '../core/i18n.js';

// ─── Object catalog ──────────────────────────────────────────────────
// `key` maps to i18n keys: observe.objects.{key}.{name,type,see,when,where,find,tip}
// `photo` is a hotlinked Wikimedia thumbnail (TODO: rehost into
// public/images/observe/ once we lock the page down).
const OBJECTS = [
  {
    key: 'saturn',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/640px-Saturn_during_Equinox.jpg',
    photoCredit: 'NASA / Cassini',
  },
  {
    key: 'm13',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Messier_13_by_NASA.jpg/640px-Messier_13_by_NASA.jpg',
    photoCredit: 'NASA / Hubble',
  },
  {
    key: 'andromeda',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg/640px-Andromeda_Galaxy_%28with_h-alpha%29.jpg',
    photoCredit: 'Adam Evans / CC BY 2.0',
  },
  {
    key: 'albireo',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Albireo.jpg/640px-Albireo.jpg',
    photoCredit: 'Hewholooks / CC BY-SA 3.0',
  },
];

// Translation helper: i18n.t returns the key itself on miss (truthy), so the
// `|| fallback` pattern silently swallows missing keys. This helper makes
// "missing = falsy" so fallbacks actually fire.
function t(key, fallback = '') {
  const v = i18n.t(key);
  return (v && v !== key) ? v : fallback;
}

// ─── Render ──────────────────────────────────────────────────────────

export function renderObserve(container) {
  container.innerHTML = `
    <section class="page-section" aria-labelledby="observe-title">
      <div class="page-section__inner">

        <h1 id="observe-title" class="page-section__title" data-i18n="observe.title">
          ${t('observe.title', 'Через окуляр')}
        </h1>
        <p class="page-section__subtitle" data-i18n="observe.subtitle">
          ${t('observe.subtitle', 'Что точно видно в любительский телескоп в ночь 12→13 августа из Borot Lotz')}
        </p>

        <p class="observe__intro" data-i18n="observe.intro">${t('observe.intro',
          'Подборка короткая — четыре объекта, у которых небо в этот раз действительно складывается. По каждому: что увидишь, куда повернуть и как не промахнуться без навыка.')}</p>

        <div class="observe__list">
          ${OBJECTS.map(renderCard).join('')}
        </div>

        ${renderTips()}

      </div>
    </section>
  `;
}

// ─── Card ────────────────────────────────────────────────────────────

function renderCard(obj) {
  const base = `observe.objects.${obj.key}`;
  // Inline SVG fallback (single chunk, no extra request) shown if the
  // Wikimedia thumb fails to load.
  const fallback = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="#1a1f3a" stroke="#3a4575" stroke-width="1"/><circle cx="32" cy="32" r="2" fill="#7585bb"/></svg>`
  )}`;
  return `
    <article class="obs-card">
      <div class="obs-card__photo">
        <img src="${obj.photo}" alt="${t(`${base}.name`, obj.key)}" loading="lazy"
             onerror="this.onerror=null;this.src='${fallback}';this.classList.add('obs-card__photo--fallback')">
        <span class="obs-card__credit">${obj.photoCredit}</span>
      </div>
      <div class="obs-card__body">
        <h2 class="obs-card__name" data-i18n="${base}.name">${t(`${base}.name`, obj.key)}</h2>
        <p class="obs-card__type text-tertiary" data-i18n="${base}.type">${t(`${base}.type`, '')}</p>
        <p class="obs-card__see" data-i18n="${base}.see">${t(`${base}.see`, '')}</p>
        <dl class="obs-card__meta">
          <div>
            <dt data-i18n="observe.when">${t('observe.when', 'Когда')}</dt>
            <dd data-i18n="${base}.when">${t(`${base}.when`, '')}</dd>
          </div>
          <div>
            <dt data-i18n="observe.where">${t('observe.where', 'Где')}</dt>
            <dd data-i18n="${base}.where">${t(`${base}.where`, '')}</dd>
          </div>
          <div>
            <dt data-i18n="observe.find">${t('observe.find', 'Как найти')}</dt>
            <dd data-i18n="${base}.find">${t(`${base}.find`, '')}</dd>
          </div>
        </dl>
        <p class="obs-card__tip text-secondary" data-i18n="${base}.tip">${t(`${base}.tip`, '')}</p>
      </div>
    </article>
  `;
}

// ─── Tips / footer ───────────────────────────────────────────────────

function renderTips() {
  return `
    <aside class="observe__tips">
      <h2 class="observe__tips-title" data-i18n="observe.tipsTitle">${t('observe.tipsTitle', 'Перед окуляром')}</h2>
      <ul class="observe__tips-list">
        <li data-i18n="observe.tips.darkAdapt">${t('observe.tips.darkAdapt', '20 минут без яркого света — глаза адаптируются и слабые объекты проявляются.')}</li>
        <li data-i18n="observe.tips.redLight">${t('observe.tips.redLight', 'Только красный свет: режим в фонарике или плёнка на телефоне. Белый свет сбивает адаптацию за секунду.')}</li>
        <li data-i18n="observe.tips.stellarium">${t('observe.tips.stellarium', 'Stellarium Mobile (бесплатно) или SkyView — наведи телефон в небо, приложение покажет, что там.')}</li>
        <li data-i18n="observe.tips.handAngles">${t('observe.tips.handAngles', 'На вытянутой руке: мизинец ≈ 1°, кулак ≈ 10°, растянутая ладонь от мизинца до большого ≈ 20°. Работает у всех — пропорции руки и плеча одинаковые.')}</li>
        <li data-i18n="observe.tips.venusBonus">${t('observe.tips.venusBonus', 'Сразу после заката (19:25–21:29 IDT) на западе видна Венера — самый яркий объект на небе после Луны. В телескоп — белый полудиск без деталей, но как ориентир «вечер начался» работает хорошо.')}</li>
        <li data-i18n="observe.tips.noJupiter">${t('observe.tips.noJupiter', 'Юпитера и Меркурия в эти ночи практически нет — они слишком близко к Солнцу и восходят уже на рассвете. Зато Сатурн отлично виден всю ночь.')}</li>
        <li data-i18n="observe.tips.scope">${t('observe.tips.scope', 'Свой телескоп — отлично. Если нет, Роберт привезёт Skywatcher, посмотрим по очереди.')}</li>
      </ul>
    </aside>
  `;
}
