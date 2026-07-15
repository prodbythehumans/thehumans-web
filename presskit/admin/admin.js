/* the humans. — admin panel */
(function () {
  'use strict';

  /* Password check happens server-side (workers/admin-auth) — this repo is
     public, so nothing password-related can live in this file. */
  var AUTH_ENDPOINT = '/api/admin-auth';

  var REPO = 'prodbythehumans/thehumans-web';
  var CONFIG_PATH = 'presskit/data/config.json';
  var BRANCH = 'main';
  var DATA = '../data/';
  var THUMB = function (id, w) {
    return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + (w || 400);
  };

  var gate = document.getElementById('gate');
  var panel = document.getElementById('panel');

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

  if (sessionStorage.getItem('th-admin') === '1') openPanel();

  /* ---------- panel ---------- */
  var media = null;
  var config = null;

  function openPanel() {
    gate.hidden = true;
    panel.hidden = false;
    Promise.all([
      fetch(DATA + 'media.json').then(function (r) { return r.json(); }),
      fetch(DATA + 'config.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      media = res[0];
      config = res[1];
      renderPanel();
    });
  }

  function fmt(n) { return n.toLocaleString('es-ES'); }

  function recalcTotal() {
    var spotify = +document.getElementById('in-spotify').value || 0;
    var apple = Math.round(spotify / 3);
    var youtube = Math.round(spotify / 4);
    document.getElementById('calc-apple').textContent = fmt(apple);
    document.getElementById('calc-youtube').textContent = fmt(youtube);
    document.getElementById('calc-total').textContent = fmt(spotify + apple + youtube);
  }

  function renderPanel() {
    var s = config.streams || {};
    document.getElementById('in-spotify').value = s.spotify || 0;
    document.getElementById('in-fallback').value = s.totalFallback || 0;
    recalcTotal();
    document.getElementById('in-spotify').addEventListener('input', recalcTotal);

    var savedToken = localStorage.getItem('th-gh-token');
    if (savedToken) document.getElementById('in-token').value = savedToken;

    renderPhotos();
    renderVideos();
  }

  function renderPhotos() {
    var grid = document.getElementById('photos-grid');
    grid.innerHTML = '';
    var selected = new Set(config.selectedPhotos || []);
    media.photos.forEach(function (p) {
      var card = document.createElement('div');
      card.className = 'media-card' + (selected.has(p.id) ? ' checked' : '');
      card.dataset.id = p.id;

      var img = document.createElement('img');
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.src = THUMB(p.id, 400);
      img.alt = p.name;

      var check = document.createElement('span');
      check.className = 'card-check';
      check.textContent = '✓';

      var star = document.createElement('button');
      star.className = 'card-star' + (config.heroPhotoId === p.id ? ' hero' : '');
      star.textContent = '★';
      star.title = 'Foto de portada';
      star.addEventListener('click', function (e) {
        e.stopPropagation();
        config.heroPhotoId = p.id;
        grid.querySelectorAll('.card-star').forEach(function (el) { el.classList.remove('hero'); });
        star.classList.add('hero');
      });

      var name = document.createElement('div');
      name.className = 'card-name';
      name.textContent = p.name;

      card.appendChild(img);
      card.appendChild(check);
      card.appendChild(star);
      card.appendChild(name);
      card.addEventListener('click', function () { card.classList.toggle('checked'); });
      grid.appendChild(card);
    });
  }

  function renderVideos() {
    var grid = document.getElementById('videos-grid');
    grid.innerHTML = '';
    var selected = new Set(config.selectedVideos || []);
    media.videos.forEach(function (v) {
      var card = document.createElement('div');
      card.className = 'media-card' + (selected.has(v.id) ? ' checked' : '');
      card.dataset.id = v.id;

      var thumb = document.createElement('img');
      thumb.loading = 'lazy';
      thumb.referrerPolicy = 'no-referrer';
      thumb.src = THUMB(v.id, 400);
      thumb.alt = v.name;
      thumb.style.aspectRatio = '16 / 10';
      thumb.onerror = function () {
        var ph = document.createElement('div');
        ph.className = 'vid-thumb';
        ph.textContent = '▶';
        card.replaceChild(ph, thumb);
      };

      var check = document.createElement('span');
      check.className = 'card-check';
      check.textContent = '✓';

      var name = document.createElement('div');
      name.className = 'card-name';
      name.textContent = (v.folder ? v.folder + ' / ' : '') + v.name;

      card.appendChild(thumb);
      card.appendChild(check);
      card.appendChild(name);
      card.addEventListener('click', function () { card.classList.toggle('checked'); });
      grid.appendChild(card);
    });
  }

  /* ---------- save via GitHub API ---------- */
  function collectConfig() {
    return {
      updatedAt: new Date().toISOString(),
      heroPhotoId: config.heroPhotoId,
      selectedPhotos: Array.prototype.map.call(
        document.querySelectorAll('#photos-grid .media-card.checked'),
        function (c) { return c.dataset.id; }
      ),
      selectedVideos: Array.prototype.map.call(
        document.querySelectorAll('#videos-grid .media-card.checked'),
        function (c) { return c.dataset.id; }
      ),
      streams: {
        spotify: +document.getElementById('in-spotify').value || 0,
        totalFallback: +document.getElementById('in-fallback').value || 0
      }
    };
  }

  function setStatus(msg, cls) {
    var el = document.getElementById('save-status');
    el.textContent = msg;
    el.className = 'save-status' + (cls ? ' ' + cls : '');
  }

  document.getElementById('save-btn').addEventListener('click', function () {
    var token = document.getElementById('in-token').value.trim();
    if (!token) { setStatus('Falta el token de GitHub.', 'err'); return; }
    localStorage.setItem('th-gh-token', token);

    var newConfig = collectConfig();
    var body = JSON.stringify(newConfig, null, 2) + '\n';
    var api = 'https://api.github.com/repos/' + REPO + '/contents/' + CONFIG_PATH;
    var headers = {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json'
    };

    setStatus('Guardando…');

    fetch(api + '?ref=' + BRANCH, { headers: headers })
      .then(function (r) {
        if (!r.ok) throw new Error('No se pudo leer config actual (HTTP ' + r.status + ')');
        return r.json();
      })
      .then(function (current) {
        return fetch(api, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            message: 'Update press kit config from admin panel',
            content: btoa(unescape(encodeURIComponent(body))),
            sha: current.sha,
            branch: BRANCH
          })
        });
      })
      .then(function (r) {
        if (!r.ok) throw new Error('Error al guardar (HTTP ' + r.status + ')');
        config = newConfig;
        setStatus('Publicado. La web se actualiza en 1–2 minutos.', 'ok');
      })
      .catch(function (err) {
        setStatus(err.message, 'err');
      });
  });
})();
