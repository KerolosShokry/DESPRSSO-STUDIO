(() => {
'use strict';

/* ==========================================================================
   CONFIG & FALLBACK DATA (DESPRESSO STUDIO)
   ========================================================================== */
let CONFIG = {
  discord: 'https://discord.gg/dA4Eh8teJb',
  youtube: 'https://www.youtube.com/@Despresso.Gaming',
  brandName: 'DESPRESSO STUDIO',
  tagline: 'INDEPENDENT GAMES. DISTINCT WORLDS.',
  subtext: 'Fueled by creativity and late-night ideas. We create original indie games, immersive interactive experiences, and worlds worth getting lost in.'
};

// Public releases are free. Add a real downloadUrl when a build is ready.
let PRODUCTS = [
  {
    id: 'game_tic_tac_toe',
    name: 'Tic Tac Toe',
    category: 'Strategy',
    description: 'A polished take on the classic X-and-O game, with quick matches and a clean, responsive 2D presentation.',
    image: 'tic-tac-toe-cover.png',
    badge: 'PLAY IN BROWSER',
    available: true,
    actions: [
      { label: 'PLAY NOW', url: 'https://despresso-studio.itch.io/tic-tac-toe-game' },
      { label: 'GITHUB', url: 'https://github.com/KerolosShokry/Tic-Tac-Toe-Game' }
    ],
    features: ['Browser play on PC and mobile', 'Two-player matches', 'Windows and Android builds available']
  },
  {
    id: 'game_tricky_bird',
    name: 'Tricky Bird',
    category: 'Arcade',
    description: 'A fast-paced arcade challenge where precise timing and quick reactions help a little bird navigate a field of obstacles.',
    image: 'tricky-bird-cover.jpg',
    badge: 'FREE GAME',
    available: true,
    actions: [
      { label: 'WINDOWS BUILD', url: 'https://github.com/KerolosShokry/Tricky-Bird/tree/main/Exe' },
      { label: 'SOURCE CODE', url: 'https://github.com/KerolosShokry/Tricky-Bird/tree/main/Source%20Code' }
    ],
    features: ['Responsive jump controls', 'Obstacle and collision challenges', 'Local high-score tracking']
  }
];


// Keep the supplied cover art consistent in both the catalog and quick-view,
// even when product metadata is refreshed from the remote dashboard.
function getProductImage(game) {
  const id = String(game?.id || '').toLowerCase();
  const name = String(game?.name || '').toLowerCase();
  if (id === 'game_tic_tac_toe' || /\btic\s*tac\s*toe\b/.test(name)) return 'tic-tac-toe-cover.png';
  if (id === 'game_tricky_bird' || /\btricky\s*bird\b/.test(name)) return 'tricky-bird-cover.jpg';
  return game?.image || 'assets/favicon.svg';
}

function getProductCoverClass(game) {
  const id = String(game?.id || '').toLowerCase();
  const name = String(game?.name || '').toLowerCase();
  if (id === 'game_tic_tac_toe' || /\btic\s*tac\s*toe\b/.test(name)) return 'tic-tac-toe-cover';
  if (id === 'game_tricky_bird' || /\btricky\s*bird\b/.test(name)) return 'tricky-bird-cover';
  return '';
}

let DOWNLOADS = [
  {
    id: 'dl_tic_tac_toe',
    name: 'Tic Tac Toe — Latest Builds',
    category: 'Games',
    version: 'v2.0.0',
    size: '',
    status: 'Available',
    url: 'https://github.com/KerolosShokry/Tic-Tac-Toe-Game/releases/latest',
    notes: 'Choose the Windows or Android build from Releases, or play the HTML5 version directly in your browser.'
  },
  {
    id: 'dl_tricky_bird',
    name: 'Tricky Bird — Windows Build',
    category: 'Games',
    version: '',
    size: '',
    status: 'Available',
    url: 'https://github.com/KerolosShokry/Tricky-Bird/tree/main/Exe',
    notes: 'Open the Exe folder in the project repository to access the available Windows game files.'
  }
];

const cleanStudioCopy = value => String(value ?? '')
  .replace(/\s{2,}/g, ' ')
  .replace(/\s+([.,])/g, '$1')
  .trim();

const hasLegacyToolReference = value => /\b(?:godot|love\s?2d|gdscript)\b|\b(?:templates?|shaders?|asset packs?|starter frameworks?)\b/i.test(String(value ?? ''));

const normalizeGame = game => {
  const rawCopy = [game.name, game.category, game.description, ...(Array.isArray(game.features) ? game.features : [])].join(' ');
  if (hasLegacyToolReference(rawCopy)) return null;
  const item = { ...game };
  ['name', 'category', 'description', 'badge'].forEach(key => {
    if (item[key] != null) item[key] = cleanStudioCopy(item[key]);
  });
  if (Array.isArray(item.features)) item.features = item.features.map(cleanStudioCopy);
  if (Array.isArray(item.actions)) {
    item.actions = item.actions.filter(action => action && /^https?:\/\//i.test(action.url || '')).map(action => ({
      label: cleanStudioCopy(action.label || 'OPEN'),
      url: action.url
    }));
  }
  item.downloadUrl = item.downloadUrl || item.download_url || item.downloadLink || item.download_link || item.fileUrl || item.file_url || item.url || '';
  if (/^https?:\/\/(?:www\.)?github\.com\/?$/i.test(item.downloadUrl)) item.downloadUrl = '';
  delete item.price;
  delete item.currency;
  return item;
};

const normalizeRelease = release => {
  const rawCopy = [release.name, release.category, release.notes].join(' ');
  if (hasLegacyToolReference(rawCopy)) return null;
  const url = release.url || release.downloadUrl || release.download_url || '';
  return {
    ...release,
    name: cleanStudioCopy(release.name),
    category: cleanStudioCopy(release.category || 'Release'),
    notes: cleanStudioCopy(release.notes || ''),
    url: /^https?:\/\/(?:www\.)?github\.com\/?$/i.test(url) ? '' : url
  };
};

const gameDownloadUrl = game => game.downloadUrl || game.download_url || game.fileUrl || game.file_url || '';

const getProjectActions = game => {
  const actions = Array.isArray(game.actions)
    ? game.actions.filter(action => action && /^https?:\/\//i.test(action.url || ''))
    : [];
  if (actions.length) return actions.slice(0, 2);
  const fallbackUrl = gameDownloadUrl(game);
  return game.available !== false && fallbackUrl
    ? [{ label: cleanStudioCopy(game.downloadLabel || 'DOWNLOAD'), url: fallbackUrl }]
    : [];
};


// Active filters
let activeShopCategory = 'all';
let activeDlCategory = 'all';
let shopSearchQuery = '';
let dlSearchQuery = '';

// DOM Helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function h(tag, attrs = {}, kids = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  [].concat(kids).forEach(c => c && e.append(c));
  return e;
}

let currentVisitorCount = 0;

function updateVisitorDisplay(count, animate = false) {
  if (count === null || count === undefined || isNaN(count)) return;
  const num = Number(count);
  const numFormatted = num.toLocaleString();
  const heroEl = $('#heroVisitorCount');
  const statEl = $('#statVisitorVal');

  if (heroEl) {
    heroEl.textContent = numFormatted;
    if (animate && currentVisitorCount !== num) {
      heroEl.classList.remove('counter-pop');
      void heroEl.offsetWidth;
      heroEl.classList.add('counter-pop');
    }
  }

  if (statEl) {
    statEl.textContent = numFormatted;
    if (animate && currentVisitorCount !== num) {
      statEl.classList.remove('counter-pop');
      void statEl.offsetWidth;
      statEl.classList.add('counter-pop');
    }
  }

  currentVisitorCount = num;
}

async function registerVisit() {
  try {
    const res = await fetch('/api/visit', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin'
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.total !== undefined) {
      updateVisitorDisplay(data.total, true);
    }
  } catch {}
}

async function pollRealtimeVisitors() {
  try {
    const res = await fetch('/api/visitors', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (data.total !== undefined) {
      updateVisitorDisplay(data.total, true);
    }
  } catch {}
}

/* ==========================================================================
   DYNAMIC DATA FETCHER (/api/site-data)
   ========================================================================== */
async function loadDynamicSiteData() {
  try {
    const res = await fetch('/api/site-data', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();

    if (data.visitors && data.visitors.total !== undefined) {
      updateVisitorDisplay(data.visitors.total, false);
    }

    if (data.settings) {
      const s = data.settings;
      // Official community links are defined in CONFIG above.
      if (s.brandName) CONFIG.brandName = s.brandName;

      if ($('#brandNameText')) $('#brandNameText').textContent = s.brandName;
      if ($('#footBrandName')) $('#footBrandName').textContent = s.brandName;
      if ($('#heroTagline') && s.tagline && !hasLegacyToolReference(s.tagline)) $('#heroTagline').textContent = cleanStudioCopy(s.tagline);
      if ($('#heroSubtext') && s.subtext && !hasLegacyToolReference(s.subtext)) $('#heroSubtext').textContent = cleanStudioCopy(s.subtext);
      if ($('#docTitle') && s.metaTitle && !hasLegacyToolReference(s.metaTitle)) document.title = cleanStudioCopy(s.metaTitle);

      if (s.logoImage && $('#logoContainer')) {
        $('#logoContainer').innerHTML = `<img src="${s.logoImage}" alt="${s.brandName}">`;
      }

      if ($('#heroStatusText') && s.statusText && !hasLegacyToolReference(s.statusText)) $('#heroStatusText').textContent = cleanStudioCopy(s.statusText);
      if ($('#heroStatusDot') && s.statusDot) {
        $('#heroStatusDot').className = 'dot ' + (s.statusDot === 'green' ? '' : s.statusDot);
      }

      if ($('#announcementBar')) {
        if (s.announcementEnabled === false) {
          $('#announcementBar').classList.add('closed');
          document.body.classList.add('ann-dismissed');
        } else if (s.announcement && $('#annMsg')) {
          if (!hasLegacyToolReference(s.announcement)) $('#annMsg').textContent = cleanStudioCopy(s.announcement);
        }
      }

      if ($('#aboutTitle') && s.aboutTitle && !hasLegacyToolReference(s.aboutTitle)) $('#aboutTitle').textContent = cleanStudioCopy(s.aboutTitle);
      if ($('#aboutLead') && s.aboutLead && !hasLegacyToolReference(s.aboutLead)) $('#aboutLead').textContent = cleanStudioCopy(s.aboutLead);
      if ($('#aboutHighlightsList') && Array.isArray(s.aboutHighlights)) {
        const highlights = s.aboutHighlights.filter(item => !hasLegacyToolReference(item)).map(cleanStudioCopy);
        if (highlights.length) {
          $('#aboutHighlightsList').replaceChildren(...highlights.map(item => h('li', {}, [h('b', { text: item })])));
        }
      }

      $$('.ext-discord-btn').forEach(a => a.href = CONFIG.discord);
      $$('.ext-yt-btn').forEach(a => a.href = CONFIG.youtube);
      if ($('#inviteUrl')) $('#inviteUrl').value = CONFIG.discord;

      if (Array.isArray(s.stats) && s.stats.length >= 4) {
        s.stats.forEach((st, idx) => {
          const valEl = $(`#statVal${idx}`);
          const lblEl = $(`#statLbl${idx}`);
          if (valEl && !hasLegacyToolReference(st.value)) valEl.textContent = cleanStudioCopy(st.value);
          if (lblEl && !hasLegacyToolReference(st.label)) {
            const label = /asset downloads/i.test(String(st.label)) ? 'Game Downloads' : cleanStudioCopy(st.label);
            lblEl.textContent = label;
          }
        });
      }

      if ($('#shopStatusText') && s.shopStatus && !hasLegacyToolReference(s.shopStatus)) $('#shopStatusText').textContent = cleanStudioCopy(s.shopStatus);
      if ($('#dlStatusText') && s.downloadStatus && !hasLegacyToolReference(s.downloadStatus)) $('#dlStatusText').textContent = cleanStudioCopy(s.downloadStatus);
    }

    if (Array.isArray(data.products) && data.products.length > 0) {
      const games = data.products.map(normalizeGame).filter(Boolean);
      if (games.length) {
        const remoteIds = new Set(games.map(game => game.id));
        PRODUCTS = [...PRODUCTS.filter(game => !remoteIds.has(game.id)), ...games];
      }
    }

    if (Array.isArray(data.downloads) && data.downloads.length > 0) {
      const releases = data.downloads.map(normalizeRelease).filter(Boolean);
      if (releases.length) {
        const remoteIds = new Set(releases.map(release => release.id));
        DOWNLOADS = [...DOWNLOADS.filter(release => !remoteIds.has(release.id)), ...releases];
      }
    }

    if (data.keysCount !== undefined && $('#keyPoolStatus')) {
      $('#keyPoolStatus').textContent = data.keysCount > 0 
        ? `BETA KEY POOL ONLINE (${data.keysCount} KEYS READY)` 
        : 'KEY POOL CURRENTLY SOLD OUT';
    }

    renderCatalog();
  } catch (err) {
    console.log('Running in offline/static mode with cached data');
  }
}

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
function toast(msg, err = false) {
  const t = h('div', { class: 'toast' + (err ? ' err' : ''), text: msg });
  $('#toasts').append(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s';
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

async function copyText(text, ok) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = h('textarea', { style: 'position:fixed;opacity:0' });
      ta.value = text;
      document.body.append(ta);
      ta.select();
      if (!document.execCommand('copy')) throw 0;
      ta.remove();
    }
    toast(ok);
  } catch {
    toast('Copy failed. Select the text and copy manually.', true);
  }
}

/* ==========================================================================
   DIALOG & FOCUS HANDLING
   ========================================================================== */
let lastFocus = null, activeDialog = null;
const FOCUSABLE = 'a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])';

function openDialog(el, focusEl) {
  lastFocus = document.activeElement;
  activeDialog = el;
  document.body.classList.add('lock');
  setTimeout(() => (focusEl || el).focus(), 50);
}

function closeDialog() {
  document.body.classList.remove('lock');
  activeDialog = null;
  lastFocus && lastFocus.focus && lastFocus.focus();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!$('#quickViewModal').hidden) closeQuickView();
    else if ($('#menu').classList.contains('open')) toggleMenu(false);
  }

  if (e.key === 'Tab' && activeDialog) {
    const f = $$(FOCUSABLE, activeDialog).filter(x => x.offsetParent !== null || x === document.activeElement);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

/* ==========================================================================
   PRODUCT QUICK VIEW MODAL
   ========================================================================== */
function openQuickView(p) {
  $('#qvTitle').textContent = cleanStudioCopy(p.name);
  $('#qvCategory').textContent = cleanStudioCopy(p.category || 'Indie Game');
  $('#qvFree').textContent = 'FREE TO PLAY';
  $('#qvDesc').textContent = cleanStudioCopy(p.description || 'An original indie project from DESPRESSO STUDIO.');
  const coverClass = getProductCoverClass(p);
  $('#qvImage').src = getProductImage(p);
  $('#qvImage').className = coverClass;
  $('#qvImage').parentElement.className = 'qv-img-box' + (coverClass ? ` ${coverClass}` : '');
  $('#qvBadge').textContent = cleanStudioCopy(p.badge || 'FREE RELEASE');

  const featList = $('#qvFeaturesList');
  featList.replaceChildren();
  const features = p.features && p.features.length ? p.features : ['Original gameplay', 'Independent development', 'Free public release'];
  features.forEach(feature => featList.append(h('li', { text: cleanStudioCopy(feature) })));

  const actionsContainer = $('#qvProjectActions');
  const actions = getProjectActions(p);
  actionsContainer.replaceChildren(...actions.map((action, index) => h('a', {
    class: 'btn' + (index === 0 ? ' primary-glow' : ' ghost'),
    href: action.url,
    target: '_blank',
    rel: 'noopener noreferrer',
    text: cleanStudioCopy(action.label || 'OPEN PROJECT')
  })));
  if (!actions.length) {
    actionsContainer.append(h('button', { class: 'btn primary-glow', text: 'COMING SOON', disabled: '' }));
  }

  $('#scrim').hidden = false;
  $('#quickViewModal').hidden = false;
  openDialog($('#quickViewModal'));
}

function closeQuickView() {
  $('#quickViewModal').hidden = true;
  $('#scrim').hidden = true;
  closeDialog();
}

/* ==========================================================================
   CATALOG RENDERING
   ========================================================================== */
function renderCatalog() {
  const shopEmpty = $('#shopEmpty');
  const productsContainer = $('#products');

  const filteredProducts = PRODUCTS.filter(p => {
    const category = (p.category || '').toLowerCase();
    const matchCat = activeShopCategory === 'all' || category.includes(activeShopCategory);
    const matchSearch = !shopSearchQuery || (
      (p.name && p.name.toLowerCase().includes(shopSearchQuery)) ||
      category.includes(shopSearchQuery) ||
      (p.description && p.description.toLowerCase().includes(shopSearchQuery))
    );
    return matchCat && matchSearch;
  });

  shopEmpty.hidden = PRODUCTS.length > 0;

  if (!filteredProducts.length && PRODUCTS.length > 0) {
    productsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--tx2);">
        No games or projects match your search.
      </div>
    `;
  } else {
    productsContainer.replaceChildren(...filteredProducts.map(p => {
      const projectActions = getProjectActions(p);
      const actionLinks = projectActions.map((action, index) => h('a', {
        class: 'btn sm' + (index === 0 ? ' primary-glow' : ' ghost'),
        href: action.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        text: cleanStudioCopy(action.label || 'OPEN'),
        onclick: e => e.stopPropagation()
      }));

      return h('article', { class: 'pcard' }, [
        h('div', { class: 'pcard-img-wrap' + (getProductCoverClass(p) ? ` ${getProductCoverClass(p)}` : ''), onclick: () => openQuickView(p) }, [
          h('img', { class: getProductCoverClass(p), src: getProductImage(p), alt: p.name, loading: 'lazy' }),
          h('span', { class: 'pcard-badge', text: cleanStudioCopy(p.badge || 'FREE GAME') })
        ]),
        h('div', { class: 'pcard-content' }, [
          h('span', { class: 'pcard-category', text: cleanStudioCopy(p.category || 'Indie Game') }),
          h('h3', { text: cleanStudioCopy(p.name) }),
          h('p', { class: 'pcard-desc', text: cleanStudioCopy(p.description || '') }),
          p.features && p.features.length ? h('ul', { class: 'pcard-features' }, p.features.slice(0, 3).map(feature => h('li', { text: cleanStudioCopy(feature) }))) : null,
          h('div', { class: 'pcard-foot' }, [
            h('span', { class: 'free-tag', text: 'FREE' }),
            h('div', { class: 'pcard-actions' }, actionLinks)
          ])
        ])
      ]);
    }));
  }

  // Render free releases and demos.
  const dlEmpty = $('#dlEmpty');
  const filesContainer = $('#files');

  const filteredDownloads = DOWNLOADS.filter(d => {
    const matchCat = activeDlCategory === 'all' || (d.category && d.category.toLowerCase().includes(activeDlCategory));
    const matchSearch = !dlSearchQuery || (
      (d.name && d.name.toLowerCase().includes(dlSearchQuery)) ||
      (d.category && d.category.toLowerCase().includes(dlSearchQuery)) ||
      (d.notes && d.notes.toLowerCase().includes(dlSearchQuery))
    );
    return matchCat && matchSearch;
  });

  dlEmpty.hidden = DOWNLOADS.length > 0;

  if (!filteredDownloads.length && DOWNLOADS.length > 0) {
    filesContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--tx2);">
        No releases match your filter.
      </div>
    `;
  } else {
    filesContainer.replaceChildren(...filteredDownloads.map(d => {
      const statusClass = (d.status || 'stable').toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
      const meta = [d.version && !/coming soon/i.test(d.version) && 'Version ' + d.version, d.size].filter(Boolean).join(' · ');
      const hasDownload = Boolean(d.url) && d.status?.toLowerCase() !== 'coming soon';

      return h('article', { class: 'dl-card' }, [
        h('div', { class: 'dl-header' }, [
          h('div', {}, [
            h('span', { class: 'pcard-category', text: cleanStudioCopy(d.category || 'Release') }),
            h('h3', { text: cleanStudioCopy(d.name) })
          ]),
          h('span', { class: `dl-status-badge ${statusClass}`, text: cleanStudioCopy(d.status || 'Verified') })
        ]),
        meta ? h('div', { class: 'dl-meta', text: meta }) : null,
        d.notes ? h('p', { class: 'dl-notes', text: cleanStudioCopy(d.notes) }) : null,
        h('div', { class: 'dl-actions' }, [
          h('a', {
            class: 'btn sm primary-glow' + (hasDownload ? '' : ' disabled'),
            ...(hasDownload ? { href: d.url, target: '_blank', rel: 'noopener noreferrer' } : { 'aria-disabled': 'true' }),
            text: d.id === 'dl_tricky_bird' ? 'OPEN BUILD FOLDER' : 'VIEW RELEASES',
            title: hasDownload ? 'Open the available game build or release page.' : 'The free build will be available here when released.',
            onclick: hasDownload ? () => toast(`Starting ${d.name} download…`) : e => e.preventDefault()
          }),
          h('a', {
            class: 'btn sm ghost ext-discord-btn',
            href: CONFIG.discord,
            target: '_blank',
            rel: 'noopener noreferrer',
            text: 'COMMUNITY'
          })
        ])
      ]);
    }));
  }
}

/* ==========================================================================
   ROUTING
   ========================================================================== */
const VIEWS = ['home', 'shop', 'download', 'key'];
const HOME_SECTIONS = ['about', 'contact'];

function route() {
  const id = location.hash.slice(1);
  const sectionId = HOME_SECTIONS.includes(id) ? id : null;
  const v = sectionId ? 'home' : (VIEWS.includes(id) ? id : 'home');

  $$('.view').forEach(s => {
    const on = s.dataset.view === v;
    if (on && s.hidden) {
      s.hidden = false;
      s.classList.remove('enter');
      void s.offsetWidth;
      if (!reduced) s.classList.add('enter');
    } else if (!on) {
      s.hidden = true;
    }
  });

  $$('#menu a[data-view], #menu a[data-section]').forEach(a => {
    const active = a.dataset.section
      ? a.dataset.section === sectionId
      : !sectionId && a.dataset.view === v;
    active ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });

  const pageNames = { shop: 'Games', download: 'Downloads', key: 'Beta Access' };
  const sectionNames = { about: 'About Us', contact: 'Contact Us' };
  const pageName = sectionId ? sectionNames[sectionId] : pageNames[v];
  document.title = v === 'home' && !sectionId
    ? (CONFIG.brandName + ' — ' + CONFIG.tagline)
    : (CONFIG.brandName + ' — ' + pageName);

  toggleMenu(false);
  if (sectionId) {
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  observeReveals();
  heroState();
}

function toggleMenu(open) {
  const m = $('#menu'), b = $('#burger');
  open = open === undefined ? !m.classList.contains('open') : open;
  m.classList.toggle('open', open);
  b.setAttribute('aria-expanded', open);
  document.body.classList.toggle('lock', open);
}

/* ==========================================================================
   SCROLL REVEAL OBSERVER
   ========================================================================== */
let io;
function observeReveals() {
  if (!io) {
    io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }), { threshold: 0.15 });
  }

  $$('.reveal:not(.in)').forEach(el => {
    reduced || !('IntersectionObserver' in window) ? el.classList.add('in') : io.observe(el);
  });
}

/* ==========================================================================
   MAGNETIC BUTTONS
   ========================================================================== */
function magnets() {
  if (reduced || matchMedia('(hover:none)').matches) return;
  $$('.magnet').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
    });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });
}

/* ==========================================================================
   THREE.JS HERO 3D EMBLEM: ESPRESSO CUP (DESPRESSO 3D CUP & STEAM)
   ========================================================================== */
let three = null, heroVisible = true;

function initThree() {
  const hero = $('.hero'), canvas = $('#stage');
  if (!window.THREE || (reduced && false)) {
    hero.classList.add('no3d');
    return;
  }

  try {
    const T = window.THREE;
    const small = innerWidth < 700;
    const renderer = new T.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));

    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(40, 1, 0.1, 100);
    cam.position.z = 9.2;
    cam.position.y = 1.0;

    // Ceramic cup material (dark espresso glaze with subtle gloss)
    const cupMat = new T.MeshStandardMaterial({ 
      color: 0x2A1A12, 
      metalness: 0.85, 
      roughness: 0.25 
    });
    
    // Warm coffee liquid with espresso crema hue
    const coffeeMat = new T.MeshStandardMaterial({
      color: 0x4A2412,
      roughness: 0.18,
      metalness: 0.12
    });

    // Warm copper edge highlight
    const copperEdgeMat = new T.LineBasicMaterial({ 
      color: 0xC98A58, 
      linewidth: 2 
    });

    const cremaAccentMat = new T.MeshBasicMaterial({
      color: 0xD6A06B
    });

    const x = new T.Group();

    // 1. CLASSIC ESPRESSO CUP BODY (Curved Tulip Profile using LatheGeometry)
    // Points along the cross-section from bottom to top rim and back down inside
    const profilePoints = [
      new T.Vector2(0.0, -1.3),
      new T.Vector2(0.85, -1.3),    // Flat base
      new T.Vector2(1.05, -1.1),    // Gentle heel curve
      new T.Vector2(1.35, -0.6),    // Lower body swell
      new T.Vector2(1.65, 0.2),     // Mid body
      new T.Vector2(1.82, 0.95),    // Upper body flair
      new T.Vector2(1.85, 1.1),     // Rounded top rim outer
      new T.Vector2(1.78, 1.1),     // Rim apex
      new T.Vector2(1.70, 0.95),    // Inner rim
      new T.Vector2(1.58, 0.5),     // Inner wall
      new T.Vector2(1.52, 0.35)     // Liquid line depth
    ];

    const cupGeo = new T.LatheGeometry(profilePoints, 48);
    const cupMesh = new T.Mesh(cupGeo, cupMat);
    
    // Add subtle copper edge highlights along the cup geometry
    const cupEdges = new T.LineSegments(new T.EdgesGeometry(cupGeo, 30), copperEdgeMat);
    cupMesh.add(cupEdges);
    x.add(cupMesh);

    // 2. COFFEE CREMA LIQUID SURFACE (Filled inside the cup)
    const liquidGeo = new T.CylinderGeometry(1.56, 1.54, 0.08, 36);
    const liquidMesh = new T.Mesh(liquidGeo, coffeeMat);
    liquidMesh.position.y = 0.45;
    x.add(liquidMesh);

    // Warm crema perimeter ring
    const cremaRingGeo = new T.RingGeometry(1.48, 1.56, 36);
    cremaRingGeo.rotateX(-Math.PI / 2);
    const cremaRing = new T.Mesh(cremaRingGeo, cremaAccentMat);
    cremaRing.position.y = 0.495;
    x.add(cremaRing);

    // 3. REALISTIC CUP HANDLE (C-Curve / Ear Shape using TubeGeometry)
    // Curves from near the upper rim out and loops smoothly down into the lower mid-body
    const handleCurve = new T.CatmullRomCurve3([
      new T.Vector3(1.72, 0.88, 0.0),    // Top attachment to rim
      new T.Vector3(2.45, 0.82, 0.0),    // Upper outward arch
      new T.Vector3(2.70, 0.25, 0.0),    // Outer apex curve
      new T.Vector3(2.40, -0.42, 0.0),   // Lower inward loop
      new T.Vector3(1.38, -0.65, 0.0)    // Bottom attachment to lower cup
    ]);

    const handleGeo = new T.TubeGeometry(handleCurve, 32, 0.16, 16, false);
    const handleMesh = new T.Mesh(handleGeo, cupMat);
    const handleEdges = new T.LineSegments(new T.EdgesGeometry(handleGeo, 24), copperEdgeMat);
    handleMesh.add(handleEdges);
    x.add(handleMesh);

    // 4. ANIMATED RISING STEAM WISPS (Smooth rising vapor spirals like hot coffee)
    const steamGroup = new T.Group();
    const steamRibbons = [];

    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const offsetX = Math.cos(angle) * 0.35;
      const offsetZ = Math.sin(angle) * 0.35;

      const steamPoints = [
        new T.Vector3(offsetX, 0.6, offsetZ),
        new T.Vector3(offsetX + 0.15, 1.4, offsetZ - 0.1),
        new T.Vector3(offsetX - 0.2, 2.2, offsetZ + 0.15),
        new T.Vector3(offsetX + 0.25, 3.1, offsetZ - 0.2),
        new T.Vector3(offsetX, 4.0, offsetZ)
      ];

      const sCurve = new T.CatmullRomCurve3(steamPoints);
      const sGeo = new T.TubeGeometry(sCurve, 28, 0.045 - i * 0.008, 10, false);
      const sMat = new T.MeshBasicMaterial({
        color: 0xE2C5A3,
        transparent: true,
        opacity: 0.65 - i * 0.12
      });

      const sMesh = new T.Mesh(sGeo, sMat);
      steamGroup.add(sMesh);

      steamRibbons.push({
        mesh: sMesh,
        speed: 1.4 + i * 0.4,
        phase: i * 1.8,
        initY: 0.6
      });
    }
    x.add(steamGroup);

    // Subtle glowing crema accent hovering over the coffee
    const core = new T.Mesh(
      new T.OctahedronGeometry(0.22), 
      new T.MeshBasicMaterial({ color: 0xC98A58, wireframe: true })
    );
    core.position.y = 1.0;
    x.add(core);

    scene.add(x);

    // Lighting setup
    scene.add(new T.AmbientLight(0x2B1C12, 1.4));

    const l1 = new T.PointLight(0xC98A58, 38, 30);
    l1.position.set(-5, 4, 4);
    const l2 = new T.PointLight(0x8C5938, 28, 30);
    l2.position.set(5, -2, 3);
    const l3 = new T.PointLight(0xFFFFFF, 16, 30);
    l3.position.set(0, 6, -3);
    scene.add(l1, l2, l3);

    let mx = 0, my = 0, tx = 0, ty = 0, t0 = performance.now(), raf = 0;

    const place = () => {
      const w = hero.clientWidth, hh = hero.clientHeight;
      renderer.setSize(w, hh, false);
      cam.aspect = w / hh;
      cam.updateProjectionMatrix();
      x.position.x = w > 900 ? 3.2 : 0;
      x.scale.setScalar(w > 900 ? 1 : 0.75);
      x.position.y = w > 900 ? -0.2 : -1.2;
    };

    const frame = now => {
      raf = requestAnimationFrame(frame);
      const t = (now - t0) / 1000;
      const ent = Math.min(t / 1.6, 1);
      const e = 1 - Math.pow(1 - ent, 3);

      tx += (mx - tx) * 0.06;
      ty += (my - ty) * 0.06;

      // Gentle orbital spin & mouse interaction
      x.rotation.y = t * 0.4 * (reduced ? 0.2 : 1) + tx * 0.55;
      x.rotation.x = 0.25 + Math.sin(t * 0.6) * 0.08 + ty * 0.3;
      
      // Floating hover bobbing
      x.position.y += ((reduced ? 0 : Math.sin(t * 1.5) * 0.16) + (innerWidth > 900 ? -0.2 : -1.2) - x.position.y) * 0.1;

      // Realistic undulating rising steam movement
      steamRibbons.forEach(sr => {
        const st = t * sr.speed + sr.phase;
        sr.mesh.position.y = (Math.sin(st) * 0.25) + ((st * 0.3) % 0.6);
        sr.mesh.position.x = Math.sin(st * 1.2) * 0.12;
        sr.mesh.position.z = Math.cos(st * 1.1) * 0.12;
        sr.mesh.scale.set(
          1 + Math.sin(st) * 0.2,
          1 + Math.cos(st * 0.8) * 0.15,
          1 + Math.sin(st) * 0.2
        );
      });

      // Core spin
      core.rotation.y = t * 1.5;
      core.rotation.x = t * 0.8;
      core.position.y = 0.95 + Math.sin(t * 2.2) * 0.08;

      l1.position.x = -5 + tx * 3;
      l2.position.y = -2 - ty * 3;

      renderer.render(scene, cam);
    };

    addEventListener('mousemove', e => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    }, { passive: true });

    addEventListener('resize', place);

    const start = () => {
      if (!raf && heroVisible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    three = { start, stop };
    place();
    canvas.classList.add('on');
    start();

    new IntersectionObserver(es => {
      heroVisible = es[0].isIntersecting;
      heroVisible ? start() : stop();
    }).observe(hero);

    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    canvas.addEventListener('webglcontextlost', () => {
      stop();
      hero.classList.add('no3d');
    });
  } catch {
    hero.classList.add('no3d');
  }
}

function heroState() {
  if (!three) return;
  const hash = location.hash.slice(1);
  const homeIsVisible = !hash || hash === 'home' || HOME_SECTIONS.includes(hash);
  homeIsVisible ? three.start() : three.stop();
}

/* ==========================================================================
   BETA KEY FLOW
   ========================================================================== */
async function startKey() {
  const msg = $('#keyMsg'), btn = $('#getKey');
  msg.textContent = '';
  btn.disabled = true;

  const w = window.open('about:blank', '_blank');
  try {
    const r = await fetch('/api/start', { method: 'POST', cache: 'no-store', credentials: 'same-origin' });
    const d = await r.json();

    if (d.soldOut) {
      if (w) w.close();
      msg.textContent = 'ALL BETA TEST KEYS HAVE BEEN CLAIMED. OPEN A TICKET ON DISCORD.';
      toast('Beta test keys currently exhausted. Check Discord.', true);
      return;
    }

    if (!r.ok || !d.url) throw new Error(d.error || 'fail');
    if (w) {
      w.opener = null;
      w.location.href = d.url;
    } else {
      location.assign(d.url);
    }
  } catch {
    if (w) w.close();
    msg.textContent = 'KEY SERVER OFFLINE. START LOCAL SERVER TO REDEEM.';
    toast('Key server unavailable in static preview.', true);
  } finally {
    setTimeout(() => btn.disabled = false, 1500);
  }
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
function init() {
  renderCatalog();
  route();
  magnets();
  loadDynamicSiteData();

  addEventListener('hashchange', route);

  $('#scrim').addEventListener('click', closeQuickView);

  $('#copyInvite').addEventListener('click', () => copyText(CONFIG.discord, 'Discord invite link copied.'));

  $('#qvClose').addEventListener('click', closeQuickView);
  $('#quickViewModal').addEventListener('click', e => {
    if (e.target.id === 'quickViewModal') closeQuickView();
  });

  $('#getKey').addEventListener('click', startKey);

  $('#burger').addEventListener('click', () => toggleMenu());
  $('#scrollInd').addEventListener('click', () => $('#about').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }));
  $('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  $('#annClose').addEventListener('click', () => {
    $('#announcementBar').classList.add('closed');
    document.body.classList.add('ann-dismissed');
  });

  $$('#shopCategoryPills .cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#shopCategoryPills .cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeShopCategory = btn.dataset.cat;
      renderCatalog();
    });
  });

  $('#shopFilterInput').addEventListener('input', function() {
    shopSearchQuery = this.value.toLowerCase().trim();
    renderCatalog();
  });

  $$('#dlCategoryPills .cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#dlCategoryPills .cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDlCategory = btn.dataset.cat;
      renderCatalog();
    });
  });

  $('#dlFilterInput').addEventListener('input', function() {
    dlSearchQuery = this.value.toLowerCase().trim();
    renderCatalog();
  });

  const onScroll = () => {
    $('#nav').classList.toggle('scrolled', scrollY > 30);
    $('#toTop').classList.toggle('show', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  $('#xcss').parentElement.classList.remove('no3d');
  const go = () => {
    initThree();
    heroState();
  };
  window.THREE ? go() : (document.readyState === 'complete' ? go() : addEventListener('load', go));
  setTimeout(() => {
    if (!window.THREE) $('.hero').classList.add('no3d');
  }, 4000);

  registerVisit();
  setInterval(pollRealtimeVisitors, 10000);

  window.DESPRESSO = {
    products: PRODUCTS,
    openQuickView,
    refreshData: loadDynamicSiteData
  };
}

init();
})();
