/* the humans. — admin eventos corporativos */
(function () {
  'use strict';

  /* Password check + publishing happen server-side (workers/admin-auth) —
     this repo is public, so nothing password- or token-related can live
     in this file. */
  var AUTH_ENDPOINT = '/eventos-corporativos/admin/api/auth';
  var PUBLISH_ENDPOINT = '/eventos-corporativos/admin/api/publish';

  var CONTENT_PATH = 'eventos-corporativos/data/content.json';
  var PUBLIC_DIR = 'eventos-corporativos/public/';
  var MAX_UPLOAD = 8 * 1024 * 1024; // 8 MB

  /* ---------- schema ---------- */
  var IMAGE_SLOTS = [
    { id: 'hero', title: 'Portada (fondo del hero)', rec: '2400 × 2000 px · apaisada · ambos centrados' },
    { id: 'bio1', title: 'Quiénes somos — foto 1', rec: '1000 × 1250 px · vertical 4:5' },
    { id: 'bio2', title: 'Quiénes somos — foto 2', rec: '1000 × 1250 px · vertical 4:5' },
    { id: 'bio3', title: 'Quiénes somos — foto 3', rec: '1000 × 1250 px · vertical 4:5' },
    { id: 'clientsWide', title: 'Eventos y clientes — foto ancha', rec: '2000 × 760 px · panorámica 21:8' },
    { id: 'clients2', title: 'Eventos y clientes — foto 2', rec: '1000 × 500 px · apaisada 2:1' },
    { id: 'clients3', title: 'Eventos y clientes — foto 3', rec: '1000 × 500 px · apaisada 2:1' }
  ];

  var TEXT_GROUPS = [
    { group: 'Portada', fields: [
      { key: 'hero.kicker', label: 'Antetítulo' },
      { key: 'hero.sub', label: 'Frase bajo el título' },
      { key: 'marquee', label: 'Cinta deslizante (termina con « · »)' }
    ] },
    { group: 'Quiénes somos', fields: [
      { key: 'bio.label', label: 'Etiqueta de sección' },
      { key: 'bio.title', label: 'Titular' },
      { key: 'bio.p1', label: 'Párrafo 1', rows: 6 },
      { key: 'bio.p2', label: 'Párrafo 2', rows: 5 },
      { key: 'bio.chip1', label: 'Etiqueta 1' },
      { key: 'bio.chip2', label: 'Etiqueta 2' }
    ] },
    { group: 'Servicios', fields: [
      { key: 'services.label', label: 'Etiqueta de sección' },
      { key: 'services.title', label: 'Titular' },
      { key: 'services.sub', label: 'Subtítulo' },
      { key: 'services.s1.title', label: 'Servicio 1 — título' },
      { key: 'services.s1.body', label: 'Servicio 1 — texto', rows: 3 },
      { key: 'services.s2.title', label: 'Servicio 2 — título' },
      { key: 'services.s2.body', label: 'Servicio 2 — texto', rows: 3 },
      { key: 'services.s3.title', label: 'Servicio 3 — título' },
      { key: 'services.s3.body', label: 'Servicio 3 — texto', rows: 3 },
      { key: 'services.s4.title', label: 'Servicio 4 — título' },
      { key: 'services.s4.body', label: 'Servicio 4 — texto', rows: 3 },
      { key: 'services.s5.title', label: 'Servicio 5 — título' },
      { key: 'services.s5.body', label: 'Servicio 5 — texto', rows: 3 },
      { key: 'services.s6.title', label: 'Servicio 6 — título' },
      { key: 'services.s6.body', label: 'Servicio 6 — texto', rows: 3 },
      { key: 'services.f1', label: 'Pie 1' },
      { key: 'services.f2', label: 'Pie 2' },
      { key: 'services.f3', label: 'Pie 3' }
    ] },
    { group: 'Por qué nosotros', fields: [
      { key: 'why.label', label: 'Etiqueta de sección' },
      { key: 'why.title', label: 'Titular' },
      { key: 'why.w1.title', label: 'Punto 01 — título' },
      { key: 'why.w1.body', label: 'Punto 01 — texto', rows: 3 },
      { key: 'why.w2.title', label: 'Punto 02 — título' },
      { key: 'why.w2.body', label: 'Punto 02 — texto', rows: 3 },
      { key: 'why.w3.title', label: 'Punto 03 — título' },
      { key: 'why.w3.body', label: 'Punto 03 — texto', rows: 3 },
      { key: 'why.w4.title', label: 'Punto 04 — título' },
      { key: 'why.w4.body', label: 'Punto 04 — texto', rows: 3 }
    ] },
    { group: 'Eventos y clientes', fields: [
      { key: 'clients.label', label: 'Etiqueta de sección' },
      { key: 'clients.title', label: 'Titular' },
      { key: 'clients.brands', label: 'Marcas (tira inferior)' },
      { key: 'clients.s1', label: 'Tira inferior — texto 2' },
      { key: 'clients.s2', label: 'Tira inferior — texto 3' }
    ] },
    { group: 'Ficha técnica', fields: [
      { key: 'specs.label', label: 'Etiqueta de sección' },
      { key: 'specs.title', label: 'Titular' },
      { key: 'specs.r1.k', label: 'Fila 1 — concepto' },
      { key: 'specs.r1.v', label: 'Fila 1 — valor' },
      { key: 'specs.r2.k', label: 'Fila 2 — concepto' },
      { key: 'specs.r2.v', label: 'Fila 2 — valor' },
      { key: 'specs.r4.k', label: 'Fila 3 — concepto' },
      { key: 'specs.r4.v', label: 'Fila 3 — valor' },
      { key: 'specs.r5.k', label: 'Fila 4 — concepto' },
      { key: 'specs.r5.v', label: 'Fila 4 — valor' },
      { key: 'specs.r6.k', label: 'Fila 5 — concepto' },
      { key: 'specs.r6.v', label: 'Fila 5 — valor' },
      { key: 'specs.r7.k', label: 'Fila 6 — concepto' },
      { key: 'specs.r7.v', label: 'Fila 6 — valor' }
    ] },
    { group: 'Contacto', fields: [
      { key: 'contact.label', label: 'Etiqueta de sección' },
      { key: 'contact.title', label: 'Titular' },
      { key: 'contact.email', label: 'Email (se enlaza solo)' },
      { key: 'contact.phone1', label: 'Teléfono 1 (se enlaza solo)' },
      { key: 'contact.phone2', label: 'Teléfono 2 (se enlaza solo)' }
    ] }
  ];

  /* ---------- state ---------- */
  var content = null;
  var pendingImages = {}; // slotId -> { base64, ext }

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
        sessionStorage.setItem('th-admin-eventos', '1');
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

  if (sessionStorage.getItem('th-admin-eventos') === '1') openPanel();

  /* ---------- panel ---------- */
  function openPanel() {
    gate.hidden = true;
    panel.hidden = false;

    fetch('../data/content.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        content = data;
        renderImages();
        renderTexts();
      })
      .catch(function (err) {
        setStatus('No se pudo cargar content.json: ' + err.message, 'err');
      });
  }

  function renderImages() {
    var wrap = document.getElementById('images-list');
    wrap.innerHTML = '';

    IMAGE_SLOTS.forEach(function (slot) {
      var data = (content.images && content.images[slot.id]) || { src: '', alt: '' };

      var card = document.createElement('div');
      card.className = 'image-slot';

      var thumb = document.createElement('img');
      thumb.className = 'slot-thumb';
      thumb.alt = '';
      thumb.src = data.src ? data.src.replace(/^\.\//, '../') : '';

      var body = document.createElement('div');
      body.className = 'slot-body';

      var title = document.createElement('p');
      title.className = 'slot-title';
      title.textContent = slot.title;

      var rec = document.createElement('p');
      rec.className = 'slot-rec';
      rec.textContent = 'Recomendado: ' + slot.rec;

      var altLabel = document.createElement('label');
      altLabel.textContent = 'Texto alternativo';
      altLabel.setAttribute('for', 'alt-' + slot.id);

      var altInput = document.createElement('input');
      altInput.type = 'text';
      altInput.id = 'alt-' + slot.id;
      altInput.value = data.alt || '';
      altInput.placeholder = 'Describe la foto en pocas palabras';

      var file = document.createElement('input');
      file.type = 'file';
      file.id = 'file-' + slot.id;
      file.className = 'slot-file';
      file.accept = 'image/jpeg,image/png,image/webp';

      var fileLabel = document.createElement('label');
      fileLabel.className = 'slot-file-btn';
      fileLabel.setAttribute('for', 'file-' + slot.id);
      fileLabel.textContent = 'Cambiar imagen…';

      var note = document.createElement('p');
      note.className = 'slot-note';

      file.addEventListener('change', function () {
        var f = file.files && file.files[0];
        delete pendingImages[slot.id];
        note.className = 'slot-note';
        note.textContent = '';
        if (!f) return;

        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
          note.textContent = 'Formato no válido. Usa JPG, PNG o WebP.';
          file.value = '';
          return;
        }
        if (f.size > MAX_UPLOAD) {
          note.textContent = 'Demasiado pesada (' + mb(f.size) + '). Máximo 8 MB.';
          file.value = '';
          return;
        }

        var reader = new FileReader();
        reader.onload = function () {
          var result = String(reader.result);
          var base64 = result.slice(result.indexOf(',') + 1);
          var ext = f.type === 'image/png' ? 'png' : (f.type === 'image/webp' ? 'webp' : 'jpg');
          pendingImages[slot.id] = { base64: base64, ext: ext };
          thumb.src = result;
          note.className = 'slot-note ready';
          note.textContent = 'Lista para publicar (' + mb(f.size) + ')';
        };
        reader.readAsDataURL(f);
      });

      body.appendChild(title);
      body.appendChild(rec);
      body.appendChild(altLabel);
      body.appendChild(altInput);
      body.appendChild(file);
      body.appendChild(fileLabel);
      body.appendChild(note);

      card.appendChild(thumb);
      card.appendChild(body);
      wrap.appendChild(card);
    });
  }

  function mb(bytes) {
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function renderTexts() {
    var wrap = document.getElementById('texts-list');
    wrap.innerHTML = '';

    TEXT_GROUPS.forEach(function (g) {
      var section = document.createElement('div');
      section.className = 'text-group';

      var h = document.createElement('h3');
      h.textContent = g.group;
      section.appendChild(h);

      g.fields.forEach(function (f) {
        var field = document.createElement('div');
        field.className = 'text-field';

        var label = document.createElement('p');
        label.className = 'tf-label';
        label.textContent = f.label;
        field.appendChild(label);

        var langs = document.createElement('div');
        langs.className = 'tf-langs';

        ['es', 'en'].forEach(function (l) {
          var box = document.createElement('div');
          box.className = 'tf-lang';

          var tag = document.createElement('span');
          tag.className = 'tf-tag';
          tag.textContent = l.toUpperCase();

          var ta = document.createElement('textarea');
          ta.rows = f.rows || 1;
          ta.dataset.key = f.key;
          ta.dataset.lang = l;
          ta.value = (content.texts && content.texts[l] && content.texts[l][f.key]) || '';

          box.appendChild(tag);
          box.appendChild(ta);
          langs.appendChild(box);
        });

        field.appendChild(langs);
        section.appendChild(field);
      });

      wrap.appendChild(section);
    });
  }

  /* ---------- save ---------- */
  function setStatus(msg, cls) {
    var el = document.getElementById('save-status');
    el.textContent = msg;
    el.className = 'save-status' + (cls ? ' ' + cls : '');
  }

  function putFile(path, base64, message) {
    return fetch(PUBLISH_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: path, contentBase64: base64, message: message })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error((res.error || 'Error al guardar') + ' — ' + path);
        return res;
      });
  }

  function collectContent() {
    var texts = { es: {}, en: {} };
    document.querySelectorAll('#texts-list textarea').forEach(function (ta) {
      texts[ta.dataset.lang][ta.dataset.key] = ta.value.trim();
    });

    var images = {};
    IMAGE_SLOTS.forEach(function (slot) {
      var prev = (content.images && content.images[slot.id]) || {};
      images[slot.id] = {
        src: prev.src || '',
        alt: document.getElementById('alt-' + slot.id).value.trim()
      };
    });

    return { updatedAt: new Date().toISOString(), texts: texts, images: images };
  }

  document.getElementById('save-btn').addEventListener('click', function () {
    if (!content) { setStatus('El contenido aún no se ha cargado.', 'err'); return; }

    var btn = this;
    btn.disabled = true;

    var next = collectContent();
    var slots = Object.keys(pendingImages);
    var stamp = Date.now();

    setStatus(slots.length ? 'Subiendo ' + slots.length + ' imagen(es)…' : 'Guardando…');

    /* upload images sequentially (each new file gets a unique name, so no
       cache issues and no sha needed), then commit content.json */
    var chain = Promise.resolve();
    slots.forEach(function (id, i) {
      chain = chain.then(function () {
        var img = pendingImages[id];
        var filename = id + '-' + stamp + '.' + img.ext;
        setStatus('Subiendo imagen ' + (i + 1) + ' de ' + slots.length + '…');
        return putFile(PUBLIC_DIR + filename, img.base64, 'Update eventos image: ' + id)
          .then(function () {
            next.images[id].src = './public/' + filename;
          });
      });
    });

    chain
      .then(function () {
        setStatus('Publicando textos…');
        var json = JSON.stringify(next, null, 2) + '\n';
        var b64 = btoa(unescape(encodeURIComponent(json)));
        return putFile(CONTENT_PATH, b64, 'Update eventos content from admin panel');
      })
      .then(function () {
        content = next;
        pendingImages = {};
        renderImages();
        setStatus('Publicado. La página se actualiza en 1–2 minutos.', 'ok');
      })
      .catch(function (err) {
        setStatus(err.message, 'err');
      })
      .then(function () {
        btn.disabled = false;
      });
  });
})();
