/* the humans. — links admin panel */
(function () {
  'use strict';

  /* Password check + publishing happen server-side (workers/admin-auth) —
     this repo is public, so nothing password- or token-related can live
     in this file. */
  var AUTH_ENDPOINT = '/links/admin/api/auth';
  var PUBLISH_ENDPOINT = '/links/admin/api/publish';
  var CONFIG_PATH = 'links/data/config.json';
  var DATA_URL = '../data/config.json';

  var ICON_LABELS = {
    link: 'Genérico', press: 'Documento', calendar: 'Calendario',
    instagram: 'Instagram', mail: 'Email', phone: 'Teléfono', whatsapp: 'WhatsApp',
    spotify: 'Spotify', tiktok: 'TikTok', applemusic: 'Apple Music', youtube: 'YouTube',
    x: 'X / Twitter', web: 'Web'
  };

  var gate = document.getElementById('gate');
  var panel = document.getElementById('panel');

  /* ---------- gate ---------- */
  function tryUnlock() {
    var val = document.getElementById('gate-input').value;
    var btn = document.getElementById('gate-btn');
    btn.disabled = true;
    fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: val })
    }).then(function (r) { return r.json(); }).then(function (res) {
      btn.disabled = false;
      if (res.ok) {
        sessionStorage.setItem('th-admin', '1');
        openPanel();
      } else {
        document.getElementById('gate-error').hidden = false;
      }
    }).catch(function () {
      btn.disabled = false;
      document.getElementById('gate-error').hidden = false;
    });
  }

  document.getElementById('gate-btn').addEventListener('click', tryUnlock);
  document.getElementById('gate-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') tryUnlock();
  });

  /* ---------- color math (mirrors assets/links.js) ---------- */
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
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  function normalizeHex(v) {
    if (!v) return null;
    v = v.trim();
    if (v[0] !== '#') v = '#' + v;
    return /^#[0-9a-fA-F]{6}$/.test(v) ? v : null;
  }

  function wireColorPair(colorId, hexId, onChange) {
    var colorEl = document.getElementById(colorId);
    var hexEl = document.getElementById(hexId);
    colorEl.addEventListener('input', function () {
      hexEl.value = colorEl.value;
      onChange(colorEl.value);
    });
    hexEl.addEventListener('input', function () {
      var v = normalizeHex(hexEl.value);
      if (!v) return;
      colorEl.value = v;
      onChange(v);
    });
    return {
      set: function (v) { colorEl.value = v; hexEl.value = v; }
    };
  }

  /* ---------- state ---------- */
  var config = null;
  var pendingAvatarFile = null;
  var pendingBgImageFile = null;

  function openPanel() {
    gate.hidden = true;
    panel.hidden = false;
    fetch(DATA_URL).then(function (r) { return r.json(); }).then(function (c) {
      config = c;
      config.profile = config.profile || {};
      config.design = config.design || {};
      config.design.background = config.design.background || {};
      config.links = config.links || [];
      renderAll();
    });
  }

  function renderAll() {
    renderProfileForm();
    renderDesignForm();
    renderLinkEditor();
    renderContrastReport();
  }

  if (sessionStorage.getItem('th-admin') === '1') openPanel();

  /* ---------- tabs (WAI-ARIA APG pattern) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function activateTab(tab, moveFocus) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
      t.classList.toggle('active', selected);
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
    if (moveFocus) tab.focus();
    if (tab.id === 'tab-preview') refreshPreview();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activateTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var idx = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') { activateTab(tabs[(idx + 1) % tabs.length], true); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { activateTab(tabs[(idx - 1 + tabs.length) % tabs.length], true); e.preventDefault(); }
      else if (e.key === 'Home') { activateTab(tabs[0], true); e.preventDefault(); }
      else if (e.key === 'End') { activateTab(tabs[tabs.length - 1], true); e.preventDefault(); }
    });
  });

  /* ---------- profile form ---------- */
  function updateAvatarPreview(src) {
    var img = document.getElementById('avatar-preview');
    var empty = document.getElementById('avatar-preview-empty');
    if (src) { img.src = src; img.hidden = false; empty.hidden = true; }
    else { img.hidden = true; empty.hidden = false; }
  }

  function renderProfileForm() {
    var p = config.profile;
    document.getElementById('in-name').value = p.name || '';
    document.getElementById('in-badge').value = p.badge || '';
    document.getElementById('in-bio').value = p.bio || '';
    updateAvatarPreview(p.avatarUrl || '');
  }

  document.getElementById('in-name').addEventListener('input', function (e) { config.profile.name = e.target.value; });
  document.getElementById('in-badge').addEventListener('input', function (e) { config.profile.badge = e.target.value; });
  document.getElementById('in-bio').addEventListener('input', function (e) { config.profile.bio = e.target.value; });

  document.getElementById('in-avatar').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    pendingAvatarFile = file;
    var reader = new FileReader();
    reader.onload = function () { updateAvatarPreview(reader.result); };
    reader.readAsDataURL(file);
  });

  /* ---------- design form ---------- */
  var bgColorPair = wireColorPair('in-bg-color', 'in-bg-color-hex', function (v) {
    config.design.background.color = v;
    renderContrastReport();
  });
  var bgColorToPair = wireColorPair('in-bg-color-to', 'in-bg-color-to-hex', function (v) {
    config.design.background.colorTo = v;
  });
  var textColorPair = wireColorPair('in-text-color', 'in-text-color-hex', function (v) {
    config.design.textColor = v;
    renderContrastReport();
  });
  var mutedColorPair = wireColorPair('in-muted-color', 'in-muted-color-hex', function (v) {
    config.design.mutedColor = v;
    renderContrastReport();
  });
  var accentColorPair = wireColorPair('in-accent-color', 'in-accent-color-hex', function (v) {
    config.design.accentColor = v;
    renderContrastReport();
  });

  function updateBgFieldsVisibility() {
    var type = config.design.background.type || 'solid';
    document.getElementById('field-bg-to').hidden = type !== 'gradient';
    document.getElementById('field-bg-image').hidden = type !== 'image';
  }

  document.getElementById('in-bg-type').addEventListener('change', function (e) {
    config.design.background.type = e.target.value;
    updateBgFieldsVisibility();
  });
  document.getElementById('in-button-fill').addEventListener('change', function (e) {
    config.design.buttonFill = e.target.value;
  });
  document.getElementById('in-button-radius').addEventListener('input', function (e) {
    config.design.buttonRadius = +e.target.value;
    document.getElementById('radius-value').textContent = e.target.value + 'px';
  });
  document.getElementById('in-motion').addEventListener('change', function (e) {
    config.design.motion = e.target.value;
  });
  document.getElementById('in-bg-image').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (file) pendingBgImageFile = file;
  });

  function renderDesignForm() {
    var d = config.design;
    var bg = d.background || {};
    document.getElementById('in-bg-type').value = bg.type || 'solid';
    bgColorPair.set(bg.color || '#191919');
    bgColorToPair.set(bg.colorTo || '#000000');
    textColorPair.set(d.textColor || '#FFFDF7');
    mutedColorPair.set(d.mutedColor || '#969595');
    accentColorPair.set(d.accentColor || '#DBC093');
    document.getElementById('in-button-fill').value = d.buttonFill || 'outline';
    var radius = d.buttonRadius != null ? d.buttonRadius : 10;
    document.getElementById('in-button-radius').value = radius;
    document.getElementById('radius-value').textContent = radius + 'px';
    document.getElementById('in-motion').value = d.motion || 'full';
    updateBgFieldsVisibility();
  }

  function contrastRow(label, ratio, min) {
    var pass = ratio >= min;
    return '<li><span>' + label + '</span><span class="contrast-badge ' + (pass ? 'pass' : 'fail') + '">' +
      (pass ? '✓ AA' : '✕ AA') + ' · ' + ratio.toFixed(1) + ':1</span></li>';
  }

  function renderContrastReport() {
    var d = config.design;
    var bg = (d.background && d.background.color) || '#191919';
    var rows = '';
    rows += contrastRow('Texto sobre fondo', contrastRatio(d.textColor || '#FFFDF7', bg), 4.5);
    rows += contrastRow('Texto secundario sobre fondo', contrastRatio(d.mutedColor || '#969595', bg), 4.5);
    rows += contrastRow('Acento sobre fondo (bordes/iconos)', contrastRatio(d.accentColor || '#DBC093', bg), 3.0);
    document.getElementById('contrast-report').innerHTML = rows;
  }

  /* ---------- link editor ---------- */
  function blankLink(type) {
    var id = type + '-' + Date.now().toString(36);
    if (type === 'header') return { id: id, type: 'header', title: '', visible: true };
    if (type === 'embed') return { id: id, type: 'embed', title: '', embedProvider: 'spotify', embedUrl: '', visible: true };
    return { id: id, type: 'link', title: '', subtitle: '', url: '', icon: 'link', visible: true };
  }

  function addLink(type) {
    config.links.push(blankLink(type));
    renderLinkEditor();
    var items = document.querySelectorAll('.link-editor-item');
    var last = items[items.length - 1];
    var field = last && last.querySelector('input,select,textarea');
    if (field) field.focus();
  }

  document.getElementById('add-link').addEventListener('click', function () { addLink('link'); });
  document.getElementById('add-header').addEventListener('click', function () { addLink('header'); });
  document.getElementById('add-embed').addEventListener('click', function () { addLink('embed'); });

  function moveLink(item, dir) {
    var idx = config.links.indexOf(item);
    var swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= config.links.length) return;
    config.links[idx] = config.links[swapIdx];
    config.links[swapIdx] = item;
    renderLinkEditor();
  }

  function deleteLink(item) {
    config.links = config.links.filter(function (x) { return x !== item; });
    renderLinkEditor();
  }

  function textField(label, value, onChange, wide, isUrl) {
    var wrap = document.createElement('label');
    if (wide) wrap.className = 'field-wide';
    var span = document.createElement('span');
    span.textContent = label;
    var input = document.createElement('input');
    input.type = isUrl ? 'url' : 'text';
    input.value = value || '';
    input.addEventListener('input', function () { onChange(input.value); });
    wrap.appendChild(span);
    wrap.appendChild(input);
    return wrap;
  }

  function selectField(label, options, value, onChange) {
    var wrap = document.createElement('label');
    var span = document.createElement('span');
    span.textContent = label;
    var select = document.createElement('select');
    options.forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt[0];
      o.textContent = opt[1];
      if (opt[0] === value) o.selected = true;
      select.appendChild(o);
    });
    select.addEventListener('change', function () { onChange(select.value); });
    wrap.appendChild(span);
    wrap.appendChild(select);
    return wrap;
  }

  function renderLinkEditor() {
    var list = document.getElementById('link-editor-list');
    list.innerHTML = '';

    config.links.forEach(function (item, idx) {
      var li = document.createElement('li');
      li.className = 'link-editor-item';

      var typeLabel = document.createElement('span');
      typeLabel.className = 'item-type-label';
      typeLabel.textContent = item.type === 'header' ? 'Cabecera' : item.type === 'embed' ? 'Embed' : 'Enlace';
      li.appendChild(typeLabel);

      var grid = document.createElement('div');
      grid.className = 'field-grid';

      if (item.type === 'header') {
        grid.appendChild(textField('Texto de la cabecera', item.title, function (v) { item.title = v; }, true));
      } else if (item.type === 'embed') {
        grid.appendChild(textField('Título (opcional)', item.title, function (v) { item.title = v; }));
        grid.appendChild(selectField('Proveedor', [['spotify', 'Spotify'], ['youtube', 'YouTube']], item.embedProvider || 'spotify', function (v) { item.embedProvider = v; }));
        grid.appendChild(textField('URL de embed', item.embedUrl, function (v) { item.embedUrl = v; }, false, true));
      } else {
        grid.appendChild(textField('Título', item.title, function (v) { item.title = v; }, true));
        grid.appendChild(textField('Subtítulo (opcional)', item.subtitle, function (v) { item.subtitle = v; }));
        grid.appendChild(textField('URL', item.url, function (v) { item.url = v; }, false, true));
        var iconOpts = Object.keys(ICON_LABELS).map(function (k) { return [k, ICON_LABELS[k]]; });
        grid.appendChild(selectField('Icono', iconOpts, item.icon || 'link', function (v) { item.icon = v; }));
      }

      li.appendChild(grid);

      var toolbar = document.createElement('div');
      toolbar.className = 'item-toolbar';

      var orderBtns = document.createElement('div');
      orderBtns.className = 'order-btns';

      var upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'icon-btn';
      upBtn.textContent = '↑';
      upBtn.setAttribute('aria-label', 'Mover arriba: ' + (item.title || 'elemento'));
      upBtn.disabled = idx === 0;
      upBtn.addEventListener('click', function () { moveLink(item, -1); });

      var downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'icon-btn';
      downBtn.textContent = '↓';
      downBtn.setAttribute('aria-label', 'Mover abajo: ' + (item.title || 'elemento'));
      downBtn.disabled = idx === config.links.length - 1;
      downBtn.addEventListener('click', function () { moveLink(item, 1); });

      orderBtns.appendChild(upBtn);
      orderBtns.appendChild(downBtn);

      var visLabel = document.createElement('label');
      visLabel.className = 'visible-toggle';
      var visInput = document.createElement('input');
      visInput.type = 'checkbox';
      visInput.checked = item.visible !== false;
      visInput.addEventListener('change', function () { item.visible = visInput.checked; });
      visLabel.appendChild(visInput);
      visLabel.appendChild(document.createTextNode('Visible'));

      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'icon-btn delete-btn';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'Eliminar: ' + (item.title || 'elemento'));
      delBtn.addEventListener('click', function () { deleteLink(item); });

      toolbar.appendChild(orderBtns);
      toolbar.appendChild(visLabel);
      toolbar.appendChild(delBtn);
      li.appendChild(toolbar);

      list.appendChild(li);
    });
  }

  /* ---------- preview ---------- */
  function refreshPreview() {
    try { sessionStorage.setItem('th-links-draft', JSON.stringify(collectConfig())); } catch (e) { /* ignore quota errors */ }
    var frame = document.getElementById('preview-frame');
    frame.src = '../index.html?preview=1&_=' + Date.now();
  }

  document.getElementById('refresh-preview').addEventListener('click', refreshPreview);

  /* ---------- collect + publish ---------- */
  function collectConfig() {
    return {
      updatedAt: new Date().toISOString(),
      profile: config.profile,
      links: config.links,
      design: config.design
    };
  }

  function fileExt(file) {
    if (file.type === 'image/png') return 'png';
    if (file.type === 'image/webp') return 'webp';
    return 'jpg';
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result.split(',')[1]); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function publishFile(path, file, message) {
    return fileToBase64(file).then(function (b64) {
      return fetch(PUBLISH_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path: path, contentBase64: b64, message: message })
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (!res.ok) throw new Error(res.error || 'Error al subir archivo');
        return res;
      });
    });
  }

  function setStatus(msg, cls) {
    var el = document.getElementById('save-status');
    el.textContent = msg;
    el.className = 'save-status' + (cls ? ' ' + cls : '');
  }

  document.getElementById('save-btn').addEventListener('click', function () {
    var btn = this;
    btn.disabled = true;
    setStatus('Guardando…');

    var chain = Promise.resolve();

    if (pendingAvatarFile) {
      var avatarPath = 'links/public/avatar-' + Date.now() + '.' + fileExt(pendingAvatarFile);
      chain = chain.then(function () {
        setStatus('Subiendo avatar…');
        return publishFile(avatarPath, pendingAvatarFile, 'Update links avatar from admin panel');
      }).then(function () {
        config.profile.avatarUrl = '/' + avatarPath;
        pendingAvatarFile = null;
      });
    }

    if (pendingBgImageFile) {
      var bgPath = 'links/public/background-' + Date.now() + '.' + fileExt(pendingBgImageFile);
      chain = chain.then(function () {
        setStatus('Subiendo imagen de fondo…');
        return publishFile(bgPath, pendingBgImageFile, 'Update links background from admin panel');
      }).then(function () {
        config.design.background.imageUrl = '/' + bgPath;
        pendingBgImageFile = null;
      });
    }

    chain.then(function () {
      setStatus('Guardando…');
      var body = JSON.stringify(collectConfig(), null, 2) + '\n';
      var b64 = btoa(unescape(encodeURIComponent(body)));
      return fetch(PUBLISH_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path: CONFIG_PATH, contentBase64: b64, message: 'Update links config from admin panel' })
      }).then(function (r) { return r.json(); });
    }).then(function (res) {
      if (!res.ok) throw new Error(res.error || 'Error al guardar');
      btn.disabled = false;
      setStatus('Publicado. La web se actualiza en 1–2 minutos.', 'ok');
      renderAll();
    }).catch(function (err) {
      btn.disabled = false;
      setStatus(err.message, 'err');
    });
  });
})();
