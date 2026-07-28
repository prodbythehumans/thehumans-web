/* the humans. — links */
(function () {
  'use strict';

  var DATA_URL = 'data/config.json';

  var ICONS = {
    link: '<path d="M9 6h9v9"/><path d="M18 6L7 17"/>',
    press: '<rect x="5" y="3" width="14" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 6.5l8 6 8-6"/>',
    phone: '<path d="M6 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 6.2 2 2 0 0 1 6 3z"/>',
    whatsapp: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z"/>',
    spotify: '<circle cx="12" cy="12" r="9"/><path d="M7 10c4-1.3 8-1 11 1"/><path d="M7.5 13c3-1 6.5-.8 9 .8"/><path d="M8.5 16c2.2-.7 4.7-.5 6.5.7"/>',
    tiktok: '<path d="M13 4v10.5a3.5 3.5 0 1 1-2-3.16"/><path d="M13 4c.5 2 2 3.3 4 3.5"/>',
    applemusic: '<path d="M9 17V7l9-1.5V15"/><circle cx="7" cy="17" r="2"/><circle cx="16" cy="15" r="2"/>',
    youtube: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M11 9.8v4.4l4-2.2z" fill="currentColor" stroke="none"/>',
    x: '<line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>',
    web: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/>'
  };

  function iconSvg(key) {
    var body = ICONS[key] || ICONS.link;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  }

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!m) return '25, 25, 25';
    return parseInt(m[1], 16) + ', ' + parseInt(m[2], 16) + ', ' + parseInt(m[3], 16);
  }

  function relLuminance(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!m) return 0;
    var chans = [m[1], m[2], m[3]].map(function (h) {
      var c = parseInt(h, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * chans[0] + 0.7152 * chans[1] + 0.0722 * chans[2];
  }

  function contrastRatio(hexA, hexB) {
    var la = relLuminance(hexA);
    var lb = relLuminance(hexB);
    var lighter = Math.max(la, lb);
    var darker = Math.min(la, lb);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /* picks whichever of cream/ink gives the higher contrast — the crossover
     point works out to ~4.58:1, so this always clears AA (4.5:1) regardless
     of the accent color an admin picks */
  function readableTextOn(hex) {
    var cream = '#FFFDF7';
    var ink = '#191919';
    return contrastRatio(hex, cream) >= contrastRatio(hex, ink) ? cream : ink;
  }

  function isExternal(url) {
    if (!/^https?:\/\//i.test(url)) return false;
    try {
      return new URL(url).origin !== window.location.origin;
    } catch (e) {
      return true;
    }
  }

  function applyDesign(design) {
    design = design || {};
    var root = document.documentElement.style;
    var bg = design.background || {};

    root.setProperty('--lp-bg', bg.color || '#191919');
    root.setProperty('--lp-bg-to', bg.colorTo || '#000000');
    root.setProperty('--lp-bg-angle', (bg.angle || 135) + 'deg');
    root.setProperty('--lp-text', design.textColor || '#FFFDF7');
    root.setProperty('--lp-text-rgb', hexToRgb(design.textColor || '#FFFDF7'));
    root.setProperty('--lp-muted', design.mutedColor || '#969595');
    root.setProperty('--lp-accent', design.accentColor || '#DBC093');
    root.setProperty('--lp-accent-rgb', hexToRgb(design.accentColor || '#DBC093'));
    root.setProperty('--lp-radius', (design.buttonRadius != null ? design.buttonRadius : 10) + 'px');
    root.setProperty('--lp-card-text', design.buttonFill === 'solid' ? readableTextOn(design.accentColor || '#DBC093') : (design.textColor || '#FFFDF7'));
    root.setProperty('--lp-badge-text', readableTextOn(design.accentColor || '#DBC093'));

    if (bg.type === 'image' && bg.imageUrl) {
      root.setProperty('--lp-bg-image', 'url("' + bg.imageUrl + '")');
    }

    document.body.dataset.bg = bg.type || 'solid';
    document.body.dataset.fill = design.buttonFill || 'outline';

    if (design.motion === 'none') {
      document.body.dataset.motion = 'none';
    }
  }

  function renderProfile(profile) {
    profile = profile || {};
    var avatar = document.getElementById('avatar');
    var fallback = document.getElementById('avatar-fallback');
    var badge = document.getElementById('badge');
    var name = document.getElementById('profile-name');
    var bio = document.getElementById('profile-bio');

    if (profile.avatarUrl) {
      avatar.src = profile.avatarUrl;
      avatar.alt = profile.name || 'the humans.';
      avatar.hidden = false;
      fallback.hidden = true;
    }

    if (profile.badge) {
      badge.textContent = profile.badge;
      badge.hidden = false;
    }

    name.textContent = profile.name || 'the humans.';
    bio.textContent = profile.bio || '';

    document.title = (profile.name || 'the humans.') + ' — links';
  }

  function buildLinkCard(item) {
    var a = document.createElement('a');
    a.className = 'link-card reveal';
    a.href = item.url || '#';

    if (isExternal(item.url)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }

    var icon = document.createElement('span');
    icon.className = 'link-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = iconSvg(item.icon);

    var text = document.createElement('span');
    text.className = 'link-text';
    var title = document.createElement('span');
    title.className = 'link-title';
    title.textContent = item.title || '';
    text.appendChild(title);

    if (item.subtitle) {
      var sub = document.createElement('span');
      sub.className = 'link-subtitle';
      sub.textContent = item.subtitle;
      text.appendChild(sub);
    }

    if (a.target === '_blank') {
      var note = document.createElement('span');
      note.className = 'new-tab-note';
      note.textContent = ' (se abre en una pestaña nueva)';
      text.appendChild(note);
    }

    var wave = document.createElement('span');
    wave.className = 'wave';
    wave.setAttribute('aria-hidden', 'true');
    wave.innerHTML = '<span></span><span></span><span></span><span></span>';

    a.appendChild(icon);
    a.appendChild(text);
    a.appendChild(wave);

    var li = document.createElement('li');
    li.appendChild(a);
    return li;
  }

  function buildHeader(item) {
    var li = document.createElement('li');
    li.className = 'reveal';
    var h2 = document.createElement('h2');
    h2.className = 'link-header-text';
    h2.textContent = item.title || '';
    li.appendChild(h2);
    return li;
  }

  function buildEmbed(item) {
    var li = document.createElement('li');
    li.className = 'link-embed reveal';

    if (item.title) {
      var label = document.createElement('p');
      label.className = 'link-embed-label';
      label.textContent = item.title;
      li.appendChild(label);
    }

    var frame = document.createElement('iframe');
    frame.className = 'embed-frame ' + (item.embedProvider || '');
    frame.src = item.embedUrl || '';
    frame.title = item.title || 'Contenido embebido';
    frame.loading = 'lazy';
    frame.allow = 'encrypted-media; fullscreen; picture-in-picture';
    frame.setAttribute('frameborder', '0');
    li.appendChild(frame);
    return li;
  }

  function renderLinks(items) {
    var list = document.getElementById('links');
    list.innerHTML = '';
    (items || []).filter(function (item) { return item.visible !== false; }).forEach(function (item) {
      var li;
      if (item.type === 'header') li = buildHeader(item);
      else if (item.type === 'embed') li = buildEmbed(item);
      else li = buildLinkCard(item);
      list.appendChild(li);
    });
  }

  function initReveal() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var items = document.querySelectorAll('.reveal');

    if (reduced) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var order = 0;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(order * 45, 360) + 'ms';
        order += 1;
        el.classList.add('in');
        observer.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  function loadConfig() {
    var isPreview = /(?:^|[?&])preview=1(?:&|$)/.test(location.search);
    if (isPreview) {
      try {
        var draft = JSON.parse(sessionStorage.getItem('th-links-draft') || 'null');
        if (draft) return Promise.resolve(draft);
      } catch (e) { /* fall through to network fetch */ }
    }
    return fetch(DATA_URL).then(function (r) { return r.json(); });
  }

  loadConfig()
    .then(function (config) {
      applyDesign(config.design);
      renderProfile(config.profile);
      renderLinks(config.links);
      initReveal();
    })
    .catch(function (err) {
      console.error('Error cargando links:', err);
    });
})();
